import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  // ローカル開発・本番環境は Basic 認証をスキップ
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (
      user === process.env.BASIC_AUTH_USER &&
      pwd === process.env.BASIC_AUTH_PASSWORD
    ) {
      return NextResponse.next();
    }
  }

  url.pathname = "/api/auth";
  return NextResponse.rewrite(url);
}
