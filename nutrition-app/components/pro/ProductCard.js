
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
function formatNumber(n) {
  return Number.isInteger(n) ? n : n.toFixed(1);
}

function displayQuantity(q, unit) {
  if (unit === "g" && q >= 1000) return formatNumber(q / 1000) + " kg";
  if (unit === "ml" && q >= 1000) return formatNumber(q / 1000) + " L";
  return q + " " + unit;
}

export default function ProductCard({ product, onPress }) {
const format = (num) => Number(num || 0).toFixed(1);
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >

      {/* NAME */}
      <Text style={styles.name}>
        {product.name}
      </Text>

      {/* MACROS */}
     <View style={styles.macros}>

  <View style={styles.macroBox}>
    <Text style={styles.macroValue}>
      {Math.round(product.nutrition?.protein || 0)}g
    </Text>
    <Text style={styles.macroLabel}>🥩 Protein</Text>
  </View>

  <View style={styles.macroBox}>
    <Text style={styles.macroValue}>
      {Math.round(product.nutrition?.carbohydrates || 0)}g
    </Text>
    <Text style={styles.macroLabel}>🍞 Carbs</Text>
  </View>

  <View style={styles.macroBox}>
    <Text style={styles.macroValue}>
      {Math.round(product.nutrition?.fat || 0)}g
    </Text>
    <Text style={styles.macroLabel}>🥑 Fat</Text>
  </View>

</View>
      {/* PRICE */}
    <View style={{
  flexDirection: "row",
 gap: 20,
  alignItems: "center",
  marginTop: 10,
  width: "100%"
}}>

<Text style={styles.price}>
   {product.price || 0} DA
</Text>

<Text style={{ color: "#94a3b8", fontSize: 14,marginTop:10 }}>
  📦 {displayQuantity(product.quantity, product.unit)}
</Text>

</View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

card:{
  backgroundColor:"#1e293b",
  padding:16,
  borderRadius:20,
  marginBottom:15,

  flex:1,            // 🔥 مهم جدا
  marginRight:10,    // spacing grid

  borderWidth:1,
  borderColor:"#334155",

  shadowColor:"#000",
  shadowOpacity:0.2,
  shadowRadius:10,
  elevation:3        // Android shadow
},

name:{
  fontSize:15,
  fontWeight:"bold",
  color:"#e2e8f0"
},

macros:{
  marginTop:10,
  flexDirection:"row",
  justifyContent:"space-between"
},

macro:{
  color:"#94a3b8",
  fontSize:12
},

price:{
  color:"#22c55e",
  marginTop:10,
  fontWeight:"bold",
  fontSize:14
},
macros:{
  flexDirection:"row",
  justifyContent:"space-between",
  marginTop:12
},

macroBox:{
  alignItems:"center"
},

macroValue:{
  color:"white",
  fontSize:16,        // 🔥 كبير
  fontWeight:"bold"
},

macroLabel:{
  color:"#94a3b8",
  fontSize:11,
  marginTop:2
},

});