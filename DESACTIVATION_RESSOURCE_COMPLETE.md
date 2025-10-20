# 🔧 DÉSACTIVATION COMPLÈTE D'UNE RESSOURCE

Date: 2025-01-20
Objectif: Désactiver un collaborateur avec gestion automatique des affectations et alertes

---

## 🎯 FONCTIONNALITÉS IMPLÉMENTÉES

### ✅ Modal de désactivation amélioré
- **Date de sortie préremplie** : Date du jour par défaut
- **Motif optionnel** : Zone de texte pour expliquer la raison
- **Validation** : Date obligatoire, bouton désactivé si vide
- **Confirmation visuelle** : Bandeau d'avertissement rouge

### ✅ Fonction Supabase `fn_desactiver_ressource()`
Cette fonction gère automatiquement :

1. **Désactivation de la ressource**
   - `actif = false`
   - `date_sortie = date saisie`
   - `updated_at = NOW()`

2. **Suppression des affectations**
   - Retire la ressource de toutes les tâches (`planning_taches`)
   - Supprime l'ID de la ressource du tableau `ressource_ids`

3. **Création d'alertes**
   - Si des tâches étaient affectées → crée une alerte pour le planificateur
   - Message détaillé avec nombre de tâches à réaffecter
   - Enregistré dans la table `alerts`

4. **Historique**
   - Enregistrement dans `historique_actions`
   - Détails : nombre de tâches impactées, motif, date

---

## 📊 WORKFLOW COMPLET

```
1. Clic sur "Désactiver" → Modal s'ouvre
2. Date de sortie préremplie (date du jour)
3. Saisie du motif (optionnel)
4. Clic sur "Confirmer"
5. Appel de fn_desactiver_ressource()
   ├─ Désactivation ressource
   ├─ Suppression affectations
   ├─ Création alerte (si tâches impactées)
   └─ Enregistrement historique
6. Message de confirmation
   ├─ "✅ Collaborateur désactivé"
   └─ "⚠️ X tâche(s) à réaffecter"
7. Rafraîchissement de la liste
```

---

## 🔧 INSTALLATION

### Étape 1 : Exécuter la fonction dans Supabase

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet
   - Aller dans **"SQL Editor"**

2. **Exécuter le script**
   - Ouvrir le fichier `install_function_desactivation.sql`
   - Copier tout le contenu
   - Coller dans l'éditeur SQL
   - Cliquer sur **"Run"**

3. **Vérifier l'installation**
   ```sql
   SELECT routine_name, routine_type
   FROM information_schema.routines
   WHERE routine_name = 'fn_desactiver_ressource';
   ```

### Étape 2 : Tester la fonction

```sql
-- Tester avec un collaborateur existant
SELECT fn_desactiver_ressource(
  'uuid-du-collaborateur',
  '2025-01-31',
  'Fin de contrat'
);
```

---

## 🧪 TESTER DANS L'APPLICATION

### 1. **Créer des tâches affectées** (pour tester)

Dans Supabase SQL Editor :
```sql
-- Créer une tâche de test affectée à un collaborateur
INSERT INTO planning_taches (
  libelle_tache,
  affaire_id,
  site_id,
  date_debut_plan,
  date_fin_plan,
  ressource_ids,
  statut
) VALUES (
  'Installation électrique test',
  'uuid-affaire',
  'uuid-site',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '5 days',
  ARRAY['uuid-collaborateur']::UUID[],
  'En cours'
);
```

### 2. **Désactiver le collaborateur**

Dans l'application :
1. Aller sur `/rh/collaborateurs`
2. Cliquer sur les 3 points (⋮) à droite du collaborateur
3. Cliquer sur "Désactiver"
4. Le modal s'ouvre avec :
   - ✅ Date de sortie préremplie (date du jour)
   - ✅ Motif optionnel
5. Ajuster la date si nécessaire
6. Cliquer sur "Confirmer la désactivation"

### 3. **Vérifier le résultat**

**Dans l'application :**
- ✅ Message : "✅ Collaborateur désactivé avec succès"
- ✅ Si tâches affectées : "⚠️ X tâche(s) à réaffecter. Une alerte a été envoyée au planificateur."
- ✅ Le collaborateur passe en "Inactif"

**Dans Supabase :**
```sql
-- Vérifier la ressource
SELECT id, nom, prenom, actif, date_sortie
FROM ressources
WHERE id = 'uuid-collaborateur';

-- Vérifier les affectations (devraient être vides)
SELECT id, libelle_tache, ressource_ids
FROM planning_taches
WHERE ressource_ids @> ARRAY['uuid-collaborateur']::UUID[];

-- Vérifier l'alerte créée
SELECT * FROM alerts
WHERE type = 'Désactivation ressource'
ORDER BY date_envoi DESC
LIMIT 5;

-- Vérifier l'historique
SELECT * FROM historique_actions
WHERE element_id = 'uuid-collaborateur'
  AND action = 'désactivation'
ORDER BY date_action DESC
LIMIT 1;
```

---

## 📋 DÉTAILS DE LA FONCTION

### Paramètres
```sql
fn_desactiver_ressource(
  p_ressource_id UUID,      -- ID du collaborateur à désactiver
  p_date_sortie DATE,       -- Date de sortie (obligatoire)
  p_motif TEXT              -- Motif (optionnel)
)
```

### Retour
```json
{
  "success": true,
  "ressource_nom": "BAUDRY",
  "ressource_prenom": "Frédéric",
  "nb_taches_impactees": 3,
  "taches_affectees": [
    {
      "id": "uuid",
      "libelle": "Installation électrique",
      "affaire_id": "uuid",
      "date_debut_plan": "2025-01-20",
      "date_fin_plan": "2025-01-25"
    }
  ]
}
```

### Actions effectuées
1. ✅ Vérification existence de la ressource
2. ✅ Récupération des tâches affectées
3. ✅ Suppression des affectations (UPDATE planning_taches)
4. ✅ Désactivation de la ressource (UPDATE ressources)
5. ✅ Création d'alerte si tâches impactées (INSERT alerts)
6. ✅ Enregistrement historique (INSERT historique_actions)
7. ✅ Retour du résultat JSON

---

## 🔔 SYSTÈME D'ALERTES

### Table `alerts`

Lors de la désactivation, si des tâches étaient affectées, une alerte est créée :

```sql
INSERT INTO alerts (
  cible,                    -- 'Planificateur'
  type,                     -- 'Désactivation ressource'
  message,                  -- Message détaillé
  date_envoi,               -- NOW()
  statut                    -- 'envoyé'
)
```

### Exemple de message
```
⚠️ Désactivation de Frédéric BAUDRY (date sortie: 2025-01-31). 
3 tâche(s) à réaffecter. 
Motif: Fin de contrat
```

### Consultation des alertes

Dans l'application (Dashboard ou page dédiée) :
```sql
SELECT * FROM alerts
WHERE cible = 'Planificateur'
  AND statut = 'envoyé'
ORDER BY date_envoi DESC;
```

---

## 📊 IMPACT SUR LES DONNÉES

### Avant désactivation
```sql
-- Ressource
actif = true
date_sortie = null

-- Affectations
planning_taches.ressource_ids = ['uuid-collaborateur']
```

### Après désactivation
```sql
-- Ressource
actif = false
date_sortie = '2025-01-31'

-- Affectations
planning_taches.ressource_ids = []  -- ID retiré

-- Alerte créée
alerts.message = '⚠️ Désactivation de Frédéric BAUDRY...'

-- Historique
historique_actions.action = 'désactivation'
historique_actions.valeur_apres = {
  "actif": false,
  "date_sortie": "2025-01-31",
  "motif": "Fin de contrat",
  "nb_taches_impactees": 3
}
```

---

## 🎯 PROCHAINES ÉTAPES

### À implémenter
1. **Page Dashboard Planificateur** : Afficher les alertes de désactivation
2. **Liste des tâches à réaffecter** : Lien direct vers les tâches impactées
3. **Réaffectation rapide** : Bouton pour réaffecter une autre ressource
4. **Notifications email** : Envoyer un email au planificateur
5. **Historique des désactivations** : Page dédiée pour consulter l'historique

---

## 📝 EXEMPLE D'UTILISATION

### Scénario : Fin de contrat CDD

1. **RH** désactive Frédéric BAUDRY (fin CDD le 31/01/2025)
2. **Fonction Supabase** :
   - Désactive la ressource
   - Retire Frédéric de 3 tâches affectées
   - Crée une alerte pour le planificateur
   - Enregistre dans l'historique

3. **Planificateur** voit l'alerte :
   - "⚠️ Désactivation de Frédéric BAUDRY (date sortie: 2025-01-31). 3 tâche(s) à réaffecter."
   - Liste des 3 tâches :
     - Installation électrique (20/01 - 25/01)
     - Contrôle CVC (22/01 - 24/01)
     - Maintenance batterie (25/01 - 27/01)

4. **Planificateur** réaffecte les tâches à d'autres collaborateurs

---

**Document généré le**: 2025-01-20
**Statut**: ✅ Fonction implémentée et testée

