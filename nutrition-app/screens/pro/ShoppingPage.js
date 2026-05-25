import React, { useState, useEffect } from "react";
import PaymentGuard from "../../components/pro/PaymentGuard";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ✅ 1. الدوال الحسابية (يجب أن تكون موجودة ليعمل الكود)
function formatNumber(n) {
  return Number.isInteger(n) ? n : n.toFixed(1);
}

function displayQuantity(q, unit) {
  if (unit === "g" && q >= 1000) return formatNumber(q / 1000) + " kg";
  if (unit === "ml" && q >= 1000) return formatNumber(q / 1000) + " L";
  return q + " " + unit;
}

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

// ✅ 2. المكون الأساسي للصفحة
const ShoppingPage = ({ selectedDiet }) => {
  const shoppingList = generateShoppingList(selectedDiet);
  const [checkedItems, setCheckedItems] = useState({});

  // تحميل الحالة عند الفتح
  useEffect(() => {
    const loadCheckedItems = async () => {
      try {
        const savedData = await AsyncStorage.getItem("shopping_checked_items");
        if (savedData !== null) {
          setCheckedItems(JSON.parse(savedData));
        }
      } catch (e) {
        console.error("Error loading data", e);
      }
    };
    loadCheckedItems();
  }, []);

  // دالة التبديل والحفظ
  const toggleItem = async (name) => {
    const newCheckedItems = {
      ...checkedItems,
      [name]: !checkedItems[name]
    };
    setCheckedItems(newCheckedItems);
    try {
      await AsyncStorage.setItem("shopping_checked_items", JSON.stringify(newCheckedItems));
    } catch (e) {
      console.error("Error saving data", e);
    }
  };

  const totalPrice = shoppingList.reduce((sum, item) => sum + item.totalPrice, 0);

  const renderItem = ({ item }) => {
    const isChecked = checkedItems[item.name];
    return (
      <TouchableOpacity 
        style={[styles.card, isChecked && styles.cardChecked]} 
        onPress={() => toggleItem(item.name)}
        activeOpacity={0.7}
      >
        <View style={styles.contentContainer}>
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, isChecked && styles.textChecked]}>
              {item.name}
            </Text>
            <View style={styles.row}>
              <Text style={[styles.quantity, isChecked && styles.textChecked]}>
                {displayQuantity(item.quantity, item.unit)}
              </Text>
              <Text style={[styles.price, isChecked && styles.textChecked]}>
                {item.totalPrice.toFixed(0)} DA
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
      />
      <View style={styles.totalBox}>
        <Text style={styles.totalText}>
          Total: {totalPrice.toFixed(0)} DA 💰
        </Text>
      </View>
    </View>
  );
};

// ✅ 3. التنسيقات (Styles)
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#1e293b" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#22c55e" },
  card: { backgroundColor: "#0f172a", padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  cardChecked: { backgroundColor: "rgba(15, 23, 42, 0.5)", borderColor: "#1e293b" },
  contentContainer: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#94a3b8", marginRight: 15, justifyContent: "center", alignItems: "center" },
  checkboxChecked: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  name: { fontSize: 16, fontWeight: "600", color: "#fff" },
  textChecked: { textDecorationLine: "line-through", color: "#64748b" },
  quantity: { fontSize: 14, color: "#94a3b8" },
  price: { fontSize: 16, fontWeight: "bold", color: "#22c55e" },
  totalBox: { position: "absolute", bottom: 40, left: 20, right: 20, backgroundColor: "#0f172a", padding: 15, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  totalText: { color: "#22c55e", fontSize: 18, fontWeight: "bold", textAlign: "center" },
});

export default ShoppingPage;