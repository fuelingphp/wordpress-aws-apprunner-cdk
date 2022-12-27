import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'

export class PhpAppRunnerCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const dbName = new cdk.CfnParameter(this, 'db-name-parameter', {
      type: 'String',
      description: 'The wordpress database name',
      default: 'wordpress'
    })
    
    const dbUser = new cdk.CfnParameter(this, 'db-user-parameter', {
      type: 'String',
       description: 'The wordpress default db user',
       default: 'wpdbuser'
    })
    
    const vpc = new ec2.Vpc(this, 'my-cdk-vpc', {
      cidr: '10.0.0.0/16',
      vpcName: 'wordpress-vpc',
      natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'public-subnet-1',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    })
    
    const pw = new secretsmanager.CfnSecret(this, 'dbpassword', {
      name: '/wordpress/db/password',
      generateSecretString: {
        excludePunctuation: true
      }
    })
    
    
  
    const pwSecret = secretsmanager.Secret.fromSecretNameV2(
          this,
          'db-pwd-id',
          '/wordpress/db/password',
        ).secretValue
        
    
    // Create a SG for a backend server
    const dbSG = new ec2.SecurityGroup(this, 'backend-server-sg', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'wordpress-db-security-group',
      description: 'security group for a backend server',
    })
    
    dbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306), 'db connection')
    dbSG.node.addDependency(vpc)
      
    const dbCluster = new rds.ServerlessCluster(this, 'DbCluster', {
      credentials: {
        username: dbUser.value.toString(),
        password: pwSecret
      },
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_2_10_2,
      }),
      defaultDatabaseName: dbName.value.toString(),
      clusterIdentifier: 'fp-wordpressDB',
      vpc: vpc,
      vpcSubnets: vpc.selectSubnets({
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }),
      securityGroups: [dbSG],
      scaling: {
        minCapacity: rds.AuroraCapacityUnit.ACU_1,
        maxCapacity: rds.AuroraCapacityUnit.ACU_256
      }
    })
    
    dbCluster.node.addDependency(pw)
    dbCluster.node.addDependency(vpc)
    dbCluster.node.addDependency(dbSG)
      
    const connector = new apprunner.CfnVpcConnector(this, 'Connector', {
      subnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PUBLIC
      }).subnetIds
    })
    
    connector.node.addDependency(vpc)
    
    const wp = new apprunner.CfnService(this, 'WPApp', {
      serviceName: 'wordpress',
      instanceConfiguration: {
        cpu: '2 vCPU',
        memory: '4 GB'
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: connector.attrVpcConnectorArn
        },
      },
      sourceConfiguration: {
        autoDeploymentsEnabled: false,
        imageRepository: {
          imageIdentifier: 'public.ecr.aws/bitnami/wordpress-nginx:latest',
          imageRepositoryType: 'ECR_PUBLIC',
          imageConfiguration: {
            port: '8080',
            runtimeEnvironmentVariables: [
                {
                  name: 'WORDPRESS_DATABASE_USER',
                  value: dbUser.value.toString()
                },
                {
                  name: 'WORDPRESS_DATABASE_PASSWORD',
                  value: pwSecret.unsafeUnwrap()
                },
                {
                  name: 'WORDPRESS_DATABASE_NAME',
                  value: dbName.value.toString()
                },
                {
                  name: 'WORDPRESS_DATABASE_HOST',
                  value: dbCluster.clusterEndpoint.hostname
                },
                {
                  name: 'WORDPRESS_ENABLE_REVERSE_PROXY',
                  value: 'yes'
                },
                {
                  name: 'WORDPRESS_ENABLE_HTTPS',
                  value: 'yes'
                }
              ]
          }
        }
      },
    })
    
    
    wp.node.addDependency(connector)
    wp.node.addDependency(dbCluster)
  }
  
  
}
