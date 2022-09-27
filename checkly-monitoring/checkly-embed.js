const playwright = require("playwright")
const expect = require("expect")

const browser = await playwright.chromium.launch()
const page = await browser.newPage()

await page.goto("{{websiteUrl}}")
expect(await page.title()).toBe("Pulumi Challenge")

await browser.close()
