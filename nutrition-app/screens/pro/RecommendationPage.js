import React, { useState,useEffect } from "react";
import {
View,
Text,
ScrollView,
TouchableOpacity,
TextInput,
StyleSheet,
Modal 
} from "react-native";
import { apiRequest } from "../../services/api";
import RecipeCard from "../../components/pro/RecipeCard";
import { FlatList,Image } from "react-native";
//import { Image } from "react-native";
//const BASE_URL = "http://localhost:5000";
import { runGA } from "../../utils/geneticAlgorithm";


import { BASE_URL } from "../../services/api";
const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};

import { useWindowDimensions } from "react-native";


export default function RecommendationPage({

patients,
recipes,

selectedPatient,
setSelectedPatient,

selectedRecipeForRecommendation,
setSelectedRecipeForRecommendation,

note,
setNote,

sendRecommendation,

patientSearch,
setPatientSearch,

recipeSearch,
setRecipeSearch,

hidePatients = false,
//openRecipeDetails ,
selectedDiet,
mealType,
setMealType,
setSelectedDiet,
setPatients,
}) {

  ///////////////////////////////////////////////
  const { width } = useWindowDimensions();
const numCols = width < 768 ? 1 : 2;

  const [recommendations, setRecommendations] = useState([]);
  useEffect(()=>{
  if(selectedPatient){
    apiRequest(`recommendations/mine?patientId=${selectedPatient._id}`)
      .then(data => setRecommendations(data));
  }
}, [selectedPatient]);
   // const [localRecipe,setLocalRecipe] = useState(null);
const [selectedRecipe,setSelectedRecipe] = useState(null);
const filteredPatients = patients.filter(p =>
p.name?.toLowerCase().includes(patientSearch.toLowerCase())
);

const filteredRecipes = recipes.filter(r => {

  const matchSearch = r.name
    ?.toLowerCase()
    .includes(recipeSearch.toLowerCase());

  const matchCategory = mealType
    ? r.category?.includes(mealType)
    : true;

  return matchSearch && matchCategory;

});
///////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////


return (

<ScrollView style={{ padding:20 }}>


{!hidePatients && (
<>
<Text style={{ fontSize:18, fontWeight:"bold",color:"#3fd819" }}>
Select Patient
</Text>


<TextInput
placeholder="Search patient..."
value={patientSearch}
onChangeText={setPatientSearch}
style={[styles.input,{marginTop:10, marginBottom:15}]}
/>

{filteredPatients.map(p => (

<TouchableOpacity
key={p._id}
onPress={()=>setSelectedPatient(p)}
style={[
styles.card,
selectedPatient?._id === p._id &&
{ borderWidth:2, borderColor:"#10b981" }
]}
>

<Text style={styles.name}>{p.name}</Text>
<Text style={styles.email}>{p.email}</Text>

{p.chronicDisease && (
<View style={styles.diseaseBox}>
<Text style={styles.diseaseTitle}>Chronic Disease</Text>
<Text style={styles.diseaseText}>{p.chronicDisease}</Text>
</View>
)}

</TouchableOpacity>

))}
</>
)}



{/* 🔥 MEAL TYPE SELECTOR */}

<View style={{flexDirection:"row",marginBottom:10,gap:10}}>

{["breakfast","lunch","dinner","snack"].map(type => (

<TouchableOpacity
key={type}
onPress={()=>setMealType(type)}
style={{
padding:8,
backgroundColor: mealType===type ? "#22c55e" : "#334155",
borderRadius:10
}}
>
<Text style={{color:"white"}}>
{type}
</Text>
</TouchableOpacity>

))}

</View>


<Text style={{
color:"white",
marginBottom:5
}}>
Selected: {mealType}
</Text>


<Text style={{ marginTop:25, fontSize:18, fontWeight:"bold",color:"#3fd819" }}>
Select Recipe
</Text>

{/* 🔥 ADD THIS BUTTON */}

<TextInput
placeholder="Search recipe..."
value={recipeSearch}
onChangeText={setRecipeSearch}
style={[styles.input,{marginTop:10, marginBottom:15}]}
/>

<FlatList
data={filteredRecipes}
keyExtractor={(item)=>item._id}

renderItem={({ item }) => (


<RecipeCard
  recipe={item}
  onPress={()=>setSelectedRecipe(item)}

  // ✅ هذا هو المهم
 isAddedCustom={
  recommendations?.some(r => {
    const id =
      typeof r.recipe === "object"
        ? r.recipe._id
        : r.recipe;

    return id === item._id;
   // return id === item._id && r.mealType === mealType;
  })
}

 


onToggle={async (recipe)=>{
  const exists = recommendations?.some(r => {
    const id =
      typeof r.recipe === "object"
        ? r.recipe._id
        : r.recipe;

    //return id === recipe._id;
    return id === item._id && r.mealType === mealType;
  });

  if(exists){

    // 🔥 REMOVE
    await apiRequest("recommendations/remove", "POST", {
      patientId: selectedPatient._id,
      recipeId: recipe._id,
      mealType: mealType
    });

   
             setRecommendations(prev =>
  prev.filter(r => {

    const id =
      typeof r.recipe === "object"
        ? r.recipe._id
        : r.recipe;

    return !(id === recipe._id && r.mealType === mealType);
  })

);



setPatients(prev =>
  prev.map(p => {
    if(p._id !== selectedPatient._id) return p;

    return {
      ...p,
      recommendations: (p.recommendations || []).filter(r => {

        const id =
          typeof r.recipe === "object"
            ? r.recipe._id
            : r.recipe;

        return !(id === recipe._id && r.mealType === mealType);
      })
    };
  })
);

    

  }else{

    // 🔥 ADD (خليه فقط API)
    
     const newRec = await apiRequest("recommendations","POST",{
      patientId: selectedPatient._id,
      recipeId: recipe._id,
      mealType
    });

    setRecommendations(prev => [...prev, newRec]);

    
    setPatients(prev =>
  prev.map(p => {
    if(p._id !== selectedPatient._id) return p;

    return {
      ...p,
      recommendations: [
  ...(p.recommendations || []),
  {
    ...newRec,
    recipe: item   // 🔥 هذا هو الحل
  }
]
    };
  })
);
  }
}}



/>








)}

  numColumns={numCols}

  columnWrapperStyle={
    numCols > 1
      ? { justifyContent:"center", gap:20 }
      : undefined
  }

contentContainerStyle={{
paddingBottom:20,
//alignItems:"center"
}}

showsVerticalScrollIndicator={false}
/>



<Modal visible={!!selectedRecipe} transparent animationType="fade">

<View style={styles.overlay}>

<View style={styles.modal}>

{selectedRecipe && (

<>
{/* 🔥 IMAGE */}
<View style={styles.imageContainer}>
  <Image
    source={{
     /* uri: selectedRecipe.image
        ? `${BASE_URL}${selectedRecipe.image}`*/
        uri: selectedRecipe.image
         ? getImageUrl(selectedRecipe.image)
        : "https://via.placeholder.com/400"
    }}
    style={styles.image}
  />
</View>

{/* 🔥 SCROLL */}
<ScrollView showsVerticalScrollIndicator={false}>

{/* 🔥 TITLE */}
<Text style={styles.title}>
{selectedRecipe.name}
</Text>

{/* 🔥 CATEGORY */}
<Text style={styles.label}>Category :</Text>

<View style={styles.chipsContainer}>
{Array.isArray(selectedRecipe.category) &&
selectedRecipe.category.map(cat => (
<View key={cat} style={styles.chip}>
<Text style={styles.chipText}>{cat}</Text>
</View>
))}
</View>

{/* 🔥 STATS */}
<View style={styles.statsRow}>

<View style={styles.statBox}>
<Text style={styles.statValue}>
{selectedRecipe.servings || 1}
</Text>
<Text style={styles.statLabel}>Servings</Text>
</View>

<View style={styles.statBox}>
<Text style={styles.statValue}>
{Math.round(selectedRecipe.nutrition?.energyKcal || 0)}
</Text>
<Text style={styles.statLabel}>kcal</Text>
</View>

<View style={styles.statBox}>
<Text style={styles.statValue}>
{selectedRecipe.price || 0}
</Text>
<Text style={styles.statLabel}>DA</Text>
</View>

</View>

{/* 🔥 DIFFICULTY */}
<Text style={styles.label}>Difficulty :</Text>

<View style={{
alignSelf:"flex-start",
marginLeft:15,
marginTop:5,
backgroundColor:
  selectedRecipe.difficulty === "easy"
    ? "#22c55e"
    : selectedRecipe.difficulty === "medium"
    ? "#f59e0b"
    : "#ef4444",
paddingHorizontal:12,
paddingVertical:5,
borderRadius:12,
marginBottom:10
}}>
<Text style={{color:"white",fontWeight:"600"}}>
{selectedRecipe.difficulty}
</Text>
</View>

{/* 🔥 INGREDIENTS */}
<Text style={styles.section}>Ingredients</Text>

{selectedRecipe.ingredients?.map((ing,i)=>(
<View key={i} style={styles.ingredientItem}>
<Text style={{color:"white"}}>
• {ing.product?.name}
</Text>
<Text style={{color:"#94a3b8"}}>
{ing.quantity} g
</Text>
</View>
))}

{/* 🔥 NUTRITION GRID */}
<Text style={styles.section}>Nutrition</Text>

<View style={styles.nutritionGrid}>

{Object.entries(selectedRecipe.nutrition || {}).map(([k,v])=>(
<View key={k} style={styles.nutritionCard}>
<Text style={styles.nutritionValue}>
{Number(v || 0).toFixed(1)}
</Text>
<Text style={styles.nutritionLabel}>
{k}
</Text>
</View>
))}

</View>

<View style={{height:20}} />

</ScrollView>

{/* 🔥 CLOSE BUTTON FLOAT */}
<TouchableOpacity
onPress={()=>setSelectedRecipe(null)}
style={styles.closeBtn}
>
<Text style={{color:"white",fontWeight:"bold"}}>
✕
</Text>
</TouchableOpacity>

</>
)}

</View>
</View>
</Modal>













</ScrollView>

);

}

