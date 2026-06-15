<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\PaymentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceReportsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $all = PaymentRequest::with('user')->get();

        $approved = $all->where('status', PaymentStatus::Approved);
        $rejected = $all->where('status', PaymentStatus::Rejected);
        $pending  = $all->where('status', PaymentStatus::Pending);
        $expired  = $all->where('status', PaymentStatus::Expired);

        $resolvedCount = $approved->count() + $rejected->count();

        $reviewed = $all->whereIn('status', [PaymentStatus::Approved, PaymentStatus::Rejected]);

        $byCurrency = $reviewed
            ->groupBy('currency')
            ->map(fn ($reqs, $currency) => [
                'currency'     => $currency,
                'approved'     => $reqs->where('status', PaymentStatus::Approved)->count(),
                'rejected'     => $reqs->where('status', PaymentStatus::Rejected)->count(),
                'eur_approved' => (float) $reqs->where('status', PaymentStatus::Approved)->sum('amount_eur'),
            ])
            ->sortByDesc(fn ($r) => $r['eur_approved'])
            ->values();

        $byEmployee = $reviewed
            ->groupBy(fn ($r) => $r->user?->name ?? 'Desconhecido')
            ->map(fn ($reqs, $name) => [
                'name'         => $name,
                'approved'     => $reqs->where('status', PaymentStatus::Approved)->count(),
                'rejected'     => $reqs->where('status', PaymentStatus::Rejected)->count(),
                'eur_approved' => (float) $reqs->where('status', PaymentStatus::Approved)->sum('amount_eur'),
            ])
            ->sortByDesc(fn ($r) => $r['eur_approved'])
            ->values();

        return response()->json([
            'data' => [
                'total_eur'      => (float) $approved->sum('amount_eur'),
                'approved_count' => $approved->count(),
                'rejected_count' => $rejected->count(),
                'pending_count'  => $pending->count(),
                'expired_count'  => $expired->count(),
                'approval_rate'  => $resolvedCount > 0
                    ? round($approved->count() / $resolvedCount * 100)
                    : 0,
                'by_currency'    => $byCurrency,
                'by_employee'    => $byEmployee,
            ],
        ]);
    }
}
