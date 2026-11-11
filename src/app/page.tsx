"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GALLERY_ITEMS } from "@/data/gallery-data";
import { GalleryItem } from "@/types/gallery";

const CATEGORIES = ["All", "Exhibition", "Nature", "Architecture", "Street", "Portrait"] as const;
const STORAGE_KEY = "coco_gallery_items_v2";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New photo form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState<GalleryItem["category"]>("Exhibition");
  const [newImageUrl, setNewImageUrl] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
  }, []);

  const saveItems = (updated: GalleryItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.map((item) =>
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    );
    saveItems(updated);
    showToast("♥ Added to likes!");
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const fallbackUrl = "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80";

    const newItem: GalleryItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      author: newAuthor.trim(),
      category: newCategory,
      imageUrl: newImageUrl.trim() || fallbackUrl,
      likes: 0,
    };

    saveItems([newItem, ...items]);
    setNewTitle("");
    setNewAuthor("");
    setNewImageUrl("");
    setIsAddModalOpen(false);
    showToast("New photo added to COCO Gallery!");
  };

  const handleOpenExhibition = () => {
    setIsExhibitionModalOpen(true);
  };

  const handleViewExhibitionCategory = () => {
    setSelectedCategory("Exhibition");
    setSearchQuery("");
    setIsExhibitionModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Banner: Switch to Korean Copy */}
      <div className="bg-[#613F75]/10 border-b border-[#613F75]/20 text-[#613F75] px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-[#613F75] text-[#E5C3D1] font-bold px-2 py-0.5 rounded-full text-xs">
            Original (EN)
          </span>
          <span>Viewing the original English edition.</span>
        </div>
        <Link
          href="/copy"
          className="font-bold underline hover:text-[#3D234A] transition-colors flex items-center gap-1"
        >
          <span>👉 한글 복사본 페이지로 이동 (/copy)</span>
        </Link>
      </div>

      <main className="px-4 py-12 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <header className="text-center mb-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full bg-[#613F75] text-[#E5C3D1] shadow-sm">
            Curated Photography
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#613F75]">
            COCO Gallery
          </h1>
          <p className="text-base sm:text-lg text-[#4E2B5C] max-w-2xl mx-auto leading-relaxed">
            A minimal gallery capturing light, silence, and fleeting moments.
          </p>

          {/* Search Bar & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto pt-2">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or artist..."
                className="w-full px-4 py-2.5 rounded-full bg-[#F7E7EE] border border-[#613F75]/30 text-[#3D234A] placeholder-[#8C6B9F] text-sm focus:outline-none focus:ring-2 focus:ring-[#613F75] shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#613F75] hover:text-[#3D234A] px-1.5 py-0.5 rounded-full bg-[#E5C3D1] cursor-pointer"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Exhibition Button */}
            <button
              onClick={handleOpenExhibition}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#F7E7EE] border-2 border-[#613F75] text-[#613F75] text-sm font-bold hover:bg-[#613F75] hover:text-[#E5C3D1] shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>🏛️</span>
              <span>Exhibition</span>
            </button>

            {/* Add Photo Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#613F75] text-[#E5C3D1] text-sm font-semibold hover:opacity-90 shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>+</span>
              <span>Add Photo</span>
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#613F75] text-[#E5C3D1] shadow-md scale-105 font-bold"
                      : "bg-[#F3DEE7] text-[#613F75] hover:bg-[#ebd0dc]"
                  }`}
                >
                  {category === "Exhibition" ? "🏛️ Exhibition" : category}
                </button>
              );
            })}
          </div>
        </header>

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative overflow-hidden rounded-2xl bg-[#F7E7EE] border border-[#613F75]/20 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/5">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D234A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info Section */}
                <div className="p-4 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[11px] font-semibold text-[#613F75] uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-[#3D234A] group-hover:text-[#613F75] transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5D3A6C] truncate">{item.author}</p>
                  </div>

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={(e) => handleLike(item.id, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#E5C3D1] text-[#613F75] hover:bg-[#613F75] hover:text-[#E5C3D1] transition-colors shrink-0 cursor-pointer"
                    aria-label={`Like ${item.title}`}
                  >
                    <span>♥</span>
                    <span>{item.likes}</span>
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="text-center py-20 bg-[#F7E7EE]/50 rounded-3xl border border-[#613F75]/20 max-w-lg mx-auto">
            <p className="text-lg font-semibold text-[#613F75] mb-2">No results found</p>
            <p className="text-sm text-[#4E2B5C] mb-4">Try searching with different keywords or clear your filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[#613F75] text-[#E5C3D1] hover:opacity-90 cursor-pointer"
            >
              View All Photos
            </button>
          </div>
        )}

        {/* Modal: View Full Image */}
        {selectedItem && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-[#F7E7EE] rounded-3xl overflow-hidden shadow-2xl border border-[#613F75]/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/10] w-full bg-black/10">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              </div>

              <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="inline-block text-xs font-bold text-[#613F75] uppercase tracking-wider mb-1">
                    {selectedItem.category}
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#613F75]">
                    {selectedItem.title}
                  </h2>
                  <p className="text-sm text-[#4E2B5C]">Photo by {selectedItem.author}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleLike(selectedItem.id, e)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-[#613F75] text-[#E5C3D1] hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>♥</span>
                    <span>{selectedItem.likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-[#E5C3D1] text-[#613F75] hover:bg-[#613F75] hover:text-[#E5C3D1] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Exhibition Special Showcase */}
        {isExhibitionModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsExhibitionModalOpen(false)}
          >
            <div
              className="relative max-w-2xl w-full bg-[#F7E7EE] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#613F75]/30 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#613F75]/20 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <span className="text-[11px] font-bold text-[#613F75] uppercase tracking-wider block">
                      Special Exhibition 2026
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#613F75]">
                      Shadows & Horizons
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setIsExhibitionModalOpen(false)}
                  className="text-xl text-[#613F75] hover:text-[#3D234A] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm text-[#4E2B5C] leading-relaxed">
                <div className="bg-[#E5C3D1]/50 p-4 rounded-2xl border border-[#613F75]/15 space-y-1">
                  <p className="font-semibold text-[#613F75]">🗓️ Exhibition Period: March 1, 2026 – June 30, 2026</p>
                  <p className="font-semibold text-[#613F75]">📍 Venue: COCO Gallery Online Pavilion</p>
                </div>

                <p>
                  <strong>Shadows & Horizons</strong> explores the juxtaposition of light, shade, and tranquil horizons.
                  Discover captivating moments captured by photographers around the world.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExhibitionModalOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold bg-[#E5C3D1] text-[#613F75] hover:bg-[#ebd0dc] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleViewExhibitionCategory}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#613F75] text-[#E5C3D1] hover:opacity-90 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>🏛️</span>
                  <span>View Exhibition Collection</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Photo */}
        {isAddModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="relative max-w-md w-full bg-[#F7E7EE] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#613F75]/30 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#613F75]/20 pb-3">
                <h2 className="text-xl font-bold text-[#613F75]">Submit New Photo</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-lg text-[#613F75] hover:text-[#3D234A] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddPhoto} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#613F75] mb-1">
                    Artwork Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Dawn in the Pine Forest"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-[#613F75]/30 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#613F75] mb-1">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-[#613F75]/30 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#613F75] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GalleryItem["category"])}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-[#613F75]/30 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                  >
                    <option value="Exhibition">Exhibition</option>
                    <option value="Nature">Nature</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Street">Street</option>
                    <option value="Portrait">Portrait</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#613F75] mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... (Leave empty for default)"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 border border-[#613F75]/30 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#E5C3D1] text-[#613F75] hover:bg-[#ebd0dc] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-[#613F75] text-[#E5C3D1] hover:opacity-90 shadow-md cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#613F75] text-[#E5C3D1] px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
            {toastMessage}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-[#613F75]/20 text-center text-xs text-[#5D3A6C]">
        <p>© 2026 COCO Gallery. All rights reserved.</p>
      </footer>
    </div>
  );
}
