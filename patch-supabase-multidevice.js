const fs = require("fs");

const file = "index.html";
let s = fs.readFileSync(file, "utf8");

s = s.replace(
  "<title>Boss du Frais</title>",
  `<title>Boss du Frais</title><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
);

s = s.replace(
  `const soundFiles={miniWin:'assets/u_o8xh7gwsrj-cute_happy_victory-476376.mp3',finalWin:'assets/u_it78ck90s3-orchestral-win-331233.mp3',good:'assets/freesound_community-goodresult-82807.mp3',ooh:'assets/universfield-ooh-123103.mp3',bad:'assets/freesound_community-sadwhisle-91469.mp3'};`,
  `const soundFiles={miniWin:'assets/cute_happy_victory-476376.mp3',finalWin:'assets/orchestral-win-331233.mp3',good:'assets/goodresult-82807.mp3',ooh:'assets/ooh-123103.mp3',bad:'assets/sadwhisle-91469.mp3'};`
);

s = s.replaceAll(
  `<button class="btn danger" onclick="resetScores()">Remise à zéro des scores</button>`,
  ``
);

s = s.replace(
  `function getScores(){return JSON.parse(localStorage.getItem('bf_scores')||'[]').filter(s=>participants.includes(s.name))}function setScores(scores){localStorage.setItem('bf_scores',JSON.stringify(scores.filter(s=>participants.includes(s.name)).map(s=>({name:s.name,score:s.score,stages:s.stages,date:s.date}))))}function resetScores(){localStorage.removeItem('bf_scores');name='Paul';playSound('good');speak('Remise à zéro effectuée. Les compteurs du frais sont vides. Tout le monde peut rejouer.');boot()}`,
  `const SUPABASE_URL='https://londntrlnavypcshrplw.supabase.co';
const SUPABASE_KEY='sb_publishable_ZcEF10Ljl2LgN0oiebdPBA_kbpdgR1f';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let cloudScores=[];

async function loadScores(){
  const {data,error}=await supabaseClient
    .from('scores')
    .select('name,score,stages,created_at')
    .order('score',{ascending:false});

  if(error){
    console.error('Supabase load error',error);
    return cloudScores;
  }

  cloudScores=data||[];
  return cloudScores;
}

function getScores(){
  return cloudScores.filter(s=>participants.includes(s.name));
}

function setScores(scores){
  cloudScores=scores;
}

async function resetScores(){
  alert('Remise à zéro désactivée pour les joueurs.');
}

async function bootAsync(){
  await loadScores();
  boot();
}`
);

s = s.replace(
  `function hasPlayed(p){return getScores().some(s=>s.name===p)}`,
  `function hasPlayed(p){return getScores().some(s=>s.name===p)}`
);

s = s.replace(
  `function saveFinal(){let scores=getScores();if(scores.some(s=>s.name===name))return scores; scores.push({name,score,stages:stageScores,date:new Date().toLocaleString('fr-FR')});scores.sort((a,b)=>b.score-a.score);setScores(scores);return scores}`,
  `async function saveFinal(){
  await loadScores();
  let scores=getScores();

  if(scores.some(s=>s.name===name)) return scores;

  const {error}=await supabaseClient
    .from('scores')
    .insert({
      name:name,
      score:score,
      stages:stageScores
    });

  if(error){
    console.error('Supabase save error',error);
    alert('Score non enregistré : '+error.message);
    return scores;
  }

  await loadScores();
  return getScores();
}`
);

s = s.replace(
  `function end(){let scores=saveFinal();let myRank=scores.findIndex(s=>s.name===name)+1;`,
  `async function end(){let scores=await saveFinal();let myRank=scores.findIndex(s=>s.name===name)+1;`
);

s = s.replace(
  `function showFinalRanking(){let scores=ranked();`,
  `async function showFinalRanking(){await loadScores();let scores=ranked();`
);

s = s.replace(
  `function showPodium(){let s=ranked();`,
  `async function showPodium(){await loadScores();let s=ranked();`
);

s = s.replace(
  `boot()</script></body></html>`,
  `bootAsync()</script></body></html>`
);

fs.writeFileSync(file, s);
console.log("✅ Patch Supabase multi-device appliqué : index.html modifié.");