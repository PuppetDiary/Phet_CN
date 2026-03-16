const fs = require('fs');
const zh = JSON.parse(fs.readFileSync('babel/fractions-intro/fractions-intro-strings_zh_CN.json', 'utf8'));

const emptyValues = [];
for (const [key, val] of Object.entries(zh)) {
  const value = typeof val === 'object' ? val.value : val;
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    emptyValues.push(key);
  }
}
console.log('Empty values:', emptyValues);
