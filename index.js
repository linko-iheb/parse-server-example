import express from 'express';
import { ParseServer, RedisCacheAdapter } from 'parse-server';
import path from 'path';
import http from 'http';

const __dirname = path.resolve();

// Initialize Redis Cache Adapter
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const redisOptions = { url: redisUrl };
const redisCacheAdapter = new RedisCacheAdapter(redisOptions);

const config = {
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || (__dirname + '/cloud/main.js'),
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', // Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Change to https if needed
  cacheAdapter: redisCacheAdapter,
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
};

const app = express();
app.set('trust proxy', true);
app.use('/public', express.static(path.join(__dirname, '/public')));

if (!process.env.TESTING) {
  const mountPath = process.env.PARSE_MOUNT || '/parse';
  const server = new ParseServer(config);
  await server.start();
  app.use(mountPath, server.app);
}

app.get('/', async function (req, res) {
  try {
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

  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });

  // This will enable the Live Query real-time server
  await ParseServer.createLiveQueryServer(httpServer);
}
