const ue=`---
id: q4-hiring
title: Q4 hiring
start: 2026-09-01
end: 2026-12-15
color: '#7c3aed'
---
Grow the product team by two engineers and one designer before the end of the year,
without lowering the bar or burning three months of everyone's calendar on interviews.
`,fe=`---
id: website
title: Website relaunch
start: 2026-08-01
end: 2026-11-30
color: '#2563eb'
---
Replace the hand-rolled marketing site with a maintained one, and let customers sign up
and pay without talking to us first. Success is a visitor going from landing page to a
paid account with no human in the loop, and a docs site the support team can edit.
`,pe=`---
id: analytics-dashboard
title: Analytics dashboard
project: [website]
people: [ada]
estimate: 1w
created: 2026-08-09
done: false
---
Wanted, not scheduled. Sits in the unscheduled tray until it earns a deadline.
`,ge=`---
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
`,he=`---
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
`,be=`---
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
`,me=`---
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
`,we=`---
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
`,ye=`---
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
`,_e=`---
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
`,ke=`---
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
`,Se=`---
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
`,xe=`---
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
`,$e=`---
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
`,Te=`---
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
`,Ae=`---
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
`,Ce=`---
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
`,Oe=`---
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
`,$=["id","title","project","people","due","estimate","created","done","blocked-by","part-of"],C=new Set(["project","people","blocked-by","part-of"]),L=/^\s*[-*]\s+\[([ xX])\]\s?(.*)$/;function D(n){const e=n.trim();return e.length>=2&&(e[0]==='"'||e[0]==="'")&&e[e.length-1]===e[0]?e.slice(1,-1):e}function T(n){const e=n.trim();return e===""?"":e==="true"?!0:e==="false"?!1:e==="null"||e==="~"?null:D(e)}function F(n){const e=n.trim().slice(1,-1).trim();if(e==="")return[];const t=[];let o="",r=null;for(const s of e)r?(s===r&&(r=null),o+=s):s==='"'||s==="'"?(r=s,o+=s):s===","?(t.push(o),o=""):o+=s;return t.push(o),t.map(s=>D(s)).filter(s=>s!=="")}function E(n){const e=String(n).replace(/\r\n/g,`
`);if(!e.startsWith(`---
`))return{data:{},body:e.replace(/^\n+/,"")};const t=e.indexOf(`
---`,3);if(t===-1)return{data:{},body:e};const o=e.slice(4,t+1),r=e.indexOf(`
`,t+1),s=r===-1?"":e.slice(r+1),a={},c=o.split(`
`);let l=null;for(const i of c){if(i.trim()===""||i.trimStart().startsWith("#"))continue;const d=/^\s*-\s+(.*)$/.exec(i);if(d&&l){a[l].push(T(d[1]));continue}const h=/^([A-Za-z0-9_][A-Za-z0-9_-]*)\s*:\s*(.*)$/.exec(i);if(!h)continue;const[,u,p]=h;l=null,p.trim()===""?(a[u]=[],l=u):p.trim().startsWith("[")&&p.trim().endsWith("]")?a[u]=F(p):a[u]=T(p)}for(const[i,d]of Object.entries(a))Array.isArray(d)&&d.length===0&&!C.has(i)&&(a[i]="");return{data:a,body:s}}function j(n){const e=String(n);return e===""||/^[#&*!|>%@`?-]/.test(e)||/[:,[\]{}]/.test(e)||e!==e.trim()||["true","false","null","~"].includes(e)}function A(n){return typeof n=="boolean"||typeof n=="number"?String(n):n==null?"":j(n)?`'${String(n).replace(/'/g,"''")}'`:String(n)}function R(n,e){return Array.isArray(e)||C.has(n)?`[${(Array.isArray(e)?e:[e].filter(o=>o!==""&&o!=null)).map(A).join(", ")}]`:A(e)}function O(n,e=""){const o=[...$.filter(s=>s in n),...Object.keys(n).filter(s=>!$.includes(s))].map(s=>`${s}: ${R(s,n[s])}`),r=String(e).replace(/\s+$/,"");return`---
${o.join(`
`)}
---
${r?`${r}
`:""}`}function U(n){const e=[],t=[];for(const o of String(n).split(`
`)){const r=L.exec(o);r?e.push({done:r[1].toLowerCase()==="x",text:r[2].trim()}):t.push(o)}return{notes:t.join(`
`).trim(),subtasks:e}}function I(n,e=[]){const t=e.map(r=>`- [${r.done?"x":" "}] ${r.text}`).join(`
`),o=String(n||"").trim();return o?t?`${o}

${t}`:o:t}const _="_project-",b=864e5,N={æ:"ae",ø:"o",å:"a",ß:"ss",ð:"d",þ:"th",ł:"l",đ:"d"};function Y(n){return String(n).toLowerCase().replace(/[æøåßðþłđ]/g,t=>N[t]).normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"task"}function ve(n,e){const t=Y(n),o=e instanceof Set?e:new Set(e);if(!o.has(t))return t;for(let r=2;;r+=1){const s=`${t}-${r}`;if(!o.has(s))return s}}function g(n){if(n==null||n==="")return null;const e=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(n).trim());if(!e)return null;const t=Date.UTC(Number(e[1]),Number(e[2])-1,Number(e[3]));return Number.isNaN(t)?null:t}function W(n){return n==null?"":new Date(n).toISOString().slice(0,10)}const P={h:1,d:8,w:40};function q(n){if(n==null||n==="")return null;const e=String(n).trim().toLowerCase(),t=/^(\d+(?:\.\d+)?)\s*([hdw])$/.exec(e);return t?Number(t[1])*P[t[2]]:null}function Be(n){return n.reduce((e,t)=>e+(q(t.estimate)??0),0)}function y(n){return n==null||n===""?[]:(Array.isArray(n)?n:[n]).map(e=>String(e).trim()).filter(Boolean)}function J(n,e){const{data:t,body:o}=E(e),{notes:r,subtasks:s}=U(o),a=String(n).replace(/\.md$/i,"");return{id:String(t.id||a),title:String(t.title||a),project:y(t.project),people:y(t.people),due:t.due?String(t.due):"",estimate:t.estimate?String(t.estimate):"",created:t.created?String(t.created):"",done:t.done===!0,blockedBy:y(t["blocked-by"]),partOf:y(t["part-of"]),notes:r,subtasks:s,extra:Object.fromEntries(Object.entries(t).filter(([c])=>!["id","title","project","people","due","estimate","created","done","blocked-by","part-of"].includes(c)))}}function v(n,e=[]){return Object.fromEntries(Object.entries(n).filter(([t,o])=>e.includes(t)?!0:Array.isArray(o)?o.length>0:o!==""&&o!=null))}function z(n){const e=v({id:n.id,title:n.title,project:n.project??[],people:n.people??[],due:n.due??"",estimate:n.estimate??"",created:n.created??"",done:!!n.done,"blocked-by":n.blockedBy??[],"part-of":n.partOf??[],...n.extra??{}},["id","title","done"]);return O(e,I(n.notes,n.subtasks))}function G(n,e){const{data:t,body:o}=E(e),r=String(n).replace(/\.md$/i,"").replace(new RegExp(`^${_}`),"");return{id:String(t.id||r),title:String(t.title||r),start:t.start?String(t.start):"",end:t.end?String(t.end):"",color:t.color?String(t.color):"",goal:String(o).trim()}}function K(n){return O(v({id:n.id,title:n.title,start:n.start??"",end:n.end??"",color:n.color??""},["id","title"]),n.goal??"")}const H=n=>`${n.id}.md`,Q=n=>`${_}${n.id}.md`;function Me(n){const e=[],t=[];for(const[o,r]of Object.entries(n)){if(!/\.md$/i.test(o))continue;const s=o.split("/").pop();s.startsWith(_)?t.push(G(s,r)):e.push(J(s,r))}return e.sort((o,r)=>o.id.localeCompare(r.id)),t.sort((o,r)=>o.id.localeCompare(r.id)),{tasks:e,projects:t}}function Le({tasks:n,projects:e}){const t={};for(const o of e)t[Q(o)]=K(o);for(const o of n)t[H(o)]=z(o);return t}const m={day:{unit:"day",label:"Days",level(n,e){return(n-e)/b},dateForLevel(n,e){return e+n*b},format(n){return new Date(n).toISOString().slice(5,10).replace("-","/")}},week:{unit:"week",label:"Weeks",level(n,e){return(n-e)/(7*b)},dateForLevel(n,e){return e+n*7*b},format(n){return`${new Date(n).toISOString().slice(5,10).replace("-","/")}`}},month:{unit:"month",label:"Months",level(n,e){const t=new Date(e),o=new Date(n),r=(o.getUTCFullYear()-t.getUTCFullYear())*12+(o.getUTCMonth()-t.getUTCMonth()),s=Date.UTC(o.getUTCFullYear(),o.getUTCMonth(),1),a=Date.UTC(o.getUTCFullYear(),o.getUTCMonth()+1,1);return r+(n-s)/(a-s)},dateForLevel(n,e){const t=new Date(e);return Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+Math.round(n),1)},format(n){const e=new Date(n);return`${e.toLocaleString("en",{month:"short",timeZone:"UTC"})} ${e.getUTCFullYear()}`}}};function Fe(n,e){if(n==null||e==null||e<=n)return m.week;const t=(e-n)/b;return t<=31?m.day:t<=240?m.week:m.month}function je(n){return m[n]??m.week}function Re(n,e){const t=e.map(i=>g(i.due)).filter(i=>i!=null),o=g(n==null?void 0:n.start),r=g(n==null?void 0:n.end),s=[o,...t].filter(i=>i!=null),a=[r,...t].filter(i=>i!=null),c=s.length?Math.min(...s):Date.now(),l=a.length?Math.max(...a):c+30*b;return{start:c,end:Math.max(l,c)}}function Ue(n,{bucket:e,start:t}){const o=new Map;for(const i of n){const d=g(i.due);d!=null&&o.set(i.id,Math.floor(e.level(d,t)))}const r=[...o.values()],s=r.length?Math.min(...r):0,c=(r.length?Math.max(...r):0)-s+2,l=new Map;for(const i of n)l.set(i.id,o.has(i.id)?o.get(i.id)-s:c);return{levels:l,trayLevel:c,minLevel:s}}function V(n,e,t=Date.now()){var c,l;const o=((c=n.subtasks)==null?void 0:c.length)??0,r=((l=n.subtasks)==null?void 0:l.filter(i=>i.done).length)??0,s=g(n.due),a=(n.blockedBy??[]).filter(i=>e.has(i)&&!e.get(i).done);return{done:!!n.done,total:o,checked:r,ratio:n.done?1:o===0?0:r/o,started:!n.done&&r>0,blocked:!n.done&&a.length>0,blockers:a,overdue:!n.done&&s!=null&&s<t}}const X=n=>new Map(n.map(e=>[e.id,e]));function Ie(n){return[...new Set(n.flatMap(e=>e.people??[]))].sort((e,t)=>e.localeCompare(t))}function Ne(n){return[...new Set(n.flatMap(e=>e.project??[]))].sort((e,t)=>e.localeCompare(t))}function Ye(n,{projectId:e=null,people:t=[],hideDone:o=!1}={}){const r=new Set(t);return n.filter(s=>!(e&&!(s.project??[]).includes(e)||r.size>0&&!(s.people??[]).some(a=>r.has(a))||o&&s.done))}function We(n,e){const t=new Set(n.map(r=>r.id)),o=[];for(const r of n){for(const s of r.blockedBy??[]){if(!t.has(s))continue;const a=((e==null?void 0:e.get(s))??0)>((e==null?void 0:e.get(r.id))??0);o.push({id:`blocks:${s}->${r.id}`,from:s,to:r.id,kind:"blocks",conflict:a})}for(const s of r.partOf??[])t.has(s)&&o.push({id:`part-of:${r.id}->${s}`,from:r.id,to:s,kind:"part-of",conflict:!1})}return o}const Z=67324752,ee=33639248,ne=101010256,te=(()=>{const n=new Uint32Array(256);for(let e=0;e<256;e+=1){let t=e;for(let o=0;o<8;o+=1)t=t&1?3988292384^t>>>1:t>>>1;n[e]=t>>>0}return n})();function se(n){let e=4294967295;for(let t=0;t<n.length;t+=1)e=te[(e^n[t])&255]^e>>>8;return(e^4294967295)>>>0}function oe(n){const e=Math.max(1980,n.getFullYear());return{time:n.getHours()<<11|n.getMinutes()<<5|Math.floor(n.getSeconds()/2),date:e-1980<<9|n.getMonth()+1<<5|n.getDate()}}class re{constructor(){this.chunks=[],this.length=0}bytes(e){this.chunks.push(e),this.length+=e.length}u16(e){this.bytes(new Uint8Array([e&255,e>>>8&255]))}u32(e){this.bytes(new Uint8Array([e&255,e>>>8&255,e>>>16&255,e>>>24&255]))}concat(){const e=new Uint8Array(this.length);let t=0;for(const o of this.chunks)e.set(o,t),t+=o.length;return e}}function Pe(n,e=new Date){const t=new TextEncoder,{time:o,date:r}=oe(e),s=new re,a=[];for(const[i,d]of Object.entries(n)){const h=t.encode(i),u=t.encode(d),p=se(u);a.push({nameBytes:h,size:u.length,crc:p,offset:s.length}),s.u32(Z),s.u16(20),s.u16(2048),s.u16(0),s.u16(o),s.u16(r),s.u32(p),s.u32(u.length),s.u32(u.length),s.u16(h.length),s.u16(0),s.bytes(h),s.bytes(u)}const c=s.length;for(const i of a)s.u32(ee),s.u16(20),s.u16(20),s.u16(2048),s.u16(0),s.u16(o),s.u16(r),s.u32(i.crc),s.u32(i.size),s.u32(i.size),s.u16(i.nameBytes.length),s.u16(0),s.u16(0),s.u16(0),s.u16(0),s.u32(0),s.u32(i.offset),s.bytes(i.nameBytes);const l=s.length-c;return s.u32(ne),s.u16(0),s.u16(0),s.u16(a.length),s.u16(a.length),s.u32(l),s.u32(c),s.u16(0),s.concat()}const w=n=>String(n??"").replace(/\|/g,"\\|").replace(/\n+/g," ").trim(),ie=n=>(n.people??[]).join(", ");function ae(n){return n.done?"done":n.total===0?"—":`${n.checked}/${n.total}`}function k(n,e,{now:t=Date.now()}={}){const o=X(e),r=[];r.push(`# ${(n==null?void 0:n.title)||"Untitled project"}`),n!=null&&n.goal&&r.push("","## Goal",n.goal.trim());const s=[n==null?void 0:n.start,n==null?void 0:n.end].filter(Boolean);r.push(""),s.length===2&&r.push(`Window: ${n.start} → ${n.end}`),r.push(`Today: ${W(t)}`),r.push("","## Tasks","","| id | task | due | estimate | people | subtasks |"),r.push("|----|------|-----|----------|--------|----------|");const a=[...e].sort((l,i)=>(g(l.due)??1/0)-(g(i.due)??1/0));for(const l of a){const i=V(l,o,t);r.push(`| ${w(l.id)} | ${w(l.title)} | ${w(l.due)||"—"} | ${w(l.estimate)||"—"} | ${w(ie(l))||"—"} | ${ae(i)} |`)}a.length===0&&r.push("| — | _no tasks yet_ | — | — | — | — |");const c=[];for(const l of a){for(const i of l.blockedBy??[])o.has(i)&&c.push(`- ${l.id} blocked-by ${i}`);for(const i of l.partOf??[])o.has(i)&&c.push(`- ${l.id} part-of ${i}`)}return r.push("","## Dependencies",""),r.push(c.length?c.join(`
`):"_none recorded_"),`${r.join(`
`)}
`}function B(n){var t,o;const e=[`## Task: ${n.title}`,`id: ${n.id}`];if(n.due&&e.push(`due: ${n.due}`),n.estimate&&e.push(`current estimate: ${n.estimate}`),(t=n.people)!=null&&t.length&&e.push(`people: ${n.people.join(", ")}`),n.notes&&e.push("",n.notes.trim()),(o=n.subtasks)!=null&&o.length){e.push("","Existing subtasks:");for(const r of n.subtasks)e.push(`- [${r.done?"x":" "}] ${r.text}`)}else e.push("","Existing subtasks: none");return`${e.join(`
`)}
`}const S=`You are a concise project planning assistant.
You reply with a single fenced JSON code block and nothing else — no preamble, no commentary.
Reference existing tasks only by the exact id given in the brief.
Prefer few, high-value suggestions over exhaustive lists.`;function x(n){const e=String(n??"").trim(),t=[],o=/```(?:json)?\s*\n?([\s\S]*?)```/gi;for(let a=o.exec(e);a;a=o.exec(e))t.push(a[1]);const r=e.search(/[[{]/);if(r!==-1){const a=Math.max(e.lastIndexOf("]"),e.lastIndexOf("}"));a>r&&t.push(e.slice(r,a+1))}t.push(e);for(const a of t)try{return JSON.parse(a.trim())}catch{}const s=new Error("Could not read JSON from the model response.");throw s.raw=e,s}function M(n,e){if(Array.isArray(n))return n;if(n&&Array.isArray(n[e]))return n[e];if(n&&typeof n=="object"){const t=Object.values(n).find(Array.isArray);if(t)return t}return[]}const f=n=>typeof n=="string"?n.trim():"",le={id:"subtasks",title:"Suggest subtasks",messages(n,e,t){return[{role:"system",content:S},{role:"user",content:`${k(n,e)}
${B(t)}
Propose up to 7 concrete subtasks that would complete this task. Skip anything already listed.
Reply with JSON: {"subtasks": ["...", "..."]}`}]},parse(n){return M(x(n),"subtasks").map(e=>typeof e=="string"?e:f((e==null?void 0:e.text)??(e==null?void 0:e.title))).map(e=>e.replace(/^[-*]\s*(\[[ xX]\]\s*)?/,"").trim()).filter(Boolean).map(e=>({kind:"subtask",label:e}))}},ce={id:"missing",title:"Find missing tasks",messages(n,e){return[{role:"system",content:S},{role:"user",content:`${k(n,e)}
Given the goal above, what tasks appear to be missing? Propose at most 5.
For each, give a short title, an optional due date within the project window (YYYY-MM-DD),
an optional estimate like "2h", "3d" or "1w", and optionally the ids of existing tasks it
would be blocked by. Reply with JSON:
{"tasks": [{"title": "...", "due": "YYYY-MM-DD", "estimate": "3d", "blocked_by": ["id"], "why": "..."}]}`}]},parse(n){return M(x(n),"tasks").map(e=>{if(typeof e=="string")return{kind:"task",label:e,task:{title:e}};const t=f((e==null?void 0:e.title)??(e==null?void 0:e.name));if(!t)return null;const o=/^\d{4}-\d{2}-\d{2}$/.test(f(e==null?void 0:e.due))?f(e.due):"",r=(Array.isArray(e==null?void 0:e.blocked_by)?e.blocked_by:[]).map(f).filter(Boolean);return{kind:"task",label:t,detail:f((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),task:{title:t,due:o,estimate:f(e==null?void 0:e.estimate),blockedBy:r}}}).filter(Boolean)}},de={id:"estimate",title:"Estimate duration",messages(n,e,t){return[{role:"system",content:S},{role:"user",content:`${k(n,e)}
${B(t)}
How long should this task take for one person? Answer in hours (e.g. "6h"), days ("3d")
or weeks ("1w"), assuming an 8-hour day and a 5-day week.
Reply with JSON: {"estimate": "3d", "why": "..."}`}]},parse(n){const e=x(n),t=f(typeof e=="string"?e:(e==null?void 0:e.estimate)??(e==null?void 0:e.duration)),o=/(\d+(?:\.\d+)?)\s*([hdw])/i.exec(t);if(!o){const s=new Error(`Model returned an unusable estimate: "${t||"(empty)"}"`);throw s.raw=JSON.stringify(e),s}const r=`${Number(o[1])}${o[2].toLowerCase()}`;return[{kind:"estimate",label:r,detail:f((e==null?void 0:e.why)??(e==null?void 0:e.rationale)),estimate:r}]}},qe={subtasks:le,missing:ce,estimate:de};export{W as A,qe as B,Pe as C,k as D,Re as E,Ue as F,X as G,V as H,We as I,Be as J,Fe as K,je as L,E as M,O as N,J as O,z as P,G as Q,U as R,I as S,Y as T,q as U,B as V,x as W,se as X,Oe as _,Ee as a,De as b,Ce as c,Ae as d,Te as e,$e as f,xe as g,Se as h,ke as i,_e as j,ye as k,we as l,me as m,be as n,he as o,ge as p,pe as q,fe as r,ue as s,Me as t,g as u,Le as v,Ne as w,Ie as x,Ye as y,ve as z};
