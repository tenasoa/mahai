import { getSubjectStats } from './actions'
import SubjectStatsClient from './SubjectStatsClient'

export const metadata = {
  title: 'Statistiques du sujet — Contributeur Mah.AI'
}

export default async function SubjectStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getSubjectStats(id)
  return <SubjectStatsClient {...data} />
}
