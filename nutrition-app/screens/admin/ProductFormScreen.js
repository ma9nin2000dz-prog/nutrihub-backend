
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import { apiRequest } from "../../services/api";
function format(n) {
  return Number.isInteger(n) ? n : n.toFixed(1);
}

function displayQuantity(q, unit) {
  if (unit === "g" && q >= 1000) return format(q / 1000) + " kg";
  if (unit === "ml" && q >= 1000) return format(q / 1000) + " L";
  return q + " " + unit;
}
//export default function ProductFormScreen({ route, navigation }) {
export default function ProductFormScreen({ product, onClose, onSaved }) {
 // const product = route.params?.product;

  const [form, setForm] = useState({
    barcode: product?.barcode || "",
    brand: product?.brand || "",
    name: product?.name || "",
    price: product?.price?.toString() || "",


    quantity: product?.quantity?.toString() || "",
     unit: product?.unit || "g",

    energyKcal: product?.nutrition?.energyKcal?.toString() || "",
    carbohydrates: product?.nutrition?.carbohydrates?.toString() || "",
    sugar: product?.nutrition?.sugar?.toString() || "",
    fat: product?.nutrition?.fat?.toString() || "",
    saturatedFat: product?.nutrition?.saturatedFat?.toString() || "",
    protein: product?.nutrition?.protein?.toString() || "",
    fiber: product?.nutrition?.fiber?.toString() || "",
    magnesium: product?.nutrition?.magnesium?.toString() || "",
    calcium: product?.nutrition?.calcium?.toString() || "",
    salt: product?.nutrition?.salt?.toString() || "",
    potassium: product?.nutrition?.potassium?.toString() || "",
    sodium: product?.nutrition?.sodium?.toString() || "",

    nutritionScore: product?.nutrition?.nutritionScore?.toString() || "",
    novaGroup: product?.nutrition?.novaGroup?.toString() || ""
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };



const calculateNutritionScore = () => {

let score = 0;

const protein = Number(form.protein || 0);
const fiber = Number(form.fiber || 0);
const sugar = Number(form.sugar || 0);
const fat = Number(form.fat || 0);
const salt = Number(form.salt || 0);

score += protein * 0.5;
score += fiber * 0.7;

score -= sugar * 0.3;
score -= fat * 0.2;
score -= salt * 2;

return Math.round(score);
};







  const handleSubmit = async () => {
    try {

      if (!form.barcode || !form.brand || !form.name) {
        Alert.alert("Error", "Barcode, Brand and Name are required");
        return;
      }

         if (!form.quantity || Number(form.quantity) <= 0) {
             Alert.alert("Error", "Quantity must be > 0");
          return;
             }



      const payload = {
        barcode: form.barcode,
        brand: form.brand,
        name: form.name,
        price: Number(form.price || 0),


        quantity: Number(form.quantity || 0),
        unit: form.unit,

        nutrition: {
          //energyKcal: Number(form.energyKcal || 0),
          energyKcal: calculateCalories(),
          carbohydrates: Number(form.carbohydrates || 0),
          sugar: Number(form.sugar || 0),
          fat: Number(form.fat || 0),
          saturatedFat: Number(form.saturatedFat || 0),
          protein: Number(form.protein || 0),
          fiber: Number(form.fiber || 0),
          magnesium: Number(form.magnesium || 0),
          calcium: Number(form.calcium || 0),
          salt: Number(form.salt || 0),
          potassium: Number(form.potassium || 0),
          sodium: Number(form.sodium || 0),
          nutritionScore: calculateNutritionScore(),
          novaGroup: Number(form.novaGroup || 0),
        },

       
      };

      if (product) {
        await apiRequest(`products/${product._id}`, "PUT", payload);
      } else {
        await apiRequest("products", "POST", payload);
      }

      Alert.alert("Success", "Product saved successfully");
      //navigation.goBack();
       onSaved();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };


const calculateCalories = () => {

const protein = Number(form.protein || 0)
const carbs = Number(form.carbohydrates || 0)
const fat = Number(form.fat || 0)
const fiber = Number(form.fiber || 0)

const digestibleCarbs = carbs - fiber

const calories =
(protein * 4) +
(digestibleCarbs * 4) +
(fat * 9) +
(fiber * 2)

return Math.round(calories)

}

return (

<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

{/* HEADER */}

<View style={styles.header}>

<Text style={styles.title}>
{product ? "Edit Product" : "Add Product"}
</Text>

<TouchableOpacity
style={styles.closeButton}
onPress={onClose}
>
<Text style={{color:"white"}}>Close</Text>
</TouchableOpacity>

</View>


{/* BASIC INFO */}

<Text style={styles.sectionTitle}>Basic Information</Text>

<TextInput
placeholder="Barcode"
placeholderTextColor="#94a3b8"
value={form.barcode}
onChangeText={(v)=>handleChange("barcode",v)}
style={styles.input}
/>

<TextInput
placeholder="Brand"
placeholderTextColor="#94a3b8"
value={form.brand}
onChangeText={(v)=>handleChange("brand",v)}
style={styles.input}
/>

<TextInput
placeholder="Product Name"
placeholderTextColor="#94a3b8"
value={form.name}
onChangeText={(v)=>handleChange("name",v)}
style={styles.input}
/>

<TextInput
placeholder="Price"
placeholderTextColor="#94a3b8"
value={form.price}
onChangeText={(v)=>handleChange("price",v)}
style={styles.input}
keyboardType="numeric"
/>



<TextInput
  placeholder="Quantity (package size)"
  placeholderTextColor="#94a3b8"
  value={form.quantity}
  onChangeText={(v)=>handleChange("quantity",v)}
  style={styles.input}
  keyboardType="numeric"
/>

<Text style={{ marginBottom: 5, fontWeight: "600" }}>
Unit
</Text>

<View style={{ flexDirection: "row", marginBottom: 10 }}>

{["g", "ml" ].map((u) => (

<TouchableOpacity
  key={u}
  onPress={() => handleChange("unit", u)}
  style={{
    padding: 10,
    borderRadius: 10,
    backgroundColor: form.unit === u ? "#22c55e" : "#e2e8f0"
  }}
>
  <Text style={{
    color: form.unit === u ? "white" : "#0f172a",
    fontWeight: "600"
  }}>
    {u}
  </Text>
</TouchableOpacity>

))}

</View>



{/* NUTRITION */}

<Text style={styles.sectionTitle}>Nutrition (per 100g)</Text>

<View style={styles.grid}>

<TextInput
placeholder="Energy kcal"
placeholderTextColor="#94a3b8"
value={calculateCalories().toString()}
editable={false}
onChangeText={(v)=>handleChange("energyKcal",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Protein"
placeholderTextColor="#94a3b8"
value={form.protein}
onChangeText={(v)=>handleChange("protein",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Carbohydrates"
placeholderTextColor="#94a3b8"
value={form.carbohydrates}
onChangeText={(v)=>handleChange("carbohydrates",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Sugar"
placeholderTextColor="#94a3b8"
value={form.sugar}
onChangeText={(v)=>handleChange("sugar",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Fat"
placeholderTextColor="#94a3b8"
value={form.fat}
onChangeText={(v)=>handleChange("fat",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Saturated Fat"
placeholderTextColor="#94a3b8"
value={form.saturatedFat}
onChangeText={(v)=>handleChange("saturatedFat",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Fiber"
placeholderTextColor="#94a3b8"
value={form.fiber}
onChangeText={(v)=>handleChange("fiber",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Magnesium"
placeholderTextColor="#94a3b8"
value={form.magnesium}
onChangeText={(v)=>handleChange("magnesium",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Calcium"
placeholderTextColor="#94a3b8"
value={form.calcium}
onChangeText={(v)=>handleChange("calcium",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Salt"
placeholderTextColor="#94a3b8"
value={form.salt}
onChangeText={(v)=>handleChange("salt",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Potassium"
placeholderTextColor="#94a3b8"
value={form.potassium}
onChangeText={(v)=>handleChange("potassium",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Sodium"
placeholderTextColor="#94a3b8"
value={form.sodium}
onChangeText={(v)=>handleChange("sodium",v)}
style={styles.smallInput}
keyboardType="numeric"
/>

<TextInput
placeholder="Nutrition Score"
placeholderTextColor="#94a3b8"
value={calculateNutritionScore().toString()}
editable={false}
style={[styles.smallInput,{backgroundColor:"#E2E8F0"}]}
/>


<TextInput
placeholder="Nova Group"
placeholderTextColor="#94a3b8"
value={form.novaGroup}
onChangeText={(v)=>handleChange("novaGroup",v)}
style={styles.smallInput}
keyboardType="numeric"
/>


</View>




<Text style={styles.sectionTitle}>Preview</Text>

<View style={styles.previewCard}>

<Text style={styles.previewTitle}>
{form.name || "Product Name"}
</Text>

<Text style={styles.previewBrand}>
{form.brand || "Brand"}
</Text>



<View style={styles.previewMacros}>

<Text>🥩 {form.protein || 0}g protein</Text>

<Text>🍞 {form.carbohydrates || 0}g carbs</Text>

<Text>🧈 {form.fat || 0}g fat</Text>

</View>




<View style={{ flexDirection: "row", gap: 20, marginTop: 10 }}>

<Text style={{ fontWeight: "600" }}>
Price:{form.price || 0} DA
</Text>

<Text style={{  fontWeight: "600" }}>
📦 {displayQuantity(Number(form.quantity), form.unit)}
</Text>

</View>
</View>


{/* SAVE */}

<TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
<Text style={styles.saveText}>
{product ? "Update Product" : "Add Product"}
</Text>
</TouchableOpacity>


</ScrollView>
)
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8
  },
  button: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold"
  },
  backButton:{
backgroundColor:"#64748B",
padding:12,
borderRadius:10,
marginBottom:20,
alignSelf:"flex-start"
},

backText:{
color:"white",
fontWeight:"600"
},
closeButton:{
backgroundColor:"#ef4444",
padding:12,
borderRadius:10,
marginBottom:15,
alignSelf:"flex-end"
},
header:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:20
},

title:{
fontSize:22,
fontWeight:"bold",
color:"#0F172A"
},

sectionTitle:{
fontSize:16,
fontWeight:"600",
marginTop:20,
marginBottom:10,
color:"#334155"
},

input:{
borderWidth:1,
borderColor:"#E2E8F0",
padding:12,
borderRadius:12,
marginBottom:10,
backgroundColor:"#F8FAFC"
},

/*grid:{
flexDirection:"row",
flexWrap:"wrap",
gap:10
},*/
grid:{
  flexDirection:"row",
  flexWrap:"wrap"
},

smallInput:{
  width:"48%",
  marginBottom:10,
borderWidth:1,
borderColor:"#E2E8F0",
padding:10,
borderRadius:10,
backgroundColor:"#F8FAFC"
},

saveButton:{
marginTop:30,
backgroundColor:"#22c55e",
padding:16,
borderRadius:14,
alignItems:"center"
},

saveText:{
color:"white",
fontWeight:"bold",
fontSize:16
},
previewCard:{
backgroundColor:"#F8FAFC",
borderWidth:1,
borderColor:"#E2E8F0",
padding:20,
borderRadius:16,
marginTop:15
},

previewTitle:{
fontSize:18,
fontWeight:"bold",
color:"#0F172A"
},

previewBrand:{
color:"#64748B",
marginBottom:10
},

previewMacros:{
flexDirection:"row",
gap:10,
marginTop:10
},

previewPrice:{
marginTop:10,
fontWeight:"600"
}
});

