# ===== DEPENDENCIES STAGE =====
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files (tận dụng layer cache)
COPY package.json package-lock.json ./

# npm ci đảm bảo cài đúng version trong package-lock.json
# --omit=dev bỏ devDependencies (không có devDep trong BE hiện tại nhưng để phòng)
RUN npm ci --omit=dev

# ===== PRODUCTION STAGE =====
FROM node:20-alpine AS production
WORKDIR /app

# Cài wget để healthcheck
RUN apk add --no-cache wget

# Copy dependencies từ stage trước
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src/ ./src/
COPY package.json ./

# Chạy với user non-root (bảo mật)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3333

# Healthcheck nội bộ container
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:3333/ || exit 1

# KHÔNG dùng --watch trong production
CMD ["node", "src/server.js"]
