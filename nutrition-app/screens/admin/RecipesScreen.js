import React, { useEffect, useState ,useRef} from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
   Animated
} from "react-native";
//import { Animated } from "react-native";
import ProductFormScreen from "./ProductFormScreen";
import { apiRequest } from "../../services/api";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";//////////////////////////////////////
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
//const BASE_URL = "http://localhost:5000";
import { Platform } from "react-native";


    import { BASE_URL } from "../../services/api";

//////////////////////////////////////////////////////
// ✅ حطها هنا
const getImageUrl = (path) => {
  return BASE_URL.replace("/api/", "") + path;
};
//////////////////////////////////////////////////////
export default function RecipesScreen() {

  const [isSearchOpen, setIsSearchOpen] = useState(false);
const [visibleCount, setVisibleCount] = useState(5);
  const translateY = useRef(new Animated.Value(0)).current;
const opacityAnim = useRef(new Animated.Value(1)).current;
const scaleAnim = useRef(new Animated.Value(1)).current;

const [lastScrollY,setLastScrollY] = useState(0);
const isAnimatingRef = useRef(false);
const THRESHOLD = 20;
const [showBar,setShowBar] = useState(true);


 const [showPriceModal, setShowPriceModal] = useState(false);
const [editingProduct, setEditingProduct] = useState(null);

const [editValues, setEditValues] = useState({
  price: "",
  quantity: ""
});

  const [showProductForm, setShowProductForm] = useState(false); //for add product
  const [totalRecipes,setTotalRecipes] = useState(0);

  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [image, setImage] = useState(null);///////////////////////////////
  const LIMIT = 6;
    
  const [showFilters,setShowFilters] = useState(false);

  const [proteinMin,setProteinMin] = useState("");
  const [proteinMax,setProteinMax] = useState("");

  const [carbMin,setCarbMin] = useState("");
  const [carbMax,setCarbMax] = useState("");

  const [fatMin,setFatMin] = useState("");
  const [fatMax,setFatMax] = useState("");

 
  const [editingRecipe,setEditingRecipe] = useState(null);


  const [form, setForm] = useState({
    name: "",
    category: [],
    difficulty: "",
    preparation_time: "",
    preparation_tools: "",
    description: "",
    servings: "",
    ingredients: [
      { product: "", quantity: "", search: "", selectedName: "" },
    ],
  });
  ////////////////////////////////////////////////
  const [newIngredient,setNewIngredient] = useState({
product:"",
search:"",
selectedName:"",
quantity:"",
price:0
});
///////////////////////////
/*const isReadyToSave =
  newIngredient.product &&
  newIngredient.quantity;*/
  
  const isReadyToSave =
  newIngredient.product &&
  Number(newIngredient.quantity) > 0;

////////////////////////////////////////////////////
useEffect(() => {
  Animated.parallel([
    Animated.timing(translateY, {
      toValue: showBar ? 0 : -140,
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
//////////////////////////////for edit product price /////////////////
/*const updateProductPrice = async () => {
  try {
    await apiRequest(
      `products/${newIngredient.product}`,
      "PUT",
      {
        price: Number(newIngredient.productData.price)
      }
    );

    Alert.alert("Success", "Price updated globally");

  } catch (err) {
    Alert.alert("Error", err.message);
  }
};*/
/*const updateProductPrice = async () => {
  try {

    // 🔥 1. تحديث السعر في backend
    await apiRequest(
      `products/${newIngredient.product}`,
      "PUT",
      {
        price: Number(newIngredient.productData.price)
      }
    );

    // 🔥 2. إعادة جلب المنتج المحدث
    const data = await apiRequest(
      `products?name=${newIngredient.selectedName}`
    );

    // 🔥 3. تحديث list
    const updatedProducts = data.products || [];
    setProducts(updatedProducts);

    // 🔥 4. تحديث العنصر المختار مباشرة
    if (updatedProducts.length > 0) {
      const updated = updatedProducts[0];

      setNewIngredient({
        ...newIngredient,
        productData: updated
      });
    }

    Alert.alert("Success", "Price updated globally");

  } catch (err) {
    Alert.alert("Error", err.message);
  }
};*/
  /////////////////////////////////////////////////////////////
  // FETCH RECIPES
  /////////////////////////////////////////////////////////////
  const fetchRecipes = async () => {
    try {
      setLoading(true);

      let query = `recipes?page=${page}&limit=${LIMIT}`;

if (search) query += `&search=${search}`;

if (proteinMin) query += `&proteinMin=${proteinMin}`;
if (proteinMax) query += `&proteinMax=${proteinMax}`;

if (carbMin) query += `&carbMin=${carbMin}`;
if (carbMax) query += `&carbMax=${carbMax}`;

if (fatMin) query += `&fatMin=${fatMin}`;
if (fatMax) query += `&fatMax=${fatMax}`;

      const data = await apiRequest(query);
      console.log("RECIPES DATA:", data); ///////////
      setRecipes(data.recipes || []);
      setTotalPages(data.totalPages || 1);
      const dashboard = await apiRequest("admin/dashboard");
      setTotalRecipes(dashboard.counts.recipes);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  
// 🔥 SEARCH PRODUCTS DYNAMICALLY
/////////////////////////////////////////////////////////////
/*const searchProducts = async (index, text) => {
  try {
    handleIngredientChange(index, "search", text);

    if (!text) {
      setProducts([]);
      return;
    }

    const data = await apiRequest(
      `products?name=${text}&page=1&limit=10`
    );

    setProducts(data.products || []);

  } catch (err) {
    console.log("SEARCH ERROR:", err.message);
  }
};*/
const searchProducts = async (text) => {
  try {

    if (!text) {
      setProducts([]);
      return;
    }

    const data = await apiRequest(
      `products?name=${text}&page=1&limit=10`
    );

    setProducts(data.products || []);

  } catch (err) {
    console.log("SEARCH ERROR:", err.message);
  }
};

useEffect(()=>{

const timer = setTimeout(()=>{

fetchRecipes();

},500);

return ()=> clearTimeout(timer);

},[
page,
search,
proteinMin,
proteinMax,
carbMin,
carbMax,
fatMin,
fatMax
]);
  //////////////////////////////////////////////pick image//////////
  const pickImage = async () => {

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1,1],
    quality: 0.8
  });

  if (!result.canceled) {
    setImage(result.assets[0]);
  }

};

  /////////////////////////////////////////////////////////////
  // INGREDIENT CHANGE
  /////////////////////////////////////////////////////////////
  const handleIngredientChange = (index, key, value) => {
    const updated = [...form.ingredients];
    updated[index][key] = value;
    setForm({ ...form, ingredients: updated });
  };



const addIngredient = () => {

if(!newIngredient.product || !newIngredient.quantity){
Alert.alert("Select ingredient and quantity");
return;
}

setForm({
...form,
ingredients:[
...form.ingredients,
{
product:newIngredient.product,
quantity:newIngredient.quantity,

productData: newIngredient.productData, // ✅ جديد
selectedName:newIngredient.selectedName
}
]
});

setNewIngredient({
product:"",
search:"",
selectedName:"",
quantity:"",
price:0
});

};
  ////////////////////////////////////////

  const removeIngredient = (index) => {
    const updated = [...form.ingredients];
    updated.splice(index, 1);
    setForm({ ...form, ingredients: updated });
  };



  /////////////////////////////////////////////////////////////
// SAVE RECIPE (FIXED)
/////////////////////////////////////////////////////////////


const saveRecipe = async () => {
  try {

    if (!form.category.length) {
  Alert.alert("Error", "Please select a category");
  return;
}

    // فلترة المكونات الفارغة
    const validIngredients = form.ingredients.filter(
      (i) => i.product && i.quantity
    );

    if (validIngredients.length === 0) {
      Alert.alert("Error", "Please select at least one ingredient");
      return;
    }

    const totalPrice = calculateLivePrice();
    const nutrition = calculateNutrition();
    const formData = new FormData();

    // 🔹 BASIC DATA
    formData.append("name", form.name);
   // formData.append("category", form.category);
   form.category.forEach((cat, index) => {
  formData.append(`category[${index}]`, cat);
           });
    formData.append("difficulty", form.difficulty);
    formData.append("preparation_time", Number(form.preparation_time));
    formData.append("preparation_tools", form.preparation_tools);
    formData.append("description", form.description);
    
   
   formData.append("servings", Number(form.servings));


    // 🔹 INGREDIENTS
   validIngredients.forEach((ing, index) => {

  const productId =
    typeof ing.product === "object"
      ? ing.product._id
      : ing.product;

  formData.append(`ingredients[${index}][product]`, productId);

  formData.append(
    `ingredients[${index}][quantity]`,
    Number(ing.quantity)
  );

});

    // 🔹 PRICE
  //  formData.append("price", Number(totalPrice.toFixed(2)));

   // 🔹 NUTRITION (AUTO CALCULATED)
         Object.entries(nutrition).forEach(([key, value]) => {
         formData.append(`nutrition[${key}]`, Number(value.toFixed(2)));
          });

    // 🔹 IMAGE
  /*  if (image) {


formData.append("image", {
  uri: image.uri,
  name: `recipe_${Date.now()}.jpg`,
  type: "image/jpeg",
});

}*/
// 🔹 IMAGE
if (image) {

  if (Platform.OS === "web") {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    formData.append(
      "image",
      blob,
      `recipe_${Date.now()}.jpg`
    );

  } else {
    formData.append("image", {
      uri: image.uri,
      name: `recipe_${Date.now()}.jpg`,
      type: "image/jpeg",
    });
  }

}

    const token = await AsyncStorage.getItem("token");

    // 🔹 URL (POST OR PUT)
    /*const url = editingId
      ? `http://localhost:5000/api/recipes/${editingId}`
      : "http://localhost:5000/api/recipes";*/
     const url = editingId
  ? `${BASE_URL}recipes/${editingId}`
  : `${BASE_URL}recipes`;

    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("SERVER ERROR:", data);
      throw new Error(data.message || "Failed to save recipe");
    }

    Alert.alert("Success", editingId ? "Recipe updated" : "Recipe created");

    resetForm();
    setImage(null);
    fetchRecipes();

  } catch (err) {
    console.log("SAVE ERROR:", err);
    Alert.alert("Error", err.message);
  }
};
/////////////////////////////////////////////////////////////
// DELETE (WEB SAFE VERSION)
/////////////////////////////////////////////////////////////
/*const deleteRecipe = async (id) => {
  const confirmDelete = window.confirm("Delete recipe?");
  if (!confirmDelete) return;

  try {
    console.log("DELETE RECIPE HIT:", id);

    await apiRequest(`recipes/${id}`, "DELETE");

    // تحديث القائمة مباشرة
    setRecipes(prev =>
      prev.filter(r => r._id !== id)
    );

  } catch (error) {
    console.log("DELETE ERROR:", error.message);
    Alert.alert("Delete Error", error.message);
  }
};*/


const deleteRecipe = async (id) => {

  if (Platform.OS === "web") {
    const confirmDelete = window.confirm("Delete recipe?");
    if (!confirmDelete) return;

    await apiRequest(`recipes/${id}`, "DELETE");
    setRecipes(prev => prev.filter(r => r._id !== id));

  } else {

    Alert.alert(
      "Confirm",
      "Delete recipe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await apiRequest(`recipes/${id}`, "DELETE");
            setRecipes(prev => prev.filter(r => r._id !== id));
          }
        }
      ]
    );
  }
};
  /////////////////////////////////////////////////////////////
  // EDIT
  /////////////////////////////////////////////////////////////
  const editRecipe = (recipe) => {
    const updatedIngredients = recipe.ingredients.map((i) => {
      return {
  product: i.product?._id || i.product,
  quantity: i.quantity,
  productData: i.product,
  search: "",
  selectedName:
    i.product?.displayName ||
    i.product?.name ||
    "",
};
    });

    //setForm({ ...recipe, ingredients: updatedIngredients });
    setForm({
     name: recipe.name,
    // category: recipe.category,
    category: recipe.category || [],
     difficulty: recipe.difficulty,
     preparation_time: recipe.preparation_time,
     preparation_tools: recipe.preparation_tools,
     description: recipe.description,
     ingredients: updatedIngredients,

     servings: recipe.servings,///////////////////////////////////////
});
    setEditingId(recipe._id);
    setEditingRecipe(recipe);
    setShowForm(true);  
  };

  /////////////////////////////////////////////////////////////
  // RESET
  /////////////////////////////////////////////////////////////
  const resetForm = () => {
    setForm({
      name: "",
      category: [],
      difficulty: "",
      preparation_time: "",
      preparation_tools: "",
      description: "",
      servings: "",
      ingredients: [
        { product: "", quantity: "", search: "",price: 0, selectedName: "" },
      ],
    });

    setEditingId(null);
    setShowForm(false);
  };

  /////////////////////////////////////////////////////////////
// 🔥 LIVE PRICE CALCULATION
/////////////////////////////////////////////////////////////


const calculateLivePrice = () => {

  let total = 0;

  form.ingredients.forEach((ing) => {

    if (ing.productData && ing.quantity) {

      const product = ing.productData;

      if (!product.quantity || product.quantity === 0) {
        return;
      }

      const pricePerUnit = product.price / product.quantity;

      total += pricePerUnit * Number(ing.quantity);

    }

  });

  return total;
};
/*const calculateLivePrice = () => {

  let total = 0;

  form.ingredients.forEach((ing) => {

    if (ing.productData && ing.quantity) {

      const product = ing.productData;

      const pricePerUnit = product.price / product.quantity;

      total += pricePerUnit * Number(ing.quantity);

    }

  });

  return total;
};*/
///////////////////////////

/////////////////////////////////////////////////////////////
// 🔥 NUTRITION CALCULATION
/////////////////////////////////////////////////////////////
const calculateNutrition = () => {

  let totals = {
    energyKcal: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
    salt: 0
  };

  form.ingredients.forEach((ing) => {

    if (ing.productData && ing.quantity) {

      const p = ing.productData;
      const qty = Number(ing.quantity);

      totals.energyKcal += (p.nutrition.energyKcal * qty) / 100;
      totals.protein += (p.nutrition.protein * qty) / 100;
      totals.carbohydrates += (p.nutrition.carbohydrates * qty) / 100;
      totals.fat += (p.nutrition.fat * qty) / 100;
      totals.sugar += (p.nutrition.sugar * qty) / 100;
      totals.fiber += (p.nutrition.fiber * qty) / 100;
      totals.salt += (p.nutrition.salt * qty) / 100;

    }

  });

  return totals;
};




const resetFilters = () => {

setProteinMin("");
setProteinMax("");

setCarbMin("");
setCarbMax("");

setFatMin("");
setFatMax("");

setSearch("");

setPage(1);


};
     ////////////////////////
     const categories = ["breakfast", "lunch", "dinner", "snack"];
  /////////////////////////////////////////////////////////////
  // RENDER ITEM
  /////////////////////////////////////////////////////////////
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedRecipe(item)}
      style={styles.card}
    
    >
    <Image
  source={{
    /*uri: item.image
      ? `${BASE_URL}${item.image}`*/
      uri: item.image
  ? getImageUrl(item.image)
      : "https://via.placeholder.com/400"
  }}
  style={styles.image}
/>
  <View style={styles.cardBody}>


      <Text style={styles.title}>{item.name}</Text>

  <Text style={{
  color:
    item.difficulty === "easy"
      ? "green"
      : item.difficulty === "medium"
      ? "orange"
      : "red"
}}>
  {item.difficulty}
</Text>

<View style={styles.metaRow}>

<View style={styles.metaItem}>
<Text style={styles.metaIcon}>🔥</Text>
<Text style={styles.metaValue}>
{Math.round(item.nutrition?.energyKcal || 0)}
</Text>
<Text style={styles.metaLabel}>kcal</Text>
</View>

<View style={styles.metaItem}>
<Text style={styles.metaIcon}>⏱</Text>
<Text style={styles.metaValue}>
{item.preparation_time}
</Text>
<Text style={styles.metaLabel}>min</Text>
</View>

<View style={styles.metaItem}>
<Text style={styles.metaIcon}>💰</Text>
<Text style={styles.metaValue}>
{item.price}
</Text>
<Text style={styles.metaLabel}>DA</Text>
</View>
</View>
      
    </View>

    </TouchableOpacity>
  );

  /////////////////////////////////////////////////////////////
  // RETURN
  /////////////////////////////////////////////////////////////
  return (
    <View style={styles.mainContainer}>
      {/* LEFT FORM */}
      {Platform.OS === "web" && (
  <View style={styles.sidebar}>


<Text style={{
fontSize:16,
fontWeight:"600",
marginBottom:10
}}>
Total Recipes: {totalRecipes}
</Text>

          <TouchableOpacity
style={styles.filterBtn}
onPress={()=>setShowFilters(prev => !prev)}
>
<Text style={{color:"white"}}>
{showFilters ? "Hide Filter" : "Filter With"}
</Text>
</TouchableOpacity>


{showFilters && (

<View style={styles.filterPanel}>

<Text style={styles.filterTitle}>Protein</Text>

<View style={styles.filterRow}>
<TextInput
placeholder="Min"
value={proteinMin}
onChangeText={setProteinMin}
style={styles.filterInput}
/>

<TextInput
placeholder="Max"
value={proteinMax}
onChangeText={setProteinMax}
style={styles.filterInput}
/>
</View>


<Text style={styles.filterTitle}>Carbs</Text>

<View style={styles.filterRow}>
<TextInput
placeholder="Min"
value={carbMin}
onChangeText={setCarbMin}
style={styles.filterInput}
/>

<TextInput
placeholder="Max"
value={carbMax}
onChangeText={setCarbMax}
style={styles.filterInput}
/>
</View>


<Text style={styles.filterTitle}>Fat</Text>

<View style={styles.filterRow}>
<TextInput
placeholder="Min"
value={fatMin}
onChangeText={setFatMin}
style={styles.filterInput}
/>

<TextInput
placeholder="Max"
value={fatMax}
onChangeText={setFatMax}
style={styles.filterInput}
/>
</View>

<View style={styles.filterButtons}>



<TouchableOpacity
style={styles.resetBtn}
onPress={resetFilters}
>
<Text style={{color:"white"}}>Reset</Text>
</TouchableOpacity>

</View>
</View>

)}






       <TouchableOpacity
style={styles.createBtn}
onPress={()=>{
setEditingRecipe(null);
setShowForm(true);
}}
>
<Text style={styles.btnText}>
+ Add Recipe
</Text>
</TouchableOpacity>

       


     </View>
)}

      {/* LIST */}
      <View style={styles.listContainer}>
       {/* <TextInput
          placeholder="Search recipe by name..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
          onSubmitEditing={fetchRecipes}
          style={styles.input}
        />
        
        
        */}
        
        
        {Platform.OS !== "web" && (

<Animated.View
  pointerEvents={showBar ? "auto" : "none"}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    opacity: opacityAnim,
    transform: [
      { translateY },
      { scale: scaleAnim }
    ]
  }}
>


  <TextInput
    placeholder="Search recipe..."
    placeholderTextColor="#9CA3AF"
    value={search}
    onChangeText={(text)=>{
      setSearch(text);
      setPage(1);
    }}
    style={{
      backgroundColor: "#fff",
      padding: 10,
      borderRadius: 10,
      marginBottom: 10
    }}
  />

 
  <View style={{ flexDirection:"row", gap:10 }}>

    <TouchableOpacity
      style={{
        flex:1,
        backgroundColor:"#7C3AED",
        padding:12,
        borderRadius:10,
        alignItems:"center"
      }}
      onPress={()=>setShowFilters(!showFilters)}
    >
      <Text style={{color:"white"}}>Filter</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={{
        flex:1,
        backgroundColor:"#22C55E",
        padding:12,
        borderRadius:10,
        alignItems:"center"
      }}
      onPress={()=>{
        setEditingRecipe(null);
        setShowForm(true);
      }}
    >
      <Text style={{color:"white"}}>+ Add</Text>
    </TouchableOpacity>

  </View>

 
  {showFilters && (

<View style={styles.filterPanel}>

<Text style={styles.filterTitle}>Protein</Text>

<View style={styles.filterRow}>
<TextInput
placeholder="Min"
placeholderTextColor="#9CA3AF"
value={proteinMin}
onChangeText={setProteinMin}
style={styles.filterInput}
/>

<TextInput
placeholder="Max"
placeholderTextColor="#9CA3AF"
value={proteinMax}
onChangeText={setProteinMax}
style={styles.filterInput}
/>
</View>


<Text style={styles.filterTitle}>Carbs</Text>

<View style={styles.filterRow}>
<TextInput
placeholder="Min"
placeholderTextColor="#9CA3AF"
value={carbMin}
onChangeText={setCarbMin}
style={styles.filterInput}
/>

<TextInput
placeholder="Max"
placeholderTextColor="#9CA3AF"
value={carbMax}
onChangeText={setCarbMax}
style={styles.filterInput}
/>
</View>


<Text style={styles.filterTitle}>Fat</Text>

<View style={styles.filterRow}>
<TextInput
placeholder="Min"
placeholderTextColor="#9CA3AF"
value={fatMin}
onChangeText={setFatMin}
style={styles.filterInput}
/>

<TextInput
placeholder="Max"
placeholderTextColor="#9CA3AF"
value={fatMax}
onChangeText={setFatMax}
style={styles.filterInput}
/>
</View>

<View style={styles.filterButtons}>



<TouchableOpacity
style={styles.resetBtn}
onPress={resetFilters}
>
<Text style={{color:"white"}}>Reset</Text>
</TouchableOpacity>

</View>
</View>

)}

</Animated.View>

)}
        
        
        
        
              



















        {loading && <ActivityIndicator size="large" />}

        <FlatList
          data={recipes}
          keyExtractor={(item) => item._id}
          key={Platform.OS === "web" ? "web" : "mobile"}
          renderItem={renderItem}
           numColumns={Platform.OS === "web" ? 2 : 1}
          /*contentContainerStyle={{
          //alignItems: "center",
           paddingVertical: 20
           }}*/
          contentContainerStyle={{
  paddingVertical: 20,
  paddingTop: showFilters ? 260 : 140
}}


