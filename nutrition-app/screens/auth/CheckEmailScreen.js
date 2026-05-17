import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { apiRequest } from "../../services/api";

export default function CheckEmailScreen() {

  const navigation = useNavigation();
  const route = useRoute();

  const plan = route.params?.plan; // 🔥 plan جا من Visitor

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {

    if (loading) return;

    // ✅ validation بسيط
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Invalid email ❌");
      return;
    }

    try {
      setLoading(true);

      const res = await apiRequest("check-email", "POST", { email });

      if (!res.available) {
        Alert.alert("Error", "Email already used ❌");
        return;
      }

      // ✅ يروح للـ signup
      navigation.navigate("Signup", {
        email,
        plan
      });

    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Enter Your Email</Text>

      <Text style={styles.subtitle}>
        We will use this email for your account
      </Text>

      <TextInput
        style={styles.input}
        placeholder="example@email.com"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleCheck}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Checking..." : "Continue"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#020617"
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center"
  },

  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20
  },

  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontWeight: "bold"
  }
});