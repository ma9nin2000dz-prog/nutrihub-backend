import React, { useEffect, useState,useCallback  } from "react";
import { View, Text, StyleSheet, ScrollView,Platform,TouchableOpacity } from "react-native";
import StatCard from "./StatCard";
import VisitorsChart from "./VisitorsChart";
import UsersChart from "./UsersChart";
import PlanPieChart from "./PlanPieChart";
import LatestUsers from "./LatestUsers";
import PendingApprovals from "./PendingApprovals";
///import Calendar from "react-calendar";
import ChartSwitcher from "../../../components/ChartSwitcher";
/////////appp
import PlanRequests from "./PlanRequests";
//import { Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
//import { useCallback } from "react";
import { Switch } from "react-native";
/*let Calendar;

if (Platform.OS === "web") {
  Calendar = require("react-calendar").default;
} else {
  Calendar = require("react-native-calendars").Calendar;
}*/
const Calendar = require("react-native-calendars").Calendar;
////////////////////////app///////////////////////////////////
import { apiRequest } from "../../../services/api";
import AdminTopBar from "../../../components/AdminTopBar";


console.log("DEBUG:", {
  StatCard,
  VisitorsChart,
  UsersChart,
  PlanPieChart,
  LatestUsers,
  PendingApprovals,
  ChartSwitcher,
  PlanRequests,
  AdminTopBar
});
export default function AdminDashboardScreen() {

  const [mode, setMode] = useState("monthly");
  
  const [selectedDate, setSelectedDate] = useState(null);
const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true);
 const [stats, setStats] = useState({
  recipes: 0,
  products: 0,
  experts: 0,
  patients: 0,
  visitors: 0,
  users: 0,
  expertsGrowth: 0,
  patientsGrowth: 0,
  weeklyVisitors:[],
  weeklyUsersExperts: [],
weeklyUsersPatients: []
});

const [plans, setPlans] = useState({
  free: 0,
  plus: 0,
  pro: 0
});
const [admin,setAdmin] = useState({});

  useFocusEffect(
  useCallback(() => {
    fetchStats();
    loadSettings();
    fetchProfit();
  }, [])
);

 const fetchStats = async () => {
  try {

    const data = await apiRequest("admin/dashboard");

    setStats({
  ...data.counts,

  expertsGrowth: data.growth?.experts || 0,
  patientsGrowth: data.growth?.patients || 0,

  weeklyVisitors: data.weeklyVisitors || [],

 weeklyUsersExperts: data.weeklyUsersExperts || [],
  weeklyUsersPatients: data.weeklyUsersPatients || [],

  planRequests: data.planRequests || [],
  pendingApprovals: data.pendingApprovals || [] 
});

    setPlans(data.plans || { free:0, plus:0, pro:0 });
    setAdmin(data.admin || {});
  } catch (err) {
    console.log(err);
  }
};
///////////////////////////////////////
const [profitData, setProfitData] = useState({
  daily: {},
  totalMonth: 0,
  totalWeek: 0
});


/////////////////////////////
const loadSettings = async () => {
  try {
    const res = await apiRequest("settings");
    setEmailVerificationEnabled(res.emailVerificationEnabled);
  } catch (err) {
    console.log(err);
  }
};

//////////////////////////////////
const updateSetting = async (value) => {
  try {
    setEmailVerificationEnabled(value);

    await apiRequest("settings", "PUT", {
      emailVerificationEnabled: value
    });

    await loadSettings(); // 🔥 هذا هو الحل

  } catch (err) {
    console.log(err);
  }
};
///////////////////////////
const addToPending = (user) => {
  setStats(prev => ({
    ...prev,
    pendingApprovals: [
      ...(prev.pendingApprovals || []),
      user
    ]
  }));
};
///////////////////////////////////////////////////////////////
const approvePlan = async (id, plan) => {
  try {
    await apiRequest(`users/${id}/plan`, "PUT", {
      plan: plan,
      requestedPlan: null ,
      //status: "pending" 
    });

    //fetchStats(); // refresh
    setStats(prev => {
  const approvedUser = prev.planRequests.find(u => u._id === id);

  return {
    ...prev,

    // ❌ حذف من requests
    planRequests: prev.planRequests.filter(u => u._id !== id),

    // ✅ إضافة مباشرة إلى pending
    pendingApprovals: [
      ...(prev.pendingApprovals || []),
      { ...approvedUser, status: "pending", plan }
    ]
  };
});
  } catch (err) {
    console.log(err);
  }
};

