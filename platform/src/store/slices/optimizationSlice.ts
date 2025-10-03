import { createSlice } from '@reduxjs/toolkit';
import { OptimizationJob } from '../../types';

interface OptimizationState {
  currentJob: OptimizationJob | null;
  jobHistory: OptimizationJob[];
  isRunning: boolean;
}

const initialState: OptimizationState = {
  currentJob: null,
  jobHistory: [],
  isRunning: false,
};

const optimizationSlice = createSlice({
  name: 'optimization',
  initialState,
  reducers: {
    startOptimization: (state, action) => {
      state.currentJob = action.payload;
      state.isRunning = true;
    },
    updateProgress: (state, action) => {
      if (state.currentJob && state.currentJob.jobId === action.payload.jobId) {
        state.currentJob.progress = action.payload.progress;
      }
    },
    completeOptimization: (state, action) => {
      if (state.currentJob) {
        state.currentJob.status = 'completed';
        state.currentJob.results = action.payload.results;
        state.currentJob.endTime = new Date().toISOString();
        state.jobHistory.unshift({ ...state.currentJob });
        state.isRunning = false;
      }
    },
    failOptimization: (state, action) => {
      if (state.currentJob && state.currentJob.jobId === action.payload.jobId) {
        state.currentJob.status = 'failed';
        state.currentJob.endTime = new Date().toISOString();
        state.jobHistory.unshift({ ...state.currentJob });
        state.isRunning = false;
      }
    },
    cancelOptimization: (state) => {
      if (state.currentJob) {
        state.currentJob.status = 'failed';
        state.currentJob.endTime = new Date().toISOString();
        state.jobHistory.unshift({ ...state.currentJob });
      }
      state.currentJob = null;
      state.isRunning = false;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
      state.isRunning = false;
    },
  },
});

export const {
  startOptimization,
  updateProgress,
  completeOptimization,
  failOptimization,
  cancelOptimization,
  clearCurrentJob,
} = optimizationSlice.actions;

export default optimizationSlice.reducer;
