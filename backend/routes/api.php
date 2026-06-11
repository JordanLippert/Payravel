<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\PaymentRequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register',        [AuthController::class, 'register']);
    Route::post('login',           [AuthController::class, 'login']);
    Route::post('logout',          [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password',  [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:api')->group(function () {
    Route::get('exchange-rates/{currency}', [ExchangeRateController::class, 'show']);

    Route::get('payment-requests',               [PaymentRequestController::class, 'index']);
    Route::post('payment-requests',              [PaymentRequestController::class, 'store']);
    Route::get('payment-requests/{id}',          [PaymentRequestController::class, 'show']);
    Route::patch('payment-requests/{id}/status', [PaymentRequestController::class, 'updateStatus'])
        ->middleware('finance');
});
