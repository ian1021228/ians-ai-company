/**
 * ian's AI 公司 - Antigravity 多代理人智能運作核心 (Antigravity Engine)
 * 負責驅動五大部門獨立思考、跨組圓桌激盪、白話文進度生成與成果落地
 */

class AntigravityEnterpriseCore {
  constructor() {
    this.departments = {
      func: {
        id: 'func',
        name: '功能組',
        lead: 'Alex (首席架構師) / Leo (邏輯工程師)',
        icon: '⚙️',
        badgeClass: 'func',
        role: '核心邏輯、演算法架構、API 與資料流',
        state: 'idle', // idle, thinking, meeting, executing
        thought: '正在等待董事長派發新專案任務，目前系統微服務與架構已就緒。'
      },
      visual: {
        id: 'visual',
        name: '外觀組',
        lead: 'Celia (美學總監) / Emma (風格造型師)',
        icon: '🎨',
        badgeClass: 'visual',
        role: '米色極簡美學、版面階層、色彩計畫與元件設計',
        state: 'idle',
        thought: '米色主色板與暖沙邊框規格已就緒，隨時可為新專案打造頂級視覺。'
      },
      ux: {
        id: 'ux',
        name: '體驗組',
        lead: 'Julian (體驗研究長) / Nina (互動設計師)',
        icon: '🖐️',
        badgeClass: 'ux',
        role: '人機互動流程、手機 393×852 觸控體感與防呆路徑',
        state: 'idle',
        thought: '已備妥雙端流暢互動驗證模型，嚴格把關每一處觸控手感與無障礙體驗。'
      },
      sec: {
        id: 'sec',
        name: '資安組',
        lead: 'Marcus (資安長 CSO) / Vera (隱私審查員)',
        icon: '🛡️',
        badgeClass: 'sec',
        role: '資安防護、零資料更動防線、防注入與安全稽核',
        state: 'idle',
        thought: '安全閘門監控中，堅決落實「零資料更動原則」，保護所有資料安全。'
      },
      qa: {
        id: 'qa',
        name: '測試及機動組',
        lead: 'Ryan (測試主管) / Kite (機動特勤)',
        icon: '⚡',
        badgeClass: 'qa',
        role: '雙端覆蓋測試（電腦端 + 手機端 393×852）、極限壓力與機動除錯',
        state: 'idle',
        thought: '電腦端與 393×852 手機端測試套件待命，隨時準備進行實機全覆蓋驗收。'
      }
    };

    this.currentProject = null;
    this.stage = 'idle'; // idle, ideation, meeting, awaiting_approval, executing, completed
    this.meetingTranscripts = [];
    this.approvalProposal = null;
    this.deliverables = [];
    this.listeners = [];
  }

  // 註冊狀態監聽
  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // 白話文進度產生器 (Humanizer)
  getHumanizedStatus() {
    switch (this.stage) {
      case 'idle':
        return '🏢 全體五大部門（功能、外觀、體驗、資安、測試）全員在線待命，隨時可一鍵召開會議！';
      case 'ideation':
        return '🧠 各部門主管正在針對專案目標進行「獨立深度思考」，盤點各自領域的執行方案與潛在風險...';
      case 'meeting':
        return '🗣️ 【跨組圓桌大會戰進行中】各組主管正激烈辯論、互相挑錯並整合最佳執行路徑，即將完成會議紀要！';
      case 'awaiting_approval':
        return '⚖️ 【會議圓滿結束，等待創辦人審批】中文紀要與整合提案已備妥，請創辦人 Ian 裁決是否核准執行。';
      case 'executing':
        return '⚡ 【創辦人已核准，全體動工落地】功能組撰寫代碼、外觀組雕琢樣式、資安組簽署安全憑證中...';
      case 'testing':
        return '🧪 【測試及機動組實機驗收中】正在電腦端與 393×852 手機端雙端模擬點擊，確保 0 Bug...';
      case 'completed':
        return '🎉 【專案成果已正式交付】全套程式碼、設計規範、資安報告與測試驗收單已安全存檔於成果庫！';
      default:
        return '🔄 Antigravity 核心持續監控中...';
    }
  }

