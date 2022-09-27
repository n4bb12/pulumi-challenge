import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"
import * as fs from "fs"
import * as mime from "mime"

// This is a simpler verison of:
// https://github.com/pulumi/pulumi-aws-static-website
export class CdnWebsite extends pulumi.ComponentResource {
  private cdn: aws.cloudfront.Distribution

  constructor(name: string, args: any, opts?: pulumi.ComponentResourceOptions) {
    super("pulumi:challenge:CdnWebsite", name, args, opts)

    const staticWebsiteDirectory = "website"
    const s3OriginId = name + "-origin-id"

    const bucket = new aws.s3.BucketV2(
      [name, "s3-bucket"].join("-"),
      {
        tags: {
          "created-by": "pulumi",
        },
      },
      {
        parent: this,
      },
    )

    const bucketAcl = new aws.s3.BucketAclV2(
      [name, "s3-bucket-acl"].join("-"),
      {
        bucket: bucket.id,
        acl: aws.s3.PublicReadAcl,
      },
      {
        parent: this,
      },
    )

    this.cdn = new aws.cloudfront.Distribution(
      [name, "cloudfront-distribution"].join("-"),
      {
        origins: [
          {
            domainName: bucket.bucketRegionalDomainName,
            originId: s3OriginId,
          },
        ],
        enabled: true,
        isIpv6Enabled: true,
        comment: "Some comment",
        defaultRootObject: "index.html",
        defaultCacheBehavior: {
          allowedMethods: [
            "DELETE",
            "GET",
            "HEAD",
            "OPTIONS",
            "PATCH",
            "POST",
            "PUT",
          ],
          cachedMethods: ["GET", "HEAD"],
          targetOriginId: s3OriginId,
          forwardedValues: {
            queryString: false,
            cookies: {
              forward: "none",
            },
          },
          viewerProtocolPolicy: "allow-all",
          minTtl: 0,
          defaultTtl: 3600,
          maxTtl: 86400,
        },
        priceClass: "PriceClass_200",
        restrictions: {
          geoRestriction: {
            restrictionType: "whitelist",
            locations: ["DE"],
          },
        },
        viewerCertificate: {
          cloudfrontDefaultCertificate: true,
        },
      },
      {
        parent: this,
      },
    )

    fs.readdirSync(staticWebsiteDirectory).forEach((file) => {
      const filePath = `${staticWebsiteDirectory}/${file}`

      new aws.s3.BucketObject(
        file,
        {
          bucket: bucket.id,
          source: new pulumi.asset.FileAsset(filePath),
          contentType: mime.getType(filePath) || undefined,
          acl: aws.s3.PublicReadAcl,
        },
        {
          parent: bucket,
        },
      )
    })

    this.registerOutputs({
      bucketId: bucket.id,
      url: this.cdn.domainName,
    })
  }

  get url() {
    return this.cdn.domainName.apply((domainName) => `https://${domainName}`)
  }
}
