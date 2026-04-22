import React from "react";
import { View, Text, Platform } from "react-native";

/* 🔥 format days */
const formatDay = (day) => {
  const map = {
    Sun: "S",
    Mon: "M",
    Tue: "T",
    Wed: "W",
    Thu: "Th",
    Fri: "F",
    Sat: "Sa"
  };

  return map[day] || day;
};

let Chart;

/* ================= WEB ================= */
if (Platform.OS === "web") {
  const {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
  } = require("recharts");

  Chart = ({ data = [], height = 200, color = "#38bdf8" }) => (
    <View style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#2a2f45" strokeDasharray="3 3" />

          <XAxis
            dataKey="day"
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <YAxis
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "none",
              borderRadius: 10,
              color: "#fff"
            }}
          />

          <Bar
            dataKey="users"
            fill={color}
            radius={[6, 6, 0, 0]}
            barSize={25}
          />
        </BarChart>
      </ResponsiveContainer>
    </View>
  );
}

/* ================= MOBILE ================= */
if (!Chart) {
  Chart = ({ data = [], height = 180, color = "#38bdf8", small = false }) => {
    const max = Math.max(...data.map(d => d.users), 1);

    const chartHeight = height - 30; // 🔥 مساحة X axis

    const steps = Math.min(4, max); // 🔥 ما نخلوش steps أكبر من max

const values = Array.from({ length: steps + 1 }, (_, i) =>
  Math.round((max / steps) * (steps - i))
);

    return (
      <View style={{ height, overflow: "hidden" }}>

        {/* 🔢 Y AXIS */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 30,
            justifyContent: "space-between"
          }}
        >
          {values.map((v, i) => (
            <Text key={i} style={{ color: "#9ca3af", fontSize: 10 }}>
              {v}
            </Text>
          ))}
        </View>

        {/* 📊 BARS */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginLeft: 2,
            paddingHorizontal: 15,
            height: chartHeight
          }}
        >
          {data.map((item, i) => (
            <View key={i} style={{ alignItems: "center" }}>

              <View
  style={{
    width: height < 150 ? 8 : 16,
    height: (item.users / max) * chartHeight,
    backgroundColor: color,
    borderRadius: 4,
    marginHorizontal: height < 150 ? 1 : 2
  }}
/>

             {!small && (
  <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
    {formatDay(item.day)}
  </Text>
)}

            </View>
          ))}
        </View>

      </View>
    );
  };
}

export default Chart;