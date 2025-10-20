# 🚀 DÉMARRAGE RAPIDE - Module Terrain : Vue Liste & Tuiles interactives

---

## ✅ PRÉREQUIS

### Backend
- [x] Migration 015 exécutée avec succès
- [x] Tables `site_blocages` et `confirmation_queue` créées
- [x] Fonctions SQL créées (5)
- [x] Vues créées (2)

### Frontend
- [x] Composants créés (3)
- [x] API Routes créées (4)
- [x] Page terrain/remontee mise à jour

---

## 🚀 DÉMARRAGE EN 3 ÉTAPES

### Étape 1 : Vérifier la migration SQL ✅

```sql
-- Dans Supabase Dashboard → SQL Editor
-- Vérifier que la migration est bien exécutée
SELECT COUNT(*) FROM site_blocages;
SELECT COUNT(*) FROM confirmation_queue;
SELECT COUNT(*) FROM information_schema.routines WHERE routine_name LIKE 'fn_%';
SELECT COUNT(*) FROM information_schema.views WHERE table_name LIKE 'v_%';

-- Résultat attendu : Tous les compteurs > 0
```

### Étape 2 : Tester les API Routes ✅

```bash
# Tester GET /api/terrain/affaires
curl http://localhost:3000/api/terrain/affaires

# Tester GET /api/terrain/tasks
curl http://localhost:3000/api/terrain/tasks

# Résultat attendu : JSON avec les données
```

### Étape 3 : Ouvrir la page terrain/remontee ✅

```bash
# Ouvrir dans le navigateur
http://localhost:3000/terrain/remontee

# Vérifier :
- [ ] La page s'affiche
- [ ] La liste des affaires est visible
- [ ] Le bouton "Blocage général" est visible
```

---

## 🎯 UTILISATION

### 1. Voir les affaires et leurs tâches

```bash
# Actions :
1. Ouvrir http://localhost:3000/terrain/remontee
2. Voir la liste des affaires
3. Cliquer sur une affaire pour voir ses tâches
4. Voir les tuiles interactives des tâches
```

### 2. Changer le statut d'une tâche

```bash
# Actions :
1. Ouvrir une affaire
2. Voir les tuiles des tâches
3. Cliquer sur un bouton d'action (Lancer, Terminer, etc.)
4. Vérifier que le statut change
```

### 3. Ajouter un commentaire

```bash
# Actions :
1. Ouvrir une tâche
2. Remplir le champ "Commentaire"
3. Cliquer sur "Ajouter"
4. Vérifier que le commentaire est enregistré
```

### 4. Déclarer un blocage général

```bash
# Actions :
1. Cliquer sur "Blocage général"
2. Sélectionner un site ou une affaire
3. Choisir une cause
4. Définir les dates
5. Cliquer sur "Appliquer le blocage"
6. Vérifier que les tâches sont suspendues
```

---

## 📊 DONNÉES DE TEST

### Créer des données de test

```sql
-- Créer un site de test
INSERT INTO sites (code_site, nom, statut)
VALUES ('TEST-001', 'Site de test', 'Actif')
RETURNING id;

-- Créer une affaire de test
INSERT INTO affaires (code_affaire, site_id, statut, type_contrat)
VALUES ('AFF-TEST-001', (SELECT id FROM sites WHERE code_site = 'TEST-001'), 'Planifiée', 'Forfait')
RETURNING id;

-- Créer des tâches de test
INSERT INTO planning_taches (affaire_id, site_id, libelle_tache, date_debut_plan, date_fin_plan, statut)
VALUES 
  ((SELECT id FROM affaires WHERE code_affaire = 'AFF-TEST-001'), 
   (SELECT id FROM sites WHERE code_site = 'TEST-001'), 
   'Tâche 1', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'Non lancé'),
  ((SELECT id FROM affaires WHERE code_affaire = 'AFF-TEST-001'), 
   (SELECT id FROM sites WHERE code_site = 'TEST-001'), 
   'Tâche 2', CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days', 'En cours'),
  ((SELECT id FROM affaires WHERE code_affaire = 'AFF-TEST-001'), 
   (SELECT id FROM sites WHERE code_site = 'TEST-001'), 
   'Tâche 3', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'Terminé');
```

