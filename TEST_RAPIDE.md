# Test Rapide - Module Maintenance v1.2.4

**Date :** 2025-01-18  
**Durée estimée :** 5-10 minutes

---

## 🚀 Démarrage Rapide

### 1. Démarrer le serveur de développement

```bash
cd "C:\Users\Fredd\OneDrive\Desktop\Appli DE dev"
npm run dev
```

**Attendre :** Le serveur démarre sur http://localhost:3000

---

## ✅ Tests Rapides (5 minutes)

### Test 1 : Page Maintenance (1 min)

1. **Accéder à la page**
   ```
   http://localhost:3000/maintenance
   ```

2. **Vérifier visuellement**
   - ✅ Titre : "Journal de l'après-midi (14h-18h)"
   - ✅ KPI : Interventions du jour, En cours, Batteries terminées, Temps métal
   - ✅ Tableau avec colonnes : Tranche, Système Élémentaire, Système, Type, État, Présence, Suspension, Métal, Description
   - ✅ Bouton "Nouvelle intervention" visible
   - ❌ Pas de bouton "Confirmer la journée"

**Résultat attendu :** Page chargée sans erreur

---

### Test 2 : Création d'intervention (2 min)

1. **Cliquer sur "Nouvelle intervention"**

2. **Vérifier le formulaire**
   - ✅ Modal s'ouvre
   - ✅ Champ "Tranche" (0-9)
   - ✅ Champ "Système Élémentaire" (obligatoire)
   - ✅ Champ "Système" (optionnel)
   - ✅ Champ "Type maintenance" (texte libre)
   - ✅ Champ "État" (Non_lancee, En_cours, Termine, Prolongee, Reportee, Suspendue)
   - ✅ Champs "Heures présence", "Heures suspension"
   - ✅ Champ "Heures métal" (disabled, calculé auto)
   - ✅ Champ "Motif" (si Suspendue)
   - ✅ Champ "Description"

3. **Remplir le formulaire**
   ```
   Tranche : 0
   Système Élémentaire : TEST001
   Système : Test
   Type maintenance : Test de fonctionnement
   État : En_cours
   Heures présence : 4
   Heures suspension : 0.5
   Description : Test rapide du module
   ```

4. **Vérifier le calcul automatique**
   - ✅ Heures métal : 3.5 (4 - 0.5)

5. **Cliquer sur "Enregistrer"**
   - ✅ Modal se ferme
   - ✅ Intervention apparaît dans le tableau

**Résultat attendu :** Intervention créée avec succès

---

### Test 3 : Modification d'intervention (1 min)

1. **Cliquer sur les 3 points (⋯) de la ligne créée**

2. **Cliquer sur "Modifier"**
   - ✅ Modal s'ouvre avec les données pré-remplies

3. **Modifier un champ**
   ```
   Heures présence : 5
   ```

4. **Vérifier le recalcul**
   - ✅ Heures métal : 4.5 (5 - 0.5)

5. **Cliquer sur "Modifier"**
   - ✅ Modal se ferme
   - ✅ Données mises à jour dans le tableau

**Résultat attendu :** Intervention modifiée avec succès

---

### Test 4 : Suppression d'intervention (30 sec)

1. **Cliquer sur les 3 points (⋯) de la ligne**

2. **Cliquer sur "Supprimer"**
   - ✅ Confirmation demandée

3. **Confirmer**
   - ✅ Intervention supprimée du tableau

**Résultat attendu :** Intervention supprimée avec succès

---

### Test 5 : Calcul heures métal (1 min)

1. **Créer une nouvelle intervention**
   ```
   Tranche : 1
   Système Élémentaire : TEST002
   Type maintenance : Test calcul
   État : En_cours
   Heures présence : 8
   Heures suspension : 2
   Description : Test calcul métal
   ```

2. **Vérifier le calcul**
   - ✅ Heures métal : 6 (8 - 2)

3. **Modifier les heures**
   ```
   Heures présence : 6
   Heures suspension : 1.5
   ```
   - ✅ Heures métal : 4.5 (6 - 1.5)

**Résultat attendu :** Calcul automatique fonctionnel

---

## 🔍 Vérifications Complémentaires (Optionnel)

### Vérifier la console navigateur (F12)

1. **Ouvrir la console** (F12 > Console)

2. **Vérifier qu'il n'y a pas d'erreurs**
   - ✅ Pas d'erreurs rouges
   - ✅ Pas d'avertissements critiques

**Résultat attendu :** Console propre

---

### Vérifier les états (Badges)

Dans le tableau, vérifier que les badges d'état s'affichent correctement :
- 🟢 Terminée (vert)
- 🔵 En cours (bleu)
- 🟠 Reportée (jaune)
- 🟣 Prolongée (violet)
- ⚫ Suspendue (orange)
- ⚪ Non lancée (gris)

**Résultat attendu :** Badges colorés corrects

---

## 📊 Résultat des Tests

### Checklist

- [ ] Test 1 : Page Maintenance
- [ ] Test 2 : Création d'intervention
- [ ] Test 3 : Modification d'intervention
- [ ] Test 4 : Suppression d'intervention
- [ ] Test 5 : Calcul heures métal
- [ ] Vérification console navigateur
- [ ] Vérification badges d'état

### Score

- **7/7** : ✅ Système parfaitement fonctionnel
- **5-6/7** : ⚠️ Quelques ajustements nécessaires
- **<5/7** : ❌ Problèmes à résoudre

---

## 🐛 Problèmes Courants

### Erreur : "Internal Server Error"
**Solution :**
1. Vérifier que le serveur est bien démarré
2. Vérifier la console navigateur (F12)
3. Redémarrer le serveur : `Ctrl+C` puis `npm run dev`

### Erreur : "Cannot read property of undefined"
**Solution :**
1. Vider le cache du navigateur (Ctrl+Shift+R)
2. Redémarrer le serveur

### Le modal ne s'ouvre pas
**Solution :**
1. Vérifier la console pour les erreurs
2. Vérifier que tous les composants sont bien importés
3. Redémarrer le serveur

---

## ✅ Validation Finale

Si tous les tests passent :

```
✅ Module Maintenance v1.2.4 : FONCTIONNEL
✅ Prêt pour utilisation en production
✅ Tests utilisateurs recommandés
```

---

## 📞 Support

Si un test échoue :
1. Consulter la console navigateur (F12)
2. Consulter les logs du serveur
3. Consulter `GUIDE_AUDIT_COMPLET.md`
4. Consulter `RAPPORT_AUDIT_MAINTENANCE.md`

---

**Temps total estimé :** 5-10 minutes  
**Difficulté :** Facile  
**Statut :** Tests rapides

