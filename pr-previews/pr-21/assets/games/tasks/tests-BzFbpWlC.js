import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{_ as Pe,f as Ie,h as Le,j as Fe,k as Ae,l as Ge,m as Re,n as Ue,o as ze,p as Je,q as He,r as Xe,t as Ke,u as Qe,v as Ze,w as Ve,x as Ye,y as et,z as tt,A as st,J as v,a1 as at,H as k,ac as oe,ad as ot,ae as y,af as D,ag as U,ah as ee,ai as xe,aj as nt,B as g,ak as ae,O as le,P as ne,al as J,a6 as it,a8 as V,a9 as B,a0 as S,$ as _e,a2 as x,K as E,D as rt,M as dt,L as lt,a3 as R,a5 as M,Q as ct,a4 as we,a7 as L,V as ye,i as b,Z,X,am as Oe,R as q,I as F,an as Se,ab as Y,ao as ue,ap as fe,aq as ce,N as pt,e as T,c as Te,C as ht,d as pe,b as ut,ar as ie,as as Be,W as be,aa as w,at as me,G as We,au as mt,Y as $e,av as De}from"../../llm-BJwPoQSY.js";const Ee=[];let ke=null;function p(e){ke={name:e,tests:[]},Ee.push(ke)}function a(e,t){ke.tests.push({name:e,fn:t})}function o(e,t){if(!e)throw new Error(t||"assertion failed")}function s(e,t,n){const i=JSON.stringify(e),d=JSON.stringify(t);if(i!==d)throw new Error(`${n?`${n}: `:""}expected ${d}, got ${i}`)}function Me(e,t){try{e()}catch{return}throw new Error("expected a throw")}const H=Object.fromEntries(Object.entries(Object.assign({"../demo/_project-q4-hiring.md":st,"../demo/_project-website.md":tt,"../demo/analytics-dashboard.md":et,"../demo/billing-integration.md":Ye,"../demo/component-library.md":Ve,"../demo/copywriting.md":Ze,"../demo/design-review.md":Qe,"../demo/discovery-interviews.md":Ke,"../demo/docs-site.md":Xe,"../demo/information-architecture.md":He,"../demo/interview-loop.md":Je,"../demo/job-descriptions.md":ze,"../demo/launch.md":Ue,"../demo/offers-out.md":Re,"../demo/qa-pass.md":Ge,"../demo/self-serve-signup.md":Ae,"../demo/signup-flow.md":Fe,"../demo/sourcing.md":Le,"../demo/visual-design.md":Ie,"../demo/wireframes.md":Pe})).map(([e,t])=>[e.split("/").pop(),t]));p("frontmatter");a("parses scalars, booleans and flow lists",()=>{const{data:e}=oe(`---
a: hello
b: true
c: [x, y]
d: 2026-09-14
---
body
`);s(e,{a:"hello",b:!0,c:["x","y"],d:"2026-09-14"})});a("parses block lists",()=>{const{data:e}=oe(`---
people:
  - georg
  - ada
---
`);s(e.people,["georg","ada"])});a("keeps the body verbatim",()=>{const{body:e}=oe(`---
a: 1
---
line one

line two
`);s(e,`line one

line two
`)});a("a file without frontmatter is all body",()=>{const{data:e,body:t}=oe(`just text
`);s(e,{}),s(t,`just text
`)});a("quotes values that would otherwise change meaning",()=>{const e=ot({color:"#2563eb",title:"a: b",flag:"true"});o(e.includes("color: '#2563eb'"),"hash must be quoted"),o(e.includes("title: 'a: b'"),"colon must be quoted"),o(e.includes("flag: 'true'"),'a string "true" must not become a boolean')});a("unknown keys survive a round trip",()=>{const t=y("x.md",`---
id: x
title: X
done: false
cssclass: kanban
---
`);s(t.extra,{cssclass:"kanban"}),o(D(t).includes("cssclass: kanban"),"extra key must be written back")});a("a project file separates its one-line goal from its free-form context",()=>{const e=U("_project-website.md",`---
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
`;s(ee(U("_project-x.md",e)),e)});a("a project file written before the split keeps its body as context, not as a goal",()=>{const e=U("_project-x.md",`---
id: x
title: X
---
Old body prose.
`);s(e.goal,"","nothing is guessed into the goal"),s(e.context,"Old body prose.")});a("a goal containing a colon survives serialisation",()=>{const t=U("_project-x.md",ee({id:"x",title:"X",goal:"Ship it: end to end, no humans",people:[],context:""}));s(t.goal,"Ship it: end to end, no humans")});a("empty project fields are omitted rather than written blank",()=>{const e=ee({id:"x",title:"X",goal:"",people:[],context:""});o(!e.includes("goal:"),"an empty goal must not be written"),o(!e.includes("people:"),"an empty roster must not be written"),s(e,`---
id: x
title: X
---
`)});a("a project id falls back to the filename",()=>{s(U("_project-q4-hiring.md",`---
title: Q4
---
`).id,"q4-hiring")});a("splits and rebuilds a checklist",()=>{const{notes:e,subtasks:t}=xe(`Notes.

- [x] one
- [ ] two
`);s(e,"Notes."),s(t,[{done:!0,text:"one"},{done:!1,text:"two"}]),s(nt(e,t),`Notes.

- [x] one
- [ ] two`)});a("accepts * bullets and upper-case X",()=>{const{subtasks:e}=xe(`* [X] done thing
`);s(e,[{done:!0,text:"done thing"}])});a("every demo file is a fixed point of parse -> serialise",()=>{const e=g(k(H)),t=Object.keys(H);o(t.length>=18,`expected the full corpus, got ${t.length}`);for(const n of t)s(e[n],H[n],`${n} did not round-trip`)});a("empty optional keys are omitted rather than written blank",()=>{const e=D(y("x.md",`---
id: x
title: X
done: false
---
`));o(!e.includes("due:"),"an absent due date must not be written"),o(!e.includes("people:"),"an empty people list must not be written"),o(e.includes("done: false"),"done is always written")});p("ids");a("slugifies titles",()=>{s(ae("Design Review!"),"design-review"),s(ae("  Ship  it  "),"ship-it")});a("transliterates letters with no NFKD decomposition",()=>{s(ae("Réunion Ærø søk"),"reunion-aero-sok")});a("never produces an empty slug",()=>{s(ae("!!!"),"task")});a("suffixes on collision",()=>{s(le("Design review",["design-review"]),"design-review-2"),s(le("Design review",["design-review","design-review-2"]),"design-review-3"),s(le("Design review",[]),"design-review")});p("dates and estimates");a("parses and formats ISO dates in UTC",()=>{s(ne(v("2026-09-14")),"2026-09-14"),s(v(""),null),s(v("not a date"),null)});a("parses durations into hours",()=>{s(J("2h"),2),s(J("3d"),24),s(J("1w"),40),s(J("1.5d"),12)});a("free-form estimates are kept but not counted",()=>{s(J("a while"),null),s(it([{estimate:"1d"},{estimate:"ages"},{estimate:"2h"}]),10)});p("timeline");const h=v("2026-08-01");a("bucket size follows the project span",()=>{s(V(h,v("2026-08-20")).unit,"day"),s(V(h,v("2026-11-30")).unit,"week"),s(V(h,v("2028-08-01")).unit,"month"),s(V(null,null).unit,"week","falls back to weeks")});a("levels are fractional so the now-line can sit between them",()=>{const e=B("week");s(e.level(v("2026-08-08"),h),1),o(Math.abs(e.level(v("2026-08-05"),h)-4/7)<1e-9)});a("month levels follow the calendar, not a fixed width",()=>{const e=B("month");s(Math.floor(e.level(v("2026-09-01"),h)),1),s(Math.floor(e.level(v("2027-01-31"),h)),5)});a("undated tasks land in a tray below the last dated level",()=>{const e=B("week"),t=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-09-05"},{id:"c",due:""}],{levels:n,trayLevel:i}=S(t,{bucket:e,start:h});s(n.get("a"),0),s(n.get("b"),5),s(n.get("c"),i),o(i>5,"the tray sits below every dated task")});a("levels are shifted so the earliest task is level 0",()=>{const e=B("week"),{levels:t}=S([{id:"a",due:"2026-07-01"}],{bucket:e,start:h});s(t.get("a"),0,"a task before the project start still lands at 0")});a("the window widens to cover tasks outside the declared dates",()=>{const e=_e({start:"2026-08-01",end:"2026-08-31"},[{due:"2026-12-25"}]);s(ne(e.end),"2026-12-25")});p("derived status");const $=[{id:"a",done:!0,subtasks:[],blockedBy:[],due:"2026-01-01"},{id:"b",done:!1,subtasks:[{done:!0,text:"1"},{done:!1,text:"2"}],blockedBy:["a"],due:"2030-01-01"},{id:"c",done:!1,subtasks:[],blockedBy:["b"],due:"2020-01-01"}],_=at($),O=Date.UTC(2026,0,15);a("progress comes from the checklist",()=>{s(x($[1],_,O).ratio,.5),s(x($[1],_,O).checked,1)});a("a completed task reads as fully done regardless of its checklist",()=>{const e=x({...$[1],done:!0},_,O);s(e.ratio,1),o(e.done)});a("blocked means an incomplete prerequisite",()=>{o(!x($[1],_,O).blocked,"a is done, so b is free"),o(x($[2],_,O).blocked,"b is open, so c is blocked")});a("overdue means past its deadline and not done",()=>{o(x($[2],_,O).overdue),o(!x($[0],_,O).overdue,"done work is never overdue"),o(!x($[1],_,O).overdue)});a("a task with no deadline is never overdue",()=>{o(!x({due:"",subtasks:[],blockedBy:[]},_,O).overdue)});a("a reference to a task that does not exist does not block",()=>{o(!x({done:!1,subtasks:[],blockedBy:["ghost"],due:""},_,O).blocked)});p("filters");const c=k(H);a("the demo board loads two projects and every task",()=>{s(c.projects.length,2),s(c.tasks.length,Object.keys(H).length-2)});a("filtering by project keeps tasks tagged with it",()=>{const e=E(c.tasks,{projectId:"website"});o(e.length>10,"the website project is the busy one"),o(e.every(t=>t.project.includes("website"))),o(e.some(t=>t.id==="job-descriptions"),"a task in two projects shows in both"),o(E(c.tasks,{projectId:"q4-hiring"}).some(t=>t.id==="job-descriptions"))});a("filtering by person is a union, not an intersection",()=>{const e=E(c.tasks,{people:["ada","sam"]}),t=E(c.tasks,{people:["ada"]});o(e.length>=t.length,"adding a person can only widen the set"),o(e.every(n=>n.people.includes("ada")||n.people.includes("sam")))});a("hideDone drops completed work",()=>{o(E(c.tasks,{hideDone:!0}).every(e=>!e.done))});a("an empty filter is the identity",()=>{s(E(c.tasks,{}).length,c.tasks.length)});a("projectPeople marks roster members, task-only names and their open counts",()=>{const n=rt({id:"p",people:["georg","kim"]},[{id:"a",project:["p"],people:["georg"],done:!1},{id:"b",project:["p"],people:["georg"],done:!0},{id:"c",project:["p"],people:["ada"],done:!1},{id:"d",project:["other"],people:["zoe"],done:!1}]);s(n.map(i=>i.name),["georg","kim","ada"],"roster first, then adopted"),s(n.find(i=>i.name==="georg"),{name:"georg",inRoster:!0,openTasks:1}),s(n.find(i=>i.name==="kim"),{name:"kim",inRoster:!0,openTasks:0}),s(n.find(i=>i.name==="ada"),{name:"ada",inRoster:!1,openTasks:1}),o(!n.some(i=>i.name==="zoe"),"people on other projects are not listed")});a("people and project tags are deduplicated and sorted",()=>{s(dt(c.tasks),["Georg","Oliver","Sverre"]),s(lt(c.tasks),["q4-hiring","website"])});p("edges");a("blocks runs prerequisite -> dependent, part-of runs child -> parent",()=>{const t=R([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:[],partOf:["a"]}],new Map([["a",0],["b",1],["c",1]])),n=t.find(d=>d.kind==="blocks"),i=t.find(d=>d.kind==="part-of");s([n.from,n.to],["a","b"]),s([i.from,i.to],["c","a"])});a("edges to tasks outside the filtered set are dropped",()=>{const e=R([{id:"b",blockedBy:["a"],partOf:[]}],new Map([["b",1]]));s(e,[])});a("a prerequisite due after its dependent is flagged as a conflict",()=>{const e=[{id:"a",due:"2026-09-05",blockedBy:[],partOf:[]},{id:"b",due:"2026-08-15",blockedBy:["a"],partOf:[]}];o(R(e,new Map([["a",5],["b",2]]))[0].conflict,"blocker below dependent"),o(!R(e,new Map([["a",2],["b",5]]))[0].conflict,"normal order")});a("the demo project has no scheduling conflicts",()=>{const e=E(c.tasks,{projectId:"website"}),t=_e(c.projects.find(i=>i.id==="website"),e),{levels:n}=S(e,{bucket:V(t.start,t.end),start:t.start});s(R(e,n).filter(i=>i.conflict),[])});p("relations");const te=()=>[{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:["b"],partOf:[]},{id:"loner",blockedBy:[],partOf:[]}];a("a task can never wait on itself",()=>{o(M(te(),"a","blockedBy").has("a"),"a is forbidden to itself")});a("anything downstream would close a loop",()=>{const e=M(te(),"a","blockedBy");o(e.has("b"),"direct dependent"),o(e.has("c"),"dependent two steps out")});a("an unrelated task is always available",()=>{o(!M(te(),"a","blockedBy").has("loner"),"loner is fine"),o(!M(te(),"c","blockedBy").has("a"),"c already waits on a upstream")});a("upstream tasks stay available, so the chain can be tightened",()=>{o(!M(te(),"c","blockedBy").has("b"),"b is already a blocker of c")});a("part-of loops are refused the same way",()=>{const t=M([{id:"parent",blockedBy:[],partOf:[]},{id:"child",blockedBy:[],partOf:["parent"]},{id:"grandchild",blockedBy:[],partOf:["child"]}],"parent","partOf");s([...t].sort(),["child","grandchild","parent"])});a("the two relations are judged independently",()=>{o(!M([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]}],"a","partOf").has("b"),"blocking does not constrain part-of")});a("a missing reference cannot make a loop",()=>{s([...M([{id:"a",blockedBy:["ghost"],partOf:[]}],"a","blockedBy")],["a"])});a("the demo board has no task that could be added to its own blockers",()=>{for(const e of c.tasks)o(M(c.tasks,e.id,"blockedBy").has(e.id),`${e.id} excludes itself`)});p("star and archive");const qe=(e,t="")=>`---
id: ${e}
title: ${e}
${t}---
`;a("starred and archived round trip, and are written only when set",()=>{const e=U("_project-kitchen.md",qe("kitchen",`starred: true
archived: true
`));s(e.starred,!0),s(e.archived,!0);const t=ee(e);o(/^starred: true$/m.test(t),"starred is written when set"),o(/^archived: true$/m.test(t),"archived is written when set");const n=ee({...e,starred:!1,archived:!1});o(!/starred/.test(n)&&!/archived/.test(n),"neither is written when unset")});a("a project file with neither flag reads as neither",()=>{const e=U("_project-kitchen.md",qe("kitchen"));s(e.starred,!1),s(e.archived,!1)});a("starred projects sort first, the rest keep their order",()=>{const e=ct([{id:"b"},{id:"a"},{id:"z",starred:!0},{id:"c"}]);s(e.map(t=>t.id),["z","a","b","c"])});a("archived projects are hidden unless asked for",()=>{const e=[{id:"a"},{id:"b",archived:!0}];s(we(e).map(t=>t.id),["a"]),s(we(e,!0).map(t=>t.id),["a","b"])});p("deleting a project");const C=()=>({projects:[{id:"kitchen",title:"Kitchen",folder:"kitchen"},{id:"website",title:"Website",folder:"website"}],tasks:[{id:"worktop",title:"Worktop",project:["kitchen"]},{id:"shared",title:"Shared",project:["kitchen","website"]},{id:"kitchen-goal",title:"A finished kitchen",project:["kitchen"],goal:!0},{id:"other",title:"Other",project:["website"]}],trash:[]});a("keeping the tasks only strips the tag",()=>{const e=L(C(),"kitchen",{deleteTasks:!1});s(e.removed,[]),s(e.projects.map(t=>t.id),["website"]),s(e.tasks.find(t=>t.id==="worktop").project,[])});a("deleting the tasks takes only the ones this project alone holds",()=>{const e=L(C(),"kitchen",{deleteTasks:!0});s(e.removed.map(t=>t.id),["worktop"]),o(!e.tasks.some(t=>t.id==="worktop"),"the task this project alone held is gone")});a("a task belonging elsewhere survives, and moves to that project",()=>{const e=L(C(),"kitchen",{deleteTasks:!0}),t=e.tasks.find(i=>i.id==="shared");s(t.project,["website"]);const n=Object.keys(g({...C(),...e,tasks:e.tasks}));o(n.includes("website/shared.md"),`shared.md moved to website/ (${n.join(", ")})`)});a("the goal node goes quietly either way, never into the trash",()=>{for(const e of[!1,!0]){const t=L(C(),"kitchen",{deleteTasks:e});o(!t.tasks.some(n=>n.id==="kitchen-goal"),"the goal node is gone"),o(!t.removed.some(n=>n.goal),"and is not in the trash record")}});a("tasks that merely lose the tag are remembered, so a restore can undo that",()=>{const e=L(C(),"kitchen",{deleteTasks:!1});s(e.untagged.sort(),["shared","worktop"]);const t=L(C(),"kitchen",{deleteTasks:!0});s(t.untagged,["shared"]),s(t.removed.map(n=>n.id),["worktop"])});a("deleting a project that does not exist plans nothing",()=>{s(L(C(),"nope",{deleteTasks:!0}),null)});a("tasks in other projects are left completely alone",()=>{const e=L(C(),"kitchen",{deleteTasks:!0});s(e.tasks.find(t=>t.id==="other").project,["website"])});p("project folders");const N={"relaunch-2026/_project-website.md":`---
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
`},se=(e,t)=>Object.keys(e).find(n=>n===`${t}.md`||n.endsWith(`/${t}.md`));a("a project remembers the folder it was found in",()=>{const{projects:e}=k(N);s(e.find(t=>t.id==="website").folder,"relaunch-2026"),s(e.find(t=>t.id==="kitchen").folder,"kitchen")});a("a task follows its project, not a folder named after it",()=>{const e=g(k(N));s(se(e,"wireframes"),"relaunch-2026/wireframes.md"),s(se(e,"worktop"),"kitchen/worktop.md")});a("a project file lives in its own folder",()=>{o("relaunch-2026/_project-website.md"in g(k(N)),"the project file stays beside its tasks")});a("an untagged task sits at the parent root",()=>{s(se(g(k(N)),"odd-job"),"odd-job.md")});a("the first tag decides where a task lives",()=>{const e=k({...N,"both.md":`---
id: both
title: Both
project: [kitchen, website]
---
`});s(se(g(e),"both"),"kitchen/both.md"),s(e.tasks.find(t=>t.id==="both").project,["kitchen","website"])});a("a tag naming no project we have lands at the root",()=>{const e=k({...N,"stray.md":`---
id: stray
title: Stray
project: gardening
---
`});s(se(g(e),"stray"),"stray.md")});a("the trash belongs to the parent, not to any one project",()=>{const e={...k(N),trash:[{kind:"task",data:{id:"gone"}}]};o("_trash.md"in g(e),"the trash is at the root")});a("a nested board round trips to a fixed point",()=>{const e=g(k(N));s(g(k(e)),e)});const Ce={"_project-website.md":`---
id: website
title: Website
---
`,"wireframes.md":`---
id: wireframes
title: Wireframes
project: website
---
`};a("a flat board stays flat",()=>{s(Object.keys(g(k(Ce))).sort(),["_project-website.md","wireframes.md"])});a("giving a flat project a folder moves its files into it",()=>{const e=k(Ce),t={...e,projects:e.projects.map(n=>({...n,folder:n.id}))};s(Object.keys(g(t)).sort(),["website/_project-website.md","website/wireframes.md"])});a("two folders claiming one id: the first is used",()=>{const{projects:e}=k({"a/_project-website.md":`---
id: website
title: First
---
`,"b/_project-website.md":`---
id: website
title: Second
---
`});s(e.length,1),s(e[0].folder,"a")});a("a clash is reported so the app can say so",()=>{s(ye({"a/_project-website.md":"","b/_project-website.md":"","kitchen/_project-kitchen.md":""}),["website"]),s(ye(N),[])});p("initials");a("one word gives one letter, two give two",()=>{s(b("Georg"),"G"),s(b("Georg Muntingh"),"GM")});a("only the first two words count",()=>{s(b("Ada Byron King Lovelace"),"AB")});a("separators other than spaces still split",()=>{s(b("ada-lovelace"),"AL"),s(b("ada.lovelace"),"AL"),s(b("ada_lovelace"),"AL")});a("punctuation and stray whitespace are ignored",()=>{s(b("  georg   "),"G"),s(b("O'Brien"),"O")});a("a name with no letters still yields something drawable",()=>{s(b(""),"?"),s(b("   "),"?"),s(b(null),"?")});a("initials come back upper case whatever the name looks like",()=>{s(b("georg muntingh"),"GM")});p("working");const re=()=>[{id:"a",working:!1},{id:"b",working:!0},{id:"c",working:!1}],de=e=>e.filter(t=>t.working).map(t=>t.id);a("setting one releases whatever held it",()=>{s(de(Z(re(),"c")),["c"])});a("null releases without setting another",()=>{s(de(Z(re(),null)),[])});a("an id that is not on the board leaves nothing marked",()=>{s(de(Z(re(),"ghost")),[])});a("there is never more than one, whatever the input claimed",()=>{s(de(Z([{id:"a",working:!0},{id:"b",working:!0}],"b")),["b"])});a("tasks that do not change are returned by identity",()=>{const e=re(),t=Z(e,"b");o(t[0]===e[0],"untouched task is the same object"),o(t[1]===e[1],"the one already set is untouched too")});a("nothing else about a task is disturbed",()=>{s(Z([{id:"a",title:"Wireframes",people:["Georg"],working:!1}],"a"),[{id:"a",title:"Wireframes",people:["Georg"],working:!0}])});p("placement and flags");a("a stored x comes back as a number, not the string yaml gives",()=>{const e=y("w.md",["---","id: w","title: W","x: 412","---",""].join(`
`));s(e.x,412),o(typeof e.x=="number","x is a number")});a("an unparseable or missing x is null rather than NaN",()=>{const e=y("w.md",["---","id: w","x: over there","---",""].join(`
`));s(e.x,null),s(y("w.md",["---","id: w","---",""].join(`
`)).x,null)});a("x survives a round trip, including x: 0",()=>{const e=y("w.md",["---","id: w","title: W","x: 0","---",""].join(`
`));s(e.x,0),o(/^x: 0$/m.test(D(e)),"x: 0 is written, not dropped as empty")});a("no x means no x line",()=>{const e=D(y("w.md",["---","id: w","---",""].join(`
`)));o(!/^x:/m.test(e),"nothing to say about placement, so nothing written")});a("working is written only when it is set",()=>{const e=y("w.md",["---","id: w","working: true","---",""].join(`
`));s(e.working,!0),o(/^working: true$/m.test(D(e)),"set, so written"),o(!/working/.test(D({...e,working:!1})),"released, so absent")});a("the two new keys round trip to a fixed point",()=>{const e=D(y("w.md",["---","id: w","title: W","due: 2026-08-15","working: true","x: 412","---","","Body",""].join(`
`)));s(D(y("w.md",e)),e)});a("placement and flags do not leak into extra",()=>{const e=y("w.md",["---","id: w","x: 5","working: true","---",""].join(`
`));s(e.extra,{})});p("LLM brief");a("includes the goal, a task table and the dependency list",()=>{const e=c.projects.find(i=>i.id==="website"),t=E(c.tasks,{projectId:"website"}),n=X(e,t,{now:Date.UTC(2026,7,16)});o(n.includes("# Website relaunch"),"title"),o(n.includes("## Goal"),"goal section"),o(n.includes("## Context"),"context section"),o(n.includes("| id | task | due | estimate | people | subtasks |"),"table header"),o(n.includes("| wireframes | Wireframes |"),"a task row keyed by its id"),o(n.includes("- wireframes blocked-by information-architecture"),"dependency"),o(n.includes("- signup-flow part-of self-serve-signup"),"part-of dependency")});a("a task brief carries its existing subtasks and their state",()=>{const e=Oe({title:"Design review",subtasks:[{done:!0,text:"book the room"},{done:!1,text:"collect feedback"}]});o(e.includes("Existing subtasks:"),"the section is present"),o(e.includes("- [x] book the room"),"ticked state survives"),o(e.includes("- [ ] collect feedback"),"unticked state survives"),o(q.subtasks.messages({title:"P"},[],{title:"Design review",subtasks:[{done:!1,text:"collect feedback"}]}).some(t=>t.content.includes("collect feedback")),"and it reaches the prompt the model actually sees")});a("goal and context are separate labelled sections",()=>{const e=X({title:"P",goal:"Ship it",context:`Stripe is set up.

## Open questions
- SOC2?`},[]);o(e.includes(`## Goal
Ship it`),"goal section"),o(e.includes(`## Context
Stripe is set up.`),"context section"),o(e.indexOf("## Goal")<e.indexOf("## Context"),"goal comes first"),o(e.includes("- SOC2?"),"context goes verbatim, headings and all")});a("each section is dropped cleanly when empty",()=>{const e=X({title:"P",goal:"Ship it",context:""},[]);o(e.includes("## Goal"),"goal kept"),o(!e.includes("## Context"),"no empty context heading");const t=X({title:"P",goal:"",context:"Background."},[]);o(!t.includes("## Goal"),"no empty goal heading"),o(t.includes("## Context"),"context kept")});const K=(e={})=>({id:"w",title:"W",goal:"Ship it",end:"2026-11-30",...e});a("a goal node is created for every project that has a goal",()=>{const{tasks:e}=F({tasks:[],projects:[K()]});s(e.length,1),s(e[0].id,$e("w")),s(e[0].title,"Ship it"),s(e[0].due,"2026-11-30","the goal sits at the project deadline"),o(e[0].goal,"and is marked as the goal node")});a("a goal node follows its project title and deadline",()=>{const e=F({tasks:[],projects:[K()]}).tasks,{tasks:t}=F({tasks:e,projects:[K({goal:"Ship it sooner",end:"2026-10-01"})]});s(t.length,1,"no second node is created"),s(t[0].title,"Ship it sooner"),s(t[0].due,"2026-10-01")});a("clearing the goal hands its node back for deletion",()=>{const e=F({tasks:[],projects:[K()]}).tasks,{tasks:t,removed:n}=F({tasks:e,projects:[K({goal:""})]});s(t.length,0),s(n.map(i=>i.id),[$e("w")])});a("deleting a project hands its goal node back too",()=>{const e=F({tasks:[],projects:[{id:"website",title:"Website",goal:"Ship it",end:"2026-09-01"}]});s(e.tasks.map(n=>n.id),["website-goal"]);const t=F({tasks:e.tasks,projects:[]});s(t.tasks,[]),s(t.removed.map(n=>n.id),["website-goal"])});a("a goal node survives a round-trip through markdown",()=>{const{tasks:e}=F({tasks:[],projects:[K()]}),t=D(e[0]);o(t.includes("goal: true"),"the marker is written"),o(y("w-goal.md",t).goal,"and read back")});a("only tasks nothing depends on feed the goal",()=>{const t=Se([{id:"w-goal",goal:!0,project:["w"]},{id:"a",project:["w"],blockedBy:[]},{id:"b",project:["w"],blockedBy:["a"]},{id:"c",project:["w"],partOf:["b"]}]);s(t,[{from:"b",to:"w-goal"}],"a is depended on, c is part of b")});a("the goal node never links to itself",()=>{s(Se([{id:"w-goal",goal:!0,project:["w"]}]),[])});a("an undated task is not a scheduling conflict",()=>{const e=B("week"),t=[{id:"g",goal:!0,project:["w"],due:"2026-09-01"},{id:"undated",project:["w"],due:""},{id:"late",project:["w"],due:"2026-10-01"}],{levels:n}=S(t,{bucket:e,start:h}),i=R(t,n),d=u=>i.find(f=>f.from===u);o(!d("undated").conflict,"the tray is a position, not a date after the goal"),o(d("late").conflict,"but a real deadline past the goal still is")});a("buildEdges emits goal links alongside stored ones",()=>{const t=R([{id:"w-goal",goal:!0,project:["w"]},{id:"a",project:["w"]}],new Map).map(n=>n.kind);o(t.includes("goal"),"a goal edge is present")});a("merging folds a task into another as checklist items",()=>{const e=[{id:"src",title:"Wireframes",done:!1,subtasks:[{done:!0,text:"lo-fi"}]},{id:"tgt",title:"Design",subtasks:[{done:!1,text:"existing"}]}],{tasks:t,merged:n}=Y(e,"src","tgt");s(t.map(i=>i.id),["tgt"],"the source is gone"),s(t[0].subtasks,[{done:!1,text:"existing"},{done:!1,text:"Wireframes"},{done:!0,text:"lo-fi"}],"title first, then its own subtasks, after what was already there"),s(n.id,"src","the merged task is handed back for the trash")});a("merging rewires dependents to the target and drops self-links",()=>{const e=[{id:"src",title:"S",subtasks:[]},{id:"tgt",title:"T",subtasks:[],blockedBy:["src"]},{id:"dep",title:"D",blockedBy:["src"]}],{tasks:t}=Y(e,"src","tgt");s(t.find(n=>n.id==="dep").blockedBy,["tgt"]),s(t.find(n=>n.id==="tgt").blockedBy,[],"a task cannot block itself")});a("merging refuses a goal node or a task with itself",()=>{const e=[{id:"a",title:"A",subtasks:[]},{id:"g",title:"G",goal:!0,subtasks:[]}];s(Y(e,"a","a"),null),s(Y(e,"g","a"),null),s(Y(e,"a","g"),null)});a("collapsing empty periods leaves consecutive rows and records the gaps",()=>{const e=B("week"),t=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-08"},{id:"c",due:"2026-09-26"}],n=S(t,{bucket:e,start:h});s([...n.levels.values()],[0,1,8],"ordinarily a level is elapsed time");const i=S(t,{bucket:e,start:h,collapse:!0});s([...i.levels.values()],[0,1,2],"occupied periods become adjacent"),s(i.gaps,[{afterLevel:1,periods:6}],"six empty weeks are recorded")});a("a row still labels its real date, collapsed or not",()=>{const e=B("week"),t=[{id:"a",due:"2026-08-22"},{id:"c",due:"2026-09-26"}],n=(i,d)=>{const{levelOrigin:u,minLevel:f}=S(t,{bucket:e,start:h,...i});return ne(e.dateForLevel(u.get(d)+f,h))};s(n({collapse:!0},0),"2026-08-22"),s(n({collapse:!0},1),"2026-09-26","row 1 points at the week it came from"),s(n({},0),"2026-08-22","and the uncollapsed scale agrees"),s(n({},5),"2026-09-26")});a("uncollapsed, every row in range is a real period",()=>{const e=B("week"),t=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-22"}],{levelOrigin:n}=S(t,{bucket:e,start:h});s([...n.keys()],[0,1,2,3],"the empty weeks between are still rows"),s(ne(e.dateForLevel(n.get(2),h)),"2026-08-15","and each maps to its own date")});a("collapsed, only occupied rows exist",()=>{const e=B("week"),t=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-22"}],{levelOrigin:n}=S(t,{bucket:e,start:h,collapse:!0});s([...n.keys()],[0,1],"the empty weeks are gone entirely")});a("collapsing keeps undated work in its own tray below the last row",()=>{const e=B("week"),t=[{id:"a",due:"2026-08-01"},{id:"u",due:""}],{levels:n,trayLevel:i}=S(t,{bucket:e,start:h,collapse:!0});s(n.get("u"),i),o(i>n.get("a"),"the tray sits below the dated rows")});a("the trash round-trips through its own file",()=>{const e=[{kind:"task",at:"2026-08-16T00:00:00.000Z",label:"A",data:{id:"a",subtasks:[]}}];s(ue(fe(e)),e)});a("an empty or unreadable trash file yields no records",()=>{s(ue(`---
id: _trash
---
`),[]),s(ue("---\nid: _trash\n---\n```json\nnot json\n```\n"),[])});a("the trash file is not mistaken for a task",()=>{const e=k({"_trash.md":fe([{kind:"task",at:"",label:"A",data:{}}])});s(e.tasks,[],"it is board state, not work"),s(e.trash.length,1)});a("the trash keeps the newest and drops past the cap",()=>{let e=[];for(let t=0;t<ce+5;t+=1)e=pt(e,{kind:"task",at:"",label:`t${t}`,data:{}});s(e.length,ce),s(e[0].label,`t${ce+4}`,"newest first"),o(!e.some(t=>t.label==="t0"),"the oldest fell off")});a("a board with no deletions writes no trash file",()=>{o(!("_trash.md"in g({tasks:[],projects:[],trash:[]})))});a("escapes pipes so a title cannot break the table",()=>{const e=X({title:"P"},[{id:"x",title:"a | b",project:[],people:[],subtasks:[],blockedBy:[],partOf:[]}]);o(e.includes("a \\| b"),"pipe must be escaped")});a("an empty project still produces a well-formed brief",()=>{const e=X({title:"Empty",goal:""},[]);o(e.includes("_no tasks yet_")),o(e.includes("_none recorded_"))});a("the task brief lists existing subtasks",()=>{const e=c.tasks.find(n=>n.id==="wireframes"),t=Oe(e);o(t.includes("id: wireframes")),o(t.includes("- [x] Landing page"))});p("ask context");const j={id:"website",title:"Website relaunch",goal:"Ship it",context:"Stripe is set up."},Q=()=>E(c.tasks,{projectId:"website"});a("nothing ticked sends nothing at all",()=>{s(T([],{project:j,tasks:Q()}),"")});a("a block only brings its own section",()=>{const e=T(["goal"],{project:j,tasks:Q()});o(e.includes("## Goal"),"the goal is there"),o(!e.includes("## Tasks"),"the table is not");const t=T(["tasks"],{project:j,tasks:Q()});o(t.includes("## Tasks"),"the table is there"),o(!t.includes("## Goal"),"the goal is not")});a("sections are assembled in catalogue order, whatever order they are asked for",()=>{const e=T(["people","tasks","goal"],{project:j,tasks:Q()});o(e.indexOf("## Goal")<e.indexOf("## Tasks"),"goal before tasks"),o(e.indexOf("## Tasks")<e.indexOf("## People"),"tasks before people")});a("the task table carries completed work too, since the model is judging the whole plan",()=>{const t=T(["tasks"],{project:j,tasks:[{id:"a",title:"Done thing",done:!0,project:["website"],people:[],subtasks:[],blockedBy:[],partOf:[]},{id:"b",title:"Open thing",project:["website"],people:[],subtasks:[],blockedBy:[],partOf:[]}]});o(t.includes("| a | Done thing |"),"the finished task is still listed"),o(t.includes("| b | Open thing |"),"and so is the open one")});a("detail carries the notes and subtask text the table only counts",()=>{const e=[{id:"a",title:"Wireframes",notes:"Figma file is shared.",project:["website"],people:[],subtasks:[{done:!0,text:"Landing page"},{done:!1,text:"Pricing page"}],blockedBy:[],partOf:[]}],t=T(["detail"],{project:j,tasks:e});o(t.includes("Figma file is shared."),"notes survive"),o(t.includes("- [x] Landing page"),"ticked subtask survives"),o(t.includes("- [ ] Pricing page"),"unticked subtask survives"),o(!T(["tasks"],{project:j,tasks:e}).includes("Figma file is shared."),"and the table alone never carried it")});a("the selected-task block is absent when nothing is selected",()=>{const e=Q();s(T(["task"],{project:j,tasks:e,task:null}),"");const t=e.find(n=>n.id==="wireframes");o(T(["task"],{project:j,tasks:e,task:t}).includes("id: wireframes"))});a("other projects are summarised, and the current one is not repeated",()=>{const t=T(["projects"],{project:j,projects:[{id:"website",title:"Website relaunch"},{id:"app",title:"Mobile app",goal:"Ship v1"},{id:"old",title:"Archived thing",archived:!0}],allTasks:c.tasks});o(t.includes("Mobile app"),"the other project is listed"),o(t.includes("Ship v1"),"with its goal"),o(!t.includes("Website relaunch"),"the current project is not repeated"),o(!t.includes("Archived thing"),"archived projects stay out")});a("a block with nothing to say costs no words and no heading",()=>{const e=Te({project:j,tasks:[],projects:[],allTasks:[]});s(e.detail,"","no notes anywhere means no detail section"),s(e.projects,"","no other projects means no heading"),s(e.task,"","no selection means no task section")});a("every catalogued block is one the assembler can actually build",()=>{const e=Te({project:j,tasks:Q(),projects:c.projects,allTasks:c.tasks});for(const t of ht)o(typeof e[t.id]=="string",`${t.id} has a section`)});a("word counting matches what the dialog promises",()=>{s(pe(""),0),s(pe(`   
  `),0),s(pe(`one two  three
four`),4)});p("ask prompt");a("the brief rides on the first question and is not repeated",()=>{const e=ut("BRIEF",[{role:"user",content:"Q1"},{role:"assistant",content:"A1"},{role:"user",content:"Q2"}]);s(e[0],{role:"system",content:De}),o(e[1].content.includes("BRIEF"),"the brief travels with the first turn"),o(e[1].content.includes("Q1"),"and so does the question"),s(e[3].content,"Q2","the follow-up is the question alone"),s(e.length,4)});a("the freeform prompt never asks for JSON",()=>{o(!/json/i.test(De),"this path wants prose, not a fenced block")});p("response streaming");const z=e=>{let t="";const n=mt(i=>{t+=i});for(const i of e)n.push(i);return n.end(),{text:t,finished:n.finished}},A=e=>`data: ${JSON.stringify({choices:[{delta:{content:e}}]})}
`;a("fragments are concatenated in order",()=>{s(z([A("Hello"),A(" world")]).text,"Hello world")});a("a frame split across chunks is held until the rest arrives",()=>{const e=A("Hello world"),t=Math.floor(e.length/2);s(z([e.slice(0,t),e.slice(t)]).text,"Hello world")});a("keep-alive comments and blank lines are ignored",()=>{s(z([`: OPENROUTER PROCESSING
`,`
`,A("hi")]).text,"hi")});a("[DONE] ends the stream",()=>{const{text:e,finished:t}=z([A("hi"),`data: [DONE]
`]);s(e,"hi"),o(t,"the reader knows it is over")});a("a frame the last chunk left unterminated is still read",()=>{s(z([A("hi").trimEnd()]).text,"hi")});a("an error arriving mid-stream is raised, not swallowed",()=>{Me(()=>z([`data: {"error":{"message":"rate limited"}}
`]))});a("an unreadable frame does not sink the answer",()=>{s(z([A("a"),`data: {not json
`,A("b")]).text,"ab")});p("LLM response parsing");a("reads a fenced JSON block",()=>{s(ie('Sure!\n```json\n{"a": 1}\n```\n'),{a:1})});a("reads bare JSON with chatter around it",()=>{s(ie('Here: {"a": 1} hope that helps'),{a:1})});a("reads an unfenced array",()=>{s(ie("[1, 2]"),[1,2])});a("throws with the raw text attached when there is no JSON",()=>{try{throw ie("no json here"),new Error("should have thrown")}catch(e){s(e.raw,"no json here")}});a("subtask suggestions are cleaned of list markers",()=>{const e=q.subtasks.parse('```json\n{"subtasks":["- [ ] Draft copy","* Review"]}\n```');s(e.map(t=>t.label),["Draft copy","Review"]),o(e.every(t=>t.kind==="subtask"))});a("subtask suggestions tolerate objects instead of strings",()=>{const e=q.subtasks.parse('{"subtasks":[{"text":"One"},{"title":"Two"}]}');s(e.map(t=>t.label),["One","Two"])});a("missing-task suggestions keep ids, dates and estimates",()=>{const e=q.missing.parse('{"tasks":[{"title":"QA","due":"2026-11-01","estimate":"2d","blocked_by":["copy"],"why":"untested"}]}');s(e[0].task,{title:"QA",due:"2026-11-01",estimate:"2d",blockedBy:["copy"]}),s(e[0].detail,"untested")});a("a malformed due date is dropped rather than trusted",()=>{const e=q.missing.parse('{"tasks":[{"title":"QA","due":"next tuesday"}]}');s(e[0].task.due,"")});a("a suggestion with no title is discarded",()=>{s(q.missing.parse('{"tasks":[{"why":"no title"},{"title":"Real"}]}').length,1)});a("estimates are normalised to a unit the model layer understands",()=>{s(q.estimate.parse('{"estimate":"3 D","why":"x"}')[0].estimate,"3d"),s(J(q.estimate.parse('{"estimate":"about 2w"}')[0].estimate),80)});a("an unusable estimate throws instead of writing nonsense",()=>{Me(()=>q.estimate.parse('{"estimate":"quite a while"}'))});p("zip");a("crc32 matches the reference value",()=>{const e=new TextEncoder().encode("The quick brown fox jumps over the lazy dog");s(Be(e),1095738169)});a("crc32 of the empty input is zero",()=>{s(Be(new Uint8Array(0)),0)});a("writes the PKZIP signatures and one central record per file",()=>{const e=be({"a.md":"alpha","b.md":"beta"}),t=new DataView(e.buffer,e.byteOffset,e.byteLength);s(t.getUint32(0,!0),67324752,"local file header");let n=0,i=0;for(let d=0;d+4<=e.length;d+=1){const u=t.getUint32(d,!0);u===67324752&&(n+=1),u===33639248&&(i+=1)}s(n,2),s(i,2),s(t.getUint32(e.length-22,!0),101010256,"end of central directory"),s(t.getUint16(e.length-22+10,!0),2,"entry count")});a("stores UTF-8 content at its byte length, not its character length",()=>{const e=be({"a.md":"café"}),t=new DataView(e.buffer,e.byteOffset,e.byteLength);s(t.getUint32(18,!0),5,"four characters, five bytes"),s(t.getUint16(6,!0),2048,"the UTF-8 flag is set")});a("an empty archive is still well formed",()=>{const e=be({});s(e.length,22)});p("same file");const l=`---
id: wireframes
title: Wireframes
project: [website]
done: false
---
Some notes.

- [ ] first
- [x] second
`;a("a file is the same as itself",()=>{o(w("wireframes.md",l,l))});a("key order, quoting, CRLF and checklist position do not change meaning",()=>{const e=`---\r
title: "Wireframes"\r
project:\r
  - website\r
id: wireframes\r
done: false\r
---\r
- [ ] first\r
Some notes.\r
- [x] second\r
`;o(e!==l,"the two should differ as bytes"),o(w("wireframes.md",l,e))});a("a real change is still a change",()=>{o(!w("wireframes.md",l,l.replace("done: false","done: true"))),o(!w("wireframes.md",l,l.replace("Some notes.","Other notes."))),o(!w("wireframes.md",l,l.replace("- [ ] first","- [x] first")))});a("projects and the trash canonicalise too",()=>{const e=`---
id: website
title: Website
starred: true
---
Context.
`;o(w("website/_project-website.md",e,`---
title: Website
starred: true
id: website
---

Context.

`)),o(!w("website/_project-website.md",e,e.replace("Context.","Different.")));const n=fe([{kind:"task",at:"now",label:"x",data:{}}]);o(w("_trash.md",n,n))});a("a note with no frontmatter is compared by what it says",()=>{o(w("stray.md",`Just prose.
`,"Just prose.")),o(!w("stray.md","Just prose.","Other prose."))});a("canonicalising the demo corpus is a fixed point",()=>{for(const[e,t]of Object.entries(H)){const n=me(e,t);s(me(e,n),n,e)}});function ge(e,t={},n=[],i=""){const d=new Map,u=new Map,f={name:e,kind:"directory",log:n,async queryPermission(){return"granted"},async requestPermission(){return"granted"},async*entries(){for(const[r,m]of[...d])yield[r,{kind:"file",name:r,async getFile(){return{async text(){return m}}}}];for(const[r,m]of[...u])yield[r,m]},async getDirectoryHandle(r,{create:m}={}){if(!u.has(r)){if(!m)throw new Error(`no such directory: ${r}`);u.set(r,ge(r,{},n,`${i}${r}/`))}return u.get(r)},async getFileHandle(r,{create:m}={}){if(!d.has(r)&&!m)throw new Error(`no such file: ${r}`);return{kind:"file",name:r,async getFile(){return{async text(){return d.get(r)??""}}},async createWritable(){let I="";return{async write(G){I+=G},async close(){d.set(r,I),n.push(`write ${i}${r}`)}}}}},async removeEntry(r){if(!d.delete(r))throw new Error(`no such file: ${r}`);n.push(`remove ${i}${r}`)},put(r,m){const I=r.indexOf("/");if(I===-1){d.set(r,m);return}const G=r.slice(0,I);u.has(G)||u.set(G,ge(G,{},n,`${i}${G}/`)),u.get(G).put(r.slice(I+1),m)},dump(){const r={};for(const[m,I]of d)r[`${i}${m}`]=I;for(const m of u.values())Object.assign(r,m.dump());return r}};for(const[r,m]of Object.entries(t))f.put(r,m);return f}async function P(e){const t=ge("vault",e),n=globalThis.showDirectoryPicker;globalThis.showDirectoryPicker=async()=>t;try{const i=We({sameFile:w}),d=await i.connectFolder();return t.log.length=0,{storage:i,directory:t,files:d}}finally{globalThis.showDirectoryPicker=n}}const Ne=`---
id: doomed
title: Doomed
done: false
---
`;function W(e,t){a(e,async()=>{const n=localStorage.getItem("tasks.files");try{await t()}finally{n===null?localStorage.removeItem("tasks.files"):localStorage.setItem("tasks.files",n)}})}p("storage gate");W("browser-only storage is always writable",()=>{o(We({sameFile:w}).state.writable)});W("a connected folder opens read-only",async()=>{const{storage:e}=await P({"wireframes.md":l});s(e.state.mode,"folder"),o(!e.state.writable,"a fresh folder must not be writable")});W("a read-only folder is not written to, and nothing is deleted",async()=>{const{storage:e,directory:t}=await P({"wireframes.md":l,"doomed.md":Ne}),n=t.dump(),i=localStorage.getItem("tasks.files"),d=await e.save({"wireframes.md":l.replace("Wireframes","Changed")});s(d,{skipped:"read-only"}),s(t.log,[],"a locked folder must see no writes and no removals"),s(t.dump(),n),s(localStorage.getItem("tasks.files"),i,"the mirror must not move either")});W("unlocking re-reads the folder",async()=>{const{storage:e,directory:t}=await P({"wireframes.md":l});t.put("wireframes.md",l.replace("Some notes.","Notes from my phone.")),t.put("later.md",`---
id: later
title: Later
done: false
---
`);const n=await e.unlock();o(e.state.writable,"unlock must open the gate"),o(n["wireframes.md"].includes("Notes from my phone."),"the external edit must be seen"),o("later.md"in n,"the external addition must be seen"),s(t.log,[],"unlocking must not write anything")});W("writes resume once unlocked",async()=>{const{storage:e,directory:t}=await P({"wireframes.md":l});await e.unlock();const n=l.replace("Some notes.","Edited here.");await e.save({"wireframes.md":n}),s(t.log,["write wireframes.md"]),s(t.dump()["wireframes.md"],n)});W("a file that differs only in formatting is left alone",async()=>{const e=`---
title: Wireframes
id: wireframes
project: [website]
done: false
---
Some notes.

- [ ] first
- [x] second
`,{storage:t,directory:n}=await P({"wireframes.md":e});await t.unlock(),await t.save({"wireframes.md":me("wireframes.md",e)}),s(n.log,[],"reformatting alone is not a change worth writing"),s(n.dump()["wireframes.md"],e,"the file keeps its own shape")});W("a genuinely new file is still created",async()=>{const{storage:e,directory:t}=await P({"wireframes.md":l});await e.unlock();const n=`---
id: new-task
title: New task
done: false
---
`;await e.save({"wireframes.md":l,"new-task.md":n}),s(t.log,["write new-task.md"]),s(t.dump()["new-task.md"],n)});W("deletions happen once unlocked, and not before",async()=>{const{storage:e,directory:t}=await P({"wireframes.md":l,"doomed.md":Ne});await e.save({"wireframes.md":l}),o("doomed.md"in t.dump(),"a locked folder keeps its files"),await e.unlock(),await e.save({"wireframes.md":l}),s(t.log,["remove doomed.md"]),o(!("doomed.md"in t.dump()))});W("locking again withdraws the right to write",async()=>{const{storage:e,directory:t}=await P({"wireframes.md":l});await e.unlock(),e.lock(),o(!e.state.writable),await e.save({"wireframes.md":l.replace("Wireframes","Changed")}),s(t.log,[])});W("project subfolders round-trip through the gate",async()=>{const{storage:e,directory:t}=await P({"website/_project-website.md":`---
id: website
title: Website
---
`,"website/wireframes.md":l});o(!e.state.writable);const n=await e.unlock();o("website/_project-website.md"in n),o("website/wireframes.md"in n),await e.save({...n,"website/wireframes.md":l.replace("Some notes.","Edited.")}),s(t.log,["write website/wireframes.md"])});const je=document.getElementById("out");let ve=0,he=0;async function kt(){for(const{name:t,tests:n}of Ee){const i=document.createElement("h2");i.textContent=t,je.append(i);for(const{name:d,fn:u}of n){const f=document.createElement("div");try{await u(),f.className="pass",f.textContent=`✓ ${d}`,ve+=1}catch(r){f.className="fail",f.textContent=`✗ ${d} — ${r.message}`,he+=1}je.append(f)}}const e=document.getElementById("summary");e.textContent=`${ve} passed, ${he} failed`,e.className=he?"fail":"pass"}kt();
