#!/usr/bin/env node
/**
 * Simple Knowledge Base Impact Test
 * Tests if changing persona/system prompt affects AI responses
 * Tests both Gemini and Local LLM services directly
 */

const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'adrienbrault/nous-hermes2pro:Q4_K_M';
const GEMINI_API_KEY = 'AIzaSyBCrT9WAKhJKlzP_8a5a6DtyVKghA9XRuY';

const testQuery = "Hi, I'm calling because I have a billing question. Can you help me?";

const configs = [
  {
    name: "Medical Assistant",
    persona: "Professional Medical Assistant",
    systemPrompt: "You are a professional medical assistant. Be formal, empathetic, and focus on patient care. Always prioritize health and safety. Use medical terminology appropriately.",
    greeting: "Hello, this is the medical support line. How can I assist you with your health concerns today?",
    categories: [
      { id: 'billing', name: 'Medical Billing', description: 'Medical billing questions' }
    ]
  },
  {
    name: "Casual Tech Support",
    persona: "Friendly Tech Support",
    systemPrompt: "You are a friendly tech support agent. Be casual, use simple language, and help solve technical problems. Keep it light and conversational. Avoid jargon.",
    greeting: "Hey there! Thanks for calling tech support. What's going on with your tech today?",
    categories: [
      { id: 'billing', name: 'Billing', description: 'Account billing questions' }
    ]
  },
  {
    name: "Formal Business",
    persona: "Business Consultant",
    systemPrompt: "You are a formal business consultant. Be professional, use business terminology, and focus on ROI and business impact. Always be concise and data-driven.",
    greeting: "Good day. This is the business consulting line. How may I assist with your business needs today?",
    categories: [
      { id: 'billing', name: 'Billing Inquiry', description: 'Billing and payment questions' }
    ]
  }
];

function buildSystemPrompt(kb) {
  const categoryList = kb.categories.map(c => `- ${c.id}: ${c.name}`).join('\n');
  
  return `You are ${kb.persona}. ${kb.systemPrompt}

GREETING: "${kb.greeting}"

CATEGORIES:
${categoryList}

RULES:
- Match the persona and tone exactly
- Use the greeting style when appropriate
- Follow the system prompt guidelines

Respond naturally as ${kb.persona} would.`;
}

