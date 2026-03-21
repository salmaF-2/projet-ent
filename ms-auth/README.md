# Auth Microservice

Authentication microservice for the ENT platform.

## Technologies
- FastAPI
- Keycloak
- Python
- Uvicorn

## Run the project

Activate environment:

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Start the server:

uvicorn app.main:app --host 0.0.0.0 --port 8000

## Test

curl http://localhost:8000
