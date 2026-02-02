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
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
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

          console.log("API Response status:", response.status);
          console.log("API Response data:", response.data);

          // Check if response has the expected structure
          if (!response.data?.access || !response.data?.user) {
            console.log("Invalid response structure or missing access token");
            return null;
          }

          const { user, access: token, refresh } = response.data;

          console.log("Login successful for user:", user.email);

          return {
            id: user.id.toString(), 
            email: user.email,
            name: user.username, 
            role: user.role,
            token,
            refreshToken: refresh, 
          };
        } catch (error) { 
          console.error("Authentication error:", error);
          
          if (axios.isAxiosError(error)) {
            console.error("Axios error details:", {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
              message: error.message
            });
            
           
            if (error.response?.status === 401) {
              console.log("Invalid credentials from API");
              return null;
            }
            
            if (error.response?.status >= 500) {
              console.log("Server error from API");
              return null;
            }
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
        token.name = user.name;
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
        name: token.name,
        role: token.role,
        token: token.accessToken,
        refreshToken: token.refreshToken,
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth",
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