import fs from 'fs';
import path from 'path';
import ofx from 'ofx-js';

function findTransactionsInOfx(parsed: any): any[] {
  const transactions: any[] = [];
  
  function recurse(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    
    if (obj.STMTTRN) {
      const list = Array.isArray(obj.STMTTRN) ? obj.STMTTRN : [obj.STMTTRN];
      transactions.push(...list);
      return;
    }
    
    for (const key of Object.keys(obj)) {
      recurse(obj[key]);
    }
  }
  
  recurse(parsed);
  return transactions;
}

async function test() {
  try {
    const ofxPath = path.join(__dirname, '../../extrato_teste.ofx');
    const rawString = fs.readFileSync(ofxPath, 'utf8');
    console.log('OFX Content read successful.');
    
    const parsed = ofx.parse(rawString);
    console.log('Parsed successfully. Keys of parsed object:', Object.keys(parsed));
    console.log('Full Parsed JSON:', JSON.stringify(parsed, null, 2));
    
    const transactions = findTransactionsInOfx(parsed);
    console.log('Transactions extracted count:', transactions.length);
    console.log('Transactions:', transactions);
  } catch (err) {
    console.error('Error parsing OFX:', err);
  }
}

test();
