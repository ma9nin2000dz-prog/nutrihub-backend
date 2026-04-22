
import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import VisitorScreen from "../screens/visitor/VisitorScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import VerifyCodeScreen from "../screens/auth/VerifyCodeScreen";
import AdminDrawer from "./AdminDrawer";
import PatientPlanRouter from "../screens/patient/PatientPlanRouter";
import ProPlan from "../screens/pro/ProPlan";

import { AuthContext } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {

  const { userToken, userRole, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
     
      {!userToken ? (
        <>
          <Stack.Screen name="Visitor" component={VisitorScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          
          
        </>

        
      ) : userRole === "admin" ? (
        <Stack.Screen name="AdminDrawer" component={AdminDrawer} />
      ) : userRole === "expert" ? (
        <Stack.Screen name="ProPlan" component={ProPlan} />
      ) : (
        <Stack.Screen name="PatientPlanRouter" component={PatientPlanRouter} />
      )}

<Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />

    </Stack.Navigator>
  );
}