onScroll={(event)=>{
  const currentY = event.nativeEvent.contentOffset.y;

  if(isAnimatingRef.current){
    setLastScrollY(currentY);
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

    setTimeout(()=>{ isAnimatingRef.current = false; },300);
  }
  else if(diff < -THRESHOLD){
    isAnimatingRef.current = true;
    setShowBar(true);

    setTimeout(()=>{ isAnimatingRef.current = false; },300);
  }

  setLastScrollY(currentY);
}}
scrollEventThrottle={16}

        />

        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageBtn}
            onPress={() => page > 1 && setPage(page - 1)}
          >
            <Text style={styles.btnText}>Prev</Text>
          </TouchableOpacity>

          <Text>
            Page {page} / {totalPages}
          </Text>

          <TouchableOpacity
            style={styles.pageBtn}
            onPress={() =>
              page < totalPages && setPage(page + 1)
            }
          >
            <Text style={styles.btnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DETAILS MODAL */}
      <Modal
  visible={!!selectedRecipe}
  animationType="slide"
  transparent
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {selectedRecipe && (


        <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 50 }} // 🔥 مهم
>
      
            <View style={styles.modalHeaderDetails}>



<View style={styles.headerActions}>

<TouchableOpacity
style={styles.iconBtn}
onPress={()=>{
setSelectedRecipe(null);
editRecipe(selectedRecipe);
}}
>
<Ionicons name="create-outline" size={24} color="#2563eb" />
</TouchableOpacity>



