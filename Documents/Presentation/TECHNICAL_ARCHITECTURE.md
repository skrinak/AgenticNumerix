# Technical Architecture Diagram
## Dynamic Asset Allocation with Agentic AI

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐        ┌──────────────────┐      ┌─────────────────┐ │
│  │  Portfolio       │        │  Investment      │      │  Risk           │ │
│  │  Manager         │───────▶│  Committee       │◀─────│  Officer        │ │
│  │  (Web Interface) │        │  (Reports)       │      │  (Dashboards)   │ │
│  └──────────────────┘        └──────────────────┘      └─────────────────┘ │
│           │                           │                          │           │
└───────────┼───────────────────────────┼──────────────────────────┼───────────┘
            │                           │                          │
            ▼                           ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      CloudFront CDN                                    │  │
│  │         React Frontend + API Caching + WAF Protection                 │  │
│  └───────────────────────────────┬───────────────────────────────────────┘  │
│                                  │                                           │
│  ┌───────────────────────────────▼───────────────────────────────────────┐  │
│  │                    API Gateway (REST + WebSocket)                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │  │
│  │  │  /optimize   │  │  /status     │  │  /results    │  │  /market  │ │  │
│  │  │  POST        │  │  GET         │  │  GET         │  │  GET      │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘ │  │
│  └───────────────────────────────┬───────────────────────────────────────┘  │
│                                  │                                           │
│  ┌───────────────────────────────▼───────────────────────────────────────┐  │
│  │                      Amazon Cognito                                    │  │
│  │          Authentication + Authorization + MFA                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────── AWS Lambda Functions ───────────────────────┐  │
│  │                                                                         │  │
│  │  ┌──────────────────┐    ┌──────────────────┐   ┌──────────────────┐ │  │
│  │  │  API Handlers    │    │  Agent           │   │  Results         │ │  │
│  │  │                  │    │  Orchestration   │   │  Aggregation     │ │  │
│  │  │ • Submit Job     │    │                  │   │                  │ │  │
│  │  │ • Get Status     │    │ • Portfolio Mgr  │   │ • Collect Data   │ │  │
│  │  │ • Fetch Results  │    │ • FX Specialist  │   │ • Generate       │ │  │
│  │  │ • Market Data    │    │ • Rates Analyst  │   │   Summary        │ │  │
│  │  └──────────────────┘    │ • Credit Expert  │   │ • Create Charts  │ │  │
│  │          │               └──────────────────┘   └──────────────────┘ │  │
│  │          │                        │                       │            │  │
│  └──────────┼────────────────────────┼───────────────────────┼────────────┘  │
│             │                        │                       │               │
│             ▼                        ▼                       ▼               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     AWS Bedrock AgentCore                              │ │
│  │                                                                          │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐             │ │
│  │  │  Portfolio    │  │   Market      │  │    Risk       │             │ │
│  │  │  Strategy     │  │   Analysis    │  │  Assessment   │             │ │
│  │  │   Agent       │  │    Agent      │  │    Agent      │             │ │
│  │  └───────────────┘  └───────────────┘  └───────────────┘             │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────┐   │ │
│  │  │              Action Groups (Numerix Analytics)                  │   │ │
│  │  │  • calculate_portfolio_metrics()                                │   │ │
│  │  │  • evaluate_strategy_performance()                              │   │ │
│  │  │  • generate_risk_scenarios()                                    │   │ │
│  │  │  • optimize_allocation_weights()                                │   │ │
│  │  └────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────┐   │ │
│  │  │         Knowledge Bases (OpenSearch Serverless)                 │   │ │
│  │  │  • Financial market analysis corpus                             │   │ │
│  │  │  • Historical strategy performance data                         │   │ │
│  │  │  • Portfolio management best practices                          │   │ │
│  │  └────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                          │ │
│  │              Foundation Models: Claude 3.5 Sonnet/Haiku               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                  │                                           │
└──────────────────────────────────┼───────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPUTATION LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────── Amazon SageMaker ──────────────────────────┐   │
│  │                                                                       │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                  Processing Jobs (Distributed)                │   │   │
│  │  │                                                                │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │   │   │
│  │  │  │  Instance 1 │  │  Instance 2 │  │ Instance    │  ...      │   │   │
│  │  │  │             │  │             │  │  3-20       │           │   │   │
│  │  │  │ Numerix SDK │  │ Numerix SDK │  │ Numerix SDK │           │   │   │
│  │  │  │  Container  │  │  Container  │  │  Container  │           │   │   │
│  │  │  │             │  │             │  │             │           │   │   │
│  │  │  │ • Heston    │  │ • Scenario  │  │ • Risk      │           │   │   │
│  │  │  │   Model     │  │   Generation│  │   Metrics   │           │   │   │
│  │  │  │ • Monte     │  │ • Strategy  │  │ • Portfolio │           │   │   │
│  │  │  │   Carlo     │  │   Eval      │  │   Valuation │           │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘           │   │   │
│  │  │                                                                │   │   │
│  │  │          Instance Type: ml.c5.4xlarge (16 vCPU, 32GB)         │   │   │
│  │  │          Scaling: 1-20 instances (elastic auto-scaling)       │   │   │
│  │  │          Cost Optimization: Spot instances (70% savings)      │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                   SageMaker Pipelines                         │   │   │
│  │  │                                                                │   │   │
│  │  │  Step 1: Data Validation                                      │   │   │
│  │  │     ↓                                                          │   │   │
│  │  │  Step 2: Scenario Generation (1000 paths × 100 configs)       │   │   │
│  │  │     ↓                                                          │   │   │
│  │  │  Step 3: Distributed Optimization (parallel across instances) │   │   │
│  │  │     ↓                                                          │   │   │
│  │  │  Step 4: Results Aggregation                                  │   │   │
│  │  │     ↓                                                          │   │   │
│  │  │  Step 5: Agent Synthesis (Bedrock Claude)                     │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                  │                                          │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────── Amazon S3 ───────────────────────────┐   │
│  │                                                                       │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │   │
│  │  │  Market Data     │  │  Optimization    │  │  Model           │  │   │
│  │  │  Bucket          │  │  Results Bucket  │  │  Artifacts       │  │   │
│  │  │                  │  │                  │  │  Bucket          │  │   │
│  │  │ • Vol Surfaces   │  │ • Strategy       │  │ • Numerix SDK    │  │   │
│  │  │ • Yield Curves   │  │   Configs        │  │   Containers     │  │   │
│  │  │ • Equity Prices  │  │ • Performance    │  │ • Model Weights  │  │   │
│  │  │ • Historical     │  │   Metrics        │  │ • Configurations │  │   │
│  │  │   Data           │  │ • Visualizations │  │                  │  │   │
│  │  │                  │  │                  │  │                  │  │   │
│  │  │ Versioning: On   │  │ CloudFront: Yes  │  │ Replication: On  │  │   │
│  │  │ Encryption: KMS  │  │ Lifecycle: 90d   │  │ Encryption: KMS  │  │   │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────── DynamoDB ─────────────────────────────┐  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │  Optimization    │  │  Strategy        │  │  Results         │   │  │
│  │  │  Jobs Table      │  │  Config Table    │  │  Cache Table     │   │  │
│  │  │                  │  │                  │  │                  │   │  │
│  │  │ PK: job_id       │  │ PK: strategy_id  │  │ PK: result_id    │   │  │
│  │  │ SK: timestamp    │  │ SK: version      │  │ TTL: 7 days      │   │  │
│  │  │ GSI: user_id     │  │ Streams: On      │  │ Billing:         │   │  │
│  │  │ Auto-scale: On   │  │ Backup: PITR     │  │   On-demand      │   │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MONITORING & SECURITY LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         CloudWatch                                    │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │  Metrics     │  │  Logs        │  │  Alarms      │  │  Insights│ │  │
│  │  │              │  │              │  │              │  │          │ │  │
│  │  │ • Lambda     │  │ • Centralized│  │ • Error Rate │  │ • Log    │ │  │
│  │  │   Execution  │  │   Log Groups │  │   > 1%       │  │   Queries│ │  │
│  │  │ • SageMaker  │  │ • Structured │  │ • Cost       │  │ • Service│ │  │
│  │  │   Duration   │  │   Logging    │  │   Anomalies  │  │   Map    │ │  │
│  │  │ • API        │  │ • X-Ray      │  │ • Latency    │  │ • Trace  │ │  │
│  │  │   Latency    │  │   Traces     │  │   p99 > 500ms│  │   Search │ │  │
│  │  │ • Bedrock    │  │              │  │              │  │          │ │  │
│  │  │   Tokens     │  │              │  │              │  │          │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                            Security                                   │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │  WAF +       │  │  Secrets     │  │  CloudTrail  │  │  IAM     │ │  │
│  │  │  Shield      │  │  Manager     │  │              │  │  Roles   │ │  │
│  │  │              │  │              │  │              │  │          │ │  │
│  │  │ • DDoS       │  │ • Numerix    │  │ • API Calls  │  │ • Lambda │ │  │
│  │  │   Protection │  │   License    │  │   Logging    │  │   Exec   │ │  │
│  │  │ • Rate       │  │ • API Keys   │  │ • Compliance │  │ • S3     │ │  │
│  │  │   Limiting   │  │ • DB Creds   │  │   Auditing   │  │   Access │ │  │
│  │  │ • Geo        │  │ • Auto       │  │ • Governance │  │ • Bedrock│ │  │
│  │  │   Blocking   │  │   Rotation   │  │              │  │   Invoke │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL INTEGRATIONS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │  Refinitiv       │    │  Portfolio       │    │  Notification    │      │
│  │  Workspace       │    │  Management      │    │  Systems         │      │
│  │                  │    │  Systems         │    │                  │      │
│  │ • Vol Surfaces   │    │                  │    │ • Email (SES)    │      │
│  │ • Yield Curves   │───▶│ • Current        │◀───│ • Slack          │      │
│  │ • Market Data    │    │   Holdings       │    │ • Teams          │      │
│  │ • Historical     │    │ • Constraints    │    │ • SMS (SNS)      │      │
│  │   Prices         │    │ • Objectives     │    │                  │      │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘      │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

