import SectionTitle from "@/components/ui/section-title";

const flowSteps = [
  {
    title: "ヒヤリング",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
  },
  {
    title: "ヒヤリング",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
  },
  {
    title: "ヒヤリング",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
  },
  {
    title: "ヒヤリング",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
  },
  {
    title: "ヒヤリング",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
  },
  {
    title: "ヒヤリング",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
  },
];

export default function FlowSection() {
  return (
    <section className="bg-(--color-sub) py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle color="primary">FLOW</SectionTitle>

        {/* Grid with shared borders pattern */}
        <div className=" mx-auto grid grid-cols-1 md:grid-cols-3 border-t border-l border-(--color-primary)/20">
          {flowSteps.map((step, index) => (
            <div
              key={index}
              className="p-8 border-b border-r border-(--color-primary)/20"
            >
              <h4 className="text-(--color-text) font-bold text-sm mb-4">{step.title}</h4>
              <p className="text-(--color-text)/60 text-xs leading-loose">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