<TouchableOpacity
style={styles.iconBtn}
onPress={()=>setSelectedRecipe(null)}
>
<Ionicons name="close" size={26} color="#111827" />
</TouchableOpacity>

</View>

</View>
<Text style={styles.recipeTitle}>
  {selectedRecipe.name}
</Text>

<View style={styles.categoryContainer}>
  {selectedRecipe.category?.map((cat, index) => (
    <Text key={index} style={styles.categoryBadge}>
      {cat}
    </Text>
  ))}
</View>


<View style={styles.infoRow}>
  <Text style={styles.badge}>
    ⚡ {selectedRecipe.difficulty}
  </Text>

  <Text style={styles.badge}>
    👥 {selectedRecipe.servings}
  </Text>

  <Text style={styles.badge}>
    ⏱ {selectedRecipe.preparation_time} min
  </Text>
</View>

<View style={styles.priceBox}>
  <Text style={styles.priceText}>
    Price : {selectedRecipe.price} DA
  </Text>
</View>

<Text style={styles.sectionTitle}>Description</Text>
<Text style={styles.description}>
  {selectedRecipe.description || "No description"}
</Text>

          {/* 🔥 INGREDIENTS */}
          <Text
            style={{
              marginTop: 15,
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Ingredients:
          </Text>

          {selectedRecipe.ingredients &&
            selectedRecipe.ingredients.map((ing, index) => (
              <View
                key={index}
                style={{
                  marginVertical: 4,
                  padding: 6,
                  backgroundColor: "#f3f3f3",
                  borderRadius: 6,
                }}
              >
                <Text>
                  • {ing.product?.name || "Product"} —{" "}
                  {ing.quantity} g
                </Text>
              </View>
            ))}

          {/* 🔥 NUTRITION */}



          <Text style={styles.sectionTitle}>Nutrition</Text>

<View style={styles.nutritionGrid}>
  {selectedRecipe.nutrition &&
    Object.entries(selectedRecipe.nutrition).map(([key, value]) => (
      <View key={key} style={styles.nutritionCard}>
        <Text style={styles.nutritionValue}>
          {Number(value).toFixed(1)}
        </Text>
        <Text style={styles.nutritionLabel}>
          {key}
        </Text>
      </View>
    ))}
</View>
          <View style={{ flexDirection:"row", marginTop:20 }}>


</View>


<View style={{ marginTop:20, alignItems:"center" }}>

  <TouchableOpacity
    style={{
      flexDirection:"row",
      alignItems:"center",
      gap:8,
      backgroundColor:"#ef4444",
      paddingVertical:12,
      paddingHorizontal:20,
      borderRadius:14
    }}
    onPress={()=>deleteRecipe(selectedRecipe._id)}
  >
    <Ionicons name="trash-outline" size={20} color="white" />
    <Text style={{color:"white", fontWeight:"600"}}>
      Delete Recipe
    </Text>
  </TouchableOpacity>

</View>
        </ScrollView>
      )}
    </View>
  </View>
