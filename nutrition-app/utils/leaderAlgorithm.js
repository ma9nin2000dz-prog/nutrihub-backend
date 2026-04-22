// /utils/leaderAlgorithm.js

const meals = ["breakfast", "lunch", "dinner", "snack"];

const getRecipesByMeal = (recipes) => ({
  breakfast: recipes.filter(r => r.category?.includes("breakfast")),
  lunch: recipes.filter(r => r.category?.includes("lunch")),
  dinner: recipes.filter(r => r.category?.includes("dinner")),
  snack: recipes.filter(r => r.category?.includes("snack")),
});

// 🧠 Greedy / Leader Algorithm
export function runLeaderAlgorithm(recipes, goal, budget) {
  const recipesByMeal = getRecipesByMeal(recipes);

  const plan = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  };

  let totals = {
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    cost: 0
  };

  meals.forEach(meal => {
    const pool = recipesByMeal[meal];

    if (!pool || pool.length === 0) return;

    // 🏆 نختار أفضل recipe حسب الهدف
    const sorted = [...pool].sort((a, b) => {
      const scoreA =
        Math.abs(goal.calories - (totals.calories + (a.nutrition?.energyKcal || 0)));
      const scoreB =
        Math.abs(goal.calories - (totals.calories + (b.nutrition?.energyKcal || 0)));

      return scoreA - scoreB;
    });

    const best = sorted[0];

    if (best) {
      plan[meal].push(best);

      totals.protein += best.nutrition?.protein || 0;
      totals.carbs += best.nutrition?.carbohydrates || 0;
      totals.fat += best.nutrition?.fat || 0;
      totals.calories += best.nutrition?.energyKcal || 0;
      totals.cost += best.price || 0;
    }
  });

  return plan;
}