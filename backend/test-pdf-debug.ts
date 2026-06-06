/* eslint-disable no-console */
import 'dotenv/config';

import { generateReceiptsReport } from './src/services/receipt.service';

async function testPDFGeneration() {
  console.log('Testing PDF report generation...');

  try {
    const result = await generateReceiptsReport({
      format: 'pdf',
      startDate: undefined,
      endDate: undefined,
      status: undefined,
    });

    console.log('✅ PDF generation successful!');

    // Save the PDF to a test file to inspect
    const fs = require('fs');
    const testPath = '/tmp/test-receipt-report.pdf';
    fs.writeFileSync(testPath, result.buffer);
    console.log('📄 PDF saved to:', testPath);
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
  }
}

testPDFGeneration().catch(console.error);
