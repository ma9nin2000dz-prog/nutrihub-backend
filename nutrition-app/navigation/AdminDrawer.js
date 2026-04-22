import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, Text } from "react-native";
import PlanPricingScreen from "../screens/admin/PlanPricingScreen";
//import AdminDashboard from "../screens/admin/AdminDashboard";
import ProductsScreen from "../screens/admin/ProductsScreen";
import ProductFormScreen from "../screens/admin/ProductFormScreen";
import RecipesScreen from "../screens/admin/RecipesScreen";
import ExpertsScreen from "../screens/admin/ExpertsScreen";
import PatientsScreen from "../screens/admin/PatientsScreen";
import CustomDrawerContent from "./CustomDrawerContent";
import AdminDashboardExecutive from "../screens/admin/dashboard/AdminDashboardScreen";////////////////////////////////AdminDashboardExecutive
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

/* ========================= */
/* Products Stack */
/* ========================= */

function ProductsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductsList" component={ProductsScreen} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} />
    </Stack.Navigator>
  );
}

/* ========================= */
/* Drawer */
/* ========================= */

export default function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Text style={{ fontSize: 20 }}>☰</Text>
          </TouchableOpacity>
        )
      })}
    >
      <Drawer.Screen name="Dashboard" component={AdminDashboardExecutive} />
      <Drawer.Screen name="Products" component={ProductsStack} />
      <Drawer.Screen name="Recipes" component={RecipesScreen} />
      <Drawer.Screen name="Experts" component={ExpertsScreen} />
      <Drawer.Screen name="Patients" component={PatientsScreen} />

     <Drawer.Screen name="Plan Pricing" component={PlanPricingScreen} />

    </Drawer.Navigator>
  );
}