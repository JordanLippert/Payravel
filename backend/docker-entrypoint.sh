#!/bin/sh
set -e

# Restore Passport RSA keys from env vars (base64-encoded PEM).
# If env vars are not set, generate fresh keys — tokens will be
# invalidated on every container restart (acceptable for dev/demo).
if [ -n "$PASSPORT_PRIVATE_KEY" ]; then
    printf '%s' "$PASSPORT_PRIVATE_KEY" | base64 -d > storage/oauth-private.key
    chmod 600 storage/oauth-private.key
fi

if [ -n "$PASSPORT_PUBLIC_KEY" ]; then
    printf '%s' "$PASSPORT_PUBLIC_KEY" | base64 -d > storage/oauth-public.key
fi

if [ ! -f storage/oauth-private.key ]; then
    php artisan passport:keys
fi

php artisan config:cache
php artisan migrate --force
exec php artisan serve --host=0.0.0.0 --port=8000
