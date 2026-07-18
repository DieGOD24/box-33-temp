import { expect, test } from '@playwright/test'

test.describe('store', () => {
  test('catalog renders products and search input', async ({ page }) => {
    const response = await page.goto('/tienda')
    expect(response?.status()).toBeLessThan(500)

    await expect(page.getByRole('heading', { name: 'El perchero' })).toBeVisible()
    await expect(page.getByPlaceholder(/Buscar/)).toBeVisible()
    // Seeded catalog → at least one "Ver prenda" card action
    await expect(page.getByRole('link', { name: 'Ver prenda' }).first()).toBeVisible()
  })

  test('product detail shows sizes and add-to-cart opens the drawer', async ({ page }) => {
    await page.goto('/tienda/top-nike-verde')
    await expect(page.getByRole('heading', { name: 'Top Nike Verde' })).toBeVisible()
    // Size buttons XS-XL
    await expect(page.getByRole('button', { name: 'M', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Agregar al carrito' }).click()
    // Drawer opens with the item and the checkout CTA
    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText('Top Nike Verde')).toBeVisible()
    await expect(drawer.getByRole('button', { name: 'Ir a pagar' })).toBeVisible()
  })

  test('admin login page renders', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })
})
