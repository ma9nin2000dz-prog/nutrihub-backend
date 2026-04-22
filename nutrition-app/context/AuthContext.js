import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);/////////////////////
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  /////////////////////////////////////////////////////////
  // 🔥 LOAD USER SAFELY (NO PLAN OVERRIDE ISSUE)
  /////////////////////////////////////////////////////////
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const storedRole = await AsyncStorage.getItem("role");
        const storedPlan = await AsyncStorage.getItem("plan");

        if (!token) {
          setLoading(false);
          return;
        }

        // 🔥 استخدم القيم المخزنة أولاً
        setUserToken(token);
        setUserRole(storedRole);
        setUserPlan(storedPlan);

        // 🔥 ثم حاول تحديثها من السيرفر
        try {
          /*const userData = await apiRequest("users/me", "GET");

           

         
          }*/
         const userData = await apiRequest("users/me", "GET");

setUser(userData);

// 🔥 استعمل userData وليس user
if (userData?.role) {
  setUserRole(userData.role);
  await AsyncStorage.setItem("role", userData.role);
}

if (userData?.plan) {
  setUserPlan(userData.plan);
  await AsyncStorage.setItem("plan", userData.plan);
}

        } catch (error) {
          console.log("Session refresh skipped.");
          
        }

      } catch (error) {
        console.log("Load user error:", error.message);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  /////////////////////////////////////////////////////////
  // 🔥 LOGIN
  /////////////////////////////////////////////////////////
  /*const loginUser = async (email, password) => {
    const data = await apiRequest("login", "POST", {
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", data.user);

    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("role", data.user.role);
    await AsyncStorage.setItem("plan", data.user.plan);

    setUserToken(data.token);
    setUserRole(data.user.role);
    setUserPlan(data.user.plan);
   
    await refreshUser();
    
    // ////////////////////////////////////////////////////////////////////
  };*/
  const loginUser = async (email, password) => {
  try {
    const data = await apiRequest("login", "POST", {
      email,
      password,
    });

    
   if (data.type === "expired_plan" || data.type === "payment_required") {

    

  return data;
}

    console.log("LOGIN RESPONSE:", data.user);

    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("role", data.user.role);
    await AsyncStorage.setItem("plan", data.user.plan);

    setUserToken(data.token);
    setUserRole(data.user.role);
    setUserPlan(data.user.plan);

    await refreshUser();

return data;

  } catch (error) {
    // 🔥 هذا هو المهم
    throw error; 
  }
};

  /////////////////////////////////////////////////////////
  // 🔥 REGISTER
  /////////////////////////////////////////////////////////
  const registerUser = async (name, email, password, plan) => {
    await apiRequest("register", "POST", {
      name,
      email,
      password,
      plan,
    });

    await loginUser(email, password);
  };

  /////////////////////////////////////////////////////////
  // 🔥 REFRESH USER (Manual Only)
  /////////////////////////////////////////////////////////
  const refreshUser = async () => {
    try {
      const user = await apiRequest("users/me", "GET");
      
        setUser(prev => ({
      ...prev,
      ...user
    }));

      if (user?.role) {
        setUserRole(user.role);
        await AsyncStorage.setItem("role", user.role);
      }

      if (user?.plan) {
        setUserPlan(user.plan);
        await AsyncStorage.setItem("plan", user.plan);
      }

    } catch (error) {
      console.log("Refresh failed.");
    }
  };

  /////////////////////////////////////////////////////////
  // 🔥 LOGOUT
  /////////////////////////////////////////////////////////
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("plan");

    setUserToken(null);
    setUserRole(null);
    setUserPlan(null);
    setUser(null);/////////////////////////////////////////////////////////////////////////////
  };

  /////////////////////////////////////////////////////////
  // PROVIDER
  /////////////////////////////////////////////////////////
  return (
    <AuthContext.Provider
      value={{
         user,
         setUser,
        userToken,
        userRole,
        userPlan,
        loginUser,
        registerUser,
        logout,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}