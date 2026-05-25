import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { withDemoDeliveryStatuses } from './deliveryStatusService';

export async function fetchMyDailyDeliveries() {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;

  if (sessionError || !userId) {
    return { data: [], error: sessionError };
  }

  const { data, error } = await supabase
    .from('daily_deliveries')
    .select(`
      id,
      weekly_order_id,
      user_id,
      plan_id,
      delivery_date,
      delivery_time,
      current_status,
      created_at,
      weekly_orders (
        id,
        amount_paid,
        payment_method,
        plan_snapshot,
        published_weekly_plans (
          id,
          name,
          category,
          weekly_price,
          week_start_date
        )
      )
    `)
    .eq('user_id', userId)
    .order('delivery_date', { ascending: true })
    .order('delivery_time', { ascending: true });

  return { data: withDemoDeliveryStatuses(data || []), error };
}

export async function fetchAllDailyDeliveries() {
  if (!isSupabaseConfigured) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('daily_deliveries')
    .select(`
      id,
      weekly_order_id,
      user_id,
      plan_id,
      delivery_date,
      delivery_time,
      current_status,
      created_at,
      weekly_orders (
        id,
        amount_paid,
        payment_method,
        plan_snapshot,
        published_weekly_plans (
          id,
          name,
          category,
          weekly_price,
          week_start_date
        )
      )
    `)
    .order('delivery_date', { ascending: true })
    .order('delivery_time', { ascending: true });

  if (error || !data) {
    return { data: [], error };
  }

  // Fetch user profiles to include name and location
  const userIds = [...new Set(data.map((d) => d.user_id).filter(Boolean))];
  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, address')
      .in('id', userIds);

    if (profilesData) {
      const profileMap = {};
      profilesData.forEach((p) => {
        profileMap[p.id] = p;
      });
      data.forEach((d) => {
        if (d.user_id && profileMap[d.user_id]) {
          d.user = profileMap[d.user_id];
        }
      });
    }
  }

  return { data: withDemoDeliveryStatuses(data), error: null };
}

export async function updateDailyDeliveryStatus(deliveryId, currentStatus) {
  if (!isSupabaseConfigured) {
    return { data: { id: deliveryId, current_status: currentStatus }, error: null };
  }

  const { data, error } = await supabase
    .from('daily_deliveries')
    .update({ current_status: currentStatus })
    .eq('id', deliveryId)
    .select()
    .single();

  return { data, error };
}
