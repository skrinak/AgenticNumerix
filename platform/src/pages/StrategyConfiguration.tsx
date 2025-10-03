import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateStrategy, saveStrategy, resetStrategy } from '../store/slices/strategySlice';
import type { StrategyConfig } from '../types';

const StrategyConfiguration = () => {
  const dispatch = useDispatch();
  const strategy = useSelector((state: RootState) => state.strategy.currentStrategy);
  const savedStrategies = useSelector((state: RootState) => state.strategy.savedStrategies);

  const handleInputChange = (field: keyof StrategyConfig, value: any) => {
    dispatch(updateStrategy({ [field]: value }));
  };

  const handleSave = () => {
    dispatch(saveStrategy());
  };

  const handleReset = () => {
    dispatch(resetStrategy());
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Strategy Configuration</h2>
        <p className="text-gray-600">Configure your dynamic allocation strategy parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="strategy-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Strategy Name
                </label>
                <input
                  id="strategy-name"
                  type="text"
                  value={strategy.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter strategy name"
                />
              </div>
            </div>
          </div>

          {/* Risk Parameters */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Parameters</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="target-vol" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Volatility: {(strategy.targetVolatility * 100).toFixed(1)}%
                </label>
                <input
                  id="target-vol"
                  type="range"
                  min="0.05"
                  max="0.20"
                  step="0.01"
                  value={strategy.targetVolatility}
                  onChange={(e) => handleInputChange('targetVolatility', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>20%</span>
                </div>
              </div>

              <div>
                <label htmlFor="risk-aversion" className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Aversion: {strategy.riskAversion.toFixed(1)}
                </label>
                <input
                  id="risk-aversion"
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={strategy.riskAversion}
                  onChange={(e) => handleInputChange('riskAversion', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>5.0</span>
                </div>
              </div>

              <div>
                <label htmlFor="vol-lookback" className="block text-sm font-medium text-gray-700 mb-1">
                  Volatility Lookback: {strategy.volLookbackMonths} months
                </label>
                <input
                  id="vol-lookback"
                  type="range"
                  min="6"
                  max="24"
                  step="1"
                  value={strategy.volLookbackMonths}
                  onChange={(e) => handleInputChange('volLookbackMonths', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>6 months</span>
                  <span>24 months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Rules */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Allocation Rules</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="weight-function" className="block text-sm font-medium text-gray-700 mb-1">
                  Equity Weight Function
                </label>
                <select
                  id="weight-function"
                  value={strategy.equityWeightFunction}
                  onChange={(e) => handleInputChange('equityWeightFunction', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="inverse_vol">Inverse Volatility</option>
                  <option value="inverse_vol_squared">Inverse Volatility Squared</option>
                  <option value="linear_decay">Linear Decay</option>
                  <option value="sigmoid">Sigmoid</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {strategy.equityWeightFunction === 'inverse_vol' && 'Weight inversely proportional to volatility'}
                  {strategy.equityWeightFunction === 'inverse_vol_squared' && 'More aggressive reduction in high volatility'}
                  {strategy.equityWeightFunction === 'linear_decay' && 'Linear relationship with volatility'}
                  {strategy.equityWeightFunction === 'sigmoid' && 'Smooth transition with threshold behavior'}
                </p>
              </div>

              <div>
                <label htmlFor="rebalance-freq" className="block text-sm font-medium text-gray-700 mb-1">
                  Rebalancing Frequency
                </label>
                <select
                  id="rebalance-freq"
                  value={strategy.rebalancingFrequency}
                  onChange={(e) => handleInputChange('rebalancingFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="min-weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Equity Weight: {(strategy.equityWeightBounds.min * 100).toFixed(0)}%
                  </label>
                  <input
                    id="min-weight"
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.05"
                    value={strategy.equityWeightBounds.min}
                    onChange={(e) => handleInputChange('equityWeightBounds', {
                      ...strategy.equityWeightBounds,
                      min: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                <div>
                  <label htmlFor="max-weight" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Equity Weight: {(strategy.equityWeightBounds.max * 100).toFixed(0)}%
                  </label>
                  <input
                    id="max-weight"
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={strategy.equityWeightBounds.max}
                    onChange={(e) => handleInputChange('equityWeightBounds', {
                      ...strategy.equityWeightBounds,
                      max: parseFloat(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Costs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Costs</h3>
            <div>
              <label htmlFor="txn-cost" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Cost: {strategy.transactionCostBps} basis points
              </label>
              <input
                id="txn-cost"
                type="range"
                min="0"
                max="20"
                step="1"
                value={strategy.transactionCostBps}
                onChange={(e) => handleInputChange('transactionCostBps', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 bps</span>
                <span>20 bps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleSave}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Save Strategy
              </button>
              <button
                onClick={handleReset}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Target Vol:</dt>
                <dd className="font-medium text-gray-900">{(strategy.targetVolatility * 100).toFixed(1)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Weight Function:</dt>
                <dd className="font-medium text-gray-900 text-right text-xs">
                  {strategy.equityWeightFunction.replace(/_/g, ' ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Lookback:</dt>
                <dd className="font-medium text-gray-900">{strategy.volLookbackMonths}m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Rebalance:</dt>
                <dd className="font-medium text-gray-900">{strategy.rebalancingFrequency}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Risk Aversion:</dt>
                <dd className="font-medium text-gray-900">{strategy.riskAversion.toFixed(1)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Txn Cost:</dt>
                <dd className="font-medium text-gray-900">{strategy.transactionCostBps} bps</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Equity Range:</dt>
                <dd className="font-medium text-gray-900">
                  {(strategy.equityWeightBounds.min * 100).toFixed(0)}%-{(strategy.equityWeightBounds.max * 100).toFixed(0)}%
                </dd>
              </div>
            </dl>
          </div>

          {/* Saved Strategies */}
          {savedStrategies.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Strategies</h3>
              <div className="space-y-2">
                {savedStrategies.map((saved) => (
                  <div
                    key={saved.id}
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{saved.name}</p>
                    <p className="text-xs text-gray-500">
                      {(saved.targetVolatility * 100).toFixed(1)}% vol, {saved.rebalancingFrequency}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyConfiguration;
