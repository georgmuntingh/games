import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{_ as Te,a as $e,b as We,c as De,d as Ee,e as Me,f as qe,g as Ce,h as Le,j as Ie,k as Ne,l as Pe,m as Fe,n as Ae,o as Ge,p as Re,q as Ue,r as ze,s as Je,t as Xe,z as v,P as He,x as k,$ as Y,a0 as Ke,a1 as y,a2 as $,a3 as A,a4 as K,a5 as fe,a6 as Qe,u as w,a7 as V,E as oe,F as ee,a8 as G,U as Ze,W as X,X as S,O,N as ge,Q as j,A as L,v as Ve,C as Ye,B as et,R as F,T as W,G as tt,S as ue,V as I,I as he,i as g,M as J,K as U,a9 as be,H as D,y as N,aa as ye,Z as H,ab as re,ac as pe,ad as ne,D as st,ae as te,af as ve,J as me,Y as b,ag as de,w as je,L as _e}from"../../prompts-D5jtSQLS.js";const xe=[];let le=null;function c(e){le={name:e,tests:[]},xe.push(le)}function a(e,s){le.tests.push({name:e,fn:s})}function n(e,s){if(!e)throw new Error(s||"assertion failed")}function t(e,s,o){const i=JSON.stringify(e),d=JSON.stringify(s);if(i!==d)throw new Error(`${o?`${o}: `:""}expected ${d}, got ${i}`)}function at(e,s){try{e()}catch{return}throw new Error("expected a throw")}const R=Object.fromEntries(Object.entries(Object.assign({"../demo/_project-q4-hiring.md":Xe,"../demo/_project-website.md":Je,"../demo/analytics-dashboard.md":ze,"../demo/billing-integration.md":Ue,"../demo/component-library.md":Re,"../demo/copywriting.md":Ge,"../demo/design-review.md":Ae,"../demo/discovery-interviews.md":Fe,"../demo/docs-site.md":Pe,"../demo/information-architecture.md":Ne,"../demo/interview-loop.md":Ie,"../demo/job-descriptions.md":Le,"../demo/launch.md":Ce,"../demo/offers-out.md":qe,"../demo/qa-pass.md":Me,"../demo/self-serve-signup.md":Ee,"../demo/signup-flow.md":De,"../demo/sourcing.md":We,"../demo/visual-design.md":$e,"../demo/wireframes.md":Te})).map(([e,s])=>[e.split("/").pop(),s]));c("frontmatter");a("parses scalars, booleans and flow lists",()=>{const{data:e}=Y(`---
a: hello
b: true
c: [x, y]
d: 2026-09-14
---
body
`);t(e,{a:"hello",b:!0,c:["x","y"],d:"2026-09-14"})});a("parses block lists",()=>{const{data:e}=Y(`---
people:
  - georg
  - ada
---
`);t(e.people,["georg","ada"])});a("keeps the body verbatim",()=>{const{body:e}=Y(`---
a: 1
---
line one

line two
`);t(e,`line one

line two
`)});a("a file without frontmatter is all body",()=>{const{data:e,body:s}=Y(`just text
`);t(e,{}),t(s,`just text
`)});a("quotes values that would otherwise change meaning",()=>{const e=Ke({color:"#2563eb",title:"a: b",flag:"true"});n(e.includes("color: '#2563eb'"),"hash must be quoted"),n(e.includes("title: 'a: b'"),"colon must be quoted"),n(e.includes("flag: 'true'"),'a string "true" must not become a boolean')});a("unknown keys survive a round trip",()=>{const s=y("x.md",`---
id: x
title: X
done: false
cssclass: kanban
---
`);t(s.extra,{cssclass:"kanban"}),n($(s).includes("cssclass: kanban"),"extra key must be written back")});a("a project file separates its one-line goal from its free-form context",()=>{const e=A("_project-website.md",`---
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
- SOC2?`)});a("context keeps its own headings and lists intact",()=>{const e=`---
id: x
title: X
goal: G
---
## Constraints

- one
- two

## Open questions

- three
`;t(K(A("_project-x.md",e)),e)});a("a project file written before the split keeps its body as context, not as a goal",()=>{const e=A("_project-x.md",`---
id: x
title: X
---
Old body prose.
`);t(e.goal,"","nothing is guessed into the goal"),t(e.context,"Old body prose.")});a("a goal containing a colon survives serialisation",()=>{const s=A("_project-x.md",K({id:"x",title:"X",goal:"Ship it: end to end, no humans",people:[],context:""}));t(s.goal,"Ship it: end to end, no humans")});a("empty project fields are omitted rather than written blank",()=>{const e=K({id:"x",title:"X",goal:"",people:[],context:""});n(!e.includes("goal:"),"an empty goal must not be written"),n(!e.includes("people:"),"an empty roster must not be written"),t(e,`---
id: x
title: X
---
`)});a("a project id falls back to the filename",()=>{t(A("_project-q4-hiring.md",`---
title: Q4
---
`).id,"q4-hiring")});a("splits and rebuilds a checklist",()=>{const{notes:e,subtasks:s}=fe(`Notes.

- [x] one
- [ ] two
`);t(e,"Notes."),t(s,[{done:!0,text:"one"},{done:!1,text:"two"}]),t(Qe(e,s),`Notes.

- [x] one
- [ ] two`)});a("accepts * bullets and upper-case X",()=>{const{subtasks:e}=fe(`* [X] done thing
`);t(e,[{done:!0,text:"done thing"}])});a("every demo file is a fixed point of parse -> serialise",()=>{const e=w(k(R)),s=Object.keys(R);n(s.length>=18,`expected the full corpus, got ${s.length}`);for(const o of s)t(e[o],R[o],`${o} did not round-trip`)});a("empty optional keys are omitted rather than written blank",()=>{const e=$(y("x.md",`---
id: x
title: X
done: false
---
`));n(!e.includes("due:"),"an absent due date must not be written"),n(!e.includes("people:"),"an empty people list must not be written"),n(e.includes("done: false"),"done is always written")});c("ids");a("slugifies titles",()=>{t(V("Design Review!"),"design-review"),t(V("  Ship  it  "),"ship-it")});a("transliterates letters with no NFKD decomposition",()=>{t(V("Réunion Ærø søk"),"reunion-aero-sok")});a("never produces an empty slug",()=>{t(V("!!!"),"task")});a("suffixes on collision",()=>{t(oe("Design review",["design-review"]),"design-review-2"),t(oe("Design review",["design-review","design-review-2"]),"design-review-3"),t(oe("Design review",[]),"design-review")});c("dates and estimates");a("parses and formats ISO dates in UTC",()=>{t(ee(v("2026-09-14")),"2026-09-14"),t(v(""),null),t(v("not a date"),null)});a("parses durations into hours",()=>{t(G("2h"),2),t(G("3d"),24),t(G("1w"),40),t(G("1.5d"),12)});a("free-form estimates are kept but not counted",()=>{t(G("a while"),null),t(Ze([{estimate:"1d"},{estimate:"ages"},{estimate:"2h"}]),10)});c("timeline");const p=v("2026-08-01");a("bucket size follows the project span",()=>{t(X(p,v("2026-08-20")).unit,"day"),t(X(p,v("2026-11-30")).unit,"week"),t(X(p,v("2028-08-01")).unit,"month"),t(X(null,null).unit,"week","falls back to weeks")});a("levels are fractional so the now-line can sit between them",()=>{const e=S("week");t(e.level(v("2026-08-08"),p),1),n(Math.abs(e.level(v("2026-08-05"),p)-4/7)<1e-9)});a("month levels follow the calendar, not a fixed width",()=>{const e=S("month");t(Math.floor(e.level(v("2026-09-01"),p)),1),t(Math.floor(e.level(v("2027-01-31"),p)),5)});a("undated tasks land in a tray below the last dated level",()=>{const e=S("week"),s=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-09-05"},{id:"c",due:""}],{levels:o,trayLevel:i}=O(s,{bucket:e,start:p});t(o.get("a"),0),t(o.get("b"),5),t(o.get("c"),i),n(i>5,"the tray sits below every dated task")});a("levels are shifted so the earliest task is level 0",()=>{const e=S("week"),{levels:s}=O([{id:"a",due:"2026-07-01"}],{bucket:e,start:p});t(s.get("a"),0,"a task before the project start still lands at 0")});a("the window widens to cover tasks outside the declared dates",()=>{const e=ge({start:"2026-08-01",end:"2026-08-31"},[{due:"2026-12-25"}]);t(ee(e.end),"2026-12-25")});c("derived status");const T=[{id:"a",done:!0,subtasks:[],blockedBy:[],due:"2026-01-01"},{id:"b",done:!1,subtasks:[{done:!0,text:"1"},{done:!1,text:"2"}],blockedBy:["a"],due:"2030-01-01"},{id:"c",done:!1,subtasks:[],blockedBy:["b"],due:"2020-01-01"}],_=He(T),x=Date.UTC(2026,0,15);a("progress comes from the checklist",()=>{t(j(T[1],_,x).ratio,.5),t(j(T[1],_,x).checked,1)});a("a completed task reads as fully done regardless of its checklist",()=>{const e=j({...T[1],done:!0},_,x);t(e.ratio,1),n(e.done)});a("blocked means an incomplete prerequisite",()=>{n(!j(T[1],_,x).blocked,"a is done, so b is free"),n(j(T[2],_,x).blocked,"b is open, so c is blocked")});a("overdue means past its deadline and not done",()=>{n(j(T[2],_,x).overdue),n(!j(T[0],_,x).overdue,"done work is never overdue"),n(!j(T[1],_,x).overdue)});a("a task with no deadline is never overdue",()=>{n(!j({due:"",subtasks:[],blockedBy:[]},_,x).overdue)});a("a reference to a task that does not exist does not block",()=>{n(!j({done:!1,subtasks:[],blockedBy:["ghost"],due:""},_,x).blocked)});c("filters");const m=k(R);a("the demo board loads two projects and every task",()=>{t(m.projects.length,2),t(m.tasks.length,Object.keys(R).length-2)});a("filtering by project keeps tasks tagged with it",()=>{const e=L(m.tasks,{projectId:"website"});n(e.length>10,"the website project is the busy one"),n(e.every(s=>s.project.includes("website"))),n(e.some(s=>s.id==="job-descriptions"),"a task in two projects shows in both"),n(L(m.tasks,{projectId:"q4-hiring"}).some(s=>s.id==="job-descriptions"))});a("filtering by person is a union, not an intersection",()=>{const e=L(m.tasks,{people:["ada","sam"]}),s=L(m.tasks,{people:["ada"]});n(e.length>=s.length,"adding a person can only widen the set"),n(e.every(o=>o.people.includes("ada")||o.people.includes("sam")))});a("hideDone drops completed work",()=>{n(L(m.tasks,{hideDone:!0}).every(e=>!e.done))});a("an empty filter is the identity",()=>{t(L(m.tasks,{}).length,m.tasks.length)});a("projectPeople marks roster members, task-only names and their open counts",()=>{const o=Ve({id:"p",people:["georg","kim"]},[{id:"a",project:["p"],people:["georg"],done:!1},{id:"b",project:["p"],people:["georg"],done:!0},{id:"c",project:["p"],people:["ada"],done:!1},{id:"d",project:["other"],people:["zoe"],done:!1}]);t(o.map(i=>i.name),["georg","kim","ada"],"roster first, then adopted"),t(o.find(i=>i.name==="georg"),{name:"georg",inRoster:!0,openTasks:1}),t(o.find(i=>i.name==="kim"),{name:"kim",inRoster:!0,openTasks:0}),t(o.find(i=>i.name==="ada"),{name:"ada",inRoster:!1,openTasks:1}),n(!o.some(i=>i.name==="zoe"),"people on other projects are not listed")});a("people and project tags are deduplicated and sorted",()=>{t(Ye(m.tasks),["Georg","Oliver","Sverre"]),t(et(m.tasks),["q4-hiring","website"])});c("edges");a("blocks runs prerequisite -> dependent, part-of runs child -> parent",()=>{const s=F([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:[],partOf:["a"]}],new Map([["a",0],["b",1],["c",1]])),o=s.find(d=>d.kind==="blocks"),i=s.find(d=>d.kind==="part-of");t([o.from,o.to],["a","b"]),t([i.from,i.to],["c","a"])});a("edges to tasks outside the filtered set are dropped",()=>{const e=F([{id:"b",blockedBy:["a"],partOf:[]}],new Map([["b",1]]));t(e,[])});a("a prerequisite due after its dependent is flagged as a conflict",()=>{const e=[{id:"a",due:"2026-09-05",blockedBy:[],partOf:[]},{id:"b",due:"2026-08-15",blockedBy:["a"],partOf:[]}];n(F(e,new Map([["a",5],["b",2]]))[0].conflict,"blocker below dependent"),n(!F(e,new Map([["a",2],["b",5]]))[0].conflict,"normal order")});a("the demo project has no scheduling conflicts",()=>{const e=L(m.tasks,{projectId:"website"}),s=ge(m.projects.find(i=>i.id==="website"),e),{levels:o}=O(e,{bucket:X(s.start,s.end),start:s.start});t(F(e,o).filter(i=>i.conflict),[])});c("relations");const Q=()=>[{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:["b"],partOf:[]},{id:"loner",blockedBy:[],partOf:[]}];a("a task can never wait on itself",()=>{n(W(Q(),"a","blockedBy").has("a"),"a is forbidden to itself")});a("anything downstream would close a loop",()=>{const e=W(Q(),"a","blockedBy");n(e.has("b"),"direct dependent"),n(e.has("c"),"dependent two steps out")});a("an unrelated task is always available",()=>{n(!W(Q(),"a","blockedBy").has("loner"),"loner is fine"),n(!W(Q(),"c","blockedBy").has("a"),"c already waits on a upstream")});a("upstream tasks stay available, so the chain can be tightened",()=>{n(!W(Q(),"c","blockedBy").has("b"),"b is already a blocker of c")});a("part-of loops are refused the same way",()=>{const s=W([{id:"parent",blockedBy:[],partOf:[]},{id:"child",blockedBy:[],partOf:["parent"]},{id:"grandchild",blockedBy:[],partOf:["child"]}],"parent","partOf");t([...s].sort(),["child","grandchild","parent"])});a("the two relations are judged independently",()=>{n(!W([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]}],"a","partOf").has("b"),"blocking does not constrain part-of")});a("a missing reference cannot make a loop",()=>{t([...W([{id:"a",blockedBy:["ghost"],partOf:[]}],"a","blockedBy")],["a"])});a("the demo board has no task that could be added to its own blockers",()=>{for(const e of m.tasks)n(W(m.tasks,e.id,"blockedBy").has(e.id),`${e.id} excludes itself`)});c("star and archive");const Oe=(e,s="")=>`---
id: ${e}
title: ${e}
${s}---
`;a("starred and archived round trip, and are written only when set",()=>{const e=A("_project-kitchen.md",Oe("kitchen",`starred: true
archived: true
`));t(e.starred,!0),t(e.archived,!0);const s=K(e);n(/^starred: true$/m.test(s),"starred is written when set"),n(/^archived: true$/m.test(s),"archived is written when set");const o=K({...e,starred:!1,archived:!1});n(!/starred/.test(o)&&!/archived/.test(o),"neither is written when unset")});a("a project file with neither flag reads as neither",()=>{const e=A("_project-kitchen.md",Oe("kitchen"));t(e.starred,!1),t(e.archived,!1)});a("starred projects sort first, the rest keep their order",()=>{const e=tt([{id:"b"},{id:"a"},{id:"z",starred:!0},{id:"c"}]);t(e.map(s=>s.id),["z","a","b","c"])});a("archived projects are hidden unless asked for",()=>{const e=[{id:"a"},{id:"b",archived:!0}];t(ue(e).map(s=>s.id),["a"]),t(ue(e,!0).map(s=>s.id),["a","b"])});c("deleting a project");const E=()=>({projects:[{id:"kitchen",title:"Kitchen",folder:"kitchen"},{id:"website",title:"Website",folder:"website"}],tasks:[{id:"worktop",title:"Worktop",project:["kitchen"]},{id:"shared",title:"Shared",project:["kitchen","website"]},{id:"kitchen-goal",title:"A finished kitchen",project:["kitchen"],goal:!0},{id:"other",title:"Other",project:["website"]}],trash:[]});a("keeping the tasks only strips the tag",()=>{const e=I(E(),"kitchen",{deleteTasks:!1});t(e.removed,[]),t(e.projects.map(s=>s.id),["website"]),t(e.tasks.find(s=>s.id==="worktop").project,[])});a("deleting the tasks takes only the ones this project alone holds",()=>{const e=I(E(),"kitchen",{deleteTasks:!0});t(e.removed.map(s=>s.id),["worktop"]),n(!e.tasks.some(s=>s.id==="worktop"),"the task this project alone held is gone")});a("a task belonging elsewhere survives, and moves to that project",()=>{const e=I(E(),"kitchen",{deleteTasks:!0}),s=e.tasks.find(i=>i.id==="shared");t(s.project,["website"]);const o=Object.keys(w({...E(),...e,tasks:e.tasks}));n(o.includes("website/shared.md"),`shared.md moved to website/ (${o.join(", ")})`)});a("the goal node goes quietly either way, never into the trash",()=>{for(const e of[!1,!0]){const s=I(E(),"kitchen",{deleteTasks:e});n(!s.tasks.some(o=>o.id==="kitchen-goal"),"the goal node is gone"),n(!s.removed.some(o=>o.goal),"and is not in the trash record")}});a("tasks that merely lose the tag are remembered, so a restore can undo that",()=>{const e=I(E(),"kitchen",{deleteTasks:!1});t(e.untagged.sort(),["shared","worktop"]);const s=I(E(),"kitchen",{deleteTasks:!0});t(s.untagged,["shared"]),t(s.removed.map(o=>o.id),["worktop"])});a("deleting a project that does not exist plans nothing",()=>{t(I(E(),"nope",{deleteTasks:!0}),null)});a("tasks in other projects are left completely alone",()=>{const e=I(E(),"kitchen",{deleteTasks:!0});t(e.tasks.find(s=>s.id==="other").project,["website"])});c("project folders");const M={"relaunch-2026/_project-website.md":`---
id: website
title: Website
---
`,"relaunch-2026/wireframes.md":`---
id: wireframes
title: Wireframes
project: website
---
`,"kitchen/_project-kitchen.md":`---
id: kitchen
title: Kitchen
---
`,"kitchen/worktop.md":`---
id: worktop
title: Worktop
project: kitchen
---
`,"odd-job.md":`---
id: odd-job
title: Odd job
---
`},Z=(e,s)=>Object.keys(e).find(o=>o===`${s}.md`||o.endsWith(`/${s}.md`));a("a project remembers the folder it was found in",()=>{const{projects:e}=k(M);t(e.find(s=>s.id==="website").folder,"relaunch-2026"),t(e.find(s=>s.id==="kitchen").folder,"kitchen")});a("a task follows its project, not a folder named after it",()=>{const e=w(k(M));t(Z(e,"wireframes"),"relaunch-2026/wireframes.md"),t(Z(e,"worktop"),"kitchen/worktop.md")});a("a project file lives in its own folder",()=>{n("relaunch-2026/_project-website.md"in w(k(M)),"the project file stays beside its tasks")});a("an untagged task sits at the parent root",()=>{t(Z(w(k(M)),"odd-job"),"odd-job.md")});a("the first tag decides where a task lives",()=>{const e=k({...M,"both.md":`---
id: both
title: Both
project: [kitchen, website]
---
`});t(Z(w(e),"both"),"kitchen/both.md"),t(e.tasks.find(s=>s.id==="both").project,["kitchen","website"])});a("a tag naming no project we have lands at the root",()=>{const e=k({...M,"stray.md":`---
id: stray
title: Stray
project: gardening
---
`});t(Z(w(e),"stray"),"stray.md")});a("the trash belongs to the parent, not to any one project",()=>{const e={...k(M),trash:[{kind:"task",data:{id:"gone"}}]};n("_trash.md"in w(e),"the trash is at the root")});a("a nested board round trips to a fixed point",()=>{const e=w(k(M));t(w(k(e)),e)});const Se={"_project-website.md":`---
id: website
title: Website
---
`,"wireframes.md":`---
id: wireframes
title: Wireframes
project: website
---
`};a("a flat board stays flat",()=>{t(Object.keys(w(k(Se))).sort(),["_project-website.md","wireframes.md"])});a("giving a flat project a folder moves its files into it",()=>{const e=k(Se),s={...e,projects:e.projects.map(o=>({...o,folder:o.id}))};t(Object.keys(w(s)).sort(),["website/_project-website.md","website/wireframes.md"])});a("two folders claiming one id: the first is used",()=>{const{projects:e}=k({"a/_project-website.md":`---
id: website
title: First
---
`,"b/_project-website.md":`---
id: website
title: Second
---
`});t(e.length,1),t(e[0].folder,"a")});a("a clash is reported so the app can say so",()=>{t(he({"a/_project-website.md":"","b/_project-website.md":"","kitchen/_project-kitchen.md":""}),["website"]),t(he(M),[])});c("initials");a("one word gives one letter, two give two",()=>{t(g("Georg"),"G"),t(g("Georg Muntingh"),"GM")});a("only the first two words count",()=>{t(g("Ada Byron King Lovelace"),"AB")});a("separators other than spaces still split",()=>{t(g("ada-lovelace"),"AL"),t(g("ada.lovelace"),"AL"),t(g("ada_lovelace"),"AL")});a("punctuation and stray whitespace are ignored",()=>{t(g("  georg   "),"G"),t(g("O'Brien"),"O")});a("a name with no letters still yields something drawable",()=>{t(g(""),"?"),t(g("   "),"?"),t(g(null),"?")});a("initials come back upper case whatever the name looks like",()=>{t(g("georg muntingh"),"GM")});c("working");const se=()=>[{id:"a",working:!1},{id:"b",working:!0},{id:"c",working:!1}],ae=e=>e.filter(s=>s.working).map(s=>s.id);a("setting one releases whatever held it",()=>{t(ae(J(se(),"c")),["c"])});a("null releases without setting another",()=>{t(ae(J(se(),null)),[])});a("an id that is not on the board leaves nothing marked",()=>{t(ae(J(se(),"ghost")),[])});a("there is never more than one, whatever the input claimed",()=>{t(ae(J([{id:"a",working:!0},{id:"b",working:!0}],"b")),["b"])});a("tasks that do not change are returned by identity",()=>{const e=se(),s=J(e,"b");n(s[0]===e[0],"untouched task is the same object"),n(s[1]===e[1],"the one already set is untouched too")});a("nothing else about a task is disturbed",()=>{t(J([{id:"a",title:"Wireframes",people:["Georg"],working:!1}],"a"),[{id:"a",title:"Wireframes",people:["Georg"],working:!0}])});c("placement and flags");a("a stored x comes back as a number, not the string yaml gives",()=>{const e=y("w.md",["---","id: w","title: W","x: 412","---",""].join(`
`));t(e.x,412),n(typeof e.x=="number","x is a number")});a("an unparseable or missing x is null rather than NaN",()=>{const e=y("w.md",["---","id: w","x: over there","---",""].join(`
`));t(e.x,null),t(y("w.md",["---","id: w","---",""].join(`
`)).x,null)});a("x survives a round trip, including x: 0",()=>{const e=y("w.md",["---","id: w","title: W","x: 0","---",""].join(`
`));t(e.x,0),n(/^x: 0$/m.test($(e)),"x: 0 is written, not dropped as empty")});a("no x means no x line",()=>{const e=$(y("w.md",["---","id: w","---",""].join(`
`)));n(!/^x:/m.test(e),"nothing to say about placement, so nothing written")});a("working is written only when it is set",()=>{const e=y("w.md",["---","id: w","working: true","---",""].join(`
`));t(e.working,!0),n(/^working: true$/m.test($(e)),"set, so written"),n(!/working/.test($({...e,working:!1})),"released, so absent")});a("the two new keys round trip to a fixed point",()=>{const e=$(y("w.md",["---","id: w","title: W","due: 2026-08-15","working: true","x: 412","---","","Body",""].join(`
`)));t($(y("w.md",e)),e)});a("placement and flags do not leak into extra",()=>{const e=y("w.md",["---","id: w","x: 5","working: true","---",""].join(`
`));t(e.extra,{})});c("LLM brief");a("includes the goal, a task table and the dependency list",()=>{const e=m.projects.find(i=>i.id==="website"),s=L(m.tasks,{projectId:"website"}),o=U(e,s,{now:Date.UTC(2026,7,16)});n(o.includes("# Website relaunch"),"title"),n(o.includes("## Goal"),"goal section"),n(o.includes("## Context"),"context section"),n(o.includes("| id | task | due | estimate | people | subtasks |"),"table header"),n(o.includes("| wireframes | Wireframes |"),"a task row keyed by its id"),n(o.includes("- wireframes blocked-by information-architecture"),"dependency"),n(o.includes("- signup-flow part-of self-serve-signup"),"part-of dependency")});a("a task brief carries its existing subtasks and their state",()=>{const e=be({title:"Design review",subtasks:[{done:!0,text:"book the room"},{done:!1,text:"collect feedback"}]});n(e.includes("Existing subtasks:"),"the section is present"),n(e.includes("- [x] book the room"),"ticked state survives"),n(e.includes("- [ ] collect feedback"),"unticked state survives"),n(D.subtasks.messages({title:"P"},[],{title:"Design review",subtasks:[{done:!1,text:"collect feedback"}]}).some(s=>s.content.includes("collect feedback")),"and it reaches the prompt the model actually sees")});a("goal and context are separate labelled sections",()=>{const e=U({title:"P",goal:"Ship it",context:`Stripe is set up.

## Open questions
- SOC2?`},[]);n(e.includes(`## Goal
Ship it`),"goal section"),n(e.includes(`## Context
Stripe is set up.`),"context section"),n(e.indexOf("## Goal")<e.indexOf("## Context"),"goal comes first"),n(e.includes("- SOC2?"),"context goes verbatim, headings and all")});a("each section is dropped cleanly when empty",()=>{const e=U({title:"P",goal:"Ship it",context:""},[]);n(e.includes("## Goal"),"goal kept"),n(!e.includes("## Context"),"no empty context heading");const s=U({title:"P",goal:"",context:"Background."},[]);n(!s.includes("## Goal"),"no empty goal heading"),n(s.includes("## Context"),"context kept")});const z=(e={})=>({id:"w",title:"W",goal:"Ship it",end:"2026-11-30",...e});a("a goal node is created for every project that has a goal",()=>{const{tasks:e}=N({tasks:[],projects:[z()]});t(e.length,1),t(e[0].id,_e("w")),t(e[0].title,"Ship it"),t(e[0].due,"2026-11-30","the goal sits at the project deadline"),n(e[0].goal,"and is marked as the goal node")});a("a goal node follows its project title and deadline",()=>{const e=N({tasks:[],projects:[z()]}).tasks,{tasks:s}=N({tasks:e,projects:[z({goal:"Ship it sooner",end:"2026-10-01"})]});t(s.length,1,"no second node is created"),t(s[0].title,"Ship it sooner"),t(s[0].due,"2026-10-01")});a("clearing the goal hands its node back for deletion",()=>{const e=N({tasks:[],projects:[z()]}).tasks,{tasks:s,removed:o}=N({tasks:e,projects:[z({goal:""})]});t(s.length,0),t(o.map(i=>i.id),[_e("w")])});a("deleting a project hands its goal node back too",()=>{const e=N({tasks:[],projects:[{id:"website",title:"Website",goal:"Ship it",end:"2026-09-01"}]});t(e.tasks.map(o=>o.id),["website-goal"]);const s=N({tasks:e.tasks,projects:[]});t(s.tasks,[]),t(s.removed.map(o=>o.id),["website-goal"])});a("a goal node survives a round-trip through markdown",()=>{const{tasks:e}=N({tasks:[],projects:[z()]}),s=$(e[0]);n(s.includes("goal: true"),"the marker is written"),n(y("w-goal.md",s).goal,"and read back")});a("only tasks nothing depends on feed the goal",()=>{const s=ye([{id:"w-goal",goal:!0,project:["w"]},{id:"a",project:["w"],blockedBy:[]},{id:"b",project:["w"],blockedBy:["a"]},{id:"c",project:["w"],partOf:["b"]}]);t(s,[{from:"b",to:"w-goal"}],"a is depended on, c is part of b")});a("the goal node never links to itself",()=>{t(ye([{id:"w-goal",goal:!0,project:["w"]}]),[])});a("an undated task is not a scheduling conflict",()=>{const e=S("week"),s=[{id:"g",goal:!0,project:["w"],due:"2026-09-01"},{id:"undated",project:["w"],due:""},{id:"late",project:["w"],due:"2026-10-01"}],{levels:o}=O(s,{bucket:e,start:p}),i=F(s,o),d=u=>i.find(f=>f.from===u);n(!d("undated").conflict,"the tray is a position, not a date after the goal"),n(d("late").conflict,"but a real deadline past the goal still is")});a("buildEdges emits goal links alongside stored ones",()=>{const s=F([{id:"w-goal",goal:!0,project:["w"]},{id:"a",project:["w"]}],new Map).map(o=>o.kind);n(s.includes("goal"),"a goal edge is present")});a("merging folds a task into another as checklist items",()=>{const e=[{id:"src",title:"Wireframes",done:!1,subtasks:[{done:!0,text:"lo-fi"}]},{id:"tgt",title:"Design",subtasks:[{done:!1,text:"existing"}]}],{tasks:s,merged:o}=H(e,"src","tgt");t(s.map(i=>i.id),["tgt"],"the source is gone"),t(s[0].subtasks,[{done:!1,text:"existing"},{done:!1,text:"Wireframes"},{done:!0,text:"lo-fi"}],"title first, then its own subtasks, after what was already there"),t(o.id,"src","the merged task is handed back for the trash")});a("merging rewires dependents to the target and drops self-links",()=>{const e=[{id:"src",title:"S",subtasks:[]},{id:"tgt",title:"T",subtasks:[],blockedBy:["src"]},{id:"dep",title:"D",blockedBy:["src"]}],{tasks:s}=H(e,"src","tgt");t(s.find(o=>o.id==="dep").blockedBy,["tgt"]),t(s.find(o=>o.id==="tgt").blockedBy,[],"a task cannot block itself")});a("merging refuses a goal node or a task with itself",()=>{const e=[{id:"a",title:"A",subtasks:[]},{id:"g",title:"G",goal:!0,subtasks:[]}];t(H(e,"a","a"),null),t(H(e,"g","a"),null),t(H(e,"a","g"),null)});a("collapsing empty periods leaves consecutive rows and records the gaps",()=>{const e=S("week"),s=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-08"},{id:"c",due:"2026-09-26"}],o=O(s,{bucket:e,start:p});t([...o.levels.values()],[0,1,8],"ordinarily a level is elapsed time");const i=O(s,{bucket:e,start:p,collapse:!0});t([...i.levels.values()],[0,1,2],"occupied periods become adjacent"),t(i.gaps,[{afterLevel:1,periods:6}],"six empty weeks are recorded")});a("a row still labels its real date, collapsed or not",()=>{const e=S("week"),s=[{id:"a",due:"2026-08-22"},{id:"c",due:"2026-09-26"}],o=(i,d)=>{const{levelOrigin:u,minLevel:f}=O(s,{bucket:e,start:p,...i});return ee(e.dateForLevel(u.get(d)+f,p))};t(o({collapse:!0},0),"2026-08-22"),t(o({collapse:!0},1),"2026-09-26","row 1 points at the week it came from"),t(o({},0),"2026-08-22","and the uncollapsed scale agrees"),t(o({},5),"2026-09-26")});a("uncollapsed, every row in range is a real period",()=>{const e=S("week"),s=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-22"}],{levelOrigin:o}=O(s,{bucket:e,start:p});t([...o.keys()],[0,1,2,3],"the empty weeks between are still rows"),t(ee(e.dateForLevel(o.get(2),p)),"2026-08-15","and each maps to its own date")});a("collapsed, only occupied rows exist",()=>{const e=S("week"),s=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-22"}],{levelOrigin:o}=O(s,{bucket:e,start:p,collapse:!0});t([...o.keys()],[0,1],"the empty weeks are gone entirely")});a("collapsing keeps undated work in its own tray below the last row",()=>{const e=S("week"),s=[{id:"a",due:"2026-08-01"},{id:"u",due:""}],{levels:o,trayLevel:i}=O(s,{bucket:e,start:p,collapse:!0});t(o.get("u"),i),n(i>o.get("a"),"the tray sits below the dated rows")});a("the trash round-trips through its own file",()=>{const e=[{kind:"task",at:"2026-08-16T00:00:00.000Z",label:"A",data:{id:"a",subtasks:[]}}];t(re(pe(e)),e)});a("an empty or unreadable trash file yields no records",()=>{t(re(`---
id: _trash
---
`),[]),t(re("---\nid: _trash\n---\n```json\nnot json\n```\n"),[])});a("the trash file is not mistaken for a task",()=>{const e=k({"_trash.md":pe([{kind:"task",at:"",label:"A",data:{}}])});t(e.tasks,[],"it is board state, not work"),t(e.trash.length,1)});a("the trash keeps the newest and drops past the cap",()=>{let e=[];for(let s=0;s<ne+5;s+=1)e=st(e,{kind:"task",at:"",label:`t${s}`,data:{}});t(e.length,ne),t(e[0].label,`t${ne+4}`,"newest first"),n(!e.some(s=>s.label==="t0"),"the oldest fell off")});a("a board with no deletions writes no trash file",()=>{n(!("_trash.md"in w({tasks:[],projects:[],trash:[]})))});a("escapes pipes so a title cannot break the table",()=>{const e=U({title:"P"},[{id:"x",title:"a | b",project:[],people:[],subtasks:[],blockedBy:[],partOf:[]}]);n(e.includes("a \\| b"),"pipe must be escaped")});a("an empty project still produces a well-formed brief",()=>{const e=U({title:"Empty",goal:""},[]);n(e.includes("_no tasks yet_")),n(e.includes("_none recorded_"))});a("the task brief lists existing subtasks",()=>{const e=m.tasks.find(o=>o.id==="wireframes"),s=be(e);n(s.includes("id: wireframes")),n(s.includes("- [x] Landing page"))});c("LLM response parsing");a("reads a fenced JSON block",()=>{t(te('Sure!\n```json\n{"a": 1}\n```\n'),{a:1})});a("reads bare JSON with chatter around it",()=>{t(te('Here: {"a": 1} hope that helps'),{a:1})});a("reads an unfenced array",()=>{t(te("[1, 2]"),[1,2])});a("throws with the raw text attached when there is no JSON",()=>{try{throw te("no json here"),new Error("should have thrown")}catch(e){t(e.raw,"no json here")}});a("subtask suggestions are cleaned of list markers",()=>{const e=D.subtasks.parse('```json\n{"subtasks":["- [ ] Draft copy","* Review"]}\n```');t(e.map(s=>s.label),["Draft copy","Review"]),n(e.every(s=>s.kind==="subtask"))});a("subtask suggestions tolerate objects instead of strings",()=>{const e=D.subtasks.parse('{"subtasks":[{"text":"One"},{"title":"Two"}]}');t(e.map(s=>s.label),["One","Two"])});a("missing-task suggestions keep ids, dates and estimates",()=>{const e=D.missing.parse('{"tasks":[{"title":"QA","due":"2026-11-01","estimate":"2d","blocked_by":["copy"],"why":"untested"}]}');t(e[0].task,{title:"QA",due:"2026-11-01",estimate:"2d",blockedBy:["copy"]}),t(e[0].detail,"untested")});a("a malformed due date is dropped rather than trusted",()=>{const e=D.missing.parse('{"tasks":[{"title":"QA","due":"next tuesday"}]}');t(e[0].task.due,"")});a("a suggestion with no title is discarded",()=>{t(D.missing.parse('{"tasks":[{"why":"no title"},{"title":"Real"}]}').length,1)});a("estimates are normalised to a unit the model layer understands",()=>{t(D.estimate.parse('{"estimate":"3 D","why":"x"}')[0].estimate,"3d"),t(G(D.estimate.parse('{"estimate":"about 2w"}')[0].estimate),80)});a("an unusable estimate throws instead of writing nonsense",()=>{at(()=>D.estimate.parse('{"estimate":"quite a while"}'))});c("zip");a("crc32 matches the reference value",()=>{const e=new TextEncoder().encode("The quick brown fox jumps over the lazy dog");t(ve(e),1095738169)});a("crc32 of the empty input is zero",()=>{t(ve(new Uint8Array(0)),0)});a("writes the PKZIP signatures and one central record per file",()=>{const e=me({"a.md":"alpha","b.md":"beta"}),s=new DataView(e.buffer,e.byteOffset,e.byteLength);t(s.getUint32(0,!0),67324752,"local file header");let o=0,i=0;for(let d=0;d+4<=e.length;d+=1){const u=s.getUint32(d,!0);u===67324752&&(o+=1),u===33639248&&(i+=1)}t(o,2),t(i,2),t(s.getUint32(e.length-22,!0),101010256,"end of central directory"),t(s.getUint16(e.length-22+10,!0),2,"entry count")});a("stores UTF-8 content at its byte length, not its character length",()=>{const e=me({"a.md":"café"}),s=new DataView(e.buffer,e.byteOffset,e.byteLength);t(s.getUint32(18,!0),5,"four characters, five bytes"),t(s.getUint16(6,!0),2048,"the UTF-8 flag is set")});a("an empty archive is still well formed",()=>{const e=me({});t(e.length,22)});c("same file");const l=`---
id: wireframes
title: Wireframes
project: [website]
done: false
---
Some notes.

- [ ] first
- [x] second
`;a("a file is the same as itself",()=>{n(b("wireframes.md",l,l))});a("key order, quoting, CRLF and checklist position do not change meaning",()=>{const e=`---\r
title: "Wireframes"\r
project:\r
  - website\r
id: wireframes\r
done: false\r
---\r
- [ ] first\r
Some notes.\r
- [x] second\r
`;n(e!==l,"the two should differ as bytes"),n(b("wireframes.md",l,e))});a("a real change is still a change",()=>{n(!b("wireframes.md",l,l.replace("done: false","done: true"))),n(!b("wireframes.md",l,l.replace("Some notes.","Other notes."))),n(!b("wireframes.md",l,l.replace("- [ ] first","- [x] first")))});a("projects and the trash canonicalise too",()=>{const e=`---
id: website
title: Website
starred: true
---
Context.
`;n(b("website/_project-website.md",e,`---
title: Website
starred: true
id: website
---

Context.

`)),n(!b("website/_project-website.md",e,e.replace("Context.","Different.")));const o=pe([{kind:"task",at:"now",label:"x",data:{}}]);n(b("_trash.md",o,o))});a("a note with no frontmatter is compared by what it says",()=>{n(b("stray.md",`Just prose.
`,"Just prose.")),n(!b("stray.md","Just prose.","Other prose."))});a("canonicalising the demo corpus is a fixed point",()=>{for(const[e,s]of Object.entries(R)){const o=de(e,s);t(de(e,o),o,e)}});function ce(e,s={},o=[],i=""){const d=new Map,u=new Map,f={name:e,kind:"directory",log:o,async queryPermission(){return"granted"},async requestPermission(){return"granted"},async*entries(){for(const[r,h]of[...d])yield[r,{kind:"file",name:r,async getFile(){return{async text(){return h}}}}];for(const[r,h]of[...u])yield[r,h]},async getDirectoryHandle(r,{create:h}={}){if(!u.has(r)){if(!h)throw new Error(`no such directory: ${r}`);u.set(r,ce(r,{},o,`${i}${r}/`))}return u.get(r)},async getFileHandle(r,{create:h}={}){if(!d.has(r)&&!h)throw new Error(`no such file: ${r}`);return{kind:"file",name:r,async getFile(){return{async text(){return d.get(r)??""}}},async createWritable(){let C="";return{async write(P){C+=P},async close(){d.set(r,C),o.push(`write ${i}${r}`)}}}}},async removeEntry(r){if(!d.delete(r))throw new Error(`no such file: ${r}`);o.push(`remove ${i}${r}`)},put(r,h){const C=r.indexOf("/");if(C===-1){d.set(r,h);return}const P=r.slice(0,C);u.has(P)||u.set(P,ce(P,{},o,`${i}${P}/`)),u.get(P).put(r.slice(C+1),h)},dump(){const r={};for(const[h,C]of d)r[`${i}${h}`]=C;for(const h of u.values())Object.assign(r,h.dump());return r}};for(const[r,h]of Object.entries(s))f.put(r,h);return f}async function q(e){const s=ce("vault",e),o=globalThis.showDirectoryPicker;globalThis.showDirectoryPicker=async()=>s;try{const i=je({sameFile:b}),d=await i.connectFolder();return s.log.length=0,{storage:i,directory:s,files:d}}finally{globalThis.showDirectoryPicker=o}}const Be=`---
id: doomed
title: Doomed
done: false
---
`;function B(e,s){a(e,async()=>{const o=localStorage.getItem("tasks.files");try{await s()}finally{o===null?localStorage.removeItem("tasks.files"):localStorage.setItem("tasks.files",o)}})}c("storage gate");B("browser-only storage is always writable",()=>{n(je({sameFile:b}).state.writable)});B("a connected folder opens read-only",async()=>{const{storage:e}=await q({"wireframes.md":l});t(e.state.mode,"folder"),n(!e.state.writable,"a fresh folder must not be writable")});B("a read-only folder is not written to, and nothing is deleted",async()=>{const{storage:e,directory:s}=await q({"wireframes.md":l,"doomed.md":Be}),o=s.dump(),i=localStorage.getItem("tasks.files"),d=await e.save({"wireframes.md":l.replace("Wireframes","Changed")});t(d,{skipped:"read-only"}),t(s.log,[],"a locked folder must see no writes and no removals"),t(s.dump(),o),t(localStorage.getItem("tasks.files"),i,"the mirror must not move either")});B("unlocking re-reads the folder",async()=>{const{storage:e,directory:s}=await q({"wireframes.md":l});s.put("wireframes.md",l.replace("Some notes.","Notes from my phone.")),s.put("later.md",`---
id: later
title: Later
done: false
---
`);const o=await e.unlock();n(e.state.writable,"unlock must open the gate"),n(o["wireframes.md"].includes("Notes from my phone."),"the external edit must be seen"),n("later.md"in o,"the external addition must be seen"),t(s.log,[],"unlocking must not write anything")});B("writes resume once unlocked",async()=>{const{storage:e,directory:s}=await q({"wireframes.md":l});await e.unlock();const o=l.replace("Some notes.","Edited here.");await e.save({"wireframes.md":o}),t(s.log,["write wireframes.md"]),t(s.dump()["wireframes.md"],o)});B("a file that differs only in formatting is left alone",async()=>{const e=`---
title: Wireframes
id: wireframes
project: [website]
done: false
---
Some notes.

- [ ] first
- [x] second
`,{storage:s,directory:o}=await q({"wireframes.md":e});await s.unlock(),await s.save({"wireframes.md":de("wireframes.md",e)}),t(o.log,[],"reformatting alone is not a change worth writing"),t(o.dump()["wireframes.md"],e,"the file keeps its own shape")});B("a genuinely new file is still created",async()=>{const{storage:e,directory:s}=await q({"wireframes.md":l});await e.unlock();const o=`---
id: new-task
title: New task
done: false
---
`;await e.save({"wireframes.md":l,"new-task.md":o}),t(s.log,["write new-task.md"]),t(s.dump()["new-task.md"],o)});B("deletions happen once unlocked, and not before",async()=>{const{storage:e,directory:s}=await q({"wireframes.md":l,"doomed.md":Be});await e.save({"wireframes.md":l}),n("doomed.md"in s.dump(),"a locked folder keeps its files"),await e.unlock(),await e.save({"wireframes.md":l}),t(s.log,["remove doomed.md"]),n(!("doomed.md"in s.dump()))});B("locking again withdraws the right to write",async()=>{const{storage:e,directory:s}=await q({"wireframes.md":l});await e.unlock(),e.lock(),n(!e.state.writable),await e.save({"wireframes.md":l.replace("Wireframes","Changed")}),t(s.log,[])});B("project subfolders round-trip through the gate",async()=>{const{storage:e,directory:s}=await q({"website/_project-website.md":`---
id: website
title: Website
---
`,"website/wireframes.md":l});n(!e.state.writable);const o=await e.unlock();n("website/_project-website.md"in o),n("website/wireframes.md"in o),await e.save({...o,"website/wireframes.md":l.replace("Some notes.","Edited.")}),t(s.log,["write website/wireframes.md"])});const ke=document.getElementById("out");let we=0,ie=0;async function ot(){for(const{name:s,tests:o}of xe){const i=document.createElement("h2");i.textContent=s,ke.append(i);for(const{name:d,fn:u}of o){const f=document.createElement("div");try{await u(),f.className="pass",f.textContent=`✓ ${d}`,we+=1}catch(r){f.className="fail",f.textContent=`✗ ${d} — ${r.message}`,ie+=1}ke.append(f)}}const e=document.getElementById("summary");e.textContent=`${we} passed, ${ie} failed`,e.className=ie?"fail":"pass"}ot();