</Modal>




<Modal
visible={showForm}
transparent
animationType="slide"
>

<View style={styles.modalContainer}>

<View style={styles.modalContent}>

{/* HEADER */}

<View style={styles.modalHeader}>

<Text style={styles.modalTitle}>
{editingRecipe ? "Edit Recipe" : "Create Recipe"}
</Text>

<TouchableOpacity
style={styles.closeButton}
onPress={()=>setShowForm(false)}
>
<Ionicons name="close" size={20} color="#475569" />
</TouchableOpacity>

</View>


<ScrollView showsVerticalScrollIndicator={false}>

{/* BASIC INFO */}

<Text style={styles.sectionTitle}>Basic Info</Text>

<TextInput
placeholder="Recipe name"
placeholderTextColor="#94a3b8"
value={form.name}
onChangeText={(v)=>setForm({...form,name:v})}
style={styles.inputLarge}
/>

<TextInput
  placeholder="Servings (number of persons)"
  placeholderTextColor="#94a3b8"
  value={form.servings}
  onChangeText={(v)=>setForm({...form, servings: v})}
  style={styles.inputLarge}
/>










<View style={styles.categoryBox}>

  <Text style={styles.categoryTitle}>Category</Text>

  <View style={styles.categoryContent}>

    {categories.map((cat) => {

      const selected = (form.category || []).includes(cat);

      return (
        <TouchableOpacity
          key={cat}
          onPress={() => {
            if (selected) {
              setForm({
                ...form,
                category: (form.category || []).filter(c => c !== cat)
              });
            } else {
              setForm({
                ...form,
                category: [...(form.category || []), cat]
              });
            }
          }}
          style={[
            styles.categoryChip,
            selected && styles.categoryChipActive
          ]}
        >
          <Text style={[
            styles.categoryText,
            selected && styles.categoryTextActive
          ]}>
            {cat}
          </Text>
        </TouchableOpacity>
      );
    })}

  </View>

