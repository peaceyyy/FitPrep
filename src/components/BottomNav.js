import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../theme";

const tabs = [
  { key: "home", label: "HOME", icon: "home" },
  { key: "plans", label: "PLANS", icon: "calendar" },
  { key: "orders", label: "ORDERS", icon: "file-text" },
  { key: "profile", label: "PROFILE", icon: "user" },
];

export default function BottomNav({ active, onChange }) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={({ pressed }) => [styles.tab, pressed && { opacity: 0.75 }]}
        >
          <Feather
            name={tab.icon}
            size={22}
            color={active === tab.key ? COLORS.brand : COLORS.muted}
            style={styles.icon}
          />
          <Text style={[styles.label, active === tab.key && styles.activeText]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: "#e1e7d9",
    paddingVertical: 10,
  },
  tab: {
    alignItems: "center",
    width: 96,
  },
  icon: {
    fontSize: 18,
    marginBottom: 4,
    color: COLORS.muted,
  },
  label: {
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.8,
  },
  activeText: {
    color: COLORS.brand,
    fontWeight: "700",
  },
});
