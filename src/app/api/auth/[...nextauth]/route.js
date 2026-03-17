import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        console.log('NextAuth: Google Sign In attempt for:', user.email);
        try {
          const api_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          console.log('NextAuth: Calling backend at:', `${api_url}/auth/google`);
          const response = await fetch(`${api_url}/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          const data = await response.json();

          if (data.success) {
            console.log('NextAuth: Backend Auth success');
            user.accessToken = data.token;
            user.role = data.user.role;
            user.id = data.user.id;
            return true;
          } else {
            console.error('NextAuth: Backend Auth failed:', data.message);
            return false;
          }
        } catch (error) {
          console.error('NextAuth: Error calling backend:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }
