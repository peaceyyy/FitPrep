import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';

const previewPlans = [
  { title: 'Cutting', subtitle: 'Designed for fat loss while preserving muscle.', price: '$99/week', calories: '1,800 - 2,200 kcal', selected: true },
  { title: 'Bulking', subtitle: 'Muscle growth with strong nutrition support.', price: '$119/week', calories: '2,800 - 3,200 kcal' },
  { title: 'Maintenance', subtitle: 'Balanced energy for long-term health.', price: '$109/week', calories: '2,300 - 2,500 kcal' },
];

export default function HomeScreen({ user, onOpenWeeklyPlan, onOpenCheckout, onSwitchToAdmin }) {
  const { plans, loading, error, source } = usePlans();
  const planCount = Array.isArray(plans) ? plans.length : 0;
  const statusLabel = loading ? 'Loading plans...' : `Plans loaded: ${planCount} (${source})`;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar
        title="Fuel your performance."
        action={{ icon: '🔔', onPress: () => {} }}
      />

      <View style={styles.dataStatusCard}>
        <Text style={styles.dataStatusText}>{statusLabel}</Text>
        {error ? <Text style={styles.dataStatusError}>{error}</Text> : null}
      </View>

      <Text style={styles.greeting}>Hello, {user.name}</Text>
      <Text style={styles.description}>Precision nutrition tailored for your fitness goals. Freshly prepared, chef-curated.</Text>

      {user.role === 'admin' && (
        <Pressable style={styles.adminPreviewButton} onPress={onSwitchToAdmin}>
          <Text style={styles.adminPreviewText}>Return to Admin Panel</Text>
        </Pressable>
      )}

      {previewPlans.map((plan) => (
        <View key={plan.title} style={[styles.planCard, plan.selected && styles.planCardActive]}>
          <View style={styles.planMedia}>
            <View style={styles.planMediaPlaceholder} />
            {plan.selected && <View style={styles.selectedBadge}><Text style={styles.selectedBadgeText}>SELECTED</Text></View>}
          </View>
          <View style={styles.planBody}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planMeta}>{plan.calories}</Text>
            <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
          </View>
          <View style={styles.planFooter}>
            <Text style={styles.planPrice}>{plan.price}</Text>
            <Pressable style={[styles.planAction, plan.selected && styles.planActionPrimary]} onPress={() => onOpenCheckout(plan.title)}>
              <Text style={[styles.planActionText, plan.selected && styles.planActionTextPrimary]}>{plan.selected ? 'Update Plan' : 'Choose Plan'}</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.statsCard}>
        <Text style={styles.statsHeading}>Daily Macro Targets</Text>
        <View style={styles.macroRow}><Text style={styles.macroLabel}>Protein</Text><Text style={styles.macroValue}>160g / 200g</Text></View>
        <View style={styles.macroTrack}><View style={[styles.macroFill, { width: '80%' }]} /></View>
        <View style={styles.macroRow}><Text style={styles.macroLabel}>Carbohydrates</Text><Text style={styles.macroValue}>120g / 150g</Text></View>
        <View style={styles.macroTrack}><View style={[styles.macroFill, { width: '75%' }]} /></View>
        <View style={styles.macroRow}><Text style={styles.macroLabel}>Fats</Text><Text style={styles.macroValue}>45g / 65g</Text></View>
        <View style={styles.macroTrack}><View style={[styles.macroFill, { width: '69%' }]} /></View>
      </View>

      <Pressable style={styles.ctaButton} onPress={onOpenWeeklyPlan}>
        <Text style={styles.ctaLabel}>View Weekly Plan</Text>
        <Text style={styles.ctaArrow}>→</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  dataStatusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  dataStatusText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  dataStatusError: {
    color: '#b00020',
    fontSize: 12,
    marginTop: 6,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 8,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#eef1e7',
  },
  planCardActive: {
    borderColor: COLORS.accent,
  },
  planMedia: {
    backgroundColor: '#f5f9ef',
    height: 160,
    borderRadius: 22,
    marginBottom: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  planMediaPlaceholder: {
    width: '90%',
    height: '90%',
    backgroundColor: '#dfe7d1',
    borderRadius: 18,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#dbf2a5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selectedBadgeText: {
    color: COLORS.brand,
    fontWeight: '700',
    fontSize: 11,
  },
  planBody: {
    marginBottom: 18,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 4,
  },
  planMeta: {
    color: COLORS.accent,
    fontWeight: '700',
    marginBottom: 10,
  },
  planSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
  },
  planAction: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  planActionPrimary: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  planActionText: {
    color: COLORS.brand,
    fontWeight: '700',
  },
  planActionTextPrimary: {
    color: '#ffffff',
  },
  adminPreviewButton: {
    backgroundColor: '#eef8d7',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 22,
  },
  adminPreviewText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
  },
  statsHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 18,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  macroLabel: {
    color: COLORS.muted,
    fontWeight: '700',
  },
  macroValue: {
    color: COLORS.brand,
    fontWeight: '700',
  },
  macroTrack: {
    height: 8,
    backgroundColor: '#ebf3dc',
    borderRadius: 999,
    marginBottom: 14,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 999,
  },
  ctaButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.brand,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  ctaLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  ctaArrow: {
    color: '#ffffff',
    fontSize: 18,
  },
});