</View>




<View style={styles.categoryBox}>

  <Text style={styles.categoryTitle}>Difficulty</Text>

  <View style={styles.categoryContent}>

    {["easy","medium","hard"].map((level)=>{

      const selected = form.difficulty === level;

      return (
        <TouchableOpacity
          key={level}
          onPress={()=>setForm({...form, difficulty: level})}
          style={[
            styles.categoryChip,
            selected && styles.categoryChipActive
          ]}
        >
          <Text style={[
            styles.categoryText,
            selected && styles.categoryTextActive
          ]}>
            {level}
          </Text>
        </TouchableOpacity>
      );
    })}

  </View>

</View>

          


{/* VISUAL & PREP */}

<Text style={styles.sectionTitle}>Visual & Prep</Text>

<TouchableOpacity
style={styles.uploadBtn}
onPress={pickImage}
>
<Text style={styles.btnText}>Select Recipe Image</Text>
</TouchableOpacity>

{image && (
<Image
source={{ uri: image.uri }}
style={styles.previewImage}
/>
)}

<View style={styles.row}>

<TextInput
placeholder="Preparation Time (min)"
placeholderTextColor="#94a3b8"
value={form.preparation_time}
onChangeText={(v)=>setForm({...form,preparation_time:v})}
style={styles.inputHalf}
/>

