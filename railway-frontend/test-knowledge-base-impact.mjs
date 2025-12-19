import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Test script using dynamic import
const testQuery = "Hi, I'm calling because I have a billing question. Can you help me?";

const configs = [
  {
    name: "Professional Medical Assistant",
    config: {
      systemPrompt: "You are a professional medical assistant. Be formal, empathetic, and focus on patient care. Always prioritize health and safety.",
      persona: "Professional Medical Assistant",
      greeting: "Hello, this is the medical support line. How can I assist you with your health concerns today?",
      responseGuidelines: "Be empathetic, use medical terminology appropriately, prioritize urgent health issues.",
      categories: [
        { id: 'appointment', name: 'Appointment', description: 'Schedule medical appointments' },
        { id: 'billing', name: 'Billing', description: 'Medical billing questions' }
      ],
      priorityRules: [
        "Mark as CRITICAL if patient mentions chest pain or severe symptoms",
        "Billing questions are MEDIUM priority"
      ]
    }
  },
  {
    name: "Casual Tech Support",
    config: {
      systemPrompt: "You are a friendly tech support agent. Be casual, use simple language, and help solve technical problems.",
      persona: "Friendly Tech Support",
      greeting: "Hey there! Thanks for calling tech support. What's going on?",
      responseGuidelines: "Be casual and friendly, avoid jargon, keep it simple.",
      categories: [
        { id: 'billing', name: 'Billing', description: 'Account billing questions' },
        { id: 'technical', name: 'Technical Issue', description: 'Technical problems' }
      ],
      priorityRules: [
        "Billing questions are usually LOW priority unless payment failed"
      ]
    }
  },
  {
    name: "Formal Business Consultant",
    config: {
      systemPrompt: "You are a formal business consultant. Be professional, use business terminology, focus on ROI.",
      persona: "Business Consultant",
      greeting: "Good day. This is the business consulting line. How may I assist?",
      responseGuidelines: "Be formal, use business metrics, focus on ROI, be concise.",
      categories: [
        { id: 'billing', name: 'Billing Inquiry', description: 'Billing questions' },
        { id: 'strategy', name: 'Business Strategy', description: 'Strategic questions' }
      ],
      priorityRules: [
        "Billing questions are MEDIUM priority unless payment failure"
      ]
    }
  }
];

async function testConfig(configData, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Test ${index + 1}: ${configData.name}`);
  console.log('='.repeat(70));
  
  console.log(`\n📋 Configuration:`);
  console.log(`   Persona: ${configData.config.persona}`);
  console.log(`   System Prompt: ${configData.config.systemPrompt.substring(0, 80)}...`);
  
  // Import aiService dynamically
  const { aiService } = await import('./src/services/aiService.js');
  
  // Create knowledge base object
  const kb = {
    systemPrompt: configData.config.systemPrompt,
    persona: configData.config.persona,
    greeting: configData.config.greeting,
    responseGuidelines: configData.config.responseGuidelines,
    categories: configData.config.categories,
    priorityRules: configData.config.priorityRules,
    contextFields: [],
    customInstructions: [],
    selectedVoiceId: 'af_nova'
  };
  
  aiService.setKnowledgeBase(kb);
  aiService.resetState();
  
  console.log(`\n💬 Test Query: "${testQuery}"`);
  console.log(`\n🤖 Calling AI Service...\n`);
  
  const startTime = Date.now();
  
  try {
    const response = await aiService.generateResponse(
      testQuery,
      [],
      []
    );
    
    const duration = Date.now() - startTime;
    
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`\n📝 AI Response:`);
    console.log(`   "${response.text}"`);
    console.log(`\n📊 Analysis:`);
    console.log(`   Confidence: ${response.confidence}`);
    console.log(`   Source: ${response.source || 'unknown'}`);
    
    if (response.suggestedPriority) {
      console.log(`   Suggested Priority: ${response.suggestedPriority}`);
    }
    
    // Check persona match
    const responseLower = response.text.toLowerCase();
    const isFormal = responseLower.includes('good day') || responseLower.includes('professional');
    const isCasual = responseLower.includes('hey') || responseLower.includes('what\'s going');
    const isMedical = responseLower.includes('health') || responseLower.includes('medical');
    
    console.log(`\n🎭 Persona Indicators:`);
    if (isMedical) console.log(`   ✅ Medical terms detected`);
    if (isCasual) console.log(`   ✅ Casual language detected`);
    if (isFormal) console.log(`   ✅ Formal language detected`);
    
    return { config: configData.name, response: response.text, persona: configData.config.persona, duration };
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 Knowledge Base Impact Test');
  console.log('='.repeat(70));
  console.log(`\nTest Query: "${testQuery}"`);
  console.log(`Testing ${configs.length} different configurations...\n`);
  
  const results = [];
  
  for (let i = 0; i < configs.length; i++) {
    const result = await testConfig(configs[i], i);
    if (result) results.push(result);
    
    if (i < configs.length - 1) {
      console.log('\n⏳ Waiting 5 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary');
  console.log('='.repeat(70));
  
  if (results.length > 0) {
    console.log(`\n✅ Tested ${results.length} configurations\n`);
    
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.config}:`);
      console.log(`   "${r.response.substring(0, 120)}${r.response.length > 120 ? '...' : ''}"`);
    });
    
    const uniqueResponses = new Set(results.map(r => r.response.substring(0, 50)));
    console.log(`\n🔍 Unique responses: ${uniqueResponses.size}/${results.length}`);
    
    if (uniqueResponses.size === results.length) {
      console.log(`✅ Knowledge Base IS affecting AI behavior!`);
    } else {
      console.log(`⚠️  Some responses are similar`);
    }
  }
  
  console.log('\n✅ Test Complete!\n');
}

runTests().catch(console.error);
