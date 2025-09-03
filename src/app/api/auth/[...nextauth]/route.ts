// app/api/auth/[...nextauth]/route.ts 
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Extend next-auth types
import { Session, User } from "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      httpOptions: { timeout: 10000 },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Kullanıcı ilk giriş yaptığında
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      // Mevcut token için role güncellemesi
      else if (token.sub && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        });
        token.role = dbUser?.role ?? Role.USER;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? Role.USER;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
  // Sadece GitHub provider'ı için
  if (account?.provider === "github") {
    try {
      // ✅ Null check ve email validation
      if (!user.email || !user.email.includes('@')) {
        console.warn("Invalid or missing email from GitHub:", user.email);
        return true; // Girişe izin ver, roller sonradan manuel ayarlanabilir
      }

      // ✅ Email'i lowercase yap ve trimle
      const email = user.email.toLowerCase().trim();
      
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true }
      });

      // Yeni kullanıcıysa veya rolü yoksa default role ata
      if (!existingUser) {
        await prisma.user.update({
          where: { email },
          data: { role: Role.USER }
        });
      } else if (!existingUser.role) {
        // Eski kullanıcıda rol yoksa ekle
        await prisma.user.update({
          where: { email },
          data: { role: Role.USER }
        });
      }
    } catch (error) {
      console.error("SignIn callback error (non-blocking):", error);
      // Hata olsa bile girişi engelleme
    }
  }
  return true;
}
  },
  pages: { signIn: "/auth/signin" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };