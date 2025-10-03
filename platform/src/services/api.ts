import axios, { AxiosInstance } from 'axios';
import { StrategyConfig, OptimizationJob, OptimizationResults, ApiResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 300000, // 5 minutes for long-running optimizations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Strategy Optimization
  async submitOptimization(
    strategy: StrategyConfig,
    scenarios: string[],
    iterations: number = 100
  ): Promise<ApiResponse<OptimizationJob>> {
    const response = await this.client.post('/optimize', {
      strategy,
      scenarios,
      iterations,
    });
    return response.data;
  }

  async getOptimizationStatus(jobId: string): Promise<ApiResponse<OptimizationJob>> {
    const response = await this.client.get(`/optimize/${jobId}/status`);
    return response.data;
  }

  async getOptimizationResults(jobId: string): Promise<ApiResponse<OptimizationResults>> {
    const response = await this.client.get(`/optimize/${jobId}/results`);
    return response.data;
  }

  async cancelOptimization(jobId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/optimize/${jobId}`);
    return response.data;
  }

  // Market Data
  async getMarketData(symbol: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/market-data/equity/${symbol}`);
    return response.data;
  }

  async getVolSurface(symbol: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/market-data/vol-surface/${symbol}`);
    return response.data;
  }

  async getYieldCurve(currency: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/market-data/yield-curve/${currency}`);
    return response.data;
  }

  // Strategy Management
  async listStrategies(): Promise<ApiResponse<StrategyConfig[]>> {
    const response = await this.client.get('/strategies');
    return response.data;
  }

  async saveStrategy(strategy: StrategyConfig): Promise<ApiResponse<StrategyConfig>> {
    const response = await this.client.post('/strategies', strategy);
    return response.data;
  }

  async getStrategy(id: string): Promise<ApiResponse<StrategyConfig>> {
    const response = await this.client.get(`/strategies/${id}`);
    return response.data;
  }

  async updateStrategy(
    id: string,
    strategy: Partial<StrategyConfig>
  ): Promise<ApiResponse<StrategyConfig>> {
    const response = await this.client.put(`/strategies/${id}`, strategy);
    return response.data;
  }

  async deleteStrategy(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/strategies/${id}`);
    return response.data;
  }

  // Results & Analytics
  async getResultsSummary(jobId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/results/${jobId}/summary`);
    return response.data;
  }

  async getResultsCharts(jobId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/results/${jobId}/charts`);
    return response.data;
  }

  async exportResults(jobId: string, format: 'csv' | 'pdf' | 'excel'): Promise<Blob> {
    const response = await this.client.get(`/results/${jobId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
