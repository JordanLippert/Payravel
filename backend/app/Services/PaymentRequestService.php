<?php

namespace App\Services;

use App\DTOs\CreatePaymentRequestDTO;
use App\Enums\PaymentStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Models\PaymentRequest;
use App\Models\User;

class PaymentRequestService
{
    public function __construct(
        private ExchangeRateService $exchangeRateService,
    ) {}

    public function create(User $user, CreatePaymentRequestDTO $dto): PaymentRequest
    {
        $rate = $this->exchangeRateService->getRate($user->currency);

        return PaymentRequest::create([
            'user_id'                  => $user->id,
            'amount_local'             => $dto->amountLocal,
            'currency'                 => $user->currency,
            'exchange_rate'            => $rate->rate,
            'exchange_rate_source'     => $rate->source,
            'exchange_rate_fetched_at' => $rate->fetchedAt,
            'amount_eur'               => round($dto->amountLocal / $rate->rate, 2),
            'description'              => $dto->description,
            'status'                   => PaymentStatus::Pending,
            'expires_at'               => now()->addHours(48),
        ]);
    }

    public function approve(string $id, User $finance): PaymentRequest
    {
        $request = PaymentRequest::findOrFail($id);

        if ($request->status !== PaymentStatus::Pending) {
            throw new InvalidStatusTransitionException('Only pending requests can be approved.');
        }

        $request->update([
            'status'      => PaymentStatus::Approved,
            'reviewed_by' => $finance->id,
            'reviewed_at' => now(),
        ]);

        return $request->fresh();
    }

    public function reject(string $id, User $finance): PaymentRequest
    {
        $request = PaymentRequest::findOrFail($id);

        if ($request->status !== PaymentStatus::Pending) {
            throw new InvalidStatusTransitionException('Only pending requests can be rejected.');
        }

        $request->update([
            'status'      => PaymentStatus::Rejected,
            'reviewed_by' => $finance->id,
            'reviewed_at' => now(),
        ]);

        return $request->fresh();
    }

    public function expirePending(): int
    {
        return PaymentRequest::where('status', PaymentStatus::Pending)
            ->where('expires_at', '<', now())
            ->update(['status' => PaymentStatus::Expired]);
    }
}
