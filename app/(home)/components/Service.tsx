import Button from "@/components/ui/button";
import SectionTitle from "@/components/ui/section-title";
import ServiceCard from "@/components/ui/service-card";

const services = [
  {
    title: "コーディング",
    description:
      "HTML、CSS、JavaScriptを用いたサイトの構築。これまでに150件以上のサイトに携わってきた経験から、高品質なコーディングを提供します。",
  },
  {
    title: "WordPress構築",
    description:
      "ただ作るだけでなく、管理する人にとって使いやすい構築を大事にしています。また、複雑なアニメーションの動きなども実装可能です。",
  },
  {
    title: "フロントエンド開発",
    description:
      "React、Next.jsを用いたフロントエンド開発が可能です（2年以上の経験）。Pythonを使用したことがあるので、バックエンドを考慮した開発を行えます。",
  },
];

export default function Service() {
  return (
    <section id="service" className="bg-(--color-sub) py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <SectionTitle color="primary">SERVICE</SectionTitle>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-(--color-primary)/20">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              isLast={index === services.length - 1}
            />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button href="/service" variant="primary">詳細を見る</Button>
        </div>
      </div>
    </section>
  );
}
