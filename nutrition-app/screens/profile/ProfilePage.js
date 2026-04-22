import React, { useEffect, useState, useContext,useRef,useMemo } from "react";
 
import { BASE_URL } from "../../services/api";
import { useWindowDimensions } from "react-native";
const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};
import { Ruler, Activity, Target, Stethoscope, Camera,Phone, Mail,UserCheck,ArrowRightLeft } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import {
View,
Text,
TextInput,
TouchableOpacity,
ScrollView,
Image,
StyleSheet,
Modal,
Platform, 
Linking ,
 
} from "react-native";
import PaymentGuard from "../../components/pro/PaymentGuard";
import Svg, { Circle } from "react-native-svg";
import TDEECalculator from "../pro/TDEECalculator";
import ChooseExpertPage from "../pro/ChooseExpertPage";
import { Calendar } from "react-native-calendars";
import { LineChart ,PieChart} from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { FlatList } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming
} from "react-native-reanimated";

//////////////////////chart weight 
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



//////////////////////////////////////////////


 const MacroPercent = ({ label, percent, color }) => (

<View style={{ marginBottom: 12 }}>

  {/* TITLE */}
  <Text style={{
    color:"#9ca3af",
    fontSize:14,
    marginBottom:4
  }}>
    {label}
  </Text>

  {/* PERCENT BIG */}
  <Text style={{
    color:"white",
    fontSize:20,
    fontWeight:"bold",
    marginBottom:6
  }}>
    {(percent * 100).toFixed(1)}%
  </Text>

  {/* BAR */}
  <View style={{
    height:4,
    backgroundColor:"#374151",
    borderRadius:6,
    overflow:"hidden"
  }}>
    <View style={{
      width:`${percent*100}%`,
      height:"100%",
      backgroundColor:color,
      borderRadius:6
    }}/>
  </View>

</View>

);

const SmallMacroCircle = ({ label, value, total, color, unit }) => {

  const size = label === "Calories" ? 100 : 70;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  
  const percent = total ? value / total : 0;

// 🔥 مهم: نحمي من Infinity
const safePercent = isFinite(percent) ? percent : 0;

const progress = Math.min(safePercent, 1);

  const strokeDashoffset =
    circumference - circumference * progress;

  return (
    <View style={{ alignItems: "center", margin: 6 }}>

      <Svg width={size} height={size}>
        {/* background */}
        <Circle
          stroke="rgba(255,255,255,0.08)"
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
  top:22,
  alignItems:"center"
}}>
        <Text style={{
  color:"white",
  fontWeight:"bold",
  fontSize:14
}}>
          {Math.round(safePercent * 100)}%
        </Text>
        <Text style={{ color:"#9ca3af", fontSize:10 }}>
          {Math.round(value)}{unit}
        </Text>

              


      </View>

      <Text style={{ color:"#9ca3af", marginTop:5 }}>
        {label}
      </Text>

    </View>
  );
};


const screenWidth = Dimensions.get("window").width;


export default function ProfilePage({
tdeeResult,
setTdeeResult,
calorieGoalType,
setCalorieGoalType,
hideExpert,
  hideBudget,
  showBar,
  setShowBar
}){
  
  const THRESHOLD = 20;
const isAnimatingRef = useRef(false);
  
  const translateY = useSharedValue(0);
const lastScrollY = useRef(0);

  //const [lastScrollY, setLastScrollY] = useState(0);
const [modalVisible, setModalVisible] = useState(false);
const [selectedPoint, setSelectedPoint] = useState(null);
  /////////////////////////////////
  const { width } = useWindowDimensions();
 
 // const styles = createStyles(width); 

const styles = useMemo(() => createStyles(width), [width]);

const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;
/////////////////////////////////////
   const [selectedGoal, setSelectedGoal] = useState(null);
  const [chartWidth, setChartWidth] = useState(0);/////////////////////
  const [image, setImage] = useState(null);
  const getGoalCalories = () => {

    if(!tdeeResult) return 2000;

    if(calorieGoalType === "cutting")
      return tdeeResult.cutting_calories;

    if(calorieGoalType === "bulking")
      return tdeeResult.bulking_calories;

    return tdeeResult.maintenance_calories;
  };
 


const AnimatedCircle = Animated.createAnimatedComponent(Circle);///////////
const progressAnim = useSharedValue(0);
const [showMealsModal, setShowMealsModal] = useState(false);////////////////////////
const { userRole } = useContext(AuthContext);

const [profile,setProfile] = useState(null);
const [editing,setEditing] = useState(false);
const [selectedDay,setSelectedDay] = useState(null);
const [half,setHalf] = useState(1); // 1 = first half, 2 = second half
const [weekOffset,setWeekOffset] = useState(0);
const [weekStart,setWeekStart] = useState(new Date());

const [showChooseExpert,setShowChooseExpert] = useState(false);
const [experts,setExperts] = useState([]);
const [expertSearch,setExpertSearch] = useState("");


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
///////////////////////////
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
////////////////////////////////////////////////////
//// LOAD PROFILE
////////////////////////////////////////////////////

useEffect(()=>{
loadProfile();
},[]);
////////////////new//////////////////////////
useEffect(() => {
  if (profile?.dietHistory?.length > 0) {

    const last = profile.dietHistory[profile.dietHistory.length - 1];

    setSelectedDay(last);

  }
}, [profile]);
///////////////////////////////
const loadProfile = async () => {

  try {

    const data = await apiRequest("users/me", "GET");

    setProfile(data);

    // 🔥 حساب BMR هنا
    const BMR =
      data.gender === "male"
        ? (10 * data.weight) + (6.25 * data.height) - (5 * data.age) + 5
        : (10 * data.weight) + (6.25 * data.height) - (5 * data.age) - 161;

    // 🔥 إعادة بناء TDEE
    if (data.goalCalories && data.macros) {

      const result = {
        BMR: Math.round(BMR),
        TDEE: data.goalCalories,

        maintenance_calories: data.goalCalories,
        cutting_calories: data.goalCalories - 500,
        bulking_calories: data.goalCalories + 500,

        maintenance_macros: data.macros,
        cutting_macros: data.macros,
        bulking_macros: data.macros
      };

      setTdeeResult(result);
    }

    // 🔥 goal selection
    if (data.goalType) {
      setSelectedGoal(data.goalType);
      setCalorieGoalType(data.goalType);
    }

  } catch (e) {
    console.log(e);
  }

};




////////////////////////////////////////////////////////


const handlePickImage = async () => {
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
    const selectedImage = result.assets[0];

    setImage(selectedImage);

    // 🔥 رفع الصورة مباشرة
    uploadImage(selectedImage);
  }
};

