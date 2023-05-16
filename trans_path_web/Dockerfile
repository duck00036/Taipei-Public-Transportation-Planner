FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY find_path.py .env /app/

CMD ["uvicorn", "find_path:app", "--host", "0.0.0.0", "--port", "8000"]