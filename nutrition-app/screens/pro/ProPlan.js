
import React, { useState, useContext, useEffect } from "react";
import { View, Modal, Text, ScrollView, TouchableOpacity } from "react-native";
//import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../context/AuthContext";
import ProfilePage from "../profile/ProfilePage";
import Sidebar from "../../components/pro/Sidebar";
import TopBar from "../../components/pro/TopBar";
//import CalendarDiet from "../profile//CalendarDiet";
import { LayoutAnimation, Platform } from "react-native";
import { StyleSheet, Image } from "react-native";
import EditProfile from "../auth/EditProfile";
import ProductsPage from "./ProductsPage";
import RecipesPage from "./RecipesPage";
import DietBuilder from "./DietBuilder";
//import TDEECalculator from "./TDEECalculator";
import RecommendationPage from "./RecommendationPage";
import ShoppingPage from "./ShoppingPage";
import PatientsPage from "./PatientsPage";
//import MyRecommendationsPage from "./MyRecommendationsPage";
import ChooseExpertPage from "./ChooseExpertPage";
import { apiRequest } from "../../services/api";
///////////////////////////////////////////////////////////////////
// 🔥 ADD THIS ON TOP
//import { Platform } from "react-native";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
///////////////////////////////////////
const storage = {
  getItem: async (key) => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem(key);
    }
  },
  setItem: async (key, value) => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(key, value);
    }
  }
};
///////////////app////////////////////




import { BASE_URL } from "../../services/api";/////////////////app
const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};



function formatNumber(n) {
  return Number.isInteger(n) ? n : n.toFixed(1);
}

function displayQuantity(q, unit) {
  if (unit === "g" && q >= 1000) return formatNumber(q / 1000) + " kg";
  if (unit === "ml" && q >= 1000) return formatNumber(q / 1000) + " L";
  return q + " " + unit;
}

