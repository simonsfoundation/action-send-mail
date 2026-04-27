const { SMTPServer } = require('smtp-server');

const server = new SMTPServer({
  allowInsecureAuth: true,
  authOptional: true,
  onData(stream, session, callback) {
    let data = '';
    stream.on('data', chunk => (data += chunk));
    stream.on('end', () => {
      console.log('\n--- EMAIL RECEIVED ---');
      console.log(`From: ${session.envelope.mailFrom.address}`);
      console.log(`To:   ${session.envelope.rcptTo.map(r => r.address).join(', ')}`);
      console.log('--- RAW MESSAGE ---');
      console.log(data);
      console.log('--- END ---\n');
      callback();
    });
  },
  onError(err) {
    console.error('SMTP server error:', err.message);
  },
});

server.listen(1025, '127.0.0.1', () => {
  console.log('Fake SMTP server listening on 127.0.0.1:1025');
  console.log('Press Ctrl+C to stop.\n');
});
