import TuilesTaches from '@/components/tuiles-taches/TuilesTaches';

export default function TuilesTachesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Planning</h1>
        <p className="text-muted-foreground">
          Gestion et planification des tâches
        </p>
      </div>
      
      <TuilesTaches />
    </div>
  );
}
