require('dotenv').config();
const app = require('./app');
const { initializeData } = require('./utils/dataInitializer.util');

const PORT = process.env.PORT || 5000;

// Initialize data files if they don't exist
initializeData()
  .then(() => {
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize data:', error);
    process.exit(1);
  });
