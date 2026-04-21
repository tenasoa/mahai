import { getContributorAnalytics, AnalyticsPeriod } from './actions'
import AnalyticsClient from './AnalyticsClient'

export const metadata = {
  title: 'Analytiques — Contributeur Mah.AI'
}

const VALID_PERIODS: AnalyticsPeriod[] = ['7d', '30d', '12m']

export default async function AnalyticsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ period?: string }> 
}) {
  const params = await searchParams
  const period = (VALID_PERIODS.includes(params.period as AnalyticsPeriod)
    ? params.period
    : '12m') as AnalyticsPeriod
  const data = await getContributorAnalytics(period)
  return <AnalyticsClient {...data} />
}
