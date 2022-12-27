# AWS App Runner with WordPress CloudFormation CDK Skeleton

Deploy a WordPress app into AWS App Runner. App Runner is a container service provided by AWS that is similar to Heroku. You don't have to worry about load balancers, ssl certs and servers. Just build out your WordPress app and deploy.

You will need to deploy a WordPress docker version of your app to use this service. We do have a template that is available for you to use if needed.
It creates all the necessary resources to get the application running.


## Resources Generated
1. VPC with public & private subnet
2. Aurora Mysql serverless cluster with custom security group.
3. AWS App Runner instance with a docker image deployed.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Infrastructure Prerequisites
- **AWS Profile** Make sure to setup your AWS profile on your machine before running this deployment.
- **WordPress Docker Image** Your wordpress repo should have a Docker image that you want to deploy.

## How to setup environment

1. Update the environment configuration to use your wordpress git repo.
2. Run `cdk synth` to create the cloudformation content
3. Run `cdk deploy` to deploy the stack into your AWS environment.


## Limitations
- **Secret Environment Variables** App Runner will show any environment variables as readable in the App Runner console. There is an active ticket to connect into secrets manager to prevent displaying private content on the AWS console.
- **Plugin & Theme Management** You will need to manage your plugins & themes via composer and must avoid using the wordpress dashboard to upload or add plugins / themes.
- **Upload Data** You'll need to use a CDN / Storage plugin to manage your uploaded content. This is good practice and there are many plugins that can help with this requirement.
