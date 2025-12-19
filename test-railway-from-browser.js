/**
 * Test Railway Ollama Connection from Browser
 * 
 * Copy and paste this into the browser console on clerktree.com
 */

console.log('🧪 Testing Railway Ollama Connection...\n');

// Test 1: Health Check
console.log('1️⃣ Testing Health Endpoint...');
fetch('https://clerk-ollama-production.up.railway.app/health')
  .then(response => {
    console.log('   Status:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('   ✅ Health Check:', data);
  })
  .catch(error => {
    console.error('   ❌ Health Check Failed:', error);
  });

// Test 2: API Tags (should return models)
console.log('\n2️⃣ Testing API Tags Endpoint...');
fetch('https://clerk-ollama-production.up.railway.app/api/tags', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => {
    console.log('   Status:', response.status, response.statusText);
    console.log('   CORS Headers:', {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
    });
    return response.json();
  })
  .then(data => {
    console.log('   ✅ API Tags Response:', data);
    if (data.models && data.models.length > 0) {
      console.log('   📊 Available Models:', data.models.map(m => m.name).join(', '));
      const hermesModel = data.models.find(m => 
        m.name.includes('hermes2pro') || m.name.includes('nous-hermes')
      );
      if (hermesModel) {
        console.log('   ✅ Hermes 2 Pro Model Found:', hermesModel.name);
      } else {
        console.log('   ⚠️ Hermes 2 Pro Model Not Found');
      }
    }
  })
  .catch(error => {
    console.error('   ❌ API Tags Failed:', error);
    if (error.message.includes('CORS')) {
      console.error('   💡 CORS Error - Check if proxy is working');
    }
  });

// Test 3: Check Environment Variables
console.log('\n3️⃣ Checking Environment Variables...');
console.log('   VITE_OLLAMA_URL:', import.meta.env.VITE_OLLAMA_URL || 'NOT SET');
console.log('   VITE_TTS_API_URL:', import.meta.env.VITE_TTS_API_URL || 'NOT SET');
console.log('   VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY ? 'SET' : 'NOT SET');

console.log('\n✅ Test script complete! Check results above.');

