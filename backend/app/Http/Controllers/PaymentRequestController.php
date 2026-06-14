<?php

namespace App\Http\Controllers;

use App\DTOs\CreatePaymentRequestDTO;
use App\Exceptions\ExchangeRateUnavailableException;
use App\Http\Requests\CreatePaymentRequestRequest;
use App\Http\Requests\UpdatePaymentStatusRequest;
use App\Http\Resources\PaymentRequestCollection;
use App\Http\Resources\PaymentRequestResource;
use App\Models\PaymentRequest;
use App\Services\PaymentRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentRequestController extends Controller
{
    public function __construct(
        private PaymentRequestService $service,
    ) {}

    /**
     * @group Payment Requests
     * @queryParam status string Filter by status (pending, approved, rejected, expired). Example: pending
     */
    public function index(Request $request): PaymentRequestCollection
    {
        $query = $request->user()->isFinance()
            ? PaymentRequest::with('user')
            : PaymentRequest::with('user')->where('user_id', $request->user()->id);

        if ($status = $request->query('status')) {
            if ($status === 'resolved') {
                $query->whereIn('status', ['approved', 'rejected', 'expired']);
            } else {
                $query->where('status', $status);
            }
        }

        return new PaymentRequestCollection($query->latest()->paginate(15));
    }

    /**
     * @group Payment Requests
     */
    public function store(CreatePaymentRequestRequest $request): JsonResponse
    {
        try {
            $dto = new CreatePaymentRequestDTO(
                amountLocal: $request->amount,
                currency:    $request->currency,
                description: $request->description,
            );

            $pr = $this->service->create($request->user(), $dto);

            $requestUser = $request->user();
            $localFormatted = number_format((float) $pr->amount_local, 2, ',', '.');
            $notifBody = "Nova requisição de {$requestUser->name} — {$pr->currency} {$localFormatted}";
            \App\Models\User::where('role', 'finance')->each(function ($financeUser) use ($pr, $notifBody) {
                \App\Models\Notification::create([
                    'user_id' => $financeUser->id,
                    'type'    => 'new_request_pending',
                    'data'    => [
                        'title'      => 'Nova requisição pendente',
                        'body'       => $notifBody,
                        'request_id' => $pr->id,
                    ],
                ]);
            });

            return response()->json(['data' => new PaymentRequestResource($pr)], 201);
        } catch (ExchangeRateUnavailableException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    /**
     * @group Payment Requests
     * @urlParam id string required Payment request UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $query = $request->user()->isFinance()
            ? PaymentRequest::with('user')
            : PaymentRequest::with('user')->where('user_id', $request->user()->id);

        $pr = $query->find($id);

        if (!$pr) {
            return response()->json(['message' => 'Payment request not found.'], 404);
        }

        return response()->json(['data' => new PaymentRequestResource($pr)]);
    }

    /**
     * @group Payment Requests
     * @urlParam id string required Payment request UUID. Example: 550e8400-e29b-41d4-a716-446655440000
     */
    public function updateStatus(UpdatePaymentStatusRequest $request, string $id): JsonResponse
    {
        try {
            $pr = match ($request->status) {
                'approved' => $this->service->approve($id, $request->user()),
                'rejected' => $this->service->reject($id, $request->user()),
            };

            $statusLabel  = $request->status === 'approved' ? 'aprovada' : 'rejeitada';
            $eurFormatted = number_format((float) $pr->amount_eur, 2, ',', '.');
            \App\Models\Notification::create([
                'user_id' => $pr->user_id,
                'type'    => "request_{$request->status}",
                'data'    => [
                    'title'      => "Requisição {$statusLabel}",
                    'body'       => "Sua requisição de € {$eurFormatted} foi {$statusLabel}.",
                    'request_id' => $pr->id,
                ],
            ]);

            return response()->json(['data' => new PaymentRequestResource($pr)]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['message' => 'Payment request not found.'], 404);
        }
    }
}
