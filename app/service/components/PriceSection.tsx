import SectionTitle from "@/components/ui/section-title";

const prices1 = [
  { item: "LPコーディング", price: "50000円～" },
  { item: "トップページ", price: "50000円～" },
  { item: "下層ページ", price: "10000円～" },
  { item: "流し込みページ", price: "8000円～" },
  { item: "LPコーディング", price: "50000円～" },
  { item: "JSなどによるカスタマイズ", price: "50000円～" },
  { item: "WordPress構築", price: "100000円～" },
  { item: "サイト改修", price: "50000円～" },
];

const prices2 = [
  { item: "LPコーディング", price: "50000円～" },
  { item: "トップページ", price: "50000円～" },
  { item: "下層ページ", price: "10000円～" },
  { item: "流し込みページ", price: "8000円～" },
  { item: "JSなどによるカスタマイズ", price: "50000円～" },
  { item: "WordPress構築", price: "100000円～" },
  { item: "サイト改修", price: "50000円～" },
];

export default function PriceSection() {
  return (
    <section className="bg-(--color-primary) py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle color="accent">PRICE</SectionTitle>

        <div className="mx-auto bg-white px-4 py-8 md:p-8">
          <h3 className="text-(--color-primary) text-2xl font-bold tracking-wide mb-4">
            Webアプリ開発
          </h3>
          <table className="w-full border border-white/40 text-sm">
            <tbody>
              {prices1.map((row, index) => (
                <tr key={index} className="border-b border-t border-(--color-primary)/20">
                  <td className="p-3 md:py-4 md:px-6 text-(--color-text) font-medium w-1/2 md:w-1/3 border-r border-(--color-primary)/20">
                    {row.item}
                  </td>
                  <td className="p-3 md:py-4 md:px-6 text-(--color-text)">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="text-(--color-primary) text-2xl font-bold tracking-wide mb-4 mt-12">
            Web制作
          </h3>
          <table className="w-full border border-white/40 text-sm">
            <tbody>
              {prices2.map((row, index) => (
                <tr key={index} className="border-b border-t border-(--color-primary)/20">
                  <td className="p-3 md:py-4 md:px-6 text-(--color-text) font-medium w-1/2 md:w-1/3 border-r border-(--color-primary)/20">
                    {row.item}
                  </td>
                  <td className="p-3 md:py-4 md:px-6 text-(--color-text)">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
