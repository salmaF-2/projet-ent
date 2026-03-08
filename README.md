# ENT EST Salé – Frontend React

## Description
Interface frontend React pour l'Espace Numérique de Travail (ENT) de l'EST Salé.

## Fonctionnalités
- 🔐 Authentification (3 rôles : Étudiant, Enseignant, Admin)
- 🏠 Tableau de bord avec statistiques
- 📚 Catalogue des cours avec téléchargement de fichiers
- 📊 Relevé de notes interactif
- 📅 Emploi du temps hebdomadaire
- ✉️ Messagerie interne
- 🤖 Assistant IA (Ollama + Llama 3)

## Lancement en local

### Option 1 : npm (développement)
```bash
npm install --legacy-peer-deps
npm start
# → http://localhost:3000
```

### Option 2 : Docker Desktop
```bash
# Build et lancement
docker-compose up --build

# Accéder à l'app
# → http://localhost:3000
```

### Option 3 : Docker seul
```bash
docker build -t est-ent-frontend .
docker run -p 3000:80 est-ent-frontend
```

## Identifiants de test
| Rôle | Mot de passe |
|------|-------------|
| Étudiant / Enseignant / Admin | `est2024` |

## Couleurs
- Bleu principal : `#1a4b8c`
- Vert : `#2d8c4e`
- Or : `#c8a830`
