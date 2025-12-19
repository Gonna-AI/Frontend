#!/usr/bin/env node
/**
 * Test Knowledge Base Impact on AI Behavior
 * 
 * Tests if changing persona, system prompt, categories, etc.
 * actually changes the AI's responses
 */

import { aiService } from './src/services/aiService.js';
import { 
  KnowledgeBaseConfig,
  CallMessage 
} from './src/contexts/DemoCallContext.js';

// Test query that should show different responses based on persona
const testQuery = "Hi, I'm calling because I have a billing question. Can you help me?";

// Different Knowledge Base configurations to test
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
        { id: 'billing', name: 'Billing', description: 'Medical billing questions' },
        { id: 'urgent', name: 'Urgent Care', description: 'Urgent medical issues' }
      ],
      priorityRules: [
        "Mark as CRITICAL if patient mentions chest pain, difficulty breathing, or severe symptoms",
        "Mark as HIGH if appointment needed within 24 hours",
        "Standard billing questions are MEDIUM priority"
      ]
    }
  },
  {
    name: "Casual Tech Support",
    config: {
      systemPrompt: "You are a friendly tech support agent. Be casual, use simple language, and help solve technical problems. Keep it light and conversational.",
      persona: "Friendly Tech Support",
      greeting: "Hey there! Thanks for calling tech support. What's going on with your tech today?",
      responseGuidelines: "Be casual and friendly, avoid jargon, use examples, keep it simple.",
      categories: [
        { id: 'billing', name: 'Billing', description: 'Account billing questions' },
        { id: 'technical', name: 'Technical Issue', description: 'Technical problems' },
        { id: 'feature', name: 'Feature Request', description: 'Request new features' }
      ],
      priorityRules: [
        "Mark as CRITICAL if system is completely down",
        "Billing questions are usually LOW priority unless payment failed",
        "Feature requests are LOW priority"
      ]
    }
  },
  {
    name: "Formal Business Consultant",
    config: {
      systemPrompt: "You are a formal business consultant. Be professional, use business terminology, and focus on ROI and business impact. Always be concise and data-driven.",
      persona: "Business Consultant",
      greeting: "Good day. This is the business consulting line. How may I assist with your business needs today?",
      responseGuidelines: "Be formal, use business metrics, focus on ROI, be data-driven, keep responses concise.",
      categories: [
        { id: 'billing', name: 'Billing Inquiry', description: 'Billing and payment questions' },
        { id: 'strategy', name: 'Business Strategy', description: 'Strategic business questions' },
        { id: 'partnership', name: 'Partnership', description: 'Partnership opportunities' }
      ],
      priorityRules: [
        "Mark as CRITICAL if revenue impact exceeds $10,000",
        "Billing questions are MEDIUM priority unless payment failure",
        "Partnership inquiries are HIGH priority"
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
  console.log(`   Greeting: ${configData.config.greeting}`);
  
  // Set up knowledge base
  const kb: KnowledgeBaseConfig = {
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
  
  // Update AI service with this knowledge base
  aiService.setKnowledgeBase(kb);
  
  // Reset state for clean test
  aiService.resetState();
  
  console.log(`\n💬 Test Query: "${testQuery}"`);
  console.log(`\n🤖 Calling AI Service...\n`);
  
  const startTime = Date.now();
  
  try {
    const response = await aiService.generateResponse(
      testQuery,
      [], // No conversation history
      []  // No extracted fields yet
    );
    
    const duration = Date.now() - startTime;
    
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`\n📝 AI Response:`);
    console.log(`   "${response.text}"`);
    console.log(`\n📊 Analysis:`);
    console.log(`   Confidence: ${response.confidence}`);
    
    if (response.extractedFields && response.extractedFields.length > 0) {
      console.log(`   Extracted Fields:`);
      response.extractedFields.forEach(field => {
        console.log(`     - ${field.label}: ${field.value} (${(field.confidence * 100).toFixed(0)}%)`);
      });
    }
    
    if (response.suggestedPriority) {
      console.log(`   Suggested Priority: ${response.suggestedPriority}`);
    }
    
    if (response.suggestedCategory) {
      console.log(`   Suggested Category: ${response.suggestedCategory.name}`);
    }
    
    // Analyze if response matches persona
    const responseLower = response.text.toLowerCase();
    const isFormal = responseLower.includes('good day') || responseLower.includes('professional') || 
                     responseLower.includes('business') || responseLower.includes('consulting');
    const isCasual = responseLower.includes('hey') || responseLower.includes('what\'s going on') ||
                     responseLower.includes('cool') || responseLower.includes('awesome');
    const isMedical = responseLower.includes('health') || responseLower.includes('medical') ||
                      responseLower.includes('patient') || responseLower.includes('symptoms');
    
    console.log(`\n🎭 Persona Match:`);
    if (configData.name.includes('Medical') && isMedical) {
      console.log(`   ✅ Response shows medical persona`);
    } else if (configData.name.includes('Casual') && isCasual) {
      console.log(`   ✅ Response shows casual persona`);
    } else if (configData.name.includes('Formal') && isFormal) {
      console.log(`   ✅ Response shows formal business persona`);
    } else {
      console.log(`   ⚠️  Response may not fully match persona`);
    }
    
    return {
      config: configData.name,
      response: response.text,
      persona: configData.config.persona,
      duration
    };
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 Knowledge Base Impact Test');
  console.log('='.repeat(70));
  console.log('\nTesting if Knowledge Base changes actually affect AI behavior');
  console.log(`\nTest Query: "${testQuery}"`);
  console.log(`\nTesting ${configs.length} different configurations...\n`);
  
  const results = [];
  
  // Test each configuration
  for (let i = 0; i < configs.length; i++) {
    const result = await testConfig(configs[i], i);
    if (result) {
      results.push(result);
    }
    
    // Wait between tests
    if (i < configs.length - 1) {
      console.log('\n⏳ Waiting 5 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary');
  console.log('='.repeat(70));
  
  if (results.length > 0) {
    console.log(`\n✅ Tested ${results.length} configurations\n`);
    
    console.log('Response Comparison:');
    results.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.config} (${r.persona}):`);
      console.log(`   "${r.response.substring(0, 100)}${r.response.length > 100 ? '...' : ''}"`);
      console.log(`   Time: ${r.duration}ms`);
    });
    
    // Check if responses are actually different
    const uniqueResponses = new Set(results.map(r => r.response.substring(0, 50)));
    console.log(`\n🔍 Analysis:`);
    console.log(`   Unique responses: ${uniqueResponses.size} out of ${results.length}`);
    
    if (uniqueResponses.size === results.length) {
      console.log(`   ✅ All responses are different - Knowledge Base IS affecting AI!`);
    } else if (uniqueResponses.size > 1) {
      console.log(`   ⚠️  Some responses are similar - Knowledge Base partially affecting AI`);
    } else {
      console.log(`   ❌ All responses are the same - Knowledge Base may not be affecting AI`);
    }
    
    // Check persona differences
    const personas = results.map(r => r.persona);
    const uniquePersonas = new Set(personas);
    console.log(`   Unique personas tested: ${uniquePersonas.size}`);
    
  } else {
    console.log('\n❌ No successful tests');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Test Complete!');
  console.log('='.repeat(70));
  console.log('\n💡 If responses differ, Knowledge Base changes ARE working!');
  console.log('💡 If responses are identical, check aiService.setKnowledgeBase()\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

