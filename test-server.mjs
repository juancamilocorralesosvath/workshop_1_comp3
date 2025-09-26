// Test básico para verificar que Express funciona con ES modules
import express from 'express';

console.log('🔄 Starting basic test server...');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Test server working!' });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
});