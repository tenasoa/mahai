import { render, screen } from '@testing-library/react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ContributorSidebar } from '@/components/contributeur/ContributorSidebar'

jest.mock('@/components/layout/UserNotifications', () => ({
  UserNotifications: () => <div data-testid="sidebar-notifications" />,
}))

jest.mock('@/lib/hooks/useAdminTransactionsRealtime', () => ({
  useAdminTransactionsRealtime: () => ({
    pendingCount: 0,
    resetCount: jest.fn(),
  }),
}))

const user = {
  prenom: 'Miora',
  nom: 'Rabe',
  role: 'ADMIN',
  profilePicture: null,
}

describe('role sidebars', () => {
  it('does not render notifications in the admin sidebar footer', () => {
    render(<AdminSidebar user={user} initials="MR" />)

    expect(screen.queryByTestId('sidebar-notifications')).not.toBeInTheDocument()
  })

  it('does not render notifications in the contributor sidebar footer', () => {
    render(
      <ContributorSidebar
        user={user}
        stats={{ earnings: 10000, monthEarnings: 2500, totalSubjects: 3 }}
        isCollapsed={false}
        onToggle={jest.fn()}
      />
    )

    expect(screen.queryByTestId('sidebar-notifications')).not.toBeInTheDocument()
  })
})
