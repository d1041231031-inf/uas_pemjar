import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fetchCryptoPrices } from '@/lib/coingecko';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    let priceUpdateInterval: NodeJS.Timeout | null = null;
    let subscribedCoins: string[] = [];

    socket.on('subscribe', async (coinIds: string[]) => {
      console.log('Client subscribed to coins:', coinIds);
      subscribedCoins = coinIds;

      // Clear existing interval if any
      if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
      }

      // Fetch initial prices
      try {
        const prices = await fetchCryptoPrices(coinIds);
        socket.emit('priceUpdate', prices);
      } catch (error) {
        console.error('Error fetching initial prices:', error);
      }

      // Update prices every 10 seconds
      priceUpdateInterval = setInterval(async () => {
        try {
          const prices = await fetchCryptoPrices(subscribedCoins);
          socket.emit('priceUpdate', prices);
        } catch (error) {
          console.error('Error fetching prices:', error);
        }
      }, 10000);
    });

    socket.on('unsubscribe', () => {
      if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
        priceUpdateInterval = null;
      }
      subscribedCoins = [];
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
      }
    });
  });

  return io;
}

export function getSocketServer() {
  return io;
}