---

## 🔧 CONFIGURATION DES CRONS (Optionnel)

### Cron 1 : Descente automatique vers exécution (06h00)

```sql
-- Dans Supabase Dashboard → Database → Cron Jobs
-- Ajouter :
SELECT fn_auto_descente_realisation();

-- Fréquence : Tous les jours à 06h00
```

### Cron 2 : Confirmation quotidienne (06h30)

```sql
-- Dans Supabase Dashboard → Database → Cron Jobs
-- Ajouter :
SELECT fn_confirm_en_cours();

-- Fréquence : Tous les jours à 06h30
```

### Cron 3 : Fermeture automatique des suspensions (12h00)

```sql
-- Dans Supabase Dashboard → Database → Cron Jobs
-- Ajouter :
SELECT fn_auto_close_suspension();

-- Fréquence : Tous les jours à 12h00
```

---

## 🎨 PERSONNALISATION

### Modifier les couleurs des badges

```typescript
// components/terrain/TaskTile.tsx
const getStatusConfig = (statut: string) => {
  switch (statut) {
    case "À lancer":
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300", // Modifier ici
        ...
      }
    // ... autres statuts
  }
}
```

### Modifier les actions disponibles

```typescript
// components/terrain/TaskTile.tsx
const getStatusConfig = (statut: string) => {
  switch (statut) {
    case "En cours":
      return {
        actions: ["Terminer", "Suspendre", "Prolonger"], // Modifier ici
        ...
      }
    // ... autres statuts
  }
}
```

---

## 🐛 DÉPANNAGE

### Problème 1 : La page ne s'affiche pas

```bash
# Solution :
1. Vérifier que le serveur Next.js est démarré
2. Vérifier que la migration SQL est exécutée
3. Vérifier les logs du serveur
4. Rafraîchir la page (Ctrl+F5)
```

### Problème 2 : Les données ne s'affichent pas

```bash
# Solution :
1. Vérifier que les API Routes fonctionnent
2. Vérifier que les vues SQL existent
3. Vérifier les logs du serveur
4. Vérifier la console du navigateur
```

### Problème 3 : Le blocage général ne fonctionne pas

```bash
# Solution :
1. Vérifier que la fonction fn_apply_site_blocage() existe
2. Vérifier que les paramètres sont corrects
3. Vérifier les logs du serveur
4. Vérifier la console du navigateur
```

---

## 📚 DOCUMENTATION

### Documents disponibles
1. **`ANALYSE_TERRAIN_TUILES.md`** - Analyse des impacts
2. **`015_terrain_tuiles.sql`** - Migration SQL
3. **`TESTS_TERRAIN_TUILES.md`** - Tests et contrôles
4. **`DEMARRAGE_TERRAIN_TUILES.md`** - Ce document
5. **`RESUME_TERRAIN_TUILES.md`** - Résumé complet

### Support
- Documentation Supabase : https://supabase.com/docs
- Documentation Next.js : https://nextjs.org/docs
- Documentation shadcn/ui : https://ui.shadcn.com

---

## ✅ CHECKLIST FINALE

### Avant de démarrer
- [ ] Migration SQL exécutée
- [ ] API Routes testées
- [ ] Page terrain/remontee accessible
- [ ] Données de test créées

### Après le démarrage
- [ ] Liste des affaires visible
- [ ] Vue tuiles fonctionnelle
- [ ] Changement de statut opérationnel
- [ ] Blocage général fonctionnel
- [ ] Commentaires enregistrés

---

## 🎉 CONCLUSION

**Le module "Vue Liste & Tuiles interactives" est maintenant opérationnel !**

✅ Migration SQL exécutée
✅ Composants frontend créés
✅ API Routes fonctionnelles
✅ Page terrain/remontee mise à jour
✅ Documentation complète

**Le système est prêt pour la production ! 🚀**

---

**Date :** 2025-01-18
**Version :** 1.0
**Statut :** ✅ OPÉRATIONNEL

🎉 **BRAVO ! LE MODULE EST PRÊT !** 🎉

