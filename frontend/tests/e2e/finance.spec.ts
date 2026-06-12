import { test, expect } from '@playwright/test'

test.describe('Painel financeiro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance')
  })

  test('finance role can access /finance', async ({ page }) => {
    await expect(page).toHaveURL('/finance')
    await expect(page.getByText('FILA DE APROVAÇÃO')).toBeVisible()
  })

  test('renders 4 KPI metric cards', async ({ page }) => {
    await expect(page.getByText('TOTAL')).toBeVisible()
    await expect(page.getByText('PENDENTES')).toBeVisible()
    await expect(page.getByText('APROVADAS')).toBeVisible()
    await expect(page.getByText('REJEITADAS')).toBeVisible()
  })

  test('renders table with action column', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /Descrição/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Em EUR/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /Ação/i })).toBeVisible()
  })

  test('approve button resolves a pending request and fades row', async ({ page }) => {
    const approveButtons = page.getByTitle('Aprovar')
    const count = await approveButtons.count()

    if (count === 0) {
      test.skip()
      return
    }

    // Get the row text before approving
    const firstRow = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') }).first()
    const rowText = await firstRow.innerText()

    await approveButtons.first().click()
    await expect(page.getByText(/Requisição aprovada/i)).toBeVisible()

    // Row fades then disappears
    await page.waitForTimeout(1000)
    const remainingRows = page.getByRole('row').filter({ hasText: rowText.split('\t')[0] })
    await expect(remainingRows).toHaveCount(0)
  })

  test('reject button resolves a pending request', async ({ page }) => {
    const rejectButtons = page.getByTitle('Rejeitar')
    const count = await rejectButtons.count()

    if (count === 0) {
      test.skip()
      return
    }

    await rejectButtons.first().click()
    await expect(page.getByText(/Requisição rejeitada/i)).toBeVisible()
  })
})
