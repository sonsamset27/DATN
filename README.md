# Digital Credential Network

Hệ thống quản lý và xác minh chứng chỉ số phi tập trung, xây dựng trên nền tảng Blockchain Ethereum (Sepolia Testnet). Người dùng đăng nhập bằng ví tiền mã hóa (không cần tài khoản/mật khẩu), chứng chỉ được cấp phát thông qua Smart Contract và metadata lưu trên IPFS — đảm bảo tính minh bạch và không thể làm giả.

Hệ thống đang chạy live tại:
- Giao diện người dùng: https://credential.dcsystem.space
- API Backend: https://api.credential.dcsystem.space
- Tài liệu API (Swagger): https://api.credential.dcsystem.space/api-docs

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3. [Yêu cầu môi trường](#3-yêu-cầu-môi-trường)
4. [Cấu trúc thư mục dự án](#4-cấu-trúc-thư-mục-dự-án)
5. [Bước 1 — Deploy Smart Contract lên Sepolia](#5-bước-1--deploy-smart-contract-lên-sepolia)
6. [Bước 2 — Khởi chạy Backend](#6-bước-2--khởi-chạy-backend)
7. [Bước 3 — Khởi chạy Frontend](#7-bước-3--khởi-chạy-frontend)
8. [Triển khai bằng Docker](#8-triển-khai-bằng-docker)
9. [CI/CD Pipeline (GitHub Actions)](#9-cicd-pipeline-github-actions)
10. [Hướng dẫn kiểm thử và phản biện](#10-hướng-dẫn-kiểm-thử-và-phản-biện)

---

## 1. Tổng quan kiến trúc

Hệ thống gồm ba thành phần chính hoạt động độc lập:

```
Trình duyệt người dùng
  └── Frontend (React + Vite, phục vụ bởi Nginx)
        ├── Kết nối ví MetaMask qua Wagmi + RainbowKit
        └── Gọi API về Backend qua HTTP

Backend (Node.js + Express, Port 3333)
  ├── Xác thực người dùng bằng chữ ký Ethereum (SIWE)
  ├── Lưu trữ dữ liệu vào MongoDB
  ├── Gọi Smart Contract trên Sepolia qua ethers.js + RPC
  └── Upload metadata chứng chỉ lên IPFS qua Pinata SDK

Blockchain (Ethereum Sepolia Testnet)
  ├── DIDRegistry.sol       — Đăng ký và quản lý định danh (DID)
  └── CredentialRegistry.sol — Cấp phát, thu hồi và xác minh chứng chỉ
```

Luồng đăng nhập chính (Sign-In with Ethereum):
1. Frontend gọi `POST /api/v1/auth/challenge` — Backend tạo nonce và trả về message cần ký.
2. Người dùng ký message bằng ví MetaMask (giao dịch off-chain, không tốn phí gas).
3. Frontend gửi chữ ký lên `POST /api/v1/auth/login` — Backend dùng ethers.js khôi phục địa chỉ ví từ chữ ký, xác minh khớp, trả về JWT.

---

## 2. Công nghệ sử dụng

**Frontend**

- React 19, Vite 8 — UI framework và build tool
- Wagmi 2, viem 2 — thư viện React hooks và low-level interface để tương tác Ethereum
- RainbowKit 2 — giao diện kết nối ví (MetaMask, WalletConnect...)
- ethers.js 6 — ký và gửi giao dịch phía client
- TailwindCSS 4 — styling
- Zustand 5, TanStack Query 5 — quản lý state và caching dữ liệu server
- Axios 1 — HTTP client gọi API
- Framer Motion 12 — animation

**Backend**

- Node.js 20, Express 5 — runtime và web framework
- Mongoose 9 — ODM kết nối MongoDB
- ethers.js 6 — tương tác Smart Contract và xác minh chữ ký phía server
- jsonwebtoken 9 — phát hành và xác minh JWT
- Pinata SDK 2 — lưu trữ metadata chứng chỉ lên IPFS
- Morgan, Helmet, compression — logging, bảo mật header, nén response
- node-cron — chạy tác vụ định kỳ (VD: kiểm tra chứng chỉ hết hạn)

**Blockchain và Smart Contract**

- Solidity 0.8.28 — ngôn ngữ viết Smart Contract
- Hardhat — framework biên dịch, test và deploy
- Ethereum Sepolia Testnet — mạng blockchain công khai dùng để thử nghiệm

**Hạ tầng**

- Docker, Nginx — đóng gói và phục vụ ứng dụng
- GitHub Actions — CI/CD tự động
- GitHub Container Registry (ghcr.io) — lưu Docker image
- MongoDB (local hoặc Atlas), IPFS (Pinata Cloud)

---

## 3. Yêu cầu môi trường

Trước khi bắt đầu, cài đặt các công cụ sau:

**Node.js v20 (LTS)**
Tải tại https://nodejs.org. Kiểm tra bằng `node -v` — phải ra `v20.x.x`.

**MongoDB**
Có thể chạy local (port 27017) hoặc dùng MongoDB Atlas (miễn phí). Nếu dùng Atlas, tạo cluster tại https://cloud.mongodb.com và lấy Connection String.

**MetaMask**
Cài extension trên Chrome/Edge/Brave tại https://metamask.io. Sau khi cài, vào Settings để thêm mạng Sepolia nếu chưa có, và lấy Sepolia ETH test miễn phí tại https://sepoliafaucet.com.

**Infura hoặc Alchemy (RPC Provider)**
Đăng ký tại https://infura.io hoặc https://alchemy.com, tạo project chọn mạng Sepolia, lấy URL dạng `https://sepolia.infura.io/v3/YOUR_KEY`. URL này để Backend và Hardhat kết nối vào Blockchain.

**Pinata (IPFS)**
Đăng ký tại https://pinata.cloud. Vào mục API Keys, tạo key mới và lưu lại ba giá trị: API Key, API Secret, JWT.

**WalletConnect Project ID**
Đăng ký tại https://cloud.walletconnect.com, tạo project, lấy Project ID. Cần thiết để RainbowKit hiện bộ chọn ví.

**Git**
Tải tại https://git-scm.com.

---

## 4. Cấu trúc thư mục dự án

```
DATN/
├── BE/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                 # Xác thực SIWE: tạo challenge, xác minh chữ ký
│   │   │   ├── users/                # Quản lý tài khoản, phân quyền ADMIN/ISSUER/HOLDER
│   │   │   ├── dids/                 # Chuẩn bị và đăng ký DID lên blockchain
│   │   │   ├── credential/           # Cấp phát, thu hồi, xác minh chứng chỉ
│   │   │   ├── credentialTemplates/  # Quản lý mẫu chứng chỉ
│   │   │   └── auditLog/             # Ghi lại lịch sử thao tác hệ thống
│   │   ├── configs/                  # env.js, db.js, swagger.js
│   │   └── shared/                   # Middleware, error classes, blockchain service dùng chung
│   ├── .env.example                  # Mẫu biến môi trường — sao chép thành .env trước khi chạy
│   ├── Dockerfile
│   └── package.json
│
├── FE/
│   ├── src/
│   │   ├── features/                 # Từng tính năng: auth, did, credential...
│   │   └── lib/
│   │       ├── axios.js              # HTTP client với interceptor tự động gắn JWT và bắt lỗi 401
│   │       └── wagmi.js              # Cấu hình RainbowKit + Wagmi (chains, projectId)
│   ├── nginx-spa.conf                # Cấu hình Nginx cho React Router (trả index.html cho mọi route)
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── SmartContract/
│   ├── contracts/
│   │   ├── DIDRegistry.sol           # Hợp đồng quản lý định danh
│   │   └── CredentialRegistry.sol    # Hợp đồng cấp phát và thu hồi chứng chỉ
│   ├── scripts/
│   │   ├── deploy.js                 # Deploy cả hai contract lần đầu
│   │   └── deployCredential.js       # Chỉ deploy lại CredentialRegistry, giữ DIDRegistry cũ
│   ├── test/
│   ├── hardhat.config.ts
│   └── .env
│
└── .github/
    └── workflows/
        └── deploy.yml                # CI/CD: Lint → Build Docker → Deploy VPS → Smoke Test
```

---

## 5. Bước 1 — Deploy Smart Contract lên Sepolia

Bước này chỉ thực hiện một lần. Nếu bạn dùng hệ thống đang chạy ở môi trường production đã có sẵn thì có thể bỏ qua.

```bash
cd SmartContract
npm install
```

Tạo file `.env` trong thư mục `SmartContract/`:

```env
# Private key của ví Ethereum có Sepolia ETH để trả phí gas khi deploy
# Lấy trong MetaMask: Settings > Security & Privacy > Export Private Key
SEPOLIA_PRIVATE_KEY=0x_private_key_cua_vi_ban

# RPC URL của Sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_key
```

Biên dịch Smart Contract:

```bash
npx hardhat compile
```

Terminal in `Compilation finished successfully` là thành công.

Deploy lên Sepolia (lần đầu — deploy cả hai contract):

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Kết quả in ra terminal:

```
Deploying DIDRegistry...
DIDRegistry: 0xDf984bd126fbAc373064CeE56bC0AF3b741A29B0
Deploying CredentialRegistry...
CredentialRegistry: 0x...
Deployment completed
```

**Lưu lại hai địa chỉ contract này** — cần điền vào file `.env` của Backend ở bước tiếp theo.

Trường hợp chỉ cần deploy lại `CredentialRegistry` mà giữ nguyên `DIDRegistry` cũ (VD: cập nhật logic cấp chứng chỉ), mở file `scripts/deployCredential.js`, cập nhật địa chỉ DIDRegistry cũ ở dòng 13, rồi chạy:

```bash
npx hardhat run scripts/deployCredential.js --network sepolia
```

---

## 6. Bước 2 — Khởi chạy Backend

```bash
cd BE
npm install
```

Sao chép file cấu hình môi trường:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Mở file `.env` vừa tạo và điền đầy đủ:

```env
# Môi trường: development hoặc production
# Ở development, Morgan in log theo format ngắn gọn hơn
NODE_ENV=development

# Cổng mà Backend lắng nghe
PORT=3333

# Chuỗi kết nối MongoDB
# Nếu chạy local: mongodb://127.0.0.1:27017/digital_credential_db
# Nếu dùng Atlas: mongodb+srv://user:password@cluster.mongodb.net/dbname
MONGO_URI=mongodb://127.0.0.1:27017/digital_credential_db

# RPC URL để kết nối vào Sepolia (giống như đã dùng khi deploy contract)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key

# Private key của ví Backend — ví này dùng để ký giao dịch blockchain phía server
# Đây là ví riêng của ứng dụng, không nên dùng chung với ví deploy ở Bước 1
SEPOLIA_PRIVATE_KEY=0x_private_key_vi_backend

# Địa chỉ hai Smart Contract đã deploy ở Bước 1
SEPOLIA_DID_CONTRACT_ADDRESS=0xDf984bd126fbAc373064CeE56bC0AF3b741A29B0
SEPOLIA_CREDENTIAL_CONTRACT_ADDRESS=0x_dia_chi_credential_registry

# Khóa bí mật để ký JWT — nên là chuỗi ngẫu nhiên dài ít nhất 32 ký tự
JWT_SECRET=random_string_it_nhat_32_ky_tu_khong_de_doan
JWT_EXPIRES_IN=7d

# Thông tin Pinata để upload metadata chứng chỉ lên IPFS
# Lấy tại pinata.cloud > API Keys > New Key
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY_URL=https://gateway.pinata.cloud
```

Khởi chạy:

```bash
npm run dev
```

Backend khởi động thành công khi terminal in đủ ba dòng:

```
MongoDB Connected
Blockchain Connected
Server is running on port 3333
```

Nếu có lỗi, terminal sẽ in chi tiết tên file và dòng xảy ra lỗi, ví dụ:
```
Error at getLogs:  Error: connect ECONNREFUSED 127.0.0.1:27017
    at auditLog.controller.js:25
```
Nghĩa là MongoDB chưa được khởi động.

---

## 7. Bước 3 — Khởi chạy Frontend

Mở terminal mới, giữ nguyên terminal Backend đang chạy.

```bash
cd FE
```

Cài thư viện:

```bash
npm install --legacy-peer-deps
```

Lý do phải thêm `--legacy-peer-deps`: Wagmi v2 và RainbowKit v2 có một số xung đột `peerDependencies` với React 19. Flag này bỏ qua bước kiểm tra xung đột và cài đặt bình thường. Không có flag này thì npm báo lỗi `ERESOLVE` ngay lập tức.

Sao chép file cấu hình:

```bash
copy .env.example .env
```

Nội dung file `.env`:

```env
# URL đầy đủ của Backend API, bao gồm prefix /api/v1
VITE_API_BASE_URL=http://localhost:3333/api/v1

# Project ID của WalletConnect — bắt buộc để bộ chọn ví hoạt động
# Lấy tại cloud.walletconnect.com > New Project > Copy Project ID
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

Lưu ý về biến `VITE_*`: Khác với Backend, các biến này không được đọc lúc ứng dụng chạy. Vite sẽ nhúng trực tiếp giá trị của chúng vào trong file JavaScript khi chạy lệnh build. Vì vậy ở môi trường dev chỉ cần thiết lập trong `.env` là đủ, nhưng khi build Docker cho production phải truyền vào qua `--build-arg` (xem Bước 8).

Khởi chạy:

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`.

Để đăng nhập:
1. MetaMask phải chọn mạng Sepolia Testnet (không phải Mainnet hay Localhost).
2. Bấm "Connect Wallet", chọn MetaMask, xác nhận kết nối.
3. Bấm "Sign In", ký message trong MetaMask (không tốn phí gas).

---

## 8. Triển khai bằng Docker

**Build thủ công (không qua CI/CD):**

```bash
# Backend
cd BE
docker build -t datn-be .

# Frontend — biến Vite phải truyền tại thời điểm build, không phải lúc chạy container
cd FE
docker build \
  --build-arg VITE_API_BASE_URL=https://api.credential.dcsystem.space/api/v1 \
  --build-arg VITE_WALLET_CONNECT_PROJECT_ID=your_project_id \
  -t datn-fe .
```

**Ví dụ docker-compose.yml trên VPS:**

```yaml
services:
  backend:
    image: ghcr.io/your_github_username/datn-be:latest
    container_name: datn_backend
    restart: unless-stopped
    ports:
      - "3333:3333"
    env_file:
      - .env.be
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3333/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: ghcr.io/your_github_username/datn-fe:latest
    container_name: datn_frontend
    restart: unless-stopped
    ports:
      - "80:80"
```

Khởi động:

```bash
docker compose up -d
```

Kiểm tra log Backend:

```bash
docker logs datn_backend -f
```

---

## 9. CI/CD Pipeline (GitHub Actions)

Mỗi lần push lên nhánh `main`, pipeline tại `.github/workflows/deploy.yml` chạy tự động theo bốn giai đoạn tuần tự:

**Giai đoạn 1 — Kiểm tra chất lượng code (Lint)**
Cài thư viện FE và chạy `oxlint`. Nếu chỉ có cảnh báo (warning) thì vẫn cho pipeline chạy tiếp, không bị block.

**Giai đoạn 2 — Build và đẩy Docker image**
Build hai image (BE và FE) song song, đẩy lên GitHub Container Registry (ghcr.io). Khi build image FE, các biến `VITE_*` được truyền vào qua `--build-arg` và nhúng cứng vào trong file JS tĩnh ở thư mục `dist/`.

**Giai đoạn 3 — Deploy lên VPS**
SSH vào VPS, chạy `docker compose pull` để kéo image mới về, sau đó `docker compose up -d` để khởi động lại container. Pipeline chờ tối đa 60 giây để container backend đạt trạng thái healthy. Nếu quá thời gian thì in log lỗi và dừng pipeline.

**Giai đoạn 4 — Smoke Test**
Gọi HTTP đến domain production và kiểm tra response HTTP 200. Nếu backend hoặc frontend không phản hồi đúng thì pipeline báo failed để thông báo cần xử lý.

**Secrets cần cấu hình trên GitHub** (tại Settings > Secrets and variables > Actions):

| Tên Secret | Giá trị |
|---|---|
| VPS_HOST | IP hoặc domain của VPS |
| VPS_USER | Username SSH (thường là root hoặc ubuntu) |
| VPS_SSH_KEY | Nội dung file private key SSH (~/.ssh/id_rsa) |
| VITE_WALLET_CONNECT_PROJECT_ID | Project ID lấy từ cloud.walletconnect.com |

---

## 10. Hướng dẫn kiểm thử và phản biện

**Kiểm thử nhanh không cần cài gì**

Truy cập trực tiếp phiên bản production: https://credential.dcsystem.space

Yêu cầu tối thiểu:
- Trình duyệt có MetaMask extension, chọn mạng Sepolia Testnet
- Nếu ví chưa có ETH Sepolia, lấy miễn phí tại https://sepoliafaucet.com

**Xem tài liệu API**

Swagger UI đầy đủ với tất cả endpoint, request/response schema, error code:
https://api.credential.dcsystem.space/api-docs

**Xác minh Smart Contract trên Blockchain**

Tra địa chỉ contract trên Sepolia Etherscan để xem mã bytecode, ABI, và lịch sử giao dịch:
https://sepolia.etherscan.io

Lưu ý khi chạy local:
- Phải giữ cả hai terminal (Backend và Frontend) chạy cùng lúc.
- Khi thay đổi file `.env` phải khởi động lại server.
- Nếu muốn đăng nhập lại tài khoản khác, xóa `accessToken` trong localStorage của trình duyệt.
