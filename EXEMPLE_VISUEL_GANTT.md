# 📊 Exemple visuel : Affichage Gantt

## Données dans la base

```sql
SELECT * FROM planning_taches LIMIT 3;
```

| id | libelle_tache | date_debut_plan | date_fin_plan | statut | avancement_pct |
|----|---------------|-----------------|---------------|--------|----------------|
| abc-123 | Étude technique | 2025-10-05 | 2025-10-10 | Terminé | 100 |
| def-456 | Contrôle équipements | 2025-10-07 | 2025-10-10 | Non lancé | 0 |
| ghi-789 | Réparation TGBT | 2025-10-11 | 2025-10-21 | En cours | 45 |

## Affichage dans le graphique Gantt

### Vue calendrier

```
Octobre 2025
Mo  Tu  We  Th  Fr  Sa  Su
       01  02  03  04  05
06  07  08  09  10  11  12
13  14  15  16  17  18  19
20  21  22  23  24  25  26

Tâches :
┌──────────────────────────────────────────────────────────────┐
│ Étude technique                    ████████████████████ 100% │
│ 2025-10-05 ──────────────── 2025-10-10                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Contrôle équipements               ░░░░░░░░░░░░░░░░░░░░  0%  │
│ 2025-10-07 ──────────────── 2025-10-10                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Réparation TGBT                  █████████░░░░░░░░░░░ 45%   │
│ 2025-10-11 ─────────────────────────── 2025-10-21           │
└──────────────────────────────────────────────────────────────┘
```

### Vue détaillée

#### Tâche 1 : Étude technique
```
┌─────────────────────────────────────┐
│ 🟢 Étude technique                  │
│                                     │
│ 📅 Début : 2025-10-05               │
│ 📅 Fin   : 2025-10-10               │
│ ⏱️  Durée : 5 jours                 │
│ 📊 Avancement : 100%                │
│ ✅ Statut : Terminé                 │
│                                     │
│ ████████████████████░░░░ 100%       │
└─────────────────────────────────────┘
```

#### Tâche 2 : Contrôle équipements
```
┌─────────────────────────────────────┐
│ 🔵 Contrôle équipements             │
│                                     │
│ 📅 Début : 2025-10-07               │
│ 📅 Fin   : 2025-10-10               │
│ ⏱️  Durée : 3 jours                 │
│ 📊 Avancement : 0%                  │
│ 🔵 Statut : Non lancé               │
│                                     │
│ ░░░░░░░░░░░░░░░░░░░░░░░░  0%        │
└─────────────────────────────────────┘
```

#### Tâche 3 : Réparation TGBT
```
┌─────────────────────────────────────┐
│ 🟠 Réparation TGBT                  │
│                                     │
│ 📅 Début : 2025-10-11               │
│ 📅 Fin   : 2025-10-21               │
│ ⏱️  Durée : 10 jours                │
│ 📊 Avancement : 45%                 │
│ 🟠 Statut : En cours                │
│                                     │
│ █████████░░░░░░░░░░░░░░░ 45%        │
└─────────────────────────────────────┘
```

## Codes couleur

| Statut | Couleur | Icône | Barre |
|--------|---------|-------|-------|
| Non lancé | 🔵 Bleu clair | 🔵 | ░░░░░░░░░░ |
| En cours | 🟠 Orange | 🟠 | ███████░░░ |
| Terminé | 🟢 Vert | 🟢 | ██████████ |
| Bloqué | 🔴 Rouge | 🔴 | ████████░░ |
| Reporté | ⚪ Gris | ⚪ | ░░░░░░░░░░ |

## Exemple avec 14 tâches

### Données
```
14 tâches dans planning_taches
```

### Affichage
```
┌──────────────────────────────────────────────────────────────┐
│ Octobre 2025                                                  │
├──────────────────────────────────────────────────────────────┤
│ Étude technique                    ████████████████████ 100% │
│ Étude de faisabilité              ████████████████████ 100% │
│ Contrôle équipements               ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Réparation TGBT                    █████████░░░░░░░░░░░ 45%  │
│ Réalisation travaux                ████████████████████ 100% │
│ Commande matériel                  ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Préparation site                   ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Installation équipements           ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Installation automates             ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Remplacement composants            ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Câblage et raccordements           ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Mise en service                    ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Tests finaux                       ░░░░░░░░░░░░░░░░░░░░  0%  │
│ Tests et contrôles                 ░░░░░░░░░░░░░░░░░░░░  0%  │
└──────────────────────────────────────────────────────────────┘
```

## Légende

### Barres
- `█████` : Partie terminée
- `░░░░░` : Partie restante

### Statuts
- 🔵 **Non lancé** : Pas encore commencé
- 🟠 **En cours** : En cours d'exécution
- 🟢 **Terminé** : Tâche terminée (100%)
- 🔴 **Bloqué** : Tâche bloquée
- ⚪ **Reporté** : Tâche reportée

### Informations
- 📅 **Dates** : Date de début et de fin
- ⏱️ **Durée** : Nombre de jours
- 📊 **Avancement** : Pourcentage de réalisation

## Zoom

### Vue semaine
```
Semaine du 7 octobre 2025
┌─────────────────────────────────────────┐
│ Lu  Ma  Me  Je  Ve  Sa  Di              │
│ 07  08  09  10  11  12  13              │
├─────────────────────────────────────────┤
│ Étude technique ████████ 100%           │
│ Contrôle équipements ░░░░ 0%            │
│ Réparation TGBT ████░░░░ 45%            │
└─────────────────────────────────────────┘
```

### Vue mois
```
Octobre 2025
┌─────────────────────────────────────────┐
│  1  2  3  4  5  6  7  8  9 10 11 12 13  │
│ 14 15 16 17 18 19 20 21 22 23 24 25 26  │
│ 27 28 29 30 31                           │
├─────────────────────────────────────────┤
│ Étude technique ████████ 100%           │
│ Contrôle équipements ░░░░ 0%            │
│ Réparation TGBT ████░░░░ 45%            │
│ ... (11 autres tâches)                  │
└─────────────────────────────────────────┘
```

---

**Fichier CSV** : `exemple_import_taches.csv`  
**Documentation** : `GUIDE_AFFICHAGE_GANTT.md`