### Optimization Workflow

```
User Submits Strategy → API Gateway → Lambda (Validate) → DynamoDB (Store Job)
                                                                    │
                                                                    ▼
                                                    SageMaker Pipeline Triggered
                                                                    │
        ┌───────────────────────────────────────────────────────────┘
        │
        ├─▶ Step 1: Fetch Market Data (S3) → Validate Quality
        │
        ├─▶ Step 2: Generate Scenarios → Distribute to Instances
        │
        ├─▶ Step 3: Parallel Optimization (Numerix SDK × 20 instances)
        │       └─▶ Each evaluates 5 strategies × 5 market scenarios
        │
        ├─▶ Step 4: Aggregate Results → Store in S3 + DynamoDB
        │
        └─▶ Step 5: Bedrock Agent Synthesis
                └─▶ Claude analyzes results → Generate recommendations
                        │
                        ▼
                Lambda (Package Results) → API Gateway → CloudFront → User
```

---

## Key Architectural Decisions

### 1. Serverless-First Approach
- **Lambda for API/orchestration**: Sub-second response, elastic scaling
- **SageMaker Processing**: Batch workloads with GPU/CPU flexibility
- **No EC2 instances**: Zero operational overhead, pay-per-use

### 2. Multi-Layer Intelligence
- **Layer 1 (Numerix)**: Financial rigor and regulatory compliance
- **Layer 2 (Agents)**: Systematic hyperparameter exploration
- **Layer 3 (Claude)**: Business-context synthesis and recommendations

