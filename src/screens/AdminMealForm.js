import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

export default function AdminMealForm({ category, onSave, onBack }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fats, setFats] = useState('0');
  const [price, setPrice] = useState('0');

  const handleSave = () => {
    const meal = { category, title, description, calories, protein, carbs, fats, price };
    if (onSave) onSave(meal);
    if (onBack) onBack();
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Edit Meal" onBack={onBack} />
      <View style={styles.heroCard}>
        <Text style={styles.heroCategory}>{category ? `${category.toUpperCase()} PLAN` : 'NEW PLAN'}</Text>
        <Text style={styles.heroTitle}>{title || 'Create a new meal plan'}</Text>
      </View>

      <Text style={styles.fieldLabel}>Plan name</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Lean Muscle Sustenance" placeholderTextColor="#9aa298" />

      <Text style={styles.fieldLabel}>Description</Text>
      <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Briefly describe the meal benefits and primary ingredients..." multiline numberOfLines={4} placeholderTextColor="#9aa298" />

      <Text style={styles.fieldLabel}>Calories</Text>
      <TextInput style={styles.input} value={calories} onChangeText={setCalories} keyboardType="numeric" placeholder="0" placeholderTextColor="#9aa298" />

      <Text style={styles.fieldLabel}>Protein (g)</Text>
      <TextInput style={styles.input} value={protein} onChangeText={setProtein} keyboardType="numeric" placeholder="0" placeholderTextColor="#9aa298" />

      <Text style={styles.fieldLabel}>Carbs (g)</Text>
      <TextInput style={styles.input} value={carbs} onChangeText={setCarbs} keyboardType="numeric" placeholder="0" placeholderTextColor="#9aa298" />

      <Text style={styles.fieldLabel}>Fats (g)</Text>
      <TextInput style={styles.input} value={fats} onChangeText={setFats} keyboardType="numeric" placeholder="0" placeholderTextColor="#9aa298" />

      <Text style={styles.fieldLabel}>Price</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" placeholderTextColor="#9aa298" />

      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Meal Plan</Text>
      </Pressable>
      <Text style={styles.updatedText}>Last updated: Today at 09:42 AM</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  heroCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  heroCategory: { color: COLORS.accent, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  heroTitle: { color: COLORS.brand, fontSize: 22, fontWeight: '900' },
  fieldLabel: { color: COLORS.brand, fontWeight: '700', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#eef1e7', borderRadius: 16, padding: 16, marginBottom: 10, color: COLORS.textPrimary },
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  saveButton: { backgroundColor: COLORS.brand, paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  updatedText: { color: COLORS.muted, marginTop: 14, textAlign: 'center' },
});
