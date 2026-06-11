<?php

namespace App\Exceptions;

use RuntimeException;

class ExchangeRateUnavailableException extends RuntimeException
{
    public function __construct(string $message = 'Exchange rate service is unavailable. Please try again later.')
    {
        parent::__construct($message);
    }
}
