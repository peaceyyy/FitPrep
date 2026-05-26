import AppText from '../components/AppText';
import React, { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
import { TYPOGRAPHY } from '../theme';

const starLabels = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
const metricLabels = {
  freshness: 'Freshness',
  portion: 'Portion',
  variety: 'Variety',
};

export default function ReviewScreen({ order, onBack, onSubmit }) {
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');
  const [metrics, setMetrics] = useState({
    freshness: 4,
    portion: 4,
    variety: 3,
  });
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const planName = order?.published_weekly_plans?.name || 'Your Weekly Plan';
  const orderId = order?.id?.substring(0, 8).toUpperCase() || 'XXXXXXXX';

  const handleMetricChange = (metric, value) => {
    setMetrics((prev) => ({ ...prev, [metric]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      orderId: order?.id,
      rating,
      comment,
      metrics,
    });
  };

  const renderMetric = (metric) => {
    const value = metrics[metric];

    return (
      <View key={metric} style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <AppText style={styles.metricTitle}>{metricLabels[metric]}</AppText>
          <AppText style={styles.metricValue}>{value}/5</AppText>
        </View>
        <View style={styles.metricOptions}>
          {[1, 2, 3, 4, 5].map((option) => {
            const active = value === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.metricOption,
                  active && styles.metricOptionActive,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => handleMetricChange(metric, option)}
              >
                <AppText style={[styles.metricOptionText, active && styles.metricOptionTextActive]}>{option}</AppText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.metricTrack}>
          <View style={[styles.metricFill, { width: `${value * 20}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Rate Your Week" onBack={onBack} />

      <View style={styles.heroCard}>
        {/* Placeholder hero with icon — will be replaced by real meal image */}
        <View style={styles.heroImage}>
          <Ionicons name="restaurant-outline" size={48} color={colors.brand} style={{ opacity: 0.35 }} />
        </View>
        <AppText style={styles.mealTitle}>{planName}</AppText>
        <AppText style={styles.mealSubtitle}>ORDER #{orderId} · WEEK COMPLETED</AppText>
      </View>

      <View style={styles.reviewCard}>
        <AppText style={styles.reviewHeading}>How was the food?</AppText>
        <AppText style={styles.reviewSubtext}>Tap a star to rate your overall meal experience this week</AppText>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => setRating(star)}
              style={({ pressed }) => pressed && { transform: [{ scale: 1.2 }] }}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
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
          placeholderTextColor={colors.textTertiary || colors.muted}
          value={comment}
          multiline
          numberOfLines={4}
          onChangeText={setComment}
        />
      </View>

      <View style={styles.metricsCard}>
        <AppText style={styles.commentLabel}>Quick scores</AppText>
        {Object.keys(metricLabels).map(renderMetric)}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
        onPress={handleSubmit}
        accessibilityRole="button"
        accessibilityLabel="Submit review"
      >
        <AppText style={styles.submitLabel}>Submit Demo Review →</AppText>
      </Pressable>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: {
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 0,
    overflow: 'hidden',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroImage: {
    height: 180,
    backgroundColor: colors.surfaceGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: colors.brand,
    marginTop: 14,
    marginHorizontal: 18,
  },
  mealSubtitle: {
    color: colors.muted,
    fontSize: TYPOGRAPHY.xs,
    letterSpacing: 0.5,
    marginHorizontal: 18,
    marginBottom: 18,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeading: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.extrabold,
    color: colors.brand,
    marginBottom: 6,
  },
  reviewSubtext: {
    color: colors.muted,
    marginBottom: 16,
    lineHeight: 20,
    fontSize: TYPOGRAPHY.sm,
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
    color: colors.accent,
  },
  starInactive: {
    color: colors.border,
  },
  ratingLabel: {
    textAlign: 'center',
    color: colors.muted,
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.sm,
  },
  commentCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentLabel: {
    fontWeight: TYPOGRAPHY.bold,
    color: colors.brand,
    marginBottom: 12,
    fontSize: TYPOGRAPHY.sm,
  },
  commentInput: {
    minHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    padding: 16,
    color: colors.brand,
    textAlignVertical: 'top',
    fontSize: TYPOGRAPHY.base,
  },
  metricsCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricCard: {
    marginTop: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricTitle: {
    color: colors.muted,
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.sm,
  },
  metricOptions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  metricOption: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  metricOptionActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  metricOptionText: {
    color: colors.brand,
    fontWeight: TYPOGRAPHY.extrabold,
    fontSize: TYPOGRAPHY.sm,
  },
  metricOptionTextActive: {
    color: colors.surface,
  },
  metricTrack: {
    height: 8,
    backgroundColor: colors.surfaceGreen,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  metricFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  metricValue: {
    color: colors.brand,
    fontWeight: TYPOGRAPHY.extrabold,
    fontSize: TYPOGRAPHY.sm,
  },
  submitButton: {
    backgroundColor: colors.brand,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitLabel: {
    color: colors.surface,
    fontWeight: TYPOGRAPHY.extrabold,
    fontSize: TYPOGRAPHY.md,
  },
});
