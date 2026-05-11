import { render, screen, userEvent } from '@/__tests__/__utils__/test-utils'
import { Input } from '../Input'

// Helper : génère un id unique pour chaque test afin de garantir
// l'association htmlFor↔id que le composant requiert pour getByLabelText.
let _idCounter = 0
const uid = () => `input-test-${++_idCounter}`

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders correctly with label', () => {
      const id = uid()
      render(<Input label="Email" id={id} />)
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('renders with different types', () => {
      const id1 = uid()
      render(<Input type="email" label="Email" id={id1} />)
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')

      const id2 = uid()
      render(<Input type="password" label="Password" id={id2} />)
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')

      const id3 = uid()
      render(<Input type="tel" label="Phone" id={id3} />)
      expect(screen.getByLabelText('Phone')).toHaveAttribute('type', 'tel')
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Entrez votre email" />)
      expect(screen.getByPlaceholderText('Entrez votre email')).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(<Input defaultValue="test@example.com" />)
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('handles text input', async () => {
      const id = uid()
      render(<Input label="Name" id={id} />)
      const input = screen.getByLabelText('Name')

      await userEvent.type(input, 'John')
      expect(input).toHaveValue('John')
    })

    it('handles focus and blur', async () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      const id = uid()

      render(<Input label="Email" id={id} onFocus={handleFocus} onBlur={handleBlur} />)
      const input = screen.getByLabelText('Email')

      await userEvent.click(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)

      await userEvent.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('Validation & Error', () => {
    it('displays error message', () => {
      const id = uid()
      render(<Input label="Email" id={id} error="Email invalide" />)
      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })

    it('applies error state to inputWrapper', () => {
      const id = uid()
      render(<Input label="Email" id={id} error="Error" />)
      // L'erreur est appliquée sur le wrapper (.inputWrapper.error), pas sur l'input lui-même
      const input = screen.getByLabelText('Email')
      const wrapper = input.closest('.inputWrapper')
      expect(wrapper).toHaveClass('error')
    })

    it('displays hint text', () => {
      const id = uid()
      render(<Input label="Email" id={id} hint="Nous ne partagerons jamais votre email" />)
      expect(screen.getByText('Nous ne partagerons jamais votre email')).toBeInTheDocument()
    })

    it('prioritizes error over hint', () => {
      const id = uid()
      render(
        <Input
          label="Email"
          id={id}
          error="Error"
          hint="Hint text"
        />
      )
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.queryByText('Hint text')).not.toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('renders left icon', () => {
      render(<Input label="Search" leftIcon={<span>🔍</span>} />)
      expect(screen.getByText('🔍')).toBeInTheDocument()
    })

    it('renders right icon', () => {
      render(<Input label="Search" rightIcon={<span>✕</span>} />)
      expect(screen.getByText('✕')).toBeInTheDocument()
    })
  })

  describe('Password Toggle', () => {
    it('renders password toggle button', () => {
      const id = uid()
      render(<Input label="Password" id={id} type="password" showPasswordToggle />)
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Afficher le mot de passe')
    })

    it('toggles password visibility', async () => {
      const id = uid()
      render(<Input label="Password" id={id} type="password" showPasswordToggle />)
      const toggleButton = screen.getByRole('button')
      const passwordInput = screen.getByLabelText('Password')

      expect(passwordInput).toHaveAttribute('type', 'password')

      await userEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      await userEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Disabled State', () => {
    it('is disabled when disabled prop is set', () => {
      const id = uid()
      render(<Input label="Email" id={id} disabled />)
      expect(screen.getByLabelText('Email')).toBeDisabled()
    })

    it('applies disabled styles on wrapper', () => {
      const id = uid()
      render(<Input label="Email" id={id} disabled />)
      const input = screen.getByLabelText('Email')
      const wrapper = input.closest('.inputWrapper')
      expect(wrapper).toHaveClass('disabled')
    })
  })

  describe('Accessibility', () => {
    it('has proper label association', () => {
      render(<Input label="Email" id="email-input" />)
      const label = screen.getByLabelText('Email')
      expect(label).toHaveAttribute('id', 'email-input')
    })

    it('has proper focus states', () => {
      const id = uid()
      render(<Input label="Email" id={id} />)
      const input = screen.getByLabelText('Email')

      input.focus()
      expect(input).toHaveFocus()
    })

    it('shows error message when error prop is set', () => {
      const id = uid()
      render(<Input label="Email" id={id} error="Invalid email" />)
      // Le composant affiche le message d'erreur sous l'input (pas via aria-describedby)
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })
})
