import { render, screen, userEvent } from '@/__tests__/__utils__/test-utils'
import { Modal } from '../Modal'

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  }

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    })

    it('renders with subtitle', () => {
      render(<Modal {...defaultProps} subtitle="Test Subtitle" />)
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    })

    it('renders with different sizes', () => {
      const { container: sm } = render(<Modal {...defaultProps} size="sm" />)
      expect(sm.firstChild).toHaveClass('sm')

      const { container: md } = render(<Modal {...defaultProps} size="md" />)
      expect(md.firstChild).toHaveClass('md')

      const { container: lg } = render(<Modal {...defaultProps} size="lg" />)
      expect(lg.firstChild).toHaveClass('lg')

      const { container: xl } = render(<Modal {...defaultProps} size="xl" />)
      expect(xl.firstChild).toHaveClass('xl')

      const { container: full } = render(<Modal {...defaultProps} size="full" />)
      expect(full.firstChild).toHaveClass('full')
    })
  })

  describe('Close Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = jest.fn()
      render(<Modal {...defaultProps} onClose={handleClose} />)
      
      await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking overlay', async () => {
      const handleClose = jest.fn()
      render(<Modal {...defaultProps} onClose={handleClose} closeOnOverlayClick />)
      
      await userEvent.click(screen.getByRole('dialog').parentElement!)
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when clicking content', async () => {
      const handleClose = jest.fn()
      render(<Modal {...defaultProps} onClose={handleClose} closeOnOverlayClick />)
      
      await userEvent.click(screen.getByText('Modal Content'))
      expect(handleClose).not.toHaveBeenCalled()
    })

    it('calls onClose when pressing Escape', async () => {
      const handleClose = jest.fn()
      render(<Modal {...defaultProps} onClose={handleClose} closeOnEsc />)
      
      await userEvent.keyboard('{Escape}')
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when closeOnEsc is false', async () => {
      const handleClose = jest.fn()
      render(<Modal {...defaultProps} onClose={handleClose} closeOnEsc={false} />)
      
      await userEvent.keyboard('{Escape}')
      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('Focus Management', () => {
    it('focuses first focusable element on open', () => {
      render(
        <Modal {...defaultProps}>
          <button>First Button</button>
          <button>Second Button</button>
        </Modal>
      )
      
      const firstButton = screen.getByText('First Button')
      expect(firstButton).toHaveFocus()
    })

    it('restores focus on close', () => {
      const triggerButton = document.createElement('button')
      triggerButton.textContent = 'Open Modal'
      document.body.appendChild(triggerButton)
      triggerButton.focus()
      
      const { rerender } = render(
        <Modal {...defaultProps} isOpen={true} onClose={() => {}} />
      )
      
      rerender(<Modal {...defaultProps} isOpen={false} onClose={() => {}} />)
      
      expect(triggerButton).toHaveFocus()
      
      document.body.removeChild(triggerButton)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Modal {...defaultProps} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('has accessible title', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Modal')
    })

    it('supports custom aria-label', () => {
      render(<Modal {...defaultProps} ariaLabel="Custom Label" />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-label', 'Custom Label')
    })

    it('traps focus inside modal', async () => {
      render(
        <Modal {...defaultProps}>
          <button>Only Button</button>
        </Modal>
      )
      
      const button = screen.getByText('Only Button')
      await userEvent.tab()
      
      // Focus should cycle back to button
      expect(button).toHaveFocus()
    })
  })

  describe('Body Scroll Lock', () => {
    it('prevents body scroll when open', () => {
      render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body scroll on close', () => {
      const { rerender } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')
      
      rerender(<Modal {...defaultProps} isOpen={false} onClose={() => {}} />)
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Close Button', () => {
    it('shows close button by default', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByRole('button', { name: /fermer/i })).toBeInTheDocument()
    })

    it('hides close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />)
      expect(screen.queryByRole('button', { name: /fermer/i })).not.toBeInTheDocument()
    })

    it('hides close button when isLoading is true', () => {
      render(<Modal {...defaultProps} isLoading />)
      expect(screen.queryByRole('button', { name: /fermer/i })).not.toBeInTheDocument()
    })
  })
})
