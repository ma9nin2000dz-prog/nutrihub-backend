import React, { useEffect, useState,useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { apiRequest } from "../../../services/api";
import { useFocusEffect } from "@react-navigation/native";
//import { useCallback } from "react";
//export default function PendingApprovals() {
export default function PendingApprovals({ users = [], onApprove }) {



 



  return (
    <View style={styles.card}>

      <Text style={styles.title}>Pending Approvals</Text>

      {/* 🔥 HEADER */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, styles.colName]}>Name</Text>
        <Text style={[styles.headerText, styles.colRole]}>Role</Text>
        <Text style={[styles.headerText, styles.colAction]}>Action</Text>
      </View>

      {/* 🔥 DATA */}
      {users.map((user) => (
        <View key={user._id} style={styles.row}>

          {/* NAME */}
          <Text style={[styles.name, styles.colName]}>
            {user.name}
          </Text>

          {/* ROLE */}
          <View style={styles.colRole}>
            <Text style={[
              styles.badge,
              user.role === "expert" && styles.expert,
              user.role === "patient" && styles.patient
            ]}>
              {user.role}
            </Text>
          </View>

          {/* ACTION */}
          <View style={styles.colAction}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => onApprove(user._id)}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
          </View>

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
  card: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 15,
  flex: 1,
  minWidth: 300,

  // 🔥 iOS shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 12,

  // 🔥 Android shadow
  elevation: 6,
},

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15
  },

  /* 🔥 HEADER */
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 10
  },

  headerText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600"
  },

  /* 🔥 ROW */
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",

     backgroundColor: "#fff",
  },

  name: {
    fontWeight: "500"
  },

  /* 🔥 COLUMNS */
  colName: {
    flex: 2
  },

  colRole: {
    flex: 1.5,
    alignItems: "flex-start"
  },

  colAction: {
    flex: 1.5,
    alignItems: "flex-start"
  },

  /* 🔥 BADGE */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    color: "white"
  },

  expert: {
    backgroundColor: "#6366f1"
  },

  patient: {
    backgroundColor: "#22c55e"
  },

  /* 🔥 BUTTON */
  button: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },

  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600"
  }

});