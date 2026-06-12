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
    await page.getByRole('button', { name: /Próximo/i }).click()
    await expect(page.getByText(/no mínimo 3 caracteres/i)).toBeVisible()
  })

  test('step 1 → step 2: fetches exchange rate after valid input', async ({ page }) => {
    await page.getByLabel('Descrição').fill('Reembolso de notebook')
    await page.getByLabel('Valor').fill('1000')

    // Open custom select and pick USD
    await page.getByText('Selecionar').click()
    await page.getByText('USD').click()

    await page.getByRole('button', { name: /Próximo/i }).click()

    // Step 2: exchange rate card
    await expect(page.getByText('ao vivo ✓')).toBeVisible()
    await expect(page.getByText(/1 EUR =/i)).toBeVisible()
  })

  test('step 2 → step 3: shows review summary', async ({ page }) => {
    await page.getByLabel('Descrição').fill('Despesa de viagem')
    await page.getByLabel('Valor').fill('500')

    await page.getByText('Selecionar').click()
    await page.getByText('BRL').click()

    await page.getByRole('button', { name: /Próximo/i }).click()
    await expect(page.getByText('ao vivo ✓')).toBeVisible()

    await page.getByRole('button', { name: /Próximo/i }).click()

    // Review step
    await expect(page.getByText('Despesa de viagem')).toBeVisible()
    await expect(page.getByText('BRL')).toBeVisible()
    await expect(page.getByRole('button', { name: /Enviar para aprovação/i })).toBeVisible()
  })

  test('"Voltar ao dashboard" link navigates to /', async ({ page }) => {
    await page.getByRole('link', { name: /Voltar ao dashboard/i }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })
})
