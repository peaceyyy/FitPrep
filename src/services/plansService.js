import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { mockPublishedPlans, mockPlanMeals } from '../mock/mockData';

export const DAY_LABELS = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
  Mon: 'Mon',
  Tue: 'Tue',
  Wed: 'Wed',
  Thu: 'Thu',
  Fri: 'Fri',
  Sat: 'Sat',
  Sun: 'Sun',
};

export const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const PLAN_CATEGORIES = ['Cutting', 'Bulking', 'Maintenance'];

function toDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateOnly(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function addDays(dateString, days) {
  const date = fromDateOnly(dateString);
  date.setDate(date.getDate() + days);
  return toDateOnly(date);
}

export function getWeekStartDate(date = new Date()) {
  const weekDate = new Date(date);
  weekDate.setHours(0, 0, 0, 0);
  const day = weekDate.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  weekDate.setDate(weekDate.getDate() - daysSinceMonday);
  return toDateOnly(weekDate);
}

export function getCurrentWeekStartDate() {
  return getWeekStartDate();
}

export function getPreviousWeekStartDate(weekStartDate = getCurrentWeekStartDate()) {
  return addDays(weekStartDate, -7);
}

export function getNextWeekStartDate(weekStartDate = getCurrentWeekStartDate()) {
  return addDays(weekStartDate, 7);
}

export function getWeekEndDate(weekStartDate = getCurrentWeekStartDate()) {
  return addDays(weekStartDate, 6);
}

function formatMonthDay(dateString) {
  return fromDateOnly(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeekRange(weekStartDate = getCurrentWeekStartDate()) {
  return `${formatMonthDay(weekStartDate)} - ${formatMonthDay(getWeekEndDate(weekStartDate))}`;
}

export function isSunday(date = new Date()) {
  return date.getDay() === 0;
}

export function isSameOrBeforeWeek(weekStartDate, comparisonWeekStartDate) {
  return weekStartDate <= comparisonWeekStartDate;
}

export function normalizeDayLabel(day) {
  return DAY_LABELS[day] || day || '';
}

export function getDaySortIndex(day) {
  const normalized = normalizeDayLabel(day);
  const index = DAY_ORDER.indexOf(normalized);
  return index === -1 ? DAY_ORDER.length : index;
}

export function getTodayDayLabel(date = new Date()) {
  return DAY_ORDER[date.getDay() === 0 ? 6 : date.getDay() - 1];
}

export function normalizeCategory(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (['cut', 'cutting', 'weight loss', 'fat loss'].includes(normalized)) {
    return 'Cutting';
  }
  if (['bulk', 'bulking', 'gain', 'muscle gain'].includes(normalized)) {
    return 'Bulking';
  }
  if (['maintain', 'maintenance'].includes(normalized)) {
    return 'Maintenance';
  }

  return PLAN_CATEGORIES.includes(value) ? value : 'Cutting';
}

export function getPreorderEligibility({
  browsingWeekStartDate,
  currentWeekStartDate = getCurrentWeekStartDate(),
  selectedPlan,
  subscriptionForWeek,
  today = new Date(),
} = {}) {
  const nextWeekStartDate = getNextWeekStartDate(currentWeekStartDate);

  if (!selectedPlan) {
    return {
      canPreorder: false,
      reason: 'Choose an available plan before preordering.',
      targetWeekStartDate: nextWeekStartDate,
    };
  }

  // Bypassed for Demo: Preorders open at any time if there is a plan for next week
  /*
  if (!isSunday(today)) {
    return {
      canPreorder: false,
      reason: 'Preorders open every Sunday for the next meal week.',
      targetWeekStartDate: nextWeekStartDate,
    };
  }
  */

  if (browsingWeekStartDate !== nextWeekStartDate) {
    return {
      canPreorder: false,
      reason: 'Sunday preorders are only for next week.',
      targetWeekStartDate: nextWeekStartDate,
    };
  }

  if (subscriptionForWeek) {
    return {
      canPreorder: false,
      reason: 'You already have a preorder for this week.',
      targetWeekStartDate: nextWeekStartDate,
    };
  }

  return {
    canPreorder: true,
    reason: 'Sunday preorder window is open for next week.',
    targetWeekStartDate: nextWeekStartDate,
  };
}

function applyPlanFilters(plans, { publishedOnly = false, weekStartDate } = {}) {
  return plans.filter((plan) => {
    const matchesPublished = !publishedOnly || plan.is_published;
    const matchesWeek = !weekStartDate || plan.week_start_date === weekStartDate;
    return matchesPublished && matchesWeek;
  });
}

export async function fetchPlans({ publishedOnly = false, weekStartDate } = {}) {
  console.log('[Plans] isSupabaseConfigured:', isSupabaseConfigured);
  if (!isSupabaseConfigured) {
    console.log('[Plans] Supabase not configured - falling back to mock data.');
    return { data: applyPlanFilters(mockPublishedPlans, { publishedOnly, weekStartDate }), error: null, source: 'mock' };
  }

  console.log('[Plans] Querying published_weekly_plans from Supabase...');
  let query = supabase
    .from('published_weekly_plans')
    .select('*')
    .order('week_start_date', { ascending: false });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  if (weekStartDate) {
    query = query.eq('week_start_date', weekStartDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Plans] Supabase error:', JSON.stringify(error));
  } else {
    console.log(`[Plans] Raw response - ${data?.length ?? 'null'} rows:`, JSON.stringify(data?.slice(0, 2)));
  }

  return { data: data || [], error, source: 'supabase' };
}

export async function fetchPublishedPlans(options = {}) {
  return fetchPlans({ ...options, publishedOnly: true });
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

  if (error) {
    console.error('[Supabase] Error fetching meals:', error.message);
  } else {
    console.log(`[Supabase] Successfully fetched ${data?.length || 0} meals for plan: ${planId}`);
  }

  return { data: data || [], error, source: 'supabase' };
}

export async function createPlan(planData) {
  if (!isSupabaseConfigured) {
    return {
      data: { id: `MOCK-${Date.now()}`, ...planData },
      error: null,
      source: 'mock',
    };
  }

  const { data, error } = await supabase
    .from('published_weekly_plans')
    .insert(planData)
    .select()
    .single();

  return { data, error, source: 'supabase' };
}

export async function updatePlan(planId, planData) {
  if (!isSupabaseConfigured) {
    return {
      data: { id: planId, ...planData },
      error: null,
      source: 'mock',
    };
  }

  const { data, error } = await supabase
    .from('published_weekly_plans')
    .update(planData)
    .eq('id', planId)
    .select()
    .single();

  return { data, error, source: 'supabase' };
}

export async function deletePlan(planId) {
  if (!isSupabaseConfigured) {
    return { data: null, error: null, source: 'mock' };
  }

  const { data, error } = await supabase
    .from('published_weekly_plans')
    .delete()
    .eq('id', planId)
    .select();

  return { data, error, source: 'supabase' };
}
