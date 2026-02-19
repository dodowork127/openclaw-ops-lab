const KEY = 'fun_levelup_state_v1';

const state = loadState() || {
  xp: 0,
  level: 1,
  focusStreak: 0,
  tasks: [],
  missions: { m1: false, m2: false, m3: false },
  badge: '',
  pomodoro: 25 * 60,
};

let timer = null;

const $ = (id) => document.getElementById(id);
const xpBar = $('xpBar');
const xpText = $('xpText');
const levelText = $('levelText');
const doneCount = $('doneCount');
const focusStreak = $('focusStreak');
const countdown = $('countdown');
const timerDisplay = $('timerDisplay');
const taskList = $('taskList');
const mission1 = $('mission1');
const mission2 = $('mission2');
const mission3 = $('mission3');
const badge = $('badge');

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

function addXP(amount) {
  state.xp += amount;
  while (state.xp >= state.level * 100) {
    state.xp -= state.level * 100;
    state.level += 1;
  }
  evaluateMissions();
  save();
  render();
}

function evaluateMissions() {
  const completed = state.tasks.filter((t) => t.done).length;
  if (completed >= 1 && !state.missions.m1) {
    state.missions.m1 = true;
    state.xp += 20;
  }
  if (state.focusStreak >= 2 && !state.missions.m2) {
    state.missions.m2 = true;
    state.xp += 30;
  }
  const todayTotalXP = state.level > 1 ? 100 + state.xp : state.xp;
  if (todayTotalXP >= 120 && !state.missions.m3) {
    state.missions.m3 = true;
    state.badge = '🔥 오늘의 집중 챔피언';
  }
}

function render() {
  const need = state.level * 100;
  const ratio = Math.min((state.xp / need) * 100, 100);
  xpBar.style.width = `${ratio}%`;
  xpText.textContent = `XP ${state.xp} / ${need}`;
  levelText.textContent = `Lv.${state.level} ${state.level < 3 ? '루키' : state.level < 6 ? '스페셜리스트' : '마스터'}`;
  doneCount.textContent = `${state.tasks.filter((t) => t.done).length}개`;
  focusStreak.textContent = `${state.focusStreak}회`;

  taskList.innerHTML = '';
  state.tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';
    li.innerHTML = `
      <span>${task.text}</span>
      <div>
        <button class="ghost" data-action="toggle" data-idx="${idx}">${task.done ? '되돌리기' : '완료(+15XP)'}</button>
        <button class="ghost" data-action="delete" data-idx="${idx}">삭제</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  mission1.textContent = `${state.missions.m1 ? '[✓]' : '[ ]'} 퀘스트 1개 완료 ( +20XP )`;
  mission2.textContent = `${state.missions.m2 ? '[✓]' : '[ ]'} 집중 2회 달성 ( +30XP )`;
  mission3.textContent = `${state.missions.m3 ? '[✓]' : '[ ]'} 오늘 XP 120 이상 ( 보너스 뱃지 )`;
  badge.textContent = `배지: ${state.badge || '아직 없음'}`;

  timerDisplay.textContent = secToTime(state.pomodoro);
}

function secToTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateCountdown() {
  const now = new Date();
  const end = new Date();
  end.setHours(18, 0, 0, 0);
  if (now > end) {
    countdown.textContent = '퇴근 완료 🎉';
    return;
  }
  const diff = Math.floor((end - now) / 1000);
  const h = String(Math.floor(diff / 3600)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const s = String(diff % 60).padStart(2, '0');
  countdown.textContent = `${h}:${m}:${s}`;
}

$('taskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('taskInput');
  const text = input.value.trim();
  if (!text || state.tasks.length >= 3) return;
  state.tasks.push({ text, done: false });
  input.value = '';
  save();
  render();
});

taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  const action = btn.dataset.action;
  if (action === 'toggle') {
    const before = state.tasks[idx].done;
    state.tasks[idx].done = !before;
    if (!before) addXP(15);
  }
  if (action === 'delete') state.tasks.splice(idx, 1);
  evaluateMissions();
  save();
  render();
});

$('startTimer').addEventListener('click', () => {
  if (timer) return;
  timer = setInterval(() => {
    if (state.pomodoro <= 0) {
      clearInterval(timer);
      timer = null;
      return;
    }
    state.pomodoro -= 1;
    save();
    render();
  }, 1000);
});

$('pauseTimer').addEventListener('click', () => {
  clearInterval(timer);
  timer = null;
});

$('focusDone').addEventListener('click', () => {
  state.focusStreak += 1;
  state.pomodoro = 25 * 60;
  addXP(25);
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('정말 초기화할까요?')) return;
  localStorage.removeItem(KEY);
  location.reload();
});

setInterval(updateCountdown, 1000);
updateCountdown();
render();
