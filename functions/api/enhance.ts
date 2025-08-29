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

    // Replicate API 調用 (創建預測) - 替換為你從網站複製的最新版本 ID
    const modelVersion = "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa";  // <- 這裡替換為最新 ID !!!
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: modelVersion,  // 最新版本 ID
        input: {
          image: imageBase64  // 完整 base64
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

    // 輪詢狀態 (添加超時，最大 60s)
    const startTime = Date.now();
    while (true) {
      if (Date.now() - startTime > 60000) {
        console.error("Replicate prediction timeout");
        return new Response(JSON.stringify({ error: "AI processing timeout (try again later)" }), {
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

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

      await new Promise(resolve => setTimeout(resolve, 2000));  // 等待 2s
    }

    // output 是 URL，下載並轉 base64
    const imageResponse = await fetch(output);
    if (!imageResponse.ok) {
      console.error("Failed to fetch output image");
      return new Response(JSON.stringify({ error: "Failed to retrieve enhanced image" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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