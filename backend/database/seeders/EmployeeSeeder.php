<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = [
            ['name' => 'Ana Silva',    'email' => 'ana@payravel.com',    'country' => 'Brazil',         'currency' => 'BRL'],
            ['name' => 'John Smith',   'email' => 'john@payravel.com',   'country' => 'United States',  'currency' => 'USD'],
            ['name' => 'Emma Wilson',  'email' => 'emma@payravel.com',   'country' => 'United Kingdom', 'currency' => 'GBP'],
            ['name' => 'Yuki Tanaka',  'email' => 'yuki@payravel.com',   'country' => 'Japan',          'currency' => 'JPY'],
            ['name' => 'Carlos López', 'email' => 'carlos@payravel.com', 'country' => 'Mexico',         'currency' => 'MXN'],
        ];

        foreach ($employees as $data) {
            User::firstOrCreate(['email' => $data['email']], [
                ...$data,
                'password' => Hash::make('password'),
                'role'     => UserRole::Employee,
            ]);
        }

        User::firstOrCreate(['email' => 'finance@payravel.com'], [
            'name'     => 'Finance Team',
            'country'  => 'Portugal',
            'currency' => 'EUR',
            'password' => Hash::make('password'),
            'role'     => UserRole::Finance,
        ]);
    }
}
