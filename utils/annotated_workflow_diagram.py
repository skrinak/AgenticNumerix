#!/usr/bin/env python3
"""
Annotated AWS Architecture Diagram with Workflow Steps
Combines numerix_aws_architecture.png with workflow narrative from NOTEBOOK_EXPLAINED.md
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda, EC2ContainerRegistry
from diagrams.aws.storage import S3
from diagrams.aws.database import Dynamodb
from diagrams.aws.network import APIGateway, CloudFront, VPC, NATGateway, Route53
from diagrams.aws.ml import Sagemaker, SagemakerModel
from diagrams.aws.security import Cognito, IAM, WAF
from diagrams.aws.integration import Eventbridge
from diagrams.aws.management import Cloudwatch, SystemsManagerParameterStore
from diagrams.aws.general import Users
from diagrams.onprem.client import Client
from diagrams.saas.chat import Slack

# Graph styling
graph_attr = {
    "fontsize": "24",
    "bgcolor": "white",
    "pad": "1.0",
    "label": "Numerix Dynamic Asset Allocation - Annotated Workflow",
    "labelloc": "t",
    "splines": "ortho",
    "nodesep": "1.5",
    "ranksep": "2.0"
}

with Diagram("Numerix_Workflow_Annotated",
             filename="Documents/numerix_workflow_annotated",
             direction="LR",
             graph_attr=graph_attr,
             show=False):

    # Users
    users = Users("Portfolio Managers")

    with Cluster("Frontend & CDN"):
        cloudfront = CloudFront("CloudFront CDN")
        react_app = Client("React Application\n━━ ⑩ ━━\nVisualization")
        route53 = Route53("Route 53")

    with Cluster("Authentication & Security"):
        cognito = Cognito("Cognito User Pool")
        waf = WAF("WAF & Shield")
        iam = IAM("IAM Roles")

    with Cluster("API Layer"):
        api_gw = APIGateway("API Gateway REST\n━━ ① ━━\nSubmit Request")
        ws_api = APIGateway("WebSocket API")

    with Cluster("VPC - us-west-2"):

        with Cluster("Public Subnets (3 AZs)"):
            nat = NATGateway("NAT Gateway")

        with Cluster("Private Subnets (3 AZs)"):

            with Cluster("Lambda Functions"):
                with Cluster("API Handlers"):
                    strategy_lambda = Lambda("Strategy\nSubmission")
                    status_lambda = Lambda("Status\nPolling")
                    results_lambda = Lambda("Results Retrieval\n━━ ⑨ ━━")

                with Cluster("Agent Orchestration"):
                    risk_agent = Lambda("Portfolio Risk\nManager Agent\n━━ ⑦ ━━")
                    optimizer_agent = Lambda("Hyperparameter\nOptimizer Agent\n━━ ⑤ ━━")
                    aggregator_agent = Lambda("Results\nAggregator\n━━ ⑧ ━━")

                with Cluster("Utilities"):
                    ingestion_lambda = Lambda("Data Ingestion\n━━ ② ━━")
                    cleanup_lambda = Lambda("Cleanup\nScheduler")

            with Cluster("SageMaker"):
                sm_processing = Sagemaker("Processing Jobs\nScenario Generation\n━━ ④ ━━")
                sm_training = Sagemaker("Training Jobs\nModel Updates")
                sm_pipeline = Sagemaker("ML Pipelines")
                sm_endpoint = SagemakerModel("Inference\nEndpoint")

    with Cluster("AI/ML Services"):
        bedrock = Sagemaker("AWS Bedrock\nClaude 3.5\n━━ ⑥ ━━\nOptimization")
        with Cluster("Bedrock Agents"):
            strategy_agent = Lambda("Portfolio\nStrategy Agent")
            market_agent = Lambda("Market\nAnalysis Agent")
            risk_assessment = Lambda("Risk\nAssessment Agent")

    with Cluster("Data Storage Layer"):
        with Cluster("S3 Buckets"):
            market_data_s3 = S3("Market Data\nRefinitiv\n━━ ② ━━\nInput")
            results_s3 = S3("Optimization\nResults\n━━ ⑧ ━━\nOutput")
            artifacts_s3 = S3("Model\nArtifacts")

        with Cluster("DynamoDB Tables"):
            jobs_db = Dynamodb("Optimization\nJobs\n━━ ③ ━━\nState")
            strategy_db = Dynamodb("Strategy\nConfigurations\n━━ ③ ━━")
            cache_db = Dynamodb("Results\nCache")

    with Cluster("Container Registry"):
        ecr = EC2ContainerRegistry("ECR\nNumerix SDK\nContainers")

    with Cluster("Event & Monitoring"):
        eventbridge = Eventbridge("EventBridge\nScheduler")
        cloudwatch = Cloudwatch("CloudWatch\nLogs & Metrics")
        param_store = SystemsManagerParameterStore("Parameter\nStore")
        alerts = Slack("Slack Alerts")

    # Workflow flow (horizontal, left to right)
    users >> route53 >> cloudfront >> react_app
    react_app >> cognito
    react_app >> waf >> api_gw
    react_app >> ws_api

    # API Gateway to Lambda
    api_gw >> strategy_lambda
    api_gw >> status_lambda
    api_gw >> results_lambda
    ws_api >> status_lambda

    # Lambda orchestration
    strategy_lambda >> jobs_db
    strategy_lambda >> [risk_agent, optimizer_agent]

    # Data ingestion
    market_data_s3 >> ingestion_lambda
    ingestion_lambda >> strategy_db

    # Agent interactions
    risk_agent >> bedrock
    optimizer_agent >> bedrock
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
    sm_processing >> aggregator_agent
    aggregator_agent >> results_s3
    aggregator_agent >> jobs_db

    # Results retrieval
    results_lambda >> results_s3
    results_lambda >> cache_db
    status_lambda >> jobs_db

    # Scheduled cleanup
    eventbridge >> cleanup_lambda
    cleanup_lambda >> [jobs_db, results_s3]

    # Security & IAM
    iam >> [strategy_lambda, risk_agent, optimizer_agent, sm_processing]
    cognito >> iam

    # Monitoring
    [strategy_lambda, risk_agent, sm_processing] >> cloudwatch
    cloudwatch >> alerts

    # Configuration
    [strategy_lambda, risk_agent, optimizer_agent] >> param_store

    # CloudFront to S3
    cloudfront >> results_s3

print("✅ Annotated workflow diagram generated: Documents/numerix_workflow_annotated.png")
print("\nWorkflow Step Reference:")
print("① User accesses platform via React frontend")
print("② Market data ingested from Refinitiv to S3")
print("③ Strategy configuration stored in DynamoDB")
print("④ SageMaker generates market scenarios using Numerix SDK")
print("⑤ AI agents explore hyperparameter space (100+ configurations)")
print("⑥ Each configuration evaluated across 5 market scenarios")
print("⑦ Risk assessment performed on portfolio strategies")
print("⑧ Bedrock synthesizes results and generates recommendations")
print("⑨ Results retrieved via API")
print("⑩ Interactive visualizations presented to portfolio managers")
