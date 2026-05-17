
//import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";
const { width } = Dimensions.get("window");
const isMobile = width < 768;

export default function Sidebar({ activeTab, setActiveTab, userRole ,showBar}) {
const translateY = useRef(new Animated.Value(0)).current;
useEffect(() => {
  Animated.timing(translateY, {
    toValue: showBar ? 0 : 120, // 🔥 مهم (down مش up)
    duration: 250,
    useNativeDriver: true
  }).start();
}, [showBar]);
  const expertMenu = [
    { key:"products", label:"Products", icon:"nutrition" },
    { key:"recipes", label:"Recipes", icon:"restaurant" },
    { key:"diet", label:"Diet Builder", icon:"leaf" },
    { key:"patients", label:"My Patients", icon:"people" },
    { key:"profile", label:"Profile", icon:"person" },
    { key:"shopping", label:"Shopping", icon:"cart" },
  ];

  const patientMenu = [
    { key:"products", label:"Products", icon:"nutrition" },
    { key:"recipes", label:"Recipes", icon:"restaurant" },
    { key:"diet", label:"Diet Builder", icon:"leaf" },
    { key:"profile", label:"Profile", icon:"person" },
    { key:"shopping", label:"Shopping", icon:"cart" },
  ];

  const freeMenu = [
    { key:"products", label:"Products", icon:"nutrition" },
   // { key:"profile", label:"Profile", icon:"person" },
  ];

  let menu;

  if(userRole === "expert"){
    menu = expertMenu;
  }
  else if(userRole?.toLowerCase() === "plus"){
    menu = patientMenu;
  }
  else if(userRole === "free"){
    menu = freeMenu;
  }
  else{
    menu = patientMenu;
  }

  return (

  isMobile ? (

    // 📱 MOBILE → Bottom Bar
   <Animated.View
  pointerEvents={showBar ? "auto" : "none"}
  style={[
    styles.bottomBar,
    {
      transform: [{ translateY }]
    }
  ]}
>
      <View style={styles.mobileMenu}>
        {menu.map(item => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setActiveTab(item.key)}
            style={styles.mobileItem}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={activeTab === item.key ? "#22c55e" : "#cbd5e1"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>

  ) : (

    // 💻 DESKTOP → Sidebar
    <View style={styles.sidebar}>
      
      <Text style={styles.logo}>NutriFresh</Text>

      {menu.map(item => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.menuItem,
            activeTab === item.key && styles.active
          ]}
          onPress={() => setActiveTab(item.key)}
        >
          <Ionicons name={item.icon} size={22} color="#cbd5e1"/>
          <Text style={styles.menuText}>{item.label}</Text>
        </TouchableOpacity>
      ))}

    </View>

  )

);
}

const styles = StyleSheet.create({

  /* ===== Desktop Sidebar ===== */
  sidebar:{
    width: width * 0.18,
    minWidth:180,
    maxWidth:250,
    backgroundColor:"#020617",
    paddingTop:30,
    paddingLeft:20
  },

  /* ===== Mobile Bottom Bar ===== */
  

 

  logo:{
    color:"#22c55e",
    fontSize:20,
    fontWeight:"bold",
    marginBottom:40
  },

  /*menuItem:{
    alignItems:"center"
  },*/

menuItem:{
  flexDirection:"row",
  alignItems:"center",
  marginBottom:20
},
  menuText:{
    color:"#cbd5e1",
    marginLeft:12
  },

  active:{
    backgroundColor:"#1e293b",
    padding:6,
    borderRadius:8
  },


  bottomBar:{
  position:"absolute",
  bottom:0,
  
  left:0,
  right:0,
  backgroundColor:"#020617",
  paddingVertical:10,
  borderTopWidth:1,
  borderTopColor:"#1e293b"
},

bottomBar:{
  position:"absolute",
  bottom:40,
  left:0,
  right:0,

  zIndex:9999,        // 🔥 أهم حاجة
  elevation:100,      // 🔥 Android fix

  backgroundColor:"#020617",
  paddingVertical:10,
  borderTopWidth:1,
  borderTopColor:"#1e293b"
},

mobileMenu:{
  flexDirection:"row",
  justifyContent:"space-around",
  alignItems:"center"
},

mobileItem:{
  alignItems:"center"
},
});