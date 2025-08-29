export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await context.request.json();
    const { imageBase64, scale = 4 } = body;  // 默認 4x，因為模型固定

    if (!imageBase64) {
      console.error("Missing image data");
      return new Response(JSON.stringify({ error: "Missing image data" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 檢查輸入大小（HF 免費 API 有限制，避免大圖失敗）
    const base64Size = imageBase64.length * (3/4);  // 粗略估計 bytes
    if (base64Size > 1 * 1024 * 1024) {  // >1MB
      console.error("Image too large for free API");
      return new Response(JSON.stringify({ error: "Image too large (max 1MB for free API)" }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = context.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.error("Missing HuggingFace API Key");
      return new Response(JSON.stringify({ error: "API configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Calling HF API with model: nightmareai/real-esrgan");

    const response = await fetch(
      "https://api-inference.huggingface.co/models/nightmareai/real-esrgan",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: imageBase64.split(',')[1]  // 移除前綴，僅 base64 數據
          // 移除 parameters: { scale }，因為這個模型不支持自定義 scale（固定 4x）
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("HuggingFace API error:", errText);
      return new Response(JSON.stringify({ error: "AI processing failed: " + errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Result = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    console.log("HF API success, returning image");

    return new Response(JSON.stringify({
      success: true,
      image: `data:image/png;base64,${base64Result}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Server error:", err.message || err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}