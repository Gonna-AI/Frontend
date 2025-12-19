#!/usr/bin/env node
/**
 * Comprehensive Knowledge Base Test
 * 
 * Tests:
 * 1. Technical Context Fields - Can AI extract complex technical info?
 * 2. Priority Rules - Do custom priority rules actually work?
 * 3. Custom Instructions - Are instructions followed?
 * 4. All together - Does everything work in a real scenario?
 */

const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'adrienbrault/nous-hermes2pro:Q4_K_M';

// Complex scenario with technical details
const testScenario = {
  name: "Complex Technical Support Call",
  input: `Hi, my name is Alex Martinez. I'm the CTO at TechStartup Inc. 
  
We're experiencing a critical production outage. Our main API server (IP: 192.168.1.100) crashed at 2:30 PM today. 
The error code is ERR_500_INTERNAL and it's affecting all our customers - we have about 10,000 active users right now.

Our API key is: sk_live_abc123xyz789 and the database connection string is: postgresql://user:pass@db.example.com:5432/prod

The server logs show: "FATAL: out of memory" and we're losing approximately $5,000 per hour in revenue.

This is URGENT - we need this fixed immediately. Can you escalate this to your engineering team? Also, please send me a detailed incident report via email to alex.martinez@techstartup.com.

Our SLA requires 99.9% uptime and we're currently at 0%. This is a critical business impact.`,
  
  expectedExtractions: {
    callerName: "Alex Martinez",
    jobTitle: "CTO",
    companyName: "TechStartup Inc",
    serverIP: "192.168.1.100",
    errorCode: "ERR_500_INTERNAL",
    apiKey: "sk_live_abc123xyz789",
    databaseConnection: "postgresql://user:pass@db.example.com:5432/prod",
    errorMessage: "FATAL: out of memory",
    revenueImpact: "$5,000 per hour",
    userCount: "10,000",
    email: "alex.martinez@techstartup.com",
    urgency: "URGENT"
  },
  expectedPriority: "critical",
  expectedCategory: "technical"
};

