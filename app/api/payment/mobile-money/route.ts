import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface MobileMoneyRequest {
  packId: string
  phone: string
  operator: string
  amount: number
  credits: number
}

// Simulated Mobile Money providers (sandbox mode)
const mobileMoneyProviders = {
  mvola: {
    name: 'MVola',
    endpoint: 'https://sandbox.mvola.mg/api/payment',
    apiKey: process.env.MVOLA_API_KEY,
  },
  orange: {
    name: 'Orange Money',
    endpoint: 'https://api.orange.com/orange-money-webhook/dev/v1/webpayment',
    apiKey: process.env.ORANGE_MONEY_API_KEY,
  },
  airtel: {
    name: 'Airtel Money',
    endpoint: 'https://sandbox.airtel.africa/api/payment',
    apiKey: process.env.AIRTEL_MONEY_API_KEY,
  },
}

export async function POST(request: Request) {
  try {
    const body: MobileMoneyRequest = await request.json()
    const { packId, phone, operator, amount, credits } = body

    // Validation
    if (!packId || !phone || !operator || !amount || !credits) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Validate operator
    if (!mobileMoneyProviders[operator as keyof typeof mobileMoneyProviders]) {
      return NextResponse.json(
        { error: 'Opérateur invalide' },
        { status: 400 }
      )
    }

    // Validate phone format (Madagascar format)
    const phoneRegex = /^\+261[34]\d{9}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide. Format attendu: +261 34 XX XXX XX' },
        { status: 400 }
      )
    }

    // In production, you would:
    // 1. Call the actual Mobile Money API
    // 2. Get a transaction ID from the provider
    // 3. Wait for webhook confirmation

    // For sandbox/demo mode, simulate a successful transaction
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create pending transaction in database
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: 'demo-user-id', // In production, get from session
        amount: credits,
        type: 'PURCHASE',
        description: `Achat ${credits} crédits via ${operator}`,
        paymentMethod: operator.toUpperCase(),
        transactionId,
        status: 'PENDING',
      },
    })

    // Simulate Mobile Money API call
    // In production, replace with actual API call
    const provider = mobileMoneyProviders[operator as keyof typeof mobileMoneyProviders]
    
    // Simulated successful payment initiation
    console.log(`[SANDBOX] Payment initiated via ${provider.name}`)
    console.log(`[SANDBOX] Phone: ${phone}, Amount: ${amount} Ar, Credits: ${credits}`)

    // In production, you would:
    // - Call provider API with payment details
    // - User receives USSD prompt on their phone
    // - User enters PIN to confirm
    // - Provider sends webhook to /api/payment/webhook
    // - Webhook updates transaction status to COMPLETED
    // - Credits are added to user account

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      message: 'Paiement initié. Veuillez confirmer sur votre téléphone.',
      provider: provider.name,
      amount,
      credits,
    })
  } catch (error) {
    console.error('Error processing mobile money payment:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du paiement' },
      { status: 500 }
    )
  }
}
