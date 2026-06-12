<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\PaymentRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MetricsController extends Controller
{
    private function baseQuery(Request $request): Builder
    {
        return $request->user()->isFinance()
            ? PaymentRequest::query()
            : PaymentRequest::where('user_id', $request->user()->id);
    }

    public function total(Request $request): JsonResponse
    {
        return response()->json([
            'count'  => $this->baseQuery($request)->count(),
            'amount' => round($this->baseQuery($request)->sum('amount_eur'), 2),
        ]);
    }

    public function pending(Request $request): JsonResponse
    {
        $query = $this->baseQuery($request)->where('status', PaymentStatus::Pending);
        return response()->json([
            'count'  => (clone $query)->count(),
            'amount' => round((clone $query)->sum('amount_eur'), 2),
        ]);
    }

    public function approved(Request $request): JsonResponse
    {
        $query = $this->baseQuery($request)->where('status', PaymentStatus::Approved);
        return response()->json([
            'count'  => (clone $query)->count(),
            'amount' => round((clone $query)->sum('amount_eur'), 2),
        ]);
    }

    public function rejected(Request $request): JsonResponse
    {
        $query = $this->baseQuery($request)->where('status', PaymentStatus::Rejected);
        return response()->json([
            'count'  => (clone $query)->count(),
            'amount' => round((clone $query)->sum('amount_eur'), 2),
        ]);
    }
}
