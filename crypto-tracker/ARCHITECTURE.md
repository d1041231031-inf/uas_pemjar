# Arsitektur & Cara Kerja Aplikasi

## Arsitektur Aplikasi

Aplikasi ini menggunakan arsitektur full-stack dengan komponen berikut:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │  Next.js App │ ◄─────► │  CoinGecko  │
│  (Client)   │         │   + Socket   │         │     API     │
└─────────────┘         └──────────────┘         └─────────────┘
      ↑                        ↑
      │                        │
      │    WebSocket           │  HTTP/REST API
      │    Connection          │
      │                        │
      └────────────────────────┘
```

## Flow Data Real-time

### 1. Initial Load (HTTP Request)

```
Client Request → Next.js API Route → CoinGecko API → Response
     │                                                    │
     └────────────────────────────────────────────────────┘
                    JSON Data (Top 50 Coins)
```

**File yang terlibat:**
- `app/api/crypto/route.ts` - API endpoint
- `lib/coingecko.ts` - Fungsi fetch data
- `components/CryptoTable.tsx` - Render UI

### 2. WebSocket Connection

```
1. Client connects → Socket.IO Server (server.ts)
2. Client subscribes → Send coin IDs to server
3. Server starts polling → Fetch prices every 10s
4. Server emits updates → Client receives price updates
5. Client updates UI → React state management
```

**File yang terlibat:**
- `server.ts` - Custom server dengan Socket.IO
- `lib/socket.ts` - Socket.IO server logic
- `hooks/useWebSocket.ts` - Client-side WebSocket hook
- `components/CryptoTable.tsx` - UI updates

### 3. Price Update Cycle

```
┌──────────────────────────────────────────────┐
│                                              │
│  Server: setInterval(10s)                   │
│     ↓                                        │
│  Fetch prices from CoinGecko API            │
│     ↓                                        │
│  socket.emit('priceUpdate', prices)         │
│     ↓                                        │
│  Client: socket.on('priceUpdate')           │
│     ↓                                        │
│  Update React state (setPrices)             │
│     ↓                                        │
│  Re-render CryptoTable with new prices      │
│     ↓                                        │
└──────────────────────────────────────────────┘
```

## Komponen Detail

### Server Side

#### `server.ts`
```typescript
// Custom Next.js server
- Membuat HTTP server
- Inisialisasi Socket.IO
- Handle Next.js routing
```

#### `lib/socket.ts`
```typescript
// Socket.IO logic
- Manage client connections
- Subscribe/unsubscribe events
- Polling CoinGecko API
- Emit price updates
```

#### `app/api/crypto/route.ts`
```typescript
// REST API endpoint
- Fetch top cryptocurrencies
- Return JSON response
```

#### `app/api/crypto/prices/route.ts`
```typescript
// REST API endpoint
- Fetch specific coin prices
- Query parameter: ids (comma-separated)
```

### Client Side

#### `hooks/useWebSocket.ts`
```typescript
// Custom React hook
- Initialize Socket.IO client
- Manage connection state
- Subscribe/unsubscribe functions
- Handle price updates
```

#### `components/CryptoTable.tsx`
```typescript
// Main UI component
- Fetch initial data
- Subscribe to WebSocket
- Handle price updates
- Search & filter functionality
- Render table
```

#### `components/MarketStats.tsx`
```typescript
// Market statistics component
- Calculate market metrics
- Display cards with stats
- Auto-refresh every minute
```

## Data Flow Diagram

### Initial Page Load

```
1. User visits http://localhost:3000
   ↓
2. Next.js serves page.tsx
   ↓
3. CryptoTable component mounts
   ↓
4. useEffect → fetchCryptos()
   ↓
5. Fetch /api/crypto?limit=50
   ↓
6. API calls CoinGecko API
   ↓
7. Return data to component
   ↓
8. setCryptos(data) → Render table
```

### WebSocket Setup

```
1. CryptoTable has cryptos data
   ↓
2. useEffect with cryptos dependency
   ↓
3. Extract coin IDs from cryptos array
   ↓
4. Call subscribe(coinIds)
   ↓
5. useWebSocket hook initialized
   ↓
6. socket.emit('subscribe', coinIds)
   ↓
7. Server receives subscribe event
   ↓
8. Server starts polling CoinGecko
   ↓
9. Every 10s: fetch prices → emit to client
   ↓
10. Client receives → updates state
   ↓
11. React re-renders with new prices
```

## State Management

### Component State (CryptoTable)

```typescript
// Local state
const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
const [filteredCryptos, setFilteredCryptos] = useState<Cryptocurrency[]>([]);
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState("");

// WebSocket state (from custom hook)
const { prices, isConnected, subscribe } = useWebSocket();
```

### Update Flow

```
WebSocket receives prices
     ↓
setPrices(newPrices) in useWebSocket hook
     ↓
useEffect in CryptoTable detects prices change
     ↓
setCryptos (merge old data with new prices)
     ↓
