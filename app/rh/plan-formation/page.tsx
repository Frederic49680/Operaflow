import PlanFormationManager from '@/components/rh/PlanFormationManager';

export default function PlanFormationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Plan de Formation</h1>
        <p className="text-muted-foreground">
          Gestion du plan prévisionnel et suivi des formations
        </p>
      </div>
      
      <PlanFormationManager />
    </div>
  );
}
