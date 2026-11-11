"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { COCO_ALBUM_ITEMS } from "@/data/album-data";
import { GalleryItem } from "@/types/gallery";

type SubExhibitionType = "All" | "무한상상 AI아트전" | "AI로 그리는 우리 동네 이야기";

const CATEGORY_TABS = [
  { key: "All", label: "전체" },
  { key: "Exhibition", label: "🏛️ 전시회" },
  { key: "Nature", label: "자연" },
  { key: "Architecture", label: "건축/도시" },
  { key: "Street", label: "거리" },
  { key: "Portrait", label: "인물" },
] as const;

const CATEGORY_LABEL_MAP: Record<string, string> = {
  All: "전체",
  Exhibition: "전시회",
  Nature: "자연",
  Architecture: "건축/도시",
  Street: "거리",
  Portrait: "인물",
};

const STORAGE_KEY = "coco_gallery_items_album_v10";

export default function KoreanCopyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubExhibition, setSelectedSubExhibition] = useState<SubExhibitionType>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [items, setItems] = useState<GalleryItem[]>(COCO_ALBUM_ITEMS);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Modals & Popovers
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState<boolean>(false);
  const [modalExhibitionTab, setModalExhibitionTab] = useState<"무한상상 AI아트전" | "AI로 그리는 우리 동네 이야기">("무한상상 AI아트전");
  const [isExhibitionDropdownOpen, setIsExhibitionDropdownOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // New photo form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("COCO");
  const [newCategory, setNewCategory] = useState<GalleryItem["category"]>("Exhibition");
  const [newExhibitionChoice, setNewExhibitionChoice] = useState<"both" | "art" | "town">("both");
  const [newImageUrl, setNewImageUrl] = useState("");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExhibitionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load from localStorage or initial
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems(COCO_ALBUM_ITEMS);
      }
    } catch {
      setItems(COCO_ALBUM_ITEMS);
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

  // Filter items
  const filteredItems = items.filter((item) => {
    let matchesCategory = true;
    if (selectedCategory === "Exhibition") {
      if (selectedSubExhibition === "All") {
        matchesCategory = !!(item.exhibitions && item.exhibitions.length > 0) || item.category === "Exhibition";
      } else if (selectedSubExhibition === "무한상상 AI아트전") {
        matchesCategory = !!item.exhibitions?.includes("무한상상 AI아트전");
      } else if (selectedSubExhibition === "AI로 그리는 우리 동네 이야기") {
        matchesCategory = !!item.exhibitions?.includes("AI로 그리는 우리 동네 이야기");
      }
    } else if (selectedCategory !== "All") {
      matchesCategory =
        item.category === selectedCategory ||
        !!item.categories?.includes(selectedCategory as any);
    }

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.exhibitions && item.exhibitions.some((ex) => ex.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const fallbackUrl = "/album/photo-1.jpg";

    let assignedExhibitions: ("무한상상 AI아트전" | "AI로 그리는 우리 동네 이야기")[] = [];
    if (newCategory === "Exhibition") {
      if (newExhibitionChoice === "both") {
        assignedExhibitions = ["무한상상 AI아트전", "AI로 그리는 우리 동네 이야기"];
      } else if (newExhibitionChoice === "art") {
        assignedExhibitions = ["무한상상 AI아트전"];
      } else {
        assignedExhibitions = ["AI로 그리는 우리 동네 이야기"];
      }
    }

    const newItem: GalleryItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      author: newAuthor.trim(),
      category: newCategory,
      exhibitions: assignedExhibitions,
      imageUrl: newImageUrl.trim() || fallbackUrl,
      width: 1200,
      height: 900,
    };

    saveItems([newItem, ...items]);
    setNewTitle("");
    setNewAuthor("COCO");
    setNewImageUrl("");
    setIsAddModalOpen(false);
    showToast("새 사진이 갤러리에 성공적으로 등록되었습니다!");
  };

  const selectExhibition = (exhibition: SubExhibitionType) => {
    setSelectedCategory("Exhibition");
    setSelectedSubExhibition(exhibition);
    setSearchQuery("");
    setIsExhibitionDropdownOpen(false);
    if (exhibition === "All") {
      showToast("전시회 전체 작품을 불러왔습니다.");
    } else {
      showToast(`'${exhibition}' 전시관으로 이동했습니다.`);
    }
  };

  const openExhibitionModalWithTab = (tab: "무한상상 AI아트전" | "AI로 그리는 우리 동네 이야기") => {
    setModalExhibitionTab(tab);
    setIsExhibitionModalOpen(true);
    setIsExhibitionDropdownOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Banner: 영문 원본 이동 링크 */}
      <div className="bg-[#613F75] text-[#E5C3D1] px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-[#E5C3D1] text-[#613F75] font-bold px-2 py-0.5 rounded-full text-xs">
            COCO 앨범 적용됨
          </span>
          <span>자유로운 사이즈의 테두리 없는 갤러리 뷰입니다.</span>
        </div>
        <Link
          href="/"
          className="underline hover:text-white font-semibold transition-colors flex items-center gap-1"
        >
          <span>← 영문 원본 페이지로 이동 (/)</span>
        </Link>
      </div>

      <main className="px-4 py-12 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <header className="text-center mb-12 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase rounded-full bg-[#613F75] text-[#E5C3D1] shadow-sm">
            COCO 앨범 컬렉션
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#613F75]">
            COCO Gallery
          </h1>
          <p className="text-base sm:text-lg text-[#4E2B5C] max-w-2xl mx-auto leading-relaxed">
            빛과 고요함, 그리고 찰나의 순간들을 포착하는 미니멀한 갤러리
          </p>

          {/* Search Bar & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto pt-2">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="작품명, 작가명 또는 전시회 이름 검색..."
                className="w-full px-4 py-2.5 rounded-full bg-[#F7E7EE] text-[#3D234A] placeholder-[#8C6B9F] text-sm focus:outline-none focus:ring-2 focus:ring-[#613F75] shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#613F75] hover:text-[#3D234A] px-1.5 py-0.5 rounded-full bg-[#E5C3D1] cursor-pointer"
                  aria-label="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 전시회 버튼 (드롭다운 포함) */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                onClick={() => setIsExhibitionDropdownOpen((prev) => !prev)}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                  isExhibitionDropdownOpen || selectedCategory === "Exhibition"
                    ? "bg-[#613F75] text-[#E5C3D1]"
                    : "bg-[#F7E7EE] text-[#613F75] hover:bg-[#613F75] hover:text-[#E5C3D1]"
                }`}
              >
                <span>🏛️</span>
                <span>전시회</span>
                <span className="text-xs ml-0.5">{isExhibitionDropdownOpen ? "▲" : "▼"}</span>
              </button>

              {/* '전시회' 안에 열리는 하위 메뉴 버튼들 */}
              {isExhibitionDropdownOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 bg-[#F7E7EE] rounded-2xl shadow-2xl p-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#613F75] uppercase tracking-wider">
                    전시회 목록 바로가기
                  </div>

                  <div className="py-1 space-y-1">
                    {/* 버튼 1: 무한상상 AI아트전 (6개 전체) */}
                    <button
                      onClick={() => selectExhibition("무한상상 AI아트전")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedCategory === "Exhibition" && selectedSubExhibition === "무한상상 AI아트전"
                          ? "bg-[#613F75] text-[#E5C3D1]"
                          : "text-[#3D234A] hover:bg-[#E5C3D1] hover:text-[#613F75]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎨</span>
                        <div>
                          <p className="font-bold">무한상상 AI아트전</p>
                          <p className="text-[10px] opacity-80">전체 6개 작품 특별 전시</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-[#613F75]/10 px-1.5 py-0.5 rounded">6</span>
                    </button>

                    {/* 버튼 2: AI로 그리는 우리 동네 이야기 (3개 작품) */}
                    <button
                      onClick={() => selectExhibition("AI로 그리는 우리 동네 이야기")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedCategory === "Exhibition" && selectedSubExhibition === "AI로 그리는 우리 동네 이야기"
                          ? "bg-[#613F75] text-[#E5C3D1]"
                          : "text-[#3D234A] hover:bg-[#E5C3D1] hover:text-[#613F75]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏘️</span>
                        <div>
                          <p className="font-bold">AI로 그리는 우리 동네 이야기</p>
                          <p className="text-[10px] opacity-80">우리 곁의 따뜻한 일상과 마을</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-[#613F75]/10 px-1.5 py-0.5 rounded">3</span>
                    </button>
                  </div>

                  <div className="pt-2 mt-1 border-t border-[#613F75]/10 flex items-center justify-between px-2">
                    <button
                      onClick={() => selectExhibition("All")}
                      className="text-[11px] font-semibold text-[#613F75] hover:underline py-1 px-1 cursor-pointer"
                    >
                      전시회 전체 보기
                    </button>
                    <button
                      onClick={() => openExhibitionModalWithTab("무한상상 AI아트전")}
                      className="text-[11px] font-semibold text-[#613F75] bg-[#E5C3D1] px-2.5 py-1 rounded-full hover:bg-[#613F75] hover:text-[#E5C3D1] transition-colors cursor-pointer"
                    >
                      전시 안내 ⓘ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Photo Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#613F75] text-[#E5C3D1] text-sm font-semibold hover:opacity-90 shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>+</span>
              <span>사진 등록</span>
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedCategory(tab.key);
                    if (tab.key !== "Exhibition") {
                      setSelectedSubExhibition("All");
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#613F75] text-[#E5C3D1] shadow-md scale-105 font-bold"
                      : "bg-[#F3DEE7] text-[#613F75] hover:bg-[#ebd0dc]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 전시회 카테고리가 선택되었을 때 상단에 표시되는 전용 서브 버튼들 */}
          {selectedCategory === "Exhibition" && (
            <div className="pt-2 animate-in fade-in duration-200">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-[#F3DEE7] shadow-inner">
                <button
                  onClick={() => setSelectedSubExhibition("All")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedSubExhibition === "All"
                      ? "bg-[#613F75] text-[#E5C3D1] shadow-sm"
                      : "text-[#613F75] hover:bg-[#E5C3D1]"
                  }`}
                >
                  전체 전시 (6)
                </button>

                <button
                  onClick={() => setSelectedSubExhibition("무한상상 AI아트전")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedSubExhibition === "무한상상 AI아트전"
                      ? "bg-[#613F75] text-[#E5C3D1] shadow-sm"
                      : "text-[#613F75] hover:bg-[#E5C3D1]"
                  }`}
                >
                  <span>🎨</span>
                  <span>무한상상 AI아트전 (3)</span>
                </button>

                <button
                  onClick={() => setSelectedSubExhibition("AI로 그리는 우리 동네 이야기")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedSubExhibition === "AI로 그리는 우리 동네 이야기"
                      ? "bg-[#613F75] text-[#E5C3D1] shadow-sm"
                      : "text-[#613F75] hover:bg-[#E5C3D1]"
                  }`}
                >
                  <span>🏘️</span>
                  <span>AI로 그리는 우리 동네 이야기 (6)</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* 첨부 사진 참고: 한 줄에 3작품씩 보이는 핀터레스트 스타일 3열 Masonry 갤러리 */}
        {filteredItems.length > 0 ? (
          <section className="max-w-6xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="break-inside-avoid group cursor-pointer flex flex-col mb-6 transition-all duration-300"
              >
                {/* Image: 첨부 사진처럼 부드러운 라운드 & 그림자 & 원본 비율 노출 */}
                <div className="overflow-hidden rounded-2xl shadow-sm group-hover:shadow-xl transition-all duration-500 bg-black/5">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={item.width || 1200}
                    height={item.height || 900}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-auto block object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>

                {/* Info: 첨부 사진 스타일의 깔끔한 캡션 */}
                <div className="pt-2.5 pb-1 px-1 flex flex-col gap-1">
                  {/* 제목 */}
                  <h3 className="text-sm sm:text-base font-bold text-[#3D234A] group-hover:text-[#613F75] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* 작가 정보 & 전시회 태그 */}
                  <div className="flex items-center justify-between text-xs text-[#5D3A6C] pt-0.5 gap-2">
                    <span className="font-medium text-[#4E2B5C] shrink-0">작가 {item.author}</span>

                    {item.exhibitions && item.exhibitions.length > 0 && (
                      <div className="flex gap-1 flex-wrap justify-end">
                        {item.exhibitions.map((ex) => (
                          <span key={ex} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3DEE7] text-[#613F75] whitespace-nowrap">
                            {ex === "AI로 그리는 우리 동네 이야기" ? "🏘️ 우리 동네" : "🎨 무한상상"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="text-center py-20 bg-[#F7E7EE]/50 rounded-3xl max-w-lg mx-auto">
            <p className="text-lg font-semibold text-[#613F75] mb-2">선택한 전시의 작품이 없습니다</p>
            <p className="text-sm text-[#4E2B5C] mb-4">다른 전시회나 필터를 선택해 보세요.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedSubExhibition("All");
              }}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-[#613F75] text-[#E5C3D1] hover:opacity-90 cursor-pointer"
            >
              전체 작품 보기
            </button>
          </div>
        )}

        {/* Modal: View Full Image (테두리 없는 프리미엄 뷰어) */}
        {selectedItem && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="relative max-w-5xl w-full bg-[#F7E7EE] rounded-3xl overflow-hidden shadow-2xl max-h-[94vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 이미지 원본 전체 온전히 노출 */}
              <div className="relative flex-1 min-h-[350px] sm:min-h-[560px] w-full bg-black/25 p-4 sm:p-6 flex items-center justify-center">
                <Image
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  fill
                  priority
                  sizes="(max-width: 1400px) 100vw, 1200px"
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              {/* 하단 정보 섹션 */}
              <div className="p-6 bg-[#F7E7EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  {selectedItem.exhibitions && selectedItem.exhibitions.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {selectedItem.exhibitions.map((ex) => (
                        <span
                          key={ex}
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#613F75] text-[#E5C3D1]"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#613F75]">
                    {selectedItem.title}
                  </h2>
                  <p className="text-sm text-[#4E2B5C]">작가: {selectedItem.author}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#613F75] text-[#E5C3D1] hover:opacity-95 transition-opacity cursor-pointer shadow-md"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: 전시회 특별 안내 모달 (두 전시회 탭 포함) */}
        {isExhibitionModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsExhibitionModalOpen(false)}
          >
            <div
              className="relative max-w-2xl w-full bg-[#F7E7EE] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <span className="text-[11px] font-bold text-[#613F75] uppercase tracking-wider block">
                      COCO 갤러리 기획전
                    </span>
                    <h2 className="text-2xl font-extrabold text-[#613F75]">
                      전시회 안내
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

              {/* 모달 안의 두 전시회 선택 버튼 */}
              <div className="flex gap-2 pb-2">
                <button
                  onClick={() => setModalExhibitionTab("무한상상 AI아트전")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    modalExhibitionTab === "무한상상 AI아트전"
                      ? "bg-[#613F75] text-[#E5C3D1] shadow-md"
                      : "bg-[#E5C3D1] text-[#613F75] hover:bg-[#ebd0dc]"
                  }`}
                >
                  <span>🎨</span>
                  <span>무한상상 AI아트전 (3작품)</span>
                </button>

                <button
                  onClick={() => setModalExhibitionTab("AI로 그리는 우리 동네 이야기")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    modalExhibitionTab === "AI로 그리는 우리 동네 이야기"
                      ? "bg-[#613F75] text-[#E5C3D1] shadow-md"
                      : "bg-[#E5C3D1] text-[#613F75] hover:bg-[#ebd0dc]"
                  }`}
                >
                  <span>🏘️</span>
                  <span>AI로 그리는 우리 동네 이야기 (6작품)</span>
                </button>
              </div>

              {/* 선택된 전시회 소개 내용 */}
              {modalExhibitionTab === "무한상상 AI아트전" ? (
                <div className="space-y-4 text-sm text-[#4E2B5C] leading-relaxed">
                  <div className="bg-[#E5C3D1]/50 p-4 rounded-2xl space-y-1">
                    <p className="font-semibold text-[#613F75]">🎨 기획 테마: 무한상상 AI아트전</p>
                    <p className="font-semibold text-[#613F75]">🖼️ 출품작: 엄선된 3개 작품 전시</p>
                    <p className="text-xs text-[#5D3A6C]">
                      • 빛의 손끝, AI 기억의 파편 사이에서<br />
                      • 스마트시티_내일의 동네, 오늘의 상상<br />
                      • 계절의 윤회: 자전거, 돔, 그리고 시간의 곡선
                    </p>
                  </div>
                  <p>
                    <strong>무한상상 AI아트전</strong>은 인공지능과 인간의 예술적 교감을 통해 탄생한 6가지 다채로운 시선을 한자리에서 선보입니다.
                    무한한 상상력과 미적 실험이 담긴 모든 작품들을 자유롭게 감상해 보세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-[#4E2B5C] leading-relaxed">
                  <div className="bg-[#E5C3D1]/50 p-4 rounded-2xl space-y-1">
                    <p className="font-semibold text-[#613F75]">🏘️ 기획 테마: AI로 그리는 우리 동네 이야기</p>
                    <p className="font-semibold text-[#613F75]">🖼️ 출품작: 엄선된 3개 특별작품 전시</p>
                    <p className="text-xs text-[#5D3A6C]">
                      • 스마트시티_내일의 동네, 오늘의 상상<br />
                      • 계절의 윤회: 자전거, 돔, 그리고 시간의 곡선<br />
                      • 빛의 손끝, AI 기억의 파편 사이에서
                    </p>
                  </div>
                  <p>
                    <strong>AI로 그리는 우리 동네 이야기</strong>는 내일의 스마트 동네와 정겨운 시간의 결, 사람과 사람 사이의 온기를 집중 조명한 기획 전시입니다.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExhibitionModalOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold bg-[#E5C3D1] text-[#613F75] hover:bg-[#ebd0dc] cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    selectExhibition(modalExhibitionTab);
                    setIsExhibitionModalOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#613F75] text-[#E5C3D1] hover:opacity-90 shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>👉</span>
                  <span>이 전시 작품 관람하기</span>
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
              className="relative max-w-md w-full bg-[#F7E7EE] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-xl font-bold text-[#613F75]">새로운 사진 등록</h2>
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
                    작품 제목
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="예: 푸른 숲의 아침"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#613F75] mb-1">
                    작가 이름
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="예: COCO"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#613F75] mb-1">
                    카테고리
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GalleryItem["category"])}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                  >
                    <option value="Exhibition">전시회</option>
                    <option value="Nature">자연</option>
                    <option value="Architecture">건축/도시</option>
                    <option value="Street">거리</option>
                    <option value="Portrait">인물</option>
                  </select>
                </div>

                {newCategory === "Exhibition" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#613F75] mb-1">
                      출품 전시회 선택
                    </label>
                    <select
                      value={newExhibitionChoice}
                      onChange={(e) => setNewExhibitionChoice(e.target.value as "both" | "art" | "town")}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/70 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                    >
                      <option value="both">양쪽 전시회 모두 출품</option>
                      <option value="art">🎨 무한상상 AI아트전</option>
                      <option value="town">🏘️ AI로 그리는 우리 동네 이야기</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#613F75] mb-1">
                    이미지 경로 또는 URL
                  </label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="/album/photo-1.jpg 또는 웹 URL"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/70 text-sm text-[#3D234A] focus:outline-none focus:ring-2 focus:ring-[#613F75]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#E5C3D1] text-[#613F75] hover:bg-[#ebd0dc] cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-[#613F75] text-[#E5C3D1] hover:opacity-90 shadow-md cursor-pointer"
                  >
                    등록하기
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
      <footer className="mt-16 py-6 text-center text-xs text-[#5D3A6C]">
        <p>© 2026 COCO Gallery - 앨범 컬렉션. All rights reserved.</p>
      </footer>
    </div>
  );
}