export default function ProPlan() {

const [showBar, setShowBar] = useState(true);


    const [showContent, setShowContent] = useState(false);
const [mealType,setMealType] = useState("lunch");

//const [innerSelectedItem, setInnerSelectedItem] = useState(null);
const [selectedMealType, setSelectedMealType] = useState(null);
//const [selectedRecipeDetails, setSelectedRecipeDetails] = useState(null);
const { logout, userRole, user } = useContext(AuthContext);

//const [activeTab,setActiveTab] = useState(localStorage.getItem("activeTab") || "products");

////app////////////////
const [activeTab,setActiveTab] = useState("products");

useEffect(()=>{
  const loadTab = async ()=>{
    const saved = await storage.getItem("activeTab");
    if(saved) setActiveTab(saved);
  };
  loadTab();
},[]);









const [userName,setUserName] = useState("");
const [selectedDiet,setSelectedDiet] = useState({
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: []
});
//const [selectedDiet,setSelectedDiet] = useState([]);
const [tdeeResult,setTdeeResult] = useState(null);
const [age,setAge] = useState("");
const [height,setHeight] = useState("");
const [weight,setWeight] = useState("");

const [gender,setGender] = useState("male");
const [activity,setActivity] = useState("sedentary");
const [disease,setDisease] = useState("");

const [calorieGoalType,setCalorieGoalType] = useState("maintenance");
const [selectedItem,setSelectedItem] = useState(null);
/////////////////////////////////////////////////////////
const [patients,setPatients] = useState([]);
const [recipes,setRecipes] = useState([]);

const [selectedPatient,setSelectedPatient] = useState(null);
//const [selectedRecipeForRecommendation,setSelectedRecipeForRecommendation] = useState(null);

const [note,setNote] = useState("");

const [patientSearch,setPatientSearch] = useState("");
const [recipeSearch,setRecipeSearch] = useState("");
/////////////////
const [expertPatientSearch,setExpertPatientSearch] = useState("");
///////////////////////
const [myRecommendations,setMyRecommendations] = useState([]);

const [experts,setExperts] = useState([]);
const [expertSearch,setExpertSearch] = useState("");
//////////////////////////////////////////////////////

const [showModify,setShowModify] = useState(false);
////////////////

const [modalTab, setModalTab] = useState("ingredients");


useEffect(()=>{
  if(selectedItem){
    animate();

    if(selectedItem?.ingredients){
      // 🥗 recipe
      setShowContent(false);
      setModalTab("ingredients");
    } else {
      // 🛒 product
      setShowContent(false); // 🔥 مباشرة يظهر
      setModalTab("nutrition");
    }
  }
},[selectedItem]);
///////////////////////////////////


const animate = () => {
  if (Platform.OS !== "web") {
    LayoutAnimation.easeInEaseOut();
  }
};

///////////////////////////////////////
const toggleMeal = (recipe) => {

  const exists = Object.values(selectedDiet)
    .flatMap(arr => arr || [])
    .some(r => r._id === recipe._id);

  if (exists) {
    // 🔥 remove من كل meals
    const updated = {};

    for (let key in selectedDiet) {
      updated[key] = selectedDiet[key].filter(
        r => r._id !== recipe._id
      );
    }

    setSelectedDiet(updated);

  } else {
    // 🔥 add في lunch (default)
    setSelectedDiet(prev => ({
      ...prev,
      lunch: [...(prev.lunch || []), recipe]
    }));
  }
};
//////////////////
const openModifyMenu = async (patient)=>{
setSelectedPatient(patient);
//setSelectedMealType(mealType); 

setShowModify(true);


setNote("");


if(recipes.length === 0){
await fetchRecipes();
}
};
////////////////////////////////////////////////////////
// LOAD USER NAME
////////////////////////////////////////////////////////

useEffect(()=>{

const loadUser = async ()=>{

try{

const data = await apiRequest("users/tdee");

setUserName(data.name || "");

}catch(e){
console.log(e);
}

};

loadUser();

},[]);
//////////////////////////////////
useEffect(()=>{

const loadProfile = async ()=>{

try{

const data = await apiRequest("users/me","GET");

setAge(data.age || "");
setHeight(data.height || "");
setWeight(data.weight || "");
setActivity(data.activityLevel?.toLowerCase() || "sedentary");
setDisease(data.chronicDisease || "");
setCalorieGoalType(data.goalType || "maintenance");
}catch(e){
console.log("PROFILE LOAD ERROR",e);
}

};

loadProfile();

},[]);
////////////////////////////////////////////////////////
// LOAD PLAN DATA
////////////////////////////////////////////////////////


useEffect(() => {    //////////////////////////appp

const loadPlan = async ()=>{

const saved = await storage.getItem("pro_plan");

if(saved){
const plan = JSON.parse(saved);

//setSelectedDiet(plan.diet || []);
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

setSelectedDiet(normalizeDiet(plan.diet));
setTdeeResult(plan.tdee || null);
setCalorieGoalType(plan.goal || "maintenance");

setAge(plan.age || "");
setHeight(plan.height || "");
setWeight(plan.weight || "");

setGender(plan.gender || "male");
setActivity(plan.activity || "sedentary");
}

};

loadPlan();

},[]);
////////////////////////////////////////////////////////
// SAVE PLAN
////////////////////////////////////////////////////////

useEffect(() => {

const data = {
//diet: selectedDiet,
diet: Array.isArray(selectedDiet)
  ? {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }
  : selectedDiet,
tdee: tdeeResult,
goal: calorieGoalType,
age,
height,
weight,
gender,
activity

};

/*localStorage.setItem(
"pro_plan",
JSON.stringify(data)
);*/
storage.setItem("pro_plan", JSON.stringify(data));/////////////app

},[
selectedDiet,
tdeeResult,
calorieGoalType,
age,
height,
weight,
gender,
activity
]);
////////////////////////////////////////////////////////
// SAVE ACTIVE TAB
////////////////////////////////////////////////////////

useEffect(()=>{
//localStorage.setItem("activeTab",activeTab);
storage.setItem("activeTab",activeTab); ///////////////////app
},[activeTab]);
////////////////////////////////
// ADD RECIPE TO DIET
/////////////////////////////////
const addToDiet = (recipe)=>{

if(selectedDiet.find(r => r._id === recipe._id)) return;

setSelectedDiet(prev => [...prev,recipe]);

};

////////////////////////////////////////////////////////
const fetchPatients = async () => {

try{

const data = await apiRequest("experts/patients","GET");

setPatients(data || []);

}catch(e){

console.log(e);

}

};
///////////////////////////////////////////////
const fetchRecipes = async () => {

try{

const data = await apiRequest("recipes?page=1&limit=100","GET");

setRecipes(data?.recipes || []);

}catch(e){

console.log(e);

}

};
/////////////////////////////////////////////



const sendRecommendation = async (recipe, servings = 1) => {

if(!selectedPatient){
alert("No patient selected");
return;
}

if(!selectedMealType){
  alert("Please select meal type");
  return;
}

try{

await apiRequest("recommendations","POST",{
  patientId:selectedPatient._id,
  recipeId:recipe._id,
  mealType: selectedMealType,
  servings
});
////////////////////////////////


alert("Meal added");
await fetchPatients();
//fetchPatients();
//setShowModify(false);
}catch(e){
alert("Failed to add meal");
}

};

///////////////////////
useEffect(()=>{

if(activeTab === "recommendPatient"){
fetchPatients();
fetchRecipes();
}

if(activeTab === "patients"){
fetchPatients();
}

if(activeTab === "myRecommendations"){
fetchMyRecommendations();
}

if(activeTab === "chooseExpert"){
fetchExperts();
}

},[activeTab]);
///////////////////
useEffect(()=>{
  fetchMyRecommendations();
},[]);
////////////////////////////////////delet patiiont 
const deletePatient = async (id) => {

try{

await apiRequest(`experts/patients/${id}`,"DELETE");

setPatients(prev =>
prev.filter(p => p._id !== id)
);

}catch(error){

alert("Failed to remove patient");

}

};
//////////////////////////////
const fetchMyRecommendations = async () => {

try{

const data = await apiRequest("recommendations/mine","GET");

setMyRecommendations(data || []);

}catch(error){

console.log(error);

}

};
/////////////////////////////////////
const deleteRecommendation = async (id) => {

try{

await apiRequest(`recommendations/${id}`,"DELETE");

setMyRecommendations(prev =>
prev.filter(rec => rec._id !== id)
);

}catch(error){

alert("Failed to delete recommendation");

}

};
///////////////////////////////////////////
const fetchExperts = async () => {

try{

const data = await apiRequest("users/public-experts","GET");

setExperts(data || []);

}catch(error){

console.log(error);

}

};
///////////////////////////////////////////////////////
const chooseExpert = async (expertId) => {

try{

await apiRequest("users/choose-expert","PUT",{ expertId });

alert("Expert selected successfully");

}catch(error){

alert("Failed to select expert");

}

};
//////////////////////////////////////
const acceptPatient = async (id) => {
try{
await apiRequest("users/accept-patient","PUT",{ patientId:id });

setPatients(prev =>
prev.map(p =>
p._id === id ? { ...p, isAccepted:true } : p
)
);

}catch(e){
console.log(e);
}
};
//////////////////////////////
const removeMealFromPatient = async (patientId, recipeId, mealType) => {
try{

await apiRequest("experts/remove-meal","PUT",{
patientId,
recipeId,
mealType
});

//fetchPatients(); // refresh
await fetchPatients();


}catch(e){
console.log(e);
}
};
////////////////////////////////////////
const removeRecommendation = async (recipeId,mealType) => {
  try {
    await apiRequest("recommendations/remove", "POST", {
      patientId: selectedPatient._id,
      recipeId,
      mealType 
    });

    console.log("Removed from notifications ✅");

    // 🔥 مهم: تحديث الواجهة
    setMyRecommendations(prev =>
      prev.filter(r => r.recipe._id !== recipeId)
    );

  } catch (e) {
    console.log(e);
  }
};




return(

<View style={{flex:1,flexDirection:"row",backgroundColor:"#1e293b"}}>



<View style={{flex:1}} pointerEvents="box-none">



<View style={{
  flex:1,
 //paddingTop: showBar ? 110 : 20,
 // paddingBottom: showBar ? 50 : 50
  paddingTop: 110,
paddingBottom: 45
}}>

<>

{activeTab === "products" && 
<ProductsPage
   setSelectedItem={setSelectedItem}
    setShowBar={setShowBar}
    showBar={showBar}
   />
}

{activeTab === "recipes" && 
<RecipesPage 
addToDiet={addToDiet}
setSelectedItem={setSelectedItem}
selectedDiet={selectedDiet}
setSelectedDiet={setSelectedDiet}
selectedPatient={selectedPatient}
selectedMealType={selectedMealType} 
setShowBar={setShowBar}
showBar={showBar}

/>
}

{activeTab === "diet" && 
<DietBuilder
selectedDiet={selectedDiet}
setSelectedDiet={setSelectedDiet}
setSelectedItem={setSelectedItem}
setActiveTab={setActiveTab}
tdeeResult={tdeeResult}
calorieGoalType={calorieGoalType}
activity={activity}
weight={weight}
hideWater={true}
myRecommendations={myRecommendations}
deleteRecommendation={deleteRecommendation}
addToDiet={addToDiet}

fetchMyRecommendations={fetchMyRecommendations}

selectedPatient={selectedPatient}

removeFromPatient={removeRecommendation}
setShowBar={setShowBar}
hideNotifications={userRole === "expert"}
/>
}
   
{activeTab === "shopping" && (
  <ShoppingPage selectedDiet={selectedDiet} />
)}



{activeTab === "patients" &&

<PatientsPage
patients={patients}
expertPatientSearch={expertPatientSearch}
setExpertPatientSearch={setExpertPatientSearch}
deletePatient={deletePatient}
acceptPatient={acceptPatient}
openModifyMenu={openModifyMenu}
removeMealFromPatient={removeMealFromPatient}
//openRecipeDetails={setSelectedItem}
setSelectedItem={setSelectedItem}
recipes={recipes}

selectedPatient={selectedPatient}   // 🔥 THIS IS THE FIX


setSelectedPatient={setSelectedPatient}        // 🔥 مهم
setSelectedMealType={setSelectedMealType}      // 🔥 مهم
setShowModify={setShowModify}
 setActiveTab={setActiveTab}
fetchRecipes={fetchRecipes}  

setShowBar={setShowBar}
/>
}

{activeTab === "chooseExpert" &&

<ChooseExpertPage
experts={experts}
expertSearch={expertSearch}
setExpertSearch={setExpertSearch}
chooseExpert={chooseExpert}

/>
}

{activeTab === "profile" && (
<ProfilePage
tdeeResult={tdeeResult}
setTdeeResult={setTdeeResult}
calorieGoalType={calorieGoalType}
setCalorieGoalType={setCalorieGoalType}
showBar={showBar}
setShowBar={setShowBar}
/>
)}
{activeTab === "editProfile" && (
  <EditProfile setActiveTab={setActiveTab} />
)}
</>

</View>
{/* TOPBAR فوق كلشي */}
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
    plan={userRole === "expert" ? "pro" : user?.plan}
    photo={user?.photo}
    logout={logout}
    setActiveTab={setActiveTab}
  />
</View>
</View>

{/* MODAL      show information  recip  */}


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



/*const isAdded = Object.values(selectedDiet)
  .flat()
  .some(r => r._id === selectedItem?._id);*/
  const isAdded = Object.values(selectedDiet || {})
  .flatMap(arr => arr || [])
  .some(r => r?._id === selectedItem?._id);


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
    /*uri: selectedItem.image
      ? `${BASE_URL}${selectedItem.image}`*/
      uri: selectedItem.image
  ? getImageUrl(selectedItem.image)
      : "https://via.placeholder.com/400"
  }}
  style={[
  styles.image,
  showContent && styles.smallImage
]}
/>
<TouchableOpacity
  onPress={() => toggleMeal(selectedItem)}
  style={[
    styles.glassBtn,
    isAdded && { backgroundColor: "#22c55e" }
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

{/* MACROS */}

<Text style={styles.macros}>
  🔥 {Math.round(selectedItem.nutrition?.energyKcal || 0)} Cal • 
  🥩 {Math.round(selectedItem.nutrition?.protein || 0)}g • 
  🍞 {Math.round(selectedItem.nutrition?.carbohydrates || 0)}g • 
  🧈 {Math.round(selectedItem.nutrition?.fat || 0)}g
</Text>

{/* 🔥 NEW LINE */}
<View style={styles.extraInfo}>

  {isRecipe ? (
    <>
      <Text style={styles.extraText}>
        ⚡ {selectedItem.difficulty || "easy"}
      </Text>

      <Text style={styles.extraText}>
        👥 {selectedItem.servings || 1}
      </Text>
    </>
  ) : (
    <>
      <Text style={styles.extraText}>
        📦 {displayQuantity(selectedItem.quantity, selectedItem.unit)}
      </Text>
    </>
  )}

  <Text style={styles.extraText}>
    💰 {selectedItem.price || 0} DA
  </Text>

</View>
{/* 🔥 TABS */}

  <View style={styles.tabs}>
    {tabs.map(tab=>(
      <TouchableOpacity
        key={tab}
       onPress={()=>{
  animate();

  if (modalTab === tab && showContent) {
    // 🔙 رجوع لـ quick info
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

{showContent && (
  <ScrollView >
    {/* content */}


{/* INGREDIENTS */}
{modalTab === "ingredients" && isRecipe && (
<>
{selectedItem.ingredients.map((ing,i)=>(
<View key={i} style={styles.row}>
  <Text style={styles.left}>
    {ing.product?.name}
  </Text>
  <Text style={styles.right}>
    {ing.quantity} g
  </Text>
</View>
))}
</>
)}

{/* INSTRUCTIONS */}
{modalTab === "instructions" && (
<Text style={styles.description}>
  {selectedItem.description || "No instructions"}
</Text>
)}

{/* NUTRITION FULL 🔥 */}
{modalTab === "nutrition" && (
  <>
    {selectedItem?.nutrition ? (
      Object.entries(selectedItem.nutrition).map(([k,v])=>(
        <View key={k} style={styles.row}>
          <Text style={styles.left}>
            {k.replace(/([A-Z])/g, ' $1')}
          </Text>
          <Text style={styles.right}>
            {Number(v || 0).toFixed(1)}
          </Text>
        </View>
      ))
    ) : (
      <Text style={styles.description}>
        No nutrition information available
      </Text>
    )}
  </>
)}
<View style={{height:80}} />

  </ScrollView>
)}

{/* CLOSE */}
<TouchableOpacity
onPress={()=>{
  animate(); // ✅
  setSelectedItem(null);
}}
style={styles.closeBtn}
>
<Text style={{color:"white"}}>✕</Text>
</TouchableOpacity>

{/* BUTTON */}


</>
);

})()}

</View>
</View>
</Modal>








<Modal visible={showModify} animationType="slide">

<View style={{flex:1, backgroundColor:"#1e293b", padding:20}}>

<Text style={{
color:"white",
fontSize:18,
fontWeight:"bold",
marginBottom:10
}}>
Modify Diet for {selectedPatient?.name}
</Text>

<RecommendationPage
hidePatients={true} 
patients={selectedPatient ? [selectedPatient] : []}
recipes={recipes}

selectedPatient={selectedPatient}
setSelectedPatient={setSelectedPatient}

note={note}
setNote={setNote}

sendRecommendation={sendRecommendation}

patientSearch={""}
setPatientSearch={()=>{}}

recipeSearch={recipeSearch}
setRecipeSearch={setRecipeSearch}


openRecipeDetails={(meal) => {
  setShowModify(false);
  setTimeout(() => {
    setSelectedItem(meal); // فتح nutrition
  }, 200);
}}
selectedDiet={selectedDiet}
setSelectedDiet={setSelectedDiet} 
setPatients={setPatients}

  mealType={selectedMealType}
  setMealType={setSelectedMealType}
/>




<TouchableOpacity
onPress={()=>setShowModify(false)}
style={{padding:15,alignItems:"center"}}
>
<Text style={{color:"red",fontSize:16}}>
Close      
</Text>
</TouchableOpacity>

</View>

</Modal>

<Sidebar
activeTab={activeTab}
setActiveTab={setActiveTab}
userRole={userRole}
showBar={showBar}

/>
</View>
);

}
const styles = StyleSheet.create({

overlay:{
flex:1,
backgroundColor:"rgba(0,0,0,0.7)",
justifyContent:"flex-end",   // 🔥 المهم
alignItems:"center",
paddingBottom:80             // 🔥 نفس Plus
},

modal:{
  width: width * 0.95,       
  maxHeight: height * 0.85,   
  backgroundColor:"#0f172a",
  borderRadius:25,
  overflow:"hidden",
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

label:{
color:"#94a3b8",
marginLeft:15
},

chipsContainer:{
flexDirection:"row",
flexWrap:"wrap",
gap:8,
paddingHorizontal:15,
marginBottom:10
},

chip:{
backgroundColor:"#1e293b",
paddingHorizontal:12,
paddingVertical:5,
borderRadius:20
},

chipText:{
color:"#38bdf8"
},

statsRow:{
flexDirection:"row",
justifyContent:"space-around",
marginVertical:10
},

statBox:{
alignItems:"center"
},

statValue:{
color:"white",
fontWeight:"bold",
fontSize:18
},

statLabel:{
color:"#94a3b8",
fontSize:12
},

difficultyChip:{
alignSelf:"flex-start",
backgroundColor:"#f59e0b",
paddingHorizontal:12,
paddingVertical:5,
borderRadius:12,
marginLeft:15,
marginBottom:10
},

section:{
color:"#22c55e",
fontWeight:"bold",
marginTop:10,
marginBottom:5,
paddingHorizontal:15
},

ingredientItem:{
flexDirection:"row",
justifyContent:"space-between",
paddingHorizontal:15,
paddingVertical:6,
borderBottomWidth:1,
borderBottomColor:"#1e293b"
},

nutritionGrid:{
flexDirection:"row",
flexWrap:"wrap",
justifyContent:"space-between",
padding:10
},

nutritionCard:{
width:"48%",
backgroundColor:"#1e293b",
padding:10,
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







//model show information recip 
macros:{
  color:"#94a3b8",
  fontSize:13,
  paddingHorizontal:15,
  marginBottom:10
},

section:{
  color:"#22c55e",
  fontSize:16,
  fontWeight:"bold",
  marginTop:15,
  marginBottom:8,
  paddingHorizontal:15
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

nutritionRow:{
  paddingHorizontal:15,
  gap:5
},

nutritionText:{
  color:"white"
},

/*logBtn:{
  position:"absolute",
  bottom:15,
  alignSelf:"center",   // 🔥 يخليه في الوسط
  backgroundColor:"#a3e635",
  paddingVertical:10,
  paddingHorizontal:25, // 🔥 الحجم الأفقي
  borderRadius:20
},*/
logBtn:{
  position:"absolute",
  bottom:20,
  alignSelf:"center",
  backgroundColor:"#a3e635",
  paddingVertical:12,
  paddingHorizontal:40,
  borderRadius:25,
  shadowColor:"#000",
  shadowOpacity:0.3,
  shadowRadius:6,
  elevation:5
},

logText:{
  color:"#000",
  fontWeight:"bold",
  fontSize:16
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
imageBtn:{
  position:"absolute",
  top:10,
  left:10, // ⬅️ عكس close
  backgroundColor:"#a3e635",
  width:40,
  height:40,
  borderRadius:20,
  justifyContent:"center",
  alignItems:"center",
  shadowColor:"#000",
  shadowOpacity:0.3,
  shadowRadius:5,
  elevation:5
},

imageBtnText:{
  color:"#000",
  fontSize:20,
  fontWeight:"bold"
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

  // 🔥 DARK glass
  backgroundColor:"rgba(0,0,0,0.4)",
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.2)"
},
icon:{
  fontSize:20,
  fontWeight:"bold",
  color:"white"
}
});