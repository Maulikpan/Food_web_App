const kue = require('kue');
const queue = kue.createQueue({
  redis: {
    host: 'localhost', // Redis server host
    port: 6379, // Redis server port
  },
});
module.exports=queue;

//kue will use redis server  
//so must run redis server before using kue