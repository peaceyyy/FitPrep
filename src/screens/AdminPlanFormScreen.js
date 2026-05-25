import AppText from '../components/AppText';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import { DAY_ORDER, PLAN_CATEGORIES, fetchMealsForPlan, normalizeDayLabel } from '../services/plansService';

function createInitialForm(plan, defaults) {
  return {
    week_start_date: plan?.week_start_date || defaults?.week_start_date || '',
    name: plan?.name || '',
    category: plan?.category || defaults?.category || 'Cutting',
    description: plan?.description || '',
    weekly_price: plan?.weekly_price?.toString() || '',
    is_published: Boolean(plan?.is_published),
  };
}

function getReadiness(meals = []) {
  const readyDays = new Set(meals.map((meal) => normalizeDayLabel(meal.day_of_week)));
  const readyCount = DAY_ORDER.filter((day) => readyDays.has(day)).length;
  return {
    readyCount,
    isReady: readyCount === DAY_ORDER.length,
    label: `${readyCount}/${DAY_ORDER.length} days ready`,
  };
}

export default function AdminPlanFormScreen({ initialPlan, defaults, onBack }) {
  const { currentWeekStartDate, savePlan } = usePlans();
  const [form, setForm] = useState(() => createInitialForm(initialPlan, {
    week_start_date: defaults?.week_start_date || currentWeekStartDate,
    category: defaults?.category || 'Cutting',
  }));
  const [saving, setSaving] = useState(false);
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(Boolean(initialPlan?.id));

  const isEditing = Boolean(initialPlan?.id);
  const readiness = useMemo(() => getReadiness(meals), [meals]);
  const canPublish = isEditing && readiness.isReady;

  useEffect(() => {
    let cancelled = false;

    async function loadMeals() {
      if (!initialPlan?.id) {
        setMeals([]);
        setMealsLoading(false);
        return;
      }

      setMealsLoading(true);
      const { data } = await fetchMealsForPlan(initialPlan.id);
      if (!cancelled) {
        setMeals(data || []);
        setMealsLoading(false);
      }
    }

    loadMeals();

    return () => {
      cancelled = true;
    };
  }, [initialPlan?.id]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePlan = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Please enter a plan name.');
      return;
    }

    if (!form.week_start_date.trim()) {
      Alert.alert('Validation', 'Please enter a week start date.');
      return;
    }

    if (form.is_published && !canPublish) {
      Alert.alert('Publishing Not Ready', 'Add meals for Monday through Sunday before publishing this plan.');
      return;
    }

    setSaving(true);
    const { error } = await savePlan({
      week_start_date: form.week_start_date.trim(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      weekly_price: Number(form.weekly_price) || 0,
      is_published: form.is_published,
    }, initialPlan?.id || null);
    setSaving(false);

    if (error) {
      Alert.alert('Save Failed', error.message);
      return;
    }

    onBack();
  };

  const handleTogglePublished = () => {
    if (!form.is_published && !canPublish) {
      Alert.alert(
        'Publishing Not Ready',
        isEditing
          ? 'Add meals for Monday through Sunday before publishing this plan.'
          : 'Create this plan first, add Monday-Sunday meals, then publish it.',
      );
      return;
    }

    updateForm('is_published', !form.is_published);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title={isEditing ? 'Edit Weekly Plan' : 'Create Weekly Plan'} onBack={onBack} />

      <View style={styles.heroCard}>
        <AppText style={styles.heroKicker}>{isEditing ? 'PLAN SETTINGS' : 'NEW WEEKLY PLAN'}</AppText>
        <AppText style={styles.heroTitle}>{form.name || `${form.category} Plan`}</AppText>
        <AppText style={styles.heroText}>
          {isEditing
            ? 'Update plan details, then publish once Monday-Sunday meals are ready.'
            : 'Create the plan as a draft first. Meals can be added after the plan exists.'}
        </AppText>
      </View>

      <View style={styles.formCard}>
        <AppText style={styles.fieldLabel}>Week Start Date</AppText>
        <TextInput
          value={form.week_start_date}
          onChangeText={(value) => updateForm('week_start_date', value)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={COLORS.textTertiary}
          style={styles.input}
        />

        <AppText style={styles.fieldLabel}>Plan Name</AppText>
        <TextInput
          value={form.name}
          onChangeText={(value) => updateForm('name', value)}
          placeholder="e.g., Cut - June 1"
          placeholderTextColor={COLORS.textTertiary}
          style={styles.input}
        />

        <AppText style={styles.fieldLabel}>Category</AppText>
        <View style={styles.inlineChips}>
          {PLAN_CATEGORIES.map((category) => (
            <Pressable
              key={category}
              style={({ pressed }) => [styles.smallChip, form.category === category && styles.smallChipActive, pressed && styles.pressed]}
              onPress={() => updateForm('category', category)}
            >
              <AppText style={[styles.smallChipText, form.category === category && styles.smallChipTextActive]}>
                {category}
              </AppText>
            </Pressable>
          ))}
        </View>

        <AppText style={styles.fieldLabel}>Description</AppText>
        <TextInput
          value={form.description}
          onChangeText={(value) => updateForm('description', value)}
          placeholder="Short customer-facing plan description"
          placeholderTextColor={COLORS.textTertiary}
          style={[styles.input, styles.textarea]}
          multiline
        />

        <AppText style={styles.fieldLabel}>Weekly Price</AppText>
        <TextInput
          value={form.weekly_price}
          onChangeText={(value) => updateForm('weekly_price', value)}
          placeholder="149.99"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <View style={styles.readinessCard}>
          <View>
            <AppText style={styles.readinessTitle}>Meal Readiness</AppText>
            <AppText style={[styles.readinessText, readiness.isReady ? styles.readyText : styles.missingText]}>
              {mealsLoading ? 'Checking meals...' : readiness.label}
            </AppText>
          </View>
          {mealsLoading && <ActivityIndicator color={COLORS.accent} />}
        </View>

        <View style={styles.publishRow}>
          <View style={styles.publishCopy}>
            <AppText style={styles.publishLabel}>{form.is_published ? 'Published' : 'Draft'}</AppText>
            <AppText style={styles.publishHint}>
              {canPublish ? 'Ready for customer visibility' : 'Requires Monday-Sunday meals before publishing'}
            </AppText>
          </View>
          <Pressable
            style={({ pressed }) => [styles.publishToggle, form.is_published && styles.publishToggleActive, !canPublish && !form.is_published && styles.publishToggleDisabled, pressed && styles.pressed]}
            onPress={handleTogglePublished}
          >
            <AppText style={[styles.publishToggleText, form.is_published && styles.publishToggleTextActive]}>
              {form.is_published ? 'On' : 'Off'}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.formActions}>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={onBack}>
            <AppText style={styles.secondaryButtonText}>Cancel</AppText>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.primaryButton, saving && styles.buttonDisabled, pressed && styles.pressed]} onPress={handleSavePlan} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#ffffff" />
              : <AppText style={styles.primaryButtonText}>{isEditing ? 'Save Changes' : 'Create Draft'}</AppText>
            }
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  heroCard: { backgroundColor: '#edf7d7', borderRadius: 22, borderWidth: 1, borderColor: '#d9ebaf', padding: 18, marginBottom: 16 },
  heroKicker: { color: COLORS.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 5 },
  heroTitle: { color: COLORS.brand, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  heroText: { color: COLORS.textSecondary, lineHeight: 20 },
  formCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  fieldLabel: { color: COLORS.brand, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  input: { backgroundColor: COLORS.inputBg, borderRadius: 16, padding: 14, color: COLORS.brand },
  textarea: { minHeight: 86, textAlignVertical: 'top' },
  inlineChips: { flexDirection: 'row', flexWrap: 'wrap' },
  smallChip: { minHeight: 44, backgroundColor: '#f4f7ef', borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 12, paddingHorizontal: 13, marginRight: 8, marginBottom: 8 },
  smallChipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  smallChipText: { color: COLORS.brand, fontWeight: '800', fontSize: 12 },
  smallChipTextActive: { color: COLORS.surface },
  readinessCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f4f7ef', borderRadius: 18, padding: 14, marginTop: 16 },
  readinessTitle: { color: COLORS.brand, fontWeight: '900', marginBottom: 4 },
  readinessText: { fontSize: 12, fontWeight: '900' },
  readyText: { color: COLORS.success },
  missingText: { color: COLORS.danger },
  publishRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  publishCopy: { flex: 1, paddingRight: 12 },
  publishLabel: { color: COLORS.brand, fontWeight: '900' },
  publishHint: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  publishToggle: { minHeight: 44, minWidth: 58, backgroundColor: '#f0f1ea', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  publishToggleActive: { backgroundColor: '#dff4da' },
  publishToggleDisabled: { opacity: 0.55 },
  publishToggleText: { color: COLORS.muted, fontWeight: '900' },
  publishToggleTextActive: { color: COLORS.brand },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 18 },
  primaryButton: { minHeight: 48, backgroundColor: COLORS.brand, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: COLORS.surface, fontWeight: '900' },
  secondaryButton: { minHeight: 48, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 18, marginRight: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: COLORS.brand, fontWeight: '900' },
  buttonDisabled: { opacity: 0.65 },
  pressed: { opacity: 0.75 },
});
