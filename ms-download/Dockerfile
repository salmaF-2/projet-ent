# 1. Use a slim Python image to keep the size small
FROM python:3.8-slim

# 2. Set the internal directory for your code
WORKDIR /app

# 3. Copy only the small requirements.txt first
COPY requirements.txt .

# 4. Install only the necessary libraries
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy your main.py and any other files
COPY . .

# 6. Open the port for FastAPI
EXPOSE 8000

# 7. Start the API with the specific flags that fixed your errors
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--loop", "asyncio", "--ws", "none"]
