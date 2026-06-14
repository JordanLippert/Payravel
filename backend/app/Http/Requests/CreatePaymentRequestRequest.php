<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount'      => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'description' => ['nullable', 'string', 'max:500'],
            'currency'    => ['required', 'string', 'in:BRL,USD,EUR,GBP,JPY,MXN'],
        ];
    }
}
