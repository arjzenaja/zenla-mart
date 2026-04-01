const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Checking available models...");
    
    // Listing models is actually done via a separate method if using the REST API directly, 
    // but in the SDK it's not directly exposed as easily in older versions.
    // However, let's try a few model names.
    
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-pro-latest",
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ ${modelName} successful!`);
        console.log("Response:", result.response.text());
        return; // Stop if one works
      } catch (err) {
        console.error(`❌ ${modelName} failed:`, err.message);
      }
    }
  } catch (error) {
    console.error("Error checking models:");
    console.error(error);
  }
}

checkModels();
