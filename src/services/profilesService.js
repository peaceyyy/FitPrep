import { supabase } from '../lib/supabaseClient';

export const profilesService = {
  // Get the current authenticated user's profile
  async getCurrentProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Exception fetching current profile:', error);
      return null;
    }
  },

  // Update current user's profile using the RPC
  async updateCurrentProfile(updates) {
    try {
      const { full_name, goal, address, gcash_number } = updates;
      const { data, error } = await supabase.rpc('update_own_profile', {
        new_full_name: full_name,
        new_goal: goal,
        new_address: address || null,
        new_gcash_number: gcash_number || null,
      });

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Exception updating profile:', error);
      return { success: false, error };
    }
  },

  // ADMIN: List all profiles
  async listProfiles(filters = {}) {
    try {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
      
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Error listing profiles:', error);
        return [];
      }
      return data;
    } catch (error) {
      console.error('Exception listing profiles:', error);
      return [];
    }
  },

  // ADMIN: Get a specific profile by ID
  async getProfile(id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  },

  // ADMIN: Update a specific profile (direct table update, admin policy allows it)
  async updateProfile(id, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating profile as admin:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Exception updating profile as admin:', error);
      return { success: false, error };
    }
  }
};