async function testWithLocalLLM(kb, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Test ${index + 1}: ${kb.name} (Local LLM - Hermes 2 Pro)`);
  console.log('='.repeat(70));
  
  console.log(`\n📋 Persona: ${kb.persona}`);
  console.log(`💬 Query: "${testQuery}"`);
  console.log(`\n🤖 Calling Hermes 2 Pro...\n`);
  
  const systemPrompt = buildSystemPrompt(kb);
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: testQuery }
        ],
        stream: false,
        options: {
          num_ctx: 2048,
          num_predict: 256,
          temperature: 0.7
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }
    
    const data = await response.json();
    const duration = Date.now() - startTime;
    const aiResponse = data.message?.content || '';
    
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`\n📝 AI Response:`);
    console.log(`   "${aiResponse}"`);
    
    // Analyze persona match
    const responseLower = aiResponse.toLowerCase();
    const isFormal = responseLower.includes('good day') || responseLower.includes('professional') || 
                     responseLower.includes('business') || responseLower.includes('consulting');
    const isCasual = responseLower.includes('hey') || responseLower.includes('what\'s going') ||
                     responseLower.includes('thanks for calling');
    const isMedical = responseLower.includes('health') || responseLower.includes('medical') ||
                      responseLower.includes('patient') || responseLower.includes('concerns');
    
    console.log(`\n🎭 Persona Analysis:`);
    if (kb.name.includes('Medical') && isMedical) {
      console.log(`   ✅ Medical persona detected`);
    } else if (kb.name.includes('Casual') && isCasual) {
      console.log(`   ✅ Casual persona detected`);
    } else if (kb.name.includes('Formal') && isFormal) {
      console.log(`   ✅ Formal persona detected`);
    } else {
      console.log(`   ⚠️  Persona may not be fully reflected`);
    }
    
    return { config: kb.name, response: aiResponse, duration, persona: kb.persona };
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return null;
  }
}

async function testWithGemini(kb, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Test ${index + 1}: ${kb.name} (Gemini API)`);
  console.log('='.repeat(70));
  
  console.log(`\n📋 Persona: ${kb.persona}`);
  console.log(`💬 Query: "${testQuery}"`);
  console.log(`\n🤖 Calling Gemini API...\n`);
  
  const systemPrompt = buildSystemPrompt(kb);
  const startTime = Date.now();
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `System: ${systemPrompt}\n\nUser: ${testQuery}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini error: ${response.status} - ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    const duration = Date.now() - startTime;
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`\n📝 AI Response:`);
    console.log(`   "${aiResponse}"`);
    
    // Analyze persona match
    const responseLower = aiResponse.toLowerCase();
    const isFormal = responseLower.includes('good day') || responseLower.includes('professional');
    const isCasual = responseLower.includes('hey') || responseLower.includes('what\'s going');
    const isMedical = responseLower.includes('health') || responseLower.includes('medical');
    
    console.log(`\n🎭 Persona Analysis:`);
    if (kb.name.includes('Medical') && isMedical) {
      console.log(`   ✅ Medical persona detected`);
    } else if (kb.name.includes('Casual') && isCasual) {
      console.log(`   ✅ Casual persona detected`);
    } else if (kb.name.includes('Formal') && isFormal) {
      console.log(`   ✅ Formal persona detected`);
    } else {
      console.log(`   ⚠️  Persona may not be fully reflected`);
    }
    
    return { config: kb.name, response: aiResponse, duration, persona: kb.persona };
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 Knowledge Base Impact Test');
  console.log('='.repeat(70));
  console.log('\nTesting if Knowledge Base changes affect AI behavior');
  console.log(`Test Query: "${testQuery}"`);
  console.log(`\nTesting ${configs.length} configurations with both AI services...\n`);
  
  const localResults = [];
  const geminiResults = [];
  
  // Test with Local LLM
  console.log('\n' + '🖥️  TESTING WITH LOCAL LLM (HERMES 2 PRO)'.padEnd(70, ' '));
  console.log('='.repeat(70));
  
  for (let i = 0; i < configs.length; i++) {
    const result = await testWithLocalLLM(configs[i], i);
    if (result) localResults.push(result);
    
    if (i < configs.length - 1) {
      console.log('\n⏳ Waiting 3 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Test with Gemini
  console.log('\n\n' + '☁️  TESTING WITH GEMINI API'.padEnd(70, ' '));
  console.log('='.repeat(70));
  
  for (let i = 0; i < configs.length; i++) {
    const result = await testWithGemini(configs[i], i);
    if (result) geminiResults.push(result);
    
    if (i < configs.length - 1) {
      console.log('\n⏳ Waiting 3 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(70));
  
  if (localResults.length > 0) {
    console.log(`\n🖥️  Local LLM Results (${localResults.length} tests):`);
    localResults.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.config}:`);
      console.log(`   "${r.response.substring(0, 100)}${r.response.length > 100 ? '...' : ''}"`);
    });
    
    const uniqueLocal = new Set(localResults.map(r => r.response.substring(0, 50)));
    console.log(`\n   Unique responses: ${uniqueLocal.size}/${localResults.length}`);
    if (uniqueLocal.size === localResults.length) {
      console.log(`   ✅ Knowledge Base IS affecting Local LLM!`);
    }
  }
  
  if (geminiResults.length > 0) {
    console.log(`\n☁️  Gemini Results (${geminiResults.length} tests):`);
    geminiResults.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.config}:`);
      console.log(`   "${r.response.substring(0, 100)}${r.response.length > 100 ? '...' : ''}"`);
    });
    
    const uniqueGemini = new Set(geminiResults.map(r => r.response.substring(0, 50)));
    console.log(`\n   Unique responses: ${uniqueGemini.size}/${geminiResults.length}`);
    if (uniqueGemini.size === geminiResults.length) {
      console.log(`   ✅ Knowledge Base IS affecting Gemini!`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Test Complete!');
  console.log('='.repeat(70));
  console.log('\n💡 If responses differ between configs, Knowledge Base changes ARE working!');
  console.log('💡 Check the persona analysis to see if tone/style matches the configuration\n');
}

runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