/////////////////////image profile/////////////////////



/////////////////////////////////////////////
const uploadImage = async (selectedImage) => {
  try {
    if (!selectedImage) return;

    const formData = new FormData();

    if (Platform.OS === "web") {
      // 🌐 WEB FIX
      const response = await fetch(selectedImage.uri);
      const blob = await response.blob();

      formData.append("photo", blob, `profile_${Date.now()}.jpg`);

    } else {
      // 📱 MOBILE
      formData.append("photo", {
        uri: selectedImage.uri,
        name: `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    }

    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${BASE_URL}users/upload-photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ لا تضيف Content-Type
      },
      body: formData,
    });

    const data = await res.json();

    setProfile(prev => ({
      ...prev,
      photo: data.photo + "?t=" + Date.now()
    }));

  } catch (error) {
    console.log("UPLOAD ERROR:", error);
  }
};


////////////////////////////////////////////////////
//// SAVE PROFILE
////////////////////////////////////////////////////

const saveProfile = async ()=>{

try{

await apiRequest("users/profile","PUT",profile);

setEditing(false);

alert("Profile Updated");

}catch(e){

console.log(e);

}

};

////////////////////////////////////////////////////
//// BMI
////////////////////////////////////////////////////


const calculateBMI = () => {

  const weight = Number(profile?.weight);
  const height = Number(profile?.height);

  if(!weight || !height) return "--";

  const h = height / 100;

  return (weight / (h*h)).toFixed(2);
};

////////////////////////////////////////////////////
//// DAILY MACROS CALCULATION
////////////////////////////////////////////////////



const calculateDayMacros = (recipes)=>{

let totals = {
  calories:0,
  protein:0,
  carbs:0,
  fat:0
};

recipes?.forEach(item => {

  const r = item.recipeId; // ✅
  const servings = item.servings || 1;
  const baseServings = r?.servings || 1;

  const factor = servings / baseServings;

  totals.calories += (r?.nutrition?.energyKcal || 0) * factor;
  totals.protein += (r?.nutrition?.protein || 0) * factor;
  totals.carbs += (r?.nutrition?.carbohydrates || 0) * factor;
  totals.fat += (r?.nutrition?.fat || 0) * factor;

});

return totals;
};
///////////////////////////////////////////////////////
const calculateTotalPrice = (recipes)=>{

let total = 0;

recipes?.forEach(item => {

  const r = item.recipeId;
  const servings = item.servings || 1;
  const factor = servings / (r?.servings || 1);

  //total += (r?.price || 0) * factor;
   total += item.price || 0;

});

return total;

};

////////////////////////////////////////////////////
//// CALENDAR MARKED DAYS
////////////////////////////////////////////////////

const markedDates = {};

profile?.dietHistory?.forEach(d=>{

const date = new Date(d.date).toISOString().split("T")[0];

markedDates[date] = {
marked:true,
dotColor:"#22c55e"
};

});

////////////////////////////////////////////////////

if(!profile) return <Text style={{color:"white"}}>Loading...</Text>;

////////////////////////////////////////////////////

const imageUri = profile?.photo
  ? (profile.photo.startsWith("http")
      ? profile.photo
      : getImageUrl(profile.photo))
     // : `${BASE_URL}${profile.photo}`)
     
  : "https://via.placeholder.com/150";
  ///////////////////////////////////////////

const lastWeights = [...(profile.weightHistory || [])].slice(-7);


///////////////////////////////////////////////////
const generateWeek = (startDate)=>{

const week=[];

for(let i=0;i<7;i++){

const d = new Date(startDate);
d.setDate(startDate.getDate()+i);

week.push(d);

}

return week;

};

const weekDays = generateWeek(weekStart);
/////////////////////////////////////////////////
const nextWeek = ()=>{

const next = new Date(weekStart);
next.setDate(weekStart.getDate()+7);

setWeekStart(next);

};

const prevWeek = ()=>{

const prev = new Date(weekStart);
prev.setDate(weekStart.getDate()-7);

setWeekStart(prev);

};
///////////////////////
const loadExperts = async ()=>{

try{

const data = await apiRequest("users/public-experts","GET");

setExperts(data || []);

}catch(e){

console.log(e);

}

};
///////////////////////////////

const chooseExpert = async (expertId)=>{

try{

await apiRequest("users/choose-expert","PUT",{expertId});

setShowChooseExpert(false);

loadProfile();

}catch(e){

console.log(e);

}

};
//////////////////////////////
let progress = 0;
let calories = 0;
let goal = 0;
let macros = null;

if (selectedDay) {

  macros = calculateDayMacros(selectedDay.recipes);

  calories = Math.round(macros.calories);



  goal = getGoalCalories();

  progress = goal ? (calories / goal) : 0;
}
///////////////////////////////


const lastDays = (profile.dietHistory || [])
  .filter(d => d?.totalCalories !== undefined)
  .slice(-7);

const caloriesData = lastDays.map(d => {
  const val = Number(d?.totalCalories);
  return isFinite(val) ? val : 0;
});

const hasData = caloriesData.some(v => v > 0);


const caloriesLabels = lastDays.map(d =>
  new Date(d.date).toLocaleDateString()
);







return(

<>
<PaymentGuard />
<ScrollView
  style={styles.container}
  contentContainerStyle={{
   
  paddingBottom: 10,
  }}
  showsVerticalScrollIndicator={false}



onScroll={(event)=>{
  const currentY = event.nativeEvent.contentOffset.y;

  const contentHeight = event.nativeEvent.contentSize.height;
  const layoutHeight = event.nativeEvent.layoutMeasurement.height;

  const isAtBottom = currentY + layoutHeight >= contentHeight - 10;

  if(isAnimatingRef.current){
    lastScrollY.current = currentY;
    return;
  }

  
  if(isAtBottom){
    setShowBar(false);
    lastScrollY.current = currentY;
    return;
  }

  if(currentY <= 0){
    setShowBar(true);
    lastScrollY.current = currentY;
    return;
  }

  const diff = currentY - lastScrollY.current;

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

  lastScrollY.current = currentY;
}}
scrollEventThrottle={16}
>



<View style={{
  width: "100%",
  alignItems: "stretch"
}}>
  <View>
   <View style={styles.userCard}>

  
  {isMobile && (
    <View style={styles.topImage}>
      <Image source={{ uri: imageUri }} style={styles.userImageMobile} />

      <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
        <Camera size={16} color="white" />
      </TouchableOpacity>
    </View>
  )}

  
  {!isMobile && (
    <View style={styles.leftSection}>
      <Image source={{ uri: imageUri }} style={styles.userImage} />

      <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
        <Camera size={16} color="white" />
      </TouchableOpacity>
    </View>
  )}

  
{isMobile ? (

  <View style={styles.mobileRow}>

    {/* LEFT */}
    <View style={{flex:1}}>
      <Text style={styles.name}>{profile.name}</Text>

      <Text style={styles.sub}>
        {profile.gender}, {profile.age} years old
      </Text>



{profile.chronicDisease && (
  <View style={styles.diseaseBox}>
    <Stethoscope size={14} color="#f87171" />
    <Text style={styles.diseaseText}>
      {profile.chronicDisease}
    </Text>
  </View>
)}




      <Text style={styles.weightLabel}>Weight</Text>

      <Text style={styles.weight}>
        {profile.weight} <Text style={{fontSize:24}}>kg</Text>
      </Text>
    </View>

 
    <View style={{flex:1}}>

      <View style={styles.statItem}>
        <Ruler size={16} color="#94a3b8" />
        <View>
          <Text style={styles.statLabel}>Height</Text>
          <Text style={styles.statValue}>{profile.height / 100} m</Text>
        </View>
      </View>

      <View style={styles.statItem}>
        <Activity size={16} color="#94a3b8" />
        <View>
          <Text style={styles.statLabel}>BMI</Text>
          <Text style={styles.statValue}>{calculateBMI()}</Text>
        </View>
      </View>

      <View style={styles.statItem}>
        <Target size={16} color="#94a3b8" />
        <View>
          <Text style={styles.statLabel}>Goal</Text>
          <Text style={styles.statValue}>{profile.goalType}</Text>
          <Text style={styles.goalKcal}>{profile.goalCalories} kcal</Text>
        </View>
      </View>
    </View>
  </View>

) : (

  <View style={{flexDirection:"row", width:"100%"}}>
    {/* CENTER */}
    <View style={styles.centerSection}>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.sub}>
        {profile.gender}, {profile.age} years old
      </Text>


             {profile.chronicDisease && (
  <View style={styles.diseaseBox}>
    <Stethoscope size={16} color="#f87171" />
    <Text style={styles.diseaseText}>
      {profile.chronicDisease}
    </Text>
  </View>
)}



      <Text style={styles.weightLabel}>Weight</Text>
      <Text style={styles.weight}>
        {profile.weight} <Text style={{fontSize:30}}>kg</Text>
      </Text>
    </View>

   
    <View style={styles.rightInfo}>
      <View style={styles.statItem}>
        <Ruler size={18} color="#94a3b8" />
        <View>
          <Text style={styles.statLabel}>Height</Text>
          <Text style={styles.statValue}>{profile.height / 100} m</Text>
        </View>
      </View>
      <View style={styles.statItem}>
        <Activity size={18} color="#94a3b8" />
        <View>
          <Text style={styles.statLabel}>BMI</Text>
          <Text style={styles.statValue}>{calculateBMI()}</Text>
        </View>
      </View>
      <View style={styles.statItem}>
        <Target size={18} color="#94a3b8" />
        <View>
          <Text style={styles.statLabel}>Goal</Text>
          <Text style={styles.statValue}>{profile.goalType}</Text>
          <Text style={styles.goalKcal}>{profile.goalCalories} kcal</Text>
        </View>
      </View>
    </View>
  </View>
)}
    </View> {/* userCard */}
  </View>   {/* scale */}
</View>     {/* wrapper */}

{/* PATIENT → EXPERT */}

{!hideExpert && userRole !== "expert" && (


<View style={styles.card}>

<View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>

<Text style={styles.sectionTitle}>
My Expert
</Text>

<TouchableOpacity
  onPress={async ()=>{
    await loadExperts();
    setShowChooseExpert(true);
  }}
  style={{
    backgroundColor:"#1e293b",
    padding:8,
    borderRadius:10
  }}
>
  <UserCheck size={22} color="#22c55e" />

</TouchableOpacity>

</View>




{profile.expert ? (() => {

  const exp = profile.expert;

  /*const imageUri =
    exp.photo && typeof exp.photo === "string"
      ? (exp.photo.startsWith("http")
          ? exp.photo
        : getImageUrl(exp.photo))
      : `https://ui-avatars.com/api/?name=${exp.name}`;*/

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

    <View style={styles.expertCard}>
      {/* LEFT */}
      <View style={{flexDirection:"row", alignItems:"center"}}>
        <View style={styles.expertAvatar}>
  {imageUri ? (
    <Image
      source={{ uri: imageUri }}
      style={styles.expertAvatarImage}
    />
  ) : (
    <Text style={styles.expertAvatarText}>
      {firstLetter}
    </Text>
  )}
</View>

        <View style={{marginLeft:12}}>
          <Text style={styles.expertName}>{exp.name}</Text>

          <Text style={styles.expertEmail}>
            {exp.email}
          </Text>

          <Text style={styles.expertRole}>
            Nutrition Expert
          </Text>



          {!profile.isAccepted && (
  <View style={{
    marginTop:5,
    backgroundColor:"#78350f",
    paddingHorizontal:10,
    paddingVertical:3,
    borderRadius:20,
    alignSelf:"flex-start"
  }}>
    <Text style={{
      color:"#facc15",
      fontSize:11,
      fontWeight:"600"
    }}>
      Waiting for approval ⏳
    </Text>
  </View>
)}
        </View>

      </View>

        <View style={{flexDirection:"row", alignItems:"center", gap:10}}>

  {/* PHONE */}
   <TouchableOpacity
    style={[styles.iconBtn, { opacity: exp.phone ? 1 : 0.4 }]}
    onPress={() => openWhatsApp(exp.phone)}
  >
    <Phone size={16} color="white" />
  </TouchableOpacity>

  {/* EMAIL */}
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={() => openEmail(exp.email)}
  >
    <Mail size={16} color="white" />
  </TouchableOpacity>

  {/* CHANGE */}

</View>





      {/* ACTION */}
     

    </View>

  );

})() : (
  <Text style={{color:"#9ca3af"}}>
    No expert selected
  </Text>
)}


</View>

)}




