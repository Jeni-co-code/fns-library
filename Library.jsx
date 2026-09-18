import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import ShelfRow from "../components/ShelfRow";
import BookMenu from "../components/BookMenu";
import UploadModal from "../components/UploadModal";
import CatalogModal from "../components/CatalogModal";
import BookOpenAnimation from "../components/BookOpenAnimation";
import {
  fetchProfile,
  updateThemeMode,
  fetchFolders,
  fetchBooks,
  createFolder,
  updateFolder,
  uploadFolderCharacter,
  deleteFolder,
  uploadBook,
  deleteBook,
  setBookFolders,
  updateStatus,
  getSignedUrl,
} from "../lib/library";

export default function Library() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [themeMode, setThemeMode] = useState("clasica");
  const [folders, setFolders] = useState([]);
  const [books, setBooks] = useState([]);
  const [characterImages, setCharacterImages] = useState({}); // folderId -> signed url
  const [activeFolder, setActiveFolder] = useState(null);
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [menuBook, setMenuBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingBook, setOpeningBook] = useState(null); // { book, color, character }

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [profile, f, b] = await Promise.all([
      fetchProfile(user.id),
      fetchFolders(user.id),
      fetchBooks(user.id),
    ]);
    setThemeMode(profile?.theme_mode || "clasica");
    setFolders(f);
    setBooks(b);
    setLoading(false);

    const withImages = f.filter((folder) => folder.character_image_path);
    withImages.forEach(async (folder) => {
      try {
        const url = await getSignedUrl(folder.character_image_path);
        setCharacterImages((prev) => ({ ...prev, [folder.id]: url }));
      } catch {
        // ignore, falls back to emoji
      }
    });
  }

  const visibleBooks = useMemo(() => {
    let list = books;
    if (activeFolder) {
      list = list.filter((b) => b.book_folders?.some((bf) => bf.folder_id === activeFolder));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q));
    }
    return list;
  }, [books, activeFolder, search]);

  // group books into shelves for the "todos los libros" view
  const shelves = useMemo(() => {
    if (activeFolder) {
      const folder = folders.find((f) => f.id === activeFolder);
      return [{ folder, books: visibleBooks }];
    }
    const grouped = folders.map((folder) => ({
      folder,
      books: visibleBooks.filter((b) => b.book_folders?.some((bf) => bf.folder_id === folder.id)),
    }));
    const unfiled = visibleBooks.filter((b) => !b.book_folders?.length);
    return unfiled.length ? [...grouped, { folder: null, books: unfiled }] : grouped;
  }, [folders, visibleBooks, activeFolder]);

  async function handleToggleTheme() {
    const next = themeMode === "magica" ? "clasica" : "magica";
    setThemeMode(next);
    await updateThemeMode(user.id, next);
  }

  async function handleCreateFolder(name, color) {
    const folder = await createFolder(user.id, name, color);
    setFolders((prev) => [...prev, folder]);
  }

  async function handleStyleFolder(folderId, { color, character, customImage }) {
    if (customImage) {
      const path = await uploadFolderCharacter(user.id, folderId, customImage);
      const url = await getSignedUrl(path);
      setCharacterImages((prev) => ({ ...prev, [folderId]: url }));
      setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, color, character_image_path: path, character_emoji: null } : f)));
    } else {
      await updateFolder(folderId, { color, character_emoji: character, character_image_path: null });
      setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, color, character_emoji: character, character_image_path: null } : f)));
    }
  }

  async function handleDeleteFolder(id) {
    if (!confirm("¿Eliminar esta estantería? Los libros no se borran, solo dejan de estar en ella.")) return;
    await deleteFolder(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (activeFolder === id) setActiveFolder(null);
  }

  async function handleUpload({ file, coverBlob, meta, folderIds }) {
    const book = await uploadBook({ userId: user.id, file, coverBlob, meta, folderIds });
    setBooks((prev) => [{ ...book, book_folders: folderIds.map((id) => ({ folder_id: id })) }, ...prev]);
  }

  async function handleSetStatus(bookId, status) {
    await updateStatus(bookId, status);
    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, status } : b)));
    setMenuBook((prev) => (prev && prev.id === bookId ? { ...prev, status } : prev));
  }

  async function handleSetFolders(bookId, folderIds) {
    await setBookFolders(bookId, folderIds);
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, book_folders: folderIds.map((id) => ({ folder_id: id })) } : b))
    );
  }

  async function handleDeleteBook(book) {
    if (!confirm(`¿Eliminar "${book.title}" de tu biblioteca? Esto no se puede deshacer.`)) return;
    await deleteBook(book);
    setBooks((prev) => prev.filter((b) => b.id !== book.id));
    setMenuBook(null);
  }

  function handleOpenBook(book) {
    const folderId = book.book_folders?.[0]?.folder_id;
    const folder = folders.find((f) => f.id === folderId);
    const color = folder?.color || "#8AA98C";
    const character = folder ? characterImages[folder.id] || folder.character_emoji || "📖" : "📖";
    setOpeningBook({ book, color, character });
  }

  const activeFolderName = folders.find((f) => f.id === activeFolder)?.name;
  const isMagica = themeMode === "magica";

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ background: isMagica ? "linear-gradient(180deg, #FFE8F3, #E8F0FF 50%, #FFF8E0)" : "#F1EADA" }}
    >
      <Sidebar
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={setActiveFolder}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onStyleFolder={handleStyleFolder}
        userName={user.user_metadata?.display_name || user.email}
        onSignOut={signOut}
        onOpenManual={() => navigate("/manual")}
        totalBooks={books.length}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 px-6 md:px-10 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-3xl"
              style={{ fontFamily: isMagica ? "'Fraunces', serif" : "Georgia, serif", color: isMagica ? "#5B3A8E" : "#241D33" }}
            >
              {activeFolderName || "Todos los libros"}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: isMagica ? "#5B3A8E99" : "#241D3380" }}>
              {visibleBooks.length} {visibleBooks.length === 1 ? "libro" : "libros"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("library.search")}
              className="input-field py-2 text-sm w-56"
            />
            <button onClick={() => setShowCatalog(true)} className="btn-ghost text-sm border border-nook-900/15 whitespace-nowrap">
              🔎 {t("library.freeBooks").replace("🔎 ", "")}
            </button>
            <button onClick={() => setShowUpload(true)} className="btn-primary text-sm whitespace-nowrap">
              {t("library.uploadBook")}
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: isMagica ? "#5B3A8E80" : "#241D3380" }}>{t("library.loading")}</p>
        ) : visibleBooks.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl mb-2" style={{ fontFamily: isMagica ? "'Fraunces', serif" : "Georgia, serif", color: isMagica ? "#5B3A8E99" : "#241D3399" }}>
              {search ? "No encontramos nada con eso." : t("library.empty")}
            </p>
            {!search && (
              <button onClick={() => setShowUpload(true)} className="btn-primary text-sm mt-4">
                Sube tu primer libro
              </button>
            )}
          </div>
        ) : (
          shelves.map((shelf) => (
            <ShelfRow
              key={shelf.folder?.id || "sin-estanteria"}
              folder={
                shelf.folder
                  ? { ...shelf.folder, characterDisplay: characterImages[shelf.folder.id] }
                  : null
              }
              books={shelf.books}
              isMagica={isMagica}
              onOpenBook={handleOpenBook}
            />
          ))
        )}
      </main>

      {showUpload && (
        <UploadModal folders={folders} onClose={() => setShowUpload(false)} onUpload={handleUpload} />
      )}

      {showCatalog && (
        <CatalogModal
          folders={folders}
          onClose={() => setShowCatalog(false)}
          onImported={(book, folderIds) => {
            setBooks((prev) => [{ ...book, book_folders: folderIds.map((id) => ({ folder_id: id })) }, ...prev]);
          }}
        />
      )}

      {menuBook && (
        <BookMenu
          book={menuBook}
          folders={folders}
          onClose={() => setMenuBook(null)}
          onSetStatus={handleSetStatus}
          onSetFolders={handleSetFolders}
          onDelete={handleDeleteBook}
        />
      )}

      {openingBook && (
        <BookOpenAnimation
          book={openingBook.book}
          color={openingBook.color}
          character={openingBook.character}
          onDone={() => navigate(`/leer/${openingBook.book.id}`)}
        />
      )}
    </div>
  );
}
