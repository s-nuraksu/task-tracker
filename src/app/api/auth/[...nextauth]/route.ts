// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: { strategy: "jwt" },

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      httpOptions: { timeout: 10000 },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      // İlk girişte user gelir → token’a id ve role yaz
      if (user) {
        token.sub = user.id as string;
        // ts-expect-error prisma adapter user.role alanı
        token.role = (user.role as Role) ?? "USER";
        return token;
      }

      // Sonraki isteklerde role boşsa DB’den al
      if (token.sub && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { role: true },
        });
        // ts-expect-error token genişletiyoruz
        token.role = (dbUser?.role as Role) ?? "USER";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        // ts-expect-error: custom fields
        session.user.id = token.sub as string;
        // @ts-expect-error: custom fields
        session.user.role = (token.role as Role) ?? "USER";
      }
      return session;
    },

    async signIn() {
      return true;
    },
  },

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
