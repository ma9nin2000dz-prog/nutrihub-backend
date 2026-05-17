//import React from "react";
import { apiRequest } from "../../services/api";
import React, { useState } from "react";
//import { Phone, Mail } from "lucide-react-native";
//import { Linking } from "react-native";
//import { Platform, Linking } from "react-native";
import { Ruler, Activity, Target, Stethoscope,Phone, Mail  } from "lucide-react-native";
import {
View,
Text,
TextInput,
StyleSheet,
TouchableOpacity,
ScrollView,
Modal,
 Image ,
 Linking,
 Platform
} from "react-native";

import PaymentGuard from "../../components/pro/PaymentGuard";

import { runGA } from "../../utils/geneticAlgorithm";
import Svg, { Path, Defs, LinearGradient, Stop,Circle } from "react-native-svg";
import RecipeCard from "../../components/pro/RecipeCard";
import { BASE_URL } from "../../services/api";

const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};
import { useWindowDimensions } from "react-native";


const SmallMacroCircle = ({ label, value, total, goal, color, unit }) => {

  const size = 70;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

const percent = goal && goal > 0 ? value / goal : 0;

// 🔥 حماية من Infinity / NaN
const safePercent = isFinite(percent) ? percent : 0;

const progress = Math.min(safePercent, 1);


  const strokeDashoffset =
    circumference - circumference * progress;

  return (
    <View style={{ alignItems: "center", margin: 6 }}>

      <Svg width={size} height={size}>
        <Circle
          stroke="rgba(255,255,255,0.08)"
          fill="none"
          cx={size/2}
          cy={size/2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <Circle
          stroke={color}
          fill="none"
          cx={size/2}
          cy={size/2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size/2}, ${size/2}`}
        />
      </Svg>

      {/* % */}
      <View style={{
        position:"absolute",
        top:20,
        alignItems:"center"
      }}>
        <Text style={{ color:"white", fontWeight:"bold" }}>
          {Math.round(safePercent * 100)}%
        </Text>
      </View>

      {/* 🔥 value / goal */}
      <Text style={{ color:"#9ca3af", fontSize:12 }}>
        {Math.round(value)} / {goal && goal > 0 ? Math.round(goal) : 0}{unit}
      </Text>

      <Text style={{ color:"#9ca3af", marginTop:5 }}>
        {label}
      </Text>

    </View>
  );
};

import { useEffect } from "react";


import { Dimensions } from "react-native";
//const BASE_URL = "http://localhost:5000";



const createPath = (data, width, height) => {
  const max = Math.max(...data);
  const min = Math.min(...data);

  const scaleY = (value) =>
    height - ((value - min) / (max - min || 1)) * height;

  const stepX = width / (data.length - 1);

  let path = "";

  data.forEach((value, index) => {
    const x = index * stepX;
    const y = scaleY(value);

    if (index === 0) {
      path += `M ${x} ${y}`;
    } else {
      const prevX = (index - 1) * stepX;
      const prevY = scaleY(data[index - 1]);

      const cx = (prevX + x) / 2;

      path += ` Q ${cx} ${prevY}, ${x} ${y}`;
    }
  });

  return path;
};

export default function PatientsPage({
patients,
expertPatientSearch,
setExpertPatientSearch,
deletePatient,
acceptPatient,
openModifyMenu,
removeMealFromPatient,
//openRecipeDetails ,
setSelectedItem,
recipes, 

setActiveTab,
 setSelectedPatient,
  setSelectedMealType,
  setShowModify,

  selectedPatient,
  fetchRecipes,
}) {
 // default


const { width } = useWindowDimensions();
const isMobile = width < 768;

const styles = createStyles(width);



///////////////////////////////
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
/////////////////////
const openWhatsApp = (phone) => {
  if (!phone) {
    alert("This patient has no phone number 📵");
    return;
  }

  // 🔥 تنظيف الرقم (مهم جدا)
  const cleaned = phone.replace(/\D/g, "");

  const url = `https://wa.me/${cleaned}`;

  Linking.openURL(url).catch(() => {
    alert("WhatsApp not available");
  });
};
//////////////////////////////////////////////


useEffect(() => {
  if (!recipes || recipes.length === 0) {
    fetchRecipes();
  }
}, []);

const handleGenerateMeals = async () => {

  if (!selectedPatient) return;

  // 🎯 goals
  const goal = {
    protein: selectedPatient.macros?.protein || 120,
    carbs: selectedPatient.macros?.carbs || 200,
    fat: selectedPatient.macros?.fat || 60,
    calories: selectedPatient.goalCalories || 2200
  };

  const budget = selectedPatient.dailyBudget || 800;

  // 🧬 run GA
  const plan = runGA(recipes, goal, budget, {
    populationSize: 15,
    generations: 40,
    mutationRate: 0.4,
    a: 2,   
    b: 1
  });

  // 🔥 1. مسح القديم من DB
  await apiRequest("recommendations/clear-patient", "POST", {
    patientId: selectedPatient._id
  });

  // 🔥 2. format
  const formatted = [];

  Object.entries(plan).forEach(([meal, items]) => {
    items.forEach(r => {
      formatted.push({
        patientId: selectedPatient._id,
        recipeId: r._id,
        mealType: meal,
        servings: 1
      });
    });
  });

  // 🔥 3. save واحد بواحد
  for (const r of formatted) {
    await apiRequest("recommendations", "POST", r);
  }

  // 🔥 4. reload UI
  await loadRecommendations(selectedPatient._id);

};
/////////////////////////////////////

const [recommendations, setRecommendations] = useState([]);
//const [selectedPatient, setSelectedPatient] = React.useState(null);
const [showModal, setShowModal] = React.useState(false);





const loadRecommendations = async (patientId) => {
  const data = await apiRequest(`recommendations/mine?patientId=${patientId}`);
  setRecommendations(data);
};



const updateServings = async (recId, newServings) => {
  try {

    // ✅ update UI مباشرة (optimistic update)
    setRecommendations(prev =>
      prev.map(r =>
        r._id === recId
          ? { ...r, servings: newServings }
          : r
      )
    );

    // ✅ update DB
    await apiRequest(
      `recommendations/${recId}/servings`,
      "PUT",
      { servings: newServings }
    );

  } catch (e) {
    console.log(e);
  }
};






const getRecipe = (r) => {
  if (r.recipeId && typeof r.recipeId === "object") return r.recipeId;
  if (r.recipe) return r.recipe;
  return recipes.find(x => x._id === r.recipeId);
};
 // const [localRecipe,setLocalRecipe] = React.useState(null);
const renderMeals = (diet, patientId) => {
//////////////////////////////////////////////////

const sections = [
{ title:"Breakfast 🍳", data: diet?.breakfast || [], key:"breakfast" },
{ title:"Lunch 🍽", data: diet?.lunch || [], key:"lunch" },
{ title:"Dinner 🍛", data: diet?.dinner || [], key:"dinner" },
{ title:"Snacks 🍎", data: diet?.snacks || [], key:"snack" }
];

return sections.map(section => (

<View key={section.title} style={{marginTop:10}}>

<Text style={styles.mealTitle}>
{section.title}
</Text>

{section.data.length === 0 ? (

<Text style={{color:"#9ca3af"}}>
No meals
</Text>

) : (

section.data.map(item => {

const recipe = item.recipe || item;

return (

<RecipeCard
key={recipe._id}
recipe={recipe}
onPress={()=>setSelectedItem(recipe)}
hidePrice={true}
isPatientView={true}
removeFromPatient={(recipeId)=>{
removeMealFromPatient(patientId, recipeId, section.key);
}}
/>

);

})

)}

</View>

));

};

const [tab,setTab] = React.useState("active");
/////////////////////////////////////////////////////
const openAddMeal = (patient, mealType) => {
  setSelectedPatient(patient);
  setSelectedMealType(mealType);
  setShowModify(true); 
  
};
//////////////////////////////////////////////////////
const filteredPatientsForExpert = patients.filter(p =>
p.name?.toLowerCase().includes(expertPatientSearch.toLowerCase()) ||
p.email?.toLowerCase().includes(expertPatientSearch.toLowerCase())
);

const waitingPatients = filteredPatientsForExpert.filter(
p => !p.isAccepted
);

const activePatients = filteredPatientsForExpert.filter(
p => p.isAccepted
);
const getGoal = (p) => {
  if(p?.goalType === "cutting") return "Cutting ";
  if(p?.goalType === "bulking") return "Bulking ";
  return "Maintenance ";
};










const MacroCard = ({label,value,color}) => (

<View style={styles.macroCard}>

  <View style={{
    width:60,
    height:60,
    borderRadius:30,
    borderWidth:6,
    borderColor:color,
    justifyContent:"center",
    alignItems:"center"
  }}>
    <Text style={{color:"white",fontWeight:"bold"}}>
      {Math.round(value*100)}%
    </Text>
  </View>

  <Text style={{color:"#9ca3af",marginTop:6}}>
    {label}
  </Text>

</View>

);












return (
  <>
<PaymentGuard />
<ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:15 }}>

{/* SEARCH */}
<TextInput
placeholder="Search patient..."
value={expertPatientSearch}
onChangeText={setExpertPatientSearch}
style={styles.input}
/>

{/* TABS 
<View style={{flexDirection:"row",marginBottom:15}}>

<TouchableOpacity
onPress={()=>setTab("active")}
style={[
styles.tabBtn,
tab==="active" ? styles.tabActive : styles.tabInactive
]}
>
<Text style={{color:"white",textAlign:"center"}}>
Active ({activePatients.length})
</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>setTab("waiting")}
style={{
flex:1,
padding:10,
backgroundColor:tab==="waiting" ? "#22c55e" : "#334155",
borderRadius:10
}}
>
<Text style={{color:"white",textAlign:"center"}}>
Waiting ({waitingPatients.length})
</Text>
</TouchableOpacity>

</View>*/}







{/* MODERN TABS */}
<View style={styles.tabsWrap}>

<TouchableOpacity
onPress={()=>setTab("active")}
style={[
styles.modernTab,
tab==="active" && styles.activeTabModern
]}
>
<View style={styles.tabBadge}>
<Text style={styles.badgeText}>
{activePatients.length}
</Text>
</View>

<Text style={[
styles.tabLabel,
tab==="active" && styles.activeLabel
]}>
💪 Active
</Text>

{tab==="active" && <View style={styles.tabIndicator} />}
</TouchableOpacity>


<TouchableOpacity
onPress={()=>setTab("waiting")}
style={[
styles.modernTab,
tab==="waiting" && styles.waitingTabModern
]}
>
<View style={[styles.tabBadge,{backgroundColor:"#f59e0b"}]}>
<Text style={styles.badgeText}>
{waitingPatients.length}
</Text>
</View>

<Text style={[
styles.tabLabel,
tab==="waiting" && styles.activeLabel
]}>
🕒 Waiting
</Text>

{tab==="waiting" && <View style={styles.tabIndicator} />}
</TouchableOpacity>

</View>



























{/* WAITING */}
{tab === "waiting" && (
<>
<Text style={styles.sectionTitle}>🕒 Waiting Room</Text>

{waitingPatients.length === 0 ? (
<Text style={{color:"#9ca3af"}}>No waiting patients</Text>
) : (
waitingPatients.map(p => (
<View key={p._id} style={styles.globalCard}>












<View style={styles.userCard}>







  {/* 🔥 MOBILE IMAGE TOP */}
  {isMobile && (
    <View style={styles.topImage}>
      <Image
        source={{
          uri: p.photo
            ? getImageUrl(p.photo)
            : "https://via.placeholder.com/150"
        }}
        style={styles.userImageMobile}
      />
    </View>
  )}

  {/* 🔥 DESKTOP IMAGE LEFT */}
  {!isMobile && (
    <View style={styles.leftSection}>
      <Image
        source={{
          uri: p.photo
            ? getImageUrl(p.photo)
            : "https://via.placeholder.com/150"
        }}
        style={styles.userImage}
      />
    </View>
  )}

  {/* 🔥 MOBILE LAYOUT */}
  {isMobile ? (

    <View style={styles.mobileRow}>

      {/* LEFT */}
      <View style={{flex:1, paddingRight:10}}>
        <Text style={styles.name}>{p.name}</Text>

        <Text style={styles.sub}>
          {p.gender}, {p.age} years old
        </Text>

        <Text style={styles.weightLabel}>Weight</Text>

        <Text style={styles.weight}>
          {p.weight} <Text style={{fontSize:24}}>kg</Text>
        </Text>
      </View>

      {/* RIGHT */}
      <View style={{flex:1, paddingLeft:30}}>

        <View style={styles.statItem}>
          <Ruler size={16} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{p.height / 100} m</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Activity size={16} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>BMI</Text>
            <Text style={styles.statValue}>
              {(p.weight / ((p.height/100)**2)).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Target size={16} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={styles.statValue}>
              {p.goalCalories > 0 ? getGoal(p) : "Not set"}
            </Text>
          </View>
        </View>

      </View>
    </View>

  ) : (

   <View style={{flexDirection:"row", width:"100%", alignItems:"center"}}>

      {/* CENTER */}
      <View style={styles.centerSection}>
        <Text style={styles.name}>{p.name}</Text>

        <Text style={styles.sub}>
          {p.gender}, {p.age} years old
        </Text>

        <Text style={styles.weightLabel}>Weight</Text>

        <Text style={styles.weight}>
          {p.weight} <Text style={{fontSize:30}}>kg</Text>
        </Text>

        {/* 🔥 disease */}
        {p.chronicDisease && (
          <Text style={styles.diseaseText}>
            {p.chronicDisease}
          </Text>
        )}
      </View>

      {/* RIGHT */}
      <View style={styles.rightInfo}>

        <View style={styles.statItem}>
          <Ruler size={18} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{p.height / 100} m</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Activity size={18} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>BMI</Text>
            <Text style={styles.statValue}>
              {(p.weight / ((p.height/100)**2)).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Target size={18} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={styles.statValue}>
              {p.goalCalories > 0 ? getGoal(p) : "Not set"}
            </Text>
          </View>
        </View>

      </View>

    </View>

  )}

</View>















<View style={styles.row}>

  <TouchableOpacity
    style={styles.acceptBtn}
    onPress={()=>acceptPatient(p._id)}
  >
    <Text style={{color:"white"}}>Accept</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.deleteBtn}
    onPress={()=>deletePatient(p._id)}
  >
    <Text style={{color:"white"}}>Refuse</Text>
  </TouchableOpacity>

</View>










</View>


))
)}
</>
)}

{/* ACTIVE */}
{tab === "active" && (
<>
<Text style={styles.sectionTitle}>💪 Active Patients</Text>

{activePatients.length === 0 ? (
<Text style={{color:"#9ca3af"}}>No active patients</Text>
) : (
activePatients.map(p => {

 const lastDates = [
  ...new Set(
    (p.recommendations || []).map(r =>
      new Date(r.createdAt).toLocaleDateString("en-GB")
    )
  )
]
.sort((a, b) =>
  new Date(b.split("/").reverse().join("-")) -
  new Date(a.split("/").reverse().join("-"))
)
.slice(0, 3);

  return (

<View key={p._id} style={styles.globalCard}>

  {/* CARD */}
 {/*<TouchableOpacity
  style={styles.userCard}
  activeOpacity={0.9}
  onPress={async ()=>{
    setSelectedPatient(p);
    await loadRecommendations(p._id); 
    setShowModal(true);
  }}
>*/}
<View style={styles.userCard}>

  {/* 🔥 MOBILE IMAGE TOP */}
 

  {/* 🔥 DESKTOP IMAGE LEFT */}
  <View style={styles.imageWrapper}>
  <Image
    source={{
      uri: p.photo
        ? getImageUrl(p.photo)
        : "https://via.placeholder.com/150"
    }}
    style={styles.userImage}
  />

  {/* ICONS */}
  <View style={styles.iconOverlay}>
    <TouchableOpacity
  style={styles.iconBtn}
  onPress={() => openWhatsApp(p.phone)}
>
  <Phone size={16} color="white" />
</TouchableOpacity>

   <TouchableOpacity
  style={[styles.iconBtn, { marginLeft:20 }]}
onPress={() => openEmail(p.email)}
>
  <Mail size={18} color="white" />
</TouchableOpacity>
  </View>
</View>

  {/* 🔥 MOBILE */}
  {isMobile ? (

    <View style={styles.mobileRow}>

  {/* LEFT */}
  <View style={{flex:1, paddingRight:1}}>
    <Text style={styles.name}>{p.name}</Text>
    <Text style={styles.sub}>
      {p.gender}, {p.age} years old
    </Text>

    {p.chronicDisease && (
      <View style={styles.diseaseBox}>
        <Stethoscope size={14} color="#f87171" />
        <Text style={styles.diseaseText}>
          {p.chronicDisease}
        </Text>
      </View>
    )}

    <Text style={styles.weightLabel}>Weight</Text>
    <Text style={styles.weight}>
      {p.weight} <Text style={{fontSize:24}}>kg</Text>
    </Text>
  </View>

  {/* RIGHT */}
  <View style={{flex:1, paddingLeft:35}}>
    
    <View style={styles.statItem}>
      <Ruler size={16} color="#94a3b8" />
      <View>
        <Text style={styles.statLabel}>Height</Text>
        <Text style={styles.statValue}>{p.height / 100} m</Text>
      </View>
    </View>

    <View style={styles.statItem}>
      <Activity size={16} color="#94a3b8" />
      <View>
        <Text style={styles.statLabel}>BMI</Text>
        <Text style={styles.statValue}>
          {(p.weight / ((p.height/100)**2)).toFixed(2)}
        </Text>
      </View>
    </View>

    <View style={styles.statItem}>
      <Target size={16} color="#94a3b8" />
      <View>
        <Text style={styles.statLabel}>Goal</Text>
        <Text style={styles.statValue}>
          {p.goalCalories > 0 ? getGoal(p) : "Not set"}
        </Text>
      </View>
    </View>

  </View>

</View>
  ) : (

  <View style={{flexDirection:"row", flex:1, paddingLeft: width < 768 ? 10 : 60}}>

  {/* LEFT CONTENT */}
  <View style={styles.centerSection}>
    <Text style={styles.name}>{p.name}</Text>

    <Text style={styles.sub}>
      {p.gender}, {p.age} years old
    </Text>

     {p.chronicDisease && (
      <View style={styles.diseaseBox}>
        <Stethoscope size={16} color="#f87171" />
        <Text style={styles.diseaseText}>
          {p.chronicDisease}
        </Text>
      </View>
    )}

    <Text style={styles.weightLabel}>Weight</Text>
    <Text style={styles.weight}>
      {p.weight} <Text style={{fontSize:30}}>kg</Text>
    </Text>

   
  </View>


      <View style={styles.rightInfo}>

        <View style={styles.statItem}>
          <Ruler size={18} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{p.height / 100} m</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Activity size={18} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>BMI</Text>
            <Text style={styles.statValue}>
              {(p.weight / ((p.height/100)**2)).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Target size={18} color="#94a3b8" />
          <View>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={styles.statValue}>
              {p.goalCalories > 0 ? getGoal(p) : "Not set"}
            </Text>
          </View>
        </View>

      </View>

    </View>

  )}
  </View>

{/*</TouchableOpacity>*/}










<View style={styles.bottomSection}>

  {/* LEFT → CHART */}
  <View style={styles.chartBox}>

  <Text style={styles.boxTitle}>Weight</Text>
   
  {(() => {

    const data = p.weightHistory?.slice(-6).map(w => w.weight) || [];
   const width = 300;// نصف الكارد
const height = 120;
    
     const trendColor =
    data.length > 1 && data[data.length-1] < data[0]
      ? "#22c55e"
      : "#ef4444";


    const linePath = createPath(data, width, height);
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return data.length > 1 ? (




      <Svg
  width="100%"
  height={height}
  viewBox={`0 0 ${width} ${height}`}
>

  <Defs>
    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0%" stopColor={trendColor} stopOpacity="0.35" />
      <Stop offset="100%" stopColor={trendColor} stopOpacity="0" />
    </LinearGradient>

    {/* glow effect 🔥 */}
    <LinearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
      <Stop offset="0%" stopColor="#22c55e" />
      <Stop offset="100%" stopColor="#4ade80" />
    </LinearGradient>
  </Defs>

  {/* AREA */}
  <Path
    d={areaPath}
    fill="url(#grad)"
  />

  {/* LINE */}
  <Path
    d={linePath}
    stroke={trendColor}
    strokeWidth={3}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  />

</Svg>

 

     ) : (
      <Text style={{color:"#64748b"}}>No data</Text>
    );

  })()}

</View>

  {/* RIGHT → LAST MEALS */}
  <View style={styles.mealsBox}>

    <View style={styles.boxHeader}>
  <Text style={styles.boxTitle}>Last Plans</Text>

  <TouchableOpacity
    style={styles.addBtn}
    onPress={async ()=>{
      setSelectedPatient(p);
      await loadRecommendations(p._id); 
      setShowModal(true);
    }}
  >
    <Text style={styles.addBtnText}>＋</Text>
  </TouchableOpacity>
</View>

   {lastDates.map(date => (
  <Text key={date} style={styles.mealItem}>
    📅 {date}
  </Text>
))}

  </View>

</View>


  {/* MEALS */}
  

</View>

  );

}) 

)     
}      
</>
)}     









<Modal visible={showModal} transparent animationType="fade">

<View style={styles.modalOverlay}>

<View style={styles.modernModal}>

{selectedPatient && (()=>{




// 🧠 حساب الماكروز
let totals = {
  calories:0,
  protein:0,
  carbs:0,
  fat:0,
  price:0
};



  /*selectedPatient.*/recommendations?.forEach(r => {
  

  const recipe = getRecipe(r);
  if(!recipe) return;

  const servings = r.servings || 1;
  const baseServings = recipe.servings || 1;

  const factor = servings / baseServings;

  totals.calories += (recipe.nutrition?.energyKcal || 0) * factor;
  totals.protein += (recipe.nutrition?.protein || 0) * factor;
  totals.carbs += (recipe.nutrition?.carbohydrates || 0) * factor;
  totals.fat += (recipe.nutrition?.fat || 0) * factor;
  totals.price += (recipe.price || 0) * factor;

//});

});

/*const totalMacros =
  totals.protein +
  totals.carbs +
  totals.fat;*/

const goal = selectedPatient.goalCalories || 2000;
const pctCalories = goal ? (totals.calories / goal) : 0;


const pct = (v)=> totalMacros ? (v/totalMacros) : 0;

return(

<ScrollView>

{/* TITLE */}
<Text style={styles.modalTitle}>
Meals of {selectedPatient.name}
</Text>

<TouchableOpacity
  style={{
    backgroundColor:"#22c55e",
    padding:12,
    borderRadius:12,
    marginBottom:15,
    alignItems:"center"
  }}
  onPress={async () => {
  await handleGenerateMeals();
}}
>
  <Text style={{color:"white", fontWeight:"bold"}}>
    ⚡ Generate Plan (AI)
  </Text>
</TouchableOpacity>
{/* MACROS CARDS */}










<View style={styles.circlesContainer}>

  <View style={styles.circleCard}>
  <SmallMacroCircle
  label="Carbs"
  value={totals.carbs}
  goal={selectedPatient.macros?.carbs || 200}
  color="#22c55e"
  unit="g"
/>
  </View>

  <View style={styles.circleCard}>
   <SmallMacroCircle
  label="Protein"
  value={totals.protein}
  goal={selectedPatient.macros?.protein || 120}
  color="#3b82f6"
  unit="g"
/>
  </View>

  <View style={styles.circleCard}>
   <SmallMacroCircle
  label="Fat"
  value={totals.fat}
  goal={selectedPatient.macros?.fat || 60}
  color="#f59e0b"
  unit="g"
/>
  </View>

  <View style={styles.circleCard}>
   <SmallMacroCircle
  label="Calories"
  value={totals.calories}
  goal={selectedPatient.goalCalories || 2000}
  color="#ef4444"
  unit=""
/>
  </View>

</View>


{/* PRICE */}
<Text style={styles.priceText}>
  Budget: {Math.round(totals.price)} / {selectedPatient.dailyBudget || 1000} DA
</Text>

{["breakfast","lunch","dinner","snack"].map(section => {

  const meals = /*selectedPatient.*/recommendations?.filter(r => 
    
    r.mealType === section
  ) || [];

  return (
    <View key={section} style={{marginTop:20}}>

      {/* HEADER */}
<TouchableOpacity
  onPress={async ()=>{
    setShowModal(false);

    if(recipes.length === 0){
      await fetchRecipes();
    }

    setTimeout(()=>{
      setSelectedPatient(selectedPatient);
      setSelectedMealType(section);
      setShowModify(true);
    },100);
  }}
  style={{
    marginBottom:10,
    paddingVertical:8,
    borderRadius:10
  }}
>

  <Text style={styles.mealTitle}>
    {section.toUpperCase()} ➕
  </Text>

</TouchableOpacity>

      {/* MEALS */}
      {meals.length > 0 ? (
        meals.map(r => {

        const recipe = getRecipe(r);

          if(!recipe) return null;

        ///////////////////////
        /*const imageUri =
  recipe?.image && typeof recipe.image === "string"
    ? `${BASE_URL}${recipe.image}`
    : "https://via.placeholder.com/100";*/
    const imageUri =
  recipe?.image && typeof recipe.image === "string"
    ? getImageUrl(recipe.image)
     : "https://via.placeholder.com/100";
    ///////////////////////////////////





          return (








           <View key={r._id} style={styles.mealCard}>

  <View style={{
    flexDirection:"row",
    alignItems:"center"
  }}>

    {/* IMAGE */}
    <Image
      source={{ uri: imageUri }}
      style={styles.mealImage}
    />

    {/* INFO */}
    <View style={{ flex:1, marginLeft:10 }}>

      <Text style={styles.mealName}>
        {recipe.name}
      </Text>

      <Text style={styles.mealKcal}>
        {Math.round(recipe.nutrition?.energyKcal || 0)} kcal
      </Text>

      <Text style={styles.mealPrice}>
        {recipe.price} DA
      </Text>

    </View>

    {/* COUNTER (RIGHT SIDE) */}
    <View style={styles.counterBox}>

  <TouchableOpacity
    onPress={()=>{
      updateServings(r._id, Math.max(1, (r.servings || 1) - 1));
    }}
    style={styles.circleBtn}
  >
    <Text style={styles.circleText}>−</Text>
  </TouchableOpacity>

  <Text style={styles.counterValue}>
    {r.servings || 1}/{recipe.servings || 1}
  </Text>

  <TouchableOpacity
    onPress={()=>{
      updateServings(r._id, (r.servings || 1) + 1);
    }}
    style={styles.circleBtn}
  >
    <Text style={styles.circleText}>+</Text>
  </TouchableOpacity>

</View>
  </View>

</View>
          );
        })

      ) : (
        <Text style={{color:"#64748b"}}>No meals</Text>
      )}

    </View>
  );
})}
{/* MODIFY */}


{/* CLOSE */}
<TouchableOpacity
  style={styles.closeBtn}
  onPress={()=>setShowModal(false)}
>
  <Text style={{color:"white"}}>Close</Text>
</TouchableOpacity>

</ScrollView>

);

})()}

</View>

</View>

</Modal>



</ScrollView>
</>
);

}

//const styles = StyleSheet.create({
const createStyles = (width) => StyleSheet.create({
input:{
borderWidth:1,
borderColor:"#334155",
padding:12,
borderRadius:12,
backgroundColor:"#1f2937",
color:"#e2e8f0",
marginBottom:10
},

sectionTitle:{
color:"#22c55e",
fontSize:18,
fontWeight:"bold",
marginTop:20,
marginBottom:10
},

card:{
backgroundColor:"#243447",
padding:15,
borderRadius:15,
marginBottom:12
},

name:{
color:"white",
fontSize:16,
fontWeight:"bold"
},

sub:{
color:"#9ca3af",
marginBottom:10
},

info:{
color:"white",
fontSize:13
},

disease:{
color:"#ef4444",
marginTop:5
},

mealTitle:{
marginTop:10,
color:"#22c55e",
fontWeight:"bold"
},

mealItem:{
color:"white",
fontSize:13
},

row:{
flexDirection:"row",
marginTop:10,
gap:10
},

acceptBtn:{
backgroundColor:"#22c55e",
padding:8,
borderRadius:8
},

deleteBtn:{
backgroundColor:"#ef4444",
padding:8,
borderRadius:8
},

modifyBtn:{
marginTop:10,
backgroundColor:"#3b82f6",
padding:10,
borderRadius:10,
alignItems:"center"
},








container: {
  flex: 1,
  backgroundColor: "#0f172a"
},
input:{
  backgroundColor:"#1e293b",
  padding:14,
  borderRadius:14,
  color:"#f1f5f9",
  marginBottom:15,
  borderWidth:1,
  borderColor:"#334155"
},
tabBtn:{
  flex:1,
  padding:12,
  borderRadius:12,
  alignItems:"center"
},

tabActive:{
  backgroundColor:"#22c55e"
},

tabInactive:{
  backgroundColor:"#1e293b"
},

tabText:{
  color:"white",
  fontWeight:"600"
},
card:{
  backgroundColor:"#1e293b",
  padding:18,
  borderRadius:20,
  marginBottom:15,
  borderWidth:1,
  borderColor:"#334155",
  shadowColor:"#000",
  shadowOpacity:0.2,
  shadowRadius:10,
  elevation:4
},
name:{
  color:"white",
  fontSize:18,
  fontWeight:"bold"
},

sub:{
  color:"#94a3b8",
  marginBottom:12
},
info:{
  color:"#e2e8f0",
  fontSize:13,
  marginBottom:2
},
disease:{
  marginTop:6,
  color:"#ef4444",
  fontWeight:"600"
},
mealTitle:{
  marginTop:12,
  color:"#22c55e",
  fontWeight:"bold",
  fontSize:14
},

mealItem:{
  color:"#cbd5f5",
  fontSize:13,
  marginLeft:5
},
acceptBtn:{
  flex:1,
  backgroundColor:"#22c55e",
  padding:10,
  borderRadius:12,
  alignItems:"center"
},

deleteBtn:{
  flex:1,
  backgroundColor:"#ef4444",
  padding:10,
  borderRadius:12,
  alignItems:"center"
},

modifyBtn:{
  marginTop:12,
  backgroundColor:"#3b82f6",
  padding:12,
  borderRadius:14,
  alignItems:"center"
},
row:{
  flexDirection:"row",
  marginTop:12,
  gap:10
},
/*userCard:{
  flexDirection:"row",
  backgroundColor:"#111827",
  padding:20,
  borderRadius:20,
  alignItems:"center",
  marginBottom:15,
  shadowColor:"#000",
  shadowOpacity:0.4,
  shadowRadius:10,
  elevation:6
},*/

userImage:{
  width:190,
  height:190,
  borderRadius:10
},

userName:{
  color:"white",
  fontSize:30,
  fontWeight:"bold"
},

userSub:{
  color:"#9ca3af",
  fontSize:12,
  marginBottom:6
},

weightLabel:{
  color:"#9ca3af",
  fontSize:12
},

weightValue:{
  color:"white",
  fontSize:26,
  fontWeight:"bold"
},

infoColumn:{
  marginLeft:10
},

infoRow:{
  flexDirection:"row",
  alignItems:"center",
  gap:6,
  marginBottom:10
},

infoLabel:{
  color:"#9ca3af",
  fontSize:11
},

infoValue:{
  color:"white",
  fontWeight:"bold"
},



diseaseText:{
  color:"#fca5a5",
  fontSize:14,
  fontWeight:"600"
},


modalOverlay:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:"rgba(0,0,0,0.6)"
},

modalCard:{
  width:"90%",
  maxHeight:"80%",
  backgroundColor:"#111827",
  padding:20,
  borderRadius:20
},

modalTitle:{
  color:"#22c55e",
  fontSize:18,
  fontWeight:"bold",
  marginBottom:15
},

closeBtn:{
  marginTop:15,
  backgroundColor:"#ef4444",
  padding:12,
  borderRadius:12,
  alignItems:"center"
},

chartCard:{
  backgroundColor:"#1e293b",
  padding:15,
  borderRadius:20,
  marginTop:10
},

chartTitle:{
  color:"#22c55e",
  fontWeight:"bold",
  marginBottom:10
},
globalCard:{
  backgroundColor:"#111827",
  borderRadius:20,
  padding:15,
  marginBottom:15,
  shadowColor:"#000",
  shadowOpacity:0.4,
  shadowRadius:10,
  elevation:6
},

divider:{
  height:1,
  backgroundColor:"#374151",
  marginVertical:10
},

chartContainer:{
  marginTop:5
},

chartTitle:{
  color:"#22c55e",
  fontWeight:"bold",
  marginBottom:8
},























bottomSection:{
  flexDirection:"row",
  borderTopWidth:1,
  borderColor:"#374151",
  paddingTop:10
},

chartBox:{
  flex:1,
  borderRightWidth:1,
  borderColor:"#374151",
  paddingRight:10,
  justifyContent:"center"
},

mealsBox:{
  flex:1,
  paddingLeft:10
},

boxTitle:{
  color:"#22c55e",
  fontWeight:"bold",
  marginBottom:6
},













modernModal:{
  //width:"60%",
   width: width < 768 ? "95%" : "60%", 
  maxHeight:"90%",
  backgroundColor:"#1e293b",
  padding:20,
  borderRadius:25
},

macrosRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  marginBottom:20
},

macroCard:{
  alignItems:"center",
  width:"23%"
},

priceText:{
  color:"#22c55e",
  textAlign:"center",
  fontWeight:"bold",
  marginBottom:10
},

mealRow:{
  flexDirection:"row",
  alignItems:"center",
  marginBottom:12
},

mealImage:{
  width:60,
  height:60,
  borderRadius:12
},

mealName:{
  color:"white",
  fontWeight:"bold",
  fontSize:14
},

mealKcal:{
  color:"#9ca3af",
  fontSize:12
},

mealPrice:{
  color:"#22c55e",
  fontWeight:"bold",
  fontSize:13
},
circlesContainer:{
  flexDirection:"row",
  
  justifyContent:"space-between",
  marginBottom:25,
  gap:10,
  flexWrap:"wrap" 
},

circleCard:{
  //flex:1,
  width: width < 768 ? "44%" : "23%",
  //marginHorizontal:6,
  paddingVertical:14,
  borderRadius:20,
  alignItems:"center",

  backgroundColor:"rgba(255,255,255,0.05)",
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.08)",

  shadowColor:"#000",
  shadowOpacity:0.25,
  shadowRadius:12,
  elevation:6
},


