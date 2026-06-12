<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class PaymentRequestSeeder extends Seeder
{
    // Approximate EUR rates (1 EUR = X currency)
    private array $rates = [
        'BRL' => 5.95,
        'USD' => 0.92,
        'GBP' => 0.85,
        'JPY' => 160.0,
        'MXN' => 19.80,
        'EUR' => 1.0,
    ];

    public function run(): void
    {
        $ana     = User::where('email', 'ana@payravel.com')->first();
        $john    = User::where('email', 'john@payravel.com')->first();
        $emma    = User::where('email', 'emma@payravel.com')->first();
        $yuki    = User::where('email', 'yuki@payravel.com')->first();
        $carlos  = User::where('email', 'carlos@payravel.com')->first();
        $finance = User::where('email', 'finance@payravel.com')->first();

        if (! $ana || ! $finance) {
            $this->command->warn('Run EmployeeSeeder first.');
            return;
        }

        // ── PENDING (fila de aprovação) ──────────────────────────────
        // Critical: expira em < 24h (criados há 26h+)
        $this->make($ana,    'Licença anual Figma',        1200.00,  Carbon::now()->subHours(26), Carbon::now()->addHours(22));
        $this->make($john,   'Campanha Meta Ads',           2500.00,  Carbon::now()->subHours(28), Carbon::now()->addHours(20));

        // Normal: expira em 24-48h
        $this->make($emma,   'Consultoria UX (12h)',         980.00,  Carbon::now()->subHours(6),  Carbon::now()->addHours(42));
        $this->make($carlos, 'Tradução jurídica — EN/ES',    640.00,  Carbon::now()->subHours(8),  Carbon::now()->addHours(40));
        $this->make($yuki,   'Hospedagem servidor Tokyo',  48000.00,  Carbon::now()->subHours(3),  Carbon::now()->addHours(45));

        // ── APPROVED ─────────────────────────────────────────────────
        $this->make($ana,   'Equipamento — monitor',       3480.00,  Carbon::now()->subDays(5),  null, PaymentStatus::Approved, $finance, Carbon::now()->subDays(4));
        $this->make($john,  'Software Sketch (anual)',      1200.00,  Carbon::now()->subDays(8),  null, PaymentStatus::Approved, $finance, Carbon::now()->subDays(7));
        $this->make($emma,  'Passagem Lisboa — Londres',    890.00,   Carbon::now()->subDays(12), null, PaymentStatus::Approved, $finance, Carbon::now()->subDays(11));
        $this->make($carlos,'Assinatura Adobe CC',          600.00,   Carbon::now()->subDays(15), null, PaymentStatus::Approved, $finance, Carbon::now()->subDays(14));
        $this->make($yuki,  'Material de escritório',      12000.00,  Carbon::now()->subDays(18), null, PaymentStatus::Approved, $finance, Carbon::now()->subDays(17));
        $this->make($ana,   'Treinamento LGPD',             480.00,   Carbon::now()->subDays(22), null, PaymentStatus::Approved, $finance, Carbon::now()->subDays(21));
        $this->make($john,  'Plano Notion Team',            480.00,   Carbon::now()->subDays(25), null, PaymentStatus::Approved, $finance, Carbon::now()->subDays(24));

        // ── REJECTED ─────────────────────────────────────────────────
        $this->make($ana,   'Headset gaming — pessoal',    3200.00,  Carbon::now()->subDays(3),  null, PaymentStatus::Rejected, $finance, Carbon::now()->subDays(2));
        $this->make($emma,  'Curso não relacionado à função', 750.00, Carbon::now()->subDays(9), null, PaymentStatus::Rejected, $finance, Carbon::now()->subDays(8));
        $this->make($carlos,'Despesa sem comprovante',      320.00,   Carbon::now()->subDays(20), null, PaymentStatus::Rejected, $finance, Carbon::now()->subDays(19));

        $this->command->info('PaymentRequestSeeder: ' . PaymentRequest::count() . ' requisições criadas.');
    }

    private function make(
        User         $user,
        string       $description,
        float        $amountLocal,
        Carbon       $createdAt,
        ?Carbon      $expiresAt,
        PaymentStatus $status    = PaymentStatus::Pending,
        ?User        $reviewer   = null,
        ?Carbon      $reviewedAt = null,
    ): void {
        $rate     = $this->rates[$user->currency] ?? 1.0;
        $amountEur = round($amountLocal / $rate, 2);

        PaymentRequest::create([
            'user_id'                  => $user->id,
            'description'              => $description,
            'amount_local'             => $amountLocal,
            'currency'                 => $user->currency,
            'exchange_rate'            => $rate,
            'exchange_rate_source'     => 'seeder',
            'exchange_rate_fetched_at' => $createdAt,
            'amount_eur'               => $amountEur,
            'status'                   => $status,
            'expires_at'               => $expiresAt ?? $createdAt->copy()->addHours(48),
            'reviewed_by'              => $reviewer?->id,
            'reviewed_at'              => $reviewedAt,
            'created_at'               => $createdAt,
            'updated_at'               => $reviewedAt ?? $createdAt,
        ]);
    }
}
