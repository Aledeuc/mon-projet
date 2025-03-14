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

## Captures d'écran

*(Des captures d'écran de l'application seront ajoutées ici)*

## Technologies utilisées

- **React Native / Expo** : Framework pour le développement d'applications mobiles cross-platform
- **TypeScript** : Typage statique pour une meilleure maintenabilité du code
- **Expo Router** : Système de navigation basé sur des fichiers
- **AsyncStorage** : Stockage local des données sur l'appareil
- **Lucide Icons** : Bibliothèque d'icônes pour l'interface utilisateur

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
npm install
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

## Guide de développement

### Structure du projet

- **/app** : Contient les routes/écrans principaux de l'application
  - **(tabs)** : Organisation des onglets de navigation
  - **flight-details.tsx** : Écran de détails d'un vol
  - **edit-flight.tsx** : Écran de modification d'un vol

- **/components** : Composants réutilisables 
  - **AirportInput.tsx** : Composant pour la sélection des aéroports

- **/assets** : Ressources statiques (images, etc.)

### Scripts disponibles

- `npm run dev` ou `yarn dev` : Lance le serveur de développement Expo
- `npm run build:web` ou `yarn build:web` : Exporte l'application pour le web
- `npm run android` ou `yarn android` : Lance l'application sur un appareil/émulateur Android
- `npm run ios` ou `yarn ios` : Lance l'application sur un appareil/émulateur iOS

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

- [ ] Ajout de statistiques sur les vols (distance totale parcourue, heures de vol, etc.)
- [ ] Synchronisation avec le cloud pour sauvegarder les données
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
