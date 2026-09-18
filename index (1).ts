// Supabase Edge Function: import-gutenberg-book
// Fetches a public-domain book from Project Gutenberg (via the Gutendex API)
// and adds it straight into the authenticated user's library.
//
// Deploy with: supabase functions deploy import-gutenberg-book

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "library-files";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { gutenbergId, folderIds } = await req.json();
    if (!gutenbergId) {
      return new Response(JSON.stringify({ error: "Falta gutenbergId" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // client scoped to the caller's JWT, just to identify who is asking
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY"), {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // admin client to write on the user's behalf (bypasses RLS safely, server-side only)
    const admin = createClient(supabaseUrl, serviceKey);

    // 1. Get metadata from Gutendex
    const metaRes = await fetch(`https://gutendex.com/books/${gutenbergId}`);
    if (!metaRes.ok) throw new Error("No se encontró ese libro en Project Gutenberg");
    const meta = await metaRes.json();

    const epubUrl =
      meta.formats["application/epub+zip"] ||
      Object.entries(meta.formats).find(([k]) => k.includes("epub"))?.[1];
    if (!epubUrl) throw new Error("Este libro no tiene una versión EPUB disponible");

    const coverUrl = meta.formats["image/jpeg"];

    // 2. Download the epub file
    const fileRes = await fetch(epubUrl);
    if (!fileRes.ok) throw new Error("No se pudo descargar el archivo del libro");
    const fileBlob = await fileRes.blob();

    const bookId = crypto.randomUUID();
    const filePath = `${user.id}/${bookId}/file.epub`;
    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(filePath, fileBlob, { contentType: "application/epub+zip", upsert: false });
    if (uploadErr) throw uploadErr;

    // 3. Download and store the cover, if available
    let coverPath = null;
    if (coverUrl) {
      const coverRes = await fetch(coverUrl);
      if (coverRes.ok) {
        const coverBlob = await coverRes.blob();
        coverPath = `${user.id}/${bookId}/cover.jpg`;
        await admin.storage.from(BUCKET).upload(coverPath, coverBlob, { contentType: "image/jpeg" });
      }
    }

    // 4. Insert the book row
    const title = meta.title || "Sin título";
    const author = meta.authors?.[0]?.name || "";

    const { data: book, error: insertErr } = await admin
      .from("books")
      .insert({
        id: bookId,
        user_id: user.id,
        title,
        author,
        file_path: filePath,
        file_type: "epub",
        cover_path: coverPath,
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    // 5. Link to folders, if any were selected
    if (folderIds?.length) {
      await admin
        .from("book_folders")
        .insert(folderIds.map((folder_id) => ({ book_id: bookId, folder_id })));
    }

    return new Response(JSON.stringify({ book }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
