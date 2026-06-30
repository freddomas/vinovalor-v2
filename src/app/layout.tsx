import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { authOptions } from "@/lib/auth";
import { siteMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata = siteMetadata;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="fr">
      <body>
        <div className="shell">
          <Header session={session} />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
