import React, { useEffect, useState } from "react";
//import { Platform } from "react-native";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal ,
    Image,
  Linking,
  Platform
} from "react-native";
//import { apiRequest } from "../../services/api";
import { Phone, Mail,Trash2  } from "lucide-react-native";
import { apiRequest, BASE_URL } from "../../services/api";
export default function ExpertsScreen() {
/////////////////////////////////



const getDaysLeft = (date) => {
  if (!date) return null;

  const now = new Date();
  const end = new Date(date);

  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
//////////////////////////////////////////////


const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};

const openEmail = (email) => {
  if (!email) return;

  if (Platform.OS === "web") {
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${email}`,
      "_blank"
    );
  } else {
    Linking.openURL(`mailto:${email}`);
  }
};

const openWhatsApp = (phone) => {
  if (!phone) {
    alert("No phone number 📵");
    return;
  }

  const cleaned = phone.replace(/\D/g, "");
  Linking.openURL(`https://wa.me/${cleaned}`);
};





  const [experts, setExperts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
   const [modalVisible, setModalVisible] = useState(false);
  // Create Expert Form
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const LIMIT = 5;

  /////////////////////////////////////////////////////////////
  // FETCH EXPERTS
  /////////////////////////////////////////////////////////////
  const fetchExperts = async () => {
    try {
      setLoading(true);

      let query = `users/experts?page=${page}&limit=${LIMIT}`;
      if (search) query += `&search=${search}`;

      const data = await apiRequest(query);

      setExperts(data.experts || []);
      setTotalPages(data.totalPages || 1);

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, [page]);

  /////////////////////////////////////////////////////////////
  // CREATE EXPERT
  /////////////////////////////////////////////////////////////
  const createExpert = async () => {
    try {
      if (!newName || !newEmail || !newPassword) {
        Alert.alert("Error", "All fields are required");
        return;
      }

      await apiRequest("users/experts", "POST", {
        name: newName,
        email: newEmail,
        password: newPassword,
      });

      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setShowForm(false);

      fetchExperts();

    } catch (error) {
      Alert.alert("Create Error", error.message);
    }
  };

  /////////////////////////////////////////////////////////////
  // DELETE EXPERT
  /////////////////////////////////////////////////////////////
  
  const deleteExpert = async (id) => {
  try {

    if (Platform.OS === "web") {
      const confirmDelete = window.confirm("Delete this expert?");
      if (!confirmDelete) return;

      await apiRequest(`users/experts/${id}`, "DELETE");
      setExperts(prev => prev.filter(e => e._id !== id));

    } else {
      Alert.alert(
        "Confirm",
        "Delete this expert?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await apiRequest(`users/experts/${id}`, "DELETE");
              setExperts(prev => prev.filter(e => e._id !== id));
            }
          }
        ]
      );
    }

  } catch (error) {
    Alert.alert("Delete Error", error.message);
  }
};

  /////////////////////////////////////////////////////////////
  // APPROVE EXPERT
  /////////////////////////////////////////////////////////////
  const approveExpert = async (id) => {
    try {
      await apiRequest(`users/experts/${id}/approve`, "PUT");
      fetchExperts();
    } catch (error) {
      Alert.alert("Approve Error", error.message);
    }
  };





////////////////////////regect payment/////////////////////////////////////


const rejectPayment = async (id) => {
  try {
    await apiRequest(`users/payment-reject/${id}`, "PUT");

    Alert.alert("Done", "User must pay again ✔");

    setSelectedExpert(prev => ({
      ...prev,
      paymentRequired: true
    }));

  } catch (error) {
    Alert.alert("Error", error.message);
  }
};






  /////////////////////////////////////////////////////////////
  // RENDER ITEM
  /////////////////////////////////////////////////////////////
  
  
  
  
  
  const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.newCard}
    activeOpacity={0.85}
    onPress={() => {
      setSelectedExpert(item);
      setModalVisible(true);
    }}
  >
    {/* LEFT */}
    <View style={{ flexDirection: "row", alignItems: "center" }}>

      {/* 🔥 IMAGE / AVATAR */}
      {item.photo && item.photo !== "/uploads/default-avatar.png" ? (
        <Image
          source={{ uri: getImageUrl(item.photo) }}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.trim()?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>
      )}

      {/* INFO */}
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.newName}>{item.name}</Text>
        <Text style={styles.newEmail}>{item.email}</Text>

        <View style={{ flexDirection: "row", marginTop: 6 }}>

          <View style={[
            styles.badge,
            { backgroundColor: item.status === "approved" ? "#DCFCE7" : "#FEF3C7" }
          ]}>
            <Text style={styles.badgeText}>
              {item.status || "pending"}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: "#DBEAFE", marginLeft: 6 }]}>
            <Text style={styles.badgeText}>Pro</Text>
          </View>

        </View>
      </View>
    </View>

    {/* RIGHT ICONS */}
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>

      <TouchableOpacity
        style={[styles.iconCircle, { opacity: item.phone ? 1 : 0.4 }]}
        onPress={() => openWhatsApp(item.phone)}
      >
        <Phone size={18} color="#374151" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconCircle}
        onPress={() => openEmail(item.email)}
      >
        <Mail size={18} color="#374151" />
      </TouchableOpacity>

    

    </View>

  </TouchableOpacity>
);

  //////////////////////////////////////////////////////////////////////

  return (
    <View style={styles.mainContainer}>

      {/* LEFT SIDE */}
      <View style={styles.sidebar}>

       
<View style={styles.searchRow}>

  <TextInput
    placeholder="Search by name"
    placeholderTextColor="#9CA3AF"
    value={search}
    onChangeText={(text) => {
      setSearch(text);
      setPage(1);
    }}
    style={styles.searchInput}
    onSubmitEditing={fetchExperts}
  />

  <TouchableOpacity
    style={styles.createBtnInline}
    onPress={() => setShowForm(!showForm)}
  >
    <Text style={styles.btnText}>
      {showForm ? "Cancel" : "＋"}
    </Text>
  </TouchableOpacity>

</View>

        {showForm && (
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Name"
              placeholderTextColor="#9CA3AF"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={newEmail}
              onChangeText={setNewEmail}
              style={styles.input}
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              secureTextEntry
              onChangeText={setNewPassword}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={createExpert}
            >
              <Text style={styles.btnText}>Save Expert</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>

      {/* CENTER LIST */}
      <View style={styles.listContainer}>

        {loading && <ActivityIndicator size="large" />}

        {!loading && experts.length === 0 && (
          <Text>No experts found</Text>
        )}

        <FlatList
  data={experts}
  keyExtractor={(item) => item._id}
  renderItem={renderItem}
  contentContainerStyle={{ paddingBottom: 10 }}
  style={{ flexGrow: 0 }} // 🔥 هذا هو الحل
/>





{/*<Modal
  visible={modalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>

      <Text style={styles.modalTitle}>
        {selectedExpert?.name}
      </Text>

      <Text>Email: {selectedExpert?.email}</Text>

<Text>
  Phone: {selectedExpert?.phone || "No phone"}
</Text>

<Text>
  {selectedExpert?.planEndDate
    ? `Active until ${
        new Date(selectedExpert.planEndDate).toLocaleDateString()
      } at ${
        new Date(selectedExpert.planEndDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      }`
    : "No plan"}
</Text>

{selectedExpert?.planEndDate && (
  <Text
    style={{
      marginTop: 5,
      fontSize: 12,
      color:
        getDaysLeft(selectedExpert.planEndDate) > 0
          ? "#16A34A"
          : "#DC2626"
    }}
  >
    {getDaysLeft(selectedExpert.planEndDate) > 0
      ? `⏳ Ends in ${getDaysLeft(selectedExpert.planEndDate)} days`
      : "🔴 Expired"}
  </Text>
)}






      
      <View style={{ flexDirection: "row", marginTop: 10 }}>


<Text
  style={{
    marginTop: 10,
    color: selectedExpert?.paymentRequired ? "#DC2626" : "#16A34A"
  }}
>
  {selectedExpert?.paymentRequired
    ? "🔴 Payment required"
    : "🟢 Payment OK"}
</Text>



        <View style={{
          backgroundColor: selectedExpert?.status === "approved" ? "#DCFCE7" : "#FEF3C7",
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 50,
          marginRight: 10
        }}>
          <Text style={{ fontSize: 12 }}>
            {selectedExpert?.status || "pending"}
          </Text>
        </View>

        <View style={{
          backgroundColor: "#DBEAFE",
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 50
        }}>
          <Text style={{ fontSize: 12 }}>
            Pro
          </Text>
        </View>

      </View>

     
      {selectedExpert?.status !== "approved" && (
        <TouchableOpacity
          style={[styles.approveBtn, { marginTop: 15 }]}
          onPress={async () => {
            await approveExpert(selectedExpert._id);

            setSelectedExpert(prev => ({
              ...prev,
              status: "approved"
            }));
          }}
        >
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
      )}







<TouchableOpacity
  style={{
    marginTop: 10,
    backgroundColor: "#F59E0B",
    padding: 12,
    borderRadius: 12,
    alignItems: "center"
  }}
  onPress={() => rejectPayment(selectedExpert._id)}
>
  <Text style={{ color: "white", fontWeight: "bold" }}>
    Reject Payment
  </Text>
</TouchableOpacity>














     
    <TouchableOpacity
  style={styles.deleteBtnModern}
  onPress={() => {
    deleteExpert(selectedExpert._id);
    setModalVisible(false);
  }}
>
  <Trash2 size={16} color="#DC2626" />
  <Text style={styles.deleteText}> Delete</Text>
</TouchableOpacity>

      
     <TouchableOpacity
  style={styles.closeBtn}
  onPress={() => setModalVisible(false)}
>
  <Text style={styles.closeText}>✕</Text>
</TouchableOpacity>

    </View>
  </View>
</Modal>*/}













<Modal
  visible={modalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>

      {/* CLOSE */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <Text style={styles.modalTitle}>
        {selectedExpert?.name}
      </Text>

      {/* INFO */}
      <View style={{ marginTop: 10 }}>

        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>
          {selectedExpert?.email}
        </Text>

        <Text style={styles.infoLabel}>Phone</Text>
        <Text style={styles.infoValue}>
          {selectedExpert?.phone || "No phone"}
        </Text>

        <Text style={styles.infoLabel}>Plan</Text>
        <Text style={styles.infoValue}>
          {selectedExpert?.planEndDate
            ? `Until ${new Date(selectedExpert.planEndDate).toLocaleDateString()}`
            : "No plan"}
        </Text>

        {selectedExpert?.planEndDate && (
          <Text
            style={{
              marginTop: 4,
              fontSize: 12,
              color:
                getDaysLeft(selectedExpert.planEndDate) > 0
                  ? "#16A34A"
                  : "#DC2626"
            }}
          >
            {getDaysLeft(selectedExpert.planEndDate) > 0
              ? `⏳ Ends in ${getDaysLeft(selectedExpert.planEndDate)} days`
              : "🔴 Expired"}
          </Text>
        )}
      </View>

      {/* STATUS */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 15 }}>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                selectedExpert?.status === "approved"
                  ? "#DCFCE7"
                  : "#FEF3C7"
            }
          ]}
        >
          <Text style={styles.statusText}>
            {selectedExpert?.status || "pending"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: selectedExpert?.paymentRequired
                ? "#FEE2E2"
                : "#DCFCE7"
            }
          ]}
        >
          <Text style={styles.statusText}>
            {selectedExpert?.paymentRequired
              ? "Payment required"
              : "Payment OK"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: "#DBEAFE" }
          ]}
        >
          <Text style={styles.statusText}>Pro</Text>
        </View>
      </View>

      {/* ACTIONS */}
      {selectedExpert?.status !== "approved" && (
        <TouchableOpacity
          style={styles.approveBtnModern}
          onPress={async () => {
            await approveExpert(selectedExpert._id);

            setSelectedExpert(prev => ({
              ...prev,
              status: "approved"
            }));
          }}
        >
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.rejectBtn}
        onPress={() => rejectPayment(selectedExpert._id)}
      >
        <Text style={styles.btnText}>Reject Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtnModern}
        onPress={() => {
          deleteExpert(selectedExpert._id);
          setModalVisible(false);
        }}
      >
        <Trash2 size={16} color="#DC2626" />
        <Text style={styles.deleteText}> Delete</Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>











        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageBtn}
            onPress={() => page > 1 && setPage(page - 1)}
          >
            <Text style={styles.btnText}>Prev</Text>
          </TouchableOpacity>

          <Text style={{ marginHorizontal: 10 }}>
            Page {page} / {totalPages}
          </Text>

          <TouchableOpacity
            style={styles.pageBtn}
            onPress={() => page < totalPages && setPage(page + 1)}
          >
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        </View>

      </View>

    </View>
  );
}

