import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const DELIVERY_TIME_OPTIONS = ['06:00', '10:00'];
export const MOCK_PAYMENT_METHOD = 'GCash';
export const MOCK_PAID_STATUS = 'Paid (Mock)';

export function normalizeDeliveryTime(value) {
  if (value === '6:00 AM' || value === '06:00') return '06:00';
  if (value === '10:00 AM' || value === '10:00') return '10:00';
  return '';
}

export function buildPlanSnapshot(plan = {}) {
  return {
    id: plan.id,
    name: plan.name || 'Selected Plan',
    category: plan.category || '',
    weekly_price: Number(plan.weekly_price || 0),
    week_start_date: plan.week_start_date || null,
  };
}

export function buildOrderPayload(userId, plan, options = {}) {
  const deliveryTime = normalizeDeliveryTime(options.deliveryTime);

  if (!deliveryTime) {
    throw new Error('Choose a delivery time before placing your preorder.');
  }

  if (!userId || !plan?.id) {
    throw new Error('Could not place order. Please try again.');
  }

  const amountPaid = Number(plan.weekly_price || 0);

  return {
    user_id: userId,
    plan_id: plan.id,
    status: MOCK_PAID_STATUS,
    delivery_time: deliveryTime,
    payment_method: MOCK_PAYMENT_METHOD,
    amount_paid: amountPaid,
    plan_snapshot: buildPlanSnapshot(plan),
  };
}

/**
 * Places a new order for the given plan.
 * @param {string} userId - The authenticated user's UUID
 * @param {object|string} plan - The selected published_weekly_plan or legacy plan id
 * @param {object} options - Checkout metadata such as deliveryTime
 * @returns {{ data, error }}
 */
export async function placeOrder(userId, plan, options = {}) {
  const normalizedPlan = typeof plan === 'string' ? { id: plan } : plan;
  let payload;

  try {
    payload = buildOrderPayload(userId, normalizedPlan, options);
  } catch (error) {
    return { data: null, error };
  }

  if (!isSupabaseConfigured) {
    console.log('[Orders] Supabase not configured — mock order placed.');
    return { data: { id: `MOCK-${Date.now()}`, ...payload }, error: null };
  }

  const { data, error } = await supabase
    .from('weekly_orders')
    .insert(payload)
    .select()
    .single();

  return { data, error };
}

/**
 * Grants demo access to a plan for a user.
 * @param {string} userId - The UUID of the user
 * @param {string} planId - The UUID of the published_weekly_plan
 * @returns {{ data, error }}
 */
export async function adminGrantDemoAccess(userId, planId) {
  if (!isSupabaseConfigured) {
    return { data: { id: `MOCK-${Date.now()}`, user_id: userId, plan_id: planId, status: 'Demo Access' }, error: null };
  }

  const { data, error } = await supabase
    .from('weekly_orders')
    .insert({ user_id: userId, plan_id: planId, status: 'Demo Access' })
    .select()
    .single();

  return { data, error };
}

/**
 * Fetches all orders for the currently authenticated user, joined with plan info.
 * @returns {{ data, error }}
 */
export async function fetchMyOrders() {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;

  if (sessionError || !userId) {
    return { data: [], error: sessionError };
  }

  const { data, error } = await supabase
    .from('weekly_orders')
    .select(`
      id,
      plan_id,
      status,
      delivery_time,
      payment_method,
      amount_paid,
      plan_snapshot,
      created_at,
      published_weekly_plans (
        id,
        name,
        category,
        weekly_price,
        week_start_date
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Fetches all orders for the admin view (all users), joined with plan info.
 * @returns {{ data, error }}
 */
export async function fetchAllOrders() {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('weekly_orders')
    .select(`
      id,
      plan_id,
      status,
      delivery_time,
      payment_method,
      amount_paid,
      plan_snapshot,
      created_at,
      user_id,
      published_weekly_plans (
        id,
        name,
        category,
        weekly_price,
        week_start_date
      )
    `)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}
