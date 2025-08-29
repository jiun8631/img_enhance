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

    // 檢查輸入大小 (Replicate 有限制，避免大圖)
    const base64Size = imageBase64.length * (3/4);
    if (base64Size > 1 * 1024 * 1024) {
      console.error("Image too large");
      return new Response(JSON.stringify({ error: "Image too large (max 1MB)" }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = context.env.REPLICATE_API_KEY;
    if (!apiKey) {
      console.error("Missing Replicate API Key");
      return new Response(JSON.stringify({ error: "API configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Calling Replicate API with model: nightmareai/real-esrgan");

    // Replicate API 調用 (創建預測)
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "42fed1c4974146d4d2414e2be2c527703b1fbf5abd874b18ea1daf71ed0a7e6b",  // Real-ESRGAN 模型版本 ID (從 Replicate 頁面複製)
        input: {
          image: imageBase64  // 完整 base64，包括前綴
        }
      })
    });

    if (!createResponse.ok) {
      const errText = await createResponse.text();
      console.error("Replicate create error:", errText);
      return new Response(JSON.stringify({ error: "AI processing failed: " + errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const prediction = await createResponse.json();
    let output;

    // 輪詢預測狀態 (Replicate 是異步的，需要等待結果)
    while (true) {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${apiKey}`
        }
      });

      const status = await statusResponse.json();
      if (status.status === "succeeded") {
        output = status.output;
        break;
      } else if (status.status === "failed") {
        console.error("Replicate prediction failed:", status.error);
        return new Response(JSON.stringify({ error: "AI processing failed: " + status.error }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 等待 2s 再檢查
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // output 是增強圖像的 URL，從 Replicate 下載並轉 base64
    const imageResponse = await fetch(output);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Result = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    console.log("Replicate API success");

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