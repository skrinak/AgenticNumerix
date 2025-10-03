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
