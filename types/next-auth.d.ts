import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id:             string
      lastName:       string
      showOnboarding: boolean
    } & DefaultSession['user']
  }

  interface User {
    lastName?:       string
    showOnboarding?: boolean
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id:             string
    lastName:       string
    showOnboarding: boolean
  }
}
