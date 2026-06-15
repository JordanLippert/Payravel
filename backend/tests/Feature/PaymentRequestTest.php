<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentRequestTest extends TestCase
{
    use RefreshDatabase;

    private function fakeExchangeRate(float $rate = 5.42): void
    {
        Http::fake([
            '*exchangerate-api*' => Http::response([
                'rates' => ['BRL' => $rate, 'USD' => 1.08, 'GBP' => 0.79, 'JPY' => 157.5, 'MXN' => 18.2],
            ]),
        ]);
    }

    private function employee(): User
    {
        return User::factory()->create(['role' => UserRole::Employee, 'currency' => 'BRL']);
    }

    private function finance(): User
    {
        return User::factory()->finance()->create();
    }

    public function test_employee_can_create_payment_request(): void
    {
        $this->fakeExchangeRate();
        $employee = $this->employee();

        $response = $this->actingAs($employee, 'api')
            ->postJson('/api/payment-requests', [
                'amount'      => 542.00,
                'currency'    => 'BRL',
                'description' => 'Office supplies',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id', 'amount_local', 'currency', 'exchange_rate',
                    'exchange_rate_source', 'amount_eur', 'status', 'expires_at',
                ],
            ])
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.currency', 'BRL');
    }

    public function test_exchange_rate_persisted_correctly(): void
    {
        $this->fakeExchangeRate(5.42);
        $employee = $this->employee();

        $response = $this->actingAs($employee, 'api')
            ->postJson('/api/payment-requests', ['amount' => 542.00, 'currency' => 'BRL']);

        $response->assertStatus(201);
        $this->assertEqualsWithDelta(100.0, $response->json('data.amount_eur'), 0.01);
        $this->assertEquals(5.42, $response->json('data.exchange_rate'));
    }

    public function test_create_returns_503_when_exchange_rate_unavailable(): void
    {
        Http::fake(['*' => Http::response(null, 500)]);
        $employee = $this->employee();

        $this->actingAs($employee, 'api')
            ->postJson('/api/payment-requests', ['amount' => 100, 'currency' => 'BRL'])
            ->assertStatus(503);
    }

    public function test_create_validates_amount(): void
    {
        $employee = $this->employee();

        $this->actingAs($employee, 'api')
            ->postJson('/api/payment-requests', ['amount' => -10])
            ->assertUnprocessable();

        $this->actingAs($employee, 'api')
            ->postJson('/api/payment-requests', [])
            ->assertUnprocessable();
    }

    public function test_employee_sees_only_own_requests(): void
    {
        $employee = $this->employee();
        $other    = User::factory()->create();

        PaymentRequest::factory()->create(['user_id' => $employee->id]);
        PaymentRequest::factory()->create(['user_id' => $other->id]);

        $response = $this->actingAs($employee, 'api')
            ->getJson('/api/payment-requests');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_finance_sees_all_requests(): void
    {
        $finance = $this->finance();

        PaymentRequest::factory()->count(3)->create();

        $response = $this->actingAs($finance, 'api')
            ->getJson('/api/payment-requests');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_filter_by_status_works(): void
    {
        $finance = $this->finance();
        PaymentRequest::factory()->create(['status' => PaymentStatus::Pending]);
        PaymentRequest::factory()->create(['status' => PaymentStatus::Approved]);

        $response = $this->actingAs($finance, 'api')
            ->getJson('/api/payment-requests?status=pending');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_employee_gets_404_for_other_users_request(): void
    {
        $employee = $this->employee();
        $other    = User::factory()->create();
        $pr       = PaymentRequest::factory()->create(['user_id' => $other->id]);

        $this->actingAs($employee, 'api')
            ->getJson("/api/payment-requests/{$pr->id}")
            ->assertNotFound();
    }

    public function test_finance_can_see_any_request(): void
    {
        $finance = $this->finance();
        $pr      = PaymentRequest::factory()->create();

        $this->actingAs($finance, 'api')
            ->getJson("/api/payment-requests/{$pr->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $pr->id);
    }

    public function test_finance_can_approve_pending_request(): void
    {
        $finance = $this->finance();
        $pr      = PaymentRequest::factory()->create(['status' => PaymentStatus::Pending]);

        $this->actingAs($finance, 'api')
            ->patchJson("/api/payment-requests/{$pr->id}/status", ['status' => 'approved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }

    public function test_finance_can_reject_pending_request(): void
    {
        $finance = $this->finance();
        $pr      = PaymentRequest::factory()->create(['status' => PaymentStatus::Pending]);

        $this->actingAs($finance, 'api')
            ->patchJson("/api/payment-requests/{$pr->id}/status", ['status' => 'rejected'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_employee_cannot_approve_request(): void
    {
        $employee = $this->employee();
        $pr       = PaymentRequest::factory()->create(['status' => PaymentStatus::Pending]);

        $this->actingAs($employee, 'api')
            ->patchJson("/api/payment-requests/{$pr->id}/status", ['status' => 'approved'])
            ->assertForbidden();
    }

    public function test_cannot_approve_already_approved_request(): void
    {
        $finance = $this->finance();
        $pr      = PaymentRequest::factory()->create(['status' => PaymentStatus::Approved]);

        $this->actingAs($finance, 'api')
            ->patchJson("/api/payment-requests/{$pr->id}/status", ['status' => 'approved'])
            ->assertUnprocessable();
    }

    public function test_unauthenticated_access_returns_401(): void
    {
        $this->getJson('/api/payment-requests')->assertUnauthorized();
        $this->postJson('/api/payment-requests', ['amount' => 100])->assertUnauthorized();
    }
}
