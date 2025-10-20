# 📊 INVENTAIRE COMPLET - TOUTES LES TABLES

Date: 2025-01-20
Objectif: Lister toutes les tables créées dans les migrations SQL

---

## 📈 RÉSUMÉ

**Total: 32 tables** réparties dans 11 migrations

---

## 📋 LISTE COMPLÈTE DES TABLES

### 1️⃣ Migration 001 - Sites
| # | Table | Description |
|---|-------|-------------|
| 1 | `sites` | Sites opérationnels |

### 2️⃣ Migration 002 - RH Collaborateurs
| # | Table | Description |
|---|-------|-------------|
| 2 | `ressources` | Collaborateurs/Ressources |
| 3 | `suivi_rh` | Suivi RH (formations, habilitations, visites médicales) |
| 4 | `historique_actions` | Audit des modifications |

### 3️⃣ Migration 003 - Absences
| # | Table | Description |
|---|-------|-------------|
| 5 | `absences` | Absences des collaborateurs |
| 6 | `alerts` | Alertes et notifications système |

### 4️⃣ Migration 004 - Affaires
| # | Table | Description |
|---|-------|-------------|
| 7 | `clients` | Clients (entreprises) |
| 8 | `affaires` | Affaires - socle métier et financier |
| 9 | `affaires_lots` | Découpage financier des affaires par lots |

### 5️⃣ Migration 005 - Gantt
| # | Table | Description |
|---|-------|-------------|
| 10 | `planning_taches` | Tâches de planification Gantt |

