import React from "react";
import { View, Text, Platform } from "react-native";
 import Svg, { Circle } from "react-native-svg";
let PieChartComp;

if (Platform.OS === "web") {
  const { PieChart, Pie, Tooltip, Legend } = require("recharts");

  PieChartComp = ({ plans }) => {
    const data = [
      { name: "Free", value: plans?.free || 0, fill: "#3b82f6" },
      { name: "Plus", value: plans?.plus || 0, fill: "#22c55e" },
      { name: "Pro", value: plans?.pro || 0, fill: "#ef4444" }
    ];

    return (
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={120}
          label
        />
        <Tooltip />
        <Legend />
      </PieChart>
    );
  };

} else {



PieChartComp = ({ plans }) => {
  const data = [
    { value: plans?.free || 0, color: "#3b82f6" },
    { value: plans?.plus || 0, color: "#22c55e" },
    { value: plans?.pro || 0, color: "#ef4444" }
  ];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const radius = 60;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={150} height={150}>
        {data.map((item, index) => {
          const percentage = total ? item.value / total : 0;
          const strokeDashoffset =
            circumference - circumference * percentage;

          const circle = (
            <Circle
              key={index}
              cx="75"
              cy="75"
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              rotation={cumulative * 360}
              origin="75, 75"
            />
          );

          cumulative += percentage;

          return circle;
        })}
      </Svg>

      {/* 🔢 Legend */}
      <View
  style={{
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10
  }}
>

  <Text style={{ color: "#3b82f6" }}>
    Free: {plans?.free || 0}
  </Text>

  <Text style={{ color: "#22c55e" }}>
    Plus: {plans?.plus || 0}
  </Text>

  <Text style={{ color: "#ef4444" }}>
    Pro: {plans?.pro || 0}
  </Text>

</View>
    </View>
  );
};

}

export default PieChartComp;