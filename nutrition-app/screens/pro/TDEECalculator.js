import React, { useState } from "react";
import {
View,
Text,
TextInput,
TouchableOpacity,
ScrollView,
StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../../services/api";
import Svg, { Circle } from "react-native-svg";
import { Settings,Flame, Dumbbell, Scale } from "lucide-react-native";


const SmallMacroCircle = ({ label, value, total, color, unit }) => {

  const size = 60;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percent = total ? value / total : 0;
  const progress = Math.min(percent, 1);

  const strokeDashoffset =
    circumference - circumference * progress;

  return (
    <View style={{ alignItems: "center" }}>

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

      <View style={{ position:"absolute", top:18 }}>
        <Text style={{ color:"white", fontSize:12 }}>
           {Math.round(value)}{unit}
        </Text>
      </View>

      <Text style={{ color:"#9ca3af", fontSize:10 }}>
        {label}
      </Text>

    </View>
  );
};
/////////////////////////////////////

const GoalCard = ({
  title,
  calories,
  macros,
  selected,
  onPress,
  color,
  icon
}) => {

  const total = macros.protein + macros.carbs + macros.fat;

  return (
    <View
  style={{
    backgroundColor: selected ? "#0f172a" : "#111827",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,

    borderWidth: selected ? 2 : 1,
    borderColor: selected ? color : "rgba(255,255,255,0.05)",

    shadowColor: color,
    shadowOpacity: selected ? 0.4 : 0,
    shadowRadius: 10,
    elevation: selected ? 6 : 0
  }}
>
    

      {/* HEADER */}
      <View style={{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
      }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
  {icon}
  <Text style={{
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  }}>
    {title}
  </Text>
</View>

        {selected && (
          <Text style={{color:color,fontSize:12}}>
            SELECTED
          </Text>
        )}
      </View>

      {/* CALORIES */}
      <Text style={{
        color:color,
        fontSize:22,
        fontWeight:"bold",
        marginTop:5
      }}>
        {calories} kcal
      </Text>

      {/* MACROS CIRCLES */}
     <View style={{
  flexDirection:"row",
  justifyContent:"space-around",
  marginTop:15
}}>

        <SmallMacroCircle
          label="Protien"
          value={macros.protein}
          total={total}
          color="#3b82f6"
          unit="g"
        />

        <SmallMacroCircle
          label="Carbs"
          value={macros.carbs}
          total={total}
          color="#22c55e"
          unit="g"
        />

        <SmallMacroCircle
          label="Fat "
          value={macros.fat}
          total={total}
          color="#f59e0b"
          unit="g"
        />

      </View>

      {/* BUTTON */}
      <TouchableOpacity
  onPress={onPress}
  disabled={selected}   
  style={{
    marginTop:15,
    backgroundColor: selected ? color : "#1f2937",
    padding:10,
    borderRadius:12,
    alignItems:"center"
  }}
>
  <Text style={{
    color:"white",
    fontWeight:"bold"
  }}>
    {selected ? "Selected" : "Select"}
  </Text>
</TouchableOpacity>
        
      </View>

   
  );
};


/////////////////tdee calculator /////////////////////////////////


/*const StepInput = ({ label, value, setValue, step = 1 }) => {
  return (
    <View style={{ alignItems: "center", marginBottom: 25 }}>

      <Text style={{ color: "#9ca3af", marginBottom: 5 }}>
        {label}
      </Text>

      <TouchableOpacity onPress={() => setValue(value + step)}>
        <Text style={{ fontSize: 22, color: "#8b5cf6" }}>▲</Text>
      </TouchableOpacity>

      <Text style={{
  fontSize: 40,
  color: "white",
  fontWeight: "bold",
  width: 120,              // 🔥 مهم جداً
  textAlign: "center",
       // 🔥 يثبت النص
}}>
  {value % 1 !== 0 ? value.toFixed(1) : value}
</Text>

      <TouchableOpacity onPress={() => setValue(value - step)}>
        <Text style={{ fontSize: 22, color: "#8b5cf6" }}>▼</Text>
      </TouchableOpacity>

    </View>
  );
};*/
const StepInput = ({ label, value, setValue, step = 1 }) => {
  return (
    <View style={{ alignItems: "center", marginBottom: 25 }}>

      <Text style={{ color: "#9ca3af", marginBottom: 5 }}>
        {label}
      </Text>

      {/* 🔼 UP  onPress={() => setValue(Number(value) + step)}*/}
      <TouchableOpacity  onPress={() => setValue((Number(value) || 0) + step)}>
        <Text style={{ fontSize: 22, color: "#8b5cf6" }}>▲</Text>
      </TouchableOpacity>

      {/* 🔥 INPUT */}
      <TextInput
        value={value === "" ? "" : String(value)}
        onChangeText={(text) => {
          if (text === "") {
            setValue("");
            return;
          }

          /*const num = parseFloat(text);
          if (!isNaN(num)) setValue(num);*/
          const num = parseFloat(text);

if (!isNaN(num) && num >= 0) {
  setValue(num);
}



        }}
        keyboardType="numeric"
        style={{
          fontSize: 30,
          color: "white",
          fontWeight: "bold",
          width: 92,
          textAlign: "center",
          backgroundColor: "#0f172a",
          borderRadius: 12,
          paddingVertical: 8
        }}
      />

      {/* 🔽 DOWN onPress={() => setValue(Number(value) - step)} */}
      <TouchableOpacity    
        onPress={() => {
  const newVal = Number(value) - step;
  if (newVal >= 0) setValue(newVal);
}}       >
        <Text style={{ fontSize: 22, color: "#8b5cf6" }}>▼</Text>
      </TouchableOpacity>

    </View>
  );
};
/////////////////////////////////////////////////////


const calculateMacros = (calories, goal) => {
  let proteinPerc, carbsPerc, fatPerc;

  if (goal === "maintenance") {
    proteinPerc = 0.25;
    carbsPerc = 0.5;
    fatPerc = 0.25;
  }

  if (goal === "cutting") {
    proteinPerc = 0.35;
    carbsPerc = 0.4;
    fatPerc = 0.25;
  }

  if (goal === "bulking") {
    proteinPerc = 0.25;
    carbsPerc = 0.55;
    fatPerc = 0.2;
  }

  return {
    protein: Math.round((calories * proteinPerc) / 4),
    carbs: Math.round((calories * carbsPerc) / 4),
    fat: Math.round((calories * fatPerc) / 9),
  };
};

///////////////////////////////////////////////////////
const getGoalData = (goal, result) => {
  if (goal === "cutting") return {
    calories: result.cutting_calories,
    macros: result.cutting_macros
  };

  if (goal === "bulking") return {
    calories: result.bulking_calories,
    macros: result.bulking_macros
  };

  return {
    calories: result.maintenance_calories,
    macros: result.maintenance_macros
  };
};
/////////////////////////////////////////////////////////////


export default function TDEECalculator({

age,setAge,
height,setHeight,
weight,setWeight,
gender,setGender,
activity,setActivity,
disease,setDisease,

tdeeResult,
setTdeeResult,

calorieGoalType,
setCalorieGoalType,
loadProfile,
  selectedGoal,
  setSelectedGoal 
}) {

const [showActivity,setShowActivity]=useState(false);

////////////////////////////////////////////////////////////

const [showCalculator,setShowCalculator] = useState(false);
////////////////////////////////
const handleSelectGoal = async (type) => {
  setSelectedGoal(type);
  setCalorieGoalType(type);

  if(!tdeeResult) return;

  const activityMap = {
    sedentary:"Sedentary",
    light:"Light",
    moderate:"Moderate",
    active:"Active",
    veryactive:"VeryActive"
  };

  const calories =
    type === "cutting"
      ? tdeeResult.cutting_calories
      : type === "bulking"
      ? tdeeResult.bulking_calories
      : tdeeResult.maintenance_calories;
///////////////////////////////////////
const macros =
  type === "cutting"
    ? calculateMacros(tdeeResult.cutting_calories, "cutting")
    : type === "bulking"
    ? calculateMacros(tdeeResult.bulking_calories, "bulking")
    : calculateMacros(tdeeResult.maintenance_calories, "maintenance");
    /////////////////////////////////////////////////////
  try{

    await apiRequest("users/profile","PUT",{
      age,
      height,
      weight,
      gender,
      activityLevel: activityMap[activity],
      chronicDisease: disease,
      goalType: type,
      goalCalories: calories,
      //goalCalories: data.calories,
      macros
    });
     loadProfile && loadProfile();
    console.log("Goal saved ✅");

  }catch(e){
    console.log("Save error",e);
  }
};
///////////////////////////////////////



const calculateTDEE = async () => {

const w = Number(weight);
const h = Number(height);
const a = Number(age);

if(!w || !h || !a) return;

let BMR =
gender === "male"
? (10*w)+(6.25*h)-(5*a)+5
: (10*w)+(6.25*h)-(5*a)-161;




///////////////////
const factors={
sedentary:1.2,
light:1.375,
moderate:1.55,
active:1.725,
veryactive:1.9
};


const TDEE=BMR*(factors[activity]||1.2);





const maintenance = Math.round(TDEE);
const cutting = Math.round(TDEE - 500);
const bulking = Math.round(TDEE + 500);

const result = {
  BMR: Math.round(BMR),
  TDEE: maintenance,

  maintenance_calories: maintenance,
  cutting_calories: cutting,
  bulking_calories: bulking,

  maintenance_macros: calculateMacros(maintenance, "maintenance"),
  cutting_macros: calculateMacros(cutting, "cutting"),
  bulking_macros: calculateMacros(bulking, "bulking"),
};

setTdeeResult(result);
setShowCalculator(false);

////////////////////////////////////////////////
// SAVE DATA TO DATABASE
////////////////////////////////////////////////

try{

const activityMap={
sedentary:"Sedentary",
light:"Light",
moderate:"Moderate",
active:"Active",
veryactive:"VeryActive"
};

//////////////////////////////////


const finalGoal = calorieGoalType || "maintenance";

const data = getGoalData(finalGoal, result);
    /////////////////////////////////////
await apiRequest("users/profile","PUT",{

age,
height,
weight,
gender, 
activityLevel:activityMap[activity],
chronicDisease:disease,
//goalType: calorieGoalType,
goalType: finalGoal,
  goalCalories:
    calorieGoalType === "cutting"
      ? result.cutting_calories
      : calorieGoalType === "bulking"
      ? result.bulking_calories
      : result.maintenance_calories,
macros: data.macros
});

}catch(e){
console.log("Profile update error",e);
}

};
///////////////////////////////////

const activityOptions = [
  { label: "1", value: "sedentary" },
  { label: "2", value: "light" },
  { label: "3", value: "moderate" },
  { label: "4", value: "active" },
  { label: "5", value: "veryactive" }
];
////////////////////////////////////////////////////////////

return(

<ScrollView
style={{flex:1}}
contentContainerStyle={{padding:20,paddingBottom:40}}
showsVerticalScrollIndicator={false}
>

{/* TOGGLE HEADER */}

<TouchableOpacity
  style={styles.iconButton}
  onPress={() => setShowCalculator(!showCalculator)}
>
  <Settings size={20} color="white" />
</TouchableOpacity>


{showCalculator && (

<View style={{
  backgroundColor: "#020617",
  borderRadius: 25,
  padding: 20
}}>

{/* HEADER TEXT */}
<Text style={{
  color: "#9ca3af",
  textAlign: "center",
  marginBottom: 25
}}>
  Calculate your BMI, BMR & TDEE
</Text>

{/* AGE */}
<View style={{
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 25
}}>

  {/* AGE */}
  <StepInput
    label="Age"
    value={age ?? 0}
    setValue={setAge}

  />

  {/* GENDER */}
<View style={{
  flex:1,
  marginLeft: 20,
  alignItems:"center",
  marginTop: -30
}}>

  <Text style={styles.label}>Gender</Text>

  <View style={{
    flexDirection: "row",
    backgroundColor: "#0f172a", // 🔥 dark container
    borderRadius: 20,
    padding: 4,
    //justifyContent: "center"
    justifyContent: "space-between"
  }}>

    {["male", "female"].map(g => {

      const selected = gender === g;

      return (
        <TouchableOpacity
          key={g}
          onPress={() => setGender(g)}
          style={{
            paddingVertical: 11,
            paddingHorizontal: 12, // 🔥 صغير
            borderRadius: 25,
            backgroundColor: selected ? "#1f2937" : "transparent",
            alignItems: "center",
            marginHorizontal: 4 
          }}
        >
          <Text style={{
            color: selected ? "white" : "#9ca3af",
            fontWeight: "600",
            fontSize: 15
          }}>
            {g === "male" ? "Boy" : "Girl"}
          </Text>
        </TouchableOpacity>
      );
    })}

  </View>

</View>
</View>

{/* WEIGHT + HEIGHT */}
<View style={{
  flexDirection: "row",
  justifyContent: "space-between"
}}>

  <StepInput
    label="Weight (kg)"
    value={weight}
    setValue={setWeight}
    step={0.5}
  />

  <StepInput
    label="Height (cm)"
    value={height}
    setValue={setHeight}
    step={0.5}
  />

</View>

{/* ACTIVITY */}
<Text style={styles.label}>Activity Level</Text>


<Text style={{
  color:"#6b7280",
  fontSize:12,
  marginBottom:10
}}>
  1 = no activity • 5 = very active
</Text>
<View style={{
  flexDirection: "row",
  backgroundColor: "#111827",
  borderRadius: 16,
  padding: 6,
  marginBottom: 25,
  alignItems: "center"
}}>

  {/* 🔹 BMR label */}
  <View style={{
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    borderRightWidth: 1,
    borderRightColor: "#1f2937"
  }}>
    <Text style={{
      color: "#8b5cf6",
      fontWeight: "700",
      fontSize: 13
    }}>
      BMR
    </Text>
  </View>

  {/* 🔹 Levels */}
  {activityOptions.map(item => (
    <TouchableOpacity
      key={item.value}
      onPress={() => setActivity(item.value)}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: activity === item.value ? "#8b5cf6" : "transparent",
        alignItems: "center",
        marginHorizontal: 2
      }}
    >
      <Text style={{
        color: activity === item.value ? "white" : "#9ca3af",
        fontWeight: "600"
      }}>
        {item.label}
      </Text>
    </TouchableOpacity>
  ))}

</View>
{/* DISEASE */}
<TextInput
  placeholder="Chronic disease (optional)"
  placeholderTextColor="#6b7280"
  value={disease}
  onChangeText={setDisease}
  style={{
    backgroundColor: "#111827",
    color: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 25
  }}
/>

{/* BUTTON */}
<TouchableOpacity
  style={{
    backgroundColor: "#8b5cf6",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.6,
    shadowRadius: 10
  }}
  onPress={calculateTDEE}
>
  <Text style={{
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }}>
    Calculate
  </Text>
</TouchableOpacity>

</View>
)}

{/* RESULT */}

{tdeeResult &&(

<View style={styles.resultContainer}>

<Text style={[styles.resultTitle,{color:"#8eef44"}]}>
Your Daily Calories
</Text>

<View style={{ marginBottom: 10 }}>
 <View style={{ height: 140 }} />
  {/* 🔥 GRID (خلف) */}
  <View style={{

    paddingHorizontal: 5
  }}>
    <View style={styles.grid}>

<TouchableOpacity
  onPress={() => setCalorieGoalType("cutting")}
  style={[
    styles.smallCard,
    {
      backgroundColor:
        calorieGoalType === "cutting" ? "#111827" : "#000000"
    }
  ]}
  
>
  <Text
  style={[
    styles.cardLabel,
    {
      color:
        calorieGoalType === "cutting"
          ? "white"
          : "#6b7280"
    }
  ]}
>
  Cutting
</Text>
  <Text style={[styles.cardValue,{color:"#ef4444"}]}>
    {tdeeResult.cutting_calories} kcal
  </Text>
</TouchableOpacity>



<TouchableOpacity
   style={[
    styles.smallCard,
    {
     backgroundColor:
      calorieGoalType === "maintenance" ? "#111827" : "#000000"
    }
  ]}
  onPress={() => setCalorieGoalType("maintenance")}
>
  <Text
  style={[
    styles.cardLabel,
    {
      color:
        calorieGoalType === "maintenance"
          ? "white"
          : "#6b7280"
    }
  ]}
>
  Maintenance
</Text>
  <Text style={[styles.cardValue,{color:"#8eef44"}]}>
    {tdeeResult.maintenance_calories} kcal
  </Text>
</TouchableOpacity>


    <TouchableOpacity
   style={[
    styles.smallCard,
    {
     backgroundColor:
  calorieGoalType === "bulking" ? "#111827" : "#000000"
    }
  ]}
  onPress={() => setCalorieGoalType("bulking")}
>
  <Text
  style={[
    styles.cardLabel,
    {
      color:
        calorieGoalType === "bulking"
          ? "white"
          : "#6b7280"
    }
  ]}
>
  Bulking
</Text>
  <Text style={[styles.cardValue,{color:"#10b981"}]}>
    {tdeeResult.bulking_calories} kcal
  </Text>
</TouchableOpacity>

    </View>
  </View>

  {/* 🔥 MAIN CARD (فوق) */}
  <View style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  }}>
    <View style={styles.mainTdeeCard}>

      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
      }}>

        {/* TDEE */}
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={[styles.mainTdeeLabel,{color:"#8eef44"}]}>
            TDEE
          </Text>

          <Text style={styles.mainTdeeValue}>
            {tdeeResult.TDEE}
          </Text>

          <Text style={{color:"#9ca3af", fontSize:12}}>
            kcal
          </Text>
        </View>

        {/* Divider */}
        <View style={{
          width: 1,
          backgroundColor: "#1f2937",
          marginHorizontal: 15
        }}/>

        {/* BMR */}
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={[styles.mainTdeeLabel,{color:"#8eef44"}]}>
            BMR
          </Text>

          <Text style={styles.mainTdeeValue}>
            {tdeeResult.BMR}
          </Text>

          <Text style={{color:"#9ca3af", fontSize:12}}>
            kcal
          </Text>
        </View>

      </View>

    </View>
  </View>

