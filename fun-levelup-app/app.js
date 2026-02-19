const KEY = 'fun_levelup_state_v2';
const memes = ['칼퇴는 과학이다', '월요병 디버깅 중', '점심시간이 오늘의 MVP', '퇴근 10분 전 집중력 MAX'];

const state = loadState() || {
  xp: 0, level: 1, focusStreak: 0, pomodoro: 25 * 60,
  tasks: [], missions: { m1: false, m2: false, m3: false }, badge: '',
  schedule: [
    { time: '09:00', text: '업무 시작/메일 정리', done: false },
    { time: '10:30', text: '핵심 업무 딥워크', done: false },
    { time: '12:00', text: '점심 + 리셋', done: false },
    { time: '14:00', text: '회의/협업', done: false },
    { time: '16:30', text: '마감 정리/보고', done: false },
  ]
};

let timer = null;
const $ = (id) => document.getElementById(id);

function loadState(){ try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;} }
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function secToTime(sec){ const m=String(Math.floor(sec/60)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0'); return `${m}:${s}`; }

function addXP(amount){
  state.xp += amount;
  while(state.xp >= state.level * 100){ state.xp -= state.level * 100; state.level += 1; }
  evaluateMissions(); save(); render();
}

function evaluateMissions(){
  const completed = state.tasks.filter(t=>t.done).length;
  if(completed >= 2 && !state.missions.m1){ state.missions.m1 = true; state.xp += 20; }
  if(state.focusStreak >= 3 && !state.missions.m2){ state.missions.m2 = true; state.xp += 30; }
  const doneP1 = state.tasks.some(t=>t.done && t.priority==='P1');
  if(doneP1 && !state.missions.m3){ state.missions.m3 = true; state.xp += 40; state.badge = '🏆 칼퇴 각 잡는 실무러'; }
}

function updateCountdown(){
  const now = new Date();
  const end = new Date(); end.setHours(18,0,0,0);
  const el = $('countdown');
  if(now > end){ el.textContent='퇴근 완료 🎉'; return; }
  const diff = Math.floor((end-now)/1000);
  const h = String(Math.floor(diff/3600)).padStart(2,'0');
  const m = String(Math.floor((diff%3600)/60)).padStart(2,'0');
  const s = String(diff%60).padStart(2,'0');
  el.textContent = `${h}:${m}:${s}`;
}

function render(){
  const need = state.level * 100;
  $('xpBar').style.width = `${Math.min((state.xp/need)*100,100)}%`;
  $('xpText').textContent = `XP ${state.xp} / ${need}`;
  $('levelText').textContent = `Lv.${state.level} ${state.level < 3 ? '루키' : state.level < 6 ? '스페셜리스트' : '마스터'}`;
  $('doneCount').textContent = `${state.tasks.filter(t=>t.done).length}개`;
  $('focusStreak').textContent = `${state.focusStreak}회`;
  $('timerDisplay').textContent = secToTime(state.pomodoro);
  $('mission1').textContent = `${state.missions.m1 ? '[✓]' : '[ ]'} 태스크 2개 완료 ( +20XP )`;
  $('mission2').textContent = `${state.missions.m2 ? '[✓]' : '[ ]'} 집중 3회 달성 ( +30XP )`;
  $('mission3').textContent = `${state.missions.m3 ? '[✓]' : '[ ]'} P1 1개 완료 ( +40XP )`;
  $('badge').textContent = `배지: ${state.badge || '아직 없음'}`;
  $('memeLine').textContent = `오늘의 밈 코멘트: "${memes[new Date().getDate()%memes.length]}"`;

  const taskList = $('taskList'); taskList.innerHTML='';
  state.tasks.forEach((task, idx)=>{
    const li = document.createElement('li'); li.className = task.done ? 'done' : '';
    li.innerHTML = `<span><span class="pill ${task.priority.toLowerCase()}">${task.priority}</span> ${task.text} (${task.estimate}뽀모)</span>
      <div><button class="ghost" data-act="toggle" data-idx="${idx}">${task.done ? '되돌리기' : '완료(+15XP)'}</button>
      <button class="ghost" data-act="delete" data-idx="${idx}">삭제</button></div>`;
    taskList.appendChild(li);
  });

  const scheduleList = $('scheduleList'); scheduleList.innerHTML='';
  state.schedule.forEach((s, idx)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${s.done ? '✅' : '🕒'} ${s.time} ${s.text}</span>
      <button class="ghost" data-schedule="${idx}">${s.done ? '취소' : '완료'}</button>`;
    scheduleList.appendChild(li);
  });
}

$('taskForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const text = $('taskInput').value.trim();
  if(!text) return;
  state.tasks.push({ text, priority: $('priorityInput').value, estimate: Number($('estimateInput').value || 1), done:false });
  $('taskInput').value='';
  save(); render();
});

$('taskList').addEventListener('click',(e)=>{
  const b = e.target.closest('button'); if(!b) return;
  const idx = Number(b.dataset.idx);
  if(b.dataset.act==='toggle'){ const before = state.tasks[idx].done; state.tasks[idx].done = !before; if(!before) addXP(15); }
  if(b.dataset.act==='delete') state.tasks.splice(idx,1);
  evaluateMissions(); save(); render();
});

$('scheduleList').addEventListener('click',(e)=>{
  const b = e.target.closest('button'); if(!b) return;
  const idx = Number(b.dataset.schedule);
  state.schedule[idx].done = !state.schedule[idx].done;
  if(state.schedule[idx].done) addXP(8); else { save(); render(); }
});

$('startTimer').addEventListener('click',()=>{
  if(timer) return;
  timer = setInterval(()=>{
    if(state.pomodoro <= 0){ clearInterval(timer); timer = null; return; }
    state.pomodoro -= 1; save(); render();
  },1000);
});
$('pauseTimer').addEventListener('click',()=>{ clearInterval(timer); timer=null; });
$('focusDone').addEventListener('click',()=>{ state.focusStreak += 1; state.pomodoro = 25*60; addXP(25); });
$('resetBtn').addEventListener('click',()=>{ if(confirm('정말 초기화할까요?')){ localStorage.removeItem(KEY); location.reload(); } });

$('generateBriefing').addEventListener('click',()=>{
  const done = state.tasks.filter(t=>t.done);
  const pending = state.tasks.filter(t=>!t.done);
  const text = [
    `[업무 브리핑] ${new Date().toLocaleString('ko-KR')}`,
    `- 진행률: ${done.length}/${state.tasks.length} 완료`,
    `- 완료: ${done.map(d=>`${d.priority} ${d.text}`).join(', ') || '없음'}`,
    `- 잔여: ${pending.map(p=>`${p.priority} ${p.text}`).join(', ') || '없음'}`,
    `- 집중: 포모도로 ${state.focusStreak}회`,
    `- 코멘트: ${memes[new Date().getDate()%memes.length]}`,
  ].join('\n');
  $('briefingText').value = text;
});

$('copyBriefing').addEventListener('click', async()=>{
  const text = $('briefingText').value.trim();
  if(!text) return;
  await navigator.clipboard.writeText(text);
  alert('브리핑을 복사했습니다.');
});

setInterval(updateCountdown,1000); updateCountdown(); render();
