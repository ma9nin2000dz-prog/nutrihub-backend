import React from "react";
import { View, Text, TouchableOpacity,StyleSheet } from "react-native";
import { Trash2 } from "lucide-react-native";
export default function PatientCard({ patient ,onDelete}) {

  return (
    <View style={styles.card}>

      <Text style={styles.name}>
        {patient.name}
      </Text>

      <Text style={styles.email}>
        {patient.email}
      </Text>
            <TouchableOpacity
        style={styles.deleteIcon}
        onPress={onDelete}
      >
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>

      {patient.chronicDisease && (
        <View style={styles.diseaseBox}>

          <Text style={styles.diseaseTitle}>
            Chronic Disease
          </Text>

          <Text style={styles.diseaseText}>
            {patient.chronicDisease}
          </Text>

        </View>
      )}

    </View>

    
  );
}

const styles = StyleSheet.create({

card:{
  backgroundColor:"#ffffff",
  padding:18,
  borderRadius:16,
  margin:10,
  shadowColor:"#000",
  shadowOpacity:0.25,
  shadowRadius:10
},

name:{
  fontSize:16,
  fontWeight:"bold"
},

email:{
  color:"#6b7280",
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

deleteIcon:{
  position:"absolute",
  top:10,
  right:10,
  backgroundColor:"#fee2e2",
  padding:6,
  borderRadius:20
}

});