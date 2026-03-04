# Microservice Chatbot (M4) avec Ollama - Routes publiques et privées

## 📋 Description
Microservice pour le chatbot IA utilisant Ollama avec deux niveaux d'accès :
- **🔓 PUBLIC** : Accessible sans authentification (pour les visiteurs)
- **🔒 PRIVÉ** : Nécessite un token JWT (pour les utilisateurs connectés)

## 🏗️ Architecture
- **FastAPI** : Framework web
- **Ollama** : Moteur d'IA (Llama 3)
- **Docker** : Conteneurisation
- **JWT mock** : Authentification (en attendant M1)

## 📡 Endpoints API

### 🔓 Routes PUBLIQUES (sans token)
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/` | Informations service |
| GET | `/health` | Health check simple |
| GET | `/chat/health` | Vérification connexion Ollama |
| POST | `/chat/public/ask` | Pose une question (public) |
| GET | `/chat/models` | Liste modèles (version publique) |

### 🔒 Routes PRIVÉES (avec token)
| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/chat/ask` | Pose une question (avec contexte) |
| GET | `/chat/models` | Liste modèles (version détaillée) |
| GET | `/chat/history` | Historique (à implémenter) |

## 🔑 Tokens de test
- `admin-token` → Rôle admin
- `teacher-token` → Rôle teacher
- `student-token` → Rôle student

## 🚀 Installation et Démarrage

### 1. Lancer Ollama
```bash
docker run -d \
  --name ent-ollama \
  -p 11434:11434 \
  -v ~/projet-ent/data/ollama:/root/.ollama \
  --network ent-network \
  ollama/ollama

# Télécharger le modèle
docker exec ent-ollama ollama pull llama3.2:3b
