import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Vérifier les variables d'environnement (sans exposer les valeurs)
    const envCheck = {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? "✅ Présente" : "❌ Manquante",
      SENDGRID_FROM: process.env.SENDGRID_FROM ? "✅ Présente" : "❌ Manquante",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? "✅ Présente" : "❌ Manquante"
    };

    return NextResponse.json({
      message: "Debug configuration SendGrid",
      environment: envCheck,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: "Erreur debug",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

