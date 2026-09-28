/**
 * ian's AI 公司 - 創辦人可視化操作前端控制器 (UI Controller)
 */

document.addEventListener('DOMContentLoaded', () => {
  const core = window.AntigravityCore;

  // DOM 節點
  const departmentsGrid = document.getElementById('departmentsGrid');
  const dialogueStreamBox = document.getElementById('dialogueStreamBox');
  const liveHumanText = document.getElementById('liveHumanText');
  const liveHumanMeta = document.getElementById('liveHumanMeta');
  const transcriptsCount = document.getElementById('transcriptsCount');
  const proposalContent = document.getElementById('proposalContent');
  const proposalTitle = document.getElementById('proposalTitle');
  const approvalBadge = document.getElementById('approvalBadge');
  const btnApprove = document.getElementById('btnApprove');
  const btnModify = document.getElementById('btnModify');
  const btnReject = document.getElementById('btnReject');
  const btnStartMeeting = document.getElementById('btnStartMeeting');
  const projectTopicInput = document.getElementById('projectTopicInput');
  const artifactsGrid = document.getElementById('artifactsGrid');
  const meetingStateMetric = document.getElementById('meetingStateMetric');

  // Modals
  const changelogModal = document.getElementById('changelogModal');
  const btnOpenChangelog = document.getElementById('btnOpenChangelog');
  const btnCloseChangelog = document.getElementById('btnCloseChangelog');
  const changelogList = document.getElementById('changelogList');

  const loginModal = document.getElementById('loginModal');
  const btnOpenLogin = document.getElementById('btnOpenLogin');
  const btnCloseLogin = document.getElementById('btnCloseLogin');
  const loginForm = document.getElementById('loginForm');
  const loginBtnLabel = document.getElementById('loginBtnLabel');

  const revisionModal = document.getElementById('revisionModal');
  const btnCloseRevision = document.getElementById('btnCloseRevision');
  const btnCancelRevision = document.getElementById('btnCancelRevision');
  const btnSubmitRevision = document.getElementById('btnSubmitRevision');
  const revisionInput = document.getElementById('revisionInput');

  const previewModal = document.getElementById('previewModal');
  const btnClosePreview = document.getElementById('btnClosePreview');
  const previewModalTitle = document.getElementById('previewModalTitle');
  const previewModalCode = document.getElementById('previewModalCode');
  const btnCopyPreviewCode = document.getElementById('btnCopyPreviewCode');

  // 登入狀態管理
  let isLoggedIn = false;
  let currentUser = null;

  // 初始化預設成果展示
  initDefaultDeliverables();

  // 渲染五大部門卡片
  renderDepartments();

  // 綁定狀態監聽
  core.subscribe((engine) => {
    updateUI(engine);
  });

  // 與 Antigravity 聊天室即時狀態同步 (data/company_state.json)
  async function syncStateFromServer() {
    try {
      const res = await fetch('data/company_state.json?t=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      if (data.statusText) {
        liveHumanText.textContent = data.statusText;
      }
      if (data.metaText) {
        liveHumanMeta.textContent = data.metaText;
      }
      if (data.departments) {
        for (const [key, d] of Object.entries(data.departments)) {
          if (core.departments[key]) {
            core.departments[key].thought = d.thought;
            core.departments[key].state = d.state;
          }
        }
      }
      if (data.transcripts && data.transcripts.length > 0) {
        core.meetingTranscripts = data.transcripts;
      }
      if (data.proposal) {
        core.approvalProposal = data.proposal;
      }
      if (data.stage) {
        core.stage = data.stage;
      }
      core.notify();
    } catch (e) {
      // 離線或純前端模式靜默處理
    }
  }

  // 初始即刻同步一次，並設定每 2 秒自動輪詢
  syncStateFromServer();
  setInterval(syncStateFromServer, 2000);

  // 快速專案範本按鈕
  document.querySelectorAll('.quick-tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const topic = chip.getAttribute('data-topic');
      if (topic) {
        projectTopicInput.value = topic;
        projectTopicInput.focus();
      }
    });
  });

  // 一鍵開始開會按鈕
  btnStartMeeting.addEventListener('click', async () => {
    const topic = projectTopicInput.value.trim() || '打造兼具米色簡約美學的智慧學習卡專案';
    btnStartMeeting.disabled = true;
    btnStartMeeting.innerHTML = `<span>⏳</span><span>會議進行中...</span>`;
    meetingStateMetric.textContent = '開會中';
    meetingStateMetric.style.color = 'var(--brand-gold)';

    await core.startMeeting(topic, (statusText) => {
      liveHumanMeta.textContent = statusText;
    });

    btnStartMeeting.disabled = false;
    btnStartMeeting.innerHTML = `<span>🚀</span><span>一鍵開始開會</span>`;
    meetingStateMetric.textContent = '等待審批';
    meetingStateMetric.style.color = 'var(--color-ux)';
  });

  // 核准通過按鈕
  btnApprove.addEventListener('click', async () => {
    btnApprove.disabled = true;
    btnModify.disabled = true;
    btnReject.disabled = true;

    await core.approveProposal((statusText) => {
      liveHumanMeta.textContent = statusText;
    });

    meetingStateMetric.textContent = '已落地交付';
    meetingStateMetric.style.color = 'var(--color-ux)';
    alert('🎉 創辦人核准成功！五大部門已完成實作落地與雙端驗證，專案成果已存入下方「成果庫」！');
  });

  // 提出修改按鈕
  btnModify.addEventListener('click', () => {
    revisionModal.classList.add('open');
    revisionInput.value = '';
    revisionInput.focus();
  });

  btnCloseRevision.addEventListener('click', () => revisionModal.classList.remove('open'));
  btnCancelRevision.addEventListener('click', () => revisionModal.classList.remove('open'));

  btnSubmitRevision.addEventListener('click', async () => {
    const note = revisionInput.value.trim();
    revisionModal.classList.remove('open');
    
    btnApprove.disabled = true;
    btnModify.disabled = true;
    btnReject.disabled = true;

    await core.requestRevision(note, (statusText) => {
      liveHumanMeta.textContent = statusText;
    });
  });

  // 駁回按鈕
  btnReject.addEventListener('click', () => {
    if (confirm('確定要駁回此專案提案並重新待命嗎？')) {
      core.stage = 'idle';
      core.approvalProposal = null;
      core.meetingTranscripts = [];
      core.updateDeptThoughts({
        func: '收到駁回指令，已重置模組架構，隨時待命。',
        visual: '視覺規格暫存歸檔，等待新專案指令。',
        ux: '操作旅程清空，等待新專案啟動。',
        sec: '安全日誌已記錄駁回事件，維持零資料風險。',
        qa: '測試腳本重置完畢，等待下一輪驗收。'
      });
      core.notify();
      meetingStateMetric.textContent = '已重置待命';
      meetingStateMetric.style.color = 'var(--color-ux)';
    }
  });

  // 更新紀錄 Modal 事件
  btnOpenChangelog.addEventListener('click', async () => {
    await loadChangelog();
    changelogModal.classList.add('open');
  });
  btnCloseChangelog.addEventListener('click', () => changelogModal.classList.remove('open'));

  // 創辦人登入 Modal 事件
  btnOpenLogin.addEventListener('click', () => {
    if (isLoggedIn) {
      if (confirm(`目前已登入為「${currentUser}」，是否要登出？`)) {
        isLoggedIn = false;
        currentUser = null;
        loginBtnLabel.textContent = '創辦人登入';
        alert('已登出。');
      }
    } else {
      loginModal.classList.add('open');
    }
  });
  btnCloseLogin.addEventListener('click', () => loginModal.classList.remove('open'));

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('usernameInput').value.trim();
    const pass = document.getElementById('passwordInput').value.trim();

    if (user === 'antigravity' && pass === '123456') {
      isLoggedIn = true;
      currentUser = 'Ian (創辦人)';
      loginBtnLabel.textContent = 'Ian (創辦人)';
      loginModal.classList.remove('open');
      alert('✅ 歡迎創辦人 Ian 歸位！最高決策與審批權限已解鎖。');
    } else {
      alert('❌ 帳號或密碼錯誤！測試帳號請使用 antigravity / 密碼 123456');
    }
  });

  // 預覽 Modal 關閉
  btnClosePreview.addEventListener('click', () => previewModal.classList.remove('open'));
  btnCopyPreviewCode.addEventListener('click', () => {
    navigator.clipboard.writeText(previewModalCode.textContent).then(() => {
      alert('📋 內容已成功複製到剪貼簿！');
    });
  });

  // 點擊 Modal 外部關閉
  window.addEventListener('click', (e) => {
    if (e.target === changelogModal) changelogModal.classList.remove('open');
    if (e.target === loginModal) loginModal.classList.remove('open');
    if (e.target === revisionModal) revisionModal.classList.remove('open');
    if (e.target === previewModal) previewModal.classList.remove('open');
  });

  // 渲染五大部門卡片函式
  function renderDepartments() {
    departmentsGrid.innerHTML = '';
    for (const [key, dept] of Object.entries(core.departments)) {
      const card = document.createElement('div');
      card.className = `dept-card ${dept.badgeClass}`;
      card.id = `deptCard-${dept.id}`;

      let stateText = '在線待命';
      let stateClass = 'state-idle';
      if (dept.state === 'thinking') { stateText = '獨立思考中'; stateClass = 'state-thinking'; }
      if (dept.state === 'meeting') { stateText = '圓桌激盪中'; stateClass = 'state-meeting'; }
      if (dept.state === 'executing') { stateText = '實作落地中'; stateClass = 'state-executing'; }

      card.innerHTML = `
        <div class="dept-header">
          <div class="dept-icon">${dept.icon}</div>
          <div class="dept-name-box">
            <h3>${dept.name}</h3>
            <div class="lead-name">${dept.lead}</div>
          </div>
        </div>
        <div class="dept-badge-row">
          <span class="agent-state-badge ${stateClass}" id="badge-${dept.id}">
            <span class="pulse-dot" style="width: 6px; height: 6px;"></span>
            <span id="badgeText-${dept.id}">${stateText}</span>
          </span>
        </div>
        <div class="dept-thought-box">
          <div class="label">白話思緒動態</div>
          <div id="thoughtText-${dept.id}">${dept.thought}</div>
        </div>
      `;
      departmentsGrid.appendChild(card);
    }
  }

  // 更新整體介面狀態
  function updateUI(engine) {
    // 1. 白話文進度條與主狀態更新
    liveHumanText.textContent = engine.getHumanizedStatus();

    // 2. 步驟節點高亮
    document.querySelectorAll('.step-node').forEach(node => node.classList.remove('active', 'done'));
    const stageMap = {
      idle: 'stepNode-idle',
      ideation: 'stepNode-ideation',
      meeting: 'stepNode-meeting',
      awaiting_approval: 'stepNode-approval',
      executing: 'stepNode-executing',
      testing: 'stepNode-executing',
      completed: 'stepNode-completed'
    };
    const activeNodeId = stageMap[engine.stage] || 'stepNode-idle';
    const activeNode = document.getElementById(activeNodeId);
    if (activeNode) activeNode.classList.add('active');

    // 3. 各組狀態卡同步
    for (const [key, dept] of Object.entries(engine.departments)) {
      const badge = document.getElementById(`badge-${dept.id}`);
      const badgeText = document.getElementById(`badgeText-${dept.id}`);
      const thoughtText = document.getElementById(`thoughtText-${dept.id}`);

      if (badge && badgeText) {
        badge.className = 'agent-state-badge';
        if (dept.state === 'idle') {
          badge.classList.add('state-idle');
          badgeText.textContent = '在線待命';
        } else if (dept.state === 'thinking') {
          badge.classList.add('state-thinking');
          badgeText.textContent = '獨立思考中';
        } else if (dept.state === 'meeting') {
          badge.classList.add('state-meeting');
          badgeText.textContent = '圓桌激盪中';
        } else if (dept.state === 'executing') {
          badge.classList.add('state-executing');
          badgeText.textContent = '實作落地中';
        }
      }

      if (thoughtText) {
        thoughtText.textContent = dept.thought;
      }
    }

    // 4. 會議發言串渲染
    transcriptsCount.textContent = `發言數: ${engine.meetingTranscripts.length}`;
    if (engine.meetingTranscripts.length > 0) {
      dialogueStreamBox.innerHTML = '';
      engine.meetingTranscripts.forEach(speech => {
        const bubble = document.createElement('div');
        bubble.className = 'dialogue-bubble';
        bubble.innerHTML = `
          <div class="bubble-head">
            <div class="bubble-author">
              <span class="bubble-badge ${speech.badgeClass}">${speech.author}</span>
            </div>
            <span class="bubble-time">${speech.time}</span>
          </div>
          <div class="bubble-content">${speech.content}</div>
        `;
        dialogueStreamBox.appendChild(bubble);
      });
      dialogueStreamBox.scrollTop = dialogueStreamBox.scrollHeight;
    }

    // 5. 創辦人審批卡片渲染
    if (engine.stage === 'awaiting_approval' && engine.approvalProposal) {
      const p = engine.approvalProposal;
      approvalBadge.className = 'agent-state-badge state-meeting';
      approvalBadge.textContent = '⏳ 等待創辦人審批';

      proposalTitle.textContent = `📋 提案審查：${p.title}`;
      proposalContent.innerHTML = `
        <p style="font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">${p.summary}</p>
        <h4>⚙️ 功能組架構：</h4>
        <p>${p.funcPlan}</p>
        <h4>🎨 外觀組米色規範：</h4>
        <p>${p.visualPlan}</p>
        <h4>🖐️ 體驗組互動規劃：</h4>
        <p>${p.uxPlan}</p>
        <h4>🛡️ 資安組防護承諾：</h4>
        <p>${p.secPlan}</p>
        <h4>⚡ 測試及機動組驗收：</h4>
        <p>${p.qaPlan}</p>
      `;

      btnApprove.disabled = false;
      btnModify.disabled = false;
      btnReject.disabled = false;
    } else if (engine.stage === 'completed') {
      approvalBadge.className = 'agent-state-badge state-executing';
      approvalBadge.textContent = '✅ 已核准並完成落地';
      btnApprove.disabled = true;
      btnModify.disabled = true;
      btnReject.disabled = true;
    } else if (engine.stage === 'idle') {
      approvalBadge.className = 'agent-state-badge state-idle';
      approvalBadge.textContent = '等待會議結論';
      btnApprove.disabled = true;
      btnModify.disabled = true;
      btnReject.disabled = true;
    }

    // 6. 渲染專案成果庫
    renderDeliverables(engine.deliverables);
  }

  // 成果庫渲染函式
  function renderDeliverables(list) {
    artifactsGrid.innerHTML = '';
    if (!list || list.length === 0) {
      artifactsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-medium);">
          尚未產出落地成果。只要在上方召開會議並由創辦人點擊「✅ 核准執行」，Antigravity 即會為您落地產出代碼、樣式與測試報告！
        </div>
      `;
      return;
    }

    list.forEach(item => {
      item.files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'artifact-card';
        card.innerHTML = `
          <div class="artifact-top">
            <span class="artifact-tag">${file.tag}</span>
            <span style="font-size: 11px; color: var(--text-muted);">${item.id}</span>
          </div>
          <div class="artifact-title">${file.name}</div>
          <div class="artifact-desc">歸屬於「${item.title}」，經創辦人 Ian 審批後產出。</div>
          <div class="artifact-code-preview">${escapeHtml(file.content.slice(0, 140))}...</div>
          <div class="artifact-actions">
            <button class="btn-secondary btn-view-file" style="flex: 1; justify-content: center; padding: 6px;">
              👁️ 檢視內容
            </button>
            <button class="btn-gold btn-download-file" style="padding: 6px 12px;">
              ⬇️ 下載
            </button>
          </div>
        `;

        // 綁定檔案檢視
        card.querySelector('.btn-view-file').addEventListener('click', () => {
          previewModalTitle.textContent = `檔案檢視：${file.name}`;
          previewModalCode.textContent = file.content;
          previewModal.classList.add('open');
        });

        // 綁定檔案下載
        card.querySelector('.btn-download-file').addEventListener('click', () => {
          downloadFile(file.name, file.content);
        });

        artifactsGrid.appendChild(card);
      });
    });
  }

  // 預設成果範例初始化
  function initDefaultDeliverables() {
    const defaultArtifact = {
      id: 'PRJ-1001',
      title: '打造米色簡約風智慧學習卡專案',
      timestamp: '2026-09-28 10:00:00',
      files: [
        {
          name: 'flashcard_core_engine.js',
          type: 'code',
          tag: '功能組代碼',
          content: `// ian's AI 公司 - 智慧學習卡功能組核心實現\nclass FlashcardEngine {\n  constructor(cards = []) {\n    this.cards = cards;\n    this.currentIndex = 0;\n  }\n  next() {\n    this.currentIndex = (this.currentIndex + 1) % this.cards.length;\n    return this.cards[this.currentIndex];\n  }\n  shuffle() {\n    return this.cards.sort(() => Math.random() - 0.5);\n  }\n}`
        },
        {
          name: 'beige_minimal_theme.css',
          type: 'style',
          tag: '外觀組樣式',
          content: `/* 米色簡約美學變數表 */\n:root {\n  --card-bg: #FAF8F5;\n  --card-border: #EAE3D9;\n  --card-accent: #8C6D46;\n  --card-text: #1C1917;\n}\n.flashcard {\n  background: var(--card-bg);\n  border: 1px solid var(--card-border);\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 4px 12px rgba(28, 25, 23, 0.05);\n}`
        },
        {
          name: 'executive_meeting_minutes.md',
          type: 'doc',
          tag: '中文會議紀要',
          content: `# 智慧學習卡專案 - 董事會審批紀要\n- 專案編號: PRJ-1001\n- 創辦人審批: 核准通過\n- 參與部門: 功能組、外觀組、體驗組、資安組、測試及機動組\n- 關鍵決議: 嚴格採用 393×852 手機觸控熱區規範與零資料外洩資安防護。`
        }
      ]
    };
    core.deliverables.push(defaultArtifact);
    renderDeliverables(core.deliverables);
  }

  // 讀取 Changelog 資料
  async function loadChangelog() {
    try {
      const res = await fetch('data/changelog.json');
      if (!res.ok) throw new Error('Network error');
      const list = await res.json();
      renderChangelog(list);
    } catch (err) {
      console.warn('載入 changelog.json 失敗，使用內建資料備援', err);
      // 內建備援資料
      renderChangelog([
        {
          version: 'v1.0.0',
          date: '2026-09-28',
          title: 'ian\'s AI 公司正式營運啟航版',
          tag: '最新發布',
          highlights: [
            '🏛️ 確立「ian\'s AI 公司」企業架構，由 Google Antigravity 作為後端核心驅動中樞',
            '⚡ 推出「一鍵開始開會」功能：五大部門代理人即刻啟動獨立思考與圓桌激烈激盪',
            '⚖️ 實裝「創辦人審批中樞」：未經創辦人 Ian 親自審批核准，代理人不得擅自執行落地',
            '📡 建立「白話文即時進度監控中心」：通俗呈現 Antigravity 各組即時心跳與工作動態',
            '🎨 全站貫徹「米色極簡奢華風」：柔和米白、細緻暖沙邊框與琥珀金點綴',
            '📱 完美相容電腦端與手機端（393×852 規格與觸控反饋）',
            '🔐 內建管理員安全認證通道，支援 antigravity / 123456'
          ]
        },
        {
          version: 'v0.9.0',
          date: '2026-09-27',
          title: '核心架構原型與五大部門角色定義',
          tag: '歷史版本',
          highlights: [
            '完成五大部門角色人格、職能與發言機制',
            '完成白話文轉譯器原型開發'
          ]
        }
      ]);
    }
  }

  function renderChangelog(items) {
    changelogList.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'changelog-item';
      div.innerHTML = `
        <div class="changelog-head">
          <span class="changelog-version">${item.version}</span>
          <span class="changelog-date">${item.date}</span>
          <span class="changelog-tag">${item.tag}</span>
        </div>
        <div class="changelog-title">${item.title}</div>
        <ul class="changelog-list">
          ${item.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      `;
      changelogList.appendChild(div);
    });
  }

  // 工具函式：下載檔案
  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
