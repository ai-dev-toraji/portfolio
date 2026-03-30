import SectionTitle from "@/components/ui/section-title";
import Image from "next/image";

const services = [
  {
    imageSrc: "/service/service_01.png",
    title: "コーディング",
    description:
      "HTML,CSS,JavaScriptを用いたサイトの構築。これまでに150件以上のサイトに携わってきた経験から、高品質なコーディングを提供します。\nまた、複雑なアニメーションの動きなども実装可能です。",
  },
  {
    imageSrc: "/service/service_02.png",
    title: "WordPress構築",
    description:
      "オリジナルテーマを使用したWordPress構築を得意としています。\nただ作るだけでなく、管理する人にとって使いやすい構築を大事にしています。",
  },
  {
    imageSrc: "/service/service_03.png",
    title: "フロントエンド開発",
    description:
      "React ,Next.jsを用いたフロントエンド開発が可能です。（2年以上の経験）\nPythonを使用したことがあるので、バックエンドを考慮した開発を行えます。",
  },
];

export default function ServiceList() {
  return (
    <section className="bg-(--color-sub) py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle color="primary" as="h1">SERVICE</SectionTitle>
        <div className="flex flex-col gap-16">
          {services.map((service) => (
            <div
              key={service.title}
              className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-8 items-center"
            >
              {/* Image placeholder */}
              <div className="bg-[#C8C8C8]">
                <Image className="w-full h-full object-cover" src={service.imageSrc} alt={service.title} width={236} height={150} />
              </div>

              {/* Text */}
              <div>
                <h3 className="text-(--color-primary) text-2xl md:text-3xl font-bold tracking-wide mb-4">
                  {service.title}
                </h3>
                <p className="text-(--color-text) text-sm leading-loose whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
