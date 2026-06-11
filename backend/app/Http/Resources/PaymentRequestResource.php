<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                       => $this->id,
            'amount_local'             => $this->amount_local,
            'currency'                 => $this->currency,
            'exchange_rate'            => $this->exchange_rate,
            'exchange_rate_source'     => $this->exchange_rate_source,
            'exchange_rate_fetched_at' => $this->exchange_rate_fetched_at,
            'amount_eur'               => $this->amount_eur,
            'description'              => $this->description,
            'status'                   => $this->status,
            'reviewed_by'              => $this->reviewed_by,
            'reviewed_at'              => $this->reviewed_at,
            'expires_at'               => $this->expires_at,
            'created_at'               => $this->created_at,
            'user'                     => new UserResource($this->whenLoaded('user')),
        ];
    }
}
