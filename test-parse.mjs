import { extractTextFromPDF, parseWithAI } from './server/creditReportParser.ts';
import fetch from 'node-fetch';

// Get the most recent credit report URL from database
const reportUrl = process.argv[2];

if (!reportUrl) {
  console.error('Usage: node test-parse.mjs <report-url>');
  process.exit(1);
}

console.log('Fetching PDF from:', reportUrl);

try {
  const response = await fetch(reportUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  console.log(`\nPDF size: ${buffer.length} bytes`);
  
  // Extract text
  console.log('\nExtracting text from PDF...');
  const text = await extractTextFromPDF(buffer);
  
  console.log(`\nExtracted ${text.length} characters`);
  console.log('\nFirst 500 characters:');
  console.log(text.slice(0, 500));
  console.log('\n...\n');
  console.log('Last 500 characters:');
  console.log(text.slice(-500));
  
  // Try AI parsing
  console.log('\n\nTrying AI parsing...');
  const accounts = await parseWithAI(text, 'TransUnion');
  
  console.log(`\nAI found ${accounts.length} negative accounts:`);
  console.log(JSON.stringify(accounts, null, 2));
  
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
