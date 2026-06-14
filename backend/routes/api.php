<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\FinanceReportsController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentRequestController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register',        [AuthController::class, 'register']);
    Route::post('login',           [AuthController::class, 'login']);
    Route::post('logout',          [AuthController::class, 'logout'])->middleware('auth:api');
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

    Route::get('finance/reports', [FinanceReportsController::class, 'index'])
        ->middleware('finance');

    Route::get('payment-requests',               [PaymentRequestController::class, 'index']);
    Route::post('payment-requests',              [PaymentRequestController::class, 'store']);
    Route::get('payment-requests/{id}',          [PaymentRequestController::class, 'show']);
    Route::patch('payment-requests/{id}/status', [PaymentRequestController::class, 'updateStatus'])
        ->middleware('finance');

    Route::prefix('notifications')->group(function () {
        Route::get('/',             [NotificationController::class, 'index']);
        Route::get('/recent',       [NotificationController::class, 'recent']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('/{id}/read',  [NotificationController::class, 'markRead']);
        Route::patch('/read-all',   [NotificationController::class, 'markAllRead']);
    });
});
