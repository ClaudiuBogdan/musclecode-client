import { Page, expect } from "@playwright/test";

export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState("networkidle");
}

export async function waitForResponse(page: Page, urlPattern: RegExp | string) {
  return page.waitForResponse(urlPattern);
}

export async function checkToastMessage(page: Page, message: string) {
  const toast = page.getByText(message);
  await expect(toast).toBeVisible();
}

export async function fillAlgorithmForm(
  page: Page,
  {
    title = "Test Algorithm",
    difficulty = "Easy",
    summary = "Test algorithm summary",
    category = "Sorting",
    description = "Test algorithm description",
    language = "JavaScript",
    code = "function solution() { return true; }",
  } = {}
) {
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Difficulty").selectOption(difficulty);
  await page.getByLabel("Summary").fill(summary);
  await page.getByLabel("Category").selectOption(category);
  await page.getByLabel("Description").fill(description);

  // Add language and code
  await page.getByRole("button", { name: "Add Language" }).click();
  await page.getByLabel("Language").selectOption(language);

  // Wait for CodeMirror to initialize
  await page.waitForSelector(".cm-editor");
  await page.keyboard.type(code);
}

export async function navigateToFirstAlgorithm(page: Page) {
  await page.goto("/algorithms");
  const firstAlgorithmLink = page.getByRole("link").first();
  await firstAlgorithmLink.click();
}

export async function runCode(page: Page) {
  await page.getByRole("button", { name: "Run" }).click();
  await waitForNetworkIdle(page);
}

export async function checkExecutionResult(page: Page) {
  const resultPanel = page.getByText("Execution Result");
  await expect(resultPanel).toBeVisible();
}

export async function switchLanguage(page: Page, targetLanguage: string) {
  const languageSelect = page.getByRole("combobox", { name: "Language" });
  await languageSelect.selectOption(targetLanguage);
  await waitForNetworkIdle(page);
}
