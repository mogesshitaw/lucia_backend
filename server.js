const app = require('./src/app');
const { pool } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

 const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     Lucia Printing Platform API        ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}      ║
║  Health: http://localhost:${PORT}/health║
║  Environment: ${process.env.NODE_ENV}        ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🔄 Received shutdown signal. Closing connections...');

  server.close(async () => {
    console.log('✅ HTTP server closed');

    try {
      await pool.end();
      console.log('✅ Database pool closed');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error closing database pool:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown();
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  gracefulShutdown();
});

module.exports = server;