const rejectPlan = async (id) => {
  try {
    await apiRequest(`users/${id}/plan`, "PUT", {
      plan: "Free"
    });

    fetchStats();
  } catch (err) {
    console.log(err);
  }
};
//////////////////////////////////////////////
const approvePending = async (id) => {
  try {
    await apiRequest(`users/patients/${id}/approve`, "PUT");
    fetchStats();
  } catch (err) {
    console.log(err);
  }
};
///////////////////calonder //////////////////
const fetchProfit = async () => {
  try {
    const data = await apiRequest("stats/profit");
    setProfitData(data);
  } catch (err) {
    console.log("PROFIT ERROR:", err);
  }
};

///////////////////////////


const markedDates = {};

Object.keys(profitData.daily || {}).forEach(date => {
  if (profitData.daily[date] > 0) {
    markedDates[date] = {
      selected: true,
      selectedColor: "#22c55e"
    };
  }
});
/////////////////////////////////////////////////

/*const getProfit = () => {
  if (mode === "daily") {
    return selectedDate
      ? profitData.daily[selectedDate] || 0
      : 0;
  }

  if (mode === "weekly") {
    return profitData.totalWeek;
  }

  return profitData.totalMonth;
};*/
const getProfit = () => {
  if (mode === "daily") {

    // 🔥 إذا ما اختارش يوم → نجيب اليوم الحالي
    const today = new Date().toISOString().split("T")[0];

    const date = selectedDate || today;

    return profitData.daily[date] || 0;
  }

  if (mode === "weekly") {
    return profitData.totalWeek;
  }

  return profitData.totalMonth;
};
////////////////////////////////////////////////////////

const getGrowth = () => {
  if (mode === "weekly") {
    const prev = profitData.lastWeek || 0;
    const curr = profitData.totalWeek || 0;
    if (prev === 0) return 0;
    return ((curr - prev) / prev * 100).toFixed(1);
  }

  if (mode === "monthly") {
    const prev = profitData.lastMonth || 0;
    const curr = profitData.totalMonth || 0;
    if (prev === 0) return 0;
    return ((curr - prev) / prev * 100).toFixed(1);
  }

  return 0;
};

