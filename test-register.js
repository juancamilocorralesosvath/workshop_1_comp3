const testData = {
  email: "test@gym.com",
  password: "Test123!",
  full_name: "Test User",
  age: 25,
  phone: "+57 300 123 4567"
};

console.log('Test data:');
console.log(JSON.stringify(testData, null, 2));

// Test if JSON is valid
try {
  JSON.parse(JSON.stringify(testData));
  console.log('✅ JSON is valid');
} catch (error) {
  console.log('❌ JSON error:', error.message);
}

// Test Zod validation
const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  age: z.number().int().min(1, 'Age must be a positive number').max(120, 'Age must be realistic'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(15, 'Phone must be at most 15 characters'),
  roleIds: z.array(z.string()).optional()
});

try {
  const result = registerSchema.parse(testData);
  console.log('✅ Zod validation passed');
  console.log('Parsed result:', result);
} catch (error) {
  console.log('❌ Zod validation failed:');
  if (error.issues) {
    error.issues.forEach(issue => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
  } else {
    console.log('  ', error.message);
  }
}