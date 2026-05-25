import AppText from '../components/AppText';
import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const stats = [
  { label: 'Active Days', value: '24' },
  { label: 'Meals Delivered', value: '128' },
  { label: 'Goal Progress', value: '82%' },
  { label: 'Next Cycle', value: '3d' },
];

export default function ProfileScreen({ user, onLogout, onBack }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Profile" onBack={onBack} />

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <AppText style={styles.avatarInitial}>
              {(user.name || '?')[0].toUpperCase()}
            </AppText>
          </View>
          <View style={styles.avatarEdit}> <AppText style={styles.avatarEditIcon}>✎</AppText></View>
        </View>
        <AppText style={styles.userName}>{user.name}</AppText>
        <AppText style={styles.userEmail}>{user.email}</AppText>
        <AppText style={styles.userRole}>{user.role === 'admin' ? 'Administrator' : 'Customer'}</AppText>
        <View style={styles.badgesRow}>
          <View style={styles.badge}><AppText style={styles.badgeLabel}>ELITE MEMBER</AppText></View>
          <View style={styles.badge}><AppText style={styles.badgeLabel}>VEGAN FOCUS</AppText></View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statItem}>
            <AppText style={styles.statLabel}>{item.label.toUpperCase()}</AppText>
            <AppText style={styles.statValue}>{item.value}</AppText>
          </View>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <AppText style={styles.logoutText}>LOGOUT</AppText>
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
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 18,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.brand,
  },
  avatarEdit: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    color: COLORS.surface,
    fontSize: 16,
  },
  userName: {
    color: COLORS.brand,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  userEmail: {
    color: COLORS.muted,
    marginBottom: 6,
  },
  userRole: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  badge: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 6,
  },
  badgeLabel: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    color: COLORS.brand,
    fontSize: 24,
    fontWeight: '800',
  },
  logoutButton: {
    backgroundColor: COLORS.dangerSubtle,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 15,
  },
});