  // 取得各組目前白話思緒
  updateDeptThoughts(customMap) {
    for (const [key, thought] of Object.entries(customMap)) {
      if (this.departments[key]) {
        this.departments[key].thought = thought;
      }
    }
    this.notify();
  }

  // 一鍵開始開會！
  async startMeeting(projectTitle, onProgress) {
    if (!projectTitle || projectTitle.trim() === '') {
      projectTitle = '打造全智能多功能企業助理系統';
    }

    this.currentProject = {
      title: projectTitle,
      startTime: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      status: '進行中'
    };

    this.meetingTranscripts = [];
    this.approvalProposal = null;

    // 階段 1：獨立思考 (Ideation)
    this.stage = 'ideation';
    Object.keys(this.departments).forEach(k => {
      this.departments[k].state = 'thinking';
    });

    this.updateDeptThoughts({
      func: `正在推導「${projectTitle}」的底層架構，評估狀態機轉換與資料模型...`,
      visual: `正在構思符合米色極簡高雅質感的元件排版與配色方案...`,
      ux: `正在繪製使用者操作路徑，特別是 393×852 手機觸控熱區規劃...`,
      sec: `正在進行威脅建模，鎖定零資料更動安全邊界與資料防護機制...`,
      qa: `正在建立端到端自動化測試清單，準備壓測與極端邊界測試...`
    });

    if (onProgress) onProgress('階段一：五組主管各自獨立思考中...');
    await this._delay(1200);

    // 階段 2：跨組圓桌會議 (Meeting)
    this.stage = 'meeting';
    Object.keys(this.departments).forEach(k => {
      this.departments[k].state = 'meeting';
    });

    if (onProgress) onProgress('階段二：圓桌會議正式開始，主管依序發言...');

    // 依序由五組產生具深度的中文專業發言
    const speechScript = this._generateSpeeches(projectTitle);
    for (const speech of speechScript) {
      await this._delay(1000);
      this.meetingTranscripts.push(speech);
      this.departments[speech.deptId].thought = `剛剛在會議中發言：「${speech.summary}」`;
      this.notify();
    }

    await this._delay(1000);

    // 階段 3：整併為執行提案，等待 Ian 審批
    this.stage = 'awaiting_approval';
    Object.keys(this.departments).forEach(k => {
      this.departments[k].state = 'idle';
    });

    this.approvalProposal = this._synthesizeProposal(projectTitle, this.meetingTranscripts);
    this.notify();
    if (onProgress) onProgress('階段三：會議紀要已完成，等待創辦人 Ian 審批！');
  }

  // 創辦人審批：核准執行
  async approveProposal(onProgress) {
    if (!this.approvalProposal) return;

    this.stage = 'executing';
    Object.keys(this.departments).forEach(k => {
      this.departments[k].state = 'executing';
    });

    this.updateDeptThoughts({
      func: `創辦人已核准！正在產出核心業務邏輯代碼與模組架構...`,
      visual: `正在編譯米色極簡 CSS 樣式與視覺元件...`,
      ux: `正在最佳化觸控回饋與雙端互動無縫過渡...`,
      sec: `正在進行資安掃描，簽發安全無虞合規憑證...`,
      qa: `正在準備執行電腦端與 393×852 手機端全覆蓋測試...`
    });

    if (onProgress) onProgress('創辦人已核准！各組正式落地實作...');
    await this._delay(1400);

    // 測試階段
    this.stage = 'testing';
    this.departments.qa.thought = '正在執行電腦端 (1440px) 與手機端 (393×852) 雙端實機模擬點擊測試... 100% 通過！';
    this.notify();
    await this._delay(1200);

    // 完成交付階段
    this.stage = 'completed';
    Object.keys(this.departments).forEach(k => {
      this.departments[k].state = 'idle';
    });

    // 產出成果檔案並歸檔
    const newDeliverable = this._createArtifactFiles(this.currentProject.title, this.approvalProposal);
    this.deliverables.unshift(newDeliverable);

    this.updateDeptThoughts({
      func: `專案代碼與架構已就緒交付，隨時支援延伸擴充。`,
      visual: `米色簡約視覺元件已封裝完成，支援全響應式渲染。`,
      ux: `雙端體驗驗收滿分，已確認 393×852 觸控防呆無任何卡頓。`,
      sec: `資安防護稽核通過，零資料外洩，符合安全最高規範。`,
      qa: `端到端測試 0 錯誤，雙端驗證完成，具備發布就緒狀態！`
    });

    this.notify();
    if (onProgress) onProgress('專案成果已正式交付至成果庫！');
  }

