import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from "react-native";

import { BASE_URL } from "../../services/api";

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
  servings,
  isPlusPlan
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

  return (
    <View style={{ position:"relative" }}>

      <View style={styles.card}>

        {/* TOP BORDER LIGHT */}
        <View style={styles.topGlow} />

        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.92}
          style={styles.touchArea}
        >

          {/* IMAGE */}
          <Image
            source={{
              uri: recipe.image
                ? getImageUrl(recipe.image)
                : "https://via.placeholder.com/400"
            }}
            style={styles.image}
          />

          {/* CONTENT */}
          <View style={styles.content}>

            {/* TITLE */}
            <Text
              numberOfLines={1}
              style={styles.title}
            >
              {recipe.name}
            </Text>

            {/* META ROW */}
            {/* META ROW */}
<View style={styles.infoRow}>


  {/* KCAL 
  <View style={styles.inlineMeta}>
    <Ionicons
      name="flame-outline"
      size={14}
      color="#cd6d14"
    />
    <Text style={styles.infoText}>
      {Math.round(recipe.nutrition?.energyKcal || 0)} kcal  • 
    </Text>
  </View> */}


  {/* PRICE */}
  {!hidePrice && (
    <View style={styles.inlineMeta}>
      <Ionicons
        name="cash-outline"
        size={14}
        color="#4ade80"
      />
      <Text style={styles.infoText}>
        {Math.round(recipe.price || 0)} DA  • 
      </Text>
    </View>
  )}


  {/* SERVINGS */}
  {isPlusPlan && (
  <View style={styles.inlineMeta}>
    <Ionicons
      name="restaurant-outline"
      size={14}
      color="#cbd5e1"
    />
    <Text style={styles.infoText}>
      {recipe.servings || 1} srv
    </Text>
  </View>)}

  {/* TIME */}
  <View style={styles.inlineMeta}>
    <Ionicons
      name="time-outline"
      size={14}
      color="#547eb9"
    />
    <Text style={styles.infoText}>
      {recipe.preparation_time || 0} min
    </Text>
  </View>





</View>

          </View>

          {/* KCAL BOX */}
          <View style={styles.kcalBox}>
            <Text style={styles.kcalNumber}>
              {Math.round(recipe.nutrition?.energyKcal || 0)}
            </Text>
            <Text style={styles.kcalLabel}>
              kcal
            </Text>
          </View>

        </TouchableOpacity>

        {/* ADD BUTTON
        {!isPatientView && (addToDiet || onToggle) && !showAddButton && (
          <TouchableOpacity
            onPress={()=>{
              if(onToggle) return onToggle(recipe);
              if(addToDiet) return addToDiet(recipe);
            }}
            style={{
              backgroundColor: isAdded ? "#16a34a" : "#22c55e",
              padding:10,
              borderRadius:12,
              marginHorizontal:100,
              marginBottom:12,
              alignItems:"center"
            }}
          >
            <Text style={{color:"white",fontWeight:"bold"}}>
              {isAdded ? "✓ Added" : "+ Add Meal"}
            </Text>
          </TouchableOpacity>
        )}

        {/* SIMPLE ADD BUTTON */}
        {showAddButton && (
          <TouchableOpacity
            onPress={()=>{
              onAdd && onAdd();
            }}
            style={{
              backgroundColor: isAddedCustom ? "#16a34a" : "#22c55e",
              padding:10,
              borderRadius:12,
              marginHorizontal:12,
              marginBottom:12,
              alignItems:"center"
            }}
          >
            <Text style={{color:"white",fontWeight:"bold"}}>
              {isAdded ? "✓ Added" : "+ Add Meal"}
            </Text>
          </TouchableOpacity>
        )}

        {/* PATIENT MODE */}
        {isPatientView && (
          <TouchableOpacity
            onPress={()=>{
              removeFromPatient && removeFromPatient(recipe._id);
            }}
            style={{
              backgroundColor:"#ef4444",
              padding:10,
              borderRadius:12,
              marginHorizontal:12,
              marginBottom:12,
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
  );
}

const styles = StyleSheet.create({

  card:{
    width:"100%",
    backgroundColor:"#1f2a3a",
    margin:3,
    borderRadius:20,
    overflow:"hidden",

    borderWidth:1,
    borderColor:"rgba(255,255,255,0.06)",

    shadowColor:"#000",
    shadowOpacity:0.35,
    shadowRadius:12,
    shadowOffset:{ width:0, height:6 },
    elevation:6
  },

  topGlow:{
    position:"absolute",
    top:0,
    left:0,
    right:0,
    height:1,
    backgroundColor:"rgba(255,255,255,0.1)",
    zIndex:10
  },

  touchArea:{
    flexDirection:"row",
    alignItems:"center",
    padding:10
  },

  image:{
    width:85,
    height:85,
    borderRadius:15,
    resizeMode:"cover"
  },

  content:{
    flex:1,
    marginLeft:14,
    justifyContent:"center"
  },

  title:{
    fontSize:15,
    fontWeight:"700",
    color:"#FFFFFF",
    marginBottom:10
  },

  infoRow:{
    flexDirection:"row",
    alignItems:"center",
    flexWrap:"wrap"
  },

  inlineMeta:{
    flexDirection:"row",
    alignItems:"center",
    marginRight:5
  },

  infoText:{
    color:"#94a3b8",
    fontSize:12,
    marginLeft:4,
    fontWeight:"500"
  },
   

  kcalBox:{
    backgroundColor:"rgba(133, 184, 152, 0.12)",
    borderRadius:18,
    paddingVertical:12,
    paddingHorizontal:14,
    alignItems:"center",
    justifyContent:"center",
    minWidth:50,
    marginLeft:10,

    borderWidth:1,
   // borderColor:"rgba(34,197,94,0.18)"
   borderColor:"rgba(108, 135, 118, 0.18)"
  },

  kcalNumber:{
    color:"#4ade80",
    fontSize:15,
    fontWeight:"800",
    lineHeight:20
  },

  kcalLabel:{
    color:"#86efac",
    fontSize:10,
    fontWeight:"600"
  }

});