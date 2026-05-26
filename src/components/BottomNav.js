import React from "react";
import { Platform, View, Text, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/useTheme";

const tabs = [
  { key: "home", label: "HOME", icon: "home" },
  { key: "plans", label: "PLANS", icon: "calendar" },
  { key: "orders", label: "ORDERS", icon: "file-text" },
  { key: "profile", label: "PROFILE", icon: "user" },
];

export default function BottomNav({ active, onChange }) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

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
            color={active === tab.key ? colors.brand : colors.muted}
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

const getStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingBottom: Platform.OS === "android" ? 44 : 12,
    minHeight: Platform.OS === "android" ? 100 : 68,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  icon: {
    fontSize: 18,
    marginBottom: 4,
    color: colors.muted,
  },
  label: {
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.8,
  },
  activeText: {
    color: colors.brand,
    fontWeight: "700",
  },
});