{/*<TextInput
placeholder="Preparation Tools"
value={form.preparation_tools}  ida 7tajt preparation tool 
onChangeText={(v)=>setForm({...form,preparation_tools:v})}
style={styles.inputHalf}
/>*/}

</View>


{/* DESCRIPTION */}

<Text style={styles.sectionTitle}>Instructions</Text>

<TextInput
placeholder="Recipe instructions..."
placeholderTextColor="#94a3b8"
value={form.description}
onChangeText={(v)=>setForm({...form,description:v})}
style={styles.textArea}
multiline
/>


{/* INGREDIENTS */}

{/* INGREDIENTS */}

<Text style={styles.sectionTitle}>Ingredients</Text>

{/* SEARCH INPUT */}

<TextInput
placeholder="Search ingredient..."
placeholderTextColor="#94a3b8"
value={newIngredient.selectedName || newIngredient.search}
onChangeText={(text)=>{
setNewIngredient({
...newIngredient,
search:text
});

setVisibleCount(5);
setIsSearchOpen(false);
searchProducts(text);
}}
style={styles.input}
/>

{/* SEARCH RESULTS */}

{newIngredient.search && products.length > 0 &&
products.slice(0, visibleCount).map((product) => (
  <TouchableOpacity
    key={product._id}
    style={styles.productResult}
    onPress={()=>{
      setNewIngredient({
        product: product._id,
        productData: product,
        selectedName: product.displayName || product.name,
        search: "",
        quantity: ""
      });
    }}
  >
    <Text style={{color:"white"}}>
      {product.displayName || product.name}
    </Text>

    <Text style={{color:"white"}}>
      Price: {product.price} DA
    </Text>

  </TouchableOpacity>
))}
{products.length > 5 && (
  <TouchableOpacity
    onPress={() => {
      const isOpen = !isSearchOpen;

      setIsSearchOpen(isOpen);

      if (isOpen) {
        setVisibleCount(products.length);
      } else {
        setVisibleCount(5);
        
      }
    }}
    style={{
  backgroundColor:"#cad3e7",
  padding:10,
  borderRadius:10,
   marginBottom:12,
  marginTop:5,
  alignItems:"center",
  flexDirection:"row",
  justifyContent:"center",
  gap:6
}}
  >
   <Ionicons 
  name={isSearchOpen ? "chevron-up" : "chevron-down"} 
  size={20} 
  color="#9ca3af"
/>
  </TouchableOpacity>
)}
























{/*new product grom recip */}


{newIngredient.search && products.length === 0 && (
  <TouchableOpacity
    style={{
      backgroundColor: "#2563eb",
      padding: 10,
      borderRadius: 12,
      marginTop: 5
    }}
    onPress={() => setShowProductForm(true)}
  >
    <Text style={{ color: "white", textAlign: "center" }}>
      + Create new product
    </Text>
  </TouchableOpacity>
)}








{newIngredient.productData && (
  <View style={{
    marginTop: 10,
    backgroundColor: "#f1f5f9",
    marginBottom: 15,
    padding: 12,
    borderRadius: 14
  }}>

    {/* 🔹 NAME */}
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={{
        fontWeight: "600",
        fontSize: 15,
        marginBottom: 4
      }}
    >
      {newIngredient.selectedName}
    </Text>

    {/* 🔹 PRICE + PACKAGE */}
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10
    }}>

      {/* PRICE */}
      <Text style={{
        color: "#16a34a",
        fontWeight: "600",
        marginRight: 15
      }}>
        💰 {newIngredient.productData.price} DA
      </Text>

      {/* PACKAGE */}
      <Text style={{
        color: "#64748b",
        fontWeight: "500"
      }}>
        📦 {newIngredient.productData.quantity} g
      </Text>

    </View>

    {/* 🔹 ACTIONS */}
    <View style={{
      flexDirection: "row",
      justifyContent: "flex-end"
    }}>

      {/* EDIT */}
      <TouchableOpacity
        style={{ marginRight: 15 }}
        onPress={() => {
          setEditingProduct(newIngredient.productData);
          setEditValues({
            price: newIngredient.productData.price?.toString() || "",
            quantity: newIngredient.productData.quantity?.toString() || ""
          });
          setShowPriceModal(true);
        }}
      >
        <Ionicons name="create-outline" size={20} color="#2563eb" />
      </TouchableOpacity>

      {/* CLOSE */}
      <TouchableOpacity
        onPress={()=>{
          setNewIngredient({
            product:"",
            search:"",
            selectedName:"",
            quantity:"",
            price:0
          });
        }}
      >
        <Ionicons name="close" size={20} color="#ef4444" />
      </TouchableOpacity>

    </View>

  </View>
)}














{/* QUANTITY */}

<View style={styles.row}>

<TextInput
placeholder="Quantity (g)"
placeholderTextColor="#94a3b8"
value={newIngredient.quantity}
onChangeText={(v)=>
setNewIngredient({...newIngredient,quantity:v})
}
style={styles.inputHalf}
/>




  

















<TouchableOpacity
  style={[
    styles.editBtn,
    { backgroundColor: isReadyToSave ? "#16a34a" : "#2563eb" }
  ]}
  onPress={() => {

    if (isReadyToSave) {
      // ✅ SAVE ingredient
      addIngredient();
    } else {
      // ➕ just focus or help user
      Alert.alert("Info", "Select ingredient and quantity first");
    }

  }}
>
  <Ionicons
    name={isReadyToSave ? "checkmark" : "add"}
    size={20}
    color="white"
  />
</TouchableOpacity>









{/*<TouchableOpacity
style={styles.editBtn}
onPress={addIngredient}
>
<Text style={styles.btnText}>Add</Text>
</TouchableOpacity>*/}

</View>


{/* INGREDIENT LIST */}

{form.ingredients.map((ing,index)=>(
<View style={styles.ingredientRow} key={index}>

<Text style={{flex:1}}>
• {ing.selectedName}
</Text>

<Text style={{marginRight:10}}>
{ing.quantity} g
</Text>

<TouchableOpacity
onPress={()=>removeIngredient(index)}
style={styles.removeBtn}
>
<Text style={{color:"white"}}>X</Text>
</TouchableOpacity>

</View>
))}


