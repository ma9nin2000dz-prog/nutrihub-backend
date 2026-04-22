 //import React from "react";
 import Svg, { Circle } from "react-native-svg";
 import { Pedometer } from "expo-sensors";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
   Modal,
    TextInput,
    FlatList
} from "react-native";
import PaymentGuard from "../../components/pro/PaymentGuard";
import React, { useState, useEffect ,useRef} from "react";
import { apiRequest } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Activity } from "lucide-react-native";
import RecipeCard from "../../components/pro/RecipeCard";
import { Ionicons } from "@expo/vector-icons";

//const BASE_URL = "http://localhost:5000";
import { BASE_URL } from "../../services/api";
const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};
import { Dimensions,Animated,useWindowDimensions } from "react-native";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

//import { useWindowDimensions } from "react-native";

const calculatePrice = (recipe) => {
  if (!recipe.ingredients) return 0;

  return recipe.ingredients.reduce((total, ing) => {
    return total + (ing.price || 0) * (ing.quantity || 1);
  }, 0);
};

export default function DietBuilder({
  selectedDiet,
  setSelectedDiet,
  setActiveTab,
  setSelectedItem,
  tdeeResult,
  calorieGoalType,
  activity,
  weight,
  simpleMode,
  myRecommendations,
 deleteRecommendation,
 addToDiet,
 fetchMyRecommendations,
 selectedPatient,
 removeFromPatient,
  hideNotifications,
  hideBudget,
  hideWater = false,
  showBar,
  setShowBar
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const THRESHOLD = 30;
const isAnimatingRef = useRef(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [realSteps, setRealSteps] = useState(0);
  const [displaySteps, setDisplaySteps] = useState(0);
const [openDeleteId, setOpenDeleteId] = useState(null);

  const getAllMeals = (diet) =>
  Object.values(diet || {}).flat();

  const { width } = useWindowDimensions();
const isMobile = width < 768;
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  //const [newBudget, setNewBudget] = useState(budget);
  const [newBudget, setNewBudget] = useState(0);
  const [openActionsId, setOpenActionsId] = useState(null);
  const [selectedServings, setSelectedServings] = useState(1);///////////////////////
  const [showRecommendations,setShowRecommendations] = React.useState(false);
//const [selectedRecipeDetails, setSelectedRecipeDetails] = useState(null);
const [lastSeenCount,setLastSeenCount] = React.useState(0);
const unreadCount = Math.max(
(myRecommendations?.length || 0) - lastSeenCount,
0
);

const [tdee,setTdee] = React.useState(null);


const allAdded = myRecommendations.length > 0 &&
  myRecommendations.every(item =>
    getAllMeals(selectedDiet)
      .some(r => r._id === item.recipe?._id)
  );

///////////////////////////
React.useEffect(()=>{

const loadTDEE = async ()=>{

try{

const data = await apiRequest("users/me","GET");

setTdee(data);

}catch(e){

console.log(e);

}

};

loadTDEE();

},[]);
/////////////////////for real steps//////////////////////////////
useEffect(() => {
  let subscription;

  const start = async () => {
    const available = await Pedometer.isAvailableAsync();

    if (!available) {
      console.log("Pedometer not available");
      return;
    }

    subscription = Pedometer.watchStepCount(result => {
      setRealSteps(result.steps);
    });
  };

  start();

  return () => {
    if (subscription) subscription.remove();
  };
}, []);

////////////////////////////////
// 🔥 INITIALIZE DISPLAY STEPS
useEffect(() => {
  let interval;

  if (displaySteps < realSteps) {
    interval = setInterval(() => {
      setDisplaySteps(prev => {
        if (prev + 1 >= realSteps) {
          clearInterval(interval);
          return realSteps; // stop هنا
        }
        //return prev + 1;
        return prev + Math.ceil((realSteps - prev) / 8);
      });
    }, 10); // سرعة animation
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [realSteps]);//[realSteps, displaySteps]
/////////////////////////
// 🔥 SMOOTH  ANIMATION
useEffect(() => {
  Animated.timing(translateY, {
    toValue: showBar ? 0 : -120,
    duration: 400,
    useNativeDriver: true
  }).start();
}, [showBar]);

///////////////////////////
React.useEffect(() => {

const loadSeen = async () => {

try{
const saved = await AsyncStorage.getItem("lastSeenRecommendations");

if(saved){
setLastSeenCount(Number(saved));
}

}catch(e){
console.log(e);
}

};

loadSeen();

},[]);
//////////////////////////////
React.useEffect(()=>{

fetchMyRecommendations();

const interval = setInterval(()=>{
fetchMyRecommendations();
},30000);

return ()=>clearInterval(interval);

},[]);
////////////////////////////////////////////////////
// CALCULATE TOTALS
////////////////////////////////////////////////////



const calculateTotals = () => {

  let totals = {
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    price: 0
  };

  //selectedDiet.forEach(r => {
getAllMeals(selectedDiet).forEach(r => {
    const servings = r.selectedServings || 1;

    const baseServings = r.servings || 1;

    // 🔥 per serving
    const factor = servings / baseServings;

    totals.protein += (r.nutrition?.protein || 0) * factor;
    totals.carbs += (r.nutrition?.carbohydrates || 0) * factor;
    totals.fat += (r.nutrition?.fat || 0) * factor;
    totals.calories += (r.nutrition?.energyKcal || 0) * factor;
    totals.price += (r.price || 0) * factor;

  });

  return totals;
};
const totals = calculateTotals();

const goalMacros = tdee?.macros || {
  protein: 0,
  carbs: 0,
  fat: 0

};

/////////////////////////////

const budget = tdee?.dailyBudget || 0;
/////////////
useEffect(() => {
  setNewBudget(budget);
}, [budget]);
////////////////////////////
const budgetProgress = budget
  ? Math.min((totals.price / budget) * 100, 100)
  : 0;
//////////////////////////
const macroProgress = {
  protein: goalMacros.protein
    ? Math.min((totals.protein / goalMacros.protein) * 100, 100)
    : 0,

  carbs: goalMacros.carbs
    ? Math.min((totals.carbs / goalMacros.carbs) * 100, 100)
    : 0,

  fat: goalMacros.fat
    ? Math.min((totals.fat / goalMacros.fat) * 100, 100)
    : 0
};




                        


////////////////////////////////////////////////////
// SAVE DIET HISTORY
////////////////////////////////////////////////////
const saveDietHistory = async () => {

try{

await apiRequest("users/diet-history","POST",{
//recipes:selectedDiet.map(r=>r._id),
/*recipes: selectedDiet.map(r => ({
  recipeId: r._id,
  servings: r.selectedServings || 1,
  price: (r.price || 0) * ((r.selectedServings || 1) / (r.servings || 1))
})),*/
recipes: getAllMeals(selectedDiet).map(r => ({
  recipeId: r._id,
  servings: r.selectedServings || 1,
  price: (r.price || 0) * (
    (r.selectedServings || 1) / (r.servings || 1)
  )
})),

totalCalories:totals.calories,
totalPrice:totals.price
});

alert("Diet saved to history");

}catch(error){

console.log(error);

}

};


////////////////////////////////////////////////////
// CALORIE GOAL
////////////////////////////////////////////////////

const getCalorieGoal = () => {

if(!tdeeResult) return 0;

if(calorieGoalType==="maintenance")
return tdeeResult.maintenance_calories;

if(calorieGoalType==="cutting")
return tdeeResult.cutting_calories;

if(calorieGoalType==="bulking")
return tdeeResult.bulking_calories;

return 0;

};
const consumedCalories = Math.round(totals.calories);

const goalCalories = getCalorieGoal();

const progress = goalCalories
? Math.min((consumedCalories / goalCalories) * 100, 100)
: 0;
                                                               
const progressColor =
consumedCalories > goalCalories
? "#ef4444"
: "#22c55e";

////////////////////////////////////////////////////
// WATER INTAKE
////////////////////////////////////////////////////
const waterLiters = (Number(tdee?.weight) || 70) * 0.035;

const waterGoal = Math.round(waterLiters * 10) / 10;

const glassSize = 0.25;

const waterGlasses = Math.round(waterGoal / glassSize);

////////////////////////////////////////////////////
// ACTIVITY
////////////////////////////////////////////////////

const getStepsFromActivity = () => {

const map = {
sedentary:3000,
light:5000,
moderate:7500,
active:10000,
veryactive:12000
};


return map[tdee?.activityLevel?.toLowerCase()] || 5000;
};

//const steps = realSteps || getStepsFromActivity();
const steps = displaySteps;
  
const weightKg = Number(tdee?.weight) || 70;

const caloriesBurned = Math.round(
steps * weightKg * 0.0005
);

//////////////////////////////////////////////botton+ -///////////////////////////////////////////////////

const ServingsControl = ({ r, setSelectedDiet }) => {

  const value = r.selectedServings ?? r.servings ?? 1;

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 30,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 10
    }}>

      {/* MINUS */}
      <TouchableOpacity
        onPress={()=>{
          setSelectedDiet(prev => {
            const updated = { ...prev };
            for (let key in updated) {
              updated[key] = updated[key].map(item =>
                item._id === r._id
                  ? {
                      ...item,
                      selectedServings: Math.max(1, value - 1)
                    }
                  : item
              );
            }
            return updated;
          });
        }}
        style={styles.circleBtn}
      >
        <Ionicons name="remove" size={16} color="white" />
      </TouchableOpacity>

      {/* VALUE */}
      <Text style={{
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
        minWidth: 20,
        textAlign: "center"
      }}>
          {`${r.selectedServings ?? r.servings ?? 1}/${r.servings || 1}`}
      </Text>

      {/* PLUS */}
      <TouchableOpacity
        onPress={()=>{
          setSelectedDiet(prev => {
            const updated = { ...prev };
            for (let key in updated) {
              updated[key] = updated[key].map(item =>
                item._id === r._id
                  ? {
                      ...item,
                      selectedServings: value + 1
                    }
                  : item
              );
            }
            return updated;
          });
        }}
        style={styles.circleBtn}
      >
        <Ionicons name="add" size={16} color="white" />
      </TouchableOpacity>

    </View>
  );
};
//////////////////////////////////////////////////////////////////////////////////////////////




const MacroCircle = ({ value, goal, label, color }) => {

  //const size = 90;
  //const strokeWidth = 8;
  const size = isMobile ? 70 : 90;
 const strokeWidth = isMobile ? 6 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percent = goal ? value / goal : 0;
  const progress = Math.min(percent, 1);

  const strokeDashoffset =
    circumference - circumference * progress;

  return (
  <View style={{ 
  alignItems: "center",
  flex:1,
  marginHorizontal: isMobile ? 5 : 10
}}>
      <Svg width={size} height={size}>

        {/* background */}
        <Circle
          stroke="rgba(255,255,255,0.2)"
          fill="none"
          cx={size/2}
          cy={size/2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* progress */}
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

      {/* center text */}
      <View style={{
        position:"absolute",
        top:28,
        alignItems:"center"
      }}>
        <Text style={{
  color:"white",
  fontWeight:"bold",
  fontSize: isMobile ? 15 : 16
}}>
  {Math.round(value)}g
</Text>

        <Text style={{fontSize:10,color:"#7e838d"}}>
          {Math.round(percent * 100)}%
        </Text>
      </View>

      <Text style={{
  color:"white",
  marginTop:5,
  fontSize: isMobile ? 11 : 11
}}>
  {label}
</Text>

      <Text style={{color:"#7e838d",fontSize:11}}>
        / {Math.round(goal)}g
      </Text>

    </View>
  );
};


////////////////////////////////////////////////////
if(simpleMode){

return(





<ScrollView
  contentContainerStyle={{
    padding:20,
    paddingBottom:100
  }}
  showsVerticalScrollIndicator={false}

 onScroll={(event)=>{
  const currentY = event.nativeEvent.contentOffset.y;

  const contentHeight = event.nativeEvent.contentSize.height;
  const layoutHeight = event.nativeEvent.layoutMeasurement.height;

  const isAtBottom = currentY + layoutHeight >= contentHeight - 10;

  if(isAnimatingRef.current){
    setLastScrollY(currentY);
    return;
  }

  // 🔥 FIX حقيقي
  if(isAtBottom){
    setShowBar(false); // ⬅️ خليه مخفي باش الزر يبقى ثابت
    setLastScrollY(currentY);
    return;
  }

  if(currentY <= 0){
    setShowBar(true);
    setLastScrollY(currentY);
    return;
  }

  const diff = currentY - lastScrollY;

  if(diff > THRESHOLD){
    isAnimatingRef.current = true;
    setShowBar(false);

    setTimeout(()=>{ isAnimatingRef.current = false; }, 300);
  }
  else if(diff < -THRESHOLD){
    isAnimatingRef.current = true;
    setShowBar(true);

    setTimeout(()=>{ isAnimatingRef.current = false; }, 300);
  }

  setLastScrollY(currentY);
}}
  scrollEventThrottle={16}
>

<View style={styles.mealsHeader}>

<Text style={styles.sectionTitle}>
My Meals
</Text>

<TouchableOpacity
style={styles.addMealBtn}
onPress={() => setActiveTab("recipes")}
>
<Text style={{color:"white"}}>+ Add Meal</Text>
</TouchableOpacity>

</View>

{/* 🔥 CATEGORY LOOP */}
{["breakfast","lunch","dinner","snack"].map(category => (

<View key={category}>

 <View style={{
  flexDirection: "row",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 10
}}>

  {/* TITLE */}
  <Text style={{
    fontSize: 14,
    fontWeight: "bold",
    color: "#22c55e",
    marginRight: 10
  }}>
    {category.toUpperCase()}
  </Text>

  {/* LINE */}
  <View style={{
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  }} />

</View>

  {/* RECIPES */}
  {(selectedDiet[category] || []).map(r => {

    const factor = (r.selectedServings || 1) / (r.servings || 1);

    const protein = (r.nutrition?.protein || 0) * factor;
    const carbs = (r.nutrition?.carbohydrates || 0) * factor;
    const fat = (r.nutrition?.fat || 0) * factor;

    const total = protein + carbs + fat;

    const proteinPercent = total ? (protein / total) * 100 : 0;
    const carbsPercent = total ? (carbs / total) * 100 : 0;
    const fatPercent = total ? (fat / total) * 100 : 0;

    return (

<View key={r._id} style={styles.mealCard}>

  {/* TOP ROW */}
  <View style={{flexDirection:"row", alignItems:"center"}}>

    <Image
      source={{
        uri: r.image
          ? getImageUrl(r.image)
          : "https://via.placeholder.com/400"
      }}
      style={{
        width:60,
        height:60,
        borderRadius:15,
        marginRight:10
      }}
    />

    <TouchableOpacity
      style={{flex:1}}
      onPress={() => setSelectedItem({ ...r })}
    >
      <Text style={{
        fontWeight:"bold",
        fontSize:16,
        color:"#f3f6fa"//"#0f172a"
      }}>
        {r.name}
      </Text>

      <Text style={{color:"#64748b", marginTop:4}}>
        🔥 {Math.round(
          (r.nutrition?.energyKcal || 0) * factor
        )} kcal • {Math.round(
          (r.price || 0) * factor
        )} DA
      </Text>
    </TouchableOpacity>

    {/* MENU */}
    <TouchableOpacity
      onPress={()=>setOpenActionsId(prev => prev === r._id ? null : r._id)}
      style={{
        backgroundColor:"#fb923c",
        width:40,
        height:40,
        borderRadius:20,
        alignItems:"center",
        justifyContent:"center"
      }}
    >
      <Text style={{color:"white", fontSize:18}}>⋯</Text>
    </TouchableOpacity>

  </View>

  {/* MACROS */}
  <View style={{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:15
  }}>

    {/* PROTEIN */}
    <View style={{flexDirection:"row", alignItems:"center", gap:8}}>
      <View style={{
        width:6,
        height:40,
        backgroundColor:"#e5e7eb",
        borderRadius:3,
        justifyContent:"flex-end"
      }}>
        <View style={{
          height: `${proteinPercent}%`,
          width:6,
          backgroundColor:"#22c55e",
          borderRadius:3
        }}/>
      </View>

      <View>
        <Text style={{fontWeight:"bold",fontSize:20}}>
          {Math.round(protein)} g
        </Text>
        <Text style={{fontSize:12,color:"#64748b"}}>
          Protein
        </Text>
      </View>
    </View>

    {/* CARBS */}
    <View style={{flexDirection:"row", alignItems:"center", gap:8}}>
      <View style={{
        width:6,
        height:40,
        backgroundColor:"#e5e7eb",
        borderRadius:3,
        justifyContent:"flex-end"
      }}>
        <View style={{
          height:`${carbsPercent}%`,
          width:6,
          backgroundColor:"#facc15",
          borderRadius:3
        }}/>
      </View>

      <View>
        <Text style={{fontWeight:"bold",fontSize:20}}>
          {Math.round(carbs)} g
        </Text>
        <Text style={{fontSize:12,color:"#64748b"}}>
          Carbs
        </Text>
      </View>
    </View>

    {/* FAT */}
    <View style={{flexDirection:"row", alignItems:"center", gap:8}}>
      <View style={{
        width:6,
        height:40,
        backgroundColor:"#e5e7eb",
        borderRadius:3,
        justifyContent:"flex-end"
      }}>
        <View style={{
          height:`${fatPercent}%`,
          width:6,
          backgroundColor:"#a78bfa",
          borderRadius:3
        }}/>
      </View>

      <View>
        <Text style={{fontWeight:"bold",fontSize:20}}>
          {Math.round(fat)} g
        </Text>
        <Text style={{fontSize:12,color:"#64748b"}}>
          Fat
        </Text>
      </View>
    </View>

  </View>

  {/* ACTIONS */}
  {openActionsId === r._id && (
    <View style={{
      flexDirection:"row",
      alignItems:"center",
      justifyContent:"space-between",
      marginTop:10,
      backgroundColor:"#e2e8f0",
      padding:10,
      borderRadius:15
    }}>

      {/* SERVINGS CONTROL */}
      <ServingsControl r={r} setSelectedDiet={setSelectedDiet} />

      {/* DELETE */}
      <TouchableOpacity
  onPress={() =>
    setSelectedDiet(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item._id !== r._id)
    }))
  }
  style={{
    position: "absolute",
    top: 8,
    right: 8,

    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",

    width: 28,
    height: 28,
    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center"
  }}
>
  <Ionicons name="close" size={16} color="#ef4444" />
</TouchableOpacity>

    </View>
  )}

</View>

    );

  })}

</View>

))}

</ScrollView>










)

}
//////////////////////////
return (
<>
<PaymentGuard />


<ScrollView
contentContainerStyle={{
  padding:10,
  paddingBottom: 55
}}
onScroll={(event)=>{
  const currentY = event.nativeEvent.contentOffset.y;

  const contentHeight = event.nativeEvent.contentSize.height;
  const layoutHeight = event.nativeEvent.layoutMeasurement.height;

  const isAtBottom = currentY + layoutHeight >= contentHeight - 10;

  if(isAnimatingRef.current){
    setLastScrollY(currentY);
    return;
  }

  // 🔥 FIX حقيقي
  if(isAtBottom){
    setShowBar(false); // ⬅️ خليه مخفي باش الزر يبقى ثابت
    setLastScrollY(currentY);
    return;
  }

  if(currentY <= 0){
    setShowBar(true);
    setLastScrollY(currentY);
    return;
  }

  const diff = currentY - lastScrollY;

  if(diff > THRESHOLD){
    isAnimatingRef.current = true;
    setShowBar(false);

    setTimeout(()=>{ isAnimatingRef.current = false; }, 300);
  }
  else if(diff < -THRESHOLD){
    isAnimatingRef.current = true;
    setShowBar(true);

    setTimeout(()=>{ isAnimatingRef.current = false; }, 300);
  }

  setLastScrollY(currentY);
}}
scrollEventThrottle={16}

showsVerticalScrollIndicator={false}
>

{/* DAILY MACROS CARD */}

<View style={styles.dailyMacroCard}>





<View style={styles.macroHeader}>

<View style={styles.headerLeft}>

<Text style={styles.dailyMacroTitle}>
Daily Macros
</Text>

<View style={styles.goalBadge}>
<Text style={styles.goalText}>
{calorieGoalType?.toUpperCase()}
</Text>
</View>

</View>

<Text style={styles.calorieText}>
{consumedCalories} / {goalCalories} kcal
</Text>

</View>

{/* MACROS */}



<View style={styles.macroCircles}>

  <MacroCircle
    value={totals.protein}
    goal={goalMacros.protein}
    progress={macroProgress.protein}
    label="PROTEIN"
    color="#22c55e"
  />

  <MacroCircle
    value={totals.carbs}
    goal={goalMacros.carbs}
    progress={macroProgress.carbs}
    label="CARBS"
    color="#facc15"
  />

  <MacroCircle
    value={totals.fat}
    goal={goalMacros.fat}
    progress={macroProgress.fat}
    label="FAT"
    color="#a78bfa"
  />

</View>


{/* PROGRESS */}

<View style={styles.progressHeader}>

<Text style={styles.progressText}>
Progress
</Text>

<Text style={styles.progressPercent}>
{Math.round(progress)}%
</Text>

</View>

<View style={styles.progressBar}>

<View
style={{
width:`${progress}%`,
height:8,
backgroundColor:progressColor,
borderRadius:10
}}
/>

</View>







</View>

{/* STATS */}

<View style={styles.statsRow}>

{/* ACTIVITY */}

<View style={styles.statCard}>

<View style={styles.row}>

<View style={styles.iconBox}>
<Activity size={20} color="#84cc16" />
</View>

<View>

<Text style={styles.statTitle}>
Activity
</Text>

<Text style={styles.statValue}>
{tdee?.activityLevel}
</Text>

<Text style={styles.statSub}>
  {displaySteps} steps
</Text>

<Text style={styles.statSub}>
{caloriesBurned} kcal burned
</Text>

</View>

</View>

</View>

{/* WATER */}

{!hideWater && (
<View style={styles.statCard}>

<View style={styles.row}>

<View style={styles.iconBox}>
<Text style={{fontSize:18}}>💧</Text>
</View>

<View>

<Text style={styles.statTitle}>
Water Intake
</Text>

<Text style={styles.statValue}>
{waterGoal} L
</Text>

<Text style={styles.statSub}>
{waterGlasses} glasses
</Text>

</View>

</View>

</View>
)}
{/* COST */}
{!hideBudget && (
<TouchableOpacity
  onPress={() => {
  setNewBudget(budget); 
  setShowBudgetModal(true);
}}
  style={styles.statCard}
>

<View style={styles.row}>

<View style={styles.iconBox}>
<Text style={{fontSize:18}}>💰</Text>
</View>

<View style={{flex:1}}>

<Text style={styles.statTitle}>
Food Cost
</Text>

<Text style={[
  styles.statValue,
  {
    color:
      totals.price > budget
        ? "#ef4444"
        : "#22c55e"
  }
]}>
  {Math.round(totals.price)} DA
</Text>

<Text style={[
  styles.statSub,
  {
    color:
      totals.price > budget
        ? "#ef4444"
        : "#22c55e"
  }
]}>
  Budget: {budget} DA
</Text>

<Text style={styles.statSub}>
  💸 Left: {Math.round(Math.max(budget - totals.price, 0))} DA
</Text>
</View>

</View>

</TouchableOpacity>
)}
</View>

{/* MEALS */}

<View style={{marginTop:25}}>

<View style={styles.mealsHeader}>

<Text style={styles.sectionTitle}>
Today's Meals
</Text>

<View style={{flexDirection:"row",gap:10}}>

{/* NOTIFICATION ICON */}
{!hideNotifications && (
<TouchableOpacity
onPress={async ()=>{

setShowRecommendations(true);

const count = myRecommendations?.length || 0;

setLastSeenCount(count);

await AsyncStorage.setItem(
"lastSeenRecommendations",
String(count)
);

}}
style={{
backgroundColor:"#374151",
padding:10,
borderRadius:10,
position:"relative"
}}
>

<Text style={{fontSize:16}}>🔔</Text>

{unreadCount > 0 && (

<View style={{
position:"absolute",
top:-5,
right:-5,
backgroundColor:"#ef4444",
borderRadius:10,
paddingHorizontal:6,
paddingVertical:2
}}>

<Text style={{
color:"white",
fontSize:10,
fontWeight:"bold"
}}>
{unreadCount}
</Text>

</View>

)}

</TouchableOpacity>
)}

{/* ADD MEAL */}
<TouchableOpacity
style={styles.addMealBtn}
onPress={() => setActiveTab("recipes")}
>
<Text style={{color:"white"}}>+ Add Meal</Text>
</TouchableOpacity>

</View>
</View>

{/* 🔥 CATEGORY LOOP */}
{["breakfast","lunch","dinner","snack"].map(category => (

<View key={category}>

<View style={{
  flexDirection: "row",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 10
}}>

  {/* TITLE */}
  <Text style={{
    fontSize: 14,
    fontWeight: "bold",
    color: "#22c55e",
    marginRight: 10
  }}>
    {category.toUpperCase()}
  </Text>

  {/* LINE */}
  <View style={{
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)"
  }} />

</View>

{(selectedDiet[category] || []).map(r => {

const factor = (r.selectedServings || 1) / (r.servings || 1);

const protein = (r.nutrition?.protein || 0) * factor;
const carbs = (r.nutrition?.carbohydrates || 0) * factor;
const fat = (r.nutrition?.fat || 0) * factor;

const total = protein + carbs + fat;

const proteinPercent = total ? (protein / total) * 100 : 0;
const carbsPercent = total ? (carbs / total) * 100 : 0;
const fatPercent = total ? (fat / total) * 100 : 0;

return (

<View key={r._id} style={[styles.mealCard, { paddingRight: 35 }]}>

<TouchableOpacity
onPress={()=>setOpenActionsId(prev => prev === r._id ? null : r._id)}
style={{
position:"absolute",
top:10,
right:5,
backgroundColor:"#fb923c",
width:30,
height:30,
borderRadius:20,
alignItems:"center",
justifyContent:"center",
zIndex:10
}}
>
<Text style={{color:"white", fontSize:18}}>⋯</Text>
</TouchableOpacity>

<View style={{flexDirection:"row", alignItems:"center"}}>

<Image
source={{
uri: r.image
? getImageUrl(r.image)
: "https://via.placeholder.com/400"
}}
style={{
width:60,
height:60,
borderRadius:15,
marginRight:10
}}
/>

<TouchableOpacity
style={{flex:1}}
onPress={() => setSelectedItem({ ...r })}
>
<Text style={{
fontWeight:"bold",
fontSize:16,
color:"#f3f6fa"//"#0f172a"
}}>
{r.name}
</Text>

<View style={{flexDirection:"row", alignItems:"center", marginTop:4}}>

  {/* kcal + price */}
  <Text style={{color:"#9ce331"}}>
    🔥 {Math.round((r.nutrition?.energyKcal || 0) * factor)} 
    <Text style={{marginHorizontal:6}}> Kcal • </Text>  
    {Math.round((r.price || 0) * factor)} DA •
  </Text>

  {/* 👈 servings */}
  <View style={{
    flexDirection:"row",
    alignItems:"center",
    marginLeft:10   // 🔥 spacing هنا يخدم صح
  }}>
    <Ionicons name="restaurant-outline" size={14} color="#22c55e" />
    <Text style={{color:"#22c55e", fontWeight:"bold", marginLeft:4}}>
      {r.selectedServings || r.servings || 1}
    </Text>
  </View>

</View>
</TouchableOpacity>

</View>

{/* MACROS */}
<View style={{
flexDirection:"row",
justifyContent:"space-between",
marginTop:15
}}>

{/* PROTEIN */}
<View style={{flexDirection:"row", alignItems:"center", gap:8}}>
<View style={{
width:6,
height:40,
backgroundColor:"#e5e7eb",
borderRadius:3,
justifyContent:"flex-end"
}}>
<View style={{
height:`${proteinPercent}%`,
width:6,
backgroundColor:"#22c55e",
borderRadius:3
}}/>
</View>

<View>
<Text style={{fontWeight:"bold",fontSize:16,color:"#9ce331"}}>
{Math.round(protein)} g
</Text>
<Text style={{fontSize:12,color:"#64748b"}}>
Protein
</Text>
</View>
</View>

{/* CARBS */}
<View style={{flexDirection:"row", alignItems:"center", gap:8}}>
<View style={{
width:6,
height:40,
backgroundColor:"#e5e7eb",
borderRadius:3,
justifyContent:"flex-end"
}}>
<View style={{
height:`${carbsPercent}%`,
width:6,
backgroundColor:"#facc15",
borderRadius:3
}}/>
</View>

<View>
<Text style={{fontWeight:"bold",fontSize:16,color:"#9ce331"}}>
{Math.round(carbs)} g
</Text>
<Text style={{fontSize:12,color:"#64748b"}}>
Carbs
</Text>
</View>
</View>

{/* FAT */}
<View style={{flexDirection:"row", alignItems:"center", gap:8}}>
<View style={{
width:6,
height:40,
backgroundColor:"#e5e7eb",
borderRadius:3,
justifyContent:"flex-end"
}}>
<View style={{
height:`${fatPercent}%`,
width:6,
backgroundColor:"#a78bfa",
borderRadius:3
}}/>
</View>

<View>
<Text style={{fontWeight:"bold",fontSize:16,color:"#9ce331"}}>
{Math.round(fat)} g
</Text>
<Text style={{fontSize:12,color:"#64748b"}}>
Fat
</Text>
</View>
</View>

</View>

{/* ACTIONS */}
{openActionsId === r._id && (
<View style={{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
marginTop:10,
backgroundColor:"#273548",
padding:10,
borderRadius:15
}}>

<ServingsControl r={r} setSelectedDiet={setSelectedDiet} />

<TouchableOpacity
  onPress={() =>
    setSelectedDiet(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item._id !== r._id)
    }))
  }
  style={{
    marginLeft: 10, 

    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",

    width: 28,
    height: 28,
    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center"
  }}
>
  <Ionicons name="close" size={16} color="#ef4444" />
</TouchableOpacity>

</View>
)}

</View>

);

})}

