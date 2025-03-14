# Flight Logger

## Description

Flight Logger est une application mobile permettant aux utilisateurs d'enregistrer et de suivre leurs vols. Conçue spécialement pour les pilotes, les passionnés d'aviation ou tout voyageur souhaitant garder une trace détaillée de ses déplacements aériens.

L'application offre une interface intuitive et élégante pour documenter tous les aspects de vos vols, des informations de base comme les aéroports et les horaires, jusqu'aux détails techniques comme le modèle d'avion et l'immatriculation.

## Fonctionnalités

- **Enregistrement de vols** : Ajoutez facilement de nouveaux vols avec tous les détails pertinents
- **Suivi des vols aller-retour** : Liez les vols d'un même voyage avec identification claire de l'aller et du retour
- **Détails complets** : Enregistrez les informations essentielles de chaque vol
  - Aéroports de départ et d'arrivée (codes IATA)
  - Date et heures de départ/arrivée
  - Durée du vol
  - Immatriculation et modèle de l'appareil
  - Informations sur l'équipage
- **Interface utilisateur intuitive** : Navigation simple entre les différentes sections de l'application
- **Stockage local** : Toutes les données sont stockées localement sur votre appareil
- **Thème clair/sombre** : Support des modes clair et sombre avec option de suivre les paramètres système
- **Synchronisation Google Sheets** : Exportez vos données de vol vers Google Sheets pour analyse et sauvegarde

## Captures d'écran

*(Des captures d'écran de l'application seront ajoutées ici)*

## Technologies utilisées

- **React Native / Expo** : Framework pour le développement d'applications mobiles cross-platform
- **TypeScript** : Typage statique pour une meilleure maintenabilité du code
- **Expo Router** : Système de navigation basé sur des fichiers
- **AsyncStorage** : Stockage local des données sur l'appareil
- **Lucide Icons** : Bibliothèque d'icônes pour l'interface utilisateur
- **Jest** : Framework de test pour les tests unitaires et d'intégration
- **ESLint & Prettier** : Outils pour maintenir un code propre et cohérent
- **Google Sheets API** : Synchronisation des données avec Google Sheets

## Prérequis

- Node.js (v14.0 ou supérieur)
- npm ou yarn
- Expo CLI
- Un téléphone mobile ou un émulateur pour tester l'application

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/Aledeuc/mon-projet.git
cd mon-projet
```

2. Installez les dépendances :
```bash
npm install --legacy-peer-deps
# ou
yarn install
```

3. Lancez l'application :
```bash
npm run dev
# ou
yarn dev
```

4. Scannez le code QR avec l'application Expo Go sur votre téléphone ou utilisez un émulateur.

## Configuration de Google Sheets

Pour utiliser la fonctionnalité de synchronisation avec Google Sheets, vous devez configurer les identifiants OAuth2 pour l'API Google Sheets :

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet
3. Activez l'API Google Sheets et l'API Google Drive
4. Configurez l'écran de consentement OAuth
5. Créez des identifiants OAuth2 pour une application Android/iOS
6. Remplacez `YOUR_GOOGLE_CLIENT_ID` dans `services/GoogleSheetsService.ts` par votre ID client

## Guide de développement

### Structure du projet

- **/app** : Contient les routes/écrans principaux de l'application
  - **(tabs)** : Organisation des onglets de navigation
  - **flight-details.tsx** : Écran de détails d'un vol
  - **edit-flight.tsx** : Écran de modification d'un vol
  - **settings.tsx** : Écran des paramètres de l'application

- **/components** : Composants réutilisables 
  - **AirportInput.tsx** : Composant pour la sélection des aéroports
  - **ThemeSelector.tsx** : Composant pour changer le thème de l'application
  - **GoogleSheetsSync.tsx** : Composant pour la synchronisation avec Google Sheets

- **/theme** : Configuration du système de thèmes
  - **colors.ts** : Définitions des couleurs pour les thèmes clair et sombre
  - **ThemeContext.tsx** : Contexte React pour gérer l'état du thème

- **/services** : Services et API
  - **GoogleSheetsService.ts** : Service pour l'intégration avec Google Sheets

- **/assets** : Ressources statiques (images, etc.)

- **/__tests__** : Tests unitaires et d'intégration

### Scripts disponibles

- `npm run dev` ou `yarn dev` : Lance le serveur de développement Expo
- `npm run build:web` ou `yarn build:web` : Exporte l'application pour le web
- `npm run lint` ou `yarn lint` : Vérifie le code avec ESLint
- `npm run lint:fix` ou `yarn lint:fix` : Corrige automatiquement les problèmes de linting
- `npm run format` ou `yarn format` : Formate le code avec Prettier
- `npm run test` ou `yarn test` : Lance les tests avec Jest
- `npm run android` ou `yarn android` : Lance l'application sur un appareil/émulateur Android
- `npm run ios` ou `yarn ios` : Lance l'application sur un appareil/émulateur iOS

## Tests

L'application utilise Jest pour les tests unitaires et d'intégration. Pour exécuter les tests :

```bash
npm run test
# ou
yarn test
```

Pour voir la couverture des tests :

```bash
npm run test:coverage
# ou
yarn test:coverage
```

## Gestion du code

Le projet utilise ESLint et Prettier pour maintenir un code propre et cohérent :

- ESLint vérifie la qualité du code et applique les bonnes pratiques
- Prettier formate automatiquement le code selon des règles prédéfinies

Pour vérifier et formater votre code :

```bash
# Vérification avec ESLint
npm run lint

