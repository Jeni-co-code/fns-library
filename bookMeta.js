import ePub from "epubjs";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Devuelve { title, author, coverBlob } a partir de un File
export async function extractMeta(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "epub") {
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);
    await book.ready;
    const metadata = await book.loaded.metadata;
    let coverBlob = null;
    try {
      const coverUrl = await book.coverUrl();
      if (coverUrl) {
        const res = await fetch(coverUrl);
        coverBlob = await res.blob();
      }
    } catch {
      coverBlob = null;
    }
    return {
      title: metadata.title || file.name.replace(/\.epub$/i, ""),
      author: metadata.creator || "",
      coverBlob,
      fileType: "epub",
    };
  }

  if (ext === "pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const meta = await pdf.getMetadata().catch(() => null);
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement("canvas");
    const targetWidth = 400;
    const scale = targetWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
    const coverBlob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    return {
      title: meta?.info?.Title || file.name.replace(/\.pdf$/i, ""),
      author: meta?.info?.Author || "",
      coverBlob,
      fileType: "pdf",
    };
  }

  throw new Error("Formato no soportado. Usa archivos .epub o .pdf");
}
