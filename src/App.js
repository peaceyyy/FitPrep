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
import CheckoutScreen from './screens/CheckoutScreen';
import ReviewScreen from './screens/ReviewScreen';
import WeeklyPlanScreen from './screens/WeeklyPlanScreen';
import BottomNav from './components/BottomNav';
import AdminBottomNav from './components/AdminBottomNav';
import { COLORS } from './theme';
import { supabase } from './lib/supabaseClient';
import { PlansProvider } from './context/PlansContext';

export default function App() {
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
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [adminMealPlanId, setAdminMealPlanId] = useState(null);
  const [adminPlanFormConfig, setAdminPlanFormConfig] = useState({ initialPlan: null, defaults: null });

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

  const handleSession = (session) => {
    if (!session) {
      setHistory(['login']);
      return;
    }
    const role = session.user.app_metadata?.role || 'customer';
    setUser((prev) => ({
      ...prev,
      id: session.user.id,
      role,
      email: session.user.email,
      name: session.user.user_metadata?.full_name || (role === 'admin' ? 'FitFood Admin' : 'Customer'),
      goal: session.user.user_metadata?.goal || prev.goal,
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
        return <HomeScreen user={user} onOpenWeeklyPlan={() => navigateTo('weeklyPlan')} onBack={history.length > 1 ? navigateBack : null} />;
      case 'plans':
        return <PlansScreen user={user} onOpenWeeklyPlan={() => navigateTo('weeklyPlan')} onOpenCheckout={handleOpenCheckout} onBack={history.length > 1 ? navigateBack : null} />;
      case 'orders':
        return <OrdersScreen user={user} onOpenCheckout={handleOpenCheckout} onOpenReview={() => navigateTo('review')} onBack={history.length > 1 ? navigateBack : null} />;
      case 'profile':
        return <ProfileScreen user={user} onLogout={handleLogout} onBack={history.length > 1 ? navigateBack : null} />;
      case 'checkout':
        return <CheckoutScreen plan={selectedPlan} user={user} onBack={navigateBack} onConfirm={() => resetTo('orders')} />;
      case 'review':
        return <ReviewScreen onBack={navigateBack} onSubmit={navigateBack} />;
      case 'weeklyPlan':
        return <WeeklyPlanScreen onBack={navigateBack} onPreorder={handleOpenCheckout} />;
      case 'adminHome':
        return <AdminDashboardScreen user={user} onLogout={handleLogout} onBack={history.length > 1 ? navigateBack : null} />;
      case 'adminOrders':
        return <AdminOrdersScreen onBack={history.length > 1 ? navigateBack : null} />;
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
      default:
        return <HomeScreen user={user} onOpenWeeklyPlan={() => navigateTo('weeklyPlan')} onOpenCheckout={handleOpenCheckout} />;
    }
  };

  return (
    <PlansProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <View style={styles.screenContent}>{renderScreen()}</View>
          {['home', 'plans', 'orders', 'profile', 'weeklyPlan'].includes(route) && (
            <BottomNav active={route === 'weeklyPlan' ? 'plans' : route} onChange={resetTo} />
          )}
          {['adminHome', 'adminOrders', 'adminMeals'].includes(route) && (
            <AdminBottomNav active={route} onChange={resetTo} />
          )}
        </View>
      </SafeAreaView>
    </PlansProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
  },
});
