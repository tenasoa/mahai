import { render, screen } from '@/__tests__/__utils__/test-utils'
import { BalanceCard } from '../BalanceCard'

describe('BalanceCard Component', () => {
  const defaultProps = {
    balance: 150,
    label: 'Solde disponible',
    unit: 'crédits',
  }

  describe('Rendering', () => {
    it('renders correctly with balance', () => {
      render(<BalanceCard {...defaultProps} />)
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('crédits')).toBeInTheDocument()
    })

    it('renders with custom label', () => {
      render(<BalanceCard {...defaultProps} label="Mon solde" />)
      expect(screen.getByText('Mon solde')).toBeInTheDocument()
    })

    it('renders with ARIARY equivalent', () => {
      render(<BalanceCard {...defaultProps} ariaryEquivalent="≈ 7500 Ariary" />)
      expect(screen.getByText('≈ 7500 Ariary')).toBeInTheDocument()
    })

    it('renders with recharge button', () => {
      const handleRecharge = jest.fn()
      render(<BalanceCard {...defaultProps} onRecharge={handleRecharge} />)
      expect(screen.getByRole('button', { name: /recharger/i })).toBeInTheDocument()
    })

    it('renders children', () => {
      render(
        <BalanceCard {...defaultProps}>
          <div>Custom Content</div>
        </BalanceCard>
      )
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })
  })

  describe('Formatting', () => {
    it('formats large numbers correctly', () => {
      render(<BalanceCard balance={1000000} />)
      expect(screen.getByText('1 000 000')).toBeInTheDocument()
    })

    it('formats zero balance', () => {
      render(<BalanceCard balance={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onRecharge when button is clicked', async () => {
      const handleRecharge = jest.fn()
      const user = await import('@testing-library/user-event')
      
      render(<BalanceCard {...defaultProps} onRecharge={handleRecharge} />)
      
      await user.default.click(screen.getByRole('button', { name: /recharger/i }))
      expect(handleRecharge).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State', () => {
    it('shows loading indicator', () => {
      render(<BalanceCard balance={100} isLoading />)
      expect(screen.getByText('...')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<BalanceCard {...defaultProps} onRecharge={() => {}} />)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('has proper focus states', () => {
      render(<BalanceCard {...defaultProps} onRecharge={() => {}} />)
      const button = screen.getByRole('button')
      
      button.focus()
      expect(button).toHaveFocus()
    })
  })
})
