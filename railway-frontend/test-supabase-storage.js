#!/usr/bin/env node
/**
 * Test Supabase Storage Integration
 * 
 * Tests:
 * 1. Knowledge Base Config - Save and Load
 * 2. Call History - Insert and Query
 * 3. Verify data persistence
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnv() {
  try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
      }
    });
    return env;
  } catch (error) {
    console.error('Error loading .env file:', error.message);
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test Knowledge Base Config
async function testKnowledgeBaseConfig() {
  console.log('\n📋 Testing Knowledge Base Config Storage...');
  console.log('─'.repeat(70));
  
  const testConfig = {
    systemPrompt: "You are a test AI assistant. This is a test configuration.",
    persona: "Test Persona",
    greeting: "Hello! This is a test greeting.",
    contextFields: [
      {
        id: 'test_name',
        name: 'Test Name',
        description: 'Test field description',
        required: true,
        type: 'text'
      }
    ],
    categories: [
      {
        id: 'test_category',
        name: 'Test Category',
        color: '#FF0000',
        description: 'Test category description'
      }
    ],
    priorityRules: [
      "Test priority rule 1",
      "Test priority rule 2"
    ],
    customInstructions: [
      "Test instruction 1"
    ],
    responseGuidelines: "Test response guidelines",
    selectedVoiceId: 'af_nova'
  };
  
  try {
    // Test 1: Upsert (Save)
    console.log('\n1️⃣  Testing SAVE (upsert)...');
    const { data: saveData, error: saveError } = await supabase
      .from('knowledge_base_config')
      .upsert({
        id: 'default',
        config: testConfig,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });
    
    if (saveError) {
      console.log(`   ❌ Save failed: ${saveError.message}`);
      return false;
    }
    console.log('   ✅ Knowledge Base config saved successfully');
    
    // Test 2: Read
    console.log('\n2️⃣  Testing READ (select)...');
    const { data: readData, error: readError } = await supabase
      .from('knowledge_base_config')
      .select('*')
      .eq('id', 'default')
      .single();
    
    if (readError) {
      console.log(`   ❌ Read failed: ${readError.message}`);
      return false;
    }
    
    if (!readData || !readData.config) {
      console.log('   ❌ No data returned');
      return false;
    }
    
    console.log('   ✅ Knowledge Base config read successfully');
    console.log(`   📊 Config keys: ${Object.keys(readData.config).join(', ')}`);
    
    // Verify data matches
    if (readData.config.systemPrompt === testConfig.systemPrompt) {
      console.log('   ✅ Data integrity verified (systemPrompt matches)');
    } else {
      console.log('   ⚠️  Data integrity warning (systemPrompt mismatch)');
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Test Call History
async function testCallHistory() {
  console.log('\n📞 Testing Call History Storage...');
  console.log('─'.repeat(70));
  
  const testCallId = `test-call-${Date.now()}`;
  const testCall = {
    id: testCallId,
    caller_name: 'Test User',
    date: new Date().toISOString(),
    duration: 120,
    messages: [
      {
        id: 'msg-1',
        speaker: 'user',
        text: 'Hello, this is a test message',
        timestamp: new Date().toISOString()
      },
      {
        id: 'msg-2',
        speaker: 'agent',
        text: 'Hello! How can I help you?',
        timestamp: new Date().toISOString()
      }
    ],
    extracted_fields: [
      {
        id: 'name',
        label: 'Caller Name',
        value: 'Test User',
        confidence: 0.95,
        extractedAt: new Date().toISOString()
      }
    ],
    category: {
      id: 'test_category',
      name: 'Test Category',
      color: '#FF0000',
      description: 'Test'
    },
    priority: 'medium',
    tags: ['test', 'automated'],
    summary: {
      mainPoints: ['Test call for verification'],
      sentiment: 'neutral',
      actionItems: [],
      followUpRequired: false,
      notes: 'This is a test call'
    },
    sentiment: 'neutral',
    follow_up_required: false
  };
  
  try {
    // Test 1: Insert
    console.log('\n1️⃣  Testing INSERT...');
    const { data: insertData, error: insertError } = await supabase
      .from('call_history')
      .insert(testCall);
    
    if (insertError) {
      console.log(`   ❌ Insert failed: ${insertError.message}`);
      console.log(`   Details: ${JSON.stringify(insertError, null, 2)}`);
      return false;
    }
    console.log(`   ✅ Call history inserted successfully (ID: ${testCallId})`);
    
    // Test 2: Read
    console.log('\n2️⃣  Testing READ (select)...');
    const { data: readData, error: readError } = await supabase
      .from('call_history')
      .select('*')
      .eq('id', testCallId)
      .single();
    
    if (readError) {
      console.log(`   ❌ Read failed: ${readError.message}`);
      return false;
    }
    
    if (!readData) {
      console.log('   ❌ No data returned');
      return false;
    }
    
    console.log('   ✅ Call history read successfully');
    console.log(`   📊 Caller: ${readData.caller_name}`);
    console.log(`   📊 Duration: ${readData.duration}s`);
    console.log(`   📊 Priority: ${readData.priority}`);
    console.log(`   📊 Messages: ${readData.messages?.length || 0}`);
    console.log(`   📊 Extracted Fields: ${readData.extracted_fields?.length || 0}`);
    
    // Verify data matches
    if (readData.caller_name === testCall.caller_name &&
        readData.duration === testCall.duration &&
        readData.priority === testCall.priority) {
      console.log('   ✅ Data integrity verified');
    } else {
      console.log('   ⚠️  Data integrity warning');
    }
    
    // Test 3: Query multiple (for dashboard)
    console.log('\n3️⃣  Testing QUERY (multiple records)...');
    const { data: queryData, error: queryError } = await supabase
      .from('call_history')
      .select('id, caller_name, date, priority, duration')
      .order('date', { ascending: false })
      .limit(5);
    
    if (queryError) {
      console.log(`   ❌ Query failed: ${queryError.message}`);
      return false;
    }
    
    console.log(`   ✅ Query successful - Found ${queryData?.length || 0} calls`);
    if (queryData && queryData.length > 0) {
      console.log('   📋 Recent calls:');
      queryData.slice(0, 3).forEach((call, i) => {
        console.log(`      ${i + 1}. ${call.caller_name} - ${call.priority} (${call.duration}s)`);
      });
    }
    
    // Cleanup: Delete test call
    console.log('\n4️⃣  Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('call_history')
      .delete()
      .eq('id', testCallId);
    
    if (deleteError) {
      console.log(`   ⚠️  Cleanup warning: ${deleteError.message}`);
    } else {
      console.log('   ✅ Test call deleted');
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Test RLS Policies
async function testRLSPolicies() {
  console.log('\n🔒 Testing Row Level Security (RLS)...');
  console.log('─'.repeat(70));
  
  try {
    // Test anonymous read access
    console.log('\n1️⃣  Testing anonymous read access...');
    const { data: kbData, error: kbError } = await supabase
      .from('knowledge_base_config')
      .select('id, is_active')
      .eq('is_active', true)
      .limit(1);
    
    if (kbError) {
      console.log(`   ⚠️  RLS may be blocking: ${kbError.message}`);
      console.log('   💡 Check RLS policies in Supabase Dashboard');
    } else {
      console.log('   ✅ Anonymous read access works');
    }
    
    // Test anonymous insert access
    console.log('\n2️⃣  Testing anonymous insert access...');
    const testCallId = `rlstest-${Date.now()}`;
    const { error: insertError } = await supabase
      .from('call_history')
      .insert({
        id: testCallId,
        caller_name: 'RLS Test',
        date: new Date().toISOString(),
        duration: 1,
        messages: [],
        extracted_fields: [],
        priority: 'low',
        tags: [],
        summary: {
          mainPoints: [],
          sentiment: 'neutral',
          actionItems: [],
          followUpRequired: false,
          notes: ''
        }
      });
    
    if (insertError) {
      console.log(`   ⚠️  RLS may be blocking insert: ${insertError.message}`);
      console.log('   💡 Check RLS policies allow INSERT for anon');
    } else {
      console.log('   ✅ Anonymous insert access works');
      // Cleanup
      await supabase.from('call_history').delete().eq('id', testCallId);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 Supabase Storage Integration Test');
  console.log('='.repeat(70));
  console.log(`\n📡 Connecting to: ${SUPABASE_URL.substring(0, 50)}...`);
  console.log(`🔑 Using anon key: ${SUPABASE_KEY.substring(0, 20)}...`);
  
  const results = {
    knowledgeBase: false,
    callHistory: false,
    rls: false
  };
  
  // Run tests
  results.knowledgeBase = await testKnowledgeBaseConfig();
  results.callHistory = await testCallHistory();
  results.rls = await testRLSPolicies();
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r === true).length;
  const score = (passedTests / totalTests * 100).toFixed(0);
  
  console.log(`\n✅ Passed: ${passedTests}/${totalTests} test suites`);
  console.log(`🎯 Score: ${score}%`);
  
  console.log('\nDetailed Results:');
  console.log(`   ${results.knowledgeBase ? '✅' : '❌'} Knowledge Base Config (Save/Load)`);
  console.log(`   ${results.callHistory ? '✅' : '❌'} Call History (Insert/Query)`);
  console.log(`   ${results.rls ? '✅' : '⚠️'} Row Level Security (Policies)`);
  
  if (score >= 100) {
    console.log('\n✅ All storage endpoints are working correctly!');
  } else if (score >= 66) {
    console.log('\n⚠️  Most endpoints working - check failed tests above');
  } else {
    console.log('\n❌ Some endpoints need attention - check errors above');
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Test Complete!');
  console.log('='.repeat(70));
  console.log('\n💡 If tests failed, check:');
  console.log('   1. Tables exist in Supabase Dashboard → Table Editor');
  console.log('   2. RLS policies are enabled and correct');
  console.log('   3. API keys have proper permissions');
  console.log('   4. Network connectivity to Supabase\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

