#!/usr/bin/env python3
"""
AWS Architecture Diagram for Numerix Dynamic Asset Allocation Platform
Generated from TASKS_AWS_DEPLOYMENT.md
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda, EC2ContainerRegistry
from diagrams.aws.storage import S3, SimpleStorageServiceS3Bucket
from diagrams.aws.database import Dynamodb
from diagrams.aws.network import APIGateway, CloudFront, VPC, NATGateway, Route53
from diagrams.aws.ml import Sagemaker, SagemakerModel
from diagrams.aws.security import Cognito, IAM, WAF
from diagrams.aws.integration import Eventbridge, SimpleQueueServiceSqs
from diagrams.aws.analytics import Kinesis
from diagrams.aws.management import Cloudwatch, SystemsManagerParameterStore
from diagrams.aws.general import Users
from diagrams.onprem.client import Client
from diagrams.saas.chat import Slack

# Custom attributes for styling
graph_attr = {
    "fontsize": "20",
    "bgcolor": "white",
    "pad": "0.5"
}

with Diagram("Numerix Dynamic Asset Allocation Platform - AWS Architecture",
             filename="numerix_aws_architecture",
             direction="TB",
             graph_attr=graph_attr,
             show=False):

    # Users
    users = Users("Portfolio Managers")

    with Cluster("Frontend & CDN"):
        cloudfront = CloudFront("CloudFront CDN")
        react_app = Client("React Application")
        route53 = Route53("Route 53")

    with Cluster("Authentication & Security"):
        cognito = Cognito("Cognito User Pool")
        waf = WAF("WAF & Shield")
        iam = IAM("IAM Roles")

    with Cluster("API Layer"):
        api_gw = APIGateway("API Gateway REST")
        ws_api = APIGateway("WebSocket API")

    with Cluster("VPC - us-west-2"):

        with Cluster("Public Subnets (3 AZs)"):
            nat = NATGateway("NAT Gateway")

        with Cluster("Private Subnets (3 AZs)"):

            with Cluster("Lambda Functions"):
                with Cluster("API Handlers"):
                    strategy_lambda = Lambda("Strategy\nSubmission")
                    status_lambda = Lambda("Status\nPolling")
                    results_lambda = Lambda("Results\nRetrieval")

                with Cluster("Agent Orchestration"):
                    risk_agent = Lambda("Portfolio Risk\nManager Agent")
                    optimizer_agent = Lambda("Hyperparameter\nOptimizer Agent")
                    aggregator_agent = Lambda("Results\nAggregator")

                with Cluster("Utilities"):
                    ingestion_lambda = Lambda("Data\nIngestion")
                    cleanup_lambda = Lambda("Cleanup\nScheduler")

            with Cluster("SageMaker"):
                sm_processing = Sagemaker("Processing Jobs\n(Scenario Generation)")
                sm_training = Sagemaker("Training Jobs\n(Model Updates)")
                sm_pipeline = Sagemaker("ML Pipelines")
                sm_endpoint = SagemakerModel("Inference\nEndpoint")

    with Cluster("AI/ML Services"):
        bedrock = Sagemaker("AWS Bedrock\nClaude 3.5")
        with Cluster("Bedrock Agents"):
            strategy_agent = Lambda("Portfolio\nStrategy Agent")
            market_agent = Lambda("Market\nAnalysis Agent")
            risk_assessment = Lambda("Risk\nAssessment Agent")

    with Cluster("Data Storage Layer"):
        with Cluster("S3 Buckets"):
            market_data_s3 = S3("Market Data\n(Refinitiv)")
            results_s3 = S3("Optimization\nResults")
            artifacts_s3 = S3("Model\nArtifacts")

        with Cluster("DynamoDB Tables"):
            jobs_db = Dynamodb("Optimization\nJobs")
            strategy_db = Dynamodb("Strategy\nConfigurations")
            cache_db = Dynamodb("Results\nCache")

    with Cluster("Container Registry"):
        ecr = EC2ContainerRegistry("ECR\nNumerix SDK\nContainers")

    with Cluster("Event & Monitoring"):
        eventbridge = Eventbridge("EventBridge\nScheduler")
        cloudwatch = Cloudwatch("CloudWatch\nLogs & Metrics")
        param_store = SystemsManagerParameterStore("Parameter\nStore")
        sqs = SimpleQueueServiceSqs("SQS DLQ")
        alerts = Slack("Slack Alerts")

    # User flow
    users >> route53 >> cloudfront >> react_app
    react_app >> Edge(label="Auth") >> cognito
    react_app >> Edge(label="API Calls") >> waf >> api_gw
    react_app >> Edge(label="Real-time") >> ws_api

    # API Gateway to Lambda
    api_gw >> strategy_lambda
    api_gw >> status_lambda
    api_gw >> results_lambda
    ws_api >> status_lambda

    # Lambda orchestration
    strategy_lambda >> Edge(label="Submit Job") >> jobs_db
    strategy_lambda >> Edge(label="Invoke Agents") >> [risk_agent, optimizer_agent]

    # Agent interactions
    risk_agent >> Edge(label="Risk Analysis") >> bedrock
    optimizer_agent >> Edge(label="Hyperparameter\nOptimization") >> bedrock
    bedrock >> [strategy_agent, market_agent, risk_assessment]

    # Bedrock agents to data
    strategy_agent >> market_data_s3
    market_agent >> market_data_s3
    risk_assessment >> results_s3

    # SageMaker pipeline
    optimizer_agent >> sm_pipeline
    sm_pipeline >> sm_processing >> market_data_s3
    sm_processing >> sm_training >> ecr
    sm_training >> artifacts_s3
    sm_endpoint >> results_s3

    # Results aggregation
    sm_processing >> Edge(label="Results") >> aggregator_agent
    aggregator_agent >> results_s3
    aggregator_agent >> jobs_db

    # Results retrieval
    results_lambda >> results_s3
    results_lambda >> cache_db
    status_lambda >> jobs_db

    # Data ingestion
    market_data_s3 >> Edge(label="S3 Event") >> ingestion_lambda
    ingestion_lambda >> strategy_db

    # Scheduled cleanup
    eventbridge >> cleanup_lambda
    cleanup_lambda >> [jobs_db, results_s3]

    # Security & IAM
    iam >> [strategy_lambda, risk_agent, optimizer_agent, sm_processing]
    cognito >> iam

    # Monitoring
    [strategy_lambda, risk_agent, sm_processing] >> cloudwatch
    cloudwatch >> Edge(label="Alarms") >> alerts
    [strategy_lambda, optimizer_agent] >> Edge(label="Failed") >> sqs

    # Configuration
    [strategy_lambda, risk_agent, optimizer_agent] >> param_store

    # CloudFront to S3
    cloudfront >> results_s3

print("✅ Architecture diagram generated: numerix_aws_architecture.png")
