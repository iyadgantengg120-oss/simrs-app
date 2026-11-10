import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

const akses: Record<string, string[]> = {
  ADMIN: ["*"],
  DOKTER: ["/pemeriksaan"],
  PENDAFTARAN: ["/pendaftaran", "/antrian"],
};

const beranda: Record<string, string> = {
  ADMIN: "/dashboard",
  DOKTER: "/pemeriksaan",
  PENDAFTARAN: "/pendaftaran",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  let role: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, key);
      role = payload.role as string;
    } catch {}
  }

  if (pathname === "/login") {
    if (role) return NextResponse.redirect(new URL(beranda[role], req.url));
    return NextResponse.next();
  }

  if (!role) return NextResponse.redirect(new URL("/login", req.url));

  const boleh = akses[role] ?? [];
  const diizinkan =
    boleh.includes("*") ||
    boleh.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (diizinkan) return NextResponse.next();
  return NextResponse.redirect(new URL(beranda[role], req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};