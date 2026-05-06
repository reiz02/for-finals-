const mongoose = require('mongoose');

mongoose.connect('mongodb://reicha:charm123@ac-rrphu9p-shard-00-00.vnlcxrd.mongodb.net:27017,ac-rrphu9p-shard-00-01.vnlcxrd.mongodb.net:27017,ac-rrphu9p-shard-00-02.vnlcxrd.mongodb.net:27017/FarmOpsDB?ssl=true&replicaSet=atlas-sajxzk-shard-0&authSource=admin&appName=Cluster0', {
  serverSelectionTimeoutMS: 5000,
  bufferCommands: false,
})
.then(async () => {
  const anySchema = new mongoose.Schema({}, { strict: false });
  const AuditLog = mongoose.model('AuditLog', anySchema, 'auditlogs');
  const User = mongoose.model('User', anySchema, 'users');

  const [user, logs] = await Promise.all([
    User.findOne({ email: 'reiz.cabrera17@gmail.com' }).lean(),
    AuditLog.find().sort({ timestamp: -1 }).limit(3).lean(),
  ]);

  console.log('USER', JSON.stringify(user, null, 2));
  console.log('LOGS', JSON.stringify(logs, null, 2));
  process.exit(0);
})
.catch((err) => {
  console.error(err);
  process.exit(1);
});
