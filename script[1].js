const SITE_DATA = window.SITE_DATA;
const PERMANENT = [100,99,98,97,96,95];

let data = Array.isArray(window.FALLBACK_DATA) ? window.FALLBACK_DATA : [];
let fractals = Array.isArray(window.FRACTALS) ? window.FRACTALS : [];
let currentView = "today";
let calendarMonth = new Date();
let instabilities = [];

const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2,"0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const prettyDate = s => new Date(`${s}T00:00:00`).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const esc = s => String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function loadLive(){
  data = SITE_DATA.rows;
  fractals = SITE_DATA.fractals;
  $("todayStatus").textContent="Standalone data — no Google Sheets connection";
}

function uniqueInstabs(){
  const set=new Set();
  data.forEach(r=>fractals.forEach(f=>(r[f.number]||[]).forEach(x=>x&&set.add(x))));
  return [...set].sort();
}

function populate(){
  const options=fractals.map(f=>`<option value="${f.number}">${f.number} - ${esc(f.name)}</option>`).join("");
  $("fractalPicker").innerHTML=`<option value="all">All permanent fractals (100–95)</option>${options}`;
  $("filterFractal").innerHTML=`<option value="all">All fractals</option>${options}`;
  instabilities=uniqueInstabs();
  ["instab1","instab2","instab3","remove1","remove2","remove3"].forEach(id=>{
    $(id).innerHTML=`<option value="">None</option>${instabilities.map(x=>`<option>${esc(x)}</option>`).join("")}`;
  });
}

function getRow(date){return data.find(r=>r.date===date)}
function card(f,row){
  const vals=(row?.[f.number]||[]).filter(Boolean);
  if(!vals.length) return "";
  return `<article class="card"><div class="card-head"><div><div class="scale">${f.number}</div><div class="fractal-name">${esc(f.name)}</div></div></div><div class="instabs">${vals.map((x,i)=>`<div class="instab"><span class="instab-num">${i+1}</span>${esc(x)}</div>`).join("")}</div></article>`;
}

function renderToday(){
  const date=$("datePicker").value;
  $("todayTitle").textContent=prettyDate(date);
  const row=getRow(date);
  const choice=$("fractalPicker").value;
  let fs=choice==="all"?fractals.filter(f=>PERMANENT.includes(f.number)):fractals.filter(f=>String(f.number)===choice);
  // If the chosen date is outside the snapshot, still show a useful empty state.
  $("todayResults").innerHTML=row?fs.map(f=>card(f,row)).filter(Boolean).join(""):`<div class="empty">No spreadsheet data was found for this date.</div>`;
}

function renderCalendar(){
  const y=calendarMonth.getFullYear(), m=calendarMonth.getMonth();
  $("monthPicker").value=`${y}-${pad(m+1)}`;
  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  const start=(first.getDay()+6)%7;
  let html=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>`<div class="dow">${x}</div>`).join("");
  for(let i=0;i<start;i++) html+=`<div class="day"></div>`;
  const today=iso(new Date());
  for(let d=1;d<=last.getDate();d++){
    const ds=`${y}-${pad(m+1)}-${pad(d)}`, row=getRow(ds);
    const permanent=fractals.filter(f=>PERMANENT.includes(f.number));
    const summary=row?permanent.slice(0,3).map(f=>`<div>${esc((row[f.number]||[])[0]||"")}</div>`).join(""):"";
    html+=`<div class="day ${ds===today?"today":""} ${row?"has-data":""}" data-date="${ds}"><div class="day-num">${d}${row?'<span class="dot"></span>':""}</div><div class="day-list">${summary}</div></div>`;
  }
  $("calendar").innerHTML=html;
  document.querySelectorAll(".day[data-date]").forEach(el=>el.onclick=()=>{ $("datePicker").value=el.dataset.date; showView("today"); renderToday(); });
}

function applyFilters(){
  const fval=$("filterFractal").value;
  const must=[$("instab1").value,$("instab2").value,$("instab3").value].filter(Boolean);
  const remove=[$("remove1").value,$("remove2").value,$("remove3").value].filter(Boolean);
  const fs=fval==="all"?fractals:fractals.filter(f=>String(f.number)===fval);
  const results=[];
  data.forEach(row=>{
    fs.forEach(f=>{
      const vals=row[f.number]||[];
      if(!vals.length) return;
      const okMust=must.every(q=>vals.includes(q));
      const okRemove=remove.every(q=>!vals.includes(q));
      if(okMust&&okRemove) results.push({date:row.date,f,vals});
    });
  });
  $("filterResults").innerHTML=results.length?`<div class="result-box">${results.map(x=>`<div class="result-row"><div class="result-date">${esc(x.date)}</div><div class="pill"><b>${x.f.number}</b> ${esc(x.f.name)}</div>${x.vals.map(v=>`<div class="pill">${esc(v)}</div>`).join("")}</div>`).join("")}</div>`:`<div class="empty">No matches found.</div>`;
}

function showError(msg){$("errorBox").textContent=msg;$("errorBox").classList.remove("hidden")}
function showView(view){
  currentView=view;
  document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));
  $(`${view}View`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  if(view==="calendar") renderCalendar();
  if(view==="filter") applyFilters();
}

document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showView(b.dataset.view));
$("datePicker").onchange=renderToday;
$("fractalPicker").onchange=renderToday;
$("todayBtn").onclick=()=>{$("datePicker").value=iso(new Date());renderToday()};
$("prevMonth").onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()-1);renderCalendar()};
$("nextMonth").onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()+1);renderCalendar()};
$("monthPicker").onchange=e=>{const [y,m]=e.target.value.split("-").map(Number);calendarMonth=new Date(y,m-1,1);renderCalendar()};
["filterFractal","instab1","instab2","instab3","remove1","remove2","remove3"].forEach(id=>$(id).onchange=applyFilters);
$("clearFilters").onclick=()=>{["instab1","instab2","instab3","remove1","remove2","remove3"].forEach(id=>$(id).value="");$("filterFractal").value="all";applyFilters()};

function init(){
  const today=iso(new Date());
  $("datePicker").value=today;
  $("monthPicker").value=today.slice(0,7);
  loadLive();
  populate();
  renderToday();
  renderCalendar();
  $("lastUpdated").textContent=`Loaded ${new Date().toLocaleString("en-GB")}`;
}
init();
