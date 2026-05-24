import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { fetchPublishedPlans } from '../services/plansService';
import { mockPublishedPlans, mockPlanMeals } from '../mock/mockData';

const PlansContext = createContext(null);

const initialState = {
  plans: mockPublishedPlans,
  meals: mockPlanMeals,
  loading: false,
  error: '',
  source: 'mock',
};

function plansReducer(state, action) {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: '' };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        loading: false,
        plans: Array.isArray(action.plans) ? action.plans : [],
        source: action.source || 'mock',
      };
    case 'LOAD_MEALS_SUCCESS':
      return {
        ...state,
        meals: Array.isArray(action.meals) ? action.meals : [],
      };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.message || 'Failed to load plans' };
    default:
      return state;
  }
}

export function PlansProvider({ children }) {
  const [state, dispatch] = useReducer(plansReducer, initialState);

  const loadPlans = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    const { data, error, source } = await fetchPublishedPlans();

    if (error) {
      dispatch({ type: 'LOAD_ERROR', message: error.message });
      return;
    }

    dispatch({ type: 'LOAD_SUCCESS', plans: data, source });
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const value = useMemo(() => ({
    ...state,
    loadPlans,
  }), [state, loadPlans]);

  return (
    <PlansContext.Provider value={value}>
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error('usePlans must be used within PlansProvider');
  }
  return context;
}
