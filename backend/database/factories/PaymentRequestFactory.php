<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentRequestFactory extends Factory
{
    public function definition(): array
    {
        $amountLocal = fake()->randomFloat(2, 50, 5000);
        $rate        = fake()->randomFloat(4, 1.0, 10.0);

        return [
            'user_id'                  => User::factory(),
            'amount_local'             => $amountLocal,
            'currency'                 => 'BRL',
            'exchange_rate'            => $rate,
            'exchange_rate_source'     => 'exchangerate-api.com',
            'exchange_rate_fetched_at' => now(),
            'amount_eur'               => round($amountLocal / $rate, 2),
            'description'              => fake()->sentence(),
            'status'                   => PaymentStatus::Pending,
            'reviewed_by'              => null,
            'reviewed_at'              => null,
            'expires_at'               => now()->addHours(48),
        ];
    }
}
