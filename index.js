// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import express from 'express';
import { ParseServer } from 'parse-server';
import path from 'path';
const __dirname = path.resolve();
import http from 'http';
import { RedisCacheAdapter } from 'parse-server';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const redisOptions = { url: redisUrl }; // You can include other Redis options here
const redisCacheAdapter = new RedisCacheAdapter(redisOptions);

// Event listener function to handle Redis connection
function onRedisConnect() {
  console.log('Connected to Redis cache.');
}

// Event listener function to handle Redis connection errors
function onRedisError(error) {
  console.error('Error connecting to Redis:', error);
}

const config = {
  databaseURI: process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || (__dirname + '/cloud/main.js'),
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', // Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  cacheAdapter: redisCacheAdapter,
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
};

export const app = express();

app.set('trust proxy', true);

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

if (!process.env.TESTING) {
  const mountPath = process.env.PARSE_MOUNT || '/parse';
  const server = new ParseServer(config);
  await server.start();
  app.use(mountPath, server.app);
}

app.get('/', async function (req, res) {
  try {
    // Call the 'hello' Cloud Function
    const result = await Parse.Cloud.run('hello');
    res.status(200).send(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred during Cloud Function call.');
  }
});

app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

if (!process.env.TESTING) {
  const port = process.env.PORT || 1337;
  const httpServer = http.createServer(app);

  // Attach listener for Redis connection event
  redisCacheAdapter.client.on('connect', onRedisConnect);

  // Attach listener for Redis connection error event
  redisCacheAdapter.client.on('error', onRedisError);

  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });

  // This will enable the Live Query real-time server
  await ParseServer.createLiveQueryServer(httpServer);
}
