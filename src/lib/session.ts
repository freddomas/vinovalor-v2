import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions, hasAuthSecret } from "./auth";

export async function getVinovalorSession(): Promise<Session | null> {
  if (!hasAuthSecret()) {
    return null;
  }

  try {
    return await getServerSession(authOptions);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Session Vinovalor indisponible.", error);
    }

    return null;
  }
}
