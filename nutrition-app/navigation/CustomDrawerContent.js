import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { AuthContext } from "../context/AuthContext";

const CustomDrawerContent = (props) => {
  const { logout } = useContext(AuthContext);

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>

        {/* 🔹 Default Drawer Items (Products, Recipes...) */}
        <DrawerItemList {...props} />

      </DrawerContentScrollView>

      {/* 🔻 Logout Button at Bottom */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  logoutContainer: {
    padding: 60,
    borderTopWidth: 1,
    borderColor: "#ccc"
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16
  }
});