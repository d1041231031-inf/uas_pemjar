# 🚀 Crypto Tracker - Real-time Cryptocurrency Price Tracker

Web aplikasi full-stack modern untuk melacak harga cryptocurrency secara real-time menggunakan **Next.js 15**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, dan **CoinGecko API** dengan dukungan **WebSocket** untuk update harga langsung.

## ✨ Fitur Utama

- 📊 **Real-time Price Updates** - Harga cryptocurrency diperbarui setiap 10 detik melalui WebSocket
- 🔍 **Search & Filter** - Cari cryptocurrency berdasarkan nama atau simbol
- 📈 **Live Market Data** - Menampilkan harga, perubahan 24 jam, market cap, dan volume trading
- 🎨 **Modern UI** - Dibangun dengan shadcn/ui dan Tailwind CSS untuk tampilan yang elegan
- 🌐 **CoinGecko API** - Menggunakan API CoinGecko untuk data cryptocurrency yang akurat
- ⚡ **WebSocket Integration** - Update harga real-time tanpa perlu refresh halaman
- 📱 **Responsive Design** - Tampilan optimal di semua ukuran layar

## 🛠️ Teknologi yang Digunakan

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **API**: CoinGecko API
- **Real-time**: Socket.IO (WebSocket)
- **Icons**: Lucide React

## 📦 Struktur Proyek

```
crypto-tracker/
├── app/
│   ├── api/
│   │   └── crypto/
│   │       ├── route.ts          # API endpoint untuk fetch cryptocurrencies
│   │       └── prices/
│   │           └── route.ts      # API endpoint untuk fetch prices
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   └── input.tsx
│   └── CryptoTable.tsx           # Main crypto table component
├── hooks/
│   └── useWebSocket.ts           # WebSocket custom hook
├── lib/
│   ├── coingecko.ts              # CoinGecko API functions
│   ├── socket.ts                 # Socket.IO server setup
│   └── utils.ts                  # Utility functions
├── types/
│   └── crypto.ts                 # TypeScript interfaces
└── server.ts                     # Custom server with Socket.IO
```

## 🚀 Cara Menjalankan

### Prerequisites

- Node.js 18.x atau lebih tinggi
- npm atau yarn

### Installation

1. **Clone atau navigate ke direktori proyek**
```bash
cd crypto-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Jalankan development server**
```bash
npm run dev
```

4. **Buka browser dan akses**
```
http://localhost:3000
```

## 📖 Cara Menggunakan

1. **Melihat Daftar Cryptocurrency**
   - Saat aplikasi dibuka, Anda akan melihat top 50 cryptocurrency berdasarkan market cap
   - Badge "Live" di header menunjukkan koneksi WebSocket aktif

2. **Mencari Cryptocurrency**
   - Gunakan search bar untuk mencari cryptocurrency berdasarkan nama atau simbol
   - Contoh: ketik "bitcoin" atau "btc"

3. **Memantau Perubahan Harga**
   - Harga akan diperbarui secara otomatis setiap 10 detik
   - Indikator warna hijau (↑) untuk kenaikan harga
   - Indikator warna merah (↓) untuk penurunan harga

4. **Informasi yang Ditampilkan**
   - Ranking berdasarkan market cap
   - Logo dan nama cryptocurrency
   - Harga saat ini (USD)
   - Perubahan harga 24 jam (%)
   - Market capitalization
   - Volume trading 24 jam

## 🔧 Konfigurasi

### Environment Variables (Opsional)

Buat file `.env.local` untuk konfigurasi custom:

```env
# Port untuk development server (default: 3000)
PORT=3000

# CoinGecko API (tidak perlu API key untuk basic usage)
# Jika ingin menggunakan API key premium, tambahkan:
# COINGECKO_API_KEY=your_api_key_here
```

### Mengubah Update Interval

Edit file `lib/socket.ts` untuk mengubah interval update harga:

```typescript
// Update prices setiap X detik (default: 10000ms = 10 detik)
priceUpdateInterval = setInterval(async () => {
  // ...
}, 10000); // Ubah nilai ini
```

## 🏗️ Build untuk Production

```bash
# Build aplikasi
npm run build

# Jalankan production server
npm start
```

## 📝 API Endpoints

### GET /api/crypto

Mendapatkan daftar cryptocurrency dari CoinGecko.

**Query Parameters:**
- `limit` (optional): Jumlah cryptocurrency yang ditampilkan (default: 50)

**Response:**
```json
[
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "image": "https://...",
    "current_price": 45000,
    "market_cap": 850000000000,
    "price_change_percentage_24h": 2.5,
    ...
  }
]
```

### GET /api/crypto/prices

Mendapatkan harga real-time untuk cryptocurrency tertentu.

**Query Parameters:**
- `ids` (required): Comma-separated list of coin IDs (contoh: `bitcoin,ethereum,cardano`)

**Response:**
```json
{
  "bitcoin": {
    "usd": 45000,
    "usd_24h_change": 2.5
  },
  "ethereum": {
    "usd": 2500,
    "usd_24h_change": -1.2
  }
}
```

## 🔌 WebSocket Events

### Client → Server

**`subscribe`**
Subscribe ke update harga cryptocurrency tertentu.
```javascript
socket.emit('subscribe', ['bitcoin', 'ethereum', 'cardano']);
```

**`unsubscribe`**
Unsubscribe dari update harga.
```javascript
socket.emit('unsubscribe');
```

### Server → Client

**`priceUpdate`**
Menerima update harga dari server.
```javascript
socket.on('priceUpdate', (data) => {
  console.log(data);
  // {
  //   "bitcoin": { "usd": 45000, "usd_24h_change": 2.5 },
  //   ...
  // }
});
```

## 🎨 Customization

### Mengubah Tema

Edit file `app/globals.css` untuk mengubah color scheme:

```css
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --secondary: 210 40% 96.1%;
    /* ... ubah variabel lainnya */
  }
}
```

### Menambah Kolom di Tabel

Edit `components/CryptoTable.tsx` untuk menambahkan kolom baru:

```tsx
<TableHead>Kolom Baru</TableHead>
// ...
<TableCell>{crypto.new_field}</TableCell>
```

## 🔒 Rate Limiting

CoinGecko API memiliki rate limiting:
- **Free tier**: 10-30 calls/minute
- Aplikasi ini menggunakan caching dan update interval untuk menghindari rate limiting

## 🐛 Troubleshooting

### WebSocket tidak connect

1. Pastikan port 3000 tidak digunakan aplikasi lain
2. Check console browser untuk error messages
3. Pastikan server berjalan dengan `npm run dev`

### Error fetching data

1. Check koneksi internet
2. Verifikasi CoinGecko API masih accessible
3. Check browser console untuk error details

### Build errors

```bash
# Clear cache dan reinstall
rm -rf node_modules .next
npm install
npm run build
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 License

MIT License - Silakan gunakan untuk proyek pribadi atau komersial.

## 🤝 Contributing

Kontribusi sangat diterima! Silakan fork repository dan submit pull request.

## ⭐ Credits

- Data cryptocurrency dari [CoinGecko](https://www.coingecko.com)
- UI Components dari [shadcn/ui](https://ui.shadcn.com)
- Icons dari [Lucide](https://lucide.dev)

---

**Dibuat dengan ❤️ menggunakan Next.js dan TypeScript**
