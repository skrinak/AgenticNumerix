# Dynamic Asset Allocation Platform

React-based web interface for AI-powered portfolio optimization using Numerix analytics and AWS Bedrock AgentCore.

## Features

- **Strategy Configuration**: Interactive UI for defining allocation strategies
- **Hyperparameter Optimization**: AI agents explore parameter space to find optimal configurations
- **Market Scenario Testing**: Test strategies across bull/bear/volatile market conditions
- **Real-time Monitoring**: Live progress tracking for optimization runs
- **Rich Visualizations**: Charts, graphs, and dashboards for performance analysis
- **Results Analysis**: Comprehensive reporting with Sharpe ratios, VaR, drawdowns, etc.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Charts**: Recharts
- **UI Components**: Headless UI + Framer Motion
- **API Client**: Axios

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Route pages
│   ├── Dashboard.tsx
│   ├── StrategyConfiguration.tsx
│   ├── OptimizationCenter.tsx
│   └── Results.tsx
├── store/              # Redux store
│   ├── index.ts
│   └── slices/
│       ├── strategySlice.ts
│       ├── optimizationSlice.ts
│       └── scenarioSlice.ts
├── services/           # API clients
│   └── api.ts
├── types/              # TypeScript types
│   └── index.ts
└── utils/              # Utility functions
```

## Development Status

### ✅ Completed
- React + TypeScript + Vite setup
- Tailwind CSS styling
- Redux Toolkit state management
- React Router navigation
- API client infrastructure
- Layout component with navigation
- Type definitions
- Environment configuration

### 🚧 In Progress
- Strategy configuration form
- Optimization control panel
- Visualization components

### 📋 Planned
- WebSocket integration for real-time updates
- Authentication (AWS Cognito)
- Results export (PDF/Excel)
- Historical run comparison

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Documentation

See parent directory for comprehensive documentation:
- `../TASKS_REACT_FRONTEND.md` - Complete implementation tasks
- `../NOTEBOOK_EXPLAINED.md` - Technical architecture
- `../Documents/Presentation/` - Executive presentations

## AWS Region

All infrastructure is deployed to **us-west-2 (Oregon)**.
