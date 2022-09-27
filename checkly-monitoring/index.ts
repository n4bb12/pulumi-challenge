import * as checkly from "@checkly/pulumi"
import * as pulumi from "@pulumi/pulumi"
import * as fs from "fs"

export type ChecklyMonitoringArgs = {
  websiteUrl: pulumi.Output<string>
}

export class ChecklyMonitoring extends pulumi.ComponentResource {
  private check: checkly.Check

  constructor(
    name: string,
    args: ChecklyMonitoringArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("pulumi:challenge:ChecklyMonitoring", name, args, opts)

    this.check = new checkly.Check("index-page", {
      activated: true,
      frequency: 10,
      type: "BROWSER",
      locations: ["eu-central-1"],
      script: args.websiteUrl.apply((websiteUrl) => {
        return fs
          .readFileSync(__dirname + "/checkly-embed.js", "utf8")
          .replace("{{websiteUrl}}", websiteUrl)
      }),
    })
  }

  get url() {
    return this.check.id.apply((id) => `https://app.checklyhq.com/checks/${id}`)
  }
}
