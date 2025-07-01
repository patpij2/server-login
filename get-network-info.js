#!/usr/bin/env node

const os = require('os');

console.log('🌐 Network Information for Home Network Access');
console.log('==============================================\n');

// Get all network interfaces
const interfaces = os.networkInterfaces();
const localIPs = [];

console.log('📱 Available IP addresses for network access:');
console.log('--------------------------------------------');

for (const [name, nets] of Object.entries(interfaces)) {
  if (nets) {
    for (const net of nets) {
      // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        localIPs.push(net.address);
        console.log(`   ${name}: ${net.address}`);
      }
    }
  }
}

console.log('\n🚀 To make your app accessible on your home network:');
console.log('--------------------------------------------------');
console.log('1. Start your backend server:');
console.log('   cd backend && npm start');
console.log('');
console.log('2. Start your frontend server:');
console.log('   cd frontend && npm start');
console.log('');
console.log('3. Access your app from other devices using:');
localIPs.forEach(ip => {
  console.log(`   Frontend: http://${ip}:3000`);
  console.log(`   Backend API: http://${ip}:8000`);
});
console.log('');
console.log('💡 Make sure your firewall allows connections on ports 3000 and 8000');
console.log('💡 All devices must be connected to the same WiFi/network'); 