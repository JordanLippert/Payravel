import { test, expect } from '@playwright/test'

test.describe('Dashboard (employee)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('renders 4 KPI metric cards', async ({ page }) => {
    await expect(page.getByText('Total enviado')).toBeVisible()
    await expect(page.getByText('Pendente')).toBeVisible()
    await expect(page.getByText('Aprovado')).toBeVisible()
    await expect(page.getByText('Rejeitado')).toBeVisible()
  })

  test('renders requests table with columns', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /Descrição/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Moeda/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Status/i })).toBeVisible()
  })

  test('"Nova requisição" button links to /requests/new', async ({ page }) => {
    await page.getByRole('link', { name: /Nova requisição/i }).click()
    await page.waitForURL('/requests/new')
    await expect(page).toHaveURL('/requests/new')
  })

  test('clicking a table row navigates to detail page', async ({ page }) => {
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') })
    const count = await rows.count()
    if (count > 0) {
      await rows.first().click()
      await expect(page).toHaveURL(/\/requests\/.+/)
    }
  })

  test('unauthenticated user is redirected to login', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })
})
