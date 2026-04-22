//import React, { useEffect, useState } from "react";
import React, { useEffect, useState, useRef } from "react";
import {
View,
FlatList,
TextInput,
StyleSheet,
TouchableOpacity,
Text
} from "react-native";

import RecipeCard from "../../components/pro/RecipeCard";
import { apiRequest } from "../../services/api";
import PaymentGuard from "../../components/pro/PaymentGuard";
import { useWindowDimensions ,Animated} from "react-native";


export default function RecipesPage({ addToDiet,
                                      setSelectedItem ,
                                      hidePrice,
                                      selectedDiet,
                                      setSelectedDiet,
                                      selectedPatient,
                                      selectedMealType,
                                       setShowBar,
                                       showBar 
                                       }) {

const opacityAnim = useRef(new Animated.Value(1)).current;
const scaleAnim = useRef(new Animated.Value(1)).current;
const listTranslateY = useRef(new Animated.Value(0)).current;
 const translateY = useRef(new Animated.Value(0)).current;
const [lastScrollY,setLastScrollY] = useState(0);


  const THRESHOLD = 20;
  const isAnimatingRef = useRef(false);

const [loadingMore,setLoadingMore] = useState(false);
const [refreshing,setRefreshing] = useState(false);

//const [mealType, setMealType] = useState("");
const [filterMealType, setFilterMealType] = useState("breakfast");
const { width } = useWindowDimensions();
const [recipes, setRecipes] = useState([]);

const [search, setSearch] = useState("");

const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const [showFilters, setShowFilters] = useState(false);

const [proteinMin, setProteinMin] = useState("");
const [proteinMax, setProteinMax] = useState("");
const [carbMin, setCarbMin] = useState("");
const [carbMax, setCarbMax] = useState("");
const [fatMin, setFatMin] = useState("");
const [fatMax, setFatMax] = useState("");
const loadingRef = useRef(false);
////////////////////////////////////////////////////
/*const onRefresh = () => {
  setRefreshing(true);
  setPage(1);
};*/
const onRefresh = () => {
  setRefreshing(true);

  if (page === 1) {
    fetchRecipes().then(() => setRefreshing(false));
  } else {
    setPage(1);
  }
};
//////////////////////

/////////
const fetchRecipes = async () => {

  // منع duplicate calls
  if (loadingRef.current) return;
  loadingRef.current = true;
setLoadingMore(true);
  try {
   // setLoadingMore(true);

    let query = `recipes?page=${page}&limit=6`;

    // search + filters
    if (search) query += `&search=${search}`;
    if (filterMealType) query += `&mealType=${filterMealType}`;
    if (proteinMin) query += `&proteinMin=${proteinMin}`;
    if (proteinMax) query += `&proteinMax=${proteinMax}`;
    if (carbMin) query += `&carbMin=${carbMin}`;
    if (carbMax) query += `&carbMax=${carbMax}`;
    if (fatMin) query += `&fatMin=${fatMin}`;
    if (fatMax) query += `&fatMax=${fatMax}`;

    const data = await apiRequest(query, "GET");

    // Instagram logic (replace or append)
    if (page === 1) {
      setRecipes(data.recipes || []);
    } else {
      setRecipes(prev => [...prev, ...(data.recipes || [])]);
    }

    // pagination info
    setTotalPages(data.totalPages || 1);

  } catch (error) {
    console.log("Fetch recipes error:", error);
  }
  loadingRef.current = false;
  setLoadingMore(false);
};

////////////////////////////////////////////////////
/*useEffect(() => {
  Animated.timing(translateY, {
    toValue: showBar ? 0 : -120,
    duration: 400,
    useNativeDriver: true
  }).start();
  
}, [showBar]);*/



/*useEffect(() => {
  Animated.parallel([
    Animated.timing(translateY, {
      toValue: showBar ? 0 : -120,
      duration: 300,
      useNativeDriver: true
    }),
    Animated.timing(listTranslateY, {
      toValue: showBar ? 0 : -120, // 🔥 نفس القيمة
      duration: 300,
      useNativeDriver: true
    })
  ]).start();
}, [showBar]);*/

useEffect(() => {
  Animated.parallel([
    Animated.timing(translateY, {
      toValue: showBar ? 0 : -120,
      duration: 350,
      useNativeDriver: true
    }),

    Animated.timing(opacityAnim, {
      toValue: showBar ? 1 : 0,
      duration: 250,
      useNativeDriver: true
    }),

    Animated.timing(scaleAnim, {
      toValue: showBar ? 1 : 0.95,
      duration: 300,
      useNativeDriver: true
    })
  ]).start();
}, [showBar]);
///////////////////////////////
useEffect(() => {

  const load = async () => {
    await fetchRecipes();
    setRefreshing(false);
  };

  load();

}, [
  search,
  page,
  proteinMin,
  proteinMax,
  carbMin,
  carbMax,
  fatMin,
  fatMax,
  filterMealType
]);

////////////////////////////////////////////////////

return (

<View style={{ flex: 1 }}>
<PaymentGuard />
{/* SEARCH */}

<Animated.View
  pointerEvents={showBar ? "auto" : "none"}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#1e293b",
    transform: [{ translateY }],
    //opacity: showBar ? 1 : 0,
    opacity: opacityAnim,
transform: [
  { translateY },
  { scale: scaleAnim }
],
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 15
  }}
