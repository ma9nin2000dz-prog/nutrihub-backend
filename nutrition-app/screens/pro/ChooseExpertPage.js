import React from "react";
import { Platform, Linking } from "react-native";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Image
} from "react-native";
import { Phone, Mail, ArrowUpRight } from "lucide-react-native";

import { BASE_URL } from "../../services/api";

const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};

export default function ChooseExpertPage({
  experts,
  expertSearch,
  setExpertSearch,
  chooseExpert,
  onClose ,
  selectedExpertId
}) {

  const filteredExperts = experts.filter(exp =>
    exp.name?.toLowerCase().includes((expertSearch || "").toLowerCase())
  );

  const openEmail = (email) => {
    if (Platform.OS === "web") {
      window.open(
        `https://mail.google.com/mail/?view=cm&to=${email}`,
        "_blank"
      );
    } else {
      Linking.openURL(`mailto:${email}`);
    }
  };
///////////////////////////////////
const openWhatsApp = (phone) => {
  if (!phone) {
    alert("No phone number 📵");
    return;
  }

  const cleaned = phone.replace(/\D/g, "");
  const url = `https://wa.me/${cleaned}`;

  Linking.openURL(url).catch(() => {
    alert("WhatsApp not available");
  });
};
  return (

    <View style={{ flex: 1 }}>

      {/* SCROLL */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
      <View style={{ marginTop: 20 }}> 
        <Text style={styles.header}>Staff Availability</Text>

        <TextInput
          placeholder="Search expert..."
          placeholderTextColor="#64748b"
          value={expertSearch}
          onChangeText={setExpertSearch}
          style={styles.input}
        />

        {filteredExperts.map(exp => {
          const isSelected = exp._id === selectedExpertId;
          const isAvailable = (exp.patients?.length || 0) < 15;

         const isDefault = exp.photo === "/uploads/default-avatar.png";

const imageUri =
  exp.photo && !isDefault
    ? (exp.photo.startsWith("http")
        ? exp.photo
        : getImageUrl(exp.photo))
    : null;

const firstLetter = exp.name
  ? exp.name.charAt(0).toUpperCase()
  : "?";

          return (

            <View key={exp._id} style={styles.card}>

              {/* LEFT */}
              <View style={styles.left}>
                <View style={styles.avatar}>
  {imageUri ? (
    <Image
      source={{ uri: imageUri }}
      style={styles.avatarImage}
    />
  ) : (
    <Text style={styles.avatarText}>
      {firstLetter}
    </Text>
  )}
</View>

                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.name}>{exp.name}</Text>
                  <Text style={styles.email}>{exp.email}</Text>
                  <Text style={styles.role}>Nutrition Expert</Text>

                  <View style={[
                    styles.status,
                    { backgroundColor: isAvailable ? "#14532d" : "#7f1d1d" }
                  ]}>
                    <Text style={{
                      color: isAvailable ? "#22c55e" : "#ef4444",
                      fontSize: 11
                    }}>
                      {isAvailable ? "Available" : "Not Available"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* RIGHT */}
              <View style={styles.right}>

               <TouchableOpacity
  style={[styles.iconBtn, { opacity: exp.phone ? 1 : 0.4 }]}
  onPress={() => openWhatsApp(exp.phone)}
  disabled={!exp.phone}
>
  <Phone size={16} color="white" />
</TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => openEmail(exp.email)}
                >
                  <Mail size={16} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
  style={[
    styles.mainBtn,
    {
      opacity: isAvailable && !isSelected ? 1 : 0.4,
      backgroundColor: isSelected ? "#22c55e" : "#f97316"
    }
  ]}
  disabled={!isAvailable || isSelected}
  onPress={() => chooseExpert(exp._id)}
>
  <ArrowUpRight size={18} color="white" />
</TouchableOpacity>

              </View>

            </View>
          );
        })}
    </View>
      </ScrollView>

      {/* 🔥 BOTTOM BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 15
  },

  header: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15
  },

  input: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 12,
    color: "white",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1e293b"
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12
  },

  left: {
    flexDirection: "row",
    alignItems: "center"
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 50
  },

  name: {
    color: "white",
    fontSize: 15,
    fontWeight: "600"
  },

  role: {
    color: "#64748b",
    fontSize: 12
  },

  status: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start"
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  iconBtn: {
    backgroundColor: "#1e293b",
    padding: 10,
    borderRadius: 50
  },

  mainBtn: {
    backgroundColor: "#f97316",
    padding: 12,
    borderRadius: 50
  },

  email: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2
  },

  /* 🔥 NEW */
  bottomContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "#020617"
  },

  closeBtn: {
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 12,
    alignItems: "center"
  },

  closeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
  avatarImage: {
  width: "100%",
  height: "100%",
  borderRadius: 50
},

avatarText: {
  color: "white",
  fontSize: 18,
  fontWeight: "bold"
},
avatar: {
  width: 60,
  height: 60,
  borderRadius: 70,

  backgroundColor: "#22c55e",   // 🔥 هذا المهم
  justifyContent: "center",     // 🔥 توسيط عمودي
  alignItems: "center"          // 🔥 توسيط أفقي
},

});



