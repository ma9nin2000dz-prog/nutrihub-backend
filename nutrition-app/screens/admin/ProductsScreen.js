import { useFocusEffect } from "@react-navigation/native";/////////////////////
import { useCallback } from "react";///////////////
import { Platform } from "react-native";
import ProductFormScreen from "./ProductFormScreen";
import React, { useEffect, useState ,useRef} from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
   Modal,          
  ScrollView,
  Animated
} from "react-native";
import { apiRequest } from "../../services/api";
import { useWindowDimensions } from "react-native";

function format(n) {
  return Number.isInteger(n) ? n : n.toFixed(1);
}

function displayQuantity(q, unit) {
  if (unit === "g" && q >= 1000) return format(q / 1000) + " kg";
  if (unit === "ml" && q >= 1000) return format(q / 1000) + " L";
  return q + " " + unit;
}

export default function ProductsScreen({ navigation }) {

  const translateY = useRef(new Animated.Value(0)).current;
const opacityAnim = useRef(new Animated.Value(1)).current;
const scaleAnim = useRef(new Animated.Value(1)).current;

const [showBar,setShowBar] = useState(true);
const [lastScrollY,setLastScrollY] = useState(0);
const isAnimatingRef = useRef(false);

const THRESHOLD = 20;
 const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [showForm,setShowForm] = useState(false);
  const [editingProduct,setEditingProduct] = useState(null);


  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [totalProducts,setTotalProducts] = useState(0);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [proteinMin, setProteinMin] = useState("");
  const [proteinMax, setProteinMax] = useState("");
  const [carbMin, setCarbMin] = useState("");
  const [carbMax, setCarbMax] = useState("");
  const [fatMin, setFatMin] = useState("");
  const [fatMax, setFatMax] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async (customPage = page) => {
    try {

      let query = `products?page=${customPage}&limit=10`;

      if (search) query += `&name=${encodeURIComponent(search)}`;

      if (proteinMin !== "") query += `&proteinMin=${proteinMin}`;
      if (proteinMax !== "") query += `&proteinMax=${proteinMax}`;

      if (carbMin !== "") query += `&carbMin=${carbMin}`;
      if (carbMax !== "") query += `&carbMax=${carbMax}`;

      if (fatMin !== "") query += `&fatMin=${fatMin}`;
      if (fatMax !== "") query += `&fatMax=${fatMax}`;
      const data = await apiRequest(query, "GET");

      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      const dashboard = await apiRequest("admin/dashboard");
    setTotalProducts(dashboard.counts.products);

    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  useFocusEffect(   /////////////////////////////////
  useCallback(() => {
    fetchProducts(1);
  }, [])
 );

  // 🔹 SEARCH AUTO
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchProducts(1);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const deleteProduct = async (id) => {
    await apiRequest(`products/${id}`, "DELETE");
    fetchProducts();
  };


useEffect(() => {

  const delay = setTimeout(() => {

    setPage(1);
    fetchProducts(1);

  },500);

  return () => clearTimeout(delay);

},[
proteinMin,
proteinMax,
carbMin,
carbMax,
fatMin,
fatMax
]);

  ///////////////////////////////////////////////////
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

///////////////////////////////////////
  const renderItem = ({ item }) => (
  <TouchableOpacity
   style={styles.newCard} 
   activeOpacity={0.85}
   onPress={() => setSelectedProduct(item)} 
   >
  
  <View style={styles.cardContent}>

    {/* 🔥 TOP */}
    <Text style={styles.newTitle}>
      {item.name}
    </Text>

    {/* 🔥 MIDDLE */}
    <View style={styles.nutritionRow}>
      <View style={[styles.badge, { backgroundColor: "#DCFCE7" }]}>
        <Text style={styles.badgeText}>
  🥩 {Number((item.nutrition?.protein ?? 0).toFixed(1))}g
     </Text>
      </View>

      <View style={[styles.badge, { backgroundColor: "#DBEAFE" }]}>
       <Text style={styles.badgeText}>
  🍞 {Number((item.nutrition?.carbohydrates ?? 0).toFixed(1))}g
</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: "#FEF3C7" }]}>
      
<Text style={styles.badgeText}>
  🧈 {Number((item.nutrition?.fat ?? 0).toFixed(1))}g
</Text>
      </View>
    </View>

    {/* 🔥 BOTTOM */}
    <View style={styles.bottomRow}>
      <Text style={styles.priceRow}>
        {item.price ?? 0} DA
      </Text>

      <Text style={styles.quantity}>
        {displayQuantity(item.quantity, item.unit)}
      </Text>
    </View>

  </View>

</TouchableOpacity>
);




  return (
    <View style={styles.wrapper}>

      {/* LEFT PANEL */}
      {!isMobile && (
      <ScrollView
  style={styles.leftPanel}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 20 }}
>

        {/* SEARCH */}
        <TextInput
          placeholder="Search by name"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />



        {/* COUNTER */}

      <Text style={styles.counter}>
          Total Products: {totalProducts}
         </Text>

        {/* FILTER BUTTON */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ color: "white" }}>Filter With</Text>
        </TouchableOpacity>

        {/* FILTERS */}
        {showFilters && (
          <View style={styles.filterBox}>

  <View style={styles.filterRow}>
    <Text style={styles.filterLabel}>Protein</Text>
    <View style={styles.inlineRow}>
      <TextInput
        placeholder="Min"
        value={proteinMin}
        onChangeText={(v) => setProteinMin(v.trim())}
        style={styles.inlineInput}
      />
      <TextInput
        placeholder="Max"
        value={proteinMax}
        onChangeText={(v) => setProteinMax(v.trim())}
        style={styles.inlineInput}
      />
    </View>
  </View>

  <View style={styles.filterRow}>
    <Text style={styles.filterLabel}>Carbs</Text>
    <View style={styles.inlineRow}>
      <TextInput
        placeholder="Min"
        value={carbMin}
        onChangeText={(v) => setCarbMin(v.trim())}
        style={styles.inlineInput}
      />
      <TextInput
        placeholder="Max"
        value={carbMax}
        onChangeText={(v) => setCarbMax(v.trim())}
        style={styles.inlineInput}
      />
    </View>
  </View>

  <View style={styles.filterRow}>
    <Text style={styles.filterLabel}>Fat</Text>
    <View style={styles.inlineRow}>
      <TextInput
        placeholder="Min"
        value={fatMin}
        onChangeText={(v) => setFatMin(v.trim())}
        style={styles.inlineInput}
      />
      <TextInput
        placeholder="Max"
        value={fatMax}
        onChangeText={(v) => setFatMax(v.trim())}
        style={styles.inlineInput}
      />
    </View>
  </View>


<TouchableOpacity
style={styles.resetButton}
onPress={() => {

setProteinMin("");
setProteinMax("");

setCarbMin("");
setCarbMax("");

setFatMin("");
setFatMax("");

setPage(1);
fetchProducts(1);

}}
>
<Text style={{color:"white",fontWeight:"600"}}>
Reset
</Text>
</TouchableOpacity>


</View>
        )}

        {/* ADD PRODUCT */}
        <TouchableOpacity
          style={styles.addButton}
          //onPress={() => navigation.navigate("ProductForm")}
          onPress={()=>{
                         setEditingProduct(null);
                              setShowForm(true);
                  }}   
        >
          <Text style={{ color: "white" }}>+ Add Product</Text>
        </TouchableOpacity>

      </ScrollView>
)}
      {/* CENTER PANEL */}
      <View style={styles.centerPanel}>

        {isMobile && (

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
    placeholder="Search..."
     placeholderTextColor="#9CA3AF"
    value={search}
    onChangeText={setSearch}
    style={{
      backgroundColor: "#fff",
      padding: 10,
      borderRadius: 10,
      marginBottom: 10
    }}
  />

 
  <View style={{ flexDirection: "row", gap: 10 }}>

    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: "#7C3AED",
        padding: 12,
        borderRadius: 10,
        alignItems: "center"
      }}
      onPress={() => setShowFilters(!showFilters)}
    >
      <Text style={{ color: "white" }}>Filter</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: "#22C55E",
        padding: 12,
        borderRadius: 10,
        alignItems: "center"
      }}
      onPress={() => {
        setEditingProduct(null);
        setShowForm(true);
      }}
    >
      <Text style={{ color: "white" }}>+ Add</Text>
    </TouchableOpacity>

  </View>


  {showFilters && (
   
    
  <View style={styles.filterBox}>

    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>Protein</Text>
      <View style={styles.inlineRow}>
        <TextInput
          placeholder="Min"
           placeholderTextColor="#9CA3AF"
          value={proteinMin}
          onChangeText={(v) => setProteinMin(v.trim())}
          style={styles.inlineInput}
        />
        <TextInput
          placeholder="Max"
           placeholderTextColor="#9CA3AF"
          value={proteinMax}
          onChangeText={(v) => setProteinMax(v.trim())}
          style={styles.inlineInput}
        />
      </View>
    </View>

    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>Carbs</Text>
      <View style={styles.inlineRow}>
        <TextInput
          placeholder="Min"
           placeholderTextColor="#9CA3AF"
          value={carbMin}
          onChangeText={(v) => setCarbMin(v.trim())}
          style={styles.inlineInput}
        />
        <TextInput
          placeholder="Max"
           placeholderTextColor="#9CA3AF"
          value={carbMax}
          onChangeText={(v) => setCarbMax(v.trim())}
          style={styles.inlineInput}
        />
      </View>
    </View>

    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>Fat</Text>
      <View style={styles.inlineRow}>
        <TextInput
          placeholder="Min"
           placeholderTextColor="#9CA3AF"
          value={fatMin}
          onChangeText={(v) => setFatMin(v.trim())}
          style={styles.inlineInput}
        />
        <TextInput
          placeholder="Max"
           placeholderTextColor="#9CA3AF"
          value={fatMax}
          onChangeText={(v) => setFatMax(v.trim())}
          style={styles.inlineInput}
        />
      </View>
    </View>

    <TouchableOpacity
      style={styles.resetButton}
      onPress={() => {
        setProteinMin("");
        setProteinMax("");
        setCarbMin("");
        setCarbMax("");
        setFatMin("");
        setFatMax("");
        setPage(1);
        fetchProducts(1);
      }}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>
        Reset
      </Text>
    </TouchableOpacity>

  </View>
)}

