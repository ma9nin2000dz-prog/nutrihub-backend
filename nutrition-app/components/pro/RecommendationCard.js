import React from "react";
import { View, Text, TouchableOpacity, StyleSheet,Image  } from "react-native";
import { BASE_URL } from "../../services/api";
//const BASE_URL = "http://localhost:5000";
const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};
export default function RecommendationCard({ rec, onPress, onDelete }) {

  return (
    <View style={styles.card}>

  <TouchableOpacity onPress={onPress}>

    <Image
      source={{
        /*uri: rec.recipe?.image
          ? `${BASE_URL}${rec.recipe.image}`*/
          uri: rec.recipe?.image
            ? getImageUrl(rec.recipe.image)
          : "https://via.placeholder.com/400"
      }}
      style={styles.image}
    />

    <View style={styles.body}>

      <Text style={styles.recipe}>
        {rec.recipe?.name}
      </Text>

      <Text style={styles.expert}>
        From: {rec.expert?.name}
      </Text>

      <Text style={styles.price}>
        {rec.recipe?.price} DA
      </Text>

      {rec.note && (
        <Text style={styles.note}>
          Note: {rec.note}
        </Text>
      )}

    </View>

  </TouchableOpacity>

  <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
    <Text style={styles.deleteText}>Delete</Text>
  </TouchableOpacity>

</View>
  );
}

const styles = StyleSheet.create({

card:{
  backgroundColor:"#243447",
  padding:18,
  borderRadius:16,
  marginBottom:15,
  shadowColor:"#000000",
  shadowOpacity:0.05,
  shadowRadius:10
},
Body:{
  padding:16
},
recipe:{
  fontSize:16,
  fontWeight:"bold",
  color:"#fff",
},
price:{
  fontSize:16,
  fontWeight:"bold",
  color:"#69dc21",
},


expert:{
  color:"#828486",
  marginTop:4
},

note:{
  marginTop:6,
   color:"#828486",
},

deleteBtn:{
  backgroundColor:"#d65454",
  marginTop:10,
  padding:8,
  borderRadius:8,
  alignItems:"center"
},

deleteText:{
  color:"#fff",
  fontWeight:"600"
},
image:{
width:"100%",
height:140,
borderRadius:12,
marginBottom:10
},
card:{
  backgroundColor:"#243447",
  borderRadius:16,
  overflow:"hidden",
  marginBottom:15,
  shadowColor:"#000",
  shadowOpacity:0.05,
  shadowRadius:10
},
image:{
  width:"100%",
  height:150,
  resizeMode:"cover"
},


});