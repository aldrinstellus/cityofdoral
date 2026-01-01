#!/usr/bin/env node
/**
 * City of Doral Chatbot - Full Spectrum Testing
 * Tests various scenarios against the knowledge base
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test categories
const TEST_SUITES = {
  // 1. Basic English queries
  basicEnglish: [
    { query: 'What are the city hall hours?', expectKeywords: ['hour', 'open', 'city hall'] },
    { query: 'How do I apply for a building permit?', expectKeywords: ['permit', 'building', 'apply'] },
    { query: 'Where is Doral located?', expectKeywords: ['miami', 'florida', 'location'] },
    { query: 'What events are happening this month?', expectKeywords: ['event'] },
    { query: 'Tell me about parks in Doral', expectKeywords: ['park'] },
  ],

  // 2. Spanish queries (bilingual)
  spanish: [
    { query: 'Cuales son los horarios del ayuntamiento?', expectLanguage: 'es', expectKeywords: ['horario'] },
    { query: 'Como solicito un permiso de construccion?', expectLanguage: 'es', expectKeywords: ['permiso'] },
    { query: 'Donde estan los parques?', expectLanguage: 'es', expectKeywords: ['parque'] },
    { query: 'Que eventos hay en la ciudad?', expectLanguage: 'es', expectKeywords: ['evento'] },
  ],

  // 3. Department-specific queries
  departments: [
    { query: 'How do I contact the police department?', expectKeywords: ['police', 'contact', 'emergency'] },
    { query: 'What does the Parks and Recreation department offer?', expectKeywords: ['park', 'recreation'] },
    { query: 'How do I pay my water bill?', expectKeywords: ['water', 'utility', 'bill', 'pay'] },
    { query: 'Building code violations', expectKeywords: ['code', 'violation', 'building'] },
    { query: 'Business license requirements', expectKeywords: ['business', 'license'] },
  ],

  // 4. Permit and service queries
  services: [
    { query: 'How do I get a permit for a home renovation?', expectKeywords: ['permit', 'renovation'] },
    { query: 'What documents do I need for a business license?', expectKeywords: ['document', 'license', 'business'] },
    { query: 'How can I report a pothole?', expectKeywords: ['report', 'public works'] },
    { query: 'Garbage collection schedule', expectKeywords: ['garbage', 'collection', 'trash'] },
  ],

  // 5. Sentiment detection (negative/urgent - should trigger escalation)
  sentiment: [
    { query: 'This is terrible service, I need to speak to someone NOW!', expectEscalate: true, expectSentiment: 'negative' },
    { query: 'URGENT: My water has been shut off!', expectEscalate: true, expectSentiment: 'urgent' },
    { query: 'I am very frustrated with the permit process', expectEscalate: true },
    { query: 'Thank you for your help!', expectEscalate: false, expectSentiment: 'positive' },
  ],

  // 6. Knowledge base specific queries
  knowledgeBase: [
    { query: 'Tell me about the history of Doral', expectKeywords: ['kaskel', 'history', '2003', 'incorporated'] },
    { query: 'What is the Best of the Best program?', expectKeywords: ['best', 'vote', 'business'] },
    { query: 'Community assistance programs available', expectKeywords: ['grant', 'assistance', 'program'] },
    { query: 'Mayor of Doral', expectKeywords: ['mayor', 'christi fraga'] },
  ],

  // 7. Edge cases
  edgeCases: [
    { query: 'a', expectError: false }, // Very short query
    { query: 'asdfghjkl random gibberish xyz123', expectFallback: true }, // Nonsense query
    { query: 'What is the meaning of life?', expectFallback: true }, // Off-topic
  ],

  // 8. Multi-URL domain tests (doralpd.com)
  domainTests: [
    { query: 'Police non-emergency number', domain: 'doralpd.com', expectKeywords: ['police'] },
    { query: 'Report a crime', domain: 'doralpd.com', expectKeywords: ['police', 'report'] },
  ],
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

// Test a single chat query
async function testChat(testCase, suiteName) {
  const { query, domain, expectKeywords, expectLanguage, expectEscalate, expectSentiment, expectError, expectFallback } = testCase;

  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: query }],
        domain: domain || 'cityofdoral.com',
      }),
    });

    if (!response.ok) {
      if (expectError) {
        return { pass: true, message: 'Expected error received' };
      }
      return { pass: false, message: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    const results = [];

    // Check for response message
    if (!data.message) {
      return { pass: false, message: 'No message in response' };
    }

    // Check language detection
    if (expectLanguage && data.language !== expectLanguage) {
      results.push(`Language mismatch: expected ${expectLanguage}, got ${data.language}`);
    }

    // Check for keywords in response
    if (expectKeywords && expectKeywords.length > 0) {
      const messageLower = data.message.toLowerCase();
      const sourceTitles = (data.sources || []).map(s => s.title.toLowerCase()).join(' ');
      const combinedText = messageLower + ' ' + sourceTitles;

      const foundKeywords = expectKeywords.filter(kw => combinedText.includes(kw.toLowerCase()));
      if (foundKeywords.length === 0) {
        results.push(`No expected keywords found. Expected: ${expectKeywords.join(', ')}`);
      }
    }

    // Check escalation
    if (expectEscalate !== undefined) {
      if (data.escalate !== expectEscalate) {
        results.push(`Escalation mismatch: expected ${expectEscalate}, got ${data.escalate}`);
      }
    }

    // Check sentiment
    if (expectSentiment && data.sentiment !== expectSentiment) {
      // Allow 'negative' or 'urgent' for negative sentiment tests
      if (!(expectSentiment === 'negative' && data.sentiment === 'urgent') &&
          !(expectSentiment === 'urgent' && data.sentiment === 'negative')) {
        results.push(`Sentiment mismatch: expected ${expectSentiment}, got ${data.sentiment}`);
      }
    }

    // Check sources returned
    if (!expectFallback && (!data.sources || data.sources.length === 0)) {
      results.push('Warning: No sources returned from knowledge base');
    }

    if (results.length > 0) {
      return { pass: false, message: results.join('; '), data };
    }

    return {
      pass: true,
      message: `OK - ${data.language}, ${data.sentiment}, ${data.sources?.length || 0} sources`,
      data,
    };

  } catch (error) {
    return { pass: false, message: `Error: ${error.message}` };
  }
}

// Test the knowledge API directly
async function testKnowledgeAPI() {
  log(colors.cyan, '\n=== Testing Knowledge API ===\n');

  const queries = [
    { q: 'city hall hours', expectResults: true },
    { q: 'building permit', expectResults: true },
    { q: 'parks recreation', expectResults: true },
    { q: 'police department', expectResults: true },
    { q: 'xyznonexistent123', expectResults: false },
  ];

  let passed = 0;
  let failed = 0;

  for (const { q, expectResults } of queries) {
    try {
      const response = await fetch(`${BASE_URL}/api/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 5 }),
      });

      const data = await response.json();
      const hasResults = data.results && data.results.length > 0;

      if (hasResults === expectResults) {
        log(colors.green, `  ✓ "${q}" - ${data.results?.length || 0} results`);
        passed++;
      } else {
        log(colors.red, `  ✗ "${q}" - Expected ${expectResults ? 'results' : 'no results'}, got ${data.results?.length || 0}`);
        failed++;
      }
    } catch (error) {
      log(colors.red, `  ✗ "${q}" - Error: ${error.message}`);
      failed++;
    }
  }

  return { passed, failed };
}

// Run all test suites
async function runAllTests() {
  log(colors.bold + colors.cyan, '\n╔════════════════════════════════════════════════════╗');
  log(colors.bold + colors.cyan, '║   City of Doral Chatbot - Full Spectrum Testing    ║');
  log(colors.bold + colors.cyan, '╚════════════════════════════════════════════════════╝\n');

  log(colors.blue, `Base URL: ${BASE_URL}`);
  log(colors.blue, `Timestamp: ${new Date().toISOString()}\n`);

  // First test Knowledge API
  const knowledgeResults = await testKnowledgeAPI();

  let totalPassed = knowledgeResults.passed;
  let totalFailed = knowledgeResults.failed;
  const suiteResults = {};

  // Run each test suite
  for (const [suiteName, tests] of Object.entries(TEST_SUITES)) {
    log(colors.cyan, `\n=== ${suiteName.toUpperCase()} ===\n`);

    let suitePassed = 0;
    let suiteFailed = 0;

    for (const testCase of tests) {
      const result = await testChat(testCase, suiteName);

      if (result.pass) {
        log(colors.green, `  ✓ "${testCase.query.substring(0, 50)}..." - ${result.message}`);
        suitePassed++;
        totalPassed++;
      } else {
        log(colors.red, `  ✗ "${testCase.query.substring(0, 50)}..."`);
        log(colors.yellow, `    → ${result.message}`);
        if (result.data) {
          log(colors.yellow, `    → Response: "${result.data.message?.substring(0, 100)}..."`);
        }
        suiteFailed++;
        totalFailed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    suiteResults[suiteName] = { passed: suitePassed, failed: suiteFailed };
    log(colors.blue, `  Suite: ${suitePassed}/${suitePassed + suiteFailed} passed`);
  }

  // Summary
  log(colors.bold + colors.cyan, '\n╔════════════════════════════════════════════════════╗');
  log(colors.bold + colors.cyan, '║                    TEST SUMMARY                    ║');
  log(colors.bold + colors.cyan, '╚════════════════════════════════════════════════════╝\n');

  log(colors.blue, 'Results by suite:');
  log(colors.blue, `  Knowledge API: ${knowledgeResults.passed}/${knowledgeResults.passed + knowledgeResults.failed}`);
  for (const [name, results] of Object.entries(suiteResults)) {
    const total = results.passed + results.failed;
    const pct = Math.round((results.passed / total) * 100);
    const color = pct === 100 ? colors.green : pct >= 75 ? colors.yellow : colors.red;
    log(color, `  ${name}: ${results.passed}/${total} (${pct}%)`);
  }

  const totalTests = totalPassed + totalFailed;
  const successRate = Math.round((totalPassed / totalTests) * 100);

  log(colors.bold, '\n────────────────────────────────────────────────────');
  if (successRate >= 90) {
    log(colors.green + colors.bold, `  TOTAL: ${totalPassed}/${totalTests} passed (${successRate}%) ✓`);
  } else if (successRate >= 70) {
    log(colors.yellow + colors.bold, `  TOTAL: ${totalPassed}/${totalTests} passed (${successRate}%)`);
  } else {
    log(colors.red + colors.bold, `  TOTAL: ${totalPassed}/${totalTests} passed (${successRate}%) ✗`);
  }
  log(colors.bold, '────────────────────────────────────────────────────\n');

  return { totalPassed, totalFailed, successRate };
}

// Run tests
runAllTests()
  .then(({ successRate }) => {
    process.exit(successRate >= 80 ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