/////////////////////////////////////////////////////////////

const colors = {
  primary: "#84CC16",
  primarySoft: "#ECFCCB",
  background: "#F9FAFB",
  card: "#FFFFFF",
  textDark: "#111827",
  textLight: "#6B7280",
  border: "#E5E7EB",
  danger: "#EF4444",
};

const styles = StyleSheet.create({

  mainContainer: {
  flex: 1,
  flexDirection: Platform.OS === "web" ? "row" : "column",
  backgroundColor: colors.background,
},

  sidebar: {
  width: Platform.OS === "web" ? 320 : "100%",
    padding: 12,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderColor: colors.border,
  },

 listContainer: {
  flex: 1,
  paddingBottom: 45,
  padding:10,
  justifyContent: "space-between" // 🔥 مهم جدا
},

  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: colors.textDark,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 15,
    borderRadius: 16,
  },

  card: {
    backgroundColor: colors.card,
    padding: 20,
    marginBottom: 20,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  name: {
    fontWeight: "600",
    fontSize: 18,
    color: colors.textDark,
    marginBottom: 4,
  },

  actions: {
    flexDirection: "row",
    marginTop: 15,
  },

  approveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 14,
  },

  deleteBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
  },

  createBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
  },

  saveBtn: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  pageBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
  },

  btnText: {
    color: "white",
    fontWeight: "600",
  },





  newCard: {
  backgroundColor: "#fff",
  padding: 20,
  marginBottom: 10,
  borderRadius: 22,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius: 20,
  elevation: 8,

  borderWidth: 1,
  borderColor: "#F1F5F9"
},

