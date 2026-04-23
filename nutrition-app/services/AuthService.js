//const ADMIN_EMAIL = "admin@nutrition.com";
//const ADMIN_PASSWORD = "123456";

//export const loginAdmin = (email, password) => {
 // return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
//};



import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.8.101:5000/api"; // ضع IP جهازك
//const API_URL = "https://nutrihub-backend.onrender.com/api";

const AuthService = {

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("role", data.role);
      await AsyncStorage.setItem("name", data.name);
    }

    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("name");
  },

  getToken: async () => {
    return await AsyncStorage.getItem("token");
  },

  getRole: async () => {
    return await AsyncStorage.getItem("role");
  }

};

export default AuthService;