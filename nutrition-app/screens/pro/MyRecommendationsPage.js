


 import React, { useState } from "react"; 
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
//import RecipeCard from "../../components/pro/RecipeCard";
import { useWindowDimensions } from "react-native";
import { Image } from "react-native";

export default function MyRecommendationsPage({
  myRecommendations,
  deleteRecommendation,
  setSelectedItem,
  addToDiet,
  removeFromPatient,
  selectedDiet,
  setSelectedDiet
}) {
const { width } = useWindowDimensions();

const numCols = width < 768 ? 1 : 2;
const [page,setPage] = useState(1);
const limit = 6;

const totalPages = Math.ceil(myRecommendations.length / limit);

const startIndex = (page - 1) * limit;
const currentData = myRecommendations.slice(startIndex,startIndex + limit);

return (

<View style={{flex:1,padding:20}}>

<Text style={{
fontSize:20,
fontWeight:"bold",
marginBottom:15,
color:"#69dc21"
}}>
My Recommendations
</Text>

{myRecommendations.length === 0 ? (

<Text style={{color:"white"}}>
No recommendations yet.
</Text>

) : (

<>

<FlatList
data={currentData}
keyExtractor={(item)=>item._id}

renderItem={({ item }) => {

  const isSelected = selectedDiet?.some(r => r._id === item.recipe._id);

  return (
    <View style={{
      backgroundColor: "#e5e7eb",
      borderRadius: 30,
      padding: 16,
      marginBottom: 15,
      position: "relative"
    }}>

      {/* TOP ROW */}
      <View style={{
        flexDirection: "row",
        alignItems: "center"
      }}>

        {/* IMAGE */}
        <Image
          source={{
  uri: item.recipe.image
    ? getImageUrl(item.recipe.image)
    : "https://via.placeholder.com/100"
}}
          style={{
            width: 65,
            height: 65,
            borderRadius: 20,
            marginRight: 15
          }}
        />

        {/* TEXT */}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 17,
            fontWeight: "bold",
            color: "#111827"
          }}>
            {item.recipe.name}
          </Text>

          <Text style={{
            marginTop: 5,
            color: "#6b7280",
            fontSize: 14
          }}>
           🔥 {item.recipe.calories} kcal • 🍽 {item.servings} servings
          </Text>
        </View>

        {/* ORANGE BUTTON */}
        <TouchableOpacity
          onPress={() => deleteRecommendation(item._id)}
          style={{
            width: 45,
            height: 45,
            borderRadius: 25,
            backgroundColor: "#fb923c",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="white" />
        </TouchableOpacity>

      </View>

      {/* ADD BUTTON (بدل macros) */}
      <TouchableOpacity
        onPress={() => {
          if (isSelected) {
            setSelectedDiet(prev =>
              prev.filter(r => r._id !== item.recipe._id)
            );
          } else {
            setSelectedDiet(prev => [...prev, item.recipe]);
          }
        }}
        style={{
          marginTop: 15,
          backgroundColor: isSelected ? "#22c55e" : "#111827",
          paddingVertical: 10,
          borderRadius: 12,
          alignItems: "center"
        }}
      >
        <Text style={{
          color: "white",
          fontWeight: "bold"
        }}>
          {isSelected ? "Added" : "Add Meal"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}}
 numColumns={numCols}

  columnWrapperStyle={
    numCols > 1
      ? { justifyContent:"center", gap:20 }
      : undefined
  }


contentContainerStyle={{
paddingBottom:40
}}

showsVerticalScrollIndicator={false}
/>

{/* PAGINATION */}

<View style={{
flexDirection:"row",
justifyContent:"space-between",
marginTop:15
}}>

<TouchableOpacity
disabled={page === 1}
onPress={()=>setPage(page - 1)}
>

<Text style={{color:"#22c55e",fontWeight:"bold"}}>
Prev
</Text>

</TouchableOpacity>

<Text style={{color:"white"}}>
{page} / {totalPages}
</Text>

<TouchableOpacity
disabled={page === totalPages}
onPress={()=>setPage(page + 1)}
>

<Text style={{color:"#22c55e",fontWeight:"bold"}}>
Next
</Text>

</TouchableOpacity>

</View>

</>

)}

</View>

);

}