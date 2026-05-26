import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import AppText from '../components/AppText';
import HeaderBar from '../components/HeaderBar';
import { useTheme } from '../context/useTheme';
import { profilesService } from '../services/profilesService';
import { Feather } from '@expo/vector-icons';

export default function AdminUsersScreen({ onOpenUserDetails, onBack }) {
  const { colors, isDark, setTheme } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await profilesService.listProfiles();
    setUsers(data);
    setLoading(false);
  };

  const handleToggleBlock = async (user) => {
    const newStatus = user.status === 'disabled' ? 'active' : 'disabled';
    const actionText = newStatus === 'disabled' ? 'Block' : 'Unblock';

    Alert.alert(
      `${actionText} Account`,
      `Are you sure you want to ${actionText.toLowerCase()} this account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          style: newStatus === 'disabled' ? 'destructive' : 'default',
          onPress: async () => {
            setProcessingId(user.id);
            const { success } = await profilesService.updateProfile(user.id, { status: newStatus });
            if (success) {
              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
            } else {
              Alert.alert('Error', `Failed to ${actionText.toLowerCase()} account.`);
            }
            setProcessingId(null);
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(u => {
    const term = searchQuery.toLowerCase();
    const nameMatch = u.full_name && u.full_name.toLowerCase().includes(term);
    const emailMatch = u.email && u.email.toLowerCase().includes(term);
    return nameMatch || emailMatch;
  });

  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => onOpenUserDetails(item.id)}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.statusDot, item.status === 'disabled' && styles.statusDotDisabled]} />
          <AppText style={styles.name}>{item.full_name || 'No Name'}</AppText>
        </View>
        <View style={[styles.badge, item.role === 'admin' && styles.adminBadge]}>
          <AppText style={[styles.badgeText, item.role === 'admin' && styles.adminBadgeText]}>
            {item.role.toUpperCase()}
          </AppText>
        </View>
      </View>
      <AppText style={styles.email}>{item.email}</AppText>
      
      <View style={styles.footerRow}>

        {processingId === item.id ? (
          <ActivityIndicator size="small" color={colors.brand} />
        ) : (
          <Pressable 
            style={[styles.actionBtn, item.status === 'disabled' && styles.actionBtnUnblock]}
            onPress={() => handleToggleBlock(item)}
          >
            <AppText style={[styles.actionBtnText, item.status === 'disabled' && styles.actionBtnTextUnblock]}>
              {item.status === 'disabled' ? 'Unblock' : 'Block'}
            </AppText>
          </Pressable>
        )}
      </View>
    </Pressable>
  );

  const renderHeader = () => (
    <View style={{ marginBottom: 16 }}>
      <HeaderBar 
        title="Manage Users" 
        onBack={onBack} 
        action={{
          icon: isDark ? "moon" : "sun",
          onPress: () => setTheme(isDark ? "light" : "dark"),
          label: "Toggle Theme",
        }}
      />
      
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Feather name="x" size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.root}
      data={loading ? [] : filteredUsers}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        loading ? (
          <View style={styles.centered}><ActivityIndicator color={colors.accent} /></View>
        ) : (
          <AppText style={styles.empty}>No users found.</AppText>
        )
      }
    />
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: colors.brand },
  clearBtn: { padding: 4 },
  list: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.brand },
  email: { fontSize: 14, color: colors.muted, marginBottom: 12 },
  badge: {
    backgroundColor: colors.surfaceGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },
  adminBadge: { backgroundColor: colors.highlightSubtle },
  adminBadgeText: { color: colors.accent },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 8 },
  statusDotDisabled: { backgroundColor: colors.danger },
  actionBtn: {
    backgroundColor: colors.dangerSubtle,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  actionBtnUnblock: { backgroundColor: colors.surfaceGreen },
  actionBtnTextUnblock: { color: colors.brand },
});
