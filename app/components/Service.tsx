import Link from "next/link";

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
    <section id="service" className="bg-[#E9EEF5] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <h2 className="text-center text-[#0048A0] text-4xl md:text-5xl font-black tracking-[0.3em] mb-16">
          SERVICE
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#0048A0]/20">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`bg-[#D8DFE8] p-8 md:p-10 flex flex-col gap-4 ${
                index < services.length - 1
                  ? "border-b md:border-b-0 md:border-r border-[#0048A0]/20"
                  : ""
              }`}
            >
              <h3 className="text-[#0048A0] text-lg font-bold tracking-wide border-b border-[#0048A0]/20 pb-4">
                {service.title}
              </h3>
              <p className="text-[#1a1a1a]/70 text-sm leading-loose tracking-wide">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-14 flex justify-center">
          <Link
            href="/service"
            className="inline-flex items-center gap-4 text-sm tracking-[0.3em] text-white bg-[#0048A0] border border-[#0048A0] px-10 py-4 hover:bg-transparent hover:text-[#0048A0] transition-all duration-300 group"
          >
            詳細を見る
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">&#8594;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
