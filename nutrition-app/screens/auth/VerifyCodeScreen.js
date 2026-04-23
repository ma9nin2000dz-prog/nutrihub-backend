//import React, { useState } from "react";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
   Modal
} from "react-native";
//import { Modal } from "react-native";
import { BASE_URL } from "../../services/api";
import * as DocumentPicker from "expo-document-picker";
import { apiRequest } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

export default function VerifyCodeScreen({ route, navigation }) {

const [plans, setPlans] = useState([]);



useEffect(() => {
  const loadPlans = async () => {
    const data = await apiRequest("plans");
    setPlans(data);
  };
  loadPlans();
}, []);

const getPrice = (name) => {
  return plans.find(p => p.name === name)?.price || 0;
};


const getCCP = () => {
  return plans[0]?.ccp || "";
};

const getRIP = () => {
  return plans[0]?.rip || "";
};

const [file, setFile] = useState(null);

const pickFile = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/pdf"
  });

  if (!result.canceled) {
    setFile(result.assets[0]);
  }
};


  /////////////////////////////////////////
//const handlePaymentSubmit = () => {
  const handlePaymentSubmit = async () => {
  if (!file) {
    Alert.alert("Error", "Please upload PDF first ❌");
    return;
  }
console.log("FILE:", file);

const formData = new FormData();

formData.append("file", {
  uri: file.uri,
  //name: file.name,
  name: file.name || "payment.pdf",
  type: "application/pdf",
});

formData.append("email", email); // 🔥 هذا هو الحل

await fetch(BASE_URL + "payment-proof", {
  method: "POST",
  body: formData,
});




  Alert.alert("Success", "Payment proof sent ✔️");

  navigation.reset({
    index: 0,
    routes: [{ name: "Login" }],
  });
};



  const { logout } = useContext(AuthContext);
const from = route?.params?.from;
  const email = route?.params?.email;
 // const planName = route?.params?.plan || "Pro";
 const planName =
  route?.params?.plan ||
  route?.params?.user?.plan ||
  "Free";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

const [showPaymentModal, setShowPaymentModal] = useState(false);
console.log("SHOW MODAL:", showPaymentModal);

/*useEffect(() => {
  if (from === "expired_plan") {
    setShowPaymentModal(true);
  }
}, []);*/
/*useEffect(() => {
  if (from === "expired_plan" || from === "payment_required") {
    setShowPaymentModal(true);
  }
}, [from]);*/
useEffect(() => {

  const planType = (planName || "").toLowerCase();

  // 🔥 Free never shows payment modal
  if (planType === "free") {
    setShowPaymentModal(false);
    return;
  }

  if (
    from === "expired_plan" ||
    from === "payment_required"
  ) {
    setShowPaymentModal(true);
  }

}, [from, planName]);
//////////////////////////////

  const handleVerify = async () => {
    try {
      setError("");

      if (!code || code.length < 4) {
        setError("Enter valid 4-digit code");
        return;
      }

      const res = await apiRequest("verify-code", "POST", {
        email,
        code
      });

     
   



if (from === "profile") {
  // ✔ يرجع مباشرة بدون مودال
  navigation.goBack();
} /*else {
  
  setShowPaymentModal(true);
}*/
else {

  const planType = (planName || "").toLowerCase();

  if (planType === "free") {

    // 🔥 Free يكمل مباشرة
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }]
    });

  } else {

    // 💳 الخطط المدفوعة فقط
    setShowPaymentModal(true);

  }

}



    } catch (err) {
      setError(err.message || "Verification failed");
    }
  };




/////////////////////////////////////////////////////



