import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your key.
// IMPORTANT: Add VITE_GEMINI_API_KEY to your .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate a complete workout and diet plan using Gemini multimodal.
 */
export async function generateWorkoutPlan(data) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // The system prompt tailored for MuscleUp Gym (Jhalawar context)
    const prompt = `
You are a world-class fitness coach and nutritionist working at MuscleUp Gym in Jhalawar, Rajasthan, India.
A user has requested a workout and diet plan with the following details:
- Height: ${data.height} cm
- Weight: ${data.weight} kg
- Goal: ${data.goal}
- Diet Preference: ${data.dietType} (Options: Veg, Non-Veg, Veg + Egg)
- Workout Split: ${data.workoutSplit}

Your task is to generate a highly detailed, day-by-day JSON response containing their diet and workout plan.
Because the user is in Jhalawar, Rajasthan, the diet plan MUST include local Indian foods (e.g., Dal Baati, local lentils, paneer, chicken tikka if non-veg, etc.) that are easily available in this region.

Please strictly output valid JSON ONLY, with the following structure:
{
  "diet_plan": {
    "summary": "Brief summary of the diet approach.",
    "daily_calories": 2500,
    "meals": [
      { "time": "Breakfast", "food": "Poha with boiled eggs...", "calories": 400 },
      ...
    ]
  },
  "workout_plan": {
    "split_name": "${data.workoutSplit}",
    "days": [
      {
        "day": "Monday",
        "focus": "Chest and Triceps",
        "exercises": [
          { 
            "name": "Flat Bench Press", 
            "sets": 3, 
            "reps": "10-12", 
            "tips": "Keep your back arched and feet planted."
          }
        ]
      }
    ]
  }
}

Do not include markdown code block syntax (like \`\`\`json) in your response, just the raw JSON text.
`;

    const parts = [prompt];

    // If the user uploaded a photo, we append it as a multimodal part
    if (data.photoBase64 && data.photoMimeType) {
      parts.push({
        inlineData: {
          data: data.photoBase64,
          mimeType: data.photoMimeType,
        },
      });
      parts.push("Please analyze the attached physique photo and tailor the workout intensity accordingly.");
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    
    // Attempt to parse the JSON. In a production app, use robust regex or json-repair libraries.
    const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonStr);

  } catch (error) {
    console.error("Error generating AI plan:", error);
    throw new Error("Failed to generate plan. Please check your API key.");
  }
}

/**
 * Handle fitness queries from the Chatbot.
 */
export async function chatWithGymAssistant(history, message) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = `
You are the AI Assistant for MuscleUp Gym. You answer fitness, diet, and gym-related queries.
Keep your answers concise, motivating, and easy to read.
If the user asks "how to do an exercise", provide 3-4 bulleted steps.
`;

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
    });

    const fullMessage = `${systemInstruction}\n\nUser: ${message}`;
    const result = await chat.sendMessage(fullMessage);
    
    return result.response.text();
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, my brain is taking a rest right now! (Ensure your API key is valid).";
  }
}
