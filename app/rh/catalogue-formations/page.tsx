import CatalogueFormationsManager from '@/components/rh/CatalogueFormationsManager';

export default function CatalogueFormationsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Catalogue des Formations</h1>
        <p className="text-muted-foreground">
          Gestion du catalogue des formations disponibles
        </p>
      </div>
      
      <CatalogueFormationsManager />
    </div>
  );
}
