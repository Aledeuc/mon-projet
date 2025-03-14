# Mon Projet

## Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

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

## Configuration

1. Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```

2. Remplissez le fichier `.env` avec vos propres identifiants :
- `GOOGLE_CLIENT_ID` : Votre ID client Google OAuth
- `GOOGLE_REDIRECT_URI` : L'URI de redirection pour l'authentification Google

⚠️ **Important** : 
- Ne partagez jamais votre fichier `.env` réel
- Le fichier `.env` est ignoré par Git pour des raisons de sécurité

## Lancement de l'application

```bash
npm run dev
# ou
yarn dev
```

## Fonctionnalités
- Synchronisation avec Google Sheets
- Mode sombre/clair
- Configuration multi-plateforme

## Licence
MIT
