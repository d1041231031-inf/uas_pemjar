# 🚀 Quick Start Guide

Panduan cepat untuk memulai aplikasi Crypto Tracker.

## Langkah 1: Prerequisites

Pastikan Anda sudah menginstall:
- ✅ Node.js 18.x atau lebih tinggi
- ✅ npm atau yarn
- ✅ Git (optional, untuk version control)

Cek versi:
```bash
node --version  # Harus v18.0.0 atau lebih tinggi
npm --version   # Harus v9.0.0 atau lebih tinggi
```

## Langkah 2: Install Dependencies

```bash
# Masuk ke folder project
cd crypto-tracker

# Install semua dependencies
npm install
```

**Packages yang akan diinstall:**
- Next.js 15 - Framework React
- TypeScript - Type safety
- Tailwind CSS v4 - Styling
- shadcn/ui - UI components
- Socket.IO - WebSocket untuk real-time
- Lucide React - Icons

## Langkah 3: Jalankan Development Server

```bash
npm run dev
```

**Output yang diharapkan:**
```
> crypto-tracker@0.1.0 dev
> tsx watch server.ts

> Ready on http://localhost:3000
```

## Langkah 4: Buka Browser

Buka browser dan akses:
```
http://localhost:3000
```

**Apa yang akan Anda lihat:**
- 📊 Market statistics cards (Total Market Cap, 24h Volume, BTC Dominance, Active Coins)
- 📋 Tabel dengan top 50 cryptocurrency
- 🔍 Search bar untuk filter coins
- 🟢 Badge "Live" menunjukkan WebSocket connected
- 💹 Harga yang update otomatis setiap 10 detik

## Langkah 5: Test Aplikasi

### Test 1: Initial Load
✅ Verifikasi 50 cryptocurrency tampil di tabel

### Test 2: WebSocket Connection
✅ Lihat badge di kanan atas menunjukkan "Live" (hijau)
✅ Buka Developer Console (F12) → Cari "WebSocket connected"

### Test 3: Real-time Updates
✅ Tunggu 10 detik
✅ Perhatikan harga berubah
✅ Lihat animasi warna untuk price changes

### Test 4: Search Functionality
✅ Ketik "bitcoin" di search bar
✅ Tabel akan filter hanya Bitcoin
✅ Clear search untuk melihat semua coins

## Common Issues & Solutions

### Issue 1: Port 3000 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Issue 2: Dependencies Installation Failed

**Error:**
```
npm ERR! code ERESOLVE
```

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue 3: TypeScript Errors

**Error:**
```
Type error: Cannot find module...
```

**Solution:**
```bash
# Restart VS Code
# Or restart TypeScript server in VS Code
# Ctrl+Shift+P → TypeScript: Restart TS Server
```

### Issue 4: WebSocket Not Connecting

**Symptoms:**
- Badge shows "Disconnected" (red)
- No price updates
- Console shows connection errors

**Solution:**
1. Check if server is running (`npm run dev`)
2. Refresh browser page
3. Check browser console for errors
4. Verify port 3000 is not blocked by firewall

## Project Structure Overview

```
crypto-tracker/
├── app/
│   ├── api/crypto/          # API endpoints
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── CryptoTable.tsx      # Main table
│   └── MarketStats.tsx      # Stats cards
├── hooks/
│   └── useWebSocket.ts      # WebSocket hook
├── lib/
│   ├── coingecko.ts         # API functions
│   └── socket.ts            # Socket.IO server
├── types/
│   └── crypto.ts            # TypeScript types
└── server.ts                # Custom server
```

## Key Features to Explore

### 1. Real-time Price Updates
- Prices update every 10 seconds automatically
- No need to refresh page
- Green/red indicators show price changes

### 2. Search & Filter
- Type any coin name or symbol
- Results filter instantly
- Case-insensitive search

### 3. Market Statistics
- Total market capitalization
- 24-hour trading volume
- Bitcoin dominance percentage
- Number of coins tracked

### 4. Responsive Design
- Works on desktop, tablet, and mobile
- Optimized for all screen sizes
- Touch-friendly interface

## Next Steps

### For Development:

1. **Customize Styling**
   - Edit `app/globals.css` for theme colors
   - Modify `components/` for UI changes

2. **Add Features**
   - Implement price alerts
   - Add favorite coins
   - Create price charts

3. **Optimize Performance**
   - Adjust update interval in `lib/socket.ts`
   - Add caching layer
   - Implement pagination

### For Production:

1. **Build Application**
```bash
npm run build
```

2. **Test Production Build**
```bash
npm start
```

3. **Deploy**
   - See `DEPLOYMENT.md` for detailed guide
   - Choose platform (Railway, Render, VPS)
   - Configure environment variables

## Useful Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Run production server

# Maintenance
npm run lint         # Run ESLint
npm install          # Install dependencies
```

## Learning Resources

### Documentation
- 📖 [README.md](./README.md) - Complete documentation
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [CoinGecko API](https://www.coingecko.com/en/api/documentation)
- [Socket.IO Docs](https://socket.io/docs/)
- [shadcn/ui](https://ui.shadcn.com)

## Getting Help

### Check Logs
```bash
# Browser Console
F12 → Console tab

# Server Logs
Check terminal where npm run dev is running
```

### Debug Mode
```typescript
// Add to components for debugging
console.log('State:', { cryptos, prices, isConnected });
```

### Common Debug Points
1. WebSocket connection status
2. API response data
3. Component state updates
4. Price update events

## Tips for Best Experience

1. **Use Modern Browser**
   - Chrome, Firefox, Safari, Edge (latest versions)
   - Enable JavaScript
   - Allow WebSocket connections

2. **Stable Internet**
   - Required for API calls
   - WebSocket needs constant connection
   - Check network tab in DevTools

3. **Keep Server Running**
   - Don't close terminal
   - Check for error messages
   - Restart if needed

4. **Monitor Performance**
   - Open DevTools Performance tab
   - Check memory usage
   - Watch network requests

---

**Selamat! Anda sudah siap menggunakan Crypto Tracker!** 🎉

Jika ada pertanyaan atau masalah, lihat dokumentasi lengkap di README.md atau ARCHITECTURE.md.
