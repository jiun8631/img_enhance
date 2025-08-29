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
    const { imageBase64 } = body;

    if (!imageBase64) {
      console.error("Missing image data");
      return new Response(JSON.stringify({ error: "Missing image data" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 檢查輸入大小
    const base64Size = imageBase64.length * (3/4);
    if (base64Size > 1 * 1024 * 1024) {
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

    console.log("Calling HF API with model: lucataco/real-esrgan");

    // 重試邏輯（最多 3 次，只針對 "loading" 錯誤）
    let attempts = 0;
    const maxAttempts = 3;
    let response;
    let errText = '';
    while (attempts < maxAttempts) {
      response = await fetch(
        "https://api-inference.huggingface.co/models/lucataco/real-esrgan",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: imageBase64.split(',')[1]  // base64 數據
          })
        }
      );

      if (response.ok) break;

      // 只讀取一次 text()
      errText = await response.text();
      console.error(`Attempt ${attempts + 1} failed: ${errText}`);

      if (errText.includes("loading")) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000));  // 等待 10s
      } else {
        // 非 loading 錯誤，直接返回
        return new Response(JSON.stringify({ error: "AI processing failed: " + errText }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (!response || !response.ok) {
      console.error("HuggingFace API error after retries:", errText);
      return new Response(JSON.stringify({ error: "AI processing failed after retries: " + errText }), {
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