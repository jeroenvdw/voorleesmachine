import { expect, test } from '@playwright/test'

const L = {
  takePhoto: 'Foto maken',
  shoot: 'Pagina fotograferen',
  readThis: 'Deze pagina voorlezen',
  thinking: 'Aan het nadenken',
  pause: 'Even pauze',
  resume: 'Verder lezen',
  listenAgain: 'Nog een keer luisteren',
  louder: 'Luider',
  softer: 'Stiller',
  volume: 'Volume',
  nextPage: 'Volgende pagina',
  closeCamera: 'Camera sluiten',
  goHome: 'Terug naar begin',
  retry: 'Probeer opnieuw',
  errorNoText: 'Geen tekst gevonden op deze pagina',
}

test('kinderen kunnen een pagina laten voorlezen van begin tot eind', async ({ page }) => {
  await page.goto('/?mock=1')

  await expect(page.getByRole('button', { name: L.takePhoto })).toBeVisible()
  await page.getByRole('button', { name: L.takePhoto }).click()

  const shutter = page.getByRole('button', { name: L.shoot })
  await expect(shutter).toBeEnabled()
  await shutter.click()

  await page.getByRole('button', { name: L.readThis }).click()
  await expect(page.getByRole('img', { name: L.thinking })).toBeVisible()
  await expect(page.getByRole('button', { name: L.pause })).toBeVisible({ timeout: 10_000 })

  await expect(page.getByLabel(`${L.volume} 7 van 10`)).toBeVisible()
  await page.getByRole('button', { name: L.louder }).click()
  await expect(page.getByLabel(`${L.volume} 8 van 10`)).toBeVisible()
  await page.getByRole('button', { name: L.softer }).click()
  await expect(page.getByLabel(`${L.volume} 7 van 10`)).toBeVisible()

  await page.getByRole('button', { name: L.pause }).click()
  await expect(page.getByRole('button', { name: L.resume })).toBeVisible()
  await page.getByRole('button', { name: L.resume }).click()
  await expect(page.getByRole('button', { name: L.pause })).toBeVisible()

  await expect(page.getByRole('button', { name: L.listenAgain })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: L.listenAgain }).click()
  await expect(page.getByRole('button', { name: L.pause })).toBeVisible()

  await page.getByRole('button', { name: L.nextPage }).click()
  await expect(shutter).toBeEnabled()
  await page.getByRole('button', { name: L.closeCamera }).click()
  await expect(page.getByRole('button', { name: L.takePhoto })).toBeVisible()
})

test('een pagina zonder tekst toont een fout met herstel', async ({ page }) => {
  await page.goto('/?mock=1&ocr=empty')

  await page.getByRole('button', { name: L.takePhoto }).click()
  const shutter = page.getByRole('button', { name: L.shoot })
  await expect(shutter).toBeEnabled()
  await shutter.click()
  await page.getByRole('button', { name: L.readThis }).click()

  await expect(page.getByRole('img', { name: L.errorNoText })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: L.nextPage })).toBeVisible()
  await page.getByRole('button', { name: L.retry }).click()
  await expect(page.getByRole('img', { name: L.errorNoText })).toBeVisible({ timeout: 15_000 })

  await page.getByRole('button', { name: L.nextPage }).click()
  await expect(shutter).toBeEnabled()
  await page.getByRole('button', { name: L.closeCamera }).click()
  await expect(page.getByRole('button', { name: L.takePhoto })).toBeVisible()
})

test('de app is een geldige PWA', async ({ request }) => {
  const manifestResponse = await request.get('/manifest.webmanifest')
  expect(manifestResponse.ok()).toBeTruthy()
  const manifest = await manifestResponse.json()
  expect(manifest.name).toBe('Voorleesmachine')
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons.length).toBeGreaterThan(2)

  const swResponse = await request.get('/sw.js')
  expect(swResponse.ok()).toBeTruthy()
  expect(await swResponse.text()).toContain('voorleesmachine-v1')
})
