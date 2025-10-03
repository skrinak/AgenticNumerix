import { createSlice } from '@reduxjs/toolkit';
import { MarketScenario } from '../../types';

interface ScenarioState {
  availableScenarios: MarketScenario[];
  selectedScenarios: string[];
}

const initialState: ScenarioState = {
  availableScenarios: [
    {
      name: 'base_case',
      equityDrift: 0.08,
      equityVol: 0.18,
      riskFreeRate: 0.03,
      correlationEquityRates: -0.3,
    },
    {
      name: 'bull_market',
      equityDrift: 0.15,
      equityVol: 0.12,
      riskFreeRate: 0.02,
      correlationEquityRates: 0.0,
    },
    {
      name: 'bear_market',
      equityDrift: -0.05,
      equityVol: 0.35,
      riskFreeRate: 0.01,
      correlationEquityRates: -0.6,
    },
    {
      name: 'high_volatility',
      equityDrift: 0.05,
      equityVol: 0.40,
      riskFreeRate: 0.04,
      correlationEquityRates: -0.5,
    },
    {
      name: 'low_volatility',
      equityDrift: 0.07,
      equityVol: 0.08,
      riskFreeRate: 0.03,
      correlationEquityRates: 0.1,
    },
  ],
  selectedScenarios: ['base_case', 'bull_market', 'bear_market', 'high_volatility', 'low_volatility'],
};

const scenarioSlice = createSlice({
  name: 'scenario',
  initialState,
  reducers: {
    toggleScenario: (state, action) => {
      const index = state.selectedScenarios.indexOf(action.payload);
      if (index > -1) {
        state.selectedScenarios.splice(index, 1);
      } else {
        state.selectedScenarios.push(action.payload);
      }
    },
    selectAllScenarios: (state) => {
      state.selectedScenarios = state.availableScenarios.map((s) => s.name);
    },
    deselectAllScenarios: (state) => {
      state.selectedScenarios = [];
    },
    addCustomScenario: (state, action) => {
      state.availableScenarios.push(action.payload);
      state.selectedScenarios.push(action.payload.name);
    },
  },
});

export const { toggleScenario, selectAllScenarios, deselectAllScenarios, addCustomScenario } =
  scenarioSlice.actions;

export default scenarioSlice.reducer;
