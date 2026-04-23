



import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";



const getBaseUrl = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoClient?.hostUri;

    if (hostUri) {
      const ip = hostUri.split(":")[0];
     //return `http://${ip}:5000/api/`;
   return "https://nutrihub-backend.onrender.com/api/";
    }

  // return "http://192.168.8.101:5000/api/";
   return "https://nutrihub-backend.onrender.com/api/";
   
  } catch (err) {
    console.log("BASE URL ERROR:", err);
 //return "http://192.168.8.101:5000/api/";
return "https://nutrihub-backend.onrender.com/api/";
  
  }
};

export const BASE_URL = getBaseUrl(); // 🔥 هذا هو الحل



///////////////////////////////////////////////////////////////
// 🔥 API REQUEST FUNCTION
///////////////////////////////////////////////////////////////
export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null
) => {
  try {
    const token = await AsyncStorage.getItem("token");

    console.log("TOKEN:", token);
    console.log("BASE_URL:", BASE_URL + endpoint);

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(BASE_URL + endpoint, options);

    ///////////////////////////////////////////////////////////
    // 🔥 HANDLE EMPTY RESPONSES
    ///////////////////////////////////////////////////////////
    if (response.status === 204 || response.status === 304) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      console.log("API ERROR STATUS:", response.status);
      throw new Error(data.message || "Request failed");
    }

    return data;

  } catch (error) {
    console.log("API ERROR:", error.message);
    throw error;
  }
};