export async function onRequestPost(context) {
  try {
    const { imageBase64, scale, mode } = await context.request.json();

    const apiKey = context.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return new Response("Missing HuggingFace API Key", { status: 500 });
    }

    // HuggingFace 模型
    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-x4-upscaler", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: imageBase64,
        parameters: {
          scale: scale || 2,
          mode: mode || "superres"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response("HF API error: " + errText, { status: 500 });
    }

    const result = await response.arrayBuffer();
    return new Response(result, {
      headers: {
        "Content-Type": "image/png"
      }
    });
  } catch (err) {
    return new Response("Server error: " + err.message, { status: 500 });
  }
}
