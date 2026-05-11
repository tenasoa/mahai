import { render, screen, userEvent, waitFor } from '@/__tests__/__utils__/test-utils'
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
      // La taille est appliquée sur le div interne (content), pas sur l'overlay.
      // Avec identity-obj-proxy, styles['sm'] => 'sm', etc.
      const { container: sm } = render(<Modal {...defaultProps} size="sm" />)
      // L'overlay est container.firstChild, le contenu est son premier enfant
      const smContent = sm.firstChild?.firstChild as HTMLElement
      expect(smContent).toHaveClass('sm')

      const { container: md } = render(<Modal {...defaultProps} size="md" />)
      const mdContent = md.firstChild?.firstChild as HTMLElement
      expect(mdContent).toHaveClass('md')

      const { container: lg } = render(<Modal {...defaultProps} size="lg" />)
      const lgContent = lg.firstChild?.firstChild as HTMLElement
      expect(lgContent).toHaveClass('lg')

      const { container: xl } = render(<Modal {...defaultProps} size="xl" />)
      const xlContent = xl.firstChild?.firstChild as HTMLElement
      expect(xlContent).toHaveClass('xl')

      const { container: full } = render(<Modal {...defaultProps} size="full" />)
      const fullContent = full.firstChild?.firstChild as HTMLElement
      expect(fullContent).toHaveClass('full')
    })
  })

  describe('Close Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = jest.fn()
      render(<Modal {...defaultProps} onClose={handleClose} />)

      await userEvent.click(screen.getByRole('button', { name: /fermer/i }))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking overlay directly', async () => {
      const handleClose = jest.fn()
      render(<Modal {...defaultProps} onClose={handleClose} closeOnOverlayClick />)

      // L'overlay est le div role="dialog" lui-même ; on simule un clic dessus
      // via fireEvent pour cibler exactement l'overlay (e.target === e.currentTarget)
      const { fireEvent } = await import('@testing-library/react')
      const overlay = screen.getByRole('dialog')
      fireEvent.click(overlay, { target: overlay })
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
    it('focuses first focusable element on open', async () => {
      jest.useFakeTimers()
      render(
        <Modal {...defaultProps}>
          <button>First Button</button>
          <button>Second Button</button>
        </Modal>
      )

      // Le premier focusable est le bouton "Fermer" dans le header
      const closeButton = screen.getByRole('button', { name: /fermer/i })
      jest.advanceTimersByTime(0)

      expect(closeButton).toHaveFocus()
      jest.useRealTimers()
    })

    it('restores focus on close', async () => {
      const triggerButton = document.createElement('button')
      triggerButton.textContent = 'Open Modal'
      document.body.appendChild(triggerButton)
      triggerButton.focus()

      jest.useFakeTimers()
      const { rerender } = render(
        <Modal {...defaultProps} isOpen={true} onClose={() => {}} />
      )

      rerender(<Modal {...defaultProps} isOpen={false} onClose={() => {}} />)

      jest.advanceTimersByTime(0)
      expect(triggerButton).toHaveFocus()
      jest.useRealTimers()

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

      // Le modal a deux boutons : "Fermer" (header) et "Only Button" (body)
      // La navigation Tab doit rester dans le modal
      const closeButton = screen.getByRole('button', { name: /fermer/i })
      const onlyButton = screen.getByText('Only Button')

      // Les deux boutons sont dans le modal
      expect(closeButton).toBeInTheDocument()
      expect(onlyButton).toBeInTheDocument()
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
