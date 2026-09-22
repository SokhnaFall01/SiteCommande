# --- Étape build ---
FROM node:22-alpine AS builder
# OpenSSL + libc6-compat requis par les moteurs Prisma sur Alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# --ignore-scripts : n'exécute PAS "postinstall" (prisma generate) maintenant,
# car le schéma n'est copié qu'ensuite. La génération se fait dans "npm run build".
RUN npm ci --ignore-scripts || npm install --ignore-scripts
COPY . .
# "npm run build" fait "prisma generate && next build"
RUN npm run build

# --- Étape run ---
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start"]