</View>

))}

</View>



<TouchableOpacity
style={{
backgroundColor:"#22c55e",
padding:14,
borderRadius:12,
marginTop:25,
alignItems:"center"
}}
onPress={saveDietHistory}
>

<Text style={{color:"white",fontWeight:"bold"}}>
Save Diet To History
</Text>

</TouchableOpacity>


</ScrollView>



{!hideBudget && (
<Modal
  visible={showBudgetModal}
  transparent
  animationType="fade"
>
<View style={{
  flex:1,
  backgroundColor:"rgba(0,0,0,0.6)",
  justifyContent:"center",
  alignItems:"center"
}}>

  <View style={{
    width:"80%",
    backgroundColor:"#1f2937",
    padding:20,
    borderRadius:20
  }}>

    <Text style={{
      color:"#22c55e",
      fontSize:16,
      fontWeight:"bold",
      marginBottom:15
    }}>
      Set Budget
    </Text>

    <TextInput
      value={String(newBudget)}
      onChangeText={(v)=>setNewBudget(Number(v))}
      keyboardType="numeric"
      placeholder="Enter budget"
      placeholderTextColor="#6b7280"
      style={{
        backgroundColor:"#111827",
        color:"white",
        padding:12,
        borderRadius:12,
        marginBottom:15
      }}
    />

    <TouchableOpacity
      onPress={async () => {
        await apiRequest("users/profile","PUT",{
          dailyBudget: newBudget
        });

        setTdee(prev => ({
          ...prev,
          dailyBudget: newBudget
        }));

        setShowBudgetModal(false);
      }}
      style={{
        backgroundColor:"#22c55e",
        padding:12,
        borderRadius:12,
        alignItems:"center"
      }}
    >
      <Text style={{color:"white",fontWeight:"bold"}}>
        Save
      </Text>
    </TouchableOpacity>

  </View>

</View>
</Modal>
)}










