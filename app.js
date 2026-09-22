/* ======================= الحالة العامة ======================= */
let totalStars = 0;
let progress = {};
let current = { levelIndex:-1, qIndex:0, correctCount:0, answered:false };

const el = (id)=>document.getElementById(id);
function levelIndexOf(id){ return LEVELS.findIndex(l=>l.id===id); }

function initHome(){
  el('levelCount').textContent = LEVELS.length;
  renderHome();
}

function renderHome(){
  const container = el('homeSections');
  container.innerHTML = '';
  UNITS.forEach(u=>{
    const levelsInUnit = LEVELS.filter(l=>l.unit===u.key);
    if(levelsInUnit.length===0) return;
    const section = document.createElement('div');
    section.className = 'unit-section';
    const head = document.createElement('div');
    head.className = 'unit-head';
    head.textContent = u.label;
    section.appendChild(head);
    const grid = document.createElement('div');
    grid.className = 'grid';
    levelsInUnit.forEach(lvl=>{
      const idx = levelIndexOf(lvl.id);
      const stars = progress[lvl.id] || 0;
      const card = document.createElement('button');
      card.className = 'island';
      card.style.setProperty('--chip', lvl.chip);
      card.innerHTML = `
        <span class="icon">${lvl.icon}</span>
        <span class="name">${lvl.title}</span>
        <span class="stars">${starString(stars)}</span>
      `;
      card.addEventListener('click', ()=> startLevel(idx));
      grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });

  el('totalStars').textContent = totalStars;
  const doneCount = Object.keys(progress).filter(k=>progress[k]>0).length;
  el('doneCount').textContent = doneCount;
}

function starString(n){
  let s = '';
  for(let i=0;i<3;i++){ s += i<n ? '⭐' : '<span class="dim">⭐</span>'; }
  return s;
}

/* ======================= منطق الأسئلة ======================= */
function startLevel(idx){
  current = { levelIndex:idx, qIndex:0, correctCount:0, answered:false };
  el('home').style.display='none';
  el('levelResult').style.display='none';
  el('finalScreen').style.display='none';
  el('quiz').style.display='block';
  const lvl = LEVELS[idx];
  el('quizChip').textContent = lvl.icon;
  el('quizChip').style.background = lvl.chip;
  el('quizTitle').textContent = lvl.title;
  renderQuestion();
}

function renderQuestion(){
  const lvl = LEVELS[current.levelIndex];
  const q = lvl.questions[current.qIndex];
  current.answered = false;

  const pct = Math.round((current.qIndex/lvl.questions.length)*100);
  el('progressFill').style.width = pct + '%';

  el('feedback').textContent = '';
  el('feedback').className = 'feedback';
  el('nextBtn').style.display = 'none';

  const countBox = el('countBox');
  const optionsBox = el('options');
  optionsBox.innerHTML = '';
  countBox.style.display = 'none';
  countBox.innerHTML = '';

  if(q.type === 'count'){
    el('prompt').textContent = 'عدّ العناصر، ثم اختر العدد الصحيح:';
    el('subHint').textContent = '';
    countBox.style.display = 'flex';
    for(let i=0;i<q.count;i++){
      const span = document.createElement('span');
      span.textContent = q.emoji;
      countBox.appendChild(span);
    }
    optionsBox.className = 'options two-col';
    q.options.forEach(num=>{
      const btn = document.createElement('button');
      btn.className = 'opt';
      btn.innerHTML = `<span class="em">${num}</span>`;
      btn.addEventListener('click', ()=> handleAnswer(btn, num === q.count));
      optionsBox.appendChild(btn);
    });
  } else if(q.type === 'tf'){
    el('prompt').textContent = q.prompt;
    el('subHint').textContent = q.sub ? q.sub : '';
    optionsBox.className = 'options two-col';
    const trueBtn = document.createElement('button');
    trueBtn.className='opt';
    trueBtn.innerHTML = `<span class="em">✅</span> صحيح`;
    trueBtn.addEventListener('click', ()=> handleAnswer(trueBtn, q.correct === true));
    const falseBtn = document.createElement('button');
    falseBtn.className='opt';
    falseBtn.innerHTML = `<span class="em">❌</span> خطأ`;
    falseBtn.addEventListener('click', ()=> handleAnswer(falseBtn, q.correct === false));
    optionsBox.appendChild(trueBtn);
    optionsBox.appendChild(falseBtn);
  } else {
    el('prompt').textContent = q.prompt;
    if(q.sub){
      el('subHint').textContent = q.sub;
      el('subHint').style.fontSize = '30px';
      el('subHint').style.textAlign = 'center';
    } else {
      el('subHint').textContent = '';
      el('subHint').style.fontSize = '13.5px';
      el('subHint').style.textAlign = 'start';
    }
    optionsBox.className = q.options.length > 2 ? 'options' : 'options two-col';
    q.options.forEach(opt=>{
      const btn = document.createElement('button');
      btn.className = 'opt';
      btn.innerHTML = (opt.emoji ? `<span class="em">${opt.emoji}</span>` : '') + `<span>${opt.text}</span>`;
      btn.addEventListener('click', ()=> handleAnswer(btn, !!opt.correct));
      optionsBox.appendChild(btn);
    });
  }
}

function handleAnswer(btn, isCorrect){
  if(current.answered) return;
  current.answered = true;

  const allOpts = el('options').querySelectorAll('.opt');
  allOpts.forEach(o=>{
    o.disabled = true;
    if(o !== btn) o.classList.add('dimmed');
  });

  const fb = el('feedback');
  if(isCorrect){
    btn.classList.add('correct');
    current.correctCount++;
    fb.textContent = 'أحسنت! إجابة صحيحة 🌟';
    fb.className = 'feedback ok';
  } else {
    btn.classList.add('wrong');
    fb.textContent = 'حاول مرة أخرى في المرة القادمة 💪';
    fb.className = 'feedback bad';
  }

  el('nextBtn').style.display = 'block';
}

el('nextBtn').addEventListener('click', ()=>{
  const lvl = LEVELS[current.levelIndex];
  current.qIndex++;
  if(current.qIndex >= lvl.questions.length){
    finishLevel();
  } else {
    renderQuestion();
  }
});

function finishLevel(){
  const lvl = LEVELS[current.levelIndex];
  const total = lvl.questions.length;
  const ratio = current.correctCount / total;
  let stars = 1;
  if(ratio === 1) stars = 3;
  else if(ratio >= 0.6) stars = 2;
  else stars = 1;

  const prevStars = progress[lvl.id] || 0;
  if(stars > prevStars){
    totalStars += (stars - prevStars);
    progress[lvl.id] = stars;
  }

  el('quiz').style.display = 'none';
  el('levelResult').style.display = 'block';
  el('lrEmoji').textContent = stars === 3 ? '🏆' : (stars===2 ? '🎉' : '🌱');
  el('lrTitle').textContent = stars === 3 ? 'رائع جدًا!' : (stars===2 ? 'أحسنت!' : 'محاولة جيدة!');
  el('lrSub').textContent = `أجبت بشكل صحيح عن ${current.correctCount} من ${total} أسئلة في «${lvl.title}»`;
  el('lrStars').innerHTML = starString(stars);

  el('totalStars').textContent = totalStars;

  const allDone = LEVELS.every(l => (progress[l.id]||0) > 0);
  if(allDone){
    setTimeout(()=> showFinal(), 900);
  }
}

el('lrHomeBtn').addEventListener('click', ()=>{
  el('levelResult').style.display='none';
  el('home').style.display='block';
  renderHome();
});
el('lrRetryBtn').addEventListener('click', ()=>{
  startLevel(current.levelIndex);
});
el('backBtn').addEventListener('click', ()=>{
  el('quiz').style.display='none';
  el('home').style.display='block';
  renderHome();
});

function showFinal(){
  el('levelResult').style.display='none';
  el('home').style.display='none';
  el('finalScreen').style.display='block';
  el('finalSub').textContent = `جمعت ${totalStars} نجمة من أصل ${LEVELS.length*3}! أنت صديق حقيقي للأرض 🌍`;
}
el('finalRestartBtn').addEventListener('click', ()=>{
  totalStars = 0;
  progress = {};
  el('finalScreen').style.display='none';
  el('home').style.display='block';
  renderHome();
});

initHome();
