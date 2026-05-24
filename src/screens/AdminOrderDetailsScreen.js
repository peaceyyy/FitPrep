import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import { COLORS } from '../theme';

const statuses = ['Preparing', 'Out for Delivery', 'Delivered'];

export default function AdminOrderDetailsScreen({ order, onBack, onUpdate }) {
  const [status, setStatus] = useState(order?.status || 'Preparing');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <HeaderBar title="Order Details" onBack={onBack} />

      <Text style={styles.heading}>{order.customer}</Text>
      <Text style={styles.sub}>{order.plan}</Text>
      <Text style={styles.meta}>Order ID: {order.id}</Text>
      <Text style={styles.meta}>Payment: {order.payment}</Text>

      {order.proof ? (
        <View style={styles.proofBox}>
          <Image source={{ uri: order.proof }} style={styles.proofImage} />
        </View>
      ) : (
        <View style={styles.proofBox}><Text style={styles.proofText}>No proof attached</Text></View>
      )}

      <Text style={styles.fieldLabel}>Update Status</Text>
      {statuses.map((s) => (
        <Pressable key={s} style={[styles.statusRow, status === s && styles.statusRowActive]} onPress={() => setStatus(s)}>
          <Text style={[styles.statusLabel, status === s && styles.statusLabelActive]}>{s}</Text>
        </Pressable>
      ))}

      <Pressable style={styles.saveButton} onPress={() => onUpdate && onUpdate({ ...order, status })}>
        <Text style={styles.saveText}>Save Status</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  heading: { fontSize: 22, fontWeight: '900', color: COLORS.brand },
  sub: { color: COLORS.muted, marginBottom: 8 },
  meta: { color: COLORS.muted, marginBottom: 6 },
  proofBox: { height: 160, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginVertical: 12, borderWidth: 1, borderColor: COLORS.border },
  proofText: { color: COLORS.muted },
  proofImage: { width: '100%', height: '100%', borderRadius: 12 },
  fieldLabel: { color: COLORS.brand, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  statusRow: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: COLORS.surface, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  statusRowActive: { backgroundColor: '#edf7c4', borderColor: COLORS.accent },
  statusLabel: { color: COLORS.brand, fontWeight: '700' },
  statusLabelActive: { color: COLORS.brand },
  saveButton: { backgroundColor: COLORS.brand, paddingVertical: 14, borderRadius: 18, alignItems: 'center', marginTop: 12 },
  saveText: { color: '#fff', fontWeight: '800' },
});