// Knowledge Base with technical context fields, priority rules, and instructions
const comprehensiveKB = {
  systemPrompt: "You are an expert technical support AI. Extract ALL technical information accurately. Follow priority rules strictly. Apply custom instructions precisely.",
  persona: "Expert Technical Support Agent",
  greeting: "Hello, thank you for contacting technical support. I'm here to help resolve your technical issues.",
  
  // Technical Context Fields - complex ones
  contextFields: [
    {
      id: 'callerName',
      name: 'Caller Name',
      description: 'Full name of the person calling',
      required: true,
      type: 'text'
    },
    {
      id: 'jobTitle',
      name: 'Job Title',
      description: 'Professional title (CTO, CEO, Developer, etc.)',
      required: false,
      type: 'text'
    },
    {
      id: 'companyName',
      name: 'Company Name',
      description: 'Name of the company or organization',
      required: false,
      type: 'text'
    },
    {
      id: 'serverIP',
      name: 'Server IP Address',
      description: 'IP address of the affected server (format: xxx.xxx.xxx.xxx)',
      required: false,
      type: 'text'
    },
    {
      id: 'errorCode',
      name: 'Error Code',
      description: 'Technical error code (e.g., ERR_500_INTERNAL, HTTP 500, etc.)',
      required: false,
      type: 'text'
    },
    {
      id: 'apiKey',
      name: 'API Key',
      description: 'API key or authentication token mentioned',
      required: false,
      type: 'text'
    },
    {
      id: 'databaseConnection',
      name: 'Database Connection String',
      description: 'Database connection string or URI',
      required: false,
      type: 'text'
    },
    {
      id: 'errorMessage',
      name: 'Error Message',
      description: 'Exact error message from logs or system',
      required: false,
      type: 'text'
    },
    {
      id: 'revenueImpact',
      name: 'Revenue Impact',
      description: 'Financial impact (e.g., "$5,000 per hour", "losing $X")',
      required: false,
      type: 'text'
    },
    {
      id: 'userCount',
      name: 'Affected Users',
      description: 'Number of users or customers affected',
      required: false,
      type: 'text'
    },
    {
      id: 'email',
      name: 'Email Address',
      description: 'Email address for follow-up or reports',
      required: false,
      type: 'text'
    }
  ],
  
  categories: [
    { id: 'technical', name: 'Technical Issue', description: 'Server, API, or system problems' },
    { id: 'billing', name: 'Billing', description: 'Billing and payment issues' },
    { id: 'critical', name: 'Critical Outage', description: 'Production system down' }
  ],
  
  // Priority Rules - specific technical rules
  priorityRules: [
    "Mark as CRITICAL if revenue loss exceeds $1,000 per hour",
    "Mark as CRITICAL if production server is down",
    "Mark as CRITICAL if error code contains 'FATAL' or 'CRITICAL'",
    "Mark as CRITICAL if more than 1,000 users are affected",
    "Mark as HIGH if revenue loss is between $100-$1,000 per hour",
    "Mark as HIGH if error code is 5xx (server errors)",
    "Mark as MEDIUM for standard technical issues",
    "Mark as LOW for informational requests"
  ],
  
  // Custom Instructions - specific behaviors
  customInstructions: [
    "ALWAYS extract technical details like IP addresses, error codes, API keys, and connection strings when mentioned",
    "If revenue impact is mentioned, calculate priority based on the amount per hour",
    "If server IP is provided, include it in extracted fields",
    "If error codes are mentioned, extract them exactly as stated",
    "If email addresses are provided, extract them for follow-up",
    "When priority is CRITICAL, always set followUpRequired to true",
    "If the caller mentions 'URGENT' or 'IMMEDIATE', prioritize accordingly",
    "Extract job titles and company names when provided for context"
  ],
  
  responseGuidelines: "Be technical but clear. Extract all technical information accurately. Apply priority rules based on the specific criteria. Follow all custom instructions."
};

