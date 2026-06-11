<?php

namespace App\Services;

use App\DTOs\ExchangeRateDTO;
use App\Exceptions\ExchangeRateUnavailableException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ExchangeRateService
{
    private const API_URL   = 'https://api.exchangerate-api.com/v4/latest/EUR';
    private const CACHE_TTL = 1800; // 30 minutes in seconds

    public function getRate(string $currency): ExchangeRateDTO
    {
        $currency = strtoupper($currency);

        return Cache::remember("exchange_rate_{$currency}", self::CACHE_TTL, function () use ($currency) {
            $response = Http::get(self::API_URL);

            if ($response->failed()) {
                throw new ExchangeRateUnavailableException();
            }

            $rates = $response->json('rates', []);

            if (!isset($rates[$currency])) {
                throw new ExchangeRateUnavailableException("Currency {$currency} is not supported.");
            }

            $fetchedAt = now();

            return new ExchangeRateDTO(
                currency:  $currency,
                rate:      $rates[$currency],
                source:    'exchangerate-api.com',
                fetchedAt: $fetchedAt,
                expiresAt: $fetchedAt->copy()->addSeconds(self::CACHE_TTL),
            );
        });
    }
}
