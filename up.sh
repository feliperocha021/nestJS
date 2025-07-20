#!/bin/bash
echo "🔼 Subindo ambiente NestJS + PostgreSQL + MongoDB..."
docker compose --env-file .env.development.local up --build -d
