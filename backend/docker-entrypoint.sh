#!/bin/sh
set -e

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

# First-boot detection via PDO (no Laravel bootstrap, no TTY needed).
OAUTH_COUNT=$(php -r "
try {
    \$dsn = 'pgsql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE') . ';sslmode=' . getenv('DB_SSLMODE');
    \$pdo = new PDO(\$dsn, getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
    echo \$pdo->query('SELECT COUNT(*) FROM oauth_clients')->fetchColumn();
} catch (Exception \$e) {
    echo '0';
}
" 2>/dev/null)

if [ -z "$OAUTH_COUNT" ] || [ "$OAUTH_COUNT" = "0" ]; then
    php artisan passport:install
    php artisan db:seed --force
fi

exec php artisan serve --host=0.0.0.0 --port=8000
