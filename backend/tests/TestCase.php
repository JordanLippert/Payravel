<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Passport\Client;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (in_array(RefreshDatabase::class, class_uses_recursive(static::class), true)) {
            $this->createPersonalAccessClient();
        }
    }

    protected function createPersonalAccessClient(): void
    {
        Client::factory()->asPersonalAccessTokenClient()->create([
            'name'     => 'Test Personal Access Client',
            'provider' => 'users',
        ]);
    }
}
