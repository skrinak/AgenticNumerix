// Strategy Configuration Types
export interface StrategyConfig {
  id?: string;
  name: string;
  targetVolatility: number;
  equityWeightFunction: 'inverse_vol' | 'inverse_vol_squared' | 'linear_decay' | 'sigmoid';
  volLookbackMonths: number;
  rebalancingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  riskAversion: number;
  transactionCostBps: number;
  equityWeightBounds: {
    min: number;
    max: number;
  };
}

// Market Scenario Types
export interface MarketScenario {
  name: string;
  equityDrift: number;
  equityVol: number;
  riskFreeRate: number;
  correlationEquityRates: number;
}

// Optimization Job Types
export interface OptimizationJob {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  strategyConfig: StrategyConfig;
  marketScenarios: string[];
  iterations: number;
  progress: number;
  startTime: string;
  endTime?: string;
  results?: OptimizationResults;
}

// Performance Metrics Types
export interface PerformanceMetrics {
  meanReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  finalValueMean: number;
  finalValueStd: number;
  var95: number;
  cvar95: number;
  avgEquityWeight: number;
  equityWeightVolatility: number;
}

// Strategy Evaluation Types
export interface StrategyEvaluation {
  configId: string;
  marketScenario: string;
  metrics: PerformanceMetrics;
  config: StrategyConfig;
}

// Optimization Results Types
export interface OptimizationResults {
  jobId: string;
  bestConfig: StrategyConfig & { metrics: PerformanceMetrics };
  allEvaluations: StrategyEvaluation[];
  summary: {
    totalStrategiesTested: number;
    bestSharpeRatio: number;
    convergenceIterations: number;
    executionTimeSeconds: number;
  };
}

// Chart Data Types
export interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  [key: string]: any;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User Session Types
export interface UserSession {
  userId: string;
  email: string;
  role: 'portfolio_manager' | 'analyst' | 'admin';
  preferences: {
    defaultScenarios: string[];
    chartColorScheme: string;
  };
}
