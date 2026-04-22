import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { apiRequest } from "../../../services/api";

export default function LatestUsers() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest("users/latest");
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.card}>

      <Text style={styles.title}>Latest Users</Text>

      {/* 🔥 HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Name</Text>
        <Text style={styles.headerText}>Role</Text>
        <Text style={styles.headerText}>Plan</Text>
      </View>

      {/* 🔥 DATA */}
      {users.map((user) => (
        <View key={user._id} style={styles.row}>

  <Text style={[styles.name, styles.colName]}>
    {user.name}
  </Text>

  <View style={styles.colRole}>
  <Text style={[
    styles.badge,
    user.role === "expert" && styles.expert,
    user.role === "patient" && styles.patient
  ]}>
    {user.role}
  </Text>
</View>

  <Text style={[
    styles.plan,
    styles.colPlan,
    user.plan === "Pro" && styles.pro,
    user.plan === "Plus" && styles.plus,
    user.plan === "Free" && styles.free
  ]}>
    {user.plan}
  </Text>

</View>
      ))}

    </View>
  );
}

const styles = StyleSheet.create({

  /*card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    flex: 1,
    minWidth: 300,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },*/

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15
  },

  /* 🔥 HEADER */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6
  },

  headerText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600"
  },

  /* 🔥 ROW */
 
 /* row: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#f1f5f9"
},*/

  name: {
    fontWeight: "500"
  },

  /* 🔥 ROLE BADGE */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    overflow: "hidden",
    color: "white"
  },

  expert: {
    backgroundColor: "#6366f1"
  },

  patient: {
    backgroundColor: "#22c55e"
  },

  /* 🔥 PLAN */
  plan: {
    fontWeight: "600"
  },

  free: {
    color: "#3b82f6"
  },

  plus: {
    color: "#22c55e"
  },

  pro: {
    color: "#ef4444"
  },
  colName: {
  width: "40%"
},

colRole: {
  width: "30%",
  alignItems: "flex-start" // 🔥 مهم
},

colPlan: {
  width: "30%",
  textAlign: "left",
  marginLeft: 60
},
card: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 15,
  flex: 1,
  minWidth: 300,

  // 🔥 SHADOW قوي واحترافي
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 12,

  elevation: 6, // Android
},
card: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 15,
  flex: 1,
  minWidth: 300,

  // 🔥 SHADOW قوي واحترافي
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 12,

  elevation: 6, // Android
},
row: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#f1f5f9",

  // 🔥 effect خفيف
  backgroundColor: "#fff",
},

});