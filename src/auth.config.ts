import type { NextAuthConfig } from "next-auth"
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnCustomer = nextUrl.pathname.startsWith('/customer')
      
      if (isOnAdmin) {
        if (isLoggedIn && auth?.user?.role === 'ADMIN') return true
        return false // Redirect unauthenticated users to login page
      }

      if (isOnCustomer) {
        if (isLoggedIn && auth?.user?.role === 'CUSTOMER') return true
        return false // Redirect unauthenticated users to login page
      }
      
      return true
    },
    jwt({ token, user }) {
        if (user) {
            token.role = user.role
            token.id = user.id
        }
        return token
    },
    session({ session, token }) {
        if (token && session.user) {
            session.user.role = token.role as "ADMIN" | "CUSTOMER"
            session.user.id = token.id as string
        }
        return session
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
