import AppText from '../components/AppText';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
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
  const missingDays = DAY_ORDER.filter((day) => !readyDays.has(day));
  return {
    readyCount,
    missingDays,
    isReady: readyCount === DAY_ORDER.length,
    label: `${readyCount}/${DAY_ORDER.length} days ready`,
  };
}

export default function AdminPlanFormScreen({ initialPlan, defaults, onBack }) {
  const { colors, isDark, setTheme } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
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

  useEffect(() => {
    if (!mealsLoading && form.is_published && !readiness.isReady) {
      updateForm('is_published', false);
    }
  }, [form.is_published, mealsLoading, readiness.isReady]);

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

    const shouldPublish = form.is_published && canPublish;

    setSaving(true);
    const { error } = await savePlan({
      week_start_date: form.week_start_date.trim(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      weekly_price: Number(form.weekly_price) || 0,
      is_published: shouldPublish,
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
      <HeaderBar 
        title={isEditing ? 'Edit Weekly Plan' : 'Create Weekly Plan'} 
        onBack={onBack} 
        action={{
          icon: isDark ? "moon" : "sun",
          onPress: () => setTheme(isDark ? "light" : "dark"),
          label: "Toggle Theme",
        }}
      />

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
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
        />

        <AppText style={styles.fieldLabel}>Plan Name</AppText>
        <TextInput
          value={form.name}
          onChangeText={(value) => updateForm('name', value)}
          placeholder="e.g., Cut - June 1"
          placeholderTextColor={colors.textTertiary}
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
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, styles.textarea]}
          multiline
        />

        <AppText style={styles.fieldLabel}>Weekly Price</AppText>
        <TextInput
          value={form.weekly_price}
          onChangeText={(value) => updateForm('weekly_price', value)}
          placeholder="149.99"
          placeholderTextColor={colors.textTertiary}
          keyboardType="decimal-pad"
          style={styles.input}
        />

        <View style={styles.readinessCard}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText style={styles.readinessTitle}>Meal Readiness</AppText>
            <AppText style={[styles.readinessText, readiness.isReady ? styles.readyText : styles.missingText]}>
              {mealsLoading ? 'Checking meals...' : readiness.label}
            </AppText>
            {!mealsLoading && !readiness.isReady && isEditing && (
              <>
                <View style={styles.missingDayRow}>
                  {readiness.missingDays.map((day) => (
                    <View key={day} style={styles.missingDayChip}>
                      <View style={styles.missingDayDot} />
                      <AppText style={styles.missingDayText}>{day}</AppText>
                    </View>
                  ))}
                </View>
                <AppText style={styles.readinessNote}>
                  You can save plan details, but customers will not see this until the missing meals are filled.
                </AppText>
              </>
            )}
          </View>
          {mealsLoading && <ActivityIndicator color={colors.accent} />}
        </View>

        <View style={styles.publishRow}>
          <View style={styles.publishCopy}>
            <AppText style={styles.publishLabel}>{form.is_published && canPublish ? 'Published' : 'Draft'}</AppText>
            <AppText style={styles.publishHint}>
              {canPublish ? 'Ready for customer visibility' : 'Incomplete plans save as draft until every day has meals'}
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
              ? <ActivityIndicator color={colors.surface} />
              : <AppText style={styles.primaryButtonText}>{isEditing ? 'Save Changes' : 'Create Draft'}</AppText>
            }
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 120 },
  heroCard: { backgroundColor: colors.surfaceGreen, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 16 },
  heroKicker: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 5 },
  heroTitle: { color: colors.brand, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  heroText: { color: colors.textSecondary, lineHeight: 20 },
  formCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: colors.border },
  fieldLabel: { color: colors.brand, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  input: { backgroundColor: colors.inputBg, borderRadius: 16, padding: 14, color: colors.brand },
  textarea: { minHeight: 86, textAlignVertical: 'top' },
  inlineChips: { flexDirection: 'row', flexWrap: 'wrap' },
  smallChip: { minHeight: 44, backgroundColor: colors.surfaceGreen, borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 13, marginRight: 8, marginBottom: 8 },
  smallChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  smallChipText: { color: colors.brand, fontWeight: '800', fontSize: 12 },
  smallChipTextActive: { color: colors.surface },
  readinessCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.highlightSubtle, borderRadius: 18, padding: 14, marginTop: 16 },
  readinessTitle: { color: colors.brand, fontWeight: '900', marginBottom: 4 },
  readinessText: { fontSize: 12, fontWeight: '900' },
  readyText: { color: colors.success },
  missingText: { color: colors.danger },
  missingDayRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  missingDayChip: { minHeight: 28, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.dangerSubtle, borderRadius: 999, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 },
  missingDayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger, marginRight: 5 },
  missingDayText: { color: colors.danger, fontSize: 11, fontWeight: '900' },
  readinessNote: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  publishRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  publishCopy: { flex: 1, paddingRight: 12 },
  publishLabel: { color: colors.brand, fontWeight: '900' },
  publishHint: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  publishToggle: { minHeight: 44, minWidth: 58, backgroundColor: colors.inputBg, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  publishToggleActive: { backgroundColor: colors.highlightSubtle },
  publishToggleDisabled: { opacity: 0.55 },
  publishToggleText: { color: colors.muted, fontWeight: '900' },
  publishToggleTextActive: { color: colors.brand },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 18 },
  primaryButton: { minHeight: 48, backgroundColor: colors.brand, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: colors.surface, fontWeight: '900' },
  secondaryButton: { minHeight: 48, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 18, marginRight: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: colors.brand, fontWeight: '900' },
  buttonDisabled: { opacity: 0.65 },
  pressed: { opacity: 0.75 },
});
