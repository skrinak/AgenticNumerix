#!/usr/bin/env python3
"""
High-Level Agent Architecture Diagram
Emphasizes the role of Strands Agents and AWS Bedrock AgentCore in the platform
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.custom import Custom
from diagrams.aws.compute import Lambda
from diagrams.aws.ml import Sagemaker
from diagrams.aws.database import Dynamodb
from diagrams.aws.storage import S3
from diagrams.aws.network import APIGateway, CloudFront
from diagrams.aws.security import Cognito
from diagrams.onprem.client import Users

# Custom node colors
NUMERIX_COLOR = "#1E3A8A"  # Deep blue
STRANDS_COLOR = "#10B981"  # Green
BEDROCK_COLOR = "#F59E0B"  # Amber
AWS_COLOR = "#FF9900"  # AWS orange

graph_attr = {
    "fontsize": "20",
    "bgcolor": "white",
    "pad": "0.5",
    "nodesep": "0.8",
    "ranksep": "1.2"
}

node_attr = {
    "fontsize": "11",
    "height": "0.8",
    "width": "2.5"
}

edge_attr = {
    "fontsize": "10"
}

with Diagram("Agentic AI Architecture - Strands + AgentCore + Numerix",
             filename="Documents/agentic_architecture_highlevel",
             outformat="png",
             show=False,
             direction="TB",
             graph_attr=graph_attr,
             node_attr=node_attr,
             edge_attr=edge_attr):

    # Users
    users = Users("Portfolio\nManagers")

    # Frontend
    with Cluster("Presentation Layer", graph_attr={"bgcolor": "#F3F4F6"}):
        cloudfront = CloudFront("CloudFront CDN\n(React App)")
        api = APIGateway("API Gateway\n(REST + WebSocket)")
        auth = Cognito("Cognito\n(MFA Auth)")

    # Agent Orchestration Layer
    with Cluster("STRANDS AGENTS\nMulti-Agent Orchestration", graph_attr={"bgcolor": "#D1FAE5", "style": "bold"}):
        with Cluster("Agent Team", graph_attr={"bgcolor": "#A7F3D0"}):
            portfolio_agent = Lambda("Portfolio Risk\nManager Agent\n(Eleanor Richards)")
            fx_agent = Lambda("FX Hedging\nSpecialist Agent\n(Rajiv Mehta)")
            ir_agent = Lambda("Interest Rate\nStrategist Agent\n(Sophie Larsen)")
            credit_agent = Lambda("Credit Exposure\nAnalyst Agent\n(Marcus Chen)")

    # Bedrock AgentCore Layer
    with Cluster("AWS BEDROCK AGENTCORE\nAI Decision Intelligence", graph_attr={"bgcolor": "#FEF3C7", "style": "bold"}):
        with Cluster("Foundation Models", graph_attr={"bgcolor": "#FDE68A"}):
            claude = Lambda("Claude 3.5 Sonnet\n(Strategy Analysis)")

        with Cluster("Action Groups", graph_attr={"bgcolor": "#FDE68A"}):
            action_numerix = Lambda("Numerix Analytics\nAction Group")
            action_market = Lambda("Market Data\nAction Group")
            action_risk = Lambda("Risk Metrics\nAction Group")

    # Numerix Analytics Layer
    with Cluster("NUMERIX SDK\nInstitutional Analytics", graph_attr={"bgcolor": "#DBEAFE", "style": "bold"}):
        with Cluster("Numerix Engines", graph_attr={"bgcolor": "#BFDBFE"}):
            crossasset = Lambda("CrossAsset\n(Multi-Asset Pricing)")
            esg = Lambda("Economic Scenario\nGenerator")
            xva = Lambda("XVA Engine\n(CVA/FVA/KVA)")

    # AWS Compute & Storage
    with Cluster("AWS Infrastructure", graph_attr={"bgcolor": "#FEE2E2"}):
        sagemaker = Sagemaker("SageMaker\n(Distributed Optimization)")
        s3 = S3("S3\n(Data Lake)")
        dynamo = Dynamodb("DynamoDB\n(State Store)")

    # Flow definitions with detailed labels
    users >> Edge(label="Submit Strategy", color="black", style="bold") >> cloudfront
    cloudfront >> Edge(label="Authenticate", color="blue") >> auth
    cloudfront >> Edge(label="API Requests", color="blue") >> api

    # API to Strands Agents
    api >> Edge(label="Invoke Agent Team", color="green", style="bold", penwidth="2.5") >> portfolio_agent

    # Agent Team Collaboration
    portfolio_agent >> Edge(label="Delegate FX Analysis", color="green") >> fx_agent
    portfolio_agent >> Edge(label="Delegate IR Analysis", color="green") >> ir_agent
    portfolio_agent >> Edge(label="Delegate Credit Analysis", color="green") >> credit_agent

    # Strands Agents to Bedrock AgentCore
    portfolio_agent >> Edge(label="Strategy Reasoning", color="orange", style="bold", penwidth="2.5") >> claude
    fx_agent >> Edge(label="FX Strategy AI", color="orange") >> claude
    ir_agent >> Edge(label="IR Strategy AI", color="orange") >> claude
    credit_agent >> Edge(label="Credit Strategy AI", color="orange") >> claude

    # Bedrock AgentCore to Action Groups
    claude >> Edge(label="Execute Actions", color="orange") >> action_numerix
    claude >> Edge(label="Fetch Market Data", color="orange") >> action_market
    claude >> Edge(label="Calculate Risk", color="orange") >> action_risk

    # Action Groups to Numerix
    action_numerix >> Edge(label="Price Derivatives", color="darkblue", style="bold", penwidth="2.5") >> crossasset
    action_numerix >> Edge(label="Generate Scenarios", color="darkblue", style="bold", penwidth="2.5") >> esg
    action_numerix >> Edge(label="Calculate XVA", color="darkblue", style="bold", penwidth="2.5") >> xva

    # Numerix to SageMaker for distributed compute
    crossasset >> Edge(label="Parallel Evaluation", color="purple") >> sagemaker
    esg >> Edge(label="Scenario Distribution", color="purple") >> sagemaker

    # Data persistence
    sagemaker >> Edge(label="Store Results", color="gray") >> s3
    portfolio_agent >> Edge(label="Track State", color="gray") >> dynamo
    claude >> Edge(label="Store Analysis", color="gray") >> s3

    # Results back to user
    s3 >> Edge(label="Retrieve Results", color="blue") >> api
    api >> Edge(label="Real-time Updates", color="blue") >> cloudfront
    cloudfront >> Edge(label="Visualizations", color="black", style="bold") >> users

print("✅ High-level agent architecture diagram generated: Documents/agentic_architecture_highlevel.png")
print("\nKey Components:")
print("  🟢 STRANDS AGENTS - Multi-agent orchestration with specialized personas")
print("  🟡 AWS BEDROCK AGENTCORE - AI decision intelligence with Claude 3.5")
print("  🔵 NUMERIX SDK - Institutional-grade financial analytics")
print("  🔴 AWS INFRASTRUCTURE - Scalable cloud compute and storage")