</Animated.View>

)}





        <FlatList
  data={products}
  keyExtractor={(item) => item._id}
  renderItem={renderItem}

  numColumns={isMobile ? 1 : 2}

 columnWrapperStyle={
  !isMobile && {
    justifyContent: "space-between"
  }
}


contentContainerStyle={{
  paddingHorizontal: 5,
  paddingTop: showFilters ? 260 : 100,
   alignItems: "stretch"
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
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
          >
            <Text style={{marginRight:10}}>Prev</Text>
          </TouchableOpacity>

          <Text style={{marginHorizontal:10}}>
                  {page} / {totalPages}
           </Text>

          <TouchableOpacity
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
          >
            <Text>Next</Text>
          </TouchableOpacity>
        </View>

      </View>
      



          <Modal
  visible={!!selectedProduct}
  transparent
  animationType="fade"
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {selectedProduct && (
        <ScrollView>


 <View style={styles.modalHeaderModern}>



<View style={{ flexDirection: "row", gap: 10 }}>

    {/* EDIT */}
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={() => {
        setSelectedProduct(null);
        setEditingProduct(selectedProduct);
        setShowForm(true);
      }}
    >
      <Ionicons name="create-outline" size={20} color="#2563eb" />
    </TouchableOpacity>

   

  </View>

  {/* CLOSE */}
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={() => setSelectedProduct(null)}
  >
    <Ionicons name="close" size={22} color="#0f172a" />
  </TouchableOpacity>

  
</View>


          {/* HEADER */}
<Text style={styles.productTitle}>
  {selectedProduct.name}
</Text>

{/* QUICK INFO */}
<View style={styles.infoRow}>

  <Text style={styles.badge}>
    💰 {selectedProduct.price ?? 0} DA
  </Text>

  <Text style={styles.badge}>
    📦 {displayQuantity(selectedProduct.quantity, selectedProduct.unit)}
  </Text>

</View>

{/* NUTRITION */}
<Text style={styles.sectionTitle}>Nutrition</Text>

<View style={styles.nutritionGrid}>
  {selectedProduct.nutrition &&
    Object.entries(selectedProduct.nutrition).map(([key, value]) => (
      <View key={key} style={styles.nutritionCard}>
        <Text style={styles.nutritionValue}>
          {Number(value ?? 0).toFixed(1)}
        </Text>
        <Text style={styles.nutritionLabel}>
          {key}
        </Text>
      </View>
    ))}
</View>
          

  

  <View style={styles.deleteContainer}>

  <TouchableOpacity
    style={styles.deleteBtnModern}
    onPress={async () => {
      await deleteProduct(selectedProduct._id);
      setSelectedProduct(null);
    }}
  >
    <Ionicons name="trash-outline" size={20} color="white" />
    <Text style={styles.deleteText}>
      Delete Product
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

<ProductFormScreen
product={editingProduct}
onClose={()=>setShowForm(false)}
onSaved={()=>{
setShowForm(false);
fetchProducts();
}}
/>

</View>

</View>

</Modal>





    </View>
  );
}


const colors = {
  primary: "#7C3AED",
  primarySoft: "#EDE9FE",
  accent: "#22C55E",
  background: "#F3F4F6",
  card: "#FFFFFF",
  textDark: "#0F172A",
  textLight: "#64748B",
  border: "#E2E8F0",
  danger: "#EF4444"
};







const styles = StyleSheet.create({

wrapper: {
  flex: 1,
  flexDirection: Platform.OS === "web" ? "row" : "column",
  backgroundColor: colors.background
},

 leftPanel: {
  flex: 2,
  padding: 20,
  backgroundColor: colors.card,
  borderRightWidth: 1,
  borderColor: colors.border
},

leftPanel: {
  width: 70,            // 🔥 تحكم كامل في الحجم
  padding: 20,
  backgroundColor: colors.card,
  borderRightWidth: 1,
  borderColor: colors.border
},
  centerPanel: {
  flex: 3,
  paddingVertical: 15,
  paddingHorizontal: 20,
},

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 15,
    marginBottom: 18,
    fontSize: 14
  },

  filterButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 18,
    marginBottom: 18,
    alignItems: "center"
  },

filterBox: {
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 18,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: colors.border
},

 section: {
  fontWeight: "600",
  marginTop: 8,
  marginBottom: 4,
  color: colors.textDark,
  fontSize: 13
},

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },

label: {
  width: 15,
  fontSize: 12,
  color: colors.textLight
},

smallInput: {
  flex: 10,
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: 6,
  paddingHorizontal: 8,
  borderRadius: 10,
  fontSize: 12
},

  addButton: {
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10
  },

  card: {
  width: "100%",
  backgroundColor: colors.card,
  padding: 28,
  marginBottom: 24,
  borderRadius: 28,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 15,
  elevation: 4
},

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 14
  },

  actions: {
    flexDirection: "row",
    marginTop: 18
  },

  edit: {
    color: colors.primary,
    fontWeight: "600",
    marginRight: 30,
    fontSize: 14
  },

  delete: {
    color: colors.danger,
    fontWeight: "600",
    fontSize: 14
  },


  pagination: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 30
},

  modalContainer:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"rgba(15,23,42,0.5)"
  },

