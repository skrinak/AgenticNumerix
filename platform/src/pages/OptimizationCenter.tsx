import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import {
  startOptimization,
  updateProgress,
  completeOptimization,
  cancelOptimization,
} from '../store/slices/optimizationSlice';
import { toggleScenario } from '../store/slices/scenarioSlice';

const OptimizationCenter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentStrategy = useSelector((state: RootState) => state.strategy.currentStrategy);
  const { currentJob, jobHistory } = useSelector((state: RootState) => state.optimization);
  const { availableScenarios, selectedScenarios } = useSelector((state: RootState) => state.scenario);

  const [iterations, setIterations] = useState(100);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunchOptimization = async () => {
    setIsLaunching(true);

    // Simulate API call to launch optimization
    const jobId = `opt-${Date.now()}`;
    dispatch(startOptimization({
      jobId,
      strategyConfig: currentStrategy,
      marketScenarios: selectedScenarios,
      iterations,
    }));

    // Simulate progress updates
    setTimeout(() => {
      for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => {
          dispatch(updateProgress({ jobId, progress: i }));

          if (i === 100) {
            // Simulate completion with mock results
            dispatch(completeOptimization({
              jobId,
              results: {
                bestConfiguration: currentStrategy,
                bestMetrics: {
                  meanReturn: 0.087,
                  volatility: 0.095,
                  sharpeRatio: 0.92,
                  maxDrawdown: -0.18,
                  var95: -0.035,
                  cvar95: -0.048,
                  avgEquityWeight: 0.62,
                },
                convergencePath: Array.from({ length: iterations }, (_, i) => ({
                  iteration: i + 1,
                  sharpeRatio: 0.3 + (0.62 / iterations) * i + Math.random() * 0.1,
                  volatility: 0.15 - (0.055 / iterations) * i + Math.random() * 0.01,
                })),
                scenarioResults: selectedScenarios.map((scenario) => ({
                  scenario,
                  metrics: {
                    meanReturn: 0.06 + Math.random() * 0.04,
                    volatility: 0.08 + Math.random() * 0.04,
                    sharpeRatio: 0.6 + Math.random() * 0.4,
                    maxDrawdown: -0.1 - Math.random() * 0.15,
                    var95: -0.025 - Math.random() * 0.02,
                    cvar95: -0.035 - Math.random() * 0.025,
                    avgEquityWeight: 0.5 + Math.random() * 0.3,
                  },
                })),
              },
            }));
            setIsLaunching(false);
          }
        }, i * 200);
      }
    }, 500);
  };

  const handleCancelOptimization = () => {
    if (currentJob?.jobId) {
      dispatch(cancelOptimization(currentJob.jobId));
    }
  };

  const handleViewResults = (jobId: string) => {
    navigate(`/results/${jobId}`);
  };

  const canLaunch = selectedScenarios.length > 0 && !currentJob && currentStrategy.name.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Optimization Center</h2>
        <p className="text-gray-600">Launch and monitor hyperparameter optimization runs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Launch Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Launch Configuration</h3>

            {/* Strategy Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Strategy
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="font-medium text-gray-900">{currentStrategy.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                  <div>Target Vol: {(currentStrategy.targetVolatility * 100).toFixed(1)}%</div>
                  <div>Rebalance: {currentStrategy.rebalancingFrequency}</div>
                  <div>Weight Fn: {currentStrategy.equityWeightFunction.replace(/_/g, ' ')}</div>
                  <div>Lookback: {currentStrategy.volLookbackMonths}m</div>
                </div>
              </div>
            </div>

            {/* Scenario Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Scenarios ({selectedScenarios.length} selected)
              </label>
              <div className="space-y-2">
                {availableScenarios.map((scenario) => (
                  <label
                    key={scenario.name}
                    className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedScenarios.includes(scenario.name)}
                      onChange={() => dispatch(toggleScenario(scenario.name))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {scenario.name.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Equity drift: {(scenario.equityDrift * 100).toFixed(1)}%,
                        Vol: {(scenario.equityVol * 100).toFixed(1)}%
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Iterations */}
            <div className="mb-6">
              <label htmlFor="iterations" className="block text-sm font-medium text-gray-700 mb-2">
                Optimization Iterations: {iterations}
              </label>
              <input
                id="iterations"
                type="range"
                min="10"
                max="500"
                step="10"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value))}
                disabled={!!currentJob}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span>500</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total simulations: {iterations * selectedScenarios.length}
              </p>
            </div>

            {/* Launch Button */}
            <div className="flex gap-3">
              <button
                onClick={handleLaunchOptimization}
                disabled={!canLaunch || isLaunching}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLaunching ? 'Launching...' : 'Launch Optimization'}
              </button>
              {currentJob && currentJob.status === 'running' && (
                <button
                  onClick={handleCancelOptimization}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            {!canLaunch && !currentJob && (
              <p className="text-sm text-amber-600 mt-2">
                {selectedScenarios.length === 0 && 'Please select at least one market scenario.'}
                {currentStrategy.name.length === 0 && 'Please configure a strategy first.'}
              </p>
            )}
          </div>

          {/* Current Job Monitor */}
          {currentJob && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Optimization</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Job ID: {currentJob.jobId}</p>
                    <p className="text-xs text-gray-500">
                      {currentJob.iterations} iterations × {currentJob.marketScenarios.length} scenarios
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentJob.status === 'running'
                        ? 'bg-blue-100 text-blue-800'
                        : currentJob.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : currentJob.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {currentJob.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{currentJob.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentJob.progress}%` }}
                    />
                  </div>
                </div>

                {currentJob.status === 'completed' && (
                  <button
                    onClick={() => handleViewResults(currentJob.jobId)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    View Results
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Job History */}
          {jobHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
              <div className="space-y-2">
                {jobHistory.slice(0, 5).map((job) => (
                  <div
                    key={job.jobId}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{job.strategyConfig.name}</p>
                      <p className="text-xs text-gray-500">
                        {job.iterations} iterations × {job.marketScenarios.length} scenarios
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status}
                      </span>
                      {job.status === 'completed' && (
                        <button
                          onClick={() => handleViewResults(job.jobId)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel - Resource Monitor */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Estimate</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Total Simulations:</dt>
                <dd className="font-medium text-gray-900">
                  {(iterations * selectedScenarios.length).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Est. Runtime:</dt>
                <dd className="font-medium text-gray-900">
                  {Math.ceil((iterations * selectedScenarios.length) / 60)} min
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Est. Cost:</dt>
                <dd className="font-medium text-gray-900">
                  ${((iterations * selectedScenarios.length * 0.001) / 100).toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Optimization Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Start with 50-100 iterations</li>
              <li>• Test base case first</li>
              <li>• Use all scenarios for production</li>
              <li>• Review convergence plots</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationCenter;
