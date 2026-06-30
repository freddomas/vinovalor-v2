import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { z } from "zod";
import { users } from "./domain";
import { verifyPassword } from "./security";
import type { CurrentUser, Role } from "./types";

const localPasswordHash = "pbkdf2_sha256$210000$vinovalor-local-2026$afd912d5caf81ba7176e2e2c6cb04781c061d83fe5299fc44c515e9254b46ffa";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const seededAccounts = users.slice(0, 8).map((user, index) => ({
  id: user.id,
  email: `${user.firstName.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".") || "user"}${index + 1}@vinovalor.local`,
  name: `${user.firstName.trim()} ${user.lastName.trim()}`.trim(),
  role: (user.isCertified ? "certified_seller" : index % 3 === 0 ? "seller" : "buyer") as Role,
  isCertified: user.isCertified,
  passwordHash: localPasswordHash
}));

seededAccounts.push({
  id: "local-admin-vinovalor",
  email: "admin@vinovalor.local",
  name: "Administrateur Vinovalor",
  role: "admin",
  isCertified: true,
  passwordHash: localPasswordHash
});

export const demoAccounts = seededAccounts.map(({ passwordHash: _passwordHash, ...account }) => account);

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

export function hasAuthSecret(): boolean {
  return Boolean(authSecret);
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Compte local",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Mot de passe", type: "password" }
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const account = seededAccounts.find((item) => item.email.toLowerCase() === parsed.data.email.toLowerCase());
      if (!account || !verifyPassword(parsed.data.password, account.passwordHash)) return null;
      return {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
        isCertified: account.isCertified
      };
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8
  },
  pages: {
    signIn: "/connexion"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as CurrentUser).role ?? "buyer";
        token.isCertified = Boolean((user as CurrentUser).isCertified);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as Role | undefined) ?? "buyer";
        session.user.isCertified = Boolean(token.isCertified);
      }
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-vinovalor.session-token" : "vinovalor.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  secret: authSecret
};

export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
