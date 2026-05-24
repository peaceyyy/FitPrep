import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const days = ['MON 12', 'TUE 13', 'WED 14', 'THU 15', 'FRI 16'];
const meals = [
  { type: 'Breakfast', title: 'Almond Berry Power Bowl', calories: '340 kcal', protein: '12g', carbs: '45g', fat: '14g' },
  { type: 'Lunch', title: 'Grilled Salmon & Quinoa', calories: '520 kcal', protein: '42g', carbs: '30g', fat: '24g' },
  { type: 'Snack', title: 'Green Apple & Nut Butter', calories: '180 kcal', protein: '4g', carbs: '22g', fat: '10g' },
  { type: 'Dinner', title: 'Roasted Chicken & Kale', calories: '450 kcal', protein: '38g', carbs: '28g', fat: '18g' },
];

export default function WeeklyPlanScreen({ onBack, onPreorder }) {
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedSection, setSelectedSection] = useState('Plan');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Weekly Plan" onBack={onBack} action={{ icon: '📅', onPress: () => {} }} />

      <View style={styles.sectionNav}>
        {['Today', 'Plan', 'Stats', 'Account'].map((item) => (
          <Pressable
            key={item}
            style={[styles.sectionNavButton, selectedSection === item && styles.sectionNavButtonActive]}
            onPress={() => setSelectedSection(item)}
          >
            <Text style={[styles.sectionNavLabel, selectedSection === item && styles.sectionNavLabelActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysRow}>
        {days.map((day) => (
          <Pressable
            key={day}
            style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayLabel, selectedDay === day && styles.dayLabelActive]}>{day}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {meals.map((meal, index) => (
        <View key={meal.title} style={styles.mealCard}>
          <View style={styles.mealImagePlaceholder} />
          <View style={styles.mealContent}>
            <Text style={styles.mealType}>{meal.type.toUpperCase()}</Text>
            <Text style={styles.mealTitle}>{meal.title}</Text>
            <Text style={styles.mealCalories}>{meal.calories}</Text>
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionText}>PROTEIN {meal.protein}</Text>
              <Text style={styles.nutritionText}>CARBS {meal.carbs}</Text>
              <Text style={styles.nutritionText}>FAT {meal.fat}</Text>
            </View>
            <View style={styles.nutritionTrack}><View style={[styles.nutritionFill, { width: `${Math.min(100, (parseInt(meal.protein, 10) / 50) * 100)}%`}]} /></View>
          </View>
        </View>
      ))}

      <Pressable style={styles.preorderButton} onPress={onPreorder}>
        <Text style={styles.preorderLabel}>Preorder Plan →</Text>
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
  daysRow: {
    marginBottom: 22,
  },
  sectionNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionNavButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  sectionNavButtonActive: {
    backgroundColor: COLORS.brand,
  },
  sectionNavLabel: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  sectionNavLabelActive: {
    color: '#ffffff',
  },
  dayButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginRight: 12,
  },
  dayButtonActive: {
    backgroundColor: COLORS.brand,
  },
  dayLabel: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  dayLabelActive: {
    color: '#ffffff',
  },
  mealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealImagePlaceholder: {
    height: 140,
    backgroundColor: '#cde0c0',
  },
  mealContent: {
    padding: 18,
  },
  mealType: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 8,
  },
  mealCalories: {
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutritionText: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '700',
  },
  nutritionTrack: {
    height: 8,
    backgroundColor: '#e8f2d6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  nutritionFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  preorderButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  preorderLabel: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
