// Browser checks for the home page: its tab title, heading, nav, stylesheet and sign-in status line.
import { test, expect } from "@playwright/test";
import { newSkyrampPlaywrightPage } from "@skyramp/skyramp";

const BASE_URL =
  process.env.SKYRAMP_TEST_SERVICE_URL_UI ||
  process.env.SKYRAMP_TEST_BASE_URL ||
  "http://localhost:3000";

const HOME_TITLE = "Home - End-to-end Web App";

function uiCredentials(): { username: string; password: string } {
  const username = process.env.SKYRAMP_UI_USERNAME;
  const password = process.env.SKYRAMP_UI_PASSWORD;
  if (!username || !password) throw new Error("SKYRAMP_UI_USERNAME and SKYRAMP_UI_PASSWORD must be set");
  return { username, password };
}

test.describe("home page", () => {
  test.use({ baseURL: BASE_URL });

  test("still shows its heading, nav links and stylesheet", async ({ page: rawPage }) => {
    const page = newSkyrampPlaywrightPage(rawPage);
    const stylesheet = rawPage.waitForResponse((r) => new URL(r.url()).pathname === "/static/styles.css");
    await page.goto("/");
    expect((await stylesheet).status()).toBe(200);
    await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute("href", "/static/styles.css");
    await expect(page.getByTestId("home-heading")).toHaveText("E2E Web App");
    await expect(page.getByTestId("nav-home")).toBeVisible();
    await expect(page.getByTestId("nav-home")).toHaveText("Home");
    await expect(page.getByTestId("nav-login")).toBeVisible();
    await expect(page.getByTestId("nav-login")).toHaveText("Login");
    await expect(page.getByTestId("nav-items")).toBeVisible();
    await expect(page.getByTestId("nav-items")).toHaveText("Items");
  });

  test("open the home page, sign in, return home and see the app title", async ({ page: rawPage }) => {
    const page = newSkyrampPlaywrightPage(rawPage);
    const { username, password } = uiCredentials();

    await test.step("1. open the home page signed out", async () => {
      await page.goto("/");
      await expect.soft(page).toHaveTitle(HOME_TITLE);
      await expect.soft(page.getByTestId("home-heading")).toHaveText("E2E Web App");
      await expect.soft(page.getByTestId("user-status")).toHaveText("You are not signed in.");
    });

    await test.step("2. go to the login page", async () => {
      await page.getByTestId("nav-login").click();
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByTestId("email-input")).toBeVisible();
    });

    await test.step("3. sign in", async () => {
      await page.getByTestId("email-input").fill(username);
      await page.getByTestId("password-input").fill(password);
      await page.getByTestId("login-submit").click();
      await expect(page).toHaveURL(/\/items$/);
    });

    await test.step("4. return to the home page signed in", async () => {
      await page.getByTestId("nav-home").click();
      await expect(page).toHaveURL(new RegExp(`^${BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`));
      await expect.soft(page).toHaveTitle(HOME_TITLE);
      await expect.soft(page.getByTestId("user-status")).toHaveText(`Signed in as ${username}`);
    });

    await test.step("5. reload the home page", async () => {
      await page.reload();
      await expect.soft(page).toHaveTitle(HOME_TITLE);
      await expect.soft(page.getByTestId("user-status")).toHaveText(`Signed in as ${username}`);
    });
  });
});