const styles = StyleSheet.create({

input:{
borderWidth:1,
borderColor:"#334155",
padding:12,
borderRadius:12,
backgroundColor:"#1f2937",
color:"#e2e8f0"
},

filterBtn:{
backgroundColor:"#10b981",
padding:10,
borderRadius:10,
alignItems:"center"
},

card:{
backgroundColor:"#243447",
padding:15,
borderRadius:12,
marginBottom:10
},

name:{
fontSize:16,
fontWeight:"bold",
color:"white"
},

email:{
color:"#9ca3af",
marginTop:4
},

diseaseBox:{
marginTop:10,
backgroundColor:"#fee2e2",
padding:10,
borderRadius:10
},

diseaseTitle:{
color:"#b91c1c",
fontWeight:"600"
},

diseaseText:{
color:"#7f1d1d"
},
addBtn:{
position:"absolute",
bottom:10,
right:10,
backgroundColor:"#22c55e",
paddingVertical:6,
paddingHorizontal:12,
borderRadius:10
},








overlay:{
flex:1,
backgroundColor:"rgba(0,0,0,0.7)",
justifyContent:"center",
alignItems:"center"
},

modal:{
  width:"65%",   // 🔥 نقصنا العرض
  maxWidth:700,  // 🔥 limit باش ما يكبرش بزاف في web
  maxHeight:"90%",
  backgroundColor:"#0f172a",
  borderRadius:25,
  overflow:"hidden"
},

image:{
width:"100%",
height:200
},

title:{
fontSize:22,
fontWeight:"bold",
color:"white",
padding:15
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
color:"#38bdf8",
fontWeight:"600"
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
fontSize:18,
fontWeight:"bold"
},

statLabel:{
color:"#94a3b8",
fontSize:12
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
top:10,
right:10,
backgroundColor:"#ef4444",
width:35,
height:35,
borderRadius:20,
justifyContent:"center",
alignItems:"center"
},
label:{
color:"#94a3b8",
fontSize:13,
marginLeft:15,
marginBottom:4
},
imageContainer:{
  width:"100%",
  height:220,
  overflow:"hidden",
  borderTopLeftRadius:25,
  borderTopRightRadius:25,
  backgroundColor:"#000"
},

image:{
  width:"100%",
  height:"100%",
  resizeMode:"cover",
  transform:[{ translateY: 0 }]
}



});
