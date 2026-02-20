const KEY = 'take_mvp_v1';
const state = JSON.parse(localStorage.getItem(KEY) || '{"meds":[],"logs":{}}');

const $ = id => document.getElementById(id);
const today = new Date().toISOString().slice(0,10);

function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

function isDue(med){
  const d = new Date().getDay();
  if (med.cycle === 'weekdays') return d >= 1 && d <= 5;
  return true;
}

function takenMap(){ return state.logs[today] || {}; }

function toggleTaken(id){
  state.logs[today] ||= {};
  state.logs[today][id] = !state.logs[today][id];
  save(); render();
}

function removeMed(id){
  state.meds = state.meds.filter(m=>m.id!==id);
  save(); render();
}

function render(){
  const ul = $('todayList'); ul.innerHTML = '';
  const map = takenMap();
  const due = state.meds.filter(isDue);

  due.sort((a,b)=>a.time.localeCompare(b.time)).forEach(m=>{
    const li = document.createElement('li');
    const ok = !!map[m.id];
    li.innerHTML = `
      <span>${ok ? '✅' : '🕒'} <strong>${m.name}</strong> (${m.time}, ${m.cycle==='daily'?'매일':'평일'})</span>
      <div>
        <button data-act="toggle" data-id="${m.id}">${ok ? '취소' : '복용완료'}</button>
        <button class="ghost" data-act="del" data-id="${m.id}">삭제</button>
      </div>`;
    ul.appendChild(li);
  });

  const done = due.filter(m=>map[m.id]).length;
  const missed = due.length - done;
  $('summary').textContent =
`[TAKE 일일 요약] ${today}
- 등록 약: ${state.meds.length}개
- 오늘 대상: ${due.length}개
- 복용완료: ${done}개
- 미복용: ${missed}개
- 준수율: ${due.length ? Math.round(done/due.length*100) : 0}%`;
}

$('medForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = $('name').value.trim();
  const time = $('time').value;
  const cycle = $('cycle').value;
  if(!name || !time) return;
  state.meds.push({ id: `${Date.now()}`, name, time, cycle });
  $('name').value='';
  save(); render();
});

$('todayList').addEventListener('click', (e)=>{
  const b = e.target.closest('button'); if(!b) return;
  const id = b.dataset.id;
  if(b.dataset.act==='toggle') toggleTaken(id);
  if(b.dataset.act==='del') removeMed(id);
});

$('copySummary').addEventListener('click', async()=>{
  await navigator.clipboard.writeText($('summary').textContent);
  alert('요약 복사 완료');
});

render();