{!hideNotifications && (
<Modal
visible={showRecommendations}
animationType="slide"
transparent
>

<View style={{
flex:1,
backgroundColor:"rgba(0,0,0,0.6)",
justifyContent:"center",
alignItems:"center"
}}>

<View style={{
width:"85%",
maxHeight:"80%",
backgroundColor:"#1f2937",
padding:20,
borderRadius:20
}}>

<View style={{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:15
}}>

  {/* TITLE */}
  <Text style={{
    color:"#22c55e",
    fontSize:18,
    fontWeight:"bold"
  }}>
    My Recommendations
  </Text>

  {/* 🔥 TOGGLE BUTTON */}
  <TouchableOpacity
  onPress={() => {

    setSelectedDiet(prev => {

      const updated = { ...prev };

      if (allAdded) {
        // ❌ REMOVE ALL
        for (let key in updated) {
          updated[key] = updated[key].filter(r =>
            !myRecommendations.some(item => item.recipe?._id === r._id)
          );
        }
      } else {
        // ✅ ADD ALL
        myRecommendations.forEach(item => {
          if (!item?.recipe) return;

          const exists = getAllMeals(updated)
            .some(r => r._id === item.recipe._id);

          if (!exists) {
            const category = item.mealType || "lunch";

            updated[category] = [
              ...(updated[category] || []),
              {
                ...item.recipe,
                selectedServings: item.servings || 1,
                price: item.recipe.price || calculatePrice(item.recipe)
              }
            ];
          }
        });
      }

      return updated;
    });

  }}

  style={{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor: allAdded ? "#22c55e" : "#1e293b",
    borderWidth:1,
    borderColor:"rgba(255,255,255,0.08)",
    paddingHorizontal:10,
    paddingVertical:6,
    borderRadius:10
  }}
>

  {/* 🔥 ICON */}
  <Ionicons 
    name={allAdded ? "checkmark" : "add"} 
    size={16} 
    color={allAdded ? "white" : "#22c55e"} 
  />

  {/* TEXT */}
  <Text style={{
    marginLeft:5,
    fontWeight:"bold",
    color: allAdded ? "white" : "#22c55e"
  }}>
    {allAdded ? "Added" : "Add All"}
  </Text>

</TouchableOpacity>

</View>

{myRecommendations?.length === 0 ? (

<Text style={{color:"white"}}>
No recommendations
</Text>

) : (

<FlatList
data={myRecommendations || []}
keyExtractor={(item)=>item._id}

renderItem={({ item }) => {

if(!item?.recipe) return null;
//const isSelected = selectedDiet?.some(r => r._id === item.recipe._id);
const isSelected = getAllMeals(selectedDiet)
  .some(r => r._id === item.recipe._id);

return (

<View style={{position:"relative"}}>



<TouchableOpacity
  activeOpacity={0.9}
  onPress={() => setSelectedItem(item.recipe)}
>
  <View style={{
  backgroundColor:"#1f2a3a",
  borderRadius:20,
  padding:16,
  
  marginBottom:15,

  borderWidth:1,
  borderColor:"rgba(255,255,255,0.08)",

  shadowColor:"#000",
  shadowOpacity:0.3,
  shadowRadius:12,
  shadowOffset:{ width:0, height:6 },
  elevation:6
}}>

<View style={{
  flexDirection: "row",
  alignItems: "center"
}}>

<Image
  source={{
  uri: item.recipe.image
    ? getImageUrl(item.recipe.image)
    : "https://via.placeholder.com/100"
}}
  style={{
    width: 65,
    height: 65,
    borderRadius: 20,
    marginRight: 15
  }}
/>

<View style={{ flex: 1 }}>
  <Text style={{ fontWeight: "bold", color:"white" }}>
    {item.recipe.name}
  </Text>

  <View style={{flexDirection:"row", alignItems:"center"}}>
  
  <Text style={{ color: "#94a3b8" }}>
    🔥 {Math.round(item.recipe.nutrition.energyKcal)} kcal
  </Text>

  <Text style={{ color: "#64748b" }}> • </Text>

  <View style={{flexDirection:"row", alignItems:"center"}}>
    <Ionicons name="restaurant" size={14} color="#22c55e" />
    <Text style={{
      color:"#22c55e",
      marginLeft:4,
      fontWeight:"bold"
    }}>
      {item.servings}
    </Text>
  </View>


</View>

</View>



</View>

<TouchableOpacity
  


onPress={() => {

  setSelectedDiet(prev => {

   const exists = getAllMeals(prev)
  .some(r => r._id === item.recipe._id);

    const updated = { ...prev };

    // 🔥 remove from all
    for (let key in updated) {
      updated[key] = updated[key].filter(
        r => r._id !== item.recipe._id
      );
    }

    // 🔥 إذا ماكانش موجود → نضيفه
    if (!exists) {
      const category = item.mealType || "lunch";

      updated[category] = [
        ...(updated[category] || []),
        {
          ...item.recipe,
          selectedServings: item.servings || 1,
          price: item.recipe.price || calculatePrice(item.recipe)
        }
      ];
    }

    return updated;
  });

}}






    
  style={{
    marginTop: 15,
    backgroundColor: isSelected ? "#22c55e" : "#111827",
    padding: 10,
    borderRadius: 12,
    alignItems: "center"
  }}
>
  <Text style={{ color: "white" }}>
    {isSelected ? "Added" : "Add Meal"}
  </Text>
</TouchableOpacity>


  </View>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>deleteRecommendation(item._id)}
style={{
  position:"absolute",
  top:10,
  right:10,

  backgroundColor:"rgba(239,68,68,0.15)", // transparent red
  borderWidth:1,
  borderColor:"rgba(239,68,68,0.3)",

  padding:6,
  borderRadius:12,

  backdropFilter:"blur(10px)" // web only (optional)
}}
>
<Ionicons name="close" size={16} color="#ef4444" />
</TouchableOpacity>

</View>

);
}}

numColumns={isMobile ? 1 : 2}

  columnWrapperStyle={
    !isMobile
      ? { justifyContent:"center", gap:20 }
      : undefined
  }
contentContainerStyle={{
paddingBottom:40
}}
/>

)}

<TouchableOpacity
style={{
backgroundColor:"#ef4444",
padding:10,
borderRadius:10,
marginTop:15,
alignItems:"center"
}}
onPress={()=>setShowRecommendations(false)}
>

<Text style={{color:"white"}}>
Close
</Text>

</TouchableOpacity>

</View>

</View>

</Modal>
)}