>

<View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>

<TextInput
placeholder="Search recipe..." 
value={search}
onChangeText={(t) => {
setPage(1);
setSearch(t);
}}
style={styles.input}
/>

<TouchableOpacity
style={styles.filterBtn}
onPress={() => setShowFilters(!showFilters)}
>
<Text style={{ color: "white" }}>Filter</Text>
</TouchableOpacity>

</View>
<View style={styles.mealFilterContainer}>
  {["breakfast","lunch","dinner","snack"].map(type => (
    <TouchableOpacity
      key={type}
      style={[
        styles.mealBtn,
       
         filterMealType === type && styles.mealBtnActive
      ]}
    
    onPress={() => {
  setPage(1);
  setFilterMealType(type); 
}}
    >

      <Text style={styles.mealText}>{type}</Text>
    </TouchableOpacity>
  ))}
</View>

{/* FILTER  PANEL */}

{showFilters && (

<View style={styles.filterContainer}>

  {/* Protein */}
  <View style={styles.filterRow}>
    <View style={styles.filterHalf}>
      <Text style={styles.label}>Protein Min:</Text>
      <TextInput
        value={proteinMin}
       // onChangeText={setProteinMin}
       onChangeText={(t)=>{
        setPage(1);
          setProteinMin(t);
            }}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>

    <View style={styles.filterHalf}>
      <Text style={styles.label}>Protein Max:</Text>
      <TextInput
        value={proteinMax}
        onChangeText={(t)=>{
  setPage(1);
  setProteinMax(t);
}}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>
  </View>

  {/* Carb */}
  <View style={styles.filterRow}>
    <View style={styles.filterHalf}>
      <Text style={styles.label}>Carb Min:</Text>
      <TextInput
        value={carbMin}
       // onChangeText={setCarbMin}
       onChangeText={(t)=>{
  setPage(1);
  setCarbMin(t);
}}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>

    <View style={styles.filterHalf}>
      <Text style={styles.label}>Carb Max:</Text>
      <TextInput
        value={carbMax}
       
        onChangeText={(t)=>{
  setPage(1);
  setCarbMax(t);
}}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>
  </View>

  {/* Fat */}
  <View style={styles.filterRow}>
    <View style={styles.filterHalf}>
      <Text style={styles.label}>Fat Min:</Text>
      <TextInput
        value={fatMin}
        //onChangeText={setFatMin}
        onChangeText={(t)=>{
  setPage(1);
  setFatMin(t);
}}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>

    <View style={styles.filterHalf}>
      <Text style={styles.label}>Fat Max:</Text>
      <TextInput
        value={fatMax}
        //onChangeText={setFatMax}
        onChangeText={(t)=>{
  setPage(1);
  setFatMax(t);
}}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>
  </View>

</View>

)}
</Animated.View>






{/* RECIPES LIST */}


  


<FlatList
data={recipes}
keyExtractor={(item) => item._id}
showsVerticalScrollIndicator={false}

