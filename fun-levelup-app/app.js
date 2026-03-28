const KEY = 'fun_levelup_state_v3';
const events = [
  { text: '갑작스런 회의 소집! 스트레스 +12, XP +8', stress: 12, xp: 8 },
  { text: '점심시간 버프! 스트레스 -10, XP +10', stress: -10, xp: 10 },
  { text: '상사 칭찬 획득! 스트레스 -6, XP +18', stress: -6, xp: 18 },
  { text: '긴급 수정 요청! 스트레스 +15, XP +15', stress: 15, xp: 15 },
];

const state = load() || {
  xp: 0, level: 1, focusStreak: 0, pomodoro: 25 * 60, stress: 20,
  jobClass: '자동화 닌자', tasks: [], schedule: [
    { time: '09:00', text: '메일/우선순위 정리', done: false },
    { time: '10:30', text: '딥워크 1세션', done: false },
    { time: '12:00', text: '점심 + 리셋', done: false },
    { time: '14:00', text: '회의/협업', done: false },
    { time: '16:30', text: '마감 정리/보고', done: false },
  ],
  weekly: { done: 0, pomo: 0, xp: 0 },
};

let timer = null;
const $ = (id) => document.getElementById(id);

function load(){ try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } }
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function secToTime(sec){ const m = String(Math.floor(sec/60)).padStart(2,'0'); const s = String(sec%60).padStart(2,'0'); return `${m}:${s}`; }

function addXP(xp){
  state.xp += xp;
  state.weekly.xp += xp;
  while(state.xp >= state.level * 100){ state.xp -= state.level * 100; state.level += 1; }
}

function addStress(delta){ state.stress = Math.min(100, Math.max(0, state.stress + delta)); }

function updateJobClass(){
  if(state.focusStreak >= 8) state.jobClass = '집중 마스터';
  else if(state.weekly.done >= 7) state.jobClass = '보고서 장인';
  else state.jobClass = '자동화 닌자';
}

