import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const starLabels = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

export default function ReviewScreen({ onBack, onSubmit }) {
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Rate Your Meal" onBack={onBack} action={{ icon: '👤', onPress: () => {} }} />

      <View style={styles.heroCard}>
        <View style={styles.heroImage} />
        <Text style={styles.mealTitle}>Atlantic Grilled Salmon</Text>
        <Text style={styles.mealSubtitle}>ORDER #88291 · DELIVERED 20M AGO</Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewHeading}>How was the taste?</Text>
        <Text style={styles.reviewSubtext}>Tap a star to rate your meal experience</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)}>
              <Text style={[styles.star, rating >= star ? styles.starActive : styles.starInactive]}>★</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.ratingLabel}>{starLabels[rating - 1]}</Text>
      </View>

      <View style={styles.commentCard}>
        <Text style={styles.commentLabel}>Share your thoughts</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="The seasoning was perfect, but could use more greens..."
          placeholderTextColor="#7b7f7a"
          value={comment}
          multiline
          numberOfLines={4}
          onChangeText={setComment}
        />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Freshness</Text>
          <View style={styles.metricTrack}><View style={[styles.metricFill, { width: '80%' }]} /></View>
          <Text style={styles.metricValue}>4.8</Text>
        </View>
        <View style={[styles.metricCard, styles.metricSpacing]}>
          <Text style={styles.metricTitle}>Portion</Text>
          <View style={styles.metricTrack}><View style={[styles.metricFill, { width: '64%' }]} /></View>
          <Text style={styles.metricValue}>4.2</Text>
        </View>
      </View>

      <Pressable style={styles.submitButton} onPress={() => onSubmit({ rating, comment })}>
        <Text style={styles.submitLabel}>Submit Review →</Text>
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
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 0,
    overflow: 'hidden',
    marginBottom: 22,
  },
  heroImage: {
    height: 220,
    backgroundColor: '#d8e5d0',
  },
  mealTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    marginTop: 14,
    marginHorizontal: 18,
  },
  mealSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginHorizontal: 18,
    marginBottom: 18,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  reviewHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 6,
  },
  reviewSubtext: {
    color: COLORS.muted,
    marginBottom: 16,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  star: {
    fontSize: 34,
  },
  starActive: {
    color: '#c8e472',
  },
  starInactive: {
    color: '#dcdcdc',
  },
  ratingLabel: {
    textAlign: 'center',
    color: COLORS.muted,
    fontWeight: '700',
  },
  commentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
  },
  commentLabel: {
    fontWeight: '700',
    color: COLORS.brand,
    marginBottom: 12,
  },
  commentInput: {
    minHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#f4f7ee',
    padding: 16,
    color: COLORS.brand,
    textAlignVertical: 'top',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 16,
  },
  metricSpacing: {
    marginLeft: 12,
  },
  metricTitle: {
    color: COLORS.muted,
    marginBottom: 10,
    fontWeight: '700',
  },
  metricTrack: {
    height: 8,
    backgroundColor: '#ebf3dc',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  metricFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  metricValue: {
    color: COLORS.brand,
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitLabel: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
