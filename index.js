import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from '@langchain/core/output_parsers';    
import { retriever } from './utils/retriever.js';
import { combineDocuments } from './utils/combineDocuments.js';
import {  RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { formatConvHistory } from "./utils/formatConvHistory.js";


document.addEventListener('submit', (e) => {
    e.preventDefault()
    progressConversation()
})


const GeminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const llm = new ChatGoogleGenerativeAI({
    apiKey: GeminiApiKey,
    model: "models/gemini-2.5-flash" 
});

const standAloneQuestionTemplate = `Given some conversation history (if any) and
 a question, convert the question to a standalone question.
 Conversation History: {convHistory}
 Question: {question} standalone question:`;

const standAloneQuestionPrompt = PromptTemplate.fromTemplate(standAloneQuestionTemplate);


const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about 
{HealthCareSolution} based on the context provided and the Conversation history. Try to find the answer in the context.
If the answer is not given in the context, find the answer in the conversation history if possible.If you really dont konw the answer, say "I'm sorry,I don't know the answer to that."
 And direct the questioner to email support@healthcare.eg.com .Don't try to make up an answerTemplate. 
 Always speak as if you were chatting to a Friend
Context: {context}
Conversation History: {convHistory}
Question: {question}
Answer:`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

const standaloneQuestionChain = 
    standAloneQuestionPrompt.pipe(llm)
                            .pipe(new StringOutputParser());
    
const retrieverChain = RunnableSequence.from([
    prevResult=>prevResult.standAloneQuestion,
    retriever,
    combineDocuments
]);

const answerChain = answerPrompt.pipe(llm)
                .pipe(new StringOutputParser())

const chain = RunnableSequence.from([
    {
        standAloneQuestion: standaloneQuestionChain,
        originalInput:new RunnablePassthrough()
    },
    {
        context: retrieverChain,
        question:({originalInput})=>originalInput.question,
        convHistory:({originalInput})=>originalInput.convHistory,
        HealthCareSolution:({originalInput})=>originalInput.HealthCareSolution
    },
    answerChain
]);

const convHistory = [];

async function progressConversation() {
    const userInput = document.getElementById('user-input')
    const chatbotConversation = document.getElementById('chatbot-conversation-container')
    const question = userInput.value
    userInput.value = ''

    // add human message
    const newHumanSpeechBubble = document.createElement('div')
    newHumanSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newHumanSpeechBubble)
    newHumanSpeechBubble.textContent = question
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight

    const response = await chain.invoke({
    question: question,
    convHistory: formatConvHistory(convHistory),
    HealthCareSolution: "WINPLC"
});
    convHistory.push(question);
    convHistory.push(response);

    // add AI message
    const newAiSpeechBubble = document.createElement('div')
    newAiSpeechBubble.classList.add('speech', 'speech-ai')
    chatbotConversation.appendChild(newAiSpeechBubble)
    newAiSpeechBubble.textContent = response
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
}