{/* TDEE CALCULATOR */}

<View style={styles.card}>

<Text style={styles.sectionTitle}>
TDEE Calculator
</Text>

<TDEECalculator
age={profile.age}
setAge={(v)=>setProfile({...profile,age:v})}

height={profile.height}
setHeight={(v)=>setProfile({...profile,height:v})}

weight={profile.weight}
setWeight={(v)=>setProfile({...profile,weight:v})}

gender={profile.gender}
setGender={(v)=>setProfile({...profile,gender:v})}

activity={
  {
    Sedentary:"sedentary",
    Light:"light",
    Moderate:"moderate",
    Active:"active",
    VeryActive:"veryactive"
  }[profile.activityLevel]
}
setActivity={(v)=>setProfile({
  ...profile,
  activityLevel: {
    sedentary:"Sedentary",
    light:"Light",
    moderate:"Moderate",
    active:"Active",
    veryactive:"VeryActive"
  }[v]
})}

disease={profile.chronicDisease}
setDisease={(v)=>setProfile({...profile,chronicDisease:v})}

tdeeResult={tdeeResult}
setTdeeResult={setTdeeResult}

calorieGoalType={calorieGoalType}
setCalorieGoalType={setCalorieGoalType}
loadProfile={loadProfile}
selectedGoal={selectedGoal}
setSelectedGoal={setSelectedGoal}
/>






