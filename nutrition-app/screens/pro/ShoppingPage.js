import React from "react";
import PaymentGuard from "../../components/pro/PaymentGuard";
import {
  View,
  Text,
  FlatList,
  StyleSheet
} from "react-native";

function formatNumber(n) {
  return Number.isInteger(n) ? n : n.toFixed(1);
}

function displayQuantity(q, unit) {
  if (unit === "g" && q >= 1000) return formatNumber(q / 1000) + " kg";
  if (unit === "ml" && q >= 1000) return formatNumber(q / 1000) + " L";
  return q + " " + unit;
}


// ✅ merge ingredients
const generateShoppingList = (diet) => {
  if (!diet || typeof diet !== "object") return [];

  const map = {};

  Object.values(diet).forEach(mealArray => {
    (mealArray || []).forEach(recipe => {

      (recipe.ingredients || []).forEach(ing => {

        const name = ing.product?.name || "unknown";
        const product = ing.productData || ing.product;

        let ingredientPrice = 0;

        if (product && product.price != null && product.quantity > 0) {
          const pricePerUnit = product.price / product.quantity;
          ingredientPrice = pricePerUnit * ing.quantity;
        }

        if (map[name]) {
          map[name].quantity += ing.quantity;
          map[name].totalPrice += ingredientPrice;
        } else {
          map[name] = {
            name,
            quantity: ing.quantity,
            unit: "g",
            totalPrice: ingredientPrice
          };
        }
      });

    });
  });

  return Object.values(map);
};
const ShoppingPage = ({ selectedDiet }) => {

  const shoppingList = generateShoppingList(selectedDiet); // 🔥 مباشرة
//const shoppingList = generateShoppingList(selectedDiet);

const totalPrice = shoppingList.reduce(
  (sum, item) => sum + item.totalPrice,
  0
);
  const renderItem = ({ item }) => (
  <View style={styles.card}>

    <Text style={styles.name}>{item.name}</Text>

    <View style={styles.row}>

      <Text style={styles.quantity}>
         {displayQuantity(item.quantity, item.unit)}
      </Text>

      <Text style={styles.price}>
        {item.totalPrice.toFixed(0)} DA
      </Text>

    </View>

  </View>
);

  return (
    
  <View style={styles.container}>
    <PaymentGuard /> 
    <Text style={styles.title}>🛒 Shopping List</Text>

    <FlatList
      data={shoppingList}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 120 }}
      

      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    />

    {/* 🔥 هنا تحطها */}
    <View style={styles.totalBox}>
      <Text style={styles.totalText}>
        Total: {totalPrice.toFixed(0)} DA 💰
      </Text>
    </View>

  </View>
);
};





export default ShoppingPage;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1e293b"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#22c55e"
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#334155"
  },

  name: {
    fontSize: 16,
    flex: 1,
    flexWrap: "wrap",
    marginRight: 10,
    color: "#fff"
  },

  qty: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
 totalBox: {
  position: "absolute",   // 🔥 أهم حاجة
  bottom: 40,             // 🔥 فوق bottom bar
  left: 20,
  right: 20,

  backgroundColor: "#0f172a",
  padding: 15,
  borderRadius: 12,
  alignItems: "center",

  borderWidth: 1,
  borderColor: "#334155"
},

totalText: {
  color: "#22c55e",
  fontSize: 18,
  fontWeight: "bold",
  textAlign: "center"
},

card: {
  backgroundColor: "#0f172a",
  padding: 15,
  borderRadius: 12,
  marginBottom: 12,

  borderWidth: 1,
  borderColor: "#334155"
},

row: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 8
},

name: {
  fontSize: 16,
  fontWeight: "600",
  color: "#fff"
},

quantity: {
  fontSize: 14,
  color: "#94a3b8"
},

price: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#22c55e"
},
});