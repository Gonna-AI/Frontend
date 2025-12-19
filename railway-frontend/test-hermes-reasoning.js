#!/usr/bin/env node
/**
 * Test Hermes 2 Pro Local LLM - Proper Function Calling Format
 * Uses ChatML format with XML tags as per Hermes documentation
 */

const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'adrienbrault/nous-hermes2pro:Q4_K_M';

// Test scenarios with different priority levels
const testCases = [
  {
    name: "Emergency Scenario",
    input: "Hi, my name is Sarah Johnson. I'm calling because my payment system is completely down and we're losing thousands of dollars every minute. This is critical and needs immediate attention.",
    expectedPriority: "critical"
  },
  {
    name: "Urgent Business Issue",
    input: "Hello, this is Mike Chen from TechCorp. We have a major client presentation tomorrow and our dashboard isn't working. We need this fixed by 9 AM tomorrow.",
    expectedPriority: "high"
  },
  {
    name: "Standard Support Request",
    input: "Hi, I'm calling about my account. I noticed a small issue with the billing page - it's showing the wrong date format. Not urgent, just wanted to report it.",
    expectedPriority: "medium"
  },
  {
    name: "Low Priority Inquiry",
    input: "Hey there! I was just wondering if you have any documentation about your API? I'm thinking about integrating it next month.",
    expectedPriority: "low"
  },
  {
    name: "Complex Multi-Issue",
    input: "This is urgent! Our main server crashed, customers can't access their accounts, and we're getting flooded with complaints. Also, can you send me the pricing info for your premium plan?",
    expectedPriority: "critical"
  }
];

