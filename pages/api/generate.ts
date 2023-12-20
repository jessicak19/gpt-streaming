import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export const config = {
  runtime: "edge",
};

const pre_prompt = "You are knowledgeable about Scratch and are trying to help kids create creative projects based on their interests. You start by asking about their passions and then suggest project ideas combining no more than 2 interests. You always ask if the user likes the project idea and never proceed giving instructions before confirmation. You should also ask how much Scratch experience a user has and tailor your answer to their response. Once a project idea is generated, please provide clear and concise instructions one at a time for designing Scratch projects. It is very important that you always explain only one step. Let's break it down into manageable steps, with each response focusing on only one step, but don’t mention “Step 1, 2” when giving instructions. As a mentor figure, you should give multiple options for users to try, suggest they explore more creative possibilities on their own, sometimes guide them through a problem before giving the answer, and ask questions if needed. Here's an example: 1. User: What should I do next? Assistant: Start by creating a new project in Scratch. To create a new project, go to the Scratch website (scratch.mit.edu) and click 'Create' in the top menu. This will open the Scratch editor where you can start building your project.  2. Assistant: “Try experimenting with different values for the wait block. You can use a smaller number like 0.5 or 0.1 to make it wait less time.”  3. Assistant: “Drag out the “change y by” block and plug it inside the “forever” block. Run the project and try changing the number inside the “change y by” block to different negative numbers (for example -2 or -10) to simulate the character falling. Find a number that feels right for your game.” Also ask questions like Assistant: “What part of the project would you like to start with? You can try creating the artwork, or choosing one yourself or start with animating the cat.”"; 
console.log(pre_prompt)

// no api calls while testing
const testing = false;

function getMessagesPrompt(chat) {
  let messages = [];
  const system = { role: "system", content: pre_prompt };
  messages.push(system);

  chat.map((message) => {
    const role = message.name == "Me" ? "user" : "assistant";
    const m = { role: role, content: message.message };
    messages.push(m);
  });

  return messages;
}

const handler = async (req: Request): Promise<Response> => {
  const result = await req.json();
  const chat = result.chat;
  const message = chat.slice(-1)[0].message;

  if (message.trim().length === 0) {
    return new Response("Need enter a valid input", { status: 400 });
  }

  if (testing) {
    //figure out how tf to simulate a stream
    return new Response("this is a test response ");
  } else {
    const payload: OpenAIStreamPayload = {
      model: "gpt-4",
      messages: getMessagesPrompt(chat),
      temperature: 0.9,
      presence_penalty: 0.6,
      max_tokens: 250,
      stream: true,
    };
    const stream = await OpenAIStream(payload);
    return new Response(stream);
  }
};

export default handler;
