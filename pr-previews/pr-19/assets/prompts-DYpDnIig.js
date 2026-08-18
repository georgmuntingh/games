const Oe=`---
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
`,Te=`---
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
`,Ae=`---
id: analytics-dashboard
title: Analytics dashboard
project: [website]
people: [Oliver]
estimate: 1w
created: 2026-08-09
done: false
---
Wanted, not scheduled. Sits in the unscheduled tray until it earns a deadline.
`,Ce=`---
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
`,Be=`---
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
`,Me=`---
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
`,De=`---
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
`,Ee=`---
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
`,Ne=`---
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
`,Le=`---
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
`,Fe=`---
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
`,Re=`---
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
`,je=`---
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
`,Ie=`---
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
`,Ue=`---
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
`,Ye=`---
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
`,We=`---
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
`,Pe=`---
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
`,Ge=`---
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
`,qe=`---
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
`,B=["id","title","goal","starred","archived","project","people","due","estimate","created","done","working","blocked-by","part-of","x"],N=new Set(["project","people","blocked-by","part-of"]),Y=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;function L(e){const n=e.trim();return n.length>=2&&(n[0]==='"'||n[0]==="'")&&n[n.length-1]===n[0]?n.slice(1,-1):n}function M(e){const n=e.trim();return n===""?"":n==="true"?!0:n==="false"?!1:n==="null"||n==="~"?null:L(n)}function W(e){const n=e.trim().slice(1,-1).trim();if(n==="")return[];const t=[];let s="",i=null;for(const o of n)i?(o===i&&(i=null),s+=o):o==='"'||o==="'"?(i=o,s+=o):o===","?(t.push(s),s=""):s+=o;return t.push(s),t.map(o=>L(o)).filter(o=>o!=="")}function x(e){const n=String(e).replace(/\r\n/g,`
`);if(!n.startsWith(`---
`))return{data:{},body:n.replace(/^\n+/,"")};const t=n.indexOf(`
---`,3);if(t===-1)return{data:{},body:n};const s=n.slice(4,t+1),i=n.indexOf(`
`,t+1),o=i===-1?"":n.slice(i+1),r={},a=s.split(`
`);let l=null;for(const c of a){if(c.trim()===""||c.trimStart().startsWith("#"))continue;const d=/^\s*-\s+(.*)$/.exec(c);if(d&&l){r[l].push(M(d[1]));continue}const h=/^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(c);if(!h)continue;const[,p,g]=h;l=null,g.trim()===""?(r[p]=[],l=p):g.trim().startsWith("[")&&g.trim().endsWith("]")?r[p]=W(g):r[p]=M(g)}for(const[c,d]of Object.entries(r))Array.isArray(d)&&d.length===0&&!N.has(c)&&(r[c]="");return{data:r,body:o}}function P(e){const n=String(e);return n===""||/^[#&*!|>%@`?-]/.test(n)||/[:,[\]{}]/.test(n)||n!==n.trim()||["true","false","null","~"].includes(n)}function D(e){return typeof e=="boolean"||typeof e=="number"?String(e):e==null?"":P(e)?`'${String(e).replace(/'/g,"''")}'`:String(e)}function G(e,n){return Array.isArray(n)||N.has(e)?`[${(Array.isArray(n)?n:[n].filter(s=>s!==""&&s!=null)).map(D).join(", ")}]`:D(n)}function v(e,n=""){const s=[...B.filter(o=>o in e),...Object.keys(e).filter(o=>!B.includes(o))].map(o=>`${o}: ${G(o,e[o])}`),i=String(n).replace(/\s+$/,"");return`---
${s.join(`
`)}
---
${i?`${i}
`:""}`}function q(e){const n=[],t=[];for(const s of String(e).split(`
`)){const i=Y.exec(s);i?n.push({done:i[1].toLowerCase()==="x",text:i[2].trim()}):t.push(s)}return{notes:t.join(`
`).trim(),subtasks:n}}function J(e,n=[]){const t=n.map(i=>`- [${i.done?"x":" "}] ${i.text}`).join(`
`),s=String(e||"").trim();return s?t?`${s}

${t}`:s:t}const S="_project-",w=864e5,z={æ:"ae",ø:"o",å:"a",ß:"ss",ð:"d",þ:"th",ł:"l",đ:"d"};function H(e){return String(e).toLowerCase().replace(/[æøåßðþłđ]/g,t=>z[t]).normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"task"}function Je(e,n){const t=H(e),s=n instanceof Set?n:new Set(n);if(!s.has(t))return t;for(let i=2;;i+=1){const o=`${t}-${i}`;if(!s.has(o))return o}}function m(e){if(e==null||e==="")return null;const n=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(e).trim());if(!n)return null;const t=Date.UTC(Number(n[1]),Number(n[2])-1,Number(n[3]));return Number.isNaN(t)?null:t}function F(e){return e==null?"":new Date(e).toISOString().slice(0,10)}const K={h:1,d:8,w:40};function Q(e){if(e==null||e==="")return null;const n=String(e).trim().toLowerCase(),t=/^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(n);return t?Number(t[1])*K[t[2]]:null}function ze(e){return e.reduce((n,t)=>n+(Q(t.estimate)??0),0)}function _(e){return e==null||e===""?[]:(Array.isArray(e)?e:[e]).map(n=>String(n).trim()).filter(Boolean)}function Z(e){if(e==null||e==="")return null;const n=Number(e);return Number.isFinite(n)?n:null}function V(e,n){const{data:t,body:s}=x(n),{notes:i,subtasks:o}=q(s),r=String(e).replace(/\.md$/i,"");return{id:String(t.id||r),title:String(t.title||r),project:_(t.project),people:_(t.people),due:t.due?String(t.due):"",estimate:t.estimate?String(t.estimate):"",created:t.created?String(t.created):"",done:t.done===!0,goal:t.goal===!0,working:t.working===!0,x:Z(t.x),blockedBy:_(t["blocked-by"]),partOf:_(t["part-of"]),notes:i,subtasks:o,extra:Object.fromEntries(Object.entries(t).filter(([a])=>!["id","title","project","people","due","estimate","created","done","goal","working","x","blocked-by","part-of"].includes(a)))}}function R(e,n=[]){return Object.fromEntries(Object.entries(e).filter(([t,s])=>n.includes(t)?!0:Array.isArray(s)?s.length>0:s!==""&&s!=null))}function X(e){const n=R({id:e.id,title:e.title,project:e.project??[],people:e.people??[],due:e.due??"",estimate:e.estimate??"",created:e.created??"",done:!!e.done,...e.goal?{goal:!0}:{},...e.working?{working:!0}:{},"blocked-by":e.blockedBy??[],"part-of":e.partOf??[],x:e.x??"",...e.extra??{}},["id","title","done"]);return v(n,J(e.notes,e.subtasks))}function ee(e,n){const{data:t,body:s}=x(n),i=String(e),o=i.lastIndexOf("/"),r=i.slice(o+1).replace(/\.md$/i,"").replace(new RegExp(`^${S}`),"");return{id:String(t.id||r),title:String(t.title||r),goal:t.goal?String(t.goal):"",people:_(t.people),start:t.start?String(t.start):"",end:t.end?String(t.end):"",starred:t.starred===!0,archived:t.archived===!0,color:t.color?String(t.color):"",folder:o===-1?"":i.slice(0,o),context:String(s).trim()}}function ne(e){return v(R({id:e.id,title:e.title,goal:e.goal??"",...e.starred?{starred:!0}:{},...e.archived?{archived:!0}:{},people:e.people??[],start:e.start??"",end:e.end??"",color:e.color??""},["id","title"]),e.context??"")}const j="_trash.md",te=50;function oe(e){const{body:n}=x(e),t=/```json\s*\n([\s\S]*?)```/.exec(String(n));if(!t)return[];try{const s=JSON.parse(t[1]);return Array.isArray(s)?s:[]}catch{return[]}}function se(e){const n=["```json",JSON.stringify(e??[],null,2),"```"].join(`
`);return v({id:"_trash"},n)}function He(e){return[...e??[]].sort((n,t)=>+!!t.starred-+!!n.starred||n.id.localeCompare(t.id))}function Ke(e,n=!1){return n?[...e??[]]:(e??[]).filter(t=>!t.archived)}function Qe(e,n,{deleteTasks:t=!1}={}){const s=(e.projects??[]).find(d=>d.id===n);if(!s)return null;const i=d=>d.project??[],o=d=>i(d).filter(h=>h!==n),r=d=>i(d).includes(n),a=d=>r(d)&&o(d).length===0,l=t?e.tasks.filter(d=>!d.goal&&a(d)):[],c=new Set([...l.map(d=>d.id),...e.tasks.filter(d=>d.goal&&r(d)).map(d=>d.id)]);return{project:s,removed:l,untagged:e.tasks.filter(d=>!d.goal&&r(d)&&!c.has(d.id)).map(d=>d.id),projects:(e.projects??[]).filter(d=>d.id!==n),tasks:e.tasks.filter(d=>!c.has(d.id)).map(d=>r(d)?{...d,project:o(d)}:d)}}function Ze(e,n){return[n,...e??[]].slice(0,te)}const re=e=>`${e.id}.md`,ie=e=>`${S}${e.id}.md`,E=(e,n)=>e?`${e}/${n}`:n;function ae(e,n){var t;return n.get((t=e.project)==null?void 0:t[0])??""}function Ve(e){const n=new Set,t=new Set;for(const s of Object.keys(e)){const i=s.slice(s.lastIndexOf("/")+1);if(!/\.md$/i.test(i)||!i.startsWith(S))continue;const o=i.replace(/\.md$/i,"").replace(new RegExp(`^${S}`),"");n.has(o)&&t.add(o),n.add(o)}return[...t]}function Xe(e){const n=[],t=[];let s=[];const i=new Set;for(const[o,r]of Object.entries(e)){if(!/\.md$/i.test(o))continue;const a=o.slice(o.lastIndexOf("/")+1);if(a===j)s=oe(r);else if(a.startsWith(S)){const l=ee(o,r);if(i.has(l.id))continue;i.add(l.id),t.push(l)}else n.push(V(a,r))}return n.sort((o,r)=>o.id.localeCompare(r.id)),t.sort((o,r)=>o.id.localeCompare(r.id)),{tasks:n,projects:t,trash:s}}function en({tasks:e,projects:n,trash:t}){const s={},i=new Map((n??[]).map(o=>[o.id,o.folder??""]));for(const o of n)s[E(o.folder,ie(o))]=ne(o);for(const o of e)s[E(ae(o,i),re(o))]=X(o);return t!=null&&t.length&&(s[j]=se(t)),s}const le=e=>`${e}-goal`;function nn({tasks:e,projects:n},t=Date.now()){const s=new Map(n.filter(r=>{var a;return(a=r.goal)==null?void 0:a.trim()}).map(r=>[le(r.id),r])),i=[];let o=[];for(const r of e){if(!r.goal){o.push(r);continue}const a=s.get(r.id);if(!a){i.push(r);continue}s.delete(r.id);const l=a.goal.trim(),c=a.end??"";o.push(r.title===l&&r.due===c?r:{...r,title:l,due:c})}for(const[r,a]of s)o.push({id:r,title:a.goal.trim(),project:[a.id],people:[],due:a.end??"",estimate:"",created:F(t),done:!1,goal:!0,working:!1,x:null,blockedBy:[],partOf:[],notes:"",subtasks:[],extra:{}});return o.sort((r,a)=>r.id.localeCompare(a.id)),{tasks:o,removed:i}}function tn(e,n,t){const s=e.find(l=>l.id===n),i=e.find(l=>l.id===t);if(!s||!i||n===t||s.goal||i.goal)return null;const o=[{done:!!s.done,text:s.title},...s.subtasks??[]],r=(l,c)=>[...new Set((l??[]).map(d=>d===n?t:d))].filter(d=>d!==c);return{tasks:e.filter(l=>l.id!==n).map(l=>{const c=l.id===t?{...l,subtasks:[...l.subtasks??[],...o]}:l;return{...c,blockedBy:r(c.blockedBy,c.id),partOf:r(c.partOf,c.id)}}),merged:s}}function on(e){const n=String(e??"").split(/[\s._-]+/).map(t=>t.replace(/[^\p{L}\p{N}]/gu,"")).filter(Boolean);return n.length?n.slice(0,2).map(t=>t[0].toUpperCase()).join(""):"?"}function sn(e,n){return e.map(t=>{const s=n!=null&&t.id===n;return!!t.working===s?t:{...t,working:s}})}function rn(e,n,t){const s=new Set([n]);for(let i=!0;i;){i=!1;for(const o of e)s.has(o.id)||(o[t]??[]).some(r=>s.has(r))&&(s.add(o.id),i=!0)}return s}const y={day:{unit:"day",label:"Days",level(e,n){return(e-n)/w},dateForLevel(e,n){return n+e*w},format(e){return new Date(e).toISOString().slice(5,10).replace("-","/")}},week:{unit:"week",label:"Weeks",level(e,n){return(e-n)/(7*w)},dateForLevel(e,n){return n+e*7*w},format(e){return`${new Date(e).toISOString().slice(5,10).replace("-","/")}`}},month:{unit:"month",label:"Months",level(e,n){const t=new Date(n),s=new Date(e),i=(s.getUTCFullYear()-t.getUTCFullYear())*12+(s.getUTCMonth()-t.getUTCMonth()),o=Date.UTC(s.getUTCFullYear(),s.getUTCMonth(),1),r=Date.UTC(s.getUTCFullYear(),s.getUTCMonth()+1,1);return i+(e-o)/(r-o)},dateForLevel(e,n){const t=new Date(n);return Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+Math.round(e),1)},format(e){const n=new Date(e);return`${n.toLocaleString("en",{month:"short",timeZone:"UTC"})} ${n.getUTCFullYear()}`}}};function an(e,n){if(e==null||n==null||n<=e)return y.week;const t=(n-e)/w;return t<=31?y.day:t<=240?y.week:y.month}function ln(e){return y[e]??y.week}function cn(e,n){const t=n.map(c=>m(c.due)).filter(c=>c!=null),s=m(e==null?void 0:e.start),i=m(e==null?void 0:e.end),o=[s,...t].filter(c=>c!=null),r=[i,...t].filter(c=>c!=null),a=o.length?Math.min(...o):Date.now(),l=r.length?Math.max(...r):a+30*w;return{start:a,end:Math.max(l,a)}}function dn(e,{bucket:n,start:t,collapse:s=!1}){const i=new Map;for(const u of e){const f=m(u.due);f!=null&&i.set(u.id,Math.floor(n.level(f,t)))}const o=[...i.values()],r=o.length?Math.min(...o):0,a=o.length?Math.max(...o):0,l=[...new Set(o)].sort((u,f)=>u-f),c=s?new Map(l.map((u,f)=>[u,f])):new Map(l.map(u=>[u,u-r])),d=s?Math.max(0,l.length-1):a-r,h=d+2,p=new Map;for(const u of e)p.set(u.id,i.has(u.id)?c.get(i.get(u.id)):h);const g=s?new Map([...c].map(([u,f])=>[f,u-r])):new Map(Array.from({length:d+1},(u,f)=>[f,f])),A=[];return s&&l.forEach((u,f)=>{const C=l[f-1];f>0&&u-C>1&&A.push({afterLevel:f-1,periods:u-C-1})}),{levels:p,trayLevel:h,minLevel:r,lastLevel:d,levelOrigin:g,gaps:A}}function ce(e,n,t=Date.now()){var a,l;const s=((a=e.subtasks)==null?void 0:a.length)??0,i=((l=e.subtasks)==null?void 0:l.filter(c=>c.done).length)??0,o=m(e.due),r=(e.blockedBy??[]).filter(c=>n.has(c)&&!n.get(c).done);return{done:!!e.done,working:!!e.working,total:s,checked:i,ratio:e.done?1:s===0?0:i/s,started:!e.done&&i>0,blocked:!e.done&&r.length>0,blockers:r,overdue:!e.done&&o!=null&&o<t}}const de=e=>new Map(e.map(n=>[n.id,n]));function ue(e){return[...new Set(e.flatMap(n=>n.people??[]))].sort((n,t)=>n.localeCompare(t))}function un(e){return[...new Set(e.flatMap(n=>n.project??[]))].sort((n,t)=>n.localeCompare(t))}function fn(e,n){const t=fe(n,{projectId:(e==null?void 0:e.id)??null}),s=(e==null?void 0:e.people)??[],i=[...new Set([...s,...ue(t)])],o=new Set(s);return i.map(r=>({name:r,inRoster:o.has(r),openTasks:t.filter(a=>!a.done&&(a.people??[]).includes(r)).length})).sort((r,a)=>Number(a.inRoster)-Number(r.inRoster)||r.name.localeCompare(a.name))}function fe(e,{projectId:n=null,people:t=[],hideDone:s=!1}={}){const i=new Set(t);return e.filter(o=>!(n&&!(o.project??[]).includes(n)||i.size>0&&!(o.people??[]).some(r=>i.has(r))||s&&o.done))}function pe(e){const n=new Set(e.map(o=>o.id)),t=new Map;for(const o of e)if(o.goal)for(const r of o.project??[])t.set(r,o.id);if(!t.size)return[];const s=new Set;for(const o of e){for(const r of o.blockedBy??[])n.has(r)&&s.add(r);for(const r of o.partOf??[])n.has(r)&&s.add(o.id)}const i=[];for(const o of e){if(o.goal||s.has(o.id))continue;const r=(o.project??[]).map(a=>t.get(a)).find(Boolean);r&&r!==o.id&&i.push({from:o.id,to:r})}return i}function pn(e,n){const t=new Set(e.map(r=>r.id)),s=new Set(e.filter(r=>r.due).map(r=>r.id)),i=(r,a)=>s.has(r)&&s.has(a)&&((n==null?void 0:n.get(r))??0)>((n==null?void 0:n.get(a))??0),o=[];for(const{from:r,to:a}of pe(e))o.push({id:`goal:${r}->${a}`,from:r,to:a,kind:"goal",conflict:i(r,a)});for(const r of e){for(const a of r.blockedBy??[]){if(!t.has(a))continue;const l=i(a,r.id);o.push({id:`blocks:${a}->${r.id}`,from:a,to:r.id,kind:"blocks",conflict:l})}for(const a of r.partOf??[])t.has(a)&&o.push({id:`part-of:${r.id}->${a}`,from:r.id,to:a,kind:"part-of",conflict:!1})}return o}const he=67324752,ge=33639248,be=101010256,me=(()=>{const e=new Uint32Array(256);for(let n=0;n<256;n+=1){let t=n;for(let s=0;s<8;s+=1)t=t&1?3988292384^t>>>1:t>>>1;e[n]=t>>>0}return e})();function we(e){let n=4294967295;for(let t=0;t<e.length;t+=1)n=me[(n^e[t])&255]^n>>>8;return(n^4294967295)>>>0}function ye(e){const n=Math.max(1980,e.getFullYear());return{time:e.getHours()<<11|e.getMinutes()<<5|Math.floor(e.getSeconds()/2),date:n-1980<<9|e.getMonth()+1<<5|e.getDate()}}class ke{constructor(){this.chunks=[],this.length=0}bytes(n){this.chunks.push(n),this.length+=n.length}u16(n){this.bytes(new Uint8Array([n&255,n>>>8&255]))}u32(n){this.bytes(new Uint8Array([n&255,n>>>8&255,n>>>16&255,n>>>24&255]))}concat(){const n=new Uint8Array(this.length);let t=0;for(const s of this.chunks)n.set(s,t),t+=s.length;return n}}function hn(e,n=new Date){const t=new TextEncoder,{time:s,date:i}=ye(n),o=new ke,r=[];for(const[c,d]of Object.entries(e)){const h=t.encode(c),p=t.encode(d),g=we(p);r.push({nameBytes:h,size:p.length,crc:g,offset:o.length}),o.u32(he),o.u16(20),o.u16(2048),o.u16(0),o.u16(s),o.u16(i),o.u32(g),o.u32(p.length),o.u32(p.length),o.u16(h.length),o.u16(0),o.bytes(h),o.bytes(p)}const a=o.length;for(const c of r)o.u32(ge),o.u16(20),o.u16(20),o.u16(2048),o.u16(0),o.u16(s),o.u16(i),o.u32(c.crc),o.u32(c.size),o.u32(c.size),o.u16(c.nameBytes.length),o.u16(0),o.u16(0),o.u16(0),o.u16(0),o.u32(0),o.u32(c.offset),o.bytes(c.nameBytes);const l=o.length-a;return o.u32(be),o.u16(0),o.u16(0),o.u16(r.length),o.u16(r.length),o.u32(l),o.u32(a),o.u16(0),o.concat()}const k=e=>String(e??"").replace(/\|/g,"\\|").replace(/\n+/g," ").trim(),_e=e=>(e.people??[]).join(", ");function Se(e){return e.done?"done":e.total===0?"—":`${e.checked}/${e.total}`}function $(e,n,{now:t=Date.now()}={}){const s=de(n),i=[];i.push(`# ${(e==null?void 0:e.title)||"Untitled project"}`),e!=null&&e.goal&&i.push("","## Goal",e.goal.trim()),e!=null&&e.context&&i.push("","## Context",e.context.trim());const o=[e==null?void 0:e.start,e==null?void 0:e.end].filter(Boolean);i.push(""),o.length===2&&i.push(`Window: ${e.start} → ${e.end}`),i.push(`Today: ${F(t)}`),i.push("","## Tasks","","| id | task | due | estimate | people | subtasks |"),i.push("|----|------|-----|----------|--------|----------|");const r=[...n].sort((l,c)=>(m(l.due)??1/0)-(m(c.due)??1/0));for(const l of r){const c=ce(l,s,t);i.push(`| ${k(l.id)} | ${k(l.title)} | ${k(l.due)||"—"} | ${k(l.estimate)||"—"} | ${k(_e(l))||"—"} | ${Se(c)} |`)}r.length===0&&i.push("| — | _no tasks yet_ | — | — | — | — |");const a=[];for(const l of r){for(const c of l.blockedBy??[])s.has(c)&&a.push(`- ${l.id} blocked-by ${c}`);for(const c of l.partOf??[])s.has(c)&&a.push(`- ${l.id} part-of ${c}`)}return i.push("","## Dependencies",""),i.push(a.length?a.join(`
`):"_none recorded_"),`${i.join(`
`)}
`}function I(e){var t,s;const n=[`## Task: ${e.title}`,`id: ${e.id}`];if(e.due&&n.push(`due: ${e.due}`),e.estimate&&n.push(`current estimate: ${e.estimate}`),(t=e.people)!=null&&t.length&&n.push(`people: ${e.people.join(", ")}`),e.notes&&n.push("",e.notes.trim()),(s=e.subtasks)!=null&&s.length){n.push("","Existing subtasks:");for(const i of e.subtasks)n.push(`- [${i.done?"x":" "}] ${i.text}`)}else n.push("","Existing subtasks: none");return`${n.join(`
`)}
`}const O=`You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`;function T(e){const n=String(e??"").trim(),t=[],s=/```(?:json)?\s*\n?([\s\S]*?)```/gi;for(let r=s.exec(n);r;r=s.exec(n))t.push(r[1]);const i=n.search(/[[{]/);if(i!==-1){const r=Math.max(n.lastIndexOf("]"),n.lastIndexOf("}"));r>i&&t.push(n.slice(i,r+1))}t.push(n);for(const r of t)try{return JSON.parse(r.trim())}catch{}const o=new Error("Could not read JSON from the model response.");throw o.raw=n,o}function U(e,n){if(Array.isArray(e))return e;if(e&&Array.isArray(e[n]))return e[n];if(e&&typeof e=="object"){const t=Object.values(e).find(Array.isArray);if(t)return t}return[]}const b=e=>typeof e=="string"?e.trim():"",xe={id:"subtasks",title:"Suggest subtasks",messages(e,n,t){return[{role:"system",content:O},{role:"user",content:`${$(e,n)}
${I(t)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`}]},parse(e){return U(T(e),"subtasks").map(n=>typeof n=="string"?n:b((n==null?void 0:n.text)??(n==null?void 0:n.title))).map(n=>n.replace(/^[-*]\s*(\[[ xX]\]\s*)?/,"").trim()).filter(Boolean).map(n=>({kind:"subtask",label:n}))}},ve={id:"missing",title:"Find missing tasks",messages(e,n){return[{role:"system",content:O},{role:"user",content:`${$(e,n)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`}]},parse(e){return U(T(e),"tasks").map(n=>{if(typeof n=="string")return{kind:"task",label:n,task:{title:n}};const t=b((n==null?void 0:n.title)??(n==null?void 0:n.name));if(!t)return null;const s=/^\d{4}-\d{2}-\d{2}$/.test(b(n==null?void 0:n.due))?b(n.due):"",i=(Array.isArray(n==null?void 0:n.blocked_by)?n.blocked_by:[]).map(b).filter(Boolean);return{kind:"task",label:t,detail:b((n==null?void 0:n.why)??(n==null?void 0:n.rationale)),task:{title:t,due:s,estimate:b(n==null?void 0:n.estimate),blockedBy:i}}}).filter(Boolean)}},$e={id:"estimate",title:"Estimate duration",messages(e,n,t){return[{role:"system",content:O},{role:"user",content:`${$(e,n)}
${I(t)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`}]},parse(e){const n=T(e),t=b(typeof n=="string"?n:(n==null?void 0:n.estimate)??(n==null?void 0:n.duration)),s=/(\d+(?:\.\d+)?)\s*([hdw])/i.exec(t);if(!s){const o=new Error(`Model returned an unusable estimate: "${t||"(empty)"}"`);throw o.raw=JSON.stringify(n),o}const i=`${Number(s[1])}${s[2].toLowerCase()}`;return[{kind:"estimate",label:i,detail:b((n==null?void 0:n.why)??(n==null?void 0:n.rationale)),estimate:i}]}},gn={subtasks:xe,missing:ve,estimate:$e};export{v as $,un as A,ue as B,Ze as C,Je as D,F as E,He as F,gn as G,Ve as H,hn as I,$ as J,le as K,sn as L,cn as M,dn as N,de as O,S as P,ce as Q,pn as R,Ke as S,rn as T,ze as U,Qe as V,an as W,ln as X,tn as Y,x as Z,qe as _,Ge as a,V as a0,X as a1,ee as a2,ne as a3,q as a4,J as a5,H as a6,Q as a7,I as a8,pe as a9,oe as aa,se as ab,te as ac,T as ad,we as ae,Pe as b,We as c,Ye as d,Ue as e,Ie as f,je as g,Re as h,on as i,Fe as j,Le as k,Ne as l,Ee as m,De as n,Me as o,Be as p,Ce as q,Ae as r,Te as s,Oe as t,en as u,fn as v,Xe as w,nn as x,m as y,fe as z};
