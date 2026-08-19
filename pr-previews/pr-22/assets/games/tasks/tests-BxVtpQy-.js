import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{_ as Pe,f as Ae,h as Ge,j as Re,k as ze,l as Ue,m as Je,n as He,o as Xe,p as Ke,q as Qe,r as Ze,t as Ve,u as Ye,v as et,w as tt,x as st,y as at,z as ot,A as nt,J as _,a2 as it,$ as k,ac as de,ad as rt,ae as j,af as M,ag as U,ah as te,ai as Te,aj as dt,D as g,ak as re,P as he,Q as le,al as H,a7 as lt,a9 as Y,aa as D,a1 as B,a0 as Be,a3 as O,K as C,E as ct,M as pt,L as mt,a4 as z,a6 as N,R as ht,a5 as _e,a8 as P,I as se,i as y,Z as V,X as K,am as We,S as q,N as A,an as De,ab as ee,ao as fe,ap as ve,aq as ue,O as ut,e as W,c as Ee,C as wt,d as we,b as kt,ar as ce,as as $e,W as je,H as v,at as ge,B as Me,au as ft,Y as Ce,av as Ne}from"../../llm-C056Wsqw.js";const qe=[];let be=null;function c(e){be={name:e,tests:[]},qe.push(be)}function a(e,t){be.tests.push({name:e,fn:t})}function n(e,t){if(!e)throw new Error(t||"assertion failed")}function s(e,t,o){const i=JSON.stringify(e),l=JSON.stringify(t);if(i!==l)throw new Error(`${o?`${o}: `:""}expected ${l}, got ${i}`)}function Fe(e,t){try{e()}catch{return}throw new Error("expected a throw")}const X=Object.fromEntries(Object.entries(Object.assign({"../demo/_project-q4-hiring.md":nt,"../demo/_project-website.md":ot,"../demo/analytics-dashboard.md":at,"../demo/billing-integration.md":st,"../demo/component-library.md":tt,"../demo/copywriting.md":et,"../demo/design-review.md":Ye,"../demo/discovery-interviews.md":Ve,"../demo/docs-site.md":Ze,"../demo/information-architecture.md":Qe,"../demo/interview-loop.md":Ke,"../demo/job-descriptions.md":Xe,"../demo/launch.md":He,"../demo/offers-out.md":Je,"../demo/qa-pass.md":Ue,"../demo/self-serve-signup.md":ze,"../demo/signup-flow.md":Re,"../demo/sourcing.md":Ge,"../demo/visual-design.md":Ae,"../demo/wireframes.md":Pe})).map(([e,t])=>[e.split("/").pop(),t]));c("frontmatter");a("parses scalars, booleans and flow lists",()=>{const{data:e}=de(`---
a: hello
b: true
c: [x, y]
d: 2026-09-14
---
body
`);s(e,{a:"hello",b:!0,c:["x","y"],d:"2026-09-14"})});a("parses block lists",()=>{const{data:e}=de(`---
people:
  - georg
  - ada
---
`);s(e.people,["georg","ada"])});a("keeps the body verbatim",()=>{const{body:e}=de(`---
a: 1
---
line one

line two
`);s(e,`line one

line two
`)});a("a file without frontmatter is all body",()=>{const{data:e,body:t}=de(`just text
`);s(e,{}),s(t,`just text
`)});a("quotes values that would otherwise change meaning",()=>{const e=rt({color:"#2563eb",title:"a: b",flag:"true"});n(e.includes("color: '#2563eb'"),"hash must be quoted"),n(e.includes("title: 'a: b'"),"colon must be quoted"),n(e.includes("flag: 'true'"),'a string "true" must not become a boolean')});a("unknown keys survive a round trip",()=>{const t=j("x.md",`---
id: x
title: X
done: false
cssclass: kanban
---
`);s(t.extra,{cssclass:"kanban"}),n(M(t).includes("cssclass: kanban"),"extra key must be written back")});a("a project file separates its one-line goal from its free-form context",()=>{const e=U("_project-website.md",`---
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
`);s(e.id,"website"),s(e.color,"#2563eb"),s(e.goal,"Ship self-serve signup"),s(e.people,["georg","ada"]),s(e.context,`Stripe is set up.

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
`;s(te(U("_project-x.md",e)),e)});a("a project file written before the split keeps its body as context, not as a goal",()=>{const e=U("_project-x.md",`---
id: x
title: X
---
Old body prose.
`);s(e.goal,"","nothing is guessed into the goal"),s(e.context,"Old body prose.")});a("a goal containing a colon survives serialisation",()=>{const t=U("_project-x.md",te({id:"x",title:"X",goal:"Ship it: end to end, no humans",people:[],context:""}));s(t.goal,"Ship it: end to end, no humans")});a("empty project fields are omitted rather than written blank",()=>{const e=te({id:"x",title:"X",goal:"",people:[],context:""});n(!e.includes("goal:"),"an empty goal must not be written"),n(!e.includes("people:"),"an empty roster must not be written"),s(e,`---
id: x
title: X
---
`)});a("a project id falls back to the filename",()=>{s(U("_project-q4-hiring.md",`---
title: Q4
---
`).id,"q4-hiring")});a("splits and rebuilds a checklist",()=>{const{notes:e,subtasks:t}=Te(`Notes.

- [x] one
- [ ] two
`);s(e,"Notes."),s(t,[{done:!0,text:"one"},{done:!1,text:"two"}]),s(dt(e,t),`Notes.

- [x] one
- [ ] two`)});a("accepts * bullets and upper-case X",()=>{const{subtasks:e}=Te(`* [X] done thing
`);s(e,[{done:!0,text:"done thing"}])});a("every demo file is a fixed point of parse -> serialise",()=>{const e=g(k(X)),t=Object.keys(X);n(t.length>=18,`expected the full corpus, got ${t.length}`);for(const o of t)s(e[o],X[o],`${o} did not round-trip`)});a("empty optional keys are omitted rather than written blank",()=>{const e=M(j("x.md",`---
id: x
title: X
done: false
---
`));n(!e.includes("due:"),"an absent due date must not be written"),n(!e.includes("people:"),"an empty people list must not be written"),n(e.includes("done: false"),"done is always written")});c("ids");a("slugifies titles",()=>{s(re("Design Review!"),"design-review"),s(re("  Ship  it  "),"ship-it")});a("transliterates letters with no NFKD decomposition",()=>{s(re("Réunion Ærø søk"),"reunion-aero-sok")});a("never produces an empty slug",()=>{s(re("!!!"),"task")});a("suffixes on collision",()=>{s(he("Design review",["design-review"]),"design-review-2"),s(he("Design review",["design-review","design-review-2"]),"design-review-3"),s(he("Design review",[]),"design-review")});c("dates and estimates");a("parses and formats ISO dates in UTC",()=>{s(le(_("2026-09-14")),"2026-09-14"),s(_(""),null),s(_("not a date"),null)});a("parses durations into hours",()=>{s(H("2h"),2),s(H("3d"),24),s(H("1w"),40),s(H("1.5d"),12)});a("free-form estimates are kept but not counted",()=>{s(H("a while"),null),s(lt([{estimate:"1d"},{estimate:"ages"},{estimate:"2h"}]),10)});c("timeline");const u=_("2026-08-01");a("bucket size follows the project span",()=>{s(Y(u,_("2026-08-20")).unit,"day"),s(Y(u,_("2026-11-30")).unit,"week"),s(Y(u,_("2028-08-01")).unit,"month"),s(Y(null,null).unit,"week","falls back to weeks")});a("levels are fractional so the now-line can sit between them",()=>{const e=D("week");s(e.level(_("2026-08-08"),u),1),n(Math.abs(e.level(_("2026-08-05"),u)-4/7)<1e-9)});a("month levels follow the calendar, not a fixed width",()=>{const e=D("month");s(Math.floor(e.level(_("2026-09-01"),u)),1),s(Math.floor(e.level(_("2027-01-31"),u)),5)});a("undated tasks land in a tray below the last dated level",()=>{const e=D("week"),t=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-09-05"},{id:"c",due:""}],{levels:o,trayLevel:i}=B(t,{bucket:e,start:u});s(o.get("a"),0),s(o.get("b"),5),s(o.get("c"),i),n(i>5,"the tray sits below every dated task")});a("levels are shifted so the earliest task is level 0",()=>{const e=D("week"),{levels:t}=B([{id:"a",due:"2026-07-01"}],{bucket:e,start:u});s(t.get("a"),0,"a task before the project start still lands at 0")});a("the window widens to cover tasks outside the declared dates",()=>{const e=Be({start:"2026-08-01",end:"2026-08-31"},[{due:"2026-12-25"}]);s(le(e.end),"2026-12-25")});c("derived status");const E=[{id:"a",done:!0,subtasks:[],blockedBy:[],due:"2026-01-01"},{id:"b",done:!1,subtasks:[{done:!0,text:"1"},{done:!1,text:"2"}],blockedBy:["a"],due:"2030-01-01"},{id:"c",done:!1,subtasks:[],blockedBy:["b"],due:"2020-01-01"}],S=it(E),T=Date.UTC(2026,0,15);a("progress comes from the checklist",()=>{s(O(E[1],S,T).ratio,.5),s(O(E[1],S,T).checked,1)});a("a completed task reads as fully done regardless of its checklist",()=>{const e=O({...E[1],done:!0},S,T);s(e.ratio,1),n(e.done)});a("blocked means an incomplete prerequisite",()=>{n(!O(E[1],S,T).blocked,"a is done, so b is free"),n(O(E[2],S,T).blocked,"b is open, so c is blocked")});a("overdue means past its deadline and not done",()=>{n(O(E[2],S,T).overdue),n(!O(E[0],S,T).overdue,"done work is never overdue"),n(!O(E[1],S,T).overdue)});a("a task with no deadline is never overdue",()=>{n(!O({due:"",subtasks:[],blockedBy:[]},S,T).overdue)});a("a reference to a task that does not exist does not block",()=>{n(!O({done:!1,subtasks:[],blockedBy:["ghost"],due:""},S,T).blocked)});c("filters");const p=k(X);a("the demo board loads two projects and every task",()=>{s(p.projects.length,2),s(p.tasks.length,Object.keys(X).length-2)});a("filtering by project keeps tasks tagged with it",()=>{const e=C(p.tasks,{projectId:"website"});n(e.length>10,"the website project is the busy one"),n(e.every(t=>t.project.includes("website"))),n(e.some(t=>t.id==="job-descriptions"),"a task in two projects shows in both"),n(C(p.tasks,{projectId:"q4-hiring"}).some(t=>t.id==="job-descriptions"))});a("filtering by person is a union, not an intersection",()=>{const e=C(p.tasks,{people:["ada","sam"]}),t=C(p.tasks,{people:["ada"]});n(e.length>=t.length,"adding a person can only widen the set"),n(e.every(o=>o.people.includes("ada")||o.people.includes("sam")))});a("hideDone drops completed work",()=>{n(C(p.tasks,{hideDone:!0}).every(e=>!e.done))});a("an empty filter is the identity",()=>{s(C(p.tasks,{}).length,p.tasks.length)});a("projectPeople marks roster members, task-only names and their open counts",()=>{const o=ct({id:"p",people:["georg","kim"]},[{id:"a",project:["p"],people:["georg"],done:!1},{id:"b",project:["p"],people:["georg"],done:!0},{id:"c",project:["p"],people:["ada"],done:!1},{id:"d",project:["other"],people:["zoe"],done:!1}]);s(o.map(i=>i.name),["georg","kim","ada"],"roster first, then adopted"),s(o.find(i=>i.name==="georg"),{name:"georg",inRoster:!0,openTasks:1}),s(o.find(i=>i.name==="kim"),{name:"kim",inRoster:!0,openTasks:0}),s(o.find(i=>i.name==="ada"),{name:"ada",inRoster:!1,openTasks:1}),n(!o.some(i=>i.name==="zoe"),"people on other projects are not listed")});a("people and project tags are deduplicated and sorted",()=>{s(pt(p.tasks),["Georg","Oliver","Sverre"]),s(mt(p.tasks),["q4-hiring","website"])});c("edges");a("blocks runs prerequisite -> dependent, part-of runs child -> parent",()=>{const t=z([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:[],partOf:["a"]}],new Map([["a",0],["b",1],["c",1]])),o=t.find(l=>l.kind==="blocks"),i=t.find(l=>l.kind==="part-of");s([o.from,o.to],["a","b"]),s([i.from,i.to],["c","a"])});a("edges to tasks outside the filtered set are dropped",()=>{const e=z([{id:"b",blockedBy:["a"],partOf:[]}],new Map([["b",1]]));s(e,[])});a("a prerequisite due after its dependent is flagged as a conflict",()=>{const e=[{id:"a",due:"2026-09-05",blockedBy:[],partOf:[]},{id:"b",due:"2026-08-15",blockedBy:["a"],partOf:[]}];n(z(e,new Map([["a",5],["b",2]]))[0].conflict,"blocker below dependent"),n(!z(e,new Map([["a",2],["b",5]]))[0].conflict,"normal order")});a("the demo project has no scheduling conflicts",()=>{const e=C(p.tasks,{projectId:"website"}),t=Be(p.projects.find(i=>i.id==="website"),e),{levels:o}=B(e,{bucket:Y(t.start,t.end),start:t.start});s(z(e,o).filter(i=>i.conflict),[])});c("relations");const ae=()=>[{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:["b"],partOf:[]},{id:"loner",blockedBy:[],partOf:[]}];a("a task can never wait on itself",()=>{n(N(ae(),"a","blockedBy").has("a"),"a is forbidden to itself")});a("anything downstream would close a loop",()=>{const e=N(ae(),"a","blockedBy");n(e.has("b"),"direct dependent"),n(e.has("c"),"dependent two steps out")});a("an unrelated task is always available",()=>{n(!N(ae(),"a","blockedBy").has("loner"),"loner is fine"),n(!N(ae(),"c","blockedBy").has("a"),"c already waits on a upstream")});a("upstream tasks stay available, so the chain can be tightened",()=>{n(!N(ae(),"c","blockedBy").has("b"),"b is already a blocker of c")});a("part-of loops are refused the same way",()=>{const t=N([{id:"parent",blockedBy:[],partOf:[]},{id:"child",blockedBy:[],partOf:["parent"]},{id:"grandchild",blockedBy:[],partOf:["child"]}],"parent","partOf");s([...t].sort(),["child","grandchild","parent"])});a("the two relations are judged independently",()=>{n(!N([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]}],"a","partOf").has("b"),"blocking does not constrain part-of")});a("a missing reference cannot make a loop",()=>{s([...N([{id:"a",blockedBy:["ghost"],partOf:[]}],"a","blockedBy")],["a"])});a("the demo board has no task that could be added to its own blockers",()=>{for(const e of p.tasks)n(N(p.tasks,e.id,"blockedBy").has(e.id),`${e.id} excludes itself`)});c("star and archive");const Ie=(e,t="")=>`---
id: ${e}
title: ${e}
${t}---
`;a("starred and archived round trip, and are written only when set",()=>{const e=U("_project-kitchen.md",Ie("kitchen",`starred: true
archived: true
`));s(e.starred,!0),s(e.archived,!0);const t=te(e);n(/^starred: true$/m.test(t),"starred is written when set"),n(/^archived: true$/m.test(t),"archived is written when set");const o=te({...e,starred:!1,archived:!1});n(!/starred/.test(o)&&!/archived/.test(o),"neither is written when unset")});a("a project file with neither flag reads as neither",()=>{const e=U("_project-kitchen.md",Ie("kitchen"));s(e.starred,!1),s(e.archived,!1)});a("starred projects sort first, the rest keep their order",()=>{const e=ht([{id:"b"},{id:"a"},{id:"z",starred:!0},{id:"c"}]);s(e.map(t=>t.id),["z","a","b","c"])});a("archived projects are hidden unless asked for",()=>{const e=[{id:"a"},{id:"b",archived:!0}];s(_e(e).map(t=>t.id),["a"]),s(_e(e,!0).map(t=>t.id),["a","b"])});c("deleting a project");const F=()=>({projects:[{id:"kitchen",title:"Kitchen",folder:"kitchen"},{id:"website",title:"Website",folder:"website"}],tasks:[{id:"worktop",title:"Worktop",project:["kitchen"]},{id:"shared",title:"Shared",project:["kitchen","website"]},{id:"kitchen-goal",title:"A finished kitchen",project:["kitchen"],goal:!0},{id:"other",title:"Other",project:["website"]}],trash:[]});a("keeping the tasks only strips the tag",()=>{const e=P(F(),"kitchen",{deleteTasks:!1});s(e.removed,[]),s(e.projects.map(t=>t.id),["website"]),s(e.tasks.find(t=>t.id==="worktop").project,[])});a("deleting the tasks takes only the ones this project alone holds",()=>{const e=P(F(),"kitchen",{deleteTasks:!0});s(e.removed.map(t=>t.id),["worktop"]),n(!e.tasks.some(t=>t.id==="worktop"),"the task this project alone held is gone")});a("a task belonging elsewhere survives, and moves to that project",()=>{const e=P(F(),"kitchen",{deleteTasks:!0}),t=e.tasks.find(i=>i.id==="shared");s(t.project,["website"]);const o=Object.keys(g({...F(),...e,tasks:e.tasks}));n(o.includes("website/shared.md"),`shared.md moved to website/ (${o.join(", ")})`)});a("the goal node goes quietly either way, never into the trash",()=>{for(const e of[!1,!0]){const t=P(F(),"kitchen",{deleteTasks:e});n(!t.tasks.some(o=>o.id==="kitchen-goal"),"the goal node is gone"),n(!t.removed.some(o=>o.goal),"and is not in the trash record")}});a("tasks that merely lose the tag are remembered, so a restore can undo that",()=>{const e=P(F(),"kitchen",{deleteTasks:!1});s(e.untagged.sort(),["shared","worktop"]);const t=P(F(),"kitchen",{deleteTasks:!0});s(t.untagged,["shared"]),s(t.removed.map(o=>o.id),["worktop"])});a("deleting a project that does not exist plans nothing",()=>{s(P(F(),"nope",{deleteTasks:!0}),null)});a("tasks in other projects are left completely alone",()=>{const e=P(F(),"kitchen",{deleteTasks:!0});s(e.tasks.find(t=>t.id==="other").project,["website"])});c("project folders");const I={"relaunch-2026/_project-website.md":`---
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
`},oe=(e,t)=>Object.keys(e).find(o=>o===`${t}.md`||o.endsWith(`/${t}.md`));a("a project remembers the folder it was found in",()=>{const{projects:e}=k(I);s(e.find(t=>t.id==="website").folder,"relaunch-2026"),s(e.find(t=>t.id==="kitchen").folder,"kitchen")});a("a task follows its project, not a folder named after it",()=>{const e=g(k(I));s(oe(e,"wireframes"),"relaunch-2026/wireframes.md"),s(oe(e,"worktop"),"kitchen/worktop.md")});a("a project file lives in its own folder",()=>{n("relaunch-2026/_project-website.md"in g(k(I)),"the project file stays beside its tasks")});a("an untagged task sits at the parent root",()=>{s(oe(g(k(I)),"odd-job"),"odd-job.md")});a("the first tag decides where a task lives",()=>{const e=k({...I,"both.md":`---
id: both
title: Both
project: [kitchen, website]
---
`});s(oe(g(e),"both"),"kitchen/both.md"),s(e.tasks.find(t=>t.id==="both").project,["kitchen","website"])});a("a tag naming no project we have lands at the root",()=>{const e=k({...I,"stray.md":`---
id: stray
title: Stray
project: gardening
---
`});s(oe(g(e),"stray"),"stray.md")});a("the trash belongs to the parent, not to any one project",()=>{const e={...k(I),trash:[{kind:"task",data:{id:"gone"}}]};n("_trash.md"in g(e),"the trash is at the root")});a("a nested board round trips to a fixed point",()=>{const e=g(k(I));s(g(k(e)),e)});const Le={"_project-website.md":`---
id: website
title: Website
---
`,"wireframes.md":`---
id: wireframes
title: Wireframes
project: website
---
`};a("a flat board stays flat",()=>{s(Object.keys(g(k(Le))).sort(),["_project-website.md","wireframes.md"])});a("giving a flat project a folder moves its files into it",()=>{const e=k(Le),t={...e,projects:e.projects.map(o=>({...o,folder:o.id}))};s(Object.keys(g(t)).sort(),["website/_project-website.md","website/wireframes.md"])});a("two folders claiming one id: the first is used",()=>{const{projects:e}=k({"a/_project-website.md":`---
id: website
title: First
---
`,"b/_project-website.md":`---
id: website
title: Second
---
`});s(e.length,1),s(e[0].folder,"a")});a("a clash is reported so the app can say so",()=>{s(se({"a/_project-website.md":"","b/_project-website.md":"","kitchen/_project-kitchen.md":""}),{ids:["website"],paths:["b/_project-website.md"]}),s(se(I),{ids:[],paths:[]})});a("two files claiming one task id clash on what is inside them",()=>{const e={"wireframes.md":r,"wireframes 1.md":r};s(se(e),{ids:["wireframes"],paths:["wireframes 1.md"]}),s(k(e).tasks.map(t=>t.id),["wireframes"])});a("a project and a task may share an id",()=>{s(se({"_project-website.md":`---
id: website
title: Website
---
`,"website.md":`---
id: website
title: Website launch
---
`}),{ids:[],paths:[]})});c("initials");a("one word gives one letter, two give two",()=>{s(y("Georg"),"G"),s(y("Georg Muntingh"),"GM")});a("only the first two words count",()=>{s(y("Ada Byron King Lovelace"),"AB")});a("separators other than spaces still split",()=>{s(y("ada-lovelace"),"AL"),s(y("ada.lovelace"),"AL"),s(y("ada_lovelace"),"AL")});a("punctuation and stray whitespace are ignored",()=>{s(y("  georg   "),"G"),s(y("O'Brien"),"O")});a("a name with no letters still yields something drawable",()=>{s(y(""),"?"),s(y("   "),"?"),s(y(null),"?")});a("initials come back upper case whatever the name looks like",()=>{s(y("georg muntingh"),"GM")});c("working");const pe=()=>[{id:"a",working:!1},{id:"b",working:!0},{id:"c",working:!1}],me=e=>e.filter(t=>t.working).map(t=>t.id);a("setting one releases whatever held it",()=>{s(me(V(pe(),"c")),["c"])});a("null releases without setting another",()=>{s(me(V(pe(),null)),[])});a("an id that is not on the board leaves nothing marked",()=>{s(me(V(pe(),"ghost")),[])});a("there is never more than one, whatever the input claimed",()=>{s(me(V([{id:"a",working:!0},{id:"b",working:!0}],"b")),["b"])});a("tasks that do not change are returned by identity",()=>{const e=pe(),t=V(e,"b");n(t[0]===e[0],"untouched task is the same object"),n(t[1]===e[1],"the one already set is untouched too")});a("nothing else about a task is disturbed",()=>{s(V([{id:"a",title:"Wireframes",people:["Georg"],working:!1}],"a"),[{id:"a",title:"Wireframes",people:["Georg"],working:!0}])});c("placement and flags");a("a stored x comes back as a number, not the string yaml gives",()=>{const e=j("w.md",["---","id: w","title: W","x: 412","---",""].join(`
`));s(e.x,412),n(typeof e.x=="number","x is a number")});a("an unparseable or missing x is null rather than NaN",()=>{const e=j("w.md",["---","id: w","x: over there","---",""].join(`
`));s(e.x,null),s(j("w.md",["---","id: w","---",""].join(`
`)).x,null)});a("x survives a round trip, including x: 0",()=>{const e=j("w.md",["---","id: w","title: W","x: 0","---",""].join(`
`));s(e.x,0),n(/^x: 0$/m.test(M(e)),"x: 0 is written, not dropped as empty")});a("no x means no x line",()=>{const e=M(j("w.md",["---","id: w","---",""].join(`
`)));n(!/^x:/m.test(e),"nothing to say about placement, so nothing written")});a("working is written only when it is set",()=>{const e=j("w.md",["---","id: w","working: true","---",""].join(`
`));s(e.working,!0),n(/^working: true$/m.test(M(e)),"set, so written"),n(!/working/.test(M({...e,working:!1})),"released, so absent")});a("the two new keys round trip to a fixed point",()=>{const e=M(j("w.md",["---","id: w","title: W","due: 2026-08-15","working: true","x: 412","---","","Body",""].join(`
`)));s(M(j("w.md",e)),e)});a("placement and flags do not leak into extra",()=>{const e=j("w.md",["---","id: w","x: 5","working: true","---",""].join(`
`));s(e.extra,{})});c("LLM brief");a("includes the goal, a task table and the dependency list",()=>{const e=p.projects.find(i=>i.id==="website"),t=C(p.tasks,{projectId:"website"}),o=K(e,t,{now:Date.UTC(2026,7,16)});n(o.includes("# Website relaunch"),"title"),n(o.includes("## Goal"),"goal section"),n(o.includes("## Context"),"context section"),n(o.includes("| id | task | due | estimate | people | subtasks |"),"table header"),n(o.includes("| wireframes | Wireframes |"),"a task row keyed by its id"),n(o.includes("- wireframes blocked-by information-architecture"),"dependency"),n(o.includes("- signup-flow part-of self-serve-signup"),"part-of dependency")});a("a task brief carries its existing subtasks and their state",()=>{const e=We({title:"Design review",subtasks:[{done:!0,text:"book the room"},{done:!1,text:"collect feedback"}]});n(e.includes("Existing subtasks:"),"the section is present"),n(e.includes("- [x] book the room"),"ticked state survives"),n(e.includes("- [ ] collect feedback"),"unticked state survives"),n(q.subtasks.messages({title:"P"},[],{title:"Design review",subtasks:[{done:!1,text:"collect feedback"}]}).some(t=>t.content.includes("collect feedback")),"and it reaches the prompt the model actually sees")});a("goal and context are separate labelled sections",()=>{const e=K({title:"P",goal:"Ship it",context:`Stripe is set up.

## Open questions
- SOC2?`},[]);n(e.includes(`## Goal
Ship it`),"goal section"),n(e.includes(`## Context
Stripe is set up.`),"context section"),n(e.indexOf("## Goal")<e.indexOf("## Context"),"goal comes first"),n(e.includes("- SOC2?"),"context goes verbatim, headings and all")});a("each section is dropped cleanly when empty",()=>{const e=K({title:"P",goal:"Ship it",context:""},[]);n(e.includes("## Goal"),"goal kept"),n(!e.includes("## Context"),"no empty context heading");const t=K({title:"P",goal:"",context:"Background."},[]);n(!t.includes("## Goal"),"no empty goal heading"),n(t.includes("## Context"),"context kept")});const Q=(e={})=>({id:"w",title:"W",goal:"Ship it",end:"2026-11-30",...e});a("a goal node is created for every project that has a goal",()=>{const{tasks:e}=A({tasks:[],projects:[Q()]});s(e.length,1),s(e[0].id,Ce("w")),s(e[0].title,"Ship it"),s(e[0].due,"2026-11-30","the goal sits at the project deadline"),n(e[0].goal,"and is marked as the goal node")});a("a goal node follows its project title and deadline",()=>{const e=A({tasks:[],projects:[Q()]}).tasks,{tasks:t}=A({tasks:e,projects:[Q({goal:"Ship it sooner",end:"2026-10-01"})]});s(t.length,1,"no second node is created"),s(t[0].title,"Ship it sooner"),s(t[0].due,"2026-10-01")});a("clearing the goal hands its node back for deletion",()=>{const e=A({tasks:[],projects:[Q()]}).tasks,{tasks:t,removed:o}=A({tasks:e,projects:[Q({goal:""})]});s(t.length,0),s(o.map(i=>i.id),[Ce("w")])});a("deleting a project hands its goal node back too",()=>{const e=A({tasks:[],projects:[{id:"website",title:"Website",goal:"Ship it",end:"2026-09-01"}]});s(e.tasks.map(o=>o.id),["website-goal"]);const t=A({tasks:e.tasks,projects:[]});s(t.tasks,[]),s(t.removed.map(o=>o.id),["website-goal"])});a("a goal node survives a round-trip through markdown",()=>{const{tasks:e}=A({tasks:[],projects:[Q()]}),t=M(e[0]);n(t.includes("goal: true"),"the marker is written"),n(j("w-goal.md",t).goal,"and read back")});a("only tasks nothing depends on feed the goal",()=>{const t=De([{id:"w-goal",goal:!0,project:["w"]},{id:"a",project:["w"],blockedBy:[]},{id:"b",project:["w"],blockedBy:["a"]},{id:"c",project:["w"],partOf:["b"]}]);s(t,[{from:"b",to:"w-goal"}],"a is depended on, c is part of b")});a("the goal node never links to itself",()=>{s(De([{id:"w-goal",goal:!0,project:["w"]}]),[])});a("an undated task is not a scheduling conflict",()=>{const e=D("week"),t=[{id:"g",goal:!0,project:["w"],due:"2026-09-01"},{id:"undated",project:["w"],due:""},{id:"late",project:["w"],due:"2026-10-01"}],{levels:o}=B(t,{bucket:e,start:u}),i=z(t,o),l=m=>i.find(b=>b.from===m);n(!l("undated").conflict,"the tray is a position, not a date after the goal"),n(l("late").conflict,"but a real deadline past the goal still is")});a("buildEdges emits goal links alongside stored ones",()=>{const t=z([{id:"w-goal",goal:!0,project:["w"]},{id:"a",project:["w"]}],new Map).map(o=>o.kind);n(t.includes("goal"),"a goal edge is present")});a("merging folds a task into another as checklist items",()=>{const e=[{id:"src",title:"Wireframes",done:!1,subtasks:[{done:!0,text:"lo-fi"}]},{id:"tgt",title:"Design",subtasks:[{done:!1,text:"existing"}]}],{tasks:t,merged:o}=ee(e,"src","tgt");s(t.map(i=>i.id),["tgt"],"the source is gone"),s(t[0].subtasks,[{done:!1,text:"existing"},{done:!1,text:"Wireframes"},{done:!0,text:"lo-fi"}],"title first, then its own subtasks, after what was already there"),s(o.id,"src","the merged task is handed back for the trash")});a("merging rewires dependents to the target and drops self-links",()=>{const e=[{id:"src",title:"S",subtasks:[]},{id:"tgt",title:"T",subtasks:[],blockedBy:["src"]},{id:"dep",title:"D",blockedBy:["src"]}],{tasks:t}=ee(e,"src","tgt");s(t.find(o=>o.id==="dep").blockedBy,["tgt"]),s(t.find(o=>o.id==="tgt").blockedBy,[],"a task cannot block itself")});a("merging refuses a goal node or a task with itself",()=>{const e=[{id:"a",title:"A",subtasks:[]},{id:"g",title:"G",goal:!0,subtasks:[]}];s(ee(e,"a","a"),null),s(ee(e,"g","a"),null),s(ee(e,"a","g"),null)});a("collapsing empty periods leaves consecutive rows and records the gaps",()=>{const e=D("week"),t=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-08"},{id:"c",due:"2026-09-26"}],o=B(t,{bucket:e,start:u});s([...o.levels.values()],[0,1,8],"ordinarily a level is elapsed time");const i=B(t,{bucket:e,start:u,collapse:!0});s([...i.levels.values()],[0,1,2],"occupied periods become adjacent"),s(i.gaps,[{afterLevel:1,periods:6}],"six empty weeks are recorded")});a("a row still labels its real date, collapsed or not",()=>{const e=D("week"),t=[{id:"a",due:"2026-08-22"},{id:"c",due:"2026-09-26"}],o=(i,l)=>{const{levelOrigin:m,minLevel:b}=B(t,{bucket:e,start:u,...i});return le(e.dateForLevel(m.get(l)+b,u))};s(o({collapse:!0},0),"2026-08-22"),s(o({collapse:!0},1),"2026-09-26","row 1 points at the week it came from"),s(o({},0),"2026-08-22","and the uncollapsed scale agrees"),s(o({},5),"2026-09-26")});a("uncollapsed, every row in range is a real period",()=>{const e=D("week"),t=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-22"}],{levelOrigin:o}=B(t,{bucket:e,start:u});s([...o.keys()],[0,1,2,3],"the empty weeks between are still rows"),s(le(e.dateForLevel(o.get(2),u)),"2026-08-15","and each maps to its own date")});a("collapsed, only occupied rows exist",()=>{const e=D("week"),t=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-22"}],{levelOrigin:o}=B(t,{bucket:e,start:u,collapse:!0});s([...o.keys()],[0,1],"the empty weeks are gone entirely")});a("collapsing keeps undated work in its own tray below the last row",()=>{const e=D("week"),t=[{id:"a",due:"2026-08-01"},{id:"u",due:""}],{levels:o,trayLevel:i}=B(t,{bucket:e,start:u,collapse:!0});s(o.get("u"),i),n(i>o.get("a"),"the tray sits below the dated rows")});a("the trash round-trips through its own file",()=>{const e=[{kind:"task",at:"2026-08-16T00:00:00.000Z",label:"A",data:{id:"a",subtasks:[]}}];s(fe(ve(e)),e)});a("an empty or unreadable trash file yields no records",()=>{s(fe(`---
id: _trash
---
`),[]),s(fe("---\nid: _trash\n---\n```json\nnot json\n```\n"),[])});a("the trash file is not mistaken for a task",()=>{const e=k({"_trash.md":ve([{kind:"task",at:"",label:"A",data:{}}])});s(e.tasks,[],"it is board state, not work"),s(e.trash.length,1)});a("the trash keeps the newest and drops past the cap",()=>{let e=[];for(let t=0;t<ue+5;t+=1)e=ut(e,{kind:"task",at:"",label:`t${t}`,data:{}});s(e.length,ue),s(e[0].label,`t${ue+4}`,"newest first"),n(!e.some(t=>t.label==="t0"),"the oldest fell off")});a("a board with no deletions writes no trash file",()=>{n(!("_trash.md"in g({tasks:[],projects:[],trash:[]})))});a("escapes pipes so a title cannot break the table",()=>{const e=K({title:"P"},[{id:"x",title:"a | b",project:[],people:[],subtasks:[],blockedBy:[],partOf:[]}]);n(e.includes("a \\| b"),"pipe must be escaped")});a("an empty project still produces a well-formed brief",()=>{const e=K({title:"Empty",goal:""},[]);n(e.includes("_no tasks yet_")),n(e.includes("_none recorded_"))});a("the task brief lists existing subtasks",()=>{const e=p.tasks.find(o=>o.id==="wireframes"),t=We(e);n(t.includes("id: wireframes")),n(t.includes("- [x] Landing page"))});c("ask context");const x={id:"website",title:"Website relaunch",goal:"Ship it",context:"Stripe is set up."},Z=()=>C(p.tasks,{projectId:"website"});a("nothing ticked sends nothing at all",()=>{s(W([],{project:x,tasks:Z()}),"")});a("a block only brings its own section",()=>{const e=W(["goal"],{project:x,tasks:Z()});n(e.includes("## Goal"),"the goal is there"),n(!e.includes("## Tasks"),"the table is not");const t=W(["tasks"],{project:x,tasks:Z()});n(t.includes("## Tasks"),"the table is there"),n(!t.includes("## Goal"),"the goal is not")});a("sections are assembled in catalogue order, whatever order they are asked for",()=>{const e=W(["people","tasks","goal"],{project:x,tasks:Z()});n(e.indexOf("## Goal")<e.indexOf("## Tasks"),"goal before tasks"),n(e.indexOf("## Tasks")<e.indexOf("## People"),"tasks before people")});a("the task table carries completed work too, since the model is judging the whole plan",()=>{const t=W(["tasks"],{project:x,tasks:[{id:"a",title:"Done thing",done:!0,project:["website"],people:[],subtasks:[],blockedBy:[],partOf:[]},{id:"b",title:"Open thing",project:["website"],people:[],subtasks:[],blockedBy:[],partOf:[]}]});n(t.includes("| a | Done thing |"),"the finished task is still listed"),n(t.includes("| b | Open thing |"),"and so is the open one")});a("detail carries the notes and subtask text the table only counts",()=>{const e=[{id:"a",title:"Wireframes",notes:"Figma file is shared.",project:["website"],people:[],subtasks:[{done:!0,text:"Landing page"},{done:!1,text:"Pricing page"}],blockedBy:[],partOf:[]}],t=W(["detail"],{project:x,tasks:e});n(t.includes("Figma file is shared."),"notes survive"),n(t.includes("- [x] Landing page"),"ticked subtask survives"),n(t.includes("- [ ] Pricing page"),"unticked subtask survives"),n(!W(["tasks"],{project:x,tasks:e}).includes("Figma file is shared."),"and the table alone never carried it")});a("the selected-task block is absent when nothing is selected",()=>{const e=Z();s(W(["task"],{project:x,tasks:e,task:null}),"");const t=e.find(o=>o.id==="wireframes");n(W(["task"],{project:x,tasks:e,task:t}).includes("id: wireframes"))});a("other projects are summarised, and the current one is not repeated",()=>{const t=W(["projects"],{project:x,projects:[{id:"website",title:"Website relaunch"},{id:"app",title:"Mobile app",goal:"Ship v1"},{id:"old",title:"Archived thing",archived:!0}],allTasks:p.tasks});n(t.includes("Mobile app"),"the other project is listed"),n(t.includes("Ship v1"),"with its goal"),n(!t.includes("Website relaunch"),"the current project is not repeated"),n(!t.includes("Archived thing"),"archived projects stay out")});a("a block with nothing to say costs no words and no heading",()=>{const e=Ee({project:x,tasks:[],projects:[],allTasks:[]});s(e.detail,"","no notes anywhere means no detail section"),s(e.projects,"","no other projects means no heading"),s(e.task,"","no selection means no task section")});a("every catalogued block is one the assembler can actually build",()=>{const e=Ee({project:x,tasks:Z(),projects:p.projects,allTasks:p.tasks});for(const t of wt)n(typeof e[t.id]=="string",`${t.id} has a section`)});a("word counting matches what the dialog promises",()=>{s(we(""),0),s(we(`   
  `),0),s(we(`one two  three
four`),4)});c("ask prompt");a("the brief rides on the first question and is not repeated",()=>{const e=kt("BRIEF",[{role:"user",content:"Q1"},{role:"assistant",content:"A1"},{role:"user",content:"Q2"}]);s(e[0],{role:"system",content:Ne}),n(e[1].content.includes("BRIEF"),"the brief travels with the first turn"),n(e[1].content.includes("Q1"),"and so does the question"),s(e[3].content,"Q2","the follow-up is the question alone"),s(e.length,4)});a("the freeform prompt never asks for JSON",()=>{n(!/json/i.test(Ne),"this path wants prose, not a fenced block")});c("response streaming");const J=e=>{let t="";const o=ft(i=>{t+=i});for(const i of e)o.push(i);return o.end(),{text:t,finished:o.finished}},G=e=>`data: ${JSON.stringify({choices:[{delta:{content:e}}]})}
`;a("fragments are concatenated in order",()=>{s(J([G("Hello"),G(" world")]).text,"Hello world")});a("a frame split across chunks is held until the rest arrives",()=>{const e=G("Hello world"),t=Math.floor(e.length/2);s(J([e.slice(0,t),e.slice(t)]).text,"Hello world")});a("keep-alive comments and blank lines are ignored",()=>{s(J([`: OPENROUTER PROCESSING
`,`
`,G("hi")]).text,"hi")});a("[DONE] ends the stream",()=>{const{text:e,finished:t}=J([G("hi"),`data: [DONE]
`]);s(e,"hi"),n(t,"the reader knows it is over")});a("a frame the last chunk left unterminated is still read",()=>{s(J([G("hi").trimEnd()]).text,"hi")});a("an error arriving mid-stream is raised, not swallowed",()=>{Fe(()=>J([`data: {"error":{"message":"rate limited"}}
`]))});a("an unreadable frame does not sink the answer",()=>{s(J([G("a"),`data: {not json
`,G("b")]).text,"ab")});c("LLM response parsing");a("reads a fenced JSON block",()=>{s(ce('Sure!\n```json\n{"a": 1}\n```\n'),{a:1})});a("reads bare JSON with chatter around it",()=>{s(ce('Here: {"a": 1} hope that helps'),{a:1})});a("reads an unfenced array",()=>{s(ce("[1, 2]"),[1,2])});a("throws with the raw text attached when there is no JSON",()=>{try{throw ce("no json here"),new Error("should have thrown")}catch(e){s(e.raw,"no json here")}});a("subtask suggestions are cleaned of list markers",()=>{const e=q.subtasks.parse('```json\n{"subtasks":["- [ ] Draft copy","* Review"]}\n```');s(e.map(t=>t.label),["Draft copy","Review"]),n(e.every(t=>t.kind==="subtask"))});a("subtask suggestions tolerate objects instead of strings",()=>{const e=q.subtasks.parse('{"subtasks":[{"text":"One"},{"title":"Two"}]}');s(e.map(t=>t.label),["One","Two"])});a("missing-task suggestions keep ids, dates and estimates",()=>{const e=q.missing.parse('{"tasks":[{"title":"QA","due":"2026-11-01","estimate":"2d","blocked_by":["copy"],"why":"untested"}]}');s(e[0].task,{title:"QA",due:"2026-11-01",estimate:"2d",blockedBy:["copy"]}),s(e[0].detail,"untested")});a("a malformed due date is dropped rather than trusted",()=>{const e=q.missing.parse('{"tasks":[{"title":"QA","due":"next tuesday"}]}');s(e[0].task.due,"")});a("a suggestion with no title is discarded",()=>{s(q.missing.parse('{"tasks":[{"why":"no title"},{"title":"Real"}]}').length,1)});a("estimates are normalised to a unit the model layer understands",()=>{s(q.estimate.parse('{"estimate":"3 D","why":"x"}')[0].estimate,"3d"),s(H(q.estimate.parse('{"estimate":"about 2w"}')[0].estimate),80)});a("an unusable estimate throws instead of writing nonsense",()=>{Fe(()=>q.estimate.parse('{"estimate":"quite a while"}'))});c("zip");a("crc32 matches the reference value",()=>{const e=new TextEncoder().encode("The quick brown fox jumps over the lazy dog");s($e(e),1095738169)});a("crc32 of the empty input is zero",()=>{s($e(new Uint8Array(0)),0)});a("writes the PKZIP signatures and one central record per file",()=>{const e=je({"a.md":"alpha","b.md":"beta"}),t=new DataView(e.buffer,e.byteOffset,e.byteLength);s(t.getUint32(0,!0),67324752,"local file header");let o=0,i=0;for(let l=0;l+4<=e.length;l+=1){const m=t.getUint32(l,!0);m===67324752&&(o+=1),m===33639248&&(i+=1)}s(o,2),s(i,2),s(t.getUint32(e.length-22,!0),101010256,"end of central directory"),s(t.getUint16(e.length-22+10,!0),2,"entry count")});a("stores UTF-8 content at its byte length, not its character length",()=>{const e=je({"a.md":"café"}),t=new DataView(e.buffer,e.byteOffset,e.byteLength);s(t.getUint32(18,!0),5,"four characters, five bytes"),s(t.getUint16(6,!0),2048,"the UTF-8 flag is set")});a("an empty archive is still well formed",()=>{const e=je({});s(e.length,22)});c("same file");const r=`---
id: wireframes
title: Wireframes
project: [website]
done: false
---
Some notes.

- [ ] first
- [x] second
`;a("a file is the same as itself",()=>{n(v("wireframes.md",r,r))});a("key order, quoting, CRLF and checklist position do not change meaning",()=>{const e=`---\r
title: "Wireframes"\r
project:\r
  - website\r
id: wireframes\r
done: false\r
---\r
- [ ] first\r
Some notes.\r
- [x] second\r
`;n(e!==r,"the two should differ as bytes"),n(v("wireframes.md",r,e))});a("a real change is still a change",()=>{n(!v("wireframes.md",r,r.replace("done: false","done: true"))),n(!v("wireframes.md",r,r.replace("Some notes.","Other notes."))),n(!v("wireframes.md",r,r.replace("- [ ] first","- [x] first")))});a("projects and the trash canonicalise too",()=>{const e=`---
id: website
title: Website
starred: true
---
Context.
`;n(v("website/_project-website.md",e,`---
title: Website
starred: true
id: website
---

Context.

`)),n(!v("website/_project-website.md",e,e.replace("Context.","Different.")));const o=ve([{kind:"task",at:"now",label:"x",data:{}}]);n(v("_trash.md",o,o))});a("a note with no frontmatter is compared by what it says",()=>{n(v("stray.md",`Just prose.
`,"Just prose.")),n(!v("stray.md","Just prose.","Other prose."))});a("canonicalising the demo corpus is a fixed point",()=>{for(const[e,t]of Object.entries(X)){const o=ge(e,t);s(ge(e,o),o,e)}});let gt=Date.UTC(2026,0,1);function ye(e,t={},o=[],i=""){const l=new Map,m=new Map,b=d=>({text:d,mtime:gt+=1e3,size:d.length}),ne=d=>({lastModified:d.mtime,size:d.size,async text(){return d.text}}),xe={name:e,kind:"directory",log:o,async queryPermission(){return"granted"},async requestPermission(){return"granted"},async*entries(){for(const[d,f]of[...l])yield[d,{kind:"file",name:d,async getFile(){return ne(f)}}];for(const[d,f]of[...m])yield[d,f]},async getDirectoryHandle(d,{create:f}={}){if(!m.has(d)){if(!f)throw new Error(`no such directory: ${d}`);m.set(d,ye(d,{},o,`${i}${d}/`))}return m.get(d)},async getFileHandle(d,{create:f}={}){if(!l.has(d)&&!f)throw new Error(`no such file: ${d}`);return{kind:"file",name:d,async getFile(){return ne(l.get(d)??{text:"",mtime:0,size:0})},async createWritable(){let L="";return{async write(R){L+=R},async close(){l.set(d,b(L)),o.push(`write ${i}${d}`)}}}}},async removeEntry(d){if(!l.delete(d))throw new Error(`no such file: ${d}`);o.push(`remove ${i}${d}`)},put(d,f){const L=d.indexOf("/");if(L===-1){l.set(d,b(f));return}const R=d.slice(0,L);m.has(R)||m.set(R,ye(R,{},o,`${i}${R}/`)),m.get(R).put(d.slice(L+1),f)},dump(){const d={};for(const[f,L]of l)d[`${i}${f}`]=L.text;for(const f of m.values())Object.assign(d,f.dump());return d}};for(const[d,f]of Object.entries(t))xe.put(d,f);return xe}async function w(e){const t=ye("vault",e),o=globalThis.showDirectoryPicker;globalThis.showDirectoryPicker=async()=>t;try{const i=Me({sameFile:v}),l=await i.connectFolder();return t.log.length=0,{storage:i,directory:t,files:l}}finally{globalThis.showDirectoryPicker=o}}const $=`---
id: doomed
title: Doomed
done: false
---
`;function h(e,t){a(e,async()=>{const o=localStorage.getItem("tasks.files");try{await t()}finally{o===null?localStorage.removeItem("tasks.files"):localStorage.setItem("tasks.files",o)}})}c("storage gate");h("browser-only storage is always writable",()=>{n(Me({sameFile:v}).state.writable)});h("a connected folder opens read-only",async()=>{const{storage:e}=await w({"wireframes.md":r});s(e.state.mode,"folder"),n(!e.state.writable,"a fresh folder must not be writable")});h("a read-only folder is not written to, and nothing is deleted",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r,"doomed.md":$}),o=t.dump(),i=localStorage.getItem("tasks.files"),l=await e.save({"wireframes.md":r.replace("Wireframes","Changed")});s(l,{skipped:"read-only"}),s(t.log,[],"a locked folder must see no writes and no removals"),s(t.dump(),o),s(localStorage.getItem("tasks.files"),i,"the mirror must not move either")});h("unlocking re-reads the folder",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r});t.put("wireframes.md",r.replace("Some notes.","Notes from my phone.")),t.put("later.md",`---
id: later
title: Later
done: false
---
`);const o=await e.unlock();n(e.state.writable,"unlock must open the gate"),n(o["wireframes.md"].includes("Notes from my phone."),"the external edit must be seen"),n("later.md"in o,"the external addition must be seen"),s(t.log,[],"unlocking must not write anything")});h("writes resume once unlocked",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r});await e.unlock();const o=r.replace("Some notes.","Edited here.");await e.save({"wireframes.md":o}),s(t.log,["write wireframes.md"]),s(t.dump()["wireframes.md"],o)});h("a file that differs only in formatting is left alone",async()=>{const e=`---
title: Wireframes
id: wireframes
project: [website]
done: false
---
Some notes.

- [ ] first
- [x] second
`,{storage:t,directory:o}=await w({"wireframes.md":e});await t.unlock(),await t.save({"wireframes.md":ge("wireframes.md",e)}),s(o.log,[],"reformatting alone is not a change worth writing"),s(o.dump()["wireframes.md"],e,"the file keeps its own shape")});h("a genuinely new file is still created",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r});await e.unlock();const o=`---
id: new-task
title: New task
done: false
---
`;await e.save({"wireframes.md":r,"new-task.md":o}),s(t.log,["write new-task.md"]),s(t.dump()["new-task.md"],o)});h("deletions happen once unlocked, and not before",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r,"doomed.md":$});await e.save({"wireframes.md":r}),n("doomed.md"in t.dump(),"a locked folder keeps its files"),await e.unlock(),await e.save({"wireframes.md":r}),s(t.log,["remove doomed.md"]),n(!("doomed.md"in t.dump()))});h("locking again withdraws the right to write",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r});await e.unlock(),e.lock(),n(!e.state.writable),await e.save({"wireframes.md":r.replace("Wireframes","Changed")}),s(t.log,[])});h("project subfolders round-trip through the gate",async()=>{const{storage:e,directory:t}=await w({"website/_project-website.md":`---
id: website
title: Website
---
`,"website/wireframes.md":r});n(!e.state.writable);const o=await e.unlock();n("website/_project-website.md"in o),n("website/wireframes.md"in o),await e.save({...o,"website/wireframes.md":r.replace("Some notes.","Edited.")}),s(t.log,["write website/wireframes.md"])});c("a folder that keeps moving");const ie="wireframes (Georg's conflicted copy 2026-08-19).md";h("a conflict copy is never read, written or deleted",async()=>{const{storage:e,directory:t,files:o}=await w({"wireframes.md":r,[ie]:r.replace("Some notes.","The other machine’s notes.")});n(!(ie in o),"a conflict copy must not reach the board"),s(e.state.conflictFiles,[ie]);const i=await e.unlock();await e.save(i),await e.save({...i,"wireframes.md":r.replace("Some notes.","Edited.")}),n(!t.log.some(l=>l.includes("conflicted copy")),t.log.join()),s(t.dump()[ie],r.replace("Some notes.","The other machine’s notes."))});h("a conflict copy of a project file does not make a folder a project",async()=>{const{files:e}=await w({"notes/_project-website (Georg's conflicted copy 2026-08-19).md":`---
id: website
title: Website
---
`,"notes/reading.md":r});s(Object.keys(e),[])});h("a file that changed since we read it is not written over",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r,"doomed.md":$}),o=await e.unlock();t.put("wireframes.md",r.replace("Some notes.","Written on the other machine."));const i=await e.save({...o,"wireframes.md":r.replace("Some notes.","Written here."),"doomed.md":$.replace("Doomed","Spared")});s(i,{blocked:["wireframes.md"]}),s(t.log,["write doomed.md"]),n(t.dump()["wireframes.md"].includes("Written on the other machine."),"the folder’s version must survive")});h("a file that changed since we read it is not deleted",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r,"doomed.md":$}),o=await e.unlock();t.put("doomed.md",$.replace("Doomed","Not any more"));const{"doomed.md":i,...l}=o,m=await e.save(l);s(m,{blocked:["doomed.md"]}),s(t.log,[]),n("doomed.md"in t.dump(),"the file must still be there")});h("a file that vanished elsewhere is written back, not blocked",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r}),o=await e.unlock();await t.removeEntry("wireframes.md"),t.log.length=0;const i=await e.save({"wireframes.md":r.replace("Some notes.","Edited.")});s(i,{}),s(t.log,["write wireframes.md"])});h("a path we have never read is not created over something",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r}),o=await e.unlock();t.put("worktop.md",`---
id: worktop
title: Worktop
---
Theirs.
`);const i=await e.save({...o,"worktop.md":`---
id: worktop
title: Worktop
---
Ours.
`});s(i,{blocked:["worktop.md"]}),s(t.log,[]),n(t.dump()["worktop.md"].includes("Theirs."))});h("two saves at once do not interleave",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r,"doomed.md":$});await e.unlock();const o=e.save({"wireframes.md":r.replace("Some notes.","First."),"doomed.md":$.replace("Doomed","First")}),i=e.save({"wireframes.md":r.replace("Some notes.","Second."),"doomed.md":$.replace("Doomed","Second")});await Promise.all([o,i]),s(t.log,["write wireframes.md","write doomed.md","write wireframes.md","write doomed.md"]),n(t.dump()["wireframes.md"].includes("Second."))});h("a re-read notices the folder moving, and settles it",async()=>{const{storage:e,directory:t}=await w({"wireframes.md":r});await e.unlock(),s((await e.revalidate()).changed,!1),t.put("wireframes.md",r.replace("Some notes.","Theirs."));const{files:o,changed:i}=await e.revalidate();n(i,"an edit elsewhere is a change"),n(o["wireframes.md"].includes("Theirs.")),await e.save(o),s(t.log,[])});h("a file whose id another file claimed is left where it is",async()=>{const{storage:e,directory:t,files:o}=await w({"wireframes.md":r,"wireframes 1.md":r.replace("Some notes.","A copy.")}),i=await e.unlock();e.disown(se(i).paths),await e.save(g(k(i))),s(t.log,[]),n("wireframes 1.md"in t.dump(),"the copy must survive"),n(t.dump()["wireframes 1.md"].includes("A copy.")),n("wireframes.md"in o)});const Oe=document.getElementById("out");let Se=0,ke=0;async function bt(){for(const{name:t,tests:o}of qe){const i=document.createElement("h2");i.textContent=t,Oe.append(i);for(const{name:l,fn:m}of o){const b=document.createElement("div");try{await m(),b.className="pass",b.textContent=`✓ ${l}`,Se+=1}catch(ne){b.className="fail",b.textContent=`✗ ${l} — ${ne.message}`,ke+=1}Oe.append(b)}}const e=document.getElementById("summary");e.textContent=`${Se} passed, ${ke} failed`,e.className=ke?"fail":"pass"}bt();