</View>

{/* EXPERT → LAST PATIENTS 

{userRole === "expert" && profile.patients && (

<View style={styles.card}>

<Text style={styles.sectionTitle}>
Last Patients
</Text>

{profile.patients.slice(0,3).map(p => (

<Text key={p._id} style={styles.value}>
{p.name}
</Text>

))}

</View>

)}  */}

{/* BUTTONS */}



{/* WEIGHT CHART */}

<View
  style={styles.card}
  onLayout={(e) => {
    setChartWidth(e.nativeEvent.layout.width);
  }}
>

<Text style={styles.sectionTitle}>
Weight Progress
</Text>


{chartWidth > 0 && (
<LineChart
data={{
labels: lastWeights.length
  ? lastWeights.map((w, index) => {

      const date = new Date(w.date);
      const isFirst = index === 0;
      const isLast = index === lastWeights.length - 1;

      // 🔥 أول و آخر فقط
      if (isFirst || isLast) {
        return date.toLocaleDateString("en-GB");
      }

      // 🔥 خلي label كل زوج نقاط فقط
      if (index % 2 === 0) {
        return `${date.getDate()}/${date.getMonth()+1}`;
      }

      return ""; 
    })
  : ["No Data"],

datasets:[
{
data: lastWeights.length
? lastWeights.map(w => w.weight)
: [0]
}
]
}}

width={Math.min(chartWidth - 20, width - 40)}
height={220}

chartConfig={{
backgroundColor:"#1e293b",
backgroundGradientFrom:"#1e293b",
backgroundGradientTo:"#1e293b",
decimalPlaces:1,
color:(opacity=1)=>`rgba(34,197,94,${opacity})`,
labelColor:()=>"#ffffff"
}}

bezier
/>
)}
</View>

{/* CALORIES HISTORY */}



{/* DIET HISTORY */}

<View style={styles.card}>

<Text style={styles.sectionTitle}>
Nutrition
</Text>

{/* MONTH */}
<Text style={styles.monthText}>
{weekStart.toLocaleDateString("en-US",{month:"long",year:"numeric"})}
</Text>

{/* WEEK */}
<FlatList
horizontal
scrollEnabled={false}
data={weekDays}
keyExtractor={(item)=>item.toISOString()}
showsHorizontalScrollIndicator={false}

