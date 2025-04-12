echo "Generating database client..."
docker compose exec app pnpm db:generate

echo "Pushing schema to database..."
docker compose exec app pnpm db:push

echo "Seeding database with initial data..."
docker compose exec app pnpm db:seed