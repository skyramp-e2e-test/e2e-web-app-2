// HTTP contract checks for the home page's document title.
import { test, expect, type APIResponse } from "@playwright/test";

const BASE_URL =
  process.env.SKYRAMP_TEST_BASE_URL ||
  process.env.SKYRAMP_TEST_SERVICE_URL_E2E_WEB_APP_2 ||
  "http://localhost:3000";

const authHeaders = (): Record<string, string> =>
  process.env.SKYRAMP_TEST_TOKEN ? { Authorization: `Bearer ${process.env.SKYRAMP_TEST_TOKEN}` } : {};

const NEW_TITLE = "Home - End-to-end Web App";
const OLD_TITLE = "Home - E2E Web App";

const titlesOf = (html: string): string[] =>
  [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => m[1].trim());

async function expectHtmlPage(response: APIResponse): Promise<string> {
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/html");
  return response.text();
}

test.describe("home page title over HTTP", () => {
  test("GET / serves the home page as HTML titled 'Home - End-to-end Web App'", async ({ request }) => {
    const body = await expectHtmlPage(await request.get(`${BASE_URL}/`, { headers: authHeaders() }));
    expect(body).toContain(`<title>${NEW_TITLE}</title>`);
    expect(titlesOf(body)).toEqual([NEW_TITLE]);
  });

  test("GET / no longer serves the old title and has exactly one title element", async ({ request }) => {
    const body = await expectHtmlPage(await request.get(`${BASE_URL}/`, { headers: authHeaders() }));
    const titles = titlesOf(body);
    expect(titles).toHaveLength(1);
    expect(titles[0]).not.toBe(OLD_TITLE);
    expect(body).not.toContain(`<title>${OLD_TITLE}</title>`);
  });

  test("GET /static/index.html carries the new home title", async ({ request }) => {
    const body = await expectHtmlPage(await request.get(`${BASE_URL}/static/index.html`, { headers: authHeaders() }));
    expect(body).toContain(`<title>${NEW_TITLE}</title>`);
    expect(titlesOf(body)).toEqual([NEW_TITLE]);
  });
});
