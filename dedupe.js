const fs = require('fs');  
const content = fs.readFileSync('Phet游戏清单.md', 'utf-8');  
const lines = content.split('\n');  
let outputLines = [];  
const seenLinks = new Set();  
let itemBuffer = [];  
let itemLink = null;  
let itemHasStar = false;  
let categoryStats = {};  
let currentCategoryKey = null;  
let inSummary = false;  
let itemCounter = 1;  
function flushItem() {  
    if (itemBuffer.length > 0) {  
        if (itemLink && !seenLinks.has(itemLink)) {  
            seenLinks.add(itemLink);  
            itemBuffer[0] = itemBuffer[0].replace(/\d+\./, \`$${itemCounter}.\`);  
            itemCounter++;  
            outputLines.push(...itemBuffer);  
            if (currentCategoryKey) {  
                categoryStats[currentCategoryKey].count++;  
                if (itemHasStar) {  
                    categoryStats[currentCategoryKey].stars++;  
                }  
            }  
        }  
        itemBuffer = [];  
        itemLink = null;  
        itemHasStar = false;  
    }  
}  
for (let i = 0; i < lines.length; i++) {  
    const line = lines[i];  
    if (line.startsWith('## ?? 学科总结')) {  
        flushItem();  
        inSummary = true;  
        outputLines.push(line);  
        continue;  
    }  
    if (inSummary) {  
        outputLines.push(line);  
        continue;  
    }  
    if (line.startsWith('## ') && !line.startsWith('## ??') && !line.startsWith('## ??')) {  
        flushItem();  
        const match = line.match(/## (.*?) \(/);  
        if (match) {  
            currentCategoryKey = match[1];  
            categoryStats[currentCategoryKey] = { count: 0, stars: 0, originalHeader: line };  
        }  
        outputLines.push(line);  
        continue;  
    }  
    if (line.startsWith('### ')) {  
        flushItem();  
        itemCounter = 1;  
        outputLines.push(line);  
        continue;  
    }  
    const itemStartMatch = line.match(/\d+\. \*\*/);  
    if (itemStartMatch) {  
        flushItem();  
        itemBuffer.push(line);  
        if (line.includes('?')) itemHasStar = true;  
        const linkMatch = line.match(/\[中文\]\((.*?)\)/);  
        if (linkMatch) itemLink = linkMatch[1];  
    } else if (itemBuffer.length > 0) {  
        itemBuffer.push(line);  
        if (line.includes('?')) itemHasStar = true;  
        const linkMatch = line.match(/\[中文\]\((.*?)\)/);  
        if (linkMatch) itemLink = linkMatch[1];  
    } else {  
        flushItem();  
        outputLines.push(line);  
    }  
}  
flushItem();  
for (let i = 0; i < outputLines.length; i++) {  
    const line = outputLines[i];  
    if (line.startsWith('## ') && line.includes('(') && line.includes('个)')) {  
        for (const key in categoryStats) {  
            if (line.startsWith(\`## $${key}\`)) {  
                const stats = categoryStats[key];  
                outputLines[i] = line.replace(/\d+个/, \`$${stats.count}个\`);  
                break;  
            }  
        }  
    }  
}  
let tableStartIndex = -1;  
let tableEndIndex = -1;  
for (let i = 0; i < outputLines.length; i++) {  
