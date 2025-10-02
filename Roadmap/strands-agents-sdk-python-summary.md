# Strands Agents SDK for Python

## Overview
A lightweight and flexible Python library for building AI agents with a model-driven approach, enabling developers to create intelligent systems "in just a few lines of code."

## Key Features
- **Model agnostic**: Supports multiple AI providers (Bedrock, Anthropic, Gemini, OpenAI, etc.)
- **Native MCP support**: Works with Model Context Protocol servers
- **Decorator-based tool creation**: Easy integration of custom tools
- **Multi-agent capability**: Support for agent collaboration systems
- **Autonomous agent design**: Enables self-directed agent workflows
- **Streaming support**: Real-time interaction capabilities

## Core Components
- **Agent class**: Central mechanism for creating AI agents
- **Model providers**: Interfaces for different AI model services
- **Tool system**: Framework for creating and integrating custom and pre-built tools
- **MCP integration**: Access to extensive pre-built tools through MCP servers

## Technical Requirements
- Python 3.10+
- Customizable configuration for different use cases

## Installation
```python
pip install strands-agents strands-agents-tools
```

## Example Usage
```python
from strands import Agent
from strands_tools import calculator
agent = Agent(tools=[calculator])
agent("What is the square root of 1764")
```

## License
Apache-2.0