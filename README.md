<p align="center">
  <img src="frontend/public/favicon.svg" width="72" height="72" alt="Payravel" />
</p>

<h1 align="center">Payravel</h1>
<p align="center">Corporate expense reimbursement — multi-currency, real-time exchange rates, role-based approvals.</p>

---

> 🇧🇷 [Leia em Português](README.pt-BR.md)

## Stack

- **Backend:** Laravel 12, PHP 8.2+, Laravel Passport
- **Frontend:** Nuxt 4, Vue 3, Tailwind CSS 4, TypeScript, Pinia
- **Infra:** Docker + docker-compose

---

## Quick Start (Docker)

```bash
# 1. Clone the repository
git clone <repo-url> && cd payravel

# 2. Configure Mailtrap credentials (for password reset emails)
# Create a free account at https://mailtrap.io and copy your SMTP credentials
# Add them to docker-compose.yml under MAIL_USERNAME and MAIL_PASSWORD

# 3. Start everything
docker-compose up --build
```

The API will be available at **http://localhost:8000/api**
API docs at **http://localhost:8000/docs**

---

## Manual Setup (without Docker)

```bash
cd backend
composer install
cp .env.example .env

# Edit .env: configure DB_* and MAIL_* settings
php artisan key:generate
php artisan migrate
php artisan passport:install
php artisan db:seed
php artisan serve
```

---

## Test Credentials

| Email | Password | Role |
|---|---|---|
| ana@payravel.com | password | Employee (BRL) |
| john@payravel.com | password | Employee (USD) |
| emma@payravel.com | password | Employee (GBP) |
| yuki@payravel.com | password | Employee (JPY) |
| carlos@payravel.com | password | Employee (MXN) |
| finance@payravel.com | password | Finance |

---

## Running Tests

```bash
cd backend
php artisan test
```

---

## API Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| POST | /api/auth/register | No | — |
| POST | /api/auth/login | No | — |
| POST | /api/auth/logout | Yes | — |
| POST | /api/auth/forgot-password | No | — |
| POST | /api/auth/reset-password | No | — |
| GET | /api/exchange-rates/{currency} | Yes | — |
| GET | /api/payment-requests | Yes | any |
| POST | /api/payment-requests | Yes | any |
| GET | /api/payment-requests/{id} | Yes | any |
| PATCH | /api/payment-requests/{id}/status | Yes | finance |

Full interactive docs: **http://localhost:8000/docs**

---

## Key Design Decisions

- **UUIDs** for all primary keys — prevents enumeration attacks
- **TIMESTAMPTZ** for all timestamps — correct handling across timezones for an international team
- **Exchange rate immutability** — rate, source, and timestamp are stored at creation and never modified
- **48h auto-expiry** — pending requests expire automatically via hourly scheduled job
- **Role-based access** — employees see only their own requests; finance sees all and can approve/reject
