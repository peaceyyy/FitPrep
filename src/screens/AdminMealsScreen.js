import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const categories = [
  { key: 'cutting', label: 'Cutting' },
  { key: 'bulking', label: 'Bulking' },
  { key: 'maintenance', label: 'Maintenance' },
];

const plans = [
  { id: 'p1', title: 'Cutting', subtitle: 'Optimized for fat loss while maintaining lean muscle mass.', calories: '1,800 - 2,100 kcal', macros: '40/30/30', price: '$149.99/mo', image: 'https://via.placeholder.com/120' },
  { id: 'p2', title: 'Maintenance', subtitle: 'Balanced nutrition to sustain current weight and energy levels.', calories: '2,400 - 2,700 kcal', macros: '30/40/30', price: '$159.99/mo', image: 'https://via.placeholder.com/120' },
  { id: 'p3', title: 'Bulking', subtitle: 'High-calorie surplus designed for maximum muscle growth.', calories: '3,200 - 3,600 kcal', macros: '35/45/20', price: '$179.99/mo', image: 'https://via.placeholder.com/120' },
];

export default function AdminMealsScreen({ onOpenCategory, onCreateMeal }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Meal Management" action={{ icon: '🔔', onPress: () => {} }} />

      <Text style={styles.subHeading}>ADMINISTRATION</Text>
      <Text style={styles.title}>Active Meal Plans</Text>

      <View style={styles.tabRow}>
        {categories.map((c) => (
          <Pressable key={c.key} style={styles.tabChip} onPress={() => onOpenCategory(c.key)}>
            <Text style={styles.tabLabel}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      {plans.map((plan) => (
        <View key={plan.id} style={styles.planCard}>
          <Image source={{ uri: plan.image }} style={styles.planImage} />
          <View style={styles.planBody}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
            <Text style={styles.planCalories}>{plan.calories}</Text>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>P/C/F</Text>
              <Text style={styles.macroValue}>{plan.macros}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <View style={styles.controlsRow}>
                <Pressable style={styles.actionButton}>
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable style={[styles.actionButton, styles.deleteButton]}>
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      ))}

      <Pressable style={styles.addFab} onPress={onCreateMeal}>
        <Text style={styles.addFabText}>＋</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 140 },
  subHeading: { color: COLORS.accent, fontSize: 12, letterSpacing: 1.2, marginBottom: 6 },
  title: { color: COLORS.brand, fontSize: 28, fontWeight: '900', marginBottom: 16 },
  tabRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  tabChip: { backgroundColor: COLORS.surface, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: COLORS.border },
  tabLabel: { color: COLORS.brand, fontWeight: '700' },
  planCard: { backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, marginBottom: 18, overflow: 'hidden' },
  planImage: { width: '100%', height: 140, backgroundColor: '#e8ecdf' },
  planBody: { padding: 18 },
  planTitle: { color: COLORS.brand, fontSize: 20, fontWeight: '900', marginBottom: 8 },
  planSubtitle: { color: COLORS.textSecondary, marginBottom: 12 },
  planCalories: { color: COLORS.accent, fontWeight: '700', marginBottom: 10 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#eef4dd', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14 },
  macroLabel: { color: COLORS.muted, fontSize: 12 },
  macroValue: { color: COLORS.brand, fontWeight: '800' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planPrice: { color: COLORS.accent, fontSize: 18, fontWeight: '900' },
  controlsRow: { flexDirection: 'row' },
  actionButton: { backgroundColor: '#edf7d7', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 8 },
  actionText: { color: COLORS.brand, fontWeight: '800' },
  deleteButton: { backgroundColor: '#fff6f6' },
  deleteText: { color: COLORS.danger },
  addFab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
  addFabText: { color: '#fff', fontSize: 32, fontWeight: '900' },
});
