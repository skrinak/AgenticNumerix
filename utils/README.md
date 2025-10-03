# Utils Directory

Utility scripts, automation tools, and helper scripts for the Numerix Dynamic Asset Allocation Platform.

## Scripts

### `architecture_diagram.py`
Generates AWS architecture diagram using Python diagrams framework.

**Usage:**
```bash
python3 utils/architecture_diagram.py
```

**Output:** `numerix_aws_architecture.png` - Visual representation of the entire AWS infrastructure

**Dependencies:**
```bash
pip install diagrams
```

### `soc2_compliance_checker.py`
Validates AWS account meets SOC2 Type II compliance requirements before deployment.

**Usage:**
```bash
python3 utils/soc2_compliance_checker.py --profile <aws-profile> --account <account-id>
```

**Checks Performed:**
- CloudTrail enabled with log file validation
- AWS Config recording all resources
- GuardDuty threat detection enabled
- Security Hub with CIS benchmark
- IAM password policy (14+ chars, complexity, 90-day rotation)
- Root account MFA enabled
- S3 Block Public Access enabled
- EBS default encryption enabled
- KMS key rotation enabled
- CloudWatch Logs 7-year retention

**Output:**
- Console report with ✅/❌ status
- `soc2_compliance_report.json` - Detailed findings

**Dependencies:**
```bash
pip install boto3
```

**Exit Codes:**
- `0` - All checks passed
- `1` - One or more checks failed

## Adding New Scripts

Place all utility scripts in this directory following these guidelines:

1. **Naming**: Use descriptive snake_case names (e.g., `generate_mock_data.py`)
2. **Documentation**: Include docstrings and usage instructions
3. **Dependencies**: Document required packages in this README
4. **Execution**: Make scripts executable with shebang (`#!/usr/bin/env python3`)

## Planned Utilities

- `generate_mock_data.py` - Generate synthetic market data for testing
- `deploy_infrastructure.sh` - Automated AWS deployment script
- `run_optimization_test.py` - End-to-end optimization testing
- `export_results.py` - Convert optimization results to various formats
- `validate_config.py` - Validate strategy configurations
