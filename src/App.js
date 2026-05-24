import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import OrdersScreen from './screens/OrdersScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AdminOrdersScreen from './screens/AdminOrdersScreen';
import AdminTrackingScreen from './screens/AdminTrackingScreen';
import AdminMealsScreen from './screens/AdminMealsScreen';
import AdminMealCategoryScreen from './screens/AdminMealCategoryScreen';
import AdminMealForm from './screens/AdminMealForm';
import AdminOrderDetailsScreen from './screens/AdminOrderDetailsScreen';
import AdminDeliveryScreen from './screens/AdminDeliveryScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ReviewScreen from './screens/ReviewScreen';
import WeeklyPlanScreen from './screens/WeeklyPlanScreen';
import BottomNav from './components/BottomNav';
import AdminBottomNav from './components/AdminBottomNav';
import { COLORS } from './theme';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [route, setRoute] = useState('login');
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [profileEditSection, setProfileEditSection] = useState('Personal Information');
  const [user, setUser] = useState({
    name: 'Loading...',
    email: '',
    goal: 'bulking',
    address: '482 Fitness Way, Apt 4B, Austin TX',
    paymentMethod: 'Visa •••• 1234',
    role: 'customer',
  });
  const [selectedPlan, setSelectedPlan] = useState('Cutting Plan');
  const [trackingReturnRoute, setTrackingReturnRoute] = useState('orders');
  const [adminData, setAdminData] = useState({
    meals: { cutting: [], bulking: [], maintenance: [] },
    orders: [
      { id: 'ORD-8921', plan: 'Bulking Plan (Level 3)', customer: 'Sarah Jenkins', status: 'Preparing', date: 'Oct 24, 2023', payment: 'Online', proof: null },
      { id: 'ORD-8922', plan: 'Lean Green Plan', customer: 'Marcus Thorne', status: 'Delivered', date: 'Oct 24, 2023', payment: 'Cash', proof: null },
      { id: 'ORD-8923', plan: 'Performance Pro', customer: 'Elena Rossi', status: 'Out for Delivery', date: 'Oct 23, 2023', payment: 'Online', proof: 'https://via.placeholder.com/300' },
    ],
  });
  const [adminActiveCategory, setAdminActiveCategory] = useState(null);
  const [adminSelectedOrder, setAdminSelectedOrder] = useState(null);

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
      setRoute('login');
      return;
    }
    const role = session.user.app_metadata?.role || 'customer';
    setUser((prev) => ({
      ...prev,
      role,
      email: session.user.email,
      name: session.user.user_metadata?.full_name || (role === 'admin' ? 'FitFood Admin' : 'Customer'),
      goal: session.user.user_metadata?.goal || prev.goal,
    }));
    
    // Ensure we route to the appropriate home if currently on login or register
    setRoute((current) => {
      if (current === 'login' || current === 'register') {
        return role === 'admin' ? 'adminHome' : 'home';
      }
      return current; // Preserve route if already logged in and navigating
    });
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      setRoute('login');
    }
  };
  const handleOpenCheckout = (planName) => {
    setSelectedPlan(planName);
    setRoute('checkout');
  };

  const handleOpenTracking = (returnRoute) => {
    setTrackingReturnRoute(returnRoute);
    setRoute(returnRoute && returnRoute.startsWith('admin') ? 'adminTracking' : 'tracking');
  };

  const handleOpenAdminCategory = (key) => {
    setAdminActiveCategory(key);
    setRoute('adminMealCategory');
  };

  const handleCreateMeal = () => {
    setRoute('adminMealForm');
  };

  const handleSaveMeal = (meal) => {
    const id = `MEAL-${Date.now()}`;
    const category = meal.category || adminActiveCategory || 'cutting';
    setAdminData((prev) => ({
      ...prev,
      meals: { ...prev.meals, [category]: [...(prev.meals[category] || []), { id, ...meal }] },
    }));
  };

  const handleOpenOrderDetails = (order) => {
    setAdminSelectedOrder(order);
    setRoute('adminOrderDetails');
  };

  const handleUpdateOrder = (updated) => {
    setAdminData((prev) => ({ ...prev, orders: prev.orders.map((o) => (o.id === updated.id ? updated : o)) }));
    setRoute('adminOrders');
  };

  const handleSaveProfile = (updatedUser) => {
    setUser(updatedUser);
    setRoute('profile');
  };

  const renderScreen = () => {
    if (!sessionLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.brand }}>Loading...</Text>
        </View>
      );
    }
    switch (route) {
      case 'login':
        return <LoginScreen onNavigateRegister={() => setRoute('register')} />;
      case 'register':
        return <RegisterScreen onBack={() => setRoute('login')} />;
      case 'home':
        return <HomeScreen user={user} onOpenWeeklyPlan={() => setRoute('weeklyPlan')} onOpenCheckout={handleOpenCheckout} onSwitchToAdmin={() => setRoute('adminHome')} />;
      case 'orders':
        return <OrdersScreen onOpenCheckout={handleOpenCheckout} onOpenReview={() => setRoute('review')} />;
      case 'tracking':
        return <OrderTrackingScreen onBack={() => setRoute(trackingReturnRoute)} />;
      case 'profile':
        return <ProfileScreen user={user} onLogout={handleLogout} onNavigateSetting={(section) => { setProfileEditSection(section); setRoute('profileEdit'); }} />;
      case 'profileEdit':
        return <EditProfileScreen section={profileEditSection} user={user} onSave={handleSaveProfile} onBack={() => setRoute('profile')} />;
      case 'checkout':
        return <CheckoutScreen planName={selectedPlan} onBack={() => setRoute('orders')} onConfirm={() => setRoute('orders')} />;
      case 'review':
        return <ReviewScreen onBack={() => setRoute('orders')} onSubmit={() => setRoute('orders')} />;
      case 'weeklyPlan':
        return <WeeklyPlanScreen onBack={() => setRoute('home')} onPreorder={() => handleOpenCheckout('Bulking Plan')} />;
      case 'adminHome':
        return <AdminDashboardScreen user={user} onLogout={handleLogout} onCreateMeal={handleCreateMeal} onViewCustomer={() => setRoute('home')} />;
      case 'adminOrders':
        return <AdminOrdersScreen orders={adminData.orders} onOpenTracking={() => handleOpenTracking('adminOrders')} onViewCustomer={() => setRoute('home')} onOpenDetails={handleOpenOrderDetails} />;
      case 'adminTracking':
        return <AdminTrackingScreen onBack={() => setRoute(trackingReturnRoute)} />;
      case 'adminMeals':
        return <AdminMealsScreen onOpenCategory={handleOpenAdminCategory} onCreateMeal={handleCreateMeal} />;
      case 'adminMealCategory':
        return <AdminMealCategoryScreen category={adminActiveCategory} meals={adminData.meals[adminActiveCategory]} onBack={() => setRoute('adminMeals')} onAdd={() => setRoute('adminMealForm')} />;
      case 'adminMealForm':
        return <AdminMealForm category={adminActiveCategory} onSave={handleSaveMeal} onBack={() => setRoute('adminMeals')} />;
      case 'adminOrderDetails':
        return <AdminOrderDetailsScreen order={adminSelectedOrder} onBack={() => setRoute('adminOrders')} onUpdate={handleUpdateOrder} />;
      case 'adminDelivery':
        return <AdminDeliveryScreen />;
      default:
        return <HomeScreen user={user} onOpenWeeklyPlan={() => setRoute('weeklyPlan')} onOpenCheckout={handleOpenCheckout} onSwitchToAdmin={() => setRoute('adminHome')} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>{renderScreen()}</View>
      {['home', 'orders', 'profile'].includes(route) && (
        <BottomNav active={route} onChange={setRoute} />
      )}
      {['adminHome', 'adminOrders', 'adminTracking', 'adminMeals', 'adminDelivery'].includes(route) && (
        <AdminBottomNav active={route} onChange={setRoute} />
      )}
    </SafeAreaView>
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
});
