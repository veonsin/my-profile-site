/**
 * 아는남자5 — 손그림 포트폴리오 & 저널 스크립트 (script.js)
 * 다크모드(칠판모드), 프로젝트 모달, 체크리스트, 일기장 저장 및 클릭 파티클 효과 제공
 */

// 프로젝트 상세 데이터 (허위 내용 없이 원본 그대로 유지)
const projectsData = {
  1: {
    title: 'Unknown (프로젝트 #01)',
    problem: 'On-going (연구 과제 정의 및 당면 문제 탐색 중)',
    role: 'On-going (제약 연구원으로서 담당 연구 진행 중)',
    result: 'On-going (실험 진행 및 데이터 검증 진행 중)'
  },
  2: {
    title: 'Unknown (프로젝트 #02)',
    problem: 'On-going (새로운 연구 가설 수립 및 단계별 검증 중)',
    role: 'On-going (데이터 분석 및 연구 실무 역할 수행 중)',
    result: 'On-going (추후 단계별 결실 도출 시 업데이트 예정)'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. 현재 연도 세팅
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. 테마 (스케치북 / 칠판 모드) 초기화
  initTheme();

  // 3. 데일리 체크리스트 초기화
  initChecklist();

  // 4. 일기장 메모 초기화
  initJournal();

  // 5. 클릭 시 손그림 파티클 애니메이션
  initDoodleParticles();
});

/* ========================================================
   스케치북 ↔ 칠판(다크모드) 테마 토글
   ======================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('doodle_site_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      const current = document.documentElement.getAttribute('data-theme');
      const target = current === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('doodle_site_theme', target);

      // 버튼 주변에 귀여운 스파클 튀기기
      const rect = toggleBtn.getBoundingClientRect();
      spawnDoodleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, ['✨', '🌙', '⭐', '☀️']);
    });
  }
}

/* ========================================================
   프로젝트 상세 보기 모달 창 제어
   ======================================================== */
const projectModal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalProblem = document.getElementById('modalProblem');
const modalRole = document.getElementById('modalRole');
const modalResult = document.getElementById('modalResult');

window.openProjectModal = function (id) {
  const data = projectsData[id];
  if (!data || !projectModal) return;

  modalTitle.textContent = data.title;
  modalProblem.textContent = data.problem;
  modalRole.textContent = data.role;
  modalResult.textContent = data.result;

  projectModal.classList.add('active');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  spawnDoodleBurst(window.innerWidth / 2, window.innerHeight / 2, ['🔬', '🧪', '✨']);
};

window.closeProjectModal = function () {
  if (!projectModal) return;
  projectModal.classList.remove('active');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

// ESC 키 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
    closeProjectModal();
  }
});

/* ========================================================
   데일리 다짐 체크리스트 (LocalStorage 연동)
   ======================================================== */
function initChecklist() {
  const checklistContainer = document.getElementById('dailyChecklist');
  if (!checklistContainer) return;

  const checkboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
  const savedState = JSON.parse(localStorage.getItem('doodle_checklist_state') || '[]');

  checkboxes.forEach((cb, idx) => {
    if (savedState.length > idx) {
      cb.checked = savedState[idx];
    }

    cb.addEventListener('change', () => {
      const state = Array.from(checkboxes).map(c => c.checked);
      localStorage.setItem('doodle_checklist_state', JSON.stringify(state));

      if (cb.checked) {
        const rect = cb.parentElement.getBoundingClientRect();
        spawnDoodleBurst(rect.left + 20, rect.top + 10, ['✔', '⭐', '💖']);
      }
    });
  });
}

/* ========================================================
   오늘의 하루 일기 & 생각 메모 (LocalStorage)
   ======================================================== */
function initJournal() {
  const input = document.getElementById('journalInput');
  const addBtn = document.getElementById('addJournalBtn');
  const list = document.getElementById('journalList');

  if (!input || !addBtn || !list) return;

  function loadMemos() {
    const raw = localStorage.getItem('doodle_journal_memos');
    let memos = [];

    if (raw) {
      try { memos = JSON.parse(raw); } catch (e) { memos = []; }
    } else {
      // 초기 기본 환영 메모
      memos = [
        { id: 1, text: '연구실에서 데이터 정리 완료! 오늘 저녁은 가벼운 한잔으로 재충전 🍶', date: '오늘' },
        { id: 2, text: '궁금한 점(?)이 생기면 주저 없이 파고들고, 팀원들과 유쾌하게 소통하자!', date: '어제' }
      ];
      localStorage.setItem('doodle_journal_memos', JSON.stringify(memos));
    }

    renderMemos(memos);
  }

  function renderMemos(memos) {
    list.innerHTML = '';
    if (memos.length === 0) {
      list.innerHTML = `
        <li style="text-align: center; color: var(--ink-light); padding: 14px 0; font-size: 1rem;">
          아직 기록된 일기가 없어요. 오늘의 한 줄을 남겨보세요! ✏️
        </li>
      `;
      return;
    }

    memos.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'journal-memo-item';
      li.innerHTML = `
        <span class="memo-txt">${escapeHtml(item.text)}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.85rem; color: var(--ink-light);">${item.date}</span>
          <button class="memo-del-btn" title="삭제" onclick="deleteJournalMemo(${item.id})">&times;</button>
        </div>
      `;
      list.appendChild(li);
    });
  }

  function addMemo() {
    const text = input.value.trim();
    if (!text) return;

    const raw = localStorage.getItem('doodle_journal_memos');
    const memos = raw ? JSON.parse(raw) : [];

    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;

    memos.unshift({
      id: Date.now(),
      text: text,
      date: dateStr
    });

    localStorage.setItem('doodle_journal_memos', JSON.stringify(memos));
    input.value = '';
    renderMemos(memos);

    const rect = addBtn.getBoundingClientRect();
    spawnDoodleBurst(rect.left + rect.width / 2, rect.top, ['📝', '✨', '💖']);
  }

  addBtn.addEventListener('click', addMemo);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addMemo();
  });

  window.deleteJournalMemo = function (id) {
    const raw = localStorage.getItem('doodle_journal_memos');
    let memos = raw ? JSON.parse(raw) : [];
    memos = memos.filter(m => m.id !== id);
    localStorage.setItem('doodle_journal_memos', JSON.stringify(memos));
    loadMemos();
  };

  loadMemos();
}

/* ========================================================
   손그림 파티클 효과 (클릭 시 퐁퐁 터지는 하트/별/음표)
   ======================================================== */
function initDoodleParticles() {
  document.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('.modal-doodle-content')) {
      return;
    }
    // 30% 확률로 귀여운 손그림 이모지 파티클 발생
    if (Math.random() < 0.3) {
      spawnDoodleBurst(e.clientX, e.clientY, ['✨', '💛', '🌸', '🎶', '⭐']);
    }
  });
}

function spawnDoodleBurst(x, y, symbols) {
  const count = 5;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'doodle-particle';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4 - 0.2);
    const dist = 30 + Math.random() * 40;
    const dx = Math.cos(angle) * dist + 'px';
    const dy = Math.sin(angle) * dist - 15 + 'px';

    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.setProperty('--dx', dx);
    p.style.setProperty('--dy', dy);

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