</>
);
}

const styles = StyleSheet.create({



dailyMacroCard:{
  backgroundColor:"#a3e635",
  padding: isMobile ? 15 : 25,
  borderRadius:25,
  width:"100%",

 
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.2)",

  
  shadowColor:"#000",
  shadowOpacity:0.15,
  shadowRadius:20,
  shadowOffset:{ width:0, height:10 },

  elevation:10
},

macroHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

headerLeft:{
  flexDirection:"column",
  alignItems:"flex-start", // 👈 بدل center
  gap:6
},

dailyMacroTitle:{
  color:"white",
  fontSize:18,
  fontWeight:"bold",
  letterSpacing:0.5 // 👈 subtle modern touch
},



goalBadge:{
  backgroundColor:"rgba(0,0,0,0.2)",
  paddingHorizontal:10,
  paddingVertical:4,
  borderRadius:10
},

goalText:{
color:"white",
fontSize:12,
fontWeight:"bold"
},

calorieText:{
color:"white",
fontWeight:"600"
},


macroCircles:{
  flexDirection:"row",
  justifyContent:"space-around", // 👈 الحل
  alignItems:"center",
  marginTop:20
},
macroCircle:{
width:90,
height:90,
borderRadius:45,
backgroundColor:"rgba(255,255,255,0.2)",
alignItems:"center",
justifyContent:"center"
},

circleValue:{
fontSize:22,
fontWeight:"bold",
color:"white"
},

circleLabel:{
fontSize:11,
color:"white",
marginTop:5
},

progressHeader:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:25
},

