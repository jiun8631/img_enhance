export async function onRequestPost(context) {
  // 添加 CORS 支持
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 處理 OPTIONS 請求（CORS 預檢）
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, scale = 2 } = await context.request.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "Missing image data" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = context.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 使用 Real-ESRGAN 模型（更穩定）
    const response = await fetch(
      "https://api-inference.huggingface.co/models/xinntao/Real-ESRGAN",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: imageBase64.split(',')[1], // 移除 data:image/xxx;base64, 前綴
          parameters: {
            scale: scale
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("HuggingFace API error:", errText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Result = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    return new Response(JSON.stringify({
      success: true,
      image: `data:image/png;base64,${base64Result}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}