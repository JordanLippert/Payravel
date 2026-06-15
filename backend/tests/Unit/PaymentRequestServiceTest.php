<?php

namespace Tests\Unit;

use App\DTOs\CreatePaymentRequestDTO;
use App\DTOs\ExchangeRateDTO;
use App\Enums\PaymentStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Services\ExchangeRateService;
use App\Services\PaymentRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PaymentRequestServiceTest extends TestCase
{
    use RefreshDatabase;

    private PaymentRequestService $service;
    private ExchangeRateService   $exchangeRateService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->exchangeRateService = Mockery::mock(ExchangeRateService::class);
        $this->service = new PaymentRequestService($this->exchangeRateService);
    }

    private function fakeRate(float $rate = 5.42): ExchangeRateDTO
    {
        return new ExchangeRateDTO('BRL', $rate, 'exchangerate-api.com', now(), now()->addMinutes(30));
    }

    public function test_creates_request_with_correct_eur_amount(): void
    {
        $user = User::factory()->create(['currency' => 'BRL']);
        $dto  = new CreatePaymentRequestDTO(amountLocal: 542.00, currency: 'BRL');

        $this->exchangeRateService
            ->shouldReceive('getRate')
            ->with('BRL')
            ->once()
            ->andReturn($this->fakeRate(5.42));

        $request = $this->service->create($user, $dto);

        $this->assertEquals(542.00, $request->amount_local);
        $this->assertEquals('BRL', $request->currency);
        $this->assertEquals(5.42, $request->exchange_rate);
        $this->assertEqualsWithDelta(100.00, $request->amount_eur, 0.01);
        $this->assertEquals(PaymentStatus::Pending, $request->status);
    }

    public function test_expires_at_is_48h_from_creation(): void
    {
        $user = User::factory()->create(['currency' => 'BRL']);
        $dto  = new CreatePaymentRequestDTO(amountLocal: 100.00, currency: 'BRL');

        $this->exchangeRateService->shouldReceive('getRate')->andReturn($this->fakeRate());

        $this->travelTo(now());
        $request = $this->service->create($user, $dto);

        $this->assertEqualsWithDelta(now()->addHours(48)->timestamp, $request->expires_at->timestamp, 5);
    }

    public function test_exchange_rate_fields_are_persisted(): void
    {
        $user = User::factory()->create(['currency' => 'BRL']);
        $dto  = new CreatePaymentRequestDTO(amountLocal: 100.00, currency: 'BRL');

        $this->exchangeRateService->shouldReceive('getRate')->andReturn($this->fakeRate());

        $request = $this->service->create($user, $dto);

        $this->assertEquals('exchangerate-api.com', $request->exchange_rate_source);
        $this->assertNotNull($request->exchange_rate_fetched_at);
    }

    public function test_approve_sets_status_and_reviewer(): void
    {
        $finance = User::factory()->create();
        $pr      = PaymentRequest::factory()->create(['status' => PaymentStatus::Pending]);

        $result = $this->service->approve($pr->id, $finance);

        $this->assertEquals(PaymentStatus::Approved, $result->status);
        $this->assertEquals($finance->id, $result->reviewed_by);
        $this->assertNotNull($result->reviewed_at);
    }

    public function test_reject_sets_status_and_reviewer(): void
    {
        $finance = User::factory()->create();
        $pr      = PaymentRequest::factory()->create(['status' => PaymentStatus::Pending]);

        $result = $this->service->reject($pr->id, $finance);

        $this->assertEquals(PaymentStatus::Rejected, $result->status);
        $this->assertEquals($finance->id, $result->reviewed_by);
        $this->assertNotNull($result->reviewed_at);
    }

    public function test_cannot_approve_already_approved_request(): void
    {
        $finance = User::factory()->create();
        $pr      = PaymentRequest::factory()->create(['status' => PaymentStatus::Approved]);

        $this->expectException(\App\Exceptions\InvalidStatusTransitionException::class);

        $this->service->approve($pr->id, $finance);
    }

    public function test_cannot_reject_expired_request(): void
    {
        $finance = User::factory()->create();
        $pr      = PaymentRequest::factory()->create(['status' => PaymentStatus::Expired]);

        $this->expectException(\App\Exceptions\InvalidStatusTransitionException::class);

        $this->service->reject($pr->id, $finance);
    }

    public function test_expire_pending_updates_only_overdue_requests(): void
    {
        PaymentRequest::factory()->create(['status' => PaymentStatus::Pending, 'expires_at' => now()->subHour()]);
        PaymentRequest::factory()->create(['status' => PaymentStatus::Pending, 'expires_at' => now()->addHour()]);
        PaymentRequest::factory()->create(['status' => PaymentStatus::Approved, 'expires_at' => now()->subHour()]);

        $count = $this->service->expirePending();

        $this->assertEquals(1, $count);
    }
}
