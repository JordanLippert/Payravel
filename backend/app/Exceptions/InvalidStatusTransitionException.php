<?php

namespace App\Exceptions;

use RuntimeException;

class InvalidStatusTransitionException extends RuntimeException
{
    public function __construct(string $message = 'This payment request cannot be updated in its current status.')
    {
        parent::__construct($message);
    }
}
