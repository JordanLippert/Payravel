<?php

namespace App\DTOs;

readonly class CreatePaymentRequestDTO
{
    public function __construct(
        public float   $amountLocal,
        public string  $currency,
        public ?string $description = null,
    ) {}
}