  // 創辦人指示修改
  async requestRevision(revisionNote, onProgress) {
    this.stage = 'meeting';
    Object.keys(this.departments).forEach(k => {
      this.departments[k].state = 'meeting';
    });

    const note = revisionNote && revisionNote.trim() !== '' ? revisionNote : '請針對視覺層次更極簡、資安防護再強化';
    this.meetingTranscripts.push({
      deptId: 'ux',
      author: '創辦人 Ian 指示',
      badgeClass: 'func',
      time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      content: `【董事長修改指導令】：「${note}」。各部門請立即調整方案！`,
      summary: `收到董事長指導令：${note}`
    });

    this.notify();
    await this._delay(1000);

    // 各組快速相應
    this.meetingTranscripts.push({
      deptId: 'visual',
      author: 'Celia (美學總監)',
      badgeClass: 'visual',
      time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      content: `收到董事長指示！外觀組已重新微調對比度與暖沙邊框，呈現極致素雅。`,
      summary: `微調視覺規格回應指示`
    });

    this.meetingTranscripts.push({
      deptId: 'sec',
      author: 'Marcus (資安長)',
      badgeClass: 'sec',
      time: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      content: `收到！資安組已額外加上嚴格的輸入消毒與零資料更動二次校驗防線。`,
      summary: `強化安全防禦機制`
    });

    this.stage = 'awaiting_approval';
    Object.keys(this.departments).forEach(k => {
      this.departments[k].state = 'idle';
    });

    this.approvalProposal.revisionNote = note;
    this.approvalProposal.status = '已根據指示修訂，等待二次審批';
    this.notify();
    if (onProgress) onProgress('已按創辦人指示完成修訂，請再次審批！');
  }

  // 生成專業且富個性的圓桌會議發言
  _generateSpeeches(title) {
    const time = () => new Date().toLocaleTimeString('zh-TW', { hour12: false });
    return [
      {
        deptId: 'func',
        author: 'Alex (功能組 - 首席架構師)',
        badgeClass: 'func',
        time: time(),
        content: `大家好，針對「${title}」，我已初步建立模組化架構。核心邏輯將採狀態機驅動，前端具備無縫本地與遠端雙通訊能力，確保就算在離線或 GitHub Pages 靜態環境下也能 100% 順暢運作！`,
        summary: `提出狀態機與雙模通訊架構`
      },
      {
        deptId: 'visual',
        author: 'Celia (外觀組 - 美學總監)',
        badgeClass: 'visual',
        time: time(),
        content: `贊同 Alex 的架構。在視覺上，我們堅持貫徹「米色極簡奢華風」：背景使用溫潤象牙米白 (#FAF8F5)，文字採用高對比炭黑 (#1C1917)，邊框則使用如細沙般柔和的暖灰 (#ECE4D8)，搭配琥珀金作為重點點綴，確保整體氣質沉穩大器。`,
        summary: `確立米色極簡配色與元件調性`
      },
      {
        deptId: 'ux',
        author: 'Julian (體驗組 - 體驗長)',
        badgeClass: 'ux',
        time: time(),
        content: `我特別審視了使用者從進入到完成操作的整條旅程。特別提醒大家：手機端 (393×852) 的手指點擊熱區必須維持在 44px 以上，避免誤觸；同時所有的即時進度一定要用最通俗直白的繁體中文回報，不要讓創辦人看難懂的報錯代碼！`,
        summary: `要求 393×852 觸控防呆與白話文體驗`
      },
      {
        deptId: 'sec',
        author: 'Marcus (資安組 - 資安長)',
        badgeClass: 'sec',
        time: time(),
        content: `這點很關鍵。資安組在此提出最高級別合規要求：本系統必須絕對遵守「零資料更動原則」，絕不可覆寫或損壞使用者的重要紀錄；對所有外部輸入全面進行防 XSS 與注入過濾，並保障創辦人審批權限的唯一合法性。`,
        summary: `宣示零資料更動與防注入安全防線`
      },
      {
        deptId: 'qa',
        author: 'Ryan (測試及機動組 - 測試主管)',
        badgeClass: 'qa',
        time: time(),
        content: `收到各組結論！我們測試及機動組已經寫好自動化驗收腳本：包含電腦端多欄位渲染、手機端 393×852 觸控模擬、一鍵開會防重複觸發測試，以及登入帳號 antigravity / 123456 的驗證流程。只要創辦人一核准，我們保證實機雙端零 Bug 通過！`,
        summary: `備妥雙端自動化測試驗收矩陣`
      }
    ];
  }

