# AWS App Runner with WordPress CloudFormation CDK Skeleton

This project will deploy a wordpress docker image into an AWS App Runner instance.
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

