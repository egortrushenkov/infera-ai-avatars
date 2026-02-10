const ROUTER_API_URL = "https://routerai.ru/api/v1/chat/completions";

export async function POST(req: Request) {
  const { text } = await req.json().catch(() => ({}));
  if (!text || typeof text !== "string") {
    return new Response(JSON.stringify({ error: "text required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ROUTER_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(ROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-audio-mini",
      stream: true,
      modalities: ["text", "audio"],
      messages: [
        {
          role: "system",
          content:
            "Ты озвучиваешь готовый текст. Повтори слово в слово следующее сообщение пользователя, без добавлений и изменений. Никакого вступления — только сам текст.",
        },
        { role: "user", content: text },
      ],
      audio: {
        voice: "nova",
        format: "pcm16",
      },
    }),
  });

  if (!res.ok || !res.body) {
    return new Response(
      JSON.stringify({ error: "RouterAI audio request failed", status: res.status }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
