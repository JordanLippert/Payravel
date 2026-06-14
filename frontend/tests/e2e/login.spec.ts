import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('renders split layout with brand panel', async ({ page }) => {
    await expect(page.getByText('Pagamentos multi-moeda')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.getByLabel('E-mail').fill('ana@payravel.com')
    await page.getByLabel('Senha').fill('password')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('login with wrong credentials shows error toast', async ({ page }) => {
    await page.getByLabel('E-mail').fill('ana@payravel.com')
    await page.getByLabel('Senha').fill('wrongpassword')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText(/Erro ao autenticar/i)).toBeVisible()
  })

  test('toggle to register mode shows name field', async ({ page }) => {
    await page.getByRole('button', { name: 'Registrar' }).click()
    await expect(page.getByLabel('Nome completo')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Registrar' }).last()).toBeVisible()
  })

  test('email validation shows inline error', async ({ page }) => {
    await page.getByLabel('E-mail').fill('notanemail')
    await page.getByLabel('Senha').fill('123456')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('E-mail inválido')).toBeVisible()
  })
})