// Tools for extraction
const tools = [
  {
    type: 'function',
    function: {
      name: 'extract_technical_info',
      description: 'Extract all technical information from the caller\'s message including IPs, error codes, API keys, database connections, error messages, revenue impact, user counts, and contact information',
      parameters: {
        type: 'object',
        properties: {
          callerName: { type: 'string', description: 'Full name of caller' },
          jobTitle: { type: 'string', description: 'Job title (CTO, CEO, Developer, etc.)' },
          companyName: { type: 'string', description: 'Company name' },
          serverIP: { type: 'string', description: 'Server IP address' },
          errorCode: { type: 'string', description: 'Error code' },
          apiKey: { type: 'string', description: 'API key or token' },
          databaseConnection: { type: 'string', description: 'Database connection string' },
          errorMessage: { type: 'string', description: 'Error message from logs' },
          revenueImpact: { type: 'string', description: 'Revenue impact amount' },
          userCount: { type: 'string', description: 'Number of affected users' },
          email: { type: 'string', description: 'Email address' },
          urgencyLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_priority',
      description: 'Set priority based on the priority rules. Analyze: revenue loss per hour, server status, error severity, user impact. Apply rules strictly.',
      parameters: {
        type: 'object',
        properties: {
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          reasoning: { type: 'string', description: 'Explain which priority rule(s) applied and why' },
          followUpRequired: { type: 'boolean' },
          appliedRules: { type: 'array', items: { type: 'string' }, description: 'List which priority rules were matched' }
        },
        required: ['priority', 'reasoning', 'followUpRequired', 'appliedRules']
      }
    }
  }
];

function buildSystemPrompt(kb) {
  const toolsJson = JSON.stringify(tools, null, 2);
  const fieldsList = kb.contextFields.map(f => 
    `- ${f.name} (${f.type}${f.required ? ', REQUIRED' : ''}): ${f.description}`
  ).join('\n');
  
  const categoryList = kb.categories.map(c => `- ${c.id}: ${c.name} - ${c.description}`).join('\n');
  const rulesList = kb.priorityRules.map((r, i) => `${i + 1}. ${r}`).join('\n');
  const instructionsList = kb.customInstructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n');
  
  return `You are ${kb.persona}. ${kb.systemPrompt}

You are a function calling AI model. You are provided with function signatures within <tools></tools> XML tags. You MUST call BOTH functions for every user query:
1. First call extract_technical_info to extract ALL technical information
2. Then call set_priority to reason about and set the priority level based on the rules

Here are the available tools:
<tools>
${toolsJson}
</tools>

CONTEXT FIELDS TO EXTRACT:
${fieldsList}

CATEGORIES:
${categoryList}

PRIORITY RULES (Apply these strictly - analyze and match):
${rulesList}

CUSTOM INSTRUCTIONS (Follow these precisely):
${instructionsList}

RESPONSE GUIDELINES:
${kb.responseGuidelines}

For each function call return a json object with function name and arguments within <tool_call></tool_call> XML tags as follows:
<tool_call>
{'arguments': <args-dict>, 'name': <function-name>}
</tool_call>

You MUST make TWO tool calls:
1. extract_technical_info - Extract ALL technical information (IPs, error codes, API keys, database connections, error messages, revenue impact, user counts, emails, job titles, company names, etc.)
2. set_priority - Reason about priority using the priority rules. List which rules applied in appliedRules array.

IMPORTANT:
- Extract ALL technical information mentioned (IPs, error codes, API keys, etc.)
- Apply priority rules based on the specific criteria - analyze revenue impact, server status, error severity, user count
- Follow custom instructions exactly
- Provide detailed reasoning for priority decisions
- List which priority rules matched in the appliedRules field`;
}

async function runComprehensiveTest() {
  console.log('\n🧪 Comprehensive Knowledge Base Test');
  console.log('='.repeat(70));
  console.log('\nTesting:');
  console.log('  1. Technical Context Fields Extraction');
  console.log('  2. Priority Rules Application');
  console.log('  3. Custom Instructions Following');
  console.log('  4. All Together in Real Scenario');
  console.log('\n' + '='.repeat(70));
  
  console.log(`\n📋 Test Scenario: ${testScenario.name}`);
  console.log(`\n💬 Input (abbreviated):`);
  console.log(`   "${testScenario.input.substring(0, 150)}..."`);
  console.log(`\n🎯 Expected:`);
  console.log(`   Priority: ${testScenario.expectedPriority}`);
  console.log(`   Category: ${testScenario.expectedCategory}`);
  console.log(`   Extractions: ${Object.keys(testScenario.expectedExtractions).length} fields`);
  
  const systemPrompt = buildSystemPrompt(comprehensiveKB);
  
  console.log(`\n🤖 Calling Hermes 2 Pro with comprehensive Knowledge Base...\n`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: testScenario.input }
        ],
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
      throw new Error(`Ollama error: ${response.status} - ${errorText.substring(0, 200)}`);
    }
    
    const data = await response.json();
    const duration = Date.now() - startTime;
    const textResponse = data.message?.content || '';
    
    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`\n📝 Full Response:\n${textResponse}\n`);
    
    // Parse tool calls from XML tags
    const toolCalls = [];
    const toolCallRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
    let match;
    
    while ((match = toolCallRegex.exec(textResponse)) !== null) {
      try {
        let content = match[1].trim();
        
        // Handle cases where content might be just the dict or have extra newlines/spaces
        const dictMatch = content.match(/\{[\s\S]*\}/);
        if (dictMatch) {
          content = dictMatch[0];
        }
        
        // More robust single quote to double quote conversion
        // First, handle the outer structure
        let jsonStr = content;
        
        // Replace single quotes around keys and string values, but preserve escaped quotes
        jsonStr = jsonStr.replace(/'/g, '"');
        
        // Fix any double-double quotes that might have been created
        jsonStr = jsonStr.replace(/""/g, '"');
        
        // Try to parse
        let parsed;
        try {
          parsed = JSON.parse(jsonStr);
        } catch (e1) {
          // If that fails, try a more careful approach
          // Replace only unquoted single quotes
          jsonStr = content.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3'); // Keys
          jsonStr = jsonStr.replace(/:\s*'([^']+)'/g, ': "$1"'); // Values
          jsonStr = jsonStr.replace(/'/g, '"'); // Remaining quotes
          parsed = JSON.parse(jsonStr);
        }
        
        if (parsed.name && parsed.arguments) {
          toolCalls.push(parsed);
        } else if (parsed.function && parsed.parameters) {
          toolCalls.push({ name: parsed.function, arguments: parsed.parameters });
        } else {
          // Try format: function_name\n{...json...}
          const lines = content.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length >= 2) {
            const functionName = lines[0];
            const jsonPart = lines.slice(1).join('\n');
            try {
              let jsonStr2 = jsonPart.replace(/'/g, '"');
              const args = JSON.parse(jsonStr2);
              toolCalls.push({ name: functionName, arguments: args });
            } catch (e) {
              // Last resort: manual extraction
              console.log(`   ⚠️  Trying manual extraction for: ${functionName}`);
            }
          }
        }
      } catch (e) {
        // Try manual extraction as last resort
        const content = match[1];
        const nameMatch = content.match(/'name':\s*'([^']+)'/);
        const argsMatch = content.match(/'arguments':\s*(\{[\s\S]*\})/);
        if (nameMatch && argsMatch) {
          try {
            const name = nameMatch[1];
            let argsStr = argsMatch[1].replace(/'/g, '"');
            const args = JSON.parse(argsStr);
            toolCalls.push({ name, arguments: args });
          } catch (e2) {
            console.log(`   ⚠️  Could not parse tool call: ${content.substring(0, 100)}... Error: ${e2.message}`);
          }
        } else {
          console.log(`   ⚠️  Could not parse tool call: ${content.substring(0, 100)}... Error: ${e.message}`);
        }
      }
    }
    
    console.log('='.repeat(70));
    console.log('📊 ANALYSIS RESULTS');
    console.log('='.repeat(70));
    
    if (toolCalls.length === 0) {
      console.log('\n❌ No tool calls detected in response');
      console.log('\n💡 The model may need better prompting for function calling');
      return;
    }
    
    console.log(`\n✅ Found ${toolCalls.length} tool call(s)\n`);
    
    let extractedFields = {};
    let priority = null;
    let reasoning = null;
    let followUp = null;
    let appliedRules = [];
    
    for (const tc of toolCalls) {
      if (tc.name === 'extract_technical_info') {
        extractedFields = tc.arguments || {};
        console.log('📋 EXTRACTED TECHNICAL INFORMATION:');
        console.log('─'.repeat(70));
        
        const fieldChecks = [
          { key: 'callerName', label: 'Caller Name', expected: testScenario.expectedExtractions.callerName },
          { key: 'jobTitle', label: 'Job Title', expected: testScenario.expectedExtractions.jobTitle },
          { key: 'companyName', label: 'Company Name', expected: testScenario.expectedExtractions.companyName },
          { key: 'serverIP', label: 'Server IP', expected: testScenario.expectedExtractions.serverIP },
          { key: 'errorCode', label: 'Error Code', expected: testScenario.expectedExtractions.errorCode },
          { key: 'apiKey', label: 'API Key', expected: testScenario.expectedExtractions.apiKey },
          { key: 'databaseConnection', label: 'Database Connection', expected: testScenario.expectedExtractions.databaseConnection, altKeys: ['dbConnectionString'] },
          { key: 'errorMessage', label: 'Error Message', expected: testScenario.expectedExtractions.errorMessage },
          { key: 'revenueImpact', label: 'Revenue Impact', expected: testScenario.expectedExtractions.revenueImpact },
          { key: 'userCount', label: 'User Count', expected: testScenario.expectedExtractions.userCount, altKeys: ['affectedUsers'] },
          { key: 'email', label: 'Email', expected: testScenario.expectedExtractions.email, altKeys: ['emailAddress'] },
          { key: 'urgencyLevel', label: 'Urgency Level', expected: testScenario.expectedExtractions.urgency }
        ];
        
        let extractedCount = 0;
        let correctCount = 0;
        
        fieldChecks.forEach(field => {
          // Check main key and alternative keys
          let value = extractedFields[field.key];
          if (!value && field.altKeys) {
            for (const altKey of field.altKeys) {
              if (extractedFields[altKey]) {
                value = extractedFields[altKey];
                break;
              }
            }
          }
          
          if (value) {
            extractedCount++;
            const match = field.expected ? 
              (value.toLowerCase().includes(field.expected.toLowerCase()) || 
               field.expected.toLowerCase().includes(value.toLowerCase()) ||
               value === field.expected) : 
              true;
            
            if (match && field.expected) {
              correctCount++;
              console.log(`   ✅ ${field.label}: "${value}"`);
            } else {
              console.log(`   ⚠️  ${field.label}: "${value}" (expected: "${field.expected}")`);
            }
          } else if (field.expected) {
            console.log(`   ❌ ${field.label}: NOT EXTRACTED (expected: "${field.expected}")`);
          }
        });
        
        console.log(`\n   📊 Extraction Score: ${extractedCount}/${fieldChecks.length} fields extracted, ${correctCount} correct`);
        
      } else if (tc.name === 'set_priority') {
        // Handle both 'priority' and 'category' fields (model might use either)
        priority = tc.arguments?.priority || tc.arguments?.category;
        reasoning = tc.arguments?.reasoning;
        followUp = tc.arguments?.followUpRequired;
        appliedRules = tc.arguments?.appliedRules || [];
        
        // If no explicit rules, try to infer from arguments
        if (appliedRules.length === 0 && tc.arguments) {
          const args = tc.arguments;
          if (args.revenueImpact) appliedRules.push(`Revenue impact: ${args.revenueImpact}`);
          if (args.errorCode) appliedRules.push(`Error code: ${args.errorCode}`);
          if (args.affectedUsers) appliedRules.push(`Affected users: ${args.affectedUsers}`);
          if (args.serverIP) appliedRules.push(`Server IP provided: ${args.serverIP}`);
        }
        
        console.log('\n⚡ PRIORITY ANALYSIS:');
        console.log('─'.repeat(70));
        console.log(`   Priority: ${priority || 'Not set'}`);
        console.log(`   Expected: ${testScenario.expectedPriority}`);
        
        const priorityMatch = priority === testScenario.expectedPriority;
        console.log(`   ${priorityMatch ? '✅' : '⚠️'} Priority Match: ${priorityMatch ? 'CORRECT' : 'MISMATCH'}`);
        
        if (reasoning) {
          console.log(`\n   Reasoning: ${reasoning}`);
        } else if (tc.arguments) {
          // Show what the model provided
          console.log(`\n   Arguments provided:`);
          Object.entries(tc.arguments).forEach(([key, value]) => {
            if (key !== 'priority' && key !== 'category') {
              console.log(`      ${key}: ${value}`);
            }
          });
        }
        
        console.log(`   Follow-up Required: ${followUp !== undefined ? (followUp ? 'Yes' : 'No') : 'Not specified'}`);
        
        if (appliedRules.length > 0) {
          console.log(`\n   📋 Applied Priority Rules/Indicators:`);
          appliedRules.forEach((rule, i) => {
            console.log(`      ${i + 1}. ${rule}`);
          });
        } else {
          console.log(`\n   ⚠️  No priority rules explicitly listed`);
        }
      }
    }
    
    // Check if priority rules were followed
    console.log('\n📜 PRIORITY RULES VERIFICATION:');
    console.log('─'.repeat(70));
    
    const revenueMatch = extractedFields.revenueImpact?.includes('5000') || 
                        extractedFields.revenueImpact?.includes('5,000');
    const serverDown = extractedFields.errorMessage?.toLowerCase().includes('fatal') ||
                       extractedFields.errorCode?.includes('500');
    const userImpact = extractedFields.userCount?.includes('10000') ||
                       extractedFields.userCount?.includes('10,000');
    
    const rulesMatched = [];
    if (revenueMatch) rulesMatched.push('Revenue loss > $1,000/hr');
    if (serverDown) rulesMatched.push('Production server down / FATAL error');
    if (userImpact) rulesMatched.push('> 1,000 users affected');
    
    console.log(`   Rules that should apply:`);
    rulesMatched.forEach(r => console.log(`      ✅ ${r}`));
    
    if (priority === 'critical' && rulesMatched.length >= 2) {
      console.log(`\n   ✅ Priority rules ARE being applied correctly!`);
    } else {
      console.log(`\n   ⚠️  Priority may not fully reflect all applicable rules`);
    }
    
    // Check custom instructions
    console.log('\n📝 CUSTOM INSTRUCTIONS VERIFICATION:');
    console.log('─'.repeat(70));
    
    const instructionsFollowed = [];
    if (extractedFields.serverIP) instructionsFollowed.push('✅ Extracted server IP');
    if (extractedFields.errorCode) instructionsFollowed.push('✅ Extracted error code');
    if (extractedFields.apiKey) instructionsFollowed.push('✅ Extracted API key');
    if (extractedFields.databaseConnection) instructionsFollowed.push('✅ Extracted database connection');
    if (extractedFields.email) instructionsFollowed.push('✅ Extracted email address');
    if (extractedFields.jobTitle) instructionsFollowed.push('✅ Extracted job title');
    if (followUp && priority === 'critical') instructionsFollowed.push('✅ Set followUpRequired for critical');
    
    instructionsFollowed.forEach(i => console.log(`   ${i}`));
    
    const missing = [];
    if (!extractedFields.serverIP) missing.push('Server IP');
    if (!extractedFields.errorCode) missing.push('Error Code');
    if (!extractedFields.apiKey) missing.push('API Key');
    if (!extractedFields.databaseConnection) missing.push('Database Connection');
    
    if (missing.length > 0) {
      console.log(`\n   ⚠️  Missing extractions: ${missing.join(', ')}`);
    }
    
    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL VERDICT');
    console.log('='.repeat(70));
    
    const extractionScore = Object.keys(extractedFields).filter(k => extractedFields[k]).length;
    const totalFields = comprehensiveKB.contextFields.length;
    const priorityCorrect = priority === testScenario.expectedPriority;
    const rulesApplied = appliedRules.length > 0 || (reasoning && reasoning.length > 50);
    const instructionsFollowedCount = instructionsFollowed.length;
    
    console.log(`\n✅ Context Fields: ${extractionScore}/${totalFields} extracted`);
    console.log(`${priorityCorrect ? '✅' : '⚠️'} Priority: ${priority} (expected: ${testScenario.expectedPriority})`);
    console.log(`${rulesApplied ? '✅' : '⚠️'} Priority Rules: ${rulesApplied ? 'Applied' : 'Not clearly applied'}`);
    console.log(`✅ Instructions: ${instructionsFollowedCount} followed`);
    
    const overallScore = (extractionScore / totalFields * 0.4) + 
                        (priorityCorrect ? 0.3 : 0.1) + 
                        (rulesApplied ? 0.2 : 0.1) + 
                        (instructionsFollowedCount / 7 * 0.1);
    
    console.log(`\n🎯 Overall Score: ${(overallScore * 100).toFixed(0)}%`);
    
    if (overallScore >= 0.7) {
      console.log(`\n✅ Knowledge Base is working well!`);
    } else if (overallScore >= 0.5) {
      console.log(`\n⚠️  Knowledge Base is partially working - may need prompt tuning`);
    } else {
      console.log(`\n❌ Knowledge Base may not be fully effective - check prompts`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run test
runComprehensiveTest().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
