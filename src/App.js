import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import AppText from './components/AppText';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import PlansScreen from './screens/PlansScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminOrdersScreen from './screens/AdminOrdersScreen';
import AdminMealsScreen from './screens/AdminMealsScreen';
import AdminMealForm from './screens/AdminMealForm';
import AdminPlanFormScreen from './screens/AdminPlanFormScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';
import AdminUserDetailsScreen from './screens/AdminUserDetailsScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ReviewScreen from './screens/ReviewScreen';
import WeeklyPlanScreen from './screens/WeeklyPlanScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AdminDeliveryDetailsScreen from './screens/AdminDeliveryDetailsScreen';
import BottomNav from './components/BottomNav';
import AdminBottomNav from './components/AdminBottomNav';
import { COLORS } from './theme';
import { supabase } from './lib/supabaseClient';
import { PlansProvider } from './context/PlansContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { profilesService } from './services/profilesService';

function AppContent() {
  const { colors, isDark } = React.useContext(ThemeContext);
  
  const [fontsLoaded] = useFonts({
    PlusJakartaSans: PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [history, setHistory] = useState(['login']);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [user, setUser] = useState({
    id: '',
    name: 'Loading...',
    email: '',
    goal: 'bulking',
    role: 'customer',
    address: '',
    avatar_url: null,
    contactNumber: '',
    created_at: null,
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [adminMealPlanId, setAdminMealPlanId] = useState(null);
  const [adminPlanFormConfig, setAdminPlanFormConfig] = useState({ initialPlan: null, defaults: null });
  const [editSection, setEditSection] = useState('Personal Information');
  const [selectedAdminUserId, setSelectedAdminUserId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewedOrderIds, setReviewedOrderIds] = useState([]);
  const [selectedAdminDelivery, setSelectedAdminDelivery] = useState(null);

  const route = history[history.length - 1];

  const navigateTo = (screen) => {
    setHistory((prev) => [...prev, screen]);
  };

  const navigateBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  };

  const resetTo = (screen) => {
    setHistory([screen]);
  };

  React.useEffect(() => {
    if (!supabase) {
      console.log('🔴 [Supabase] Client not initialized. Check your .env variables.');
      setSessionLoaded(true);
      return;
    }

    console.log('🟡 [Supabase] Attempting to fetch active session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log('🔴 [Supabase] Error fetching session:', error.message);
      } else if (session) {
        console.log(`🟢 [Supabase] Connected! Session active for: ${session.user.email}`);
      } else {
        console.log('⚪ [Supabase] Connected! No active session found. Showing login.');
      }
      handleSession(session);
      setSessionLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`🔄 [Supabase] Auth state changed: ${_event}`, session?.user?.email || 'No user');
      handleSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSession = async (session) => {
    if (!session) {
      setHistory(['login']);
      return;
    }
    const role = session.user.app_metadata?.role || 'customer';
    
    // Default fallbacks from user_metadata
    let fullName = session.user.user_metadata?.full_name || (role === 'admin' ? 'FitFood Admin' : 'Customer');
    let goal = session.user.user_metadata?.goal || 'bulking';
    let address = session.user.user_metadata?.address || '';
    let createdAt = session.user.created_at || null;
    const avatarUrl = session.user.user_metadata?.avatar_url || null;
    let contactNumber = session.user.user_metadata?.gcash_number
      || session.user.user_metadata?.contact_number
      || session.user.phone
      || '';
    
    // Hydrate from public profiles table
    const profile = await profilesService.getCurrentProfile();
    if (profile) {
      if (profile.full_name) fullName = profile.full_name;
      if (profile.goal) goal = profile.goal;
      if (profile.address) address = profile.address;
      if (profile.gcash_number) contactNumber = profile.gcash_number;
      if (profile.created_at) createdAt = profile.created_at;
    }

    setUser((prev) => ({
      ...prev,
      id: session.user.id,
      role,
      email: session.user.email,
      name: fullName,
      goal: goal,
      address,
      avatar_url: avatarUrl || prev.avatar_url || null,
      contactNumber,
      created_at: createdAt,
    }));
    
    // Ensure we route to the appropriate home if currently on login or register
    setHistory((prev) => {
      const current = prev[prev.length - 1];
      if (current === 'login' || current === 'register') {
        return [role === 'admin' ? 'adminHome' : 'home'];
      }
      return prev; // Preserve route if already logged in and navigating
    });
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      setHistory(['login']);
    }
  };

  const handleUpdateUser = async (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));

    if (!supabase) {
      return;
    }

    const metadata = {
      ...(updates.name ? { full_name: updates.name } : {}),
      ...(updates.goal ? { goal: updates.goal } : {}),
      ...(updates.avatar_url ? { avatar_url: updates.avatar_url } : {}),
      ...(updates.address !== undefined ? { address: updates.address } : {}),
      ...(updates.contactNumber !== undefined ? { gcash_number: updates.contactNumber } : {}),
    };

    if (Object.keys(metadata).length === 0) {
      return;
    }

    const { error } = await supabase.auth.updateUser({ data: metadata });
    if (error) {
      console.log('[App] Failed to save user metadata:', error.message);
    }
  };

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    navigateTo('checkout');
  };

  const handleOpenAdminMealForm = (plan) => {
    setAdminMealPlanId(plan?.id || null);
    navigateTo('adminMealForm');
  };

  const handleOpenAdminPlanForm = (config = {}) => {
    setAdminPlanFormConfig({
      initialPlan: config.initialPlan || null,
      defaults: config.defaults || null,
    });
    navigateTo('adminPlanForm');
  };

  const renderScreen = () => {
    if (!sessionLoaded || !fontsLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText style={{ color: COLORS.brand }}>Loading...</AppText>
        </View>
      );
    }
    switch (route) {
      case 'login':
        return <LoginScreen onNavigateRegister={() => navigateTo('register')} />;
      case 'register':
        return <RegisterScreen onBack={navigateBack} />;
      case 'home':
        return <HomeScreen user={user} onOpenWeeklyPlan={() => navigateTo('weeklyPlan')} onNavigateToPlans={() => resetTo('plans')} onNavigateToOrders={() => resetTo('orders')} onBack={history.length > 1 ? navigateBack : null} />;
      case 'plans':
        return <PlansScreen user={user} onOpenWeeklyPlan={() => navigateTo('weeklyPlan')} onOpenCheckout={handleOpenCheckout} onBack={history.length > 1 ? navigateBack : null} />;
      case 'orders':
        return <OrdersScreen user={user} reviewedOrderIds={reviewedOrderIds} onOpenCheckout={handleOpenCheckout} onOpenReview={(order) => { setReviewOrder(order); navigateTo('review'); }} onBack={history.length > 1 ? navigateBack : null} />;
      case 'profile':
        return <ProfileScreen 
          user={user} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser}
          onEditProfile={(section) => { setEditSection(section); navigateTo('editProfile'); }}
          onBack={history.length > 1 ? navigateBack : null} 
        />;
      case 'editProfile':
        return <EditProfileScreen 
          section={editSection} 
          user={user} 
          onBack={navigateBack} 
          onSave={async (updates) => {
            const { success } = await profilesService.updateCurrentProfile({
              full_name: updates.name,
              goal: updates.goal,
              address: updates.address,
              gcash_number: updates.contactNumber,
            });
            if (success) {
              // Refresh user state
              await handleUpdateUser({
                name: updates.name,
                goal: updates.goal,
                address: updates.address,
                contactNumber: updates.contactNumber,
              });
              navigateBack();
            } else {
              alert('Failed to update profile');
            }
          }} 
        />;
      case 'checkout':
        return <CheckoutScreen plan={selectedPlan} user={user} onBack={navigateBack} onConfirm={() => resetTo('orders')} />;
      case 'review':
        return (
          <ReviewScreen
            order={reviewOrder}
            onBack={navigateBack}
            onSubmit={(review) => {
              if (review?.orderId) {
                setReviewedOrderIds((prev) => (
                  prev.includes(review.orderId) ? prev : [...prev, review.orderId]
                ));
              }
              navigateBack();
            }}
          />
        );
      case 'weeklyPlan':
        return <WeeklyPlanScreen onBack={navigateBack} onPreorder={handleOpenCheckout} />;
      case 'adminHome':
        return <AdminDashboardScreen user={user} onLogout={handleLogout} onBack={history.length > 1 ? navigateBack : null} />;
      case 'adminOrders':
        return <AdminOrdersScreen onOpenDeliveryDetails={(orderGroup) => { setSelectedAdminDelivery(orderGroup); navigateTo('adminDeliveryDetails'); }} onBack={history.length > 1 ? navigateBack : null} />;
      case 'adminDeliveryDetails':
        return <AdminDeliveryDetailsScreen orderGroup={selectedAdminDelivery} onBack={navigateBack} />;
      case 'adminMeals':
        return (
          <AdminMealsScreen
            onCreateMeal={handleOpenAdminMealForm}
            onCreatePlan={(defaults) => handleOpenAdminPlanForm({ defaults })}
            onEditPlan={(plan) => handleOpenAdminPlanForm({ initialPlan: plan })}
            onBack={history.length > 1 ? navigateBack : null}
          />
        );
      case 'adminPlanForm':
        return (
          <AdminPlanFormScreen
            initialPlan={adminPlanFormConfig.initialPlan}
            defaults={adminPlanFormConfig.defaults}
            onBack={navigateBack}
          />
        );
      case 'adminMealForm':
        return <AdminMealForm initialPlanId={adminMealPlanId} onBack={navigateBack} />;
      case 'adminUsers':
        return <AdminUsersScreen onOpenUserDetails={(id) => { setSelectedAdminUserId(id); navigateTo('adminUserDetails'); }} onBack={history.length > 1 ? navigateBack : null} />;
      case 'adminUserDetails':
        return <AdminUserDetailsScreen profileId={selectedAdminUserId} onBack={navigateBack} />;
      default:
        return <HomeScreen user={user} onOpenWeeklyPlan={() => navigateTo('weeklyPlan')} onOpenCheckout={handleOpenCheckout} onNavigateToPlans={() => resetTo('plans')} onNavigateToOrders={() => resetTo('orders')} />;
    }
  };

  const isAuthScreen = route === 'login' || route === 'register';
  const activeBgColor = isAuthScreen ? COLORS.background : colors.background;
  const activeStatusBarStyle = (isAuthScreen || !isDark) ? "dark" : "light";

  return (
    <PlansProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: activeBgColor }]}>
        <StatusBar style={activeStatusBarStyle} />
        <View style={styles.container}>
          <View style={styles.screenContent}>{renderScreen()}</View>
          {['home', 'plans', 'orders', 'profile', 'weeklyPlan'].includes(route) && (
            <BottomNav active={route === 'weeklyPlan' ? 'plans' : route} onChange={resetTo} />
          )}
          {['adminHome', 'adminOrders', 'adminMeals', 'adminUsers'].includes(route) && (
            <AdminBottomNav active={route} onChange={resetTo} />
          )}
        </View>
      </SafeAreaView>
    </PlansProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
  },
});
