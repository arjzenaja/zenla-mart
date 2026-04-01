const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
};

// Read JSON file
const readData = async (filename) => {
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Write JSON file
const writeData = async (filename, data) => {
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    // Debug logging
    try {
        const logPath = path.join(dataDir, 'debug.log');
        const logMsg = `[${new Date().toISOString()}] Wrote to ${filePath}. Success.\n`;
        await fs.appendFile(logPath, logMsg, 'utf8');
    } catch (e) {
        // ignore log error
    }
    
    return true;
  } catch (error) {
    try {
        const logPath = path.join(dataDir, 'debug.log');
        const logMsg = `[${new Date().toISOString()}] Error writing to ${filename}: ${error.message}\n`;
        await fs.appendFile(logPath, logMsg, 'utf8');
    } catch (e) {}
    throw error;
  }
};

// Generate ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
  readData,
  writeData,
  generateId,
  ensureDataDir
};