</View>







{/* GOAL */}




<View style={{marginTop:20}}>

<Text style={[styles.goalTitle,{color:"#8eef44"}]}>
  Your Goal
</Text>

{calorieGoalType === "cutting" && (
  <GoalCard
    title="Cutting"
     icon={<Flame size={22} color="#f97316"/>}
    calories={tdeeResult.cutting_calories}
    macros={tdeeResult.cutting_macros}
    selected={selectedGoal === "cutting"}
    onPress={()=>handleSelectGoal("cutting")}
    color="#ef4444"
  />
)}

{calorieGoalType === "maintenance" && (
  <GoalCard
    title="Maintenance"
   icon={<Scale size={22} color="white" />}
    calories={tdeeResult.maintenance_calories}
    macros={tdeeResult.maintenance_macros}
    selected={selectedGoal === "maintenance"}
    onPress={()=>handleSelectGoal("maintenance")}
    color="#8eef44"
  />
)}

{calorieGoalType === "bulking" && (
  <GoalCard
    title="Bulking"
    icon={<Dumbbell size={22} color="white" />}
    calories={tdeeResult.bulking_calories} 
    macros={tdeeResult.bulking_macros}
    selected={selectedGoal === "bulking"}
    onPress={()=>handleSelectGoal("bulking")}
    color="#10b981"
  />
)}

