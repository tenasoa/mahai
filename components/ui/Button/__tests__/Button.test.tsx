import { render, screen, userEvent } from '@/__tests__/__utils__/test-utils'
import { Button } from '../Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(<Button>Cliquez-moi</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Cliquez-moi')
    })

    it('renders with different variants', () => {
      const { container: primary } = render(<Button variant="primary">Primary</Button>)
      expect(primary.firstChild).toHaveClass('btn-primary')

      const { container: secondary } = render(<Button variant="secondary">Secondary</Button>)
      expect(secondary.firstChild).toHaveClass('btn-secondary')

      const { container: ghost } = render(<Button variant="ghost">Ghost</Button>)
      expect(ghost.firstChild).toHaveClass('btn-ghost')

      const { container: danger } = render(<Button variant="danger">Danger</Button>)
      expect(danger.firstChild).toHaveClass('btn-danger')
    })

    it('renders with different sizes', () => {
      const { container: xs } = render(<Button size="xs">XS</Button>)
      expect(xs.firstChild).toHaveClass('btn-xs')

      const { container: sm } = render(<Button size="sm">SM</Button>)
      expect(sm.firstChild).toHaveClass('btn-sm')

      const { container: md } = render(<Button size="md">MD</Button>)
      expect(md.firstChild).toHaveClass('btn-md')

      const { container: lg } = render(<Button size="lg">LG</Button>)
      expect(lg.firstChild).toHaveClass('btn-lg')
    })
  })

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not trigger click when disabled', async () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)

      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when isLoading', () => {
      render(<Button isLoading>Chargement</Button>)
      expect(screen.getByText('Chargement...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is disabled when isLoading', () => {
      render(<Button isLoading>Click</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper focus states', () => {
      render(<Button>Focus Test</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      expect(button).toHaveFocus()
    })

    it('supports aria-label', () => {
      render(<Button aria-label="Test label">Click</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Test label')
    })

    it('supports fullWidth prop', () => {
      const { container } = render(<Button fullWidth>Full Width</Button>)
      expect(container.firstChild).toHaveClass('fullWidth')
    })
  })

  describe('Icons', () => {
    it('renders left icon', () => {
      render(<Button leftIcon={<span>🔍</span>}>Search</Button>)
      expect(screen.getByText('🔍')).toBeInTheDocument()
    })

    it('renders right icon', () => {
      render(<Button rightIcon={<span>→</span>}>Next</Button>)
      expect(screen.getByText('→')).toBeInTheDocument()
    })
  })
})
