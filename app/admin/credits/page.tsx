import { redirect } from 'next/navigation'

export default function AdminCreditsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  void searchParams
  redirect('/admin/transactions')
}
