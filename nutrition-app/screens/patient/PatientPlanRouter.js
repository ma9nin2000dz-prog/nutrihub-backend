import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

import FreePlan from "../free/FreePlan";
import PlusPlan from "../plus/PlusPlan";
import ProPlan from "../pro/ProPlan";

export default function PatientPlanRouter() {

  const { userPlan } = useContext(AuthContext);

  if (userPlan === "Plus") return <PlusPlan />;
  if (userPlan === "Pro") return <ProPlan />;
  
  return <FreePlan />;
}