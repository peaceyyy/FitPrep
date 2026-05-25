import AppText from '../components/AppText';
import React from 'react';
import { ScrollView, StyleSheet, View, Pressable, Image } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const sampleMeals = [
  { id: 'm1', title: 'Lemon Herb Roasted Chicken', description: 'High-protein cutting meal with zesty vegetables.', price: '$12.99' },
  { id: 'm2', title: 'Salmon & Asparagus', description: 'Lean and nutritious plan for recovery days.', price: '$14.50' },
];

export default function AdminMealCategoryScreen({ category, meals = sampleMeals, onBack, onAdd }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title={`${category?.charAt(0).toUpperCase() + category?.slice(1) || 'Category'} Plans`} onBack={onBack} />

      <AppText style={styles.sectionTitle}>Available Meals</AppText>
      {meals.map((meal) => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={styles.mealRow}>
            <View style={styles.mealInfo}>
              <AppText style={styles.mealTitle}>{meal.title}</AppText>
              <AppText style={styles.mealDescription}>{meal.description}</AppText>
            </View>
            <AppText style={styles.mealPrice}>{meal.price}</AppText>
          </View>
        </View>
      ))}

      <Pressable style={styles.addButton} onPress={onAdd}>
        <AppText style={styles.addText}>＋ Add Meal</AppText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  sectionTitle: { color: COLORS.brand, fontSize: 20, fontWeight: '900', marginBottom: 16 },
  mealCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealInfo: { flex: 1, paddingRight: 12 },
  mealTitle: { color: COLORS.brand, fontWeight: '800', marginBottom: 4, fontSize: 16 },
  mealDescription: { color: COLORS.textSecondary, fontSize: 13 },
  mealPrice: { color: COLORS.accent, fontWeight: '800' },
  addButton: { marginTop: 10, backgroundColor: COLORS.brand, paddingVertical: 16, borderRadius: 18, alignItems: 'center' },
  addText: { color: COLORS.surface, fontWeight: '800', fontSize: 16 },
});
