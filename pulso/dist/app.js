'use strict';
const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const KEY = 'pulso.routine.v1';
const $ = selector => document.querySelector(selector);
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
let now = new Date(), today = (now.getDay()+6)%7, selected = today, editing = null;
let state = {version:1,days:DAYS.map(name=>({name,enabled:false,exercises:[]})),completed:{}};
let loadWarning = '';
function validate(data){
  if(!data || data.version!==1 || !Array.isArray(data.days) || data.days.length!==7) throw Error('Formato no compatible. Usá un archivo JSON exportado desde Pulso (versión 1).');
  const ids = new Set();
  const str=(value,max,required=false)=>{if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw Error('Hay un campo de texto inválido en el archivo.');return value.trim();};
  const days=data.days.map((day,i)=>{
    if(!day||typeof day.enabled!=='boolean'||!Array.isArray(day.exercises)||day.exercises.length>200)throw Error('Los días o la cantidad de ejercicios no son válidos.');
    return {name:DAYS[i],enabled:day.enabled,exercises:day.exercises.map(e=>{
      if(!e||!Number.isInteger(e.sets)||e.sets<1||e.sets>100||!Number.isInteger(e.rest)||e.rest<0||e.rest>3600)throw Error('Revisá las series y los descansos del archivo.');
      const id=str(e.id,100,true);if(ids.has(id))throw Error('Hay ejercicios con identificadores repetidos.');ids.add(id);
      return {id,name:str(e.name,100,true),sets:e.sets,reps:str(e.reps,40,true),weight:str(e.weight??'',40),rest:e.rest,notes:str(e.notes??'',500)};
    })};
  });
  const completed={};
  if(data.completed!==undefined){if(!data.completed||typeof data.completed!=='object'||Array.isArray(data.completed))throw Error('El progreso no es válido.');
    for(const [date,list] of Object.entries(data.completed)){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Array.isArray(list)||list.some(id=>typeof id!=='string'))throw Error('El progreso no es válido.');completed[date]=[...new Set(list.filter(id=>ids.has(id)))];}
  }
  return {version:1,days,completed};
}
try{const raw=localStorage.getItem(KEY);if(raw)state=validate(JSON.parse(raw));}catch{loadWarning='No se pudo leer la rutina guardada. Podés recuperar una copia JSON.';}
let toastTimeout;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('visible'),4500);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{toast('No se pudo guardar en el navegador. Exportá tu rutina para conservarla.');return false;}}
function selectedDate(index=selected){const d=new Date(now);d.setDate(d.getDate()-today+index);return d;}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){
  $('#current-date').textContent=now.toLocaleDateString('es-UY',{weekday:'long',day:'numeric',month:'long'});
  $('#week').innerHTML=state.days.map((day,i)=>`<button class="day ${i===selected?'selected':''} ${i===today?'today':''}" data-day="${i}" aria-pressed="${i===selected}" ${i===today?'aria-current="date"':''} aria-label="${DAYS[i]}, ${day.enabled?'entrenamiento':'descanso'}">${i===today?'<span class="today-mark">HOY</span>':''}<span class="day-name">${DAYS[i].slice(0,3)}</span><span class="day-number">${selectedDate(i).getDate()}</span><span class="day-info">${day.enabled?`${day.exercises.length} ejercicio${day.exercises.length!==1?'s':''}`:'Descanso'}</span></button>`).join('');
  const day=state.days[selected],date=dateKey(selectedDate()),done=state.completed[date]||[];
  const count=day.exercises.filter(e=>done.includes(e.id)).length, total=day.exercises.length,percent=total?Math.round(count/total*100):0;
  $('#day-title').textContent=`${DAYS[selected]}${selected===today?' · Hoy':''}`;
  $('#day-subtitle').textContent=day.enabled?'TU SESIÓN DE ENTRENAMIENTO':'RECUPERAR TAMBIÉN ES PARTE';
  $('#progress-label').textContent=day.enabled?`${count} de ${total} ejercicios completados`:'Día de descanso';
  $('#progress-percent').textContent=day.enabled?`${percent}%`:'';
  $('#progress-bar').style.width=day.enabled?`${percent}%`:'0%';
  $('#add-exercise').hidden=!day.enabled;
  if(!day.enabled){$('#exercise-list').innerHTML=`<div class="empty"><span class="empty-symbol">☾</span><h3>Hoy toca recargar.</h3><p>Tenés este día libre. Podés dejarlo para descansar o convertirlo en un día de entrenamiento.${total?' Tus ejercicios siguen guardados.':''}</p><button class="button primary" data-action="enable">Entrenar este día ＋</button></div>`;}
  else if(!total){$('#exercise-list').innerHTML='<div class="empty"><span class="empty-symbol">＋</span><h3>Tu próximo paso empieza acá.</h3><p>Agregá el primer ejercicio de este día y construí una rutina que se adapte a vos.</p><button class="button primary" data-action="add">Agregar mi primer ejercicio ↗</button></div>';}
  else{$('#exercise-list').innerHTML=day.exercises.map((e,i)=>`<article class="exercise ${done.includes(e.id)?'completed':''}"><button class="check-button" data-action="check" data-id="${escapeHTML(e.id)}" aria-label="${done.includes(e.id)?'Marcar pendiente':'Completar'} ${escapeHTML(e.name)}" aria-pressed="${done.includes(e.id)}">✓</button><div class="exercise-main"><div class="exercise-order">EJERCICIO ${String(i+1).padStart(2,'0')}${done.includes(e.id)?' ? COMPLETADO':''}</div><h3>${escapeHTML(e.name)}</h3><div class="exercise-meta"><span class="metric metric-sets"><small>Series</small><strong>${e.sets}</strong></span><span class="metric metric-reps"><small>Repeticiones / tiempo</small><strong>${escapeHTML(e.reps)}</strong></span>${e.weight?`<span class="metric metric-weight"><small>Carga</small><strong>${escapeHTML(e.weight)}</strong></span>`:''}${e.rest?`<button class="mini-rest" data-action="rest" data-id="${escapeHTML(e.id)}"><small>Descanso &nearr;</small><strong>${e.rest} s</strong></button>`:''}</div>${e.notes?`<p class="exercise-notes">${escapeHTML(e.notes)}</p>`:''}</div><div class="exercise-actions"><button class="icon-button" data-action="up" data-id="${escapeHTML(e.id)}" aria-label="Subir ${escapeHTML(e.name)}" ${i===0?'disabled':''}>↑</button><button class="icon-button" data-action="edit" data-id="${escapeHTML(e.id)}" aria-label="Editar ${escapeHTML(e.name)}">✎</button><button class="icon-button" data-action="delete" data-id="${escapeHTML(e.id)}" aria-label="Eliminar ${escapeHTML(e.name)}">×</button></div></article>`).join('');}
  $('#training-count').innerHTML=`${state.days.filter(d=>d.enabled).length}<span>/7</span>`;
  $('#total-count').textContent=state.days.reduce((sum,d)=>sum+d.exercises.length,0);
}
function openExercise(exercise=null){editing=exercise?.id??null;$('#exercise-form').reset();$('#form-title').textContent=editing?'Editar ejercicio':'Agregar ejercicio';for(const [field,value] of Object.entries(exercise||{name:'',sets:3,reps:'',weight:'',rest:60,notes:''})){const input=$(`#exercise-${field}`);if(input)input.value=value;}$('#exercise-dialog').showModal();$('#exercise-name').focus();}
function openDays(){$('#day-choices').innerHTML=state.days.map((d,i)=>`<label class="day-choice">${DAYS[i]}<input type="checkbox" data-choice="${i}" ${d.enabled?'checked':''}></label>`).join('');$('#days-dialog').showModal();}
function confirmAction(title,description,accept){$('#confirm-title').textContent=title;$('#confirm-description').textContent=description;$('#confirm-accept').onclick=()=>{$('#confirm-dialog').close();accept();};$('#confirm-dialog').showModal();$('#confirm-cancel').focus();}
$('#confirm-cancel').onclick=()=>$('#confirm-dialog').close();
document.querySelectorAll('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
$('#configure-days').onclick=openDays;$('#days-nav').onclick=openDays;$('#today-nav').onclick=()=>{selected=today;render();};$('.brand').onclick=e=>{e.preventDefault();selected=today;render();};
$('#week').onclick=e=>{const button=e.target.closest('[data-day]');if(button){selected=Number(button.dataset.day);render();}};
$('#day-choices').onchange=e=>{if(!e.target.matches('[data-choice]'))return;state.days[Number(e.target.dataset.choice)].enabled=e.target.checked;save();render();};
$('#add-exercise').onclick=()=>openExercise();
$('#exercise-form').onsubmit=e=>{e.preventDefault();const name=$('#exercise-name').value.trim(),reps=$('#exercise-reps').value.trim();if(!name||!reps){toast('Completá el nombre y las repeticiones o duración.');return;}const exercise={id:editing||uid(),name,sets:Number($('#exercise-sets').value),reps,weight:$('#exercise-weight').value.trim(),rest:Number($('#exercise-rest').value),notes:$('#exercise-notes').value.trim()};const list=state.days[selected].exercises;if(editing){const i=list.findIndex(item=>item.id===editing);if(i>=0)list[i]=exercise;}else{if(list.length>=200){toast('Podés agregar hasta 200 ejercicios por día.');return;}list.push(exercise);}const saved=save();render();$('#exercise-dialog').close();if(saved)toast(editing?'Ejercicio actualizado.':'Ejercicio agregado. Un paso más.');};
$('#exercise-list').onclick=e=>{const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action,day=state.days[selected],index=day.exercises.findIndex(x=>x.id===b.dataset.id),exercise=day.exercises[index];if(action==='add'){openExercise();return;}if(action==='enable'){day.enabled=true;save();render();return;}if(!exercise)return;if(action==='edit'){openExercise(exercise);return;}if(action==='rest'){setTimer(exercise.rest);startTimer();return;}if(action==='delete'){confirmAction('¿Eliminar este ejercicio?',`Se quitará “${exercise.name}” de ${DAYS[selected].toLowerCase()}.`,()=>{day.exercises.splice(index,1);for(const date of Object.keys(state.completed))state.completed[date]=state.completed[date].filter(id=>id!==exercise.id);save();render();toast('Ejercicio eliminado.');});return;}if(action==='up'&&index>0){[day.exercises[index-1],day.exercises[index]]=[day.exercises[index],day.exercises[index-1]];}if(action==='check'){const date=dateKey(selectedDate()),done=state.completed[date]||[];state.completed[date]=done.includes(exercise.id)?done.filter(id=>id!==exercise.id):[...done,exercise.id];if(state.completed[date].length===day.exercises.length)toast('¡Sesión completada! Hoy cumpliste con vos.');}save();render();};
$('#export-button').onclick=()=>{const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`pulso-rutina-${dateKey(now)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Tu copia de la rutina está lista.');};
$('#import-button').onclick=()=>$('#import-file').click();
$('#import-file').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>2*1024*1024){toast('El archivo es demasiado grande. Máximo: 2 MB.');return;}try{const incoming=validate(JSON.parse(await file.text()));const count=incoming.days.reduce((n,d)=>n+d.exercises.length,0);confirmAction('Importar rutina',`El archivo contiene ${count} ejercicios y ${incoming.days.filter(d=>d.enabled).length} días de entrenamiento. Reemplazará la rutina y el progreso actuales. Exportá primero si querés conservar una copia.`,()=>{state=incoming;const saved=save();render();if(saved)toast('Rutina importada correctamente.');});}catch(error){toast(error instanceof SyntaxError?'El archivo no contiene JSON válido. Tu rutina no cambió.':error.message);}};
let duration=60,remaining=60,deadline=0,running=false,timerInterval;
function renderTimer(){$('#timer-display').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;$('#timer-toggle').textContent=running?'Pausar descanso':remaining===0?'Volver a iniciar':remaining<duration?'Continuar descanso':'Iniciar descanso';document.querySelectorAll('[data-seconds]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.seconds)===duration));}
function setTimer(seconds){clearInterval(timerInterval);duration=seconds;remaining=seconds;running=false;renderTimer();}
function tick(){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));if(remaining===0){clearInterval(timerInterval);running=false;toast('Descanso terminado. ¿Vamos con la próxima serie?');$('#timer-status').textContent='Descanso terminado.';}renderTimer();}
function startTimer(){if(remaining===0)remaining=duration;running=true;deadline=Date.now()+remaining*1000;clearInterval(timerInterval);timerInterval=setInterval(tick,250);renderTimer();}
$('#timer-toggle').onclick=()=>{if(running){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));running=false;clearInterval(timerInterval);renderTimer();}else startTimer();};$('#timer-reset').onclick=()=>setTimer(duration);document.querySelectorAll('[data-seconds]').forEach(b=>b.onclick=()=>setTimer(Number(b.dataset.seconds)));
function refreshDate(){const next=new Date();if(dateKey(next)!==dateKey(now)){const wasToday=selected===today;now=next;today=(now.getDay()+6)%7;if(wasToday)selected=today;render();}if(running)tick();}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDate();});setInterval(refreshDate,30000);
window.addEventListener('storage',event=>{if(event.key===KEY&&event.newValue){try{state=validate(JSON.parse(event.newValue));render();}catch{/* Keep current routine if another tab writes invalid data. */}}});
render();if(loadWarning)toast(loadWarning);