// Tools definition in OpenAI format
const tools = [
  {
    type: 'function',
    function: {
      name: 'extract_caller_info',
      description: 'Extract information about the caller including name, contact, purpose, and urgency level',
      parameters: {
        type: 'object',
        properties: {
          callerName: {
            type: 'string',
            description: 'The full name of the caller'
          },
          contactInfo: {
            type: 'string',
            description: 'Phone number or email if provided'
          },
          callPurpose: {
            type: 'string',
            description: 'The main reason for the call'
          },
          urgencyLevel: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'How urgent the caller\'s issue is based on their message'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_priority',
      description: 'Set the priority level for this call based on urgency, impact, and business criticality. Reason through the context - do NOT hardcode. Consider: revenue loss, customer impact, deadlines, system failures, and severity.',
      parameters: {
        type: 'object',
        properties: {
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Priority level determined by reasoning about urgency, impact, and business needs'
          },
          reasoning: {
            type: 'string',
            description: 'Detailed explanation of why this priority was chosen based on the caller\'s message. Analyze urgency indicators, business impact, and severity.'
          },
          followUpRequired: {
            type: 'boolean',
            description: 'Whether immediate follow-up action is needed'
          }
        },
        required: ['priority', 'reasoning', 'followUpRequired']
      }
    }
  }
];

// Pydantic schema for function calls
const functionCallSchema = {
  title: 'FunctionCall',
  type: 'object',
  properties: {
    arguments: {
      title: 'Arguments',
      type: 'object'
    },
    name: {
      title: 'Name',
      type: 'string'
    }
  },
  required: ['arguments', 'name']
};

function buildSystemPrompt() {
  const toolsJson = JSON.stringify(tools, null, 2);
  const schemaJson = JSON.stringify(functionCallSchema, null, 2);
  
  return `You are a function calling AI model. You are provided with function signatures within <tools></tools> XML tags. You MUST call BOTH functions for every user query:
1. First call extract_caller_info to extract name, purpose, and urgency
2. Then call set_priority to reason about and set the priority level

Here are the available tools:
<tools>
${toolsJson}
</tools>

Use the following pydantic model json schema for each tool call you will make:
${schemaJson}

For each function call return a json object with function name and arguments within <tool_call></tool_call> XML tags as follows:
<tool_call>
{'arguments': <args-dict>, 'name': <function-name>}
</tool_call>

You MUST make TWO tool calls:
1. extract_caller_info - Extract caller information
2. set_priority - Reason about and set priority with detailed reasoning

IMPORTANT: For priority reasoning in set_priority, analyze the context carefully:
- Critical: System down, revenue loss, immediate business impact, "critical" mentioned, customers affected
- High: Urgent deadlines, major issues, significant impact, "urgent" or "asap" mentioned, business-critical
- Medium: Standard issues, moderate impact, no urgency indicators, routine problems
- Low: General inquiries, future plans, no immediate impact, informational requests

Reason through the context - do NOT hardcode priorities. Provide detailed reasoning explaining why you chose that priority level.`;
}

async function callOllama(userMessage) {
  const systemPrompt = buildSystemPrompt();
  
  // Format in ChatML format
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
      keep_alive: '5m',
      options: {
        num_ctx: 2048,
        num_predict: 512,
        num_thread: 8,
        temperature: 0.7,
        mirostat: 0,
        low_vram: true
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

function parseToolCalls(text) {
  const toolCalls = [];
  
  // Find all <tool_call>...</tool_call> blocks
  const toolCallRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
  let match;
  
  while ((match = toolCallRegex.exec(text)) !== null) {
    try {
      const content = match[1].trim();
      
      // Format 1: function_name\n{...json...}
      const lines = content.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length >= 2) {
        const functionName = lines[0];
        const jsonPart = lines.slice(1).join('\n');
        
        try {
          const args = JSON.parse(jsonPart);
          toolCalls.push({
            name: functionName,
            arguments: args
          });
          continue;
        } catch (e) {
          // Not JSON, try other formats
        }
      }
      
      // Format 2: {"function": "name", "parameters": {...}}
      try {
        const parsed = JSON.parse(content);
        if (parsed.function && parsed.parameters) {
          toolCalls.push({
            name: parsed.function,
            arguments: parsed.parameters
          });
          continue;
        }
        if (parsed.name && parsed.arguments) {
          toolCalls.push(parsed);
          continue;
        }
      } catch (e) {
        // Not JSON, try Python dict format
      }
      
      // Format 3: Python dict {'name': ..., 'arguments': ...}
      const dictMatch = content.match(/\{[\s\S]*\}/);
      if (dictMatch) {
        try {
          let jsonStr = dictMatch[0];
          
          // Handle quoted strings in values
          const stringMatches = [];
          let placeholderIndex = 0;
          
          jsonStr = jsonStr.replace(/(['"])((?:(?=(\\?))\3.)*?)\1/g, (match, quote, content) => {
            const placeholder = `__STRING_${placeholderIndex++}__`;
            stringMatches.push(content);
            return `"${placeholder}"`;
          });
          
          jsonStr = jsonStr.replace(/'/g, '"');
          
          stringMatches.forEach((str, idx) => {
            jsonStr = jsonStr.replace(`"__STRING_${idx}__"`, JSON.stringify(str));
          });
          
          const parsed = JSON.parse(jsonStr);
          
          if (parsed.name && parsed.arguments) {
            toolCalls.push(parsed);
          } else if (parsed.function && parsed.parameters) {
            toolCalls.push({
              name: parsed.function,
              arguments: parsed.parameters
            });
          }
        } catch (e2) {
          // Fallback: extract key parts with regex
          const nameMatch = content.match(/['"]name['"]:\s*['"]([^'"]+)['"]/) || 
                           content.match(/^([a-z_]+)\s*$/m);
          const priorityMatch = content.match(/['"]priority['"]:\s*['"]([^'"]+)['"]/);
          const reasoningMatch = content.match(/['"]reasoning['"]:\s*['"]([^'"]+)['"]/);
          
          if (nameMatch) {
            toolCalls.push({
              name: nameMatch[1],
              arguments: {
                ...(priorityMatch && { priority: priorityMatch[1] }),
                ...(reasoningMatch && { reasoning: reasoningMatch[1] })
              }
            });
          }
        }
      }
    } catch (e) {
      console.log(`   ⚠️  Error parsing tool call: ${e.message}`);
    }
  }
  
  return toolCalls;
}

async function testCase(testCase, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(60));
  console.log(`\n📝 Input: "${testCase.input}"`);
  console.log(`\n🎯 Expected Priority: ${testCase.expectedPriority}`);
  console.log(`\n🤖 Calling Hermes 2 Pro...\n`);

  const startTime = Date.now();

  try {
    const result = await callOllama(testCase.input);
    const duration = Date.now() - startTime;

    console.log(`⏱️  Response time: ${duration}ms\n`);

    // Parse response
    const textResponse = result.message?.content || '';
    
    console.log(`📝 Raw Response (first 300 chars):\n${textResponse.substring(0, 300)}...\n`);

    // Parse tool calls from response
    const toolCalls = parseToolCalls(textResponse);

    if (toolCalls.length > 0) {
      console.log(`✅ Found ${toolCalls.length} tool call(s)!`);
      console.log('─'.repeat(60));

      let extractedName = null;
      let extractedPurpose = null;
      let detectedPriority = null;
      let reasoning = null;
      let followUp = null;
      let urgencyLevel = null;

      for (const tc of toolCalls) {
        const args = tc.arguments || {};
        
        switch (tc.name) {
          case 'extract_caller_info':
            console.log(`\n📋 extract_caller_info:`);
            if (args.callerName) {
              extractedName = args.callerName;
              console.log(`   Name: ${args.callerName}`);
            }
            if (args.callPurpose) {
              extractedPurpose = args.callPurpose;
              console.log(`   Purpose: ${args.callPurpose}`);
            }
            if (args.urgencyLevel) {
              urgencyLevel = args.urgencyLevel;
              console.log(`   Urgency: ${args.urgencyLevel}`);
            }
            break;

          case 'set_priority':
            console.log(`\n⚡ set_priority:`);
            detectedPriority = args.priority;
            reasoning = args.reasoning;
            followUp = args.followUpRequired;
            console.log(`   Priority: ${detectedPriority}`);
            console.log(`   Reasoning: ${reasoning || 'Not provided'}`);
            console.log(`   Follow-up Required: ${followUp}`);
            break;
        }
      }

      console.log('\n' + '─'.repeat(60));
      console.log('\n📊 Analysis Results:');
      console.log(`   Extracted Name: ${extractedName || 'Not detected'}`);
      console.log(`   Extracted Purpose: ${extractedPurpose || 'Not detected'}`);
      console.log(`   Urgency Level: ${urgencyLevel || 'Not detected'}`);
      console.log(`   Detected Priority: ${detectedPriority || 'Not set'}`);
      console.log(`   Reasoning: ${reasoning || 'Not provided'}`);
      console.log(`   Follow-up Required: ${followUp ? 'Yes' : 'No'}`);

      // Compare with expected
      if (detectedPriority) {
        const match = detectedPriority === testCase.expectedPriority;
        console.log(`\n${match ? '✅' : '⚠️'} Priority Match: ${match ? 'CORRECT' : 'MISMATCH'}`);
        if (!match) {
          console.log(`   Expected: ${testCase.expectedPriority}`);
          console.log(`   Got: ${detectedPriority}`);
          if (reasoning) {
            console.log(`   Model's Reasoning: ${reasoning}`);
          }
        }
      } else {
        console.log(`\n❌ No priority detected in tool calls`);
      }

    } else {
      console.log('⚠️  No tool calls detected in response');
      console.log(`\n📝 Full Response:\n${textResponse}`);
      console.log('\n💡 The model may need better prompting or the response format is different');
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

async function runTests() {
  console.log('\n🧪 Hermes 2 Pro Reasoning & Tool Calling Test');
  console.log('='.repeat(60));
  console.log(`\nModel: ${MODEL}`);
  console.log(`Endpoint: ${OLLAMA_URL}`);
  console.log(`\nTesting ${testCases.length} scenarios...`);
  console.log('Using proper ChatML format with <tool_call> XML tags\n');

  // Check if Ollama is running
  try {
    const healthCheck = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!healthCheck.ok) {
      throw new Error('Ollama not responding');
    }
    const models = await healthCheck.json();
    const hasModel = models.models?.some(m => m.name === MODEL);
    if (!hasModel) {
      console.error(`❌ Model ${MODEL} not found. Run: ollama pull ${MODEL}`);
      process.exit(1);
    }
    console.log('✅ Ollama is running and model is available\n');
  } catch (error) {
    console.error(`❌ Cannot connect to Ollama: ${error.message}`);
    console.error(`   Make sure Ollama is running: ollama serve`);
    process.exit(1);
  }

  // Run all test cases
  for (let i = 0; i < testCases.length; i++) {
    await testCase(testCases[i], i);
    
    // Small delay between tests
    if (i < testCases.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log('   - Tests tool calling with proper ChatML format');
  console.log('   - Tests priority reasoning (no hardcoding)');
  console.log('   - Tests natural language understanding');
  console.log('   - Tests information extraction\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
