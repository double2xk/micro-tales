# db-init.Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm i -g pnpm && pnpm install

CMD ["pnpm", "db:init"]
