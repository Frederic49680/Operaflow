# Variables d'environnement

## Variables requises pour Vercel

### Supabase (obligatoire)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Configuration serveur (optionnel)
```bash
PORT=3001
```

### SMTP - Emails (optionnel)
```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

## Comment obtenir vos clés Supabase

1. Allez sur https://supabase.com
2. Ouvrez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

