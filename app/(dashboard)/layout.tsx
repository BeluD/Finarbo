import { auth }            from '@/auth'
import { redirect }        from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { prisma }          from '@/lib/prisma'
import Shell               from '@/components/layout/Shell'
import OnboardingModal     from '@/components/onboarding/OnboardingModal'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const portfolioCount = session.user?.id
    ? await prisma.portfolio.count({ where: { userId: session.user.id } })
    : 0

  return (
    <SessionProvider session={session}>
      <Shell>
        {children}
      </Shell>
      <OnboardingModal hasPortfolios={portfolioCount > 0} />
    </SessionProvider>
  )
}
