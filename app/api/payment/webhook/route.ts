import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Webhook handler for Mobile Money payment confirmations
 * 
 * This endpoint receives callbacks from MVola, Orange Money, and Airtel Money
 * when a payment is confirmed or failed.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactionId, status, provider } = body

    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-webhook-signature')
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Transaction ID and status are required' },
        { status: 400 }
      )
    }

    // Find the transaction
    const transaction = await prisma.creditTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update transaction status
    const updatedTransaction = await prisma.creditTransaction.update({
      where: { id: transactionId },
      data: {
        status: status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
      },
    })

    // If payment completed, add credits to user account
    if (status === 'SUCCESS') {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          credits: {
            increment: transaction.amount,
          },
        },
      })

      // Optionally: Send confirmation email
      // await sendConfirmationEmail(transaction.user.email, transaction)

      console.log(`[WEBHOOK] Payment completed. ${transaction.amount} credits added to user ${transaction.user.email}`)
    } else {
      console.log(`[WEBHOOK] Payment failed for transaction ${transactionId}`)
    }

    return NextResponse.json({
      success: true,
      transactionId,
      status: updatedTransaction.status,
    })
  } catch (error) {
    console.error('Error processing payment webhook:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  // Health check for webhook endpoint
  return NextResponse.json({ status: 'ok', message: 'Webhook endpoint is ready' })
}