avatar: {
  width: 70,
  height: 70,
  borderRadius: 35,
  backgroundColor: "#3B82F6",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#E5E7EB"
},

avatarText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16
},

newName: {
  fontSize: 16,
  fontWeight: "600",
  color: "#111827"
},

newEmail: {
  fontSize: 13,
  color: "#6B7280"
},

badge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 50
},

badgeText: {
  fontSize: 11
},

arrowBtn: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#F97316",
  justifyContent: "center",
  alignItems: "center"
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center"
},

modalContent: {
  width: "90%",
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 20
},

modalTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 10
},
/*avatarImage: {
  width: 50,
  height: 50,
  borderRadius: 25
},*/
avatarImage: {
  width: 70,
  height: 70,
  borderRadius: 35,

  // 🔥 circle border
  borderWidth: 2,
  borderColor: "#E5E7EB"
},

iconCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#F3F4F6",
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2
},
newCard: {
  width: "100%",              // 🔥 full width
  backgroundColor: "#fff",
  padding: 20,               // 🔥 أكبر
  marginBottom: 18,

  borderRadius: 22,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius: 20,
  elevation: 8,

  borderWidth: 1,
  borderColor: "#F1F5F9",

  minHeight: 80              // 🔥 يعطي حجم أحسن
},
searchRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginBottom: 15
},

