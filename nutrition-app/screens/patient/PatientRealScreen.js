import React, { useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function PatientRealScreen() {

  const { logout, userRole, userPlan } = useContext(AuthContext);
  const navigation = useNavigation();

  /////////////////////////////////////////////////////////
  // 🔥 إذا الحساب Pro ادخل مباشرة Dashboard
  /////////////////////////////////////////////////////////
  useEffect(() => {
    if (userPlan === "Pro") {
      navigation.replace("ProTest");
    }
  }, [userPlan]);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Welcome Patient 👋</Text>

      <Text style={styles.subtitle}>
        Role: {userRole}
      </Text>

      <Text style={styles.plan}>
        Plan: {userPlan}
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>My Nutrition Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Search Products</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 5
  },
  plan: {
    fontSize: 16,
    marginBottom: 30,
    fontWeight: "bold",
    color: "#4CAF50"
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: "80%",
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  },
  logoutButton: {
    marginTop: 20
  },
  logoutText: {
    color: "red",
    fontWeight: "bold"
  }
});