import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteMetadata } from "@/lib/metadata";
import { getVinovalorSession } from "@/lib/session";
import "./globals.css";

export const metadata = siteMetadata;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getVinovalorSession();
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
