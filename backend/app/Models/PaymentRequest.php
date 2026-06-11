<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id', 'amount_local', 'currency', 'exchange_rate',
        'exchange_rate_source', 'exchange_rate_fetched_at', 'amount_eur',
        'description', 'status', 'reviewed_by', 'reviewed_at', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'exchange_rate'            => 'float',
            'amount_local'             => 'float',
            'amount_eur'               => 'float',
            'exchange_rate_fetched_at' => 'datetime',
            'reviewed_at'              => 'datetime',
            'expires_at'               => 'datetime',
            'status'                   => PaymentStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
