import SessionsFormationManager from '@/components/rh/SessionsFormationManager';

export default function SessionsFormationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sessions de Formation</h1>
        <p className="text-muted-foreground">
          Gestion des sessions de formation planifiées
        </p>
      </div>
      
      <SessionsFormationManager />
    </div>
  );
}
