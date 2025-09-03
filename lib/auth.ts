// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // ❌ ADAPTER KULLANMIYORUZ - JWT ile uyumsuz
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: { strategy: "jwt" }, // ✅ JWT kullan
  callbacks: {
    async jwt({ token, user }) {
      // Kullanıcı ilk giriş yaptığında
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, id: true }
        });
        token.role = dbUser?.role || Role.USER;
        token.id = dbUser?.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as Role) || Role.USER;
      }
      return session;
    },
    async signIn({ user }) {
      // Yeni kullanıcı için default role ata
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (!existingUser) {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: Role.USER },
          });
        }
      }
      return true;
    }
  },
};