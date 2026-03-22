import { getContributorAnalytics } from './actions'
import AnalyticsClient from './AnalyticsClient'

export const metadata = {
  title: 'Analytiques — Contributeur Mah.AI'
}

export default async function AnalyticsPage() {
  const data = await getContributorAnalytics()
  return <AnalyticsClient {...data} />
}
