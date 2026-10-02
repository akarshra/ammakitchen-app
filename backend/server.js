const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initializeDatabase, pool } = require('./database');
const apiRoutes = require('./routes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Attach Socket.io to Express Request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', apiRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Amma Kitchen API is running smoothly' });
});

const deliverySimulations = new Map();

function startDeliverySimulation(orderId) {
  if (deliverySimulations.has(orderId)) {
    clearInterval(deliverySimulations.get(orderId));
  }

  // Simulated coordinates from Fairlands (Amma's Kitchen) to Hasthampatti (Customer) in Salem
  const coordinates = [
    { latitude: 11.6643, longitude: 78.1460, bearing: 45 },
    { latitude: 11.6648, longitude: 78.1472, bearing: 60 },
    { latitude: 11.6655, longitude: 78.1485, bearing: 55 },
    { latitude: 11.6662, longitude: 78.1498, bearing: 45 },
    { latitude: 11.6668, longitude: 78.1510, bearing: 30 },
    { latitude: 11.6672, longitude: 78.1524, bearing: 90 },
    { latitude: 11.6675, longitude: 78.1538, bearing: 85 },
    { latitude: 11.6680, longitude: 78.1552, bearing: 45 },
    { latitude: 11.6685, longitude: 78.1565, bearing: 0 }
  ];

  let index = 0;
  console.log(`Starting delivery simulation for order: ${orderId}`);

  const intervalId = setInterval(async () => {
    if (index >= coordinates.length) {
      clearInterval(intervalId);
      deliverySimulations.delete(orderId);
      
      try {
        // Mark as Delivered in DB
        await pool.query(
          "UPDATE orders SET status = 'Delivered', payment_status = 'Paid' WHERE id = $1", 
          [orderId]
        );
        io.to(`order_${orderId}`).emit('order-status-changed', { orderId, status: 'Delivered' });
        io.emit('order_status_update', { id: orderId, status: 'Delivered' });
        console.log(`Simulation finished. Order ${orderId} set to Delivered.`);
      } catch (err) {
        console.error("Error setting order to delivered in simulation:", err);
      }
      return;
    }

    const position = coordinates[index];
    io.to(`order_${orderId}`).emit('rider-location-changed', {
      orderId,
      latitude: position.latitude,
      longitude: position.longitude,
      bearing: position.bearing,
      status: 'Out for Delivery'
    });

    index++;
  }, 4000); // update every 4 seconds

  deliverySimulations.set(orderId, intervalId);
}

// Make simulation function accessible in API routes
app.set('startDeliverySimulation', startDeliverySimulation);

// CRM Dashboard Route
app.get('/crm', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'crm.html'));
});

// Socket.io Connection Event Handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('join-order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket client ${socket.id} joined tracking room order_${orderId}`);
  });

  socket.on('rider-location-update', (data) => {
    const { orderId, latitude, longitude, bearing } = data;
    io.to(`order_${orderId}`).emit('rider-location-changed', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Attempt database setup & seeding
    await initializeDatabase();
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`=============================================`);
      console.log(`  Amma Kitchen Salem API Server Loaded       `);
      console.log(`  Server Listening on: http://0.0.0.0:${PORT} `);
      console.log(`  WebSocket Server ready on port: ${PORT}    `);
      console.log(`=============================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