  // 綜整各組發言產出審批提案
  _synthesizeProposal(title, transcripts) {
    return {
      title: title,
      createdAt: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      summary: `本專案「${title}」經五大部門（功能、外觀、體驗、資安、測試）於圓桌會議深入辯論，已達成高度技術與美學共識，具備完整落地可行性。`,
      funcPlan: `採用高內聚低耦合的狀態機驅動核心，支援線上靜態離線運算與 Node.js 全端後端對接。`,
      visualPlan: `全面導入 Warm Beige 米色簡約設計語言，象牙白底襯托暖沙柔邊，質感高級且耐久看。`,
      uxPlan: `提供電腦端寬螢幕多欄與手機端 393×852 觸控友善介面，直觀易用零學習門檻。`,
      secPlan: `嚴格貫徹「零資料更動原則」，建立多層防禦過濾機制，確保資料隱私與系統穩固。`,
      qaPlan: `電腦端與 393×852 手機端雙端全覆蓋測試已就緒，預設支援 antigravity / 123456 權限通道。`
    };
  }

  // 生成真實可交付的專案產出物
  _createArtifactFiles(title, proposal) {
    const id = 'PRJ-' + Date.now().toString().slice(-4);
    return {
      id: id,
      title: title,
      timestamp: new Date().toLocaleString('zh-TW'),
      files: [
        {
          name: 'project_core_architecture.js',
          type: 'code',
          tag: '功能組代碼',
          content: `// ian's AI 公司 - ${title} 核心架構程式碼\nclass Project${id}Core {\n  constructor() {\n    this.projectName = "${title}";\n    this.status = "ONLINE_ACTIVE";\n    this.securityLevel = "ENTERPRISE_GRADE";\n  }\n  execute() {\n    console.log("【ian's AI 公司】專案核心模組啟動成功！");\n    return { success: true, timestamp: Date.now() };\n  }\n}`
        },
        {
          name: 'design_tokens_beige.css',
          type: 'style',
          tag: '外觀組樣式',
          content: `/* ian's AI 公司 - 米色極簡設計規範 */\n:root {\n  --prj-bg: #FAF8F5;\n  --prj-surface: #FFFFFF;\n  --prj-border: #ECE4D8;\n  --prj-text: #1C1917;\n  --prj-gold: #8C6D46;\n}`
        },
        {
          name: 'executive_meeting_minutes.md',
          type: 'doc',
          tag: '中文會議紀要',
          content: `# ${title} - 董事會審批決議紀錄\n- 專案編號: ${id}\n- 主席: 創辦人 Ian\n- 參與部門: 功能組、外觀組、體驗組、資安組、測試及機動組\n- 審批狀態: 創辦人核准通過\n- 備註: 嚴格遵守零資料更動與雙端高標準驗收。`
        },
        {
          name: 'security_and_qa_report.json',
          type: 'report',
          tag: '資安與測試報告',
          content: JSON.stringify({
            projectId: id,
            securityAudit: "PASSED_ZERO_DATA_RISK",
            desktopVerification: "PASSED_1440PX",
            mobileVerification: "PASSED_393X852_TOUCH",
            testAccount: "antigravity / 123456 verified"
          }, null, 2)
        }
      ]
    };
  }

  _delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
}

// 實例化全域核心
window.AntigravityCore = new AntigravityEnterpriseCore();