acceptBtn:{
  flex:1,
  backgroundColor:"#22c55e",
  padding:10,
  borderRadius:12,
  alignItems:"center",
  shadowColor:"#c52222",
  shadowOpacity:0.5,
  shadowRadius:8,
  elevation:5
},




mealCard:{
  backgroundColor:"#0f172a",
  borderRadius:16,
  padding:12,
  marginBottom:12,
  borderWidth:1,
  borderColor:"#1e293b"
},



counterBtn:{
  color:"#22c55e",
  fontSize:18,
  paddingHorizontal:6
},




counterButton:{
  backgroundColor:"#22c55e",
  width:32,
  height:32,
  borderRadius:8,
  justifyContent:"center",
  alignItems:"center",

  // 🔥 3D EFFECT
  shadowColor:"#000",
  shadowOffset:{ width:0, height:4 },
  shadowOpacity:0.4,
  shadowRadius:4,
  elevation:6,

  // 🔥 border light (depth)
  borderWidth:1,
  borderColor:"#4ade80"
},





















circleText:{
  color:"white",
  fontSize:16,
  fontWeight:"bold"
},





counterBox:{
  flexDirection:"row",
  alignItems:"center",
  gap:10
},

circleBtn:{
  width:34,
  height:34,
  borderRadius:10,
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:"#1e293b",

  // 🔥 3D EFFECT
  shadowColor:"#000",
  shadowOffset:{ width:0, height:5 },
  shadowOpacity:0.5,
  shadowRadius:5,
  elevation:8,

  // 🔥 highlight
  borderWidth:1,
  borderColor:"#334155"
},

