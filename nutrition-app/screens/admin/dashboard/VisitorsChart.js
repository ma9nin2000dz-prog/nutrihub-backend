import React from "react";
import { View, Platform,Text  } from "react-native";

let Chart;

if (Platform.OS === "web") {
  const {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
  } = require("recharts");

  Chart = ({ data = [], height = 260 }) => (
    <View style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid stroke="#2a2f45" strokeDasharray="3 3" />

          <XAxis dataKey="day" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />

          <Tooltip />

          <Bar dataKey="visitors" fill="#facc15" />
          <Line dataKey="visitors" stroke="#22c55e" />
        </ComposedChart>
      </ResponsiveContainer>
    </View>
  );
} else {
  // 🔥 fallback mobile
  Chart = () => (
    <View style={{ padding: 20 }}>
      <Text>Chart not supported on mobile</Text>
    </View>
  );
}

export default Chart;