function render(){
  const need = state.level * 100;
  $('xpBar').style.width = `${Math.min((state.xp / need) * 100, 100)}%`;
  $('xpText').textContent = `XP ${state.xp} / ${need}`;
  $('levelText').textContent = `Lv.${state.level}`;
  $('focusStreak').textContent = `${state.focusStreak}회`;
  $('stressText').textContent = `${state.stress}%`;
  $('classText').textContent = state.jobClass;
  $('timerDisplay').textContent = secToTime(state.pomodoro);

  $('ach1').textContent = `${state.weekly.pomo >= 3 ? '[✓]' : '[ ]'} 포모도로 3회`;
  $('ach2').textContent = `${state.tasks.some(t => t.done && t.priority === 'P1') ? '[✓]' : '[ ]'} P1 1개 완료`;
  $('ach3').textContent = `${state.stress < 60 ? '[✓]' : '[ ]'} 스트레스 60% 미만 유지`;
  $('weeklyTitle').textContent = `주간 타이틀: ${weeklyTitle()}`;

  $('weekDone').textContent = `${state.weekly.done}개`;
  $('weekPomo').textContent = `${state.weekly.pomo}회`;
  $('weekXp').textContent = `${state.weekly.xp}`;
  const total = state.weekly.done + state.tasks.filter(t => !t.done).length;
  $('weekRate').textContent = `${total ? Math.round((state.weekly.done / total) * 100) : 0}%`;

  const taskList = $('taskList'); taskList.innerHTML = '';
  state.tasks.forEach((t, i) => {
    const li = document.createElement('li');
    if(t.done) li.className = 'done';
    li.innerHTML = `<span><span class="pill ${t.priority.toLowerCase()}">${t.priority}</span> ${t.text}</span>
      <div><button class="ghost" data-act="toggle" data-i="${i}">${t.done ? '되돌리기' : '완료'}</button>
      <button class="ghost" data-act="del" data-i="${i}">삭제</button></div>`;
    taskList.appendChild(li);
  });

  const scheduleList = $('scheduleList'); scheduleList.innerHTML = '';
  state.schedule.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${s.done ? '✅' : '🕒'} ${s.time} ${s.text}</span><button class="ghost" data-i="${i}">${s.done ? '취소' : '완료'}</button>`;
    scheduleList.appendChild(li);
  });

  $('workMode').textContent = workModeLabel();
}

function weeklyTitle(){
  if(state.weekly.done >= 10 && state.weekly.pomo >= 10) return '칼퇴의 신';
  if(state.weekly.done >= 7) return '멀티태스커';
  if(state.weekly.pomo >= 6) return '딥워크 장인';
  return '수습 모험가';
}

function workModeLabel(){
  const now = new Date();
  const day = now.getDay();
  const h = now.getHours();
  const on = day >= 1 && day <= 5 && h >= 9 && h < 18;
  return on ? 'ON: 근무시간 자동 모드 작동 중' : 'OFF: 근무시간 외';
}

function updateCountdown(){
  const now = new Date();
  const end = new Date(); end.setHours(18,0,0,0);
  if(now > end) return $('countdown').textContent = '퇴근 완료 🎉';
  const diff = Math.floor((end - now) / 1000);
  const h = String(Math.floor(diff/3600)).padStart(2,'0');
  const m = String(Math.floor((diff%3600)/60)).padStart(2,'0');
  const s = String(diff%60).padStart(2,'0');
  $('countdown').textContent = `${h}:${m}:${s}`;
}

$('taskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('taskInput').value.trim();
  if(!text) return;
  state.tasks.push({ text, priority: $('priorityInput').value, done: false });
  $('taskInput').value = '';
  save(); render();
});

$('taskList').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if(!b) return;
  const i = Number(b.dataset.i);
  if(b.dataset.act === 'toggle'){
    const wasDone = state.tasks[i].done;
    state.tasks[i].done = !wasDone;
    if(!wasDone){ addXP(15); state.weekly.done += 1; addStress(-4); }
  }
  if(b.dataset.act === 'del') state.tasks.splice(i, 1);
  updateJobClass(); save(); render();
});

$('scheduleList').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if(!b) return;
  const i = Number(b.dataset.i);
  state.schedule[i].done = !state.schedule[i].done;
  if(state.schedule[i].done){ addXP(6); addStress(-2); }
  save(); render();
});

$('startTimer').addEventListener('click', () => {
  if(timer) return;
  timer = setInterval(() => {
    if(state.pomodoro <= 0){ clearInterval(timer); timer = null; return; }
    state.pomodoro -= 1;
    save(); render();
  }, 1000);
});
$('pauseTimer').addEventListener('click', () => { clearInterval(timer); timer = null; });
$('focusDone').addEventListener('click', () => {
  state.focusStreak += 1; state.weekly.pomo += 1; state.pomodoro = 25 * 60;
  addXP(25); addStress(-5); updateJobClass(); save(); render();
});

$('triggerEvent').addEventListener('click', () => {
  const ev = events[Math.floor(Math.random() * events.length)];
  $('eventText').textContent = ev.text;
  addStress(ev.stress); addXP(ev.xp);
  save(); render();
});

function buildBriefing(type){
  const done = state.tasks.filter(t => t.done).map(t => `${t.priority} ${t.text}`).join(', ') || '없음';
  const left = state.tasks.filter(t => !t.done).map(t => `${t.priority} ${t.text}`).join(', ') || '없음';
  const base = { done, left, pomo: state.weekly.pomo, stress: state.stress };
  return templates(type, base);
}

function chooseTemplateByContext(){
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 17) return 'eod';
  if (state.stress >= 70 || state.tasks.some(t => !t.done && t.priority === 'P1')) return 'manager';
  return 'review';
}

$('autoBriefing').addEventListener('click', () => {
  const type = chooseTemplateByContext();
  $('briefTemplate').value = type;
  $('briefingText').value = buildBriefing(type);
});

$('generateBriefing').addEventListener('click', () => {
  const type = $('briefTemplate').value;
  $('briefingText').value = buildBriefing(type);
});

function templates(type, d){
  if(type === 'manager') return `[팀장 보고]\n- 완료: ${d.done}\n- 잔여: ${d.left}\n- 집중: 포모도로 ${d.pomo}회\n- 리스크: 스트레스 ${d.stress}%`;
  if(type === 'review') return `[개인 회고]\n- 잘한 점: ${d.done}\n- 보완할 점: ${d.left}\n- 컨디션: 스트레스 ${d.stress}%\n- 내일 액션: P1 선처리 + 딥워크 2회`;
  return `[퇴근 전 요약]\n- 오늘 완료: ${d.done}\n- 남은 일: ${d.left}\n- 집중 기록: ${d.pomo}회\n- 상태: 스트레스 ${d.stress}%`; 
}

$('copyBriefing').addEventListener('click', async() => {
  const text = $('briefingText').value.trim(); if(!text) return;
  await navigator.clipboard.writeText(text); alert('브리핑 복사 완료');
});

$('resetBtn').addEventListener('click', () => {
  if(!confirm('초기화할까요?')) return;
  localStorage.removeItem(KEY); location.reload();
});

setInterval(updateCountdown, 1000);
updateCountdown();
render();