</View>

</View>



)}

</ScrollView>

);

}

////////////////////////////////////////////////////////////

const styles = StyleSheet.create({

input:{
borderWidth:1,
borderColor:"#334155",
padding:12,
borderRadius:12,
marginBottom:10,
backgroundColor:"#1f2937",
color:"#e2e8f0"
},

filterBtn:{
backgroundColor:"#10b981",
padding:10,
borderRadius:10,
alignItems:"center"
},

label:{
fontWeight:"bold",
marginBottom:8,
fontSize:14,
color:"#8eef44"
},

radioContainer:{
marginTop:15

},

radioRow:{
flexDirection:"row",
gap:20

},

radioOption:{
flexDirection:"row",
alignItems:"center"

},

radioCircle:{
width:18,
height:18,
borderRadius:9,
borderWidth:2,
borderColor:"#10b981",
marginRight:6
},

radioSelected:{
backgroundColor:"#10b981"
},

activityButton:{
backgroundColor:"#ffffff",
borderWidth:1,
borderColor:"#ddd",
padding:12,
borderRadius:12,
marginTop:6
},

activityDropdown:{
backgroundColor:"#ffffff",
borderWidth:1,
borderColor:"#ddd",
borderRadius:12,
marginTop:5,
paddingVertical:5
},

activityItem:{
paddingVertical:10,
paddingHorizontal:15
},

calculatorToggle:{
backgroundColor:"#ffffff",
padding:16,
borderRadius:16,
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:15
},

calculatorTitle:{
fontSize:16,
fontWeight:"600",
color:"#111827"
},

resultContainer:{
marginTop:30
},

resultTitle:{
fontSize:20,
fontWeight:"700",
marginBottom:20
},

mainTdeeCard:{
  backgroundColor:"#111827",
  padding:25,
  borderRadius:20,
  alignItems:"center",

  marginBottom:20,   // 🔥 هذا هو الحل

  shadowColor:"#000",
  shadowOpacity:0.4,
  shadowRadius:20,
  elevation:10
},
mainTdeeLabel:{
fontSize:14
},

mainTdeeValue:{
color:"#ffffff",
fontSize:32,
fontWeight:"800",
marginTop:5
},

grid:{
  flexDirection:"row",
  justifyContent:"space-between"
},
smallCard:{
  width:"31%",
  backgroundColor:"#ffffff",
  padding:18,
  borderRadius:16,
  marginBottom:15,
  opacity:0.85,   // 👈 أقوى
  transform:[{ scale:0.96 }] // 👈 يعطي illusion
},

cardLabel:{
fontSize:13,
color:"#6b7280"
},

cardValue:{
fontSize:18,
fontWeight:"700",
marginTop:5,
color:"#111827"
},

goalTitle:{
fontSize:18,
fontWeight:"700",
marginBottom:10
},

goalContainer:{
  flexDirection:"column"
},

goalCard:{
backgroundColor:"#ffffff",
padding:18,
borderRadius:18,
width:"32%",
alignItems:"center"
},

goalSelected:{
backgroundColor:"#111827"
},

goalLabel:{
fontSize:14,
color:"#6b7280"
},

goalValue:{
fontSize:18,
fontWeight:"700",
marginTop:5
},
iconButton:{
  position:"absolute",
  top:10,
  right:10,
  backgroundColor:"#1f2937",
  padding:10,
  borderRadius:12,
  zIndex:20
}

});