renderItem={({item})=>{

const dateString = item.toISOString().split("T")[0];

const today = new Date().toISOString().split("T")[0];

const isToday =
  item.toISOString().split("T")[0] === today;

const found = profile.dietHistory.find(d=>
new Date(d.date).toISOString().split("T")[0] === dateString
);

const isSelected =
selectedDay &&
new Date(selectedDay.date).toISOString().split("T")[0] === dateString;

return(

<TouchableOpacity
onPress={()=>{
if(found){
setSelectedDay(found);
}
}}

style={[
styles.dayModern,
isSelected && styles.daySelected
]}
>

<Text
style={[
  styles.dayName,
  isToday && {
    color: "#facc15",   // 🔥 لون مختلف
    fontWeight: "bold"
  }
]}
>
  {item.toLocaleDateString("en-US",{weekday:"short"})}
</Text>

<View
style={[
  styles.dayCircleModern,

  found && { backgroundColor: "#22c55e" },

  isToday && {
    borderWidth: 2,
    borderColor: "#facc15" // 🔥 لون مختلف (yellow)
  }

]}
>
<Text style={styles.dayNumber}>
{item.getDate()}
</Text>
</View>

</TouchableOpacity>

);

}}
/>

{/* NAV */}
<View style={styles.weekNav}>

<TouchableOpacity onPress={prevWeek}>
<Text style={styles.navText}>←</Text>
</TouchableOpacity>

<TouchableOpacity onPress={nextWeek}>
<Text style={styles.navText}>→</Text>
</TouchableOpacity>

</View>







<View
  style={{ 
    marginTop: 30,  
    marginBottom: 10 
  }}
  onLayout={(e) => {
    setChartWidth(e.nativeEvent.layout.width);
  }}
>

<Text style={{
  color:"#9ca3af",
  marginBottom:10
}}>
Calories Trend (last 7 days)
</Text>

{chartWidth > 0 && hasData ? (
  <LineChart
    data={{
      labels: lastDays.length
        ? lastDays.map((d, index) => {

            const date = new Date(d.date);
            const isFirst = index === 0;
            const isLast = index === lastDays.length - 1;

            if (isFirst || isLast) {
              return date.toLocaleDateString("en-GB");
            }

            if (index % 2 === 0) {
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }

            return "";
          })
        : ["No Data"],

      datasets: [{ data: caloriesData }]
    }}
    width={chartWidth-10 }
    height={180}
    chartConfig={{
      backgroundColor:"#111827",
      backgroundGradientFrom:"#111827",
      backgroundGradientTo:"#111827",
      decimalPlaces:0,
      color:(opacity=1)=>`rgba(34,197,94,${opacity})`,
      labelColor:()=>"#9ca3af"
    }}
    bezier
    style={{ borderRadius:16 }}
  />
) : (
  <Text style={{
    color:"#9ca3af",
    textAlign:"center",
    marginTop:20
  }}>
    No nutrition data yet 🍽
  </Text>
)}
</View>







{/* SELECTED DAY CARD */}
{selectedDay ? (()=>{

const calories = Math.round(macros.calories);

const goal = getGoalCalories();

const progress = goal
? (calories / goal)
: 0;
///////////////////////////////////////
const totalMacros =
macros.protein + macros.carbs + macros.fat;

const proteinPct = totalMacros ? macros.protein / totalMacros : 0;
const carbsPct = totalMacros ? macros.carbs / totalMacros : 0;
const fatPct = totalMacros ? macros.fat / totalMacros : 0;
////////////////////////////////////////////





const progressColor =
progress > 1
? "#ef4444"
: progress > 0.7
? "#f59e0b"
: "#22c55e";
///////////////////////////////////////////
const size = 220;
const strokeWidth = 14;
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const progressValue = Math.min(progress, 1);
const strokeDashoffset =
  circumference - circumference * progressValue;
/////////////////////////////

  
  /////////
return(
<>

<TouchableOpacity
style={styles.nutritionBox}
onPress={()=>setShowMealsModal(true)}
activeOpacity={0.9}
>


{/* CENTER (NEW SVG) */}
<View style={{ alignItems: "center", justifyContent: "center" }}>

<Svg width={size} height={size}>

  {/* background */}
  <Circle
    stroke="#334155"
    fill="none"
    cx={size / 2}
    cy={size / 2}
    r={radius}
    strokeWidth={strokeWidth}
  />

  {/* progress */}
  <Circle
    stroke={progressColor}
    fill="none"
    cx={size / 2}
    cy={size / 2}
    r={radius}
    strokeWidth={strokeWidth}
    strokeDasharray={circumference}
    strokeDashoffset={strokeDashoffset}
    strokeLinecap="round"
    rotation="-90"
    origin={`${size/2}, ${size/2}`}
  />

</Svg>

{/* TEXT CENTER */}
<View style={{
position:"absolute",
alignItems:"center"
}}>

<Text style={styles.dayLabel}>
  {new Date(selectedDay.date).toLocaleDateString("en-GB")}
</Text>

<Text style={styles.caloriesText}>{calories}</Text>

<Text style={styles.goalText}>{goal} kcal</Text>

<Text style={{color:"#9ca3af",fontSize:12}}>
{Math.round(progress * 100)}%
</Text>

</View>

</View>
{/* MACROS */}
<View style={{ marginLeft:15, flex:0.8 }}>

<MacroPercent
label="Carbs"
percent={carbsPct}
color="#22c55e"
/>

<MacroPercent
label="Protein"
percent={proteinPct}
color="#3b82f6"
/>

<MacroPercent
label="Fat"
percent={fatPct}
color="#f59e0b"
/>

</View>





</TouchableOpacity>


</>
);

})() : (

<Text style={{color:"#9ca3af",marginTop:10}}>
Select a day
</Text>

)}

</View>

{/* EXPERT ANALYTICS 

{userRole === "expert" && (

<View style={styles.card}>

<Text style={styles.sectionTitle}>
Expert Analytics
</Text>

<Text style={styles.value}>
Patients: {profile.patients?.length || 0}
</Text>

<Text style={styles.value}>
Active Patients: {profile.patients?.length || 0}
</Text>

<Text style={styles.value}>
Total Diets Created: {profile.history?.length || 0}
</Text>

</View>

)}*/}

{/* MODAL SHOW MEALS */}

<Modal visible={showMealsModal} transparent animationType="slide">

<View style={styles.modalOverlay}>

<View style={styles.modalCard}>

