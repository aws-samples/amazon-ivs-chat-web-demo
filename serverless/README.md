# Amazon IVS Chat Demo Backend

This readme includes instructions for deploying the Amazon IVS Chat Demo backend to an AWS Account. This backend supports the following Amazon IVS Chat Demos:

* [Amazon IVS Chat Web Demo](TODO: ADD LINK)
* [Amazon IVS Chat iOS Demo](TODO: ADD LINK)
* [Amazon IVS Chat Android Demo](TODO: ADD LINK)

## Prerequisites

* [AWS CLI Version 2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
* [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
* Access to an AWS Account with at least the following permissions:
  * Create IAM roles
  * Create Lambda Functions
  * Authenticate and send Events in Amazon IVS Chat
  * Create Amazon S3 Buckets

## Deployment instructions

***IMPORTANT NOTE:** Deploying this demo application in your AWS account will create and consume AWS resources, which will cost money.*

Before you start, run the following command to make sure you're in the correct AWS account (or configure as needed):

```bash
aws configure
```

For configuration specifics, refer to the [AWS CLI User Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)

### 1. Create an S3 bucket

* Replace `<S3_BUCKET>` with a name for your S3 Bucket.
* Replace `<AWS_REGION>` with your AWS region. The following regions are currently supported:
  * us-east-1
  * us-west-2
  * eu-east-1

```bash
aws s3api create-bucket --bucket <S3_BUCKET> --region <AWS_REGION> \
--create-bucket-configuration LocationConstraint=<AWS_REGION>
```

### 2. Pack template with SAM

```bash
sam package --template-file template.yaml \
  --s3-bucket <S3_BUCKET> \
  --output-template-file output.yaml
```

DO NOT run the output from above command, proceed to next step.

### 3. Deploy the packaged template

* Replace `<STACK_NAME>` with a name of your choice. The stack name will be used to reference the application.
* Replace `<AWS_REGION>` with the AWS region you entered in Step 1.

```bash
sam deploy --template-file ./output.yaml \
--stack-name <STACK_NAME> \
--capabilities CAPABILITY_IAM \
--region <AWS_REGION>
```

### Use your deployed backend in the client applications

When the deployment successfully completes, copy the output `ApiURL` for use in the various client application demos:

* [Amazon IVS Chat Web Demo](TODO: ADD LINK)
* [Amazon IVS Chat iOS Demo](TODO: ADD LINK)
* [Amazon IVS Chat Android Demo](TODO: ADD LINK)

### Accessing the deployed application

If needed, you can retrieve the Cloudformation stack outputs by running the following command:

* Replace `<STACK_NAME>` with the name of your stack from Step 3.

```bash
aws cloudformation describe-stacks --stack-name <STACK_NAME> \
--query 'Stacks[].Outputs'
```

## Cleanup

To delete the deployed application, you can use the AWS CLI. You can also visit the [AWS Cloudformation Console](https://us-west-2.console.aws.amazon.com/cloudformation/home) to manage your application.

Delete Cloudformation stack:

```bash
aws cloudformation delete-stack --stack-name <STACK_NAME>
```

Remove files in S3 bucket

```bash
aws s3 rm s3://<S3_BUCKET> --recursive
```

Delete S3 bucket

```bash
aws s3api delete-bucket --bucket <S3_BUCKET> --region <AWS_REGION>
```

## Resources

For an introduction to the AWS SAM specification, the AWS SAM CLI, and serverless application concepts, see the [AWS SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html).

Next, you can use the AWS Serverless Application Repository to deploy ready-to-use apps that go beyond Hello World samples and learn how authors developed their applications. For more information, see the [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/) and the [AWS Serverless Application Repository Developer Guide](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html).
