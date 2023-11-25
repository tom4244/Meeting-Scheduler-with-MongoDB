// CLIENT SIDE
import io from 'socket.io-client';
import config from '../../server/config.js';
// Connect to the socket.io server
//   only allowing websocket (no polling)
const socket = io(config.socketAddr, {transports: ['websocket'],     upgrade: false});

// ---- socket.io connection test ----
//function subscribeToPing() {
  // (1): Send a ping event with 
  // some data to the server
  // socket.emit('ping', { some: 'data' } );
//  socket.emit('how are you', { some: 'data' } );
//  console.log( "socket: browser says How are you (1)" );
//}
// (4): The browser recieves a socket.io
//   connection test server response 
// socket.on('fine', function (data) {
//	console.log( 'socket: server said fine (4)', data );
// });
// ------------------------------------
// export { subscribeToPing };