{selectedDay && (

<ScrollView showsVerticalScrollIndicator={false}>
  <View style={{width:"100%"}}>

<Text style={styles.modalTitle}>
Meals of {new Date(selectedDay.date).toLocaleDateString()}
</Text>
{(() => {

  const macros = calculateDayMacros(selectedDay.recipes);
  const totalPrice = calculateTotalPrice(selectedDay.recipes);

  const totalMacros =
    macros.protein + macros.carbs + macros.fat;

  return (
    <View>
      {/* 🔥 circles */}
     <>
  {/* 🔥 Calories فوق */}
  <View style={{alignItems:"center", marginBottom:25}}>
  <View style={[styles.circleCard, {paddingVertical:20, width:"60%"}]}>
    <SmallMacroCircle
      label="Calories"
      value={macros.calories}
      total={getGoalCalories()}
      color="#ef4444"
      unit=""
    />
  </View>
</View>

  {/* 🔥 3 macros في سطر واحد */}
  <View style={{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    width:"100%"
  }}>

    {/* Protein */}
    <View style={{flex:1, alignItems:"center"}}>
      <View style={styles.circleCard}>
        <SmallMacroCircle
          label="Protein"
          value={macros.protein}
          total={totalMacros}
          color="#3b82f6"
          unit="g"
        />
      </View>
    </View>

    {/* Carbs */}
    <View style={{flex:1, alignItems:"center"}}>
      <View style={styles.circleCard}>
        <SmallMacroCircle
          label="Carbs"
          value={macros.carbs}
          total={totalMacros}
          color="#22c55e"
          unit="g"
        />
      </View>
    </View>

    {/* Fat */}
    <View style={{flex:1, alignItems:"center"}}>
      <View style={styles.circleCard}>
        <SmallMacroCircle
          label="Fat"
          value={macros.fat}
          total={totalMacros}
          color="#f59e0b"
          unit="g"
        />
      </View>
    </View>

  </View>
</>

      {/* 💰 price */}
      <Text style={{
        color:"#6bc522",
        textAlign:"center",
        marginBottom:10,
        fontWeight:"bold"
      }}>
        Total Price: {Math.round(totalPrice)} DA
      </Text>

    </View>
  );

})()}
{selectedDay.recipes?.map(item => {

  const r = item.recipeId;
  const servings = item.servings || 1;
  const factor = servings / (r?.servings || 1);

  return (
    <View key={r?._id} style={styles.mealRow}>

      <Image
        source={{
  
            uri: r?.image
            ? getImageUrl(r.image)
            : "https://via.placeholder.com/400"
        }}
        style={styles.mealImage}
      />

      <View>
        <Text style={{color:"white",fontWeight:"bold"}}>
          {r?.name} ({servings} servings)
        </Text>

        <Text style={{color:"#9ca3af"}}>
          {Math.round(
            (r?.nutrition?.energyKcal || 0) * factor
          )} kcal
        </Text>

        <Text style={{color:"#22c55e"}}>
          {Math.round(item.price || 0)} DA
        </Text>
      </View>

    </View>
  );

})}

<TouchableOpacity
style={styles.closeBtn}

onPress={()=>setShowMealsModal(false)}
>

<Text style={{color:"white"}}>
Close
</Text>

</TouchableOpacity>

  </View>
</ScrollView>

)}

</View>

</View>

</Modal>

</ScrollView>

<Modal visible={showChooseExpert} animationType="slide">

<ChooseExpertPage
experts={experts}
expertSearch={expertSearch}
setExpertSearch={setExpertSearch}
chooseExpert={chooseExpert}
onClose={() => setShowChooseExpert(false)}
 selectedExpertId={profile?.expert?._id} 
/>



</Modal>

</>

);
}
////////////////////////////////////////////////////
//// STYLES
////////////////////////////////////////////////////




