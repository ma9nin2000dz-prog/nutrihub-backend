const mongoose = require("mongoose");
const xlsx = require("xlsx");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  const toNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const importData = async () => {
  try {

    const workbook = xlsx.readFile("./data/all_algeria_products add fruits and vegetables (1).xlsx");
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log(Object.keys(data[0]));
    // حذف القديم
    await Product.deleteMany();

    const formattedData = data
      .filter(item => item["Product Name"] && item["Product Name"].trim() !== "")
     
      .map(item => ({
        barcode: item["Barcode"]?.toString() || "",
        name: item["Product Name"] || "",
        brand: item["Brand"]?.toString().trim() || "Unknown",
        price: 0, // 🔥 سعر افتراضي

        nutrition: {
          energyKcal: toNumber(item["Energy-Kcal"] ),
          carbohydrates: toNumber(item["Carbohydrates"] ),
          sugar: toNumber(item["Sugars"] ),
          fat: toNumber(item["Fat"] ),
          saturatedFat: toNumber(item["Saturated-Fat"] ),
          protein: toNumber(item["Proteins"] ),
          fiber: toNumber(item["Fiber"] ),
          magnesium: toNumber(item["Magnesium(mg)"] ),
          calcium:toNumber(item["Calcium(mg)"] ),
          salt: toNumber(item["Salt"] ),
          potassium: toNumber(item["Potassium(mg)"] ),
          sodium: toNumber(item["Sodium(g)"] ),
        },

        nutritionScore: toNumber(item["Nutrition-Score-Fr"] ),
        novaGroup: toNumber(item["Nova-Group"] )
      }));

    await Product.insertMany(formattedData);

    console.log("Data Imported Successfully ✅");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();