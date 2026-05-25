import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import {
  createPlan,
  deletePlan,
  fetchMealsForPlan,
  fetchPlans,
  formatWeekRange,
  getCurrentWeekStartDate,
  getNextWeekStartDate,
  getPreorderEligibility,
  getPreviousWeekStartDate,
  isSunday,
  normalizeCategory,
  updatePlan,
} from '../services/plansService';
import { fetchMyOrders } from '../services/ordersService';

const PlansContext = createContext(null);

const currentWeekStartDate = getCurrentWeekStartDate();

const initialState = {
  plans: [],
  meals: [],
  orders: [],
  selectedPlan: null,
  selectedCategory: 'Cutting',
  browsingWeekStartDate: currentWeekStartDate,
  loading: true,
  mealsLoading: false,
  ordersLoading: false,
  error: '',
  ordersError: '',
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
    case 'ORDERS_START':
      return { ...state, ordersLoading: true, ordersError: '' };
    case 'ORDERS_SUCCESS':
      return {
        ...state,
        ordersLoading: false,
        orders: Array.isArray(action.orders) ? action.orders : [],
      };
    case 'ORDERS_ERROR':
      return {
        ...state,
        ordersLoading: false,
        ordersError: action.message || '',
        orders: [],
      };
    case 'SET_BROWSING_WEEK':
      if (state.browsingWeekStartDate === action.weekStartDate) return state;
      return {
        ...state,
        browsingWeekStartDate: action.weekStartDate,
        meals: [],
        selectedPlan: null,
        mealsLoading: false,
      };
    case 'SET_SELECTED_CATEGORY': {
      const newCategory = normalizeCategory(action.category);
      if (state.selectedCategory === newCategory) return state;
      return {
        ...state,
        selectedCategory: newCategory,
        meals: [],
        selectedPlan: null,
        mealsLoading: false,
      };
    }
    case 'SELECT_PLAN':
      return {
        ...state,
        selectedPlan: action.plan || null,
        meals: [],
        mealsLoading: Boolean(action.plan),
      };
    case 'LOAD_MEALS_SUCCESS':
      if (action.planId && state.selectedPlan?.id !== action.planId) {
        return state;
      }
      return { ...state, mealsLoading: false, meals: Array.isArray(action.meals) ? action.meals : [] };
    case 'LOAD_ERROR':
      return { ...state, loading: false, mealsLoading: false, error: action.message || 'Failed to load plans' };
    case 'CLEAR_SESSION':
      return { ...initialState, loading: false, source: 'supabase' };
    default:
      return state;
  }
}

function isPlanPublished(plan) {
  return Boolean(plan?.is_published);
}

function orderWeekStart(order) {
  return order?.published_weekly_plans?.week_start_date || '';
}

