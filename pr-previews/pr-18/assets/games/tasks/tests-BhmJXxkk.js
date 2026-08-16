import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{_ as W,a as Q,b as H,c as K,d as V,e as Z,f as Y,g as ee,h as te,i as se,j as ne,k as oe,l as ae,m as ie,n as re,o as de,p as le,q as ce,r as pe,s as ue,u as l,G as be,t as I,N as S,O as me,P,Q as R,R as j,S as D,T as $,U as ge,v as he,V as O,z as q,A as z,W as w,K as fe,L as y,M as B,F as E,E as L,H as c,y as f,J as ke,x as we,w as _e,I as x,D as _,X as ye,Y as T,B as k,Z as X,C as N}from"../../prompts-BptJyClW.js";const F=[];let C=null;function b(e){C={name:e,tests:[]},F.push(C)}function s(e,n){C.tests.push({name:e,fn:n})}function o(e,n){if(!e)throw new Error(n||"assertion failed")}function t(e,n,a){const i=JSON.stringify(e),d=JSON.stringify(n);if(i!==d)throw new Error(`${a?`${a}: `:""}expected ${d}, got ${i}`)}function ve(e,n){try{e()}catch{return}throw new Error("expected a throw")}const v=Object.fromEntries(Object.entries(Object.assign({"../demo/_project-q4-hiring.md":ue,"../demo/_project-website.md":pe,"../demo/analytics-dashboard.md":ce,"../demo/billing-integration.md":le,"../demo/component-library.md":de,"../demo/copywriting.md":re,"../demo/design-review.md":ie,"../demo/discovery-interviews.md":ae,"../demo/docs-site.md":oe,"../demo/information-architecture.md":ne,"../demo/interview-loop.md":se,"../demo/job-descriptions.md":te,"../demo/launch.md":ee,"../demo/offers-out.md":Y,"../demo/qa-pass.md":Z,"../demo/self-serve-signup.md":V,"../demo/signup-flow.md":K,"../demo/sourcing.md":H,"../demo/visual-design.md":Q,"../demo/wireframes.md":W})).map(([e,n])=>[e.split("/").pop(),n]));b("frontmatter");s("parses scalars, booleans and flow lists",()=>{const{data:e}=S(`---
a: hello
b: true
c: [x, y]
d: 2026-09-14
---
body
`);t(e,{a:"hello",b:!0,c:["x","y"],d:"2026-09-14"})});s("parses block lists",()=>{const{data:e}=S(`---
people:
  - georg
  - ada
---
`);t(e.people,["georg","ada"])});s("keeps the body verbatim",()=>{const{body:e}=S(`---
a: 1
---
line one

line two
`);t(e,`line one

line two
`)});s("a file without frontmatter is all body",()=>{const{data:e,body:n}=S(`just text
`);t(e,{}),t(n,`just text
`)});s("quotes values that would otherwise change meaning",()=>{const e=me({color:"#2563eb",title:"a: b",flag:"true"});o(e.includes("color: '#2563eb'"),"hash must be quoted"),o(e.includes("title: 'a: b'"),"colon must be quoted"),o(e.includes("flag: 'true'"),'a string "true" must not become a boolean')});s("unknown keys survive a round trip",()=>{const n=P("x.md",`---
id: x
title: X
done: false
cssclass: kanban
---
`);t(n.extra,{cssclass:"kanban"}),o(R(n).includes("cssclass: kanban"),"extra key must be written back")});s("a project file separates its one-line goal from its free-form context",()=>{const e=j("_project-website.md",`---
id: website
title: Website relaunch
goal: Ship self-serve signup
people: [georg, ada]
start: 2026-08-01
end: 2026-11-30
color: '#2563eb'
---
Stripe is set up.

## Open questions
- SOC2?
`);t(e.id,"website"),t(e.color,"#2563eb"),t(e.goal,"Ship self-serve signup"),t(e.people,["georg","ada"]),t(e.context,`Stripe is set up.

## Open questions
- SOC2?`)});s("context keeps its own headings and lists intact",()=>{const e=`---
id: x
title: X
goal: G
---
## Constraints

- one
- two

## Open questions

- three
`;t(D(j("_project-x.md",e)),e)});s("a project file written before the split keeps its body as context, not as a goal",()=>{const e=j("_project-x.md",`---
id: x
title: X
---
Old body prose.
`);t(e.goal,"","nothing is guessed into the goal"),t(e.context,"Old body prose.")});s("a goal containing a colon survives serialisation",()=>{const n=j("_project-x.md",D({id:"x",title:"X",goal:"Ship it: end to end, no humans",people:[],context:""}));t(n.goal,"Ship it: end to end, no humans")});s("empty project fields are omitted rather than written blank",()=>{const e=D({id:"x",title:"X",goal:"",people:[],context:""});o(!e.includes("goal:"),"an empty goal must not be written"),o(!e.includes("people:"),"an empty roster must not be written"),t(e,`---
id: x
title: X
---
`)});s("a project id falls back to the filename",()=>{t(j("_project-q4-hiring.md",`---
title: Q4
---
`).id,"q4-hiring")});s("splits and rebuilds a checklist",()=>{const{notes:e,subtasks:n}=$(`Notes.

- [x] one
- [ ] two
`);t(e,"Notes."),t(n,[{done:!0,text:"one"},{done:!1,text:"two"}]),t(ge(e,n),`Notes.

- [x] one
- [ ] two`)});s("accepts * bullets and upper-case X",()=>{const{subtasks:e}=$(`* [X] done thing
`);t(e,[{done:!0,text:"done thing"}])});s("every demo file is a fixed point of parse -> serialise",()=>{const e=he(I(v)),n=Object.keys(v);o(n.length>=18,`expected the full corpus, got ${n.length}`);for(const a of n)t(e[a],v[a],`${a} did not round-trip`)});s("empty optional keys are omitted rather than written blank",()=>{const e=R(P("x.md",`---
id: x
title: X
done: false
---
`));o(!e.includes("due:"),"an absent due date must not be written"),o(!e.includes("people:"),"an empty people list must not be written"),o(e.includes("done: false"),"done is always written")});b("ids");s("slugifies titles",()=>{t(O("Design Review!"),"design-review"),t(O("  Ship  it  "),"ship-it")});s("transliterates letters with no NFKD decomposition",()=>{t(O("Réunion Ærø søk"),"reunion-aero-sok")});s("never produces an empty slug",()=>{t(O("!!!"),"task")});s("suffixes on collision",()=>{t(q("Design review",["design-review"]),"design-review-2"),t(q("Design review",["design-review","design-review-2"]),"design-review-3"),t(q("Design review",[]),"design-review")});b("dates and estimates");s("parses and formats ISO dates in UTC",()=>{t(z(l("2026-09-14")),"2026-09-14"),t(l(""),null),t(l("not a date"),null)});s("parses durations into hours",()=>{t(w("2h"),2),t(w("3d"),24),t(w("1w"),40),t(w("1.5d"),12)});s("free-form estimates are kept but not counted",()=>{t(w("a while"),null),t(fe([{estimate:"1d"},{estimate:"ages"},{estimate:"2h"}]),10)});b("timeline");const m=l("2026-08-01");s("bucket size follows the project span",()=>{t(y(m,l("2026-08-20")).unit,"day"),t(y(m,l("2026-11-30")).unit,"week"),t(y(m,l("2028-08-01")).unit,"month"),t(y(null,null).unit,"week","falls back to weeks")});s("levels are fractional so the now-line can sit between them",()=>{const e=B("week");t(e.level(l("2026-08-08"),m),1),o(Math.abs(e.level(l("2026-08-05"),m)-4/7)<1e-9)});s("month levels follow the calendar, not a fixed width",()=>{const e=B("month");t(Math.floor(e.level(l("2026-09-01"),m)),1),t(Math.floor(e.level(l("2027-01-31"),m)),5)});s("undated tasks land in a tray below the last dated level",()=>{const e=B("week"),n=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-09-05"},{id:"c",due:""}],{levels:a,trayLevel:i}=E(n,{bucket:e,start:m});t(a.get("a"),0),t(a.get("b"),5),t(a.get("c"),i),o(i>5,"the tray sits below every dated task")});s("levels are shifted so the earliest task is level 0",()=>{const e=B("week"),{levels:n}=E([{id:"a",due:"2026-07-01"}],{bucket:e,start:m});t(n.get("a"),0,"a task before the project start still lands at 0")});s("the window widens to cover tasks outside the declared dates",()=>{const e=L({start:"2026-08-01",end:"2026-08-31"},[{due:"2026-12-25"}]);t(z(e.end),"2026-12-25")});b("derived status");const g=[{id:"a",done:!0,subtasks:[],blockedBy:[],due:"2026-01-01"},{id:"b",done:!1,subtasks:[{done:!0,text:"1"},{done:!1,text:"2"}],blockedBy:["a"],due:"2030-01-01"},{id:"c",done:!1,subtasks:[],blockedBy:["b"],due:"2020-01-01"}],p=be(g),u=Date.UTC(2026,0,15);s("progress comes from the checklist",()=>{t(c(g[1],p,u).ratio,.5),t(c(g[1],p,u).checked,1)});s("a completed task reads as fully done regardless of its checklist",()=>{const e=c({...g[1],done:!0},p,u);t(e.ratio,1),o(e.done)});s("blocked means an incomplete prerequisite",()=>{o(!c(g[1],p,u).blocked,"a is done, so b is free"),o(c(g[2],p,u).blocked,"b is open, so c is blocked")});s("overdue means past its deadline and not done",()=>{o(c(g[2],p,u).overdue),o(!c(g[0],p,u).overdue,"done work is never overdue"),o(!c(g[1],p,u).overdue)});s("a task with no deadline is never overdue",()=>{o(!c({due:"",subtasks:[],blockedBy:[]},p,u).overdue)});s("a reference to a task that does not exist does not block",()=>{o(!c({done:!1,subtasks:[],blockedBy:["ghost"],due:""},p,u).blocked)});b("filters");const r=I(v);s("the demo board loads two projects and every task",()=>{t(r.projects.length,2),t(r.tasks.length,Object.keys(v).length-2)});s("filtering by project keeps tasks tagged with it",()=>{const e=f(r.tasks,{projectId:"website"});o(e.length>10,"the website project is the busy one"),o(e.every(n=>n.project.includes("website"))),o(e.some(n=>n.id==="job-descriptions"),"a task in two projects shows in both"),o(f(r.tasks,{projectId:"q4-hiring"}).some(n=>n.id==="job-descriptions"))});s("filtering by person is a union, not an intersection",()=>{const e=f(r.tasks,{people:["ada","sam"]}),n=f(r.tasks,{people:["ada"]});o(e.length>=n.length,"adding a person can only widen the set"),o(e.every(a=>a.people.includes("ada")||a.people.includes("sam")))});s("hideDone drops completed work",()=>{o(f(r.tasks,{hideDone:!0}).every(e=>!e.done))});s("an empty filter is the identity",()=>{t(f(r.tasks,{}).length,r.tasks.length)});s("projectPeople marks roster members, task-only names and their open counts",()=>{const a=ke({id:"p",people:["georg","kim"]},[{id:"a",project:["p"],people:["georg"],done:!1},{id:"b",project:["p"],people:["georg"],done:!0},{id:"c",project:["p"],people:["ada"],done:!1},{id:"d",project:["other"],people:["zoe"],done:!1}]);t(a.map(i=>i.name),["georg","kim","ada"],"roster first, then adopted"),t(a.find(i=>i.name==="georg"),{name:"georg",inRoster:!0,openTasks:1}),t(a.find(i=>i.name==="kim"),{name:"kim",inRoster:!0,openTasks:0}),t(a.find(i=>i.name==="ada"),{name:"ada",inRoster:!1,openTasks:1}),o(!a.some(i=>i.name==="zoe"),"people on other projects are not listed")});s("people and project tags are deduplicated and sorted",()=>{t(we(r.tasks),["ada","georg","mira","sam"]),t(_e(r.tasks),["q4-hiring","website"])});b("edges");s("blocks runs prerequisite -> dependent, part-of runs child -> parent",()=>{const n=x([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:[],partOf:["a"]}],new Map([["a",0],["b",1],["c",1]])),a=n.find(d=>d.kind==="blocks"),i=n.find(d=>d.kind==="part-of");t([a.from,a.to],["a","b"]),t([i.from,i.to],["c","a"])});s("edges to tasks outside the filtered set are dropped",()=>{const e=x([{id:"b",blockedBy:["a"],partOf:[]}],new Map([["b",1]]));t(e,[])});s("a prerequisite due after its dependent is flagged as a conflict",()=>{const e=[{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]}];o(x(e,new Map([["a",5],["b",2]]))[0].conflict,"blocker below dependent"),o(!x(e,new Map([["a",2],["b",5]]))[0].conflict,"normal order")});s("the demo project has no scheduling conflicts",()=>{const e=f(r.tasks,{projectId:"website"}),n=L(r.projects.find(i=>i.id==="website"),e),{levels:a}=E(e,{bucket:y(n.start,n.end),start:n.start});t(x(e,a).filter(i=>i.conflict),[])});b("LLM brief");s("includes the goal, a task table and the dependency list",()=>{const e=r.projects.find(i=>i.id==="website"),n=f(r.tasks,{projectId:"website"}),a=_(e,n,{now:Date.UTC(2026,7,16)});o(a.includes("# Website relaunch"),"title"),o(a.includes("## Goal"),"goal section"),o(a.includes("## Context"),"context section"),o(a.includes("| id | task | due | estimate | people | subtasks |"),"table header"),o(a.includes("| wireframes | Wireframes |"),"a task row keyed by its id"),o(a.includes("- wireframes blocked-by information-architecture"),"dependency"),o(a.includes("- signup-flow part-of self-serve-signup"),"part-of dependency")});s("goal and context are separate labelled sections",()=>{const e=_({title:"P",goal:"Ship it",context:`Stripe is set up.

## Open questions
- SOC2?`},[]);o(e.includes(`## Goal
Ship it`),"goal section"),o(e.includes(`## Context
Stripe is set up.`),"context section"),o(e.indexOf("## Goal")<e.indexOf("## Context"),"goal comes first"),o(e.includes("- SOC2?"),"context goes verbatim, headings and all")});s("each section is dropped cleanly when empty",()=>{const e=_({title:"P",goal:"Ship it",context:""},[]);o(e.includes("## Goal"),"goal kept"),o(!e.includes("## Context"),"no empty context heading");const n=_({title:"P",goal:"",context:"Background."},[]);o(!n.includes("## Goal"),"no empty goal heading"),o(n.includes("## Context"),"context kept")});s("escapes pipes so a title cannot break the table",()=>{const e=_({title:"P"},[{id:"x",title:"a | b",project:[],people:[],subtasks:[],blockedBy:[],partOf:[]}]);o(e.includes("a \\| b"),"pipe must be escaped")});s("an empty project still produces a well-formed brief",()=>{const e=_({title:"Empty",goal:""},[]);o(e.includes("_no tasks yet_")),o(e.includes("_none recorded_"))});s("the task brief lists existing subtasks",()=>{const e=r.tasks.find(a=>a.id==="wireframes"),n=ye(e);o(n.includes("id: wireframes")),o(n.includes("- [x] Landing page"))});b("LLM response parsing");s("reads a fenced JSON block",()=>{t(T('Sure!\n```json\n{"a": 1}\n```\n'),{a:1})});s("reads bare JSON with chatter around it",()=>{t(T('Here: {"a": 1} hope that helps'),{a:1})});s("reads an unfenced array",()=>{t(T("[1, 2]"),[1,2])});s("throws with the raw text attached when there is no JSON",()=>{try{throw T("no json here"),new Error("should have thrown")}catch(e){t(e.raw,"no json here")}});s("subtask suggestions are cleaned of list markers",()=>{const e=k.subtasks.parse('```json\n{"subtasks":["- [ ] Draft copy","* Review"]}\n```');t(e.map(n=>n.label),["Draft copy","Review"]),o(e.every(n=>n.kind==="subtask"))});s("subtask suggestions tolerate objects instead of strings",()=>{const e=k.subtasks.parse('{"subtasks":[{"text":"One"},{"title":"Two"}]}');t(e.map(n=>n.label),["One","Two"])});s("missing-task suggestions keep ids, dates and estimates",()=>{const e=k.missing.parse('{"tasks":[{"title":"QA","due":"2026-11-01","estimate":"2d","blocked_by":["copy"],"why":"untested"}]}');t(e[0].task,{title:"QA",due:"2026-11-01",estimate:"2d",blockedBy:["copy"]}),t(e[0].detail,"untested")});s("a malformed due date is dropped rather than trusted",()=>{const e=k.missing.parse('{"tasks":[{"title":"QA","due":"next tuesday"}]}');t(e[0].task.due,"")});s("a suggestion with no title is discarded",()=>{t(k.missing.parse('{"tasks":[{"why":"no title"},{"title":"Real"}]}').length,1)});s("estimates are normalised to a unit the model layer understands",()=>{t(k.estimate.parse('{"estimate":"3 D","why":"x"}')[0].estimate,"3d"),t(w(k.estimate.parse('{"estimate":"about 2w"}')[0].estimate),80)});s("an unusable estimate throws instead of writing nonsense",()=>{ve(()=>k.estimate.parse('{"estimate":"quite a while"}'))});b("zip");s("crc32 matches the reference value",()=>{const e=new TextEncoder().encode("The quick brown fox jumps over the lazy dog");t(X(e),1095738169)});s("crc32 of the empty input is zero",()=>{t(X(new Uint8Array(0)),0)});s("writes the PKZIP signatures and one central record per file",()=>{const e=N({"a.md":"alpha","b.md":"beta"}),n=new DataView(e.buffer,e.byteOffset,e.byteLength);t(n.getUint32(0,!0),67324752,"local file header");let a=0,i=0;for(let d=0;d+4<=e.length;d+=1){const h=n.getUint32(d,!0);h===67324752&&(a+=1),h===33639248&&(i+=1)}t(a,2),t(i,2),t(n.getUint32(e.length-22,!0),101010256,"end of central directory"),t(n.getUint16(e.length-22+10,!0),2,"entry count")});s("stores UTF-8 content at its byte length, not its character length",()=>{const e=N({"a.md":"café"}),n=new DataView(e.buffer,e.byteOffset,e.byteLength);t(n.getUint32(18,!0),5,"four characters, five bytes"),t(n.getUint16(6,!0),2048,"the UTF-8 flag is set")});s("an empty archive is still well formed",()=>{const e=N({});t(e.length,22)});const U=document.getElementById("out");let A=0,M=0;for(const{name:e,tests:n}of F){const a=document.createElement("h2");a.textContent=e,U.append(a);for(const{name:i,fn:d}of n){const h=document.createElement("div");try{d(),h.className="pass",h.textContent=`✓ ${i}`,A+=1}catch(J){h.className="fail",h.textContent=`✗ ${i} — ${J.message}`,M+=1}U.append(h)}}const G=document.getElementById("summary");G.textContent=`${A} passed, ${M} failed`;G.className=M?"fail":"pass";
