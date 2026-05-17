//import React, { useState } from "react";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,

} from "react-native";
//import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL } from "../../services/api";



const buildUri = (photo) => {
  if (!photo) return null;

  const base = photo.startsWith("http")
    ? photo
    : BASE_URL.replace("/api/", "") + photo;

 // return base + "?t=" + Date.now();
  return base; 
};
export default function TopBar({ userName, email, plan, logout, photo, setActiveTab }) {

  const [showMenu, setShowMenu] = useState(false);

  const [showCard,setShowCard] = useState(false);

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U";




//const imageUri = buildUri(photo);
  
const isDefault = photo === "/uploads/default-avatar.png";

const imageUri = !isDefault ? buildUri(photo) : null;


  return (

    <SafeAreaView style={styles.safe} edges={["top"]}>
<View style={styles.container}>

      {/* TOP BAR */}
      <View style={styles.topBar}>

        <View style={styles.left}>

          <TouchableOpacity
            style={styles.avatar}
            onPress={()=>setShowCard(!showCard)}
          >

            {imageUri ? (
              <Image
               //key={imageUri}
  source={{ uri: imageUri }}
  style={styles.avatarImage}
 
/>
            ) : (
              <Text style={styles.avatarText}>{firstLetter}</Text>
            )}

          </TouchableOpacity>

          <Text
            numberOfLines={1}
            style={styles.userName}
          >
            {userName}
          </Text>

        </View>

        
<View style={{ marginLeft: "auto" }}>
  <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
    <Ionicons name="ellipsis-vertical" size={22} color="white" />
  </TouchableOpacity>
</View>
            





      </View>
{showMenu && (
  <View style={styles.menu}>
    
    {/*<TouchableOpacity onPress={() => {
      setActiveTab("editProfile");
      setShowMenu(false);
    }}>
      <Text style={styles.menuItem}>Edit Profile</Text>
    </TouchableOpacity>*/}
    <TouchableOpacity
  style={styles.editBtn}
  onPress={() => {
    setActiveTab("editProfile");
    setShowMenu(false);
  }}
>
  <Text style={styles.editText}>Edit Profile</Text>
</TouchableOpacity>

  </View>
)}



      {/* OVERLAY (close when click outside) */}
      {(showCard || showMenu) && (
  <Pressable
    style={styles.overlay}
    onPress={() => {
      setShowCard(false);
      setShowMenu(false);
    }}
  />
)}
      {/* PROFILE CARD */}
      {showCard && (

        <View style={styles.card}>

          <Text style={styles.title}>Account</Text>

          <Text style={styles.item}>Plan: {plan}</Text>
          <Text style={styles.item}>User: {userName}</Text>
          <Text style={styles.item}>Email: {email}</Text>

          <TouchableOpacity
            style={styles.cardLogout}
            onPress={logout}
          >
            <Text style={{color:"white"}}>Logout</Text>
          </TouchableOpacity>

        </View>

      )}

    </View>
</SafeAreaView>

  );
}

const styles = StyleSheet.create({


container:{
  zIndex:10
},


topBar:{
  height:70,
  backgroundColor:"#020617",
  flexDirection:"row",
  alignItems:"center",
  paddingHorizontal:15
},


left:{
  flexDirection:"row",
  alignItems:"center"
},

avatar:{
  width:50,
  height:50,
  borderRadius:25,
  backgroundColor:"#22c55e",
  justifyContent:"center",
  alignItems:"center",
  marginRight:10,
  borderWidth:2,
  borderColor:"#1e293b"
},

avatarImage:{
  width:"100%",
  height:"100%",
  borderRadius:21
},

avatarText:{
  color:"white",
  fontSize:20,
  fontWeight:"bold"
},

userName:{
  color:"white",
  fontWeight:"600",
  fontSize:20,
  flexShrink:1   // 🔥 يمنع الكسر
},

logout:{
  color:"#ef4444",
  fontWeight:"bold"
},


overlay:{
  position:"absolute",
  top:0,
  left:0,
  right:0,
  bottom:0,
  zIndex:998
},


card:{
  position:"absolute",
  top:75,
  right:15,

  backgroundColor:"#1e293b",
  padding:15,
  borderRadius:12,
  width:240,

  shadowColor:"#000",
  shadowOpacity:0.3,
  shadowRadius:10,

  zIndex:9999,     // 🔥 أهم حاجة
  elevation:50     // 🔥 Android
},

title:{
  color:"#22c55e",
  fontWeight:"bold",
  fontSize:16,
  marginBottom:10
},

item:{
  color:"white",
  marginBottom:6
},

cardLogout:{
  backgroundColor:"#ef4444",
  marginTop:10,
  padding:10,
  borderRadius:8,
  alignItems:"center"
},
safe:{
  backgroundColor:"#020617"
},
menu: {
  position: "absolute",
  top: 70,
  right: 15,
  backgroundColor: "#1e293b",
  borderRadius: 10,
  padding: 10,
  zIndex: 9999,
  elevation: 50,
  
},

menuItem: {
  color: "#22c55e",
  color: "white",
  paddingVertical: 8
},
editBtn: {
  backgroundColor: "#22c55e", // 🟢
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  alignItems: "center"
},

editText: {
  color: "#020617", // غامق باش يبان
  fontWeight: "bold"
},
});