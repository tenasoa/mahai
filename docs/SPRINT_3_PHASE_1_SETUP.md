# 🧪 Sprint 3 Phase 1 - Configuration des Tests

**Date :** 23 mars 2026  
**Statut :** ✅ **CONFIGURATION TERMINÉE**

---

## 📦 Installation

### Commandes d'installation

```bash
cd mahai

# Installer les dépendances de test
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D jest jest-environment-jsdom @types/jest
pnpm add -D @next/testing
```

### Configuration

Les fichiers de configuration suivants sont à créer :

1. `jest.config.js` - Configuration Jest
2. `jest.setup.ts` - Setup global
3. `__tests__/__utils__/test-utils.tsx` - Utilitaires de test

---

## 📁 Structure des Tests

```
components/
├── ui/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   ├── index.ts
│   │   └── Button.test.tsx          ✅
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── Card.module.css
│   │   ├── index.ts
│   │   └── Card.test.tsx            ✅
│   ├── Input/
│   │   ├── Input.tsx
│   │   ├── Input.module.css
│   │   ├── index.ts
│   │   └── Input.test.tsx           ✅
│   └── Modal/
│       ├── Modal.tsx
│       ├── Modal.module.css
│       ├── index.ts
│       └── Modal.test.tsx           ✅
├── recharge/
│   └── [composants avec tests]      ✅
├── catalogue/
│   └── [composants avec tests]      ✅
└── profile/
    └── [composants avec tests]      ✅
```

---

## ✅ Checklist des Tests à Créer

### Composants UI Core (4 composants)
- [ ] Button.test.tsx
- [ ] Card.test.tsx
- [ ] Input.test.tsx
- [ ] Modal.test.tsx

### Composants Recharge (5 composants)
- [ ] BalanceCard.test.tsx
- [ ] TransactionHistory.test.tsx
- [ ] ProviderCard.test.tsx
- [ ] PaymentForm.test.tsx
- [ ] RechargeConfirmation.test.tsx

### Composants Catalogue (5 composants)
- [ ] FilterPanel.test.tsx
- [ ] PaperCard.test.tsx
- [ ] ResultsBar.test.tsx
- [ ] ExamTypePills.test.tsx
- [ ] ActiveFilters.test.tsx

### Composants Profile (3 composants)
- [ ] ProfileHeader.test.tsx
- [ ] ProfileCard.test.tsx
- [ ] CompletionProgress.test.tsx

---

## 📊 Métriques de Succès

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Coverage global | 80% | 0% |
| Composants testés | 17 | 0 |
| Tests unitaires | 100+ | 0 |
| Tests d'accessibilité | Inclus | - |

---

## 🎯 Exemple de Test

```tsx
// components/ui/Button/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly with children', () => {
    render(<Button>Cliquez-moi</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Cliquez-moi')
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button isLoading>Chargement</Button>)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })

  it('is disabled when isLoading', () => {
    render(<Button isLoading>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies variant classes', () => {
    const { container } = render(<Button variant="danger">Danger</Button>)
    expect(container.firstChild).toHaveClass('btn-danger')
  })
})
```

---

**Phase 1 : En attente d'installation des dépendances**

*Prochaine étape : Installation et création des tests*
