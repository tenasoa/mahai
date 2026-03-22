import { getAdminWithdrawals } from './actions'
import AdminWithdrawalsClient from './WithdrawalsClient'

export const metadata = {
  title: 'Gestion des Retraits — Admin Mah.AI'
}

export default async function AdminWithdrawalsPage() {
  const data = await getAdminWithdrawals()
  return <AdminWithdrawalsClient {...data} />
}
