import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentJob, jobHistory } = useSelector((state: RootState) => state.optimization);
  const savedStrategies = useSelector((state: RootState) => state.strategy.savedStrategies);

  const totalJobs = jobHistory.length + (currentJob ? 1 : 0);
  const completedJobs = jobHistory.filter((j) => j.status === 'completed').length;
  const bestSharpe = jobHistory
    .filter((j) => j.status === 'completed' && j.results)
    .reduce((max, j) => {
      const sharpe = j.results?.bestMetrics.sharpeRatio || 0;
      return sharpe > max ? sharpe : max;
    }, 0);

  const recentJobs = [...(currentJob ? [currentJob] : []), ...jobHistory].slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your portfolio optimization activities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Optimizations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalJobs}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedJobs}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Best Sharpe Ratio</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {bestSharpe > 0 ? bestSharpe.toFixed(2) : '--'}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saved Strategies</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{savedStrategies.length}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💾</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Optimizations</h3>
            </div>
            <div className="p-6">
              {recentJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No optimization runs yet</p>
                  <button
                    onClick={() => navigate('/optimize')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Launch First Optimization
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.jobId}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{job.strategyConfig.name}</h4>
                          <p className="text-sm text-gray-500">
                            {job.iterations} iterations × {job.marketScenarios.length} scenarios
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            job.status === 'running'
                              ? 'bg-blue-100 text-blue-800'
                              : job.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      {job.status === 'running' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {job.status === 'completed' && job.results && (
                        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600 text-xs">Sharpe</p>
                            <p className="font-medium text-gray-900">
                              {job.results.bestMetrics.sharpeRatio.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Return</p>
                            <p className="font-medium text-gray-900">
                              {(job.results.bestMetrics.meanReturn * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs">Vol</p>
                            <p className="font-medium text-gray-900">
                              {(job.results.bestMetrics.volatility * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {job.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/results/${job.jobId}`)}
                          className="mt-3 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/strategy')}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-left flex items-center justify-between"
              >
                <span>Configure Strategy</span>
                <span>→</span>
              </button>
              <button
                onClick={() => navigate('/optimize')}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 transition-all font-medium text-left flex items-center justify-between"
              >
                <span>Launch Optimization</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">API Gateway</span>
                <span className="flex items-center text-green-600">
                  <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">AWS Bedrock</span>
                <span className="flex items-center text-green-600">
                  <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                  Available
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">SageMaker</span>
                <span className="flex items-center text-green-600">
                  <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                  Ready
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Region</span>
                <span className="text-gray-900 font-medium">us-west-2</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Getting Started</h4>
            <ul className="text-xs text-blue-800 space-y-2">
              <li>1. Configure your allocation strategy</li>
              <li>2. Select market scenarios to test</li>
              <li>3. Launch hyperparameter optimization</li>
              <li>4. Review results and convergence</li>
              <li>5. Export findings for implementation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
