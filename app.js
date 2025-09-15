// Core logic mirrors your Excel v5.5 at high level.
// Conservative & capped by ADSS limits.
const LIMITS = { fluenceMax: 100 };
const spots = Array.from({length:19}, (_,i)=>i+2); // 2..20
const tipos = ["Telangiectasia roja","Telangiectasia azul/violeta","Vena reticular","Colateral/troncular superficial (seleccionada)","Matting (microtelangiectasias)"];
const diamBins = [[0.20,0.30],[0.30,0.40],[0.40,0.50],[0.50,0.60],[0.60,0.80],[0.80,1.00],[1.00,1.50],[1.50,2.00],[2.00,3.00],[3.00,4.00]];
const profBins = [[0.00,0.30],[0.30,0.50],[0.50,1.00],[1.00,1.50],[1.50,2.00],[2.00,3.00],[3.00,4.00]];
const ftFactor = {I:1, II:1, III:1, IV:0.9, V:0.8, VI:0.75};

function mid(a,b){ return (a+b)/2; }
function pulseRange(d){
  if (d<0.4) return [40,60];
  if (d<0.8) return [50,80];
  if (d<1.5) return [60,100];
  return [80,120];
}
function baseFluence3mm(d, tipo){
  let base = d<0.3?85:d<0.4?90:d<0.6?95:d<0.8?90:d<1.0?85:d<1.5?80:d<2.0?75:d<3.0?70:60;
  if (tipo==="Telangiectasia azul/violeta") base*=0.9;
  else if (tipo==="Vena reticular") base*=0.85;
  else if (tipo==="Colateral/troncular superficial (seleccionada)") base*=0.8;
  else if (tipo==="Matting (microtelangiectasias)") base*=1.1;
  return base;
}
function depthFactor(z){
  if (z<0.5) return 1.0;
  if (z<1.5) return 0.95;
  if (z<2.5) return 0.90;
  if (z<3.5) return 0.88;
  return 0.85;
}
function spotFactor(s){
  if (s<=2) return 1.35;
  if (s<=3) return 1.20;
  if (s<=4) return 1.05;
  if (s<=5) return 0.95;
  if (s<=6) return 0.90;
  if (s<=8) return 0.85;
  if (s<=12) return 0.80;
  return 0.75;
}
function suggestSpot(dmm){
  const target = Math.max(3, Math.min(8, 1.25*dmm*10));
  return spots.reduce((a,b)=>Math.abs(a-target)<Math.abs(b-target)?a:b);
}
function adjustRange(center){
  const low = Math.max(40, Math.round(center*0.85));
  const high = Math.min(LIMITS.fluenceMax, Math.round(center*1.15));
  return [Math.min(low,high), Math.max(low,high)];
}
function energyJ(fluence, spotmm){
  const area = Math.PI * Math.pow((spotmm/10)/2, 2);
  return +(fluence*area).toFixed(2);
}

function fillOptions(){
  const sel = (id, arr)=>{ const el=document.getElementById(id); el.innerHTML=""; arr.forEach(v=>{
      const o=document.createElement("option"); o.textContent=v; el.appendChild(o);
  });};
  sel("tipo", tipos);
  sel("diam", diamBins.map(([a,b])=>`${a.toFixed(2)}–${b.toFixed(2)}`));
  sel("prof", profBins.map(([a,b])=>`${a.toFixed(2)}–${b.toFixed(2)}`));
  const spotArr = ["Auto", ...spots];
  sel("spotEntrada", spotArr);
}
fillOptions();

function getSelectedRange(id){
  const [a,b] = document.getElementById(id).value.replace("–","-").split("-").map(parseFloat);
  return [a,b];
}

