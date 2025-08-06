import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import 'dotenv/config';
const GeminiApiKey = process.env.GEMINI_API_KEY;

const llm = new ChatGoogleGenerativeAI({apiKey: GeminiApiKey,model: "models/gemini-2.5-flash"});

const tweetTemplate = 'Generate a promotional tweet for a product, from this product description: {productDescription}';
const tweetPrompt = PromptTemplate.fromTemplate(tweetTemplate);

const tweetChain = tweetPrompt.pipe(llm);

const response = await tweetChain.invoke({
    productDescription: "A health care Ai Asistant that helps you to get information about patients basic data, medicine history, appointments, lab results, services with a simple chat interface.It will avoid navigation to different screens or long browsing through the app. It will also help you to get information about your patients in a more efficient way."
})

console.log(response.content);