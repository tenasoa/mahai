import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: ReactNode }>
}

// Providers mock (à étendre si nécessaire)
function AllProviders({ children }: { children: ReactNode }) {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => render(ui, { wrapper: AllProviders, ...options })

// Ré-export de tout ce qui vient de @testing-library/react
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Override de la méthode render
export { customRender as render }
