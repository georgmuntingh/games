import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{_ as ke,a as be,b as he,c as ge,d as me,e as we,f as fe,g as ye,h as ve,j as je,k as _e,l as xe,m as Oe,n as Be,o as Se,p as Te,q as De,r as We,s as Le,t as Me,y as g,N as qe,w as c,W as R,X as Ee,Y as b,Z as _,$ as A,a0 as Z,a1 as se,a2 as Ce,u as h,a3 as F,D as J,E as U,a4 as W,S as Ge,T as C,U as v,M as y,L as ae,O as m,z as S,v as Ne,B as $e,A as Ie,Q as D,R as x,G as ee,i as k,K as q,I as L,a5 as oe,F as O,x as T,a6 as ne,V as G,a7 as K,a8 as ie,a9 as H,C as Ae,aa as P,ab as re,H as V,J as de}from"../../prompts-BI8pcCFE.js";const le=[];let Q=null;function p(e){Q={name:e,tests:[]},le.push(Q)}function a(e,s){Q.tests.push({name:e,fn:s})}function o(e,s){if(!e)throw new Error(s||"assertion failed")}function t(e,s,n){const i=JSON.stringify(e),l=JSON.stringify(s);if(i!==l)throw new Error(`${n?`${n}: `:""}expected ${l}, got ${i}`)}function Fe(e,s){try{e()}catch{return}throw new Error("expected a throw")}const N=Object.fromEntries(Object.entries(Object.assign({"../demo/_project-q4-hiring.md":Me,"../demo/_project-website.md":Le,"../demo/analytics-dashboard.md":We,"../demo/billing-integration.md":De,"../demo/component-library.md":Te,"../demo/copywriting.md":Se,"../demo/design-review.md":Be,"../demo/discovery-interviews.md":Oe,"../demo/docs-site.md":xe,"../demo/information-architecture.md":_e,"../demo/interview-loop.md":je,"../demo/job-descriptions.md":ve,"../demo/launch.md":ye,"../demo/offers-out.md":fe,"../demo/qa-pass.md":we,"../demo/self-serve-signup.md":me,"../demo/signup-flow.md":ge,"../demo/sourcing.md":he,"../demo/visual-design.md":be,"../demo/wireframes.md":ke})).map(([e,s])=>[e.split("/").pop(),s]));p("frontmatter");a("parses scalars, booleans and flow lists",()=>{const{data:e}=R(`---
a: hello
b: true
c: [x, y]
d: 2026-09-14
---
body
`);t(e,{a:"hello",b:!0,c:["x","y"],d:"2026-09-14"})});a("parses block lists",()=>{const{data:e}=R(`---
people:
  - georg
  - ada
---
`);t(e.people,["georg","ada"])});a("keeps the body verbatim",()=>{const{body:e}=R(`---
a: 1
---
line one

line two
`);t(e,`line one

line two
`)});a("a file without frontmatter is all body",()=>{const{data:e,body:s}=R(`just text
`);t(e,{}),t(s,`just text
`)});a("quotes values that would otherwise change meaning",()=>{const e=Ee({color:"#2563eb",title:"a: b",flag:"true"});o(e.includes("color: '#2563eb'"),"hash must be quoted"),o(e.includes("title: 'a: b'"),"colon must be quoted"),o(e.includes("flag: 'true'"),'a string "true" must not become a boolean')});a("unknown keys survive a round trip",()=>{const s=b("x.md",`---
id: x
title: X
done: false
cssclass: kanban
---
`);t(s.extra,{cssclass:"kanban"}),o(_(s).includes("cssclass: kanban"),"extra key must be written back")});a("a project file separates its one-line goal from its free-form context",()=>{const e=A("_project-website.md",`---
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
`;t(Z(A("_project-x.md",e)),e)});a("a project file written before the split keeps its body as context, not as a goal",()=>{const e=A("_project-x.md",`---
id: x
title: X
---
Old body prose.
`);t(e.goal,"","nothing is guessed into the goal"),t(e.context,"Old body prose.")});a("a goal containing a colon survives serialisation",()=>{const s=A("_project-x.md",Z({id:"x",title:"X",goal:"Ship it: end to end, no humans",people:[],context:""}));t(s.goal,"Ship it: end to end, no humans")});a("empty project fields are omitted rather than written blank",()=>{const e=Z({id:"x",title:"X",goal:"",people:[],context:""});o(!e.includes("goal:"),"an empty goal must not be written"),o(!e.includes("people:"),"an empty roster must not be written"),t(e,`---
id: x
title: X
---
`)});a("a project id falls back to the filename",()=>{t(A("_project-q4-hiring.md",`---
title: Q4
---
`).id,"q4-hiring")});a("splits and rebuilds a checklist",()=>{const{notes:e,subtasks:s}=se(`Notes.

- [x] one
- [ ] two
`);t(e,"Notes."),t(s,[{done:!0,text:"one"},{done:!1,text:"two"}]),t(Ce(e,s),`Notes.

- [x] one
- [ ] two`)});a("accepts * bullets and upper-case X",()=>{const{subtasks:e}=se(`* [X] done thing
`);t(e,[{done:!0,text:"done thing"}])});a("every demo file is a fixed point of parse -> serialise",()=>{const e=h(c(N)),s=Object.keys(N);o(s.length>=18,`expected the full corpus, got ${s.length}`);for(const n of s)t(e[n],N[n],`${n} did not round-trip`)});a("empty optional keys are omitted rather than written blank",()=>{const e=_(b("x.md",`---
id: x
title: X
done: false
---
`));o(!e.includes("due:"),"an absent due date must not be written"),o(!e.includes("people:"),"an empty people list must not be written"),o(e.includes("done: false"),"done is always written")});p("ids");a("slugifies titles",()=>{t(F("Design Review!"),"design-review"),t(F("  Ship  it  "),"ship-it")});a("transliterates letters with no NFKD decomposition",()=>{t(F("Réunion Ærø søk"),"reunion-aero-sok")});a("never produces an empty slug",()=>{t(F("!!!"),"task")});a("suffixes on collision",()=>{t(J("Design review",["design-review"]),"design-review-2"),t(J("Design review",["design-review","design-review-2"]),"design-review-3"),t(J("Design review",[]),"design-review")});p("dates and estimates");a("parses and formats ISO dates in UTC",()=>{t(U(g("2026-09-14")),"2026-09-14"),t(g(""),null),t(g("not a date"),null)});a("parses durations into hours",()=>{t(W("2h"),2),t(W("3d"),24),t(W("1w"),40),t(W("1.5d"),12)});a("free-form estimates are kept but not counted",()=>{t(W("a while"),null),t(Ge([{estimate:"1d"},{estimate:"ages"},{estimate:"2h"}]),10)});p("timeline");const r=g("2026-08-01");a("bucket size follows the project span",()=>{t(C(r,g("2026-08-20")).unit,"day"),t(C(r,g("2026-11-30")).unit,"week"),t(C(r,g("2028-08-01")).unit,"month"),t(C(null,null).unit,"week","falls back to weeks")});a("levels are fractional so the now-line can sit between them",()=>{const e=v("week");t(e.level(g("2026-08-08"),r),1),o(Math.abs(e.level(g("2026-08-05"),r)-4/7)<1e-9)});a("month levels follow the calendar, not a fixed width",()=>{const e=v("month");t(Math.floor(e.level(g("2026-09-01"),r)),1),t(Math.floor(e.level(g("2027-01-31"),r)),5)});a("undated tasks land in a tray below the last dated level",()=>{const e=v("week"),s=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-09-05"},{id:"c",due:""}],{levels:n,trayLevel:i}=y(s,{bucket:e,start:r});t(n.get("a"),0),t(n.get("b"),5),t(n.get("c"),i),o(i>5,"the tray sits below every dated task")});a("levels are shifted so the earliest task is level 0",()=>{const e=v("week"),{levels:s}=y([{id:"a",due:"2026-07-01"}],{bucket:e,start:r});t(s.get("a"),0,"a task before the project start still lands at 0")});a("the window widens to cover tasks outside the declared dates",()=>{const e=ae({start:"2026-08-01",end:"2026-08-31"},[{due:"2026-12-25"}]);t(U(e.end),"2026-12-25")});p("derived status");const j=[{id:"a",done:!0,subtasks:[],blockedBy:[],due:"2026-01-01"},{id:"b",done:!1,subtasks:[{done:!0,text:"1"},{done:!1,text:"2"}],blockedBy:["a"],due:"2030-01-01"},{id:"c",done:!1,subtasks:[],blockedBy:["b"],due:"2020-01-01"}],w=qe(j),f=Date.UTC(2026,0,15);a("progress comes from the checklist",()=>{t(m(j[1],w,f).ratio,.5),t(m(j[1],w,f).checked,1)});a("a completed task reads as fully done regardless of its checklist",()=>{const e=m({...j[1],done:!0},w,f);t(e.ratio,1),o(e.done)});a("blocked means an incomplete prerequisite",()=>{o(!m(j[1],w,f).blocked,"a is done, so b is free"),o(m(j[2],w,f).blocked,"b is open, so c is blocked")});a("overdue means past its deadline and not done",()=>{o(m(j[2],w,f).overdue),o(!m(j[0],w,f).overdue,"done work is never overdue"),o(!m(j[1],w,f).overdue)});a("a task with no deadline is never overdue",()=>{o(!m({due:"",subtasks:[],blockedBy:[]},w,f).overdue)});a("a reference to a task that does not exist does not block",()=>{o(!m({done:!1,subtasks:[],blockedBy:["ghost"],due:""},w,f).blocked)});p("filters");const d=c(N);a("the demo board loads two projects and every task",()=>{t(d.projects.length,2),t(d.tasks.length,Object.keys(N).length-2)});a("filtering by project keeps tasks tagged with it",()=>{const e=S(d.tasks,{projectId:"website"});o(e.length>10,"the website project is the busy one"),o(e.every(s=>s.project.includes("website"))),o(e.some(s=>s.id==="job-descriptions"),"a task in two projects shows in both"),o(S(d.tasks,{projectId:"q4-hiring"}).some(s=>s.id==="job-descriptions"))});a("filtering by person is a union, not an intersection",()=>{const e=S(d.tasks,{people:["ada","sam"]}),s=S(d.tasks,{people:["ada"]});o(e.length>=s.length,"adding a person can only widen the set"),o(e.every(n=>n.people.includes("ada")||n.people.includes("sam")))});a("hideDone drops completed work",()=>{o(S(d.tasks,{hideDone:!0}).every(e=>!e.done))});a("an empty filter is the identity",()=>{t(S(d.tasks,{}).length,d.tasks.length)});a("projectPeople marks roster members, task-only names and their open counts",()=>{const n=Ne({id:"p",people:["georg","kim"]},[{id:"a",project:["p"],people:["georg"],done:!1},{id:"b",project:["p"],people:["georg"],done:!0},{id:"c",project:["p"],people:["ada"],done:!1},{id:"d",project:["other"],people:["zoe"],done:!1}]);t(n.map(i=>i.name),["georg","kim","ada"],"roster first, then adopted"),t(n.find(i=>i.name==="georg"),{name:"georg",inRoster:!0,openTasks:1}),t(n.find(i=>i.name==="kim"),{name:"kim",inRoster:!0,openTasks:0}),t(n.find(i=>i.name==="ada"),{name:"ada",inRoster:!1,openTasks:1}),o(!n.some(i=>i.name==="zoe"),"people on other projects are not listed")});a("people and project tags are deduplicated and sorted",()=>{t($e(d.tasks),["Georg","Oliver","Sverre"]),t(Ie(d.tasks),["q4-hiring","website"])});p("edges");a("blocks runs prerequisite -> dependent, part-of runs child -> parent",()=>{const s=D([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:[],partOf:["a"]}],new Map([["a",0],["b",1],["c",1]])),n=s.find(l=>l.kind==="blocks"),i=s.find(l=>l.kind==="part-of");t([n.from,n.to],["a","b"]),t([i.from,i.to],["c","a"])});a("edges to tasks outside the filtered set are dropped",()=>{const e=D([{id:"b",blockedBy:["a"],partOf:[]}],new Map([["b",1]]));t(e,[])});a("a prerequisite due after its dependent is flagged as a conflict",()=>{const e=[{id:"a",due:"2026-09-05",blockedBy:[],partOf:[]},{id:"b",due:"2026-08-15",blockedBy:["a"],partOf:[]}];o(D(e,new Map([["a",5],["b",2]]))[0].conflict,"blocker below dependent"),o(!D(e,new Map([["a",2],["b",5]]))[0].conflict,"normal order")});a("the demo project has no scheduling conflicts",()=>{const e=S(d.tasks,{projectId:"website"}),s=ae(d.projects.find(i=>i.id==="website"),e),{levels:n}=y(e,{bucket:C(s.start,s.end),start:s.start});t(D(e,n).filter(i=>i.conflict),[])});p("relations");const $=()=>[{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]},{id:"c",blockedBy:["b"],partOf:[]},{id:"loner",blockedBy:[],partOf:[]}];a("a task can never wait on itself",()=>{o(x($(),"a","blockedBy").has("a"),"a is forbidden to itself")});a("anything downstream would close a loop",()=>{const e=x($(),"a","blockedBy");o(e.has("b"),"direct dependent"),o(e.has("c"),"dependent two steps out")});a("an unrelated task is always available",()=>{o(!x($(),"a","blockedBy").has("loner"),"loner is fine"),o(!x($(),"c","blockedBy").has("a"),"c already waits on a upstream")});a("upstream tasks stay available, so the chain can be tightened",()=>{o(!x($(),"c","blockedBy").has("b"),"b is already a blocker of c")});a("part-of loops are refused the same way",()=>{const s=x([{id:"parent",blockedBy:[],partOf:[]},{id:"child",blockedBy:[],partOf:["parent"]},{id:"grandchild",blockedBy:[],partOf:["child"]}],"parent","partOf");t([...s].sort(),["child","grandchild","parent"])});a("the two relations are judged independently",()=>{o(!x([{id:"a",blockedBy:[],partOf:[]},{id:"b",blockedBy:["a"],partOf:[]}],"a","partOf").has("b"),"blocking does not constrain part-of")});a("a missing reference cannot make a loop",()=>{t([...x([{id:"a",blockedBy:["ghost"],partOf:[]}],"a","blockedBy")],["a"])});a("the demo board has no task that could be added to its own blockers",()=>{for(const e of d.tasks)o(x(d.tasks,e.id,"blockedBy").has(e.id),`${e.id} excludes itself`)});p("project folders");const B={"relaunch-2026/_project-website.md":`---
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
`},I=(e,s)=>Object.keys(e).find(n=>n===`${s}.md`||n.endsWith(`/${s}.md`));a("a project remembers the folder it was found in",()=>{const{projects:e}=c(B);t(e.find(s=>s.id==="website").folder,"relaunch-2026"),t(e.find(s=>s.id==="kitchen").folder,"kitchen")});a("a task follows its project, not a folder named after it",()=>{const e=h(c(B));t(I(e,"wireframes"),"relaunch-2026/wireframes.md"),t(I(e,"worktop"),"kitchen/worktop.md")});a("a project file lives in its own folder",()=>{o("relaunch-2026/_project-website.md"in h(c(B)),"the project file stays beside its tasks")});a("an untagged task sits at the parent root",()=>{t(I(h(c(B)),"odd-job"),"odd-job.md")});a("the first tag decides where a task lives",()=>{const e=c({...B,"both.md":`---
id: both
title: Both
project: [kitchen, website]
---
`});t(I(h(e),"both"),"kitchen/both.md"),t(e.tasks.find(s=>s.id==="both").project,["kitchen","website"])});a("a tag naming no project we have lands at the root",()=>{const e=c({...B,"stray.md":`---
id: stray
title: Stray
project: gardening
---
`});t(I(h(e),"stray"),"stray.md")});a("the trash belongs to the parent, not to any one project",()=>{const e={...c(B),trash:[{kind:"task",data:{id:"gone"}}]};o("_trash.md"in h(e),"the trash is at the root")});a("a nested board round trips to a fixed point",()=>{const e=h(c(B));t(h(c(e)),e)});const ce={"_project-website.md":`---
id: website
title: Website
---
`,"wireframes.md":`---
id: wireframes
title: Wireframes
project: website
---
`};a("a flat board stays flat",()=>{t(Object.keys(h(c(ce))).sort(),["_project-website.md","wireframes.md"])});a("giving a flat project a folder moves its files into it",()=>{const e=c(ce),s={...e,projects:e.projects.map(n=>({...n,folder:n.id}))};t(Object.keys(h(s)).sort(),["website/_project-website.md","website/wireframes.md"])});a("two folders claiming one id: the first is used",()=>{const{projects:e}=c({"a/_project-website.md":`---
id: website
title: First
---
`,"b/_project-website.md":`---
id: website
title: Second
---
`});t(e.length,1),t(e[0].folder,"a")});a("a clash is reported so the app can say so",()=>{t(ee({"a/_project-website.md":"","b/_project-website.md":"","kitchen/_project-kitchen.md":""}),["website"]),t(ee(B),[])});p("initials");a("one word gives one letter, two give two",()=>{t(k("Georg"),"G"),t(k("Georg Muntingh"),"GM")});a("only the first two words count",()=>{t(k("Ada Byron King Lovelace"),"AB")});a("separators other than spaces still split",()=>{t(k("ada-lovelace"),"AL"),t(k("ada.lovelace"),"AL"),t(k("ada_lovelace"),"AL")});a("punctuation and stray whitespace are ignored",()=>{t(k("  georg   "),"G"),t(k("O'Brien"),"O")});a("a name with no letters still yields something drawable",()=>{t(k(""),"?"),t(k("   "),"?"),t(k(null),"?")});a("initials come back upper case whatever the name looks like",()=>{t(k("georg muntingh"),"GM")});p("working");const z=()=>[{id:"a",working:!1},{id:"b",working:!0},{id:"c",working:!1}],X=e=>e.filter(s=>s.working).map(s=>s.id);a("setting one releases whatever held it",()=>{t(X(q(z(),"c")),["c"])});a("null releases without setting another",()=>{t(X(q(z(),null)),[])});a("an id that is not on the board leaves nothing marked",()=>{t(X(q(z(),"ghost")),[])});a("there is never more than one, whatever the input claimed",()=>{t(X(q([{id:"a",working:!0},{id:"b",working:!0}],"b")),["b"])});a("tasks that do not change are returned by identity",()=>{const e=z(),s=q(e,"b");o(s[0]===e[0],"untouched task is the same object"),o(s[1]===e[1],"the one already set is untouched too")});a("nothing else about a task is disturbed",()=>{t(q([{id:"a",title:"Wireframes",people:["Georg"],working:!1}],"a"),[{id:"a",title:"Wireframes",people:["Georg"],working:!0}])});p("placement and flags");a("a stored x comes back as a number, not the string yaml gives",()=>{const e=b("w.md",["---","id: w","title: W","x: 412","---",""].join(`
`));t(e.x,412),o(typeof e.x=="number","x is a number")});a("an unparseable or missing x is null rather than NaN",()=>{const e=b("w.md",["---","id: w","x: over there","---",""].join(`
`));t(e.x,null),t(b("w.md",["---","id: w","---",""].join(`
`)).x,null)});a("x survives a round trip, including x: 0",()=>{const e=b("w.md",["---","id: w","title: W","x: 0","---",""].join(`
`));t(e.x,0),o(/^x: 0$/m.test(_(e)),"x: 0 is written, not dropped as empty")});a("no x means no x line",()=>{const e=_(b("w.md",["---","id: w","---",""].join(`
`)));o(!/^x:/m.test(e),"nothing to say about placement, so nothing written")});a("working is written only when it is set",()=>{const e=b("w.md",["---","id: w","working: true","---",""].join(`
`));t(e.working,!0),o(/^working: true$/m.test(_(e)),"set, so written"),o(!/working/.test(_({...e,working:!1})),"released, so absent")});a("the two new keys round trip to a fixed point",()=>{const e=_(b("w.md",["---","id: w","title: W","due: 2026-08-15","working: true","x: 412","---","","Body",""].join(`
`)));t(_(b("w.md",e)),e)});a("placement and flags do not leak into extra",()=>{const e=b("w.md",["---","id: w","x: 5","working: true","---",""].join(`
`));t(e.extra,{})});p("LLM brief");a("includes the goal, a task table and the dependency list",()=>{const e=d.projects.find(i=>i.id==="website"),s=S(d.tasks,{projectId:"website"}),n=L(e,s,{now:Date.UTC(2026,7,16)});o(n.includes("# Website relaunch"),"title"),o(n.includes("## Goal"),"goal section"),o(n.includes("## Context"),"context section"),o(n.includes("| id | task | due | estimate | people | subtasks |"),"table header"),o(n.includes("| wireframes | Wireframes |"),"a task row keyed by its id"),o(n.includes("- wireframes blocked-by information-architecture"),"dependency"),o(n.includes("- signup-flow part-of self-serve-signup"),"part-of dependency")});a("a task brief carries its existing subtasks and their state",()=>{const e=oe({title:"Design review",subtasks:[{done:!0,text:"book the room"},{done:!1,text:"collect feedback"}]});o(e.includes("Existing subtasks:"),"the section is present"),o(e.includes("- [x] book the room"),"ticked state survives"),o(e.includes("- [ ] collect feedback"),"unticked state survives"),o(O.subtasks.messages({title:"P"},[],{title:"Design review",subtasks:[{done:!1,text:"collect feedback"}]}).some(s=>s.content.includes("collect feedback")),"and it reaches the prompt the model actually sees")});a("goal and context are separate labelled sections",()=>{const e=L({title:"P",goal:"Ship it",context:`Stripe is set up.

## Open questions
- SOC2?`},[]);o(e.includes(`## Goal
Ship it`),"goal section"),o(e.includes(`## Context
Stripe is set up.`),"context section"),o(e.indexOf("## Goal")<e.indexOf("## Context"),"goal comes first"),o(e.includes("- SOC2?"),"context goes verbatim, headings and all")});a("each section is dropped cleanly when empty",()=>{const e=L({title:"P",goal:"Ship it",context:""},[]);o(e.includes("## Goal"),"goal kept"),o(!e.includes("## Context"),"no empty context heading");const s=L({title:"P",goal:"",context:"Background."},[]);o(!s.includes("## Goal"),"no empty goal heading"),o(s.includes("## Context"),"context kept")});const M=(e={})=>({id:"w",title:"W",goal:"Ship it",end:"2026-11-30",...e});a("a goal node is created for every project that has a goal",()=>{const{tasks:e}=T({tasks:[],projects:[M()]});t(e.length,1),t(e[0].id,de("w")),t(e[0].title,"Ship it"),t(e[0].due,"2026-11-30","the goal sits at the project deadline"),o(e[0].goal,"and is marked as the goal node")});a("a goal node follows its project title and deadline",()=>{const e=T({tasks:[],projects:[M()]}).tasks,{tasks:s}=T({tasks:e,projects:[M({goal:"Ship it sooner",end:"2026-10-01"})]});t(s.length,1,"no second node is created"),t(s[0].title,"Ship it sooner"),t(s[0].due,"2026-10-01")});a("clearing the goal hands its node back for deletion",()=>{const e=T({tasks:[],projects:[M()]}).tasks,{tasks:s,removed:n}=T({tasks:e,projects:[M({goal:""})]});t(s.length,0),t(n.map(i=>i.id),[de("w")])});a("deleting a project hands its goal node back too",()=>{const e=T({tasks:[],projects:[{id:"website",title:"Website",goal:"Ship it",end:"2026-09-01"}]});t(e.tasks.map(n=>n.id),["website-goal"]);const s=T({tasks:e.tasks,projects:[]});t(s.tasks,[]),t(s.removed.map(n=>n.id),["website-goal"])});a("a goal node survives a round-trip through markdown",()=>{const{tasks:e}=T({tasks:[],projects:[M()]}),s=_(e[0]);o(s.includes("goal: true"),"the marker is written"),o(b("w-goal.md",s).goal,"and read back")});a("only tasks nothing depends on feed the goal",()=>{const s=ne([{id:"w-goal",goal:!0,project:["w"]},{id:"a",project:["w"],blockedBy:[]},{id:"b",project:["w"],blockedBy:["a"]},{id:"c",project:["w"],partOf:["b"]}]);t(s,[{from:"b",to:"w-goal"}],"a is depended on, c is part of b")});a("the goal node never links to itself",()=>{t(ne([{id:"w-goal",goal:!0,project:["w"]}]),[])});a("an undated task is not a scheduling conflict",()=>{const e=v("week"),s=[{id:"g",goal:!0,project:["w"],due:"2026-09-01"},{id:"undated",project:["w"],due:""},{id:"late",project:["w"],due:"2026-10-01"}],{levels:n}=y(s,{bucket:e,start:r}),i=D(s,n),l=u=>i.find(E=>E.from===u);o(!l("undated").conflict,"the tray is a position, not a date after the goal"),o(l("late").conflict,"but a real deadline past the goal still is")});a("buildEdges emits goal links alongside stored ones",()=>{const s=D([{id:"w-goal",goal:!0,project:["w"]},{id:"a",project:["w"]}],new Map).map(n=>n.kind);o(s.includes("goal"),"a goal edge is present")});a("merging folds a task into another as checklist items",()=>{const e=[{id:"src",title:"Wireframes",done:!1,subtasks:[{done:!0,text:"lo-fi"}]},{id:"tgt",title:"Design",subtasks:[{done:!1,text:"existing"}]}],{tasks:s,merged:n}=G(e,"src","tgt");t(s.map(i=>i.id),["tgt"],"the source is gone"),t(s[0].subtasks,[{done:!1,text:"existing"},{done:!1,text:"Wireframes"},{done:!0,text:"lo-fi"}],"title first, then its own subtasks, after what was already there"),t(n.id,"src","the merged task is handed back for the trash")});a("merging rewires dependents to the target and drops self-links",()=>{const e=[{id:"src",title:"S",subtasks:[]},{id:"tgt",title:"T",subtasks:[],blockedBy:["src"]},{id:"dep",title:"D",blockedBy:["src"]}],{tasks:s}=G(e,"src","tgt");t(s.find(n=>n.id==="dep").blockedBy,["tgt"]),t(s.find(n=>n.id==="tgt").blockedBy,[],"a task cannot block itself")});a("merging refuses a goal node or a task with itself",()=>{const e=[{id:"a",title:"A",subtasks:[]},{id:"g",title:"G",goal:!0,subtasks:[]}];t(G(e,"a","a"),null),t(G(e,"g","a"),null),t(G(e,"a","g"),null)});a("collapsing empty periods leaves consecutive rows and records the gaps",()=>{const e=v("week"),s=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-08"},{id:"c",due:"2026-09-26"}],n=y(s,{bucket:e,start:r});t([...n.levels.values()],[0,1,8],"ordinarily a level is elapsed time");const i=y(s,{bucket:e,start:r,collapse:!0});t([...i.levels.values()],[0,1,2],"occupied periods become adjacent"),t(i.gaps,[{afterLevel:1,periods:6}],"six empty weeks are recorded")});a("a row still labels its real date, collapsed or not",()=>{const e=v("week"),s=[{id:"a",due:"2026-08-22"},{id:"c",due:"2026-09-26"}],n=(i,l)=>{const{levelOrigin:u,minLevel:E}=y(s,{bucket:e,start:r,...i});return U(e.dateForLevel(u.get(l)+E,r))};t(n({collapse:!0},0),"2026-08-22"),t(n({collapse:!0},1),"2026-09-26","row 1 points at the week it came from"),t(n({},0),"2026-08-22","and the uncollapsed scale agrees"),t(n({},5),"2026-09-26")});a("uncollapsed, every row in range is a real period",()=>{const e=v("week"),s=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-22"}],{levelOrigin:n}=y(s,{bucket:e,start:r});t([...n.keys()],[0,1,2,3],"the empty weeks between are still rows"),t(U(e.dateForLevel(n.get(2),r)),"2026-08-15","and each maps to its own date")});a("collapsed, only occupied rows exist",()=>{const e=v("week"),s=[{id:"a",due:"2026-08-01"},{id:"b",due:"2026-08-22"}],{levelOrigin:n}=y(s,{bucket:e,start:r,collapse:!0});t([...n.keys()],[0,1],"the empty weeks are gone entirely")});a("collapsing keeps undated work in its own tray below the last row",()=>{const e=v("week"),s=[{id:"a",due:"2026-08-01"},{id:"u",due:""}],{levels:n,trayLevel:i}=y(s,{bucket:e,start:r,collapse:!0});t(n.get("u"),i),o(i>n.get("a"),"the tray sits below the dated rows")});a("the trash round-trips through its own file",()=>{const e=[{kind:"task",at:"2026-08-16T00:00:00.000Z",label:"A",data:{id:"a",subtasks:[]}}];t(K(ie(e)),e)});a("an empty or unreadable trash file yields no records",()=>{t(K(`---
id: _trash
---
`),[]),t(K("---\nid: _trash\n---\n```json\nnot json\n```\n"),[])});a("the trash file is not mistaken for a task",()=>{const e=c({"_trash.md":ie([{kind:"task",at:"",label:"A",data:{}}])});t(e.tasks,[],"it is board state, not work"),t(e.trash.length,1)});a("the trash keeps the newest and drops past the cap",()=>{let e=[];for(let s=0;s<H+5;s+=1)e=Ae(e,{kind:"task",at:"",label:`t${s}`,data:{}});t(e.length,H),t(e[0].label,`t${H+4}`,"newest first"),o(!e.some(s=>s.label==="t0"),"the oldest fell off")});a("a board with no deletions writes no trash file",()=>{o(!("_trash.md"in h({tasks:[],projects:[],trash:[]})))});a("escapes pipes so a title cannot break the table",()=>{const e=L({title:"P"},[{id:"x",title:"a | b",project:[],people:[],subtasks:[],blockedBy:[],partOf:[]}]);o(e.includes("a \\| b"),"pipe must be escaped")});a("an empty project still produces a well-formed brief",()=>{const e=L({title:"Empty",goal:""},[]);o(e.includes("_no tasks yet_")),o(e.includes("_none recorded_"))});a("the task brief lists existing subtasks",()=>{const e=d.tasks.find(n=>n.id==="wireframes"),s=oe(e);o(s.includes("id: wireframes")),o(s.includes("- [x] Landing page"))});p("LLM response parsing");a("reads a fenced JSON block",()=>{t(P('Sure!\n```json\n{"a": 1}\n```\n'),{a:1})});a("reads bare JSON with chatter around it",()=>{t(P('Here: {"a": 1} hope that helps'),{a:1})});a("reads an unfenced array",()=>{t(P("[1, 2]"),[1,2])});a("throws with the raw text attached when there is no JSON",()=>{try{throw P("no json here"),new Error("should have thrown")}catch(e){t(e.raw,"no json here")}});a("subtask suggestions are cleaned of list markers",()=>{const e=O.subtasks.parse('```json\n{"subtasks":["- [ ] Draft copy","* Review"]}\n```');t(e.map(s=>s.label),["Draft copy","Review"]),o(e.every(s=>s.kind==="subtask"))});a("subtask suggestions tolerate objects instead of strings",()=>{const e=O.subtasks.parse('{"subtasks":[{"text":"One"},{"title":"Two"}]}');t(e.map(s=>s.label),["One","Two"])});a("missing-task suggestions keep ids, dates and estimates",()=>{const e=O.missing.parse('{"tasks":[{"title":"QA","due":"2026-11-01","estimate":"2d","blocked_by":["copy"],"why":"untested"}]}');t(e[0].task,{title:"QA",due:"2026-11-01",estimate:"2d",blockedBy:["copy"]}),t(e[0].detail,"untested")});a("a malformed due date is dropped rather than trusted",()=>{const e=O.missing.parse('{"tasks":[{"title":"QA","due":"next tuesday"}]}');t(e[0].task.due,"")});a("a suggestion with no title is discarded",()=>{t(O.missing.parse('{"tasks":[{"why":"no title"},{"title":"Real"}]}').length,1)});a("estimates are normalised to a unit the model layer understands",()=>{t(O.estimate.parse('{"estimate":"3 D","why":"x"}')[0].estimate,"3d"),t(W(O.estimate.parse('{"estimate":"about 2w"}')[0].estimate),80)});a("an unusable estimate throws instead of writing nonsense",()=>{Fe(()=>O.estimate.parse('{"estimate":"quite a while"}'))});p("zip");a("crc32 matches the reference value",()=>{const e=new TextEncoder().encode("The quick brown fox jumps over the lazy dog");t(re(e),1095738169)});a("crc32 of the empty input is zero",()=>{t(re(new Uint8Array(0)),0)});a("writes the PKZIP signatures and one central record per file",()=>{const e=V({"a.md":"alpha","b.md":"beta"}),s=new DataView(e.buffer,e.byteOffset,e.byteLength);t(s.getUint32(0,!0),67324752,"local file header");let n=0,i=0;for(let l=0;l+4<=e.length;l+=1){const u=s.getUint32(l,!0);u===67324752&&(n+=1),u===33639248&&(i+=1)}t(n,2),t(i,2),t(s.getUint32(e.length-22,!0),101010256,"end of central directory"),t(s.getUint16(e.length-22+10,!0),2,"entry count")});a("stores UTF-8 content at its byte length, not its character length",()=>{const e=V({"a.md":"café"}),s=new DataView(e.buffer,e.byteOffset,e.byteLength);t(s.getUint32(18,!0),5,"four characters, five bytes"),t(s.getUint16(6,!0),2048,"the UTF-8 flag is set")});a("an empty archive is still well formed",()=>{const e=V({});t(e.length,22)});const te=document.getElementById("out");let pe=0,Y=0;for(const{name:e,tests:s}of le){const n=document.createElement("h2");n.textContent=e,te.append(n);for(const{name:i,fn:l}of s){const u=document.createElement("div");try{l(),u.className="pass",u.textContent=`✓ ${i}`,pe+=1}catch(E){u.className="fail",u.textContent=`✗ ${i} — ${E.message}`,Y+=1}te.append(u)}}const ue=document.getElementById("summary");ue.textContent=`${pe} passed, ${Y} failed`;ue.className=Y?"fail":"pass";
