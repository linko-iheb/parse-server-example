// cloud/main.js
Parse.Cloud.define('hello', req => {
    req.log.info(req);
    return 'Hi , you are running parse server now , congrats !';
  });