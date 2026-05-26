import AppText from '../components/AppText';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View, Pressable, Alert, ActivityIndicator, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
import { usePlans } from '../context/PlansContext';
import { addMealToPlan, deleteMeal, updateMeal } from '../services/mealsService';
import { normalizeDayLabel, MEAL_TYPES } from '../services/plansService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAY_TO_FULL = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

function normalizeInitialDay(day) {
  if (DAYS.includes(day)) return day;
  return SHORT_DAY_TO_FULL[day] || 'Monday';
}

function hasMissingDay(meals = []) {
  const readyDays = new Set(meals.map((meal) => normalizeDayLabel(meal.day_of_week)));
  return DAYS.some((day) => !readyDays.has(normalizeDayLabel(day)));
}

function normalizeNumberText(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return '0';
  return String(parsed);
}

function stepNumberText(value, delta) {
  const current = parseInt(value, 10);
  return String(Math.max(0, (Number.isNaN(current) ? 0 : current) + delta));
}

function MacroStepper({ label, value, onChangeText, step = 1, styles, colors }) {
  return (
    <View style={styles.macroField}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <View style={styles.stepperInput}>
        <TextInput
          style={styles.stepperTextInput}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
          onBlur={() => onChangeText(normalizeNumberText(value))}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
        />
        <View style={styles.stepperControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Increase ${label}`}
            style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
            onPress={() => onChangeText(stepNumberText(value, step))}
          >
            <Feather name="chevron-up" size={16} color={colors.brand} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${label}`}
            style={({ pressed }) => [styles.stepperButton, styles.stepperButtonBottom, pressed && styles.pressed]}
            onPress={() => onChangeText(stepNumberText(value, -step))}
          >
            <Feather name="chevron-down" size={16} color={colors.brand} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function AdminMealForm({ initialPlanId, initialDay, onBack }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { loadMealsForPlan, loadPlans, meals, plans, savePlan } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || plans?.[0]?.id || null);
  const [selectedDay, setSelectedDay] = useState(normalizeInitialDay(initialDay));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);
  const [mealName, setMealName] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [loading, setLoading] = useState(false);
  
  const activePlan = plans?.find((p) => p.id === selectedPlanId);
  const selectedDayLabel = normalizeDayLabel(selectedDay);
  const existingMeals = meals.filter((meal) => normalizeDayLabel(meal.day_of_week) === selectedDayLabel);
  const readyDayLabels = useMemo(() => (
    new Set(meals.map((meal) => normalizeDayLabel(meal.day_of_week)))
  ), [meals]);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId);
      return;
    }
    if (!selectedPlanId && plans?.[0]?.id) {
      setSelectedPlanId(plans[0].id);
    }
  }, [initialPlanId, plans, selectedPlanId]);

  useEffect(() => {
    if (activePlan) {
      loadMealsForPlan(activePlan);
    }
  }, [activePlan, loadMealsForPlan]);

  useEffect(() => {
    if (initialDay) {
      setSelectedDay(normalizeInitialDay(initialDay));
    }
  }, [initialDay]);

  const resetMealForm = () => {
    setEditingMealId(null);
    setMealType('Breakfast');
    setMealName('');
    setDescription('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  const handleEditMeal = (meal) => {
    setEditingMealId(meal.id);
    setMealType(meal.meal_type || 'Breakfast');
    setMealName(meal.meal_name || '');
    setDescription(meal.description || '');
    setCalories(meal.calories?.toString() || '');
    setProtein(meal.protein_g?.toString() || '');
    setCarbs(meal.carbs_g?.toString() || '');
    setFats(meal.fats_g?.toString() || '');
    setIsModalVisible(true);
  };

  const handleDeleteMeal = (meal) => {
    Alert.alert(
      'Delete meal?',
      `This will remove "${meal.meal_name}".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const remainingMeals = meals.filter((existingMeal) => existingMeal.id !== meal.id);
            const { error } = await deleteMeal(meal.id);
            if (error) {
              Alert.alert('Delete Failed', error.message);
              return;
            }
            if (activePlan?.is_published && hasMissingDay(remainingMeals)) {
              await savePlan({
                week_start_date: activePlan.week_start_date,
                name: activePlan.name,
                category: activePlan.category,
                description: activePlan.description || '',
                weekly_price: Number(activePlan.weekly_price) || 0,
                is_published: false,
              }, activePlan.id);
            }
            if (activePlan) {
              loadMealsForPlan(activePlan);
            }
          },
        },
      ],
    );
  };

  const handleSave = async () => {
    if (!mealName.trim()) {
      Alert.alert('Validation', 'Please enter a meal name.');
      return;
    }
    if (!selectedPlanId) {
      Alert.alert('Validation', 'No active plan found to add a meal to.');
      return;
    }

    setLoading(true);
    const mealPayload = {
      day_of_week: selectedDay,
      meal_type: mealType,
      meal_name: mealName.trim(),
      description: description.trim(),
      calories: parseInt(calories, 10) || 0,
      protein_g: parseInt(protein, 10) || 0,
      carbs_g: parseInt(carbs, 10) || 0,
      fats_g: parseInt(fats, 10) || 0,
    };

    const { error } = editingMealId
      ? await updateMeal(editingMealId, mealPayload)
      : await addMealToPlan(selectedPlanId, mealPayload);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    console.log('✅ [Meals] Meal added to plan successfully.');
    await loadPlans();
    if (activePlan) {
      await loadMealsForPlan(activePlan);
    }
    setIsModalVisible(false);
    resetMealForm();
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <HeaderBar title="Manage Meals" onBack={onBack} />

        <View style={styles.heroCard}>
          <AppText style={styles.heroCategory}>{activePlan?.category?.toUpperCase() || 'PLAN'}</AppText>
          <AppText style={styles.heroTitle}>{activePlan?.name || 'Select a Plan'}</AppText>
        </View>

        <AppText style={styles.fieldLabel}>Day of Week</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {DAYS.map((day) => {
            const isMissing = !readyDayLabels.has(normalizeDayLabel(day));
            return (
              <Pressable
                key={day}
                style={[styles.chip, selectedDay === day && styles.chipActive]}
                onPress={() => setSelectedDay(day)}
              >
                <AppText style={[styles.chipText, selectedDay === day && styles.chipTextActive]}>
                  {day.slice(0, 3)}
                </AppText>
                {isMissing && <View style={[styles.missingDot, selectedDay === day && styles.missingDotActive]} />}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.existingSection}>
          <View style={styles.existingSectionHeader}>
            <AppText style={styles.existingTitle}>{selectedDay} Meals</AppText>
            <Pressable style={styles.addMealButton} onPress={() => { resetMealForm(); setIsModalVisible(true); }}>
              <Feather name="plus" size={16} color={colors.surface} />
              <AppText style={styles.addMealButtonText}>Add</AppText>
            </Pressable>
          </View>
          {existingMeals.length === 0 && (
            <View style={styles.emptyMealNotice}>
              <View style={styles.emptyMealDot} />
              <AppText style={styles.existingEmpty}>Missing day: add at least one meal before this plan can be published.</AppText>
            </View>
          )}
          {existingMeals.map((meal) => (
            <View key={meal.id} style={styles.existingMealCard}>
              <View style={styles.existingMealInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <AppText style={styles.existingMealTitle}>{meal.meal_name}</AppText>
                  <View style={{ backgroundColor: colors.brand, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                    <AppText style={{ color: colors.surface, fontSize: 10, fontWeight: '700' }}>
                      {meal.meal_type || 'Lunch'}
                    </AppText>
                  </View>
                </View>
                <AppText style={styles.existingMealMeta}>{meal.calories || 0} kcal | P {meal.protein_g || 0}g | C {meal.carbs_g || 0}g | F {meal.fats_g || 0}g</AppText>
              </View>
              <View style={styles.existingMealActions}>
                <Pressable style={styles.smallIconAction} onPress={() => handleEditMeal(meal)}>
                  <Feather name="edit-2" size={16} color={colors.brand} />
                </Pressable>
                <Pressable style={[styles.smallIconAction, styles.smallIconDelete]} onPress={() => handleDeleteMeal(meal)}>
                  <Feather name="trash-2" size={16} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsModalVisible(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <AppText style={styles.modalTitle}>{editingMealId ? 'Edit Meal' : 'Add Meal'}</AppText>
                <AppText style={styles.modalSubtitle}>{selectedDay}</AppText>
              </View>
              <Pressable style={styles.modalCloseButton} onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={20} color={colors.brand} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <AppText style={styles.fieldLabel}>Meal Type</AppText>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 4 }}>
                {MEAL_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.chip, mealType === type && styles.chipActive, { marginRight: 0 }]}
                    onPress={() => setMealType(type)}
                  >
                    <AppText style={[styles.chipText, mealType === type && styles.chipTextActive]}>
                      {type}
                    </AppText>
                  </Pressable>
                ))}
              </View>

              <AppText style={styles.fieldLabel}>Meal Name</AppText>
              <TextInput
                style={styles.input}
                value={mealName}
                onChangeText={setMealName}
                placeholder="e.g., Grilled Chicken Salad"
                placeholderTextColor={colors.textTertiary}
              />

              <AppText style={styles.fieldLabel}>Description</AppText>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Briefly describe ingredients and benefits..."
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textTertiary}
              />

              <View style={styles.macroRow}>
                <MacroStepper label="Calories" value={calories} onChangeText={setCalories} step={10} styles={styles} colors={colors} />
                <MacroStepper label="Protein (g)" value={protein} onChangeText={setProtein} styles={styles} colors={colors} />
              </View>

              <View style={styles.macroRow}>
                <MacroStepper label="Carbs (g)" value={carbs} onChangeText={setCarbs} styles={styles} colors={colors} />
                <MacroStepper label="Fats (g)" value={fats} onChangeText={setFats} styles={styles} colors={colors} />
              </View>

              <Pressable style={[styles.saveButton, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
                {loading
                  ? <ActivityIndicator color={colors.surface} />
                  : <AppText style={styles.saveText}>{editingMealId ? 'Update Meal' : 'Save Meal'}</AppText>
                }
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 120 },
  heroCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  heroCategory: { color: colors.accent, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  heroTitle: { color: colors.brand, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  existingSection: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 14 },
  existingSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  existingTitle: { color: colors.brand, fontSize: 16, fontWeight: '900' },
  addMealButton: { flexDirection: 'row', backgroundColor: colors.brand, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center' },
  addMealButtonText: { color: colors.surface, fontSize: 12, fontWeight: '900', marginLeft: 4 },
  existingEmpty: { color: colors.textSecondary, fontSize: 13 },
  existingMealCard: { backgroundColor: colors.inputBg, borderRadius: 16, padding: 12, marginBottom: 10 },
  existingMealInfo: { marginBottom: 10 },
  existingMealTitle: { color: colors.brand, fontWeight: '900', marginBottom: 4 },
  existingMealMeta: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  existingMealActions: { flexDirection: 'row' },
  smallIconAction: { width: 36, height: 36, backgroundColor: colors.surfaceGreen, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  smallIconDelete: { backgroundColor: colors.dangerSubtle },
  fieldLabel: { color: colors.brand, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  chipRow: { marginBottom: 4 },
  chip: { backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 18, marginRight: 10, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.textSecondary, fontWeight: '700' },
  chipTextActive: { color: colors.surface },
  missingDot: { position: 'absolute', top: 6, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger },
  missingDotActive: { backgroundColor: colors.surface },
  emptyMealNotice: { flexDirection: 'row', alignItems: 'flex-start' },
  emptyMealDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, marginTop: 5, marginRight: 8 },
  input: { backgroundColor: colors.inputBg, borderRadius: 16, padding: 16, color: colors.brand },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  macroRow: { flexDirection: 'row', gap: 12 },
  macroField: { flex: 1 },
  stepperInput: { minHeight: 54, flexDirection: 'row', alignItems: 'stretch', backgroundColor: colors.inputBg, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  stepperTextInput: { flex: 1, paddingHorizontal: 14, color: colors.brand, fontSize: 16, fontWeight: '800' },
  stepperControls: { width: 40, borderLeftWidth: 1, borderLeftColor: colors.border },
  stepperButton: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceGreen },
  stepperButtonBottom: { borderTopWidth: 1, borderTopColor: colors.border },
  pressed: { opacity: 0.75 },
  saveButton: { backgroundColor: colors.brand, paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 20 },
  saveText: { color: colors.surface, fontWeight: '800', fontSize: 16 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10, 22, 14, 0.35)' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { color: colors.brand, fontSize: 20, fontWeight: '900', marginBottom: 2 },
  modalSubtitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  modalCloseButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  modalScrollContent: { paddingBottom: 20 },
});
