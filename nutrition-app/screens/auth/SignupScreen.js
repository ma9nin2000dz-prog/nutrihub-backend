//import React, { useState, useContext } from "react";
import React, { useState, useContext, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { apiRequest } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

export default function SignupScreen({ route, navigation }) {
const [successMessage, setSuccessMessage] = useState("");
  //const { login } = useContext(AuthContext);
  const { loginUser } = useContext(AuthContext);
  const selectedPlan = route?.params?.plan || "Free";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [errorMessage, setErrorMessage] = useState("");

 const [isAvailable, setIsAvailable] = useState(null);
const [checking, setChecking] = useState(false);

const checkUsername = async (value) => {
  try {
    setChecking(true);

    const res = await apiRequest(
      `users/check-username?username=${value}`,
      "GET"
    );

    setIsAvailable(res.available);
  } catch (e) {
    console.log(e);
  } finally {
    setChecking(false);
  }
};
////////////////////
useEffect(() => {
  if (!name) {
    setIsAvailable(null);
    return;
  }

  const delay = setTimeout(() => {
    if (name.length > 2) {
      checkUsername(name);
    }
  }, 500);

  return () => clearTimeout(delay);
}, [name]);
/////////////////////////////////////

  const handleSignup = async () => {
    
  try {
    setErrorMessage("");


   /* if (checking) {
  setErrorMessage("Checking username... ⏳");
  return;
}*/

if (isAvailable === false) {
  setErrorMessage("Username already used ❌");
  return;
}

   
const res = await apiRequest("register", "POST", {
  name,
  email,
  password,
  role,
  plan: selectedPlan,
});

console.log("TYPE:", res.type);
console.log("FULL RESPONSE:", res);

const status = res.type;

if (status === "not_verified") {
  setSuccessMessage("Please verify your email 📩");
  //navigation.navigate("VerifyCode", { email });
navigation.navigate("VerifyCode", {
  email,
  from: "signup",
  plan: selectedPlan // 🔥 هذا هو الحل
});

} else if (status === "pending") {
  setSuccessMessage("Your account is waiting for admin approval ⏳");

} else if (status === "approved") {
  setSuccessMessage("Account created successfully ✅");
}


  } catch (error) {
    setErrorMessage(error.message);
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >

        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>

         <TouchableOpacity
  style={styles.backCircle}
  onPress={() => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else if (route?.params?.onClose) {
      route.params.onClose();
    }
  }}
>
  <Ionicons name="arrow-back" size={22} color="#ef4444" />
</TouchableOpacity>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your nutrition journey 🚀
            </Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>

            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                errorMessage && styles.inputError
              ]}
            />




{checking && (
  <Text style={{ color: "#facc15" }}>Checking...</Text>
)}

{isAvailable === true && (
  <Text style={{ color: "#22c55e" }}>Username available ✅</Text>
)}

{isAvailable === false && (
  <Text style={{ color: "#ef4444" }}>Username already taken ❌</Text>
)}



            <TextInput
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              style={[
                styles.input,
                errorMessage && styles.inputError
              ]}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[
                styles.input,
                errorMessage && styles.inputError
              ]}
            />

{successMessage ? (
  <Text style={styles.successText}>{successMessage}</Text>
) : null}

            {/* ERROR */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* ROLE */}
            <Text style={styles.label}>Select Role</Text>

            <View style={styles.row}>
              {["patient", "expert"].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.optionBtn,
                    role === r && styles.selected
                  ]}
                  onPress={() => setRole(r)}
                >
                  <Text
                    style={{
                      color: role === r ? "white" : "#334155",
                      fontWeight: "600"
                    }}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

          </View>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24
  },

  header: {
    marginBottom: 30,
    alignItems: "center"
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a"
  },

  subtitle: {
    color: "#64748b",
    marginTop: 6
  },

  form: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },

  input: {
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    fontSize: 14
  },

  inputError: {
    borderWidth: 1,
    borderColor: "#ef4444"
  },

  errorText: {
    color: "#ef4444",
    marginBottom: 10,
    textAlign: "center"
  },

  label: {
    marginTop: 10,
    marginBottom: 8,
    fontWeight: "600",
    color: "#334155"
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20
  },

  optionBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignItems: "center"
  },

  selected: {
    backgroundColor: "#22c55e"
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 16,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  closeBtn: {
  position: "absolute",
  top: -10,
  right: -10,
  backgroundColor: "#ef4444",
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10
},

closeText: {
  color: "white",
  fontSize: 18,
  fontWeight: "bold"
},
backCircle: {
  position: "absolute",
  top: -20,
  left: -20,
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#fee2e2",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10
},

successText: {
  color: "#22c55e",
  textAlign: "center",
  marginBottom: 10,
  fontWeight: "600"
},

});