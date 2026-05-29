import { test, expect } from "@playwright/test"

test("UI kit page loads", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("UI Kit")).toBeVisible()
})

test("Button variants render", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Сохранить" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Удалить" })).toBeVisible()
})

test("Accordion opens and closes", async ({ page }) => {
  await page.goto("/")
  const trigger = page.getByText("Что такое статформа?")
  await trigger.click()
  await expect(page.getByText("Статистическая форма учёта")).toBeVisible()
})