import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log("Attempting login with:", credentials.email);

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/account/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              timeout: 10000,
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );

          console.log("API Response:", response.data);

          // Check if the response is successful and has user data
          if (!response.data?.success || !response.data?.user) {
            console.log("Invalid response structure or unsuccessful login");
            return null;
          }

          const { user } = response.data;

          // Validate that we have the required user properties
          if (!user.id || !user.email) {
            console.log("Missing required user properties");
            return null;
          }

          // Return the user object that NextAuth expects
          return {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
            token: user.token, // The token is inside the user object
            refreshToken: null, // Set to null since your API doesn't provide refresh token
          };

        } catch (error) {
          console.error("Login error:", error);

          if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
              console.log("Invalid credentials - 401 error");
              return null;
            }
            if (error.response?.status >= 500) {
              console.log("Server error - 500+ error");
              return null;
            }
            // Log other HTTP errors for debugging
            console.log("HTTP error:", error.response?.status, error.response?.data);
          }

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.accessToken = user.token;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        username: token.username,
        role: token.role,
        token: token.accessToken,
        refreshToken: token.refreshToken,
      };
      return session;
    },
  },
  pages: {
    signIn: "/account",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default function auth(req, res) {
  return NextAuth(req, res, authOptions);
}