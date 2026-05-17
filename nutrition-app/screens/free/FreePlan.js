import React, { useState, useContext } from "react";
import { View, Modal, Text, ScrollView, TouchableOpacity } from "react-native";
import { AuthContext } from "../../context/AuthContext";
//import EditProfile from "../screens/auth/EditProfile";
import EditProfile from "../auth/EditProfile";
import Sidebar from "../../components/pro/Sidebar";
import TopBar from "../../components/pro/TopBar";
import { StyleSheet } from "react-native";
import ProductsPage from "../pro/ProductsPage";
function formatNumber(n) {
  return Number.isInteger(n) ? n : n.toFixed(1);
}

function displayQuantity(q, unit) {
  if (unit === "g" && q >= 1000) return formatNumber(q / 1000) + " kg";
  if (unit === "ml" && q >= 1000) return formatNumber(q / 1000) + " L";
  return q + " " + unit;
}
export default function FreePlan(){
const [showBar, setShowBar] = useState(true);
const { logout, user } = useContext(AuthContext);

const [activeTab,setActiveTab] = useState("products");
const [selectedItem,setSelectedItem] = useState(null);

return(

<View style={{flex:1,flexDirection:"row",backgroundColor:"#1e293b"}}>

  <Sidebar
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    userRole="free"
    showBar={showBar}
    
  />

  <View style={{flex:1}} pointerEvents="box-none">

    {/* 🔥 CONTENT */}
   <View 
   style={{
  flex:1,
   //paddingTop: showBar ? 110 : 20,
  //paddingBottom: showBar ? 85 : 45  
  paddingTop: 110,
paddingBottom: 45  
}}>

      {activeTab === "products" && (
        <ProductsPage 
        setSelectedItem={setSelectedItem}
        setShowBar={setShowBar}
         showBar={showBar}
        />
      )}

      {activeTab === "editProfile" && (
        <EditProfile setActiveTab={setActiveTab} />
      )}

    </View>

    {/* 🔥 TOPBAR */}
    <View style={{
      position:"absolute",
      top:0,
      left:0,
      right:0,
      zIndex:9999,
      elevation:50
    }}>
      <TopBar
        userName={user?.name}
        email={user?.email}
        plan="free"
        logout={logout}
        photo={user?.photo}
        setActiveTab={setActiveTab}
      />
    </View>

  </View>



{/* PRODUCT MODAL */}

<Modal visible={!!selectedItem} transparent animationType="fade">

<View style={styles.overlay}>

<View style={styles.modalCard}>

{selectedItem && (

<ScrollView showsVerticalScrollIndicator={false}>

{/* TITLE */}
<Text style={styles.title}>
  {selectedItem.name}
</Text>

{/* PRICE + PACKAGE */}
<View style={styles.rowBetween}>
  <Text style={styles.price}>
    💰 {selectedItem.price || 0} DA
  </Text>

  <Text style={styles.package}>
    📦 {displayQuantity(selectedItem.quantity, selectedItem.unit)}
  </Text>
</View>

{/* SERVINGS */}
{selectedItem.servings && (
  <Text style={styles.servings}>
    👥 {selectedItem.servings}
  </Text>
)}

{/* NUTRITION */}
{selectedItem.nutrition && (
<>
<Text style={styles.section}>Nutrition (per 100g)</Text>

<View style={styles.grid}>
  {Object.entries(selectedItem.nutrition).map(([k,v]) => (
    <View key={k} style={styles.nutritionCard}>
      <Text style={styles.nutritionValue}>
        {Number(v).toFixed(1)}
      </Text>
      <Text style={styles.nutritionLabel}>
        {k}
      </Text>
    </View>
  ))}
</View>
</>
)}

{/* CLOSE */}
<TouchableOpacity
style={styles.closeBtn}
onPress={()=>setSelectedItem(null)}
>
<Text style={{color:"white", fontWeight:"bold"}}>
Close
</Text>
</TouchableOpacity>

</ScrollView>

)}

</View>
</View>
</Modal>



</View>

);




}
const styles = StyleSheet.create({

overlay:{
  flex:1,
  backgroundColor:"rgba(0,0,0,0.6)",
  justifyContent:"center",
  alignItems:"center"
},

modalCard:{
  width:"90%",
  maxHeight:"85%",
  backgroundColor:"#0f172a",
  borderRadius:20,
  padding:20
},

title:{
  color:"white",
  fontSize:20,
  fontWeight:"bold",
  marginBottom:10
},

rowBetween:{
  flexDirection:"row",
  gap:40,
  marginBottom:10
},

price:{
  color:"#22c55e",
  fontWeight:"bold",
  fontSize:16
},

package:{
    color:"#22c55e",
  fontWeight:"bold",
  fontSize:16
},

servings:{
  color:"#94a3b8",
  marginBottom:10
},

section:{
  color:"#22c55e",
  fontWeight:"bold",
  marginBottom:10
},

grid:{
  flexDirection:"row",
  flexWrap:"wrap",
  justifyContent:"space-between"
},

nutritionCard:{
  width:"48%",
  backgroundColor:"#1e293b",
  padding:12,
  borderRadius:12,
  marginBottom:10,
  alignItems:"center"
},

nutritionValue:{
  color:"white",
  fontWeight:"bold"
},

nutritionLabel:{
  color:"#94a3b8",
  fontSize:11
},

closeBtn:{
  marginTop:15,
  backgroundColor:"#ef4444",
  padding:12,
  borderRadius:12,
  alignItems:"center"
}

});