export function PlansProvider({ children }) {
  const [state, dispatch] = useReducer(plansReducer, initialState);

  const loadPlans = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    const { data, error, source } = await fetchPlans();

    if (error) {
      dispatch({ type: 'LOAD_ERROR', message: error.message });
      return;
    }

    dispatch({ type: 'LOAD_SUCCESS', plans: data, source });
    console.log(`[PlansContext] Loaded ${data?.length || 0} plans from: ${source}`);
  }, []);

  const loadOrders = useCallback(async () => {
    dispatch({ type: 'ORDERS_START' });
    const { data, error } = await fetchMyOrders();

    if (error) {
      dispatch({ type: 'ORDERS_ERROR', message: error.message });
      console.log('[PlansContext] Orders unavailable:', error.message);
      return;
    }

    dispatch({ type: 'ORDERS_SUCCESS', orders: data });
  }, []);

  useEffect(() => {
    const { supabase, isSupabaseConfigured } = require('../lib/supabaseClient');

    if (!isSupabaseConfigured) {
      loadPlans();
      loadOrders();
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('[PlansContext] Session found on mount - loading plans and orders.');
        loadPlans();
        loadOrders();
      } else {
        dispatch({ type: 'LOAD_SUCCESS', plans: [], source: 'supabase' });
        dispatch({ type: 'ORDERS_SUCCESS', orders: [] });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        console.log('[PlansContext] SIGNED_IN - reloading plans and orders.');
        loadPlans();
        loadOrders();
      }
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'CLEAR_SESSION' });
      }
    });

    return () => subscription?.unsubscribe();
  }, [loadPlans, loadOrders]);

  const loadMealsForPlan = useCallback(async (plan) => {
    dispatch({ type: 'SELECT_PLAN', plan });

    if (!plan?.id) {
      return;
    }

    const { data, error } = await fetchMealsForPlan(plan.id);
    if (error) {
      dispatch({ type: 'LOAD_ERROR', message: error.message });
      return;
    }
    dispatch({ type: 'LOAD_MEALS_SUCCESS', meals: data, planId: plan.id });
  }, []);

  const savePlan = useCallback(async (planData, planId) => {
    const result = planId
      ? await updatePlan(planId, planData)
      : await createPlan(planData);

    if (!result.error) {
      await loadPlans();
    }

    return result;
  }, [loadPlans]);

  const removePlan = useCallback(async (planId) => {
    const result = await deletePlan(planId);

    if (!result.error) {
      await loadPlans();
    }

    return result;
  }, [loadPlans]);

  const setSelectedCategory = useCallback((category) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', category });
  }, []);

  const showCurrentWeek = useCallback(() => {
    dispatch({ type: 'SET_BROWSING_WEEK', weekStartDate: currentWeekStartDate });
  }, []);

  const showPreviousWeek = useCallback(() => {
    dispatch({ type: 'SET_BROWSING_WEEK', weekStartDate: getPreviousWeekStartDate(state.browsingWeekStartDate) });
  }, [state.browsingWeekStartDate]);

  const showNextWeek = useCallback(() => {
    const nextWeekStartDate = getNextWeekStartDate(state.browsingWeekStartDate);
    const nextWeekHasPlans = state.plans.some((plan) => (
      isPlanPublished(plan) && plan.week_start_date === nextWeekStartDate
    ));
    const canAdvance = state.browsingWeekStartDate < currentWeekStartDate
      || (state.browsingWeekStartDate === currentWeekStartDate && nextWeekHasPlans);

    if (canAdvance) {
      dispatch({ type: 'SET_BROWSING_WEEK', weekStartDate: nextWeekStartDate });
    }
  }, [state.browsingWeekStartDate, state.plans]);

  const customerPlans = useMemo(() => (
    state.plans.filter((plan) => (
      isPlanPublished(plan) && plan.week_start_date === state.browsingWeekStartDate
    ))
  ), [state.plans, state.browsingWeekStartDate]);

  const selectedPlan = useMemo(() => (
    customerPlans.find((plan) => normalizeCategory(plan.category) === state.selectedCategory) || null
  ), [customerPlans, state.selectedCategory]);

  const selectedPlanMeals = useMemo(() => {
    if (!selectedPlan || state.selectedPlan?.id !== selectedPlan.id) {
      return [];
    }

    return state.meals;
  }, [selectedPlan, state.meals, state.selectedPlan]);

  const subscriptionForWeek = useMemo(() => (
    state.orders.find((order) => orderWeekStart(order) === state.browsingWeekStartDate) || null
  ), [state.orders, state.browsingWeekStartDate]);

  const nextBrowsingWeekStartDate = getNextWeekStartDate(state.browsingWeekStartDate);
  const canShowNextWeek = useMemo(() => {
    const nextWeekHasPlans = state.plans.some((plan) => (
      isPlanPublished(plan) && plan.week_start_date === nextBrowsingWeekStartDate
    ));

    return state.browsingWeekStartDate < currentWeekStartDate
      || (state.browsingWeekStartDate === currentWeekStartDate && nextWeekHasPlans);
  }, [nextBrowsingWeekStartDate, state.browsingWeekStartDate, state.plans]);

  const preorderEligibility = useMemo(() => (
    getPreorderEligibility({
      browsingWeekStartDate: state.browsingWeekStartDate,
      currentWeekStartDate,
      selectedPlan,
      subscriptionForWeek,
    })
  ), [selectedPlan, state.browsingWeekStartDate, subscriptionForWeek]);



  useEffect(() => {
    if (selectedPlan?.id) {
      loadMealsForPlan(selectedPlan);
    } else {
      dispatch({ type: 'SELECT_PLAN', plan: null });
    }
  }, [loadMealsForPlan, selectedPlan?.id]);

  const value = useMemo(() => ({
    ...state,
    canShowNextWeek,
    currentWeekStartDate,
    customerPlans,
    loadMealsForPlan,
    loadOrders,
    loadPlans,
    nextBrowsingWeekStartDate,
    preorderEligibility,
    removePlan,
    savePlan,
    selectedPlan,
    selectedPlanMeals,
    setSelectedCategory,
    showCurrentWeek,
    showNextWeek,
    showPreviousWeek,
    subscriptionForWeek,
    weekRangeLabel: formatWeekRange(state.browsingWeekStartDate),
  }), [
    state,
    canShowNextWeek,
    customerPlans,
    loadMealsForPlan,
    loadOrders,
    loadPlans,
    nextBrowsingWeekStartDate,
    preorderEligibility,
    removePlan,
    savePlan,
    selectedPlan,
    selectedPlanMeals,
    setSelectedCategory,
    showCurrentWeek,
    showNextWeek,
    showPreviousWeek,
    subscriptionForWeek,
  ]);

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
