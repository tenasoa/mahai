import { render, screen } from '@/__tests__/__utils__/test-utils'
import { PaperCard } from '../PaperCard'

describe('PaperCard Component', () => {
  const defaultProps = {
    id: '1',
    title: 'Mathématiques 2024',
    examType: 'BAC',
    year: 2024,
    subject: 'Mathématiques',
    price: 15,
  }

  describe('Rendering', () => {
    it('renders correctly with basic props', () => {
      render(<PaperCard {...defaultProps} />)
      expect(screen.getByText('Mathématiques 2024')).toBeInTheDocument()
      expect(screen.getByText('BAC · Mathématiques')).toBeInTheDocument()
      expect(screen.getByText('2024')).toBeInTheDocument()
      expect(screen.getByText('15 cr')).toBeInTheDocument()
    })

    it('renders with pages and duration', () => {
      render(<PaperCard {...defaultProps} pages={18} duration="3h" />)
      expect(screen.getByText('18 pages · 3h')).toBeInTheDocument()
    })

    it('renders with difficulty badge', () => {
      render(<PaperCard {...defaultProps} difficulty="difficile" />)
      expect(screen.getByText('Difficile')).toBeInTheDocument()
    })

    it('renders with rating', () => {
      render(<PaperCard {...defaultProps} rating={4} reviews={124} />)
      expect(screen.getByText('(124)')).toBeInTheDocument()
    })
  })

  describe('Badges', () => {
    it('renders premium badge', () => {
      render(<PaperCard {...defaultProps} isPremium />)
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })

    it('renders AI badge', () => {
      render(<PaperCard {...defaultProps} isAi />)
      expect(screen.getByText('✦ IA')).toBeInTheDocument()
    })

    it('renders free badge', () => {
      render(<PaperCard {...defaultProps} isFree />)
      expect(screen.getByText('Gratuit')).toBeInTheDocument()
    })

    it('renders unlocked badge', () => {
      render(<PaperCard {...defaultProps} isUnlocked />)
      expect(screen.getByText('✓ Débloqué')).toBeInTheDocument()
    })
  })

  describe('Wishlist', () => {
    it('renders wishlist button', () => {
      render(<PaperCard {...defaultProps} />)
      expect(screen.getByRole('button', { name: /ajouter aux favoris/i })).toBeInTheDocument()
    })

    it('calls onWishlist when clicked', async () => {
      const handleWishlist = jest.fn()
      const user = await import('@testing-library/user-event')
      
      render(<PaperCard {...defaultProps} onWishlist={handleWishlist} />)
      
      await user.default.click(screen.getByRole('button', { name: /ajouter aux favoris/i }))
      expect(handleWishlist).toHaveBeenCalledTimes(1)
    })

    it('shows wished state', () => {
      render(<PaperCard {...defaultProps} isWished />)
      expect(screen.getByRole('button', { name: /retirer des favoris/i })).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('renders preview button', () => {
      render(<PaperCard {...defaultProps} onPreview={() => {}} />)
      expect(screen.getByRole('button', { name: /aperçu/i })).toBeInTheDocument()
    })

    it('renders buy button', () => {
      render(<PaperCard {...defaultProps} onBuy={() => {}} />)
      expect(screen.getByRole('button', { name: /acheter/i })).toBeInTheDocument()
    })

    it('renders access button when unlocked', () => {
      render(<PaperCard {...defaultProps} isUnlocked onBuy={() => {}} />)
      expect(screen.getByRole('button', { name: /accéder/i })).toBeInTheDocument()
    })

    it('calls onPreview when clicked', async () => {
      const handlePreview = jest.fn()
      const user = await import('@testing-library/user-event')
      
      render(<PaperCard {...defaultProps} onPreview={handlePreview} />)
      
      await user.default.click(screen.getByRole('button', { name: /aperçu/i }))
      expect(handlePreview).toHaveBeenCalledTimes(1)
    })

    it('calls onBuy when clicked', async () => {
      const handleBuy = jest.fn()
      const user = await import('@testing-library/user-event')
      
      render(<PaperCard {...defaultProps} onBuy={handleBuy} />)
      
      await user.default.click(screen.getByRole('button', { name: /acheter/i }))
      expect(handleBuy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Hover State', () => {
    it('applies hovered class on mouse enter', () => {
      render(<PaperCard {...defaultProps} />)
      const card = screen.getByRole('article')
      
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      expect(card).toHaveClass('hovered')
    })

    it('removes hovered class on mouse leave', () => {
      render(<PaperCard {...defaultProps} />)
      const card = screen.getByRole('article')
      
      card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      card.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      expect(card).not.toHaveClass('hovered')
    })
  })

  describe('Accessibility', () => {
    it('has proper article role', () => {
      render(<PaperCard {...defaultProps} />)
      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('has proper button roles', () => {
      render(<PaperCard {...defaultProps} onWishlist={() => {}} onPreview={() => {}} onBuy={() => {}} />)
      expect(screen.getAllByRole('button')).toHaveLength(3)
    })
  })
})
