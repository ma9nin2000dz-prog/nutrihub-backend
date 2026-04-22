
 
import React, { useEffect, useState,useRef } from "react";
import {
View,
Text,
FlatList,
TextInput,
TouchableOpacity,
StyleSheet
} from "react-native";
import PaymentGuard from "../../components/pro/PaymentGuard";
import ProductCard from "../../components/pro/ProductCard";
import { apiRequest } from "../../services/api";
import { useWindowDimensions,Animated, Easing  } from "react-native";



export default function ProductsPage({ setSelectedItem,setShowBar,showBar }){

const opacityAnim = useRef(new Animated.Value(1)).current;
const scaleAnim = useRef(new Animated.Value(1)).current;
const translateY = useRef(new Animated.Value(0)).current;

 // const translateY = useRef(new Animated.Value(0)).current;
  const [lastScrollY,setLastScrollY] = useState(0);
  const [loadingMore,setLoadingMore] = useState(false);
const [refreshing,setRefreshing] = useState(false);

const THRESHOLD = 30;
const isAnimatingRef = useRef(false);

const { width } = useWindowDimensions();
const isMobile = width < 768;

const [products,setProducts] = useState([]);

const [search,setSearch] = useState("");

const [proteinMin,setProteinMin] = useState("");
const [proteinMax,setProteinMax] = useState("");

const [carbMin,setCarbMin] = useState("");
const [carbMax,setCarbMax] = useState("");

const [fatMin,setFatMin] = useState("");
const [fatMax,setFatMax] = useState("");




const [showFilters,setShowFilters] = useState(false);

const [page,setPage] = useState(1);
const [totalPages,setTotalPages] = useState(1);


const onRefresh = () => {
  setRefreshing(true);
  setPage(1);
};
////////////////////////////////////////////////////
// FETCH PRODUCTS
////////////////////////////////////////////////////

const fetchProducts = async () => {

  if (loadingMore) return;

  try{

    setLoadingMore(true);

    let limit = isMobile ? 6 : 9;
    let query = `products?page=${page}&limit=${limit}`;

    if(search) query += `&name=${search}`;
    if(proteinMin) query += `&proteinMin=${proteinMin}`;
    if(proteinMax) query += `&proteinMax=${proteinMax}`;
    if(carbMin) query += `&carbMin=${carbMin}`;
    if(carbMax) query += `&carbMax=${carbMax}`;
    if(fatMin) query += `&fatMin=${fatMin}`;
    if(fatMax) query += `&fatMax=${fatMax}`;

    const data = await apiRequest(query,"GET");

    if (page === 1) {
      setProducts(data.products || []);
    } else {
      setProducts(prev => [...prev, ...(data.products || [])]);
    }

    setTotalPages(data.totalPages || 1);

  }catch(error){
    console.log("Fetch products error:",error);
  }

  setLoadingMore(false);
};

////////////////////////////////////////////////////


useEffect(() => {
  Animated.parallel([
    Animated.timing(translateY, {
      toValue: showBar ? 0 : -120,
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

////////////////////////////////////////////////////
useEffect(()=>{
  const timer = setTimeout(()=>{
    fetchProducts();
    setRefreshing(false);
  }, 400);

  return ()=> clearTimeout(timer);

},[
  search,
  proteinMin,
  proteinMax,
  carbMin,
  carbMax,
  fatMin,
  fatMax,
  page
]);

/////////////////////////////////////////////////
return(

<View style={{flex:1}}>


<PaymentGuard /> 


{/* SEARCH */}

<Animated.View
  pointerEvents={showBar ? "auto" : "none"}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#1e293b",
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 15,
    opacity: opacityAnim,
    transform: [
      { translateY },
      { scale: scaleAnim }
    ]
  }}
>
<View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
<TextInput
  placeholder="Search product ..."
  value={search}
  onChangeText={(t)=>{setPage(1);setSearch(t)}}
  style={styles.searchInput}
/>

<TouchableOpacity
  style={styles.filterBtn}
  onPress={()=>setShowFilters(!showFilters)}
>
  <Text style={{color:"white"}}>Filter</Text>
</TouchableOpacity>

</View>

{/* FILTER PANEL */}

{showFilters && (

<View style={styles.filterContainer}>

  {/* Protein */}
  <View style={styles.filterRow}>
    <View style={styles.filterHalf}>
      <Text style={styles.label}>Protein Min:</Text>
      <TextInput
      
        value={proteinMin}
        onChangeText={(t)=>{
            setPage(1);
            setProteinMin(t);
             }}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>

    <View style={styles.filterHalf}>
      <Text style={styles.label}>Protein Max:</Text>
      <TextInput
        value={proteinMax}
        onChangeText={(t)=>{
  setPage(1);
  setProteinMax(t);
}}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>
  </View>

  {/* Carb */}
  <View style={styles.filterRow}>
    <View style={styles.filterHalf}>
      <Text style={styles.label}>Carb Min:</Text>
      <TextInput
        value={carbMin}
        onChangeText={(t)=>{
  setPage(1);
  setCarbMin(t);
}}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>

    <View style={styles.filterHalf}>
      <Text style={styles.label}>Carb Max:</Text>
      <TextInput
        value={carbMax}
        onChangeText={(t)=>{
  setPage(1);
  setCarbMax(t);
}}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>
  </View>

  {/* Fat */}
  <View style={styles.filterRow}>
    <View style={styles.filterHalf}>
      <Text style={styles.label}>Fat Min:</Text>
      <TextInput
        value={fatMin}
        onChangeText={(t)=>{
          setPage(1);
            setFatMin(t);
          }}
        style={styles.input}
        keyboardType="numeric"
      />
    </View>

    <View style={styles.filterHalf}>
      <Text style={styles.label}>Fat Max:</Text>
      <TextInput
        value={fatMax}
        onChangeText={(t)=>{
  setPage(1);
  setFatMax(t);
}}
        style={styles.input}
        keyboardType="numeric"
         
      />
    </View>
  </View>

</View>

)}

</Animated.View>


{/* PRODUCTS LIST */}

<FlatList

data={products}
keyExtractor={(item)=>item._id}

renderItem={({item})=>(
<ProductCard
product={item}
onPress={()=>setSelectedItem(item)}
/>
)}

numColumns={isMobile ? 1 : width < 1024 ? 2 : 3}

columnWrapperStyle={
  !isMobile && {
    justifyContent:"flex-start"
  }
}

/*contentContainerStyle={{
padding:20,
paddingTop: showBar ? 10 : 10,
paddingBottom: 0
}}*/
contentContainerStyle={{
  padding: 20,
  paddingTop: showFilters ? 240 : 80
}}

onEndReached={()=>{
  if(!loadingMore && page < totalPages){
    setPage(prev => prev + 1);
  }
}}
onEndReachedThreshold={0.5}

refreshing={refreshing}
onRefresh={onRefresh}

ListFooterComponent={
  loadingMore ? (
    <Text style={{textAlign:"center", padding:10}}>
      Loading...
    </Text>
  ) : null
}




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

    setTimeout(()=>{
      isAnimatingRef.current = false;
    }, 300);
  }
  else if(diff < -THRESHOLD){
    isAnimatingRef.current = true;
    setShowBar(true);

    setTimeout(()=>{
      isAnimatingRef.current = false;
    }, 300);
  }

  setLastScrollY(currentY);
}}
scrollEventThrottle={16}





/>

{/* PAGINATION */}


</View>

);

}

////////////////////////////////////////////////////

const styles = StyleSheet.create({



input:{
borderWidth:1,
borderColor:"#334155",
padding:12,
borderRadius:12,
flex:1,
backgroundColor:"#1f2937",
color:"#ffffff",
fontSize:14 ,
minHeight:40
},

filterBtn:{
backgroundColor:"#10b981",
padding:10,
borderRadius:10
},


pageBtn:{
color:"#10b981",
fontWeight:"600"
},

pageText:{
fontWeight:"600",
color:"#10b981",
},
filterBox:{
  flexDirection:"row",
  alignItems:"center",
  backgroundColor:"#1f2937",
  borderRadius:12,
  paddingHorizontal:12,
  paddingVertical:10,
  marginBottom:12,
  width:"100%",
  borderWidth:1,
  borderColor:"#334155"
},

inlineLabel:{
  color:"#94a3b8",
  marginRight:8,
  fontSize:13,
  minWidth:110
},

inlineInput:{
  flex:1,
  color:"#e2e8f0",
  fontSize:14
},



filterContainer:{
  padding:15
},

filterRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  marginBottom:12
},

filterHalf:{
  width:"48%"
},

label:{
  color:"#94a3b8",
  fontSize:12,
  marginBottom:4
},


searchRow:{
  flexDirection:"row",
  alignItems:"center",
  gap:10,
  padding:15
},

searchInput:{
  flex:1,
  borderWidth:1,
  borderColor:"#334155",
  padding:12,
  borderRadius:12,
  backgroundColor:"#1f2937",
  color:"#e2e8f0"
},

filterBtn:{
  backgroundColor:"#10b981",
  paddingHorizontal:15,
  paddingVertical:12,
  borderRadius:12,
  justifyContent:"center",
  alignItems:"center"
},
});