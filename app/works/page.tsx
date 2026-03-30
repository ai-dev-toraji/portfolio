import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import WorksContent from "./components/WorksContent";

export const metadata = {
  title: "Works | NEXTORA",
};

export type Work = {
  id: number;
  title: string;
  imageSrc: string;
  tags: string[];
  categories: string[];
};

export type Category = {
  label: string;
  value: string;
};

export const categories: Category[] = [
  { label: "LP", value: "lp" },
  { label: "静的コーディング", value: "static-coding" },
  { label: "WordPress構築", value: "wordpress" },
  { label: "フロントエンド開発", value: "frontend" },
  { label: "バックエンド開発", value: "backend" },
  { label: "アプリ開発", value: "app" },
  { label: "改修", value: "renewal" },
  { label: "保守・運用", value: "maintenance" },
];

export const works: Work[] = [
  {
    id: 1,
    title: "オウンドメディアサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["オウンドメディア", "コンサルティング"],
    categories: ["WordPress構築"],
  },
  {
    id: 2,
    title: "美容室サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["美容室"],
    categories: ["静的コーディング"],
  },
  {
    id: 3,
    title: "コーポレートサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["建設"],
    categories: ["WordPress構築"],
  },
  {
    id: 4,
    title: "教育サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["教育", "大手企業"],
    categories: ["静的コーディング"],
  },
  {
    id: 5,
    title: "コンソーシアムサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["コンソーシアム"],
    categories: ["静的コーディング"],
  },
  {
    id: 6,
    title: "コーポレートサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["スタートアップ企業"],
    categories: ["WordPress構築", "保守・運用"],
  },
  {
    id: 7,
    title: "大手企業の新規事業サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["大手企業"],
    categories: ["静的コーディング"],
  },
  {
    id: 8,
    title: "採用サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["アパレル"],
    categories: ["静的コーディング"],
  },
  {
    id: 9,
    title: "カードショップサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["カードショップ", "チーム制作"],
    categories: ["静的コーディング"],
  },
  {
    id: 10,
    title: "コーポレートサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["コンサルティング"],
    categories: ["静的コーディング"],
  },
  {
    id: 11,
    title: "保育園サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["保育"],
    categories: ["WordPress構築"],
  },
  {
    id: 12,
    title: "不動産サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["不動産"],
    categories: ["WordPress構築", "改修"],
  },
  {
    id: 13,
    title: "出会い系サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["出会い系"],
    categories: ["WordPress構築"],
  },
  {
    id: 14,
    title: "医療施設サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["医療", "チーム制作"],
    categories: ["WordPress構築"],
  },
  {
    id: 15,
    title: "コーポレートサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["アニメーション"],
    categories: ["WordPress構築"],
  },
  {
    id: 16,
    title: "歯科クリニックサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["歯科クリニック"],
    categories: ["WordPress構築"],
  },
  {
    id: 17,
    title: "アパレルブランドサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["アパレル"],
    categories: ["WordPress構築"],
  },
  {
    id: 18,
    title: "コーポレートサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["建設会社"],
    categories: ["WordPress構築"],
  },
  {
    id: 19,
    title: "競輪サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["競輪"],
    categories: ["WordPress構築"],
  },
  {
    id: 20,
    title: "大手オウンドメディアサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["大手企業", "オウンドメディア"],
    categories: ["WordPress構築"],
  },
  {
    id: 21,
    title: "コーポレートサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["製造", "チーム制作"],
    categories: ["WordPress構築"],
  },
  {
    id: 22,
    title: "採用サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["採用", "チーム制作"],
    categories: ["WordPress構築"],
  },
  {
    id: 23,
    title: "Webアプリ開発",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["スタートアップ企業", "チーム制作"],
    categories: ["アプリ開発", "フロントエンド開発", "バックエンド開発"],
  },
  {
    id: 24,
    title: "音楽教室サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["音楽教室", "チーム制作"],
    categories: ["フロントエンド開発", "静的コーディング"],
  },
  {
    id: 25,
    title: "大手ドラッグストアグループサイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["ドラッグストア", "チーム制作"],
    categories: ["フロントエンド開発", "静的コーディング", "保守・運用"],
  },
  {
    id: 26,
    title: "ビジネス教育・人材育成企業サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["ビジネス", "チーム制作"],
    categories: ["フロントエンド開発"],
  },
  {
    id: 27,
    title: "Webアプリ開発",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["AIキャラクター生成AI", "チーム制作"],
    categories: ["アプリ開発", "フロントエンド開発"],
  },
  {
    id: 28,
    title: "ブライダル企業サイト制作",
    imageSrc: "/works/thumbnail.jpg",
    tags: ["ブライダル", "チーム制作"],
    categories: ["フロントエンド開発", "静的コーディング"],
  },
];

export const ITEMS_PER_PAGE = 12;

export default function WorksPage() {
  const sorted = [...works].sort((a, b) => b.id - a.id);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const pagedWorks = sorted.slice(0, ITEMS_PER_PAGE);

  return (
    <>
      <Header />
      <main className="pt-16">
        <WorksContent
          works={pagedWorks}
          categories={categories}
          currentPage={1}
          totalPages={totalPages}
          basePath="/works"
        />
      </main>
      <Footer />
    </>
  );
}
