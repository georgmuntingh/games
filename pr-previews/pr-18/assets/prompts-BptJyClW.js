const pe=`---
id: q4-hiring
title: Q4 hiring
goal: Two engineers and one designer signed before the end of the year
people: [georg, mira, sam, ada]
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
`,he=`---
id: website
title: Website relaunch
goal: A visitor can go from landing page to a paid account with no human involved
people: [georg, mira, sam, ada]
start: 2026-08-01
end: 2026-11-30
color: '#2563eb'
---
Stripe is already set up under the ops address — sam has the keys. We are on the
standard plan, so no invoicing or purchase orders this round.

Mira is 50% allocated to the platform team until October, so design-heavy weeks
should not be stacked before then. Ada is new and still ramping on our billing code.

The old site stays live on a subdomain for a week after launch. Support have asked
to be able to edit docs without waiting for a deploy — that is a hard requirement,
not a nice-to-have.

## Constraints

- Legal want a DPA review before launch. Ask sam, he owns the thread.
- No new backend services; this has to run on what we already operate.
- The pricing page copy needs a second pair of eyes from someone outside the team.

## Open questions

- Do we need SOC2 before the first enterprise trial, or can it follow?
- Is a free tier in scope, or only trial-to-paid?
`,ge=`---
id: analytics-dashboard
title: Analytics dashboard
project: [website]
people: [ada]
estimate: 1w
created: 2026-08-09
done: false
---
Wanted, not scheduled. Sits in the unscheduled tray until it earns a deadline.
`,be=`---
id: billing-integration
title: Billing integration
project: [website]
people: [ada]
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
`,me=`---
id: component-library
title: Component library
project: [website]
people: [sam]
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
`,we=`---
id: copywriting
title: Copywriting
project: [website]
people: [georg]
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
`,ye=`---
id: design-review
title: Design review
project: [website]
people: [georg, mira, sam]
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
`,_e=`---
id: discovery-interviews
title: Discovery interviews
project: [website]
people: [georg, mira]
due: 2026-08-07
estimate: 1w
created: 2026-07-28
done: true
---
Eight calls with recent signups and three with churned accounts.

- [x] Recruit participants
- [x] Run the calls
- [x] Write up the themes
`,ke=`---
id: docs-site
title: Docs site
project: [website]
people: [georg]
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
`,Se=`---
id: information-architecture
title: Information architecture
project: [website]
people: [mira]
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
`,xe=`---
id: interview-loop
title: Interview loop
project: [q4-hiring]
people: [sam, ada]
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
`,$e=`---
id: job-descriptions
title: Job descriptions
project: [q4-hiring, website]
people: [georg]
due: 2026-09-11
estimate: 3d
created: 2026-08-20
done: false
---
Also blocks the careers page on the new site, hence the second project tag.

- [ ] Two engineering roles
- [ ] One design role
`,Te=`---
id: launch
title: Launch
project: [website]
people: [georg]
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
`,ve=`---
id: offers-out
title: Offers out
project: [q4-hiring]
people: [georg]
due: 2026-12-04
estimate: 1w
created: 2026-08-20
done: false
blocked-by: [sourcing, interview-loop]
---
`,Ae=`---
id: qa-pass
title: QA pass
project: [website]
people: [sam, mira]
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
`,Ce=`---
id: self-serve-signup
title: Self-serve signup
project: [website]
people: [sam, ada]
due: 2026-10-23
created: 2026-08-02
done: false
blocked-by: [design-review]
---
The umbrella for the whole signup-to-paid path. This is the goal the project exists for.
`,Oe=`---
id: signup-flow
title: Signup flow
project: [website]
people: [ada]
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
`,De=`---
id: sourcing
title: Sourcing
project: [q4-hiring]
people: [georg, mira]
due: 2026-10-02
estimate: 3w
created: 2026-08-20
done: false
blocked-by: [job-descriptions]
---
- [ ] Referral push
- [ ] Two agencies briefed
`,Ee=`---
id: visual-design
title: Visual design
project: [website]
people: [mira]
due: 2026-09-04
estimate: 2w
created: 2026-07-30
done: false
blocked-by: [wireframes]
---
- [ ] Type scale and colour tokens
- [ ] Landing page comps
- [ ] Empty and error states
`,Be=`---
id: wireframes
title: Wireframes
project: [website]
people: [mira]
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
`,$=["id","title","goal","project","people","due","estimate","created","done","blocked-by","part-of"],A=new Set(["project","people","blocked-by","part-of"]),L=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;function C(n){const e=n.trim();return e.length>=2&&(e[0]==='"'||e[0]==="'")&&e[e.length-1]===e[0]?e.slice(1,-1):e}function T(n){const e=n.trim();return e===""?"":e==="true"?!0:e==="false"?!1:e==="null"||e==="~"?null:C(e)}function N(n){const e=n.trim().slice(1,-1).trim();if(e==="")return[];const t=[];let s="",r=null;for(const o of e)r?(o===r&&(r=null),s+=o):o==='"'||o==="'"?(r=o,s+=o):o===","?(t.push(s),s=""):s+=o;return t.push(s),t.map(o=>C(o)).filter(o=>o!=="")}function O(n){const e=String(n).replace(/\r\n/g,`
`);if(!e.startsWith(`---
`))return{data:{},body:e.replace(/^\n+/,"")};const t=e.indexOf(`
---`,3);if(t===-1)return{data:{},body:e};const s=e.slice(4,t+1),r=e.indexOf(`
`,t+1),o=r===-1?"":e.slice(r+1),i={},c=s.split(`
`);let l=null;for(const a of c){if(a.trim()===""||a.trimStart().startsWith("#"))continue;const d=/^\s*-\s+(.*)$/.exec(a);if(d&&l){i[l].push(T(d[1]));continue}const g=/^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(a);if(!g)continue;const[,u,p]=g;l=null,p.trim()===""?(i[u]=[],l=u):p.trim().startsWith("[")&&p.trim().endsWith("]")?i[u]=N(p):i[u]=T(p)}for(const[a,d]of Object.entries(i))Array.isArray(d)&&d.length===0&&!A.has(a)&&(i[a]="");return{data:i,body:o}}function R(n){const e=String(n);return e===""||/^[#&*!|>%@`?-]/.test(e)||/[:,[\]{}]/.test(e)||e!==e.trim()||["true","false","null","~"].includes(e)}function v(n){return typeof n=="boolean"||typeof n=="number"?String(n):n==null?"":R(n)?`'${String(n).replace(/'/g,"''")}'`:String(n)}function F(n,e){return Array.isArray(e)||A.has(n)?`[${(Array.isArray(e)?e:[e].filter(s=>s!==""&&s!=null)).map(v).join(", ")}]`:v(e)}function D(n,e=""){const s=[...$.filter(o=>o in n),...Object.keys(n).filter(o=>!$.includes(o))].map(o=>`${o}: ${F(o,n[o])}`),r=String(e).replace(/\s+$/,"");return`---
${s.join(`
`)}
---
${r?`${r}
`:""}`}function I(n){const e=[],t=[];for(const s of String(n).split(`
`)){const r=L.exec(s);r?e.push({done:r[1].toLowerCase()==="x",text:r[2].trim()}):t.push(s)}return{notes:t.join(`
`).trim(),subtasks:e}}function U(n,e=[]){const t=e.map(r=>`- [${r.done?"x":" "}] ${r.text}`).join(`
`),s=String(n||"").trim();return s?t?`${s}

${t}`:s:t}const _="_project-",b=864e5,Y={æ:"ae",ø:"o",å:"a",ß:"ss",ð:"d",þ:"th",ł:"l",đ:"d"};function W(n){return String(n).toLowerCase().replace(/[æøåßðþłđ]/g,t=>Y[t]).normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"task"}function Me(n,e){const t=W(n),s=e instanceof Set?e:new Set(e);if(!s.has(t))return t;for(let r=2;;r+=1){const o=`${t}-${r}`;if(!s.has(o))return o}}function h(n){if(n==null||n==="")return null;const e=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(n).trim());if(!e)return null;const t=Date.UTC(Number(e[1]),Number(e[2])-1,Number(e[3]));return Number.isNaN(t)?null:t}function j(n){return n==null?"":new Date(n).toISOString().slice(0,10)}const q={h:1,d:8,w:40};function P(n){if(n==null||n==="")return null;const e=String(n).trim().toLowerCase(),t=/^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(e);return t?Number(t[1])*q[t[2]]:null}function Le(n){return n.reduce((e,t)=>e+(P(t.estimate)??0),0)}function y(n){return n==null||n===""?[]:(Array.isArray(n)?n:[n]).map(e=>String(e).trim()).filter(Boolean)}function J(n,e){const{data:t,body:s}=O(e),{notes:r,subtasks:o}=I(s),i=String(n).replace(/\.md$/i,"");return{id:String(t.id||i),title:String(t.title||i),project:y(t.project),people:y(t.people),due:t.due?String(t.due):"",estimate:t.estimate?String(t.estimate):"",created:t.created?String(t.created):"",done:t.done===!0,blockedBy:y(t["blocked-by"]),partOf:y(t["part-of"]),notes:r,subtasks:o,extra:Object.fromEntries(Object.entries(t).filter(([c])=>!["id","title","project","people","due","estimate","created","done","blocked-by","part-of"].includes(c)))}}function E(n,e=[]){return Object.fromEntries(Object.entries(n).filter(([t,s])=>e.includes(t)?!0:Array.isArray(s)?s.length>0:s!==""&&s!=null))}function z(n){const e=E({id:n.id,title:n.title,project:n.project??[],people:n.people??[],due:n.due??"",estimate:n.estimate??"",created:n.created??"",done:!!n.done,"blocked-by":n.blockedBy??[],"part-of":n.partOf??[],...n.extra??{}},["id","title","done"]);return D(e,U(n.notes,n.subtasks))}function K(n,e){const{data:t,body:s}=O(e),r=String(n).replace(/\.md$/i,"").replace(new RegExp(`^${_}`),"");return{id:String(t.id||r),title:String(t.title||r),goal:t.goal?String(t.goal):"",people:y(t.people),start:t.start?String(t.start):"",end:t.end?String(t.end):"",color:t.color?String(t.color):"",context:String(s).trim()}}function G(n){return D(E({id:n.id,title:n.title,goal:n.goal??"",people:n.people??[],start:n.start??"",end:n.end??"",color:n.color??""},["id","title"]),n.context??"")}const H=n=>`${n.id}.md`,Q=n=>`${_}${n.id}.md`;function Ne(n){const e=[],t=[];for(const[s,r]of Object.entries(n)){if(!/\.md$/i.test(s))continue;const o=s.split("/").pop();o.startsWith(_)?t.push(K(o,r)):e.push(J(o,r))}return e.sort((s,r)=>s.id.localeCompare(r.id)),t.sort((s,r)=>s.id.localeCompare(r.id)),{tasks:e,projects:t}}function Re({tasks:n,projects:e}){const t={};for(const s of e)t[Q(s)]=G(s);for(const s of n)t[H(s)]=z(s);return t}const m={day:{unit:"day",label:"Days",level(n,e){return(n-e)/b},dateForLevel(n,e){return e+n*b},format(n){return new Date(n).toISOString().slice(5,10).replace("-","/")}},week:{unit:"week",label:"Weeks",level(n,e){return(n-e)/(7*b)},dateForLevel(n,e){return e+n*7*b},format(n){return`${new Date(n).toISOString().slice(5,10).replace("-","/")}`}},month:{unit:"month",label:"Months",level(n,e){const t=new Date(e),s=new Date(n),r=(s.getUTCFullYear()-t.getUTCFullYear())*12+(s.getUTCMonth()-t.getUTCMonth()),o=Date.UTC(s.getUTCFullYear(),s.getUTCMonth(),1),i=Date.UTC(s.getUTCFullYear(),s.getUTCMonth()+1,1);return r+(n-o)/(i-o)},dateForLevel(n,e){const t=new Date(e);return Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+Math.round(n),1)},format(n){const e=new Date(n);return`${e.toLocaleString("en",{month:"short",timeZone:"UTC"})} ${e.getUTCFullYear()}`}}};function Fe(n,e){if(n==null||e==null||e<=n)return m.week;const t=(e-n)/b;return t<=31?m.day:t<=240?m.week:m.month}function Ie(n){return m[n]??m.week}function Ue(n,e){const t=e.map(a=>h(a.due)).filter(a=>a!=null),s=h(n==null?void 0:n.start),r=h(n==null?void 0:n.end),o=[s,...t].filter(a=>a!=null),i=[r,...t].filter(a=>a!=null),c=o.length?Math.min(...o):Date.now(),l=i.length?Math.max(...i):c+30*b;return{start:c,end:Math.max(l,c)}}function Ye(n,{bucket:e,start:t}){const s=new Map;for(const a of n){const d=h(a.due);d!=null&&s.set(a.id,Math.floor(e.level(d,t)))}const r=[...s.values()],o=r.length?Math.min(...r):0,c=(r.length?Math.max(...r):0)-o+2,l=new Map;for(const a of n)l.set(a.id,s.has(a.id)?s.get(a.id)-o:c);return{levels:l,trayLevel:c,minLevel:o}}function Z(n,e,t=Date.now()){var c,l;const s=((c=n.subtasks)==null?void 0:c.length)??0,r=((l=n.subtasks)==null?void 0:l.filter(a=>a.done).length)??0,o=h(n.due),i=(n.blockedBy??[]).filter(a=>e.has(a)&&!e.get(a).done);return{done:!!n.done,total:s,checked:r,ratio:n.done?1:s===0?0:r/s,started:!n.done&&r>0,blocked:!n.done&&i.length>0,blockers:i,overdue:!n.done&&o!=null&&o<t}}const V=n=>new Map(n.map(e=>[e.id,e]));function X(n){return[...new Set(n.flatMap(e=>e.people??[]))].sort((e,t)=>e.localeCompare(t))}function We(n){return[...new Set(n.flatMap(e=>e.project??[]))].sort((e,t)=>e.localeCompare(t))}function je(n,e){const t=ee(e,{projectId:(n==null?void 0:n.id)??null}),s=(n==null?void 0:n.people)??[],r=[...new Set([...s,...X(t)])],o=new Set(s);return r.map(i=>({name:i,inRoster:o.has(i),openTasks:t.filter(c=>!c.done&&(c.people??[]).includes(i)).length})).sort((i,c)=>Number(c.inRoster)-Number(i.inRoster)||i.name.localeCompare(c.name))}function ee(n,{projectId:e=null,people:t=[],hideDone:s=!1}={}){const r=new Set(t);return n.filter(o=>!(e&&!(o.project??[]).includes(e)||r.size>0&&!(o.people??[]).some(i=>r.has(i))||s&&o.done))}function qe(n,e){const t=new Set(n.map(r=>r.id)),s=[];for(const r of n){for(const o of r.blockedBy??[]){if(!t.has(o))continue;const i=((e==null?void 0:e.get(o))??0)>((e==null?void 0:e.get(r.id))??0);s.push({id:`blocks:${o}->${r.id}`,from:o,to:r.id,kind:"blocks",conflict:i})}for(const o of r.partOf??[])t.has(o)&&s.push({id:`part-of:${r.id}->${o}`,from:r.id,to:o,kind:"part-of",conflict:!1})}return s}const ne=67324752,te=33639248,oe=101010256,se=(()=>{const n=new Uint32Array(256);for(let e=0;e<256;e+=1){let t=e;for(let s=0;s<8;s+=1)t=t&1?3988292384^t>>>1:t>>>1;n[e]=t>>>0}return n})();function re(n){let e=4294967295;for(let t=0;t<n.length;t+=1)e=se[(e^n[t])&255]^e>>>8;return(e^4294967295)>>>0}function ie(n){const e=Math.max(1980,n.getFullYear());return{time:n.getHours()<<11|n.getMinutes()<<5|Math.floor(n.getSeconds()/2),date:e-1980<<9|n.getMonth()+1<<5|n.getDate()}}class ae{constructor(){this.chunks=[],this.length=0}bytes(e){this.chunks.push(e),this.length+=e.length}u16(e){this.bytes(new Uint8Array([e&255,e>>>8&255]))}u32(e){this.bytes(new Uint8Array([e&255,e>>>8&255,e>>>16&255,e>>>24&255]))}concat(){const e=new Uint8Array(this.length);let t=0;for(const s of this.chunks)e.set(s,t),t+=s.length;return e}}function Pe(n,e=new Date){const t=new TextEncoder,{time:s,date:r}=ie(e),o=new ae,i=[];for(const[a,d]of Object.entries(n)){const g=t.encode(a),u=t.encode(d),p=re(u);i.push({nameBytes:g,size:u.length,crc:p,offset:o.length}),o.u32(ne),o.u16(20),o.u16(2048),o.u16(0),o.u16(s),o.u16(r),o.u32(p),o.u32(u.length),o.u32(u.length),o.u16(g.length),o.u16(0),o.bytes(g),o.bytes(u)}const c=o.length;for(const a of i)o.u32(te),o.u16(20),o.u16(20),o.u16(2048),o.u16(0),o.u16(s),o.u16(r),o.u32(a.crc),o.u32(a.size),o.u32(a.size),o.u16(a.nameBytes.length),o.u16(0),o.u16(0),o.u16(0),o.u16(0),o.u32(0),o.u32(a.offset),o.bytes(a.nameBytes);const l=o.length-c;return o.u32(oe),o.u16(0),o.u16(0),o.u16(i.length),o.u16(i.length),o.u32(l),o.u32(c),o.u16(0),o.concat()}const w=n=>String(n??"").replace(/\|/g,"\\|").replace(/\n+/g," ").trim(),le=n=>(n.people??[]).join(", ");function ce(n){return n.done?"done":n.total===0?"—":`${n.checked}/${n.total}`}function k(n,e,{now:t=Date.now()}={}){const s=V(e),r=[];r.push(`# ${(n==null?void 0:n.title)||"Untitled project"}`),n!=null&&n.goal&&r.push("","## Goal",n.goal.trim()),n!=null&&n.context&&r.push("","## Context",n.context.trim());const o=[n==null?void 0:n.start,n==null?void 0:n.end].filter(Boolean);r.push(""),o.length===2&&r.push(`Window: ${n.start} → ${n.end}`),r.push(`Today: ${j(t)}`),r.push("","## Tasks","","| id | task | due | estimate | people | subtasks |"),r.push("|----|------|-----|----------|--------|----------|");const i=[...e].sort((l,a)=>(h(l.due)??1/0)-(h(a.due)??1/0));for(const l of i){const a=Z(l,s,t);r.push(`| ${w(l.id)} | ${w(l.title)} | ${w(l.due)||"—"} | ${w(l.estimate)||"—"} | ${w(le(l))||"—"} | ${ce(a)} |`)}i.length===0&&r.push("| — | _no tasks yet_ | — | — | — | — |");const c=[];for(const l of i){for(const a of l.blockedBy??[])s.has(a)&&c.push(`- ${l.id} blocked-by ${a}`);for(const a of l.partOf??[])s.has(a)&&c.push(`- ${l.id} part-of ${a}`)}return r.push("","## Dependencies",""),r.push(c.length?c.join(`
`):"_none recorded_"),`${r.join(`
`)}
`}function B(n){var t,s;const e=[`## Task: ${n.title}`,`id: ${n.id}`];if(n.due&&e.push(`due: ${n.due}`),n.estimate&&e.push(`current estimate: ${n.estimate}`),(t=n.people)!=null&&t.length&&e.push(`people: ${n.people.join(", ")}`),n.notes&&e.push("",n.notes.trim()),(s=n.subtasks)!=null&&s.length){e.push("","Existing subtasks:");for(const r of n.subtasks)e.push(`- [${r.done?"x":" "}] ${r.text}`)}else e.push("","Existing subtasks: none");return`${e.join(`
`)}
`}const S=`You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`;function x(n){const e=String(n??"").trim(),t=[],s=/```(?:json)?\s*\n?([\s\S]*?)```/gi;for(let i=s.exec(e);i;i=s.exec(e))t.push(i[1]);const r=e.search(/[[{]/);if(r!==-1){const i=Math.max(e.lastIndexOf("]"),e.lastIndexOf("}"));i>r&&t.push(e.slice(r,i+1))}t.push(e);for(const i of t)try{return JSON.parse(i.trim())}catch{}const o=new Error("Could not read JSON from the model response.");throw o.raw=e,o}function M(n,e){if(Array.isArray(n))return n;if(n&&Array.isArray(n[e]))return n[e];if(n&&typeof n=="object"){const t=Object.values(n).find(Array.isArray);if(t)return t}return[]}const f=n=>typeof n=="string"?n.trim():"",de={id:"subtasks",title:"Suggest subtasks",messages(n,e,t){return[{role:"system",content:S},{role:"user",content:`${k(n,e)}
${B(t)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`}]},parse(n){return M(x(n),"subtasks").map(e=>typeof e=="string"?e:f((e==null?void 0:e.text)??(e==null?void 0:e.title))).map(e=>e.replace(/^[-*]\s*(\[[ xX]\]\s*)?/,"").trim()).filter(Boolean).map(e=>({kind:"subtask",label:e}))}},ue={id:"missing",title:"Find missing tasks",messages(n,e){return[{role:"system",content:S},{role:"user",content:`${k(n,e)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`}]},parse(n){return M(x(n),"tasks").map(e=>{if(typeof e=="string")return{kind:"task",label:e,task:{title:e}};const t=f((e==null?void 0:e.title)??(e==null?void 0:e.name));if(!t)return null;const s=/^\d{4}-\d{2}-\d{2}$/.test(f(e==null?void 0:e.due))?f(e.due):"",r=(Array.isArray(e==null?void 0:e.blocked_by)?e.blocked_by:[]).map(f).filter(Boolean);return{kind:"task",label:t,detail:f((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),task:{title:t,due:s,estimate:f(e==null?void 0:e.estimate),blockedBy:r}}}).filter(Boolean)}},fe={id:"estimate",title:"Estimate duration",messages(n,e,t){return[{role:"system",content:S},{role:"user",content:`${k(n,e)}
${B(t)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`}]},parse(n){const e=x(n),t=f(typeof e=="string"?e:(e==null?void 0:e.estimate)??(e==null?void 0:e.duration)),s=/(\d+(?:\.\d+)?)\s*([hdw])/i.exec(t);if(!s){const o=new Error(`Model returned an unusable estimate: "${t||"(empty)"}"`);throw o.raw=JSON.stringify(e),o}const r=`${Number(s[1])}${s[2].toLowerCase()}`;return[{kind:"estimate",label:r,detail:f((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),estimate:r}]}},Je={subtasks:de,missing:ue,estimate:fe};export{j as A,Je as B,Pe as C,k as D,Ue as E,Ye as F,V as G,Z as H,qe as I,je as J,Le as K,Fe as L,Ie as M,O as N,D as O,J as P,z as Q,K as R,G as S,I as T,U,W as V,P as W,B as X,x as Y,re as Z,Be as _,Ee as a,De as b,Oe as c,Ce as d,Ae as e,ve as f,Te as g,$e as h,xe as i,Se as j,ke as k,_e as l,ye as m,we as n,me as o,be as p,ge as q,he as r,pe as s,Ne as t,h as u,Re as v,We as w,X as x,ee as y,Me as z};