{/*<TouchableOpacity
style={styles.editBtn}
onPress={addIngredient}
>
<Text style={styles.btnText}>Add Ingredient</Text>
</TouchableOpacity>*/}


{/* PRICE */}

<Text style={styles.priceText}>
Total Price: {calculateLivePrice().toFixed(2)} DA
</Text>


{/* SAVE */}

<TouchableOpacity
style={styles.saveBtn}
onPress={saveRecipe}
>
<Text style={styles.btnText}>
{editingId ? "Update Recipe" : "Save Recipe"}
</Text>
</TouchableOpacity>


</ScrollView>

</View>

</View>
</Modal>




{/**model add product from recipe  */}

<Modal
  visible={showProductForm}
  transparent
  animationType="slide"
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>

      <ProductFormScreen
        onClose={() => setShowProductForm(false)}
        onSaved={async () => {
          setShowProductForm(false);

          // 🔥 نرجع نبحث بنفس الكلمة
          const data = await apiRequest(
            `products?name=${newIngredient.search}&page=1&limit=10`
          );

          const newProducts = data.products || [];
          setProducts(newProducts);

          // 🔥 نختار أول منتج جديد مباشرة
          if (newProducts.length > 0) {
            const p = newProducts[0];

            setNewIngredient({
              product: p._id,
              productData: p,
              selectedName: p.displayName || p.name,
              search: "",
              quantity: ""
            });
          }
        }}
      />

    </View>
  </View>
</Modal>



{/* simpel model weth tow aray input price  and quantity to edit price ingridient where creat recipe  */}

<Modal visible={showPriceModal} transparent animationType="fade">
  <View style={{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"rgba(0,0,0,0.4)"
  }}>
    
    <View style={{
      width:300,
      backgroundColor:"#fff",
      padding:20,
      borderRadius:15
    }}>

      <Text style={{fontWeight:"bold", marginBottom:10}}>
        Edit Product
      </Text>

      <TextInput
        placeholder="Price (DA)"
        value={editValues.price}
        onChangeText={(v)=>setEditValues({...editValues, price:v})}
        style={styles.input}
      />

      <TextInput
        placeholder="Quantity (g)"
        value={editValues.quantity}
        onChangeText={(v)=>setEditValues({...editValues, quantity:v})}
        style={styles.input}
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={async ()=>{
          try {

            await apiRequest(
              `products/${editingProduct._id}`,
              "PUT",
              {
                price: Number(editValues.price),
                quantity: Number(editValues.quantity)
              }
            );





setRecipes(prevRecipes =>
  prevRecipes.map(recipe => {

    let newPrice = 0;

    recipe.ingredients.forEach(ing => {

      const p = ing.product;

      // ✅ هنا بالضبط
      if (p && p._id === editingProduct._id) {

        // 🔥 تحديث المنتج داخل recipe
        p.price = Number(editValues.price);
        p.quantity = Number(editValues.quantity);

        const pricePerUnit =
          p.price / p.quantity;

        newPrice += pricePerUnit * ing.quantity;

      } else if (p && p.quantity && p.price) {

        const pricePerUnit = p.price / p.quantity;
        newPrice += pricePerUnit * ing.quantity;

      }

    });

    return {
      ...recipe,
      price: Number(newPrice.toFixed(2))
    };

  })
);






            // تحديث محلي
            setNewIngredient({
              ...newIngredient,
              productData: {
                ...newIngredient.productData,
                price: Number(editValues.price),
                quantity: Number(editValues.quantity)
              }
            });

            setShowPriceModal(false);

          } catch (err) {
            Alert.alert("Error", err.message);
          }
        }}
      >
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
    </View>
  );
}


const styles = StyleSheet.create({

mainContainer: {
  flex: 1,
  flexDirection: Platform.OS === "web" ? "row" : "column",
  backgroundColor: "#F8FAFC",
},

  sidebar: {
    width: Platform.OS === "web" ? 380 : "100%",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },

  listContainer: {
    flex: 1,
    padding: 25,
    
  },

  input: {
    backgroundColor: "#e1e2e4",
    padding: 12,
    marginBottom: 12,
    borderRadius: 14,
    fontSize: 14,
    color: "#0F172A",
  },


card:{
  width: Platform.OS === "web" ? 340 : "95%",
  backgroundColor:"#FFFFFF",
  
  margin:10,
  borderRadius:20,
  overflow:"hidden",
  shadowColor:"#000000",
  shadowOpacity:0.3,
  shadowRadius:5,
  elevation:4
},


  title: {
    fontWeight: "600",
    fontSize: 17,
    color: "#0F172A",
    marginBottom: 6,
  },

  actions: {
    flexDirection: "row",
    marginTop: 12,
  },

  createBtn: {
    backgroundColor: "#84CC16",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },

  saveBtn: {
    backgroundColor: "#65A30D",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },

  editBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
  },

  deleteBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  pageBtn: {
    backgroundColor: "#84CC16",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  productResult: {
    backgroundColor: "#c9eab2",
    padding: 10,
    marginBottom: 6,
    borderRadius: 12,
  },

  btnText: {
    color: "white",
    fontWeight: "600",
      
  },

  sectionTitle: {
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 10,
    fontSize: 20,
    color: "#000000",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20 
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "#0F172A",
  },

  closeBtn: {
    backgroundColor: "#84CC16",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },


  uploadBtn:{
  backgroundColor:"#0ea5e9",
  padding: 14,
  borderRadius: 30,
  alignItems:"center",
  marginBottom:10
},

previewImage:{
  width:120,
  height:120,
  borderRadius:12,
  marginBottom:15
},

image: {
  width: "100%",
  height: 220,
  resizeMode: "cover",
},
modalContent: {
  width: "75%",
  maxHeight: "80%",   // 🔥 مهم
  backgroundColor: "#FFFFFF",
  padding: 25,
  borderRadius: 25,
},
cardBody:{
  padding:16
},
filterBtn:{
backgroundColor:"#7c3aed",
padding:12,
borderRadius:20,
alignItems:"center",
marginBottom:10
},

filterPanel:{
backgroundColor:"#e2e8f0",
padding:15,
borderRadius:20,
marginTop:10,
marginBottom:20
},

filterTitle:{
fontWeight:"600",
marginTop:10,
marginBottom:6
},

filterRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:10
},

filterInput:{
width:"48%",
backgroundColor:"#cbd5e1",
padding:10,
borderRadius:12
},


filterButtons:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:15,
gap:10
},


