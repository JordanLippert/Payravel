import { test, expect } from '@playwright/test'

test.describe('Nova requisição', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/requests/new')
  })

  test('renders 3-step form with step 1 active', async ({ page }) => {
    await expect(page.getByText('Nova requisição')).toBeVisible()
    await expect(page.getByLabel('Descrição')).toBeVisible()
    await expect(page.getByLabel('Valor')).toBeVisible()
  })

  test('shows validation error when description is too short', async ({ page }) => {
    await page.getByLabel('Descrição').fill('ab')
    await page.getByRole('button', { name: /Ver câmbio/i }).click()
    await expect(page.getByText(/no mínimo 3 caracteres/i)).toBeVisible()
  })

  test('step 1 → step 2: fetches exchange rate after valid input', async ({ page }) => {
    await page.getByLabel('Descrição').fill('Reembolso de notebook')
    // Amount input uses keydown-based handler — pressSequentially dispatches keydown events
    await page.getByLabel('Valor').pressSequentially('1000')

    // Currency is pre-selected from user profile; just proceed
    await page.getByRole('button', { name: /Ver câmbio/i }).click()

    // Step 2 should appear with live rate badge
    await expect(page.getByText('ao vivo ✓')).toBeVisible({ timeout: 15000 })
  })

  test('step 2 → step 3: shows review summary', async ({ page }) => {
    await page.getByLabel('Descrição').fill('Despesa de viagem')
    await page.getByLabel('Valor').pressSequentially('500')

    await page.getByRole('button', { name: /Ver câmbio/i }).click()
    await expect(page.getByText('ao vivo ✓')).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: /Revisar pedido/i }).click()

    await expect(page.getByText('Despesa de viagem')).toBeVisible()
    await expect(page.getByRole('button', { name: /Enviar para aprovação/i })).toBeVisible()
  })

  test('"Cancelar" button navigates to /', async ({ page }) => {
    await page.getByRole('button', { name: /Cancelar/i }).click()
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page).toHaveURL('/')
  })
})
