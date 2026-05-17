import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "../services/api";
import { ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
export default function AdminTopBar({ adminName, adminPhoto }) {
  const { width } = useWindowDimensions();
const isMobile = width < 768;

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState(adminPhoto);

 const pickImage = async () => {
Q
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    alert("Permission required");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1,1],
    quality: 0.8
  });

  if (!result.canceled) {

  const newPhoto = result.assets[0].uri;

  setPhoto(newPhoto);

  await apiRequest(
    "users/update-photo",
    "PUT",
    { photo: newPhoto }
  );

}
};



 useEffect(() => {

  fetchNotifications();

  const interval = setInterval(() => {
    fetchNotifications();
  }, 5000); // كل 5 ثواني

  return () => clearInterval(interval);

}, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest("admin/dashboard");
      setNotifications(data.activities || []);
    } catch (err) {
      console.log("Notification error:", err);
    }
  };

  return (
    <View style={[
  styles.container,
  { flexDirection: isMobile ? "column" : "row", height: isMobile ? "auto" : 70 }
]}>
      {/* SEARCH 
      <View style={[
  styles.searchContainer,
  { width: isMobile ? "100%" : 300, marginBottom: isMobile ? 10 : 0 }
]}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput placeholder="Search..." style={styles.searchInput} />
      </View>*/}

      {/* RIGHT SIDE */}
      <View style={[
  styles.rightSection,
  {
    width: isMobile ? "100%" : "auto",
    justifyContent: isMobile ? "space-between" : "center"
  }
]}>
        {/* NOTIFICATION ICON */}
        <TouchableOpacity onPress={() => setOpen(!open)}>
          <View>
            <Ionicons name="notifications-outline" size={26} color="#333" />

            {notifications.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notifications.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* ADMIN PROFILE */}
        <View style={styles.profile}>
    <View style={styles.avatarCircle}>
  <Text style={styles.avatarText}>
    {adminName ? adminName.charAt(0).toUpperCase() : "A"}
  </Text>
</View>
          <Text style={styles.adminName}>
            {adminName || "Admin"}
          </Text>
        </View>
      </View>

  {/* NOTIFICATION DROPDOWN */}

{open && (
  <>
    <TouchableOpacity
      style={styles.overlay}
      onPress={() => setOpen(false)}
    />

    <View style={styles.dropdown}>

      <Text style={styles.dropdownTitle}>Notifications</Text>

      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications</Text>
      ) : (
        <ScrollView style={styles.notificationList}>
          {notifications.map((n, i) => (
            <View key={i} style={styles.notificationItem}>
              <Text style={styles.notificationText}>{n.action}</Text>

              <Text style={styles.time}>
                {new Date(n.date).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

    </View>
  </>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: "#e1e1e1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    zIndex: 10,
    paddingVertical: 10

  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    borderRadius: 8,
    width: 300
  },

  searchInput: {
    marginLeft: 8,
    height: 40,
    flex: 1
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20
  },

  profile: {
    flexDirection: "row",
    alignItems: "center"
  },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 8
  },

  adminName: {
    fontWeight: "600"
  },

  badge: {
    position: "absolute",
    right: -6,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5
  },

  badgeText: {
    color: "#fff",
    fontSize: 10
  },

  dropdown: {
    position: "absolute",
    right: 20,
    top: 70,
    width: 260,
    zIndex: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10
  },

  dropdownTitle: {
    fontWeight: "bold",
    marginBottom: 10
  },

  notificationItem:{
  paddingVertical:8,
  borderBottomWidth:0.5,
  borderColor:"#eee"
},

  empty: {
    color: "#888"
  },
  notificationList:{
  maxHeight:250
},
notificationText:{
  fontSize:14
},

time:{
  fontSize:11,
  color:"#888"
},
overlay:{
  position:"fixed",
  top:0,
  left:0,
  right:0,
  bottom:0,
  zIndex:5
},

avatarCircle: {
  width: 35,
  height: 35,
  borderRadius: 20,
  backgroundColor: "#b1229c", // 🔥 نفس اللون الأخضر
  justifyContent: "center",
  alignItems: "center",
  marginRight: 8
},

avatarText: {
  color: "white",
  fontWeight: "bold",
  fontSize: 16
},
});