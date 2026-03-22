export type MobileMoneyProviderId = 'mvola' | 'orange' | 'airtel'

export type MobileMoneyProvider = {
  id: MobileMoneyProviderId
  name: string
  logoPath: string
  alt: string
}

export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  {
    id: 'mvola',
    name: 'MVola',
    logoPath: '/mobile-banking/mvola.png',
    alt: 'Logo MVola',
  },
  {
    id: 'orange',
    name: 'Orange Money',
    logoPath: '/mobile-banking/orange-money.png',
    alt: 'Logo Orange Money',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    logoPath: '/mobile-banking/airtel-money.png',
    alt: 'Logo Airtel Money',
  },
]
