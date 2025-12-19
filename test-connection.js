/**
 * Railway Connection Diagnostic Script
 * 
 * Run this in your browser console on clerktree.com to check:
 * 1. What environment variables are actually loaded
 * 2. If Railway services are accessible
 * 3. What errors are occurring
 */

console.log('🔍 Starting Railway Connection Diagnostic...\n');

// Check environment variables (these are available at build time in Vite)
const envCheck = {
  ollamaUrl: import.meta.env.VITE_OLLAMA_URL,
  ttsUrl: import.meta.env.VITE_TTS_API_URL,
  geminiKey: import.meta.env.VITE_GEMINI_API_KEY ? 'SET' : 'NOT SET',
};

console.log('📋 Environment Variables:');
console.log('  VITE_OLLAMA_URL:', envCheck.ollamaUrl || 'NOT SET');
console.log('  VITE_TTS_API_URL:', envCheck.ttsUrl || 'NOT SET');
console.log('  VITE_GEMINI_API_KEY:', envCheck.geminiKey);

// Test Ollama
if (envCheck.ollamaUrl) {
  console.log('\n🔍 Testing Ollama Connection:', envCheck.ollamaUrl);
  
  fetch(`${envCheck.ollamaUrl}/api/tags`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10000)
  })
  .then(response => {
    console.log('  Status:', response.status, response.statusText);
    if (response.ok) {
      return response.json();
    }
    return response.text().then(text => {
      throw new Error(`HTTP ${response.status}: ${text}`);
    });
  })
  .then(data => {
    const models = data.models || [];
    const hermesModel = models.find(m => 
      m.name.includes('hermes2pro') || 
      m.name.includes('nous-hermes')
    );
    
    if (hermesModel) {
      console.log('  ✅ Ollama Connected!');
      console.log('  ✅ Model Found:', hermesModel.name);
      console.log('  📊 Total Models:', models.length);
    } else {
      console.log('  ⚠️ Ollama Connected but Hermes model not found');
      console.log('  📊 Available Models:', models.map(m => m.name).join(', ') || 'None');
    }
  })
  .catch(error => {
    console.error('  ❌ Ollama Connection Failed:', error.message);
    console.error('  💡 Possible issues:');
    console.error('     - URL is incorrect');
    console.error('     - Service is down');
    console.error('     - CORS issue');
    console.error('     - Network timeout');
  });
} else {
  console.error('\n❌ VITE_OLLAMA_URL is not set!');
  console.error('💡 Add it in Netlify: Site Settings → Environment Variables');
}

// Test TTS
if (envCheck.ttsUrl) {
  console.log('\n🔍 Testing TTS Connection:', envCheck.ttsUrl);
  
  fetch(`${envCheck.ttsUrl}/health`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10000)
  })
  .then(response => {
    console.log('  Status:', response.status, response.statusText);
    if (response.ok) {
      return response.json();
    }
    return response.text().then(text => {
      throw new Error(`HTTP ${response.status}: ${text}`);
    });
  })
  .then(data => {
    console.log('  ✅ TTS Connected!');
    console.log('  📊 Response:', data);
  })
  .catch(error => {
    console.error('  ❌ TTS Connection Failed:', error.message);
    console.error('  💡 Possible issues:');
    console.error('     - URL is incorrect');
    console.error('     - Service is down');
    console.error('     - CORS issue');
    console.error('     - Network timeout');
  });
} else {
  console.error('\n❌ VITE_TTS_API_URL is not set!');
  console.error('💡 Add it in Netlify: Site Settings → Environment Variables');
}

console.log('\n✅ Diagnostic complete! Check the results above.');

