// Supabase Edge Function: translate-text
// Translates a chunk of book text into the requested language, for the
// in-reader "Traducir" feature — using MyMemory, a free translation API
// that needs no account, no API key, and no billing.
//
// Deploy with: supabase functions deploy translate-text

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, targetLang } = await req.json();
    if (!text || !targetLang) {
      return new Response(JSON.stringify({ error: "Falta text o targetLang" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // MyMemory limits each request to ~500 characters, so split the text
    // into small chunks and translate them in sequence, free of charge.
    const chunks = [];
    let remaining = text.replace(/\s+/g, " ").trim();
    while (remaining.length > 0) {
      let slice = remaining.slice(0, 480);
      // avoid cutting a word in half
      const lastSpace = slice.lastIndexOf(" ");
      if (remaining.length > 480 && lastSpace > 200) {
        slice = slice.slice(0, lastSpace);
      }
      chunks.push(slice);
      remaining = remaining.slice(slice.length).trim();
    }

    const translatedChunks = [];
    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        chunk
      )}&langpair=auto|${targetLang}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.responseData) throw new Error("No se pudo traducir este texto");
      translatedChunks.push(data.responseData.translatedText);
      // MyMemory's free anonymous quota is friendlier with a tiny pause between calls
      await new Promise((r) => setTimeout(r, 150));
    }

    return new Response(JSON.stringify({ translatedText: translatedChunks.join(" ") }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