//const styles = StyleSheet.create({
const createStyles = (width) => StyleSheet.create({


container:{
  flex:1,
  backgroundColor:"#0f172a",
  paddingHorizontal: width < 768 ? 12 : 30,
  paddingTop:10,
},

//////////////////////////////////////
// HEADER (🔥 modern dark)
//////////////////////////////////////

header:{
alignItems:"center",
marginBottom:25,
backgroundColor:"#1e293b",
padding:22,
borderRadius:22,
shadowColor:"#000",
shadowOpacity:0.4,
shadowRadius:10,
elevation:6
},

avatar:{
width:90,
height:90,
borderRadius:45,
borderWidth:3,
borderColor:"#22c55e"
},



plan:{
color:"#22c55e",
marginTop:4
},

//////////////////////////////////////
// CARD (🔥 premium dark)
//////////////////////////////////////


card:{
  backgroundColor:"#1e293b",

  padding: width < 768 ? 14 : 20,   // 🔥 responsive
  borderRadius:18,
  marginBottom:15,

  width:"100%",
  maxWidth:1000,     // 🔥 مهم للـ web
  alignSelf:"center",

  shadowColor:"#000",
  shadowOpacity:0.25,
  shadowRadius:10,
  elevation:5
},


sectionTitle:{
color:"#22c55e",
fontWeight:"bold",
marginBottom:12,
fontSize:15
},

label:{
color:"#9ca3af"
},

value:{
color:"#f1f5f9",
marginBottom:6
},

//////////////////////////////////////
// INPUT
//////////////////////////////////////

input:{
backgroundColor:"#334155",
color:"#f8fafc",
padding:12,
borderRadius:12,
marginBottom:10
},

//////////////////////////////////////
// BMI
//////////////////////////////////////

bmi:{
color:"#f8fafc",
fontSize:26,
fontWeight:"bold",
textAlign:"center"
},

//////////////////////////////////////
// BUTTONS
//////////////////////////////////////

buttons:{
alignItems:"center",
marginBottom:15
},

editBtn:{
backgroundColor:"#22c55e",
padding:14,
borderRadius:14,
width:"60%",
alignItems:"center"
},

saveBtn:{
backgroundColor:"#3b82f6",
padding:14,
borderRadius:14,
width:"60%",
alignItems:"center"
},

btnText:{
color:"white",
fontWeight:"bold"
},

//////////////////////////////////////
// HISTORY
//////////////////////////////////////

historyRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:6
},

historyDate:{
color:"#cbd5f5"
},

historyCalories:{
color:"#22c55e"
},

historyCard:{
backgroundColor:"#273d5d",
padding:14,
borderRadius:14,
marginBottom:10
},

historyTitle:{
color:"#22c55e",
fontWeight:"bold",
marginBottom:6
},

historyLine:{
color:"#e2e8f0",
fontSize:13
},

//////////////////////////////////////
// CALENDAR DAY
//////////////////////////////////////

dayCard:{
width:60,
height:80,
backgroundColor:"#273d5d",
borderRadius:14,
marginRight:10,
alignItems:"center",
justifyContent:"center"
},

//////////////////////////////////////
// MODAL (🔥 cleaner dark)
//////////////////////////////////////

modalOverlay:{
flex:1,
justifyContent:"center",
alignItems:"center",
backgroundColor:"rgba(0,0,0,0.6)"
},

modalCard:{
width:"85%",
maxHeight:"80%",
backgroundColor:"#1e293b",
padding:20,
borderRadius:20
},

modalTitle:{
color:"#22c55e",
fontSize:18,
fontWeight:"bold",
marginBottom:15
},

mealRow:{
flexDirection:"row",
alignItems:"center",
marginBottom:12
},

mealImage:{
width:60,
height:60,
borderRadius:12,
marginRight:10
},

closeBtn:{
backgroundColor:"#ef4444",
padding:12,
borderRadius:12,
marginTop:15,
alignItems:"center"
},
headerCard:{
alignItems:"center",
backgroundColor:"#1e293b",
padding:25,
borderRadius:25,
marginBottom:20
},

email:{
color:"#9ca3af",
marginTop:4
},

planBadge:{
backgroundColor:"#22c55e",
paddingHorizontal:12,
paddingVertical:4,
borderRadius:10,
marginTop:8
},

planText:{
color:"white",
fontWeight:"bold"
},

//////////////////////////////////////
// STATS
//////////////////////////////////////

statsRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:20
},

statBox:{
flex:1,
backgroundColor:"#1e293b",
marginHorizontal:5,
padding:15,
borderRadius:15,
alignItems:"center"
},

statValue:{
color:"white",
fontSize:18,
fontWeight:"bold"
},

statLabel:{
color:"#9ca3af",
fontSize:12,
marginTop:4
},

//////////////////////////////////////
// BUTTONS
//////////////////////////////////////

buttonsRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:15,
gap:10
},

editBtn:{
flex:1,
backgroundColor:"#22c55e",
padding:14,
borderRadius:14,
alignItems:"center"
},

saveBtn:{
flex:1,
backgroundColor:"#3b82f6",
padding:14,
borderRadius:14,
alignItems:"center"
},






monthText:{
color:"white",
fontSize:16,
textAlign:"center",
marginBottom:10
},

//////////////////////////////////////
// DAYS
//////////////////////////////////////


dayModern:{
  alignItems:"center",
  //width: 50,    
  flex: 1,       // 🔥 عرض ثابت
  marginRight: 0 ,
  paddingHorizontal: 4     // ❌ نحيد الفراغ
},

daySelected:{
transform:[{scale:1.1}]
},

dayName:{
color:"#9ca3af",
fontSize:12
},


dayCircleModern:{
  width:36,
  height:37,
  borderRadius:20,
  backgroundColor:"#273d5d",
  justifyContent:"center",
  alignItems:"center",
  marginTop:6
},

dayNumber:{
color:"white",
fontWeight:"bold",
fontSize:16
},

//////////////////////////////////////
// NAV
//////////////////////////////////////

weekNav:{
flexDirection:"row",
justifyContent:"space-between",
marginVertical:10
},

navText:{
color:"#22c55e",
fontSize:18,
fontWeight:"bold"
},

//////////////////////////////////////
// MAIN BOX
//////////////////////////////////////


nutritionBox:{
  flexDirection: width < 768 ? "column" : "row",
  alignItems:"center",
  justifyContent:"space-between",

  backgroundColor:"#111827",
  padding: width < 768 ? 15 : 20,
  borderRadius:20,
},

//////////////////////////////////////
// CENTER
//////////////////////////////////////

centerCircle:{
width:200,
height:200,
borderRadius:100,
borderWidth:10, // optional يعطي شكل أجمل
borderColor:"#22c55e",
alignItems:"center",
justifyContent:"center"
},

dayLabel:{
color:"#9ca3af",
fontSize:12
},

caloriesText:{
color:"white",
fontSize:32,
fontWeight:"bold"
},

goalText:{
color:"#9ca3af"
},

//////////////////////////////////////
// MACROS
//////////////////////////////////////

macrosColumn:{
gap:12
},

macroText:{
color:"white",
fontSize:15,
fontWeight:"600"
},

circlesContainer:{
    flexDirection: width < 768 ? "column" : "row",
  flexWrap:"wrap",
  justifyContent:"center",
  alignItems:"center",
  gap:12,
  marginBottom:20,
},


circleCard:{
  paddingVertical:10,
  borderRadius:20,
  alignItems:"center",
  justifyContent:"center",
  marginHorizontal:5, // 🔥 spacing بين العناصر

  backgroundColor:"rgba(255,255,255,0.05)",
  borderWidth:1,
  borderColor:"rgba(239,68,68,0.4)",
  

  shadowColor:"#000",
  shadowOpacity:0.25,
  shadowRadius:12,
  elevation:6
},



userName:{
  color:"white",
  fontWeight:"bold",
  fontSize: width < 768 ? 18 : 26
},

weightValue:{
  fontSize: width < 768 ? 28 : 40
},

