#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PhpAppRunnerCdkStack } from '../lib/php-app-runner-cdk-stack';

const app = new cdk.App();
new PhpAppRunnerCdkStack(app, 'PhpAppRunnerCdkStack', {
});