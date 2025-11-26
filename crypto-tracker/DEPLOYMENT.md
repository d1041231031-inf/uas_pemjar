# Deployment Guide

## Deployment ke Railway

Railway adalah platform yang mendukung custom server dengan Socket.IO.

### Step 1: Persiapan

1. Buat account di [Railway](https://railway.app)
2. Install Railway CLI:
```bash
npm install -g @railway/cli
```

### Step 2: Konfigurasi

1. Login ke Railway:
```bash
railway login
```

2. Initialize project:
```bash
railway init
```

3. Link project:
```bash
railway link
```

### Step 3: Environment Variables

Set environment variables di Railway dashboard:
```
NODE_ENV=production
PORT=3000
```

### Step 4: Deploy

```bash
railway up
```

Railway akan otomatis:
- Detect package.json
- Run `npm install`
- Run `npm run build`
- Run `npm start`

### Step 5: Custom Domain (Optional)

1. Buka Railway dashboard
2. Pilih project
3. Settings → Generate Domain
4. Atau add custom domain

---

## Deployment ke Render

### Step 1: Persiapan

1. Buat account di [Render](https://render.com)
2. Connect GitHub repository

### Step 2: Konfigurasi

1. Create New Web Service
2. Select repository
3. Configure:
   - **Name**: crypto-tracker
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Environment Variables

Add di Render dashboard:
```
NODE_ENV=production
```

### Step 4: Deploy

Render akan otomatis deploy setiap push ke GitHub.

---

## Deployment ke VPS (Ubuntu/Debian)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### Step 2: Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd crypto-tracker

# Install dependencies
npm install

# Build aplikasi
npm run build

# Start with PM2
pm2 start npm --name "crypto-tracker" -- start

# Save PM2 config
pm2 save
pm2 startup
```

### Step 3: Nginx Configuration

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/crypto-tracker
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /api/socket {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/crypto-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

---

## Deployment ke Heroku

### Step 1: Persiapan

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

### Step 2: Create App

```bash
# Create app
heroku create crypto-tracker-app

# Set buildpack
heroku buildpacks:set heroku/nodejs
```

### Step 3: Configure

Add `Procfile`:
```
web: npm start
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "next build",
    "start": "NODE_ENV=production tsx server.ts",
    "heroku-postbuild": "npm run build"
  }
}
```

### Step 4: Deploy

```bash
git add .
git commit -m "Configure for Heroku"
git push heroku main
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.ts ./server.ts

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  crypto-tracker:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
```

### Build & Run

```bash
# Build image
docker build -t crypto-tracker .

# Run container
docker run -p 3000:3000 crypto-tracker

# Or with Docker Compose
docker-compose up -d
```

---

## Environment Variables Checklist

### Required
- `NODE_ENV` - production
- `PORT` - 3000 (or your preferred port)

### Optional
- `COINGECKO_API_KEY` - For premium CoinGecko API
- `NEXT_PUBLIC_APP_URL` - Your app URL
- `SOCKET_PATH` - Custom socket path
- `SOCKET_CORS_ORIGIN` - CORS origin for Socket.IO

---

## Post-Deployment Checks

1. **Health Check**
```bash
curl https://your-domain.com/api/crypto
```

2. **WebSocket Test**
- Open browser console
- Check for "WebSocket connected"
- Verify price updates every 10s

3. **Performance Check**
- Use Google Lighthouse
- Check Core Web Vitals
- Monitor response times

4. **SSL/HTTPS**
- Verify SSL certificate
- Check for mixed content warnings
- Test on different browsers

---

## Monitoring & Logs

### PM2 Monitoring

```bash
# View logs
pm2 logs crypto-tracker

# Monitor
pm2 monit

# Restart
pm2 restart crypto-tracker
```

### Railway Logs

```bash
railway logs
```

### Render Logs

Available in Render dashboard.

### Docker Logs

```bash
docker logs <container-id>
docker logs -f <container-id>  # Follow logs
```

---

## Troubleshooting

### Issue: WebSocket not working in production

**Solution:**
- Check CORS settings in `lib/socket.ts`
- Verify proxy configuration (Nginx/Apache)
- Ensure WebSocket upgrade headers are passed

### Issue: Build fails

**Solution:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Issue: High memory usage

**Solution:**
- Increase server memory
- Optimize React components
- Implement caching
- Reduce update interval

---

## Scaling

### Horizontal Scaling with Redis

Install Redis adapter:
```bash
npm install @socket.io/redis-adapter redis
```

Update `lib/socket.ts`:
```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

---

## Backup & Recovery

### Database (if using)
```bash
# Not applicable - this app uses external API
```

### Configuration Backup
```bash
# Backup environment variables
cp .env .env.backup

# Backup PM2 config
pm2 save
```

---

## Cost Estimation

### Railway
- **Free Tier**: $5 free credit/month
- **Paid**: ~$5-10/month

### Render
- **Free Tier**: Available with limitations
- **Paid**: ~$7/month

### VPS (DigitalOcean/Linode)
- **Basic**: $5-12/month
- **Standard**: $12-24/month

### Heroku
- **Free Tier**: Deprecated
- **Paid**: ~$7/month

---

**Choose deployment platform based on:**
- Budget
- Traffic expectations
- Technical requirements
- Scaling needs
