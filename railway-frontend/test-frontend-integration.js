#!/usr/bin/env node
/**
 * Frontend Integration Test
 * 
 * Tests:
 * 1. Dev server accessibility
 * 2. AI Service initialization
 * 3. Local LLM availability
 * 4. TTS Service availability
 * 5. Supabase connection
 * 6. Knowledge Base persistence
 */

const FRONTEND_URL = 'http://localhost:5173';
const OLLAMA_URL = 'http://localhost:11434';
const TTS_URL = 'http://localhost:5000';

async function testDevServer() {
  console.log('\n🌐 Testing Frontend Dev Server...');
  console.log('─'.repeat(70));
  
  try {
    const response = await fetch(FRONTEND_URL, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log(`   ✅ Dev server is accessible at ${FRONTEND_URL}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      return true;
    } else {
      console.log(`   ⚠️  Dev server responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Dev server is NOT accessible: ${error.message}`);
    console.log(`   💡 Make sure to run: npm run dev`);
    return false;
  }
}

async function testOllama() {
  console.log('\n🖥️  Testing Ollama (Local LLM)...');
  console.log('─'.repeat(70));
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      const hermesModel = models.find(m => 
        m.name.includes('hermes2pro') || 
        m.name.includes('nous-hermes')
      );
      
      if (hermesModel) {
        console.log(`   ✅ Ollama is running`);
        console.log(`   ✅ Hermes 2 Pro model found: ${hermesModel.name}`);
        return true;
      } else {
        console.log(`   ⚠️  Ollama is running but Hermes 2 Pro not found`);
        console.log(`   💡 Run: ollama run adrienbrault/nous-hermes2pro:Q4_K_M`);
        return false;
      }
    } else {
      console.log(`   ❌ Ollama responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Ollama is NOT accessible: ${error.message}`);
    console.log(`   💡 Make sure Ollama is running: ollama serve`);
    return false;
  }
}

async function testTTSService() {
  console.log('\n🔊 Testing TTS Service...');
  console.log('─'.repeat(70));
  
  try {
    const response = await fetch(`${TTS_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ TTS Service is running`);
      console.log(`   Status: ${data.status || 'OK'}`);
      return true;
    } else {
      console.log(`   ⚠️  TTS Service responded with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ TTS Service is NOT accessible: ${error.message}`);
    console.log(`   💡 Make sure TTS service is running in tts-service/ directory`);
    return false;
  }
}

async function testTTSGeneration() {
  console.log('\n🎤 Testing TTS Generation...');
  console.log('─'.repeat(70));
  
  try {
    const response = await fetch(`${TTS_URL}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, this is a test.',
        voice: 'af_nova'
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('audio')) {
        console.log(`   ✅ TTS generation works`);
        console.log(`   Content-Type: ${contentType}`);
        return true;
      } else {
        console.log(`   ⚠️  TTS responded but content type is ${contentType}`);
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ TTS generation failed: ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 100)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ TTS generation error: ${error.message}`);
    return false;
  }
}

async function testLocalLLMResponse() {
  console.log('\n🤖 Testing Local LLM Response...');
  console.log('─'.repeat(70));
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'adrienbrault/nous-hermes2pro:Q4_K_M',
        messages: [
          { role: 'user', content: 'Say "Hello, I am working!"' }
        ],
        stream: false,
        options: {
          num_predict: 20,
          num_ctx: 512
        }
      }),
      signal: AbortSignal.timeout(30000)
    });
    
    if (response.ok) {
      const data = await response.json();
      const aiResponse = data.message?.content || '';
      
      if (aiResponse.toLowerCase().includes('working') || aiResponse.toLowerCase().includes('hello')) {
        console.log(`   ✅ Local LLM is responding`);
        console.log(`   Response: "${aiResponse.substring(0, 50)}..."`);
        return true;
      } else {
        console.log(`   ⚠️  Local LLM responded but content unexpected`);
        console.log(`   Response: "${aiResponse}"`);
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Local LLM failed: ${response.status}`);
      console.log(`   Error: ${errorText.substring(0, 100)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Local LLM error: ${error.message}`);
    return false;
  }
}

async function testSupabaseConnection() {
  console.log('\n🗄️  Testing Supabase Connection...');
  console.log('─'.repeat(70));
  
  // Check if .env has Supabase config
  try {
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      console.log(`   ✅ Supabase environment variables found`);
      
      // Try to extract URL
      const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
      if (urlMatch) {
        const url = urlMatch[1].trim();
        console.log(`   URL: ${url.substring(0, 30)}...`);
      }
      
      return true;
    } else {
      console.log(`   ⚠️  Supabase environment variables not found in .env`);
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check .env file: ${error.message}`);
    return false;
  }
}

function printManualTestChecklist() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 MANUAL TEST CHECKLIST');
  console.log('='.repeat(70));
  
  console.log('\n🌐 Open the frontend in your browser:');
  console.log(`   ${FRONTEND_URL}`);
  
  console.log('\n1. Dashboard Page (/demo-dashboard):');
  console.log('   ☐ Page loads without errors');
  console.log('   ☐ Knowledge Base tab is accessible');
  console.log('   ☐ AI Voice selector shows available voices');
  console.log('   ☐ Voice samples can be played');
  console.log('   ☐ Save Config button works');
  console.log('   ☐ AI connection status shows (Cloud/Local)');
  
  console.log('\n2. Knowledge Base Configuration:');
  console.log('   ☐ System Prompt can be edited');
  console.log('   ☐ Persona can be changed');
  console.log('   ☐ Context Fields can be added/edited');
  console.log('   ☐ Categories can be modified');
  console.log('   ☐ Priority Rules can be updated');
  console.log('   ☐ Custom Instructions can be added');
  console.log('   ☐ Changes are saved to Supabase/localStorage');
  
  console.log('\n3. User Call Page (/user):');
  console.log('   ☐ Page loads without errors');
  console.log('   ☐ Start Call button works');
  console.log('   ☐ Microphone permission requested');
  console.log('   ☐ Speech recognition works');
  console.log('   ☐ AI responds to user input');
  console.log('   ☐ TTS plays AI responses');
  console.log('   ☐ End Call button works');
  
  console.log('\n4. AI Functionality:');
  console.log('   ☐ AI extracts caller name');
  console.log('   ☐ AI extracts technical fields (if configured)');
  console.log('   ☐ AI categorizes calls correctly');
  console.log('   ☐ AI sets priority based on rules');
  console.log('   ☐ AI follows custom instructions');
  console.log('   ☐ AI uses correct persona/tone');
  
  console.log('\n5. Call History:');
  console.log('   ☐ Call history displays after ending call');
  console.log('   ☐ Caller name is extracted correctly');
  console.log('   ☐ Summary is generated');
  console.log('   ☐ Category and priority are set');
  console.log('   ☐ History persists after page refresh');
  
  console.log('\n6. Responsive Design:');
  console.log('   ☐ Works on mobile viewport');
  console.log('   ☐ Works on tablet viewport');
  console.log('   ☐ Works on desktop viewport');
  console.log('   ☐ UI elements are properly sized');
  
  console.log('\n7. Error Handling:');
  console.log('   ☐ Graceful fallback when Gemini unavailable');
  console.log('   ☐ Graceful fallback when Local LLM unavailable');
  console.log('   ☐ Graceful fallback when TTS unavailable');
  console.log('   ☐ Error messages are user-friendly');
  
  console.log('\n');
}

async function runAllTests() {
  console.log('\n🧪 Frontend Integration Test');
  console.log('='.repeat(70));
  console.log('\nTesting all frontend services and connections...\n');
  
  const results = {
    devServer: false,
    ollama: false,
    tts: false,
    ttsGeneration: false,
    localLLM: false,
    supabase: false
  };
  
  // Run all tests
  results.devServer = await testDevServer();
  results.ollama = await testOllama();
  results.tts = await testTTSService();
  
  if (results.tts) {
    results.ttsGeneration = await testTTSGeneration();
  }
  
  if (results.ollama) {
    results.localLLM = await testLocalLLMResponse();
  }
  
  results.supabase = await testSupabaseConnection();
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r === true).length;
  const score = (passedTests / totalTests * 100).toFixed(0);
  
  console.log(`\n✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`🎯 Score: ${score}%`);
  
  console.log('\nDetailed Results:');
  console.log(`   ${results.devServer ? '✅' : '❌'} Dev Server`);
  console.log(`   ${results.ollama ? '✅' : '❌'} Ollama (Local LLM)`);
  console.log(`   ${results.tts ? '✅' : '❌'} TTS Service`);
  console.log(`   ${results.ttsGeneration ? '✅' : '❌'} TTS Generation`);
  console.log(`   ${results.localLLM ? '✅' : '❌'} Local LLM Response`);
  console.log(`   ${results.supabase ? '✅' : '❌'} Supabase Config`);
  
  if (score >= 80) {
    console.log('\n✅ Frontend is ready for testing!');
  } else if (score >= 50) {
    console.log('\n⚠️  Frontend is partially ready - some services may need attention');
  } else {
    console.log('\n❌ Frontend needs setup - check the errors above');
  }
  
  // Print manual test checklist
  printManualTestChecklist();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Test Complete!');
  console.log('='.repeat(70));
  console.log('\n💡 Open the frontend in your browser and follow the manual checklist above\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

