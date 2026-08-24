const It=[1,2,3,4,5,6,7,8,9,10,11,12],q=5,Nt=q*6,v=e=>(e%360+360)%360,A=(e,t)=>(e%t+t)%t,So=e=>v(e*6),Co=(e,t)=>v(A(e,12)*30+t*.5),Ft=(e,t)=>v(Math.atan2(e,-t)*180/Math.PI);function X(e,t,o,r){const n=r*Math.PI/180;return{x:e+o*Math.sin(n),y:t-o*Math.cos(n)}}function we(e,t){const o=Math.abs(v(e)-v(t));return o>180?360-o:o}const vo=e=>A(Math.round(v(e)/Nt)*q,60);function Ao(e,t){const o=A(Math.round((v(e)-t*.5)/30),12);return o===0?12:o}function Eo({dx:e,dy:t,radius:o,hourDeg:r,minuteDeg:n}){const a=Math.hypot(e,t)/o;if(a<.18||a>1.15)return null;if(a<.55)return"hour";if(a>.72)return"minute";const l=Ft(e,t);return we(l,r)<=we(l,n)?"hour":"minute"}const L=(e,t)=>`${e}:${String(t).padStart(2,"0")}`;function To(e){const[t,o]=String(e).split(":").map(Number);return{h:t,m:o}}function Rt(e,t){let o=(t-e)%60;return o>30&&(o-=60),o<-30&&(o+=60),o}function Do({h:e,m:t},o){const r=Rt(t,o),n=t+r;let a=e;return n>=60?a=e%12+1:n<0&&(a=e===1?12:e-1),{h:a,m:o,delta:r}}function Zt(e,t){const o=Math.abs(e-t)%60;return o>30?60-o:o}function Ot(e,t){const o=Math.abs(A(e,12)-A(t,12))%12;return o>6?12-o:o}function Io(e,t){const o=A(e.h,12)===A(t.h,12),r=e.m===t.m,n=Zt(e.m,t.m),a=Ot(e.h,t.h);let l;return o&&r?l="correct":r?l="hourOff":o?l="minuteOff":l="both",{verdict:l,correct:l==="correct",nearMiss:l!=="correct"&&n<=q&&a<=1,minuteDelta:n,hourDelta:a}}const _t=.8,_=[{id:0,minutes:[0]},{id:1,minutes:[30]},{id:2,minutes:[15,45]},{id:3,minutes:[5,10,20,25,35,40,50,55]}],K=_.length-1,st=new Map;for(const e of _)for(const t of e.minutes)st.set(t,e.id);const jt=e=>st.get(e)??null;function ie(e){const t=_[e];if(!t)return[];const o=[];for(const r of t.minutes)for(const n of It)o.push({h:n,m:r,id:L(n,r),tier:e});return o}const lt=_.flatMap(e=>ie(e.id));new Map(lt.map(e=>[e.id,e]));function Pt(e,t){const o=ie(t);return o.length?o.filter(n=>{var a;return((a=e[n.id])==null?void 0:a.phase)==="graduated"}).length/o.length:0}function Ht(e){let t=0;for(;t<K&&Pt(e,t)>=_t;)t+=1;return t}function Me(e,t){const o=[];for(let r=0;r<=Math.min(t,K);r+=1)for(const n of ie(r))e[n.id]||o.push(n);return o}const x="nb",Ut=[{id:"nb",label:"Norsk"},{id:"en",label:"English"}],No=e=>Ut.some(t=>t.id===e),Le={en:["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"],nb:["","ett","to","tre","fire","fem","seks","sju","åtte","ni","ti","elleve","tolv"]},zt={0:"o'clock",5:"five past",10:"ten past",15:"quarter past",20:"twenty past",25:"twenty-five past",30:"half past",35:"twenty-five to",40:"twenty to",45:"quarter to",50:"ten to",55:"five to"},Bt={0:{text:"klokka {h}",next:!1},5:{text:"fem over {h}",next:!1},10:{text:"ti over {h}",next:!1},15:{text:"kvart over {h}",next:!1},20:{text:"ti på halv {h}",next:!0},25:{text:"fem på halv {h}",next:!0},30:{text:"halv {h}",next:!0},35:{text:"fem over halv {h}",next:!0},40:{text:"ti over halv {h}",next:!0},45:{text:"kvart på {h}",next:!0},50:{text:"ti på {h}",next:!0},55:{text:"fem på {h}",next:!0}},Gt=e=>(e-1+12)%12+1,ee=(e,t)=>(Le[e]??Le[x])[Gt(t)];function Qt(e,t,o){if(e==="en"){const n=zt[o],a=ee("en",o>30?t+1:t);return o===0?`${a} ${n}`:`${n} ${a}`}const r=Bt[o];return r.text.replace("{h}",ee("nb",r.next?t+1:t))}const B={en:["Biscuit","Marmalade","Waffle","Pumpkin","Sprinkle","Doodle","Clover","Peanut","Nugget","Custard","Pickle","Bumble","Dandelion","Truffle","Cinnamon","Gumdrop","Blossom","Turnip","Jellybean","Muffin","Toast","Pancake","Wobble","Pudding","Cricket","Sundae","Butterbean","Hopscotch","Marshmallow","Tangerine","Pinecone","Bramble","Mittens","Popcorn","Whisker","Fern","Gingersnap","Nutmeg","Poppy","Sesame","Twiglet","Apricot","Cobweb","Domino","Fizzle","Hazelnut","Pebble","Snowdrop"],nb:["Vaffel","Kanelbolle","Blåbær","Pannekake","Smultring","Kakao","Marsipan","Karamell","Lakris","Rosin","Sukkerbit","Krumkake","Tyttebær","Multe","Kløver","Løvetann","Kongle","Furunål","Mose","Dugg","Snøfnugg","Måneskinn","Solstråle","Stjerneskudd","Regnbue","Tordensky","Bølge","Rullestein","Perle","Knappen","Tøffel","Votten","Lua","Dott","Lubben","Tuss","Prikken","Flekken","Bamse","Nøtta","Fnugg","Kvist","Bringebær","Solsikke","Tjukken","Sprett","Trilla","Nusse"]},F={en:{back:"← Back to games","nav.scenes":"Scenes","tab.play":"Feed","tab.zoo":"Zoo","sound.on":"Sound on","sound.off":"Sound off","settings.open":"Settings","clock.aria":"Drag the clock hands to set the time","prompt.booting":"Waking the zoo…","prompt.egg":"A chilly egg! It hatches at…","prompt.egg1":"The egg is stirring! It hatches at…","prompt.egg2":"It is cracking open! It hatches at…","prompt.forgot":"{name} forgot their snack time. It is…","prompt.hungry":"{name} is hungry! They eat at…","prompt.snack":"{name} fancies a snack at…","button.warm":"Warm the egg!","button.feed":"Feed {name}!","cheer.1":"Yes!","cheer.2":"Perfect!","cheer.3":"Spot on!","cheer.4":"Nailed it!","cheer.5":"That is it!","cheer.streak":"{cheer} {n} in a row!","crack.1":"A crack appeared!","crack.2":"Another crack — it is nearly out!","hatch.stir":"Something is moving in there…","hatch.now":"It hatched!","hatch.hello":"{name} says hello!","evolve.now":"Something is happening…","evolve.done":"{name} is now {label}!","form.2":"the Bold","form.3":"the Grand","teach.nearMiss":"So close! ","teach.hourExact":"At {hour} o’clock the short fat hand points straight at the {hour}.","teach.hourPastHalf":"The short fat hand is past halfway from the {hour} to the {next} — but it is still the {hour}.","teach.hourJustLeft":"Look at the short fat hand: at {time} it has just left the {hour}.","teach.minuteOClock":"At {hour} o’clock the long hand points straight up.","teach.minuteCountOne":"Count round in fives: {jumps} jump past the top is {minutes} minutes.","teach.minuteCountMany":"Count round in fives: {jumps} jumps past the top is {minutes} minutes.","teach.both":"Here is where both hands go for {time}.","nap.title":"Pets are sleeping!","nap.copy":"That was a good session. Everyone is having a nap — you can still visit them in the zoo.","nap.countdown":"Waking up in","nap.wake":"Wake the pets","nap.visit":"Visit the zoo","nap.sleeping":"sleeping","zoo.empty":"No pets yet! Feed the clock a few times and your first egg will hatch.","zoo.egg":"{species} egg","zoo.eggTitle":"A chilly egg","zoo.eggTitleCracks":"A cracking egg, {n} of {of} cracks","zoo.rename":"What is this pet called?","habitat.back":"Back to the zoo","habitat.rename":"Give this pet a new name","habitat.aria":"{name}'s home","habitat.eggAria":"The home waiting for a {species} egg","habitat.hint":"Throw the ball, share a snack, or stroke {name}.","habitat.eggHint":"This home is waiting. Feed the clock, and the egg will hatch.","habitat.sleeping":"{name} is fast asleep. Sshh.","unlock.title":"New pets have arrived!","unlock.copy":"{tier} — {blurb}","unlock.close":"Let’s go","howto.summary":"How to play","howto.1":"A pet tells you when it eats. Drag the clock hands to that time.","howto.2":"The <b>long thin hand</b> is the minutes — it jumps five minutes at a time. The <b>short fat hand</b> is the hour.","howto.3":"Watch the short hand creep along as you move the long one. At quarter past four it has already left the 4 — that is how a real clock works.","howto.4":"Get one right four times and its egg cracks open into a pet of your own.","howto.5":"After a few minutes the pets get sleepy and the game stops. You can still wander the zoo while they nap.","howto.6":"Grown-ups: press and hold the title for progress.","grownups.title":"Progress","grownups.answered":"Times answered","grownups.accuracy":"Correct first try","grownups.streak":"Best streak","grownups.hatched":"Pets hatched","grownups.days":"Days played","grownups.fine":"Times are scheduled with a spaced-repetition algorithm: each one comes back just as it is about to be forgotten. Everything is stored in this browser only.","grownups.close":"Close","grownups.reset":"Start over","grownups.resetConfirm":"Start over? Every pet and all progress will be lost.","settings.title":"Settings","settings.language":"Language","settings.playTime":"Play time","settings.playTimeValue":"{n} minutes","settings.playTimeHelp":"How long a session lasts before the pets need a nap. Short sessions work best — three to five minutes.","settings.digital":"Show digital time","settings.digitalHelp":"Off by default. With it off the pets say their feeding time in words only, so the clock face is the only place to read it.","settings.transfer":"Move to another device","settings.transferHelp":"Save the zoo as a file, or copy it as a code to send in a message. Opening either one on another device brings every pet across. The zoo already on that device is replaced.","settings.done":"Done","transfer.exportFile":"Save file","transfer.copyCode":"Copy code","transfer.importFile":"Open file…","transfer.pasteCode":"Paste code","transfer.pastePrompt":"Paste the code from the other device:","transfer.confirm":"Replace this device’s zoo with the one you are bringing in? The pets here now will be lost.","transfer.saved":"Saved {file}.","transfer.copied":"Code copied — paste it on the other device.","transfer.copyFailed":"Could not reach the clipboard, so the code was saved as a file instead.","transfer.imported":"Brought in {n} pets.","transfer.badFile":"That does not look like a Pet Zoo save.","transfer.badApp":"That save is from a different game.","transfer.badVersion":"That save comes from a newer Pet Zoo than this one.","coins.name":"gold coins","coins.balance":"{n} gold coins","coins.earned":"+{n}","shop.open":"Go to the shop","shop.title":"The zoo shop","shop.intro":"Something nice for one of your pets.","shop.forPet":"Shopping for {name}","shop.pickPet":"Whose home is it for?","shop.empty":"No pets yet! Hatch your first egg and the shop will open.","shop.locked":"Locked","shop.lockedHelp":"Learn more times to open this one.","shop.owned":"In {name}’s home","shop.full":"{name}’s home is full. Sell something to make room.","shop.tooDear":"Not enough coins yet.","shop.buy":"Buy it!","shop.cancel":"Not yet","shop.confirm":"{item} — put it in {name}’s home for {price} gold coins?","shop.bought":"{name} loves it!","shop.sell":"Sell it back","shop.sellConfirm":"{item} — sell it back? You get all {price} gold coins again.","shop.sold":"Sold — {price} gold coins back.","shop.close":"Done","shop.flowerbed":"Flower bed","shop.lantern":"Lantern","shop.house":"Little house","shop.swing":"Swing","shop.pond":"Pond","shop.hammock":"Hammock","shop.arch":"Flower arch","shop.windmill":"Windmill","tier.0.name":"O’clock","tier.0.blurb":"The big hand points straight up.","tier.1.name":"Half past","tier.1.blurb":"The big hand points straight down.","tier.2.name":"Quarter past and quarter to","tier.2.blurb":"The big hand points sideways.","tier.3.name":"Every five minutes","tier.3.blurb":"Count around the face in fives."},nb:{back:"← Tilbake til spillene","nav.scenes":"Visninger","tab.play":"Mate","tab.zoo":"Dyrehagen","sound.on":"Lyd på","sound.off":"Lyd av","settings.open":"Innstillinger","clock.aria":"Dra viserne for å stille klokka","prompt.booting":"Vekker dyrehagen…","prompt.egg":"Et kaldt egg! Det klekkes…","prompt.egg1":"Egget rører på seg! Det klekkes…","prompt.egg2":"Det slår sprekker! Det klekkes…","prompt.forgot":"{name} har glemt måltidet sitt. Klokka er…","prompt.hungry":"{name} er sulten! Spiser…","prompt.snack":"{name} vil gjerne ha en matbit…","button.warm":"Varm egget!","button.feed":"Mat {name}!","cheer.1":"Ja!","cheer.2":"Perfekt!","cheer.3":"Helt riktig!","cheer.4":"Sånn ja!","cheer.5":"Der satt den!","cheer.streak":"{cheer} {n} på rad!","crack.1":"Det kom en sprekk!","crack.2":"Enda en sprekk — det er nesten ute!","hatch.stir":"Noe rører seg der inne …","hatch.now":"Det klekket!","hatch.hello":"{name} sier hei!","evolve.now":"Noe skjer …","evolve.done":"{name} er nå {label}!","form.2":"den modige","form.3":"den store","teach.nearMiss":"Nesten! ","teach.hourExact":"Når klokka er {hour}, peker den korte tjukke viseren rett på {hourNum}-tallet.","teach.hourPastHalf":"Den korte tjukke viseren er mer enn halvveis fra {hourNum} til {next} — men timen er fortsatt {hourNum}.","teach.hourJustLeft":"Se på den korte tjukke viseren: {time} har den akkurat forlatt {hourNum}-tallet.","teach.minuteOClock":"Når klokka er {hour}, peker den lange viseren rett opp.","teach.minuteCountOne":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.minuteCountMany":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.both":"Her skal begge viserne stå når klokka er {time}.","nap.title":"Dyrene sover!","nap.copy":"Det var en god økt. Alle tar seg en blund — du kan fortsatt besøke dem i dyrehagen.","nap.countdown":"Våkner om","nap.wake":"Vekk dyrene","nap.visit":"Besøk dyrehagen","nap.sleeping":"sover","zoo.empty":"Ingen dyr ennå! Still klokka riktig noen ganger, så klekkes det første egget ditt.","zoo.egg":"{species}-egg","zoo.eggTitle":"Et kaldt egg","zoo.eggTitleCracks":"Et egg som slår sprekker, {n} av {of}","zoo.rename":"Hva heter dette dyret?","habitat.back":"Tilbake til dyrehagen","habitat.rename":"Gi dyret et nytt navn","habitat.aria":"Hjemmet til {name}","habitat.eggAria":"Hjemmet som venter på et {species}-egg","habitat.hint":"Kast ballen, gi en godbit, eller klapp {name}.","habitat.eggHint":"Dette hjemmet venter. Still klokka riktig, så klekkes egget.","habitat.sleeping":"{name} sover godt. Hysj.","unlock.title":"Nye dyr har kommet!","unlock.copy":"{tier} — {blurb}","unlock.close":"Kom igjen!","howto.summary":"Slik spiller du","howto.1":"Et dyr sier når det spiser. Dra viserne til det klokkeslettet.","howto.2":"Den <b>lange tynne viseren</b> er minuttene — den hopper fem minutter om gangen. Den <b>korte tjukke viseren</b> er timen.","howto.3":"Se hvordan den korte viseren sniker seg framover når du flytter den lange. Kvart over fire har den allerede forlatt 4-tallet — sånn funker en ekte klokke.","howto.4":"Klarer du samme klokkeslett fire ganger, sprekker egget til et dyr som blir ditt.","howto.5":"Etter noen minutter blir dyrene trøtte, og spillet stopper. Du kan fortsatt gå rundt i dyrehagen mens de sover.","howto.6":"Voksne: hold inne tittelen for å se framgang.","grownups.title":"Framgang","grownups.answered":"Klokkeslett svart på","grownups.accuracy":"Riktig på første forsøk","grownups.streak":"Beste rekke","grownups.hatched":"Dyr klekket","grownups.days":"Dager spilt","grownups.fine":"Klokkeslettene planlegges med en gjentakelsesalgoritme: hvert av dem kommer tilbake akkurat når det holder på å bli glemt. Alt lagres bare i denne nettleseren.","grownups.close":"Lukk","grownups.reset":"Start på nytt","grownups.resetConfirm":"Starte på nytt? Alle dyr og all framgang forsvinner.","settings.title":"Innstillinger","settings.language":"Språk","settings.playTime":"Spilletid","settings.playTimeValue":"{n} minutter","settings.playTimeHelp":"Hvor lenge en økt varer før dyrene må sove. Korte økter funker best — tre til fem minutter.","settings.digital":"Vis digital tid","settings.digitalHelp":"Av til vanlig. Når den er av, sier dyrene måltidet sitt bare med ord, så urskiva er eneste stedet å lese det.","settings.transfer":"Flytt til en annen enhet","settings.transferHelp":"Lagre dyrehagen som en fil, eller kopier den som en kode du kan sende i en melding. Åpner du en av delene på en annen enhet, blir alle dyrene med. Dyrehagen som allerede er der, blir erstattet.","settings.done":"Ferdig","transfer.exportFile":"Lagre fil","transfer.copyCode":"Kopier kode","transfer.importFile":"Åpne fil …","transfer.pasteCode":"Lim inn kode","transfer.pastePrompt":"Lim inn koden fra den andre enheten:","transfer.confirm":"Erstatte dyrehagen på denne enheten med den du henter inn? Dyrene som er her nå, forsvinner.","transfer.saved":"Lagret {file}.","transfer.copied":"Koden er kopiert — lim den inn på den andre enheten.","transfer.copyFailed":"Fikk ikke tak i utklippstavla, så koden ble lagret som fil i stedet.","transfer.imported":"Hentet inn {n} dyr.","transfer.badFile":"Dette ser ikke ut som en lagret dyrehage.","transfer.badApp":"Den lagringa er fra et annet spill.","transfer.badVersion":"Den lagringa er fra en nyere utgave av Dyrehagen enn denne.","coins.name":"gullmynter","coins.balance":"{n} gullmynter","coins.earned":"+{n}","shop.open":"Gå til butikken","shop.title":"Dyrehagebutikken","shop.intro":"Noe fint til ett av dyra dine.","shop.forPet":"Handler til {name}","shop.pickPet":"Hvem skal det være til?","shop.empty":"Ingen dyr ennå! Klekk det første egget, så åpner butikken.","shop.locked":"Låst","shop.lockedHelp":"Lær flere klokkeslett for å åpne denne.","shop.owned":"Hjemme hos {name}","shop.full":"Det er fullt hos {name}. Selg noe for å få plass.","shop.tooDear":"Ikke nok mynter ennå.","shop.buy":"Kjøp!","shop.cancel":"Ikke nå","shop.confirm":"{item} — sette den hjemme hos {name} for {price} gullmynter?","shop.bought":"{name} elsker den!","shop.sell":"Selg tilbake","shop.sellConfirm":"{item} — selge den tilbake? Du får alle {price} gullmyntene igjen.","shop.sold":"Solgt — {price} gullmynter tilbake.","shop.close":"Ferdig","shop.flowerbed":"Blomsterbed","shop.lantern":"Lykt","shop.house":"Lite hus","shop.swing":"Huske","shop.pond":"Dam","shop.hammock":"Hengekøye","shop.arch":"Blomsterbue","shop.windmill":"Vindmølle","tier.0.name":"Hele timer","tier.0.blurb":"Den lange viseren peker rett opp.","tier.1.name":"Halve timer","tier.1.blurb":"Den lange viseren peker rett ned.","tier.2.name":"Kvart over og kvart på","tier.2.blurb":"Den lange viseren peker til siden.","tier.3.name":"Hvert femte minutt","tier.3.blurb":"Tell rundt skiva i femmere."}},Fo=e=>Object.keys(F[e]??{}),qt=(e,t)=>t?String(e).replace(/\{(\w+)\}/g,(o,r)=>Object.prototype.hasOwnProperty.call(t,r)?String(t[r]):o):String(e);function Ro(e){const t=F[e]??F[x],o=F[x],r=(n,a)=>qt(t[n]??o[n]??n,a);return r.lang=F[e]?e:x,r.spoken=(n,a)=>Qt(r.lang,n,a),r.hourWord=n=>ee(r.lang,n),r.names=B[r.lang]??B[x],r}const Se=[1,3,8],Kt=2,Yt=3,Wt=7,Vt=4,Jt=2,ct=e=>Math.min(Math.max(e-1,0),Jt),te=[1,3,5],re=te.length;function G(e){let t=0;for(let o=0;o<te.length;o+=1)e>=te[o]&&(t=o+1);return t}const Xt=2.5,it=1.3,ft=2.8,er=.2,tr=60,Ce=864e5,pt=(e,t,o)=>Math.min(Math.max(e,t),o);function Zo({h:e,m:t,species:o,reviewClock:r=0}){return{h:e,m:t,tier:jt(t)??0,species:o,name:null,phase:"learning",step:0,dueStep:r+1,ease:Xt,intervalDays:0,dueAt:0,reps:0,feeds:0,lapses:0,correctStreak:0,cracks:0,hatchedAt:null,seen:0,lastMs:0}}function rr({correct:e,ms:t=0,reversals:o=0}){return e?t>2e4||o>=2?3:t>8e3||o>=1?4:5:0}const or=(e,t)=>pt(e+(.1-(5-t)*(.08+(5-t)*.02)),it,ft),nr=(e,t,o)=>e<=1?1:e===2?3:Math.min(Math.round(t*o),tr);function Oo(e,{correct:t,ms:o=0,reversals:r=0,reviewClock:n,now:a}){const l=rr({correct:t,ms:o,reversals:r}),s={...e,seen:e.seen+1,lastMs:o},i={quality:l,graduated:!1,hatched:!1,lapsed:!1,evolved:0,cracked:0};if(t){if(s.correctStreak=e.correctStreak+1,e.hatchedAt===null){const u=Math.max(e.cracks??0,ct(s.correctStreak));u>(e.cracks??0)&&(i.cracked=u),s.cracks=u}if(e.phase==="learning"){const u=e.hatchedAt===null?Vt:Yt;s.correctStreak>=u?(s.phase="graduated",s.reps=1,s.feeds=e.feeds+1,s.intervalDays=1,s.dueAt=a+Ce,s.dueStep=null,i.graduated=!0,s.hatchedAt===null&&(s.hatchedAt=a,i.hatched=!0)):(s.step=Math.min(e.step+1,Se.length-1),s.dueStep=n+Se[s.step])}else s.ease=or(e.ease,l),s.reps=e.reps+1,s.feeds=e.feeds+1,s.intervalDays=nr(s.reps,e.intervalDays,s.ease),s.dueAt=a+s.intervalDays*Ce}else s.correctStreak=0,s.step=0,s.dueStep=n+Kt,e.phase==="graduated"&&(s.phase="learning",s.ease=pt(e.ease-er,it,ft),s.lapses=e.lapses+1,s.dueAt=0,s.intervalDays=0,s.reps=0,i.lapsed=!0);const d=G(e.feeds),h=G(s.feeds);return d>=1&&h>d&&(i.evolved=h),{item:s,events:i}}const oe=e=>e.phase==="learning",ar=(e,t)=>e.phase==="graduated"&&e.dueAt<=t,sr=e=>Object.values(e).filter(oe).length,P=e=>(t,o)=>e(t[1])-e(o[1]);function _o(e,{now:t,exclude:o=null}={}){var d;const r=e.reviewClock+1,n=Object.entries(e.items).filter(([h])=>h!==o),a=n.filter(([,h])=>oe(h)&&h.dueStep!==null&&h.dueStep<=r).sort(P(h=>h.dueStep));if(a.length)return a[0][0];const l=n.filter(([,h])=>ar(h,t)).sort(P(h=>h.dueAt));if(l.length)return l[0][0];if(sr(e.items)<Wt){const h=Me(e.items,e.tier)[0];if(h)return h.id}const s=n.filter(([,h])=>h.phase==="graduated").sort(P(h=>h.dueAt));if(s.length)return s[0][0];const i=n.filter(([,h])=>oe(h)).sort(P(h=>h.seen));return i.length?i[0][0]:o&&e.items[o]?o:((d=Me(e.items,K)[0])==null?void 0:d.id)??L(1,0)}function jo(e){const t=Math.max(e.tier,Ht(e.items));return{tier:t,unlocked:t>e.tier}}const fe=5,lr=2,cr=15,ir=.6,fr=5,pr=120*1e3,dr=1800*1e3,hr=(e,t,o)=>Math.min(Math.max(e,t),o);function ur(e){const t=Math.round(Number(e)),o=hr(Number.isFinite(t)?t:fe,lr,cr),r=o*60*1e3;return{minutes:o,hardMs:r,softMs:Math.round(r*ir),maxQuestions:o*fr}}const pe=ur(fe);function Po(e){return{startedAt:e,answered:0,correct:0,napUntil:0}}const Z=(e,t)=>Math.max(0,t-((e==null?void 0:e.startedAt)??t));function Ho(e,{now:t,correct:o,limits:r=pe}){return e.answered>=r.maxQuestions?"count":Z(e,t)>=r.hardMs?"hard":o&&Z(e,t)>=r.softMs?"soft":null}const Uo=(e,t,o=pe)=>Z(e,t)>=o.hardMs,zo=e=>!!(e!=null&&e.startedAt),Bo=(e,t)=>Z(e,t)>=dr,Go=(e,t)=>({...e,napUntil:t+pr}),Qo=(e,t)=>!!(e!=null&&e.napUntil)&&t<e.napUntil,qo=(e,t)=>Math.max(0,((e==null?void 0:e.napUntil)??0)-t),Ko=(e,t,o=pe)=>Math.min(1,Z(e,t)/o.hardMs);function Yo(e){const t=Math.ceil(e/1e3);return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}const p="#43354f",de=[37,63],ve=52,he=[-1,1],Ae={round:{shape:'<ellipse cx="50" cy="54" rx="34" ry="32" />',halo:{cx:50,cy:54,rx:34,ry:32}},tall:{shape:'<ellipse cx="50" cy="52" rx="28" ry="34" />',halo:{cx:50,cy:52,rx:28,ry:34}},wide:{shape:'<ellipse cx="50" cy="58" rx="38" ry="28" />',halo:{cx:50,cy:58,rx:38,ry:28}},pear:{shape:'<path d="M50 22 C66 22 72 38 74 54 C76 72 66 86 50 86 C34 86 24 72 26 54 C28 38 34 22 50 22 Z" />',halo:{cx:50,cy:55,rx:25,ry:32}},bean:{shape:'<path d="M53 20 C71 20 81 37 79 56 C77 76 63 86 47 86 C30 86 21 71 21 54 C21 34 35 20 53 20 Z" />',halo:{cx:50,cy:53,rx:29,ry:33}},chunky:{shape:'<path d="M50 20 C74 20 86 34 86 55 C86 76 71 86 50 86 C29 86 14 76 14 55 C14 34 26 20 50 20 Z" />',halo:{cx:50,cy:53,rx:36,ry:33}}},gr=`
  <ellipse cx="35" cy="85" rx="10" ry="6" />
  <ellipse cx="65" cy="85" rx="10" ry="6" />`,H=(e,t,o=1)=>{const r=t*Math.PI/180;return{x:e.cx+Math.sin(r)*e.rx*o,y:e.cy-Math.cos(r)*e.ry*o}},Ee={smooth:()=>"",fluffy:e=>Array.from({length:18},(t,o)=>{const r=H(e,o*20,1);return`<circle cx="${r.x.toFixed(1)}" cy="${r.y.toFixed(1)}" r="7" />`}).join(""),spiky:e=>Array.from({length:5},(t,o)=>{const r=-70+o*22,n=H(e,r-9,.97),a=H(e,r+9,.97),l=H(e,r,1.22);return`<path d="M${n.x.toFixed(1)} ${n.y.toFixed(1)} L${l.x.toFixed(1)} ${l.y.toFixed(1)} L${a.x.toFixed(1)} ${a.y.toFixed(1)} Z" />`}).join("")},yr=new Set(["horn","fin","antenna","tuft","leaf","antlers","rabbit"]),Te={none:()=>"",roundears:()=>'<circle cx="26" cy="30" r="13" /><circle cx="74" cy="30" r="13" />',ears:()=>`
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
    <path d="M50 30 C48 20 52 16 50 10" fill="none" stroke="${p}" stroke-width="3" stroke-linecap="round" />
    <circle cx="50" cy="8" r="6" fill="${e}" />`,tuft:()=>'<circle cx="41" cy="24" r="8" /><circle cx="50" cy="16" r="9" /><circle cx="59" cy="24" r="8" />',leaf:e=>`
    <path d="M50 28 C50 16 56 8 66 6 C66 18 60 26 50 28 Z" fill="${e}" />
    <path d="M50 30 C50 20 46 14 38 12 C38 22 42 28 50 30 Z" fill="${e}" />`},k="#ffffff",De={round:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9.5" ry="10.5" fill="${p}" />
    <circle cx="${e-3.2}" cy="47.5" r="3.6" fill="${k}" />
    <circle cx="${e+3}" cy="56" r="1.8" fill="${k}" opacity="0.85" />`,oval:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="6.8" ry="11.5" fill="${p}" />
    <circle cx="${e-2.4}" cy="47" r="2.9" fill="${k}" />
    <circle cx="${e+2}" cy="56.5" r="1.4" fill="${k}" opacity="0.85" />`,sleepy:e=>`
    <path class="pet-eye" d="M${e-9} 50 Q${e} 45.5 ${e+9} 50 Q${e} 63.5 ${e-9} 50 Z" fill="${p}" />
    <circle cx="${e-3}" cy="53.5" r="3.2" fill="${k}" />
    <circle cx="${e+3.4}" cy="57" r="1.5" fill="${k}" opacity="0.85" />`,sparkle:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9" ry="11" fill="${p}" />
    <path d="M${e-3} 43 Q${e-2} 47 ${e+1.5} 48 Q${e-2} 49 ${e-3} 53
             Q${e-4} 49 ${e-7.5} 48 Q${e-4} 47 ${e-3} 43 Z" fill="${k}" />
    <circle cx="${e+3.5}" cy="56.5" r="1.9" fill="${k}" opacity="0.85" />`,lashed:(e,t)=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="8" ry="10.5" fill="${p}" />
    <circle cx="${e-2.6}" cy="47.5" r="3" fill="${k}" />
    <path d="M${e+t*7} 46 l${t*5.5} -4" stroke="${p}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*8.2} 50 l${t*6} -1.6" stroke="${p}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*7.6} 54 l${t*5.6} 1.8" stroke="${p}" stroke-width="2.4" stroke-linecap="round" fill="none" />`,beady:e=>`
    <circle class="pet-eye" cx="${e}" cy="52" r="5.6" fill="${p}" />
    <circle cx="${e-1.8}" cy="50" r="2.1" fill="${k}" />`},kr=e=>`<g transform="translate(0 ${ve}) scale(1 0.08) translate(0 ${-ve})">${e}</g>`+he.map((t,o)=>{const r=de[o];return`<path d="M${r-9} 52 Q${r} 58.5 ${r+9} 52" fill="none" stroke="${p}"
                  stroke-width="3.2" stroke-linecap="round" />`}).join(""),Ie={none:()=>"",thick:(e,t)=>`<path d="M${e+t*8.5} 35.5 L${e-t*8} 35" stroke="${p}" stroke-width="4" stroke-linecap="round" fill="none" />`,arched:e=>`<path d="M${e-8.5} 37.5 Q${e} 30.5 ${e+8.5} 37.5" stroke="${p}" stroke-width="3.2" stroke-linecap="round" fill="none" />`,worried:(e,t)=>`<path d="M${e+t*8.5} 38.5 L${e-t*8.5} 33.5" stroke="${p}" stroke-width="3.4" stroke-linecap="round" fill="none" />`,bushy:e=>`<path d="M${e-9} 36.5 Q${e} 29.5 ${e+9} 36.5" stroke="${p}" stroke-width="5.6" stroke-linecap="round" fill="none" />`},Ne={happy:{rot:0,dy:-2.5},content:{rot:0,dy:0},hungry:{rot:-2,dy:-3.5},droopy:{rot:-9,dy:1.5},sleep:{rot:-4,dy:1}},Fe={happy:`<path d="M41 66 C45 75 55 75 59 66" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,content:`<path d="M44 67 C47 72 53 72 56 67" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,hungry:`<ellipse cx="50" cy="69" rx="7" ry="8" fill="${p}" />
           <ellipse cx="50" cy="73" rx="4.5" ry="3.5" fill="#ff9ec0" />`,droopy:`<path d="M43 71 C46 65 54 65 57 71" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,sleep:`<path d="M44 68 C47 73 53 73 56 68" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`},y=e=>({back:"",front:e}),R=(e,t)=>({back:e,front:t}),Re=(e,t,o)=>Array.from({length:10},(r,n)=>{const a=(n*36-90)*Math.PI/180,l=n%2?o*.45:o;return`${(e+Math.cos(a)*l).toFixed(1)} ${(t+Math.sin(a)*l).toFixed(1)}`}).join(" L"),$r={none:()=>y(""),roundSpecs:e=>y(`
      <g fill="${k}" fill-opacity="0.35" stroke="${p}" stroke-width="2.6">
        <circle cx="37" cy="52" r="12.5" /><circle cx="63" cy="52" r="12.5" />
      </g>
      <path d="M49.5 52 H50.5 M24.5 50 L16 47 M75.5 50 L84 47" stroke="${p}"
            stroke-width="2.6" stroke-linecap="round" fill="none" />`),squareSpecs:e=>y(`
      <g fill="${k}" fill-opacity="0.35" stroke="${p}" stroke-width="3.2">
        <rect x="24.5" y="41" width="25" height="22" rx="6" />
        <rect x="50.5" y="41" width="25" height="22" rx="6" />
      </g>
      <path d="M49.5 51 H50.5 M24 46 L16 44 M76 46 L84 44" stroke="${p}"
            stroke-width="3" stroke-linecap="round" fill="none" />`),goggles:e=>y(`
      <path d="M18 48 H82" stroke="${e.accent}" stroke-width="7" stroke-linecap="round" />
      <g fill="${k}" fill-opacity="0.4" stroke="${p}" stroke-width="3">
        <circle cx="37" cy="52" r="13.5" /><circle cx="63" cy="52" r="13.5" />
      </g>`),monocle:e=>y(`
      <circle cx="63" cy="52" r="13" fill="${k}" fill-opacity="0.35" stroke="${p}" stroke-width="2.8" />
      <path d="M63 65 C63 72 58 75 54 76" stroke="${p}" stroke-width="2" fill="none" stroke-linecap="round" />`),starShades:e=>y(`
      <path d="M${Re(37,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${p}" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M${Re(63,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${p}" stroke-width="2.2" stroke-linejoin="round" />`)},mr=new Set(["cowlick","topknot","cap"]),br={none:()=>y(""),fringe:e=>y(`<path d="M23 40 C26 24 40 18 50 18 C62 18 74 25 76 40
                    C70 32 62 34 57 39 C54 31 44 30 39 36 C34 32 27 34 23 40 Z"
                 fill="${e.accent}" />`),cowlick:e=>y(`<path d="M46 22 C44 12 52 6 60 4 C54 10 55 15 60 17 C54 19 49 20 46 26 Z" fill="${e.accent}" />`),topknot:e=>y(`<circle cx="50" cy="14" r="10" fill="${e.accent}" stroke="${p}" stroke-width="2.2" />
           <path d="M42 22 Q50 26 58 22" stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" />`),cap:e=>y(`<g fill="${e.accent}" stroke="${p}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M22 32 C22 16 78 16 78 32 Z" />
             <path d="M78 30 C88 30 90 36 88 38 L74 34 Z" />
           </g>
           <circle cx="50" cy="13" r="4" fill="${p}" />`),bow:e=>y(`<g transform="translate(26 24) rotate(-18)" fill="${e.accent}" stroke="${p}"
              stroke-width="2.2" stroke-linejoin="round">
             <path d="M0 0 C-9 -8 -14 -2 -12 4 C-10 9 -3 7 0 0 Z" />
             <path d="M0 0 C9 -8 14 -2 12 4 C10 9 3 7 0 0 Z" />
             <circle cx="0" cy="0" r="3.6" fill="${p}" stroke="none" />
           </g>`),flower:e=>y(`<g transform="translate(75 28)">
             ${[0,72,144,216,288].map(t=>{const o=t*Math.PI/180;return`<ellipse cx="${(Math.cos(o)*6).toFixed(1)}" cy="${(Math.sin(o)*6).toFixed(1)}" rx="5" ry="4" transform="rotate(${t})" fill="${k}" />`}).join("")}
             <circle cx="0" cy="0" r="4" fill="#ffd166" />
           </g>`)},xr={none:()=>y(""),moustache:()=>y(`<path d="M50 64 C46 59 38 59 35 64 C38 68 46 68 50 64 Z
                    M50 64 C54 59 62 59 65 64 C62 68 54 68 50 64 Z" fill="${p}" />`),beard:()=>y(`<g fill="${p}">
             <circle cx="44" cy="78.5" r="6" /><circle cx="50" cy="81" r="7" /><circle cx="56" cy="78.5" r="6" />
           </g>`),whiskers:()=>y(`<g stroke="${p}" stroke-width="2" stroke-linecap="round" fill="none">
             <path d="M32 64 L18 61 M32 68 L17 68 M32 72 L19 76" />
             <path d="M68 64 L82 61 M68 68 L83 68 M68 72 L81 76" />
           </g>`),teeth:()=>y(`<rect x="45" y="70" width="4.6" height="7" rx="1.6" fill="${k}" stroke="${p}" stroke-width="1.4" />
           <rect x="50.4" y="70" width="4.6" height="7" rx="1.6" fill="${k}" stroke="${p}" stroke-width="1.4" />`),snout:e=>R(`<ellipse cx="50" cy="69" rx="15" ry="11.5" fill="${e.belly}" />
       <ellipse cx="50" cy="61" rx="5.5" ry="4" fill="${p}" />`,"")},dt={none:()=>y(""),freckles:e=>y(`<g fill="${p}" opacity="0.4">
             <circle cx="26" cy="57" r="1.6" /><circle cx="30" cy="60" r="1.6" /><circle cx="25" cy="63" r="1.6" />
             <circle cx="74" cy="57" r="1.6" /><circle cx="70" cy="60" r="1.6" /><circle cx="75" cy="63" r="1.6" />
           </g>`),spots:e=>R(`<g fill="${e.accent}" opacity="0.5">
         <ellipse cx="24" cy="44" rx="7" ry="5.5" /><ellipse cx="76" cy="70" rx="6" ry="5" />
         <ellipse cx="70" cy="34" rx="5" ry="4" />
       </g>`,""),stripes:e=>R(`<g stroke="${e.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55">
         <path d="M20 46 Q26 50 26 58" /><path d="M22 62 Q28 65 29 72" />
         <path d="M80 46 Q74 50 74 58" /><path d="M78 62 Q72 65 71 72" />
       </g>`,""),patch:e=>R(`<ellipse cx="37" cy="52" rx="15" ry="14" fill="${e.accent}" opacity="0.45" />`,""),heart:e=>R(`<path d="M50 76 C44 70 38 68 38 63 C38 59 43 58 46 61 C47 62 49 63 50 65
                C51 63 53 62 54 61 C57 58 62 59 62 63 C62 68 56 70 50 76 Z"
             fill="${e.accent}" opacity="0.6" />`,"")},wr={none:()=>y(""),scarf:e=>y(`<g fill="${e.accent}" stroke="${p}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M28 78 C38 85 62 85 72 78 C70 85 62 89 50 89 C38 89 30 85 28 78 Z" />
             <path d="M66 82 C72 84 74 90 71 94 C67 92 65 87 66 82 Z" />
           </g>`),bandana:e=>y(`<path d="M30 79 C40 85 60 85 70 79 L50 95 Z" fill="${e.accent}" stroke="${p}"
                 stroke-width="2.2" stroke-linejoin="round" />`),bowtie:e=>y(`<g transform="translate(50 82)" fill="${e.accent}" stroke="${p}" stroke-width="2.2"
              stroke-linejoin="round">
             <path d="M0 0 L-12 -6 L-12 6 Z" />
             <path d="M0 0 L12 -6 L12 6 Z" />
             <circle cx="0" cy="0" r="3.4" fill="${p}" stroke="none" />
           </g>`),backpack:e=>y(`<g stroke="${p}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M38 44 C33 56 33 68 37 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <path d="M62 44 C67 56 67 68 63 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <rect x="12" y="64" width="17" height="19" rx="6" fill="${e.accent}" />
             <path d="M12 71 H29" fill="none" />
           </g>`)},Ze={x:50,y:86},Oe={x:50,y:55},_e={1:{scale:.78,face:1,faceY:0},2:{scale:.9,face:.87,faceY:-5},3:{scale:1.02,face:.74,faceY:-10}},ht=e=>_e[e]??_e[1],Mr=e=>{const{scale:t}=ht(e);return`translate(${Ze.x} ${Ze.y}) scale(${t}) translate(-50 -86)`},Lr=e=>{const{face:t,faceY:o}=ht(e);return`translate(0 ${o}) translate(${Oe.x} ${Oe.y}) scale(${t}) translate(-50 -55)`},je={tail:e=>`<path d="M78 76 C92 74 96 62 90 52 C88 60 84 66 74 68 Z" fill="${e.accent}" />`,wings:e=>`
    <path d="M26 46 C8 34 2 48 6 60 C10 72 22 72 30 64 Z" fill="${e.accent}" opacity="0.92" />
    <path d="M74 46 C92 34 98 48 94 60 C90 72 78 72 70 64 Z" fill="${e.accent}" opacity="0.92" />`,mane:e=>Array.from({length:11},(t,o)=>{const r=(-100+o*20)*Math.PI/180;return`<circle cx="${(50+Math.sin(r)*36).toFixed(1)}" cy="${(58-Math.cos(r)*32).toFixed(1)}" r="9" />`}).join(""),crest:e=>Array.from({length:5},(t,o)=>{const r=30+o*10,n=o===2?20:12;return`<path d="M${r} 24 L${r+5} ${24-n-10} L${r+10} 24 Z" fill="${e.accent}"
                    stroke="${p}" stroke-width="1.8" stroke-linejoin="round" />`}).join(""),finback:e=>`<path d="M46 4 C66 14 80 32 84 54 C74 44 62 38 48 38 Z" fill="${e.accent}"
           stroke="${p}" stroke-width="2" stroke-linejoin="round" />`,plume:e=>`
    <path d="M76 74 C94 68 98 50 92 36 C88 48 82 58 72 64 Z" fill="${e.accent}" opacity="0.85" />
    <path d="M74 78 C90 76 96 64 94 52 C88 62 82 70 70 72 Z" fill="${e.accent}" />`},Pe={bigEars:e=>`
    <circle cx="20" cy="26" r="18" /><circle cx="80" cy="26" r="18" />
    <circle cx="20" cy="26" r="10" fill="${e.belly}" /><circle cx="80" cy="26" r="10" fill="${e.belly}" />`,antennaArray:e=>`
    <g fill="none" stroke="${p}" stroke-width="3" stroke-linecap="round">
      <path d="M50 28 C48 16 52 10 50 2" /><path d="M38 30 C32 20 30 14 26 8" /><path d="M62 30 C68 20 70 14 74 8" />
    </g>
    <circle cx="50" cy="2" r="7" fill="${e.accent}" />
    <circle cx="25" cy="7" r="5" fill="${e.accent}" /><circle cx="75" cy="7" r="5" fill="${e.accent}" />`,tallTuft:e=>`
    <path d="M50 30 C40 20 42 8 52 0 C50 10 56 14 60 10 C62 20 58 26 50 30 Z" fill="${e.accent}" />
    <circle cx="38" cy="24" r="7" /><circle cx="62" cy="24" r="7" />`,crownSpikes:e=>`
    <path d="M26 30 L30 12 L38 24 L46 6 L54 24 L62 12 L70 30 Z" fill="${e.accent}"
          stroke="${p}" stroke-width="2.2" stroke-linejoin="round" />`,longEars:e=>`
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
    </g>`},w={mochi:{name:"Mochi",body:"round",texture:"smooth",topper:"roundears",eyes:"round",brows:"none",palette:["#ffd9e2","#fff1f4","#ff9ec0"],grows:["mane","tail"],signature:"bigEars"},bloop:{name:"Bloop",body:"bean",texture:"smooth",topper:"antenna",eyes:"sparkle",brows:"none",palette:["#a5d8ff","#e3f2ff","#5fb3f5"],grows:["tail","wings"],signature:"antennaArray"},pip:{name:"Pip",body:"tall",texture:"fluffy",topper:"tuft",eyes:"oval",brows:"arched",palette:["#b2f2d7","#e6fff5","#4fd6a0"],grows:["crest","plume"],signature:"tallTuft"},waddle:{name:"Waddle",body:"wide",texture:"smooth",topper:"none",eyes:"beady",brows:"thick",palette:["#ffe9a8","#fff8dd","#f7b955"],grows:["tail","mane"],signature:"crownSpikes"},puff:{name:"Puff",body:"round",texture:"fluffy",topper:"ears",eyes:"lashed",brows:"arched",palette:["#d9c8ff","#f2ecff","#a884f5"],grows:["mane","wings"],signature:"longEars"},nibbles:{name:"Nibbles",body:"tall",texture:"smooth",topper:"rabbit",eyes:"round",brows:"worried",palette:["#ffd0b0","#fff0e5","#f79a63"],grows:["wings","plume"],signature:"hugeRabbit"},snug:{name:"Snug",body:"wide",texture:"fluffy",topper:"roundears",eyes:"sleepy",brows:"bushy",palette:["#cfe6c0","#eefae6","#8cc472"],grows:["wings","crest"],signature:"ramCurl"},glim:{name:"Glim",body:"pear",texture:"smooth",topper:"horn",eyes:"sparkle",brows:"thick",palette:["#ffc2b8","#fff0ed","#ff8a75"],grows:["finback","wings"],signature:"twinHorns"},noodle:{name:"Noodle",body:"tall",texture:"smooth",topper:"antlers",eyes:"beady",brows:"worried",palette:["#9fe5e0","#e4fbfa","#48c4bc"],grows:["finback","tail"],signature:"bigAntlers"},fizz:{name:"Fizz",body:"chunky",texture:"spiky",topper:"tuft",eyes:"sparkle",brows:"none",palette:["#ffc7ea","#fff0fa","#f778c4"],grows:["crest","plume"],signature:"flameCrest"},cloudlet:{name:"Cloudlet",body:"wide",texture:"fluffy",topper:"fin",eyes:"oval",brows:"none",palette:["#c9dcff","#eef4ff","#7ba2f0"],grows:["finback","crest"],signature:"stormFin"},pebble:{name:"Pebble",body:"round",texture:"smooth",topper:"none",eyes:"sleepy",brows:"thick",palette:["#dcd6e8","#f4f1f9","#a99cc4"],grows:["plume","mane"],signature:"crystal"},sprout:{name:"Sprout",body:"pear",texture:"smooth",topper:"leaf",eyes:"round",brows:"arched",palette:["#c4e8a0","#eefada","#82c44e"],grows:["mane","crest"],signature:"foliageCrown"},bubs:{name:"Bubs",body:"round",texture:"smooth",topper:"floppy",eyes:"lashed",brows:"none",palette:["#f0c2d8","#fdeef5","#d97fae"],grows:["tail","mane"],signature:"longFlop"},zzz:{name:"Zzz",body:"bean",texture:"fluffy",topper:"hound",eyes:"sleepy",brows:"worried",palette:["#bcc4f0","#e8ebfd","#7d8be0"],grows:["plume","tail"],signature:"moonHorns"},tumble:{name:"Tumble",body:"chunky",texture:"spiky",topper:"ram",eyes:"oval",brows:"bushy",palette:["#ffdcb0","#fff4e4","#f0a552"],grows:["crest","finback"],signature:"doubleRam"}},He=[["mochi","bloop","pip","waddle"],["puff","nibbles","snug","glim"],["noodle","fizz","cloudlet","pebble"],["sprout","bubs","zzz","tumble"]];function Y(e){let t=5381;for(let o=0;o<e.length;o+=1)t=(t<<5)+t+e.charCodeAt(o)>>>0;return t}function j(e,t){var n;const o=((n=_.find(a=>a.minutes.includes(t)))==null?void 0:n.id)??0,r=He[o]??He[0];return r[Y(L(e,t))%r.length]}const Sr=(e,t,o=x)=>{const r=B[o]??B[x],n=j(e,t),a=Y(`n${n}`)%r.length;return r[(a+ue(e,t))%r.length]},Wo=(e,t=x)=>e.name||Sr(e.h,e.m,t),U={eyewear:"none",hair:"none",facialHair:"none",markings:"none",accessory:"none"},Cr=(e,t)=>{var o;return(((o=w[e])==null?void 0:o.grows)??[]).slice(0,Math.max(0,Math.min(t,re)-1))};function ne(e,t=1){const o=e in w?e:"mochi",r=Math.max(1,Math.min(Math.round(t)||1,re));return{species:o,...w[o],...U,form:r,anatomy:Cr(o,r),signature:r>=re?w[o].signature:null}}const vr=[["eyewear",["roundSpecs","squareSpecs","goggles","monocle","starShades"]],["hair",["fringe","cowlick","topknot","cap","bow","flower"]],["facialHair",["moustache","beard","whiskers","teeth","snout"]],["accessory",["scarf","bandana","bowtie","backpack"]]],Ue=Object.keys(dt),Ar=71;function ze(e){const t=vr.map(([r,n])=>[r,r==="hair"&&e?n.filter(a=>!mr.has(a)):n]),o=[{...U}];for(const[r,n]of t)for(const a of n)o.push({...U,[r]:a});for(let r=0;r<t.length;r+=1)for(let n=r+1;n<t.length;n+=1)for(const a of t[r][1])for(const l of t[n][1])o.push({...U,[t[r][0]]:a,[t[n][0]]:l});return o}const Er={crowned:ze(!0),free:ze(!1)},Tr=e=>{var t;return yr.has((t=w[e])==null?void 0:t.topper)},Dr=e=>Er[Tr(e)?"crowned":"free"],z=new Map;for(const e of[...lt].sort((t,o)=>t.h-o.h||t.m-o.m)){const t=j(e.h,e.m);z.has(t)||z.set(t,[]),z.get(t).push(e.id)}const Ir=e=>z.get(e)??[],ue=(e,t)=>Math.max(0,Ir(j(e,t)).indexOf(L(e,t))),Vo=e=>Nr(e.h,e.m,G(e.feeds??0)||1);function Nr(e,t,o=1){const r=j(e,t),n=ue(e,t),a=Dr(r);return{...ne(r,o),...a[n*Ar%a.length],markings:Ue[n%Ue.length]}}const Fr=e=>typeof e=="string"?ne(e):e??ne("mochi");function Rr(e,t){const o=De[e.eyes]??De.round,r=he.map((n,a)=>o(de[a],n)).join("");return t==="sleep"?kr(r):r}function Zr(e,t){const o=Ie[e.brows]??Ie.none,{rot:r,dy:n}=Ne[t]??Ne.content;return he.map((a,l)=>{const s=de[l],i=o(s,a);return i?`<g transform="translate(0 ${n}) rotate(${a===-1?r:-r} ${s} 37)">${i}</g>`:""}).join("")}function Jo(e,{mood:t="content",className:o="",title:r=""}={}){const n=Fr(e),[a,l,s]=n.palette,i={body:a,belly:l,accent:s},d=Ae[n.body]??Ae.round,h=(Ee[n.texture]??Ee.smooth)(d.halo),u=Math.max(1,Math.min(n.form??1,3)),g=n.signature&&Pe[n.signature]?Pe[n.signature](i):(Te[n.topper]??Te.none)(s),$=(n.anatomy??[]).map(N=>je[N]?je[N](i):"").join(""),vt=r||n.name||"pet",I=(N,Tt,Dt)=>(N[Tt]??N[Dt])(i),At=I($r,n.eyewear,"none"),Et=I(br,n.hair,"none"),me=I(xr,n.facialHair,"none"),be=I(dt,n.markings,"none"),xe=I(wr,n.accessory,"none");return`
<svg class="pet form-${u} ${o}" viewBox="0 0 100 100" role="img" aria-label="${vt}" focusable="false">
  ${r?`<title>${r}</title>`:""}
  <g class="pet-grow" transform="${Mr(u)}">
  <g class="pet-inner">
    <g fill="${n.texture==="spiky"?s:a}">${h}</g>
    <g fill="${s}">${$}</g>
    <g fill="${s}">${g}</g>
    ${xe.back}
    <g fill="${s}">${gr}</g>
    <g class="pet-body" fill="${a}">${d.shape}</g>
    <ellipse cx="50" cy="64" rx="21" ry="17" fill="${l}" />
    ${be.back}${me.back}
    <g class="pet-face" transform="${Lr(u)}">
      ${Rr(n,t)}
      ${At.front}
      ${Et.front}
      ${Zr(n,t)}
      <ellipse cx="27" cy="62" rx="7" ry="4.2" fill="${s}" opacity="0.55" />
      <ellipse cx="73" cy="62" rx="7" ry="4.2" fill="${s}" opacity="0.55" />
      ${be.front}
      ${Fe[t]??Fe.content}
      ${me.front}
    </g>
    ${xe.front}
  </g>
  </g>
</svg>`}const ut=["M69 27 L62.5 33.5 L68 38.5 L61 44.5 L64.5 50","M31 43 L38 49 L31.5 56 L38.5 63 L33 70","M21 59 L32 55 L43 62.5 L55 54.5 L66.5 62 L79 55.5"],Or=ut.length;function Xo(e,{cracks:t=0,className:o="",title:r="A chilly egg"}={}){const n=w[e]??w.mochi,[a,l,s]=n.palette,i=Math.max(0,Math.min(Or,Math.round(t))),d=Array.from({length:i},(h,u)=>`<path class="egg-crack egg-crack-${u+1}" pathLength="1" d="${ut[u]}" />`).join("");return`
<svg class="pet egg egg-cracks-${i} ${o}" viewBox="0 0 100 100" role="img" aria-label="${r}" focusable="false">
  <title>${r}</title>
  <g class="pet-inner">
    <path class="egg-shell" fill="${a}"
      d="M50 12 C68 12 80 40 80 58 C80 78 66 90 50 90 C34 90 20 78 20 58 C20 40 32 12 50 12 Z" />
    <ellipse cx="41" cy="62" rx="15" ry="18" fill="${l}" opacity="0.75" />
    <circle cx="61" cy="40" r="6" fill="${s}" opacity="0.65" />
    <circle cx="36" cy="34" r="4.5" fill="${s}" opacity="0.65" />
    <circle cx="66" cy="68" r="5" fill="${s}" opacity="0.5" />
    <circle cx="44" cy="78" r="3.5" fill="${s}" opacity="0.5" />
    ${d}
  </g>
</svg>`}function en(e,t,{size:o=34}={}){const n=X(50,50,24,e%12*30+t*.5),a=X(50,50,36,t*6),l=Array.from({length:12},(s,i)=>{const d=X(50,50,41,i*30);return`<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="2.6" />`}).join("");return`
<svg class="collar-clock" width="${o}" height="${o}" viewBox="0 0 100 100" role="img"
     aria-label="${L(e,t)}" focusable="false">
  <circle cx="50" cy="50" r="46" class="collar-face" />
  <g class="collar-ticks">${l}</g>
  <line x1="50" y1="50" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}" class="collar-hand hour" />
  <line x1="50" y1="50" x2="${a.x.toFixed(1)}" y2="${a.y.toFixed(1)}" class="collar-hand minute" />
  <circle cx="50" cy="50" r="5" class="collar-pin" />
</svg>`}function tn(e,t,{napping:o=!1}={}){return o?"sleep":e.hatchedAt===null?"content":e.phase==="learning"?e.lapses>0?"droopy":"content":e.dueAt<=t?"hungry":"happy"}const _r=[{id:"flowerbed",price:45,tier:0,band:"narrow"},{id:"lantern",price:60,tier:0,band:"narrow"},{id:"house",price:130,tier:1,band:"wide"},{id:"swing",price:80,tier:1,band:"wide"},{id:"pond",price:90,tier:2,band:"narrow"},{id:"hammock",price:80,tier:2,band:"wide"},{id:"arch",price:140,tier:3,band:"wide"},{id:"windmill",price:140,tier:3,band:"narrow"}],ge=2,W=new Map(_r.map(e=>[e.id,e])),rn=(e,t)=>{var o;return(((o=W.get(e))==null?void 0:o.tier)??K+1)<=t},V=e=>Array.isArray(e==null?void 0:e.decor)?e.decor:[],gt=(e,t)=>V(e).includes(t),jr=e=>V(e).length>=ge;function yt(e){if(!Array.isArray(e))return[];const t=[];for(const o of e)if(W.has(o)&&!t.includes(o)&&t.push(o),t.length>=ge)break;return t}function on(e,t){return!W.has(t)||gt(e,t)||jr(e)?e:{...e,decor:[...V(e),t]}}function nn(e,t){return gt(e,t)?{...e,decor:V(e).filter(o=>o!==t)}:e}const kt=6,$t=[0,0,10,16],Pr=30,an=6,Be=6,Hr=12;function sn(e){if(!e)return 0;let t=0;return e.hatched&&(t+=kt),e.evolved&&(t+=$t[e.evolved]??0),t}function ln(e,t){const o=Array.isArray(e)?e:[];if(o[o.length-1]!==t)return 0;const r=o[o.length-2];if(!r)return Be;const n=new Date(`${t}T00:00:00Z`);return n.setUTCDate(n.getUTCDate()-1),r===n.toISOString().slice(0,10)?Hr:Be}const M=e=>Math.max(0,Math.floor(Number.isFinite(e)?e:0)),mt=M,cn=(e,t)=>M(e)+M(t),Ur=(e,t)=>M(e)>=M(t),fn=(e,t)=>Ur(e,t)?M(e)-M(t):M(e);function pn(e,t=0){let o=0;for(const r of Object.values(e??{})){r!=null&&r.hatchedAt&&(o+=kt);const n=G(typeof(r==null?void 0:r.feeds)=="number"?r.feeds:0);for(let a=2;a<=n;a+=1)o+=$t[a]??0}return o+M(t)*Pr}const ye="pet-zoo/v1",ke=1,zr=400;function E(e){return{version:ke,createdAt:e,lastPlayedAt:e,reviewClock:0,tier:0,coins:0,coinsGrantedAt:0,settings:{sound:!0,haptics:!0,language:x,playMinutes:fe,showDigital:!1},session:{startedAt:0,answered:0,correct:0,napUntil:0},stats:{totalAnswered:0,totalCorrect:0,streak:0,bestStreak:0,daysPlayed:[]},items:{}}}const bt=e=>new Date(e).toISOString().slice(0,10);function dn(e,t=J()){try{const o=t==null?void 0:t.getItem(ye);if(!o)return E(e);const r=JSON.parse(o);return!r||r.version!==ke||typeof r.items!="object"?E(e):{...E(e),...r,coins:mt(r.coins),settings:{...E(e).settings,...r.settings},items:xt(r.items)}}catch{return E(e)}}function xt(e){const t={};for(const[o,r]of Object.entries(e??{})){const n=typeof(r==null?void 0:r.feeds)=="number"?r.feeds:(r==null?void 0:r.reps)||(r!=null&&r.hatchedAt?1:0),a=typeof(r==null?void 0:r.cracks)=="number"?r.cracks:ct((r==null?void 0:r.correctStreak)??0),l=yt(r==null?void 0:r.decor),s=typeof(r==null?void 0:r.feeds)=="number"&&typeof(r==null?void 0:r.cracks)=="number"&&Array.isArray(r==null?void 0:r.decor)&&l.length===r.decor.length;t[o]=s?r:{...r,feeds:n,cracks:a,decor:l}}return t}function Br(e,t=J()){try{return t==null||t.setItem(ye,JSON.stringify(e)),!0}catch{return!1}}function hn(e=J()){try{e==null||e.removeItem(ye)}catch{}}function J(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function un(e=J()){let t=null,o=null;const r=()=>{clearTimeout(t),t=null,o&&Br(o,e),o=null};return{save(n){o=n,t===null&&(t=setTimeout(r,zr))},flush:r}}function gn(e,t){const o=bt(t),r=e.stats.daysPlayed;return r[r.length-1]===o?e:{...e,stats:{...e.stats,daysPlayed:[...r.slice(-59),o]}}}const wt="pet-zoo",Mt=1,ae="petzoo1:";class C extends Error{constructor(t){super(t),this.name="TransferError",this.key=t}}function yn(e,t){return{app:wt,format:Mt,version:ke,exportedAt:t,createdAt:e.createdAt,lastPlayedAt:e.lastPlayedAt,reviewClock:e.reviewClock,tier:e.tier,coins:e.coins,stats:e.stats,items:e.items}}const Gr=e=>JSON.stringify(e,null,2),kn=e=>`pet-zoo-${bt(e)}.json`,Ge=32768;function Qr(e){let t="";for(let o=0;o<e.length;o+=Ge)t+=String.fromCharCode(...e.subarray(o,o+Ge));return btoa(t)}function qr(e){const t=atob(e),o=new Uint8Array(t.length);for(let r=0;r<t.length;r+=1)o[r]=t.charCodeAt(r);return o}function $n(e){const t=new TextEncoder().encode(Gr(e));return ae+Qr(t)}const Q=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);function mn(e){const t=String(e??"").trim();if(!t)throw new C("transfer.badFile");let o=t;if(t.startsWith(ae))try{const n=t.slice(ae.length).replace(/\s+/g,"");o=new TextDecoder().decode(qr(n))}catch{throw new C("transfer.badFile")}let r;try{r=JSON.parse(o)}catch{throw new C("transfer.badFile")}if(!Q(r))throw new C("transfer.badFile");if(r.app!==wt)throw new C("transfer.badApp");if(!(r.format<=Mt))throw new C("transfer.badVersion");if(!Q(r.items))throw new C("transfer.badFile");return{...r,items:Kr(r.items)}}function Kr(e){const t={};for(const[o,r]of Object.entries(e)){if(!Q(r))continue;const{h:n,m:a}=r;!Number.isInteger(n)||n<1||n>12||!Number.isInteger(a)||a<0||a>59||a%q!==0||o===L(n,a)&&(t[o]=r)}return xt(t)}const bn=e=>Object.values(e).filter(t=>t.hatchedAt!==null&&t.hatchedAt!==void 0).length;function xn(e,t,o){const r=E(o);return{...r,createdAt:t.createdAt??r.createdAt,lastPlayedAt:t.lastPlayedAt??o,reviewClock:Number.isFinite(t.reviewClock)?t.reviewClock:0,tier:Number.isFinite(t.tier)?t.tier:0,coins:mt(t.coins),coinsGrantedAt:Number.isFinite(t.coins)?o:0,stats:{...r.stats,...Q(t.stats)?t.stats:{}},items:t.items,settings:e.settings,session:r.session}}const S={w:200,h:120},f=62,m=96,Qe={x0:40,x1:160},T={x0:62,x1:138},wn=46,c=e=>Number(e.toFixed(2));function $e(e){let t=Math.floor(e)%2147483647+1;return t<=0&&(t+=2147483646),()=>(t=t*48271%2147483647,(t-1)/2147483646)}const D={dawn:{sky:["#f6b98a","#ffe6cd"],orb:"sun",orbFill:"#ffd27a",glow:"#ffd9a8",veil:"rgba(255, 176, 120, 0.16)",night:!1},morning:{sky:["#a8dcff","#e8f6ff"],orb:"sun",orbFill:"#ffe293",glow:"#fff3c4",veil:"rgba(255, 246, 214, 0.10)",night:!1},noon:{sky:["#8ecfff","#e4f4ff"],orb:"sun",orbFill:"#fff2a8",glow:"#fffbdd",veil:"rgba(255, 255, 255, 0.06)",night:!1},afternoon:{sky:["#ffcf96","#fff0d6"],orb:"sun",orbFill:"#ffc860",glow:"#ffe0a5",veil:"rgba(255, 190, 120, 0.13)",night:!1},dusk:{sky:["#7f6bc4","#ffb493"],orb:"sun",orbFill:"#ff9d6e",glow:"#ffc7a0",veil:"rgba(120, 96, 190, 0.18)",night:!1},night:{sky:["#2f3f7a","#6a7cb8"],orb:"moon",orbFill:"#fdf8dc",glow:"#cfd8ff",veil:"rgba(40, 52, 110, 0.26)",night:!0}},Mn=Object.keys(D);function Yr(e){const t=(Math.round(e)%24+24)%24;return t>=5&&t<7?"dawn":t>=7&&t<11?"morning":t>=11&&t<14?"noon":t>=14&&t<17?"afternoon":t>=17&&t<20?"dusk":"night"}function Lt(e){const t=(Math.round(e)%24+24)%24,r=(t>=5&&t<19?(t-5)/14:((t<5?t+24:t)-19)/10)*Math.PI;return{x:c(100-Math.cos(r)*52),y:c(f-12-Math.sin(r)*34)}}function Wr(e,t,o,r){const n=D[e]??D.noon,a=Lt(t),l=$e(o+17),s=`
    <circle cx="${a.x}" cy="${a.y}" r="22" fill="url(#${r}-glow)" />
    ${n.orb==="moon"?`<circle cx="${a.x}" cy="${a.y}" r="7.5" fill="${n.orbFill}" />
           <circle cx="${c(a.x+2.6)}" cy="${c(a.y-2)}" r="1.5" fill="#e8e0bd" opacity="0.7" />
           <circle cx="${c(a.x-1.8)}" cy="${c(a.y+2.4)}" r="1.1" fill="#e8e0bd" opacity="0.6" />`:`<circle cx="${a.x}" cy="${a.y}" r="9" fill="${n.orbFill}" />`}`;return n.night?`${Array.from({length:34},()=>{const h=c(l()*200),u=c(l()**1.6*(f-6)),g=c(.5+l()*.9);return`<circle cx="${h}" cy="${u}" r="${g}" fill="#fdf8dc" opacity="${c(.35+l()*.5)}" />`}).join("")}${s}`:`${Array.from({length:3},(d,h)=>{const u=c(18+l()*150),g=c(8+l()*28),$=c(.7+l()*.7);return`<g transform="translate(${u} ${g}) scale(${$})" fill="#ffffff" opacity="${c(.5+h*.08)}">
      <ellipse cx="0" cy="0" rx="13" ry="6" />
      <circle cx="-5" cy="-2.5" r="6" />
      <circle cx="4.5" cy="-3.5" r="7.5" />
    </g>`}).join("")}${s}`}const qe={hills:e=>`
    <ellipse cx="34" cy="${f+4}" rx="60" ry="22" fill="${e.farDark}" />
    <ellipse cx="132" cy="${f+2}" rx="74" ry="26" fill="${e.far}" />
    <ellipse cx="86" cy="${f+8}" rx="52" ry="18" fill="${e.farDark}" opacity="0.7" />`,treeline:e=>{const t=Array.from({length:13},(o,r)=>{const n=c(2+r*16.2),a=c(13+r*7%5*2.6);return`<path d="M${n} ${f+3} L${c(n+5.2)} ${c(f+3-a)} L${c(n+10.4)} ${f+3} Z" />`}).join("");return`<g fill="${e.farDark}">${t}</g>
      <rect x="0" y="${f}" width="200" height="8" fill="${e.far}" opacity="0.55" />`},sea:e=>`
    <rect x="0" y="${f-16}" width="200" height="26" fill="${e.water}" />
    <rect x="0" y="${f-16}" width="200" height="3" fill="${e.waterLight}" opacity="0.7" />
    <ellipse cx="100" cy="${f+6}" rx="120" ry="10" fill="${e.waterLight}" opacity="0.45" />`,dunes:e=>`
    <ellipse cx="40" cy="${f+6}" rx="66" ry="20" fill="${e.far}" />
    <ellipse cx="150" cy="${f+3}" rx="70" ry="17" fill="${e.farDark}" />`,peaks:e=>`
    <path d="M-6 ${f+4} L38 ${f-30} L82 ${f+4} Z" fill="${e.farDark}" />
    <path d="M52 ${f+4} L104 ${f-38} L156 ${f+4} Z" fill="${e.far}" />
    <path d="M132 ${f+4} L172 ${f-24} L212 ${f+4} Z" fill="${e.farDark}" />
    <path d="M104 ${f-38} L92 ${f-24} L104 ${f-27} L116 ${f-22} Z" fill="#ffffff" opacity="0.85" />`,arch:e=>`
    <ellipse cx="62" cy="${f+3}" rx="52" ry="17" fill="${e.farDark}" />
    <ellipse cx="146" cy="${f+4}" rx="58" ry="19" fill="${e.far}" />
    <ellipse cx="104" cy="${f+1}" rx="21" ry="15" fill="${e.glowDeep}" />
    <ellipse cx="104" cy="${f+2}" rx="13" ry="9" fill="${e.glow}" opacity="0.7" />`,cloudbank:e=>`
    <g fill="${e.far}">
      <ellipse cx="42" cy="${f+6}" rx="54" ry="17" />
      <ellipse cx="146" cy="${f+3}" rx="60" ry="15" />
      <circle cx="70" cy="${f-4}" r="13" />
      <circle cx="128" cy="${f-6}" r="15" />
    </g>`},Ke=`M0 ${f+2}
   C 34 ${f-4}, 68 ${f+6}, 100 ${f+1}
   C 136 ${f-5}, 170 ${f+5}, 200 ${f}`;function Vr(e,t){return`
    <path d="${Ke} L200 120 L0 120 Z" fill="url(#${t}-ground)" />
    <path d="${Ke}" fill="none" stroke="${e.groundRim}" stroke-width="1.4" opacity="0.55" />
    <path d="M0 ${m+4}
             C 46 ${m-2}, 120 ${m+7}, 200 ${m}
             L200 120 L0 120 Z"
          fill="${e.groundNear}" opacity="0.55" />`}const Ye={grass:(e,t)=>Array.from({length:26},()=>{const o=c(t()*200),r=c(f+6+t()*50),n=c(2.6+t()*3.4);return`<path d="M${o} ${r} q${c(.8+t())} ${-n} ${c(1.8+t())} ${c(-n*.6)}" stroke="${e.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55" />`}).join(""),fern:(e,t)=>Array.from({length:16},()=>{const o=c(t()*200),r=c(f+8+t()*48),n=c(.6+t()*.6);return`<g transform="translate(${o} ${r}) scale(${n})" fill="${e.leafDark}" opacity="0.5">
        <ellipse cx="-3" cy="-2" rx="4" ry="1.6" transform="rotate(-25 -3 -2)" />
        <ellipse cx="3" cy="-2" rx="4" ry="1.6" transform="rotate(25 3 -2)" />
        <ellipse cx="0" cy="-4.5" rx="3.4" ry="1.5" />
      </g>`}).join(""),shells:(e,t)=>Array.from({length:18},()=>{const o=c(t()*200),r=c(f+10+t()*46),n=c(1.1+t()*1.5);return`<ellipse cx="${o}" cy="${r}" rx="${n}" ry="${c(n*.7)}" fill="${e.bloom}" opacity="0.6" />`}).join(""),pebbles:(e,t)=>Array.from({length:20},()=>{const o=c(t()*200),r=c(f+8+t()*48),n=c(1+t()*1.8);return`<ellipse cx="${o}" cy="${r}" rx="${n}" ry="${c(n*.65)}" fill="${e.stone}" opacity="0.5" />`}).join(""),lily:(e,t)=>Array.from({length:9},()=>{const o=c(t()*200),r=c(f+10+t()*42),n=c(3+t()*2.6);return`<g transform="translate(${o} ${r})">
        <circle r="${n}" fill="${e.leaf}" opacity="0.8" />
        <path d="M0 0 L${n} ${c(-n*.4)} A${n} ${n} 0 0 0 ${c(n*.7)} ${c(n*.7)} Z" fill="${e.groundNear}" opacity="0.5" />
      </g>`}).join(""),snow:(e,t)=>Array.from({length:16},()=>{const o=c(t()*200),r=c(f+8+t()*48),n=c(2.4+t()*3.4);return`<ellipse cx="${o}" cy="${r}" rx="${n}" ry="${c(n*.5)}" fill="#ffffff" opacity="0.75" />`}).join(""),spores:(e,t)=>Array.from({length:22},()=>{const o=c(t()*200),r=c(f-4+t()*56),n=c(.8+t()*1.4);return`<circle cx="${o}" cy="${r}" r="${n}" fill="${e.glow}" opacity="${c(.35+t()*.45)}" />`}).join(""),sparkle:(e,t)=>Array.from({length:20},()=>{const o=c(t()*200),r=c(f+2+t()*52),n=c(.8+t()*1.3);return`<circle cx="${o}" cy="${r}" r="${n}" fill="#ffffff" opacity="${c(.4+t()*.4)}" />`}).join("")},se={tree:e=>`
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
    <circle cx="4.6" cy="-7.4" r="7" fill="#fbfdff" />`},Ln=Object.keys(se),Jr=e=>`
  <ellipse cx="0" cy="-1" rx="14" ry="5.6" fill="${e.nestDark}" />
  <ellipse cx="0" cy="-3" rx="11.6" ry="4.4" fill="${e.nest}" />
  <ellipse cx="0" cy="-3.6" rx="8.4" ry="2.8" fill="${e.nestLight}" />`,We={bush:[[-5.4,-9.4],[5.2,-10.4],[-.2,-14.2]],tree:[[-6.4,-18],[6.6,-19.2],[0,-23.4]],basket:[[-4.6,-7.2],[4.6,-7.8],[0,-10.4]],coral:[[-5,-11.4],[4.2,-9],[.4,-15.2]]},Ve={bush:e=>`
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
    <circle cx="-5" cy="-11" r="2.2" fill="${e.accent}" />`},le={berry:e=>`
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
    <circle cx="0" cy="-0.2" r="1.1" fill="#fff8e0" opacity="0.8" />`},Sn=Object.keys(le),Xr=e=>`
  <circle cx="0" cy="0" r="5" fill="${e.ballA}" />
  <path d="M-5 0 a5 5 0 0 1 10 0 Z" fill="${e.ballB}" />
  <circle cx="-1.7" cy="-1.9" r="1.4" fill="#ffffff" opacity="0.7" />`,eo=e=>`
  <ellipse cx="0" cy="0" rx="7.4" ry="2.6" fill="${e.leafDark}" opacity="0.45" />`,ce={flowerbed:e=>`
    <path d="M-9 0 L-7.6 -4.4 L7.6 -4.4 L9 0 Z" fill="${e.wood}" />
    <path d="M-7.6 -4.4 L7.6 -4.4 L6.6 -5.6 L-6.6 -5.6 Z" fill="${e.groundRim}" />
    <g stroke="${e.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round">
      <path d="M-4.6 -5.6 q-0.8 -3.4 -1.2 -5.6" />
      <path d="M0 -5.6 q0.8 -4 1 -6.8" />
      <path d="M4.6 -5.6 q0.4 -3 0.2 -5" />
    </g>
    <circle cx="-5.8" cy="-11.8" r="2.5" fill="${e.bloom}" />
    <circle cx="1" cy="-13" r="2.8" fill="${e.accent}" />
    <circle cx="4.8" cy="-11" r="2.3" fill="${e.bloom}" />
    <circle cx="1" cy="-13" r="1" fill="#fff8e0" opacity="0.8" />`,lantern:e=>`
    <ellipse cx="0" cy="-0.6" rx="5" ry="2" fill="${e.stone}" />
    <path d="M-1.5 -1.6 L-1.1 -17 L1.1 -17 L1.5 -1.6 Z" fill="${e.wood}" />
    <path d="M-4.4 -17 L4.4 -17 L3 -19 L-3 -19 Z" fill="${e.stoneLight}" />
    <circle cx="0" cy="-23" r="7" fill="${e.glow}" opacity="0.4" />
    <path d="M-3.4 -17 L-2.6 -25 L2.6 -25 L3.4 -17 Z" fill="${e.glowDeep}" />
    <path d="M-3.4 -17 L-2.6 -25 L2.6 -25 L3.4 -17 Z" fill="none" stroke="${e.wood}" stroke-width="1.2" />
    <path d="M-3 -25.4 L3 -25.4 L1.6 -27.6 L-1.6 -27.6 Z" fill="${e.stoneLight}" />
    <circle cx="0" cy="-21" r="2" fill="#fff8e0" opacity="0.85" />`,house:e=>`
    <path d="M-13 0 L-13 -11 L13 -11 L13 0 Z" fill="${e.wood}" />
    <path d="M-13 -11 L-13 -8.4 L13 -8.4 L13 -11 Z" fill="${e.stone}" opacity="0.3" />
    <path d="M0 -22 L15.6 -10 L-15.6 -10 Z" fill="${e.nestDark}" />
    <path d="M0 -19.4 L11.6 -10.6 L-11.6 -10.6 Z" fill="${e.nest}" />
    <path d="M-6 0 Q-6 -8.6 0 -8.6 Q6 -8.6 6 0 Z" fill="${e.groundRim}" />
    <path d="M-6 0 Q-6 -8.6 0 -8.6 Q6 -8.6 6 0" fill="none" stroke="${e.nestLight}" stroke-width="1.4" />
    <circle cx="0" cy="-14.4" r="2" fill="${e.glow}" opacity="0.55" />`,swing:e=>`
    <path d="M-11 0 L-1.4 -18 M11 0 L1.4 -18" stroke="${e.wood}" stroke-width="2.4" stroke-linecap="round" />
    <path d="M-4.6 -17.4 L4.6 -17.4" stroke="${e.wood}" stroke-width="2" stroke-linecap="round" />
    <path d="M-3.4 -17 L-3.4 -7.6 M3.4 -17 L3.4 -7.6" stroke="${e.stoneLight}" stroke-width="1.1" />
    <path d="M-5 -7.6 L5 -7.6 L5 -6 L-5 -6 Z" fill="${e.nest}" />
    <path d="M-5 -6 L5 -6 L5 -5.4 L-5 -5.4 Z" fill="${e.nestDark}" />`,pond:e=>`
    <ellipse cx="0" cy="-2" rx="11.6" ry="5" fill="${e.groundRim}" />
    <ellipse cx="0" cy="-2.6" rx="10" ry="4" fill="${e.water}" />
    <ellipse cx="-2.4" cy="-3.4" rx="4" ry="1.4" fill="${e.waterLight}" opacity="0.7" />
    <ellipse cx="4.4" cy="-1.6" rx="3" ry="1.2" fill="${e.leaf}" />
    <circle cx="4.4" cy="-2.2" r="1.4" fill="${e.bloom}" />
    <circle cx="-6" cy="-1.2" r="1.8" fill="${e.stoneLight}" />`,hammock:e=>`
    <path d="M-12 0 L-11.4 -16" stroke="${e.wood}" stroke-width="2.4" stroke-linecap="round" />
    <path d="M12 0 L11.4 -16" stroke="${e.wood}" stroke-width="2.4" stroke-linecap="round" />
    <path d="M-11.4 -15 Q0 -3.4 11.4 -15" fill="${e.nest}" stroke="${e.nestDark}" stroke-width="1.2" />
    <path d="M-8 -11.4 Q0 -5.6 8 -11.4" fill="none" stroke="${e.nestLight}" stroke-width="1" opacity="0.8" />
    <circle cx="-11.4" cy="-16" r="1.6" fill="${e.leaf}" />
    <circle cx="11.4" cy="-16" r="1.6" fill="${e.leaf}" />`,arch:e=>`
    <path d="M-12 0 L-12 -12 Q-12 -22 0 -22 Q12 -22 12 -12 L12 0"
          fill="none" stroke="${e.wood}" stroke-width="2.8" stroke-linecap="round" />
    <g fill="${e.leaf}">
      <ellipse cx="-11.4" cy="-15" rx="3.4" ry="2.4" transform="rotate(-24 -11.4 -15)" />
      <ellipse cx="-6.6" cy="-20.6" rx="3.6" ry="2.4" transform="rotate(-12 -6.6 -20.6)" />
      <ellipse cx="6.6" cy="-20.6" rx="3.6" ry="2.4" transform="rotate(12 6.6 -20.6)" />
      <ellipse cx="11.4" cy="-15" rx="3.4" ry="2.4" transform="rotate(24 11.4 -15)" />
    </g>
    <circle cx="-9.4" cy="-18.6" r="2" fill="${e.bloom}" />
    <circle cx="0" cy="-22.6" r="2.2" fill="${e.accent}" />
    <circle cx="9.4" cy="-18.6" r="2" fill="${e.bloom}" />`,windmill:e=>`
    <path d="M-4.4 0 L-1.2 -20 L1.2 -20 L4.4 0 Z" fill="${e.wood}" />
    <path d="M-4.4 0 L-1.2 -20 L0 -20 L0 0 Z" fill="${e.stone}" opacity="0.25" />
    <g class="hab-vane" transform="translate(0 -21)">
      <path d="M0 0 L1.6 -9 L-1.6 -9 Z" fill="${e.accent}" />
      <path d="M0 0 L9 -1.6 L9 1.6 Z" fill="${e.bloom}" />
      <path d="M0 0 L-1.6 9 L1.6 9 Z" fill="${e.accent}" />
      <path d="M0 0 L-9 1.6 L-9 -1.6 Z" fill="${e.bloom}" />
    </g>
    <circle cx="0" cy="-21" r="1.8" fill="${e.stoneLight}" />`},Cn=Object.keys(ce),Je=16;function to(e,t,o=12){const r=$e(t+91);return Array.from({length:o},(n,a)=>{const l=c(20+r()*160),s=c(f-10+r()*52),i=c(.9+r()*1.1),d=c(r()*6),h=c(4+r()*7);return`<circle class="hab-mote" cx="${l}" cy="${s}" r="${i}" fill="${e.glow}"
      style="--mote-delay:${d}s; --mote-drift:${h}px" />`}).join("")}const ro=e=>Math.max(0,Math.min(255,Math.round(e))),Xe=e=>{const t=String(e).replace("#",""),o=t.length===3?t.split("").map(r=>r+r).join(""):t;return[parseInt(o.slice(0,2),16)||0,parseInt(o.slice(2,4),16)||0,parseInt(o.slice(4,6),16)||0]},oo=e=>`#${e.map(t=>ro(t).toString(16).padStart(2,"0")).join("")}`;function b(e,t,o){const r=Math.max(0,Math.min(1,o)),[n,a,l]=Xe(e),[s,i,d]=Xe(t);return oo([n+(s-n)*r,a+(i-a)*r,l+(d-l)*r])}const et={dawn:{color:"#ffb47e",amount:.2},morning:{color:"#fffbe8",amount:.08},noon:{color:"#ffffff",amount:.03},afternoon:{color:"#ffc474",amount:.2},dusk:{color:"#7f66c0",amount:.3},night:{color:"#33437e",amount:.44}},no={far:"#8fc06a",farDark:"#6ea54f",ground:["#a9d581","#7fbc5e"],groundNear:"#97ca70",leaf:"#7fc65c",leafDark:"#54a03c",wood:"#a87b52",stone:"#c6c0b2",stoneLight:"#e4dfd4",bloom:"#ffd7e6",accent:"#ff9ec0",nest:"#ecdcaa",nestDark:"#c9b47f",nestLight:"#f8f0cf",glow:"#fff0b0",glowDeep:"#ffd66b",water:"#7fc4e8",waterLight:"#c4e8f8"},O={meadow:{far:"hills",detail:"grass",larder:"bush",treat:"berry",scenery:["tree","bush","flowers","rock"],colors:{}},grove:{far:"treeline",detail:"fern",larder:"tree",treat:"apple",scenery:["pine","tree","mushroom","rock"],colors:{far:"#5f9d55",farDark:"#3f7a41",ground:["#8cc474","#5f9c55"],groundNear:"#7ab266",leaf:"#63b061",leafDark:"#3d8845",wood:"#8a6242",bloom:"#ffd08a"}},pond:{far:"hills",detail:"lily",larder:"bush",treat:"apple",scenery:["reeds","bush","flowers","rock"],colors:{far:"#87c69a",farDark:"#63a97e",ground:["#9ed3a4","#6fb894"],groundNear:"#8fcc9e",leaf:"#6fc08c",leafDark:"#46976a",bloom:"#ffe4a8"}},shore:{far:"sea",detail:"shells",larder:"coral",treat:"fish",scenery:["palm","rock","bush","flowers"],colors:{far:"#f0dcb0",farDark:"#dcbe94",ground:["#f6e6bd","#e6cf9a"],groundNear:"#f2dfb0",leaf:"#78c47e",leafDark:"#519a5c",wood:"#b9885a",stone:"#e0d6c0",stoneLight:"#f4ecdc",bloom:"#ffc0a8",water:"#5fbfe4",waterLight:"#bde8f6"}},dune:{far:"dunes",detail:"pebbles",larder:"basket",treat:"melon",scenery:["cactus","rock","flowers","bush"],colors:{far:"#f2d49a",farDark:"#dcb87c",ground:["#f8e2ae","#e8c78c"],groundNear:"#f4dca4",leaf:"#8cc078",leafDark:"#5f9455",wood:"#c08c58",stone:"#dccbaa",stoneLight:"#f2e7cd",bloom:"#ffb3c8"}},snowfield:{far:"peaks",detail:"snow",larder:"basket",treat:"carrot",scenery:["snowpine","snowdrift","rock","snowpine"],colors:{far:"#bcd0ea",farDark:"#93aed2",ground:["#eef5ff","#cfe0f4"],groundNear:"#e4eeff",leaf:"#5f9c78",leafDark:"#417a5c",wood:"#8a6a52",stone:"#c8d4e6",stoneLight:"#eaf1fa",bloom:"#c8dcff",glow:"#dbeaff",glowDeep:"#9fc4f0"}},glowvale:{far:"arch",detail:"spores",larder:"bush",treat:"glowberry",scenery:["mushroom","crystal","rock","bush"],colors:{far:"#6a5a94",farDark:"#4a3f70",ground:["#8f7fbc","#6b5c96"],groundNear:"#8474ae",leaf:"#7fc4a8",leafDark:"#4f9a80",wood:"#7a5f8e",stone:"#a89cc4",stoneLight:"#cfc6e4",bloom:"#c8a0ff",glow:"#a8f0e0",glowDeep:"#5fd8c4"}},cloudtop:{far:"cloudbank",detail:"sparkle",larder:"basket",treat:"starfruit",scenery:["cloudpuff","crystal","flowers","cloudpuff"],colors:{far:"#d2e0fa",farDark:"#b0c6ec",ground:["#e2ecff","#c2d4f0"],groundNear:"#d6e4fb",leaf:"#8ec8ea",leafDark:"#6aa6d6",wood:"#b0a8cc",stone:"#c8d6ee",stoneLight:"#e6eefc",bloom:"#ffd9f0",glow:"#fff0c8",glowDeep:"#ffd98a"}}},vn=Object.keys(O),ao={sprout:"meadow",bubs:"pond",zzz:"snowfield",tumble:"dune",mochi:"meadow",bloop:"pond",pebble:"snowfield",nibbles:"dune",pip:"grove",snug:"grove",noodle:"grove",cloudlet:"shore",waddle:"shore",glim:"glowvale",fizz:"glowvale",puff:"cloudtop"},so=e=>ao[e]??"meadow",tt=[{pieces:[[78,.56],[124,.6],[36,.86],[176,1.3]],larder:52,ball:78,nest:126},{pieces:[[86,.55],[118,.58],[166,.88],[26,1.26]],nest:74,ball:122,larder:148},{pieces:[[74,.52],[128,.62],[34,.9],[178,1.22]],larder:150,ball:124,nest:78},{pieces:[[90,.6],[112,.54],[168,.84],[24,1.28]],nest:120,ball:80,larder:54},{pieces:[[80,.58],[130,.53],[38,.94],[174,1.24]],larder:56,ball:82,nest:128},{pieces:[[88,.54],[120,.6],[164,.8],[30,1.3]],nest:72,ball:118,larder:146},{pieces:[[76,.57],[126,.52],[32,.88],[180,1.22]],larder:148,ball:120,nest:76}],An={x0:66,x1:134},rt={x0:88,x1:112},lo=3;function St(e,t){const o=[e.nest,e.larder,e.ball];let r=100,n=-1/0;for(let a=t.x0+12;a<=t.x1-12;a+=2){const s=Math.min(...o.map(i=>Math.abs(a-i)))-Math.abs(a-100)*.4;s>n&&(n=s,r=a)}return r}const co=12,io=30;function fo(e,t=ge){const o=[e.nest,e.larder,e.ball,St(e,T)],r=[];for(let a=Qe.x0+Je;a<=Qe.x1-Je;a+=2)a>=rt.x0&&a<=rt.x1||r.push(a);r.sort((a,l)=>Math.abs(l-100)-Math.abs(a-100));const n=[];for(const a of r){if(n.length>=t)break;o.some(l=>Math.abs(l-a)<co)||n.some(l=>Math.abs(l-a)<io)||n.push(a)}return n.sort((a,l)=>a-l)}const po=e=>c(f+10+(e-.5)*40),Ct=(e,t,o)=>Math.max(t,Math.min(o,e)),ho=6,uo=20,go=4;function yo(e,t){const o=e%12,r=Y(`t${L(e,t)}`)%go,n=i=>i>=ho&&i<=uo,a=n(o)===n(o+12)?r%2===1:n(o+12)!==(r===0),l=o+(a?12:0),s=Yr(l);return{hour24:l,pm:a,phase:s,night:D[s].night,orb:Lt(l)}}function ko(e,t,o){var h;const r=w[e]??w.mochi,[n,a,l]=r.palette,s={...no,...((h=O[t])==null?void 0:h.colors)??{}},i=et[o]??et.noon,d=(u,g=.1)=>b(b(u,l,g),i.color,i.amount);return{far:d(s.far),farDark:d(s.farDark),ground:[d(s.ground[0],.12),d(s.ground[1],.12)],groundNear:d(s.groundNear,.14),groundRim:b(d(s.ground[0],.12),"#2b2440",.34),leaf:d(s.leaf),leafDark:d(s.leafDark),wood:d(s.wood,.07),stone:d(s.stone,.07),stoneLight:d(s.stoneLight,.05),water:d(s.water,.07),waterLight:d(s.waterLight,.05),bloom:b(b(s.bloom,n,.42),i.color,i.amount*.5),accent:b(l,i.color,i.amount*.4),nest:b(s.nest,a,.45),nestDark:b(s.nestDark,l,.32),nestLight:b(s.nestLight,a,.5),glow:s.glow,glowDeep:s.glowDeep,ballA:l,ballB:a}}function $o(e,t){const o=j(e,t),r=so(o),n=O[r],a=ue(e,t),l=yo(e,t),s=tt[a*lo%tt.length],i=Y(`hab${L(e,t)}`)%1e5,d=s.pieces.map(([u,g],$)=>({id:n.scenery[(a+$)%n.scenery.length],x:u,scale:g,y:po(g),flip:(a+$)%2===1})),h=(We[n.larder]??We.bush).map(([u,g])=>({x:c(s.larder+u),y:c(m+g)}));return{id:L(e,t),species:o,biome:r,light:l,palette:ko(o,r,l.phase),scenery:d,props:{nest:{x:s.nest,y:m},ball:{x:s.ball,y:m},larder:{x:s.larder,y:m,kind:n.larder,treat:n.treat,spots:h}},home:{x:St(s,T),y:m},roam:{...T},furniture:[],spots:fo(s),seed:i}}function En(e){const t=$o(e.h,e.m),o={...t,furniture:mo(t,e==null?void 0:e.decor)},r=e==null?void 0:e.habitat;return!r||typeof r!="object"?o:{...o,...r,palette:{...o.palette,...r.palette??{}},props:{...o.props,...r.props??{}},light:{...o.light,...r.light??{}}}}function mo(e,t){const o=yt(t),r=e.spots??[],n=l=>{var s;return((s=W.get(l))==null?void 0:s.band)==="wide"},a=o.length===2&&!n(o[0])&&n(o[1])?[...r].reverse():r;return o.slice(0,r.length).map((l,s)=>({id:l,x:a[s],y:m}))}const bo=(e,t,o,r,n,a)=>{const l=se[e]??se.bush,s=n?`scale(${-r} ${r})`:`scale(${r})`;return`<g transform="translate(${t} ${o}) ${s}">${l(a)}</g>`};function Tn(e,{uid:t="h",label:o="",sleeping:r=!1}={}){const n=e.palette,a=D[e.light.phase]??D.noon,l=$e(e.seed+3),s=O[e.biome]??O.meadow,i=e.scenery.filter(g=>g.y<=m),d=e.scenery.filter(g=>g.y>m),h=g=>g.map($=>bo($.id,$.x,$.y,$.scale,$.flip,n)).join(""),u=e.light.night||e.biome==="glowvale";return`
<svg class="habitat" viewBox="0 0 ${S.w} ${S.h}" preserveAspectRatio="xMidYMax slice"
     role="img" aria-label="${o}" focusable="false">
  <defs>
    <linearGradient id="${t}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a.sky[0]}" />
      <stop offset="1" stop-color="${a.sky[1]}" />
    </linearGradient>
    <linearGradient id="${t}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${n.ground[0]}" />
      <stop offset="1" stop-color="${n.ground[1]}" />
    </linearGradient>
    <radialGradient id="${t}-glow">
      <stop offset="0" stop-color="${a.glow}" stop-opacity="0.85" />
      <stop offset="1" stop-color="${a.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <g class="hab-sky">
    <rect x="0" y="0" width="${S.w}" height="${S.h}" fill="url(#${t}-sky)" />
    ${Wr(e.light.phase,e.light.hour24,e.seed,t)}
  </g>

  <g class="hab-far">${(qe[s.far]??qe.hills)(n)}</g>

  <g class="hab-ground">
    ${Vr(n,t)}
    ${(Ye[s.detail]??Ye.grass)(n,l)}
  </g>

  <g class="hab-back">
    ${h(i)}
    ${(e.furniture??[]).map(g=>`<g class="hab-furniture" transform="translate(${g.x} ${g.y})">${(ce[g.id]??ce.flowerbed)(n)}</g>`).join("")}
    <g transform="translate(${e.props.nest.x} ${e.props.nest.y})">${Jr(n)}</g>
    <g transform="translate(${e.props.ball.x} ${e.props.ball.y})">${eo(n)}</g>
    <g transform="translate(${e.props.larder.x} ${e.props.larder.y})">
      ${(Ve[e.props.larder.kind]??Ve.bush)(n)}
    </g>
  </g>

  <g class="hab-actors"></g>

  <g class="hab-front">${h(d)}</g>

  ${u?`<g class="hab-motes">${to(n,e.seed,r?8:14)}</g>`:""}

  <rect class="hab-veil" x="0" y="0" width="${S.w}" height="${S.h}" fill="${a.veil}" />
  <rect class="hab-dusk" x="0" y="0" width="${S.w}" height="${S.h}" fill="#1b1930" />
</svg>`}const Dn=(e,t)=>(le[e]??le.berry)(t),In=e=>Xr(e),ot=5,xo=330,wo=.22,Mo=.54,Lo=.82,nt=.62,at=26;function Nn(e,t,o){if(e.resting)return{...e,bounce:0};const r=Ct(t,0,.05),n=o.floor??m,a=o.ceiling??8,l=(o.x0??T.x0)+ot,s=(o.x1??T.x1)-ot;let i=e.vx*(1-wo*r),d=e.vy+xo*r,h=e.x+i*r,u=e.y+d*r,g=0;u>=n?(u=n,d>at?(g=d,d=-d*Mo,i*=Lo):(d=0,i*=.7)):u<=a&&(u=a,d=Math.abs(d)*.4),h<=l?(h=l,i=Math.abs(i)*nt,g=Math.max(g,Math.abs(e.vx)*.6)):h>=s&&(h=s,i=-Math.abs(i)*nt,g=Math.max(g,Math.abs(e.vx)*.6));const $=u>=n&&Math.abs(d)<=at&&Math.abs(i)<2;return{...e,x:h,y:u,vx:$?0:i,vy:$?0:d,spin:(e.spin??0)+i*r*7,resting:$,bounce:g}}function Fn(e,t=T,o=Math.random){const r=t.x1-t.x0,n=(e-t.x0)/r,a=n<.28?1:n>.72||o()<.5?-1:1,l=(.14+o()*.34)*r;return c(Ct(e+a*l,t.x0,t.x1))}export{_r as $,yn as A,ot as B,$n as C,x as D,mn as E,xn as F,bn as G,lr as H,cr as I,Bo as J,Po as K,cn as L,Go as M,tn as N,G as O,wn as P,en as Q,L as R,w as S,C as T,W as U,nn as V,m as W,Ur as X,jr as Y,on as Z,fn as _,Tn as a,Nr as a$,rn as a0,gt as a1,Jt as a2,_o as a3,Io as a4,Oo as a5,bt as a6,gn as a7,jo as a8,sn as a9,we as aA,Rt as aB,jt as aC,Ht as aD,Me as aE,Vt as aF,Ce as aG,Yt as aH,Wt as aI,pe as aJ,ir as aK,pr as aL,dr as aM,Br as aN,ye as aO,ke as aP,Sr as aQ,B as aR,Ir as aS,Fo as aT,Qt as aU,ee as aV,Ae as aW,Ee as aX,Te as aY,De as aZ,Ie as a_,ln as aa,Ho as ab,pn as ac,Ut as ad,ce as ae,To as af,Zo as ag,j as ah,_ as ai,ie as aj,ne as ak,Pt as al,Co as am,So as an,v as ao,Eo as ap,Do as aq,Ao as ar,Pr as as,an as at,X as au,vo as av,Ft as aw,vr as ax,lt as ay,$o as az,In as b,Hr as b$,Dr as b0,Ar as b1,yr as b2,mr as b3,Tr as b4,$r as b5,br as b6,xr as b7,dt as b8,wr as b9,f as bA,b as bB,ko as bC,$e as bD,Sn as bE,ue as bF,K as bG,Cn as bH,ge as bI,yt as bJ,fo as bK,Je as bL,rr as bM,or as bN,ft as bO,it as bP,nr as bQ,tr as bR,Se as bS,Kt as bT,ct as bU,fe as bV,fr as bW,wt as bX,rt as bY,kt as bZ,$t as b_,Ue as ba,te as bb,re as bc,ht as bd,Cr as be,Pe as bf,je as bg,Or as bh,xt as bi,ae as bj,Mt as bk,Kr as bl,It as bm,so as bn,vn as bo,Mn as bp,Qe as bq,T as br,An as bs,tt as bt,St as bu,po as bv,Ln as bw,yo as bx,Yr as by,Lt as bz,Ct as c,Be as c0,mt as c1,Vo as d,Xo as e,un as f,Ro as g,En as h,ur as i,Qo as j,zo as k,dn as l,Ko as m,Fn as n,Yo as o,Jo as p,qo as q,Uo as r,Nn as s,Dn as t,Wo as u,hn as v,E as w,No as x,kn as y,Gr as z};
