//import React from 'react';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { apiRequest } from "../../services/api";
export default function VisitorScreen({ navigation }) {

  const [plans, setPlans] = useState([]);


  const loadPlans = async () => {
  try {
    const data = await apiRequest("plans");
    setPlans(data);
  } catch (err) {
    console.log("ERROR PLANS:", err);
  }
};


useEffect(() => {
  loadPlans();
}, []);


const getPrice = (name) => {
  return plans.find(p => p.name === name)?.price || "...";
};



  return (
    <ScrollView contentContainerStyle={styles.container}>
<Image
 source={require("../../assets/visitor-food.jpg")}
 style={styles.image}
/>

      <Text style={styles.title}>Welcome to My NutriHub</Text>

      <Text style={styles.description}>
        Track calories, analyze food, and improve your health with smart tools.
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Signup', { plan: 'Free' })}
      >
        <Text style={styles.planTitle}>Free Plan</Text>
        <Text style={styles.price}>0 DA / month</Text>
        <Text>- Basic product search</Text>
        <Text>- Foodstuffs price</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.popularCard]}
        onPress={() => navigation.navigate('Signup', { plan: 'Plus' })}
      >
        <Text style={styles.planTitle}>Plus Plan (Most Popular)</Text>
        <Text style={styles.price}>
  {getPrice("Plus")} DA / month
</Text>
        <Text>- Foodstuffs prices</Text>
        <Text>- Recipes</Text>
        <Text>- Nutrition tracking</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Signup', { plan: 'Pro' })}
      >
        <Text style={styles.planTitle}>Pro Plan</Text>
        <Text style={styles.price}>
  {getPrice("Pro")} DA / month
</Text>
        <Text>- Everything in Plus</Text>
        <Text>- AI nutrition analysis</Text>
        <Text>- Advanced reports</Text>
        <Text>- Expert tracking</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>





   



    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingBottom:40,
    backgroundColor: '#f3f5f4'
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
      marginTop:30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
    textAlign: 'center'
  },
  description: {
    textAlign: 'center',
    marginBottom: 20
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    marginBottom: 20,
    elevation: 4
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#2ecc71'
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  price: {
    fontSize: 20,
    color: 'green',
    marginVertical: 10
  },
  loginBtn: {
    backgroundColor: 'green',
    width: '100%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20
  },
  btnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    
  },
  adminBtn: {
    backgroundColor: '#000',
    width: '100%',
    padding: 15,
    borderRadius: 10
  },
  adminText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});