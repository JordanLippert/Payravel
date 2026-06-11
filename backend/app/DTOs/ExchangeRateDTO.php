<?php

namespace App\DTOs;

use Carbon\Carbon;

readonly class ExchangeRateDTO
{
    public function __construct(
        public string $currency,
        public float  $rate,
        public string $source,
        public Carbon $fetchedAt,
        public Carbon $expiresAt,
    ) {}
}
