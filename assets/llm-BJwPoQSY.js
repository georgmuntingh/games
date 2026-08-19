const pt=`---
id: q4-hiring
title: Q4 hiring
goal: Two engineers and one designer signed before the end of the year
people: [Georg, Oliver, Sverre]
start: 2026-09-01
end: 2026-12-15
color: '#c2410c'
---
Budget is approved for three heads. We are not lowering the bar to fill them — an
unfilled role in January is a better outcome than a bad hire in November.

Everyone on the team interviews, which is why the loop has to be cheap. Last time we
burned roughly a day per candidate across four people and it was not sustainable.

The careers page lives on the new marketing site, so job descriptions are shared with
the website project and block that launch too.

## Constraints

- December is effectively three working weeks. Offers need to land in November.
- No agency fees above 18%.

## Open questions

- Do we run the take-home before or after the first call?
`,gt=`---
id: website
title: Website relaunch
goal: A visitor can go from landing page to a paid account with no human involved
people: [Georg, Oliver, Sverre]
start: 2026-08-01
end: 2026-11-30
color: '#2563eb'
---
Stripe is already set up under the ops address — Sverre has the keys. We are on the
standard plan, so no invoicing or purchase orders this round.

Oliver is 50% allocated to the platform team until October, so design-heavy weeks
should not be stacked before then. Georg is new and still ramping on our billing code.

The old site stays live on a subdomain for a week after launch. Support have asked
to be able to edit docs without waiting for a deploy — that is a hard requirement,
not a nice-to-have.

## Constraints

- Legal want a DPA review before launch. Ask Sverre, who owns the thread.
- No new backend services; this has to run on what we already operate.
- The pricing page copy needs a second pair of eyes from someone outside the team.

## Open questions

- Do we need SOC2 before the first enterprise trial, or can it follow?
- Is a free tier in scope, or only trial-to-paid?
`,wt=`---
id: analytics-dashboard
title: Analytics dashboard
project: [website]
people: [Oliver]
estimate: 1w
created: 2026-08-09
done: false
---
Wanted, not scheduled. Sits in the unscheduled tray until it earns a deadline.
`,mt=`---
id: billing-integration
title: Billing integration
project: [website]
people: [Oliver]
due: 2026-10-16
estimate: 1w
created: 2026-08-05
done: false
blocked-by: [signup-flow]
part-of: [self-serve-signup]
---
Stripe checkout plus the webhook that actually flips the account to paid.

- [ ] Checkout session
- [ ] Webhook handler
- [ ] Dunning emails
`,bt=`---
id: component-library
title: Component library
project: [website]
people: [Sverre]
due: 2026-09-25
estimate: 2w
created: 2026-08-02
done: false
blocked-by: [visual-design]
---
Build once, in the design tokens from visual design.

- [ ] Buttons, inputs, cards
- [ ] Navigation and footer
- [ ] Dark mode pass
`,yt=`---
id: copywriting
title: Copywriting
project: [website]
people: [Georg]
due: 2026-09-18
estimate: 1w
created: 2026-08-02
done: false
blocked-by: [information-architecture]
---
Every page needs a first draft before design review, even a bad one — lorem ipsum hides problems.

- [ ] Landing page
- [ ] Pricing page
- [ ] Onboarding emails
`,kt=`---
id: design-review
title: Design review
project: [website]
people: [Georg, Oliver, Sverre]
due: 2026-09-11
estimate: 3d
created: 2026-08-02
done: false
blocked-by: [visual-design]
---
One session with the whole team, not a comment thread.

- [ ] Circulate comps 48h ahead
- [ ] Run the session
- [ ] Fold in the changes
`,St=`---
id: discovery-interviews
title: Discovery interviews
project: [website]
people: [Georg, Oliver]
due: 2026-08-07
estimate: 1w
created: 2026-07-28
done: true
---
Eight calls with recent signups and three with churned accounts.

- [x] Recruit participants
- [x] Run the calls
- [x] Write up the themes
`,_t=`---
id: docs-site
title: Docs site
project: [website]
people: [Georg]
due: 2026-10-30
estimate: 1w
created: 2026-08-05
done: false
blocked-by: [copywriting, component-library]
---
Markdown in the repo, edited by support without a deploy.

- [ ] Pick the generator
- [ ] Port the existing FAQ
- [ ] Search
`,xt=`---
id: information-architecture
title: Information architecture
project: [website]
people: [Oliver]
due: 2026-08-14
estimate: 3d
created: 2026-07-30
done: false
blocked-by: [discovery-interviews]
---
Sitemap and URL scheme. Everything downstream keys off this, so it should not slip further.

- [x] Card sort with the themes from discovery
- [x] Draft the sitemap
- [ ] Agree redirects from the old URLs
`,$t=`---
id: interview-loop
title: Interview loop
project: [q4-hiring]
people: [Sverre, Oliver]
due: 2026-10-23
estimate: 1w
created: 2026-08-20
done: false
blocked-by: [job-descriptions]
---
Write the rubric before the first candidate, not after the third.

- [ ] Rubric
- [ ] Take-home exercise
- [ ] Interviewer training
`,Ot=`---
id: job-descriptions
title: Job descriptions
project: [q4-hiring, website]
people: [Georg]
due: 2026-09-11
estimate: 3d
created: 2026-08-20
done: false
---
Also blocks the careers page on the new site, hence the second project tag.

- [ ] Two engineering roles
- [ ] One design role
`,vt=`---
id: launch
title: Launch
project: [website]
people: [Georg]
due: 2026-11-27
estimate: 2d
created: 2026-08-05
done: false
blocked-by: [qa-pass]
---
Flip DNS, keep the old site warm for a week.

- [ ] Redirect map live
- [ ] Announcement post
- [ ] Old site on standby
`,Tt=`---
id: offers-out
title: Offers out
project: [q4-hiring]
people: [Georg]
due: 2026-12-04
estimate: 1w
created: 2026-08-20
done: false
blocked-by: [sourcing, interview-loop]
---
`,Et=`---
id: qa-pass
title: QA pass
project: [website]
people: [Sverre, Oliver]
due: 2026-11-13
estimate: 1w
created: 2026-08-05
done: false
blocked-by: [self-serve-signup, docs-site]
---
Real cards, real inboxes, three browsers.

- [ ] Signup on Safari and Firefox
- [ ] Billing edge cases
- [ ] Accessibility audit
`,At=`---
id: self-serve-signup
title: Self-serve signup
project: [website]
people: [Sverre, Oliver]
due: 2026-10-23
created: 2026-08-02
done: false
blocked-by: [design-review]
---
The umbrella for the whole signup-to-paid path. This is the goal the project exists for.
`,jt=`---
id: signup-flow
title: Signup flow
project: [website]
people: [Oliver]
due: 2026-10-09
estimate: 2w
created: 2026-08-05
done: false
blocked-by: [component-library]
part-of: [self-serve-signup]
---
- [ ] Email and OAuth signup
- [ ] Workspace creation
- [ ] Verification emails
`,Mt=`---
id: sourcing
title: Sourcing
project: [q4-hiring]
people: [Georg, Oliver]
due: 2026-10-02
estimate: 3w
created: 2026-08-20
done: false
blocked-by: [job-descriptions]
---
- [ ] Referral push
- [ ] Two agencies briefed
`,Ct=`---
id: visual-design
title: Visual design
project: [website]
people: [Oliver]
due: 2026-09-04
estimate: 2w
created: 2026-07-30
done: false
blocked-by: [wireframes]
---
- [ ] Type scale and colour tokens
- [ ] Landing page comps
- [ ] Empty and error states
`,Bt=`---
id: wireframes
title: Wireframes
project: [website]
people: [Oliver]
due: 2026-08-21
estimate: 1w
created: 2026-07-30
done: false
blocked-by: [information-architecture]
---
Low fidelity, greyscale. Enough to argue about structure without arguing about colour.

- [x] Landing page
- [ ] Pricing page
- [ ] Docs shell
`,P=["id","title","goal","starred","archived","project","people","due","estimate","created","done","working","blocked-by","part-of","x"],K=new Set(["project","people","blocked-by","part-of"]),me=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;function z(t){const e=t.trim();return e.length>=2&&(e[0]==='"'||e[0]==="'")&&e[e.length-1]===e[0]?e.slice(1,-1):e}function W(t){const e=t.trim();return e===""?"":e==="true"?!0:e==="false"?!1:e==="null"||e==="~"?null:z(e)}function be(t){const e=t.trim().slice(1,-1).trim();if(e==="")return[];const n=[];let r="",i=null;for(const o of e)i?(o===i&&(i=null),r+=o):o==='"'||o==="'"?(i=o,r+=o):o===","?(n.push(r),r=""):r+=o;return n.push(r),n.map(o=>z(o)).filter(o=>o!=="")}function j(t){const e=String(t).replace(/\r\n/g,`
`);if(!e.startsWith(`---
`))return{data:{},body:e.replace(/^\n+/,"")};const n=e.indexOf(`
---`,3);if(n===-1)return{data:{},body:e};const r=e.slice(4,n+1),i=e.indexOf(`
`,n+1),o=i===-1?"":e.slice(i+1),s={},a=r.split(`
`);let c=null;for(const d of a){if(d.trim()===""||d.trimStart().startsWith("#"))continue;const l=/^\s*-\s+(.*)$/.exec(d);if(l&&c){s[c].push(W(l[1]));continue}const p=/^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(d);if(!p)continue;const[,h,g]=p;c=null,g.trim()===""?(s[h]=[],c=h):g.trim().startsWith("[")&&g.trim().endsWith("]")?s[h]=be(g):s[h]=W(g)}for(const[d,l]of Object.entries(s))Array.isArray(l)&&l.length===0&&!K.has(d)&&(s[d]="");return{data:s,body:o}}function ye(t){const e=String(t);return e===""||/^[#&*!|>%@`?-]/.test(e)||/[:,[\]{}]/.test(e)||e!==e.trim()||["true","false","null","~"].includes(e)}function U(t){return typeof t=="boolean"||typeof t=="number"?String(t):t==null?"":ye(t)?`'${String(t).replace(/'/g,"''")}'`:String(t)}function ke(t,e){return Array.isArray(e)||K.has(t)?`[${(Array.isArray(e)?e:[e].filter(r=>r!==""&&r!=null)).map(U).join(", ")}]`:U(e)}function M(t,e=""){const r=[...P.filter(o=>o in t),...Object.keys(t).filter(o=>!P.includes(o))].map(o=>`${o}: ${ke(o,t[o])}`),i=String(e).replace(/\s+$/,"");return`---
${r.join(`
`)}
---
${i?`${i}
`:""}`}function Se(t){const e=[],n=[];for(const r of String(t).split(`
`)){const i=me.exec(r);i?e.push({done:i[1].toLowerCase()==="x",text:i[2].trim()}):n.push(r)}return{notes:n.join(`
`).trim(),subtasks:e}}function _e(t,e=[]){const n=e.map(i=>`- [${i.done?"x":" "}] ${i.text}`).join(`
`),r=String(t||"").trim();return r?n?`${r}

${n}`:r:n}const y="_project-",k=864e5,xe={æ:"ae",ø:"o",å:"a",ß:"ss",ð:"d",þ:"th",ł:"l",đ:"d"};function $e(t){return String(t).toLowerCase().replace(/[æøåßðþłđ]/g,n=>xe[n]).normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"task"}function Dt(t,e){const n=$e(t),r=e instanceof Set?e:new Set(e);if(!r.has(n))return n;for(let i=2;;i+=1){const o=`${n}-${i}`;if(!r.has(o))return o}}function b(t){if(t==null||t==="")return null;const e=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(t).trim());if(!e)return null;const n=Date.UTC(Number(e[1]),Number(e[2])-1,Number(e[3]));return Number.isNaN(n)?null:n}function X(t){return t==null?"":new Date(t).toISOString().slice(0,10)}const Oe={h:1,d:8,w:40};function ve(t){if(t==null||t==="")return null;const e=String(t).trim().toLowerCase(),n=/^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(e);return n?Number(n[1])*Oe[n[2]]:null}function Te(t){return t.reduce((e,n)=>e+(ve(n.estimate)??0),0)}function x(t){return t==null||t===""?[]:(Array.isArray(t)?t:[t]).map(e=>String(e).trim()).filter(Boolean)}function Ee(t){if(t==null||t==="")return null;const e=Number(t);return Number.isFinite(e)?e:null}function Q(t,e){const{data:n,body:r}=j(e),{notes:i,subtasks:o}=Se(r),s=String(t).replace(/\.md$/i,"");return{id:String(n.id||s),title:String(n.title||s),project:x(n.project),people:x(n.people),due:n.due?String(n.due):"",estimate:n.estimate?String(n.estimate):"",created:n.created?String(n.created):"",done:n.done===!0,goal:n.goal===!0,working:n.working===!0,x:Ee(n.x),blockedBy:x(n["blocked-by"]),partOf:x(n["part-of"]),notes:i,subtasks:o,extra:Object.fromEntries(Object.entries(n).filter(([a])=>!["id","title","project","people","due","estimate","created","done","goal","working","x","blocked-by","part-of"].includes(a)))}}function Z(t,e=[]){return Object.fromEntries(Object.entries(t).filter(([n,r])=>e.includes(n)?!0:Array.isArray(r)?r.length>0:r!==""&&r!=null))}function V(t){const e=Z({id:t.id,title:t.title,project:t.project??[],people:t.people??[],due:t.due??"",estimate:t.estimate??"",created:t.created??"",done:!!t.done,...t.goal?{goal:!0}:{},...t.working?{working:!0}:{},"blocked-by":t.blockedBy??[],"part-of":t.partOf??[],x:t.x??"",...t.extra??{}},["id","title","done"]);return M(e,_e(t.notes,t.subtasks))}function ee(t,e){const{data:n,body:r}=j(e),i=String(t),o=i.lastIndexOf("/"),s=i.slice(o+1).replace(/\.md$/i,"").replace(new RegExp(`^${y}`),"");return{id:String(n.id||s),title:String(n.title||s),goal:n.goal?String(n.goal):"",people:x(n.people),start:n.start?String(n.start):"",end:n.end?String(n.end):"",starred:n.starred===!0,archived:n.archived===!0,color:n.color?String(n.color):"",folder:o===-1?"":i.slice(0,o),context:String(r).trim()}}function te(t){return M(Z({id:t.id,title:t.title,goal:t.goal??"",...t.starred?{starred:!0}:{},...t.archived?{archived:!0}:{},people:t.people??[],start:t.start??"",end:t.end??"",color:t.color??""},["id","title"]),t.context??"")}const C="_trash.md",Ae=50;function ne(t){const{body:e}=j(t),n=/```json\s*\n([\s\S]*?)```/.exec(String(e));if(!n)return[];try{const r=JSON.parse(n[1]);return Array.isArray(r)?r:[]}catch{return[]}}function oe(t){const e=["```json",JSON.stringify(t??[],null,2),"```"].join(`
`);return M({id:"_trash"},e)}function Rt(t){return[...t??[]].sort((e,n)=>+!!n.starred-+!!e.starred||e.id.localeCompare(n.id))}function je(t,e=!1){return e?[...t??[]]:(t??[]).filter(n=>!n.archived)}function Nt(t,e,{deleteTasks:n=!1}={}){const r=(t.projects??[]).find(l=>l.id===e);if(!r)return null;const i=l=>l.project??[],o=l=>i(l).filter(p=>p!==e),s=l=>i(l).includes(e),a=l=>s(l)&&o(l).length===0,c=n?t.tasks.filter(l=>!l.goal&&a(l)):[],d=new Set([...c.map(l=>l.id),...t.tasks.filter(l=>l.goal&&s(l)).map(l=>l.id)]);return{project:r,removed:c,untagged:t.tasks.filter(l=>!l.goal&&s(l)&&!d.has(l.id)).map(l=>l.id),projects:(t.projects??[]).filter(l=>l.id!==e),tasks:t.tasks.filter(l=>!d.has(l.id)).map(l=>s(l)?{...l,project:o(l)}:l)}}function Ft(t,e){return[e,...t??[]].slice(0,Ae)}const Me=t=>`${t.id}.md`,Ce=t=>`${y}${t.id}.md`,Y=(t,e)=>t?`${t}/${e}`:e;function Be(t,e){var n;return e.get((n=t.project)==null?void 0:n[0])??""}function It(t){const e=new Set,n=new Set;for(const r of Object.keys(t)){const i=r.slice(r.lastIndexOf("/")+1);if(!/\.md$/i.test(i)||!i.startsWith(y))continue;const o=i.replace(/\.md$/i,"").replace(new RegExp(`^${y}`),"");e.has(o)&&n.add(o),e.add(o)}return[...n]}function Lt(t){const e=[],n=[];let r=[];const i=new Set;for(const[o,s]of Object.entries(t)){if(!/\.md$/i.test(o))continue;const a=o.slice(o.lastIndexOf("/")+1);if(a===C)r=ne(s);else if(a.startsWith(y)){const c=ee(o,s);if(i.has(c.id))continue;i.add(c.id),n.push(c)}else e.push(Q(a,s))}return e.sort((o,s)=>o.id.localeCompare(s.id)),n.sort((o,s)=>o.id.localeCompare(s.id)),{tasks:e,projects:n,trash:r}}function Pt({tasks:t,projects:e,trash:n}){const r={},i=new Map((e??[]).map(o=>[o.id,o.folder??""]));for(const o of e)r[Y(o.folder,Ce(o))]=te(o);for(const o of t)r[Y(Be(o,i),Me(o))]=V(o);return n!=null&&n.length&&(r[C]=oe(n)),r}function G(t,e){const n=String(t).slice(String(t).lastIndexOf("/")+1);return n===C?oe(ne(e)):n.startsWith(y)?te(ee(t,e)):V(Q(n,e))}function Wt(t,e,n){if(e===n)return!0;try{return G(t,e)===G(t,n)}catch{return!1}}const De=t=>`${t}-goal`;function Ut({tasks:t,projects:e},n=Date.now()){const r=new Map(e.filter(s=>{var a;return(a=s.goal)==null?void 0:a.trim()}).map(s=>[De(s.id),s])),i=[];let o=[];for(const s of t){if(!s.goal){o.push(s);continue}const a=r.get(s.id);if(!a){i.push(s);continue}r.delete(s.id);const c=a.goal.trim(),d=a.end??"";o.push(s.title===c&&s.due===d?s:{...s,title:c,due:d})}for(const[s,a]of r)o.push({id:s,title:a.goal.trim(),project:[a.id],people:[],due:a.end??"",estimate:"",created:X(n),done:!1,goal:!0,working:!1,x:null,blockedBy:[],partOf:[],notes:"",subtasks:[],extra:{}});return o.sort((s,a)=>s.id.localeCompare(a.id)),{tasks:o,removed:i}}function Yt(t,e,n){const r=t.find(c=>c.id===e),i=t.find(c=>c.id===n);if(!r||!i||e===n||r.goal||i.goal)return null;const o=[{done:!!r.done,text:r.title},...r.subtasks??[]],s=(c,d)=>[...new Set((c??[]).map(l=>l===e?n:l))].filter(l=>l!==d);return{tasks:t.filter(c=>c.id!==e).map(c=>{const d=c.id===n?{...c,subtasks:[...c.subtasks??[],...o]}:c;return{...d,blockedBy:s(d.blockedBy,d.id),partOf:s(d.partOf,d.id)}}),merged:r}}function Gt(t){const e=String(t??"").split(/[\s._-]+/).map(n=>n.replace(/[^\p{L}\p{N}]/gu,"")).filter(Boolean);return e.length?e.slice(0,2).map(n=>n[0].toUpperCase()).join(""):"?"}function qt(t,e){return t.map(n=>{const r=e!=null&&n.id===e;return!!n.working===r?n:{...n,working:r}})}function Jt(t,e,n){const r=new Set([e]);for(let i=!0;i;){i=!1;for(const o of t)r.has(o.id)||(o[n]??[]).some(s=>r.has(s))&&(r.add(o.id),i=!0)}return r}const S={day:{unit:"day",label:"Days",level(t,e){return(t-e)/k},dateForLevel(t,e){return e+t*k},format(t){return new Date(t).toISOString().slice(5,10).replace("-","/")}},week:{unit:"week",label:"Weeks",level(t,e){return(t-e)/(7*k)},dateForLevel(t,e){return e+t*7*k},format(t){return`${new Date(t).toISOString().slice(5,10).replace("-","/")}`}},month:{unit:"month",label:"Months",level(t,e){const n=new Date(e),r=new Date(t),i=(r.getUTCFullYear()-n.getUTCFullYear())*12+(r.getUTCMonth()-n.getUTCMonth()),o=Date.UTC(r.getUTCFullYear(),r.getUTCMonth(),1),s=Date.UTC(r.getUTCFullYear(),r.getUTCMonth()+1,1);return i+(t-o)/(s-o)},dateForLevel(t,e){const n=new Date(e);return Date.UTC(n.getUTCFullYear(),n.getUTCMonth()+Math.round(t),1)},format(t){const e=new Date(t);return`${e.toLocaleString("en",{month:"short",timeZone:"UTC"})} ${e.getUTCFullYear()}`}}};function Ht(t,e){if(t==null||e==null||e<=t)return S.week;const n=(e-t)/k;return n<=31?S.day:n<=240?S.week:S.month}function Kt(t){return S[t]??S.week}function zt(t,e){const n=e.map(d=>b(d.due)).filter(d=>d!=null),r=b(t==null?void 0:t.start),i=b(t==null?void 0:t.end),o=[r,...n].filter(d=>d!=null),s=[i,...n].filter(d=>d!=null),a=o.length?Math.min(...o):Date.now(),c=s.length?Math.max(...s):a+30*k;return{start:a,end:Math.max(c,a)}}function Xt(t,{bucket:e,start:n,collapse:r=!1}){const i=new Map;for(const u of t){const f=b(u.due);f!=null&&i.set(u.id,Math.floor(e.level(f,n)))}const o=[...i.values()],s=o.length?Math.min(...o):0,a=o.length?Math.max(...o):0,c=[...new Set(o)].sort((u,f)=>u-f),d=r?new Map(c.map((u,f)=>[u,f])):new Map(c.map(u=>[u,u-s])),l=r?Math.max(0,c.length-1):a-s,p=l+2,h=new Map;for(const u of t)h.set(u.id,i.has(u.id)?d.get(i.get(u.id)):p);const g=r?new Map([...d].map(([u,f])=>[f,u-s])):new Map(Array.from({length:l+1},(u,f)=>[f,f])),O=[];return r&&c.forEach((u,f)=>{const w=c[f-1];f>0&&u-w>1&&O.push({afterLevel:f-1,periods:u-w-1})}),{levels:h,trayLevel:p,minLevel:s,lastLevel:l,levelOrigin:g,gaps:O}}function Re(t,e,n=Date.now()){var a,c;const r=((a=t.subtasks)==null?void 0:a.length)??0,i=((c=t.subtasks)==null?void 0:c.filter(d=>d.done).length)??0,o=b(t.due),s=(t.blockedBy??[]).filter(d=>e.has(d)&&!e.get(d).done);return{done:!!t.done,working:!!t.working,total:r,checked:i,ratio:t.done?1:r===0?0:i/r,started:!t.done&&i>0,blocked:!t.done&&s.length>0,blockers:s,overdue:!t.done&&o!=null&&o<n}}const re=t=>new Map(t.map(e=>[e.id,e]));function Ne(t){return[...new Set(t.flatMap(e=>e.people??[]))].sort((e,n)=>e.localeCompare(n))}function Qt(t){return[...new Set(t.flatMap(e=>e.project??[]))].sort((e,n)=>e.localeCompare(n))}function Fe(t,e){const n=se(e,{projectId:(t==null?void 0:t.id)??null}),r=(t==null?void 0:t.people)??[],i=[...new Set([...r,...Ne(n)])],o=new Set(r);return i.map(s=>({name:s,inRoster:o.has(s),openTasks:n.filter(a=>!a.done&&(a.people??[]).includes(s)).length})).sort((s,a)=>Number(a.inRoster)-Number(s.inRoster)||s.name.localeCompare(a.name))}function se(t,{projectId:e=null,people:n=[],hideDone:r=!1}={}){const i=new Set(n);return t.filter(o=>!(e&&!(o.project??[]).includes(e)||i.size>0&&!(o.people??[]).some(s=>i.has(s))||r&&o.done))}function Ie(t){const e=new Set(t.map(o=>o.id)),n=new Map;for(const o of t)if(o.goal)for(const s of o.project??[])n.set(s,o.id);if(!n.size)return[];const r=new Set;for(const o of t){for(const s of o.blockedBy??[])e.has(s)&&r.add(s);for(const s of o.partOf??[])e.has(s)&&r.add(o.id)}const i=[];for(const o of t){if(o.goal||r.has(o.id))continue;const s=(o.project??[]).map(a=>n.get(a)).find(Boolean);s&&s!==o.id&&i.push({from:o.id,to:s})}return i}function Zt(t,e){const n=new Set(t.map(s=>s.id)),r=new Set(t.filter(s=>s.due).map(s=>s.id)),i=(s,a)=>r.has(s)&&r.has(a)&&((e==null?void 0:e.get(s))??0)>((e==null?void 0:e.get(a))??0),o=[];for(const{from:s,to:a}of Ie(t))o.push({id:`goal:${s}->${a}`,from:s,to:a,kind:"goal",conflict:i(s,a)});for(const s of t){for(const a of s.blockedBy??[]){if(!n.has(a))continue;const c=i(a,s.id);o.push({id:`blocks:${a}->${s.id}`,from:a,to:s.id,kind:"blocks",conflict:c})}for(const a of s.partOf??[])n.has(a)&&o.push({id:`part-of:${s.id}->${a}`,from:s.id,to:a,kind:"part-of",conflict:!1})}return o}const ie="tasks.files",Le="tasks-storage",$="handles",ae="directory",E=typeof globalThis.showDirectoryPicker=="function";function ce(){return new Promise((t,e)=>{const n=indexedDB.open(Le,1);n.onupgradeneeded=()=>n.result.createObjectStore($),n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error)})}async function q(t){const e=await ce();await new Promise((n,r)=>{const i=e.transaction($,"readwrite");i.objectStore($).put(t,ae),i.oncomplete=n,i.onerror=()=>r(i.error)}),e.close()}async function J(){const t=await ce(),e=await new Promise((n,r)=>{const o=t.transaction($,"readonly").objectStore($).get(ae);o.onsuccess=()=>n(o.result),o.onerror=()=>r(o.error)});return t.close(),e}function Pe(){try{const t=localStorage.getItem(ie),e=t?JSON.parse(t):null;return e&&typeof e=="object"?e:null}catch{return null}}function H(t){try{localStorage.setItem(ie,JSON.stringify(t))}catch{}}const le=t=>t.toLowerCase().endsWith(".md");async function We(t){const e=[];for await(const[n,r]of t.entries())r.kind==="file"&&le(n)&&e.push([n,r]);return e}async function Ue(t){const e={},n=[];for await(const[r,i]of t.entries())i.kind==="directory"?n.push([r,i]):i.kind==="file"&&le(r)&&(e[r]=await(await i.getFile()).text());for(const[r,i]of n){const o=await We(i);if(o.some(([s])=>s.startsWith(y)))for(const[s,a]of o)e[`${r}/${s}`]=await(await a.getFile()).text()}return e}function Vt({sameFile:t=(e,n,r)=>n===r}={}){let e=null,n=!1;async function r(u,f){let w=e;for(const v of u.split("/").slice(0,-1))w=await w.getDirectoryHandle(v,{create:f});return w}const i=u=>u.slice(u.lastIndexOf("/")+1);let o=new Set,s=new Map;const a={get mode(){return e?"folder":"local"},get folderName(){return(e==null?void 0:e.name)??""},supportsFolder:E,reconnectable:!1,get writable(){return!e||n}};async function c(){if(!E)return!1;let u;try{u=await J()}catch{return!1}if(!u)return!1;try{if(await u.queryPermission({mode:"readwrite"})==="granted")return e=u,!0;a.reconnectable=!0}catch{}return!1}async function d(){if(e||await c(),e){const u=await Ue(e);return o=new Set(Object.keys(u)),s=new Map(Object.entries(u)),H(u),u}return Pe()??{}}async function l(u){if(e&&!n)return{skipped:"read-only"};if(H(u),!e)return{};for(const[f,w]of Object.entries(u)){const v=s.get(f);if(v!==void 0&&t(f,v,w))continue;const L=await(await(await r(f,!0)).getFileHandle(i(f),{create:!0})).createWritable();await L.write(w),await L.close(),s.set(f,w)}for(const f of o)if(!(f in u)){try{await(await r(f,!1)).removeEntry(i(f))}catch{}s.delete(f)}return o=new Set(Object.keys(u)),{}}async function p(){if(!e)return null;const u=await d();return n=!0,u}function h(){n=!1}async function g(){if(!E)throw new Error("This browser cannot open folders.");const u=a.reconnectable&&await J()||await globalThis.showDirectoryPicker({mode:"readwrite"});if(await u.requestPermission({mode:"readwrite"})!=="granted")throw new Error("Permission to use that folder was declined.");return e=u,n=!1,a.reconnectable=!1,await q(u).catch(()=>{}),d()}function O(){e=null,n=!1,s=new Map,a.reconnectable=!1,q(null).catch(()=>{})}return{state:a,load:d,save:l,unlock:p,lock:h,connectFolder:g,disconnectFolder:O,tryRestoreFolder:c}}const Ye=67324752,Ge=33639248,qe=101010256,Je=(()=>{const t=new Uint32Array(256);for(let e=0;e<256;e+=1){let n=e;for(let r=0;r<8;r+=1)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t})();function He(t){let e=4294967295;for(let n=0;n<t.length;n+=1)e=Je[(e^t[n])&255]^e>>>8;return(e^4294967295)>>>0}function Ke(t){const e=Math.max(1980,t.getFullYear());return{time:t.getHours()<<11|t.getMinutes()<<5|Math.floor(t.getSeconds()/2),date:e-1980<<9|t.getMonth()+1<<5|t.getDate()}}class ze{constructor(){this.chunks=[],this.length=0}bytes(e){this.chunks.push(e),this.length+=e.length}u16(e){this.bytes(new Uint8Array([e&255,e>>>8&255]))}u32(e){this.bytes(new Uint8Array([e&255,e>>>8&255,e>>>16&255,e>>>24&255]))}concat(){const e=new Uint8Array(this.length);let n=0;for(const r of this.chunks)e.set(r,n),n+=r.length;return e}}function en(t,e=new Date){const n=new TextEncoder,{time:r,date:i}=Ke(e),o=new ze,s=[];for(const[d,l]of Object.entries(t)){const p=n.encode(d),h=n.encode(l),g=He(h);s.push({nameBytes:p,size:h.length,crc:g,offset:o.length}),o.u32(Ye),o.u16(20),o.u16(2048),o.u16(0),o.u16(r),o.u16(i),o.u32(g),o.u32(h.length),o.u32(h.length),o.u16(p.length),o.u16(0),o.bytes(p),o.bytes(h)}const a=o.length;for(const d of s)o.u32(Ge),o.u16(20),o.u16(20),o.u16(2048),o.u16(0),o.u16(r),o.u16(i),o.u32(d.crc),o.u32(d.size),o.u32(d.size),o.u16(d.nameBytes.length),o.u16(0),o.u16(0),o.u16(0),o.u16(0),o.u32(0),o.u32(d.offset),o.bytes(d.nameBytes);const c=o.length-a;return o.u32(qe),o.u16(0),o.u16(0),o.u16(s.length),o.u16(s.length),o.u32(c),o.u32(a),o.u16(0),o.concat()}const _=t=>String(t??"").replace(/\|/g,"\\|").replace(/\n+/g," ").trim(),Xe=t=>(t.people??[]).join(", ");function Qe(t){return t.done?"done":t.total===0?"—":`${t.checked}/${t.total}`}const B=(t,e)=>(b(t.due)??1/0)-(b(e.due)??1/0);function de(t,{now:e=Date.now()}={}){const n=[];n.push(`# ${(t==null?void 0:t.title)||"Untitled project"}`),t!=null&&t.goal&&n.push("","## Goal",t.goal.trim()),t!=null&&t.context&&n.push("","## Context",t.context.trim());const r=[t==null?void 0:t.start,t==null?void 0:t.end].filter(Boolean);return n.push(""),r.length===2&&n.push(`Window: ${t.start} → ${t.end}`),n.push(`Today: ${X(e)}`),n.join(`
`)}function ue(t,{now:e=Date.now()}={}){const n=re(t),r=["## Tasks","","| id | task | due | estimate | people | subtasks |"];r.push("|----|------|-----|----------|--------|----------|");const i=[...t].sort(B);for(const o of i){const s=Re(o,n,e);r.push(`| ${_(o.id)} | ${_(o.title)} | ${_(o.due)||"—"} | ${_(o.estimate)||"—"} | ${_(Xe(o))||"—"} | ${Qe(s)} |`)}return i.length===0&&r.push("| — | _no tasks yet_ | — | — | — | — |"),r.join(`
`)}function fe(t){const e=re(t),n=[];for(const r of[...t].sort(B)){for(const i of r.blockedBy??[])e.has(i)&&n.push(`- ${r.id} blocked-by ${i}`);for(const i of r.partOf??[])e.has(i)&&n.push(`- ${r.id} part-of ${i}`)}return["## Dependencies","",n.length?n.join(`
`):"_none recorded_"].join(`
`)}function D(t,e,{now:n=Date.now()}={}){return`${[de(t,{now:n}),ue(e,{now:n}),fe(e)].join(`

`)}
`}function R(t){var n,r;const e=[`## Task: ${t.title}`,`id: ${t.id}`];if(t.due&&e.push(`due: ${t.due}`),t.estimate&&e.push(`current estimate: ${t.estimate}`),(n=t.people)!=null&&n.length&&e.push(`people: ${t.people.join(", ")}`),t.notes&&e.push("",t.notes.trim()),(r=t.subtasks)!=null&&r.length){e.push("","Existing subtasks:");for(const i of t.subtasks)e.push(`- [${i.done?"x":" "}] ${i.text}`)}else e.push("","Existing subtasks: none");return`${e.join(`
`)}
`}const Ze=[{id:"goal",label:"Goal & context",hint:"The project title, its goal and your notes"},{id:"tasks",label:"Tasks in this project",hint:"Every task, done ones included, with dependencies"},{id:"detail",label:"Task notes & subtasks",hint:"The full text behind each task"},{id:"task",label:"Selected task in full",hint:"The task open in the sidebar",needs:"task"},{id:"projects",label:"Other projects",hint:"Titles and goals of everything else on the board"},{id:"people",label:"People",hint:"Who is on the project and what they are holding"}];function tn(t){const e=String(t??"").trim();return e?e.split(/\s+/).length:0}function Ve(t){var r,i,o,s;const e=["## Task detail"];let n=0;for(const a of[...t].sort(B))if(!(!((r=a.notes)!=null&&r.trim())&&!((i=a.subtasks)!=null&&i.length))&&(n+=1,e.push("",`### ${a.title}`,`id: ${a.id}`),(o=a.notes)!=null&&o.trim()&&e.push("",a.notes.trim()),(s=a.subtasks)!=null&&s.length)){e.push("","Subtasks:");for(const c of a.subtasks)e.push(`- [${c.done?"x":" "}] ${c.text}`)}return n?e.join(`
`):""}function et(t,e,n){var o;const r=je(e??[],!1).filter(s=>s.id!==(t==null?void 0:t.id));if(!r.length)return"";const i=["## Other projects",""];for(const s of r){const a=se(n??[],{projectId:s.id}).length,c=[s.start,s.end].filter(Boolean).join(" → "),d=[`**${s.title}**`,(o=s.goal)==null?void 0:o.trim(),c,`${a} tasks`];i.push(`- ${d.filter(Boolean).join(" — ")}`)}return i.join(`
`)}function tt(t,e){const n=Fe(t,e??[]);if(!n.length)return"";const r=["## People",""];for(const i of n){const o=(e??[]).filter(c=>!c.done&&(c.people??[]).includes(i.name)),s=Te(o),a=s?`, ${s}h estimated`:"";r.push(`- ${i.name} — ${o.length} open task${o.length===1?"":"s"}${a}`)}return r.join(`
`)}function nt({project:t,tasks:e=[],task:n=null,projects:r=[],allTasks:i=[],now:o=Date.now()}={}){return{goal:de(t,{now:o}),tasks:`${ue(e,{now:o})}

${fe(e)}`,detail:Ve(e),task:n?R(n).trimEnd():"",projects:et(t,r,i),people:tt(t,e)}}function nn(t,e={}){const n=new Set(t??[]),r=nt(e),i=Ze.filter(o=>n.has(o.id)).map(o=>r[o.id]).filter(o=>o&&o.trim());return i.length?`${i.join(`

`)}
`:""}const N=`You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`,ot=`You are a project planning advisor helping someone think about their own project.
Answer in concise markdown prose. Lead with the answer, then the reasoning.
Ground every claim in the brief you were given, and refer to tasks by their exact id in backticks.
If the brief does not contain what you would need, say so plainly instead of inventing it.
You are being asked to think, not to fill in a form: no preamble, no restating the question.`;function on(t,e){const n=[{role:"system",content:ot}];return e.forEach((r,i)=>{const o=i===0&&r.role==="user"&&t;n.push({role:r.role,content:o?`${t}
---
${r.content}`:r.content})}),n}function F(t){const e=String(t??"").trim(),n=[],r=/```(?:json)?\s*\n?([\s\S]*?)```/gi;for(let s=r.exec(e);s;s=r.exec(e))n.push(s[1]);const i=e.search(/[[{]/);if(i!==-1){const s=Math.max(e.lastIndexOf("]"),e.lastIndexOf("}"));s>i&&n.push(e.slice(i,s+1))}n.push(e);for(const s of n)try{return JSON.parse(s.trim())}catch{}const o=new Error("Could not read JSON from the model response.");throw o.raw=e,o}function he(t,e){if(Array.isArray(t))return t;if(t&&Array.isArray(t[e]))return t[e];if(t&&typeof t=="object"){const n=Object.values(t).find(Array.isArray);if(n)return n}return[]}const m=t=>typeof t=="string"?t.trim():"",rt={id:"subtasks",title:"Suggest subtasks",messages(t,e,n){return[{role:"system",content:N},{role:"user",content:`${D(t,e)}
${R(n)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`}]},parse(t){return he(F(t),"subtasks").map(e=>typeof e=="string"?e:m((e==null?void 0:e.text)??(e==null?void 0:e.title))).map(e=>e.replace(/^[-*]\s*(\[[ xX]\]\s*)?/,"").trim()).filter(Boolean).map(e=>({kind:"subtask",label:e}))}},st={id:"missing",title:"Find missing tasks",messages(t,e){return[{role:"system",content:N},{role:"user",content:`${D(t,e)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`}]},parse(t){return he(F(t),"tasks").map(e=>{if(typeof e=="string")return{kind:"task",label:e,task:{title:e}};const n=m((e==null?void 0:e.title)??(e==null?void 0:e.name));if(!n)return null;const r=/^\d{4}-\d{2}-\d{2}$/.test(m(e==null?void 0:e.due))?m(e.due):"",i=(Array.isArray(e==null?void 0:e.blocked_by)?e.blocked_by:[]).map(m).filter(Boolean);return{kind:"task",label:n,detail:m((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),task:{title:n,due:r,estimate:m(e==null?void 0:e.estimate),blockedBy:i}}}).filter(Boolean)}},it={id:"estimate",title:"Estimate duration",messages(t,e,n){return[{role:"system",content:N},{role:"user",content:`${D(t,e)}
${R(n)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`}]},parse(t){const e=F(t),n=m(typeof e=="string"?e:(e==null?void 0:e.estimate)??(e==null?void 0:e.duration)),r=/(\d+(?:\.\d+)?)\s*([hdw])/i.exec(n);if(!r){const o=new Error(`Model returned an unusable estimate: "${n||"(empty)"}"`);throw o.raw=JSON.stringify(e),o}const i=`${Number(r[1])}${r[2].toLowerCase()}`;return[{kind:"estimate",label:i,detail:m((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),estimate:i}]}},rn={subtasks:rt,missing:st,estimate:it},I="https://openrouter.ai/api/v1",A="tasks.openrouter.key",pe="tasks.openrouter.model",T="google/gemini-2.0-flash-001",at=()=>localStorage.getItem(A)||"",sn=t=>t?localStorage.setItem(A,t):localStorage.removeItem(A),ct=()=>localStorage.getItem(pe)||T,an=t=>localStorage.setItem(pe,t||T);function lt(t){var n;const e=Number((n=t==null?void 0:t.pricing)==null?void 0:n.prompt);return Number.isFinite(e)?e*1e6:null}function cn(t){return t==null?"":t===0?"free":t<1?`$${t.toFixed(3)}/M`:`$${t.toFixed(2)}/M`}async function ln(){const t=await fetch(`${I}/models`);if(!t.ok)throw new Error(`OpenRouter models request failed (${t.status})`);const e=await t.json();return((e==null?void 0:e.data)??[]).filter(n=>{var r;return(n==null?void 0:n.id)&&(((r=n.architecture)==null?void 0:r.output_modalities)??["text"]).includes("text")}).map(n=>({id:n.id,name:n.name||n.id,price:lt(n),context:n.context_length??null})).filter(n=>n.price!=null).sort((n,r)=>n.price-r.price||n.id.localeCompare(r.id))}const ge=t=>({Authorization:`Bearer ${t}`,"Content-Type":"application/json","HTTP-Referer":location.origin,"X-Title":"Tasks"});async function we(t){var e;try{const n=await t.json();return((e=n==null?void 0:n.error)==null?void 0:e.message)||`HTTP ${t.status}`}catch{return`HTTP ${t.status}`}}async function dt(t,{key:e,model:n,signal:r,maxTokens:i=900,temperature:o=.4}={}){var d,l,p;if(!e)throw new Error("No OpenRouter API key set. Add one under Settings.");const s=await fetch(`${I}/chat/completions`,{method:"POST",signal:r,headers:ge(e),body:JSON.stringify({model:n||T,messages:t,temperature:o,max_tokens:i})});if(!s.ok)throw new Error(`OpenRouter: ${await we(s)}`);const a=await s.json();if(a!=null&&a.error)throw new Error(`OpenRouter: ${a.error.message??"unknown error"}`);const c=(p=(l=(d=a==null?void 0:a.choices)==null?void 0:d[0])==null?void 0:l.message)==null?void 0:p.content;if(!c)throw new Error("OpenRouter returned an empty response.");return c}function ut(t){let e="",n=!1;const r=i=>{var d,l,p;const o=i.trim();if(!o||o.startsWith(":")||!o.startsWith("data:"))return;const s=o.slice(5).trim();if(s==="[DONE]"){n=!0;return}let a;try{a=JSON.parse(s)}catch{return}if(a!=null&&a.error)throw new Error(`OpenRouter: ${a.error.message??"unknown error"}`);const c=(p=(l=(d=a==null?void 0:a.choices)==null?void 0:d[0])==null?void 0:l.delta)==null?void 0:p.content;c&&(t==null||t(c))};return{push(i){e+=i;const o=e.split(`
`);e=o.pop()??"";for(const s of o)r(s)},end(){e&&(r(e),e="")},get finished(){return n}}}async function dn(t,{key:e,model:n,signal:r,maxTokens:i=2e3,temperature:o=.7,onDelta:s}={}){if(!e)throw new Error("No OpenRouter API key set. Add one under Settings.");const a=await fetch(`${I}/chat/completions`,{method:"POST",signal:r,headers:ge(e),body:JSON.stringify({model:n||T,messages:t,temperature:o,max_tokens:i,stream:!0})});if(!a.ok)throw new Error(`OpenRouter: ${await we(a)}`);if(!a.body)throw new Error("OpenRouter returned no response body.");let c="";const d=ut(h=>{c+=h,s==null||s(h,c)}),l=a.body.getReader(),p=new TextDecoder;try{for(;;){const{value:h,done:g}=await l.read();if(g||(d.push(p.decode(h,{stream:!0})),d.finished))break}d.end()}catch(h){if((h==null?void 0:h.name)==="AbortError")return c;throw h}finally{l.cancel().catch(()=>{})}if(!c)throw new Error("OpenRouter returned an empty response.");return c}async function un(t,{project:e,tasks:n,task:r,signal:i}={}){const o=await dt(t.messages(e,n,r),{key:at(),model:ct(),signal:i});try{return{suggestions:t.parse(o),raw:o}}catch(s){throw s.raw=s.raw??o,s}}export{zt as $,pt as A,Pt as B,Ze as C,Fe as D,sn as E,an as F,Vt as G,Lt as H,Ut as I,b as J,se as K,Qt as L,Ne as M,Ft as N,Dt as O,X as P,Rt as Q,rn as R,un as S,ln as T,cn as U,It as V,en as W,D as X,De as Y,qt as Z,Bt as _,ct as a,Xt as a0,re as a1,Re as a2,Zt as a3,je as a4,Jt as a5,Te as a6,Nt as a7,Ht as a8,Kt as a9,Wt as aa,Yt as ab,j as ac,M as ad,Q as ae,V as af,ee as ag,te as ah,Se as ai,_e as aj,$e as ak,ve as al,R as am,Ie as an,ne as ao,oe as ap,Ae as aq,F as ar,He as as,G as at,ut as au,ot as av,on as b,nt as c,tn as d,nn as e,Ct as f,at as g,Mt as h,Gt as i,jt as j,At as k,Et as l,Tt as m,vt as n,Ot as o,$t as p,xt as q,_t as r,dn as s,St as t,kt as u,yt as v,bt as w,mt as x,wt as y,gt as z};
