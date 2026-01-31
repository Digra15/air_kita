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
      const role = auth?.user?.role
      const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'METER_READER', 'TREASURER']

      if (isLoggedIn && nextUrl.pathname === '/login') {
        if (role && adminRoles.includes(role)) {
           return Response.redirect(new URL('/admin/dashboard', nextUrl))
        }
        if (role === 'CUSTOMER') {
           return Response.redirect(new URL('/customer/dashboard', nextUrl))
        }
      }

      if (isOnAdmin) {
        if (isLoggedIn && role && adminRoles.includes(role)) return true
        return false // Redirect unauthenticated users to login page
      }

      if (isOnCustomer) {
        if (isLoggedIn && role === 'CUSTOMER') return true
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
            session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "METER_READER" | "TREASURER" | "CUSTOMER"
            session.user.id = token.id as string
        }
        return session
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
