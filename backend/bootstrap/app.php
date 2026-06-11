<?php

use App\Exceptions\ExchangeRateUnavailableException;
use App\Exceptions\InvalidStatusTransitionException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'finance' => \App\Http\Middleware\EnsureFinanceRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (ExchangeRateUnavailableException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        });

        $exceptions->render(function (InvalidStatusTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        });

        $exceptions->render(function (ModelNotFoundException $e) {
            return response()->json(['message' => 'Resource not found.'], 404);
        });
    })->create();
