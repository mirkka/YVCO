import * as cdk from '@aws-cdk/core'
import { Bucket } from '@aws-cdk/aws-s3'
import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront'
import { ARecord, HostedZone } from '@aws-cdk/aws-route53'
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'
import { RemovalPolicy } from '@aws-cdk/core'
import { CanonicalUserPrincipal, PolicyStatement } from '@aws-cdk/aws-iam'

export class InfraStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const bucket = new Bucket(this, 'bucket', {
      bucketName: 'yvco',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const identity = new OriginAccessIdentity(this, 'identity')

    const bucketPolicy = new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
      principals: [new CanonicalUserPrincipal(identity.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    })

    bucket.addToResourcePolicy(bucketPolicy)

    const distribution = new CloudFrontWebDistribution(this, 'cloudfront', {
      aliasConfiguration: {
        names: ['yvco.cicushik.com'],
        acmCertRef: 'arn:aws:acm:us-east-1:495127000729:certificate/41cd25c5-f0cc-4c77-a70c-7ce0fff9d739'
      },
      originConfigs: [{
        behaviors: [
          {
            isDefaultBehavior: true,
            pathPattern: '*'
          }
        ],
        s3OriginSource: {
          s3BucketSource: bucket
        }
      }]
    })

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'zone', { hostedZoneId: 'Z2TJSCNWDHQYQ7', zoneName: 'yvco.cicushik.com'})

    new ARecord(this, 'record', {
      zone: hostedZone,
      target: {
        aliasTarget: new CloudFrontTarget(distribution)
      }
    })
  }
}
