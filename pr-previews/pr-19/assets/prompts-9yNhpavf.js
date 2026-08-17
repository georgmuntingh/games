const ve=`---
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
`,$e=`---
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
`,Oe=`---
id: analytics-dashboard
title: Analytics dashboard
project: [website]
people: [Oliver]
estimate: 1w
created: 2026-08-09
done: false
---
Wanted, not scheduled. Sits in the unscheduled tray until it earns a deadline.
`,Te=`---
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
`,Ae=`---
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
`,Ce=`---
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
`,Be=`---
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
`,Me=`---
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
`,De=`---
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
`,Ee=`---
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
`,Le=`---
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
`,Ne=`---
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
`,Re=`---
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
`,Fe=`---
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
`,Ie=`---
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
`,je=`---
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
`,Ye=`---
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
`,We=`---
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
`,Ge=`---
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
`,B=["id","title","goal","project","people","due","estimate","created","done","working","blocked-by","part-of","x"],E=new Set(["project","people","blocked-by","part-of"]),j=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;function L(e){const n=e.trim();return n.length>=2&&(n[0]==='"'||n[0]==="'")&&n[n.length-1]===n[0]?n.slice(1,-1):n}function M(e){const n=e.trim();return n===""?"":n==="true"?!0:n==="false"?!1:n==="null"||n==="~"?null:L(n)}function Y(e){const n=e.trim().slice(1,-1).trim();if(n==="")return[];const t=[];let s="",i=null;for(const o of n)i?(o===i&&(i=null),s+=o):o==='"'||o==="'"?(i=o,s+=o):o===","?(t.push(s),s=""):s+=o;return t.push(s),t.map(o=>L(o)).filter(o=>o!=="")}function S(e){const n=String(e).replace(/\r\n/g,`
`);if(!n.startsWith(`---
`))return{data:{},body:n.replace(/^\n+/,"")};const t=n.indexOf(`
---`,3);if(t===-1)return{data:{},body:n};const s=n.slice(4,t+1),i=n.indexOf(`
`,t+1),o=i===-1?"":n.slice(i+1),r={},a=s.split(`
`);let c=null;for(const l of a){if(l.trim()===""||l.trimStart().startsWith("#"))continue;const u=/^\s*-\s+(.*)$/.exec(l);if(u&&c){r[c].push(M(u[1]));continue}const g=/^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(l);if(!g)continue;const[,p,h]=g;c=null,h.trim()===""?(r[p]=[],c=p):h.trim().startsWith("[")&&h.trim().endsWith("]")?r[p]=Y(h):r[p]=M(h)}for(const[l,u]of Object.entries(r))Array.isArray(u)&&u.length===0&&!E.has(l)&&(r[l]="");return{data:r,body:o}}function W(e){const n=String(e);return n===""||/^[#&*!|>%@`?-]/.test(n)||/[:,[\]{}]/.test(n)||n!==n.trim()||["true","false","null","~"].includes(n)}function D(e){return typeof e=="boolean"||typeof e=="number"?String(e):e==null?"":W(e)?`'${String(e).replace(/'/g,"''")}'`:String(e)}function G(e,n){return Array.isArray(n)||E.has(e)?`[${(Array.isArray(n)?n:[n].filter(s=>s!==""&&s!=null)).map(D).join(", ")}]`:D(n)}function x(e,n=""){const s=[...B.filter(o=>o in e),...Object.keys(e).filter(o=>!B.includes(o))].map(o=>`${o}: ${G(o,e[o])}`),i=String(n).replace(/\s+$/,"");return`---
${s.join(`
`)}
---
${i?`${i}
`:""}`}function q(e){const n=[],t=[];for(const s of String(e).split(`
`)){const i=j.exec(s);i?n.push({done:i[1].toLowerCase()==="x",text:i[2].trim()}):t.push(s)}return{notes:t.join(`
`).trim(),subtasks:n}}function J(e,n=[]){const t=n.map(i=>`- [${i.done?"x":" "}] ${i.text}`).join(`
`),s=String(e||"").trim();return s?t?`${s}

${t}`:s:t}const v="_project-",w=864e5,P={æ:"ae",ø:"o",å:"a",ß:"ss",ð:"d",þ:"th",ł:"l",đ:"d"};function z(e){return String(e).toLowerCase().replace(/[æøåßðþłđ]/g,t=>P[t]).normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"task"}function qe(e,n){const t=z(e),s=n instanceof Set?n:new Set(n);if(!s.has(t))return t;for(let i=2;;i+=1){const o=`${t}-${i}`;if(!s.has(o))return o}}function m(e){if(e==null||e==="")return null;const n=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(e).trim());if(!n)return null;const t=Date.UTC(Number(n[1]),Number(n[2])-1,Number(n[3]));return Number.isNaN(t)?null:t}function N(e){return e==null?"":new Date(e).toISOString().slice(0,10)}const H={h:1,d:8,w:40};function K(e){if(e==null||e==="")return null;const n=String(e).trim().toLowerCase(),t=/^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(n);return t?Number(t[1])*H[t[2]]:null}function Je(e){return e.reduce((n,t)=>n+(K(t.estimate)??0),0)}function _(e){return e==null||e===""?[]:(Array.isArray(e)?e:[e]).map(n=>String(n).trim()).filter(Boolean)}function Q(e){if(e==null||e==="")return null;const n=Number(e);return Number.isFinite(n)?n:null}function Z(e,n){const{data:t,body:s}=S(n),{notes:i,subtasks:o}=q(s),r=String(e).replace(/\.md$/i,"");return{id:String(t.id||r),title:String(t.title||r),project:_(t.project),people:_(t.people),due:t.due?String(t.due):"",estimate:t.estimate?String(t.estimate):"",created:t.created?String(t.created):"",done:t.done===!0,goal:t.goal===!0,working:t.working===!0,x:Q(t.x),blockedBy:_(t["blocked-by"]),partOf:_(t["part-of"]),notes:i,subtasks:o,extra:Object.fromEntries(Object.entries(t).filter(([a])=>!["id","title","project","people","due","estimate","created","done","goal","working","x","blocked-by","part-of"].includes(a)))}}function R(e,n=[]){return Object.fromEntries(Object.entries(e).filter(([t,s])=>n.includes(t)?!0:Array.isArray(s)?s.length>0:s!==""&&s!=null))}function V(e){const n=R({id:e.id,title:e.title,project:e.project??[],people:e.people??[],due:e.due??"",estimate:e.estimate??"",created:e.created??"",done:!!e.done,...e.goal?{goal:!0}:{},...e.working?{working:!0}:{},"blocked-by":e.blockedBy??[],"part-of":e.partOf??[],x:e.x??"",...e.extra??{}},["id","title","done"]);return x(n,J(e.notes,e.subtasks))}function X(e,n){const{data:t,body:s}=S(n),i=String(e).replace(/\.md$/i,"").replace(new RegExp(`^${v}`),"");return{id:String(t.id||i),title:String(t.title||i),goal:t.goal?String(t.goal):"",people:_(t.people),start:t.start?String(t.start):"",end:t.end?String(t.end):"",color:t.color?String(t.color):"",context:String(s).trim()}}function ee(e){return x(R({id:e.id,title:e.title,goal:e.goal??"",people:e.people??[],start:e.start??"",end:e.end??"",color:e.color??""},["id","title"]),e.context??"")}const F="_trash.md",ne=50;function te(e){const{body:n}=S(e),t=/```json\s*\n([\s\S]*?)```/.exec(String(n));if(!t)return[];try{const s=JSON.parse(t[1]);return Array.isArray(s)?s:[]}catch{return[]}}function oe(e){const n=["```json",JSON.stringify(e??[],null,2),"```"].join(`
`);return x({id:"_trash"},n)}function Pe(e,n){return[n,...e??[]].slice(0,ne)}const se=e=>`${e.id}.md`,re=e=>`${v}${e.id}.md`;function ze(e){const n=[],t=[];let s=[];for(const[i,o]of Object.entries(e)){if(!/\.md$/i.test(i))continue;const r=i.split("/").pop();r===F?s=te(o):r.startsWith(v)?t.push(X(r,o)):n.push(Z(r,o))}return n.sort((i,o)=>i.id.localeCompare(o.id)),t.sort((i,o)=>i.id.localeCompare(o.id)),{tasks:n,projects:t,trash:s}}function He({tasks:e,projects:n,trash:t}){const s={};for(const i of n)s[re(i)]=ee(i);for(const i of e)s[se(i)]=V(i);return t!=null&&t.length&&(s[F]=oe(t)),s}const ie=e=>`${e}-goal`;function Ke({tasks:e,projects:n},t=Date.now()){const s=new Map(n.filter(r=>{var a;return(a=r.goal)==null?void 0:a.trim()}).map(r=>[ie(r.id),r])),i=[];let o=[];for(const r of e){if(!r.goal){o.push(r);continue}const a=s.get(r.id);if(!a){i.push(r);continue}s.delete(r.id);const c=a.goal.trim(),l=a.end??"";o.push(r.title===c&&r.due===l?r:{...r,title:c,due:l})}for(const[r,a]of s)o.push({id:r,title:a.goal.trim(),project:[a.id],people:[],due:a.end??"",estimate:"",created:N(t),done:!1,goal:!0,working:!1,x:null,blockedBy:[],partOf:[],notes:"",subtasks:[],extra:{}});return o.sort((r,a)=>r.id.localeCompare(a.id)),{tasks:o,removed:i}}function Qe(e,n,t){const s=e.find(c=>c.id===n),i=e.find(c=>c.id===t);if(!s||!i||n===t||s.goal||i.goal)return null;const o=[{done:!!s.done,text:s.title},...s.subtasks??[]],r=(c,l)=>[...new Set((c??[]).map(u=>u===n?t:u))].filter(u=>u!==l);return{tasks:e.filter(c=>c.id!==n).map(c=>{const l=c.id===t?{...c,subtasks:[...c.subtasks??[],...o]}:c;return{...l,blockedBy:r(l.blockedBy,l.id),partOf:r(l.partOf,l.id)}}),merged:s}}function Ze(e){const n=String(e??"").split(/[\s._-]+/).map(t=>t.replace(/[^\p{L}\p{N}]/gu,"")).filter(Boolean);return n.length?n.slice(0,2).map(t=>t[0].toUpperCase()).join(""):"?"}function Ve(e,n){return e.map(t=>{const s=n!=null&&t.id===n;return!!t.working===s?t:{...t,working:s}})}function Xe(e,n,t){const s=new Set([n]);for(let i=!0;i;){i=!1;for(const o of e)s.has(o.id)||(o[t]??[]).some(r=>s.has(r))&&(s.add(o.id),i=!0)}return s}const y={day:{unit:"day",label:"Days",level(e,n){return(e-n)/w},dateForLevel(e,n){return n+e*w},format(e){return new Date(e).toISOString().slice(5,10).replace("-","/")}},week:{unit:"week",label:"Weeks",level(e,n){return(e-n)/(7*w)},dateForLevel(e,n){return n+e*7*w},format(e){return`${new Date(e).toISOString().slice(5,10).replace("-","/")}`}},month:{unit:"month",label:"Months",level(e,n){const t=new Date(n),s=new Date(e),i=(s.getUTCFullYear()-t.getUTCFullYear())*12+(s.getUTCMonth()-t.getUTCMonth()),o=Date.UTC(s.getUTCFullYear(),s.getUTCMonth(),1),r=Date.UTC(s.getUTCFullYear(),s.getUTCMonth()+1,1);return i+(e-o)/(r-o)},dateForLevel(e,n){const t=new Date(n);return Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+Math.round(e),1)},format(e){const n=new Date(e);return`${n.toLocaleString("en",{month:"short",timeZone:"UTC"})} ${n.getUTCFullYear()}`}}};function en(e,n){if(e==null||n==null||n<=e)return y.week;const t=(n-e)/w;return t<=31?y.day:t<=240?y.week:y.month}function nn(e){return y[e]??y.week}function tn(e,n){const t=n.map(l=>m(l.due)).filter(l=>l!=null),s=m(e==null?void 0:e.start),i=m(e==null?void 0:e.end),o=[s,...t].filter(l=>l!=null),r=[i,...t].filter(l=>l!=null),a=o.length?Math.min(...o):Date.now(),c=r.length?Math.max(...r):a+30*w;return{start:a,end:Math.max(c,a)}}function on(e,{bucket:n,start:t,collapse:s=!1}){const i=new Map;for(const d of e){const f=m(d.due);f!=null&&i.set(d.id,Math.floor(n.level(f,t)))}const o=[...i.values()],r=o.length?Math.min(...o):0,a=o.length?Math.max(...o):0,c=[...new Set(o)].sort((d,f)=>d-f),l=s?new Map(c.map((d,f)=>[d,f])):new Map(c.map(d=>[d,d-r])),u=s?Math.max(0,c.length-1):a-r,g=u+2,p=new Map;for(const d of e)p.set(d.id,i.has(d.id)?l.get(i.get(d.id)):g);const h=s?new Map([...l].map(([d,f])=>[f,d-r])):new Map(Array.from({length:u+1},(d,f)=>[f,f])),A=[];return s&&c.forEach((d,f)=>{const C=c[f-1];f>0&&d-C>1&&A.push({afterLevel:f-1,periods:d-C-1})}),{levels:p,trayLevel:g,minLevel:r,lastLevel:u,levelOrigin:h,gaps:A}}function ae(e,n,t=Date.now()){var a,c;const s=((a=e.subtasks)==null?void 0:a.length)??0,i=((c=e.subtasks)==null?void 0:c.filter(l=>l.done).length)??0,o=m(e.due),r=(e.blockedBy??[]).filter(l=>n.has(l)&&!n.get(l).done);return{done:!!e.done,working:!!e.working,total:s,checked:i,ratio:e.done?1:s===0?0:i/s,started:!e.done&&i>0,blocked:!e.done&&r.length>0,blockers:r,overdue:!e.done&&o!=null&&o<t}}const le=e=>new Map(e.map(n=>[n.id,n]));function ce(e){return[...new Set(e.flatMap(n=>n.people??[]))].sort((n,t)=>n.localeCompare(t))}function sn(e){return[...new Set(e.flatMap(n=>n.project??[]))].sort((n,t)=>n.localeCompare(t))}function rn(e,n){const t=de(n,{projectId:(e==null?void 0:e.id)??null}),s=(e==null?void 0:e.people)??[],i=[...new Set([...s,...ce(t)])],o=new Set(s);return i.map(r=>({name:r,inRoster:o.has(r),openTasks:t.filter(a=>!a.done&&(a.people??[]).includes(r)).length})).sort((r,a)=>Number(a.inRoster)-Number(r.inRoster)||r.name.localeCompare(a.name))}function de(e,{projectId:n=null,people:t=[],hideDone:s=!1}={}){const i=new Set(t);return e.filter(o=>!(n&&!(o.project??[]).includes(n)||i.size>0&&!(o.people??[]).some(r=>i.has(r))||s&&o.done))}function ue(e){const n=new Set(e.map(o=>o.id)),t=new Map;for(const o of e)if(o.goal)for(const r of o.project??[])t.set(r,o.id);if(!t.size)return[];const s=new Set;for(const o of e){for(const r of o.blockedBy??[])n.has(r)&&s.add(r);for(const r of o.partOf??[])n.has(r)&&s.add(o.id)}const i=[];for(const o of e){if(o.goal||s.has(o.id))continue;const r=(o.project??[]).map(a=>t.get(a)).find(Boolean);r&&r!==o.id&&i.push({from:o.id,to:r})}return i}function an(e,n){const t=new Set(e.map(r=>r.id)),s=new Set(e.filter(r=>r.due).map(r=>r.id)),i=(r,a)=>s.has(r)&&s.has(a)&&((n==null?void 0:n.get(r))??0)>((n==null?void 0:n.get(a))??0),o=[];for(const{from:r,to:a}of ue(e))o.push({id:`goal:${r}->${a}`,from:r,to:a,kind:"goal",conflict:i(r,a)});for(const r of e){for(const a of r.blockedBy??[]){if(!t.has(a))continue;const c=i(a,r.id);o.push({id:`blocks:${a}->${r.id}`,from:a,to:r.id,kind:"blocks",conflict:c})}for(const a of r.partOf??[])t.has(a)&&o.push({id:`part-of:${r.id}->${a}`,from:r.id,to:a,kind:"part-of",conflict:!1})}return o}const fe=67324752,pe=33639248,he=101010256,ge=(()=>{const e=new Uint32Array(256);for(let n=0;n<256;n+=1){let t=n;for(let s=0;s<8;s+=1)t=t&1?3988292384^t>>>1:t>>>1;e[n]=t>>>0}return e})();function be(e){let n=4294967295;for(let t=0;t<e.length;t+=1)n=ge[(n^e[t])&255]^n>>>8;return(n^4294967295)>>>0}function me(e){const n=Math.max(1980,e.getFullYear());return{time:e.getHours()<<11|e.getMinutes()<<5|Math.floor(e.getSeconds()/2),date:n-1980<<9|e.getMonth()+1<<5|e.getDate()}}class we{constructor(){this.chunks=[],this.length=0}bytes(n){this.chunks.push(n),this.length+=n.length}u16(n){this.bytes(new Uint8Array([n&255,n>>>8&255]))}u32(n){this.bytes(new Uint8Array([n&255,n>>>8&255,n>>>16&255,n>>>24&255]))}concat(){const n=new Uint8Array(this.length);let t=0;for(const s of this.chunks)n.set(s,t),t+=s.length;return n}}function ln(e,n=new Date){const t=new TextEncoder,{time:s,date:i}=me(n),o=new we,r=[];for(const[l,u]of Object.entries(e)){const g=t.encode(l),p=t.encode(u),h=be(p);r.push({nameBytes:g,size:p.length,crc:h,offset:o.length}),o.u32(fe),o.u16(20),o.u16(2048),o.u16(0),o.u16(s),o.u16(i),o.u32(h),o.u32(p.length),o.u32(p.length),o.u16(g.length),o.u16(0),o.bytes(g),o.bytes(p)}const a=o.length;for(const l of r)o.u32(pe),o.u16(20),o.u16(20),o.u16(2048),o.u16(0),o.u16(s),o.u16(i),o.u32(l.crc),o.u32(l.size),o.u32(l.size),o.u16(l.nameBytes.length),o.u16(0),o.u16(0),o.u16(0),o.u16(0),o.u32(0),o.u32(l.offset),o.bytes(l.nameBytes);const c=o.length-a;return o.u32(he),o.u16(0),o.u16(0),o.u16(r.length),o.u16(r.length),o.u32(c),o.u32(a),o.u16(0),o.concat()}const k=e=>String(e??"").replace(/\|/g,"\\|").replace(/\n+/g," ").trim(),ye=e=>(e.people??[]).join(", ");function ke(e){return e.done?"done":e.total===0?"—":`${e.checked}/${e.total}`}function $(e,n,{now:t=Date.now()}={}){const s=le(n),i=[];i.push(`# ${(e==null?void 0:e.title)||"Untitled project"}`),e!=null&&e.goal&&i.push("","## Goal",e.goal.trim()),e!=null&&e.context&&i.push("","## Context",e.context.trim());const o=[e==null?void 0:e.start,e==null?void 0:e.end].filter(Boolean);i.push(""),o.length===2&&i.push(`Window: ${e.start} → ${e.end}`),i.push(`Today: ${N(t)}`),i.push("","## Tasks","","| id | task | due | estimate | people | subtasks |"),i.push("|----|------|-----|----------|--------|----------|");const r=[...n].sort((c,l)=>(m(c.due)??1/0)-(m(l.due)??1/0));for(const c of r){const l=ae(c,s,t);i.push(`| ${k(c.id)} | ${k(c.title)} | ${k(c.due)||"—"} | ${k(c.estimate)||"—"} | ${k(ye(c))||"—"} | ${ke(l)} |`)}r.length===0&&i.push("| — | _no tasks yet_ | — | — | — | — |");const a=[];for(const c of r){for(const l of c.blockedBy??[])s.has(l)&&a.push(`- ${c.id} blocked-by ${l}`);for(const l of c.partOf??[])s.has(l)&&a.push(`- ${c.id} part-of ${l}`)}return i.push("","## Dependencies",""),i.push(a.length?a.join(`
`):"_none recorded_"),`${i.join(`
`)}
`}function U(e){var t,s;const n=[`## Task: ${e.title}`,`id: ${e.id}`];if(e.due&&n.push(`due: ${e.due}`),e.estimate&&n.push(`current estimate: ${e.estimate}`),(t=e.people)!=null&&t.length&&n.push(`people: ${e.people.join(", ")}`),e.notes&&n.push("",e.notes.trim()),(s=e.subtasks)!=null&&s.length){n.push("","Existing subtasks:");for(const i of e.subtasks)n.push(`- [${i.done?"x":" "}] ${i.text}`)}else n.push("","Existing subtasks: none");return`${n.join(`
`)}
`}const O=`You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`;function T(e){const n=String(e??"").trim(),t=[],s=/```(?:json)?\s*\n?([\s\S]*?)```/gi;for(let r=s.exec(n);r;r=s.exec(n))t.push(r[1]);const i=n.search(/[[{]/);if(i!==-1){const r=Math.max(n.lastIndexOf("]"),n.lastIndexOf("}"));r>i&&t.push(n.slice(i,r+1))}t.push(n);for(const r of t)try{return JSON.parse(r.trim())}catch{}const o=new Error("Could not read JSON from the model response.");throw o.raw=n,o}function I(e,n){if(Array.isArray(e))return e;if(e&&Array.isArray(e[n]))return e[n];if(e&&typeof e=="object"){const t=Object.values(e).find(Array.isArray);if(t)return t}return[]}const b=e=>typeof e=="string"?e.trim():"",_e={id:"subtasks",title:"Suggest subtasks",messages(e,n,t){return[{role:"system",content:O},{role:"user",content:`${$(e,n)}
${U(t)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`}]},parse(e){return I(T(e),"subtasks").map(n=>typeof n=="string"?n:b((n==null?void 0:n.text)??(n==null?void 0:n.title))).map(n=>n.replace(/^[-*]\s*(\[[ xX]\]\s*)?/,"").trim()).filter(Boolean).map(n=>({kind:"subtask",label:n}))}},Se={id:"missing",title:"Find missing tasks",messages(e,n){return[{role:"system",content:O},{role:"user",content:`${$(e,n)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`}]},parse(e){return I(T(e),"tasks").map(n=>{if(typeof n=="string")return{kind:"task",label:n,task:{title:n}};const t=b((n==null?void 0:n.title)??(n==null?void 0:n.name));if(!t)return null;const s=/^\d{4}-\d{2}-\d{2}$/.test(b(n==null?void 0:n.due))?b(n.due):"",i=(Array.isArray(n==null?void 0:n.blocked_by)?n.blocked_by:[]).map(b).filter(Boolean);return{kind:"task",label:t,detail:b((n==null?void 0:n.why)??(n==null?void 0:n.rationale)),task:{title:t,due:s,estimate:b(n==null?void 0:n.estimate),blockedBy:i}}}).filter(Boolean)}},xe={id:"estimate",title:"Estimate duration",messages(e,n,t){return[{role:"system",content:O},{role:"user",content:`${$(e,n)}
${U(t)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`}]},parse(e){const n=T(e),t=b(typeof n=="string"?n:(n==null?void 0:n.estimate)??(n==null?void 0:n.duration)),s=/(\d+(?:\.\d+)?)\s*([hdw])/i.exec(t);if(!s){const o=new Error(`Model returned an unusable estimate: "${t||"(empty)"}"`);throw o.raw=JSON.stringify(n),o}const i=`${Number(s[1])}${s[2].toLowerCase()}`;return[{kind:"estimate",label:i,detail:b((n==null?void 0:n.why)??(n==null?void 0:n.rationale)),estimate:i}]}},cn={subtasks:_e,missing:Se,estimate:xe};export{q as $,sn as A,ce as B,Pe as C,qe as D,N as E,cn as F,ln as G,$ as H,ie as I,Ve as J,tn as K,on as L,le as M,ae as N,an as O,Xe as P,Je as Q,en as R,nn as S,Qe as T,S as U,x as V,Z as W,V as X,X as Y,ee as Z,Ge as _,We as a,J as a0,z as a1,K as a2,U as a3,ue as a4,te as a5,oe as a6,ne as a7,T as a8,be as a9,Ye as b,je as c,Ie as d,Ue as e,Fe as f,Re as g,Ne as h,Ze as i,Le as j,Ee as k,De as l,Me as m,Be as n,Ce as o,Ae as p,Te as q,Oe as r,$e as s,ve as t,He as u,rn as v,ze as w,Ke as x,m as y,de as z};