# Correction automatique des problèmes détectés par ESLint
npm run lint:fix

# Formatage du code avec Prettier
npm run format
```

## Système de thèmes

L'application prend en charge les thèmes clair et sombre :

- **Thème clair** : Design lumineux pour une utilisation diurne
- **Thème sombre** : Design sombre pour réduire la fatigue oculaire
- **Système** : Suit automatiquement les préférences de l'appareil

Pour changer de thème, accédez à l'écran des paramètres depuis la barre de navigation.

## Synchronisation Google Sheets

L'application permet de synchroniser vos données de vol avec Google Sheets pour analyse et sauvegarde :

- **Connexion à Google** : Connectez-vous à votre compte Google via OAuth2
- **Création de feuille** : Créez une nouvelle feuille Google Sheets dédiée
- **Utilisation d'une feuille existante** : Spécifiez l'ID d'une feuille existante
- **Synchronisation** : Exportez toutes vos données de vol vers Google Sheets

Pour utiliser cette fonctionnalité :
1. Accédez à l'écran "Paramètres"
2. Dans la section "Synchronisation", connectez-vous à Google
3. Créez une nouvelle feuille ou spécifiez l'ID d'une feuille existante
4. Cliquez sur "Synchroniser maintenant" pour exporter vos données

## Déploiement

### Android
Pour créer un APK ou un bundle AAB pour Google Play Store :
```bash
expo build:android
```

### iOS
Pour créer un build iOS pour l'App Store :
```bash
expo build:ios
```

## Feuille de route

- [x] Ajout du support des thèmes clair/sombre
- [x] Configuration du système de tests avec Jest
- [x] Mise en place de ESLint et Prettier
- [x] Synchronisation des données avec Google Sheets
- [ ] Ajout de statistiques sur les vols (distance totale parcourue, heures de vol, etc.)
- [ ] Mode hors ligne avancé
- [ ] Intégration de cartes pour visualiser les itinéraires de vol
- [ ] Exportation des données de vol au format PDF ou CSV

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

## Contact

Alexandre Le Deuc - [alexandre@ledeuc.fr](mailto:alexandre@ledeuc.fr)

Lien du projet : [https://github.com/Aledeuc/mon-projet](https://github.com/Aledeuc/mon-projet)
