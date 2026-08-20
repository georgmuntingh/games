const yn=`---
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
`,kn=`---
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
`,Sn=`---
id: analytics-dashboard
title: Analytics dashboard
project: [website]
people: [Oliver]
estimate: 1w
created: 2026-08-09
done: false
---
Wanted, not scheduled. Sits in the unscheduled tray until it earns a deadline.
`,_n=`---
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
`,xn=`---
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
`,vn=`---
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
`,On=`---
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
`,$n=`---
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
`,Tn=`---
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
`,En=`---
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
`,An=`---
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
`,Cn=`---
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
`,Dn=`---
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
`,Rn=`---
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
`,Nn=`---
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
`,In=`---
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
`,Mn=`---
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
`,jn=`---
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
`,Bn=`---
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
`,Fn=`---
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
`,le=["id","title","goal","starred","archived","project","people","due","estimate","created","done","working","blocked-by","part-of","x"],Se=new Set(["project","people","blocked-by","part-of"]),at=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;function _e(e){const t=e.trim();return t.length>=2&&(t[0]==='"'||t[0]==="'")&&t[t.length-1]===t[0]?t.slice(1,-1):t}function ue(e){const t=e.trim();return t===""?"":t==="true"?!0:t==="false"?!1:t==="null"||t==="~"?null:_e(t)}function ct(e){const t=e.trim().slice(1,-1).trim();if(t==="")return[];const n=[];let r="",i=null;for(const o of t)i?(o===i&&(i=null),r+=o):o==='"'||o==="'"?(i=o,r+=o):o===","?(n.push(r),r=""):r+=o;return n.push(r),n.map(o=>_e(o)).filter(o=>o!=="")}function q(e){const t=String(e).replace(/\r\n/g,`
`);if(!t.startsWith(`---
`))return{data:{},body:t.replace(/^\n+/,"")};const n=t.indexOf(`
---`,3);if(n===-1)return{data:{},body:t};const r=t.slice(4,n+1),i=t.indexOf(`
`,n+1),o=i===-1?"":t.slice(i+1),s={},a=r.split(`
`);let c=null;for(const l of a){if(l.trim()===""||l.trimStart().startsWith("#"))continue;const u=/^\s*-\s+(.*)$/.exec(l);if(u&&c){s[c].push(ue(u[1]));continue}const w=/^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(l);if(!w)continue;const[,h,S]=w;c=null,S.trim()===""?(s[h]=[],c=h):S.trim().startsWith("[")&&S.trim().endsWith("]")?s[h]=ct(S):s[h]=ue(S)}for(const[l,u]of Object.entries(s))Array.isArray(u)&&u.length===0&&!Se.has(l)&&(s[l]="");return{data:s,body:o}}function lt(e){const t=String(e);return t===""||/^[#&*!|>%@`?-]/.test(t)||/[:,[\]{}]/.test(t)||t!==t.trim()||["true","false","null","~"].includes(t)}function de(e){return typeof e=="boolean"||typeof e=="number"?String(e):e==null?"":lt(e)?`'${String(e).replace(/'/g,"''")}'`:String(e)}function ut(e,t){return Array.isArray(t)||Se.has(e)?`[${(Array.isArray(t)?t:[t].filter(r=>r!==""&&r!=null)).map(de).join(", ")}]`:de(t)}function J(e,t=""){const r=[...le.filter(o=>o in e),...Object.keys(e).filter(o=>!le.includes(o))].map(o=>`${o}: ${ut(o,e[o])}`),i=String(t).replace(/\s+$/,"");return`---
${r.join(`
`)}
---
${i?`${i}
`:""}`}function dt(e){const t=[],n=[];for(const r of String(e).split(`
`)){const i=at.exec(r);i?t.push({done:i[1].toLowerCase()==="x",text:i[2].trim()}):n.push(r)}return{notes:n.join(`
`).trim(),subtasks:t}}function ft(e,t=[]){const n=t.map(i=>`- [${i.done?"x":" "}] ${i.text}`).join(`
`),r=String(e||"").trim();return r?n?`${r}

${n}`:r:n}const D="_project-",E=864e5,pt={æ:"ae",ø:"o",å:"a",ß:"ss",ð:"d",þ:"th",ł:"l",đ:"d"};function ht(e){return String(e).toLowerCase().replace(/[æøåßðþłđ]/g,n=>pt[n]).normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"task"}function Ln(e,t){const n=ht(e),r=t instanceof Set?t:new Set(t);if(!r.has(n))return n;for(let i=2;;i+=1){const o=`${n}-${i}`;if(!r.has(o))return o}}function T(e){if(e==null||e==="")return null;const t=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(e).trim());if(!t)return null;const n=Date.UTC(Number(t[1]),Number(t[2])-1,Number(t[3]));return Number.isNaN(n)?null:n}function xe(e){return e==null?"":new Date(e).toISOString().slice(0,10)}const gt={h:1,d:8,w:40};function mt(e){if(e==null||e==="")return null;const t=String(e).trim().toLowerCase(),n=/^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(t);return n?Number(n[1])*gt[n[2]]:null}function wt(e){return e.reduce((t,n)=>t+(mt(n.estimate)??0),0)}function I(e){return e==null||e===""?[]:(Array.isArray(e)?e:[e]).map(t=>String(t).trim()).filter(Boolean)}function bt(e){if(e==null||e==="")return null;const t=Number(e);return Number.isFinite(t)?t:null}function K(e,t){const{data:n,body:r}=q(t),{notes:i,subtasks:o}=dt(r),s=String(e).replace(/\.md$/i,"");return{id:String(n.id||s),title:String(n.title||s),project:I(n.project),people:I(n.people),due:n.due?String(n.due):"",estimate:n.estimate?String(n.estimate):"",created:n.created?String(n.created):"",done:n.done===!0,goal:n.goal===!0,working:n.working===!0,x:bt(n.x),blockedBy:I(n["blocked-by"]),partOf:I(n["part-of"]),notes:i,subtasks:o,extra:Object.fromEntries(Object.entries(n).filter(([a])=>!["id","title","project","people","due","estimate","created","done","goal","working","x","blocked-by","part-of"].includes(a)))}}function ve(e,t=[]){return Object.fromEntries(Object.entries(e).filter(([n,r])=>t.includes(n)?!0:Array.isArray(r)?r.length>0:r!==""&&r!=null))}function Oe(e){const t=ve({id:e.id,title:e.title,project:e.project??[],people:e.people??[],due:e.due??"",estimate:e.estimate??"",created:e.created??"",done:!!e.done,...e.goal?{goal:!0}:{},...e.working?{working:!0}:{},"blocked-by":e.blockedBy??[],"part-of":e.partOf??[],x:e.x??"",...e.extra??{}},["id","title","done"]);return J(t,ft(e.notes,e.subtasks))}function H(e,t){const{data:n,body:r}=q(t),i=String(e),o=i.lastIndexOf("/"),s=i.slice(o+1).replace(/\.md$/i,"").replace(new RegExp(`^${D}`),"");return{id:String(n.id||s),title:String(n.title||s),goal:n.goal?String(n.goal):"",people:I(n.people),start:n.start?String(n.start):"",end:n.end?String(n.end):"",starred:n.starred===!0,archived:n.archived===!0,color:n.color?String(n.color):"",folder:o===-1?"":i.slice(0,o),context:String(r).trim()}}function $e(e){return J(ve({id:e.id,title:e.title,goal:e.goal??"",...e.starred?{starred:!0}:{},...e.archived?{archived:!0}:{},people:e.people??[],start:e.start??"",end:e.end??"",color:e.color??""},["id","title"]),e.context??"")}const F="_trash.md",yt=50;function Te(e){const{body:t}=q(e),n=/```json\s*\n([\s\S]*?)```/.exec(String(t));if(!n)return[];try{const r=JSON.parse(n[1]);return Array.isArray(r)?r:[]}catch{return[]}}function Ee(e){const t=["```json",JSON.stringify(e??[],null,2),"```"].join(`
`);return J({id:"_trash"},t)}function Pn(e){return[...e??[]].sort((t,n)=>+!!n.starred-+!!t.starred||t.id.localeCompare(n.id))}function kt(e,t=!1){return t?[...e??[]]:(e??[]).filter(n=>!n.archived)}function Un(e,t,{deleteTasks:n=!1}={}){const r=(e.projects??[]).find(u=>u.id===t);if(!r)return null;const i=u=>u.project??[],o=u=>i(u).filter(w=>w!==t),s=u=>i(u).includes(t),a=u=>s(u)&&o(u).length===0,c=n?e.tasks.filter(u=>!u.goal&&a(u)):[],l=new Set([...c.map(u=>u.id),...e.tasks.filter(u=>u.goal&&s(u)).map(u=>u.id)]);return{project:r,removed:c,untagged:e.tasks.filter(u=>!u.goal&&s(u)&&!l.has(u.id)).map(u=>u.id),projects:(e.projects??[]).filter(u=>u.id!==t),tasks:e.tasks.filter(u=>!l.has(u.id)).map(u=>s(u)?{...u,project:o(u)}:u)}}function Yn(e,t){return[t,...e??[]].slice(0,yt)}const St=e=>`${e.id}.md`,_t=e=>`${D}${e.id}.md`,fe=(e,t)=>e?`${e}/${t}`:t;function xt(e,t){var n;return t.get((n=e.project)==null?void 0:n[0])??""}function Wn(e){const t=new Set,n=new Set,r=[];for(const[i,o]of Object.entries(e)){const s=i.slice(i.lastIndexOf("/")+1);if(!/\.md$/i.test(s)||s===F)continue;const a=s.startsWith(D),c=a?H(i,o).id:K(s,o).id,l=`${a?"project":"task"}:${c}`;if(t.has(l)){n.add(c),r.push(i);continue}t.add(l)}return{ids:[...n],paths:r}}function Gn(e){const t=[],n=[];let r=[];const i=new Set,o=new Set;for(const[s,a]of Object.entries(e)){if(!/\.md$/i.test(s))continue;const c=s.slice(s.lastIndexOf("/")+1);if(c===F)r=Te(a);else if(c.startsWith(D)){const l=H(s,a);if(i.has(l.id))continue;i.add(l.id),n.push(l)}else{const l=K(c,a);if(o.has(l.id))continue;o.add(l.id),t.push(l)}}return t.sort((s,a)=>s.id.localeCompare(a.id)),n.sort((s,a)=>s.id.localeCompare(a.id)),{tasks:t,projects:n,trash:r}}function zn({tasks:e,projects:t,trash:n}){const r={},i=new Map((t??[]).map(o=>[o.id,o.folder??""]));for(const o of t)r[fe(o.folder,_t(o))]=$e(o);for(const o of e)r[fe(xt(o,i),St(o))]=Oe(o);return n!=null&&n.length&&(r[F]=Ee(n)),r}function pe(e,t){const n=String(e).slice(String(e).lastIndexOf("/")+1);return n===F?Ee(Te(t)):n.startsWith(D)?$e(H(e,t)):Oe(K(n,t))}function qn(e,t,n){if(t===n)return!0;try{return pe(e,t)===pe(e,n)}catch{return!1}}const vt=e=>`${e}-goal`;function Jn({tasks:e,projects:t},n=Date.now()){const r=new Map(t.filter(s=>{var a;return(a=s.goal)==null?void 0:a.trim()}).map(s=>[vt(s.id),s])),i=[];let o=[];for(const s of e){if(!s.goal){o.push(s);continue}const a=r.get(s.id);if(!a){i.push(s);continue}r.delete(s.id);const c=a.goal.trim(),l=a.end??"";o.push(s.title===c&&s.due===l?s:{...s,title:c,due:l})}for(const[s,a]of r)o.push({id:s,title:a.goal.trim(),project:[a.id],people:[],due:a.end??"",estimate:"",created:xe(n),done:!1,goal:!0,working:!1,x:null,blockedBy:[],partOf:[],notes:"",subtasks:[],extra:{}});return o.sort((s,a)=>s.id.localeCompare(a.id)),{tasks:o,removed:i}}function Kn(e,t,n){const r=e.find(c=>c.id===t),i=e.find(c=>c.id===n);if(!r||!i||t===n||r.goal||i.goal)return null;const o=[{done:!!r.done,text:r.title},...r.subtasks??[]],s=(c,l)=>[...new Set((c??[]).map(u=>u===t?n:u))].filter(u=>u!==l);return{tasks:e.filter(c=>c.id!==t).map(c=>{const l=c.id===n?{...c,subtasks:[...c.subtasks??[],...o]}:c;return{...l,blockedBy:s(l.blockedBy,l.id),partOf:s(l.partOf,l.id)}}),merged:r}}function Hn(e){const t=String(e??"").split(/[\s._-]+/).map(n=>n.replace(/[^\p{L}\p{N}]/gu,"")).filter(Boolean);return t.length?t.slice(0,2).map(n=>n[0].toUpperCase()).join(""):"?"}function Vn(e,t){return e.map(n=>{const r=t!=null&&n.id===t;return!!n.working===r?n:{...n,working:r}})}function Xn(e,t,n){const r=new Set([t]);for(let i=!0;i;){i=!1;for(const o of e)r.has(o.id)||(o[n]??[]).some(s=>r.has(s))&&(r.add(o.id),i=!0)}return r}const A={day:{unit:"day",label:"Days",level(e,t){return(e-t)/E},dateForLevel(e,t){return t+e*E},format(e){return new Date(e).toISOString().slice(5,10).replace("-","/")}},week:{unit:"week",label:"Weeks",level(e,t){return(e-t)/(7*E)},dateForLevel(e,t){return t+e*7*E},format(e){return`${new Date(e).toISOString().slice(5,10).replace("-","/")}`}},month:{unit:"month",label:"Months",level(e,t){const n=new Date(t),r=new Date(e),i=(r.getUTCFullYear()-n.getUTCFullYear())*12+(r.getUTCMonth()-n.getUTCMonth()),o=Date.UTC(r.getUTCFullYear(),r.getUTCMonth(),1),s=Date.UTC(r.getUTCFullYear(),r.getUTCMonth()+1,1);return i+(e-o)/(s-o)},dateForLevel(e,t){const n=new Date(t);return Date.UTC(n.getUTCFullYear(),n.getUTCMonth()+Math.round(e),1)},format(e){const t=new Date(e);return`${t.toLocaleString("en",{month:"short",timeZone:"UTC"})} ${t.getUTCFullYear()}`}}};function Zn(e,t){if(e==null||t==null||t<=e)return A.week;const n=(t-e)/E;return n<=31?A.day:n<=240?A.week:A.month}function Qn(e){return A[e]??A.week}function eo(e,t){const n=t.map(l=>T(l.due)).filter(l=>l!=null),r=T(e==null?void 0:e.start),i=T(e==null?void 0:e.end),o=[r,...n].filter(l=>l!=null),s=[i,...n].filter(l=>l!=null),a=o.length?Math.min(...o):Date.now(),c=s.length?Math.max(...s):a+30*E;return{start:a,end:Math.max(c,a)}}function to(e,{bucket:t,start:n,collapse:r=!1}){const i=new Map;for(const b of e){const k=T(b.due);k!=null&&i.set(b.id,Math.floor(t.level(k,n)))}const o=[...i.values()],s=o.length?Math.min(...o):0,a=o.length?Math.max(...o):0,c=[...new Set(o)].sort((b,k)=>b-k),l=r?new Map(c.map((b,k)=>[b,k])):new Map(c.map(b=>[b,b-s])),u=r?Math.max(0,c.length-1):a-s,w=u+2,h=new Map;for(const b of e)h.set(b.id,i.has(b.id)?l.get(i.get(b.id)):w);const S=r?new Map([...l].map(([b,k])=>[k,b-s])):new Map(Array.from({length:u+1},(b,k)=>[k,k])),O=[];return r&&c.forEach((b,k)=>{const R=c[k-1];k>0&&b-R>1&&O.push({afterLevel:k-1,periods:b-R-1})}),{levels:h,trayLevel:w,minLevel:s,lastLevel:u,levelOrigin:S,gaps:O}}function Ot(e,t,n=Date.now()){var a,c;const r=((a=e.subtasks)==null?void 0:a.length)??0,i=((c=e.subtasks)==null?void 0:c.filter(l=>l.done).length)??0,o=T(e.due),s=(e.blockedBy??[]).filter(l=>t.has(l)&&!t.get(l).done);return{done:!!e.done,working:!!e.working,total:r,checked:i,ratio:e.done?1:r===0?0:i/r,started:!e.done&&i>0,blocked:!e.done&&s.length>0,blockers:s,overdue:!e.done&&o!=null&&o<n}}const Ae=e=>new Map(e.map(t=>[t.id,t]));function $t(e){return[...new Set(e.flatMap(t=>t.people??[]))].sort((t,n)=>t.localeCompare(n))}function no(e){return[...new Set(e.flatMap(t=>t.project??[]))].sort((t,n)=>t.localeCompare(n))}function Tt(e,t){const n=Ce(t,{projectId:(e==null?void 0:e.id)??null}),r=(e==null?void 0:e.people)??[],i=[...new Set([...r,...$t(n)])],o=new Set(r);return i.map(s=>({name:s,inRoster:o.has(s),openTasks:n.filter(a=>!a.done&&(a.people??[]).includes(s)).length})).sort((s,a)=>Number(a.inRoster)-Number(s.inRoster)||s.name.localeCompare(a.name))}function Ce(e,{projectId:t=null,people:n=[],hideDone:r=!1}={}){const i=new Set(n);return e.filter(o=>!(t&&!(o.project??[]).includes(t)||i.size>0&&!(o.people??[]).some(s=>i.has(s))||r&&o.done))}function Et(e){const t=new Set(e.map(o=>o.id)),n=new Map;for(const o of e)if(o.goal)for(const s of o.project??[])n.set(s,o.id);if(!n.size)return[];const r=new Set;for(const o of e){for(const s of o.blockedBy??[])t.has(s)&&r.add(s);for(const s of o.partOf??[])t.has(s)&&r.add(o.id)}const i=[];for(const o of e){if(o.goal||r.has(o.id))continue;const s=(o.project??[]).map(a=>n.get(a)).find(Boolean);s&&s!==o.id&&i.push({from:o.id,to:s})}return i}function oo(e,t){const n=new Set(e.map(s=>s.id)),r=new Set(e.filter(s=>s.due).map(s=>s.id)),i=(s,a)=>r.has(s)&&r.has(a)&&((t==null?void 0:t.get(s))??0)>((t==null?void 0:t.get(a))??0),o=[];for(const{from:s,to:a}of Et(e))o.push({id:`goal:${s}->${a}`,from:s,to:a,kind:"goal",conflict:i(s,a)});for(const s of e){for(const a of s.blockedBy??[]){if(!n.has(a))continue;const c=i(a,s.id);o.push({id:`blocks:${a}->${s.id}`,from:a,to:s.id,kind:"blocks",conflict:c})}for(const a of s.partOf??[])n.has(a)&&o.push({id:`part-of:${s.id}->${a}`,from:s.id,to:a,kind:"part-of",conflict:!1})}return o}const At="https://www.dropbox.com/oauth2/authorize",De="https://api.dropboxapi.com/oauth2/token",Ct="https://api.dropboxapi.com/2",Re="https://content.dropboxapi.com/2",W="tasks.dropbox.appKey",V="tasks.dropbox.refresh",X="tasks.dropbox.account",G="tasks.dropbox.verifier",Z="tasks.dropbox.state",L=()=>localStorage.getItem(W)||"",ro=e=>e?localStorage.setItem(W,e):localStorage.removeItem(W),Ne=()=>localStorage.getItem(V)||"",Dt=()=>localStorage.getItem(X)||"",he=()=>!!(L()&&Ne());function so(){localStorage.removeItem(V),localStorage.removeItem(X),$=null}const Ie=e=>btoa(String.fromCharCode(...e)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),ge=()=>Ie(crypto.getRandomValues(new Uint8Array(48)));async function Rt(e){const t=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(e));return Ie(new Uint8Array(t))}async function io(e){const t=L();if(!t)throw new Error("Add your Dropbox app key first.");const n=ge(),r=ge();sessionStorage.setItem(G,n),sessionStorage.setItem(Z,r);const i=new URLSearchParams({client_id:t,response_type:"code",code_challenge:await Rt(n),code_challenge_method:"S256",redirect_uri:e,token_access_type:"offline",state:r});return`${At}?${i}`}function ao(e=(t=>(t=globalThis.location)==null?void 0:t.search)()??""){const n=new URLSearchParams(e),r=n.get("code");return!r||n.get("state")!==sessionStorage.getItem(Z)?null:r}const co=(e=(t=>(t=globalThis.location)==null?void 0:t.search)()??"")=>new URLSearchParams(e).get("error_description")||new URLSearchParams(e).get("error");async function Me(e,t){const n=await fetch(e,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(t)}),r=await n.json().catch(()=>({}));if(!n.ok)throw new Error(r.error_description||r.error_summary||`Dropbox said ${n.status}.`);return r}async function lo(e,t){const n=sessionStorage.getItem(G);if(sessionStorage.removeItem(G),sessionStorage.removeItem(Z),!n)throw new Error("That sign-in did not start in this tab.");const r=await Me(De,{grant_type:"authorization_code",code:e,code_verifier:n,client_id:L(),redirect_uri:t});if(!r.refresh_token)throw new Error("Dropbox returned no refresh token.");return localStorage.setItem(V,r.refresh_token),$={token:r.access_token,expires:Date.now()+(r.expires_in??0)*1e3},r}let $=null;async function Nt(){if($&&$.expires-6e4>Date.now())return $.token;const e=Ne();if(!e)throw new Error("Not connected to Dropbox.");const t=await Me(De,{grant_type:"refresh_token",refresh_token:e,client_id:L()});return $={token:t.access_token,expires:Date.now()+(t.expires_in??0)*1e3},$.token}class Q extends Error{constructor(t,n){const r=typeof n=="string"?n:(n==null?void 0:n.error_summary)??"";super(r||`Dropbox said ${t}.`),this.name="DropboxError",this.status=t,this.summary=r}}const me=e=>e instanceof Q&&/conflict/.test(e.summary),It=e=>e instanceof Q&&/not_found/.test(e.summary),je=e=>JSON.stringify(e).replace(/[\u007f-\uffff]/g,t=>`\\u${t.charCodeAt(0).toString(16).padStart(4,"0")}`),Mt=new Set([429,500,502,503,504]),jt=e=>new Promise(t=>setTimeout(t,e));async function P(e,{headers:t={},body:n=null,retried:r=!1}={}){const i=await fetch(e,{method:"POST",headers:{...t,Authorization:`Bearer ${await Nt()}`},body:n});if(i.ok)return i;if(Mt.has(i.status)&&!r)return await jt(Math.max(1,Number(i.headers.get("Retry-After"))||1)*1e3),P(e,{headers:t,body:n,retried:!0});const o=await i.text().catch(()=>"");let s=o;try{s=JSON.parse(o)}catch{}throw new Q(i.status,s)}async function C(e,t){return(await P(`${Ct}${e}`,{headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})).json()}async function uo(){var n;const e=await C("/users/get_current_account",null),t=(e==null?void 0:e.email)||((n=e==null?void 0:e.name)==null?void 0:n.display_name)||"Dropbox";return localStorage.setItem(X,t),t}async function Bt(){let e=await C("/files/list_folder",{path:"",recursive:!0});const t=[...e.entries];for(;e.has_more;)e=await C("/files/list_folder/continue",{cursor:e.cursor}),t.push(...e.entries);return{entries:t,cursor:e.cursor}}async function Ft(e){let t=await C("/files/list_folder/continue",{cursor:e});const n=[...t.entries];for(;t.has_more;)t=await C("/files/list_folder/continue",{cursor:t.cursor}),n.push(...t.entries);return{entries:n,cursor:t.cursor}}async function Lt(e){return(await P(`${Re}/files/download`,{headers:{"Dropbox-API-Arg":je({path:`/${e}`})}})).text()}async function Pt(e,t,n=null){return(await P(`${Re}/files/upload`,{headers:{"Content-Type":"application/octet-stream","Dropbox-API-Arg":je({path:`/${e}`,mode:n?{".tag":"update",update:n}:"add",autorename:!1,mute:!0})},body:t})).json()}const Ut=(e,t)=>C("/files/delete_v2",{path:`/${e}`,parent_rev:t??void 0}),Be="tasks.files",j="tasks.backend",Yt="tasks-storage",M="handles",Fe="directory",Y=typeof globalThis.showDirectoryPicker=="function";function Le(){return new Promise((e,t)=>{const n=indexedDB.open(Yt,1);n.onupgradeneeded=()=>n.result.createObjectStore(M),n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function we(e){const t=await Le();await new Promise((n,r)=>{const i=t.transaction(M,"readwrite");i.objectStore(M).put(e,Fe),i.oncomplete=n,i.onerror=()=>r(i.error)}),t.close()}async function be(){const e=await Le(),t=await new Promise((n,r)=>{const o=e.transaction(M,"readonly").objectStore(M).get(Fe);o.onsuccess=()=>n(o.result),o.onerror=()=>r(o.error)});return e.close(),t}function Wt(){try{const e=localStorage.getItem(Be),t=e?JSON.parse(e):null;return t&&typeof t=="object"?t:null}catch{return null}}function ye(e){try{localStorage.setItem(Be,JSON.stringify(e))}catch{}}const B=e=>e.toLowerCase().endsWith(".md"),Gt=[/\([^)]*conflicted copy[^)]*\)\.md$/i,/\.sync-conflict-[^/]*\.md$/i],ke=e=>Gt.some(t=>t.test(e));function Pe(e){const t=new Set,n=o=>{const s=o.indexOf("/");return s===-1?{folder:"",base:o}:{folder:o.slice(0,s),base:o.slice(s+1)}};for(const o of e){const{folder:s,base:a}=n(o);!s||a.includes("/")||B(a)&&!ke(a)&&a.startsWith(D)&&t.add(s)}const r=[],i=[];for(const o of e){const{folder:s,base:a}=n(o);s&&(a.includes("/")||!t.has(s))||B(a)&&(ke(a)?i.push(o):r.push(o))}return{keep:r,conflicts:i}}async function zt(e){const t=new Map,n=[];for await(const[a,c]of e.entries())c.kind==="directory"?n.push([a,c]):c.kind==="file"&&B(a)&&t.set(a,c);for(const[a,c]of n)for await(const[l,u]of c.entries())u.kind==="file"&&B(l)&&t.set(`${a}/${l}`,u);const{keep:r,conflicts:i}=Pe([...t.keys()]),o={},s=new Map;for(const a of r){const c=await t.get(a).getFile();o[a]=await c.text(),s.set(a,{mtime:c.lastModified,size:c.size})}return{files:o,stamps:s,conflicts:i}}const qt=6;async function Jt(e,t,n){let r=0;const i=Array.from({length:Math.min(t,e.length)},async()=>{for(;r<e.length;)await n(e[r++])});await Promise.all(i)}async function Kt(){const{entries:e,cursor:t}=await Bt(),n=new Map;for(const a of e)a[".tag"]==="file"&&n.set(a.path_display.replace(/^\//,""),a.rev);const{keep:r,conflicts:i}=Pe([...n.keys()]),o={},s=new Map;return await Jt(r,qt,async a=>{o[a]=await Lt(a),s.set(a,{rev:n.get(a)})}),{files:o,stamps:s,conflicts:i,cursor:t}}function fo({sameFile:e=(t,n,r)=>n===r}={}){let t=null,n=!1,r=null,i=!1;async function o(d,p){let g=t;for(const f of d.split("/").slice(0,-1))g=await g.getDirectoryHandle(f,{create:p});return g}const s=d=>d.slice(d.lastIndexOf("/")+1);let a=new Map,c=Promise.resolve();function l(d){const p=c.then(d,d);return c=p.then(()=>{},()=>{}),p}const u={get mode(){return t?"folder":n?"dropbox":"local"},get folderName(){return t?t.name:n?Dt()||"Dropbox":""},supportsFolder:Y,reconnectable:!1,conflictFiles:[],get writable(){return!t||i}};async function w(){if(!Y)return!1;let d;try{d=await be()}catch{return!1}if(!d)return!1;try{if(await d.queryPermission({mode:"readwrite"})==="granted")return t=d,!0;u.reconnectable=!0}catch{}return!1}async function h(){return localStorage.getItem(j)!=="folder"&&he()?(n=!0,!0):w()}function S(d,p,g){return a=new Map(Object.entries(d).map(([f,y])=>[f,{text:y,...p.get(f)}])),u.conflictFiles=g,ye(d),d}async function O(){if(!t&&!n&&await h(),t){const{files:d,stamps:p,conflicts:g}=await zt(t);return S(d,p,g)}if(n){const d=await Kt();return r=d.cursor,S(d.files,d.stamps,d.conflicts)}return Wt()??{}}const b=()=>l(O);async function k(d){try{const f=await(await(await o(d,!1)).getFileHandle(s(d),{create:!1})).getFile();return{mtime:f.lastModified,size:f.size}}catch{return null}}const R=(d,p)=>p.mtime!==d.mtime||p.size!==d.size;function Ke(d){const p=[];for(const[f,y]of Object.entries(d)){const m=a.get(f);m&&e(f,m.text,y)||p.push([f,y])}const g=[...a.keys()].filter(f=>!(f in d));return{writes:p,removals:g}}async function He(d,p,g){for(const[f,y]of d){const m=a.get(f),_=await k(f);if(m?_&&R(m,_):_){g.push(f);continue}const ie=await(await o(f,!0)).getFileHandle(s(f),{create:!0}),ae=await ie.createWritable();await ae.write(y),await ae.close();const ce=await ie.getFile();a.set(f,{text:y,mtime:ce.lastModified,size:ce.size})}for(const f of p){const y=a.get(f),m=await k(f);if(m&&R(y,m)){g.push(f);continue}if(m)try{await(await o(f,!1)).removeEntry(s(f))}catch{}a.delete(f)}}async function Ve(d,p,g){var f;for(const[y,m]of d){const _=a.get(y);try{const v=await Pt(y,m,(_==null?void 0:_.rev)??null);a.set(y,{text:m,rev:v.rev})}catch(v){if(!me(v))throw v;g.push(y)}}for(const y of p){try{await Ut(y,((f=a.get(y))==null?void 0:f.rev)??null)}catch(m){if(me(m)){g.push(y);continue}if(!It(m))throw m}a.delete(y)}}async function Xe(d){if(t&&!i)return{skipped:"read-only"};if(ye(d),!t&&!n)return{};const p=[],{writes:g,removals:f}=Ke(d);return t?await He(g,f,p):await Ve(g,f,p),p.length?{blocked:p}:{}}const Ze=d=>l(()=>Xe(d));async function Qe({force:d=!1}={}){if(!t&&!n)return{files:null,changed:!1};if(!d&&t&&!i)return{files:null,changed:!1};if(n&&r&&!d){const m=await Ft(r);if(r=m.cursor,!m.entries.length)return{files:null,changed:!1}}const p=a,g=await O(),f=new Set([...p.keys(),...Object.keys(g)]);let y=!1;for(const m of f){const _=p.get(m),v=g[m];if(_===void 0||v===void 0||!e(m,_.text,v)){y=!0;break}}return{files:g,changed:y}}const et=d=>l(()=>Qe(d));function tt(d){for(const p of d)a.delete(p)}function nt(){return l(async()=>{if(!t)return null;const d=await O();return i=!0,d})}function ot(){i=!1}function rt(){return l(async()=>{if(!he())throw new Error("Not connected to Dropbox.");return t=null,n=!0,r=null,i=!1,u.reconnectable=!1,localStorage.setItem(j,"dropbox"),O()})}async function st(){if(!Y)throw new Error("This browser cannot open folders.");const d=u.reconnectable&&await be()||await globalThis.showDirectoryPicker({mode:"readwrite"});if(await d.requestPermission({mode:"readwrite"})!=="granted")throw new Error("Permission to use that folder was declined.");return t=d,n=!1,i=!1,u.reconnectable=!1,localStorage.setItem(j,"folder"),await we(d).catch(()=>{}),b()}function it(){t=null,n=!1,r=null,i=!1,a=new Map,u.conflictFiles=[],u.reconnectable=!1,localStorage.removeItem(j),we(null).catch(()=>{})}return{state:u,load:b,save:Ze,revalidate:et,connectDropbox:rt,disown:tt,unlock:nt,lock:ot,connectFolder:st,disconnectFolder:it,tryRestoreFolder:w}}const Ht=67324752,Vt=33639248,Xt=101010256,Zt=(()=>{const e=new Uint32Array(256);for(let t=0;t<256;t+=1){let n=t;for(let r=0;r<8;r+=1)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})();function Qt(e){let t=4294967295;for(let n=0;n<e.length;n+=1)t=Zt[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0}function en(e){const t=Math.max(1980,e.getFullYear());return{time:e.getHours()<<11|e.getMinutes()<<5|Math.floor(e.getSeconds()/2),date:t-1980<<9|e.getMonth()+1<<5|e.getDate()}}class tn{constructor(){this.chunks=[],this.length=0}bytes(t){this.chunks.push(t),this.length+=t.length}u16(t){this.bytes(new Uint8Array([t&255,t>>>8&255]))}u32(t){this.bytes(new Uint8Array([t&255,t>>>8&255,t>>>16&255,t>>>24&255]))}concat(){const t=new Uint8Array(this.length);let n=0;for(const r of this.chunks)t.set(r,n),n+=r.length;return t}}function po(e,t=new Date){const n=new TextEncoder,{time:r,date:i}=en(t),o=new tn,s=[];for(const[l,u]of Object.entries(e)){const w=n.encode(l),h=n.encode(u),S=Qt(h);s.push({nameBytes:w,size:h.length,crc:S,offset:o.length}),o.u32(Ht),o.u16(20),o.u16(2048),o.u16(0),o.u16(r),o.u16(i),o.u32(S),o.u32(h.length),o.u32(h.length),o.u16(w.length),o.u16(0),o.bytes(w),o.bytes(h)}const a=o.length;for(const l of s)o.u32(Vt),o.u16(20),o.u16(20),o.u16(2048),o.u16(0),o.u16(r),o.u16(i),o.u32(l.crc),o.u32(l.size),o.u32(l.size),o.u16(l.nameBytes.length),o.u16(0),o.u16(0),o.u16(0),o.u16(0),o.u32(0),o.u32(l.offset),o.bytes(l.nameBytes);const c=o.length-a;return o.u32(Xt),o.u16(0),o.u16(0),o.u16(s.length),o.u16(s.length),o.u32(c),o.u32(a),o.u16(0),o.concat()}const N=e=>String(e??"").replace(/\|/g,"\\|").replace(/\n+/g," ").trim(),nn=e=>(e.people??[]).join(", ");function on(e){return e.done?"done":e.total===0?"—":`${e.checked}/${e.total}`}const ee=(e,t)=>(T(e.due)??1/0)-(T(t.due)??1/0);function Ue(e,{now:t=Date.now()}={}){const n=[];n.push(`# ${(e==null?void 0:e.title)||"Untitled project"}`),e!=null&&e.goal&&n.push("","## Goal",e.goal.trim()),e!=null&&e.context&&n.push("","## Context",e.context.trim());const r=[e==null?void 0:e.start,e==null?void 0:e.end].filter(Boolean);return n.push(""),r.length===2&&n.push(`Window: ${e.start} → ${e.end}`),n.push(`Today: ${xe(t)}`),n.join(`
`)}function Ye(e,{now:t=Date.now()}={}){const n=Ae(e),r=["## Tasks","","| id | task | due | estimate | people | subtasks |"];r.push("|----|------|-----|----------|--------|----------|");const i=[...e].sort(ee);for(const o of i){const s=Ot(o,n,t);r.push(`| ${N(o.id)} | ${N(o.title)} | ${N(o.due)||"—"} | ${N(o.estimate)||"—"} | ${N(nn(o))||"—"} | ${on(s)} |`)}return i.length===0&&r.push("| — | _no tasks yet_ | — | — | — | — |"),r.join(`
`)}function We(e){const t=Ae(e),n=[];for(const r of[...e].sort(ee)){for(const i of r.blockedBy??[])t.has(i)&&n.push(`- ${r.id} blocked-by ${i}`);for(const i of r.partOf??[])t.has(i)&&n.push(`- ${r.id} part-of ${i}`)}return["## Dependencies","",n.length?n.join(`
`):"_none recorded_"].join(`
`)}function te(e,t,{now:n=Date.now()}={}){return`${[Ue(e,{now:n}),Ye(t,{now:n}),We(t)].join(`

`)}
`}function ne(e){var n,r;const t=[`## Task: ${e.title}`,`id: ${e.id}`];if(e.due&&t.push(`due: ${e.due}`),e.estimate&&t.push(`current estimate: ${e.estimate}`),(n=e.people)!=null&&n.length&&t.push(`people: ${e.people.join(", ")}`),e.notes&&t.push("",e.notes.trim()),(r=e.subtasks)!=null&&r.length){t.push("","Existing subtasks:");for(const i of e.subtasks)t.push(`- [${i.done?"x":" "}] ${i.text}`)}else t.push("","Existing subtasks: none");return`${t.join(`
`)}
`}const rn=[{id:"goal",label:"Goal & context",hint:"The project title, its goal and your notes"},{id:"tasks",label:"Tasks in this project",hint:"Every task, done ones included, with dependencies"},{id:"detail",label:"Task notes & subtasks",hint:"The full text behind each task"},{id:"task",label:"Selected task in full",hint:"The task open in the sidebar",needs:"task"},{id:"projects",label:"Other projects",hint:"Titles and goals of everything else on the board"},{id:"people",label:"People",hint:"Who is on the project and what they are holding"}];function ho(e){const t=String(e??"").trim();return t?t.split(/\s+/).length:0}function sn(e){var r,i,o,s;const t=["## Task detail"];let n=0;for(const a of[...e].sort(ee))if(!(!((r=a.notes)!=null&&r.trim())&&!((i=a.subtasks)!=null&&i.length))&&(n+=1,t.push("",`### ${a.title}`,`id: ${a.id}`),(o=a.notes)!=null&&o.trim()&&t.push("",a.notes.trim()),(s=a.subtasks)!=null&&s.length)){t.push("","Subtasks:");for(const c of a.subtasks)t.push(`- [${c.done?"x":" "}] ${c.text}`)}return n?t.join(`
`):""}function an(e,t,n){var o;const r=kt(t??[],!1).filter(s=>s.id!==(e==null?void 0:e.id));if(!r.length)return"";const i=["## Other projects",""];for(const s of r){const a=Ce(n??[],{projectId:s.id}).length,c=[s.start,s.end].filter(Boolean).join(" → "),l=[`**${s.title}**`,(o=s.goal)==null?void 0:o.trim(),c,`${a} tasks`];i.push(`- ${l.filter(Boolean).join(" — ")}`)}return i.join(`
`)}function cn(e,t){const n=Tt(e,t??[]);if(!n.length)return"";const r=["## People",""];for(const i of n){const o=(t??[]).filter(c=>!c.done&&(c.people??[]).includes(i.name)),s=wt(o),a=s?`, ${s}h estimated`:"";r.push(`- ${i.name} — ${o.length} open task${o.length===1?"":"s"}${a}`)}return r.join(`
`)}function ln({project:e,tasks:t=[],task:n=null,projects:r=[],allTasks:i=[],now:o=Date.now()}={}){return{goal:Ue(e,{now:o}),tasks:`${Ye(t,{now:o})}

${We(t)}`,detail:sn(t),task:n?ne(n).trimEnd():"",projects:an(e,r,i),people:cn(e,t)}}function go(e,t={}){const n=new Set(e??[]),r=ln(t),i=rn.filter(o=>n.has(o.id)).map(o=>r[o.id]).filter(o=>o&&o.trim());return i.length?`${i.join(`

`)}
`:""}const oe=`You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`,un=`You are a project planning advisor helping someone think about their own project.
Answer in concise markdown prose. Lead with the answer, then the reasoning.
Ground every claim in the brief you were given, and refer to tasks by their exact id in backticks.
If the brief does not contain what you would need, say so plainly instead of inventing it.
You are being asked to think, not to fill in a form: no preamble, no restating the question.`;function mo(e,t){const n=[{role:"system",content:un}];return t.forEach((r,i)=>{const o=i===0&&r.role==="user"&&e;n.push({role:r.role,content:o?`${e}
---
${r.content}`:r.content})}),n}function re(e){const t=String(e??"").trim(),n=[],r=/```(?:json)?\s*\n?([\s\S]*?)```/gi;for(let s=r.exec(t);s;s=r.exec(t))n.push(s[1]);const i=t.search(/[[{]/);if(i!==-1){const s=Math.max(t.lastIndexOf("]"),t.lastIndexOf("}"));s>i&&n.push(t.slice(i,s+1))}n.push(t);for(const s of n)try{return JSON.parse(s.trim())}catch{}const o=new Error("Could not read JSON from the model response.");throw o.raw=t,o}function Ge(e,t){if(Array.isArray(e))return e;if(e&&Array.isArray(e[t]))return e[t];if(e&&typeof e=="object"){const n=Object.values(e).find(Array.isArray);if(n)return n}return[]}const x=e=>typeof e=="string"?e.trim():"",dn={id:"subtasks",title:"Suggest subtasks",messages(e,t,n){return[{role:"system",content:oe},{role:"user",content:`${te(e,t)}
${ne(n)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`}]},parse(e){return Ge(re(e),"subtasks").map(t=>typeof t=="string"?t:x((t==null?void 0:t.text)??(t==null?void 0:t.title))).map(t=>t.replace(/^[-*]\s*(\[[ xX]\]\s*)?/,"").trim()).filter(Boolean).map(t=>({kind:"subtask",label:t}))}},fn={id:"missing",title:"Find missing tasks",messages(e,t){return[{role:"system",content:oe},{role:"user",content:`${te(e,t)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`}]},parse(e){return Ge(re(e),"tasks").map(t=>{if(typeof t=="string")return{kind:"task",label:t,task:{title:t}};const n=x((t==null?void 0:t.title)??(t==null?void 0:t.name));if(!n)return null;const r=/^\d{4}-\d{2}-\d{2}$/.test(x(t==null?void 0:t.due))?x(t.due):"",i=(Array.isArray(t==null?void 0:t.blocked_by)?t.blocked_by:[]).map(x).filter(Boolean);return{kind:"task",label:n,detail:x((t==null?void 0:t.why)??(t==null?void 0:t.rationale)),task:{title:n,due:r,estimate:x(t==null?void 0:t.estimate),blockedBy:i}}}).filter(Boolean)}},pn={id:"estimate",title:"Estimate duration",messages(e,t,n){return[{role:"system",content:oe},{role:"user",content:`${te(e,t)}
${ne(n)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`}]},parse(e){const t=re(e),n=x(typeof t=="string"?t:(t==null?void 0:t.estimate)??(t==null?void 0:t.duration)),r=/(\d+(?:\.\d+)?)\s*([hdw])/i.exec(n);if(!r){const o=new Error(`Model returned an unusable estimate: "${n||"(empty)"}"`);throw o.raw=JSON.stringify(t),o}const i=`${Number(r[1])}${r[2].toLowerCase()}`;return[{kind:"estimate",label:i,detail:x((t==null?void 0:t.why)??(t==null?void 0:t.rationale)),estimate:i}]}},wo={subtasks:dn,missing:fn,estimate:pn},se="https://openrouter.ai/api/v1",z="tasks.openrouter.key",ze="tasks.openrouter.model",U="google/gemini-2.0-flash-001",hn=()=>localStorage.getItem(z)||"",bo=e=>e?localStorage.setItem(z,e):localStorage.removeItem(z),gn=()=>localStorage.getItem(ze)||U,yo=e=>localStorage.setItem(ze,e||U);function mn(e){var n;const t=Number((n=e==null?void 0:e.pricing)==null?void 0:n.prompt);return Number.isFinite(t)?t*1e6:null}function ko(e){return e==null?"":e===0?"free":e<1?`$${e.toFixed(3)}/M`:`$${e.toFixed(2)}/M`}async function So(){const e=await fetch(`${se}/models`);if(!e.ok)throw new Error(`OpenRouter models request failed (${e.status})`);const t=await e.json();return((t==null?void 0:t.data)??[]).filter(n=>{var r;return(n==null?void 0:n.id)&&(((r=n.architecture)==null?void 0:r.output_modalities)??["text"]).includes("text")}).map(n=>({id:n.id,name:n.name||n.id,price:mn(n),context:n.context_length??null})).filter(n=>n.price!=null).sort((n,r)=>n.price-r.price||n.id.localeCompare(r.id))}const qe=e=>({Authorization:`Bearer ${e}`,"Content-Type":"application/json","HTTP-Referer":location.origin,"X-Title":"Tasks"});async function Je(e){var t;try{const n=await e.json();return((t=n==null?void 0:n.error)==null?void 0:t.message)||`HTTP ${e.status}`}catch{return`HTTP ${e.status}`}}async function wn(e,{key:t,model:n,signal:r,maxTokens:i=900,temperature:o=.4}={}){var l,u,w;if(!t)throw new Error("No OpenRouter API key set. Add one under Settings.");const s=await fetch(`${se}/chat/completions`,{method:"POST",signal:r,headers:qe(t),body:JSON.stringify({model:n||U,messages:e,temperature:o,max_tokens:i})});if(!s.ok)throw new Error(`OpenRouter: ${await Je(s)}`);const a=await s.json();if(a!=null&&a.error)throw new Error(`OpenRouter: ${a.error.message??"unknown error"}`);const c=(w=(u=(l=a==null?void 0:a.choices)==null?void 0:l[0])==null?void 0:u.message)==null?void 0:w.content;if(!c)throw new Error("OpenRouter returned an empty response.");return c}function bn(e){let t="",n=!1;const r=i=>{var l,u,w;const o=i.trim();if(!o||o.startsWith(":")||!o.startsWith("data:"))return;const s=o.slice(5).trim();if(s==="[DONE]"){n=!0;return}let a;try{a=JSON.parse(s)}catch{return}if(a!=null&&a.error)throw new Error(`OpenRouter: ${a.error.message??"unknown error"}`);const c=(w=(u=(l=a==null?void 0:a.choices)==null?void 0:l[0])==null?void 0:u.delta)==null?void 0:w.content;c&&(e==null||e(c))};return{push(i){t+=i;const o=t.split(`
`);t=o.pop()??"";for(const s of o)r(s)},end(){t&&(r(t),t="")},get finished(){return n}}}async function _o(e,{key:t,model:n,signal:r,maxTokens:i=2e3,temperature:o=.7,onDelta:s}={}){if(!t)throw new Error("No OpenRouter API key set. Add one under Settings.");const a=await fetch(`${se}/chat/completions`,{method:"POST",signal:r,headers:qe(t),body:JSON.stringify({model:n||U,messages:e,temperature:o,max_tokens:i,stream:!0})});if(!a.ok)throw new Error(`OpenRouter: ${await Je(a)}`);if(!a.body)throw new Error("OpenRouter returned no response body.");let c="";const l=bn(h=>{c+=h,s==null||s(h,c)}),u=a.body.getReader(),w=new TextDecoder;try{for(;;){const{value:h,done:S}=await u.read();if(S||(l.push(w.decode(h,{stream:!0})),l.finished))break}l.end()}catch(h){if((h==null?void 0:h.name)==="AbortError")return c;throw h}finally{u.cancel().catch(()=>{})}if(!c)throw new Error("OpenRouter returned an empty response.");return c}async function xo(e,{project:t,tasks:n,task:r,signal:i}={}){const o=await wn(e.messages(t,n,r),{key:hn(),model:gn(),signal:i});try{return{suggestions:e.parse(o),raw:o}}catch(s){throw s.raw=s.raw??o,s}}export{Pn as $,yn as A,fo as B,rn as C,zn as D,Tt as E,bo as F,yo as G,ro as H,L as I,he as J,io as K,so as L,co as M,ao as N,lo as O,uo as P,qn as Q,Wn as R,T as S,Ce as T,no as U,$t as V,Jn as W,Yn as X,Ln as Y,xe as Z,Fn as _,gn as a,wo as a0,xo as a1,So as a2,ko as a3,po as a4,te as a5,vt as a6,Vn as a7,Gn as a8,eo as a9,re as aA,Qt as aB,pe as aC,je as aD,bn as aE,un as aF,to as aa,Ae as ab,Ot as ac,oo as ad,kt as ae,Xn as af,wt as ag,Un as ah,Zn as ai,Qn as aj,Kn as ak,q as al,J as am,K as an,Oe as ao,H as ap,$e as aq,dt as ar,ft as as,ht as at,mt as au,ne as av,Et as aw,Te as ax,Ee as ay,yt as az,mo as b,ln as c,ho as d,go as e,Bn as f,hn as g,jn as h,Hn as i,Mn as j,In as k,Nn as l,Rn as m,Dn as n,Cn as o,An as p,En as q,Tn as r,_o as s,$n as t,On as u,vn as v,xn as w,_n as x,Sn as y,kn as z};
