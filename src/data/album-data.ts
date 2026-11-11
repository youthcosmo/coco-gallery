import { GalleryItem } from "@/types/gallery";

export const COCO_ALBUM_ITEMS: GalleryItem[] = [
  // 1열 배치: 가로 A4 + 세로 A4
  {
    id: "album-1",
    title: "멀리 보이는 도시, 이어진 시간들",
    category: "Architecture",
    categories: ["Architecture", "Street"],
    imageUrl: "/album/photo-1-clean.jpg",
    author: "COCO",
    width: 3224,
    height: 2198,
    exhibitions: ["AI로 그리는 우리 동네 이야기"],
  },
  {
    id: "album-2",
    title: "포근한 하늘 아래, 눈 위에 남겨진 이야기",
    category: "Architecture",
    categories: ["Architecture", "Nature"],
    imageUrl: "/album/photo-2-clean.jpg",
    author: "COCO",
    width: 2196,
    height: 3224,
    exhibitions: ["AI로 그리는 우리 동네 이야기"],
  },

  // 2열 배치: 가로 A4 + 세로 A4
  {
    id: "album-3",
    title: "봄의 순간, 그리고 기록",
    category: "Architecture",
    categories: ["Architecture", "Nature", "Street"],
    imageUrl: "/album/photo-3-clean.jpg",
    author: "COCO",
    width: 3224,
    height: 2198,
    exhibitions: ["AI로 그리는 우리 동네 이야기"],
  },
  {
    id: "album-6",
    title: "빛의 손끝, AI 기억의 파편 사이에서",
    category: "Architecture",
    categories: ["Architecture", "Portrait", "Street"],
    imageUrl: "/album/photo-5.png",
    author: "COCO",
    width: 912,
    height: 1296,
    exhibitions: ["무한상상 AI아트전", "AI로 그리는 우리 동네 이야기"],
  },

  // 3열 배치: 정사각형 + 정사각형
  {
    id: "album-4",
    title: "스마트시티_내일의 동네, 오늘의 상상",
    category: "Architecture",
    categories: ["Architecture", "Exhibition", "Street"],
    imageUrl: "/album/photo-4.png",
    author: "COCO",
    width: 2048,
    height: 2048,
    exhibitions: ["무한상상 AI아트전", "AI로 그리는 우리 동네 이야기"],
  },
  {
    id: "album-5",
    title: "계절의 윤회: 자전거, 돔, 그리고 시간의 곡선",
    category: "Street",
    categories: ["Street", "Exhibition"],
    imageUrl: "/album/photo-6.png",
    author: "COCO",
    width: 2148,
    height: 2148,
    exhibitions: ["무한상상 AI아트전", "AI로 그리는 우리 동네 이야기"],
  },
];
