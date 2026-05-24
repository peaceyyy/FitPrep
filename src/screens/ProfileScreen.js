import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const stats = [
  { label: 'Active Days', value: '24' },
  { label: 'Meals Delivered', value: '128' },
  { label: 'Goal Progress', value: '82%' },
  { label: 'Next Cycle', value: '3d' },
];

const settings = [
  { label: 'Personal Information', icon: '👤' },
  { label: 'Fitness Goals', icon: '⚒️' },
  { label: 'Delivery Address', icon: '📍' },
  { label: 'Payment Methods', icon: '💳' },
];

export default function ProfileScreen({ user, onLogout, onNavigateSetting }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Profile" action={{ icon: '☰', onPress: () => {} }} />

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>A</Text>
          </View>
          <View style={styles.avatarEdit}> <Text style={styles.avatarEditIcon}>✎</Text></View>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userRole}>{user.role === 'admin' ? 'Administrator' : 'Customer'}</Text>
        <View style={styles.badgesRow}>
          <View style={styles.badge}><Text style={styles.badgeLabel}>ELITE MEMBER</Text></View>
          <View style={styles.badge}><Text style={styles.badgeLabel}>VEGAN FOCUS</Text></View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statItem}>
            <Text style={styles.statLabel}>{item.label.toUpperCase()}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeading}>Settings</Text>
      {settings.map((item) => (
        <Pressable key={item.label} style={styles.settingRow} onPress={() => onNavigateSetting(item.label)}>
          <Text style={styles.settingIcon}>{item.icon}</Text>
          <Text style={styles.settingText}>{item.label}</Text>
          <Text style={styles.settingChevron}>›</Text>
        </Pressable>
      ))}

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
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
    backgroundColor: '#d6e3c1',
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
    color: '#ffffff',
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
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brand,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingIcon: {
    marginRight: 14,
    fontSize: 18,
  },
  settingText: {
    flex: 1,
    color: COLORS.brand,
    fontWeight: '700',
  },
  settingChevron: {
    color: COLORS.muted,
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#fbeaea',
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