function calcular(){
  const tipo = document.getElementById("tipo").value;
  const [dlo,dhi] = getSelectedRange("diam");
  const [zlo,zhi] = getSelectedRange("prof");
  const dmid = mid(dlo,dhi), zmid = mid(zlo,zhi);
  const spotChoice = document.getElementById("spotEntrada").value;
  const ft = document.getElementById("fototipo").value;
  const bronz = document.getElementById("bronceada").value === "Sí";
  const pct = parseFloat(document.getElementById("pctBronceado").value || "0");
  
  const spotSug = suggestSpot(dmid);
  const spotFinal = (spotChoice==="Auto")? spotSug : parseInt(spotChoice,10);
  const [pLow,pHigh] = pulseRange(dmid);
  let pFTLow=pLow, pFTHigh=pHigh;
  if (ft==="IV"){ pFTLow = Math.round((pLow+pHigh)/2); }
  else if (ft==="V"){ pFTLow = Math.max(Math.round(pHigh*0.85), pLow); }
  else if (ft==="VI"){ pFTLow = Math.max(Math.round(pHigh*0.90), pLow); }
  const base3 = baseFluence3mm(dmid, tipo);
  const center = base3 * depthFactor(zmid) * spotFactor(spotFinal);
  let [fLow, fHigh] = adjustRange(center);
  const fFTLow = Math.min(Math.round(fLow*ftFactor[ft]), LIMITS.fluenceMax);
  const fFTHigh = Math.min(Math.round(fHigh*ftFactor[ft]), LIMITS.fluenceMax);
  const bf = bronz? (1 - pct/100) : 1;
  const fFinalLow = Math.round(fFTLow * bf);
  const fFinalHigh = Math.round(fFTHigh * bf);
  const eJ = energyJ(fFinalLow, spotFinal);
  // frequency: safe 1-3 Hz
  const freq = "1–3";

  // Render
  const set = (id, v)=>document.getElementById(id).textContent = v;
  set("spotSugerido", spotSug);
  set("spotFinal", spotFinal);
  set("pulsoBase", `${pLow}–${pHigh}`);
  set("pulsoFT", `${pFTLow}–${pFTHigh}`);
  set("fluenciaBase", `${fLow}–${fHigh}`);
  set("fluenciaFT", `${fFTLow}–${fFTHigh}`);
  set("fluenciaFinal", `${fFinalLow}–${fFinalHigh}`);
  set("energia", eJ);
  set("freq", freq);

  // Notes
  const notas = document.getElementById("notas"); notas.innerHTML="";
  const li = t=>{ const el=document.createElement("li"); el.textContent=t; notas.appendChild(el); };
  li("Enfriamiento obligatorio (contacto/aire). Usar extremo alto del pulso en FT IV–VI.");
  li("Subir fluencia en pasos pequeños si no hay blanqueamiento inmediato.");
  li("Evitar overlaps; disparos puntuales.");
}

function resetForm(){
  fillOptions();
  document.getElementById("fototipo").value = "I";
  document.getElementById("bronceada").value = "No";
  document.getElementById("pctBronceado").value = "12.5";
  ["spotSugerido","spotFinal","pulsoBase","pulsoFT","fluenciaBase","fluenciaFT","fluenciaFinal","energia","freq"].forEach(id=>{
    document.getElementById(id).textContent="—";
  });
  document.getElementById("notas").innerHTML="";
}

document.getElementById("btnCalc").addEventListener("click", calcular);
document.getElementById("btnReset").addEventListener("click", resetForm);

// Escleroterapia C1 V1 = C2 V2
function calcDilucion(){
  const c1=+document.getElementById("c1").value, v1=+document.getElementById("v1").value;
  const c2=+document.getElementById("c2").value, v2=+document.getElementById("v2").value;
  // Si faltan 3 variables y una es incógnita, resolvemos la que falte.
  let out="";
  if (!isNaN(c1) && !isNaN(v1) && !isNaN(c2) && isNaN(v2)) {
    const v2res = (c1*v1)/c2; out = `V2 = ${(v2res).toFixed(2)} mL`;
  } else if (!isNaN(c1) && isNaN(v1) && !isNaN(c2) && !isNaN(v2)) {
    const v1res = (c2*v2)/c1; out = `V1 = ${(v1res).toFixed(2)} mL de stock`;
  } else if (isNaN(c1) && !isNaN(v1) && !isNaN(c2) && !isNaN(v2)) {
    const c1res = (c2*v2)/v1; out = `C1 necesaria = ${(c1res).toFixed(2)} %`;
  } else if (!isNaN(c1) && !isNaN(v1) && isNaN(c2) && !isNaN(v2)) {
    const c2res = (c1*v1)/v2; out = `C2 = ${(c2res).toFixed(2)} %`;
  } else {
    out = "Ingresa tres variables y deja una vacía para calcularla.";
  }
  document.getElementById("dilucionOut").textContent = out;
}
document.getElementById("btnDiluir").addEventListener("click", calcDilucion);

// PWA install
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}

// Simple demo paywall
document.getElementById("unlock").addEventListener("click", ()=>{
  const s=document.getElementById("payStatus");
  s.textContent = "Modo PRO activado (demo).";
  s.classList.remove("muted");
});
