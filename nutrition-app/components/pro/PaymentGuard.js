import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest, BASE_URL } from "../../services/api";

export default function PaymentGuard() {
  //const { user } = useContext(AuthContext);
  
const { user, refreshUser } = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [file, setFile] = useState(null);
  const planPrice = user?.planPrice || 0;
//const planName = user?.planName || "Pro";
const planName = user?.plan;

const [plans, setPlans] = useState([]);

const [sending, setSending] = useState(false);

useEffect(() => {
  refreshUser(); // 🔥 مهم جدا
}, []);
/////////////////////////////////
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

  

useEffect(() => {
  if (!user) return;

 const planDate = user.planEndDate?.$date || user.planEndDate;
//const planDate = "2020-01-01"; // 🔥 expired test
  const isExpired = planDate
    ? new Date(planDate) < new Date()
    : false;

  const paymentRequired =
    user.paymentRequired === true ||
    user.paymentRequired === "true";

  const isFreePlan =
    user.plan === "Free" || user.planName === "Free";

  // 🔥 logic النهائي
  if (isFreePlan) {
    setShow(false);

  } else if (paymentRequired) {
    setShow("payment");   // 

  } else if (isExpired) {
    setShow("waiting");   

  } else {
    setShow(false);
  }

}, [user]);
/////////////////////////////////////////////////////////////

useEffect(() => {
  if (!user) return;

  const planType = (user?.plan || "").toLowerCase();

  if (planType === "free") {
    setShow(false);
    return;
  }


  const planDate = user.planEndDate?.$date || user.planEndDate;

  const isExpired = planDate
    ? new Date(planDate) < new Date()
    : false;

  const isWaiting =
    !user.paymentRequired && isExpired;

  if (isWaiting) {
    const interval = setInterval(() => {
      refreshUser();
    }, 3000);

    return () => clearInterval(interval);
  }
}, [user]);
///////////////////////////////////////////////////////////
  // 🔥 pick PDF
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf"
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

 

/*const handleSubmit = async () => {
  if (!file) {
    alert("Upload PDF first ❌");
    return;
  }


  
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.name || "payment.pdf",
      type: "application/pdf"
    });

    formData.append("email", user?.email);

    const res = await fetch(BASE_URL + "payment-proof", {
      method: "POST",
      body: formData
      // 🚫 بدون headers هنا
    });

    console.log("STATUS:", res.status);

    alert("Payment sent ✅");

    setShow(false);
    await refreshUser();

  } catch (e) {
    console.log("ERROR:", e);
    alert("Payment failed ❌");
  }
};*/


const handleSubmit = async () => {
  if (!file) {
    alert("Upload PDF first ❌");
    return;
  }

  setSending(true); // 🔥 START

  try {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.name || "payment.pdf",
      type: "application/pdf"
    });

    formData.append("email", user?.email);

    const res = await fetch(BASE_URL + "payment-proof", {
      method: "POST",
      body: formData
    });

    console.log("STATUS:", res.status);

    alert("Payment sent ✅");

    setShow(false);
    await refreshUser();

  } catch (e) {
    console.log("ERROR:", e);
    alert("Payment failed ❌");
  } finally {
    setSending(false); // 🔥 STOP
  }
};


  if (!show) return null;



if (show === "waiting") {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>⏳ Waiting</Text>
        <Text style={styles.subtitle}>
          Your payment is under review
        </Text>
      </View>
    </View>
  );
}


  return (
    <View style={styles.overlay}>
      <View style={styles.card}>

        <Text style={styles.title}>Complete Payment</Text>
        <Text style={styles.subtitle}>
          Activate your account by completing payment
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



        {/* 🔥 INFO */}
        <View style={styles.box}>
          <Text style={styles.info}>
            CCP: <Text style={styles.bold}>123456789</Text>
          </Text>

          <Text style={styles.info}>
            RIP: <Text style={styles.bold}>007999999999</Text>
          </Text>
        </View>

        {/* 🔥 UPLOAD */}
        <TouchableOpacity
          onPress={pickFile}
          style={styles.uploadBtn}
        >
          <Text style={styles.uploadText}>
            {file ? "File selected ✅" : "Upload Receipt (PDF)"}
          </Text>
        </TouchableOpacity>

        {/* 🔥 CONFIRM */}
        <TouchableOpacity
          onPress={handleSubmit}
          //disabled={!file}
          disabled={!file || sending}
          /*style={[
            styles.confirmBtn,
            !file && { backgroundColor: "#475569" }
          ]}*/
         style={[
  styles.confirmBtn,
  (!file || sending) && { backgroundColor: "#475569" }
]}
        >
          <Text style={styles.confirmText}>
  {sending ? "Sending..." : "Confirm Payment"}
</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
    zIndex: 999999
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

});