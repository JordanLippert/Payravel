<?php

namespace Database\Factories;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'password'          => static::$password ??= Hash::make('password'),
            'role'              => UserRole::Employee,
            'currency'          => fake()->randomElement(['BRL', 'USD', 'GBP', 'JPY', 'MXN']),
            'country'           => fake()->country(),
            'email_verified_at' => now(),
        ];
    }

    public function finance(): static
    {
        return $this->state(['role' => UserRole::Finance, 'currency' => 'EUR', 'country' => 'Portugal']);
    }
}