React re-renders → UI updated
```

## API Rate Limiting Strategy

CoinGecko Free Tier: 10-30 calls/minute

### Strategy yang digunakan:

1. **Initial Load**: 1 call untuk 50 coins
2. **WebSocket Updates**: 1 call per 10 seconds
3. **Caching**: Next.js cache dengan revalidate
4. **Batching**: Update semua coins sekaligus

```
60 seconds ÷ 10 seconds = 6 calls per minute ✓
Total: ~7 calls/minute (termasuk initial load)
```

## Performance Optimizations

### 1. React Optimization
```typescript
// useEffect dependencies
useEffect(() => {
  // Only re-subscribe when cryptos change
}, [cryptos]);

// Filtered list calculation
useEffect(() => {
  // Only recalculate when search or cryptos change
}, [searchTerm, cryptos]);
```

### 2. WebSocket Optimization
```typescript
// Single socket instance
let socket: Socket | null = null;

// Cleanup on unmount
return () => {
  socket?.off('connect');
  socket?.off('disconnect');
  socket?.off('priceUpdate');
};
```

### 3. API Optimization
```typescript
// Next.js caching
fetch(url, {
  next: { revalidate: 60 } // Cache 60 seconds
});
```

## Security Considerations

### 1. Environment Variables
```env
# Tidak ada sensitive keys di code
# API calls dari server-side
```

### 2. CORS Configuration
```typescript
// Socket.IO CORS
cors: {
  origin: '*', // Development only
  // Production: specify exact domain
}
```

### 3. Input Validation
```typescript
// Validate coin IDs
if (!ids) {
  return NextResponse.json(
    { error: "Missing coin IDs" },
    { status: 400 }
  );
}
```

## Testing Strategy

### Manual Testing

1. **Initial Load**
   - Refresh page → Verify 50 coins loaded
   - Check loading state → Should show spinner

2. **WebSocket Connection**
   - Check badge → Should show "Live"
   - Wait 10 seconds → Prices should update
   - Check console → Should see "WebSocket connected"

3. **Search Functionality**
   - Type "bitcoin" → Should filter results
   - Clear search → Should show all coins

4. **Real-time Updates**
   - Watch price column → Should update every 10s
   - Check price change indicators → Colors should match

### Debug Tools

```javascript
// Browser Console
// Check WebSocket connection
socket.connected // true/false

// Monitor events
socket.on('priceUpdate', console.log);

// Server logs
console.log('Client connected:', socket.id);
console.log('Subscribed to:', coinIds);
```

## Troubleshooting

### Issue: WebSocket tidak connect

**Kemungkinan penyebab:**
1. Server tidak running
2. Port 3000 digunakan aplikasi lain
3. Socket path tidak match

**Solution:**
```bash
# Check if server running
netstat -ano | findstr :3000

# Restart server
npm run dev

# Check browser console
# Should see: "WebSocket connected"
```

### Issue: Prices tidak update

**Kemungkinan penyebab:**
1. Rate limiting dari CoinGecko
2. Network error
3. Tidak ada subscriptions

**Solution:**
```javascript
// Check browser console
// Look for error messages

// Check Network tab
// Should see Socket.IO XHR/WebSocket requests

// Verify subscribe was called
console.log('Subscribed coins:', subscribedCoins);
```

### Issue: Data tidak muncul

**Kemungkinan penyebab:**
1. API error
2. CORS issue
3. Invalid response format

**Solution:**
```bash
# Test API directly
curl http://localhost:3000/api/crypto

# Check server logs
# Look for error messages

# Verify CoinGecko API
curl https://api.coingecko.com/api/v3/ping
```

## Deployment Considerations

### Environment Variables untuk Production

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
```

### Build & Deploy

```bash
# Build aplikasi
npm run build

# Test production build locally
npm start

# Deploy ke platform (Vercel, Railway, etc.)
# Note: WebSocket needs custom server support
```

### Platform Requirements

- **Vercel**: ❌ Tidak support custom server
- **Railway**: ✅ Support custom server
- **Render**: ✅ Support custom server
- **Heroku**: ✅ Support custom server
- **VPS/Cloud**: ✅ Full control

## Scaling Considerations

### Horizontal Scaling

```
Multiple server instances → Redis adapter for Socket.IO

Client
  ↓
Load Balancer
  ↓
[Server 1] [Server 2] [Server 3]
      ↓         ↓         ↓
            Redis
```

### Vertical Scaling

- Increase update interval (10s → 30s)
- Reduce number of tracked coins
- Implement caching layer (Redis)
- Use CDN for static assets

## Future Enhancements

1. **User Preferences**
   - Save favorite coins
   - Custom watchlist
   - Alert notifications

2. **Charts & Graphs**
   - Price history charts
   - Volume charts
   - Market cap trends

3. **Advanced Features**
   - Portfolio tracking
   - Price alerts
   - News integration
   - Multi-currency support

4. **Performance**
   - Implement Redis caching
   - Add service worker
   - Progressive Web App
   - Server-side rendering optimization

---

**Dokumentasi ini menjelaskan arsitektur lengkap dari aplikasi Crypto Tracker.**
