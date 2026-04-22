import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatCard({ title, value, growth }) {

  const isPositive = growth >= 0;

  return (
    <View style={styles.card}>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.value}>{value}</Text>

      {growth !== undefined && (
        <Text style={[styles.growth, { color: isPositive ? "#16a34a" : "#dc2626" }]}>
          {isPositive ? "↑" : "↓"} {Math.abs(growth)}%
        </Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

 /* card:{
    backgroundColor:"#fff",
    padding:20,
    borderRadius:12,
    //width:180,

flex:1,
minWidth:120,
margin:5,
    shadowColor:"#000",
    shadowOpacity:0.08,
    shadowRadius:10,
  },

  title:{
    fontSize:15,
    color:"#666"
  },

  value:{
    fontSize:28,
    fontWeight:"bold",
    marginTop:8
  },

  growth:{
    marginTop:6,
    fontSize:14,
    fontWeight:"500"
  },*/








  card:{
    backgroundColor:"#fff",
    padding:20,
    borderRadius:15,

    flex:1,
    minWidth:120,
    margin:8,

    // 🔥 iOS shadow
    shadowColor:"#000",
    shadowOffset:{ width:0, height:5 },
    shadowOpacity:0.1,
    shadowRadius:10,

    // 🔥 Android shadow
    elevation:5,
  },

  title:{
    fontSize:14,
    color:"#6b7280",
    fontWeight:"500"
  },

  value:{
    fontSize:26,
    fontWeight:"bold",
    marginTop:8,
    color:"#111827"
  },

  growth:{
    marginTop:6,
    fontSize:13,
    fontWeight:"600"
  }









});