import SectionTitle from "@/components/ui/section-title";

export default function Profile() {
  return (
    <section className="bg-(--color-sub) py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle color="primary" as="h1">ABOUT</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Image */}
          <div className="aspect-square bg-[#C8C8C8] flex items-center justify-center">
            <span className="text-[#888] tracking-widest text-sm">画像</span>
          </div>

          {/* Text Content */}
          <div>
            <h2 className="text-(--color-accent) text-3xl font-bold tracking-wide mb-5">
              自己紹介
            </h2>
            <p className="text-(--color-text)/80 text-sm leading-loose mb-10">
              岐阜県出身の27歳。現在は、LP/ホームページ制作/を中心に活動をしております。
              現在は、コーディング、デザイン、ディレクションを行い、多くの方の課題を解決できる存在になりたいと考えております。
            </p>

            <h2 className="text-(--color-accent) text-3xl font-bold tracking-wide mb-5">
              経歴
            </h2>
            <p className="text-(--color-text)/80 text-sm leading-loose">
              岐阜県生まれ。小学から高校まで9年間野球部に所属し、文武両道に励む。
              <br />
              その後、名古屋の大学に進み、建築について専門的に学ぶ。
              <br />
              卒業後、大手建設会社に施工管理者として就職。1年ほど現場での計画、管理について経験。
              <br />
              退職後、コンサルタント会社でCAD、BIMオペレーターとして転職。
              <br />
              業務の中で、エンジニアの働き方に魅力を感じ、Web制作について学習開始。
              <br />
              現在は、フリーランスとして日々制作依頼を請け負っている。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
