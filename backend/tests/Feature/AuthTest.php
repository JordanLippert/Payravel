<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Ana Silva',
            'email'                 => 'ana@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'currency'              => 'BRL',
            'country'               => 'Brazil',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name', 'email', 'role', 'currency'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'ana@example.com']);
    }

    public function test_register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'ana@example.com']);

        $this->postJson('/api/auth/register', [
            'name'                  => 'Ana 2',
            'email'                 => 'ana@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'currency'              => 'BRL',
            'country'               => 'Brazil',
        ])->assertUnprocessable();
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password123')]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name'], 'token']);
    }

    public function test_login_fails_with_wrong_credentials(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $this->postJson('/api/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(401);
    }

    public function test_user_can_logout_and_token_is_revoked(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('auth')->accessToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertOk();

        // Reset cached guard state so the next request re-authenticates the token.
        $this->app['auth']->forgetGuards();

        // Revoked token must no longer grant access to protected routes.
        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertUnauthorized();
    }

    public function test_logout_requires_authentication(): void
    {
        $this->postJson('/api/auth/logout')->assertUnauthorized();
    }

    public function test_forgot_password_with_existing_email_returns_ok(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'Password reset link sent to your email.');
    }

    public function test_forgot_password_with_unknown_email_returns_422(): void
    {
        $this->postJson('/api/auth/forgot-password', ['email' => 'nobody@example.com'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Email not registered. Please sign up.');
    }

    public function test_reset_password_with_valid_token(): void
    {
        $user  = User::factory()->create();
        $token = app('auth.password.broker')->createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => $token,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])->assertOk()->assertJsonPath('message', 'Password reset successfully.');
    }

    public function test_reset_password_with_invalid_token_returns_422(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/reset-password', [
            'email'                 => $user->email,
            'token'                 => 'invalid-token',
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])->assertUnprocessable();
    }
}
