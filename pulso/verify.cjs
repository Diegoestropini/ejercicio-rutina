const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync('dist/app.js','utf8').split('try{const raw=localStorage.getItem(KEY)')[0];
const context=vm.createContext({document:{querySelector(){}},crypto:require('node:crypto').webcrypto});vm.runInContext(source,context);
const base={version:1,days:Array.from({length:7},()=>({enabled:false,exercises:[]})),completed:{}};
base.days[2]={enabled:true,exercises:[{id:'a',name:'Sentadilla',sets:3,reps:'12',weight:'10 kg',rest:60,notes:'Controlar movimiento'}]};base.completed={'2026-10-14':['a']};
context.input=base;assert.equal(vm.runInContext('validate(input).days[2].exercises[0].name',context),'Sentadilla');
for(const alter of [x=>x.version=2,x=>x.days.pop(),x=>x.days[2].exercises[0].sets=-1,x=>x.days[2].exercises[0].rest=4000,x=>x.days[2].exercises.push(x.days[2].exercises[0]),x=>x.days[2].exercises[0].name='']){const input=structuredClone(base);alter(input);context.input=input;assert.throws(()=>vm.runInContext('validate(input)',context));}
context.input=JSON.parse(JSON.stringify(base));assert.equal(vm.runInContext('validate(input).completed["2026-10-14"][0]',context),'a');
console.log('PASS: JSON round trip, progress preservation and 6 invalid import cases.');
