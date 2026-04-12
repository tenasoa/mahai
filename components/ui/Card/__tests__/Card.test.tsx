import { render, screen } from '@/__tests__/__utils__/test-utils'
import { Card } from '../Card'

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(<Card>Contenu de la carte</Card>)
      expect(screen.getByText('Contenu de la carte')).toBeInTheDocument()
    })

    it('renders with different variants', () => {
      const { container: defaultCard } = render(<Card variant="default">Default</Card>)
      expect(defaultCard.firstChild).toHaveClass('card-default')

      const { container: hero } = render(<Card variant="hero">Hero</Card>)
      expect(hero.firstChild).toHaveClass('card-hero')

      const { container: stat } = render(<Card variant="stat">Stat</Card>)
      expect(stat.firstChild).toHaveClass('card-stat')

      const { container: interactive } = render(<Card variant="interactive">Interactive</Card>)
      expect(interactive.firstChild).toHaveClass('card-interactive')

      const { container: glass } = render(<Card variant="glass">Glass</Card>)
      expect(glass.firstChild).toHaveClass('card-glass')
    })

    it('renders with different padding', () => {
      const { container: none } = render(<Card padding="none">None</Card>)
      expect(none.firstChild).toHaveClass('padding-none')

      const { container: sm } = render(<Card padding="sm">SM</Card>)
      expect(sm.firstChild).toHaveClass('padding-sm')

      const { container: md } = render(<Card padding="md">MD</Card>)
      expect(md.firstChild).toHaveClass('padding-md')

      const { container: lg } = render(<Card padding="lg">LG</Card>)
      expect(lg.firstChild).toHaveClass('padding-lg')

      const { container: xl } = render(<Card padding="xl">XL</Card>)
      expect(xl.firstChild).toHaveClass('padding-xl')
    })
  })

  describe('Interactions', () => {
    it('handles click when interactive', () => {
      const handleClick = jest.fn()
      render(<Card variant="interactive" onClick={handleClick}>Click me</Card>)
      
      screen.getByText('Click me').click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('supports keyboard navigation when interactive', () => {
      const handleClick = jest.fn()
      render(<Card variant="interactive" onClick={handleClick} tabIndex={0}>Keyboard</Card>)
      
      const card = screen.getByText('Keyboard')
      card.focus()
      
      expect(card).toHaveFocus()
    })
  })

  describe('Hover & Glow', () => {
    it('applies hover class', () => {
      const { container } = render(<Card hover>Hover</Card>)
      expect(container.firstChild).toHaveClass('hover')
    })

    it('applies glow class', () => {
      const { container } = render(<Card glow>Glow</Card>)
      expect(container.firstChild).toHaveClass('glow')
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Card aria-label="Test card">Content</Card>)
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Test card')
    })

    it('supports custom role', () => {
      render(<Card role="article">Article</Card>)
      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('is focusable when interactive', () => {
      render(<Card variant="interactive" onClick={() => {}}>Interactive</Card>)
      expect(screen.getByText('Interactive')).toHaveAttribute('tabindex', '0')
    })
  })
})
