import OpenAI from "openai";

const client = new OpenAI(
  {
    apiKey: process.env.ROUTER_API_KEY,
    baseURL: "https://routerai.ru/api/v1"
  }
);

export async function POST(req: Request) {
  const body = await req.json();
  const list = body.messages ?? [];
  const lastUser = [...list].reverse().find((m: { role?: string }) => m.role === "user");
  const userText = lastUser?.parts?.[0]?.text ?? "";
  console.log("body (последнее сообщение пользователя):", userText);

  const response = await client.chat.completions.create({
    model: "google/gemini-3-pro-preview",
    messages: [{ role: "user", content: userText }],
  });

  const answer = response.choices[0]?.message?.content ?? "";
  console.log("ответ запроса:", answer);

  return new Response(answer);
}
