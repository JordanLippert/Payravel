import { test, expect } from '@playwright/test'

test.describe('Detalhe da requisição', () => {
  test('navigates to first request from dashboard and shows detail', async ({ page }) => {
    await page.goto('/')

    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') })
    const count = await rows.count()

    if (count === 0) {
      test.skip()
      return
    }

    await rows.first().click()
    await page.waitForURL(/\/requests\/\d+/)

    // Big EUR amount visible
    await expect(page.getByText('Valor em EUR')).toBeVisible()

    // Conversion table
    await expect(page.getByText('Descrição')).toBeVisible()
    await expect(page.getByText('Valor original')).toBeVisible()
    await expect(page.getByText('Moeda')).toBeVisible()
    await expect(page.getByText('Data')).toBeVisible()

    // Timeline sidebar
    await expect(page.getByText('LINHA DO TEMPO')).toBeVisible()
    await expect(page.getByText('Requisição enviada')).toBeVisible()
  })

  test('"Voltar ao dashboard" link works', async ({ page }) => {
    await page.goto('/')
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') })
    if (await rows.count() === 0) { test.skip(); return }

    await rows.first().click()
    await page.waitForURL(/\/requests\/\d+/)
    await page.getByRole('link', { name: /Voltar ao dashboard/i }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('finance role cannot access /finance when logged in as employee', async ({ page }) => {
    await page.goto('/finance')
    await expect(page).toHaveURL('/')
  })
})
