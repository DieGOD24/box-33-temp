import { expect, test } from '@playwright/test'

test.describe('home page', () => {
  test('renders hero, WOD board, plans and schedule', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(500)

    // Hero badge + pre-registration form
    await expect(page.getByText('Tu primera clase es gratis').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Preinscríbete hoy' })).toBeVisible()

    // WOD chalkboard (seeded content)
    await expect(page.getByRole('heading', { name: 'WOD de hoy' })).toBeVisible()
    await expect(page.getByText('AMRAP 16 min')).toBeVisible()

    // Plans — the four seeded cards
    await expect(page.getByRole('heading', { name: 'Un lugar en la tribu' })).toBeVisible()
    await expect(page.getByText('Mensualidad')).toBeVisible()
    await expect(page.getByText('Clase suelta')).toBeVisible()

    // Schedule board
    await expect(page.getByRole('heading', { name: 'Horarios' })).toBeVisible()
  })

  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
  })

  test('english locale renders', async ({ page }) => {
    await page.goto('/en')
    await expect(page.getByText('Your first class is free').first()).toBeVisible()
  })
})