const growth = getGrowth();
const isUp = growth >= 0;


  return (


<View style={styles.container}>

<AdminTopBar
  adminName={admin.name}
  adminPhoto={admin.photo}
/>

  <ScrollView contentContainerStyle={styles.content}>

    <Text style={styles.title}>Admin Dashboard</Text>

<View style={{ 
  flexDirection: "row", 
  alignItems: "center", 
  justifyContent: "space-between",
  marginBottom: 15
}}>
  <Text style={{ fontWeight: "600" }}>
    Email Verification
  </Text>

  <Switch
    value={emailVerificationEnabled}
    onValueChange={updateSetting}
  />
  </View>
    {/* STAT CARDS */}

    <View style={styles.cardsRow}>

      <StatCard title="Recipes" value={stats.recipes} />

      <StatCard title="Products" value={stats.products} />

      <StatCard
        title="Experts"
        value={stats.experts}
        growth={stats.expertsGrowth}
      />

      <StatCard
        title="Patients"
        value={stats.patients}
        growth={stats.patientsGrowth}
      />

    </View>

    {/* CHARTS */}

  <View style={styles.chartsRow}>

  {/* 🔵 CHART */}
  <View style={styles.chartCard}>
    <Text style={styles.chartTitle}>Analytics Overview</Text>

    <ChartSwitcher
     /* visitors={<VisitorsChart data={stats.weeklyVisitors} />}*/
      experts={<UsersChart data={stats.weeklyUsersExperts} color="#22c55e" />}
      patients={<UsersChart data={stats.weeklyUsersPatients} color="#a855f7" />}
    />
  </View>

  {/* 🟡 REQUESTS */}
  <View style={styles.requestCard}>
    <PlanRequests
      requests={stats.planRequests || []}
      onAccept={approvePlan}
      onReject={rejectPlan}
    />
  </View>

</View>

    {/* SECOND ROW */}

    <View style={styles.chartsRow}>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Plan Distribution</Text>
        <PlanPieChart plans={plans} />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Calendar</Text>
  <Calendar
  markedDates={markedDates}
 onDayPress={(day) => {
  setSelectedDate(day.dateString);
}}
/>





{/*<View style={{
  flexDirection: "row",
  justifyContent: "space-around",
  marginTop: 10
}}>

  <Text
    onPress={() => setMode("daily")}
    style={{ color: mode === "daily" ? "#22c55e" : "gray" }}
  >
    Daily
  </Text>

  <Text
    onPress={() => setMode("weekly")}
    style={{ color: mode === "weekly" ? "#22c55e" : "gray" }}
  >
    Weekly
  </Text>

  <Text
    onPress={() => setMode("monthly")}
    style={{ color: mode === "monthly" ? "#22c55e" : "gray" }}
  >
    Monthly
  </Text>

</View>*/}
<View style={{
  flexDirection: "row",
  justifyContent: "space-around",
  marginTop: 10
}}>

  {/* DAILY */}
  <TouchableOpacity
    onPress={() => setMode("daily")}
    style={{
      backgroundColor: mode === "daily" ? "#22c55e" : "#e5e7eb",
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 10
    }}
  >
    <Text style={{
      color: mode === "daily" ? "white" : "#374151",
      fontWeight: "600"
    }}>
      Daily
    </Text>
  </TouchableOpacity>

  {/* WEEKLY */}
  <TouchableOpacity
    onPress={() => setMode("weekly")}
    style={{
      backgroundColor: mode === "weekly" ? "#22c55e" : "#e5e7eb",
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 10
    }}
  >
    <Text style={{
      color: mode === "weekly" ? "white" : "#374151",
      fontWeight: "600"
    }}>
      Weekly
    </Text>
  </TouchableOpacity>

  {/* MONTHLY */}
  <TouchableOpacity
    onPress={() => setMode("monthly")}
    style={{
      backgroundColor: mode === "monthly" ? "#22c55e" : "#e5e7eb",
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 10
    }}
  >
    <Text style={{
      color: mode === "monthly" ? "white" : "#374151",
      fontWeight: "600"
    }}>
      Monthly
    </Text>
  </TouchableOpacity>

</View>









<View style={{
  backgroundColor: "#0f172a",
  padding: 20,
  borderRadius: 15,
  marginTop: 15
}}>
  <Text style={{ color: "#94a3b8" }}>
    {mode === "daily"
      ? "Daily Profit"
      : mode === "weekly"
      ? "Weekly Profit"
      : "Monthly Profit"}
  </Text>

  <Text style={{
    color: "white",
    fontSize: 28,
    fontWeight: "bold"
  }}>
    {getProfit()} DA
  </Text>

  {/* 👇 هنا بالضبط */}
  {mode !== "daily" && (
    <Text style={{
      color: isUp ? "#22c55e" : "#ef4444",
      marginTop: 5,
      fontWeight: "bold"
    }}>
      {isUp ? "↑" : "↓"} {Math.abs(growth)}%
    </Text>
  )}

</View>


      </View>

    </View>

    {/* TABLES */}

    <View style={styles.tablesRow}>
      <LatestUsers />
      <PendingApprovals 
  users={stats.pendingApprovals || []} 
  onApprove={approvePending}
/>
     
    </View>

  </ScrollView>

</View>

);
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20,
    backgroundColor:"#F5F7FB"
  },

  title:{
    fontSize:28,
    fontWeight:"bold",
    marginBottom:20
  },

 /* cardsRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:20
  },*/
  cardsRow:{
  flexDirection: Platform.OS === "web" ? "row" : "row",
  flexWrap:"wrap",
  gap:10,
  marginBottom:20
},
chartsRow:{
  flexDirection: Platform.OS === "web" ? "row" : "column",
  gap:20,
  marginBottom:20
},



  /*chartsRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:20
  },*/

  /*tablesRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:40
  },*/
  tablesRow:{
  flexDirection: Platform.OS === "web" ? "row" : "column",
  gap:20,
  marginBottom:40
},

 
chartCard:{
  backgroundColor:"#fff",
  padding:20,
  borderRadius:12,
  width: Platform.OS === "web" ? "60%" : "100%",
  shadowColor:"#000",
  shadowOpacity:0.05,
  shadowRadius:10
},

chartTitle:{
  fontSize:18,
  fontWeight:"600",
  marginBottom:15
},
requestCard: {
  flex: 1,
  backgroundColor: "#fff",
  padding: 15,
  borderRadius: 12,
  maxHeight: 350
},
chartCard:{
  backgroundColor:"#fff",
  padding:20,
  borderRadius:15,

  shadowColor:"#000",
  shadowOffset:{ width:0, height:5 },
  shadowOpacity:0.1,
  shadowRadius:10,
  elevation:5,

  width: Platform.OS === "web" ? "60%" : "100%",
},
requestCard: {
  flex: 1,
  backgroundColor: "#fff",
  padding: 15,
  borderRadius: 15,

  shadowColor:"#000",
  shadowOffset:{ width:0, height:5 },
  shadowOpacity:0.1,
  shadowRadius:10,
  elevation:5,

  maxHeight: 350
},
});