// backend/server.js
const app = require('./src/app');
const http = require('http');
const { pool } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);


// Start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
    
 
  
    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Lucia Printing Platform API                ║
╠══════════════════════════════════════════════════════════════╣
║  Server:      http://localhost:${PORT}                        ║
║  API:         http://localhost:${PORT}/api                    ║
║  Health:      http://localhost:${PORT}/health                 ║
║  Environment: ${process.env.NODE_ENV || 'development'}                         ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};



// Start the server
startServer();

module.exports = { server, app };