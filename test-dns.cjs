const dns = require('dns');

dns.resolveSrv('_mongodb._tcp.cluster0.fvry3jv.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS SRV resolution failed:', err);
    return;
  }
  console.log('DNS SRV addresses found:', addresses);
});

