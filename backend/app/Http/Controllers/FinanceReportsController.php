<?php

namespace App\Http\Controllers;

use App\Models\PaymentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceReportsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $all = PaymentRequest::with('user')->get();

        $approved = $all->where('status', 'approved');
        $rejected = $all->where('status', 'rejected');
        $pending  = $all->where('status', 'pending');
        $expired  = $all->where('status', 'expired');

        $resolvedCount = $approved->count() + $rejected->count();

        $byCurrency = $all
            ->whereIn('status', ['approved', 'rejected'])
            ->groupBy('currency')
            ->map(fn ($reqs, $currency) => [
                'currency'     => $currency,
                'approved'     => $reqs->where('status', 'approved')->count(),
                'rejected'     => $reqs->where('status', 'rejected')->count(),
                'eur_approved' => (float) $reqs->where('status', 'approved')->sum('amount_eur'),
            ])
            ->sortByDesc(fn ($r) => $r['eur_approved'])
            ->values();

        $byEmployee = $all
            ->whereIn('status', ['approved', 'rejected'])
            ->groupBy(fn ($r) => $r->user?->name ?? 'Desconhecido')
            ->map(fn ($reqs, $name) => [
                'name'         => $name,
                'approved'     => $reqs->where('status', 'approved')->count(),
                'rejected'     => $reqs->where('status', 'rejected')->count(),
                'eur_approved' => (float) $reqs->where('status', 'approved')->sum('amount_eur'),
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
