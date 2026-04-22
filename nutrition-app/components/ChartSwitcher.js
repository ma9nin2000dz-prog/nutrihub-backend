import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";

const ChartSwitcher = ({ visitors, experts, patients }) => {
  const [active, setActive] = useState("experts");

  const charts = {
   // visitors,
    experts,
    patients
  };

  const getLabel = (key) => {
    if (key === "visitors") return "Visitors";
    if (key === "experts") return "Experts";
    return "Patients";
  };

  return (
    <View style={styles.container}>

      {/* 🔵 BIG LEFT */}
      <View style={styles.big}>
        <Text style={styles.label}>{getLabel(active)}</Text>
       {React.cloneElement(charts[active], { height: 180, small: false })}
      </View>

      {/* 🟡 RIGHT SMALL STACK */}
      <View style={styles.right}>
        {Object.keys(charts).map((key) => {
          if (key === active) return null;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActive(key)}
              style={styles.small}
            >
              <Text style={styles.smallLabel}>{getLabel(key)}</Text>
              {React.cloneElement(charts[key], { height: 100, small: true })}
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
};

export default ChartSwitcher;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10
  },

  big: {
    flex: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10
  },

  right: {
    flex: 1,
    justifyContent: "space-between"
  },

  small: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    height: 120,
    opacity: 0.85
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5
  },

  smallLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3
  }
});