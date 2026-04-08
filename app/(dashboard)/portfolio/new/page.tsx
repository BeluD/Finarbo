import NewPortfolioWizard from '@/components/portfolio/NewPortfolioWizard'

export const metadata = { title: 'Nueva cartera — Finarbo' }

export default function NewPortfolioPage() {
  return (
    <div style={{ padding: '0 0 60px' }}>
      <NewPortfolioWizard />
    </div>
  )
}
