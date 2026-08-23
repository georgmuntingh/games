const yt=[1,2,3,4,5,6,7,8,9,10,11,12],q=5,gt=q*6,v=e=>(e%360+360)%360,C=(e,t)=>(e%t+t)%t,Wr=e=>v(e*6),Vr=(e,t)=>v(C(e,12)*30+t*.5),$t=(e,t)=>v(Math.atan2(e,-t)*180/Math.PI);function K(e,t,r,n){const o=n*Math.PI/180;return{x:e+r*Math.sin(o),y:t-r*Math.cos(o)}}function $e(e,t){const r=Math.abs(v(e)-v(t));return r>180?360-r:r}const Jr=e=>C(Math.round(v(e)/gt)*q,60);function Xr(e,t){const r=C(Math.round((v(e)-t*.5)/30),12);return r===0?12:r}function en({dx:e,dy:t,radius:r,hourDeg:n,minuteDeg:o}){const a=Math.hypot(e,t)/r;if(a<.18||a>1.15)return null;if(a<.55)return"hour";if(a>.72)return"minute";const l=$t(e,t);return $e(l,n)<=$e(l,o)?"hour":"minute"}const M=(e,t)=>`${e}:${String(t).padStart(2,"0")}`;function tn(e){const[t,r]=String(e).split(":").map(Number);return{h:t,m:r}}function kt(e,t){let r=(t-e)%60;return r>30&&(r-=60),r<-30&&(r+=60),r}function rn({h:e,m:t},r){const n=kt(t,r),o=t+n;let a=e;return o>=60?a=e%12+1:o<0&&(a=e===1?12:e-1),{h:a,m:r,delta:n}}function mt(e,t){const r=Math.abs(e-t)%60;return r>30?60-r:r}function bt(e,t){const r=Math.abs(C(e,12)-C(t,12))%12;return r>6?12-r:r}function nn(e,t){const r=C(e.h,12)===C(t.h,12),n=e.m===t.m,o=mt(e.m,t.m),a=bt(e.h,t.h);let l;return r&&n?l="correct":n?l="hourOff":r?l="minuteOff":l="both",{verdict:l,correct:l==="correct",nearMiss:l!=="correct"&&o<=q&&a<=1,minuteDelta:o,hourDelta:a}}const xt=.8,Z=[{id:0,minutes:[0]},{id:1,minutes:[30]},{id:2,minutes:[15,45]},{id:3,minutes:[5,10,20,25,35,40,50,55]}],oe=Z.length-1,Ve=new Map;for(const e of Z)for(const t of e.minutes)Ve.set(t,e.id);const wt=e=>Ve.get(e)??null;function ae(e){const t=Z[e];if(!t)return[];const r=[];for(const n of t.minutes)for(const o of yt)r.push({h:o,m:n,id:M(o,n),tier:e});return r}const Je=Z.flatMap(e=>ae(e.id));new Map(Je.map(e=>[e.id,e]));function Mt(e,t){const r=ae(t);return r.length?r.filter(o=>{var a;return((a=e[o.id])==null?void 0:a.phase)==="graduated"}).length/r.length:0}function Lt(e){let t=0;for(;t<oe&&Mt(e,t)>=xt;)t+=1;return t}function ke(e,t){const r=[];for(let n=0;n<=Math.min(t,oe);n+=1)for(const o of ae(n))e[o.id]||r.push(o);return r}const x="nb",St=[{id:"nb",label:"Norsk"},{id:"en",label:"English"}],on=e=>St.some(t=>t.id===e),me={en:["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"],nb:["","ett","to","tre","fire","fem","seks","sju","åtte","ni","ti","elleve","tolv"]},vt={0:"o'clock",5:"five past",10:"ten past",15:"quarter past",20:"twenty past",25:"twenty-five past",30:"half past",35:"twenty-five to",40:"twenty to",45:"quarter to",50:"ten to",55:"five to"},Ct={0:{text:"klokka {h}",next:!1},5:{text:"fem over {h}",next:!1},10:{text:"ti over {h}",next:!1},15:{text:"kvart over {h}",next:!1},20:{text:"ti på halv {h}",next:!0},25:{text:"fem på halv {h}",next:!0},30:{text:"halv {h}",next:!0},35:{text:"fem over halv {h}",next:!0},40:{text:"ti over halv {h}",next:!0},45:{text:"kvart på {h}",next:!0},50:{text:"ti på {h}",next:!0},55:{text:"fem på {h}",next:!0}},At=e=>(e-1+12)%12+1,Y=(e,t)=>(me[e]??me[x])[At(t)];function Et(e,t,r){if(e==="en"){const o=vt[r],a=Y("en",r>30?t+1:t);return r===0?`${a} ${o}`:`${o} ${a}`}const n=Ct[r];return n.text.replace("{h}",Y("nb",n.next?t+1:t))}const B={en:["Biscuit","Marmalade","Waffle","Pumpkin","Sprinkle","Doodle","Clover","Peanut","Nugget","Custard","Pickle","Bumble","Dandelion","Truffle","Cinnamon","Gumdrop","Blossom","Turnip","Jellybean","Muffin","Toast","Pancake","Wobble","Pudding","Cricket","Sundae","Butterbean","Hopscotch","Marshmallow","Tangerine","Pinecone","Bramble","Mittens","Popcorn","Whisker","Fern","Gingersnap","Nutmeg","Poppy","Sesame","Twiglet","Apricot","Cobweb","Domino","Fizzle","Hazelnut","Pebble","Snowdrop"],nb:["Vaffel","Kanelbolle","Blåbær","Pannekake","Smultring","Kakao","Marsipan","Karamell","Lakris","Rosin","Sukkerbit","Krumkake","Tyttebær","Multe","Kløver","Løvetann","Kongle","Furunål","Mose","Dugg","Snøfnugg","Måneskinn","Solstråle","Stjerneskudd","Regnbue","Tordensky","Bølge","Rullestein","Perle","Knappen","Tøffel","Votten","Lua","Dott","Lubben","Tuss","Prikken","Flekken","Bamse","Nøtta","Fnugg","Kvist","Bringebær","Solsikke","Tjukken","Sprett","Trilla","Nusse"]},I={en:{back:"← Back to games","nav.scenes":"Scenes","tab.play":"Feed","tab.zoo":"Zoo","sound.on":"Sound on","sound.off":"Sound off","settings.open":"Settings","clock.aria":"Drag the clock hands to set the time","prompt.booting":"Waking the zoo…","prompt.egg":"A chilly egg! It hatches at…","prompt.forgot":"{name} forgot their snack time. It is…","prompt.hungry":"{name} is hungry! They eat at…","prompt.snack":"{name} fancies a snack at…","button.warm":"Warm the egg!","button.feed":"Feed {name}!","cheer.1":"Yes!","cheer.2":"Perfect!","cheer.3":"Spot on!","cheer.4":"Nailed it!","cheer.5":"That is it!","cheer.streak":"{cheer} {n} in a row!","hatch.now":"It hatched!","hatch.hello":"{name} says hello!","evolve.now":"Something is happening…","evolve.done":"{name} is now {label}!","form.2":"the Bold","form.3":"the Grand","teach.nearMiss":"So close! ","teach.hourExact":"At {hour} o’clock the short fat hand points straight at the {hour}.","teach.hourPastHalf":"The short fat hand is past halfway from the {hour} to the {next} — but it is still the {hour}.","teach.hourJustLeft":"Look at the short fat hand: at {time} it has just left the {hour}.","teach.minuteOClock":"At {hour} o’clock the long hand points straight up.","teach.minuteCountOne":"Count round in fives: {jumps} jump past the top is {minutes} minutes.","teach.minuteCountMany":"Count round in fives: {jumps} jumps past the top is {minutes} minutes.","teach.both":"Here is where both hands go for {time}.","nap.title":"Pets are sleeping!","nap.copy":"That was a good session. Everyone is having a nap — you can still visit them in the zoo.","nap.countdown":"Waking up in","nap.wake":"Wake the pets","nap.visit":"Visit the zoo","nap.sleeping":"sleeping","zoo.empty":"No pets yet! Feed the clock a few times and your first egg will hatch.","zoo.egg":"{species} egg","zoo.eggTitle":"A chilly egg","zoo.rename":"What is this pet called?","habitat.back":"Back to the zoo","habitat.rename":"Give this pet a new name","habitat.aria":"{name}'s home","habitat.eggAria":"The home waiting for a {species} egg","habitat.hint":"Throw the ball, share a snack, or stroke {name}.","habitat.eggHint":"This home is waiting. Feed the clock, and the egg will hatch.","habitat.sleeping":"{name} is fast asleep. Sshh.","unlock.title":"New pets have arrived!","unlock.copy":"{tier} — {blurb}","unlock.close":"Let’s go","howto.summary":"How to play","howto.1":"A pet tells you when it eats. Drag the clock hands to that time.","howto.2":"The <b>long thin hand</b> is the minutes — it jumps five minutes at a time. The <b>short fat hand</b> is the hour.","howto.3":"Watch the short hand creep along as you move the long one. At quarter past four it has already left the 4 — that is how a real clock works.","howto.4":"Get one right three times and its egg hatches into a pet of your own.","howto.5":"After a few minutes the pets get sleepy and the game stops. You can still wander the zoo while they nap.","howto.6":"Grown-ups: press and hold the title for progress.","grownups.title":"Progress","grownups.answered":"Times answered","grownups.accuracy":"Correct first try","grownups.streak":"Best streak","grownups.hatched":"Pets hatched","grownups.days":"Days played","grownups.fine":"Times are scheduled with a spaced-repetition algorithm: each one comes back just as it is about to be forgotten. Everything is stored in this browser only.","grownups.close":"Close","grownups.reset":"Start over","grownups.resetConfirm":"Start over? Every pet and all progress will be lost.","settings.title":"Settings","settings.language":"Language","settings.playTime":"Play time","settings.playTimeValue":"{n} minutes","settings.playTimeHelp":"How long a session lasts before the pets need a nap. Short sessions work best — three to five minutes.","settings.digital":"Show digital time","settings.digitalHelp":"Off by default. With it off the pets say their feeding time in words only, so the clock face is the only place to read it.","settings.transfer":"Move to another device","settings.transferHelp":"Save the zoo as a file, or copy it as a code to send in a message. Opening either one on another device brings every pet across. The zoo already on that device is replaced.","settings.done":"Done","transfer.exportFile":"Save file","transfer.copyCode":"Copy code","transfer.importFile":"Open file…","transfer.pasteCode":"Paste code","transfer.pastePrompt":"Paste the code from the other device:","transfer.confirm":"Replace this device’s zoo with the one you are bringing in? The pets here now will be lost.","transfer.saved":"Saved {file}.","transfer.copied":"Code copied — paste it on the other device.","transfer.copyFailed":"Could not reach the clipboard, so the code was saved as a file instead.","transfer.imported":"Brought in {n} pets.","transfer.badFile":"That does not look like a Pet Zoo save.","transfer.badApp":"That save is from a different game.","transfer.badVersion":"That save comes from a newer Pet Zoo than this one.","tier.0.name":"O’clock","tier.0.blurb":"The big hand points straight up.","tier.1.name":"Half past","tier.1.blurb":"The big hand points straight down.","tier.2.name":"Quarter past and quarter to","tier.2.blurb":"The big hand points sideways.","tier.3.name":"Every five minutes","tier.3.blurb":"Count around the face in fives."},nb:{back:"← Tilbake til spillene","nav.scenes":"Visninger","tab.play":"Mate","tab.zoo":"Dyrehagen","sound.on":"Lyd på","sound.off":"Lyd av","settings.open":"Innstillinger","clock.aria":"Dra viserne for å stille klokka","prompt.booting":"Vekker dyrehagen…","prompt.egg":"Et kaldt egg! Det klekkes…","prompt.forgot":"{name} har glemt måltidet sitt. Klokka er…","prompt.hungry":"{name} er sulten! Spiser…","prompt.snack":"{name} vil gjerne ha en matbit…","button.warm":"Varm egget!","button.feed":"Mat {name}!","cheer.1":"Ja!","cheer.2":"Perfekt!","cheer.3":"Helt riktig!","cheer.4":"Sånn ja!","cheer.5":"Der satt den!","cheer.streak":"{cheer} {n} på rad!","hatch.now":"Det klekket!","hatch.hello":"{name} sier hei!","evolve.now":"Noe skjer …","evolve.done":"{name} er nå {label}!","form.2":"den modige","form.3":"den store","teach.nearMiss":"Nesten! ","teach.hourExact":"Når klokka er {hour}, peker den korte tjukke viseren rett på {hourNum}-tallet.","teach.hourPastHalf":"Den korte tjukke viseren er mer enn halvveis fra {hourNum} til {next} — men timen er fortsatt {hourNum}.","teach.hourJustLeft":"Se på den korte tjukke viseren: {time} har den akkurat forlatt {hourNum}-tallet.","teach.minuteOClock":"Når klokka er {hour}, peker den lange viseren rett opp.","teach.minuteCountOne":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.minuteCountMany":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.both":"Her skal begge viserne stå når klokka er {time}.","nap.title":"Dyrene sover!","nap.copy":"Det var en god økt. Alle tar seg en blund — du kan fortsatt besøke dem i dyrehagen.","nap.countdown":"Våkner om","nap.wake":"Vekk dyrene","nap.visit":"Besøk dyrehagen","nap.sleeping":"sover","zoo.empty":"Ingen dyr ennå! Still klokka riktig noen ganger, så klekkes det første egget ditt.","zoo.egg":"{species}-egg","zoo.eggTitle":"Et kaldt egg","zoo.rename":"Hva heter dette dyret?","habitat.back":"Tilbake til dyrehagen","habitat.rename":"Gi dyret et nytt navn","habitat.aria":"Hjemmet til {name}","habitat.eggAria":"Hjemmet som venter på et {species}-egg","habitat.hint":"Kast ballen, gi en godbit, eller klapp {name}.","habitat.eggHint":"Dette hjemmet venter. Still klokka riktig, så klekkes egget.","habitat.sleeping":"{name} sover godt. Hysj.","unlock.title":"Nye dyr har kommet!","unlock.copy":"{tier} — {blurb}","unlock.close":"Kom igjen!","howto.summary":"Slik spiller du","howto.1":"Et dyr sier når det spiser. Dra viserne til det klokkeslettet.","howto.2":"Den <b>lange tynne viseren</b> er minuttene — den hopper fem minutter om gangen. Den <b>korte tjukke viseren</b> er timen.","howto.3":"Se hvordan den korte viseren sniker seg framover når du flytter den lange. Kvart over fire har den allerede forlatt 4-tallet — sånn funker en ekte klokke.","howto.4":"Klarer du samme klokkeslett tre ganger, klekkes egget til et dyr som blir ditt.","howto.5":"Etter noen minutter blir dyrene trøtte, og spillet stopper. Du kan fortsatt gå rundt i dyrehagen mens de sover.","howto.6":"Voksne: hold inne tittelen for å se framgang.","grownups.title":"Framgang","grownups.answered":"Klokkeslett svart på","grownups.accuracy":"Riktig på første forsøk","grownups.streak":"Beste rekke","grownups.hatched":"Dyr klekket","grownups.days":"Dager spilt","grownups.fine":"Klokkeslettene planlegges med en gjentakelsesalgoritme: hvert av dem kommer tilbake akkurat når det holder på å bli glemt. Alt lagres bare i denne nettleseren.","grownups.close":"Lukk","grownups.reset":"Start på nytt","grownups.resetConfirm":"Starte på nytt? Alle dyr og all framgang forsvinner.","settings.title":"Innstillinger","settings.language":"Språk","settings.playTime":"Spilletid","settings.playTimeValue":"{n} minutter","settings.playTimeHelp":"Hvor lenge en økt varer før dyrene må sove. Korte økter funker best — tre til fem minutter.","settings.digital":"Vis digital tid","settings.digitalHelp":"Av til vanlig. Når den er av, sier dyrene måltidet sitt bare med ord, så urskiva er eneste stedet å lese det.","settings.transfer":"Flytt til en annen enhet","settings.transferHelp":"Lagre dyrehagen som en fil, eller kopier den som en kode du kan sende i en melding. Åpner du en av delene på en annen enhet, blir alle dyrene med. Dyrehagen som allerede er der, blir erstattet.","settings.done":"Ferdig","transfer.exportFile":"Lagre fil","transfer.copyCode":"Kopier kode","transfer.importFile":"Åpne fil …","transfer.pasteCode":"Lim inn kode","transfer.pastePrompt":"Lim inn koden fra den andre enheten:","transfer.confirm":"Erstatte dyrehagen på denne enheten med den du henter inn? Dyrene som er her nå, forsvinner.","transfer.saved":"Lagret {file}.","transfer.copied":"Koden er kopiert — lim den inn på den andre enheten.","transfer.copyFailed":"Fikk ikke tak i utklippstavla, så koden ble lagret som fil i stedet.","transfer.imported":"Hentet inn {n} dyr.","transfer.badFile":"Dette ser ikke ut som en lagret dyrehage.","transfer.badApp":"Den lagringa er fra et annet spill.","transfer.badVersion":"Den lagringa er fra en nyere utgave av Dyrehagen enn denne.","tier.0.name":"Hele timer","tier.0.blurb":"Den lange viseren peker rett opp.","tier.1.name":"Halve timer","tier.1.blurb":"Den lange viseren peker rett ned.","tier.2.name":"Kvart over og kvart på","tier.2.blurb":"Den lange viseren peker til siden.","tier.3.name":"Hvert femte minutt","tier.3.blurb":"Tell rundt skiva i femmere."}},an=e=>Object.keys(I[e]??{}),Tt=(e,t)=>t?String(e).replace(/\{(\w+)\}/g,(r,n)=>Object.prototype.hasOwnProperty.call(t,n)?String(t[n]):r):String(e);function sn(e){const t=I[e]??I[x],r=I[x],n=(o,a)=>Tt(t[o]??r[o]??o,a);return n.lang=I[e]?e:x,n.spoken=(o,a)=>Et(n.lang,o,a),n.hourWord=o=>Y(n.lang,o),n.names=B[n.lang]??B[x],n}const be=[1,3,8],Dt=2,It=3,Nt=7,W=[1,3,5],V=W.length;function J(e){let t=0;for(let r=0;r<W.length;r+=1)e>=W[r]&&(t=r+1);return t}const Ft=2.5,Xe=1.3,et=2.8,Ot=.2,Rt=60,xe=864e5,tt=(e,t,r)=>Math.min(Math.max(e,t),r);function ln({h:e,m:t,species:r,reviewClock:n=0}){return{h:e,m:t,tier:wt(t)??0,species:r,name:null,phase:"learning",step:0,dueStep:n+1,ease:Ft,intervalDays:0,dueAt:0,reps:0,feeds:0,lapses:0,correctStreak:0,hatchedAt:null,seen:0,lastMs:0}}function Zt({correct:e,ms:t=0,reversals:r=0}){return e?t>2e4||r>=2?3:t>8e3||r>=1?4:5:0}const jt=(e,t)=>tt(e+(.1-(5-t)*(.08+(5-t)*.02)),Xe,et),_t=(e,t,r)=>e<=1?1:e===2?3:Math.min(Math.round(t*r),Rt);function cn(e,{correct:t,ms:r=0,reversals:n=0,reviewClock:o,now:a}){const l=Zt({correct:t,ms:r,reversals:n}),s={...e,seen:e.seen+1,lastMs:r},p={quality:l,graduated:!1,hatched:!1,lapsed:!1,evolved:0};t?(s.correctStreak=e.correctStreak+1,e.phase==="learning"?s.correctStreak>=It?(s.phase="graduated",s.reps=1,s.feeds=e.feeds+1,s.intervalDays=1,s.dueAt=a+xe,s.dueStep=null,p.graduated=!0,s.hatchedAt===null&&(s.hatchedAt=a,p.hatched=!0)):(s.step=Math.min(e.step+1,be.length-1),s.dueStep=o+be[s.step]):(s.ease=jt(e.ease,l),s.reps=e.reps+1,s.feeds=e.feeds+1,s.intervalDays=_t(s.reps,e.intervalDays,s.ease),s.dueAt=a+s.intervalDays*xe)):(s.correctStreak=0,s.step=0,s.dueStep=o+Dt,e.phase==="graduated"&&(s.phase="learning",s.ease=tt(e.ease-Ot,Xe,et),s.lapses=e.lapses+1,s.dueAt=0,s.intervalDays=0,s.reps=0,p.lapsed=!0));const h=J(e.feeds),d=J(s.feeds);return h>=1&&d>h&&(p.evolved=d),{item:s,events:p}}const X=e=>e.phase==="learning",Pt=(e,t)=>e.phase==="graduated"&&e.dueAt<=t,Ht=e=>Object.values(e).filter(X).length,_=e=>(t,r)=>e(t[1])-e(r[1]);function fn(e,{now:t,exclude:r=null}={}){var h;const n=e.reviewClock+1,o=Object.entries(e.items).filter(([d])=>d!==r),a=o.filter(([,d])=>X(d)&&d.dueStep!==null&&d.dueStep<=n).sort(_(d=>d.dueStep));if(a.length)return a[0][0];const l=o.filter(([,d])=>Pt(d,t)).sort(_(d=>d.dueAt));if(l.length)return l[0][0];if(Ht(e.items)<Nt){const d=ke(e.items,e.tier)[0];if(d)return d.id}const s=o.filter(([,d])=>d.phase==="graduated").sort(_(d=>d.dueAt));if(s.length)return s[0][0];const p=o.filter(([,d])=>X(d)).sort(_(d=>d.seen));return p.length?p[0][0]:r&&e.items[r]?r:((h=ke(e.items,oe)[0])==null?void 0:h.id)??M(1,0)}function pn(e){const t=Math.max(e.tier,Lt(e.items));return{tier:t,unlocked:t>e.tier}}const se=5,zt=2,Bt=15,Ut=.6,qt=5,Qt=120*1e3,Gt=1800*1e3,Kt=(e,t,r)=>Math.min(Math.max(e,t),r);function Yt(e){const t=Math.round(Number(e)),r=Kt(Number.isFinite(t)?t:se,zt,Bt),n=r*60*1e3;return{minutes:r,hardMs:n,softMs:Math.round(n*Ut),maxQuestions:r*qt}}const le=Yt(se);function dn(e){return{startedAt:e,answered:0,correct:0,napUntil:0}}const F=(e,t)=>Math.max(0,t-((e==null?void 0:e.startedAt)??t));function hn(e,{now:t,correct:r,limits:n=le}){return e.answered>=n.maxQuestions?"count":F(e,t)>=n.hardMs?"hard":r&&F(e,t)>=n.softMs?"soft":null}const un=(e,t,r=le)=>F(e,t)>=r.hardMs,yn=e=>!!(e!=null&&e.startedAt),gn=(e,t)=>F(e,t)>=Gt,$n=(e,t)=>({...e,napUntil:t+Qt}),kn=(e,t)=>!!(e!=null&&e.napUntil)&&t<e.napUntil,mn=(e,t)=>Math.max(0,((e==null?void 0:e.napUntil)??0)-t),bn=(e,t,r=le)=>Math.min(1,F(e,t)/r.hardMs);function xn(e){const t=Math.ceil(e/1e3);return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}const f="#43354f",ce=[37,63],we=52,ie=[-1,1],Me={round:{shape:'<ellipse cx="50" cy="54" rx="34" ry="32" />',halo:{cx:50,cy:54,rx:34,ry:32}},tall:{shape:'<ellipse cx="50" cy="52" rx="28" ry="34" />',halo:{cx:50,cy:52,rx:28,ry:34}},wide:{shape:'<ellipse cx="50" cy="58" rx="38" ry="28" />',halo:{cx:50,cy:58,rx:38,ry:28}},pear:{shape:'<path d="M50 22 C66 22 72 38 74 54 C76 72 66 86 50 86 C34 86 24 72 26 54 C28 38 34 22 50 22 Z" />',halo:{cx:50,cy:55,rx:25,ry:32}},bean:{shape:'<path d="M53 20 C71 20 81 37 79 56 C77 76 63 86 47 86 C30 86 21 71 21 54 C21 34 35 20 53 20 Z" />',halo:{cx:50,cy:53,rx:29,ry:33}},chunky:{shape:'<path d="M50 20 C74 20 86 34 86 55 C86 76 71 86 50 86 C29 86 14 76 14 55 C14 34 26 20 50 20 Z" />',halo:{cx:50,cy:53,rx:36,ry:33}}},Wt=`
  <ellipse cx="35" cy="85" rx="10" ry="6" />
  <ellipse cx="65" cy="85" rx="10" ry="6" />`,P=(e,t,r=1)=>{const n=t*Math.PI/180;return{x:e.cx+Math.sin(n)*e.rx*r,y:e.cy-Math.cos(n)*e.ry*r}},Le={smooth:()=>"",fluffy:e=>Array.from({length:18},(t,r)=>{const n=P(e,r*20,1);return`<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="7" />`}).join(""),spiky:e=>Array.from({length:5},(t,r)=>{const n=-70+r*22,o=P(e,n-9,.97),a=P(e,n+9,.97),l=P(e,n,1.22);return`<path d="M${o.x.toFixed(1)} ${o.y.toFixed(1)} L${l.x.toFixed(1)} ${l.y.toFixed(1)} L${a.x.toFixed(1)} ${a.y.toFixed(1)} Z" />`}).join("")},Vt=new Set(["horn","fin","antenna","tuft","leaf","antlers","rabbit"]),Se={none:()=>"",roundears:()=>'<circle cx="26" cy="30" r="13" /><circle cx="74" cy="30" r="13" />',ears:()=>`
    <path d="M30 36 C24 22 24 12 30 10 C36 8 42 18 44 30 Z" />
    <path d="M70 36 C76 22 76 12 70 10 C64 8 58 18 56 30 Z" />`,rabbit:e=>`
    <ellipse cx="37" cy="16" rx="7.5" ry="21" transform="rotate(-8 37 16)" />
    <ellipse cx="63" cy="16" rx="7.5" ry="21" transform="rotate(8 63 16)" />
    <ellipse cx="37" cy="17" rx="3.6" ry="14" fill="${e}" transform="rotate(-8 37 17)" />
    <ellipse cx="63" cy="17" rx="3.6" ry="14" fill="${e}" transform="rotate(8 63 17)" />`,hound:()=>`
    <ellipse cx="17" cy="58" rx="10" ry="25" transform="rotate(-12 17 58)" />
    <ellipse cx="83" cy="58" rx="10" ry="25" transform="rotate(12 83 58)" />`,floppy:()=>`
    <ellipse cx="20" cy="50" rx="8" ry="19" transform="rotate(-16 20 50)" />
    <ellipse cx="80" cy="50" rx="8" ry="19" transform="rotate(16 80 50)" />`,horn:e=>`<path d="M50 6 C54 14 57 21 58 28 C55 25 45 25 42 28 C43 21 46 14 50 6 Z" fill="${e}" />`,ram:e=>`
    <path d="M28 30 C14 30 10 20 18 14 C24 10 32 14 30 22" fill="none" stroke="${e}"
          stroke-width="7" stroke-linecap="round" />
    <path d="M72 30 C86 30 90 20 82 14 C76 10 68 14 70 22" fill="none" stroke="${e}"
          stroke-width="7" stroke-linecap="round" />`,antlers:e=>`
    <path d="M40 30 L34 14 M34 14 L28 10 M34 14 L38 6" fill="none" stroke="${e}"
          stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M60 30 L66 14 M66 14 L72 10 M66 14 L62 6" fill="none" stroke="${e}"
          stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />`,fin:e=>`<path d="M50 6 C60 14 63 22 61 30 L39 30 C37 22 40 14 50 6 Z" fill="${e}" />`,antenna:e=>`
    <path d="M50 30 C48 20 52 16 50 10" fill="none" stroke="${f}" stroke-width="3" stroke-linecap="round" />
    <circle cx="50" cy="8" r="6" fill="${e}" />`,tuft:()=>'<circle cx="41" cy="24" r="8" /><circle cx="50" cy="16" r="9" /><circle cx="59" cy="24" r="8" />',leaf:e=>`
    <path d="M50 28 C50 16 56 8 66 6 C66 18 60 26 50 28 Z" fill="${e}" />
    <path d="M50 30 C50 20 46 14 38 12 C38 22 42 28 50 30 Z" fill="${e}" />`},$="#ffffff",ve={round:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9.5" ry="10.5" fill="${f}" />
    <circle cx="${e-3.2}" cy="47.5" r="3.6" fill="${$}" />
    <circle cx="${e+3}" cy="56" r="1.8" fill="${$}" opacity="0.85" />`,oval:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="6.8" ry="11.5" fill="${f}" />
    <circle cx="${e-2.4}" cy="47" r="2.9" fill="${$}" />
    <circle cx="${e+2}" cy="56.5" r="1.4" fill="${$}" opacity="0.85" />`,sleepy:e=>`
    <path class="pet-eye" d="M${e-9} 50 Q${e} 45.5 ${e+9} 50 Q${e} 63.5 ${e-9} 50 Z" fill="${f}" />
    <circle cx="${e-3}" cy="53.5" r="3.2" fill="${$}" />
    <circle cx="${e+3.4}" cy="57" r="1.5" fill="${$}" opacity="0.85" />`,sparkle:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9" ry="11" fill="${f}" />
    <path d="M${e-3} 43 Q${e-2} 47 ${e+1.5} 48 Q${e-2} 49 ${e-3} 53
             Q${e-4} 49 ${e-7.5} 48 Q${e-4} 47 ${e-3} 43 Z" fill="${$}" />
    <circle cx="${e+3.5}" cy="56.5" r="1.9" fill="${$}" opacity="0.85" />`,lashed:(e,t)=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="8" ry="10.5" fill="${f}" />
    <circle cx="${e-2.6}" cy="47.5" r="3" fill="${$}" />
    <path d="M${e+t*7} 46 l${t*5.5} -4" stroke="${f}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*8.2} 50 l${t*6} -1.6" stroke="${f}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*7.6} 54 l${t*5.6} 1.8" stroke="${f}" stroke-width="2.4" stroke-linecap="round" fill="none" />`,beady:e=>`
    <circle class="pet-eye" cx="${e}" cy="52" r="5.6" fill="${f}" />
    <circle cx="${e-1.8}" cy="50" r="2.1" fill="${$}" />`},Jt=e=>`<g transform="translate(0 ${we}) scale(1 0.08) translate(0 ${-we})">${e}</g>`+ie.map((t,r)=>{const n=ce[r];return`<path d="M${n-9} 52 Q${n} 58.5 ${n+9} 52" fill="none" stroke="${f}"
                  stroke-width="3.2" stroke-linecap="round" />`}).join(""),Ce={none:()=>"",thick:(e,t)=>`<path d="M${e+t*8.5} 35.5 L${e-t*8} 35" stroke="${f}" stroke-width="4" stroke-linecap="round" fill="none" />`,arched:e=>`<path d="M${e-8.5} 37.5 Q${e} 30.5 ${e+8.5} 37.5" stroke="${f}" stroke-width="3.2" stroke-linecap="round" fill="none" />`,worried:(e,t)=>`<path d="M${e+t*8.5} 38.5 L${e-t*8.5} 33.5" stroke="${f}" stroke-width="3.4" stroke-linecap="round" fill="none" />`,bushy:e=>`<path d="M${e-9} 36.5 Q${e} 29.5 ${e+9} 36.5" stroke="${f}" stroke-width="5.6" stroke-linecap="round" fill="none" />`},Ae={happy:{rot:0,dy:-2.5},content:{rot:0,dy:0},hungry:{rot:-2,dy:-3.5},droopy:{rot:-9,dy:1.5},sleep:{rot:-4,dy:1}},Ee={happy:`<path d="M41 66 C45 75 55 75 59 66" fill="none" stroke="${f}" stroke-width="3.2" stroke-linecap="round" />`,content:`<path d="M44 67 C47 72 53 72 56 67" fill="none" stroke="${f}" stroke-width="3.2" stroke-linecap="round" />`,hungry:`<ellipse cx="50" cy="69" rx="7" ry="8" fill="${f}" />
           <ellipse cx="50" cy="73" rx="4.5" ry="3.5" fill="#ff9ec0" />`,droopy:`<path d="M43 71 C46 65 54 65 57 71" fill="none" stroke="${f}" stroke-width="3.2" stroke-linecap="round" />`,sleep:`<path d="M44 68 C47 73 53 73 56 68" fill="none" stroke="${f}" stroke-width="3.2" stroke-linecap="round" />`},y=e=>({back:"",front:e}),N=(e,t)=>({back:e,front:t}),Te=(e,t,r)=>Array.from({length:10},(n,o)=>{const a=(o*36-90)*Math.PI/180,l=o%2?r*.45:r;return`${(e+Math.cos(a)*l).toFixed(1)} ${(t+Math.sin(a)*l).toFixed(1)}`}).join(" L"),Xt={none:()=>y(""),roundSpecs:e=>y(`
      <g fill="${$}" fill-opacity="0.35" stroke="${f}" stroke-width="2.6">
        <circle cx="37" cy="52" r="12.5" /><circle cx="63" cy="52" r="12.5" />
      </g>
      <path d="M49.5 52 H50.5 M24.5 50 L16 47 M75.5 50 L84 47" stroke="${f}"
            stroke-width="2.6" stroke-linecap="round" fill="none" />`),squareSpecs:e=>y(`
      <g fill="${$}" fill-opacity="0.35" stroke="${f}" stroke-width="3.2">
        <rect x="24.5" y="41" width="25" height="22" rx="6" />
        <rect x="50.5" y="41" width="25" height="22" rx="6" />
      </g>
      <path d="M49.5 51 H50.5 M24 46 L16 44 M76 46 L84 44" stroke="${f}"
            stroke-width="3" stroke-linecap="round" fill="none" />`),goggles:e=>y(`
      <path d="M18 48 H82" stroke="${e.accent}" stroke-width="7" stroke-linecap="round" />
      <g fill="${$}" fill-opacity="0.4" stroke="${f}" stroke-width="3">
        <circle cx="37" cy="52" r="13.5" /><circle cx="63" cy="52" r="13.5" />
      </g>`),monocle:e=>y(`
      <circle cx="63" cy="52" r="13" fill="${$}" fill-opacity="0.35" stroke="${f}" stroke-width="2.8" />
      <path d="M63 65 C63 72 58 75 54 76" stroke="${f}" stroke-width="2" fill="none" stroke-linecap="round" />`),starShades:e=>y(`
      <path d="M${Te(37,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${f}" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M${Te(63,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${f}" stroke-width="2.2" stroke-linejoin="round" />`)},er=new Set(["cowlick","topknot","cap"]),tr={none:()=>y(""),fringe:e=>y(`<path d="M23 40 C26 24 40 18 50 18 C62 18 74 25 76 40
                    C70 32 62 34 57 39 C54 31 44 30 39 36 C34 32 27 34 23 40 Z"
                 fill="${e.accent}" />`),cowlick:e=>y(`<path d="M46 22 C44 12 52 6 60 4 C54 10 55 15 60 17 C54 19 49 20 46 26 Z" fill="${e.accent}" />`),topknot:e=>y(`<circle cx="50" cy="14" r="10" fill="${e.accent}" stroke="${f}" stroke-width="2.2" />
           <path d="M42 22 Q50 26 58 22" stroke="${f}" stroke-width="3" fill="none" stroke-linecap="round" />`),cap:e=>y(`<g fill="${e.accent}" stroke="${f}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M22 32 C22 16 78 16 78 32 Z" />
             <path d="M78 30 C88 30 90 36 88 38 L74 34 Z" />
           </g>
           <circle cx="50" cy="13" r="4" fill="${f}" />`),bow:e=>y(`<g transform="translate(26 24) rotate(-18)" fill="${e.accent}" stroke="${f}"
              stroke-width="2.2" stroke-linejoin="round">
             <path d="M0 0 C-9 -8 -14 -2 -12 4 C-10 9 -3 7 0 0 Z" />
             <path d="M0 0 C9 -8 14 -2 12 4 C10 9 3 7 0 0 Z" />
             <circle cx="0" cy="0" r="3.6" fill="${f}" stroke="none" />
           </g>`),flower:e=>y(`<g transform="translate(75 28)">
             ${[0,72,144,216,288].map(t=>{const r=t*Math.PI/180;return`<ellipse cx="${(Math.cos(r)*6).toFixed(1)}" cy="${(Math.sin(r)*6).toFixed(1)}" rx="5" ry="4" transform="rotate(${t})" fill="${$}" />`}).join("")}
             <circle cx="0" cy="0" r="4" fill="#ffd166" />
           </g>`)},rr={none:()=>y(""),moustache:()=>y(`<path d="M50 64 C46 59 38 59 35 64 C38 68 46 68 50 64 Z
                    M50 64 C54 59 62 59 65 64 C62 68 54 68 50 64 Z" fill="${f}" />`),beard:()=>y(`<g fill="${f}">
             <circle cx="44" cy="78.5" r="6" /><circle cx="50" cy="81" r="7" /><circle cx="56" cy="78.5" r="6" />
           </g>`),whiskers:()=>y(`<g stroke="${f}" stroke-width="2" stroke-linecap="round" fill="none">
             <path d="M32 64 L18 61 M32 68 L17 68 M32 72 L19 76" />
             <path d="M68 64 L82 61 M68 68 L83 68 M68 72 L81 76" />
           </g>`),teeth:()=>y(`<rect x="45" y="70" width="4.6" height="7" rx="1.6" fill="${$}" stroke="${f}" stroke-width="1.4" />
           <rect x="50.4" y="70" width="4.6" height="7" rx="1.6" fill="${$}" stroke="${f}" stroke-width="1.4" />`),snout:e=>N(`<ellipse cx="50" cy="69" rx="15" ry="11.5" fill="${e.belly}" />
       <ellipse cx="50" cy="61" rx="5.5" ry="4" fill="${f}" />`,"")},rt={none:()=>y(""),freckles:e=>y(`<g fill="${f}" opacity="0.4">
             <circle cx="26" cy="57" r="1.6" /><circle cx="30" cy="60" r="1.6" /><circle cx="25" cy="63" r="1.6" />
             <circle cx="74" cy="57" r="1.6" /><circle cx="70" cy="60" r="1.6" /><circle cx="75" cy="63" r="1.6" />
           </g>`),spots:e=>N(`<g fill="${e.accent}" opacity="0.5">
         <ellipse cx="24" cy="44" rx="7" ry="5.5" /><ellipse cx="76" cy="70" rx="6" ry="5" />
         <ellipse cx="70" cy="34" rx="5" ry="4" />
       </g>`,""),stripes:e=>N(`<g stroke="${e.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55">
         <path d="M20 46 Q26 50 26 58" /><path d="M22 62 Q28 65 29 72" />
         <path d="M80 46 Q74 50 74 58" /><path d="M78 62 Q72 65 71 72" />
       </g>`,""),patch:e=>N(`<ellipse cx="37" cy="52" rx="15" ry="14" fill="${e.accent}" opacity="0.45" />`,""),heart:e=>N(`<path d="M50 76 C44 70 38 68 38 63 C38 59 43 58 46 61 C47 62 49 63 50 65
                C51 63 53 62 54 61 C57 58 62 59 62 63 C62 68 56 70 50 76 Z"
             fill="${e.accent}" opacity="0.6" />`,"")},nr={none:()=>y(""),scarf:e=>y(`<g fill="${e.accent}" stroke="${f}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M28 78 C38 85 62 85 72 78 C70 85 62 89 50 89 C38 89 30 85 28 78 Z" />
             <path d="M66 82 C72 84 74 90 71 94 C67 92 65 87 66 82 Z" />
           </g>`),bandana:e=>y(`<path d="M30 79 C40 85 60 85 70 79 L50 95 Z" fill="${e.accent}" stroke="${f}"
                 stroke-width="2.2" stroke-linejoin="round" />`),bowtie:e=>y(`<g transform="translate(50 82)" fill="${e.accent}" stroke="${f}" stroke-width="2.2"
              stroke-linejoin="round">
             <path d="M0 0 L-12 -6 L-12 6 Z" />
             <path d="M0 0 L12 -6 L12 6 Z" />
             <circle cx="0" cy="0" r="3.4" fill="${f}" stroke="none" />
           </g>`),backpack:e=>y(`<g stroke="${f}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M38 44 C33 56 33 68 37 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <path d="M62 44 C67 56 67 68 63 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <rect x="12" y="64" width="17" height="19" rx="6" fill="${e.accent}" />
             <path d="M12 71 H29" fill="none" />
           </g>`)},De={x:50,y:86},Ie={x:50,y:55},Ne={1:{scale:.78,face:1,faceY:0},2:{scale:.9,face:.87,faceY:-5},3:{scale:1.02,face:.74,faceY:-10}},nt=e=>Ne[e]??Ne[1],or=e=>{const{scale:t}=nt(e);return`translate(${De.x} ${De.y}) scale(${t}) translate(-50 -86)`},ar=e=>{const{face:t,faceY:r}=nt(e);return`translate(0 ${r}) translate(${Ie.x} ${Ie.y}) scale(${t}) translate(-50 -55)`},Fe={tail:e=>`<path d="M78 76 C92 74 96 62 90 52 C88 60 84 66 74 68 Z" fill="${e.accent}" />`,wings:e=>`
    <path d="M26 46 C8 34 2 48 6 60 C10 72 22 72 30 64 Z" fill="${e.accent}" opacity="0.92" />
    <path d="M74 46 C92 34 98 48 94 60 C90 72 78 72 70 64 Z" fill="${e.accent}" opacity="0.92" />`,mane:e=>Array.from({length:11},(t,r)=>{const n=(-100+r*20)*Math.PI/180;return`<circle cx="${(50+Math.sin(n)*36).toFixed(1)}" cy="${(58-Math.cos(n)*32).toFixed(1)}" r="9" />`}).join(""),crest:e=>Array.from({length:5},(t,r)=>{const n=30+r*10,o=r===2?20:12;return`<path d="M${n} 24 L${n+5} ${24-o-10} L${n+10} 24 Z" fill="${e.accent}"
                    stroke="${f}" stroke-width="1.8" stroke-linejoin="round" />`}).join(""),finback:e=>`<path d="M46 4 C66 14 80 32 84 54 C74 44 62 38 48 38 Z" fill="${e.accent}"
           stroke="${f}" stroke-width="2" stroke-linejoin="round" />`,plume:e=>`
    <path d="M76 74 C94 68 98 50 92 36 C88 48 82 58 72 64 Z" fill="${e.accent}" opacity="0.85" />
    <path d="M74 78 C90 76 96 64 94 52 C88 62 82 70 70 72 Z" fill="${e.accent}" />`},Oe={bigEars:e=>`
    <circle cx="20" cy="26" r="18" /><circle cx="80" cy="26" r="18" />
    <circle cx="20" cy="26" r="10" fill="${e.belly}" /><circle cx="80" cy="26" r="10" fill="${e.belly}" />`,antennaArray:e=>`
    <g fill="none" stroke="${f}" stroke-width="3" stroke-linecap="round">
      <path d="M50 28 C48 16 52 10 50 2" /><path d="M38 30 C32 20 30 14 26 8" /><path d="M62 30 C68 20 70 14 74 8" />
    </g>
    <circle cx="50" cy="2" r="7" fill="${e.accent}" />
    <circle cx="25" cy="7" r="5" fill="${e.accent}" /><circle cx="75" cy="7" r="5" fill="${e.accent}" />`,tallTuft:e=>`
    <path d="M50 30 C40 20 42 8 52 0 C50 10 56 14 60 10 C62 20 58 26 50 30 Z" fill="${e.accent}" />
    <circle cx="38" cy="24" r="7" /><circle cx="62" cy="24" r="7" />`,crownSpikes:e=>`
    <path d="M26 30 L30 12 L38 24 L46 6 L54 24 L62 12 L70 30 Z" fill="${e.accent}"
          stroke="${f}" stroke-width="2.2" stroke-linejoin="round" />`,longEars:e=>`
    <path d="M28 38 C16 22 16 6 26 2 C36 0 44 16 46 32 Z" />
    <path d="M72 38 C84 22 84 6 74 2 C64 0 56 16 54 32 Z" />
    <circle cx="24" cy="6" r="7" fill="${e.belly}" /><circle cx="76" cy="6" r="7" fill="${e.belly}" />`,hugeRabbit:e=>`
    <ellipse cx="34" cy="10" rx="9" ry="26" transform="rotate(-10 34 10)" />
    <ellipse cx="66" cy="10" rx="9" ry="26" transform="rotate(10 66 10)" />
    <ellipse cx="34" cy="12" rx="4.4" ry="18" fill="${e.belly}" transform="rotate(-10 34 12)" />
    <ellipse cx="66" cy="12" rx="4.4" ry="18" fill="${e.belly}" transform="rotate(10 66 12)" />`,ramCurl:e=>`
    <g fill="none" stroke="${e.accent}" stroke-width="8" stroke-linecap="round">
      <path d="M28 28 C10 28 4 14 16 6 C26 0 36 8 32 18" />
      <path d="M72 28 C90 28 96 14 84 6 C74 0 64 8 68 18" />
    </g>`,twinHorns:e=>`
    <path d="M40 30 C40 16 36 6 30 0 C42 2 48 14 50 28 Z" fill="${e.accent}" />
    <path d="M60 30 C60 16 64 6 70 0 C58 2 52 14 50 28 Z" fill="${e.accent}" />`,bigAntlers:e=>`
    <g fill="none" stroke="${e.accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M40 30 L30 10 M30 10 L18 4 M30 10 L34 -2 M35 19 L24 16" />
      <path d="M60 30 L70 10 M70 10 L82 4 M70 10 L66 -2 M65 19 L76 16" />
    </g>`,flameCrest:e=>`
    <path d="M50 30 C38 18 40 4 54 -4 C50 8 58 12 62 6 C68 18 62 26 50 30 Z" fill="${e.accent}" />
    <path d="M36 28 C30 20 32 12 40 8 C36 16 40 22 44 24 Z" fill="${e.accent}" opacity="0.8" />`,stormFin:e=>`
    <path d="M50 0 C66 12 72 26 68 34 L32 34 C28 26 34 12 50 0 Z" fill="${e.accent}" />
    <path d="M50 6 L50 32 M40 16 L40 32 M60 16 L60 32" stroke="${e.belly}" stroke-width="2.4" opacity="0.7" />`,crystal:e=>`
    <path d="M22 44 L28 16 L36 44 Z" fill="${e.accent}" opacity="0.85" />
    <path d="M64 44 L72 20 L80 44 Z" fill="${e.accent}" opacity="0.85" />
    <path d="M42 34 L50 2 L58 34 Z" fill="${e.accent}" />`,foliageCrown:e=>`
    <g fill="${e.accent}">
      <path d="M50 30 C50 14 58 4 72 0 C72 16 64 26 50 30 Z" />
      <path d="M50 32 C50 18 42 8 28 4 C28 20 36 28 50 32 Z" />
      <path d="M50 26 C50 12 50 4 50 -4 C56 6 56 16 50 26 Z" />
    </g>`,longFlop:e=>`
    <ellipse cx="14" cy="54" rx="10" ry="30" transform="rotate(-18 14 54)" />
    <ellipse cx="86" cy="54" rx="10" ry="30" transform="rotate(18 86 54)" />
    <ellipse cx="14" cy="58" rx="5" ry="20" fill="${e.belly}" transform="rotate(-18 14 58)" />
    <ellipse cx="86" cy="58" rx="5" ry="20" fill="${e.belly}" transform="rotate(18 86 58)" />`,moonHorns:e=>`
    <g fill="none" stroke="${e.accent}" stroke-width="7" stroke-linecap="round">
      <path d="M32 26 C18 18 18 4 30 0" /><path d="M68 26 C82 18 82 4 70 0" />
    </g>
    <circle cx="50" cy="8" r="6" fill="${e.accent}" opacity="0.8" />`,doubleRam:e=>`
    <g fill="none" stroke="${e.accent}" stroke-width="7" stroke-linecap="round">
      <path d="M30 30 C8 28 2 10 18 2 C32 -4 44 8 38 20 C34 26 28 24 28 18" />
      <path d="M70 30 C92 28 98 10 82 2 C68 -4 56 8 62 20 C66 26 72 24 72 18" />
    </g>`},w={mochi:{name:"Mochi",body:"round",texture:"smooth",topper:"roundears",eyes:"round",brows:"none",palette:["#ffd9e2","#fff1f4","#ff9ec0"],grows:["mane","tail"],signature:"bigEars"},bloop:{name:"Bloop",body:"bean",texture:"smooth",topper:"antenna",eyes:"sparkle",brows:"none",palette:["#a5d8ff","#e3f2ff","#5fb3f5"],grows:["tail","wings"],signature:"antennaArray"},pip:{name:"Pip",body:"tall",texture:"fluffy",topper:"tuft",eyes:"oval",brows:"arched",palette:["#b2f2d7","#e6fff5","#4fd6a0"],grows:["crest","plume"],signature:"tallTuft"},waddle:{name:"Waddle",body:"wide",texture:"smooth",topper:"none",eyes:"beady",brows:"thick",palette:["#ffe9a8","#fff8dd","#f7b955"],grows:["tail","mane"],signature:"crownSpikes"},puff:{name:"Puff",body:"round",texture:"fluffy",topper:"ears",eyes:"lashed",brows:"arched",palette:["#d9c8ff","#f2ecff","#a884f5"],grows:["mane","wings"],signature:"longEars"},nibbles:{name:"Nibbles",body:"tall",texture:"smooth",topper:"rabbit",eyes:"round",brows:"worried",palette:["#ffd0b0","#fff0e5","#f79a63"],grows:["wings","plume"],signature:"hugeRabbit"},snug:{name:"Snug",body:"wide",texture:"fluffy",topper:"roundears",eyes:"sleepy",brows:"bushy",palette:["#cfe6c0","#eefae6","#8cc472"],grows:["wings","crest"],signature:"ramCurl"},glim:{name:"Glim",body:"pear",texture:"smooth",topper:"horn",eyes:"sparkle",brows:"thick",palette:["#ffc2b8","#fff0ed","#ff8a75"],grows:["finback","wings"],signature:"twinHorns"},noodle:{name:"Noodle",body:"tall",texture:"smooth",topper:"antlers",eyes:"beady",brows:"worried",palette:["#9fe5e0","#e4fbfa","#48c4bc"],grows:["finback","tail"],signature:"bigAntlers"},fizz:{name:"Fizz",body:"chunky",texture:"spiky",topper:"tuft",eyes:"sparkle",brows:"none",palette:["#ffc7ea","#fff0fa","#f778c4"],grows:["crest","plume"],signature:"flameCrest"},cloudlet:{name:"Cloudlet",body:"wide",texture:"fluffy",topper:"fin",eyes:"oval",brows:"none",palette:["#c9dcff","#eef4ff","#7ba2f0"],grows:["finback","crest"],signature:"stormFin"},pebble:{name:"Pebble",body:"round",texture:"smooth",topper:"none",eyes:"sleepy",brows:"thick",palette:["#dcd6e8","#f4f1f9","#a99cc4"],grows:["plume","mane"],signature:"crystal"},sprout:{name:"Sprout",body:"pear",texture:"smooth",topper:"leaf",eyes:"round",brows:"arched",palette:["#c4e8a0","#eefada","#82c44e"],grows:["mane","crest"],signature:"foliageCrown"},bubs:{name:"Bubs",body:"round",texture:"smooth",topper:"floppy",eyes:"lashed",brows:"none",palette:["#f0c2d8","#fdeef5","#d97fae"],grows:["tail","mane"],signature:"longFlop"},zzz:{name:"Zzz",body:"bean",texture:"fluffy",topper:"hound",eyes:"sleepy",brows:"worried",palette:["#bcc4f0","#e8ebfd","#7d8be0"],grows:["plume","tail"],signature:"moonHorns"},tumble:{name:"Tumble",body:"chunky",texture:"spiky",topper:"ram",eyes:"oval",brows:"bushy",palette:["#ffdcb0","#fff4e4","#f0a552"],grows:["crest","finback"],signature:"doubleRam"}},Re=[["mochi","bloop","pip","waddle"],["puff","nibbles","snug","glim"],["noodle","fizz","cloudlet","pebble"],["sprout","bubs","zzz","tumble"]];function Q(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t}function j(e,t){var o;const r=((o=Z.find(a=>a.minutes.includes(t)))==null?void 0:o.id)??0,n=Re[r]??Re[0];return n[Q(M(e,t))%n.length]}const sr=(e,t,r=x)=>{const n=B[r]??B[x],o=j(e,t),a=Q(`n${o}`)%n.length;return n[(a+fe(e,t))%n.length]},wn=(e,t=x)=>e.name||sr(e.h,e.m,t),H={eyewear:"none",hair:"none",facialHair:"none",markings:"none",accessory:"none"},lr=(e,t)=>{var r;return(((r=w[e])==null?void 0:r.grows)??[]).slice(0,Math.max(0,Math.min(t,V)-1))};function ee(e,t=1){const r=e in w?e:"mochi",n=Math.max(1,Math.min(Math.round(t)||1,V));return{species:r,...w[r],...H,form:n,anatomy:lr(r,n),signature:n>=V?w[r].signature:null}}const cr=[["eyewear",["roundSpecs","squareSpecs","goggles","monocle","starShades"]],["hair",["fringe","cowlick","topknot","cap","bow","flower"]],["facialHair",["moustache","beard","whiskers","teeth","snout"]],["accessory",["scarf","bandana","bowtie","backpack"]]],Ze=Object.keys(rt),ir=71;function je(e){const t=cr.map(([n,o])=>[n,n==="hair"&&e?o.filter(a=>!er.has(a)):o]),r=[{...H}];for(const[n,o]of t)for(const a of o)r.push({...H,[n]:a});for(let n=0;n<t.length;n+=1)for(let o=n+1;o<t.length;o+=1)for(const a of t[n][1])for(const l of t[o][1])r.push({...H,[t[n][0]]:a,[t[o][0]]:l});return r}const fr={crowned:je(!0),free:je(!1)},pr=e=>{var t;return Vt.has((t=w[e])==null?void 0:t.topper)},dr=e=>fr[pr(e)?"crowned":"free"],z=new Map;for(const e of[...Je].sort((t,r)=>t.h-r.h||t.m-r.m)){const t=j(e.h,e.m);z.has(t)||z.set(t,[]),z.get(t).push(e.id)}const hr=e=>z.get(e)??[],fe=(e,t)=>Math.max(0,hr(j(e,t)).indexOf(M(e,t))),Mn=e=>ur(e.h,e.m,J(e.feeds??0)||1);function ur(e,t,r=1){const n=j(e,t),o=fe(e,t),a=dr(n);return{...ee(n,r),...a[o*ir%a.length],markings:Ze[o%Ze.length]}}const yr=e=>typeof e=="string"?ee(e):e??ee("mochi");function gr(e,t){const r=ve[e.eyes]??ve.round,n=ie.map((o,a)=>r(ce[a],o)).join("");return t==="sleep"?Jt(n):n}function $r(e,t){const r=Ce[e.brows]??Ce.none,{rot:n,dy:o}=Ae[t]??Ae.content;return ie.map((a,l)=>{const s=ce[l],p=r(s,a);return p?`<g transform="translate(0 ${o}) rotate(${a===-1?n:-n} ${s} 37)">${p}</g>`:""}).join("")}function Ln(e,{mood:t="content",className:r="",title:n=""}={}){const o=yr(e),[a,l,s]=o.palette,p={body:a,belly:l,accent:s},h=Me[o.body]??Me.round,d=(Le[o.texture]??Le.smooth)(h.halo),g=Math.max(1,Math.min(o.form??1,3)),u=o.signature&&Oe[o.signature]?Oe[o.signature](p):(Se[o.topper]??Se.none)(s),k=(o.anatomy??[]).map(D=>Fe[D]?Fe[D](p):"").join(""),ft=n||o.name||"pet",T=(D,ht,ut)=>(D[ht]??D[ut])(p),pt=T(Xt,o.eyewear,"none"),dt=T(tr,o.hair,"none"),ue=T(rr,o.facialHair,"none"),ye=T(rt,o.markings,"none"),ge=T(nr,o.accessory,"none");return`
<svg class="pet form-${g} ${r}" viewBox="0 0 100 100" role="img" aria-label="${ft}" focusable="false">
  ${n?`<title>${n}</title>`:""}
  <g class="pet-grow" transform="${or(g)}">
  <g class="pet-inner">
    <g fill="${o.texture==="spiky"?s:a}">${d}</g>
    <g fill="${s}">${k}</g>
    <g fill="${s}">${u}</g>
    ${ge.back}
    <g fill="${s}">${Wt}</g>
    <g class="pet-body" fill="${a}">${h.shape}</g>
    <ellipse cx="50" cy="64" rx="21" ry="17" fill="${l}" />
    ${ye.back}${ue.back}
    <g class="pet-face" transform="${ar(g)}">
      ${gr(o,t)}
      ${pt.front}
      ${dt.front}
      ${$r(o,t)}
      <ellipse cx="27" cy="62" rx="7" ry="4.2" fill="${s}" opacity="0.55" />
      <ellipse cx="73" cy="62" rx="7" ry="4.2" fill="${s}" opacity="0.55" />
      ${ye.front}
      ${Ee[t]??Ee.content}
      ${ue.front}
    </g>
    ${ge.front}
  </g>
  </g>
</svg>`}function Sn(e,{className:t="",title:r="A chilly egg"}={}){const n=w[e]??w.mochi,[o,a,l]=n.palette;return`
<svg class="pet egg ${t}" viewBox="0 0 100 100" role="img" aria-label="${r}" focusable="false">
  <title>${r}</title>
  <g class="pet-inner">
    <path class="egg-shell" fill="${o}"
      d="M50 12 C68 12 80 40 80 58 C80 78 66 90 50 90 C34 90 20 78 20 58 C20 40 32 12 50 12 Z" />
    <ellipse cx="41" cy="62" rx="15" ry="18" fill="${a}" opacity="0.75" />
    <circle cx="61" cy="40" r="6" fill="${l}" opacity="0.65" />
    <circle cx="36" cy="34" r="4.5" fill="${l}" opacity="0.65" />
    <circle cx="66" cy="68" r="5" fill="${l}" opacity="0.5" />
    <circle cx="44" cy="78" r="3.5" fill="${l}" opacity="0.5" />
  </g>
</svg>`}function vn(e,t,{size:r=34}={}){const o=K(50,50,24,e%12*30+t*.5),a=K(50,50,36,t*6),l=Array.from({length:12},(s,p)=>{const h=K(50,50,41,p*30);return`<circle cx="${h.x.toFixed(1)}" cy="${h.y.toFixed(1)}" r="2.6" />`}).join("");return`
<svg class="collar-clock" width="${r}" height="${r}" viewBox="0 0 100 100" role="img"
     aria-label="${M(e,t)}" focusable="false">
  <circle cx="50" cy="50" r="46" class="collar-face" />
  <g class="collar-ticks">${l}</g>
  <line x1="50" y1="50" x2="${o.x.toFixed(1)}" y2="${o.y.toFixed(1)}" class="collar-hand hour" />
  <line x1="50" y1="50" x2="${a.x.toFixed(1)}" y2="${a.y.toFixed(1)}" class="collar-hand minute" />
  <circle cx="50" cy="50" r="5" class="collar-pin" />
</svg>`}function Cn(e,t,{napping:r=!1}={}){return r?"sleep":e.hatchedAt===null?"content":e.phase==="learning"?e.lapses>0?"droopy":"content":e.dueAt<=t?"hungry":"happy"}const pe="pet-zoo/v1",de=1,kr=400;function A(e){return{version:de,createdAt:e,lastPlayedAt:e,reviewClock:0,tier:0,settings:{sound:!0,haptics:!0,language:x,playMinutes:se,showDigital:!1},session:{startedAt:0,answered:0,correct:0,napUntil:0},stats:{totalAnswered:0,totalCorrect:0,streak:0,bestStreak:0,daysPlayed:[]},items:{}}}const ot=e=>new Date(e).toISOString().slice(0,10);function An(e,t=G()){try{const r=t==null?void 0:t.getItem(pe);if(!r)return A(e);const n=JSON.parse(r);return!n||n.version!==de||typeof n.items!="object"?A(e):{...A(e),...n,settings:{...A(e).settings,...n.settings},items:at(n.items)}}catch{return A(e)}}function at(e){const t={};for(const[r,n]of Object.entries(e??{}))t[r]=typeof(n==null?void 0:n.feeds)=="number"?n:{...n,feeds:(n==null?void 0:n.reps)||(n!=null&&n.hatchedAt?1:0)};return t}function mr(e,t=G()){try{return t==null||t.setItem(pe,JSON.stringify(e)),!0}catch{return!1}}function En(e=G()){try{e==null||e.removeItem(pe)}catch{}}function G(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function Tn(e=G()){let t=null,r=null;const n=()=>{clearTimeout(t),t=null,r&&mr(r,e),r=null};return{save(o){r=o,t===null&&(t=setTimeout(n,kr))},flush:n}}function Dn(e,t){const r=ot(t),n=e.stats.daysPlayed;return n[n.length-1]===r?e:{...e,stats:{...e.stats,daysPlayed:[...n.slice(-59),r]}}}const st="pet-zoo",lt=1,te="petzoo1:";class S extends Error{constructor(t){super(t),this.name="TransferError",this.key=t}}function In(e,t){return{app:st,format:lt,version:de,exportedAt:t,createdAt:e.createdAt,lastPlayedAt:e.lastPlayedAt,reviewClock:e.reviewClock,tier:e.tier,stats:e.stats,items:e.items}}const br=e=>JSON.stringify(e,null,2),Nn=e=>`pet-zoo-${ot(e)}.json`,_e=32768;function xr(e){let t="";for(let r=0;r<e.length;r+=_e)t+=String.fromCharCode(...e.subarray(r,r+_e));return btoa(t)}function wr(e){const t=atob(e),r=new Uint8Array(t.length);for(let n=0;n<t.length;n+=1)r[n]=t.charCodeAt(n);return r}function Fn(e){const t=new TextEncoder().encode(br(e));return te+xr(t)}const U=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);function On(e){const t=String(e??"").trim();if(!t)throw new S("transfer.badFile");let r=t;if(t.startsWith(te))try{const o=t.slice(te.length).replace(/\s+/g,"");r=new TextDecoder().decode(wr(o))}catch{throw new S("transfer.badFile")}let n;try{n=JSON.parse(r)}catch{throw new S("transfer.badFile")}if(!U(n))throw new S("transfer.badFile");if(n.app!==st)throw new S("transfer.badApp");if(!(n.format<=lt))throw new S("transfer.badVersion");if(!U(n.items))throw new S("transfer.badFile");return{...n,items:Mr(n.items)}}function Mr(e){const t={};for(const[r,n]of Object.entries(e)){if(!U(n))continue;const{h:o,m:a}=n;!Number.isInteger(o)||o<1||o>12||!Number.isInteger(a)||a<0||a>59||a%q!==0||r===M(o,a)&&(t[r]=n)}return at(t)}const Rn=e=>Object.values(e).filter(t=>t.hatchedAt!==null&&t.hatchedAt!==void 0).length;function Zn(e,t,r){const n=A(r);return{...n,createdAt:t.createdAt??n.createdAt,lastPlayedAt:t.lastPlayedAt??r,reviewClock:Number.isFinite(t.reviewClock)?t.reviewClock:0,tier:Number.isFinite(t.tier)?t.tier:0,stats:{...n.stats,...U(t.stats)?t.stats:{}},items:t.items,settings:e.settings,session:n.session}}const L={w:200,h:120},i=62,m=96,jn={x0:40,x1:160},O={x0:62,x1:138},_n=46,c=e=>Number(e.toFixed(2));function he(e){let t=Math.floor(e)%2147483647+1;return t<=0&&(t+=2147483646),()=>(t=t*48271%2147483647,(t-1)/2147483646)}const E={dawn:{sky:["#f6b98a","#ffe6cd"],orb:"sun",orbFill:"#ffd27a",glow:"#ffd9a8",veil:"rgba(255, 176, 120, 0.16)",night:!1},morning:{sky:["#a8dcff","#e8f6ff"],orb:"sun",orbFill:"#ffe293",glow:"#fff3c4",veil:"rgba(255, 246, 214, 0.10)",night:!1},noon:{sky:["#8ecfff","#e4f4ff"],orb:"sun",orbFill:"#fff2a8",glow:"#fffbdd",veil:"rgba(255, 255, 255, 0.06)",night:!1},afternoon:{sky:["#ffcf96","#fff0d6"],orb:"sun",orbFill:"#ffc860",glow:"#ffe0a5",veil:"rgba(255, 190, 120, 0.13)",night:!1},dusk:{sky:["#7f6bc4","#ffb493"],orb:"sun",orbFill:"#ff9d6e",glow:"#ffc7a0",veil:"rgba(120, 96, 190, 0.18)",night:!1},night:{sky:["#2f3f7a","#6a7cb8"],orb:"moon",orbFill:"#fdf8dc",glow:"#cfd8ff",veil:"rgba(40, 52, 110, 0.26)",night:!0}},Pn=Object.keys(E);function Lr(e){const t=(Math.round(e)%24+24)%24;return t>=5&&t<7?"dawn":t>=7&&t<11?"morning":t>=11&&t<14?"noon":t>=14&&t<17?"afternoon":t>=17&&t<20?"dusk":"night"}function ct(e){const t=(Math.round(e)%24+24)%24,n=(t>=5&&t<19?(t-5)/14:((t<5?t+24:t)-19)/10)*Math.PI;return{x:c(100-Math.cos(n)*52),y:c(i-12-Math.sin(n)*34)}}function Sr(e,t,r,n){const o=E[e]??E.noon,a=ct(t),l=he(r+17),s=`
    <circle cx="${a.x}" cy="${a.y}" r="22" fill="url(#${n}-glow)" />
    ${o.orb==="moon"?`<circle cx="${a.x}" cy="${a.y}" r="7.5" fill="${o.orbFill}" />
           <circle cx="${c(a.x+2.6)}" cy="${c(a.y-2)}" r="1.5" fill="#e8e0bd" opacity="0.7" />
           <circle cx="${c(a.x-1.8)}" cy="${c(a.y+2.4)}" r="1.1" fill="#e8e0bd" opacity="0.6" />`:`<circle cx="${a.x}" cy="${a.y}" r="9" fill="${o.orbFill}" />`}`;return o.night?`${Array.from({length:34},()=>{const d=c(l()*200),g=c(l()**1.6*(i-6)),u=c(.5+l()*.9);return`<circle cx="${d}" cy="${g}" r="${u}" fill="#fdf8dc" opacity="${c(.35+l()*.5)}" />`}).join("")}${s}`:`${Array.from({length:3},(h,d)=>{const g=c(18+l()*150),u=c(8+l()*28),k=c(.7+l()*.7);return`<g transform="translate(${g} ${u}) scale(${k})" fill="#ffffff" opacity="${c(.5+d*.08)}">
      <ellipse cx="0" cy="0" rx="13" ry="6" />
      <circle cx="-5" cy="-2.5" r="6" />
      <circle cx="4.5" cy="-3.5" r="7.5" />
    </g>`}).join("")}${s}`}const Pe={hills:e=>`
    <ellipse cx="34" cy="${i+4}" rx="60" ry="22" fill="${e.farDark}" />
    <ellipse cx="132" cy="${i+2}" rx="74" ry="26" fill="${e.far}" />
    <ellipse cx="86" cy="${i+8}" rx="52" ry="18" fill="${e.farDark}" opacity="0.7" />`,treeline:e=>{const t=Array.from({length:13},(r,n)=>{const o=c(2+n*16.2),a=c(13+n*7%5*2.6);return`<path d="M${o} ${i+3} L${c(o+5.2)} ${c(i+3-a)} L${c(o+10.4)} ${i+3} Z" />`}).join("");return`<g fill="${e.farDark}">${t}</g>
      <rect x="0" y="${i}" width="200" height="8" fill="${e.far}" opacity="0.55" />`},sea:e=>`
    <rect x="0" y="${i-16}" width="200" height="26" fill="${e.water}" />
    <rect x="0" y="${i-16}" width="200" height="3" fill="${e.waterLight}" opacity="0.7" />
    <ellipse cx="100" cy="${i+6}" rx="120" ry="10" fill="${e.waterLight}" opacity="0.45" />`,dunes:e=>`
    <ellipse cx="40" cy="${i+6}" rx="66" ry="20" fill="${e.far}" />
    <ellipse cx="150" cy="${i+3}" rx="70" ry="17" fill="${e.farDark}" />`,peaks:e=>`
    <path d="M-6 ${i+4} L38 ${i-30} L82 ${i+4} Z" fill="${e.farDark}" />
    <path d="M52 ${i+4} L104 ${i-38} L156 ${i+4} Z" fill="${e.far}" />
    <path d="M132 ${i+4} L172 ${i-24} L212 ${i+4} Z" fill="${e.farDark}" />
    <path d="M104 ${i-38} L92 ${i-24} L104 ${i-27} L116 ${i-22} Z" fill="#ffffff" opacity="0.85" />`,arch:e=>`
    <ellipse cx="62" cy="${i+3}" rx="52" ry="17" fill="${e.farDark}" />
    <ellipse cx="146" cy="${i+4}" rx="58" ry="19" fill="${e.far}" />
    <ellipse cx="104" cy="${i+1}" rx="21" ry="15" fill="${e.glowDeep}" />
    <ellipse cx="104" cy="${i+2}" rx="13" ry="9" fill="${e.glow}" opacity="0.7" />`,cloudbank:e=>`
    <g fill="${e.far}">
      <ellipse cx="42" cy="${i+6}" rx="54" ry="17" />
      <ellipse cx="146" cy="${i+3}" rx="60" ry="15" />
      <circle cx="70" cy="${i-4}" r="13" />
      <circle cx="128" cy="${i-6}" r="15" />
    </g>`},He=`M0 ${i+2}
   C 34 ${i-4}, 68 ${i+6}, 100 ${i+1}
   C 136 ${i-5}, 170 ${i+5}, 200 ${i}`;function vr(e,t){return`
    <path d="${He} L200 120 L0 120 Z" fill="url(#${t}-ground)" />
    <path d="${He}" fill="none" stroke="${e.groundRim}" stroke-width="1.4" opacity="0.55" />
    <path d="M0 ${m+4}
             C 46 ${m-2}, 120 ${m+7}, 200 ${m}
             L200 120 L0 120 Z"
          fill="${e.groundNear}" opacity="0.55" />`}const ze={grass:(e,t)=>Array.from({length:26},()=>{const r=c(t()*200),n=c(i+6+t()*50),o=c(2.6+t()*3.4);return`<path d="M${r} ${n} q${c(.8+t())} ${-o} ${c(1.8+t())} ${c(-o*.6)}" stroke="${e.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55" />`}).join(""),fern:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),n=c(i+8+t()*48),o=c(.6+t()*.6);return`<g transform="translate(${r} ${n}) scale(${o})" fill="${e.leafDark}" opacity="0.5">
        <ellipse cx="-3" cy="-2" rx="4" ry="1.6" transform="rotate(-25 -3 -2)" />
        <ellipse cx="3" cy="-2" rx="4" ry="1.6" transform="rotate(25 3 -2)" />
        <ellipse cx="0" cy="-4.5" rx="3.4" ry="1.5" />
      </g>`}).join(""),shells:(e,t)=>Array.from({length:18},()=>{const r=c(t()*200),n=c(i+10+t()*46),o=c(1.1+t()*1.5);return`<ellipse cx="${r}" cy="${n}" rx="${o}" ry="${c(o*.7)}" fill="${e.bloom}" opacity="0.6" />`}).join(""),pebbles:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),n=c(i+8+t()*48),o=c(1+t()*1.8);return`<ellipse cx="${r}" cy="${n}" rx="${o}" ry="${c(o*.65)}" fill="${e.stone}" opacity="0.5" />`}).join(""),lily:(e,t)=>Array.from({length:9},()=>{const r=c(t()*200),n=c(i+10+t()*42),o=c(3+t()*2.6);return`<g transform="translate(${r} ${n})">
        <circle r="${o}" fill="${e.leaf}" opacity="0.8" />
        <path d="M0 0 L${o} ${c(-o*.4)} A${o} ${o} 0 0 0 ${c(o*.7)} ${c(o*.7)} Z" fill="${e.groundNear}" opacity="0.5" />
      </g>`}).join(""),snow:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),n=c(i+8+t()*48),o=c(2.4+t()*3.4);return`<ellipse cx="${r}" cy="${n}" rx="${o}" ry="${c(o*.5)}" fill="#ffffff" opacity="0.75" />`}).join(""),spores:(e,t)=>Array.from({length:22},()=>{const r=c(t()*200),n=c(i-4+t()*56),o=c(.8+t()*1.4);return`<circle cx="${r}" cy="${n}" r="${o}" fill="${e.glow}" opacity="${c(.35+t()*.45)}" />`}).join(""),sparkle:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),n=c(i+2+t()*52),o=c(.8+t()*1.3);return`<circle cx="${r}" cy="${n}" r="${o}" fill="#ffffff" opacity="${c(.4+t()*.4)}" />`}).join("")},re={tree:e=>`
    <path d="M-3 0 L-2.2 -13 L2.2 -13 L3 0 Z" fill="${e.wood}" />
    <circle cx="0" cy="-19" r="10.5" fill="${e.leafDark}" />
    <circle cx="-6" cy="-15.5" r="7.4" fill="${e.leaf}" />
    <circle cx="6.5" cy="-16.5" r="8" fill="${e.leaf}" />
    <circle cx="0" cy="-23.5" r="7" fill="${e.leaf}" />`,pine:e=>`
    <path d="M-2.2 0 L-1.6 -7 L1.6 -7 L2.2 0 Z" fill="${e.wood}" />
    <path d="M0 -22 L9.5 -6.5 L-9.5 -6.5 Z" fill="${e.leafDark}" />
    <path d="M0 -30 L7 -16 L-7 -16 Z" fill="${e.leaf}" />`,snowpine:e=>`
    <path d="M-2.2 0 L-1.6 -7 L1.6 -7 L2.2 0 Z" fill="${e.wood}" />
    <path d="M0 -22 L9.5 -6.5 L-9.5 -6.5 Z" fill="${e.leafDark}" />
    <path d="M0 -30 L7 -16 L-7 -16 Z" fill="${e.leaf}" />
    <path d="M0 -30 L4.4 -21.5 Q0 -19 -4.4 -21.5 Z" fill="#ffffff" />
    <path d="M-9.5 -6.5 Q-4 -9 0 -6.5 Q4 -9 9.5 -6.5 Z" fill="#ffffff" opacity="0.9" />`,palm:e=>`
    <path d="M-2 0 Q-1.4 -11 3.6 -20 L6.4 -19 Q1.8 -10 2 0 Z" fill="${e.wood}" />
    <g transform="translate(5 -20)" fill="${e.leaf}">
      <ellipse cx="9" cy="0" rx="9" ry="3.3" transform="rotate(-16)" />
      <ellipse cx="-9" cy="0" rx="9" ry="3.3" transform="rotate(16)" />
      <ellipse cx="7.5" cy="0" rx="8" ry="3" transform="rotate(-54)" />
      <ellipse cx="-7.5" cy="0" rx="8" ry="3" transform="rotate(54)" />
      <circle cx="0" cy="-1" r="2.4" fill="${e.leafDark}" />
    </g>`,bush:e=>`
    <ellipse cx="0" cy="-3" rx="11" ry="7" fill="${e.leafDark}" />
    <circle cx="-4.5" cy="-6.5" r="5.6" fill="${e.leaf}" />
    <circle cx="4" cy="-7.5" r="6.2" fill="${e.leaf}" />
    <circle cx="0" cy="-10" r="4.6" fill="${e.leaf}" />`,flowers:e=>`
    <g stroke="${e.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round">
      <path d="M-4 0 q-1 -5 -1.6 -8" /><path d="M0 0 q1 -6 1.4 -10" /><path d="M4.5 0 q0.6 -4 0.4 -7" />
    </g>
    <circle cx="-5.6" cy="-8.6" r="2.6" fill="${e.bloom}" />
    <circle cx="1.4" cy="-10.6" r="3" fill="${e.accent}" />
    <circle cx="4.9" cy="-7.2" r="2.3" fill="${e.bloom}" />
    <circle cx="-5.6" cy="-8.6" r="0.9" fill="#fff8e0" />
    <circle cx="1.4" cy="-10.6" r="1" fill="#fff8e0" />`,reeds:e=>`
    <g stroke="${e.leafDark}" stroke-width="1.3" fill="none" stroke-linecap="round">
      <path d="M-4 0 q-1.4 -8 -2 -13" /><path d="M0 0 q0.6 -9 0.8 -15" /><path d="M4 0 q1.6 -7 2.4 -11" />
    </g>
    <rect x="-7" y="-17.5" width="2.6" height="5.4" rx="1.3" fill="${e.wood}" />
    <rect x="-0.5" y="-19.5" width="2.8" height="5.8" rx="1.4" fill="${e.wood}" />`,rock:e=>`
    <path d="M-9 0 Q-10 -6 -4.5 -8.4 Q0 -10.6 4.6 -8 Q9.6 -5.4 8.8 0 Z" fill="${e.stone}" />
    <path d="M-4.5 -8.4 Q0 -10.6 4.6 -8 Q1 -6.6 -4.5 -8.4 Z" fill="${e.stoneLight}" opacity="0.8" />`,mushroom:e=>`
    <path d="M-2.4 0 Q-2.8 -5 -2 -7.4 L2 -7.4 Q2.8 -5 2.4 0 Z" fill="#f6efe2" />
    <path d="M-8.4 -7 Q-8.4 -14.6 0 -14.6 Q8.4 -14.6 8.4 -7 Z" fill="${e.bloom}" />
    <circle cx="-3.4" cy="-10" r="1.7" fill="#fff8e0" opacity="0.9" />
    <circle cx="2.6" cy="-11.4" r="1.3" fill="#fff8e0" opacity="0.9" />
    <ellipse cx="0" cy="-7" rx="8.4" ry="1.6" fill="${e.glow}" opacity="0.55" />`,crystal:e=>`
    <path d="M-6 0 L-3.4 -13 L0 -16 L1.6 0 Z" fill="${e.glowDeep}" />
    <path d="M1.6 0 L0 -16 L4.4 -11 L6.6 0 Z" fill="${e.glow}" />
    <path d="M-3.4 -13 L0 -16 L1.6 0 Z" fill="#ffffff" opacity="0.35" />`,cactus:e=>`
    <rect x="-4" y="-19" width="8" height="19" rx="4" fill="${e.leaf}" />
    <path d="M-4 -11 q-5 0 -5 4 l0 3 q0 1.6 1.8 1.6 q1.8 0 1.8 -1.6 l0 -2.4 q0 -1.6 1.4 -1.6 Z" fill="${e.leafDark}" />
    <path d="M4 -14 q5 0 5 4 l0 4 q0 1.6 -1.8 1.6 q-1.8 0 -1.8 -1.6 l0 -3.4 q0 -1.6 -1.4 -1.6 Z" fill="${e.leafDark}" />
    <circle cx="0" cy="-20" r="2.4" fill="${e.bloom}" />`,snowdrift:()=>`
    <ellipse cx="0" cy="-1" rx="12" ry="5.4" fill="#ffffff" />
    <ellipse cx="-3.5" cy="-4.4" rx="6.4" ry="3.6" fill="#ffffff" />
    <ellipse cx="4" cy="-3.4" rx="5" ry="2.8" fill="#f2f7ff" />`,cloudpuff:()=>`
    <ellipse cx="0" cy="-3" rx="13" ry="5.4" fill="#ffffff" />
    <circle cx="-5" cy="-6.4" r="6" fill="#ffffff" />
    <circle cx="4.6" cy="-7.4" r="7" fill="#fbfdff" />`},Hn=Object.keys(re),Cr=e=>`
  <ellipse cx="0" cy="-1" rx="14" ry="5.6" fill="${e.nestDark}" />
  <ellipse cx="0" cy="-3" rx="11.6" ry="4.4" fill="${e.nest}" />
  <ellipse cx="0" cy="-3.6" rx="8.4" ry="2.8" fill="${e.nestLight}" />`,Be={bush:[[-5.4,-9.4],[5.2,-10.4],[-.2,-14.2]],tree:[[-6.4,-18],[6.6,-19.2],[0,-23.4]],basket:[[-4.6,-7.2],[4.6,-7.8],[0,-10.4]],coral:[[-5,-11.4],[4.2,-9],[.4,-15.2]]},Ue={bush:e=>`
    <ellipse cx="0" cy="-4" rx="12.6" ry="8" fill="${e.leafDark}" />
    <circle cx="-5.2" cy="-8.4" r="6.4" fill="${e.leaf}" />
    <circle cx="5" cy="-9.4" r="7" fill="${e.leaf}" />
    <circle cx="0" cy="-12.6" r="5.4" fill="${e.leaf}" />`,tree:e=>`
    <path d="M-3.2 0 L-2.4 -14 L2.4 -14 L3.2 0 Z" fill="${e.wood}" />
    <circle cx="0" cy="-20" r="11" fill="${e.leafDark}" />
    <circle cx="-6.4" cy="-16.4" r="7.6" fill="${e.leaf}" />
    <circle cx="6.6" cy="-17.4" r="8.2" fill="${e.leaf}" />`,basket:e=>`
    <path d="M-11 -1 Q-11 -11 0 -11 Q11 -11 11 -1 Z" fill="${e.wood}" />
    <path d="M-11 -7 L11 -7" stroke="${e.stoneLight}" stroke-width="1.2" opacity="0.5" />
    <path d="M-8.4 -11 Q0 -20 8.4 -11" stroke="${e.wood}" stroke-width="1.8" fill="none" />`,coral:e=>`
    <path d="M0 0 q-1 -8 -5 -11 q4 0 6 4 q1 -7 5 -10 q1 6 -2 11 q3 -3 6 -3 q-3 4 -6 9 Z" fill="${e.bloom}" />
    <circle cx="-5" cy="-11" r="2.2" fill="${e.accent}" />`},ne={berry:e=>`
    <circle cx="-1.6" cy="0.8" r="3" fill="${e.accent}" />
    <circle cx="2" cy="-0.4" r="3.4" fill="${e.bloom}" />
    <circle cx="1.1" cy="-1.4" r="1" fill="#fff8e0" opacity="0.8" />
    <path d="M2 -3.6 q2.6 -2.4 4.4 -1.4 q-1 2.6 -4 2.6 Z" fill="${e.leaf}" />`,apple:e=>`
    <circle cx="0" cy="0.4" r="4" fill="${e.accent}" />
    <circle cx="-1.4" cy="-1.2" r="1.2" fill="#fff8e0" opacity="0.75" />
    <path d="M0 -3.4 l0.4 -2.6" stroke="${e.wood}" stroke-width="1.1" stroke-linecap="round" />
    <path d="M0.6 -5.2 q2.8 -1.8 4.2 -0.4 q-1.4 2.2 -4.2 1.4 Z" fill="${e.leaf}" />`,melon:e=>`
    <circle cx="0" cy="0" r="4.2" fill="${e.leaf}" />
    <path d="M-2.6 -3.3 q0.8 3.4 0 6.6 M0.4 -4.2 q1 4.2 0 8.4" stroke="${e.leafDark}" stroke-width="1" fill="none" />
    <path d="M0 -4.2 l0.6 -2" stroke="${e.wood}" stroke-width="1.1" stroke-linecap="round" />`,carrot:e=>`
    <path d="M-2.6 -2 L2.6 -2 L0.4 5.4 Z" fill="${e.accent}" />
    <path d="M-1.4 -0.4 L1.6 -0.4 M-0.9 1.4 L1.1 1.4" stroke="#ffffff" stroke-width="0.7" opacity="0.45" />
    <g fill="${e.leaf}">
      <ellipse cx="-1.8" cy="-3.6" rx="2.2" ry="1.2" transform="rotate(-34 -1.8 -3.6)" />
      <ellipse cx="1.8" cy="-3.6" rx="2.2" ry="1.2" transform="rotate(34 1.8 -3.6)" />
      <ellipse cx="0" cy="-4.6" rx="1.2" ry="2.2" />
    </g>`,fish:e=>`
    <ellipse cx="0.4" cy="0" rx="4.4" ry="2.8" fill="${e.accent}" />
    <path d="M-3.6 0 L-6.6 -2.6 L-6.6 2.6 Z" fill="${e.bloom}" />
    <circle cx="2.2" cy="-0.7" r="0.8" fill="#43354f" />
    <path d="M0.4 -2.8 q1.6 -1.4 3 -0.4" stroke="${e.bloom}" stroke-width="1" fill="none" />`,glowberry:e=>`
    <circle cx="0" cy="0" r="5" fill="${e.glow}" opacity="0.45" />
    <circle cx="0" cy="0" r="3.2" fill="${e.glowDeep}" />
    <circle cx="-1.1" cy="-1.1" r="1.1" fill="#ffffff" opacity="0.85" />`,starfruit:e=>`
    <path d="M0 -4.6 L1.4 -1.4 L4.6 -1.4 L2.1 0.7 L3.1 3.9 L0 2 L-3.1 3.9 L-2.1 0.7 L-4.6 -1.4 L-1.4 -1.4 Z"
          fill="${e.bloom}" />
    <circle cx="0" cy="-0.2" r="1.1" fill="#fff8e0" opacity="0.8" />`},zn=Object.keys(ne),Ar=e=>`
  <circle cx="0" cy="0" r="5" fill="${e.ballA}" />
  <path d="M-5 0 a5 5 0 0 1 10 0 Z" fill="${e.ballB}" />
  <circle cx="-1.7" cy="-1.9" r="1.4" fill="#ffffff" opacity="0.7" />`,Er=e=>`
  <ellipse cx="0" cy="0" rx="7.4" ry="2.6" fill="${e.leafDark}" opacity="0.45" />`;function Tr(e,t,r=12){const n=he(t+91);return Array.from({length:r},(o,a)=>{const l=c(20+n()*160),s=c(i-10+n()*52),p=c(.9+n()*1.1),h=c(n()*6),d=c(4+n()*7);return`<circle class="hab-mote" cx="${l}" cy="${s}" r="${p}" fill="${e.glow}"
      style="--mote-delay:${h}s; --mote-drift:${d}px" />`}).join("")}const Dr=e=>Math.max(0,Math.min(255,Math.round(e))),qe=e=>{const t=String(e).replace("#",""),r=t.length===3?t.split("").map(n=>n+n).join(""):t;return[parseInt(r.slice(0,2),16)||0,parseInt(r.slice(2,4),16)||0,parseInt(r.slice(4,6),16)||0]},Ir=e=>`#${e.map(t=>Dr(t).toString(16).padStart(2,"0")).join("")}`;function b(e,t,r){const n=Math.max(0,Math.min(1,r)),[o,a,l]=qe(e),[s,p,h]=qe(t);return Ir([o+(s-o)*n,a+(p-a)*n,l+(h-l)*n])}const Qe={dawn:{color:"#ffb47e",amount:.2},morning:{color:"#fffbe8",amount:.08},noon:{color:"#ffffff",amount:.03},afternoon:{color:"#ffc474",amount:.2},dusk:{color:"#7f66c0",amount:.3},night:{color:"#33437e",amount:.44}},Nr={far:"#8fc06a",farDark:"#6ea54f",ground:["#a9d581","#7fbc5e"],groundNear:"#97ca70",leaf:"#7fc65c",leafDark:"#54a03c",wood:"#a87b52",stone:"#c6c0b2",stoneLight:"#e4dfd4",bloom:"#ffd7e6",accent:"#ff9ec0",nest:"#ecdcaa",nestDark:"#c9b47f",nestLight:"#f8f0cf",glow:"#fff0b0",glowDeep:"#ffd66b",water:"#7fc4e8",waterLight:"#c4e8f8"},R={meadow:{far:"hills",detail:"grass",larder:"bush",treat:"berry",scenery:["tree","bush","flowers","rock"],colors:{}},grove:{far:"treeline",detail:"fern",larder:"tree",treat:"apple",scenery:["pine","tree","mushroom","rock"],colors:{far:"#5f9d55",farDark:"#3f7a41",ground:["#8cc474","#5f9c55"],groundNear:"#7ab266",leaf:"#63b061",leafDark:"#3d8845",wood:"#8a6242",bloom:"#ffd08a"}},pond:{far:"hills",detail:"lily",larder:"bush",treat:"apple",scenery:["reeds","bush","flowers","rock"],colors:{far:"#87c69a",farDark:"#63a97e",ground:["#9ed3a4","#6fb894"],groundNear:"#8fcc9e",leaf:"#6fc08c",leafDark:"#46976a",bloom:"#ffe4a8"}},shore:{far:"sea",detail:"shells",larder:"coral",treat:"fish",scenery:["palm","rock","bush","flowers"],colors:{far:"#f0dcb0",farDark:"#dcbe94",ground:["#f6e6bd","#e6cf9a"],groundNear:"#f2dfb0",leaf:"#78c47e",leafDark:"#519a5c",wood:"#b9885a",stone:"#e0d6c0",stoneLight:"#f4ecdc",bloom:"#ffc0a8",water:"#5fbfe4",waterLight:"#bde8f6"}},dune:{far:"dunes",detail:"pebbles",larder:"basket",treat:"melon",scenery:["cactus","rock","flowers","bush"],colors:{far:"#f2d49a",farDark:"#dcb87c",ground:["#f8e2ae","#e8c78c"],groundNear:"#f4dca4",leaf:"#8cc078",leafDark:"#5f9455",wood:"#c08c58",stone:"#dccbaa",stoneLight:"#f2e7cd",bloom:"#ffb3c8"}},snowfield:{far:"peaks",detail:"snow",larder:"basket",treat:"carrot",scenery:["snowpine","snowdrift","rock","snowpine"],colors:{far:"#bcd0ea",farDark:"#93aed2",ground:["#eef5ff","#cfe0f4"],groundNear:"#e4eeff",leaf:"#5f9c78",leafDark:"#417a5c",wood:"#8a6a52",stone:"#c8d4e6",stoneLight:"#eaf1fa",bloom:"#c8dcff",glow:"#dbeaff",glowDeep:"#9fc4f0"}},glowvale:{far:"arch",detail:"spores",larder:"bush",treat:"glowberry",scenery:["mushroom","crystal","rock","bush"],colors:{far:"#6a5a94",farDark:"#4a3f70",ground:["#8f7fbc","#6b5c96"],groundNear:"#8474ae",leaf:"#7fc4a8",leafDark:"#4f9a80",wood:"#7a5f8e",stone:"#a89cc4",stoneLight:"#cfc6e4",bloom:"#c8a0ff",glow:"#a8f0e0",glowDeep:"#5fd8c4"}},cloudtop:{far:"cloudbank",detail:"sparkle",larder:"basket",treat:"starfruit",scenery:["cloudpuff","crystal","flowers","cloudpuff"],colors:{far:"#d2e0fa",farDark:"#b0c6ec",ground:["#e2ecff","#c2d4f0"],groundNear:"#d6e4fb",leaf:"#8ec8ea",leafDark:"#6aa6d6",wood:"#b0a8cc",stone:"#c8d6ee",stoneLight:"#e6eefc",bloom:"#ffd9f0",glow:"#fff0c8",glowDeep:"#ffd98a"}}},Bn=Object.keys(R),Fr={sprout:"meadow",bubs:"pond",zzz:"snowfield",tumble:"dune",mochi:"meadow",bloop:"pond",pebble:"snowfield",nibbles:"dune",pip:"grove",snug:"grove",noodle:"grove",cloudlet:"shore",waddle:"shore",glim:"glowvale",fizz:"glowvale",puff:"cloudtop"},Or=e=>Fr[e]??"meadow",Ge=[{pieces:[[78,.56],[124,.6],[36,.86],[176,1.3]],larder:52,ball:78,nest:126},{pieces:[[86,.55],[118,.58],[166,.88],[26,1.26]],nest:74,ball:122,larder:148},{pieces:[[74,.52],[128,.62],[34,.9],[178,1.22]],larder:150,ball:124,nest:78},{pieces:[[90,.6],[112,.54],[168,.84],[24,1.28]],nest:120,ball:80,larder:54},{pieces:[[80,.58],[130,.53],[38,.94],[174,1.24]],larder:56,ball:82,nest:128},{pieces:[[88,.54],[120,.6],[164,.8],[30,1.3]],nest:72,ball:118,larder:146},{pieces:[[76,.57],[126,.52],[32,.88],[180,1.22]],larder:148,ball:120,nest:76}],Un={x0:66,x1:134},qn={x0:88,x1:112},Rr=3;function Zr(e,t){const r=[e.nest,e.larder,e.ball];let n=100,o=-1/0;for(let a=t.x0+12;a<=t.x1-12;a+=2){const s=Math.min(...r.map(p=>Math.abs(a-p)))-Math.abs(a-100)*.4;s>o&&(o=s,n=a)}return n}const jr=e=>c(i+10+(e-.5)*40),it=(e,t,r)=>Math.max(t,Math.min(r,e)),_r=6,Pr=20,Hr=4;function zr(e,t){const r=e%12,n=Q(`t${M(e,t)}`)%Hr,o=p=>p>=_r&&p<=Pr,a=o(r)===o(r+12)?n%2===1:o(r+12)!==(n===0),l=r+(a?12:0),s=Lr(l);return{hour24:l,pm:a,phase:s,night:E[s].night,orb:ct(l)}}function Br(e,t,r){var d;const n=w[e]??w.mochi,[o,a,l]=n.palette,s={...Nr,...((d=R[t])==null?void 0:d.colors)??{}},p=Qe[r]??Qe.noon,h=(g,u=.1)=>b(b(g,l,u),p.color,p.amount);return{far:h(s.far),farDark:h(s.farDark),ground:[h(s.ground[0],.12),h(s.ground[1],.12)],groundNear:h(s.groundNear,.14),groundRim:b(h(s.ground[0],.12),"#2b2440",.34),leaf:h(s.leaf),leafDark:h(s.leafDark),wood:h(s.wood,.07),stone:h(s.stone,.07),stoneLight:h(s.stoneLight,.05),water:h(s.water,.07),waterLight:h(s.waterLight,.05),bloom:b(b(s.bloom,o,.42),p.color,p.amount*.5),accent:b(l,p.color,p.amount*.4),nest:b(s.nest,a,.45),nestDark:b(s.nestDark,l,.32),nestLight:b(s.nestLight,a,.5),glow:s.glow,glowDeep:s.glowDeep,ballA:l,ballB:a}}function Ur(e,t){const r=j(e,t),n=Or(r),o=R[n],a=fe(e,t),l=zr(e,t),s=Ge[a*Rr%Ge.length],p=Q(`hab${M(e,t)}`)%1e5,h=s.pieces.map(([g,u],k)=>({id:o.scenery[(a+k)%o.scenery.length],x:g,scale:u,y:jr(u),flip:(a+k)%2===1})),d=(Be[o.larder]??Be.bush).map(([g,u])=>({x:c(s.larder+g),y:c(m+u)}));return{id:M(e,t),species:r,biome:n,light:l,palette:Br(r,n,l.phase),scenery:h,props:{nest:{x:s.nest,y:m},ball:{x:s.ball,y:m},larder:{x:s.larder,y:m,kind:o.larder,treat:o.treat,spots:d}},home:{x:Zr(s,O),y:m},roam:{...O},seed:p}}function Qn(e){const t=Ur(e.h,e.m),r=e==null?void 0:e.habitat;return!r||typeof r!="object"?t:{...t,...r,palette:{...t.palette,...r.palette??{}},props:{...t.props,...r.props??{}},light:{...t.light,...r.light??{}}}}const qr=(e,t,r,n,o,a)=>{const l=re[e]??re.bush,s=o?`scale(${-n} ${n})`:`scale(${n})`;return`<g transform="translate(${t} ${r}) ${s}">${l(a)}</g>`};function Gn(e,{uid:t="h",label:r="",sleeping:n=!1}={}){const o=e.palette,a=E[e.light.phase]??E.noon,l=he(e.seed+3),s=R[e.biome]??R.meadow,p=e.scenery.filter(u=>u.y<=m),h=e.scenery.filter(u=>u.y>m),d=u=>u.map(k=>qr(k.id,k.x,k.y,k.scale,k.flip,o)).join(""),g=e.light.night||e.biome==="glowvale";return`
<svg class="habitat" viewBox="0 0 ${L.w} ${L.h}" preserveAspectRatio="xMidYMax slice"
     role="img" aria-label="${r}" focusable="false">
  <defs>
    <linearGradient id="${t}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a.sky[0]}" />
      <stop offset="1" stop-color="${a.sky[1]}" />
    </linearGradient>
    <linearGradient id="${t}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${o.ground[0]}" />
      <stop offset="1" stop-color="${o.ground[1]}" />
    </linearGradient>
    <radialGradient id="${t}-glow">
      <stop offset="0" stop-color="${a.glow}" stop-opacity="0.85" />
      <stop offset="1" stop-color="${a.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <g class="hab-sky">
    <rect x="0" y="0" width="${L.w}" height="${L.h}" fill="url(#${t}-sky)" />
    ${Sr(e.light.phase,e.light.hour24,e.seed,t)}
  </g>

  <g class="hab-far">${(Pe[s.far]??Pe.hills)(o)}</g>

  <g class="hab-ground">
    ${vr(o,t)}
    ${(ze[s.detail]??ze.grass)(o,l)}
  </g>

  <g class="hab-back">
    ${d(p)}
    <g transform="translate(${e.props.nest.x} ${e.props.nest.y})">${Cr(o)}</g>
    <g transform="translate(${e.props.ball.x} ${e.props.ball.y})">${Er(o)}</g>
    <g transform="translate(${e.props.larder.x} ${e.props.larder.y})">
      ${(Ue[e.props.larder.kind]??Ue.bush)(o)}
    </g>
  </g>

  <g class="hab-actors"></g>

  <g class="hab-front">${d(h)}</g>

  ${g?`<g class="hab-motes">${Tr(o,e.seed,n?8:14)}</g>`:""}

  <rect class="hab-veil" x="0" y="0" width="${L.w}" height="${L.h}" fill="${a.veil}" />
  <rect class="hab-dusk" x="0" y="0" width="${L.w}" height="${L.h}" fill="#1b1930" />
</svg>`}const Kn=(e,t)=>(ne[e]??ne.berry)(t),Yn=e=>Ar(e),Ke=5,Qr=330,Gr=.22,Kr=.54,Yr=.82,Ye=.62,We=26;function Wn(e,t,r){if(e.resting)return{...e,bounce:0};const n=it(t,0,.05),o=r.floor??m,a=r.ceiling??8,l=(r.x0??O.x0)+Ke,s=(r.x1??O.x1)-Ke;let p=e.vx*(1-Gr*n),h=e.vy+Qr*n,d=e.x+p*n,g=e.y+h*n,u=0;g>=o?(g=o,h>We?(u=h,h=-h*Kr,p*=Yr):(h=0,p*=.7)):g<=a&&(g=a,h=Math.abs(h)*.4),d<=l?(d=l,p=Math.abs(p)*Ye,u=Math.max(u,Math.abs(e.vx)*.6)):d>=s&&(d=s,p=-Math.abs(p)*Ye,u=Math.max(u,Math.abs(e.vx)*.6));const k=g>=o&&Math.abs(h)<=We&&Math.abs(p)<2;return{...e,x:d,y:g,vx:k?0:p,vy:k?0:h,spin:(e.spin??0)+p*n*7,resting:k,bounce:u}}function Vn(e,t=O,r=Math.random){const n=t.x1-t.x0,o=(e-t.x0)/n,a=o<.28?1:o>.72||r()<.5?-1:1,l=(.14+r()*.34)*n;return c(it(e+a*l,t.x0,t.x1))}export{tn as $,In as A,Ke as B,Fn as C,x as D,On as E,Zn as F,Rn as G,zt as H,Bt as I,gn as J,dn as K,$n as L,Cn as M,J as N,vn as O,_n as P,M as Q,fn as R,w as S,S as T,nn as U,cn as V,m as W,Dn as X,pn as Y,hn as Z,St as _,Gn as a,te as a$,ln as a0,j as a1,Z as a2,ae as a3,ee as a4,Mt as a5,Vr as a6,Wr as a7,v as a8,en as a9,an as aA,Et as aB,Y as aC,Me as aD,Le as aE,Se as aF,ve as aG,Ce as aH,ur as aI,dr as aJ,ir as aK,Vt as aL,er as aM,pr as aN,Xt as aO,tr as aP,rr as aQ,rt as aR,nr as aS,Ze as aT,W as aU,V as aV,nt as aW,lr as aX,Oe as aY,Fe as aZ,at as a_,rn as aa,Xr as ab,K as ac,Jr as ad,$t as ae,cr as af,Je as ag,Ur as ah,$e as ai,kt as aj,wt as ak,Lt as al,ke as am,It as an,xe as ao,Nt as ap,le as aq,Ut as ar,Qt as as,Gt as at,mr as au,pe as av,de as aw,sr as ax,B as ay,hr as az,Yn as b,lt as b0,Mr as b1,yt as b2,Or as b3,Bn as b4,Pn as b5,jn as b6,O as b7,Un as b8,Ge as b9,Zr as ba,jr as bb,Hn as bc,zr as bd,Lr as be,ct as bf,i as bg,b as bh,Br as bi,he as bj,zn as bk,fe as bl,oe as bm,Zt as bn,jt as bo,et as bp,Xe as bq,_t as br,Rt as bs,be as bt,Dt as bu,se as bv,qt as bw,st as bx,qn as by,it as c,Mn as d,Sn as e,Tn as f,sn as g,Qn as h,Yt as i,kn as j,yn as k,An as l,bn as m,Vn as n,xn as o,Ln as p,mn as q,un as r,Wn as s,Kn as t,wn as u,En as v,A as w,on as x,Nn as y,br as z};
