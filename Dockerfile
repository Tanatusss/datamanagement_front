# -------- deps --------
FROM node:22-alpine AS deps
WORKDIR /app

# ใช้ corepack สำหรับ pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# -------- builder --------
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# build
RUN pnpm build

# -------- runner --------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# เอาเฉพาะไฟล์ที่ต้องใช้ตอนรัน (standalone output)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Next standalone จะมี server.js
CMD ["node", "server.js"]