modalContent:{
  width: Platform.OS === "web" ? "55%" : "95%",
    maxHeight:"85%",
    backgroundColor:colors.card,
    padding:35,
    borderRadius:30
  },

  modalTitle:{
    fontSize:24,
    fontWeight:"700",
    color:colors.textDark
  },

  modalEdit:{
    backgroundColor:colors.primary,
    padding:14,
    borderRadius:18,
    marginRight:15
  },

  modalClose:{
    backgroundColor:colors.danger,
    padding:14,
    borderRadius:18
  },
   





 



filterRow: {
  marginBottom: 12
},

filterLabel: {
  fontSize: 12,
  fontWeight: "600",
  color: colors.textDark,
  marginBottom: 4
},

inlineRow: {
  flexDirection: "row"
},

inlineInput: {
  flex: 1,
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: 6,
  paddingHorizontal: 8,
  borderRadius: 10,
  fontSize: 12
},

applyButtonCompact: {
  marginTop: 10,
  backgroundColor: colors.primary,
  paddingVertical: 8,
  borderRadius: 12,
  alignItems: "center"
},
counter:{
fontSize:16,
fontWeight:"600",
marginBottom:14,
color:colors.textDark
},
resetButton:{
marginTop:10,
backgroundColor:"#ef4444",
paddingVertical:8,
borderRadius:12,
alignItems:"center"
},
modalDelete:{
  backgroundColor:"#9192b3",
  padding:14,
  borderRadius:18,
  marginRight:15
},







newTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: "#0F172A"
},

priceRow: {
  marginTop: 8,
  fontSize: 14,
  fontWeight: "600",
  color: "#22C55E" // أخضر يعطي feeling price
},



badge: {
  paddingHorizontal: 15,
  paddingVertical: 4,
  borderRadius: 50,

  // shadow خفيف
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2
},

badgeText: {
  fontSize: 12,
  fontWeight: "500",
  color: "#111827"
},

newCard: {
  flex: 1,                 // يخدم grid
     width: "100%",         // 🔥 يمنع التمدد في web
 // margin: 10,
 paddingTop: 20,
marginBottom: 15,  
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 20,
minHeight: 110, 
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5
},
cardContent: {
  flex: 1,
  justifyContent: "space-between"   // 🔥 يوزع العناصر
},

newTitle: {
  fontSize: 17,
  fontWeight: "700",
  color: "#0F172A",
  marginBottom: 8
},


nutritionRow: {
   flexDirection: "row",
  justifyContent: "space-between",
  gap: 15,
  marginVertical: 6
},

bottomRow: {
  flexDirection: "row",
 // justifyContent: "space-between",
 gap: 60,
  alignItems: "center",
  marginTop: 10
},

priceRow: {
  fontSize: 16,
  fontWeight: "700",
  color: "#22C55E",
  paddingLeft: 25,
},

