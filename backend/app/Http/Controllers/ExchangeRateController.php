<?php

namespace App\Http\Controllers;

use App\Exceptions\ExchangeRateUnavailableException;
use App\Services\ExchangeRateService;
use Illuminate\Http\JsonResponse;

class ExchangeRateController extends Controller
{
    public function __construct(
        private ExchangeRateService $service,
    ) {}

    /**
     * @group Exchange Rates
     * @urlParam currency string required ISO 4217 currency code. Example: BRL
     * @response {"currency":"BRL","rate":5.42,"source":"exchangerate-api.com","fetched_at":"2026-06-10T14:00:00Z","expires_at":"2026-06-10T14:30:00Z"}
     */
    public function show(string $currency): JsonResponse
    {
        try {
            $rate = $this->service->getRate($currency);

            return response()->json([
                'currency'   => $rate->currency,
                'rate'       => $rate->rate,
                'source'     => $rate->source,
                'fetched_at' => $rate->fetchedAt,
                'expires_at' => $rate->expiresAt,
            ]);
        } catch (ExchangeRateUnavailableException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }
}
