import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "Vinovalor - Caves et bouteilles verifiees",
    template: "%s | Vinovalor"
  },
  description:
    "Marketplace française premium pour acheter, vendre et verifier des vins, caves et spiritueux d'exception.",
  robots: {
    index: true,
    follow: true
  }
};
