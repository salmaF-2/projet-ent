# Microservice Administration (M4)

## 🎯 Rôle
Gestion des utilisateurs de l'ENT (Création, modification, suppression)
Authentification requise avec token JWT (admin uniquement)

## 📡 API Endpoints

### Routes publiques
- `GET /` - Informations sur le service
- `GET /health` - Health check

### Routes admin (nécessitent token admin)
- `GET /admin/users` - Liste tous les utilisateurs
  - Option: `?role=teacher` pour filtrer
- `GET /admin/users/{user_id}` - Détail d'un utilisateur
- `POST /admin/users` - Crée un utilisateur
  - Paramètres: `username`, `email`, `full_name`, `role`
- `PUT /admin/users/{user_id}` - Met à jour un utilisateur
- `DELETE /admin/users/{user_id}` - Supprime un utilisateur
- `GET /admin/stats` - Statistiques
- `GET /admin/check-username/{username}` - Vérifie disponibilité
- `GET /admin/check-email/{email}` - Vérifie disponibilité

## 🔐 Authentification
Tokens factices pour développement:
- `admin-token` → Rôle admin
- `teacher-token` → Rôle teacher  
- `student-token` → Rôle student

## 🚀 Démarrage rapide

```bash
# 1. Créer le réseau pour communication entre les conteneurs:
docker network create ent-network

# 2. Lancer Cassandra
docker run -d --name ent-cassandra -p 9042:9042 --network ent-network cassandra:latest

# 3. Lancer le service
cd ~/projet-ent/ms-admin
docker run -d --name ms-admin -p 8004:8000 -v $(pwd):/app -w /app --network ent-network python:3.10-slim sh -c "pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
