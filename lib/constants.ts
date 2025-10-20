// Statuts généraux
export const STATUTS = {
  NON_LANCEE: "Non lancée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  BLOQUEE: "Bloquée",
  REPORTEE: "Reportée",
  PROLONGEE: "Prolongée",
  SUSPENDUE: "Suspendue",
} as const

// Types de contrats
export const TYPES_CONTRAT = [
  "CDI",
  "CDD",
  "Intérim",
  "Apprenti",
  "Autre",
] as const

// Types d'absence
export const TYPES_ABSENCE = [
  "CP",
  "Maladie",
  "Formation",
  "Mission",
  "Autre",
] as const

// Types de maintenance
export const TYPES_MAINTENANCE = [
  "Préventive",
  "Corrective",
  "Contrôle",
  "Amélioration",
] as const

// Types de claim
export const TYPES_CLAIM = [
  "Interne",
  "Client",
  "Fournisseur / Sous-traitant",
] as const

// Statuts de claim
export const STATUTS_CLAIM = [
  "Ouvert",
  "En analyse",
  "Validé",
  "Transmis",
  "Clos",
] as const

// Types d'interlocuteur
export const TYPES_INTERLOCUTEUR = [
  "Technique",
  "Administratif",
  "Facturation",
  "Sécurité",
  "Autre",
] as const

// Catégories de client
export const CATEGORIES_CLIENT = [
  "MOA",
  "MOE",
  "Exploitant",
  "Maintenance",
  "Autre",
] as const

// Rôles par défaut
export const ROLES_DEFAUT = [
  { code: "admin", label: "Administrateur" },
  { code: "planificateur", label: "Planificateur" },
  { code: "ca", label: "Chargé d'Affaires" },
  { code: "resp_site", label: "Responsable de site" },
  { code: "maintenance", label: "Maintenance" },
  { code: "rh", label: "Ressources Humaines" },
  { code: "direction", label: "Direction / PMO" },
] as const

// Permissions par défaut
export const PERMISSIONS_DEFAUT = [
  // Pages
  { code: "page.admin.read", label: "Administration - Lecture" },
  { code: "page.admin.write", label: "Administration - Écriture" },
  { code: "page.sites.read", label: "Sites - Lecture" },
  { code: "page.sites.write", label: "Sites - Écriture" },
  { code: "page.rh.read", label: "RH - Lecture" },
  { code: "page.rh.write", label: "RH - Écriture" },
  { code: "page.absences.read", label: "Absences - Lecture" },
  { code: "page.absences.write", label: "Absences - Écriture" },
  { code: "page.affaires.read", label: "Affaires - Lecture" },
  { code: "page.affaires.write", label: "Affaires - Écriture" },
  { code: "page.gantt.read", label: "Gantt - Lecture" },
  { code: "page.gantt.write", label: "Gantt - Écriture" },
  { code: "page.terrain.read", label: "Terrain - Lecture" },
  { code: "page.terrain.write", label: "Terrain - Écriture" },
  { code: "page.maintenance.read", label: "Maintenance - Lecture" },
  { code: "page.maintenance.write", label: "Maintenance - Écriture" },
  { code: "page.clients.read", label: "Clients - Lecture" },
  { code: "page.clients.write", label: "Clients - Écriture" },
  { code: "page.claims.read", label: "Claims - Lecture" },
  { code: "page.claims.write", label: "Claims - Écriture" },
  { code: "page.dashboard.read", label: "Dashboard - Lecture" },
  { code: "page.builder.read", label: "Builder - Lecture" },
  { code: "page.builder.write", label: "Builder - Écriture" },
] as const

// Compétences
export const COMPETENCES = [
  "Électricité",
  "CVC",
  "Plomberie",
  "Chauffage",
  "Automatisme",
  "Sûreté",
  "SSI",
  "Maintenance",
  "Conduite de travaux",
  "Coordination",
  "Autre",
] as const

