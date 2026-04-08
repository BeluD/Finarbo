import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email'    },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return {
          id:             user.id,
          email:          user.email,
          name:           user.name           ?? undefined,
          lastName:       user.lastName        ?? undefined,
          image:          user.image           ?? undefined,
          showOnboarding: user.showOnboarding,
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After OAuth sign-in, land on /home instead of /
      if (url === baseUrl || url === `${baseUrl}/`) return `${baseUrl}/home`
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/home`
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id             = user.id!
        token.lastName       = (user as any).lastName  ?? ''
        token.showOnboarding = (user as any).showOnboarding ?? true
      }
      // Allow client to update showOnboarding via useSession().update()
      if (trigger === 'update' && session?.showOnboarding !== undefined) {
        token.showOnboarding = session.showOnboarding as boolean
      }
      return token
    },
    async session({ session, token }) {
      session.user.id             = token.id as string
      session.user.lastName       = token.lastName as string
      session.user.showOnboarding = token.showOnboarding as boolean
      return session
    },
  },
  events: {
    // When a new Google user is created, split displayName into name + lastName
    async createUser({ user }) {
      const parts    = (user.name ?? '').trim().split(/\s+/)
      const name     = parts[0]            || ''
      const lastName = parts.slice(1).join(' ') || ''
      await prisma.user.update({
        where: { id: user.id! },
        data:  { name, lastName },
      })
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
})
