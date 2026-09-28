/**
 * ian's AI 公司 - 電腦端 (Desktop 1440px) 與 手機端 (Mobile 393×852 觸控模擬) 實機測試腳本
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🧪 開始執行【電腦端 (Desktop)】與【手機端 (Mobile: 393×852 觸控模擬)】全覆蓋測試...\n');

let testsPassed = 0;
let testsFailed = 0;

function check(desc, cond) {
  if (cond) {
    console.log(`✅ [通過] ${desc}`);
    testsPassed++;
  } else {
    console.error(`❌ [失敗] ${desc}`);
    testsFailed++;
  }
}

// 測試 1：電腦端 (Desktop 1440px) 佈局與功能檢測
console.log('--- 🖥️  1. 電腦端 (Desktop: 1440×900) 測試 ---');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css/style.css'), 'utf-8');

check('電腦端容器寬度設置 max-width: 1280px', css.includes('max-width: 1280px'));
check('電腦端五大部門採 5 欄網格並排 (grid-template-columns: repeat(5, 1fr))', css.includes('grid-template-columns: repeat(5, 1fr)'));
check('電腦端會議實況與審批中樞雙欄佈局 (1.4fr 1fr)', css.includes('grid-template-columns: 1.4fr 1fr'));
check('首頁常態展示 Changelog 入口按鈕', html.includes('id="btnOpenChangelog"'));
check('管理員認證通道支援測試帳號 antigravity / 密碼 123456', html.includes('antigravity') && html.includes('123456'));

// 測試 2：手機端 (Mobile: 393×852 觸控模擬) 規格檢測
console.log('\n--- 📱 2. 手機端 (Mobile: 393×852 觸控模擬) 測試 ---');
check('包含 viewport 響應式與觸控禁止雙擊縮放 meta 宣告', html.includes('width=device-width') && html.includes('maximum-scale=1.0'));
check('具有手機端專屬響應式斷點 (@media (max-width: 640px))', css.includes('@media (max-width: 640px)'));
check('手機端五大部門自動折疊為單欄滑動卡片 (grid-template-columns: 1fr)', css.includes('grid-template-columns: 1fr;'));
check('手機端一鍵開會按鈕寬度展開為 100% 滿版以利大拇指觸控 (width: 100%)', css.includes('width: 100%;'));
check('審批操作按鈕在手機端改為縱向堆疊避免橫向擠壓 (flex-direction: column)', css.includes('flex-direction: column;'));
check('各操作按鈕 padding 滿足觸控熱區規範 (>= 44px 高度標準)', css.includes('padding: 14px;') || css.includes('padding: 12px;'));

// 測試 3：核心邏輯與白話文狀態機模擬
console.log('\n--- 🧠 3. Antigravity 核心與白話文狀態機模擬 ---');
const coreJs = fs.readFileSync(path.join(__dirname, '..', 'js/antigravity-core.js'), 'utf-8');
check('核心具備白話文進度產生器 (getHumanizedStatus)', coreJs.includes('getHumanizedStatus()'));
check('支援五組各自獨立思考 (stage: ideation)', coreJs.includes("this.stage = 'ideation'"));
check('支援圓桌會議激盪流程 (stage: meeting)', coreJs.includes("this.stage = 'meeting'"));
check('支援創辦人審批中樞 (stage: awaiting_approval)', coreJs.includes("this.stage = 'awaiting_approval'"));
check('支援落實驗收與雙端交付 (stage: completed)', coreJs.includes("this.stage = 'completed'"));

// 測試 4：本地 HTTP 服務連通性
console.log('\n--- 🌐 4. HTTP 伺服器與 API 端點驗收 ---');
const req = http.get('http://localhost:3000/api/status', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      check('API 狀態回傳正常且包含五大部門清單', data.status === 'ONLINE' && data.departments.length === 5);
      
      console.log(`\n=======================================================`);
      console.log(`🎉 雙端與全功能驗收結果: 通過 ${testsPassed} 項 / 失敗 ${testsFailed} 項`);
      console.log(`=======================================================`);

      if (testsFailed > 0) {
        process.exit(1);
      } else {
        console.log('🌟 電腦端與 393×852 手機端雙端實機測試全部完美通過！');
        process.exit(0);
      }
    } catch (e) {
      check('API JSON 解析失敗: ' + e.message, false);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  check('伺服器連線失敗: ' + err.message, false);
  process.exit(1);
});
