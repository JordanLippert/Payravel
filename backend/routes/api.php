<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\PaymentRequestController;
use App\Http\Controllers\ProfileController;
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

    Route::get('user',           [ProfileController::class, 'show']);
    Route::patch('user',         [ProfileController::class, 'update']);
    Route::post('user/password', [ProfileController::class, 'changePassword']);
    Route::post('user/avatar',   [ProfileController::class, 'uploadAvatar']);

    Route::prefix('metrics')->group(function () {
        Route::get('total',    [MetricsController::class, 'total']);
        Route::get('pending',  [MetricsController::class, 'pending']);
        Route::get('approved', [MetricsController::class, 'approved']);
        Route::get('rejected', [MetricsController::class, 'rejected']);
    });

    Route::get('payment-requests',               [PaymentRequestController::class, 'index']);
    Route::post('payment-requests',              [PaymentRequestController::class, 'store']);
    Route::get('payment-requests/{id}',          [PaymentRequestController::class, 'show']);
    Route::patch('payment-requests/{id}/status', [PaymentRequestController::class, 'updateStatus'])
        ->middleware('finance');
});
