# Dynamic Asset Allocation Platform - Architecture Workflow

## End-to-End System Flow

### 1. User Authentication & Access

Portfolio managers begin their journey by accessing the platform through a secure, globally distributed network. When a user navigates to the application URL, their request flows through **Route 53** for DNS resolution, directing them to the nearest **CloudFront** edge location. This CDN serves the **React Application** with ultra-low latency, caching static assets worldwide.

Before accessing any functionality, users authenticate through **Amazon Cognito**, which manages the entire identity lifecycle—from sign-up and MFA challenges to JWT token issuance. Every API request subsequently carries these authentication tokens, verified by **AWS WAF** before reaching the backend. The WAF acts as the first line of defense, filtering malicious traffic, enforcing rate limits, and protecting against common web exploits.

### 2. Strategy Configuration & Submission

Once authenticated, portfolio managers use the React frontend to configure their dynamic allocation strategies. They adjust target volatility levels, select equity weight functions (inverse volatility, sigmoid, etc.), configure lookback windows, and define risk aversion parameters. These configurations are stored temporarily in the browser's Redux state.

When the user clicks "Launch Optimization," the frontend dispatches an API call through **API Gateway REST**. The gateway validates the request schema, applies usage plan limits, and routes it to the **Strategy Submission Lambda** function. This Lambda performs several critical tasks:

1. Validates strategy parameters against business rules
2. Writes the job metadata to the **Optimization Jobs DynamoDB table** with status "pending"
3. Retrieves AWS credentials from **Parameter Store** for downstream service invocations
4. Orchestrates the multi-agent optimization workflow by invoking specialized Lambda functions

### 3. AI Agent Orchestration

The Strategy Submission Lambda triggers a cascade of AI-powered agents working in parallel:

#### Portfolio Risk Manager Agent
This containerized Lambda (running the Numerix SDK) receives the strategy configuration and immediately performs risk analysis. It:
- Loads market data from the **Market Data S3 bucket** (Refinitiv feeds)
- Invokes **AWS Bedrock** with Claude 3.5 to analyze risk characteristics
- Interacts with the **Risk Assessment Agent** (a Bedrock Agent) to evaluate VaR, CVaR, and drawdown metrics
- Stores preliminary risk assessments back to S3

#### Hyperparameter Optimizer Agent
Simultaneously, this agent coordinates the exploration of the hyperparameter space:
- Invokes the **Portfolio Strategy Agent** on Bedrock to generate candidate configurations
- Calls the **Market Analysis Agent** to evaluate each configuration across multiple market scenarios
- Submits batch processing jobs to **SageMaker** for Monte Carlo simulations
- Each SageMaker job runs the Numerix SDK from **ECR containers**, executing thousands of path simulations

### 4. Distributed Computation with SageMaker

The **SageMaker ML Pipeline** orchestrates a complex multi-step workflow:

1. **Data Validation Step**: Ensures market data integrity and completeness
2. **Scenario Generation Step**: The **SageMaker Processing Job** creates shocked market scenarios (bull, bear, high volatility, low volatility, base case)
3. **Distributed Optimization Step**: Spins up a fleet of `ml.c5.4xlarge` instances (up to 20) running in parallel, each testing different hyperparameter combinations
4. **Training Step** (optional): Updates the optimization model based on results, storing artifacts in the **Model Artifacts S3 bucket**
5. **Results Aggregation Step**: The **Results Aggregator Lambda** collects outputs from all distributed nodes

Throughout this process, SageMaker jobs write intermediate results to the **Optimization Results S3 bucket**, enabling fault tolerance through checkpointing. The **SageMaker Endpoint** provides real-time inference for quick strategy evaluations without launching full processing jobs.

### 5. Real-Time Status Updates

While optimization runs in the background, users receive live updates through two mechanisms:

**WebSocket Connection**: The **WebSocket API** maintains a persistent connection to the **Status Polling Lambda**, which queries the **Optimization Jobs DynamoDB table** every few seconds. As the Aggregator Lambda updates job progress, these changes stream instantly to the frontend, updating the progress bar and convergence charts in real-time.

**Long Polling Fallback**: If WebSocket connections fail, the frontend falls back to HTTP long-polling through the standard REST API, ensuring users always see progress updates.

### 6. Results Synthesis & Storage

As optimization iterations complete, the Results Aggregator Lambda performs sophisticated post-processing:

