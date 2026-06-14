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

    // Conversion info section
    await expect(page.getByText('Informações da conversão')).toBeVisible()
    await expect(page.getByText('Moeda original')).toBeVisible()
    await expect(page.getByText('Valor local')).toBeVisible()
    await expect(page.getByText('Criada em')).toBeVisible()

    // Timeline sidebar
    await expect(page.getByText('Histórico')).toBeVisible()
    await expect(page.getByText('Requisição enviada')).toBeVisible()
  })

  test('"Voltar para requisições" button works', async ({ page }) => {
    await page.goto('/')
    const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') })
    if (await rows.count() === 0) { test.skip(); return }

    await rows.first().click()
    await page.waitForURL(/\/requests\/\d+/)
    await page.getByRole('button', { name: /Voltar para requisições/i }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('finance role cannot access /finance when logged in as employee', async ({ page }) => {
    await page.goto('/finance')
    await expect(page).toHaveURL('/')
  })
})
