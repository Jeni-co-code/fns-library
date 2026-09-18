import { supabase } from "../supabaseClient";

const BUCKET = "library-files";

export async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function updateThemeMode(userId, themeMode) {
  const { error } = await supabase.from("profiles").update({ theme_mode: themeMode }).eq("id", userId);
  if (error) throw error;
}
export async function fetchFolders(userId) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createFolder(userId, name, color, characterEmoji = "🦉", characterImagePath = null) {
  const { data, error } = await supabase
    .from("folders")
    .insert({
      user_id: userId,
      name,
      color,
      character_emoji: characterEmoji,
      character_image_path: characterImagePath,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateFolder(folderId, updates) {
  const { data, error } = await supabase
    .from("folders")
    .update(updates)
    .eq("id", folderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadFolderCharacter(userId, folderId, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/characters/${folderId}.${ext}`;
  const { error } = await supabase.storage
    .from("library-files")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  await updateFolder(folderId, { character_image_path: path, character_emoji: null });
  return path;
}

export async function deleteFolder(folderId) {
  const { error } = await supabase.from("folders").delete().eq("id", folderId);
  if (error) throw error;
}

export async function fetchBooks(userId) {
  const { data, error } = await supabase
    .from("books")
    .select("*, book_folders(folder_id)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadBook({ userId, file, coverBlob, meta, folderIds }) {
  const bookId = crypto.randomUUID();
  const filePath = `${userId}/${bookId}/file.${meta.fileType}`;
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: false });
  if (uploadErr) throw uploadErr;

  let coverPath = null;
  if (coverBlob) {
    coverPath = `${userId}/${bookId}/cover.png`;
    await supabase.storage.from(BUCKET).upload(coverPath, coverBlob, { upsert: false });
  }

  const { data: book, error: insertErr } = await supabase
    .from("books")
    .insert({
      id: bookId,
      user_id: userId,
      title: meta.title,
      author: meta.author,
      file_path: filePath,
      file_type: meta.fileType,
      cover_path: coverPath,
    })
    .select()
    .single();
  if (insertErr) throw insertErr;

  if (folderIds?.length) {
    await supabase
      .from("book_folders")
      .insert(folderIds.map((folder_id) => ({ book_id: bookId, folder_id })));
  }

  return book;
}

export async function deleteBook(book) {
  await supabase.storage.from(BUCKET).remove([book.file_path]);
  if (book.cover_path) {
    await supabase.storage.from(BUCKET).remove([book.cover_path]);
  }
  const { error } = await supabase.from("books").delete().eq("id", book.id);
  if (error) throw error;
}

export async function getSignedUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function setBookFolders(bookId, folderIds) {
  await supabase.from("book_folders").delete().eq("book_id", bookId);
  if (folderIds.length) {
    await supabase
      .from("book_folders")
      .insert(folderIds.map((folder_id) => ({ book_id: bookId, folder_id })));
  }
}

export async function updateProgress(bookId, { location, percent, status }) {
  const { error } = await supabase
    .from("books")
    .update({
      progress_location: location,
      progress_percent: percent,
      status: status,
    })
    .eq("id", bookId);
  if (error) throw error;
}

export async function updateStatus(bookId, status) {
  const { error } = await supabase.from("books").update({ status }).eq("id", bookId);
  if (error) throw error;
}

// Pide al servidor que traiga un libro gratuito de Project Gutenberg y lo añada
// directamente a la biblioteca del usuario actual.
export async function importGutenbergBook(gutenbergId, folderIds = []) {
  const { data, error } = await supabase.functions.invoke("import-gutenberg-book", {
    body: { gutenbergId, folderIds },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.book;
}

// Pide al servidor que traduzca un texto a otro idioma (gratis, sin cuenta ni costo)
export async function translateText(text, targetLang) {
  const { data, error } = await supabase.functions.invoke("translate-text", {
    body: { text, targetLang },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.translatedText;
}