1. Compiles all strategy evaluations from SageMaker jobs
2. Identifies the optimal configuration based on Sharpe ratio
3. Calculates aggregate statistics across market scenarios
4. Invokes Bedrock agents one final time to generate natural language explanations of why certain parameters performed better
5. Stores the complete results package (JSON + metadata) in **S3**
6. Caches frequently accessed results in the **Results Cache DynamoDB table** with TTL for auto-expiration
7. Updates the job status to "completed" in the **Optimization Jobs table**

### 7. Results Retrieval & Visualization

When users navigate to the Results page, the **Results Retrieval Lambda** springs into action:

1. Checks the **Results Cache DynamoDB** for a hit
2. If cache miss, streams the full results from **S3** using efficient pagination
3. Transforms raw data into chart-friendly formats for the frontend
4. Returns convergence paths, scatter plot data, and performance metrics

The React frontend receives this data and renders:
- **Convergence Line Charts**: Showing Sharpe ratio improvement over iterations
- **Risk-Return Scatter Plots**: All tested strategies colored by scenario
- **Scenario Performance Bar Charts**: Comparing results across market conditions
- **Configuration Summary Panels**: Optimal parameter settings with explanations

### 8. Data Lifecycle & Maintenance

Running continuously in the background, the **Cleanup Lambda** executes daily via **EventBridge Scheduler**:
- Archives optimization jobs older than 30 days
- Moves cold results to S3 Glacier for cost savings
- Removes expired entries from the Results Cache
- Publishes metrics to **CloudWatch** for capacity planning

The **Data Ingestion Lambda** monitors the Market Data S3 bucket for new files. When Refinitiv feeds arrive:
1. S3 Event Notification triggers the Lambda
2. Data validation and transformation occur
3. The **Strategy Configurations DynamoDB table** updates with new market regime indicators
4. Downstream agents receive notifications of fresh data availability

### 9. Continuous Monitoring & Alerting

Every component instruments itself with **CloudWatch Logs** and **Metrics**:

- Lambda functions emit custom metrics (strategies tested, Sharpe ratios achieved)
- SageMaker jobs log detailed execution traces
- API Gateway tracks latency, error rates, and throttling events
- Bedrock usage metrics monitor token consumption and costs

**CloudWatch Alarms** watch for anomalies:
- Lambda error rate exceeding 1%
- SageMaker job failures
- API Gateway 5xx errors
- Unexpected cost spikes

When alarms trigger, notifications flow to **Slack** via SNS integration, alerting the operations team immediately. Failed Lambda invocations land in **SQS Dead Letter Queues** for post-mortem analysis.

### 10. Security & Compliance Throughout

At every layer, **IAM Roles** enforce least-privilege access:
- Lambda execution roles grant only necessary S3/DynamoDB permissions
- SageMaker roles restrict ECR image access
- Bedrock agent roles limit model invocations
- Cross-service trust relationships follow zero-trust principles

All data flows through the **VPC** in us-west-2, with private subnets isolating compute resources from the internet. **NAT Gateways** enable outbound internet access for Lambda functions needing external APIs, while VPC Endpoints provide private connectivity to AWS services, bypassing the internet entirely.

S3 buckets enforce **encryption at rest** with KMS keys, and all inter-service communication uses **TLS 1.2+** for encryption in transit. DynamoDB tables enable **point-in-time recovery** for disaster resilience, with automated backups retained for 35 days.

### 11. The Complete Feedback Loop

The platform creates a virtuous cycle:

1. Portfolio managers submit strategies →
2. AI agents explore configurations →
3. SageMaker distributes computation →
4. Results inform better strategies →
5. Updated models improve future optimizations →
6. Metrics drive infrastructure scaling decisions

This workflow transforms a traditionally manual, days-long process into an automated, hours-long exploration of the strategy space—enabling portfolio managers to test hundreds of configurations across multiple market scenarios, finding optimal allocations that would be impossible to discover through human intuition alone.

The architecture scales elastically: SageMaker spins up processing nodes on demand, Lambda functions scale to thousands of concurrent executions, and DynamoDB auto-scales to handle traffic spikes. During market volatility events, when every portfolio manager simultaneously launches optimizations, the system gracefully handles 10x load without manual intervention.

From authentication to results visualization, from distributed compute to real-time updates, from security to observability—every component works in concert to deliver a seamless, production-grade dynamic asset allocation platform powered by AI agents and AWS serverless infrastructure.
