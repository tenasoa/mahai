import { render, screen } from '@/__tests__/__utils__/test-utils'
import { ProfileHeader } from '../ProfileHeader'

describe('ProfileHeader Component', () => {
  const defaultProps = {
    firstName: 'Jean',
    lastName: 'Rakotondrabe',
    role: 'ÉTUDIANT',
    email: 'jean@example.com',
    phone: '034 01 234 56',
    initials: 'JR',
  }

  describe('Rendering', () => {
    it('renders correctly with basic props', () => {
      render(<ProfileHeader {...defaultProps} />)
      expect(screen.getByText('Jean')).toBeInTheDocument()
      expect(screen.getByText('RAKOTONDRABE')).toBeInTheDocument()
      expect(screen.getByText('ÉTUDIANT')).toBeInTheDocument()
    })

    it('renders with email', () => {
      render(<ProfileHeader {...defaultProps} />)
      expect(screen.getByText('📧 jean@example.com')).toBeInTheDocument()
    })

    it('renders with phone', () => {
      render(<ProfileHeader {...defaultProps} />)
      expect(screen.getByText('📱 034 01 234 56')).toBeInTheDocument()
    })

    it('renders with avatar placeholder', () => {
      render(<ProfileHeader {...defaultProps} />)
      expect(screen.getByText('JR')).toBeInTheDocument()
    })

    it('renders with avatar image', () => {
      render(<ProfileHeader {...defaultProps} avatarUrl="/avatar.jpg" />)
      expect(screen.getByAltText('Avatar')).toBeInTheDocument()
      expect(screen.getByAltText('Avatar')).toHaveAttribute('src', '/avatar.jpg')
    })
  })

  describe('Badges', () => {
    it('renders student badge', () => {
      render(<ProfileHeader {...defaultProps} />)
      expect(screen.getByText('ÉTUDIANT')).toBeInTheDocument()
    })

    it('renders verified badge when isVerified', () => {
      render(<ProfileHeader {...defaultProps} isVerified />)
      expect(screen.getByText('✓ Vérifié')).toBeInTheDocument()
    })

    it('does not render verified badge when not verified', () => {
      render(<ProfileHeader {...defaultProps} />)
      expect(screen.queryByText('✓ Vérifié')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const handleEdit = jest.fn()
      const user = await import('@testing-library/user-event')
      
      render(<ProfileHeader {...defaultProps} onEdit={handleEdit} />)
      
      await user.default.click(screen.getByRole('button', { name: /modifier le profil/i }))
      expect(handleEdit).toHaveBeenCalledTimes(1)
    })

    it('calls onAvatarClick when avatar is clicked', async () => {
      const handleAvatarClick = jest.fn()
      const user = await import('@testing-library/user-event')
      
      render(<ProfileHeader {...defaultProps} onAvatarClick={handleAvatarClick} />)
      
      await user.default.click(screen.getByRole('button', { name: /changer l'avatar/i }))
      expect(handleAvatarClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Empty States', () => {
    it('renders default values when props are empty', () => {
      render(<ProfileHeader />)
      expect(screen.getByText('Prénom')).toBeInTheDocument()
      expect(screen.getByText('NOM')).toBeInTheDocument()
      expect(screen.getByText('U')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<ProfileHeader {...defaultProps} />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jean')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('RAKOTONDRABE')
    })

    it('has proper button roles', () => {
      render(<ProfileHeader {...defaultProps} onEdit={() => {}} onAvatarClick={() => {}} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })

    it('has proper aria-label on camera button', () => {
      render(<ProfileHeader {...defaultProps} onAvatarClick={() => {}} />)
      expect(screen.getByRole('button', { name: /changer l'avatar/i })).toBeInTheDocument()
    })
  })

  describe('Contact Information', () => {
    it('renders contact section', () => {
      render(<ProfileHeader {...defaultProps} />)
      expect(screen.getByText('📧 jean@example.com')).toBeInTheDocument()
      expect(screen.getByText('📱 034 01 234 56')).toBeInTheDocument()
    })

    it('does not render email when not provided', () => {
      render(<ProfileHeader {...defaultProps} email="" />)
      expect(screen.queryByText(/📧/)).not.toBeInTheDocument()
    })

    it('does not render phone when not provided', () => {
      render(<ProfileHeader {...defaultProps} phone="" />)
      expect(screen.queryByText(/📱/)).not.toBeInTheDocument()
    })
  })
})
