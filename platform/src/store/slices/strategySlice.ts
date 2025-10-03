import { createSlice } from '@reduxjs/toolkit';
import { StrategyConfig } from '../../types';

interface StrategyState {
  currentStrategy: StrategyConfig;
  savedStrategies: StrategyConfig[];
}

const initialStrategy: StrategyConfig = {
  name: 'New Strategy',
  targetVolatility: 0.10,
  equityWeightFunction: 'inverse_vol',
  volLookbackMonths: 12,
  rebalancingFrequency: 'monthly',
  riskAversion: 2.0,
  transactionCostBps: 5,
  equityWeightBounds: {
    min: 0.0,
    max: 1.0,
  },
};

const initialState: StrategyState = {
  currentStrategy: initialStrategy,
  savedStrategies: [],
};

const strategySlice = createSlice({
  name: 'strategy',
  initialState,
  reducers: {
    updateStrategy: (state, action) => {
      state.currentStrategy = { ...state.currentStrategy, ...action.payload };
    },
    saveStrategy: (state) => {
      const strategyWithId = {
        ...state.currentStrategy,
        id: `strategy_${Date.now()}`,
      };
      state.savedStrategies.push(strategyWithId);
    },
    loadStrategy: (state, action) => {
      const strategy = state.savedStrategies.find((s) => s.id === action.payload);
      if (strategy) {
        state.currentStrategy = strategy;
      }
    },
    deleteStrategy: (state, action) => {
      state.savedStrategies = state.savedStrategies.filter((s) => s.id !== action.payload);
    },
    resetStrategy: (state) => {
      state.currentStrategy = initialStrategy;
    },
  },
});

export const { updateStrategy, saveStrategy, loadStrategy, deleteStrategy, resetStrategy } =
  strategySlice.actions;

export default strategySlice.reducer;
