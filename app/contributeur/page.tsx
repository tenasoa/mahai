import { getContributorDashboard, DashboardPeriod } from './actions'
import ContributorDashboardClient from './DashboardClient'

const VALID_PERIODS: DashboardPeriod[] = ['7d', '30d', '90d', '12m', 'all']

export default async function ContributorDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ period?: string }> 
}) {
  const params = await searchParams
  const period = (VALID_PERIODS.includes(params.period as DashboardPeriod) 
    ? params.period 
    : '30d') as DashboardPeriod
  const data = await getContributorDashboard(period)

  return <ContributorDashboardClient {...data} />
}
