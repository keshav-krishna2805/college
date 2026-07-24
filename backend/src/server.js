import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.config.js';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION!  Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});


const startServer = async () => {
  try {
    
    await connectDB();

    
    const server = app.listen(config.port, () => {
      console.log(`[Server] App running on port ${config.port} in ${config.env} mode`);
    });

  
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION!  Shutting down...');
      console.error(err.name, err.message);
      
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