progressBar:{
  backgroundColor:"rgba(255,255,255,0.2)",
  height:8,
  borderRadius:10,
  marginTop:8,
  width:"100%",
  overflow:"hidden"
},

progressText:{
  color:"white"
},

progressPercent:{
  color:"white",
  fontWeight:"bold"
},

statsRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  marginTop:20
},



statCard:{
  backgroundColor:"#273d5d",
  padding:18,
  borderRadius:18,

  width: isMobile ? "48%" : "32%",
  flexShrink: 1,
  overflow:"hidden",

  // ✨ EDGE
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.08)",

  // 🔥 SHADOW (clean)
  shadowColor:"#000",
  shadowOpacity:0.2,
  shadowRadius:12,
  shadowOffset:{ width:0, height:6 },

  elevation:6
},
row:{
flexDirection:"row",
alignItems:"flex-start"
},

iconBox:{
backgroundColor:"#374151",
width:38,
height:38,
borderRadius:19,
alignItems:"center",
justifyContent:"center",
marginRight:12
},

statTitle:{
color:"#9ca3af",
fontSize:13
},

statValue:{
  color:"white",
  fontSize:14,        // 🔥 صغّر شوية
  fontWeight:"bold",
  flexWrap:"wrap"     // 🔥 مهم
},

statSub:{
color:"#9ca3af",
fontSize:11,
flexWrap:"wrap"
},

mealsHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

sectionTitle:{
fontSize:20,
fontWeight:"700",
color:"#23c61a"
},

addMealBtn:{
backgroundColor:"#23c61a",
padding:10,
borderRadius:10
},

/*mealCard:{
  backgroundColor:"#1e293b",//"#f3f6fa",
  padding:15,
  borderRadius:20,
  marginTop:12,
   borderColor:"#334155",
//////////
  shadowColor:"#000",
  shadowOpacity:0.2,
  shadowRadius:10,
  ////////////////////////
  flexDirection:"column"
},*/
mealCard:{
  backgroundColor:"#1f2a3a",
  padding:15,
  borderRadius:20,
  marginTop:12,

  borderWidth:1,
  borderColor:"rgba(255,255,255,0.08)",

  shadowColor:"#000",
  shadowOpacity:0.3,
  shadowRadius:12,
  shadowOffset:{ width:0, height:6 },
  elevation:6,

  flexDirection:"column"
},

mealImage:{
width:70,
height:70,
borderRadius:12,
marginRight:12
},

mealName:{
color:"white",
fontWeight:"bold"
},

mealCalories:{
color:"#9ca3af",
fontSize:12
},

mealPrice:{
color:"#23c61a",
fontSize:13,
fontWeight:"bold"
},

removeText:{
marginLeft:8,
fontWeight:"bold",
color:"#ef4444",
fontSize:16
},
circleBtn:{
  backgroundColor:"#22c55e",
  width:28,
  height:28,
  borderRadius:14,
  alignItems:"center",
  justifyContent:"center",

  shadowColor:"#22c55e",
  shadowOpacity:0.5,
  shadowRadius:6,
  elevation:4
}

});