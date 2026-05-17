import React, { useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {

  const { loginUser } = useContext(AuthContext);
const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      setErrorMessage(""); 
      //await loginUser(email.trim(), password.trim());

//////////////////////////////////////////////////
      const res = await loginUser(email.trim(), password.trim());

// 🔥 هنا تضيف الشرط
if (res?.type === "expired_plan") {
  navigation.navigate("VerifyCode", {
    email: res.email,
    from: "expired_plan",
  });
  return;
}
////////////////////////////////////////
if (res?.type === "payment_required") {
  navigation.navigate("VerifyCode", {
    email: res.email,
    from: "payment_required",
    plan: res.plan
  });
  return;
}
//////////////////////////////////////////////////////
    } catch (error) {
      
      setErrorMessage(error.message); 
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
  style={styles.backCircle}
  onPress={() => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.navigate("Visitor");
  }
}}

>
  <Ionicons name="arrow-back" size={22} color="#ef4444" />
</TouchableOpacity>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#888"
        
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#888"
      />

       {errorMessage ? (
  <Text style={styles.errorText}>{errorMessage}</Text>
) : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={{ color: "white" }}>Login</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#745b5b",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    color: "black"
  },
  button: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 6,
    alignItems: "center"
  },
 backCircle: {
  position: "absolute",
  top: 50,
  left: 20,
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#fee2e2",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10
},

errorText: {
  color: "#ef4444",
  marginBottom: 10,
  textAlign: "center"
},
});