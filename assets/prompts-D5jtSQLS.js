const Ge=`---
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
`,qe=`---
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
`,Je=`---
id: analytics-dashboard
title: Analytics dashboard
project: [website]
people: [Oliver]
estimate: 1w
created: 2026-08-09
done: false
---
Wanted, not scheduled. Sits in the unscheduled tray until it earns a deadline.
`,He=`---
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
`,ze=`---
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
`,Ke=`---
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
`,Qe=`---
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
`,Ze=`---
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
`,Ve=`---
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
`,Xe=`---
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
`,en=`---
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
`,nn=`---
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
`,tn=`---
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
`,on=`---
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
`,rn=`---
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
`,sn=`---
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
`,an=`---
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
`,cn=`---
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
`,ln=`---
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
`,dn=`---
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
`,F=["id","title","goal","starred","archived","project","people","due","estimate","created","done","working","blocked-by","part-of","x"],Y=new Set(["project","people","blocked-by","part-of"]),se=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;function G(n){const e=n.trim();return e.length>=2&&(e[0]==='"'||e[0]==="'")&&e[e.length-1]===e[0]?e.slice(1,-1):e}function j(n){const e=n.trim();return e===""?"":e==="true"?!0:e==="false"?!1:e==="null"||e==="~"?null:G(e)}function ie(n){const e=n.trim().slice(1,-1).trim();if(e==="")return[];const t=[];let r="",i=null;for(const o of e)i?(o===i&&(i=null),r+=o):o==='"'||o==="'"?(i=o,r+=o):o===","?(t.push(r),r=""):r+=o;return t.push(r),t.map(o=>G(o)).filter(o=>o!=="")}function A(n){const e=String(n).replace(/\r\n/g,`
`);if(!e.startsWith(`---
`))return{data:{},body:e.replace(/^\n+/,"")};const t=e.indexOf(`
---`,3);if(t===-1)return{data:{},body:e};const r=e.slice(4,t+1),i=e.indexOf(`
`,t+1),o=i===-1?"":e.slice(i+1),s={},a=r.split(`
`);let l=null;for(const c of a){if(c.trim()===""||c.trimStart().startsWith("#"))continue;const d=/^\s*-\s+(.*)$/.exec(c);if(d&&l){s[l].push(j(d[1]));continue}const h=/^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(c);if(!h)continue;const[,p,g]=h;l=null,g.trim()===""?(s[p]=[],l=p):g.trim().startsWith("[")&&g.trim().endsWith("]")?s[p]=ie(g):s[p]=j(g)}for(const[c,d]of Object.entries(s))Array.isArray(d)&&d.length===0&&!Y.has(c)&&(s[c]="");return{data:s,body:o}}function ae(n){const e=String(n);return e===""||/^[#&*!|>%@`?-]/.test(e)||/[:,[\]{}]/.test(e)||e!==e.trim()||["true","false","null","~"].includes(e)}function L(n){return typeof n=="boolean"||typeof n=="number"?String(n):n==null?"":ae(n)?`'${String(n).replace(/'/g,"''")}'`:String(n)}function ce(n,e){return Array.isArray(e)||Y.has(n)?`[${(Array.isArray(e)?e:[e].filter(r=>r!==""&&r!=null)).map(L).join(", ")}]`:L(e)}function M(n,e=""){const r=[...F.filter(o=>o in n),...Object.keys(n).filter(o=>!F.includes(o))].map(o=>`${o}: ${ce(o,n[o])}`),i=String(e).replace(/\s+$/,"");return`---
${r.join(`
`)}
---
${i?`${i}
`:""}`}function le(n){const e=[],t=[];for(const r of String(n).split(`
`)){const i=se.exec(r);i?e.push({done:i[1].toLowerCase()==="x",text:i[2].trim()}):t.push(r)}return{notes:t.join(`
`).trim(),subtasks:e}}function de(n,e=[]){const t=e.map(i=>`- [${i.done?"x":" "}] ${i.text}`).join(`
`),r=String(n||"").trim();return r?t?`${r}

${t}`:r:t}const y="_project-",k=864e5,ue={æ:"ae",ø:"o",å:"a",ß:"ss",ð:"d",þ:"th",ł:"l",đ:"d"};function fe(n){return String(n).toLowerCase().replace(/[æøåßðþłđ]/g,t=>ue[t]).normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"task"}function un(n,e){const t=fe(n),r=e instanceof Set?e:new Set(e);if(!r.has(t))return t;for(let i=2;;i+=1){const o=`${t}-${i}`;if(!r.has(o))return o}}function m(n){if(n==null||n==="")return null;const e=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(n).trim());if(!e)return null;const t=Date.UTC(Number(e[1]),Number(e[2])-1,Number(e[3]));return Number.isNaN(t)?null:t}function q(n){return n==null?"":new Date(n).toISOString().slice(0,10)}const pe={h:1,d:8,w:40};function he(n){if(n==null||n==="")return null;const e=String(n).trim().toLowerCase(),t=/^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(e);return t?Number(t[1])*pe[t[2]]:null}function fn(n){return n.reduce((e,t)=>e+(he(t.estimate)??0),0)}function x(n){return n==null||n===""?[]:(Array.isArray(n)?n:[n]).map(e=>String(e).trim()).filter(Boolean)}function ge(n){if(n==null||n==="")return null;const e=Number(n);return Number.isFinite(e)?e:null}function J(n,e){const{data:t,body:r}=A(e),{notes:i,subtasks:o}=le(r),s=String(n).replace(/\.md$/i,"");return{id:String(t.id||s),title:String(t.title||s),project:x(t.project),people:x(t.people),due:t.due?String(t.due):"",estimate:t.estimate?String(t.estimate):"",created:t.created?String(t.created):"",done:t.done===!0,goal:t.goal===!0,working:t.working===!0,x:ge(t.x),blockedBy:x(t["blocked-by"]),partOf:x(t["part-of"]),notes:i,subtasks:o,extra:Object.fromEntries(Object.entries(t).filter(([a])=>!["id","title","project","people","due","estimate","created","done","goal","working","x","blocked-by","part-of"].includes(a)))}}function H(n,e=[]){return Object.fromEntries(Object.entries(n).filter(([t,r])=>e.includes(t)?!0:Array.isArray(r)?r.length>0:r!==""&&r!=null))}function z(n){const e=H({id:n.id,title:n.title,project:n.project??[],people:n.people??[],due:n.due??"",estimate:n.estimate??"",created:n.created??"",done:!!n.done,...n.goal?{goal:!0}:{},...n.working?{working:!0}:{},"blocked-by":n.blockedBy??[],"part-of":n.partOf??[],x:n.x??"",...n.extra??{}},["id","title","done"]);return M(e,de(n.notes,n.subtasks))}function K(n,e){const{data:t,body:r}=A(e),i=String(n),o=i.lastIndexOf("/"),s=i.slice(o+1).replace(/\.md$/i,"").replace(new RegExp(`^${y}`),"");return{id:String(t.id||s),title:String(t.title||s),goal:t.goal?String(t.goal):"",people:x(t.people),start:t.start?String(t.start):"",end:t.end?String(t.end):"",starred:t.starred===!0,archived:t.archived===!0,color:t.color?String(t.color):"",folder:o===-1?"":i.slice(0,o),context:String(r).trim()}}function Q(n){return M(H({id:n.id,title:n.title,goal:n.goal??"",...n.starred?{starred:!0}:{},...n.archived?{archived:!0}:{},people:n.people??[],start:n.start??"",end:n.end??"",color:n.color??""},["id","title"]),n.context??"")}const E="_trash.md",be=50;function Z(n){const{body:e}=A(n),t=/```json\s*\n([\s\S]*?)```/.exec(String(e));if(!t)return[];try{const r=JSON.parse(t[1]);return Array.isArray(r)?r:[]}catch{return[]}}function V(n){const e=["```json",JSON.stringify(n??[],null,2),"```"].join(`
`);return M({id:"_trash"},e)}function pn(n){return[...n??[]].sort((e,t)=>+!!t.starred-+!!e.starred||e.id.localeCompare(t.id))}function hn(n,e=!1){return e?[...n??[]]:(n??[]).filter(t=>!t.archived)}function gn(n,e,{deleteTasks:t=!1}={}){const r=(n.projects??[]).find(d=>d.id===e);if(!r)return null;const i=d=>d.project??[],o=d=>i(d).filter(h=>h!==e),s=d=>i(d).includes(e),a=d=>s(d)&&o(d).length===0,l=t?n.tasks.filter(d=>!d.goal&&a(d)):[],c=new Set([...l.map(d=>d.id),...n.tasks.filter(d=>d.goal&&s(d)).map(d=>d.id)]);return{project:r,removed:l,untagged:n.tasks.filter(d=>!d.goal&&s(d)&&!c.has(d.id)).map(d=>d.id),projects:(n.projects??[]).filter(d=>d.id!==e),tasks:n.tasks.filter(d=>!c.has(d.id)).map(d=>s(d)?{...d,project:o(d)}:d)}}function bn(n,e){return[e,...n??[]].slice(0,be)}const we=n=>`${n.id}.md`,me=n=>`${y}${n.id}.md`,R=(n,e)=>n?`${n}/${e}`:e;function ye(n,e){var t;return e.get((t=n.project)==null?void 0:t[0])??""}function wn(n){const e=new Set,t=new Set;for(const r of Object.keys(n)){const i=r.slice(r.lastIndexOf("/")+1);if(!/\.md$/i.test(i)||!i.startsWith(y))continue;const o=i.replace(/\.md$/i,"").replace(new RegExp(`^${y}`),"");e.has(o)&&t.add(o),e.add(o)}return[...t]}function mn(n){const e=[],t=[];let r=[];const i=new Set;for(const[o,s]of Object.entries(n)){if(!/\.md$/i.test(o))continue;const a=o.slice(o.lastIndexOf("/")+1);if(a===E)r=Z(s);else if(a.startsWith(y)){const l=K(o,s);if(i.has(l.id))continue;i.add(l.id),t.push(l)}else e.push(J(a,s))}return e.sort((o,s)=>o.id.localeCompare(s.id)),t.sort((o,s)=>o.id.localeCompare(s.id)),{tasks:e,projects:t,trash:r}}function yn({tasks:n,projects:e,trash:t}){const r={},i=new Map((e??[]).map(o=>[o.id,o.folder??""]));for(const o of e)r[R(o.folder,me(o))]=Q(o);for(const o of n)r[R(ye(o,i),we(o))]=z(o);return t!=null&&t.length&&(r[E]=V(t)),r}function I(n,e){const t=String(n).slice(String(n).lastIndexOf("/")+1);return t===E?V(Z(e)):t.startsWith(y)?Q(K(n,e)):z(J(t,e))}function kn(n,e,t){if(e===t)return!0;try{return I(n,e)===I(n,t)}catch{return!1}}const ke=n=>`${n}-goal`;function Sn({tasks:n,projects:e},t=Date.now()){const r=new Map(e.filter(s=>{var a;return(a=s.goal)==null?void 0:a.trim()}).map(s=>[ke(s.id),s])),i=[];let o=[];for(const s of n){if(!s.goal){o.push(s);continue}const a=r.get(s.id);if(!a){i.push(s);continue}r.delete(s.id);const l=a.goal.trim(),c=a.end??"";o.push(s.title===l&&s.due===c?s:{...s,title:l,due:c})}for(const[s,a]of r)o.push({id:s,title:a.goal.trim(),project:[a.id],people:[],due:a.end??"",estimate:"",created:q(t),done:!1,goal:!0,working:!1,x:null,blockedBy:[],partOf:[],notes:"",subtasks:[],extra:{}});return o.sort((s,a)=>s.id.localeCompare(a.id)),{tasks:o,removed:i}}function _n(n,e,t){const r=n.find(l=>l.id===e),i=n.find(l=>l.id===t);if(!r||!i||e===t||r.goal||i.goal)return null;const o=[{done:!!r.done,text:r.title},...r.subtasks??[]],s=(l,c)=>[...new Set((l??[]).map(d=>d===e?t:d))].filter(d=>d!==c);return{tasks:n.filter(l=>l.id!==e).map(l=>{const c=l.id===t?{...l,subtasks:[...l.subtasks??[],...o]}:l;return{...c,blockedBy:s(c.blockedBy,c.id),partOf:s(c.partOf,c.id)}}),merged:r}}function xn(n){const e=String(n??"").split(/[\s._-]+/).map(t=>t.replace(/[^\p{L}\p{N}]/gu,"")).filter(Boolean);return e.length?e.slice(0,2).map(t=>t[0].toUpperCase()).join(""):"?"}function vn(n,e){return n.map(t=>{const r=e!=null&&t.id===e;return!!t.working===r?t:{...t,working:r}})}function On(n,e,t){const r=new Set([e]);for(let i=!0;i;){i=!1;for(const o of n)r.has(o.id)||(o[t]??[]).some(s=>r.has(s))&&(r.add(o.id),i=!0)}return r}const S={day:{unit:"day",label:"Days",level(n,e){return(n-e)/k},dateForLevel(n,e){return e+n*k},format(n){return new Date(n).toISOString().slice(5,10).replace("-","/")}},week:{unit:"week",label:"Weeks",level(n,e){return(n-e)/(7*k)},dateForLevel(n,e){return e+n*7*k},format(n){return`${new Date(n).toISOString().slice(5,10).replace("-","/")}`}},month:{unit:"month",label:"Months",level(n,e){const t=new Date(e),r=new Date(n),i=(r.getUTCFullYear()-t.getUTCFullYear())*12+(r.getUTCMonth()-t.getUTCMonth()),o=Date.UTC(r.getUTCFullYear(),r.getUTCMonth(),1),s=Date.UTC(r.getUTCFullYear(),r.getUTCMonth()+1,1);return i+(n-o)/(s-o)},dateForLevel(n,e){const t=new Date(e);return Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+Math.round(n),1)},format(n){const e=new Date(n);return`${e.toLocaleString("en",{month:"short",timeZone:"UTC"})} ${e.getUTCFullYear()}`}}};function $n(n,e){if(n==null||e==null||e<=n)return S.week;const t=(e-n)/k;return t<=31?S.day:t<=240?S.week:S.month}function Tn(n){return S[n]??S.week}function An(n,e){const t=e.map(c=>m(c.due)).filter(c=>c!=null),r=m(n==null?void 0:n.start),i=m(n==null?void 0:n.end),o=[r,...t].filter(c=>c!=null),s=[i,...t].filter(c=>c!=null),a=o.length?Math.min(...o):Date.now(),l=s.length?Math.max(...s):a+30*k;return{start:a,end:Math.max(l,a)}}function Mn(n,{bucket:e,start:t,collapse:r=!1}){const i=new Map;for(const u of n){const f=m(u.due);f!=null&&i.set(u.id,Math.floor(e.level(f,t)))}const o=[...i.values()],s=o.length?Math.min(...o):0,a=o.length?Math.max(...o):0,l=[...new Set(o)].sort((u,f)=>u-f),c=r?new Map(l.map((u,f)=>[u,f])):new Map(l.map(u=>[u,u-s])),d=r?Math.max(0,l.length-1):a-s,h=d+2,p=new Map;for(const u of n)p.set(u.id,i.has(u.id)?c.get(i.get(u.id)):h);const g=r?new Map([...c].map(([u,f])=>[f,u-s])):new Map(Array.from({length:d+1},(u,f)=>[f,f])),O=[];return r&&l.forEach((u,f)=>{const b=l[f-1];f>0&&u-b>1&&O.push({afterLevel:f-1,periods:u-b-1})}),{levels:p,trayLevel:h,minLevel:s,lastLevel:d,levelOrigin:g,gaps:O}}function Se(n,e,t=Date.now()){var a,l;const r=((a=n.subtasks)==null?void 0:a.length)??0,i=((l=n.subtasks)==null?void 0:l.filter(c=>c.done).length)??0,o=m(n.due),s=(n.blockedBy??[]).filter(c=>e.has(c)&&!e.get(c).done);return{done:!!n.done,working:!!n.working,total:r,checked:i,ratio:n.done?1:r===0?0:i/r,started:!n.done&&i>0,blocked:!n.done&&s.length>0,blockers:s,overdue:!n.done&&o!=null&&o<t}}const _e=n=>new Map(n.map(e=>[e.id,e]));function xe(n){return[...new Set(n.flatMap(e=>e.people??[]))].sort((e,t)=>e.localeCompare(t))}function En(n){return[...new Set(n.flatMap(e=>e.project??[]))].sort((e,t)=>e.localeCompare(t))}function Cn(n,e){const t=ve(e,{projectId:(n==null?void 0:n.id)??null}),r=(n==null?void 0:n.people)??[],i=[...new Set([...r,...xe(t)])],o=new Set(r);return i.map(s=>({name:s,inRoster:o.has(s),openTasks:t.filter(a=>!a.done&&(a.people??[]).includes(s)).length})).sort((s,a)=>Number(a.inRoster)-Number(s.inRoster)||s.name.localeCompare(a.name))}function ve(n,{projectId:e=null,people:t=[],hideDone:r=!1}={}){const i=new Set(t);return n.filter(o=>!(e&&!(o.project??[]).includes(e)||i.size>0&&!(o.people??[]).some(s=>i.has(s))||r&&o.done))}function Oe(n){const e=new Set(n.map(o=>o.id)),t=new Map;for(const o of n)if(o.goal)for(const s of o.project??[])t.set(s,o.id);if(!t.size)return[];const r=new Set;for(const o of n){for(const s of o.blockedBy??[])e.has(s)&&r.add(s);for(const s of o.partOf??[])e.has(s)&&r.add(o.id)}const i=[];for(const o of n){if(o.goal||r.has(o.id))continue;const s=(o.project??[]).map(a=>t.get(a)).find(Boolean);s&&s!==o.id&&i.push({from:o.id,to:s})}return i}function Dn(n,e){const t=new Set(n.map(s=>s.id)),r=new Set(n.filter(s=>s.due).map(s=>s.id)),i=(s,a)=>r.has(s)&&r.has(a)&&((e==null?void 0:e.get(s))??0)>((e==null?void 0:e.get(a))??0),o=[];for(const{from:s,to:a}of Oe(n))o.push({id:`goal:${s}->${a}`,from:s,to:a,kind:"goal",conflict:i(s,a)});for(const s of n){for(const a of s.blockedBy??[]){if(!t.has(a))continue;const l=i(a,s.id);o.push({id:`blocks:${a}->${s.id}`,from:a,to:s.id,kind:"blocks",conflict:l})}for(const a of s.partOf??[])t.has(a)&&o.push({id:`part-of:${s.id}->${a}`,from:s.id,to:a,kind:"part-of",conflict:!1})}return o}const X="tasks.files",$e="tasks-storage",v="handles",ee="directory",T=typeof globalThis.showDirectoryPicker=="function";function ne(){return new Promise((n,e)=>{const t=indexedDB.open($e,1);t.onupgradeneeded=()=>t.result.createObjectStore(v),t.onsuccess=()=>n(t.result),t.onerror=()=>e(t.error)})}async function P(n){const e=await ne();await new Promise((t,r)=>{const i=e.transaction(v,"readwrite");i.objectStore(v).put(n,ee),i.oncomplete=t,i.onerror=()=>r(i.error)}),e.close()}async function U(){const n=await ne(),e=await new Promise((t,r)=>{const o=n.transaction(v,"readonly").objectStore(v).get(ee);o.onsuccess=()=>t(o.result),o.onerror=()=>r(o.error)});return n.close(),e}function Te(){try{const n=localStorage.getItem(X),e=n?JSON.parse(n):null;return e&&typeof e=="object"?e:null}catch{return null}}function W(n){try{localStorage.setItem(X,JSON.stringify(n))}catch{}}const te=n=>n.toLowerCase().endsWith(".md");async function Ae(n){const e=[];for await(const[t,r]of n.entries())r.kind==="file"&&te(t)&&e.push([t,r]);return e}async function Me(n){const e={},t=[];for await(const[r,i]of n.entries())i.kind==="directory"?t.push([r,i]):i.kind==="file"&&te(r)&&(e[r]=await(await i.getFile()).text());for(const[r,i]of t){const o=await Ae(i);if(o.some(([s])=>s.startsWith(y)))for(const[s,a]of o)e[`${r}/${s}`]=await(await a.getFile()).text()}return e}function Bn({sameFile:n=(e,t,r)=>t===r}={}){let e=null,t=!1;async function r(u,f){let b=e;for(const $ of u.split("/").slice(0,-1))b=await b.getDirectoryHandle($,{create:f});return b}const i=u=>u.slice(u.lastIndexOf("/")+1);let o=new Set,s=new Map;const a={get mode(){return e?"folder":"local"},get folderName(){return(e==null?void 0:e.name)??""},supportsFolder:T,reconnectable:!1,get writable(){return!e||t}};async function l(){if(!T)return!1;let u;try{u=await U()}catch{return!1}if(!u)return!1;try{if(await u.queryPermission({mode:"readwrite"})==="granted")return e=u,!0;a.reconnectable=!0}catch{}return!1}async function c(){if(e||await l(),e){const u=await Me(e);return o=new Set(Object.keys(u)),s=new Map(Object.entries(u)),W(u),u}return Te()??{}}async function d(u){if(e&&!t)return{skipped:"read-only"};if(W(u),!e)return{};for(const[f,b]of Object.entries(u)){const $=s.get(f);if($!==void 0&&n(f,$,b))continue;const N=await(await(await r(f,!0)).getFileHandle(i(f),{create:!0})).createWritable();await N.write(b),await N.close(),s.set(f,b)}for(const f of o)if(!(f in u)){try{await(await r(f,!1)).removeEntry(i(f))}catch{}s.delete(f)}return o=new Set(Object.keys(u)),{}}async function h(){if(!e)return null;const u=await c();return t=!0,u}function p(){t=!1}async function g(){if(!T)throw new Error("This browser cannot open folders.");const u=a.reconnectable&&await U()||await globalThis.showDirectoryPicker({mode:"readwrite"});if(await u.requestPermission({mode:"readwrite"})!=="granted")throw new Error("Permission to use that folder was declined.");return e=u,t=!1,a.reconnectable=!1,await P(u).catch(()=>{}),c()}function O(){e=null,t=!1,s=new Map,a.reconnectable=!1,P(null).catch(()=>{})}return{state:a,load:c,save:d,unlock:h,lock:p,connectFolder:g,disconnectFolder:O,tryRestoreFolder:l}}const Ee=67324752,Ce=33639248,De=101010256,Be=(()=>{const n=new Uint32Array(256);for(let e=0;e<256;e+=1){let t=e;for(let r=0;r<8;r+=1)t=t&1?3988292384^t>>>1:t>>>1;n[e]=t>>>0}return n})();function Ne(n){let e=4294967295;for(let t=0;t<n.length;t+=1)e=Be[(e^n[t])&255]^e>>>8;return(e^4294967295)>>>0}function Fe(n){const e=Math.max(1980,n.getFullYear());return{time:n.getHours()<<11|n.getMinutes()<<5|Math.floor(n.getSeconds()/2),date:e-1980<<9|n.getMonth()+1<<5|n.getDate()}}class je{constructor(){this.chunks=[],this.length=0}bytes(e){this.chunks.push(e),this.length+=e.length}u16(e){this.bytes(new Uint8Array([e&255,e>>>8&255]))}u32(e){this.bytes(new Uint8Array([e&255,e>>>8&255,e>>>16&255,e>>>24&255]))}concat(){const e=new Uint8Array(this.length);let t=0;for(const r of this.chunks)e.set(r,t),t+=r.length;return e}}function Nn(n,e=new Date){const t=new TextEncoder,{time:r,date:i}=Fe(e),o=new je,s=[];for(const[c,d]of Object.entries(n)){const h=t.encode(c),p=t.encode(d),g=Ne(p);s.push({nameBytes:h,size:p.length,crc:g,offset:o.length}),o.u32(Ee),o.u16(20),o.u16(2048),o.u16(0),o.u16(r),o.u16(i),o.u32(g),o.u32(p.length),o.u32(p.length),o.u16(h.length),o.u16(0),o.bytes(h),o.bytes(p)}const a=o.length;for(const c of s)o.u32(Ce),o.u16(20),o.u16(20),o.u16(2048),o.u16(0),o.u16(r),o.u16(i),o.u32(c.crc),o.u32(c.size),o.u32(c.size),o.u16(c.nameBytes.length),o.u16(0),o.u16(0),o.u16(0),o.u16(0),o.u32(0),o.u32(c.offset),o.bytes(c.nameBytes);const l=o.length-a;return o.u32(De),o.u16(0),o.u16(0),o.u16(s.length),o.u16(s.length),o.u32(l),o.u32(a),o.u16(0),o.concat()}const _=n=>String(n??"").replace(/\|/g,"\\|").replace(/\n+/g," ").trim(),Le=n=>(n.people??[]).join(", ");function Re(n){return n.done?"done":n.total===0?"—":`${n.checked}/${n.total}`}function C(n,e,{now:t=Date.now()}={}){const r=_e(e),i=[];i.push(`# ${(n==null?void 0:n.title)||"Untitled project"}`),n!=null&&n.goal&&i.push("","## Goal",n.goal.trim()),n!=null&&n.context&&i.push("","## Context",n.context.trim());const o=[n==null?void 0:n.start,n==null?void 0:n.end].filter(Boolean);i.push(""),o.length===2&&i.push(`Window: ${n.start} → ${n.end}`),i.push(`Today: ${q(t)}`),i.push("","## Tasks","","| id | task | due | estimate | people | subtasks |"),i.push("|----|------|-----|----------|--------|----------|");const s=[...e].sort((l,c)=>(m(l.due)??1/0)-(m(c.due)??1/0));for(const l of s){const c=Se(l,r,t);i.push(`| ${_(l.id)} | ${_(l.title)} | ${_(l.due)||"—"} | ${_(l.estimate)||"—"} | ${_(Le(l))||"—"} | ${Re(c)} |`)}s.length===0&&i.push("| — | _no tasks yet_ | — | — | — | — |");const a=[];for(const l of s){for(const c of l.blockedBy??[])r.has(c)&&a.push(`- ${l.id} blocked-by ${c}`);for(const c of l.partOf??[])r.has(c)&&a.push(`- ${l.id} part-of ${c}`)}return i.push("","## Dependencies",""),i.push(a.length?a.join(`
`):"_none recorded_"),`${i.join(`
`)}
`}function oe(n){var t,r;const e=[`## Task: ${n.title}`,`id: ${n.id}`];if(n.due&&e.push(`due: ${n.due}`),n.estimate&&e.push(`current estimate: ${n.estimate}`),(t=n.people)!=null&&t.length&&e.push(`people: ${n.people.join(", ")}`),n.notes&&e.push("",n.notes.trim()),(r=n.subtasks)!=null&&r.length){e.push("","Existing subtasks:");for(const i of n.subtasks)e.push(`- [${i.done?"x":" "}] ${i.text}`)}else e.push("","Existing subtasks: none");return`${e.join(`
`)}
`}const D=`You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`;function B(n){const e=String(n??"").trim(),t=[],r=/```(?:json)?\s*\n?([\s\S]*?)```/gi;for(let s=r.exec(e);s;s=r.exec(e))t.push(s[1]);const i=e.search(/[[{]/);if(i!==-1){const s=Math.max(e.lastIndexOf("]"),e.lastIndexOf("}"));s>i&&t.push(e.slice(i,s+1))}t.push(e);for(const s of t)try{return JSON.parse(s.trim())}catch{}const o=new Error("Could not read JSON from the model response.");throw o.raw=e,o}function re(n,e){if(Array.isArray(n))return n;if(n&&Array.isArray(n[e]))return n[e];if(n&&typeof n=="object"){const t=Object.values(n).find(Array.isArray);if(t)return t}return[]}const w=n=>typeof n=="string"?n.trim():"",Ie={id:"subtasks",title:"Suggest subtasks",messages(n,e,t){return[{role:"system",content:D},{role:"user",content:`${C(n,e)}
${oe(t)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`}]},parse(n){return re(B(n),"subtasks").map(e=>typeof e=="string"?e:w((e==null?void 0:e.text)??(e==null?void 0:e.title))).map(e=>e.replace(/^[-*]\s*(\[[ xX]\]\s*)?/,"").trim()).filter(Boolean).map(e=>({kind:"subtask",label:e}))}},Pe={id:"missing",title:"Find missing tasks",messages(n,e){return[{role:"system",content:D},{role:"user",content:`${C(n,e)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`}]},parse(n){return re(B(n),"tasks").map(e=>{if(typeof e=="string")return{kind:"task",label:e,task:{title:e}};const t=w((e==null?void 0:e.title)??(e==null?void 0:e.name));if(!t)return null;const r=/^\d{4}-\d{2}-\d{2}$/.test(w(e==null?void 0:e.due))?w(e.due):"",i=(Array.isArray(e==null?void 0:e.blocked_by)?e.blocked_by:[]).map(w).filter(Boolean);return{kind:"task",label:t,detail:w((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),task:{title:t,due:r,estimate:w(e==null?void 0:e.estimate),blockedBy:i}}}).filter(Boolean)}},Ue={id:"estimate",title:"Estimate duration",messages(n,e,t){return[{role:"system",content:D},{role:"user",content:`${C(n,e)}
${oe(t)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`}]},parse(n){const e=B(n),t=w(typeof e=="string"?e:(e==null?void 0:e.estimate)??(e==null?void 0:e.duration)),r=/(\d+(?:\.\d+)?)\s*([hdw])/i.exec(t);if(!r){const o=new Error(`Model returned an unusable estimate: "${t||"(empty)"}"`);throw o.raw=JSON.stringify(e),o}const i=`${Number(r[1])}${r[2].toLowerCase()}`;return[{kind:"estimate",label:i,detail:w((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),estimate:i}]}},Fn={subtasks:Ie,missing:Pe,estimate:Ue};export{A as $,ve as A,En as B,xe as C,bn as D,un as E,q as F,pn as G,Fn as H,wn as I,Nn as J,C as K,ke as L,vn as M,An as N,Mn as O,_e as P,Se as Q,Dn as R,hn as S,On as T,fn as U,gn as V,$n as W,Tn as X,kn as Y,_n as Z,dn as _,ln as a,M as a0,J as a1,z as a2,K as a3,Q as a4,le as a5,de as a6,fe as a7,he as a8,oe as a9,Oe as aa,Z as ab,V as ac,be as ad,B as ae,Ne as af,I as ag,cn as b,an as c,sn as d,rn as e,on as f,tn as g,nn as h,xn as i,en as j,Xe as k,Ve as l,Ze as m,Qe as n,Ke as o,ze as p,He as q,Je as r,qe as s,Ge as t,yn as u,Cn as v,Bn as w,mn as x,Sn as y,m as z};
