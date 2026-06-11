# Payravel

> 🇺🇸 [Read in English](README.md)

Sistema de gerenciamento de solicitações de pagamento multi-moeda.

## Stack

- **Backend:** Laravel 12, PHP 8.4, PostgreSQL, Laravel Passport
- **Frontend:** Nuxt 3, Tailwind CSS *(em breve)*
- **Infra:** Docker + docker-compose

---

## Início Rápido (Docker)

```bash
# 1. Clone o repositório
git clone <repo-url> && cd payravel

# 2. Configure as credenciais do Mailtrap (para emails de redefinição de senha)
# Crie uma conta gratuita em https://mailtrap.io e copie suas credenciais SMTP
# Adicione-as no docker-compose.yml em MAIL_USERNAME e MAIL_PASSWORD

# 3. Suba tudo
docker-compose up --build
```

A API estará disponível em **http://localhost:8000/api**
Documentação da API em **http://localhost:8000/docs**

---

## Configuração Manual (sem Docker)

```bash
cd backend
composer install
cp .env.example .env

# Edite o .env: configure DB_* e MAIL_*
php artisan key:generate
php artisan migrate
php artisan passport:install
php artisan db:seed
php artisan serve
```

---

## Credenciais de Teste

| Email | Senha | Papel |
|---|---|---|
| ana@payravel.com | password | Funcionário (BRL) |
| john@payravel.com | password | Funcionário (USD) |
| emma@payravel.com | password | Funcionário (GBP) |
| yuki@payravel.com | password | Funcionário (JPY) |
| carlos@payravel.com | password | Funcionário (MXN) |
| finance@payravel.com | password | Financeiro |

---

## Rodando os Testes

```bash
cd backend
php artisan test
```

---

## Endpoints da API

| Método | Endpoint | Auth | Papel |
|---|---|---|---|
| POST | /api/auth/register | Não | — |
| POST | /api/auth/login | Não | — |
| POST | /api/auth/logout | Sim | — |
| POST | /api/auth/forgot-password | Não | — |
| POST | /api/auth/reset-password | Não | — |
| GET | /api/exchange-rates/{currency} | Sim | — |
| GET | /api/payment-requests | Sim | qualquer |
| POST | /api/payment-requests | Sim | qualquer |
| GET | /api/payment-requests/{id} | Sim | qualquer |
| PATCH | /api/payment-requests/{id}/status | Sim | financeiro |

Documentação interativa completa: **http://localhost:8000/docs**

---

## Decisões de Design

- **UUIDs** em todas as chaves primárias — evita ataques de enumeração
- **TIMESTAMPTZ** em todos os timestamps — tratamento correto de fusos horários para equipe internacional
- **Imutabilidade da taxa de câmbio** — taxa, fonte e timestamp são armazenados na criação e nunca alterados
- **Expiração automática em 48h** — solicitações pendentes expiram via job agendado a cada hora
- **Controle de acesso por papel** — funcionários veem apenas suas próprias solicitações; financeiro vê todas e pode aprovar/rejeitar
