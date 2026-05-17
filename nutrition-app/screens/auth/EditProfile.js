import React, { useState, useContext ,useEffect} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
//import { BASE_URL } from "../../services/api";
import { apiRequest } from "../../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";
//import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native"; 

export default function EditProfile({ setActiveTab }) {
const navigation = useNavigation();
const route = useRoute(); // 🔥 هذا هو المهم


  //const { user } = useContext(AuthContext);
const { user, setUser } = useContext(AuthContext);
const [plan, setPlan] = useState(user?.plan || "Free");
const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);

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
//////////////////////////////////////////

useEffect(() => {
  if (!name || name === user?.name) {
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


//////////////////////////////////
useEffect(() => {
  setName(user?.name || "");
  setEmail(user?.email || "");
  setPhone(user?.phone || "");
  setPlan(user?.plan || "Free");
}, [user]);



/////////////////////////////////////






//////////////////////////////////
 const handleSave = async () => {


  console.log("BEFORE NAVIGATION");
//navigation.navigate("VerifyCode", { email, from: "profile" });
console.log("AFTER NAVIGATION");
  if (loading) return; // 🔥 يمنع spam

   if (checking) {
    alert("Checking username... ⏳");
    return;
  }

  if (name !== user?.name && isAvailable === false) {
    alert("Username already used ❌");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  alert("Invalid email ❌");
  return;
} 

  if (phone.length < 8) {
    alert("Phone too short ❌");
    return;
  }

  try {

    setLoading(true); // 🔥 يبدأ loading

    const body = {
      name, 
      email,
      phone,
      ...(password && { password }),
        ...(plan !== user.plan && { requestedPlan: plan })
    };

  //await apiRequest("users/profile", "PUT", body);
const res = await apiRequest("users/profile", "PUT", body);

/*if (res.type === "email_change_requested") {
  alert(res.message);

  navigation.navigate("VerifyCode", { email });

  return;
}*/


/*if (
  
  res.type === "email_change_requested" ||
  res.message?.toLowerCase().includes("verification")
)*/
if (res.type === "email_change_requested") {
  navigation.navigate("VerifyCode", { email, from: "profile" });
  return;
}


Alert.alert("Success", "Profile updated successfully ✅");




// 🔥 جيب user الجديد من السيرفر
const updatedUser = await apiRequest("users/me");

setUser({ ...updatedUser }); // 🔥 مهم جدًا
    setPassword("");

    alert("Updated successfully ✅");

    setActiveTab("products");

  } catch (error) {
    alert(error.message || "Update failed ❌");
  } finally {
    setLoading(false); // 🔥 ينتهي loading
  }
};






  return (
    <ScrollView
  contentContainerStyle={styles.container}
  showsVerticalScrollIndicator={false}
>

      {/* BACK */}
      <TouchableOpacity onPress={() => setActiveTab("products")}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text style={styles.title}>Edit Profile</Text>
  
         <Text style={styles.label}>Name</Text>
<TextInput
  placeholder="Enter your name"
  placeholderTextColor="#999"
  value={name}
  onChangeText={(text) => setName(text.trimStart())}
  style={styles.input}
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





      {/* EMAIL */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="Enter new email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* PHONE */}
      <Text style={styles.label}>Phone</Text>
      <TextInput
        placeholder="Enter phone number"
        placeholderTextColor="#999"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />

      {/* PASSWORD */}
      <Text style={styles.label}>Password</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Enter new password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.show}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>



{user?.role === "patient" && (
  <>
    <Text style={styles.label}>Change Plan</Text>

    <View style={{ flexDirection: "row", gap: 10 }}>
      {["Free", "Plus", "Pro"].map((p) => (
        <TouchableOpacity
          key={p}
          onPress={() => !user?.requestedPlan && setPlan(p)}
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: plan === p ? "#22c55e" : "#1e293b",
            opacity: user?.requestedPlan ? 0.5 : 1
          }}
        >
          <Text style={{ color: "white" }}>{p}</Text>
        </TouchableOpacity>
      ))}

    
    </View>
      {user?.requestedPlan && (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingText}>
            {user.plan} → {user.requestedPlan} ⏳ Waiting for approval
          </Text>
        </View>
      )}
  </>
)}





      {/* BUTTON */}
      <TouchableOpacity
  style={[styles.button, loading && { opacity: 0.6 }]}
  onPress={handleSave}
  disabled={loading}
>
  <Text style={styles.buttonText}>
    {loading ? "Saving..." : "Save Changes"}
  </Text>
</TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#020617"
  },

  back: {
    color: "#22c55e",
    marginBottom: 5
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5
  },

  label: {
    color: "white",
    marginBottom: 5,
    marginTop: 10
  },

  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: 10
  },

  passwordInput: {
    flex: 1,
    color: "white",
    paddingVertical: 12
  },

  show: {
    color: "#22c55e",
    marginLeft: 10
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "white",
    fontWeight: "bold"
  },
  pendingBox: {
  backgroundColor: "#78350f",
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 20,
  alignSelf: "flex-start",
  marginTop: 10
},

pendingText: {
  color: "#facc15",
  fontWeight: "bold"
},

});