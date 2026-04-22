import React, { useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Modal, Text, ScrollView, TouchableOpacity,StyleSheet } from "react-native";
import DietBuilder from "../pro/DietBuilder";
import { AuthContext } from "../../context/AuthContext";
import ProfilePage from "../profile/ProfilePage";
import Sidebar from "../../components/pro/Sidebar";
import TopBar from "../../components/pro/TopBar";
import ShoppingPage from "../pro/ShoppingPage";
import { Image } from "react-native";
import ProductsPage from "../pro/ProductsPage";
import RecipesPage from "../pro/RecipesPage";
import { useEffect } from "react";
import { LayoutAnimation, Platform } from "react-native";
//const BASE_URL = "http://localhost:5000";
import EditProfile from "../auth/EditProfile";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

import { BASE_URL } from "../../services/api";

const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};
import { useWindowDimensions } from "react-native";


function formatNumber(n) {
  return Number.isInteger(n) ? n : n.toFixed(1);
}

function displayQuantity(q, unit) {
  if (unit === "g" && q >= 1000) return formatNumber(q / 1000) + " kg";
  if (unit === "ml" && q >= 1000) return formatNumber(q / 1000) + " L";
  return q + " " + unit;
}

export default function PlusPlan() {
  const [showBar, setShowBar] = useState(true);
const { width } = useWindowDimensions();
const isMobile = width < 768;


  //const [selectedDiet,setSelectedDiet] = useState([]);
  const [selectedDiet,setSelectedDiet] = useState({
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: []
});

const normalizeDiet = (diet) => {

  if (!diet || Array.isArray(diet)) {
    return {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
  }

  return {
    breakfast: diet.breakfast || [],
    lunch: diet.lunch || [],
    dinner: diet.dinner || [],
    snack: diet.snack || []
  };
};

const loadDiet = async () => {
  const saved = await AsyncStorage.getItem("plus_diet");

  if (saved) {
    const parsed = JSON.parse(saved);
    setSelectedDiet(normalizeDiet(parsed));
  }
};

useEffect(() => {
  loadDiet();
}, []);
 const [modalTab,setModalTab] = useState("ingredients");
const [showContent,setShowContent] = useState(false);   
const [tdeeResult,setTdeeResult] = useState(null);
const [calorieGoalType,setCalorieGoalType] = useState("maintenance");
const { logout,user } = useContext(AuthContext);

const [activeTab,setActiveTab] = useState("products");
const [selectedItem,setSelectedItem] = useState(null);
const animate = () => {
  if (Platform.OS !== "web") {
    LayoutAnimation.easeInEaseOut();
  }
};
////////////////////////////////////
useEffect(()=>{
  if(selectedItem){
    animate();
    const isRecipe = !!selectedItem?.ingredients;

    if(isRecipe){
      setModalTab("ingredients");
      setShowContent(false);
    } else {
      setModalTab("nutrition");
      setShowContent(false);
    }
  }
},[selectedItem]);
///////////////////////////////////////////////////

useEffect(() => {
  AsyncStorage.setItem(
  "plus_diet",
  JSON.stringify(
    Array.isArray(selectedDiet)
      ? {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        }
      : selectedDiet
  )
);
}, [selectedDiet]);
return(

<View style={{flex:1,flexDirection:"row",backgroundColor:"#1e293b"}}>

<Sidebar
activeTab={activeTab}
setActiveTab={setActiveTab}
userRole="plus"
showBar={showBar}

/>

<View style={{flex:1}} pointerEvents="box-none">

  {/* 🔥 CONTENT */}
 <View style={{
  flex:1,
         //paddingTop: 110,
 //paddingTop: showBar ? 110 : 40,
 // paddingBottom: isMobile ? 110 : 0
 // paddingBottom: isMobile ? (showBar ? 85 : 45) : 0
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

    {activeTab === "recipes" && (
      <RecipesPage
  setSelectedItem={setSelectedItem}
  selectedDiet={selectedDiet}
  setSelectedDiet={setSelectedDiet}
  addToDiet={(recipe) => {

    // 🔥 جمع كل meals
    const allMeals = Object.values(selectedDiet || {}).flat();

    const exists = allMeals.some(r => r._id === recipe._id);

    if (exists) {

      // ❌ REMOVE من جميع categories
      setSelectedDiet(prev => {
        const updated = { ...prev };

        for (let key in updated) {
          updated[key] = updated[key].filter(
            r => r._id !== recipe._id
          );
        }

        return updated;
      });

    } else {

      // ✅ ADD (تقدر تبدل lunch حسب اختيارك)
      setSelectedDiet(prev => ({
        ...prev,
        lunch: [
          ...(prev.lunch || []),
          {
            ...recipe,
            selectedServings: recipe.servings || 1
          }
        ]
      }));

    }
  }}
  hidePrice={true}
  setShowBar={setShowBar}
  showBar={showBar}
/>
    )}





    {activeTab === "diet" && (
      <DietBuilder
        selectedDiet={selectedDiet}
        setSelectedDiet={setSelectedDiet}
        setSelectedItem={setSelectedItem}
        setActiveTab={setActiveTab}
        myRecommendations={[]}
        fetchMyRecommendations={()=>{}}
        hideNotifications={true}
        hideBudget={true}

         tdeeResult={tdeeResult}
      calorieGoalType={calorieGoalType}
      setShowBar={setShowBar}
      showBar={showBar} 
      />
    )}
   


   {activeTab === "shopping" && (
  <ShoppingPage selectedDiet={selectedDiet} />
)}





    {activeTab === "profile" && (
      <ProfilePage
        tdeeResult={tdeeResult}
        setTdeeResult={setTdeeResult}
        calorieGoalType={calorieGoalType}
        setCalorieGoalType={setCalorieGoalType}
        hideExpert={true}
        hideBudget={true}
        showBar={showBar}
        setShowBar={setShowBar}
      />
    )}

{activeTab === "editProfile" && (
  <EditProfile setActiveTab={setActiveTab} />
)}
  </View>

  {/* 🔥 TOPBAR فوق كلشي */}
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
      plan={user?.plan || "plus"}
      logout={logout}
      photo={user?.photo}
       setActiveTab={setActiveTab}
    />
  </View>

</View>

{/* MODAL */}

<Modal 
  visible={!!selectedItem} 
  transparent 
  animationType="fade"
  presentationStyle="overFullScreen"
>

<View style={styles.overlay}>
<View style={styles.modal}>

{selectedItem && (() => {

const isRecipe = !!selectedItem?.ingredients;

const isAdded = Object.values(selectedDiet)
  .flat()
  .some(r => r._id === selectedItem?._id);


const tabs = isRecipe
  ? ["ingredients","instructions","nutrition"]
  : ["nutrition"];

return (
<>

{/* IMAGE */}
{isRecipe && (
  <>
    <Image
      source={{
       /* uri: selectedItem.image
          ? `${BASE_URL}${selectedItem.image}`*/
          uri: selectedItem.image
            ? getImageUrl(selectedItem.image)
          : "https://via.placeholder.com/400"
      }}
      style={[styles.image, showContent && styles.smallImage]}
    />

    {/* 🔥 ADD BUTTON */}
    <TouchableOpacity
      /*onPress={()=>{
        const exists = selectedDiet.some(r => r._id === selectedItem._id);

        if (exists) {
          setSelectedDiet(prev =>
            prev.filter(r => r._id !== selectedItem._id)
          );
        } else {
          setSelectedDiet(prev => [...prev, selectedItem]);
        }
      }}*/

onPress={()=>{
  const allMeals = Object.values(selectedDiet).flat();

  const exists = allMeals.some(r => r._id === selectedItem._id);

  if (exists) {
    setSelectedDiet(prev => {
      const updated = { ...prev };

      for (let key in updated) {
        updated[key] = updated[key].filter(r => r._id !== selectedItem._id);
      }

      return updated;
    });
  } else {
    setSelectedDiet(prev => ({
      ...prev,
      lunch: [...prev.lunch, selectedItem]
    }));
  }
}}



      style={[
        styles.glassBtn,
        isAdded && styles.addedBtn
      ]}
    >
      <Text style={styles.icon}>
        {isAdded ? "✓" : "+"}
      </Text>
    </TouchableOpacity>

  </>
)}

{/* TITLE */}
<Text style={styles.title}>
  {selectedItem.name}
</Text>

{/* MACROS (🔥 نفس ProPlan) */}
<Text style={styles.macros}>
  🔥 {Math.round(selectedItem.nutrition?.energyKcal || 0)} Cal • 
  🥩 {Math.round(selectedItem.nutrition?.protein || 0)}g • 
  🍞 {Math.round(selectedItem.nutrition?.carbohydrates || 0)}g • 
  🧈 {Math.round(selectedItem.nutrition?.fat || 0)}g
</Text>

{/* EXTRA INFO (🚫 بدون price) */}
<View style={styles.extraInfo}>

  {isRecipe ? (
    <>
      <Text style={styles.extraText}>
        ⚡ {selectedItem.difficulty || "easy"}
      </Text>

      <Text style={styles.extraText}>
        👥 {selectedItem.servings || 1}
      </Text>

      {/* ❌ NO PRICE FOR RECIPE */}
    </>
  ) : (
    <>
      <Text style={styles.extraText}>
        📦 {displayQuantity(selectedItem.quantity, selectedItem.unit)}
      </Text>

      <Text style={styles.extraText}>
        💰 {selectedItem.price || 0} DA
      </Text>
    </>
  )}

</View>

{/* TABS */}

<View style={styles.tabs}>
{tabs.map(tab=>(
<TouchableOpacity
  key={tab}
  onPress={()=>{
      animate();
    if (modalTab === tab && showContent) {
        animate();
      setShowContent(false);
    } else {
      setModalTab(tab);
      setShowContent(true);
    }
  }}
  style={[
    styles.tabBtn,
    modalTab === tab && styles.activeTab
  ]}
>
<Text style={{
  color: modalTab === tab ? "#000" : "#94a3b8",
  fontWeight:"bold"
}}>
{tab.charAt(0).toUpperCase() + tab.slice(1)}
</Text>
</TouchableOpacity>
))}
</View>

{/* CONTENT */}
{showContent && (
<ScrollView style={{ maxHeight: height * 0.5 }}>
{/* INGREDIENTS */}
{modalTab === "ingredients" && isRecipe && (
selectedItem.ingredients.map((ing,i)=>(
<View key={i} style={styles.row}>
<Text style={styles.left}>
{ing.product?.name}
</Text>
<Text style={styles.right}>
{ing.quantity} g
</Text>
</View>
))
)}

{/* INSTRUCTIONS */}
{modalTab === "instructions" && (
<Text style={styles.description}>
{selectedItem.description || "No instructions"}
</Text>
)}

{/* NUTRITION */}
{modalTab === "nutrition" && (
Object.entries(selectedItem.nutrition || {}).map(([k,v])=>(
<View key={k} style={styles.row}>
<Text style={styles.left}>
{k.replace(/([A-Z])/g, ' $1')}
</Text>
<Text style={styles.right}>
{Number(v || 0).toFixed(1)}
</Text>
</View>
))
)}

<View style={{height:60}}/>

</ScrollView>
)}

{/* CLOSE */}
<TouchableOpacity
onPress={()=>{
  animate();
  setSelectedItem(null);
}}
style={styles.closeBtn}
>
<Text style={{color:"white"}}>✕</Text>
</TouchableOpacity>

</>
);

})()}

</View>
</View>
</Modal>
</View>

);

}
const styles = StyleSheet.create({

overlay:{
flex:1,
backgroundColor:"rgba(0,0,0,0.7)",
justifyContent:"flex-end",
alignItems:"center",
paddingBottom: 80
},

modal:{
  width: width * 0.95,
  maxHeight: height * 0.85,
  backgroundColor:"#0f172a",
  borderRadius:25,
  overflow:"hidden"
},

image:{
width:"100%",
height:220,
resizeMode:"cover"
},

smallImage:{
height:120
},

title:{
fontSize:22,
fontWeight:"bold",
color:"white",
padding:15
},

macros:{
color:"#94a3b8",
fontSize:13,
paddingHorizontal:15,
marginBottom:10
},

extraInfo:{
flexDirection:"row",
justifyContent:"center",
gap:15,
marginBottom:10
},

extraText:{
color:"#e2e8f0",
fontSize:12,
backgroundColor:"#1e293b",
paddingHorizontal:10,
paddingVertical:4,
borderRadius:10
},

tabs:{
flexDirection:"row",
justifyContent:"space-around",
marginVertical:10
},

tabBtn:{
paddingVertical:8,
paddingHorizontal:15,
borderRadius:20
},

activeTab:{
backgroundColor:"#a3e635"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
paddingHorizontal:15,
paddingVertical:8
},

left:{
color:"white"
},

right:{
color:"#94a3b8"
},

description:{
color:"#e2e8f0",
paddingHorizontal:15,
lineHeight:20
},

closeBtn:{
  position:"absolute",
  top:15,
  right:15,
  width:40,
  height:40,
  borderRadius:20,
  justifyContent:"center",
  alignItems:"center",

  // 🔥 نفس glass style
  backgroundColor:"rgba(0,0,0,0.4)",
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.2)"
},
glassBtn:{
  position:"absolute",
  top:15,
  left:15,
  width:45,
  height:45,
  borderRadius:25,
  justifyContent:"center",
  alignItems:"center",

  backgroundColor:"rgba(0,0,0,0.4)",   // ✅ نفس Pro
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.2)"
},

addedBtn:{
  backgroundColor:"rgba(34,197,94,0.8)",
  borderColor:"#22c55e"
},

icon:{
  fontSize:20,
  fontWeight:"bold",
  color:"white"
}
});