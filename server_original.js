'use strict';
const Hapi = require('hapi');
const Inert = require('inert');
const requestPromise = require('request-promise-native');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8080
});

server.path(__dirname + './public');


// Add the route
server.route({
  method: 'GET',
  path: '/',
  handler: {
const Inert = require('inert');
    file: './index.html'
  }
  // function(request, reply) {
  //   reply.file('./public/index.html');
  // }
});

/*
server.route({
  method: 'GET',
  path: '/google',
  handler: async function(request, reply) {
    const googleResponse = await requestPromise.get('http://google.com');
    console.log('google response: ', googleResponse);

    reply('success!');
  }
});
*/

// Start the server
server.start(err => {
  if (err) {
    throw err;
  }

  console.log('Server running at:', server.info.uri);
});
