import { getContributorDashboard } from './actions'
import ContributorDashboardClient from './DashboardClient'

export default async function ContributorDashboard() {
  const data = await getContributorDashboard()

  return <ContributorDashboardClient {...data} />
}
