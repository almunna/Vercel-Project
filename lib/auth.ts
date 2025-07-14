import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // 🚨 Replace this with your real user lookup
        if (
          credentials?.email === "test@example.com" &&
          credentials?.password === "password"
        ) {
          return { id: "1", email: credentials.email }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
}
