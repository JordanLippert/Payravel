<?php

namespace App\Jobs;

use App\Services\PaymentRequestService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ExpirePaymentRequests implements ShouldQueue
{
    use Queueable;

    public function handle(PaymentRequestService $service): void
    {
        $service->expirePending();
    }
}
