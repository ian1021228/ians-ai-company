/**
 * ian's AI 公司 - 系統全自動完整性與雙端規範驗證腳本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 開始執行「ian\'s AI 公司」全系統驗證流程...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [通過] ${message}`);
    passCount++;
  } else {
    console.error(`❌ [失敗] ${message}`);
    failCount++;
  }
}

// 1. 驗證必要檔案存在性
const requiredFiles = [
  'index.html',
  'css/style.css',
  'js/antigravity-core.js',
  'js/app.js',
  'data/changelog.json',
  'package.json',
  'backend/server.js'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  assert(exists, `核心檔案存在: ${file}`);
});

// 2. 驗證 index.html 內容規範
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
assert(htmlContent.includes("ian's AI 公司"), "首頁包含公司名稱「ian's AI 公司」");
assert(htmlContent.includes("btnStartMeeting"), "首頁包含「一鍵開始開會」操作節點");
assert(htmlContent.includes("功能組") && htmlContent.includes("外觀組") && htmlContent.includes("體驗組") && htmlContent.includes("資安組") && htmlContent.includes("測試及機動組"), "首頁包含完整五大部門編制");
assert(htmlContent.includes("創辦人審批中樞"), "首頁包含「創辦人審批中樞」");
assert(htmlContent.includes("antigravity") && htmlContent.includes("123456"), "系統支援預設管理員測試憑證 antigravity / 123456");
assert(htmlContent.includes("更新紀錄"), "首頁包含「更新紀錄 (Changelog)」按鈕");

// 3. 驗證 css/style.css 米色簡約與手機 393×852 適配
const cssContent = fs.readFileSync(path.join(__dirname, '..', 'css/style.css'), 'utf-8');
assert(cssContent.includes('--bg-main: #FAF8F5') || cssContent.includes('#FAF8F5'), "樣式表包含象牙米白基底色彩");
assert(cssContent.includes('--brand-gold') || cssContent.includes('#8C6D46'), "樣式表包含經典琥珀金品牌色");
assert(cssContent.includes('@media (max-width: 640px)'), "樣式表包含針對手機端 (393×852) 的專屬響應式規則");

// 4. 驗證 changelog.json 資料合法性
try {
  const changelogRaw = fs.readFileSync(path.join(__dirname, '..', 'data/changelog.json'), 'utf-8');
  const changelog = JSON.parse(changelogRaw);
  assert(Array.isArray(changelog) && changelog.length > 0, "Changelog 為有效 JSON 陣列");
  assert(changelog[0].version && changelog[0].highlights, "Changelog 最新版本包含版本號與更新亮點");
} catch (e) {
  assert(false, `Changelog JSON 解析失敗: ${e.message}`);
}

// 5. 語法檢測
try {
  execSync('node -c js/antigravity-core.js js/app.js backend/server.js', { stdio: 'pipe' });
  assert(true, "JavaScript 核心檔案語法無誤 (node -c 通過)");
} catch (e) {
  assert(false, `JavaScript 語法檢測錯誤: ${e.message}`);
}

console.log(`\n=======================================================`);
console.log(`🎯 驗證統計: 通過 ${passCount} 項 / 失敗 ${failCount} 項`);
console.log(`=======================================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🌟 「ian\'s AI 公司」所有自動化核心檢測 100% 通過！');
}