circleText:{
  color:"white",
  fontSize:18,
  fontWeight:"bold"
},

counterValue:{
  color:"#22c55e",
  fontWeight:"bold",
  fontSize:16
},














userCard:{
  flexDirection: width < 768 ? "column" : "row",
  //alignItems:"center",

  backgroundColor:"#1e293b",

  paddingVertical: width < 768 ? 25 : 45,
  paddingHorizontal: width < 768 ? 15 : 30,

  borderRadius:30,
  marginBottom:20,

  width:"100%",
  maxWidth: width < 768 ? "100%" : 1200,

  alignSelf:"center",

  shadowColor:"#000",
  shadowOpacity:0.6,
  shadowRadius:25,
  elevation:12
},
topImage:{
  alignItems:"center",
  marginBottom:20
},
userImageMobile:{
  width:140,
  height:140,
  borderRadius:70
},
leftSection:{
  position:"relative",
  width:160,
  justifyContent:"center",
  alignItems:"center"
},
centerSection:{
  flex:1,
  marginLeft: width < 768 ? 0 : 25,
  alignItems: width < 768 ? "center" : "flex-start",
  maxWidth: width < 768 ? "100%" : "60%" 
},
rightInfo:{
  width:220,
  marginLeft: width < 768 ? 0 : 40,
  marginTop: width < 768 ? 20 : 0,
  justifyContent:"center"
},
mobileRow:{
  flexDirection:"row",
  width:"100%",
  justifyContent:"space-between",
  marginTop:10,
  //gap:15
},
name:{
  color:"white",
  fontSize: width < 768 ? 28 : 36,
  fontWeight:"bold"
},