renderItem={({ item }) => (
<View style={{ marginBottom: 10 }}>
<RecipeCard
  recipe={item}
  onPress={() => setSelectedItem(item)}

  addToDiet={async (recipe) => {

  const exists = Object.values(selectedDiet || {})
    .flat()
    .some(r => r._id === recipe._id);

  if (exists) {

    // ❌ REMOVE UI
    setSelectedDiet(prev => {
      const updated = { ...prev };

      for (let key in updated) {
        updated[key] = updated[key].filter(
          r => r._id !== recipe._id
        );
      }

      return updated;
    });

    try {
      await apiRequest("recommendations/remove", "POST", {
        patientId: selectedPatient?._id,
        recipeId: recipe._id
      });
    } catch (e) {
      console.log(e);
    }

  } else {

    // ✅ ADD UI
    setSelectedDiet(prev => ({
      ...prev,
      [filterMealType]: [
        ...(prev[filterMealType] || []),
        {
          ...recipe,
          selectedServings: recipe.servings || 1
        }
      ]
    }));

    try {
      await apiRequest("users/diet/add", "POST", {
        patientId: selectedPatient?._id,
        recipeId: recipe._id,
        mealType: filterMealType,
        servings: 1
      });
    } catch (e) {
      console.log(e);
    }
  }
}}
  hidePrice={hidePrice}
  selectedDiet={selectedDiet}
  setSelectedDiet={setSelectedDiet}
  recommendations={[]}

  
/>
</View>
)}

numColumns={width < 768 ? 1 : width < 1100 ? 2 : 3}

columnWrapperStyle={
  width >= 768
    ? {
        justifyContent: "space-between",
        marginBottom: 12
      }
    : null
}

contentContainerStyle={{
  padding: width < 768 ? 20 : 30,
  //paddingTop: showBar ? 10 : 0
  paddingTop: 121
}}





///////////////////////////////
onEndReached={()=>{
  //if(!loadingMore && page < totalPages){
  if(!loadingRef.current && page < totalPages){
    setPage(prev => prev + 1);
  }
}}
onEndReachedThreshold={0.5}

refreshing={refreshing}
onRefresh={onRefresh}

ListFooterComponent={
  loadingMore ? (
    <Text style={{textAlign:"center", padding:10}}>
      Loading...
    </Text>
  ) : null
}




onScroll={(event)=>{
  const currentY = event.nativeEvent.contentOffset.y;

  if(isAnimatingRef.current){
    setLastScrollY(currentY); // 🔥 مهم
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

    setTimeout(()=>{
      isAnimatingRef.current = false;
    }, 300);
  }
  else if(diff < -THRESHOLD){
    isAnimatingRef.current = true;
    setShowBar(true);

    setTimeout(()=>{
      isAnimatingRef.current = false;
    }, 300);
  }

  // 🔥 هذا هو FIX الرئيسي
  setLastScrollY(currentY);
}}
scrollEventThrottle={16}






/>

{/* PAGINATION */}


</View>

);

}



const styles = StyleSheet.create({

searchContainer:{
flexDirection:"row",
padding:20,
gap:10
},

input:{
borderWidth:1,
borderColor:"#334155",
padding:12,
borderRadius:12,
flex:1,
backgroundColor:"#1f2937",
color:"#e2e8f0",
minHeight:40
},

filterBtn:{
backgroundColor:"#10b981",
padding:10,
borderRadius:10
},

filterPanel:{
padding:15,
gap:10
},

pagination:{
flexDirection:"row",
justifyContent:"space-between",
padding:5
},

pageBtn:{
color:"#10b981",
fontWeight:"600"
},

pageText:{
fontWeight:"600",
color:"#10b981",
},

filterContainer:{
  padding:15
},

filterRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  marginBottom:12
},

filterHalf:{
  width:"48%"
},

label:{
  color:"#94a3b8",
  fontSize:12,
  marginBottom:4
},
mealFilterContainer:{
  flexDirection:"row",
  justifyContent:"center",
  gap:10,
  marginBottom:10
},

mealBtn:{
  paddingVertical:8,
  paddingHorizontal:14,
  borderRadius:20,
  borderWidth:1,
  borderColor:"#334155"
},

mealBtnActive:{
  backgroundColor:"#10b981",
  borderColor:"#10b981"
},

mealText:{
  color:"#e2e8f0",
  fontSize:12
}
});