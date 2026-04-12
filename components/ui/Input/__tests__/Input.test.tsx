import { render, screen, userEvent } from '@/__tests__/__utils__/test-utils'
import { Input } from '../Input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders correctly with label', () => {
      render(<Input label="Email" id="email" />)
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('renders with different types', () => {
      render(<Input type="email" label="Email" />)
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')

      render(<Input type="password" label="Password" />)
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')

      render(<Input type="tel" label="Phone" />)
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
      render(<Input label="Name" />)
      const input = screen.getByLabelText('Name')
      
      await userEvent.type(input, 'John')
      expect(input).toHaveValue('John')
    })

    it('handles focus and blur', async () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      
      render(<Input label="Email" onFocus={handleFocus} onBlur={handleBlur} />)
      const input = screen.getByLabelText('Email')
      
      await userEvent.click(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      
      await userEvent.tab()
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('Validation & Error', () => {
    it('displays error message', () => {
      render(<Input label="Email" error="Email invalide" />)
      expect(screen.getByText('Email invalide')).toBeInTheDocument()
    })

    it('applies error state to input', () => {
      render(<Input label="Email" error="Error" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveClass('error')
    })

    it('displays hint text', () => {
      render(<Input label="Email" hint="Nous ne partagerons jamais votre email" />)
      expect(screen.getByText('Nous ne partagerons jamais votre email')).toBeInTheDocument()
    })

    it('prioritizes error over hint', () => {
      render(
        <Input 
          label="Email" 
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
      render(<Input label="Password" type="password" showPasswordToggle />)
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Afficher le mot de passe')
    })

    it('toggles password visibility', async () => {
      render(<Input label="Password" type="password" showPasswordToggle />)
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
      render(<Input label="Email" disabled />)
      expect(screen.getByLabelText('Email')).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<Input label="Email" disabled />)
      const wrapper = screen.getByLabelText('Email').closest('.inputWrapper')
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
      render(<Input label="Email" />)
      const input = screen.getByLabelText('Email')
      
      input.focus()
      expect(input).toHaveFocus()
    })

    it('supports aria-describedby for error', () => {
      render(<Input label="Email" error="Invalid email" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('aria-describedby')
    })
  })
})