resetBtn:{
flex:1,
backgroundColor:"#ef4444",
padding:12,
borderRadius:20,
alignItems:"center"
},
modalContainer:{
flex:1,
justifyContent: "flex-start",
alignItems:"center",
paddingTop: 50,
backgroundColor:"rgba(0,0,0,0.4)"
},

modalContent:{
  width: Platform.OS === "web" ? "70%" : "90%",
  maxHeight:"85%",
backgroundColor:"#fff",
padding:30,
borderRadius:20
},
modalCloseBtn:{
position:"absolute",
top:15,
right:15,
backgroundColor:"#ef4444",
width:35,
height:35,
borderRadius:20,
alignItems:"center",
justifyContent:"center",
zIndex:10
},

modalCloseText:{
color:"white",
fontWeight:"bold",
fontSize:18
},



row:{
flexDirection:"row",
gap:10,
marginBottom:10
},

inputLarge:{
backgroundColor:"#e2e8f0",
padding:14,
borderRadius:14,
marginBottom:12
},

inputHalf:{
flex:1,
backgroundColor:"#e2e8f0",
padding:14,
borderRadius:14
},

textArea:{
backgroundColor:"#e2e8f0",
padding:14,
borderRadius:14,
height:100,
marginBottom:10
},

ingredientBox:{
backgroundColor:"#f1f5f9",
padding:12,
borderRadius:14,
marginBottom:12
},

priceText:{
fontWeight:"bold",
marginTop:10,
fontSize:16
},


ingredientRow:{
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
backgroundColor:"#f1f5f9",
padding:10,
borderRadius:10,
marginBottom:8
},

removeBtn:{
backgroundColor:"#ef4444",
padding:6,
borderRadius:10
},
closeButton:{
position:"absolute",
top:18,
right:18,
width:38,
height:38,
borderRadius:20,
backgroundColor:"#f1f5f9",
alignItems:"center",
justifyContent:"center",
shadowColor:"#000",
shadowOpacity:0.1,
shadowRadius:5,
elevation:3
},

closeIcon:{
fontSize:18,
fontWeight:"bold",
color:"#64748b"
},
modalButtons:{
flexDirection:"row",
justifyContent:"center",
gap:20,
marginTop:20
},

modalBtnEdit:{
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
backgroundColor:"#22C55E",
paddingVertical:12,
width:130,
borderRadius:12,
gap:6
},

modalBtnDelete:{
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
backgroundColor:"#EF4444",
paddingVertical:12,
width:130,
borderRadius:12,
gap:6
},

modalBtnClose:{
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
backgroundColor:"#64748B",
paddingVertical:12,
width:130,
borderRadius:12,
gap:6
},

btnText:{
color:"white",
fontWeight:"600"
},
metaRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:12
},

metaItem:{
flexDirection:"column",
alignItems:"center",
backgroundColor:"#f1f5f9",
paddingVertical:8,
paddingHorizontal:14,
borderRadius:12,
minWidth:70
},



metaIcon:{
fontSize:14,
marginBottom:2
},

metaValue:{
fontSize:15,
fontWeight:"700",
color:"#0f172a"
},

metaLabel:{
fontSize:11,
color:"#64748b"
},
modalHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:15
},


headerActions:{
flexDirection:"row",
gap:40
},

iconBtn:{
backgroundColor:"#f1f5f9",
padding:8,
borderRadius:8
},








categoryBox: {
  borderWidth: 1,
  borderColor: "#e2e8f0",
  borderRadius: 16,
  padding: 15,
  marginBottom: 15,
  backgroundColor: "#f8fafc"
},

categoryTitle: {
  position: "absolute",
  top: -10,
  left: 15,
  backgroundColor: "#fff",
  paddingHorizontal: 10,
  fontSize: 13,
  fontWeight: "600",
  color: "#334155"
},

categoryContent: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 10
},

categoryChip: {
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 20,
  backgroundColor: "#e2e8f0"
},

categoryChipActive: {
  backgroundColor: "#22c55e"
},

categoryText: {
  color: "#334155",
  fontWeight: "600"
},

categoryTextActive: {
  color: "white"
},

recipeTitle:{
  fontSize:22,
  fontWeight:"bold",
  color:"#0f172a",
  marginBottom:10,
  marginTop:10
},

infoRow:{
  flexDirection:"row",
  flexWrap:"wrap",
  gap:19,
  marginBottom:10
},

badge:{
  backgroundColor:"#e2e8f0",
  paddingHorizontal:10,
  paddingVertical:5,
  borderRadius:10,
  fontSize:15
},

priceBox:{
  backgroundColor:"#f0fdf4",
  padding:10,
  borderRadius:12,
  marginBottom:10
},

priceText:{
  color:"#16a34a",
  fontWeight:"bold"
},

description:{
  color:"#000000",
  marginBottom:10
},

nutritionGrid:{
  flexDirection:"row",
  flexWrap:"wrap",
  justifyContent:"space-between"
},

nutritionCard:{
  width:"48%",
  backgroundColor:"#f1f5f9",
  padding:10,
  borderRadius:12,
  marginBottom:10,
  alignItems:"center"
},

nutritionValue:{
  fontWeight:"bold",
  fontSize:14
},

nutritionLabel:{
  fontSize:11,
  color:"#64748b"
},
categoryContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 10
},

categoryBadge: {
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 10,
  fontSize: 12,
  fontWeight: "600"
},

modalHeaderDetails:{
  flexDirection:"row",
  justifyContent:"flex-end", // 🔥 icons على اليمين
  alignItems:"center",
  marginBottom:10
},
});