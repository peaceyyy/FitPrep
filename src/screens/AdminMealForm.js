import AppText from '../components/AppText';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { usePlans } from '../context/PlansContext';
import { addMealToPlan, deleteMeal, updateMeal } from '../services/mealsService';
import { normalizeDayLabel, MEAL_TYPES } from '../services/plansService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminMealForm({ initialPlanId, onBack }) {
  const { loadMealsForPlan, loadPlans, meals, plans } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || plans?.[0]?.id || null);
  const [selectedDay, setSelectedDay] = useState('Monday');
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
    setSelectedDay(meal.day_of_week || selectedDay);
    setMealType(meal.meal_type || 'Breakfast');
    setMealName(meal.meal_name || '');
    setDescription(meal.description || '');
    setCalories(meal.calories?.toString() || '');
    setProtein(meal.protein_g?.toString() || '');
    setCarbs(meal.carbs_g?.toString() || '');
    setFats(meal.fats_g?.toString() || '');
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
    Alert.alert('Success', `"${mealName}" ${editingMealId ? 'updated' : 'added'} for ${selectedDay}!`, [
      { text: 'Add Another', onPress: resetMealForm },
      { text: 'Done', onPress: onBack },
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Manage Meals" onBack={onBack} />

      <View style={styles.heroCard}>
        <AppText style={styles.heroCategory}>{activePlan?.category?.toUpperCase() || 'PLAN'}</AppText>
        <AppText style={styles.heroTitle}>{activePlan?.name || 'Select a Plan'}</AppText>
        <AppText style={styles.heroSub}>{editingMealId ? 'Editing' : 'Adding'} meal for: {selectedDayLabel}</AppText>
      </View>

      {plans && plans.length > 1 && (
        <>
          <AppText style={styles.fieldLabel}>Plan</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {plans.map((plan) => (
              <Pressable
                key={plan.id}
                style={[styles.chip, selectedPlanId === plan.id && styles.chipActive]}
                onPress={() => setSelectedPlanId(plan.id)}
              >
                <AppText style={[styles.chipText, selectedPlanId === plan.id && styles.chipTextActive]}>
                  {plan.name}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

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

      <View style={styles.existingSection}>
        <AppText style={styles.existingTitle}>{selectedDayLabel} Meals</AppText>
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
              <Pressable style={styles.smallAction} onPress={() => handleEditMeal(meal)}>
                <AppText style={styles.smallActionText}>Edit</AppText>
              </Pressable>
              <Pressable style={[styles.smallAction, styles.smallDelete]} onPress={() => handleDeleteMeal(meal)}>
                <AppText style={[styles.smallActionText, styles.smallDeleteText]}>Delete</AppText>
              </Pressable>
            </View>
          </View>
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
        <View style={styles.macroField}>
          <AppText style={styles.fieldLabel}>Calories</AppText>
          <TextInput style={styles.input} value={calories} onChangeText={setCalories} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textTertiary} />
        </View>
        <View style={styles.macroField}>
          <AppText style={styles.fieldLabel}>Protein (g)</AppText>
          <TextInput style={styles.input} value={protein} onChangeText={setProtein} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textTertiary} />
        </View>
      </View>

      <View style={styles.macroRow}>
        <View style={styles.macroField}>
          <AppText style={styles.fieldLabel}>Carbs (g)</AppText>
          <TextInput style={styles.input} value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textTertiary} />
        </View>
        <View style={styles.macroField}>
          <AppText style={styles.fieldLabel}>Fats (g)</AppText>
          <TextInput style={styles.input} value={fats} onChangeText={setFats} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textTertiary} />
        </View>
      </View>

      <Pressable style={[styles.saveButton, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <AppText style={styles.saveText}>{editingMealId ? 'Update Meal' : 'Save Meal'} →</AppText>
        }
      </Pressable>

      {editingMealId && (
        <Pressable style={styles.cancelEditButton} onPress={resetMealForm}>
          <AppText style={styles.cancelEditText}>Cancel Edit</AppText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  heroCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  heroCategory: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  heroTitle: { color: COLORS.brand, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 13 },
  existingSection: { backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginTop: 14 },
  existingTitle: { color: COLORS.brand, fontSize: 16, fontWeight: '900', marginBottom: 10 },
  existingEmpty: { color: COLORS.textSecondary, fontSize: 13 },
  existingMealCard: { backgroundColor: '#f4f7ef', borderRadius: 16, padding: 12, marginBottom: 10 },
  existingMealInfo: { marginBottom: 10 },
  existingMealTitle: { color: COLORS.brand, fontWeight: '900', marginBottom: 4 },
  existingMealMeta: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  existingMealActions: { flexDirection: 'row' },
  smallAction: { backgroundColor: '#edf7d7', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 },
  smallActionText: { color: COLORS.brand, fontWeight: '900', fontSize: 12 },
  smallDelete: { backgroundColor: '#fff6f6' },
  smallDeleteText: { color: COLORS.danger },
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
  saveButton: { backgroundColor: COLORS.brand, paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 20 },
  saveText: { color: COLORS.surface, fontWeight: '800', fontSize: 16 },
  cancelEditButton: { alignItems: 'center', paddingVertical: 14 },
  cancelEditText: { color: COLORS.brand, fontWeight: '900' },
});
