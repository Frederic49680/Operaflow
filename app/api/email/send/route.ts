import { NextRequest, NextResponse } from 'next/server'
import { sendUserActivationEmail, sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userData } = body

    if (!type || !userData) {
      return NextResponse.json(
        { error: 'Type et userData requis' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'activation':
        result = await sendUserActivationEmail(userData)
        break
      
      case 'reset':
        result = await sendPasswordResetEmail(userData)
        break
      
      default:
        return NextResponse.json(
          { error: 'Type d\'email non supporté' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email envoyé avec succès',
        data: result
      })
    } else {
      return NextResponse.json(
        { error: 'Échec de l\'envoi de l\'email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur API email:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
