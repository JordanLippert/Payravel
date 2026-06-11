<?php

namespace Tests\Unit;

use App\Enums\PaymentStatus;
use App\Jobs\ExpirePaymentRequests;
use App\Models\PaymentRequest;
use App\Services\PaymentRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ExpirePaymentRequestsTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_calls_expire_pending_on_service(): void
    {
        $service = Mockery::mock(PaymentRequestService::class);
        $service->shouldReceive('expirePending')->once()->andReturn(3);

        $job = new ExpirePaymentRequests();
        $job->handle($service);
    }

    public function test_job_actually_expires_overdue_requests(): void
    {
        PaymentRequest::factory()->create([
            'status'     => PaymentStatus::Pending,
            'expires_at' => now()->subHour(),
        ]);
        PaymentRequest::factory()->create([
            'status'     => PaymentStatus::Pending,
            'expires_at' => now()->addHour(),
        ]);

        (new ExpirePaymentRequests())->handle(app(PaymentRequestService::class));

        $this->assertDatabaseHas('payment_requests', ['status' => 'expired']);
        $this->assertDatabaseHas('payment_requests', ['status' => 'pending']);
    }
}
