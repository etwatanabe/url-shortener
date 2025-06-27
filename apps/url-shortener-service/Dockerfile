FROM node:22.17-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY .prettierrc ./
COPY prisma ./prisma
COPY apps ./apps
COPY libs ./libs

RUN npm install
RUN npm run build:url-shortener

FROM node:22.17-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/apps/url-shortener-service/main.js"]
