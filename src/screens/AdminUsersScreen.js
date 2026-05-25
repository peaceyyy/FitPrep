import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import AppText from '../components/AppText';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';
import { profilesService } from '../services/profilesService';
import { Feather } from '@expo/vector-icons';

export default function AdminUsersScreen({ onOpenUserDetails, onBack }) {
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
        <AppText style={styles.name}>{item.full_name || 'No Name'}</AppText>
        <View style={[styles.badge, item.role === 'admin' && styles.adminBadge]}>
          <AppText style={[styles.badgeText, item.role === 'admin' && styles.adminBadgeText]}>
            {item.role.toUpperCase()}
          </AppText>
        </View>
      </View>
      <AppText style={styles.email}>{item.email}</AppText>
      
      <View style={styles.footerRow}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, item.status === 'disabled' && styles.statusDotDisabled]} />
          <AppText style={styles.statusText}>
            {item.status === 'disabled' ? 'Blocked' : 'Active'}
          </AppText>
        </View>

        {processingId === item.id ? (
          <ActivityIndicator size="small" color={COLORS.brand} />
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

  return (
    <View style={styles.root}>
      <HeaderBar title="Manage Users" onBack={onBack} />
      
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={COLORS.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Feather name="x" size={18} color={COLORS.muted} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}><AppText>Loading...</AppText></View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<AppText style={styles.empty}>No users found.</AppText>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: COLORS.brand },
  clearBtn: { padding: 4 },
  list: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.brand },
  email: { fontSize: 14, color: COLORS.muted, marginBottom: 12 },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  adminBadge: { backgroundColor: '#e0e7ff' },
  adminBadgeText: { color: '#4338ca' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 6 },
  statusDotDisabled: { backgroundColor: '#ef4444' },
  statusText: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  actionBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  actionBtnUnblock: { backgroundColor: '#f1f5f9' },
  actionBtnTextUnblock: { color: COLORS.brand },
});
