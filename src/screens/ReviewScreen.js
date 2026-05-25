import AppText from '../components/AppText';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, TextInput } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const starLabels = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

export default function ReviewScreen({ order, onBack, onSubmit }) {
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');

  const planName = order?.published_weekly_plans?.name || 'Your Weekly Plan';
  const orderId = order?.id?.substring(0, 8).toUpperCase() || 'XXXXXXXX';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Rate Your Week" onBack={onBack} />

      <View style={styles.heroCard}>
        <View style={styles.heroImage} />
        <AppText style={styles.mealTitle}>{planName}</AppText>
        <AppText style={styles.mealSubtitle}>ORDER #{orderId} · WEEK COMPLETED</AppText>
      </View>

      <View style={styles.reviewCard}>
        <AppText style={styles.reviewHeading}>How was the food?</AppText>
        <AppText style={styles.reviewSubtext}>Tap a star to rate your overall meal experience this week</AppText>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)}>
              <AppText style={[styles.star, rating >= star ? styles.starActive : styles.starInactive]}>★</AppText>
            </Pressable>
          ))}
        </View>
        <AppText style={styles.ratingLabel}>{starLabels[rating - 1]}</AppText>
      </View>

      <View style={styles.commentCard}>
        <AppText style={styles.commentLabel}>Share your thoughts</AppText>
        <TextInput
          style={styles.commentInput}
          placeholder="The meals were filling and tasty, but could use more variety..."
          placeholderTextColor={COLORS.textTertiary || COLORS.muted}
          value={comment}
          multiline
          numberOfLines={4}
          onChangeText={setComment}
        />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <AppText style={styles.metricTitle}>Freshness</AppText>
          <View style={styles.metricTrack}>
            <View style={[styles.metricFill, { width: `${rating * 20}%` }]} />
          </View>
          <AppText style={styles.metricValue}>{(rating * 1.2).toFixed(1)}</AppText>
        </View>
        <View style={[styles.metricCard, styles.metricSpacing]}>
          <AppText style={styles.metricTitle}>Portion</AppText>
          <View style={styles.metricTrack}>
            <View style={[styles.metricFill, { width: `${Math.min(rating * 18, 100)}%` }]} />
          </View>
          <AppText style={styles.metricValue}>{(rating * 1.0).toFixed(1)}</AppText>
        </View>
      </View>

      <Pressable style={styles.submitButton} onPress={() => onSubmit({ rating, comment })}>
        <AppText style={styles.submitLabel}>Submit Review →</AppText>
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
    color: COLORS.surface,
    fontWeight: '800',
    fontSize: 16,
  },
});
