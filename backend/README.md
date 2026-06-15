# Payravel — Backend

Laravel 12 REST API for the Payravel expense reimbursement platform.

**Production:** https://payravel-backend.onrender.com

---

## Stack

| | |
|---|---|
| Framework | Laravel 12 |
| Language | PHP 8.2+ |
| Auth | Laravel Passport (OAuth2 Bearer) |
| Queue | Laravel Scheduler (hourly expiry job) |
| Hosting | Render (Docker, free tier) |
| Database | Neon PostgreSQL (aws-sa-east-1) |

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan passport:install
php artisan serve
# http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | `/api/auth/register` | No | — |
| POST | `/api/auth/login` | No | — |
| POST | `/api/auth/logout` | Yes | — |
| POST | `/api/auth/forgot-password` | No | — |
| POST | `/api/auth/reset-password` | No | — |
| GET | `/api/user` | Yes | — |
| PUT | `/api/user` | Yes | — |
| GET | `/api/exchange-rates/{currency}` | Yes | — |
| GET | `/api/payment-requests` | Yes | any |
| POST | `/api/payment-requests` | Yes | any |
| GET | `/api/payment-requests/{id}` | Yes | any |
| PATCH | `/api/payment-requests/{id}/status` | Yes | finance |
| GET | `/api/metrics/total` | Yes | any |
| GET | `/api/metrics/pending` | Yes | finance |
| GET | `/api/metrics/approved` | Yes | finance |
| GET | `/api/metrics/rejected` | Yes | finance |
| GET | `/api/finance/reports` | Yes | finance |
| GET | `/api/notifications` | Yes | — |
| PATCH | `/api/notifications/{id}/read` | Yes | — |
| GET | `/api/notifications/unread-count` | Yes | — |

Interactive docs: **http://localhost:8000/docs**

## Test credentials

| Email | Password | Role | Currency |
|---|---|---|---|
| ana@payravel.com | password | Employee | BRL |
| john@payravel.com | password | Employee | USD |
| emma@payravel.com | password | Employee | GBP |
| yuki@payravel.com | password | Employee | JPY |
| carlos@payravel.com | password | Employee | MXN |
| finance@payravel.com | password | Finance | EUR |

## Tests

```bash
php artisan test
```

## Key design decisions

- **UUIDs** for all primary keys — prevents enumeration attacks
- **Exchange rate immutability** — rate, source, and timestamp stored at creation, never modified
- **48h auto-expiry** — pending requests expire via hourly scheduled job (`ExpirePaymentRequests`)
- **Role-based access** — employees see only their own requests; finance sees all
- **Currency from payload** — currency is taken from the request body, not the user's default