weight:{
  color:"white",
  fontSize: width < 768 ? 40 : 60,
  fontWeight:"bold"
},
statItem:{
  flexDirection:"row",
  alignItems:"center",
  gap:8,
  marginBottom:12
},

statLabel:{
  color:"#9ca3af",
 fontSize: width < 768 ? 11 : 13
},

statValue:{
  color:"white",
  fontWeight:"bold",
  fontSize: width < 768 ? 14 : 18
},
diseaseBox:{
  flexDirection:"row",
  alignItems:"center",
  gap:6,
 backgroundColor:"rgba(239,68,68,0.15)", 
  paddingHorizontal:10,
  paddingVertical:5,
  borderRadius:10,
  marginTop:5
},
imageWrapper:{
  position:"relative",
  marginTop: width < 768 ? 20 : 0, 
  width: width < 768 ? 140 : 120,
  height: width < 768 ? 140 : 120,
  alignSelf: width < 768 ? "center" : "flex-start",
  marginBottom: width < 768 ? 20 : 0,
  justifyContent:"center",
  alignItems:"center",
    marginLeft: width < 768 ? 0 : 30,
  marginTop: width < 768 ? 20 : 30,
},


iconOverlay:{
  position:"absolute",

  
  top: width < 768 ? -13 : -25,
  right: width < 768 ? 20 : 5,

  flexDirection:"row",
  gap:6
},

