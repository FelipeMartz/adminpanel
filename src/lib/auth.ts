import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "discord") {
        const whitelist = process.env.DISCORD_WHITELIST?.split(",").map(s => s.trim()) || [];
        const discordId = profile?.id;
        if (discordId && whitelist.includes(discordId)) {
          return true;
        }
      }

      if (account?.provider === "google") {
        const whitelist = process.env.GMAIL_WHITELIST?.split(",").map(s => s.trim()) || [];
        const email = user?.email;
        if (email && whitelist.includes(email)) {
          return true;
        }
      }
      
      // Si no está en la whitelist, denegar acceso
      return false;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login on error
  },
};
