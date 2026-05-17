import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet ,ScrollView} from "react-native";
import { apiRequest } from "../../services/api";

export default function PlanPricingScreen() {

  const [plans, setPlans] = useState([]);
  const [ccp, setCcp] = useState("");
  const [rip, setRip] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await apiRequest("plans");
      setPlans(data);

      // 🔥 نجيب CCP و RIP من أول plan فقط
      if (data.length > 0) {
        setCcp(data[0].ccp || "");
        setRip(data[0].rip || "");
      }

    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  // 🔥 تحديث price فقط
  const updatePrice = async (name, price) => {
    try {
      await apiRequest(`plans/${name}`, "PUT", {
        price: Number(price)
      });

      loadPlans();
    } catch (err) {
      console.log("UPDATE ERROR:", err);
    }
  };

  // 🔥 تحديث CCP + RIP لكل plans
  const updatePaymentInfo = async () => {
    try {
      for (let plan of plans) {
        await apiRequest(`plans/${plan.name}`, "PUT", {
          ccp,
          rip
        });
      }

      loadPlans();
    } catch (err) {
      console.log("UPDATE PAYMENT ERROR:", err);
    }
  };

  // 🔥 update state
  const updateField = (index, value) => {
    const updated = [...plans];
    updated[index].price = value;
    setPlans(updated);
  };

  return (
    <ScrollView
  contentContainerStyle={styles.container}
  showsVerticalScrollIndicator={false}
>

      <Text style={styles.title}>💰 Plan Pricing</Text>

      {/* 🔹 PLANS */}
      {plans.map((plan, index) => (
        <View key={index} style={styles.card}>

          <Text style={styles.planName}>{plan.name}</Text>

          <TextInput
            style={styles.input}
            value={String(plan.price)}
            keyboardType="numeric"
            onChangeText={(text) => updateField(index, text)}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => updatePrice(plan.name, plan.price)}
          >
            <Text style={styles.btnText}>Save</Text>
          </TouchableOpacity>

        </View>
      ))}

      {/* 🔥 CCP + RIP GLOBAL */}
      <View style={styles.card}>

        <Text style={styles.planName}>CCP</Text>
        <TextInput
          style={styles.input}
          value={ccp}
          onChangeText={setCcp}
        />

        <Text style={styles.planName}>RIP</Text>
        <TextInput
          style={styles.input}
          value={rip}
          onChangeText={setRip}
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={updatePaymentInfo}
        >
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  //  flex: 1,
    padding: 20,
    backgroundColor: "#f3f4f6"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15
  },

  planName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },

  saveBtn: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold"
  }
});