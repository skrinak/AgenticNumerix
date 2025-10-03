import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StrategyConfiguration from './pages/StrategyConfiguration';
import OptimizationCenter from './pages/OptimizationCenter';
import Results from './pages/Results';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="strategy" element={<StrategyConfiguration />} />
            <Route path="optimize" element={<OptimizationCenter />} />
            <Route path="results/:jobId" element={<Results />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
