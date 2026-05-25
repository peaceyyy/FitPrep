import AppText from '../components/AppText';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, Alert, ActivityIndicator, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import { addMealToPlan, deleteMeal, updateMeal } from '../services/mealsService';
import { normalizeDayLabel, MEAL_TYPES } from '../services/plansService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function normalizeNumberText(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return '0';
  return String(parsed);
}

function stepNumberText(value, delta) {
  const current = parseInt(value, 10);
  return String(Math.max(0, (Number.isNaN(current) ? 0 : current) + delta));
}

function MacroStepper({ label, value, onChangeText, step = 1 }) {
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
          placeholderTextColor={COLORS.textTertiary}
        />
        <View style={styles.stepperControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Increase ${label}`}
            style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
            onPress={() => onChangeText(stepNumberText(value, step))}
          >
            <Feather name="chevron-up" size={16} color={COLORS.brand} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${label}`}
            style={({ pressed }) => [styles.stepperButton, styles.stepperButtonBottom, pressed && styles.pressed]}
            onPress={() => onChangeText(stepNumberText(value, -step))}
          >
            <Feather name="chevron-down" size={16} color={COLORS.brand} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function AdminMealForm({ initialPlanId, onBack }) {
  const { loadMealsForPlan, loadPlans, meals, plans } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || plans?.[0]?.id || null);
  const [selectedDay, setSelectedDay] = useState('Monday');
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
            const { error } = await deleteMeal(meal.id);
            if (error) {
              Alert.alert('Delete Failed', error.message);
              return;
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
          {DAYS.map((day) => (
            <Pressable
              key={day}
              style={[styles.chip, selectedDay === day && styles.chipActive]}
              onPress={() => setSelectedDay(day)}
            >
              <AppText style={[styles.chipText, selectedDay === day && styles.chipTextActive]}>
                {day.slice(0, 3)}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.existingSection}>
          <View style={styles.existingSectionHeader}>
            <AppText style={styles.existingTitle}>{selectedDay} Meals</AppText>
            <Pressable style={styles.addMealButton} onPress={() => { resetMealForm(); setIsModalVisible(true); }}>
              <Feather name="plus" size={16} color={COLORS.surface} />
              <AppText style={styles.addMealButtonText}>Add</AppText>
            </Pressable>
          </View>
          {existingMeals.length === 0 && (
            <AppText style={styles.existingEmpty}>No meals scheduled for this day yet.</AppText>
          )}
          {existingMeals.map((meal) => (
            <View key={meal.id} style={styles.existingMealCard}>
              <View style={styles.existingMealInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <AppText style={styles.existingMealTitle}>{meal.meal_name}</AppText>
                  <View style={{ backgroundColor: COLORS.brand, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                    <Text style={{ color: COLORS.surface, fontSize: 10, fontWeight: '700' }}>
                      {meal.meal_type || 'Lunch'}
                    </Text>
                  </View>
                </View>
                <AppText style={styles.existingMealMeta}>{meal.calories || 0} kcal | P {meal.protein_g || 0}g | C {meal.carbs_g || 0}g | F {meal.fats_g || 0}g</AppText>
              </View>
              <View style={styles.existingMealActions}>
                <Pressable style={styles.smallIconAction} onPress={() => handleEditMeal(meal)}>
                  <Feather name="edit-2" size={16} color={COLORS.brand} />
                </Pressable>
                <Pressable style={[styles.smallIconAction, styles.smallIconDelete]} onPress={() => handleDeleteMeal(meal)}>
                  <Feather name="trash-2" size={16} color={COLORS.danger} />
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
                <Feather name="x" size={20} color={COLORS.brand} />
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
                placeholderTextColor={COLORS.textTertiary}
              />

              <AppText style={styles.fieldLabel}>Description</AppText>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Briefly describe ingredients and benefits..."
                multiline
                numberOfLines={3}
                placeholderTextColor={COLORS.textTertiary}
              />

              <View style={styles.macroRow}>
                <MacroStepper label="Calories" value={calories} onChangeText={setCalories} step={10} />
                <MacroStepper label="Protein (g)" value={protein} onChangeText={setProtein} />
              </View>

              <View style={styles.macroRow}>
                <MacroStepper label="Carbs (g)" value={carbs} onChangeText={setCarbs} />
                <MacroStepper label="Fats (g)" value={fats} onChangeText={setFats} />
              </View>

              <Pressable style={[styles.saveButton, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  heroCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  heroCategory: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  heroTitle: { color: COLORS.brand, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  existingSection: { backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginTop: 14 },
  existingSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  existingTitle: { color: COLORS.brand, fontSize: 16, fontWeight: '900' },
  addMealButton: { flexDirection: 'row', backgroundColor: COLORS.brand, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center' },
  addMealButtonText: { color: COLORS.surface, fontSize: 12, fontWeight: '900', marginLeft: 4 },
  existingEmpty: { color: COLORS.textSecondary, fontSize: 13 },
  existingMealCard: { backgroundColor: '#f4f7ef', borderRadius: 16, padding: 12, marginBottom: 10 },
  existingMealInfo: { marginBottom: 10 },
  existingMealTitle: { color: COLORS.brand, fontWeight: '900', marginBottom: 4 },
  existingMealMeta: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  existingMealActions: { flexDirection: 'row' },
  smallIconAction: { width: 36, height: 36, backgroundColor: '#edf7d7', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  smallIconDelete: { backgroundColor: '#fff6f6' },
  fieldLabel: { color: COLORS.brand, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  chipRow: { marginBottom: 4 },
  chip: { backgroundColor: COLORS.surface, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 18, marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  chipText: { color: COLORS.textSecondary, fontWeight: '700' },
  chipTextActive: { color: COLORS.surface },
  input: { backgroundColor: COLORS.inputBg, borderRadius: 16, padding: 16, color: COLORS.brand },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  macroRow: { flexDirection: 'row', gap: 12 },
  macroField: { flex: 1 },
  stepperInput: { minHeight: 54, flexDirection: 'row', alignItems: 'stretch', backgroundColor: COLORS.inputBg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  stepperTextInput: { flex: 1, paddingHorizontal: 14, color: COLORS.brand, fontSize: 16, fontWeight: '800' },
  stepperControls: { width: 40, borderLeftWidth: 1, borderLeftColor: COLORS.border },
  stepperButton: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf7d7' },
  stepperButtonBottom: { borderTopWidth: 1, borderTopColor: COLORS.border },
  pressed: { opacity: 0.75 },
  saveButton: { backgroundColor: COLORS.brand, paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 20 },
  saveText: { color: COLORS.surface, fontWeight: '800', fontSize: 16 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10, 22, 14, 0.35)' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { color: COLORS.brand, fontSize: 20, fontWeight: '900', marginBottom: 2 },
  modalSubtitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  modalCloseButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  modalScrollContent: { paddingBottom: 20 },
});