### 3. Cost Optimization
- **Spot instances**: 70% savings on SageMaker compute
- **S3 Intelligent-Tiering**: Automatic cost optimization
- **DynamoDB on-demand**: Pay only for actual usage
- **CloudFront caching**: Reduce API calls

### 4. Security by Design
- **Encryption everywhere**: S3 (KMS), DynamoDB (at rest), TLS (in transit)
- **IAM least-privilege**: Service-specific roles with minimal permissions
- **WAF + Shield**: DDoS protection and rate limiting
- **Audit trail**: CloudTrail logs all API calls

---

## Scalability Characteristics

| Component | Current Capacity | Max Capacity | Scaling Method |
|-----------|-----------------|--------------|----------------|
| API Gateway | 10K req/sec | Unlimited | Auto |
| Lambda Functions | 1K concurrent | 10K+ | Auto |
| SageMaker Instances | 5 instances | 20+ instances | Manual/Auto |
| S3 Storage | Unlimited | Unlimited | N/A |
| DynamoDB | 1K RCU/WCU | 40K RCU/WCU | Auto-scaling |
| Bedrock API | 100 req/min | 1K req/min | Quota increase |

**Bottleneck**: SageMaker instance limits (addressable via quota increase)

---

## Disaster Recovery

**RTO (Recovery Time Objective)**: 1 hour
**RPO (Recovery Point Objective)**: 5 minutes

### Multi-Region Strategy
- **Primary Region**: us-west-2 (Oregon)
- **DR Region**: us-east-1 (N. Virginia)
- **Replication**: S3 cross-region, DynamoDB global tables
- **Failover**: Route 53 health checks with automatic DNS failover

---

## Cost Model

**Baseline (100 optimizations/day)**:
- Lambda: $200/month
- SageMaker: $1,500/month (spot instances)
- S3: $100/month
- DynamoDB: $50/month
- Bedrock: $300/month
- Data Transfer: $50/month
- **Total: ~$2,200/month**

**Per Optimization**: ~$7 (vs. $5,000+ manual analyst time)

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + TypeScript | User interface |
| API | AWS API Gateway | REST/WebSocket endpoints |
| Auth | Amazon Cognito | User authentication |
| Compute | AWS Lambda | Serverless functions |
| AI/ML | AWS Bedrock AgentCore | Agent orchestration |
| Models | Claude 3.5 Sonnet/Haiku | Natural language reasoning |
| Batch | Amazon SageMaker | Distributed optimization |
| Analytics | Numerix CrossAsset SDK | Financial modeling |
| Storage | Amazon S3 | Object storage |
| Database | Amazon DynamoDB | NoSQL data store |
| CDN | Amazon CloudFront | Content delivery |
| Monitoring | CloudWatch + X-Ray | Observability |
| Security | WAF + Shield + Secrets Manager | Protection |
| IaC | Terraform | Infrastructure as code |
