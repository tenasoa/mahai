import { getContributorWithdrawals } from './actions'
import WithdrawalsClient from './WithdrawalsClient'

export const metadata = {
  title: 'Retrait gains — Contributeur Mah.AI'
}

export default async function WithdrawalsPage() {
  const data = await getContributorWithdrawals()
  return <WithdrawalsClient {...data} />
}
