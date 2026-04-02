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
  publishedAt: string;
  content: string;
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

const dummyContent = `
<h2>制作概要</h2>
<p>クライアントの要望をヒアリングし、ブランドイメージに合わせたデザイン・実装を行いました。レスポンシブ対応はもちろん、表示速度やSEOにも配慮した制作を行っています。</p>
<h2>担当範囲</h2>
<p>デザインカンプをもとにHTML・CSS・JavaScriptによるコーディングを担当しました。アニメーションにはGSAPを使用し、スムーズな動きを実現しています。</p>
<h2>使用技術</h2>
<p>HTML / CSS / JavaScript / WordPress / PHP</p>
<h2>制作期間</h2>
<p>約3週間</p>
`;

export const works: Work[] = [
  { id: 1,  title: "オウンドメディアサイト制作",            imageSrc: "/works/thumbnail.jpg", tags: ["オウンドメディア", "コンサルティング"],  categories: ["WordPress構築"],                                      publishedAt: "2021-09", content: dummyContent },
  { id: 2,  title: "美容室サイト制作",                      imageSrc: "/works/thumbnail.jpg", tags: ["美容室"],                               categories: ["静的コーディング"],                                   publishedAt: "2021-11", content: dummyContent },
  { id: 3,  title: "コーポレートサイト制作",                imageSrc: "/works/thumbnail.jpg", tags: ["建設"],                                 categories: ["WordPress構築"],                                      publishedAt: "2022-01", content: dummyContent },
  { id: 4,  title: "教育サイト制作",                        imageSrc: "/works/thumbnail.jpg", tags: ["教育", "大手企業"],                     categories: ["静的コーディング"],                                   publishedAt: "2022-03", content: dummyContent },
  { id: 5,  title: "コンソーシアムサイト制作",              imageSrc: "/works/thumbnail.jpg", tags: ["建設"],                       categories: ["静的コーディング"],                                   publishedAt: "2022-04", content: dummyContent },
  { id: 6,  title: "コーポレートサイト制作",                imageSrc: "/works/thumbnail.jpg", tags: ["スタートアップ企業"],                   categories: ["WordPress構築", "保守・運用"],                        publishedAt: "2022-06", content: dummyContent },
  { id: 7,  title: "大手企業の新規事業サイト制作",          imageSrc: "/works/thumbnail.jpg", tags: ["大手企業"],                             categories: ["静的コーディング"],                                   publishedAt: "2022-07", content: dummyContent },
  { id: 8,  title: "採用サイト制作",                        imageSrc: "/works/thumbnail.jpg", tags: ["アパレル"],                             categories: ["静的コーディング"],                                   publishedAt: "2022-08", content: dummyContent },
  { id: 9,  title: "カードショップサイト制作",              imageSrc: "/works/thumbnail.jpg", tags: ["カードショップ", "チーム制作"],         categories: ["静的コーディング"],                                   publishedAt: "2022-09", content: dummyContent },
  { id: 10, title: "コーポレートサイト制作",                imageSrc: "/works/thumbnail.jpg", tags: ["コンサルティング"],                     categories: ["静的コーディング"],                                   publishedAt: "2022-10", content: dummyContent },
  { id: 11, title: "保育園サイト制作",                      imageSrc: "/works/thumbnail.jpg", tags: ["保育"],                                 categories: ["WordPress構築"],                                      publishedAt: "2022-11", content: dummyContent },
  { id: 12, title: "不動産サイト制作",                      imageSrc: "/works/thumbnail.jpg", tags: ["不動産"],                               categories: ["WordPress構築", "改修"],                             publishedAt: "2022-12", content: dummyContent },
  { id: 13, title: "出会い系サイト制作",                    imageSrc: "/works/thumbnail.jpg", tags: ["出会い系"],                             categories: ["WordPress構築"],                                      publishedAt: "2023-01", content: dummyContent },
  { id: 14, title: "医療施設サイト制作",                    imageSrc: "/works/thumbnail.jpg", tags: ["医療", "チーム制作"],                   categories: ["WordPress構築"],                                      publishedAt: "2023-02", content: dummyContent },
  { id: 15, title: "コーポレートサイト制作",                imageSrc: "/works/thumbnail.jpg", tags: ["アニメーション"],                       categories: ["WordPress構築"],                                      publishedAt: "2023-03", content: dummyContent },
  { id: 16, title: "歯科クリニックサイト制作",              imageSrc: "/works/thumbnail.jpg", tags: ["歯科クリニック"],                       categories: ["WordPress構築"],                                      publishedAt: "2023-04", content: dummyContent },
  { id: 17, title: "アパレルブランドサイト制作",            imageSrc: "/works/thumbnail.jpg", tags: ["アパレル"],                             categories: ["WordPress構築"],                                      publishedAt: "2023-05", content: dummyContent },
  { id: 18, title: "コーポレートサイト制作",                imageSrc: "/works/thumbnail.jpg", tags: ["建設会社"],                             categories: ["WordPress構築"],                                      publishedAt: "2023-06", content: dummyContent },
  { id: 19, title: "競輪サイト制作",                        imageSrc: "/works/thumbnail.jpg", tags: ["競輪"],                                 categories: ["WordPress構築"],                                      publishedAt: "2023-07", content: dummyContent },
  { id: 20, title: "大手オウンドメディアサイト制作",        imageSrc: "/works/thumbnail.jpg", tags: ["大手企業", "オウンドメディア"],         categories: ["WordPress構築"],                                      publishedAt: "2023-08", content: dummyContent },
  { id: 21, title: "コーポレートサイト制作",                imageSrc: "/works/thumbnail.jpg", tags: ["製造", "チーム制作"],                   categories: ["WordPress構築"],                                      publishedAt: "2023-09", content: dummyContent },
  { id: 22, title: "採用サイト制作",                        imageSrc: "/works/thumbnail.jpg", tags: ["採用", "チーム制作"],                   categories: ["WordPress構築"],                                      publishedAt: "2023-10", content: dummyContent },
  { id: 23, title: "Webアプリ開発",                         imageSrc: "/works/thumbnail.jpg", tags: ["スタートアップ企業", "チーム制作"],     categories: ["アプリ開発", "フロントエンド開発", "バックエンド開発"], publishedAt: "2023-11", content: dummyContent },
  { id: 24, title: "音楽教室サイト制作",                    imageSrc: "/works/thumbnail.jpg", tags: ["音楽教室", "チーム制作"],               categories: ["フロントエンド開発", "静的コーディング"],             publishedAt: "2023-12", content: dummyContent },
  { id: 25, title: "大手ドラッグストアグループサイト制作",  imageSrc: "/works/thumbnail.jpg", tags: ["ドラッグストア", "チーム制作"],         categories: ["フロントエンド開発", "静的コーディング", "保守・運用"], publishedAt: "2024-01", content: dummyContent },
  { id: 26, title: "ビジネス教育・人材育成企業サイト制作", imageSrc: "/works/thumbnail.jpg", tags: ["ビジネス", "チーム制作"],               categories: ["フロントエンド開発"],                                 publishedAt: "2024-03", content: dummyContent },
  { id: 27, title: "Webアプリ開発",                         imageSrc: "/works/thumbnail.jpg", tags: ["AIキャラクター生成AI", "チーム制作"],   categories: ["アプリ開発", "フロントエンド開発"],                   publishedAt: "2024-06", content: dummyContent },
  { id: 28, title: "ブライダル企業サイト制作",              imageSrc: "/works/thumbnail.jpg", tags: ["ブライダル", "チーム制作"],             categories: ["フロントエンド開発", "静的コーディング"],             publishedAt: "2024-09", content: dummyContent },
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