const handleCancel = async () => {

  // 🔥 إذا جا من profile → ما نحذفوش الحساب
  if (from === "profile") {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("PatientPlanRouter");
    }
    return;
  }

  // 🔥 فقط في signup نحذف الحساب
  try {
    console.log("DELETE START");

    const res = await fetch(BASE_URL + `users/delete-user/${email}`, {
      method: "DELETE",
    });

    const data = await res.json();
    console.log("DELETE RESPONSE:", data);

    navigation.reset({
      index: 0,
      routes: [{ name: "Visitor" }],
    });

  } catch (err) {
    console.log("DELETE ERROR:", err);
    Alert.alert("Error", "Failed to delete account ❌");
  }
};
////////////////////////////////////////////////////////////////////


    return (
 <View style={{ flex: 1 }} key={showPaymentModal ? "modal" : "normal"}>



<Modal visible={showPaymentModal} transparent animationType="fade">
  <View style={styles.overlay}>

    <View style={styles.card}>

      {/* TITLE */}
      <Text style={styles.title}>COMPLETE PAYMENT</Text>
      <Text style={styles.subtitle}>
        Activate your account by completing the payment
      </Text>

      {/* PLAN + PRICE */}
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Plan</Text>
          <Text style={styles.value}>{planName}</Text>
        </View>

        <View>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>
  {getPrice(planName)} DA
</Text>
        </View>
      </View>

      {/* PAYMENT BOX */}
      <View style={styles.box}>
        <Text style={styles.info}>
           CCP: <Text style={styles.bold}>{getCCP()}</Text>
         </Text>

         <Text style={styles.info}>
           RIP: <Text style={styles.bold}>{getRIP()}</Text>
         </Text>
      </View>

      {/* UPLOAD BUTTON */}
      <TouchableOpacity
        onPress={pickFile}
        style={styles.uploadBtn}
      >
        <Text style={styles.uploadText}>
          {file ? "File selected ✅" : "Upload Receipt (PDF)"}
        </Text>
      </TouchableOpacity>

      {/* CONFIRM BUTTON */}
      <TouchableOpacity
        onPress={handlePaymentSubmit}
        disabled={!file}
        style={[
          styles.confirmBtn,
          !file && { backgroundColor: "#475569" }
        ]}
      >
        <Text style={styles.confirmText}>
          Confirm Payment
        </Text>
      </TouchableOpacity>




      <TouchableOpacity
  onPress={handleCancel}
  style={{
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#ef4444"
  }}
>
  <Text style={{ color: "white", fontWeight: "bold" }}>
    Cancel & Delete Account
  </Text>
</TouchableOpacity>
    </View>

  </View>
</Modal>









{from !== "expired_plan" && (
  <TouchableOpacity style={styles.backCircle} onPress={handleCancel}>
    <Ionicons name="arrow-back" size={22} color="#ef4444" />
  </TouchableOpacity>
)}

    {/* 🔙 BACK BUTTON 
    
    <TouchableOpacity
      style={styles.backCircle}
onPress={handleCancel}    >
      <Ionicons name="arrow-back" size={22} color="#ef4444" />
    </TouchableOpacity>*/}



{from !== "expired_plan" && (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>Verify Email</Text>

      <Text style={styles.subtitle}>
        Enter the 4-digit code sent to:
      </Text>

      <Text style={styles.email}>{email}</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={4}
        value={code}
        onChangeText={setCode}
        placeholder="----"
        placeholderTextColor="#94a3b8"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Alert.alert("Info", "Resend not implemented yet")}
      >
        <Text style={styles.resend}>Resend Code</Text>
      </TouchableOpacity>

    </SafeAreaView>
)}
  </View>
);



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc"
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#0f172a"
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b"
  },

  email: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
    color: "#334155"
  },

  input: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 16,
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 10,
    marginBottom: 10
  },

  error: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 10
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  resend: {
    marginTop: 15,
    textAlign: "center",
    color: "#3b82f6"
  },
  backCircle: {
  position: "absolute",
  top: 40,
  left: 20,
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "#fee2e2",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10
},










  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold"
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 5,
    marginBottom: 15
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },

  label: {
    color: "#64748b",
    fontSize: 13
  },

  value: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },

  box: {
    backgroundColor: "#020617",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15
  },

  info: {
    color: "#cbd5f5",
    marginBottom: 5
  },

  bold: {
    color: "white",
    fontWeight: "bold"
  },

  uploadBtn: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center"
  },

  uploadText: {
    color: "#e2e8f0"
  },

  confirmBtn: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
    alignItems: "center"
  },

  confirmText: {
    color: "white",
    fontWeight: "bold"
  }


/////////////////////////
});