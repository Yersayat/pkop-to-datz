# NPZ API — Crude Supply (Endpoint 3.4.1)

REST-сервис для публикации данных НПЗ. Реализован эндпоинт:
- `GET /api/v1/crude-supply/daily?date=YYYY-MM-DD&plant_id=<ID>`

## Требования
- Node.js 20
- Docker / docker-compose

## Быстрый старт (Docker)
```bash
cp .env.example .env
docker-compose up --build
