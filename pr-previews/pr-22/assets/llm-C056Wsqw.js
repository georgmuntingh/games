const Tt=`---
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
`,Et=`---
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
`,At=`---
id: analytics-dashboard
title: Analytics dashboard
project: [website]
people: [Oliver]
estimate: 1w
created: 2026-08-09
done: false
---
Wanted, not scheduled. Sits in the unscheduled tray until it earns a deadline.
`,Mt=`---
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
`,Ct=`---
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
`,jt=`---
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
`,Nt=`---
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
`,Bt=`---
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
`,Dt=`---
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
`,Rt=`---
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
`,Ft=`---
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
`,It=`---
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
`,Lt=`---
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
`,Pt=`---
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
`,Wt=`---
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
`,Ut=`---
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
`,Yt=`---
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
`,Gt=`---
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
`,qt=`---
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
`,zt=`---
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
`,X=["id","title","goal","starred","archived","project","people","due","estimate","created","done","working","blocked-by","part-of","x"],re=new Set(["project","people","blocked-by","part-of"]),Ce=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;function se(t){const e=t.trim();return e.length>=2&&(e[0]==='"'||e[0]==="'")&&e[e.length-1]===e[0]?e.slice(1,-1):e}function Q(t){const e=t.trim();return e===""?"":e==="true"?!0:e==="false"?!1:e==="null"||e==="~"?null:se(e)}function je(t){const e=t.trim().slice(1,-1).trim();if(e==="")return[];const n=[];let r="",i=null;for(const o of e)i?(o===i&&(i=null),r+=o):o==='"'||o==="'"?(i=o,r+=o):o===","?(n.push(r),r=""):r+=o;return n.push(r),n.map(o=>se(o)).filter(o=>o!=="")}function F(t){const e=String(t).replace(/\r\n/g,`
`);if(!e.startsWith(`---
`))return{data:{},body:e.replace(/^\n+/,"")};const n=e.indexOf(`
---`,3);if(n===-1)return{data:{},body:e};const r=e.slice(4,n+1),i=e.indexOf(`
`,n+1),o=i===-1?"":e.slice(i+1),s={},a=r.split(`
`);let c=null;for(const l of a){if(l.trim()===""||l.trimStart().startsWith("#"))continue;const d=/^\s*-\s+(.*)$/.exec(l);if(d&&c){s[c].push(Q(d[1]));continue}const h=/^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(l);if(!h)continue;const[,f,y]=h;c=null,y.trim()===""?(s[f]=[],c=f):y.trim().startsWith("[")&&y.trim().endsWith("]")?s[f]=je(y):s[f]=Q(y)}for(const[l,d]of Object.entries(s))Array.isArray(d)&&d.length===0&&!re.has(l)&&(s[l]="");return{data:s,body:o}}function Ne(t){const e=String(t);return e===""||/^[#&*!|>%@`?-]/.test(e)||/[:,[\]{}]/.test(e)||e!==e.trim()||["true","false","null","~"].includes(e)}function Z(t){return typeof t=="boolean"||typeof t=="number"?String(t):t==null?"":Ne(t)?`'${String(t).replace(/'/g,"''")}'`:String(t)}function Be(t,e){return Array.isArray(e)||re.has(t)?`[${(Array.isArray(e)?e:[e].filter(r=>r!==""&&r!=null)).map(Z).join(", ")}]`:Z(e)}function I(t,e=""){const r=[...X.filter(o=>o in t),...Object.keys(t).filter(o=>!X.includes(o))].map(o=>`${o}: ${Be(o,t[o])}`),i=String(e).replace(/\s+$/,"");return`---
${r.join(`
`)}
---
${i?`${i}
`:""}`}function De(t){const e=[],n=[];for(const r of String(t).split(`
`)){const i=Ce.exec(r);i?e.push({done:i[1].toLowerCase()==="x",text:i[2].trim()}):n.push(r)}return{notes:n.join(`
`).trim(),subtasks:e}}function Re(t,e=[]){const n=e.map(i=>`- [${i.done?"x":" "}] ${i.text}`).join(`
`),r=String(t||"").trim();return r?n?`${r}

${n}`:r:n}const v="_project-",$=864e5,Fe={æ:"ae",ø:"o",å:"a",ß:"ss",ð:"d",þ:"th",ł:"l",đ:"d"};function Ie(t){return String(t).toLowerCase().replace(/[æøåßðþłđ]/g,n=>Fe[n]).normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"task"}function Jt(t,e){const n=Ie(t),r=e instanceof Set?e:new Set(e);if(!r.has(n))return n;for(let i=2;;i+=1){const o=`${n}-${i}`;if(!r.has(o))return o}}function x(t){if(t==null||t==="")return null;const e=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(t).trim());if(!e)return null;const n=Date.UTC(Number(e[1]),Number(e[2])-1,Number(e[3]));return Number.isNaN(n)?null:n}function ie(t){return t==null?"":new Date(t).toISOString().slice(0,10)}const Le={h:1,d:8,w:40};function Pe(t){if(t==null||t==="")return null;const e=String(t).trim().toLowerCase(),n=/^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(e);return n?Number(n[1])*Le[n[2]]:null}function We(t){return t.reduce((e,n)=>e+(Pe(n.estimate)??0),0)}function E(t){return t==null||t===""?[]:(Array.isArray(t)?t:[t]).map(e=>String(e).trim()).filter(Boolean)}function Ue(t){if(t==null||t==="")return null;const e=Number(t);return Number.isFinite(e)?e:null}function L(t,e){const{data:n,body:r}=F(e),{notes:i,subtasks:o}=De(r),s=String(t).replace(/\.md$/i,"");return{id:String(n.id||s),title:String(n.title||s),project:E(n.project),people:E(n.people),due:n.due?String(n.due):"",estimate:n.estimate?String(n.estimate):"",created:n.created?String(n.created):"",done:n.done===!0,goal:n.goal===!0,working:n.working===!0,x:Ue(n.x),blockedBy:E(n["blocked-by"]),partOf:E(n["part-of"]),notes:i,subtasks:o,extra:Object.fromEntries(Object.entries(n).filter(([a])=>!["id","title","project","people","due","estimate","created","done","goal","working","x","blocked-by","part-of"].includes(a)))}}function ae(t,e=[]){return Object.fromEntries(Object.entries(t).filter(([n,r])=>e.includes(n)?!0:Array.isArray(r)?r.length>0:r!==""&&r!=null))}function ce(t){const e=ae({id:t.id,title:t.title,project:t.project??[],people:t.people??[],due:t.due??"",estimate:t.estimate??"",created:t.created??"",done:!!t.done,...t.goal?{goal:!0}:{},...t.working?{working:!0}:{},"blocked-by":t.blockedBy??[],"part-of":t.partOf??[],x:t.x??"",...t.extra??{}},["id","title","done"]);return I(e,Re(t.notes,t.subtasks))}function P(t,e){const{data:n,body:r}=F(e),i=String(t),o=i.lastIndexOf("/"),s=i.slice(o+1).replace(/\.md$/i,"").replace(new RegExp(`^${v}`),"");return{id:String(n.id||s),title:String(n.title||s),goal:n.goal?String(n.goal):"",people:E(n.people),start:n.start?String(n.start):"",end:n.end?String(n.end):"",starred:n.starred===!0,archived:n.archived===!0,color:n.color?String(n.color):"",folder:o===-1?"":i.slice(0,o),context:String(r).trim()}}function le(t){return I(ae({id:t.id,title:t.title,goal:t.goal??"",...t.starred?{starred:!0}:{},...t.archived?{archived:!0}:{},people:t.people??[],start:t.start??"",end:t.end??"",color:t.color??""},["id","title"]),t.context??"")}const j="_trash.md",Ye=50;function de(t){const{body:e}=F(t),n=/```json\s*\n([\s\S]*?)```/.exec(String(e));if(!n)return[];try{const r=JSON.parse(n[1]);return Array.isArray(r)?r:[]}catch{return[]}}function ue(t){const e=["```json",JSON.stringify(t??[],null,2),"```"].join(`
`);return I({id:"_trash"},e)}function Ht(t){return[...t??[]].sort((e,n)=>+!!n.starred-+!!e.starred||e.id.localeCompare(n.id))}function Ge(t,e=!1){return e?[...t??[]]:(t??[]).filter(n=>!n.archived)}function Kt(t,e,{deleteTasks:n=!1}={}){const r=(t.projects??[]).find(d=>d.id===e);if(!r)return null;const i=d=>d.project??[],o=d=>i(d).filter(h=>h!==e),s=d=>i(d).includes(e),a=d=>s(d)&&o(d).length===0,c=n?t.tasks.filter(d=>!d.goal&&a(d)):[],l=new Set([...c.map(d=>d.id),...t.tasks.filter(d=>d.goal&&s(d)).map(d=>d.id)]);return{project:r,removed:c,untagged:t.tasks.filter(d=>!d.goal&&s(d)&&!l.has(d.id)).map(d=>d.id),projects:(t.projects??[]).filter(d=>d.id!==e),tasks:t.tasks.filter(d=>!l.has(d.id)).map(d=>s(d)?{...d,project:o(d)}:d)}}function Xt(t,e){return[e,...t??[]].slice(0,Ye)}const qe=t=>`${t.id}.md`,ze=t=>`${v}${t.id}.md`,V=(t,e)=>t?`${t}/${e}`:e;function Je(t,e){var n;return e.get((n=t.project)==null?void 0:n[0])??""}function Qt(t){const e=new Set,n=new Set,r=[];for(const[i,o]of Object.entries(t)){const s=i.slice(i.lastIndexOf("/")+1);if(!/\.md$/i.test(s)||s===j)continue;const a=s.startsWith(v),c=a?P(i,o).id:L(s,o).id,l=`${a?"project":"task"}:${c}`;if(e.has(l)){n.add(c),r.push(i);continue}e.add(l)}return{ids:[...n],paths:r}}function Zt(t){const e=[],n=[];let r=[];const i=new Set,o=new Set;for(const[s,a]of Object.entries(t)){if(!/\.md$/i.test(s))continue;const c=s.slice(s.lastIndexOf("/")+1);if(c===j)r=de(a);else if(c.startsWith(v)){const l=P(s,a);if(i.has(l.id))continue;i.add(l.id),n.push(l)}else{const l=L(c,a);if(o.has(l.id))continue;o.add(l.id),e.push(l)}}return e.sort((s,a)=>s.id.localeCompare(a.id)),n.sort((s,a)=>s.id.localeCompare(a.id)),{tasks:e,projects:n,trash:r}}function Vt({tasks:t,projects:e,trash:n}){const r={},i=new Map((e??[]).map(o=>[o.id,o.folder??""]));for(const o of e)r[V(o.folder,ze(o))]=le(o);for(const o of t)r[V(Je(o,i),qe(o))]=ce(o);return n!=null&&n.length&&(r[j]=ue(n)),r}function ee(t,e){const n=String(t).slice(String(t).lastIndexOf("/")+1);return n===j?ue(de(e)):n.startsWith(v)?le(P(t,e)):ce(L(n,e))}function en(t,e,n){if(e===n)return!0;try{return ee(t,e)===ee(t,n)}catch{return!1}}const He=t=>`${t}-goal`;function tn({tasks:t,projects:e},n=Date.now()){const r=new Map(e.filter(s=>{var a;return(a=s.goal)==null?void 0:a.trim()}).map(s=>[He(s.id),s])),i=[];let o=[];for(const s of t){if(!s.goal){o.push(s);continue}const a=r.get(s.id);if(!a){i.push(s);continue}r.delete(s.id);const c=a.goal.trim(),l=a.end??"";o.push(s.title===c&&s.due===l?s:{...s,title:c,due:l})}for(const[s,a]of r)o.push({id:s,title:a.goal.trim(),project:[a.id],people:[],due:a.end??"",estimate:"",created:ie(n),done:!1,goal:!0,working:!1,x:null,blockedBy:[],partOf:[],notes:"",subtasks:[],extra:{}});return o.sort((s,a)=>s.id.localeCompare(a.id)),{tasks:o,removed:i}}function nn(t,e,n){const r=t.find(c=>c.id===e),i=t.find(c=>c.id===n);if(!r||!i||e===n||r.goal||i.goal)return null;const o=[{done:!!r.done,text:r.title},...r.subtasks??[]],s=(c,l)=>[...new Set((c??[]).map(d=>d===e?n:d))].filter(d=>d!==l);return{tasks:t.filter(c=>c.id!==e).map(c=>{const l=c.id===n?{...c,subtasks:[...c.subtasks??[],...o]}:c;return{...l,blockedBy:s(l.blockedBy,l.id),partOf:s(l.partOf,l.id)}}),merged:r}}function on(t){const e=String(t??"").split(/[\s._-]+/).map(n=>n.replace(/[^\p{L}\p{N}]/gu,"")).filter(Boolean);return e.length?e.slice(0,2).map(n=>n[0].toUpperCase()).join(""):"?"}function rn(t,e){return t.map(n=>{const r=e!=null&&n.id===e;return!!n.working===r?n:{...n,working:r}})}function sn(t,e,n){const r=new Set([e]);for(let i=!0;i;){i=!1;for(const o of t)r.has(o.id)||(o[n]??[]).some(s=>r.has(s))&&(r.add(o.id),i=!0)}return r}const O={day:{unit:"day",label:"Days",level(t,e){return(t-e)/$},dateForLevel(t,e){return e+t*$},format(t){return new Date(t).toISOString().slice(5,10).replace("-","/")}},week:{unit:"week",label:"Weeks",level(t,e){return(t-e)/(7*$)},dateForLevel(t,e){return e+t*7*$},format(t){return`${new Date(t).toISOString().slice(5,10).replace("-","/")}`}},month:{unit:"month",label:"Months",level(t,e){const n=new Date(e),r=new Date(t),i=(r.getUTCFullYear()-n.getUTCFullYear())*12+(r.getUTCMonth()-n.getUTCMonth()),o=Date.UTC(r.getUTCFullYear(),r.getUTCMonth(),1),s=Date.UTC(r.getUTCFullYear(),r.getUTCMonth()+1,1);return i+(t-o)/(s-o)},dateForLevel(t,e){const n=new Date(e);return Date.UTC(n.getUTCFullYear(),n.getUTCMonth()+Math.round(t),1)},format(t){const e=new Date(t);return`${e.toLocaleString("en",{month:"short",timeZone:"UTC"})} ${e.getUTCFullYear()}`}}};function an(t,e){if(t==null||e==null||e<=t)return O.week;const n=(e-t)/$;return n<=31?O.day:n<=240?O.week:O.month}function cn(t){return O[t]??O.week}function ln(t,e){const n=e.map(l=>x(l.due)).filter(l=>l!=null),r=x(t==null?void 0:t.start),i=x(t==null?void 0:t.end),o=[r,...n].filter(l=>l!=null),s=[i,...n].filter(l=>l!=null),a=o.length?Math.min(...o):Date.now(),c=s.length?Math.max(...s):a+30*$;return{start:a,end:Math.max(c,a)}}function dn(t,{bucket:e,start:n,collapse:r=!1}){const i=new Map;for(const g of t){const m=x(g.due);m!=null&&i.set(g.id,Math.floor(e.level(m,n)))}const o=[...i.values()],s=o.length?Math.min(...o):0,a=o.length?Math.max(...o):0,c=[...new Set(o)].sort((g,m)=>g-m),l=r?new Map(c.map((g,m)=>[g,m])):new Map(c.map(g=>[g,g-s])),d=r?Math.max(0,c.length-1):a-s,h=d+2,f=new Map;for(const g of t)f.set(g.id,i.has(g.id)?l.get(i.get(g.id)):h);const y=r?new Map([...l].map(([g,m])=>[m,g-s])):new Map(Array.from({length:d+1},(g,m)=>[m,m])),M=[];return r&&c.forEach((g,m)=>{const C=c[m-1];m>0&&g-C>1&&M.push({afterLevel:m-1,periods:g-C-1})}),{levels:f,trayLevel:h,minLevel:s,lastLevel:d,levelOrigin:y,gaps:M}}function Ke(t,e,n=Date.now()){var a,c;const r=((a=t.subtasks)==null?void 0:a.length)??0,i=((c=t.subtasks)==null?void 0:c.filter(l=>l.done).length)??0,o=x(t.due),s=(t.blockedBy??[]).filter(l=>e.has(l)&&!e.get(l).done);return{done:!!t.done,working:!!t.working,total:r,checked:i,ratio:t.done?1:r===0?0:i/r,started:!t.done&&i>0,blocked:!t.done&&s.length>0,blockers:s,overdue:!t.done&&o!=null&&o<n}}const fe=t=>new Map(t.map(e=>[e.id,e]));function Xe(t){return[...new Set(t.flatMap(e=>e.people??[]))].sort((e,n)=>e.localeCompare(n))}function un(t){return[...new Set(t.flatMap(e=>e.project??[]))].sort((e,n)=>e.localeCompare(n))}function Qe(t,e){const n=he(e,{projectId:(t==null?void 0:t.id)??null}),r=(t==null?void 0:t.people)??[],i=[...new Set([...r,...Xe(n)])],o=new Set(r);return i.map(s=>({name:s,inRoster:o.has(s),openTasks:n.filter(a=>!a.done&&(a.people??[]).includes(s)).length})).sort((s,a)=>Number(a.inRoster)-Number(s.inRoster)||s.name.localeCompare(a.name))}function he(t,{projectId:e=null,people:n=[],hideDone:r=!1}={}){const i=new Set(n);return t.filter(o=>!(e&&!(o.project??[]).includes(e)||i.size>0&&!(o.people??[]).some(s=>i.has(s))||r&&o.done))}function Ze(t){const e=new Set(t.map(o=>o.id)),n=new Map;for(const o of t)if(o.goal)for(const s of o.project??[])n.set(s,o.id);if(!n.size)return[];const r=new Set;for(const o of t){for(const s of o.blockedBy??[])e.has(s)&&r.add(s);for(const s of o.partOf??[])e.has(s)&&r.add(o.id)}const i=[];for(const o of t){if(o.goal||r.has(o.id))continue;const s=(o.project??[]).map(a=>n.get(a)).find(Boolean);s&&s!==o.id&&i.push({from:o.id,to:s})}return i}function fn(t,e){const n=new Set(t.map(s=>s.id)),r=new Set(t.filter(s=>s.due).map(s=>s.id)),i=(s,a)=>r.has(s)&&r.has(a)&&((e==null?void 0:e.get(s))??0)>((e==null?void 0:e.get(a))??0),o=[];for(const{from:s,to:a}of Ze(t))o.push({id:`goal:${s}->${a}`,from:s,to:a,kind:"goal",conflict:i(s,a)});for(const s of t){for(const a of s.blockedBy??[]){if(!n.has(a))continue;const c=i(a,s.id);o.push({id:`blocks:${a}->${s.id}`,from:a,to:s.id,kind:"blocks",conflict:c})}for(const a of s.partOf??[])n.has(a)&&o.push({id:`part-of:${s.id}->${a}`,from:s.id,to:a,kind:"part-of",conflict:!1})}return o}const pe="tasks.files",Ve="tasks-storage",A="handles",ge="directory",D=typeof globalThis.showDirectoryPicker=="function";function we(){return new Promise((t,e)=>{const n=indexedDB.open(Ve,1);n.onupgradeneeded=()=>n.result.createObjectStore(A),n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error)})}async function te(t){const e=await we();await new Promise((n,r)=>{const i=e.transaction(A,"readwrite");i.objectStore(A).put(t,ge),i.oncomplete=n,i.onerror=()=>r(i.error)}),e.close()}async function ne(){const t=await we(),e=await new Promise((n,r)=>{const o=t.transaction(A,"readonly").objectStore(A).get(ge);o.onsuccess=()=>n(o.result),o.onerror=()=>r(o.error)});return t.close(),e}function et(){try{const t=localStorage.getItem(pe),e=t?JSON.parse(t):null;return e&&typeof e=="object"?e:null}catch{return null}}function oe(t){try{localStorage.setItem(pe,JSON.stringify(t))}catch{}}const me=t=>t.toLowerCase().endsWith(".md"),tt=[/\([^)]*conflicted copy[^)]*\)\.md$/i,/\.sync-conflict-[^/]*\.md$/i],be=t=>tt.some(e=>e.test(t));async function nt(t){const e=[],n=[];for await(const[r,i]of t.entries())i.kind!=="file"||!me(r)||(be(r)?n.push(r):e.push([r,i]));return{found:e,conflicts:n}}async function ot(t){const e={},n=new Map,r=[],i=[],o=async(s,a)=>{const c=await a.getFile();e[s]=await c.text(),n.set(s,{mtime:c.lastModified,size:c.size})};for await(const[s,a]of t.entries())a.kind==="directory"?i.push([s,a]):a.kind==="file"&&me(s)&&(be(s)?r.push(s):await o(s,a));for(const[s,a]of i){const{found:c,conflicts:l}=await nt(a);if(c.some(([d])=>d.startsWith(v))){for(const d of l)r.push(`${s}/${d}`);for(const[d,h]of c)await o(`${s}/${d}`,h)}}return{files:e,stats:n,conflicts:r}}function hn({sameFile:t=(e,n,r)=>n===r}={}){let e=null,n=!1;async function r(u,w){let p=e;for(const b of u.split("/").slice(0,-1))p=await p.getDirectoryHandle(b,{create:w});return p}const i=u=>u.slice(u.lastIndexOf("/")+1);let o=new Map,s=Promise.resolve();function a(u){const w=s.then(u,u);return s=w.then(()=>{},()=>{}),w}const c={get mode(){return e?"folder":"local"},get folderName(){return(e==null?void 0:e.name)??""},supportsFolder:D,reconnectable:!1,conflictFiles:[],get writable(){return!e||n}};async function l(){if(!D)return!1;let u;try{u=await ne()}catch{return!1}if(!u)return!1;try{if(await u.queryPermission({mode:"readwrite"})==="granted")return e=u,!0;c.reconnectable=!0}catch{}return!1}async function d(){if(e||await l(),e){const{files:u,stats:w,conflicts:p}=await ot(e);return o=new Map(Object.entries(u).map(([b,k])=>[b,{text:k,...w.get(b)}])),c.conflictFiles=p,oe(u),u}return et()??{}}const h=()=>a(d);async function f(u){try{const b=await(await(await r(u,!1)).getFileHandle(i(u),{create:!1})).getFile();return{mtime:b.lastModified,size:b.size}}catch{return null}}const y=(u,w)=>w.mtime!==u.mtime||w.size!==u.size;async function M(u){if(e&&!n)return{skipped:"read-only"};if(oe(u),!e)return{};const w=[];for(const[p,b]of Object.entries(u)){const k=o.get(p);if(k&&t(p,k.text,b))continue;const _=await f(p);if(k?_&&y(k,_):_){w.push(p);continue}const J=await(await r(p,!0)).getFileHandle(i(p),{create:!0}),H=await J.createWritable();await H.write(b),await H.close();const K=await J.getFile();o.set(p,{text:b,mtime:K.lastModified,size:K.size})}for(const[p,b]of[...o]){if(p in u)continue;const k=await f(p);if(k&&y(b,k)){w.push(p);continue}if(k)try{await(await r(p,!1)).removeEntry(i(p))}catch{}o.delete(p)}return w.length?{blocked:w}:{}}const g=u=>a(()=>M(u));async function m(){if(!e||!n)return{files:null,changed:!1};const u=o,w=await d(),p=new Set([...u.keys(),...Object.keys(w)]);let b=!1;for(const k of p){const _=u.get(k),B=w[k];if(_===void 0||B===void 0||!t(k,_.text,B)){b=!0;break}}return{files:w,changed:b}}const C=()=>a(m);function ve(u){for(const w of u)o.delete(w)}function Te(){return a(async()=>{if(!e)return null;const u=await d();return n=!0,u})}function Ee(){n=!1}async function Ae(){if(!D)throw new Error("This browser cannot open folders.");const u=c.reconnectable&&await ne()||await globalThis.showDirectoryPicker({mode:"readwrite"});if(await u.requestPermission({mode:"readwrite"})!=="granted")throw new Error("Permission to use that folder was declined.");return e=u,n=!1,c.reconnectable=!1,await te(u).catch(()=>{}),h()}function Me(){e=null,n=!1,o=new Map,c.conflictFiles=[],c.reconnectable=!1,te(null).catch(()=>{})}return{state:c,load:h,save:g,revalidate:C,disown:ve,unlock:Te,lock:Ee,connectFolder:Ae,disconnectFolder:Me,tryRestoreFolder:l}}const rt=67324752,st=33639248,it=101010256,at=(()=>{const t=new Uint32Array(256);for(let e=0;e<256;e+=1){let n=e;for(let r=0;r<8;r+=1)n=n&1?3988292384^n>>>1:n>>>1;t[e]=n>>>0}return t})();function ct(t){let e=4294967295;for(let n=0;n<t.length;n+=1)e=at[(e^t[n])&255]^e>>>8;return(e^4294967295)>>>0}function lt(t){const e=Math.max(1980,t.getFullYear());return{time:t.getHours()<<11|t.getMinutes()<<5|Math.floor(t.getSeconds()/2),date:e-1980<<9|t.getMonth()+1<<5|t.getDate()}}class dt{constructor(){this.chunks=[],this.length=0}bytes(e){this.chunks.push(e),this.length+=e.length}u16(e){this.bytes(new Uint8Array([e&255,e>>>8&255]))}u32(e){this.bytes(new Uint8Array([e&255,e>>>8&255,e>>>16&255,e>>>24&255]))}concat(){const e=new Uint8Array(this.length);let n=0;for(const r of this.chunks)e.set(r,n),n+=r.length;return e}}function pn(t,e=new Date){const n=new TextEncoder,{time:r,date:i}=lt(e),o=new dt,s=[];for(const[l,d]of Object.entries(t)){const h=n.encode(l),f=n.encode(d),y=ct(f);s.push({nameBytes:h,size:f.length,crc:y,offset:o.length}),o.u32(rt),o.u16(20),o.u16(2048),o.u16(0),o.u16(r),o.u16(i),o.u32(y),o.u32(f.length),o.u32(f.length),o.u16(h.length),o.u16(0),o.bytes(h),o.bytes(f)}const a=o.length;for(const l of s)o.u32(st),o.u16(20),o.u16(20),o.u16(2048),o.u16(0),o.u16(r),o.u16(i),o.u32(l.crc),o.u32(l.size),o.u32(l.size),o.u16(l.nameBytes.length),o.u16(0),o.u16(0),o.u16(0),o.u16(0),o.u32(0),o.u32(l.offset),o.bytes(l.nameBytes);const c=o.length-a;return o.u32(it),o.u16(0),o.u16(0),o.u16(s.length),o.u16(s.length),o.u32(c),o.u32(a),o.u16(0),o.concat()}const T=t=>String(t??"").replace(/\|/g,"\\|").replace(/\n+/g," ").trim(),ut=t=>(t.people??[]).join(", ");function ft(t){return t.done?"done":t.total===0?"—":`${t.checked}/${t.total}`}const W=(t,e)=>(x(t.due)??1/0)-(x(e.due)??1/0);function ye(t,{now:e=Date.now()}={}){const n=[];n.push(`# ${(t==null?void 0:t.title)||"Untitled project"}`),t!=null&&t.goal&&n.push("","## Goal",t.goal.trim()),t!=null&&t.context&&n.push("","## Context",t.context.trim());const r=[t==null?void 0:t.start,t==null?void 0:t.end].filter(Boolean);return n.push(""),r.length===2&&n.push(`Window: ${t.start} → ${t.end}`),n.push(`Today: ${ie(e)}`),n.join(`
`)}function ke(t,{now:e=Date.now()}={}){const n=fe(t),r=["## Tasks","","| id | task | due | estimate | people | subtasks |"];r.push("|----|------|-----|----------|--------|----------|");const i=[...t].sort(W);for(const o of i){const s=Ke(o,n,e);r.push(`| ${T(o.id)} | ${T(o.title)} | ${T(o.due)||"—"} | ${T(o.estimate)||"—"} | ${T(ut(o))||"—"} | ${ft(s)} |`)}return i.length===0&&r.push("| — | _no tasks yet_ | — | — | — | — |"),r.join(`
`)}function Se(t){const e=fe(t),n=[];for(const r of[...t].sort(W)){for(const i of r.blockedBy??[])e.has(i)&&n.push(`- ${r.id} blocked-by ${i}`);for(const i of r.partOf??[])e.has(i)&&n.push(`- ${r.id} part-of ${i}`)}return["## Dependencies","",n.length?n.join(`
`):"_none recorded_"].join(`
`)}function U(t,e,{now:n=Date.now()}={}){return`${[ye(t,{now:n}),ke(e,{now:n}),Se(e)].join(`

`)}
`}function Y(t){var n,r;const e=[`## Task: ${t.title}`,`id: ${t.id}`];if(t.due&&e.push(`due: ${t.due}`),t.estimate&&e.push(`current estimate: ${t.estimate}`),(n=t.people)!=null&&n.length&&e.push(`people: ${t.people.join(", ")}`),t.notes&&e.push("",t.notes.trim()),(r=t.subtasks)!=null&&r.length){e.push("","Existing subtasks:");for(const i of t.subtasks)e.push(`- [${i.done?"x":" "}] ${i.text}`)}else e.push("","Existing subtasks: none");return`${e.join(`
`)}
`}const ht=[{id:"goal",label:"Goal & context",hint:"The project title, its goal and your notes"},{id:"tasks",label:"Tasks in this project",hint:"Every task, done ones included, with dependencies"},{id:"detail",label:"Task notes & subtasks",hint:"The full text behind each task"},{id:"task",label:"Selected task in full",hint:"The task open in the sidebar",needs:"task"},{id:"projects",label:"Other projects",hint:"Titles and goals of everything else on the board"},{id:"people",label:"People",hint:"Who is on the project and what they are holding"}];function gn(t){const e=String(t??"").trim();return e?e.split(/\s+/).length:0}function pt(t){var r,i,o,s;const e=["## Task detail"];let n=0;for(const a of[...t].sort(W))if(!(!((r=a.notes)!=null&&r.trim())&&!((i=a.subtasks)!=null&&i.length))&&(n+=1,e.push("",`### ${a.title}`,`id: ${a.id}`),(o=a.notes)!=null&&o.trim()&&e.push("",a.notes.trim()),(s=a.subtasks)!=null&&s.length)){e.push("","Subtasks:");for(const c of a.subtasks)e.push(`- [${c.done?"x":" "}] ${c.text}`)}return n?e.join(`
`):""}function gt(t,e,n){var o;const r=Ge(e??[],!1).filter(s=>s.id!==(t==null?void 0:t.id));if(!r.length)return"";const i=["## Other projects",""];for(const s of r){const a=he(n??[],{projectId:s.id}).length,c=[s.start,s.end].filter(Boolean).join(" → "),l=[`**${s.title}**`,(o=s.goal)==null?void 0:o.trim(),c,`${a} tasks`];i.push(`- ${l.filter(Boolean).join(" — ")}`)}return i.join(`
`)}function wt(t,e){const n=Qe(t,e??[]);if(!n.length)return"";const r=["## People",""];for(const i of n){const o=(e??[]).filter(c=>!c.done&&(c.people??[]).includes(i.name)),s=We(o),a=s?`, ${s}h estimated`:"";r.push(`- ${i.name} — ${o.length} open task${o.length===1?"":"s"}${a}`)}return r.join(`
`)}function mt({project:t,tasks:e=[],task:n=null,projects:r=[],allTasks:i=[],now:o=Date.now()}={}){return{goal:ye(t,{now:o}),tasks:`${ke(e,{now:o})}

${Se(e)}`,detail:pt(e),task:n?Y(n).trimEnd():"",projects:gt(t,r,i),people:wt(t,e)}}function wn(t,e={}){const n=new Set(t??[]),r=mt(e),i=ht.filter(o=>n.has(o.id)).map(o=>r[o.id]).filter(o=>o&&o.trim());return i.length?`${i.join(`

`)}
`:""}const G=`You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`,bt=`You are a project planning advisor helping someone think about their own project.
Answer in concise markdown prose. Lead with the answer, then the reasoning.
Ground every claim in the brief you were given, and refer to tasks by their exact id in backticks.
If the brief does not contain what you would need, say so plainly instead of inventing it.
You are being asked to think, not to fill in a form: no preamble, no restating the question.`;function mn(t,e){const n=[{role:"system",content:bt}];return e.forEach((r,i)=>{const o=i===0&&r.role==="user"&&t;n.push({role:r.role,content:o?`${t}
---
${r.content}`:r.content})}),n}function q(t){const e=String(t??"").trim(),n=[],r=/```(?:json)?\s*\n?([\s\S]*?)```/gi;for(let s=r.exec(e);s;s=r.exec(e))n.push(s[1]);const i=e.search(/[[{]/);if(i!==-1){const s=Math.max(e.lastIndexOf("]"),e.lastIndexOf("}"));s>i&&n.push(e.slice(i,s+1))}n.push(e);for(const s of n)try{return JSON.parse(s.trim())}catch{}const o=new Error("Could not read JSON from the model response.");throw o.raw=e,o}function _e(t,e){if(Array.isArray(t))return t;if(t&&Array.isArray(t[e]))return t[e];if(t&&typeof t=="object"){const n=Object.values(t).find(Array.isArray);if(n)return n}return[]}const S=t=>typeof t=="string"?t.trim():"",yt={id:"subtasks",title:"Suggest subtasks",messages(t,e,n){return[{role:"system",content:G},{role:"user",content:`${U(t,e)}
${Y(n)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`}]},parse(t){return _e(q(t),"subtasks").map(e=>typeof e=="string"?e:S((e==null?void 0:e.text)??(e==null?void 0:e.title))).map(e=>e.replace(/^[-*]\s*(\[[ xX]\]\s*)?/,"").trim()).filter(Boolean).map(e=>({kind:"subtask",label:e}))}},kt={id:"missing",title:"Find missing tasks",messages(t,e){return[{role:"system",content:G},{role:"user",content:`${U(t,e)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`}]},parse(t){return _e(q(t),"tasks").map(e=>{if(typeof e=="string")return{kind:"task",label:e,task:{title:e}};const n=S((e==null?void 0:e.title)??(e==null?void 0:e.name));if(!n)return null;const r=/^\d{4}-\d{2}-\d{2}$/.test(S(e==null?void 0:e.due))?S(e.due):"",i=(Array.isArray(e==null?void 0:e.blocked_by)?e.blocked_by:[]).map(S).filter(Boolean);return{kind:"task",label:n,detail:S((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),task:{title:n,due:r,estimate:S(e==null?void 0:e.estimate),blockedBy:i}}}).filter(Boolean)}},St={id:"estimate",title:"Estimate duration",messages(t,e,n){return[{role:"system",content:G},{role:"user",content:`${U(t,e)}
${Y(n)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`}]},parse(t){const e=q(t),n=S(typeof e=="string"?e:(e==null?void 0:e.estimate)??(e==null?void 0:e.duration)),r=/(\d+(?:\.\d+)?)\s*([hdw])/i.exec(n);if(!r){const o=new Error(`Model returned an unusable estimate: "${n||"(empty)"}"`);throw o.raw=JSON.stringify(e),o}const i=`${Number(r[1])}${r[2].toLowerCase()}`;return[{kind:"estimate",label:i,detail:S((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),estimate:i}]}},bn={subtasks:yt,missing:kt,estimate:St},z="https://openrouter.ai/api/v1",R="tasks.openrouter.key",xe="tasks.openrouter.model",N="google/gemini-2.0-flash-001",_t=()=>localStorage.getItem(R)||"",yn=t=>t?localStorage.setItem(R,t):localStorage.removeItem(R),xt=()=>localStorage.getItem(xe)||N,kn=t=>localStorage.setItem(xe,t||N);function $t(t){var n;const e=Number((n=t==null?void 0:t.pricing)==null?void 0:n.prompt);return Number.isFinite(e)?e*1e6:null}function Sn(t){return t==null?"":t===0?"free":t<1?`$${t.toFixed(3)}/M`:`$${t.toFixed(2)}/M`}async function _n(){const t=await fetch(`${z}/models`);if(!t.ok)throw new Error(`OpenRouter models request failed (${t.status})`);const e=await t.json();return((e==null?void 0:e.data)??[]).filter(n=>{var r;return(n==null?void 0:n.id)&&(((r=n.architecture)==null?void 0:r.output_modalities)??["text"]).includes("text")}).map(n=>({id:n.id,name:n.name||n.id,price:$t(n),context:n.context_length??null})).filter(n=>n.price!=null).sort((n,r)=>n.price-r.price||n.id.localeCompare(r.id))}const $e=t=>({Authorization:`Bearer ${t}`,"Content-Type":"application/json","HTTP-Referer":location.origin,"X-Title":"Tasks"});async function Oe(t){var e;try{const n=await t.json();return((e=n==null?void 0:n.error)==null?void 0:e.message)||`HTTP ${t.status}`}catch{return`HTTP ${t.status}`}}async function Ot(t,{key:e,model:n,signal:r,maxTokens:i=900,temperature:o=.4}={}){var l,d,h;if(!e)throw new Error("No OpenRouter API key set. Add one under Settings.");const s=await fetch(`${z}/chat/completions`,{method:"POST",signal:r,headers:$e(e),body:JSON.stringify({model:n||N,messages:t,temperature:o,max_tokens:i})});if(!s.ok)throw new Error(`OpenRouter: ${await Oe(s)}`);const a=await s.json();if(a!=null&&a.error)throw new Error(`OpenRouter: ${a.error.message??"unknown error"}`);const c=(h=(d=(l=a==null?void 0:a.choices)==null?void 0:l[0])==null?void 0:d.message)==null?void 0:h.content;if(!c)throw new Error("OpenRouter returned an empty response.");return c}function vt(t){let e="",n=!1;const r=i=>{var l,d,h;const o=i.trim();if(!o||o.startsWith(":")||!o.startsWith("data:"))return;const s=o.slice(5).trim();if(s==="[DONE]"){n=!0;return}let a;try{a=JSON.parse(s)}catch{return}if(a!=null&&a.error)throw new Error(`OpenRouter: ${a.error.message??"unknown error"}`);const c=(h=(d=(l=a==null?void 0:a.choices)==null?void 0:l[0])==null?void 0:d.delta)==null?void 0:h.content;c&&(t==null||t(c))};return{push(i){e+=i;const o=e.split(`
`);e=o.pop()??"";for(const s of o)r(s)},end(){e&&(r(e),e="")},get finished(){return n}}}async function xn(t,{key:e,model:n,signal:r,maxTokens:i=2e3,temperature:o=.7,onDelta:s}={}){if(!e)throw new Error("No OpenRouter API key set. Add one under Settings.");const a=await fetch(`${z}/chat/completions`,{method:"POST",signal:r,headers:$e(e),body:JSON.stringify({model:n||N,messages:t,temperature:o,max_tokens:i,stream:!0})});if(!a.ok)throw new Error(`OpenRouter: ${await Oe(a)}`);if(!a.body)throw new Error("OpenRouter returned no response body.");let c="";const l=vt(f=>{c+=f,s==null||s(f,c)}),d=a.body.getReader(),h=new TextDecoder;try{for(;;){const{value:f,done:y}=await d.read();if(y||(l.push(h.decode(f,{stream:!0})),l.finished))break}l.end()}catch(f){if((f==null?void 0:f.name)==="AbortError")return c;throw f}finally{d.cancel().catch(()=>{})}if(!c)throw new Error("OpenRouter returned an empty response.");return c}async function $n(t,{project:e,tasks:n,task:r,signal:i}={}){const o=await Ot(t.messages(e,n,r),{key:_t(),model:xt(),signal:i});try{return{suggestions:t.parse(o),raw:o}}catch(s){throw s.raw=s.raw??o,s}}export{Zt as $,Tt as A,hn as B,ht as C,Vt as D,Qe as E,yn as F,kn as G,en as H,Qt as I,x as J,he as K,un as L,Xe as M,tn as N,Xt as O,Jt as P,ie as Q,Ht as R,bn as S,$n as T,_n as U,Sn as V,pn as W,U as X,He as Y,rn as Z,zt as _,xt as a,ln as a0,dn as a1,fe as a2,Ke as a3,fn as a4,Ge as a5,sn as a6,We as a7,Kt as a8,an as a9,cn as aa,nn as ab,F as ac,I as ad,L as ae,ce as af,P as ag,le as ah,De as ai,Re as aj,Ie as ak,Pe as al,Y as am,Ze as an,de as ao,ue as ap,Ye as aq,q as ar,ct as as,ee as at,vt as au,bt as av,mn as b,mt as c,gn as d,wn as e,qt as f,_t as g,Gt as h,on as i,Yt as j,Ut as k,Wt as l,Pt as m,Lt as n,It as o,Ft as p,Rt as q,Dt as r,xn as s,Bt as t,Nt as u,jt as v,Ct as w,Mt as x,At as y,Et as z};
