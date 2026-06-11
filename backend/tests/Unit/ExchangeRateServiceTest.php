<?php

namespace Tests\Unit;

use App\DTOs\ExchangeRateDTO;
use App\Exceptions\ExchangeRateUnavailableException;
use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeRateServiceTest extends TestCase
{
    private ExchangeRateService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->service = new ExchangeRateService();
    }

    public function test_returns_dto_with_correct_values(): void
    {
        Http::fake(['*' => Http::response(['rates' => ['BRL' => 5.42]])]);

        $result = $this->service->getRate('BRL');

        $this->assertInstanceOf(ExchangeRateDTO::class, $result);
        $this->assertEquals('BRL', $result->currency);
        $this->assertEquals(5.42, $result->rate);
        $this->assertEquals('exchangerate-api.com', $result->source);
        $this->assertEqualsWithDelta(now()->timestamp, $result->fetchedAt->timestamp, 5);
        $this->assertEqualsWithDelta(now()->addMinutes(30)->timestamp, $result->expiresAt->timestamp, 5);
    }

    public function test_caches_result_and_makes_only_one_http_request(): void
    {
        Http::fake(['*' => Http::response(['rates' => ['BRL' => 5.42]])]);

        $this->service->getRate('BRL');
        $this->service->getRate('BRL');

        Http::assertSentCount(1);
    }

    public function test_normalizes_currency_to_uppercase(): void
    {
        Http::fake(['*' => Http::response(['rates' => ['BRL' => 5.42]])]);

        $result = $this->service->getRate('brl');

        $this->assertEquals('BRL', $result->currency);
    }

    public function test_throws_when_api_returns_error_status(): void
    {
        Http::fake(['*' => Http::response(null, 500)]);

        $this->expectException(ExchangeRateUnavailableException::class);

        $this->service->getRate('BRL');
    }

    public function test_throws_when_currency_not_in_response(): void
    {
        Http::fake(['*' => Http::response(['rates' => ['USD' => 1.1]])]);

        $this->expectException(ExchangeRateUnavailableException::class);

        $this->service->getRate('XYZ');
    }

    public function test_different_currencies_are_cached_independently(): void
    {
        Http::fake([
            '*' => Http::sequence()
                ->push(['rates' => ['BRL' => 5.42]])
                ->push(['rates' => ['USD' => 1.08]]),
        ]);

        $brl = $this->service->getRate('BRL');
        $usd = $this->service->getRate('USD');

        $this->assertEquals(5.42, $brl->rate);
        $this->assertEquals(1.08, $usd->rate);
        Http::assertSentCount(2);
    }
}
