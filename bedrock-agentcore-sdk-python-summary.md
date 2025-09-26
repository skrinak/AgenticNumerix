# AWS Bedrock AgentCore SDK for Python

## Overview
The Bedrock AgentCore SDK is a Python library that enables developers to deploy local AI agents to a production-ready, enterprise-grade platform with minimal infrastructure management.

## Key Features
- **Framework-agnostic**: Works with various AI agent frameworks like Strands, LangGraph, CrewAI, and Autogen
- **Zero infrastructure management**: Simplified deployment process
- **Enterprise-grade platform** with built-in:
  - Authentication
  - Memory persistence
  - Observability
  - Security

## Core Services
- **Runtime**: Secure, session-isolated compute
- **Memory**: Persistent knowledge across sessions
- **Gateway**: Transform APIs into tools
- **Code Interpreter**: Secure sandboxed execution
- **Browser**: Cloud-based web automation
- **Observability**: OpenTelemetry tracing

## Implementation
Developers can transform their existing agent logic into a production environment with minimal code changes by:
1. Wrapping existing agent logic with `BedrockAgentCoreApp`
2. Using the `@app.entrypoint` decorator to mark entry points

## Example Usage
```python
from bedrock_agentcore import BedrockAgentCoreApp
app = BedrockAgentCoreApp()

@app.entrypoint
def production_agent(request):
    return my_local_agent(request.get("prompt"))

app.run()  # Ready to run on Bedrock AgentCore
```

## Status
Currently in public preview, with potential API changes.

## License
Apache 2.0