iconBtn:{
  backgroundColor:"rgba(0,0,0,0.6)",
  padding:6,
  borderRadius:8,
  //marginLeft:12
},
iconBtn:{
  width:32,
  height:32,
  borderRadius:16,

  justifyContent:"center",
  alignItems:"center",

  backgroundColor:"rgba(15,23,42,0.6)",  // 🔥 glass effect

  borderWidth:1,
  borderColor:"rgba(255,255,255,0.15)",

  // 🔥 shadow (web + mobile)
  shadowColor:"#000",
  shadowOffset:{ width:0, height:4 },
  shadowOpacity:0.4,
  shadowRadius:6,
  elevation:6
},
boxHeader:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:6
},

addBtn:{
  width:35,
  height:35,
  borderRadius:8,

  justifyContent:"center",
  alignItems:"center",

  backgroundColor:"#22c55e",

  shadowColor:"#000",
  shadowOpacity:0.3,
  shadowRadius:4,
  elevation:4
},

addBtnText:{
  color:"white",
  fontSize:18,
  fontWeight:"bold"
},

tabsWrap:{
flexDirection:"row",
backgroundColor:"#111827",
padding:6,
borderRadius:18,
marginBottom:18,
borderWidth:1,
borderColor:"#1f2937"
},

modernTab:{
flex:1,
paddingVertical:14,
borderRadius:14,
alignItems:"center",
justifyContent:"center",
position:"relative"
},

activeTabModern:{
backgroundColor:"#1e293b",
shadowColor:"#000",
shadowOpacity:0.25,
shadowRadius:6,
elevation:4
},

waitingTabModern:{
backgroundColor:"#1e293b",
shadowColor:"#000",
shadowOpacity:0.25,
shadowRadius:6,
elevation:4
},

tabLabel:{
color:"#94a3b8",
fontSize:15,
fontWeight:"600"
},

activeLabel:{
color:"#ffffff"
},

tabBadge:{
position:"absolute",
top:8,
right:18,
backgroundColor:"#22c55e",
minWidth:22,
height:22,
borderRadius:11,
justifyContent:"center",
alignItems:"center",
paddingHorizontal:6
},

badgeText:{
color:"white",
fontSize:11,
fontWeight:"bold"
},

tabIndicator:{
position:"absolute",
bottom:4,
width:30,
height:3,
borderRadius:2,
backgroundColor:"#22c55e"
},
});