// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // For scalability & stateless sessions
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("No user found");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        if (!user.isActive) {
          throw new Error("Account is inactive");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username || user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist role into JWT
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass role from token to session
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page
    // You can also define: error, signOut, etc.
  },
  secret: process.env.NEXTAUTH_SECRET, // Secure your JWTs
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };