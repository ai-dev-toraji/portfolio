"use client";

import { useState } from "react";
import SectionTitle from "@/components/ui/section-title";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "送信に失敗しました。");
      }

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "送信に失敗しました。");
    }
  };

  const inputClass =
    "w-full bg-white py-3 px-4 text-sm text-(--color-text) outline-none focus:ring-1 focus:ring-(--color-primary)/40 transition-all duration-200 disabled:opacity-50";

  const labelClass = "text-sm text-(--color-text) tracking-wide md:pt-3";

  const rowClass =
    "grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 md:gap-8 mb-8 items-start";

  const isLoading = status === "loading";

  return (
    <section className="bg-(--color-sub) py-20 md:py-28 min-h-[calc(100vh-293px)]">
      <div className="max-w-4xl mx-auto px-6">
        <SectionTitle color="primary" as="h1">CONTACT</SectionTitle>

        {status === "success" ? (
          <div className="max-w-3xl mx-auto text-center md:pt-16">
            <p className="text-(--color-primary) text-lg font-bold tracking-wide mb-4">
              送信が完了しました
            </p>
            <p className="text-(--color-text)/70 text-sm leading-loose">
              お問い合わせいただきありがとうございます。
              <br />
              内容を確認のうえ、折り返しご連絡いたします。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            {/* お名前 */}
            <div className={rowClass}>
              <label className={labelClass}>
                お名前<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                disabled={isLoading}
              />
            </div>

            {/* メールアドレス */}
            <div className={rowClass}>
              <label className={labelClass}>
                メールアドレス<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                disabled={isLoading}
              />
            </div>

            {/* 電話番号 */}
            <div className={rowClass}>
              <label className={labelClass}>電話番号</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
                disabled={isLoading}
              />
            </div>

            {/* お問い合わせ内容 */}
            <div className={rowClass}>
              <label className={labelClass}>
                お問い合わせ内容<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={8}
                className={`${inputClass} resize-none`}
                disabled={isLoading}
              />
            </div>

            {/* エラーメッセージ */}
            {status === "error" && (
              <p className="text-center text-red-500 text-sm mb-6">{errorMessage}</p>
            )}

            {/* Submit button */}
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-4 text-sm tracking-[0.3em] px-10 py-4 bg-(--color-primary) text-white border border-(--color-primary) hover:bg-white hover:text-(--color-primary) transition-all duration-300 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-(--color-primary) disabled:hover:text-white"
              >
                {isLoading ? "送信中..." : "送信する"}
                {!isLoading && (
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
                    &#8594;
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