quantity: {
  fontSize: 13,
  color: "#64748B"
},
productTitle:{
  fontSize:22,
  fontWeight:"bold",
  color:"#0f172a",
  marginBottom:10
},

infoRow:{
  flexDirection:"row",
  gap:10,
  marginBottom:10
},

badge:{
  backgroundColor:"#e2e8f0",
  paddingHorizontal:10,
  paddingVertical:6,
  borderRadius:10,
  fontSize:13
},

sectionTitle:{
  fontWeight:"600",
  marginTop:15,
  marginBottom:10,
  fontSize:14,
  color:"#334155"
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

modalHeaderModern:{
  flexDirection:"row",
  justifyContent:"flex-end",  // 🔥 هذا هو المهم
  alignItems:"center",
  gap:30,
  marginBottom:15
},

iconBtn:{
  backgroundColor:"#f1f5f9",
  padding:10,
  borderRadius:12,

  shadowColor:"#000",
  shadowOpacity:0.1,
  shadowRadius:5,
  elevation:3
},


deleteContainer:{
  marginTop:20,
  alignItems:"center"
},

deleteBtnModern:{
  flexDirection:"row",
  alignItems:"center",
  gap:8,

  backgroundColor:"#ef4444",
  paddingVertical:12,
  paddingHorizontal:20,
  borderRadius:14,

  shadowColor:"#000",
  shadowOpacity:0.2,
  shadowRadius:5,
  elevation:4
},

deleteText:{
  color:"white",
  fontWeight:"600"
}
});