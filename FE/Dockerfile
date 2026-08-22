# ===== BUILD STAGE =====
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy toàn bộ source
COPY . .

# QUAN TRỌNG: VITE_* phải truyền vào lúc build
# RainbowKit cần VITE_WALLET_CONNECT_PROJECT_ID
ARG VITE_API_BASE_URL
ARG VITE_WALLET_CONNECT_PROJECT_ID

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WALLET_CONNECT_PROJECT_ID=$VITE_WALLET_CONNECT_PROJECT_ID

RUN npm run build

# ===== PRODUCTION STAGE — Nginx serve static =====
FROM nginx:alpine AS production

# Copy file build từ stage trước
COPY --from=builder /app/dist /usr/share/nginx/html

# Config Nginx để handle React Router (SPA)
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
