export interface GalleryItem {
  id: string;
  title: string;
  category: "Exhibition" | "Nature" | "Architecture" | "Street" | "Portrait";
  categories?: ("Exhibition" | "Nature" | "Architecture" | "Street" | "Portrait")[];
  imageUrl: string;
  author: string;
  width?: number;
  height?: number;
  likes?: number;
  exhibitions?: ("무한상상 AI아트전" | "AI로 그리는 우리 동네 이야기")[];
}
