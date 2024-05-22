import express from 'express';
import { ParseServer, RedisCacheAdapter } from 'parse-server';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Redis configuration
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const redisOptions = { url: redisUrl };
const redisCache = new RedisCacheAdapter(redisOptions);

// Event listener functions
function onRedisConnect() {
  console.log('Connected to Redis cache.');
}

function onRedisError(error) {
  console.error('Error connecting to Redis:', error);
}

// Parse Server configuration
const config = {
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || path.join(__dirname, '/cloud/main.js'),
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', // Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  cacheAdapter: redisCache,
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
};

// Initialize Express
const app = express();

app.set('trust proxy', true);

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Initialize Parse Server
if (!process.env.TESTING) {
  const mountPath = process.env.PARSE_MOUNT || '/parse';
  const parseServer = new ParseServer(config);
  
  // Start the Parse Server
  await parseServer.start();
  
  app.use(mountPath, parseServer.app);
}

// Route for calling the 'hello' Cloud Function
app.get('/', async (req, res) => {
  try {
    // Call the 'hello' Cloud Function
    const result = await Parse.Cloud.run('hello');
    res.status(200).send(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred during Cloud Function call.');
  }
});

// Test route
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

// Start HTTP server if not testing
if (!process.env.TESTING) {
  const port = process.env.PORT || 1337;
  const httpServer = http.createServer(app);

  // Attach listener for Redis connection event
  redisCache.client.on('connect', onRedisConnect);

  // Attach listener for Redis connection error event
  redisCache.client.on('error', onRedisError);

  httpServer.listen(port, () => {
    console.log('parse-server-example running on port ' + port + '.');
  });

  // Enable the Live Query real-time server
  await ParseServer.createLiveQueryServer(httpServer);
}
