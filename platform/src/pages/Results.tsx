import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Results = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const job = useSelector((state: RootState) => {
    if (state.optimization.currentJob?.jobId === jobId) {
      return state.optimization.currentJob;
    }
    return state.optimization.jobHistory.find((j) => j.jobId === jobId);
  });

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">Could not find optimization job with ID: {jobId}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (job.status !== 'completed' || !job.results) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Optimization In Progress</h2>
          <p className="text-gray-600 mb-6">This optimization is still running or has not completed successfully.</p>
          <div className="w-64 mx-auto mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{job.progress}% complete</p>
          </div>
          <button
            onClick={() => navigate('/optimize')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Optimization Center
          </button>
        </div>
      </div>
    );
  }

  const { bestConfiguration, bestMetrics, convergencePath, scenarioResults } = job.results;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Optimization Results</h2>
            <p className="text-gray-600">{job.strategyConfig.name}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Sharpe Ratio</p>
          <p className="text-3xl font-bold text-purple-600">{bestMetrics.sharpeRatio.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Mean Return</p>
          <p className="text-3xl font-bold text-green-600">
            {(bestMetrics.meanReturn * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Volatility</p>
          <p className="text-3xl font-bold text-blue-600">
            {(bestMetrics.volatility * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Max Drawdown</p>
          <p className="text-3xl font-bold text-red-600">
            {(bestMetrics.maxDrawdown * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Convergence Path */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Convergence</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={convergencePath}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" label={{ value: 'Iteration', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: 'Sharpe Ratio', angle: -90, position: 'insideLeft' }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Volatility', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sharpeRatio"
                  stroke="#8b5cf6"
                  name="Sharpe Ratio"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volatility"
                  stroke="#3b82f6"
                  name="Volatility"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Scenario Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Scenario</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scenarioResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="scenario"
                  tickFormatter={(value) => value.replace(/_/g, ' ')}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => value.replace(/_/g, ' ')}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Legend />
                <Bar dataKey="metrics.sharpeRatio" fill="#8b5cf6" name="Sharpe Ratio" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk-Return Scatter */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk-Return Profile by Scenario</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="metrics.volatility"
                  name="Volatility"
                  label={{ value: 'Volatility', position: 'insideBottom', offset: -5 }}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <YAxis
                  type="number"
                  dataKey="metrics.meanReturn"
                  name="Return"
                  label={{ value: 'Mean Return', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Volatility' || name === 'Return') {
                      return `${(value * 100).toFixed(1)}%`;
                    }
                    return value;
                  }}
                  labelFormatter={(value) => value}
                />
                <Scatter data={scenarioResults} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Best Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimal Configuration</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-600">Target Volatility</dt>
                <dd className="font-medium text-gray-900">
                  {(bestConfiguration.targetVolatility * 100).toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Weight Function</dt>
                <dd className="font-medium text-gray-900">
                  {bestConfiguration.equityWeightFunction.replace(/_/g, ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Lookback Period</dt>
                <dd className="font-medium text-gray-900">{bestConfiguration.volLookbackMonths} months</dd>
              </div>
              <div>
                <dt className="text-gray-600">Rebalancing</dt>
                <dd className="font-medium text-gray-900">{bestConfiguration.rebalancingFrequency}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Risk Aversion</dt>
                <dd className="font-medium text-gray-900">{bestConfiguration.riskAversion.toFixed(1)}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Transaction Cost</dt>
                <dd className="font-medium text-gray-900">{bestConfiguration.transactionCostBps} bps</dd>
              </div>
            </dl>
          </div>

          {/* Risk Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">VaR (95%)</dt>
                <dd className="font-medium text-gray-900">{(bestMetrics.var95 * 100).toFixed(2)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">CVaR (95%)</dt>
                <dd className="font-medium text-gray-900">{(bestMetrics.cvar95 * 100).toFixed(2)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Avg Equity Weight</dt>
                <dd className="font-medium text-gray-900">
                  {(bestMetrics.avgEquityWeight * 100).toFixed(1)}%
                </dd>
              </div>
            </dl>
          </div>

          {/* Scenario Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Results</h3>
            <div className="space-y-3">
              {scenarioResults.map((result) => (
                <div key={result.scenario} className="border-b border-gray-200 pb-3 last:border-0">
                  <p className="text-sm font-medium text-gray-900 mb-1 capitalize">
                    {result.scenario.replace(/_/g, ' ')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Return: {(result.metrics.meanReturn * 100).toFixed(1)}%</div>
                    <div>Vol: {(result.metrics.volatility * 100).toFixed(1)}%</div>
                    <div>Sharpe: {result.metrics.sharpeRatio.toFixed(2)}</div>
                    <div>DD: {(result.metrics.maxDrawdown * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                Download PDF Report
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm">
                Export to Excel
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm">
                Copy Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
