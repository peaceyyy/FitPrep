import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { mockPublishedPlans, mockPlanMeals } from '../mock/mockData';

export async function fetchPublishedPlans() {
  if (!isSupabaseConfigured) {
    return { data: mockPublishedPlans, error: null, source: 'mock' };
  }

  const { data, error } = await supabase
    .from('published_weekly_plans')
    .select('*')
    .eq('is_published', true)
    .order('week_start_date', { ascending: false });

  return { data: data || [], error, source: 'supabase' };
}

export async function fetchMealsForPlan(planId) {
  if (!isSupabaseConfigured) {
    const data = mockPlanMeals.filter((meal) => meal.plan_id === planId);
    return { data, error: null, source: 'mock' };
  }

  const { data, error } = await supabase
    .from('weekly_plan_meals')
    .select('*')
    .eq('plan_id', planId)
    .order('day_of_week', { ascending: true });

  return { data: data || [], error, source: 'supabase' };
}
