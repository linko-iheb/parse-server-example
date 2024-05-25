import os from 'os';

Parse.Cloud.define('hello', req => {
  const serverName = os.hostname();
  const logMessage = `Hi from Container (${serverName}), you are running Parse Server now, congrats!`;
  req.log.info(logMessage);
  return logMessage;
});




Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});

Parse.Cloud.define('testRedisConnection', async (req) => {
  try {
    // Ping the Redis server
    const result = await redisCache.client.ping();

    // If the ping was successful, the result should be 'PONG'
    if (result === 'PONG') {
      console.log('Successfully connected to Redis cache.');
      return 'Successfully connected to Redis cache.';
    } else {
      console.error('Failed to connect to Redis cache.');
      return 'Failed to connect to Redis cache.';
    }
  } catch (error) {
    console.error('Error occurred during Redis connection test:', error);
    throw new Parse.Error(9002, 'Error occurred during Redis connection test.');
  }
});

