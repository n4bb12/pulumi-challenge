import "dotenv/config"
import { CdnWebsite } from "./cdn-website"
import { ChecklyMonitoring } from "./checkly-monitoring"
import { Swag } from "./swag-provider"

const swagName = process.env.SWAG_NAME
const swagEmail = process.env.SWAG_EMAIL
const swagAddress = process.env.SWAG_ADDRESS

if (!swagName || !swagEmail || !swagAddress) {
  throw new Error("Missing swag environment variables")
}

const name = "pulumi-challenge"

const website = new CdnWebsite(name, {})
const monitoring = new ChecklyMonitoring(name, { websiteUrl: website.url })

new Swag(name, {
  name: swagName,
  email: swagEmail,
  address: swagAddress,
  size: "M",
})

export const websiteUrl = website.url
export const monitoringUrl = monitoring.url
