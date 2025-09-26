// Test básico para verificar que Express funciona
const express = require('express');
const app = express();
const port = 3000;

console.log('🔄 Starting basic test server...');

app.get('/', (req, res) => {
  res.json({ message: 'Test server working!' });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
});