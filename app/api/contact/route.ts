import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ── レート制限（インメモリ） ──────────────────────────
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10分
const RATE_LIMIT_MAX = 3; // 10分間に最大3回

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) return true;

  entry.count++;
  return false;
}

// ── 入力サイズ制限 ────────────────────────────────────
const LIMITS = {
  name: 100,
  email: 254,
  phone: 20,
  message: 2000,
};

// ── API ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // IP 取得
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // レート制限チェック
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "送信回数の上限に達しました。しばらく時間をおいてから再度お試しください。" },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { name, email, phone, message, website } = body;

  // ハニーポットチェック（ボットは hidden フィールドに値を入れる）
  if (website) {
    return NextResponse.json({ success: true }); // ボットには成功を偽装
  }

  // 必須チェック
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "お名前・メールアドレス・お問い合わせ内容は必須です。" },
      { status: 400 }
    );
  }

  // サイズ制限チェック
  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    (phone && phone.length > LIMITS.phone) ||
    message.length > LIMITS.message
  ) {
    return NextResponse.json(
      { error: "入力内容が長すぎます。" },
      { status: 400 }
    );
  }

  // メールアドレス簡易検証
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "メールアドレスの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: `"NEXTORA" <${process.env.GMAIL_USER}>`,
    replyTo: email,
    subject: `【お問い合わせ】${name} 様より`,
    text: [
      `お名前：${name}`,
      `メールアドレス：${email}`,
      `電話番号：${phone || "未入力"}`,
      "",
      `【お問い合わせ内容】`,
      message,
    ].join("\n"),
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("メール送信エラー:", error);
    return NextResponse.json(
      { error: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}
