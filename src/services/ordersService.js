import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Places a new order for the given plan.
 * @param {string} userId - The authenticated user's UUID
 * @param {string} planId - The UUID of the published_weekly_plan
 * @returns {{ data, error }}
 */
export async function placeOrder(userId, planId) {
  if (!isSupabaseConfigured) {
    console.log('[Orders] Supabase not configured — mock order placed.');
    return { data: { id: `MOCK-${Date.now()}`, user_id: userId, plan_id: planId, status: 'Paid (Mock)' }, error: null };
  }

  const { data, error } = await supabase
    .from('weekly_orders')
    .insert({ user_id: userId, plan_id: planId, status: 'Paid (Mock)' })
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
