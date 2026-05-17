 // /utils/geneticAlgorithm.js

const meals = ["breakfast", "lunch", "dinner", "snack"];


const removeDuplicates = (plan) => {
  const used = new Set();

  meals.forEach(meal => {
    plan[meal] = plan[meal].filter(r => {
      if (used.has(r._id)) return false;
      used.add(r._id);
      return true;
    });
  });

  return plan;
};

const getRecipesByMeal = (recipes) => ({
  breakfast: recipes.filter(r => r.category?.includes("breakfast")),
  lunch: recipes.filter(r => r.category?.includes("lunch")),
  dinner: recipes.filter(r => r.category?.includes("dinner")),
  snack: recipes.filter(r => r.category?.includes("snack")),
});
// ---------------------------
// 🧬 Generate Random Plan
// ---------------------------
export function generateRandomPlan(recipes) {

  const recipesByMeal = getRecipesByMeal(recipes);

  const plan = {};

  meals.forEach(meal => {

    const pool = recipesByMeal[meal];

    if (!pool || pool.length === 0) {
      plan[meal] = [];
      return;
    }

    const count = Math.floor(Math.random() * 2) + 1;

    plan[meal] = Array.from({ length: count }, () =>
      pool[Math.floor(Math.random() * pool.length)]
    );
  });

  return plan;
}

// ---------------------------
// 🧮 Calculate Totals
// ---------------------------
export function calculateTotals(plan) {
  const totals = {
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    cost: 0
  };

  Object.values(plan).forEach(meal => {
    meal.forEach(r => {
      totals.protein += r.nutrition?.protein || 0;
      totals.carbs += r.nutrition?.carbohydrates || 0;
      totals.fat += r.nutrition?.fat || 0;
      totals.calories += r.nutrition?.energyKcal || 0;
      totals.cost += r.price || 0;
    });
  });

  return totals;
}

// ---------------------------
// 🎯 Fitness Function
// ---------------------------
export function fitness(plan, goal, budget, a = 1, b = 1) {
  const t = calculateTotals(plan);

  

    
    let nutritionError =
  Math.abs(goal.protein - t.protein) / goal.protein +
  Math.abs(goal.carbs - t.carbs) / goal.carbs +
  Math.abs(goal.fat - t.fat) / goal.fat +
  Math.abs(goal.calories - t.calories) / goal.calories;

  // 🔥 ADD PENALTY FOR EMPTY MEALS
  Object.entries(plan).forEach(([meal, items]) => {
    if (!items || items.length === 0) {
      nutritionError += 5;//500; // penalty
    }
  });

  const costPenalty = Math.max(0, t.cost - budget);

  return a * nutritionError + b * costPenalty;
}

// ---------------------------
// 🔀 Crossover
// ---------------------------
export function crossover(p1, p2, recipes) {

  const recipesByMeal = getRecipesByMeal(recipes);

  const child = {};

  meals.forEach(meal => {

    const source = Math.random() < 0.5
      ? p1[meal]
      : p2[meal];

    const pool = recipesByMeal[meal];

    // 🔥 FILTER IMPORTANT
    child[meal] = (source || []).filter(r =>
      r.category?.includes(meal)
    );

    // 🔥 fallback إذا صار empty
    if (child[meal].length === 0 && pool.length > 0) {
      child[meal] = [
        pool[Math.floor(Math.random() * pool.length)]
      ];
    }

  });

  return child;
}
// ---------------------------
// 🔄 Mutation (exactly as you defined)
// ---------------------------
export function mutate(plan, recipes) {

  const recipesByMeal = getRecipesByMeal(recipes); // 🔥 مهم

  const meal = meals[Math.floor(Math.random() * meals.length)];
  const type = Math.floor(Math.random() * 3);

  const pool = recipesByMeal[meal];

  if (!pool || pool.length === 0) return plan;

  // 1️⃣ quantity mutation
  if (type === 0) {
    const size = Math.floor(Math.random() * 3) + 1;

    plan[meal] = Array.from({ length: size }, () =>
      pool[Math.floor(Math.random() * pool.length)]
    );
  }

  // 2️⃣ switch mutation
  if (type === 1 && plan[meal].length > 0) {
    const i = Math.floor(Math.random() * plan[meal].length);
    plan[meal][i] =
      pool[Math.floor(Math.random() * pool.length)];
  }

  // 3️⃣ add/remove mutation
  if (type === 2) {
    if (Math.random() < 0.5 && plan[meal].length > 0) {
      const i = Math.floor(Math.random() * plan[meal].length);
      plan[meal].splice(i, 1);
    } else {
      plan[meal].push(
        pool[Math.floor(Math.random() * pool.length)]
      );
    }
  }

  return plan;
}
// ---------------------------
// 🧬 Main Genetic Algorithm
// ---------------------------
export function runGA(
  recipes,
  goal,
  budget,
  options = {}
) {
  const {
    populationSize = 30,
    generations = 30,
    mutationRate = 0.3,
    a = 1,
    b = 1
  } = options;

  let population = [];

  //  Initial population
  for (let i = 0; i < populationSize; i++) {
    /*population.push({
      plan: generateRandomPlan(recipes)
    });*/
    population.push({
  plan: removeDuplicates(generateRandomPlan(recipes))
});
  }

  // 🔁 Evolution loop
  for (let gen = 0; gen < generations; gen++) {

    // Evaluate fitness
    population.forEach(ind => {
      ind.fitness = fitness(ind.plan, goal, budget, a, b);
    });

    // Sort (best first)
    population.sort((a, b) => a.fitness - b.fitness);

    // Select best half
    const selected = population.slice(0, populationSize / 2);

    const newPopulation = [];

    // Create new generation
    while (newPopulation.length < populationSize) {
      const p1 = selected[Math.floor(Math.random() * selected.length)];
      const p2 = selected[Math.floor(Math.random() * selected.length)];

     let childPlan = crossover(p1.plan, p2.plan, recipes);
      // Mutation
      childPlan = removeDuplicates(childPlan);

      if (Math.random() < mutationRate) {
        childPlan = mutate(childPlan, recipes);
        
        childPlan = removeDuplicates(childPlan);
      }

      newPopulation.push({ plan: childPlan });
    }

    population = newPopulation;
  }

  // Final evaluation
  population.forEach(ind => {
    ind.fitness = fitness(ind.plan, goal, budget, a, b);
  });

  population.sort((a, b) => a.fitness - b.fitness);

  return population[0].plan; // 🏆 best plan
}