### 6️⃣ Migration 006 - Terrain & Maintenance
| # | Table | Description |
|---|-------|-------------|
| 11 | `remontee_site` | Remontées d'information terrain quotidiennes |
| 12 | `remontee_site_reporting` | Copie figée des remontées confirmées |
| 13 | `tache_suspensions` | Tracking des suspensions de tâches |
| 14 | `maintenance_batteries` | Batteries de maintenance (groupes d'activités) |
| 15 | `maintenance_journal` | Journal du soir des interventions maintenance |
| 16 | `maintenance_monthly_digest` | Traces d'envoi des bilans mensuels |

### 7️⃣ Migration 007 - Interlocuteurs
| # | Table | Description |
|---|-------|-------------|
| 17 | `interlocuteurs` | Contacts clients (personnes) |
| 18 | `affaires_interlocuteurs` | Liaison entre affaires et interlocuteurs avec rôles |
| 19 | `interactions_client` | Historique des échanges avec les clients |

### 8️⃣ Migration 008 - Claims
| # | Table | Description |
|---|-------|-------------|
| 20 | `claims` | Réclamations (internes, clients, sous-traitants) |
| 21 | `claim_history` | Historique des modifications de claims |
| 22 | `claim_comments` | Commentaires et discussions sur les claims |

### 9️⃣ Migration 010 - Form Builder
| # | Table | Description |
|---|-------|-------------|
| 23 | `forms` | Définitions de masques (formulaires dynamiques) |
| 24 | `form_instances` | Publications de masques (portée site/affaire/tâche) |
| 25 | `form_entries` | Données saisies (entrées des masques) |
| 26 | `form_entry_history` | Historique des modifications d'entrées |
| 27 | `form_notifications` | Traces d'envoi de notifications (rappels/digest) |

### 🔟 Migration 011 - Gantt Functions
| # | Table | Description |
|---|-------|-------------|
| 28 | `tache_dependances` | Dépendances entre tâches |

### 1️⃣1️⃣ Migration 015 - Terrain Tuiles
| # | Table | Description |
|---|-------|-------------|
| 29 | `site_blocages` | Blocages généraux de sites |
| 30 | `confirmation_queue` | File d'attente des confirmations quotidiennes |

### 1️⃣2️⃣ Migration 020 - BPU
| # | Table | Description |
|---|-------|-------------|
| 31 | `affaire_bpu_lignes` | Lignes BPU (décharges batterie) |
| 32 | `affaire_bpu_calendrier` | Calendrier des décharges BPU |

---

## 🎯 TABLES UTILISÉES DANS LES COMPOSANTS

### ✅ Composants modifiés (8)
| Composant | Table Principale | Statut |
|-----------|------------------|--------|
| CollaborateursTable | `ressources` | ✅ Vérifié |
| AbsencesTable | `absences` | ✅ Vérifié |
| ClaimsTable | `claims` | ✅ Vérifié |
| MaintenanceTable | `maintenance_journal` | ✅ Vérifié |
| FormsTable | `forms` | ✅ Vérifié |
| InterlocuteursTable | `interlocuteurs` | ✅ Vérifié |
| RemonteesTable | `remontee_site` | ✅ Vérifié |
| GanttTable | `planning_taches` | ✅ Vérifié |
| SitesTable | `sites` | ✅ Vérifié |

### ⚠️ Tables NON utilisées dans les composants actuels (23)
| # | Table | Description | Utilisation potentielle |
|---|-------|-------------|------------------------|
| 1 | `suivi_rh` | Suivi RH | Module RH - à implémenter |
| 2 | `historique_actions` | Audit | Utilisé par triggers |
| 3 | `alerts` | Alertes | Dashboard - à implémenter |
| 4 | `clients` | Clients | Utilisé via joins |
| 5 | `affaires` | Affaires | Utilisé via joins |
| 6 | `affaires_lots` | Lots | Utilisé via joins |
| 7 | `remontee_site_reporting` | Reporting figé | Module terrain - à implémenter |
| 8 | `tache_suspensions` | Suspensions | Module terrain - à implémenter |
| 9 | `maintenance_batteries` | Batteries | Module maintenance - à implémenter |
| 10 | `maintenance_monthly_digest` | Digest mensuel | Module maintenance - à implémenter |
| 11 | `affaires_interlocuteurs` | Liaisons | Module interlocuteurs - à implémenter |
| 12 | `interactions_client` | Historique échanges | Module interlocuteurs - à implémenter |
| 13 | `claim_history` | Historique claims | Module claims - à implémenter |
| 14 | `claim_comments` | Commentaires claims | Module claims - à implémenter |
| 15 | `form_instances` | Instances de masques | Module builder - à implémenter |
| 16 | `form_entries` | Entrées de masques | Module builder - à implémenter |
| 17 | `form_entry_history` | Historique entrées | Module builder - à implémenter |
| 18 | `form_notifications` | Notifications | Module builder - à implémenter |
| 19 | `tache_dependances` | Dépendances tâches | Module Gantt - à implémenter |
| 20 | `site_blocages` | Blocages sites | Module terrain - à implémenter |
| 21 | `confirmation_queue` | Confirmations | Module terrain - à implémenter |
| 22 | `affaire_bpu_lignes` | Lignes BPU | Module BPU - à implémenter |
| 23 | `affaire_bpu_calendrier` | Calendrier BPU | Module BPU - à implémenter |

---

## 🔍 ANALYSE

### Tables principales (9)
Ces tables sont déjà utilisées dans les composants :
- ✅ `sites`, `ressources`, `absences`, `claims`
- ✅ `maintenance_journal`, `forms`, `interlocuteurs`
- ✅ `remontee_site`, `planning_taches`

### Tables de liaison (4)
Ces tables sont utilisées via joins mais pas directement :
- `clients`, `affaires`, `affaires_lots`, `affaires_interlocuteurs`

### Tables de suivi/historique (5)
Ces tables sont utilisées par les triggers ou pour l'audit :
- `historique_actions`, `claim_history`, `claim_comments`
- `form_entry_history`, `tache_suspensions`

### Tables fonctionnelles (14)
Ces tables sont pour des fonctionnalités spécifiques à implémenter :
- **RH**: `suivi_rh`, `alerts`
- **Terrain**: `remontee_site_reporting`, `site_blocages`, `confirmation_queue`
- **Maintenance**: `maintenance_batteries`, `maintenance_monthly_digest`
- **Interlocuteurs**: `interactions_client`
- **Builder**: `form_instances`, `form_entries`, `form_notifications`
- **Gantt**: `tache_dependances`
- **BPU**: `affaire_bpu_lignes`, `affaire_bpu_calendrier`

---

## 📊 STATISTIQUES

| Catégorie | Nombre | Pourcentage |
|-----------|--------|-------------|
| **Tables principales** | 9 | 28% |
| **Tables de liaison** | 4 | 12.5% |
| **Tables de suivi** | 5 | 15.6% |
| **Tables fonctionnelles** | 14 | 43.8% |
| **TOTAL** | **32** | **100%** |

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

### Phase 1 - Tables principales (✅ FAIT)
- [x] Sites, Ressources, Absences, Claims
- [x] Maintenance, Forms, Interlocuteurs
- [x] Remontées, Gantt

### Phase 2 - Tables de liaison (À FAIRE)
- [ ] Créer composants pour `clients`
- [ ] Créer composants pour `affaires` (déjà partiellement fait)
- [ ] Créer composants pour `affaires_lots`

### Phase 3 - Tables de suivi (À FAIRE)
- [ ] Historique des actions
- [ ] Historique des claims
- [ ] Historique des entrées de formulaires

### Phase 4 - Tables fonctionnelles (À FAIRE)
- [ ] Module RH complet (suivi_rh, alerts)
- [ ] Module Terrain complet (reporting, blocages, confirmations)
- [ ] Module Maintenance complet (batteries, digest)
- [ ] Module Interlocuteurs complet (interactions)
- [ ] Module Builder complet (instances, entrées, notifications)
- [ ] Module Gantt avancé (dépendances)
- [ ] Module BPU complet (lignes, calendrier)

---

## 📝 NOTES

1. **Tables déjà utilisées**: 9 tables sont actuellement utilisées dans les composants
2. **Tables via joins**: 4 tables sont utilisées indirectement via les relations
3. **Tables à implémenter**: 19 tables nécessitent des composants dédiés
4. **Couverture actuelle**: ~28% des tables sont directement utilisées dans l'UI

---

**Document généré le**: 2025-01-20
**Statut**: 📊 Inventaire complet

