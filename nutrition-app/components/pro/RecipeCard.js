
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { BASE_URL } from "../../services/api";
//const BASE_URL = "http://localhost:5000";
const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};
export default function RecipeCard({
  recipe,
  onPress,
  addToDiet,
  hidePrice,
  selectedDiet,
  setSelectedDiet,
  removeFromPatient,
  isPatientView,
  showAddButton,
  onAdd,
  recommendations,
  isAddedCustom,
  onToggle,
  servings
}) {


      const getAllMeals = (diet) =>
  Object.values(diet || {}).flat();

const isAdded =
  isAddedCustom !== undefined
    ? isAddedCustom
    : (
        showAddButton
          ? false
          : getAllMeals(selectedDiet).some(
              r => r?._id === recipe?._id
            )
      );


  return(
    <View style={{position:"relative"}}>

      <View style={styles.card}>
<View style={{
  position:"absolute",
  top:0,
  left:0,
  right:0,
  height:1,
  backgroundColor:"rgba(255,255,255,0.1)",
  zIndex:10
}}/>
        {/* 👇 ONLY THIS PART OPENS MODAL */}
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>

          <Image
            source={{
              /*uri: recipe.image
                ? `${BASE_URL}${recipe.image}`*/
                uri: recipe.image
                ? getImageUrl(recipe.image)
                : "https://via.placeholder.com/400"
            }}
            style={styles.image}
          />


              




          <View style={styles.cardBody}>

               

     
            <Text style={styles.title}>{recipe.name}</Text>
            <Text style={{
  color:"#94a3b8",
  fontSize: 12,
  marginBottom: 6
}}>
  Servings: {recipe.servings || 1}
</Text>
            <View style={styles.metaRow}>

              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={16} color="#f97316" />
                <Text style={styles.metaValue}>
                  {Math.round(recipe.nutrition?.energyKcal || 0)}
                </Text>
                <Text style={styles.metaLabel}>kcal</Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#60a5fa" />
                <Text style={styles.metaValue}>
                  {recipe.preparation_time || 0}
                </Text>
                <Text style={styles.metaLabel}>min</Text>
              </View>

              {!hidePrice && (
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={16} color="#22c55e" />
                  <Text style={styles.metaValue}>
                    {Math.round(recipe.price || 0)}
                  </Text>
                  <Text style={styles.metaLabel}>DA</Text>
                </View>
              )}

            </View>

          </View>

        </TouchableOpacity>

        {/* 🔥 ADD BUTTON (OUTSIDE TOUCHABLE) */}
        {!isPatientView && (addToDiet || onToggle) && !showAddButton && (
          <TouchableOpacity

   onPress={()=>{
    if(onToggle) return onToggle(recipe); // 🔥 custom behavior
    if(addToDiet) return addToDiet(recipe); // fallback
  }}
  style={{
    backgroundColor: isAdded ? "#16a34a" : "#22c55e",
    padding:10,
    borderRadius:12,
    margin:10,
    alignItems:"center"
  }}
>
  <Text style={{color:"white",fontWeight:"bold"}}>
    {isAdded ? "✓ Added" : "+ Add Meal"}
  </Text>
</TouchableOpacity>
        )}

        {/* 🔥 SIMPLE ADD BUTTON (IF USED) */}
        {showAddButton && (
          <TouchableOpacity
            onPress={()=>{
              onAdd && onAdd();
            }}
            style={{
              //backgroundColor: isAdded ? "#16a34a" : "#22c55e",
              backgroundColor: isAddedCustom ? "#16a34a" : "#22c55e",
              padding:10,
              borderRadius:12,
              margin:10,
              alignItems:"center"
            }}
          >
            <Text style={{color:"white",fontWeight:"bold"}}>
              {isAdded ? "✓ Added" : "+ Add Meal"}
            </Text>
          </TouchableOpacity>
        )}

        {/* 🔥 PATIENT MODE */}
        {isPatientView && (
          <TouchableOpacity
            onPress={()=>{
              removeFromPatient && removeFromPatient(recipe._id);
            }}
            style={{
              backgroundColor:"#ef4444",
              padding:10,
              borderRadius:12,
              margin:10,
              alignItems:"center"
            }}
          >
            <Text style={{color:"white",fontWeight:"bold"}}>
              Remove Meal
            </Text>
          </TouchableOpacity>
        )}

      </View>

    </View>
  )

}

const styles = StyleSheet.create({

  /*card:{
     flex:1,              // 🔥 مهم جداً
  width:"100%", 
    backgroundColor:"#1e293b",//"#FFFFFF",
    margin:3,
    borderRadius:20,
    overflow:"hidden",
    shadowColor:"#000",
    shadowOpacity:0.3,
    shadowRadius:5,
    elevation:4
  },*/
  card:{
  flex:1,
  width:"100%",

  backgroundColor:"#1f2a3a", // 👈 أفتح شوية
  margin:3,
  borderRadius:20,
  overflow:"hidden",

  // ✅ edge (border soft)
  borderWidth:1,
  borderColor:"rgba(255,255,255,0.08)",

  // ✅ shadow احترافي
  shadowColor:"#000",
  shadowOpacity:0.35,
  shadowRadius:12,
  shadowOffset:{ width:0, height:6 },
  elevation:6
},

  /*image:{
    width:"100%",
    height:200,
    resizeMode:"cover"
  },*/
  image:{
  width:"100%",
  height:200,
  resizeMode:"cover",
  borderTopLeftRadius:20,
  borderTopRightRadius:20
},

  cardBody:{
    padding:5
  },

  title:{
    fontWeight:"600",
    fontSize:14,
    color:"#FFFFFF",//"#0F172A",
    marginBottom:6
  },

  metaRow:{
    flexDirection:"row",
    justifyContent:"space-evenly",
    marginTop:10
  },

 /* metaItem:{
    flexDirection:"column",
    alignItems:"center",
    //backgroundColor:"#273548",//"#f1f5f9"
    backgroundColor:"rgba(255,255,255,0.05)" ,
    paddingVertical:8,
    paddingHorizontal:14,
    borderRadius:12,
    minWidth:70
  },*/
  metaItem:{
  flexDirection:"column",
  alignItems:"center",

  backgroundColor:"rgba(255,255,255,0.04)",
  paddingVertical:8,
  paddingHorizontal:14,
  borderRadius:12,
  minWidth:70,

  borderWidth:1,
  borderColor:"rgba(255,255,255,0.06)"
},


  metaIcon:{
    fontSize:15,
    marginBottom:2
  },

  metaValue:{
    fontSize:15,
    fontWeight:"700",
    color:"#FFFFFF",//"#0f172a"
  },

  metaLabel:{
    fontSize:11,
    color:"#5db03a"//"#64748b"
  },
  metaLabel:{
  fontSize:11,
  color:"#94a3b8" // neutral
}

});

