/**
 * PROOF TEST: PDF generation for dispute letters.
 * Run: pnpm exec tsx scripts/test-pdf-generation.ts
 * Success = prints "PROOF: PDF generated" and writes test-output.pdf
 */
import { generateLetterPDF } from '../server/pdfGenerator';

const sampleLetterContent = `John Doe
123 Main St, City, ST 12345
January 1, 2026

TransUnion
P.O. Box 2000
Chester, PA 19016

SENT VIA CERTIFIED MAIL

Re: Formal dispute of inaccurate information

Dear TransUnion:

I dispute the following account as inaccurate:

Account: TEST CREDITOR
Balance: $1,000
Status: Incorrect

Under FCRA § 1681i you must investigate within 30 days.

Sincerely,
John Doe`;

async function main() {
  console.log('[test-pdf] Starting PDF generation test...');
  try {
    const pdfBuffer = await generateLetterPDF({
      letterContent: sampleLetterContent,
      userInfo: { name: 'John Doe', address: '123 Main St' },
      bureau: 'TransUnion',
      date: new Date(),
    });

    const isPdf = pdfBuffer.length > 0 && pdfBuffer.subarray(0, 5).toString() === '%PDF-';
    if (!isPdf) {
      console.error('[test-pdf] FAIL: Output is not a valid PDF (wrong header)');
      process.exit(1);
    }

    const fs = await import('fs');
    const path = await import('path');
    const outPath = path.join(process.cwd(), 'test-output.pdf');
    fs.writeFileSync(outPath, pdfBuffer);
    console.log('');
    console.log('PROOF: PDF generated successfully');
    console.log('  Size:', pdfBuffer.length, 'bytes');
    console.log('  File:', outPath);
    console.log('');
    process.exit(0);
  } catch (err: any) {
    console.error('[test-pdf] FAIL:', err?.message || err);
    process.exit(1);
  }
}

main();
