import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { BASE_URL } from "../../../services/api";

const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};
const PlanRequests = ({ requests = [], onAccept, onReject }) => {
  return (
    <View style={styles.card}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>New Requests</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>

      {/* LIST */}
      {requests.map((user) => (
        <View key={user._id} style={styles.row}>

          {/* USER */}
          <View style={styles.userInfo}>
            <Image
  source={{
    uri: user.photo
      ? getImageUrl(user.photo)
      : "https://via.placeholder.com/150"
  }}
  style={styles.avatar}
/>

            <View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>

              <Text style={styles.planText}>
  <Text style={{ color: "#94a3b8" }}>
    {user.plan}
  </Text>

  {"  →  "}

  <Text style={{ color: "#22c55e", fontWeight: "bold" }}>
    {user.requestedPlan}
  </Text>
</Text>
            </View>
          </View>

          
          <View style={styles.actions}>
          {/* ACTIONS   <TouchableOpacity onPress={() => onReject(user._id)}>
  <Text style={styles.reject}>✕</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => onAccept(user._id, user.requestedPlan)}>
  <Text style={styles.accept}>✓</Text>
</TouchableOpacity>*/}

<TouchableOpacity
  onPress={() => onReject(user._id)}
  style={styles.rejectBtn}
  activeOpacity={0.8}
>
  <Text style={styles.reject}>✕</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => onAccept(user._id, user.requestedPlan)}
  style={styles.acceptBtn}
  activeOpacity={0.8}
>
  <Text style={styles.accept}>✓</Text>
</TouchableOpacity>


          </View>

        </View>
      ))}

    </View>
  );
};

export default PlanRequests;
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },

  title: {
    color: "#111",
    fontSize: 16,
    fontWeight: "bold"
  },

  viewAll: {
    color: "#6b7280"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },

  userInfo: {
    flexDirection: "row",
    gap: 10
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22
  },

  name: {
    color: "#111",
    fontWeight: "600"
  },

  email: {
    color: "#6b7280",
    fontSize: 12
  },

  plan: {
    color: "#22c55e",
    fontSize: 12,
    marginTop: 2
  },

  actions: {
    flexDirection: "row",
    gap: 15
  },

  reject: {
    color: "#ef4444",
    fontSize: 18
  },

  accept: {
    color: "#22c55e",
    fontSize: 18
  },


  rejectBtn: {
  backgroundColor: "#fff",
  width: 36,
  height: 36,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",

  // 🔥 3D effect
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5
},

acceptBtn: {
  backgroundColor: "#fff",
  width: 36,
  height: 36,
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",

  // 🔥 3D effect
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 5
},

// خلي text كما هو عندك
reject: {
  color: "#ef4444",
  fontSize: 18,
  fontWeight: "bold"
},

accept: {
  color: "#22c55e",
  fontSize: 18,
  fontWeight: "bold"
},
});