userSub:{
  color:"#9ca3af",
  fontSize:13,
  marginBottom:12
},

iconBox:{
  backgroundColor:"#f97316",
  padding:10,
  borderRadius:12,
  alignSelf:"flex-start",
  marginBottom:10
},

weightLabel:{
  color:"#9ca3af",
  fontSize:12
},





infoRow:{
  flexDirection:"row",
  alignItems:"center",
  gap:8,
  marginBottom:12
},

infoLabel:{
  color:"#9ca3af",
  fontSize:12
},


infoColumn:{
  marginLeft:20,
  justifyContent:"space-between"
},

infoValue:{
  color:"white",
  fontWeight:"bold",
  fontSize:15   // 🔥 أكبر شوي
},

diseaseText:{
  color:"#fca5a5", // 🔥 أحمر فاتح واضح
  fontSize:12,
  fontWeight:"600"
},


editIcon:{
  position:"absolute",
  bottom:5,
  right:5,
  backgroundColor:"#22c55e",
  padding:6,
  borderRadius:20,

  shadowColor:"#000",
  shadowOpacity:0.4,
  shadowRadius:5,
  elevation:5
},
expertCard:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  backgroundColor:"#0f172a",
  padding:15,
  borderRadius:18,
  marginTop:10
},

expertAvatar:{
  width:55,
  height:55,
  borderRadius:50
},

expertName:{
  color:"white",
  fontSize:15,
  fontWeight:"600"
},

expertEmail:{
  color:"#94a3b8",
  fontSize:11
},

expertRole:{
  color:"#64748b",
  fontSize:12
},

changeBtn:{
  backgroundColor:"#f97316",
  padding:10,
  borderRadius:12
},
iconBtn:{
  backgroundColor:"#1e293b",
  padding:10,
  borderRadius:50
},










weightLabel:{
  color:"#94a3b8",
  fontSize:12
},

leftSection:{
  position:"relative",
  width:160, // 🔥 باش تبقى ثابتة مثل الصورة
  justifyContent:"center",
  alignItems:"center"
},

centerSection:{
  flex: width < 768 ? 1 : 0.6,  // 🔥 كان 1 → نقصناه
  marginLeft: width < 768 ? 0 : 25,
  alignItems: width < 768 ? "center" : "flex-start"
},
statLabel:{
  color:"#94a3b8",
  fontSize:12
},

statValue:{
  color:"white",
  fontWeight:"bold",
  fontSize:16
},

goalKcal:{
  color:"#94a3b8",
  fontSize:12
},





cameraBtn:{
  position:"absolute",
  bottom:6,
  right:6,
  backgroundColor:"#22c55e",
  padding:7,
  borderRadius:20
},




sub:{
  color:"#94a3b8",
  fontSize:14,
  marginTop:4,
  marginBottom:15
},

weightLabel:{
  color:"#94a3b8",
  fontSize:13
},







statLabel:{
  color:"#94a3b8",
  fontSize:13
},

statValue:{
  color:"white",
  fontSize:18,
  fontWeight:"bold"
},

goalKcal:{
  color:"#94a3b8",
  fontSize:12
},















topImage:{
  alignItems:"center",
  marginBottom:20
},

userImageMobile:{
  width:140,
  height:140,
  borderRadius:70 // 🔥 circle
},








userCard:{
  flexDirection: width < 768 ? "column" : "row",
  alignItems:"center",

 backgroundColor:"#1e293b",

  paddingVertical: width < 768 ? 25 : 45,
  paddingHorizontal: width < 768 ? 15 : 30,

  borderRadius:30,
  marginBottom:20,

  //width:"100%",
    width: width < 768 ? "100%" : "95%",
  maxWidth: width < 768 ? "100%" : 1400, // 🔥

  alignSelf:"center",

  shadowColor:"#000",
  shadowOpacity:0.6,
  shadowRadius:25,
  elevation:12
},

imageWrapper:{
  position:"relative"
},

userImage:{
  width:180,
  height:180,
  borderRadius:15
},

cameraBtn:{
  position:"absolute",
  bottom:6,
  right:6,
  backgroundColor:"#22c55e",
  padding:7,
  borderRadius:20
},

centerInfo:{
  flex:1,
  marginLeft:25
},

/*name:{
  color:"white",
  fontSize:36,
  fontWeight:"bold"
},*/
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

sub:{
  color:"#94a3b8",
  fontSize:14,
  marginTop:4,
  marginBottom:15
},

weightLabel:{
  color:"#94a3b8",
  fontSize:13
},





rightInfo:{
  //width:220,
  flex: width < 768 ? undefined : 0.4,
  marginLeft: width < 768 ? 0 : 20,
  marginTop: width < 768 ? 20 : 0,
  justifyContent:"center"
},

statItem:{
  flexDirection:"row",
  alignItems:"center",
  marginBottom:18,
  gap:12
},

statLabel:{
  color:"#94a3b8",
  fontSize:13
},

statValue:{
  color:"white",
  fontSize:18,
  fontWeight:"bold"
},

goalKcal:{
  color:"#94a3b8",
  fontSize:12
},
/////////////////////////////////////
mobileRow:{
  flexDirection:"row",
  width:"100%",
  justifyContent:"space-between",
  marginTop:10,
  
},
diseaseBox:{
  flexDirection:"row",
  alignItems:"center",
  gap:6,
  backgroundColor:"#1f2937",
  paddingHorizontal:10,
  paddingVertical:5,
  borderRadius:10,
  marginTop:5
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

expertAvatar: {
  width: 55,
  height: 55,
  borderRadius: 60,

  backgroundColor: "#22c55e",   // 🔥 مهم
  justifyContent: "center",
  alignItems: "center"
},

expertAvatarImage: {
  width: "100%",
  height: "100%",
  borderRadius: 60
},

expertAvatarText: {
  color: "white",
  fontSize: 18,
  fontWeight: "bold"
},
});