searchInput: {
  flex: 1, // 🔥 يخلي search يكبر
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#E5E7EB",
  padding: 12,
  borderRadius: 14,
  
},

createBtnInline: {
  backgroundColor: "#84CC16",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 14,
  justifyContent: "center"
},



closeBtn: {
  position: "absolute",
  top: 10,
  right: 10,
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#F3F4F6",
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 4
},

closeText: {
  fontSize: 16,
  color: "#374151",
  fontWeight: "bold"
},

deleteBtnModern: {
  marginTop: 15,
  paddingVertical: 12,
  borderRadius: 14,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 6,

  backgroundColor: "#FEF2F2",
  borderWidth: 1,
  borderColor: "#FCA5A5"
},






modalContent: {
  width: "92%",
  backgroundColor: "#FFFFFF",
  borderRadius: 24,
  padding: 22,

  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 20,
  elevation: 10,
},

modalTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#111827"
},

infoLabel: {
  fontSize: 12,
  color: "#9CA3AF",
  marginTop: 10
},

infoValue: {
  fontSize: 14,
  fontWeight: "600",
  color: "#111827"
},

statusBadge: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 50
},

statusText: {
  fontSize: 12,
  fontWeight: "600"
},

approveBtnModern: {
  backgroundColor: "#22C55E",
  padding: 14,
  borderRadius: 14,
  alignItems: "center",
  marginTop: 18
},

rejectBtn: {
  marginTop: 10,
  backgroundColor: "#F59E0B",
  padding: 14,
  borderRadius: 14,
  alignItems: "center"
},

deleteBtnModern: {
  marginTop: 10,
  padding: 14,
  borderRadius: 14,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 6,

  backgroundColor: "#FEF2F2",
  borderWidth: 1,
  borderColor: "#FCA5A5"
},

deleteText: {
  color: "#DC2626",
  fontWeight: "600"
},

closeBtn: {
  position: "absolute",
  top: 12,
  right: 12,
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "#F3F4F6",
  justifyContent: "center",
  alignItems: "center"
},

closeText: {
  fontSize: 16,
  color: "#374151",
  fontWeight: "bold"
},
});