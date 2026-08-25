const tr=[1,2,3,4,5,6,7,8,9,10,11,12],X=5,rr=X*6,T=e=>(e%360+360)%360,E=(e,t)=>(e%t+t)%t,rn=e=>T(e*6),on=(e,t)=>T(E(e,12)*30+t*.5),or=(e,t)=>T(Math.atan2(e,-t)*180/Math.PI);function ne(e,t,r,o){const n=o*Math.PI/180;return{x:e+r*Math.sin(n),y:t-r*Math.cos(n)}}function _e(e,t){const r=Math.abs(T(e)-T(t));return r>180?360-r:r}const nn=e=>E(Math.round(T(e)/rr)*X,60);function sn(e,t){const r=E(Math.round((T(e)-t*.5)/30),12);return r===0?12:r}function an({dx:e,dy:t,radius:r,hourDeg:o,minuteDeg:n}){const s=Math.hypot(e,t)/r;if(s<.18||s>1.15)return null;if(s<.55)return"hour";if(s>.72)return"minute";const l=or(e,t);return _e(l,o)<=_e(l,n)?"hour":"minute"}const S=(e,t)=>`${e}:${String(t).padStart(2,"0")}`;function ln(e){const[t,r]=String(e).split(":").map(Number);return{h:t,m:r}}function nr(e,t){let r=(t-e)%60;return r>30&&(r-=60),r<-30&&(r+=60),r}function cn({h:e,m:t},r){const o=nr(t,r),n=t+o;let s=e;return n>=60?s=e%12+1:n<0&&(s=e===1?12:e-1),{h:s,m:r,delta:o}}function sr(e,t){const r=Math.abs(e-t)%60;return r>30?60-r:r}function ar(e,t){const r=Math.abs(E(e,12)-E(t,12))%12;return r>6?12-r:r}function fn(e,t){const r=E(e.h,12)===E(t.h,12),o=e.m===t.m,n=sr(e.m,t.m),s=ar(e.h,t.h);let l;return r&&o?l="correct":o?l="hourOff":r?l="minuteOff":l="both",{verdict:l,correct:l==="correct",nearMiss:l!=="correct"&&n<=X&&s<=1,minuteDelta:n,hourDelta:s}}const lr=.8,R=[{id:0,minutes:[0]},{id:1,minutes:[30]},{id:2,minutes:[15,45]},{id:3,minutes:[5,10,20,25,35,40,50,55]}],J=R.length-1,kt=new Map;for(const e of R)for(const t of e.minutes)kt.set(t,e.id);const ir=e=>kt.get(e)??null;function be(e){const t=R[e];if(!t)return[];const r=[];for(const o of t.minutes)for(const n of tr)r.push({h:n,m:o,id:S(n,o),tier:e});return r}const $t=R.flatMap(e=>be(e.id));new Map($t.map(e=>[e.id,e]));function mt(e,t){const r=be(t);return r.length?r.filter(n=>{var s;return((s=e[n.id])==null?void 0:s.phase)==="graduated"}).length/r.length:0}function cr(e){let t=0;for(;t<J&&mt(e,t)>=lr;)t+=1;return t}function Ne(e,t){const r=[];for(let o=0;o<=Math.min(t,J);o+=1)for(const n of be(o))e[n.id]||r.push(n);return r}const L="nb",fr=[{id:"nb",label:"Norsk"},{id:"en",label:"English"}],pn=e=>fr.some(t=>t.id===e),Pe={en:["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"],nb:["","ett","to","tre","fire","fem","seks","sju","åtte","ni","ti","elleve","tolv"]},pr={0:"o'clock",5:"five past",10:"ten past",15:"quarter past",20:"twenty past",25:"twenty-five past",30:"half past",35:"twenty-five to",40:"twenty to",45:"quarter to",50:"ten to",55:"five to"},dr={0:{text:"klokka {h}",next:!1},5:{text:"fem over {h}",next:!1},10:{text:"ti over {h}",next:!1},15:{text:"kvart over {h}",next:!1},20:{text:"ti på halv {h}",next:!0},25:{text:"fem på halv {h}",next:!0},30:{text:"halv {h}",next:!0},35:{text:"fem over halv {h}",next:!0},40:{text:"ti over halv {h}",next:!0},45:{text:"kvart på {h}",next:!0},50:{text:"ti på {h}",next:!0},55:{text:"fem på {h}",next:!0}},hr=e=>(e-1+12)%12+1,le=(e,t)=>(Pe[e]??Pe[L])[hr(t)];function ur(e,t,r){if(e==="en"){const n=pr[r],s=le("en",r>30?t+1:t);return r===0?`${s} ${n}`:`${n} ${s}`}const o=dr[r];return o.text.replace("{h}",le("nb",o.next?t+1:t))}const K={en:["Biscuit","Marmalade","Waffle","Pumpkin","Sprinkle","Doodle","Clover","Peanut","Nugget","Custard","Pickle","Bumble","Dandelion","Truffle","Cinnamon","Gumdrop","Blossom","Turnip","Jellybean","Muffin","Toast","Pancake","Wobble","Pudding","Cricket","Sundae","Butterbean","Hopscotch","Marshmallow","Tangerine","Pinecone","Bramble","Mittens","Popcorn","Whisker","Fern","Gingersnap","Nutmeg","Poppy","Sesame","Twiglet","Apricot","Cobweb","Domino","Fizzle","Hazelnut","Pebble","Snowdrop"],nb:["Vaffel","Kanelbolle","Blåbær","Pannekake","Smultring","Kakao","Marsipan","Karamell","Lakris","Rosin","Sukkerbit","Krumkake","Tyttebær","Multe","Kløver","Løvetann","Kongle","Furunål","Mose","Dugg","Snøfnugg","Måneskinn","Solstråle","Stjerneskudd","Regnbue","Tordensky","Bølge","Rullestein","Perle","Knappen","Tøffel","Votten","Lua","Dott","Lubben","Tuss","Prikken","Flekken","Bamse","Nøtta","Fnugg","Kvist","Bringebær","Solsikke","Tjukken","Sprett","Trilla","Nusse"]},_={en:{back:"← Back to games","nav.scenes":"Scenes","tab.play":"Feed","tab.zoo":"Zoo","sound.on":"Sound on","sound.off":"Sound off","settings.open":"Settings","clock.aria":"Drag the clock hands to set the time","prompt.booting":"Waking the zoo…","prompt.egg":"A chilly egg! It hatches at…","prompt.egg1":"The egg is stirring! It hatches at…","prompt.egg2":"It is cracking open! It hatches at…","prompt.forgot":"{name} forgot their snack time. It is…","prompt.hungry":"{name} is hungry! They eat at…","prompt.snack":"{name} fancies a snack at…","button.warm":"Warm the egg!","button.feed":"Feed {name}!","cheer.1":"Yes!","cheer.2":"Perfect!","cheer.3":"Spot on!","cheer.4":"Nailed it!","cheer.5":"That is it!","cheer.streak":"{cheer} {n} in a row!","crack.1":"A crack appeared!","crack.2":"Another crack — it is nearly out!","hatch.stir":"Something is moving in there…","hatch.now":"It hatched!","hatch.hello":"{name} says hello!","evolve.now":"Something is happening…","evolve.done":"{name} is now {label}!","form.2":"the Bold","form.3":"the Grand","teach.nearMiss":"So close! ","teach.hourExact":"At {hour} o’clock the short fat hand points straight at the {hour}.","teach.hourPastHalf":"The short fat hand is past halfway from the {hour} to the {next} — but it is still the {hour}.","teach.hourJustLeft":"Look at the short fat hand: at {time} it has just left the {hour}.","teach.minuteOClock":"At {hour} o’clock the long hand points straight up.","teach.minuteCountOne":"Count round in fives: {jumps} jump past the top is {minutes} minutes.","teach.minuteCountMany":"Count round in fives: {jumps} jumps past the top is {minutes} minutes.","teach.both":"Here is where both hands go for {time}.","nap.title":"Pets are sleeping!","nap.copy":"That was a good session. Everyone is having a nap — you can still visit them in the zoo.","nap.countdown":"Waking up in","nap.wake":"Wake the pets","nap.visit":"Visit the zoo","nap.sleeping":"sleeping","zoo.empty":"No pets yet! Feed the clock a few times and your first egg will hatch.","zoo.egg":"{species} egg","zoo.eggTitle":"A chilly egg","zoo.eggTitleCracks":"A cracking egg, {n} of {of} cracks","zoo.rename":"What is this pet called?","habitat.back":"Back to the zoo","habitat.rename":"Give this pet a new name","habitat.aria":"{name}'s home","habitat.eggAria":"The home waiting for a {species} egg","habitat.hint":"Throw the ball, share a snack, or stroke {name}.","habitat.eggHint":"This home is waiting. Feed the clock, and the egg will hatch.","habitat.sleeping":"{name} is fast asleep. Sshh.","unlock.title":"New pets have arrived!","unlock.copy":"{tier} — {blurb}","unlock.close":"Let’s go","howto.summary":"How to play","howto.1":"A pet tells you when it eats. Drag the clock hands to that time.","howto.2":"The <b>long thin hand</b> is the minutes — it jumps five minutes at a time. The <b>short fat hand</b> is the hour.","howto.3":"Watch the short hand creep along as you move the long one. At quarter past four it has already left the 4 — that is how a real clock works.","howto.4":"Get one right four times and its egg cracks open into a pet of your own.","howto.5":"After a few minutes the pets get sleepy and the game stops. You can still wander the zoo while they nap.","howto.6":"Grown-ups: press and hold the title for progress.","grownups.title":"Progress","grownups.answered":"Times answered","grownups.accuracy":"Correct first try","grownups.streak":"Best streak","grownups.hatched":"Pets hatched","grownups.days":"Days played","grownups.fine":"Times are scheduled with a spaced-repetition algorithm: each one comes back just as it is about to be forgotten. Everything is stored in this browser only.","grownups.close":"Close","grownups.reset":"Start over","grownups.resetConfirm":"Start over? Every pet and all progress will be lost.","settings.title":"Settings","settings.language":"Language","settings.playTime":"Play time","settings.playTimeValue":"{n} minutes","settings.playTimeHelp":"How long a session lasts before the pets need a nap. Short sessions work best — three to five minutes.","settings.digital":"Show digital time","settings.digitalHelp":"Off by default. With it off the pets say their feeding time in words only, so the clock face is the only place to read it.","settings.transfer":"Move to another device","settings.transferHelp":"Save the zoo as a file, or copy it as a code to send in a message. Opening either one on another device brings every pet across. The zoo already on that device is replaced.","settings.done":"Done","transfer.exportFile":"Save file","transfer.copyCode":"Copy code","transfer.importFile":"Open file…","transfer.pasteCode":"Paste code","transfer.pastePrompt":"Paste the code from the other device:","transfer.confirm":"Replace this device’s zoo with the one you are bringing in? The pets here now will be lost.","transfer.saved":"Saved {file}.","transfer.copied":"Code copied — paste it on the other device.","transfer.copyFailed":"Could not reach the clipboard, so the code was saved as a file instead.","transfer.imported":"Brought in {n} pets.","transfer.badFile":"That does not look like a Pet Zoo save.","transfer.badApp":"That save is from a different game.","transfer.badVersion":"That save comes from a newer Pet Zoo than this one.","coins.name":"gold coins","coins.balance":"{n} gold coins","coins.earned":"+{n}","shop.open":"Go to the shop","shop.title":"The zoo shop","shop.intro":"Something nice for one of your pets.","shop.forPet":"Shopping for {name}","shop.pickPet":"Whose home is it for?","shop.empty":"No pets yet! Hatch your first egg and the shop will open.","shop.locked":"Locked","shop.lockedHelp":"Learn more times to open this one.","shop.owned":"In {name}’s home","shop.full":"{name}’s home is full. Sell something to make room.","shop.tooDear":"Not enough coins yet.","shop.buy":"Buy it!","shop.cancel":"Not yet","shop.confirm":"{item} — put it in {name}’s home for {price} gold coins?","shop.bought":"{name} loves it!","shop.sell":"Sell it back","shop.sellConfirm":"{item} — sell it back? You get all {price} gold coins again.","shop.sold":"Sold — {price} gold coins back.","shop.close":"Done","shop.tabHome":"The pets’ homes","shop.tabZoo":"The whole zoo","shop.ownedZoo":"In the zoo","shop.fullBackdrop":"There is already something far away at {name}’s. Sell it to make room.","shop.fullZoo":"The zoo yard is full. Sell something to make room.","shop.confirmZoo":"{item} — put it in the zoo for {price} gold coins?","shop.boughtZoo":"It looks lovely out there!","yard.label":"The zoo yard","shop.flowerbed":"Flower bed","shop.lantern":"Lantern","shop.house":"Little house","shop.swing":"Swing","shop.pond":"Pond","shop.hammock":"Hammock","shop.arch":"Flower arch","shop.windmill":"Windmill","shop.stump":"Tree stump","shop.sandpit":"Sandpit","shop.beehive":"Beehive","shop.feeder":"Bird feeder","shop.farGrove":"Faraway trees","shop.farMill":"Faraway mill","shop.farArch":"Faraway gateway","shop.farTower":"Faraway tower","shop.signpost":"Signpost","shop.topiary":"Trimmed tree","shop.bunting":"Bunting","shop.pathLamps":"Path lamps","shop.fountain":"Fountain","shop.statue":"Statue","tier.0.name":"O’clock","tier.0.blurb":"The big hand points straight up.","tier.1.name":"Half past","tier.1.blurb":"The big hand points straight down.","tier.2.name":"Quarter past and quarter to","tier.2.blurb":"The big hand points sideways.","tier.3.name":"Every five minutes","tier.3.blurb":"Count around the face in fives."},nb:{back:"← Tilbake til spillene","nav.scenes":"Visninger","tab.play":"Mate","tab.zoo":"Dyrehagen","sound.on":"Lyd på","sound.off":"Lyd av","settings.open":"Innstillinger","clock.aria":"Dra viserne for å stille klokka","prompt.booting":"Vekker dyrehagen…","prompt.egg":"Et kaldt egg! Det klekkes…","prompt.egg1":"Egget rører på seg! Det klekkes…","prompt.egg2":"Det slår sprekker! Det klekkes…","prompt.forgot":"{name} har glemt måltidet sitt. Klokka er…","prompt.hungry":"{name} er sulten! Spiser…","prompt.snack":"{name} vil gjerne ha en matbit…","button.warm":"Varm egget!","button.feed":"Mat {name}!","cheer.1":"Ja!","cheer.2":"Perfekt!","cheer.3":"Helt riktig!","cheer.4":"Sånn ja!","cheer.5":"Der satt den!","cheer.streak":"{cheer} {n} på rad!","crack.1":"Det kom en sprekk!","crack.2":"Enda en sprekk — det er nesten ute!","hatch.stir":"Noe rører seg der inne …","hatch.now":"Det klekket!","hatch.hello":"{name} sier hei!","evolve.now":"Noe skjer …","evolve.done":"{name} er nå {label}!","form.2":"den modige","form.3":"den store","teach.nearMiss":"Nesten! ","teach.hourExact":"Når klokka er {hour}, peker den korte tjukke viseren rett på {hourNum}-tallet.","teach.hourPastHalf":"Den korte tjukke viseren er mer enn halvveis fra {hourNum} til {next} — men timen er fortsatt {hourNum}.","teach.hourJustLeft":"Se på den korte tjukke viseren: {time} har den akkurat forlatt {hourNum}-tallet.","teach.minuteOClock":"Når klokka er {hour}, peker den lange viseren rett opp.","teach.minuteCountOne":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.minuteCountMany":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.both":"Her skal begge viserne stå når klokka er {time}.","nap.title":"Dyrene sover!","nap.copy":"Det var en god økt. Alle tar seg en blund — du kan fortsatt besøke dem i dyrehagen.","nap.countdown":"Våkner om","nap.wake":"Vekk dyrene","nap.visit":"Besøk dyrehagen","nap.sleeping":"sover","zoo.empty":"Ingen dyr ennå! Still klokka riktig noen ganger, så klekkes det første egget ditt.","zoo.egg":"{species}-egg","zoo.eggTitle":"Et kaldt egg","zoo.eggTitleCracks":"Et egg som slår sprekker, {n} av {of}","zoo.rename":"Hva heter dette dyret?","habitat.back":"Tilbake til dyrehagen","habitat.rename":"Gi dyret et nytt navn","habitat.aria":"Hjemmet til {name}","habitat.eggAria":"Hjemmet som venter på et {species}-egg","habitat.hint":"Kast ballen, gi en godbit, eller klapp {name}.","habitat.eggHint":"Dette hjemmet venter. Still klokka riktig, så klekkes egget.","habitat.sleeping":"{name} sover godt. Hysj.","unlock.title":"Nye dyr har kommet!","unlock.copy":"{tier} — {blurb}","unlock.close":"Kom igjen!","howto.summary":"Slik spiller du","howto.1":"Et dyr sier når det spiser. Dra viserne til det klokkeslettet.","howto.2":"Den <b>lange tynne viseren</b> er minuttene — den hopper fem minutter om gangen. Den <b>korte tjukke viseren</b> er timen.","howto.3":"Se hvordan den korte viseren sniker seg framover når du flytter den lange. Kvart over fire har den allerede forlatt 4-tallet — sånn funker en ekte klokke.","howto.4":"Klarer du samme klokkeslett fire ganger, sprekker egget til et dyr som blir ditt.","howto.5":"Etter noen minutter blir dyrene trøtte, og spillet stopper. Du kan fortsatt gå rundt i dyrehagen mens de sover.","howto.6":"Voksne: hold inne tittelen for å se framgang.","grownups.title":"Framgang","grownups.answered":"Klokkeslett svart på","grownups.accuracy":"Riktig på første forsøk","grownups.streak":"Beste rekke","grownups.hatched":"Dyr klekket","grownups.days":"Dager spilt","grownups.fine":"Klokkeslettene planlegges med en gjentakelsesalgoritme: hvert av dem kommer tilbake akkurat når det holder på å bli glemt. Alt lagres bare i denne nettleseren.","grownups.close":"Lukk","grownups.reset":"Start på nytt","grownups.resetConfirm":"Starte på nytt? Alle dyr og all framgang forsvinner.","settings.title":"Innstillinger","settings.language":"Språk","settings.playTime":"Spilletid","settings.playTimeValue":"{n} minutter","settings.playTimeHelp":"Hvor lenge en økt varer før dyrene må sove. Korte økter funker best — tre til fem minutter.","settings.digital":"Vis digital tid","settings.digitalHelp":"Av til vanlig. Når den er av, sier dyrene måltidet sitt bare med ord, så urskiva er eneste stedet å lese det.","settings.transfer":"Flytt til en annen enhet","settings.transferHelp":"Lagre dyrehagen som en fil, eller kopier den som en kode du kan sende i en melding. Åpner du en av delene på en annen enhet, blir alle dyrene med. Dyrehagen som allerede er der, blir erstattet.","settings.done":"Ferdig","transfer.exportFile":"Lagre fil","transfer.copyCode":"Kopier kode","transfer.importFile":"Åpne fil …","transfer.pasteCode":"Lim inn kode","transfer.pastePrompt":"Lim inn koden fra den andre enheten:","transfer.confirm":"Erstatte dyrehagen på denne enheten med den du henter inn? Dyrene som er her nå, forsvinner.","transfer.saved":"Lagret {file}.","transfer.copied":"Koden er kopiert — lim den inn på den andre enheten.","transfer.copyFailed":"Fikk ikke tak i utklippstavla, så koden ble lagret som fil i stedet.","transfer.imported":"Hentet inn {n} dyr.","transfer.badFile":"Dette ser ikke ut som en lagret dyrehage.","transfer.badApp":"Den lagringa er fra et annet spill.","transfer.badVersion":"Den lagringa er fra en nyere utgave av Dyrehagen enn denne.","coins.name":"gullmynter","coins.balance":"{n} gullmynter","coins.earned":"+{n}","shop.open":"Gå til butikken","shop.title":"Dyrehagebutikken","shop.intro":"Noe fint til ett av dyra dine.","shop.forPet":"Handler til {name}","shop.pickPet":"Hvem skal det være til?","shop.empty":"Ingen dyr ennå! Klekk det første egget, så åpner butikken.","shop.locked":"Låst","shop.lockedHelp":"Lær flere klokkeslett for å åpne denne.","shop.owned":"Hjemme hos {name}","shop.full":"Det er fullt hos {name}. Selg noe for å få plass.","shop.tooDear":"Ikke nok mynter ennå.","shop.buy":"Kjøp!","shop.cancel":"Ikke nå","shop.confirm":"{item} — sette den hjemme hos {name} for {price} gullmynter?","shop.bought":"{name} elsker den!","shop.sell":"Selg tilbake","shop.sellConfirm":"{item} — selge den tilbake? Du får alle {price} gullmyntene igjen.","shop.sold":"Solgt — {price} gullmynter tilbake.","shop.close":"Ferdig","shop.tabHome":"Hjemme hos dyra","shop.tabZoo":"Hele dyrehagen","shop.ownedZoo":"I dyrehagen","shop.fullBackdrop":"Det står noe langt borte hos {name} fra før. Selg det for å få plass.","shop.fullZoo":"Plassen ute i dyrehagen er full. Selg noe for å få plass.","shop.confirmZoo":"{item} — sette den ut i dyrehagen for {price} gullmynter?","shop.boughtZoo":"Så fint det ble ute!","yard.label":"Dyrehageplassen","shop.flowerbed":"Blomsterbed","shop.lantern":"Lykt","shop.house":"Lite hus","shop.swing":"Huske","shop.pond":"Dam","shop.hammock":"Hengekøye","shop.arch":"Blomsterbue","shop.windmill":"Vindmølle","shop.stump":"Trestubbe","shop.sandpit":"Sandkasse","shop.beehive":"Bikube","shop.feeder":"Fuglemater","shop.farGrove":"Trær langt borte","shop.farMill":"Mølle langt borte","shop.farArch":"Port langt borte","shop.farTower":"Tårn langt borte","shop.signpost":"Skilt","shop.topiary":"Formklippet tre","shop.bunting":"Vimpler","shop.pathLamps":"Lykter langs stien","shop.fountain":"Fontene","shop.statue":"Statue","tier.0.name":"Hele timer","tier.0.blurb":"Den lange viseren peker rett opp.","tier.1.name":"Halve timer","tier.1.blurb":"Den lange viseren peker rett ned.","tier.2.name":"Kvart over og kvart på","tier.2.blurb":"Den lange viseren peker til siden.","tier.3.name":"Hvert femte minutt","tier.3.blurb":"Tell rundt skiva i femmere."}},dn=e=>Object.keys(_[e]??{}),yr=(e,t)=>t?String(e).replace(/\{(\w+)\}/g,(r,o)=>Object.prototype.hasOwnProperty.call(t,o)?String(t[o]):r):String(e);function hn(e){const t=_[e]??_[L],r=_[L],o=(n,s)=>yr(t[n]??r[n]??n,s);return o.lang=_[e]?e:L,o.spoken=(n,s)=>ur(o.lang,n,s),o.hourWord=n=>le(o.lang,n),o.names=K[o.lang]??K[L],o}const je=[1,3,8],gr=2,kr=3,$r=7,mr=4,br=2,bt=e=>Math.min(Math.max(e-1,0),br),ie=[1,3,5],ce=ie.length;function Y(e){let t=0;for(let r=0;r<ie.length;r+=1)e>=ie[r]&&(t=r+1);return t}const xr=2.5,xt=1.3,wt=2.8,wr=.2,Lr=60,He=864e5,Lt=(e,t,r)=>Math.min(Math.max(e,t),r);function un({h:e,m:t,species:r,reviewClock:o=0}){return{h:e,m:t,tier:ir(t)??0,species:r,name:null,phase:"learning",step:0,dueStep:o+1,ease:xr,intervalDays:0,dueAt:0,reps:0,feeds:0,lapses:0,correctStreak:0,cracks:0,hatchedAt:null,seen:0,lastMs:0}}function Mr({correct:e,ms:t=0,reversals:r=0}){return e?t>2e4||r>=2?3:t>8e3||r>=1?4:5:0}const Sr=(e,t)=>Lt(e+(.1-(5-t)*(.08+(5-t)*.02)),xt,wt),Ar=(e,t,r)=>e<=1?1:e===2?3:Math.min(Math.round(t*r),Lr);function yn(e,{correct:t,ms:r=0,reversals:o=0,reviewClock:n,now:s}){const l=Mr({correct:t,ms:r,reversals:o}),a={...e,seen:e.seen+1,lastMs:r},i={quality:l,graduated:!1,hatched:!1,lapsed:!1,evolved:0,cracked:0};if(t){if(a.correctStreak=e.correctStreak+1,e.hatchedAt===null){const u=Math.max(e.cracks??0,bt(a.correctStreak));u>(e.cracks??0)&&(i.cracked=u),a.cracks=u}if(e.phase==="learning"){const u=e.hatchedAt===null?mr:kr;a.correctStreak>=u?(a.phase="graduated",a.reps=1,a.feeds=e.feeds+1,a.intervalDays=1,a.dueAt=s+He,a.dueStep=null,i.graduated=!0,a.hatchedAt===null&&(a.hatchedAt=s,i.hatched=!0)):(a.step=Math.min(e.step+1,je.length-1),a.dueStep=n+je[a.step])}else a.ease=Sr(e.ease,l),a.reps=e.reps+1,a.feeds=e.feeds+1,a.intervalDays=Ar(a.reps,e.intervalDays,a.ease),a.dueAt=s+a.intervalDays*He}else a.correctStreak=0,a.step=0,a.dueStep=n+gr,e.phase==="graduated"&&(a.phase="learning",a.ease=Lt(e.ease-wr,xt,wt),a.lapses=e.lapses+1,a.dueAt=0,a.intervalDays=0,a.reps=0,i.lapsed=!0);const f=Y(e.feeds),h=Y(a.feeds);return f>=1&&h>f&&(i.evolved=h),{item:a,events:i}}const fe=e=>e.phase==="learning",Cr=(e,t)=>e.phase==="graduated"&&e.dueAt<=t,vr=e=>Object.values(e).filter(fe).length,B=e=>(t,r)=>e(t[1])-e(r[1]);function gn(e,{now:t,exclude:r=null}={}){var f;const o=e.reviewClock+1,n=Object.entries(e.items).filter(([h])=>h!==r),s=n.filter(([,h])=>fe(h)&&h.dueStep!==null&&h.dueStep<=o).sort(B(h=>h.dueStep));if(s.length)return s[0][0];const l=n.filter(([,h])=>Cr(h,t)).sort(B(h=>h.dueAt));if(l.length)return l[0][0];if(vr(e.items)<$r){const h=Ne(e.items,e.tier)[0];if(h)return h.id}const a=n.filter(([,h])=>h.phase==="graduated").sort(B(h=>h.dueAt));if(a.length)return a[0][0];const i=n.filter(([,h])=>fe(h)).sort(B(h=>h.seen));return i.length?i[0][0]:r&&e.items[r]?r:((f=Ne(e.items,J)[0])==null?void 0:f.id)??S(1,0)}function kn(e){const t=Math.max(e.tier,cr(e.items));return{tier:t,unlocked:t>e.tier}}const xe=5,Dr=2,Tr=15,Er=.6,Zr=5,Ir=120*1e3,Rr=1800*1e3,Or=(e,t,r)=>Math.min(Math.max(e,t),r);function Fr(e){const t=Math.round(Number(e)),r=Or(Number.isFinite(t)?t:xe,Dr,Tr),o=r*60*1e3;return{minutes:r,hardMs:o,softMs:Math.round(o*Er),maxQuestions:r*Zr}}const we=Fr(xe);function $n(e){return{startedAt:e,answered:0,correct:0,napUntil:0}}const j=(e,t)=>Math.max(0,t-((e==null?void 0:e.startedAt)??t));function mn(e,{now:t,correct:r,limits:o=we}){return e.answered>=o.maxQuestions?"count":j(e,t)>=o.hardMs?"hard":r&&j(e,t)>=o.softMs?"soft":null}const bn=(e,t,r=we)=>j(e,t)>=r.hardMs,xn=e=>!!(e!=null&&e.startedAt),wn=(e,t)=>j(e,t)>=Rr,Ln=(e,t)=>({...e,napUntil:t+Ir}),Mn=(e,t)=>!!(e!=null&&e.napUntil)&&t<e.napUntil,Sn=(e,t)=>Math.max(0,((e==null?void 0:e.napUntil)??0)-t),An=(e,t,r=we)=>Math.min(1,j(e,t)/r.hardMs);function Cn(e){const t=Math.ceil(e/1e3);return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}const d="#43354f",Le=[37,63],ze=52,Me=[-1,1],Ge={round:{shape:'<ellipse cx="50" cy="54" rx="34" ry="32" />',halo:{cx:50,cy:54,rx:34,ry:32}},tall:{shape:'<ellipse cx="50" cy="52" rx="28" ry="34" />',halo:{cx:50,cy:52,rx:28,ry:34}},wide:{shape:'<ellipse cx="50" cy="58" rx="38" ry="28" />',halo:{cx:50,cy:58,rx:38,ry:28}},pear:{shape:'<path d="M50 22 C66 22 72 38 74 54 C76 72 66 86 50 86 C34 86 24 72 26 54 C28 38 34 22 50 22 Z" />',halo:{cx:50,cy:55,rx:25,ry:32}},bean:{shape:'<path d="M53 20 C71 20 81 37 79 56 C77 76 63 86 47 86 C30 86 21 71 21 54 C21 34 35 20 53 20 Z" />',halo:{cx:50,cy:53,rx:29,ry:33}},chunky:{shape:'<path d="M50 20 C74 20 86 34 86 55 C86 76 71 86 50 86 C29 86 14 76 14 55 C14 34 26 20 50 20 Z" />',halo:{cx:50,cy:53,rx:36,ry:33}}},_r=`
  <ellipse cx="35" cy="85" rx="10" ry="6" />
  <ellipse cx="65" cy="85" rx="10" ry="6" />`,U=(e,t,r=1)=>{const o=t*Math.PI/180;return{x:e.cx+Math.sin(o)*e.rx*r,y:e.cy-Math.cos(o)*e.ry*r}},Be={smooth:()=>"",fluffy:e=>Array.from({length:18},(t,r)=>{const o=U(e,r*20,1);return`<circle cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="7" />`}).join(""),spiky:e=>Array.from({length:5},(t,r)=>{const o=-70+r*22,n=U(e,o-9,.97),s=U(e,o+9,.97),l=U(e,o,1.22);return`<path d="M${n.x.toFixed(1)} ${n.y.toFixed(1)} L${l.x.toFixed(1)} ${l.y.toFixed(1)} L${s.x.toFixed(1)} ${s.y.toFixed(1)} Z" />`}).join("")},Nr=new Set(["horn","fin","antenna","tuft","leaf","antlers","rabbit"]),Ue={none:()=>"",roundears:()=>'<circle cx="26" cy="30" r="13" /><circle cx="74" cy="30" r="13" />',ears:()=>`
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
    <path d="M50 30 C48 20 52 16 50 10" fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round" />
    <circle cx="50" cy="8" r="6" fill="${e}" />`,tuft:()=>'<circle cx="41" cy="24" r="8" /><circle cx="50" cy="16" r="9" /><circle cx="59" cy="24" r="8" />',leaf:e=>`
    <path d="M50 28 C50 16 56 8 66 6 C66 18 60 26 50 28 Z" fill="${e}" />
    <path d="M50 30 C50 20 46 14 38 12 C38 22 42 28 50 30 Z" fill="${e}" />`},k="#ffffff",qe={round:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9.5" ry="10.5" fill="${d}" />
    <circle cx="${e-3.2}" cy="47.5" r="3.6" fill="${k}" />
    <circle cx="${e+3}" cy="56" r="1.8" fill="${k}" opacity="0.85" />`,oval:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="6.8" ry="11.5" fill="${d}" />
    <circle cx="${e-2.4}" cy="47" r="2.9" fill="${k}" />
    <circle cx="${e+2}" cy="56.5" r="1.4" fill="${k}" opacity="0.85" />`,sleepy:e=>`
    <path class="pet-eye" d="M${e-9} 50 Q${e} 45.5 ${e+9} 50 Q${e} 63.5 ${e-9} 50 Z" fill="${d}" />
    <circle cx="${e-3}" cy="53.5" r="3.2" fill="${k}" />
    <circle cx="${e+3.4}" cy="57" r="1.5" fill="${k}" opacity="0.85" />`,sparkle:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9" ry="11" fill="${d}" />
    <path d="M${e-3} 43 Q${e-2} 47 ${e+1.5} 48 Q${e-2} 49 ${e-3} 53
             Q${e-4} 49 ${e-7.5} 48 Q${e-4} 47 ${e-3} 43 Z" fill="${k}" />
    <circle cx="${e+3.5}" cy="56.5" r="1.9" fill="${k}" opacity="0.85" />`,lashed:(e,t)=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="8" ry="10.5" fill="${d}" />
    <circle cx="${e-2.6}" cy="47.5" r="3" fill="${k}" />
    <path d="M${e+t*7} 46 l${t*5.5} -4" stroke="${d}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*8.2} 50 l${t*6} -1.6" stroke="${d}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*7.6} 54 l${t*5.6} 1.8" stroke="${d}" stroke-width="2.4" stroke-linecap="round" fill="none" />`,beady:e=>`
    <circle class="pet-eye" cx="${e}" cy="52" r="5.6" fill="${d}" />
    <circle cx="${e-1.8}" cy="50" r="2.1" fill="${k}" />`},Pr=e=>`<g transform="translate(0 ${ze}) scale(1 0.08) translate(0 ${-ze})">${e}</g>`+Me.map((t,r)=>{const o=Le[r];return`<path d="M${o-9} 52 Q${o} 58.5 ${o+9} 52" fill="none" stroke="${d}"
                  stroke-width="3.2" stroke-linecap="round" />`}).join(""),Qe={none:()=>"",thick:(e,t)=>`<path d="M${e+t*8.5} 35.5 L${e-t*8} 35" stroke="${d}" stroke-width="4" stroke-linecap="round" fill="none" />`,arched:e=>`<path d="M${e-8.5} 37.5 Q${e} 30.5 ${e+8.5} 37.5" stroke="${d}" stroke-width="3.2" stroke-linecap="round" fill="none" />`,worried:(e,t)=>`<path d="M${e+t*8.5} 38.5 L${e-t*8.5} 33.5" stroke="${d}" stroke-width="3.4" stroke-linecap="round" fill="none" />`,bushy:e=>`<path d="M${e-9} 36.5 Q${e} 29.5 ${e+9} 36.5" stroke="${d}" stroke-width="5.6" stroke-linecap="round" fill="none" />`},Ke={happy:{rot:0,dy:-2.5},content:{rot:0,dy:0},hungry:{rot:-2,dy:-3.5},droopy:{rot:-9,dy:1.5},sleep:{rot:-4,dy:1}},Ye={happy:`<path d="M41 66 C45 75 55 75 59 66" fill="none" stroke="${d}" stroke-width="3.2" stroke-linecap="round" />`,content:`<path d="M44 67 C47 72 53 72 56 67" fill="none" stroke="${d}" stroke-width="3.2" stroke-linecap="round" />`,hungry:`<ellipse cx="50" cy="69" rx="7" ry="8" fill="${d}" />
           <ellipse cx="50" cy="73" rx="4.5" ry="3.5" fill="#ff9ec0" />`,droopy:`<path d="M43 71 C46 65 54 65 57 71" fill="none" stroke="${d}" stroke-width="3.2" stroke-linecap="round" />`,sleep:`<path d="M44 68 C47 73 53 73 56 68" fill="none" stroke="${d}" stroke-width="3.2" stroke-linecap="round" />`},g=e=>({back:"",front:e}),N=(e,t)=>({back:e,front:t}),We=(e,t,r)=>Array.from({length:10},(o,n)=>{const s=(n*36-90)*Math.PI/180,l=n%2?r*.45:r;return`${(e+Math.cos(s)*l).toFixed(1)} ${(t+Math.sin(s)*l).toFixed(1)}`}).join(" L"),jr={none:()=>g(""),roundSpecs:e=>g(`
      <g fill="${k}" fill-opacity="0.35" stroke="${d}" stroke-width="2.6">
        <circle cx="37" cy="52" r="12.5" /><circle cx="63" cy="52" r="12.5" />
      </g>
      <path d="M49.5 52 H50.5 M24.5 50 L16 47 M75.5 50 L84 47" stroke="${d}"
            stroke-width="2.6" stroke-linecap="round" fill="none" />`),squareSpecs:e=>g(`
      <g fill="${k}" fill-opacity="0.35" stroke="${d}" stroke-width="3.2">
        <rect x="24.5" y="41" width="25" height="22" rx="6" />
        <rect x="50.5" y="41" width="25" height="22" rx="6" />
      </g>
      <path d="M49.5 51 H50.5 M24 46 L16 44 M76 46 L84 44" stroke="${d}"
            stroke-width="3" stroke-linecap="round" fill="none" />`),goggles:e=>g(`
      <path d="M18 48 H82" stroke="${e.accent}" stroke-width="7" stroke-linecap="round" />
      <g fill="${k}" fill-opacity="0.4" stroke="${d}" stroke-width="3">
        <circle cx="37" cy="52" r="13.5" /><circle cx="63" cy="52" r="13.5" />
      </g>`),monocle:e=>g(`
      <circle cx="63" cy="52" r="13" fill="${k}" fill-opacity="0.35" stroke="${d}" stroke-width="2.8" />
      <path d="M63 65 C63 72 58 75 54 76" stroke="${d}" stroke-width="2" fill="none" stroke-linecap="round" />`),starShades:e=>g(`
      <path d="M${We(37,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${d}" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M${We(63,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${d}" stroke-width="2.2" stroke-linejoin="round" />`)},Hr=new Set(["cowlick","topknot","cap"]),zr={none:()=>g(""),fringe:e=>g(`<path d="M23 40 C26 24 40 18 50 18 C62 18 74 25 76 40
                    C70 32 62 34 57 39 C54 31 44 30 39 36 C34 32 27 34 23 40 Z"
                 fill="${e.accent}" />`),cowlick:e=>g(`<path d="M46 22 C44 12 52 6 60 4 C54 10 55 15 60 17 C54 19 49 20 46 26 Z" fill="${e.accent}" />`),topknot:e=>g(`<circle cx="50" cy="14" r="10" fill="${e.accent}" stroke="${d}" stroke-width="2.2" />
           <path d="M42 22 Q50 26 58 22" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round" />`),cap:e=>g(`<g fill="${e.accent}" stroke="${d}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M22 32 C22 16 78 16 78 32 Z" />
             <path d="M78 30 C88 30 90 36 88 38 L74 34 Z" />
           </g>
           <circle cx="50" cy="13" r="4" fill="${d}" />`),bow:e=>g(`<g transform="translate(26 24) rotate(-18)" fill="${e.accent}" stroke="${d}"
              stroke-width="2.2" stroke-linejoin="round">
             <path d="M0 0 C-9 -8 -14 -2 -12 4 C-10 9 -3 7 0 0 Z" />
             <path d="M0 0 C9 -8 14 -2 12 4 C10 9 3 7 0 0 Z" />
             <circle cx="0" cy="0" r="3.6" fill="${d}" stroke="none" />
           </g>`),flower:e=>g(`<g transform="translate(75 28)">
             ${[0,72,144,216,288].map(t=>{const r=t*Math.PI/180;return`<ellipse cx="${(Math.cos(r)*6).toFixed(1)}" cy="${(Math.sin(r)*6).toFixed(1)}" rx="5" ry="4" transform="rotate(${t})" fill="${k}" />`}).join("")}
             <circle cx="0" cy="0" r="4" fill="#ffd166" />
           </g>`)},Gr={none:()=>g(""),moustache:()=>g(`<path d="M50 64 C46 59 38 59 35 64 C38 68 46 68 50 64 Z
                    M50 64 C54 59 62 59 65 64 C62 68 54 68 50 64 Z" fill="${d}" />`),beard:()=>g(`<g fill="${d}">
             <circle cx="44" cy="78.5" r="6" /><circle cx="50" cy="81" r="7" /><circle cx="56" cy="78.5" r="6" />
           </g>`),whiskers:()=>g(`<g stroke="${d}" stroke-width="2" stroke-linecap="round" fill="none">
             <path d="M32 64 L18 61 M32 68 L17 68 M32 72 L19 76" />
             <path d="M68 64 L82 61 M68 68 L83 68 M68 72 L81 76" />
           </g>`),teeth:()=>g(`<rect x="45" y="70" width="4.6" height="7" rx="1.6" fill="${k}" stroke="${d}" stroke-width="1.4" />
           <rect x="50.4" y="70" width="4.6" height="7" rx="1.6" fill="${k}" stroke="${d}" stroke-width="1.4" />`),snout:e=>N(`<ellipse cx="50" cy="69" rx="15" ry="11.5" fill="${e.belly}" />
       <ellipse cx="50" cy="61" rx="5.5" ry="4" fill="${d}" />`,"")},Mt={none:()=>g(""),freckles:e=>g(`<g fill="${d}" opacity="0.4">
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
             fill="${e.accent}" opacity="0.6" />`,"")},Br={none:()=>g(""),scarf:e=>g(`<g fill="${e.accent}" stroke="${d}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M28 78 C38 85 62 85 72 78 C70 85 62 89 50 89 C38 89 30 85 28 78 Z" />
             <path d="M66 82 C72 84 74 90 71 94 C67 92 65 87 66 82 Z" />
           </g>`),bandana:e=>g(`<path d="M30 79 C40 85 60 85 70 79 L50 95 Z" fill="${e.accent}" stroke="${d}"
                 stroke-width="2.2" stroke-linejoin="round" />`),bowtie:e=>g(`<g transform="translate(50 82)" fill="${e.accent}" stroke="${d}" stroke-width="2.2"
              stroke-linejoin="round">
             <path d="M0 0 L-12 -6 L-12 6 Z" />
             <path d="M0 0 L12 -6 L12 6 Z" />
             <circle cx="0" cy="0" r="3.4" fill="${d}" stroke="none" />
           </g>`),backpack:e=>g(`<g stroke="${d}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M38 44 C33 56 33 68 37 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <path d="M62 44 C67 56 67 68 63 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <rect x="12" y="64" width="17" height="19" rx="6" fill="${e.accent}" />
             <path d="M12 71 H29" fill="none" />
           </g>`)},Ve={x:50,y:86},Xe={x:50,y:55},Je={1:{scale:.78,face:1,faceY:0},2:{scale:.9,face:.87,faceY:-5},3:{scale:1.02,face:.74,faceY:-10}},St=e=>Je[e]??Je[1],Ur=e=>{const{scale:t}=St(e);return`translate(${Ve.x} ${Ve.y}) scale(${t}) translate(-50 -86)`},qr=e=>{const{face:t,faceY:r}=St(e);return`translate(0 ${r}) translate(${Xe.x} ${Xe.y}) scale(${t}) translate(-50 -55)`},et={tail:e=>`<path d="M78 76 C92 74 96 62 90 52 C88 60 84 66 74 68 Z" fill="${e.accent}" />`,wings:e=>`
    <path d="M26 46 C8 34 2 48 6 60 C10 72 22 72 30 64 Z" fill="${e.accent}" opacity="0.92" />
    <path d="M74 46 C92 34 98 48 94 60 C90 72 78 72 70 64 Z" fill="${e.accent}" opacity="0.92" />`,mane:e=>Array.from({length:11},(t,r)=>{const o=(-100+r*20)*Math.PI/180;return`<circle cx="${(50+Math.sin(o)*36).toFixed(1)}" cy="${(58-Math.cos(o)*32).toFixed(1)}" r="9" />`}).join(""),crest:e=>Array.from({length:5},(t,r)=>{const o=30+r*10,n=r===2?20:12;return`<path d="M${o} 24 L${o+5} ${24-n-10} L${o+10} 24 Z" fill="${e.accent}"
                    stroke="${d}" stroke-width="1.8" stroke-linejoin="round" />`}).join(""),finback:e=>`<path d="M46 4 C66 14 80 32 84 54 C74 44 62 38 48 38 Z" fill="${e.accent}"
           stroke="${d}" stroke-width="2" stroke-linejoin="round" />`,plume:e=>`
    <path d="M76 74 C94 68 98 50 92 36 C88 48 82 58 72 64 Z" fill="${e.accent}" opacity="0.85" />
    <path d="M74 78 C90 76 96 64 94 52 C88 62 82 70 70 72 Z" fill="${e.accent}" />`},tt={bigEars:e=>`
    <circle cx="20" cy="26" r="18" /><circle cx="80" cy="26" r="18" />
    <circle cx="20" cy="26" r="10" fill="${e.belly}" /><circle cx="80" cy="26" r="10" fill="${e.belly}" />`,antennaArray:e=>`
    <g fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round">
      <path d="M50 28 C48 16 52 10 50 2" /><path d="M38 30 C32 20 30 14 26 8" /><path d="M62 30 C68 20 70 14 74 8" />
    </g>
    <circle cx="50" cy="2" r="7" fill="${e.accent}" />
    <circle cx="25" cy="7" r="5" fill="${e.accent}" /><circle cx="75" cy="7" r="5" fill="${e.accent}" />`,tallTuft:e=>`
    <path d="M50 30 C40 20 42 8 52 0 C50 10 56 14 60 10 C62 20 58 26 50 30 Z" fill="${e.accent}" />
    <circle cx="38" cy="24" r="7" /><circle cx="62" cy="24" r="7" />`,crownSpikes:e=>`
    <path d="M26 30 L30 12 L38 24 L46 6 L54 24 L62 12 L70 30 Z" fill="${e.accent}"
          stroke="${d}" stroke-width="2.2" stroke-linejoin="round" />`,longEars:e=>`
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
    </g>`},x={mochi:{name:"Mochi",body:"round",texture:"smooth",topper:"roundears",eyes:"round",brows:"none",palette:["#ffd9e2","#fff1f4","#ff9ec0"],grows:["mane","tail"],signature:"bigEars"},bloop:{name:"Bloop",body:"bean",texture:"smooth",topper:"antenna",eyes:"sparkle",brows:"none",palette:["#a5d8ff","#e3f2ff","#5fb3f5"],grows:["tail","wings"],signature:"antennaArray"},pip:{name:"Pip",body:"tall",texture:"fluffy",topper:"tuft",eyes:"oval",brows:"arched",palette:["#b2f2d7","#e6fff5","#4fd6a0"],grows:["crest","plume"],signature:"tallTuft"},waddle:{name:"Waddle",body:"wide",texture:"smooth",topper:"none",eyes:"beady",brows:"thick",palette:["#ffe9a8","#fff8dd","#f7b955"],grows:["tail","mane"],signature:"crownSpikes"},puff:{name:"Puff",body:"round",texture:"fluffy",topper:"ears",eyes:"lashed",brows:"arched",palette:["#d9c8ff","#f2ecff","#a884f5"],grows:["mane","wings"],signature:"longEars"},nibbles:{name:"Nibbles",body:"tall",texture:"smooth",topper:"rabbit",eyes:"round",brows:"worried",palette:["#ffd0b0","#fff0e5","#f79a63"],grows:["wings","plume"],signature:"hugeRabbit"},snug:{name:"Snug",body:"wide",texture:"fluffy",topper:"roundears",eyes:"sleepy",brows:"bushy",palette:["#cfe6c0","#eefae6","#8cc472"],grows:["wings","crest"],signature:"ramCurl"},glim:{name:"Glim",body:"pear",texture:"smooth",topper:"horn",eyes:"sparkle",brows:"thick",palette:["#ffc2b8","#fff0ed","#ff8a75"],grows:["finback","wings"],signature:"twinHorns"},noodle:{name:"Noodle",body:"tall",texture:"smooth",topper:"antlers",eyes:"beady",brows:"worried",palette:["#9fe5e0","#e4fbfa","#48c4bc"],grows:["finback","tail"],signature:"bigAntlers"},fizz:{name:"Fizz",body:"chunky",texture:"spiky",topper:"tuft",eyes:"sparkle",brows:"none",palette:["#ffc7ea","#fff0fa","#f778c4"],grows:["crest","plume"],signature:"flameCrest"},cloudlet:{name:"Cloudlet",body:"wide",texture:"fluffy",topper:"fin",eyes:"oval",brows:"none",palette:["#c9dcff","#eef4ff","#7ba2f0"],grows:["finback","crest"],signature:"stormFin"},pebble:{name:"Pebble",body:"round",texture:"smooth",topper:"none",eyes:"sleepy",brows:"thick",palette:["#dcd6e8","#f4f1f9","#a99cc4"],grows:["plume","mane"],signature:"crystal"},sprout:{name:"Sprout",body:"pear",texture:"smooth",topper:"leaf",eyes:"round",brows:"arched",palette:["#c4e8a0","#eefada","#82c44e"],grows:["mane","crest"],signature:"foliageCrown"},bubs:{name:"Bubs",body:"round",texture:"smooth",topper:"floppy",eyes:"lashed",brows:"none",palette:["#f0c2d8","#fdeef5","#d97fae"],grows:["tail","mane"],signature:"longFlop"},zzz:{name:"Zzz",body:"bean",texture:"fluffy",topper:"hound",eyes:"sleepy",brows:"worried",palette:["#bcc4f0","#e8ebfd","#7d8be0"],grows:["plume","tail"],signature:"moonHorns"},tumble:{name:"Tumble",body:"chunky",texture:"spiky",topper:"ram",eyes:"oval",brows:"bushy",palette:["#ffdcb0","#fff4e4","#f0a552"],grows:["crest","finback"],signature:"doubleRam"}},Qr=Object.keys(x),rt=[["mochi","bloop","pip","waddle"],["puff","nibbles","snug","glim"],["noodle","fizz","cloudlet","pebble"],["sprout","bubs","zzz","tumble"]];function ee(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t}function z(e,t){var n;const r=((n=R.find(s=>s.minutes.includes(t)))==null?void 0:n.id)??0,o=rt[r]??rt[0];return o[ee(S(e,t))%o.length]}const Kr=(e,t,r=L)=>{const o=K[r]??K[L],n=z(e,t),s=ee(`n${n}`)%o.length;return o[(s+Se(e,t))%o.length]},vn=(e,t=L)=>e.name||Kr(e.h,e.m,t),q={eyewear:"none",hair:"none",facialHair:"none",markings:"none",accessory:"none"},Yr=(e,t)=>{var r;return(((r=x[e])==null?void 0:r.grows)??[]).slice(0,Math.max(0,Math.min(t,ce)-1))};function pe(e,t=1){const r=e in x?e:"mochi",o=Math.max(1,Math.min(Math.round(t)||1,ce));return{species:r,...x[r],...q,form:o,anatomy:Yr(r,o),signature:o>=ce?x[r].signature:null}}const Wr=[["eyewear",["roundSpecs","squareSpecs","goggles","monocle","starShades"]],["hair",["fringe","cowlick","topknot","cap","bow","flower"]],["facialHair",["moustache","beard","whiskers","teeth","snout"]],["accessory",["scarf","bandana","bowtie","backpack"]]],ot=Object.keys(Mt),Vr=71;function nt(e){const t=Wr.map(([o,n])=>[o,o==="hair"&&e?n.filter(s=>!Hr.has(s)):n]),r=[{...q}];for(const[o,n]of t)for(const s of n)r.push({...q,[o]:s});for(let o=0;o<t.length;o+=1)for(let n=o+1;n<t.length;n+=1)for(const s of t[o][1])for(const l of t[n][1])r.push({...q,[t[o][0]]:s,[t[n][0]]:l});return r}const Xr={crowned:nt(!0),free:nt(!1)},Jr=e=>{var t;return Nr.has((t=x[e])==null?void 0:t.topper)},eo=e=>Xr[Jr(e)?"crowned":"free"],Q=new Map;for(const e of[...$t].sort((t,r)=>t.h-r.h||t.m-r.m)){const t=z(e.h,e.m);Q.has(t)||Q.set(t,[]),Q.get(t).push(e.id)}const At=e=>Q.get(e)??[],Se=(e,t)=>Math.max(0,At(z(e,t)).indexOf(S(e,t))),Dn=e=>to(e.h,e.m,Y(e.feeds??0)||1);function to(e,t,r=1){const o=z(e,t),n=Se(e,t),s=eo(o);return{...pe(o,r),...s[n*Vr%s.length],markings:ot[n%ot.length]}}const ro=e=>typeof e=="string"?pe(e):e??pe("mochi");function oo(e,t){const r=qe[e.eyes]??qe.round,o=Me.map((n,s)=>r(Le[s],n)).join("");return t==="sleep"?Pr(o):o}function no(e,t){const r=Qe[e.brows]??Qe.none,{rot:o,dy:n}=Ke[t]??Ke.content;return Me.map((s,l)=>{const a=Le[l],i=r(a,s);return i?`<g transform="translate(0 ${n}) rotate(${s===-1?o:-o} ${a} 37)">${i}</g>`:""}).join("")}function Tn(e,{mood:t="content",className:r="",title:o=""}={}){const n=ro(e),[s,l,a]=n.palette,i={body:s,belly:l,accent:a},f=Ge[n.body]??Ge.round,h=(Be[n.texture]??Be.smooth)(f.halo),u=Math.max(1,Math.min(n.form??1,3)),y=n.signature&&tt[n.signature]?tt[n.signature](i):(Ue[n.topper]??Ue.none)(a),$=(n.anatomy??[]).map(F=>et[F]?et[F](i):"").join(""),Wt=o||n.name||"pet",O=(F,Jt,er)=>(F[Jt]??F[er])(i),Vt=O(jr,n.eyewear,"none"),Xt=O(zr,n.hair,"none"),Re=O(Gr,n.facialHair,"none"),Oe=O(Mt,n.markings,"none"),Fe=O(Br,n.accessory,"none");return`
<svg class="pet form-${u} ${r}" viewBox="0 0 100 100" role="img" aria-label="${Wt}" focusable="false">
  ${o?`<title>${o}</title>`:""}
  <g class="pet-grow" transform="${Ur(u)}">
  <g class="pet-inner">
    <g fill="${n.texture==="spiky"?a:s}">${h}</g>
    <g fill="${a}">${$}</g>
    <g fill="${a}">${y}</g>
    ${Fe.back}
    <g fill="${a}">${_r}</g>
    <g class="pet-body" fill="${s}">${f.shape}</g>
    <ellipse cx="50" cy="64" rx="21" ry="17" fill="${l}" />
    ${Oe.back}${Re.back}
    <g class="pet-face" transform="${qr(u)}">
      ${oo(n,t)}
      ${Vt.front}
      ${Xt.front}
      ${no(n,t)}
      <ellipse cx="27" cy="62" rx="7" ry="4.2" fill="${a}" opacity="0.55" />
      <ellipse cx="73" cy="62" rx="7" ry="4.2" fill="${a}" opacity="0.55" />
      ${Oe.front}
      ${Ye[t]??Ye.content}
      ${Re.front}
    </g>
    ${Fe.front}
  </g>
  </g>
</svg>`}const Ct=["M69 27 L62.5 33.5 L68 38.5 L61 44.5 L64.5 50","M31 43 L38 49 L31.5 56 L38.5 63 L33 70","M21 59 L32 55 L43 62.5 L55 54.5 L66.5 62 L79 55.5"],so=Ct.length;function En(e,{cracks:t=0,className:r="",title:o="A chilly egg"}={}){const n=x[e]??x.mochi,[s,l,a]=n.palette,i=Math.max(0,Math.min(so,Math.round(t))),f=Array.from({length:i},(h,u)=>`<path class="egg-crack egg-crack-${u+1}" pathLength="1" d="${Ct[u]}" />`).join("");return`
<svg class="pet egg egg-cracks-${i} ${r}" viewBox="0 0 100 100" role="img" aria-label="${o}" focusable="false">
  <title>${o}</title>
  <g class="pet-inner">
    <path class="egg-shell" fill="${s}"
      d="M50 12 C68 12 80 40 80 58 C80 78 66 90 50 90 C34 90 20 78 20 58 C20 40 32 12 50 12 Z" />
    <ellipse cx="41" cy="62" rx="15" ry="18" fill="${l}" opacity="0.75" />
    <circle cx="61" cy="40" r="6" fill="${a}" opacity="0.65" />
    <circle cx="36" cy="34" r="4.5" fill="${a}" opacity="0.65" />
    <circle cx="66" cy="68" r="5" fill="${a}" opacity="0.5" />
    <circle cx="44" cy="78" r="3.5" fill="${a}" opacity="0.5" />
    ${f}
  </g>
</svg>`}function Zn(e,t,{size:r=34}={}){const n=ne(50,50,24,e%12*30+t*.5),s=ne(50,50,36,t*6),l=Array.from({length:12},(a,i)=>{const f=ne(50,50,41,i*30);return`<circle cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="2.6" />`}).join("");return`
<svg class="collar-clock" width="${r}" height="${r}" viewBox="0 0 100 100" role="img"
     aria-label="${S(e,t)}" focusable="false">
  <circle cx="50" cy="50" r="46" class="collar-face" />
  <g class="collar-ticks">${l}</g>
  <line x1="50" y1="50" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}" class="collar-hand hour" />
  <line x1="50" y1="50" x2="${s.x.toFixed(1)}" y2="${s.y.toFixed(1)}" class="collar-hand minute" />
  <circle cx="50" cy="50" r="5" class="collar-pin" />
</svg>`}function In(e,t,{napping:r=!1}={}){return r?"sleep":e.hatchedAt===null?"content":e.phase==="learning"?e.lapses>0?"droopy":"content":e.dueAt<=t?"hungry":"happy"}const Ae=[{id:"stump",price:35,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"flowerbed",price:45,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"lantern",price:60,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"sandpit",price:70,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"swing",price:80,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"house",price:130,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"beehive",price:75,tier:2,scope:"home",slot:"ground",band:"narrow"},{id:"hammock",price:80,tier:2,scope:"home",slot:"ground",band:"wide"},{id:"pond",price:90,tier:2,scope:"home",slot:"ground",band:"narrow"},{id:"feeder",price:95,tier:3,scope:"home",slot:"ground",band:"narrow"},{id:"arch",price:140,tier:3,scope:"home",slot:"ground",band:"wide"},{id:"windmill",price:140,tier:3,scope:"home",slot:"ground",band:"narrow"},{id:"farGrove",price:50,tier:0,scope:"home",slot:"backdrop"},{id:"farMill",price:85,tier:1,scope:"home",slot:"backdrop"},{id:"farArch",price:120,tier:2,scope:"home",slot:"backdrop"},{id:"farTower",price:165,tier:3,scope:"home",slot:"backdrop"},{id:"signpost",price:55,tier:0,scope:"zoo"},{id:"topiary",price:90,tier:1,scope:"zoo"},{id:"bunting",price:110,tier:1,scope:"zoo"},{id:"pathLamps",price:150,tier:2,scope:"zoo"},{id:"fountain",price:200,tier:3,scope:"zoo"},{id:"statue",price:250,tier:3,scope:"zoo"}],Ce={ground:2,backdrop:1},ao=Ce.ground,ve=3,C=new Map(Ae.map(e=>[e.id,e])),G=e=>{var t;return((t=C.get(e))==null?void 0:t.slot)??"ground"},vt=e=>{var t;return((t=C.get(e))==null?void 0:t.scope)??"home"},Dt=e=>vt(e)==="home",Tt=e=>vt(e)==="zoo",Rn=Ae.filter(e=>e.scope==="home"),On=Ae.filter(e=>e.scope==="zoo"),Fn=(e,t)=>{var r;return(((r=C.get(e))==null?void 0:r.tier)??J+1)<=t},te=e=>Array.isArray(e==null?void 0:e.decor)?e.decor:[],Et=(e,t)=>te(e).includes(t),lo=(e,t)=>te(e).filter(r=>G(r)===t).length,io=(e,t="ground")=>lo(e,t)>=(Ce[t]??0);function De(e){if(!Array.isArray(e))return[];const t=[],r={};for(const o of e){if(!C.has(o)||!Dt(o)||t.includes(o))continue;const n=G(o);(r[n]??0)>=(Ce[n]??0)||(r[n]=(r[n]??0)+1,t.push(o))}return t}function Te(e){if(!Array.isArray(e))return[];const t=[];for(const r of e)if(C.has(r)&&Tt(r)&&!t.includes(r)&&t.push(r),t.length>=ve)break;return t}function _n(e,t){return!C.has(t)||!Dt(t)||Et(e,t)||io(e,G(t))?e:{...e,decor:[...te(e),t]}}function Nn(e,t){return Et(e,t)?{...e,decor:te(e).filter(r=>r!==t)}:e}const D=e=>Array.isArray(e)?e:[],Zt=(e,t)=>D(e).includes(t),co=e=>D(e).length>=ve;function Pn(e,t){return!C.has(t)||!Tt(t)||Zt(e,t)||co(e)?D(e):[...D(e),t]}function jn(e,t){return Zt(e,t)?D(e).filter(r=>r!==t):D(e)}const It=6,Rt=[0,0,10,16],fo=30,Hn=6,st=6,po=12;function zn(e){if(!e)return 0;let t=0;return e.hatched&&(t+=It),e.evolved&&(t+=Rt[e.evolved]??0),t}function Gn(e,t){const r=Array.isArray(e)?e:[];if(r[r.length-1]!==t)return 0;const o=r[r.length-2];if(!o)return st;const n=new Date(`${t}T00:00:00Z`);return n.setUTCDate(n.getUTCDate()-1),o===n.toISOString().slice(0,10)?po:st}const ho=40,uo=30,yo=50,go=7;function ko(e){const t=Array.isArray(e)?e:[];let r=0,o=null;for(let n=t.length-1;n>=0;n-=1){const s=t[n];if(typeof s!="string"||o!==null&&s!==o)break;r+=1;const l=new Date(`${s}T00:00:00Z`);if(Number.isNaN(l.getTime()))return r;l.setUTCDate(l.getUTCDate()-1),o=l.toISOString().slice(0,10)}return r}function $o(e,t){const r=[],o=e??{};for(const s of R)mt(o,s.id)>=1&&r.push(`mastery:${s.id}`);const n=Math.floor(ko(t==null?void 0:t.daysPlayed)/go);for(let s=1;s<=n;s+=1)r.push(`week:${s}`);for(const s of Qr){const l=At(s);l.length&&l.every(a=>{var i;return(i=o[a])==null?void 0:i.hatchedAt})&&r.push(`species:${s}`)}return r}function mo(e){const t=String(e??"").split(":")[0];return t==="mastery"?ho:t==="week"?uo:t==="species"?yo:0}function Bn(e,t,r){const o=new Set(Array.isArray(r)?r:[]),n=$o(e,t).filter(s=>!o.has(s));return{ids:n,coins:n.reduce((s,l)=>s+mo(l),0)}}const M=e=>Math.max(0,Math.floor(Number.isFinite(e)?e:0)),Ot=M,Un=(e,t)=>M(e)+M(t),bo=(e,t)=>M(e)>=M(t),qn=(e,t)=>bo(e,t)?M(e)-M(t):M(e);function Qn(e,t=0){let r=0;for(const o of Object.values(e??{})){o!=null&&o.hatchedAt&&(r+=It);const n=Y(typeof(o==null?void 0:o.feeds)=="number"?o.feeds:0);for(let s=2;s<=n;s+=1)r+=Rt[s]??0}return r+M(t)*fo}const Ee="pet-zoo/v1",Ze=1,xo=400;function I(e){return{version:Ze,createdAt:e,lastPlayedAt:e,reviewClock:0,tier:0,coins:0,zooDecor:[],milestones:[],coinsGrantedAt:0,milestonesGrantedAt:0,settings:{sound:!0,haptics:!0,language:L,playMinutes:xe,showDigital:!1},session:{startedAt:0,answered:0,correct:0,napUntil:0},stats:{totalAnswered:0,totalCorrect:0,streak:0,bestStreak:0,daysPlayed:[]},items:{}}}const wo=e=>typeof e=="string"&&e.length>0&&e.length<=40,Ft=e=>Array.isArray(e)?e.filter(wo):[],_t=e=>new Date(e).toISOString().slice(0,10);function Kn(e,t=re()){try{const r=t==null?void 0:t.getItem(Ee);if(!r)return I(e);const o=JSON.parse(r);return!o||o.version!==Ze||typeof o.items!="object"?I(e):{...I(e),...o,coins:Ot(o.coins),zooDecor:Te(o.zooDecor),milestones:Ft(o.milestones),settings:{...I(e).settings,...o.settings},items:Nt(o.items)}}catch{return I(e)}}function Nt(e){const t={};for(const[r,o]of Object.entries(e??{})){const n=typeof(o==null?void 0:o.feeds)=="number"?o.feeds:(o==null?void 0:o.reps)||(o!=null&&o.hatchedAt?1:0),s=typeof(o==null?void 0:o.cracks)=="number"?o.cracks:bt((o==null?void 0:o.correctStreak)??0),l=De(o==null?void 0:o.decor),a=typeof(o==null?void 0:o.feeds)=="number"&&typeof(o==null?void 0:o.cracks)=="number"&&Array.isArray(o==null?void 0:o.decor)&&l.length===o.decor.length;t[r]=a?o:{...o,feeds:n,cracks:s,decor:l}}return t}function Lo(e,t=re()){try{return t==null||t.setItem(Ee,JSON.stringify(e)),!0}catch{return!1}}function Yn(e=re()){try{e==null||e.removeItem(Ee)}catch{}}function re(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function Wn(e=re()){let t=null,r=null;const o=()=>{clearTimeout(t),t=null,r&&Lo(r,e),r=null};return{save(n){r=n,t===null&&(t=setTimeout(o,xo))},flush:o}}function Vn(e,t){const r=_t(t),o=e.stats.daysPlayed;return o[o.length-1]===r?e:{...e,stats:{...e.stats,daysPlayed:[...o.slice(-59),r]}}}const Pt="pet-zoo",jt=1,de="petzoo1:";class v extends Error{constructor(t){super(t),this.name="TransferError",this.key=t}}function Xn(e,t){return{app:Pt,format:jt,version:Ze,exportedAt:t,createdAt:e.createdAt,lastPlayedAt:e.lastPlayedAt,reviewClock:e.reviewClock,tier:e.tier,coins:e.coins,zooDecor:e.zooDecor,milestones:e.milestones,stats:e.stats,items:e.items}}const Mo=e=>JSON.stringify(e,null,2),Jn=e=>`pet-zoo-${_t(e)}.json`,at=32768;function So(e){let t="";for(let r=0;r<e.length;r+=at)t+=String.fromCharCode(...e.subarray(r,r+at));return btoa(t)}function Ao(e){const t=atob(e),r=new Uint8Array(t.length);for(let o=0;o<t.length;o+=1)r[o]=t.charCodeAt(o);return r}function es(e){const t=new TextEncoder().encode(Mo(e));return de+So(t)}const W=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);function ts(e){const t=String(e??"").trim();if(!t)throw new v("transfer.badFile");let r=t;if(t.startsWith(de))try{const n=t.slice(de.length).replace(/\s+/g,"");r=new TextDecoder().decode(Ao(n))}catch{throw new v("transfer.badFile")}let o;try{o=JSON.parse(r)}catch{throw new v("transfer.badFile")}if(!W(o))throw new v("transfer.badFile");if(o.app!==Pt)throw new v("transfer.badApp");if(!(o.format<=jt))throw new v("transfer.badVersion");if(!W(o.items))throw new v("transfer.badFile");return{...o,items:Co(o.items)}}function Co(e){const t={};for(const[r,o]of Object.entries(e)){if(!W(o))continue;const{h:n,m:s}=o;!Number.isInteger(n)||n<1||n>12||!Number.isInteger(s)||s<0||s>59||s%X!==0||r===S(n,s)&&(t[r]=o)}return Nt(t)}const rs=e=>Object.values(e).filter(t=>t.hatchedAt!==null&&t.hatchedAt!==void 0).length;function os(e,t,r){const o=I(r);return{...o,createdAt:t.createdAt??o.createdAt,lastPlayedAt:t.lastPlayedAt??r,reviewClock:Number.isFinite(t.reviewClock)?t.reviewClock:0,tier:Number.isFinite(t.tier)?t.tier:0,coins:Ot(t.coins),zooDecor:Te(t.zooDecor),milestones:Ft(t.milestones),milestonesGrantedAt:Array.isArray(t.milestones)?r:0,coinsGrantedAt:Number.isFinite(t.coins)?r:0,stats:{...o.stats,...W(t.stats)?t.stats:{}},items:t.items,settings:e.settings,session:o.session}}const m={w:200,h:120},p=62,b=96,P={x0:40,x1:160},Z={x0:62,x1:138},ns=46,c=e=>Number(e.toFixed(2));function oe(e){let t=Math.floor(e)%2147483647+1;return t<=0&&(t+=2147483646),()=>(t=t*48271%2147483647,(t-1)/2147483646)}const A={dawn:{sky:["#f6b98a","#ffe6cd"],orb:"sun",orbFill:"#ffd27a",glow:"#ffd9a8",veil:"rgba(255, 176, 120, 0.16)",night:!1},morning:{sky:["#a8dcff","#e8f6ff"],orb:"sun",orbFill:"#ffe293",glow:"#fff3c4",veil:"rgba(255, 246, 214, 0.10)",night:!1},noon:{sky:["#8ecfff","#e4f4ff"],orb:"sun",orbFill:"#fff2a8",glow:"#fffbdd",veil:"rgba(255, 255, 255, 0.06)",night:!1},afternoon:{sky:["#ffcf96","#fff0d6"],orb:"sun",orbFill:"#ffc860",glow:"#ffe0a5",veil:"rgba(255, 190, 120, 0.13)",night:!1},dusk:{sky:["#7f6bc4","#ffb493"],orb:"sun",orbFill:"#ff9d6e",glow:"#ffc7a0",veil:"rgba(120, 96, 190, 0.18)",night:!1},night:{sky:["#2f3f7a","#6a7cb8"],orb:"moon",orbFill:"#fdf8dc",glow:"#cfd8ff",veil:"rgba(40, 52, 110, 0.26)",night:!0}},ss=Object.keys(A);function Ht(e){const t=(Math.round(e)%24+24)%24;return t>=5&&t<7?"dawn":t>=7&&t<11?"morning":t>=11&&t<14?"noon":t>=14&&t<17?"afternoon":t>=17&&t<20?"dusk":"night"}function zt(e){const t=(Math.round(e)%24+24)%24,o=(t>=5&&t<19?(t-5)/14:((t<5?t+24:t)-19)/10)*Math.PI;return{x:c(100-Math.cos(o)*52),y:c(p-12-Math.sin(o)*34)}}function Gt(e,t,r,o){const n=A[e]??A.noon,s=zt(t),l=oe(r+17),a=`
    <circle cx="${s.x}" cy="${s.y}" r="22" fill="url(#${o}-glow)" />
    ${n.orb==="moon"?`<circle cx="${s.x}" cy="${s.y}" r="7.5" fill="${n.orbFill}" />
           <circle cx="${c(s.x+2.6)}" cy="${c(s.y-2)}" r="1.5" fill="#e8e0bd" opacity="0.7" />
           <circle cx="${c(s.x-1.8)}" cy="${c(s.y+2.4)}" r="1.1" fill="#e8e0bd" opacity="0.6" />`:`<circle cx="${s.x}" cy="${s.y}" r="9" fill="${n.orbFill}" />`}`;return n.night?`${Array.from({length:34},()=>{const h=c(l()*200),u=c(l()**1.6*(p-6)),y=c(.5+l()*.9);return`<circle cx="${h}" cy="${u}" r="${y}" fill="#fdf8dc" opacity="${c(.35+l()*.5)}" />`}).join("")}${a}`:`${Array.from({length:3},(f,h)=>{const u=c(18+l()*150),y=c(8+l()*28),$=c(.7+l()*.7);return`<g transform="translate(${u} ${y}) scale(${$})" fill="#ffffff" opacity="${c(.5+h*.08)}">
      <ellipse cx="0" cy="0" rx="13" ry="6" />
      <circle cx="-5" cy="-2.5" r="6" />
      <circle cx="4.5" cy="-3.5" r="7.5" />
    </g>`}).join("")}${a}`}const he={hills:e=>`
    <ellipse cx="34" cy="${p+4}" rx="60" ry="22" fill="${e.farDark}" />
    <ellipse cx="132" cy="${p+2}" rx="74" ry="26" fill="${e.far}" />
    <ellipse cx="86" cy="${p+8}" rx="52" ry="18" fill="${e.farDark}" opacity="0.7" />`,treeline:e=>{const t=Array.from({length:13},(r,o)=>{const n=c(2+o*16.2),s=c(13+o*7%5*2.6);return`<path d="M${n} ${p+3} L${c(n+5.2)} ${c(p+3-s)} L${c(n+10.4)} ${p+3} Z" />`}).join("");return`<g fill="${e.farDark}">${t}</g>
      <rect x="0" y="${p}" width="200" height="8" fill="${e.far}" opacity="0.55" />`},sea:e=>`
    <rect x="0" y="${p-16}" width="200" height="26" fill="${e.water}" />
    <rect x="0" y="${p-16}" width="200" height="3" fill="${e.waterLight}" opacity="0.7" />
    <ellipse cx="100" cy="${p+6}" rx="120" ry="10" fill="${e.waterLight}" opacity="0.45" />`,dunes:e=>`
    <ellipse cx="40" cy="${p+6}" rx="66" ry="20" fill="${e.far}" />
    <ellipse cx="150" cy="${p+3}" rx="70" ry="17" fill="${e.farDark}" />`,peaks:e=>`
    <path d="M-6 ${p+4} L38 ${p-30} L82 ${p+4} Z" fill="${e.farDark}" />
    <path d="M52 ${p+4} L104 ${p-38} L156 ${p+4} Z" fill="${e.far}" />
    <path d="M132 ${p+4} L172 ${p-24} L212 ${p+4} Z" fill="${e.farDark}" />
    <path d="M104 ${p-38} L92 ${p-24} L104 ${p-27} L116 ${p-22} Z" fill="#ffffff" opacity="0.85" />`,arch:e=>`
    <ellipse cx="62" cy="${p+3}" rx="52" ry="17" fill="${e.farDark}" />
    <ellipse cx="146" cy="${p+4}" rx="58" ry="19" fill="${e.far}" />
    <ellipse cx="104" cy="${p+1}" rx="21" ry="15" fill="${e.glowDeep}" />
    <ellipse cx="104" cy="${p+2}" rx="13" ry="9" fill="${e.glow}" opacity="0.7" />`,cloudbank:e=>`
    <g fill="${e.far}">
      <ellipse cx="42" cy="${p+6}" rx="54" ry="17" />
      <ellipse cx="146" cy="${p+3}" rx="60" ry="15" />
      <circle cx="70" cy="${p-4}" r="13" />
      <circle cx="128" cy="${p-6}" r="15" />
    </g>`},lt=`M0 ${p+2}
   C 34 ${p-4}, 68 ${p+6}, 100 ${p+1}
   C 136 ${p-5}, 170 ${p+5}, 200 ${p}`;function Bt(e,t){return`
    <path d="${lt} L200 120 L0 120 Z" fill="url(#${t}-ground)" />
    <path d="${lt}" fill="none" stroke="${e.groundRim}" stroke-width="1.4" opacity="0.55" />
    <path d="M0 ${b+4}
             C 46 ${b-2}, 120 ${b+7}, 200 ${b}
             L200 120 L0 120 Z"
          fill="${e.groundNear}" opacity="0.55" />`}const ue={grass:(e,t)=>Array.from({length:26},()=>{const r=c(t()*200),o=c(p+6+t()*50),n=c(2.6+t()*3.4);return`<path d="M${r} ${o} q${c(.8+t())} ${-n} ${c(1.8+t())} ${c(-n*.6)}" stroke="${e.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55" />`}).join(""),fern:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),o=c(p+8+t()*48),n=c(.6+t()*.6);return`<g transform="translate(${r} ${o}) scale(${n})" fill="${e.leafDark}" opacity="0.5">
        <ellipse cx="-3" cy="-2" rx="4" ry="1.6" transform="rotate(-25 -3 -2)" />
        <ellipse cx="3" cy="-2" rx="4" ry="1.6" transform="rotate(25 3 -2)" />
        <ellipse cx="0" cy="-4.5" rx="3.4" ry="1.5" />
      </g>`}).join(""),shells:(e,t)=>Array.from({length:18},()=>{const r=c(t()*200),o=c(p+10+t()*46),n=c(1.1+t()*1.5);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.7)}" fill="${e.bloom}" opacity="0.6" />`}).join(""),pebbles:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),o=c(p+8+t()*48),n=c(1+t()*1.8);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.65)}" fill="${e.stone}" opacity="0.5" />`}).join(""),lily:(e,t)=>Array.from({length:9},()=>{const r=c(t()*200),o=c(p+10+t()*42),n=c(3+t()*2.6);return`<g transform="translate(${r} ${o})">
        <circle r="${n}" fill="${e.leaf}" opacity="0.8" />
        <path d="M0 0 L${n} ${c(-n*.4)} A${n} ${n} 0 0 0 ${c(n*.7)} ${c(n*.7)} Z" fill="${e.groundNear}" opacity="0.5" />
      </g>`}).join(""),snow:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),o=c(p+8+t()*48),n=c(2.4+t()*3.4);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.5)}" fill="#ffffff" opacity="0.75" />`}).join(""),spores:(e,t)=>Array.from({length:22},()=>{const r=c(t()*200),o=c(p-4+t()*56),n=c(.8+t()*1.4);return`<circle cx="${r}" cy="${o}" r="${n}" fill="${e.glow}" opacity="${c(.35+t()*.45)}" />`}).join(""),sparkle:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),o=c(p+2+t()*52),n=c(.8+t()*1.3);return`<circle cx="${r}" cy="${o}" r="${n}" fill="#ffffff" opacity="${c(.4+t()*.4)}" />`}).join("")},ye={tree:e=>`
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
    <circle cx="4.6" cy="-7.4" r="7" fill="#fbfdff" />`},as=Object.keys(ye),vo=e=>`
  <ellipse cx="0" cy="-1" rx="14" ry="5.6" fill="${e.nestDark}" />
  <ellipse cx="0" cy="-3" rx="11.6" ry="4.4" fill="${e.nest}" />
  <ellipse cx="0" cy="-3.6" rx="8.4" ry="2.8" fill="${e.nestLight}" />`,it={bush:[[-5.4,-9.4],[5.2,-10.4],[-.2,-14.2]],tree:[[-6.4,-18],[6.6,-19.2],[0,-23.4]],basket:[[-4.6,-7.2],[4.6,-7.8],[0,-10.4]],coral:[[-5,-11.4],[4.2,-9],[.4,-15.2]]},ct={bush:e=>`
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
    <circle cx="-5" cy="-11" r="2.2" fill="${e.accent}" />`},ge={berry:e=>`
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
    <circle cx="0" cy="-0.2" r="1.1" fill="#fff8e0" opacity="0.8" />`},ls=Object.keys(ge),Do=e=>`
  <circle cx="0" cy="0" r="5" fill="${e.ballA}" />
  <path d="M-5 0 a5 5 0 0 1 10 0 Z" fill="${e.ballB}" />
  <circle cx="-1.7" cy="-1.9" r="1.4" fill="#ffffff" opacity="0.7" />`,To=e=>`
  <ellipse cx="0" cy="0" rx="7.4" ry="2.6" fill="${e.leafDark}" opacity="0.45" />`,ke={stump:e=>`
    <ellipse cx="0" cy="-0.4" rx="8.4" ry="2.6" fill="${e.groundRim}" />
    <path d="M-7.4 -1 L-6.4 -8.6 L6.4 -8.6 L7.4 -1 Z" fill="${e.wood}" />
    <ellipse cx="0" cy="-8.6" rx="6.4" ry="2.2" fill="${e.nestLight}" />
    <ellipse cx="0" cy="-8.6" rx="3.4" ry="1.1" fill="none" stroke="${e.nestDark}" stroke-width="0.8" />
    <path d="M-7 -4.6 q-3.4 -0.6 -4.4 -3.4 q3 0.4 4.6 2" fill="${e.leaf}" />
    <circle cx="5.4" cy="-10.2" r="1.6" fill="${e.bloom}" />`,sandpit:e=>`
    <ellipse cx="0" cy="-1.6" rx="12.6" ry="4.6" fill="${e.groundRim}" />
    <ellipse cx="0" cy="-2.2" rx="11" ry="3.6" fill="${e.stoneLight}" />
    <path d="M-10.6 -3.4 L-9 -1 M-4 -4.2 L-3 -1.6 M4 -4.2 L3 -1.6 M10.6 -3.4 L9 -1"
          stroke="${e.stone}" stroke-width="0.8" stroke-linecap="round" opacity="0.6" />
    <path d="M-5.6 -4 q1.4 -3.4 4.4 -3.4 q3 0 4.4 3.4 Z" fill="${e.nest}" />
    <path d="M-1.2 -7.2 L-1.2 -10.4 L4.2 -8.8 L-1.2 -7.4" fill="${e.accent}" />
    <path d="M-1.2 -7.2 L-1.2 -10.4" stroke="${e.wood}" stroke-width="0.9" stroke-linecap="round" />`,beehive:e=>`
    <path d="M-2 0 L-2 -6 L2 -6 L2 0 Z" fill="${e.wood}" />
    <ellipse cx="0" cy="-8.4" rx="7.4" ry="3.4" fill="${e.nestDark}" />
    <ellipse cx="0" cy="-11.8" rx="7" ry="3.4" fill="${e.nest}" />
    <ellipse cx="0" cy="-15" rx="5.8" ry="3.2" fill="${e.nestLight}" />
    <ellipse cx="0" cy="-17.8" rx="4" ry="2.6" fill="${e.nest}" />
    <ellipse cx="0" cy="-19.8" rx="2" ry="1.4" fill="${e.nestDark}" />
    <ellipse cx="0" cy="-11.4" rx="1.8" ry="1.2" fill="${e.groundRim}" />
    <circle cx="-8.4" cy="-16.4" r="1.3" fill="${e.glowDeep}" />
    <circle cx="8.6" cy="-13" r="1.1" fill="${e.glowDeep}" />`,feeder:e=>`
    <ellipse cx="0" cy="-0.6" rx="4.4" ry="1.8" fill="${e.groundRim}" />
    <path d="M-1.1 -1.4 L-1.1 -14 L1.1 -14 L1.1 -1.4 Z" fill="${e.wood}" />
    <path d="M-7 -14 L7 -14 L5.4 -18.4 L-5.4 -18.4 Z" fill="${e.nest}" />
    <path d="M-8 -13.4 L8 -13.4 L8 -14.6 L-8 -14.6 Z" fill="${e.nestDark}" />
    <path d="M0 -18.4 L-6.2 -22.4 L6.2 -22.4 Z" fill="${e.nestDark}" />
    <path d="M0 -20.4 L-4.4 -22.8 L4.4 -22.8 Z" fill="${e.nestLight}" />
    <circle cx="-3" cy="-15.6" r="0.9" fill="${e.accent}" />
    <circle cx="1.4" cy="-15.4" r="0.9" fill="${e.bloom}" />
    <circle cx="4" cy="-16" r="0.8" fill="${e.accent}" />`,flowerbed:e=>`
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
    <circle cx="0" cy="-21" r="1.8" fill="${e.stoneLight}" />`},is=Object.keys(ke),ft=16,$e={farGrove:e=>`
    <ellipse cx="0" cy="0" rx="22" ry="3" fill="${e.farDark}" />
    <path d="M-15 0 L-15 -7 L-13 -7 L-13 0 Z" fill="${e.farDark}" />
    <ellipse cx="-14" cy="-12" rx="8" ry="7" fill="${e.far}" />
    <path d="M-1 0 L-1 -9 L1 -9 L1 0 Z" fill="${e.farDark}" />
    <ellipse cx="0" cy="-16" rx="10" ry="8.5" fill="${e.far}" />
    <ellipse cx="0" cy="-19" rx="6" ry="5" fill="${e.far}" />
    <path d="M13 0 L13 -6 L15 -6 L15 0 Z" fill="${e.farDark}" />
    <ellipse cx="14" cy="-10" rx="7" ry="6" fill="${e.far}" />`,farMill:e=>`
    <ellipse cx="0" cy="0" rx="16" ry="2.6" fill="${e.farDark}" />
    <path d="M-7 0 L-4.5 -20 L4.5 -20 L7 0 Z" fill="${e.far}" />
    <path d="M-7 0 L-4.5 -20 L0 -20 L0 0 Z" fill="${e.farDark}" />
    <path d="M-6 -21 L6 -21 L4 -25 L-4 -25 Z" fill="${e.farDark}" />
    <g stroke="${e.farDark}" stroke-width="2" stroke-linecap="round">
      <path d="M0 -23 L-12 -31 M0 -23 L12 -15 M0 -23 L-8 -11 M0 -23 L8 -35" />
    </g>
    <rect x="-2" y="-13" width="4" height="5" fill="${e.glow}" opacity="0.75" />`,farArch:e=>`
    <ellipse cx="0" cy="0" rx="20" ry="2.6" fill="${e.farDark}" />
    <path d="M-14 0 L-14 -10 Q-14 -22 0 -22 Q14 -22 14 -10 L14 0 L9 0 L9 -10
             Q9 -17 0 -17 Q-9 -17 -9 -10 L-9 0 Z" fill="${e.far}" />
    <path d="M-14 0 L-14 -10 Q-14 -22 0 -22 L0 -17 Q-9 -17 -9 -10 L-9 0 Z" fill="${e.farDark}" />
    <path d="M-16 -22 L16 -22 L14 -25 L-14 -25 Z" fill="${e.farDark}" />`,farTower:e=>`
    <ellipse cx="0" cy="0" rx="15" ry="2.6" fill="${e.farDark}" />
    <path d="M-8 0 L-6 -26 L6 -26 L8 0 Z" fill="${e.far}" />
    <path d="M-8 0 L-6 -26 L0 -26 L0 0 Z" fill="${e.farDark}" />
    <path d="M-9 -26 L9 -26 L9 -29 L-9 -29 Z" fill="${e.farDark}" />
    <path d="M0 -42 L8 -29 L-8 -29 Z" fill="${e.far}" />
    <path d="M0 -42 L0 -29 L-8 -29 Z" fill="${e.farDark}" />
    <rect x="-2.5" y="-22" width="5" height="6" fill="${e.glow}" opacity="0.75" />
    <rect x="-2" y="-38" width="4" height="4" fill="${e.glow}" opacity="0.6" />`},cs=Object.keys($e),Eo=.48,fs=42,ps=24,se=13,me={signpost:e=>`
    <ellipse cx="0" cy="-0.6" rx="5" ry="2" fill="${e.groundRim}" />
    <path d="M-1.4 -1.6 L-1.4 -22 L1.4 -22 L1.4 -1.6 Z" fill="${e.wood}" />
    <path d="M-11 -20 L7 -20 L10 -17 L7 -14 L-11 -14 Z" fill="${e.nest}" />
    <path d="M-8 -17.6 L2 -17.6 M-8 -16 L0 -16" stroke="${e.nestDark}" stroke-width="1.1"
          stroke-linecap="round" />
    <path d="M11 -12 L-7 -12 L-10 -9 L-7 -6 L11 -6 Z" fill="${e.nestLight}" />
    <path d="M-4 -9.6 L6 -9.6 M-4 -8 L4 -8" stroke="${e.nestDark}" stroke-width="1.1"
          stroke-linecap="round" />
    <circle cx="0" cy="-23.4" r="2" fill="${e.accent}" />`,topiary:e=>`
    <ellipse cx="0" cy="-0.6" rx="9" ry="2.6" fill="${e.groundRim}" />
    <path d="M-6.6 -1.4 L-5.6 -6 L5.6 -6 L6.6 -1.4 Z" fill="${e.stone}" />
    <path d="M-5.6 -6 L5.6 -6 L4.8 -7.4 L-4.8 -7.4 Z" fill="${e.stoneLight}" />
    <path d="M-1.4 -7.4 L-1.4 -12 L1.4 -12 L1.4 -7.4 Z" fill="${e.wood}" />
    <circle cx="0" cy="-16" r="5.6" fill="${e.leaf}" />
    <circle cx="0" cy="-16" r="5.6" fill="none" stroke="${e.leafDark}" stroke-width="1" />
    <circle cx="0" cy="-24.4" r="4.4" fill="${e.leaf}" />
    <circle cx="0" cy="-24.4" r="4.4" fill="none" stroke="${e.leafDark}" stroke-width="1" />
    <path d="M0 -20.4 L0 -18.6" stroke="${e.wood}" stroke-width="1.6" />
    <circle cx="-3" cy="-26.6" r="1.5" fill="${e.bloom}" />
    <circle cx="3.4" cy="-14.4" r="1.5" fill="${e.bloom}" />`,bunting:e=>`
    <path d="M-23.2 0 L-22.4 -28 L-20.8 -28 L-20 0 Z" fill="${e.wood}" />
    <path d="M20 0 L20.8 -28 L22.4 -28 L23.2 0 Z" fill="${e.wood}" />
    <circle cx="-21.6" cy="-29" r="1.8" fill="${e.stoneLight}" />
    <circle cx="21.6" cy="-29" r="1.8" fill="${e.stoneLight}" />
    <path d="M-21.6 -27.6 q21.6 9 43.2 0" fill="none" stroke="${e.nestDark}" stroke-width="1" />
    <g>
      <path d="M-17.4 -25.6 L-11.4 -24 L-15 -19 Z" fill="${e.accent}" />
      <path d="M-8.8 -23.2 L-2.8 -22.2 L-6 -16.8 Z" fill="${e.bloom}" />
      <path d="M0 -22 L6 -22.6 L2.8 -16.4 Z" fill="${e.glowDeep}" />
      <path d="M8.8 -23 L14.6 -24.4 L11.2 -18.4 Z" fill="${e.accent}" />
    </g>
`,pathLamps:e=>`
    <g transform="translate(-8.5 0)">
      <ellipse cx="0" cy="-0.6" rx="4.4" ry="1.8" fill="${e.stone}" />
      <path d="M-1.3 -1.6 L-1 -18 L1 -18 L1.3 -1.6 Z" fill="${e.wood}" />
      <circle cx="0" cy="-23" r="7.5" fill="${e.glow}" opacity="0.4" />
      <path d="M-3.2 -18 L-2.4 -25 L2.4 -25 L3.2 -18 Z" fill="${e.glowDeep}" />
      <path d="M-3.2 -18 L-2.4 -25 L2.4 -25 L3.2 -18 Z" fill="none" stroke="${e.wood}"
            stroke-width="1.1" />
      <path d="M-2.8 -25.4 L2.8 -25.4 L1.4 -27.4 L-1.4 -27.4 Z" fill="${e.stoneLight}" />
      <ellipse cx="17" cy="-0.6" rx="3.6" ry="1.5" fill="${e.stone}" />
      <path d="M15.9 -1.4 L16.2 -13.4 L17.8 -13.4 L18.1 -1.4 Z" fill="${e.wood}" />
      <circle cx="17" cy="-17.4" r="6" fill="${e.glow}" opacity="0.32" />
      <path d="M14.4 -13.4 L15.1 -18.8 L18.9 -18.8 L19.6 -13.4 Z" fill="${e.glowDeep}" />
      <path d="M14.8 -19.2 L19.2 -19.2 L18.1 -20.8 L15.9 -20.8 Z" fill="${e.stoneLight}" />
    </g>
`,fountain:e=>`
    <ellipse cx="0" cy="-2" rx="20" ry="7.6" fill="${e.groundRim}" />
    <ellipse cx="0" cy="-3.4" rx="17.4" ry="6.2" fill="${e.water}" />
    <ellipse cx="-4" cy="-4.6" rx="7" ry="2.2" fill="${e.waterLight}" opacity="0.7" />
    <path d="M-2.4 -5 L-2.4 -13 L2.4 -13 L2.4 -5 Z" fill="${e.stone}" />
    <ellipse cx="0" cy="-13.4" rx="7.6" ry="2.8" fill="${e.stoneLight}" />
    <ellipse cx="0" cy="-14.6" rx="6" ry="2" fill="${e.water}" />
    <path d="M-1.2 -15 L-1.2 -21 L1.2 -21 L1.2 -15 Z" fill="${e.stone}" />
    <circle cx="0" cy="-22.4" r="2.2" fill="${e.stoneLight}" />
    <g fill="${e.waterLight}" opacity="0.75">
      <path d="M0 -23.6 q-6 3.4 -7.4 9.4 q3.4 -6.6 7.4 -7.6 Z" />
      <path d="M0 -23.6 q6 3.4 7.4 9.4 q-3.4 -6.6 -7.4 -7.6 Z" />
    </g>
    <circle cx="-11" cy="-4.4" r="1.6" fill="${e.stoneLight}" />
    <circle cx="11.6" cy="-3.4" r="1.4" fill="${e.stoneLight}" />`,statue:e=>`
    <ellipse cx="0" cy="-1" rx="12.6" ry="4" fill="${e.groundRim}" />
    <path d="M-9.6 -2 L-8.6 -7.4 L8.6 -7.4 L9.6 -2 Z" fill="${e.stone}" />
    <path d="M-8.6 -7.4 L8.6 -7.4 L7.6 -9 L-7.6 -9 Z" fill="${e.stoneLight}" />
    <path d="M-6 -9 L-5.4 -12.4 L5.4 -12.4 L6 -9 Z" fill="${e.stone}" />
    <ellipse cx="0" cy="-19" rx="7" ry="7.4" fill="${e.stoneLight}" />
    <ellipse cx="0" cy="-27.4" rx="5.4" ry="5" fill="${e.stoneLight}" />
    <ellipse cx="-4" cy="-31.4" rx="2.2" ry="3" transform="rotate(-18 -4 -31.4)" fill="${e.stoneLight}" />
    <ellipse cx="4" cy="-31.4" rx="2.2" ry="3" transform="rotate(18 4 -31.4)" fill="${e.stoneLight}" />
    <circle cx="-2" cy="-28" r="1.1" fill="${e.stone}" />
    <circle cx="2" cy="-28" r="1.1" fill="${e.stone}" />
    <path d="M-2.2 -25 q2.2 1.8 4.4 0" fill="none" stroke="${e.stone}" stroke-width="0.9"
          stroke-linecap="round" />
    <circle cx="0" cy="-13.6" r="2" fill="${e.accent}" />`},ds=Object.keys(me);function Ut(e,t,r=12){const o=oe(t+91);return Array.from({length:r},(n,s)=>{const l=c(20+o()*160),a=c(p-10+o()*52),i=c(.9+o()*1.1),f=c(o()*6),h=c(4+o()*7);return`<circle class="hab-mote" cx="${l}" cy="${a}" r="${i}" fill="${e.glow}"
      style="--mote-delay:${f}s; --mote-drift:${h}px" />`}).join("")}const Zo=e=>Math.max(0,Math.min(255,Math.round(e))),pt=e=>{const t=String(e).replace("#",""),r=t.length===3?t.split("").map(o=>o+o).join(""):t;return[parseInt(r.slice(0,2),16)||0,parseInt(r.slice(2,4),16)||0,parseInt(r.slice(4,6),16)||0]},Io=e=>`#${e.map(t=>Zo(t).toString(16).padStart(2,"0")).join("")}`;function w(e,t,r){const o=Math.max(0,Math.min(1,r)),[n,s,l]=pt(e),[a,i,f]=pt(t);return Io([n+(a-n)*o,s+(i-s)*o,l+(f-l)*o])}const dt={dawn:{color:"#ffb47e",amount:.2},morning:{color:"#fffbe8",amount:.08},noon:{color:"#ffffff",amount:.03},afternoon:{color:"#ffc474",amount:.2},dusk:{color:"#7f66c0",amount:.3},night:{color:"#33437e",amount:.44}},Ro={far:"#8fc06a",farDark:"#6ea54f",ground:["#a9d581","#7fbc5e"],groundNear:"#97ca70",leaf:"#7fc65c",leafDark:"#54a03c",wood:"#a87b52",stone:"#c6c0b2",stoneLight:"#e4dfd4",bloom:"#ffd7e6",accent:"#ff9ec0",nest:"#ecdcaa",nestDark:"#c9b47f",nestLight:"#f8f0cf",glow:"#fff0b0",glowDeep:"#ffd66b",water:"#7fc4e8",waterLight:"#c4e8f8"},H={meadow:{far:"hills",detail:"grass",larder:"bush",treat:"berry",scenery:["tree","bush","flowers","rock"],colors:{}},grove:{far:"treeline",detail:"fern",larder:"tree",treat:"apple",scenery:["pine","tree","mushroom","rock"],colors:{far:"#5f9d55",farDark:"#3f7a41",ground:["#8cc474","#5f9c55"],groundNear:"#7ab266",leaf:"#63b061",leafDark:"#3d8845",wood:"#8a6242",bloom:"#ffd08a"}},pond:{far:"hills",detail:"lily",larder:"bush",treat:"apple",scenery:["reeds","bush","flowers","rock"],colors:{far:"#87c69a",farDark:"#63a97e",ground:["#9ed3a4","#6fb894"],groundNear:"#8fcc9e",leaf:"#6fc08c",leafDark:"#46976a",bloom:"#ffe4a8"}},shore:{far:"sea",detail:"shells",larder:"coral",treat:"fish",scenery:["palm","rock","bush","flowers"],colors:{far:"#f0dcb0",farDark:"#dcbe94",ground:["#f6e6bd","#e6cf9a"],groundNear:"#f2dfb0",leaf:"#78c47e",leafDark:"#519a5c",wood:"#b9885a",stone:"#e0d6c0",stoneLight:"#f4ecdc",bloom:"#ffc0a8",water:"#5fbfe4",waterLight:"#bde8f6"}},dune:{far:"dunes",detail:"pebbles",larder:"basket",treat:"melon",scenery:["cactus","rock","flowers","bush"],colors:{far:"#f2d49a",farDark:"#dcb87c",ground:["#f8e2ae","#e8c78c"],groundNear:"#f4dca4",leaf:"#8cc078",leafDark:"#5f9455",wood:"#c08c58",stone:"#dccbaa",stoneLight:"#f2e7cd",bloom:"#ffb3c8"}},snowfield:{far:"peaks",detail:"snow",larder:"basket",treat:"carrot",scenery:["snowpine","snowdrift","rock","snowpine"],colors:{far:"#bcd0ea",farDark:"#93aed2",ground:["#eef5ff","#cfe0f4"],groundNear:"#e4eeff",leaf:"#5f9c78",leafDark:"#417a5c",wood:"#8a6a52",stone:"#c8d4e6",stoneLight:"#eaf1fa",bloom:"#c8dcff",glow:"#dbeaff",glowDeep:"#9fc4f0"}},glowvale:{far:"arch",detail:"spores",larder:"bush",treat:"glowberry",scenery:["mushroom","crystal","rock","bush"],colors:{far:"#6a5a94",farDark:"#4a3f70",ground:["#8f7fbc","#6b5c96"],groundNear:"#8474ae",leaf:"#7fc4a8",leafDark:"#4f9a80",wood:"#7a5f8e",stone:"#a89cc4",stoneLight:"#cfc6e4",bloom:"#c8a0ff",glow:"#a8f0e0",glowDeep:"#5fd8c4"}},cloudtop:{far:"cloudbank",detail:"sparkle",larder:"basket",treat:"starfruit",scenery:["cloudpuff","crystal","flowers","cloudpuff"],colors:{far:"#d2e0fa",farDark:"#b0c6ec",ground:["#e2ecff","#c2d4f0"],groundNear:"#d6e4fb",leaf:"#8ec8ea",leafDark:"#6aa6d6",wood:"#b0a8cc",stone:"#c8d6ee",stoneLight:"#e6eefc",bloom:"#ffd9f0",glow:"#fff0c8",glowDeep:"#ffd98a"}}},hs=Object.keys(H),Oo={sprout:"meadow",bubs:"pond",zzz:"snowfield",tumble:"dune",mochi:"meadow",bloop:"pond",pebble:"snowfield",nibbles:"dune",pip:"grove",snug:"grove",noodle:"grove",cloudlet:"shore",waddle:"shore",glim:"glowvale",fizz:"glowvale",puff:"cloudtop"},Fo=e=>Oo[e]??"meadow",ht=[{pieces:[[78,.56],[124,.6],[36,.86],[176,1.3]],larder:52,ball:78,nest:126},{pieces:[[86,.55],[118,.58],[166,.88],[26,1.26]],nest:74,ball:122,larder:148},{pieces:[[74,.52],[128,.62],[34,.9],[178,1.22]],larder:150,ball:124,nest:78},{pieces:[[90,.6],[112,.54],[168,.84],[24,1.28]],nest:120,ball:80,larder:54},{pieces:[[80,.58],[130,.53],[38,.94],[174,1.24]],larder:56,ball:82,nest:128},{pieces:[[88,.54],[120,.6],[164,.8],[30,1.3]],nest:72,ball:118,larder:146},{pieces:[[76,.57],[126,.52],[32,.88],[180,1.22]],larder:148,ball:120,nest:76}],us={x0:66,x1:134},V={x0:88,x1:112},_o=3;function Ie(e,t){const r=[e.nest,e.larder,e.ball];let o=100,n=-1/0;for(let s=t.x0+12;s<=t.x1-12;s+=2){const a=Math.min(...r.map(i=>Math.abs(s-i)))-Math.abs(s-100)*.4;a>n&&(n=a,o=s)}return o}const qt=12,No=30;function Qt(e,t=ao){const r=[e.nest,e.larder,e.ball,Ie(e,Z)],o=[];for(let s=P.x0+ft;s<=P.x1-ft;s+=2)s>=V.x0&&s<=V.x1||o.push(s);o.sort((s,l)=>Math.abs(l-100)-Math.abs(s-100));const n=[];for(const s of o){if(n.length>=t)break;r.some(l=>Math.abs(l-s)<qt)||n.some(l=>Math.abs(l-s)<No)||n.push(s)}return n.sort((s,l)=>s-l)}function Po(e,t=Qt(e)){const r=[...t,Ie(e,Z)],o=[];for(let a=P.x0+se;a<=P.x1-se;a+=2)a>=V.x0&&a<=V.x1||o.push(a);o.sort((a,i)=>Math.abs(i-100)-Math.abs(a-100)||a-i);const n=o.find(a=>r.every(i=>Math.abs(i-a)>=qt));if(n!==void 0)return c(n);let s=o[0]??P.x0+se,l=-1;for(const a of o){const i=Math.min(...r.map(f=>Math.abs(f-a)));i>l&&(l=i,s=a)}return c(s)}const jo=e=>c(p+10+(e-.5)*40),Kt=(e,t,r)=>Math.max(t,Math.min(r,e)),Ho=6,zo=20,Go=4;function Bo(e,t){const r=e%12,o=ee(`t${S(e,t)}`)%Go,n=i=>i>=Ho&&i<=zo,s=n(r)===n(r+12)?o%2===1:n(r+12)!==(o===0),l=r+(s?12:0),a=Ht(l);return{hour24:l,pm:s,phase:a,night:A[a].night,orb:zt(l)}}function Yt(e,t,r){var h;const o=x[e]??x.mochi,[n,s,l]=o.palette,a={...Ro,...((h=H[t])==null?void 0:h.colors)??{}},i=dt[r]??dt.noon,f=(u,y=.1)=>w(w(u,l,y),i.color,i.amount);return{far:f(a.far),farDark:f(a.farDark),ground:[f(a.ground[0],.12),f(a.ground[1],.12)],groundNear:f(a.groundNear,.14),groundRim:w(f(a.ground[0],.12),"#2b2440",.34),leaf:f(a.leaf),leafDark:f(a.leafDark),wood:f(a.wood,.07),stone:f(a.stone,.07),stoneLight:f(a.stoneLight,.05),water:f(a.water,.07),waterLight:f(a.waterLight,.05),bloom:w(w(a.bloom,n,.42),i.color,i.amount*.5),accent:w(l,i.color,i.amount*.4),nest:w(a.nest,s,.45),nestDark:w(a.nestDark,l,.32),nestLight:w(a.nestLight,s,.5),glow:a.glow,glowDeep:a.glowDeep,ballA:l,ballB:s}}function Uo(e,t){const r=z(e,t),o=Fo(r),n=H[o],s=Se(e,t),l=Bo(e,t),a=ht[s*_o%ht.length],i=ee(`hab${S(e,t)}`)%1e5,f=a.pieces.map(([u,y],$)=>({id:n.scenery[(s+$)%n.scenery.length],x:u,scale:y,y:jo(y),flip:(s+$)%2===1})),h=(it[n.larder]??it.bush).map(([u,y])=>({x:c(a.larder+u),y:c(b+y)}));return{id:S(e,t),species:r,biome:o,light:l,palette:Yt(r,o,l.phase),scenery:f,props:{nest:{x:a.nest,y:b},ball:{x:a.ball,y:b},larder:{x:a.larder,y:b,kind:n.larder,treat:n.treat,spots:h}},home:{x:Ie(a,Z),y:b},roam:{...Z},furniture:[],backdrop:null,spots:Qt(a),backdropSpot:Po(a),seed:i}}function ys(e){const t=Uo(e.h,e.m),r={...t,furniture:qo(t,e==null?void 0:e.decor),backdrop:Qo(t,e==null?void 0:e.decor)},o=e==null?void 0:e.habitat;return!o||typeof o!="object"?r:{...r,...o,palette:{...r.palette,...o.palette??{}},props:{...r.props,...o.props??{}},light:{...r.light,...o.light??{}}}}function qo(e,t){const r=De(t).filter(l=>G(l)==="ground"),o=e.spots??[],n=l=>{var a;return((a=C.get(l))==null?void 0:a.band)==="wide"},s=r.length===2&&!n(r[0])&&n(r[1])?[...o].reverse():o;return r.slice(0,o.length).map((l,a)=>({id:l,x:s[a],y:b}))}function Qo(e,t){const r=De(t).find(o=>G(o)==="backdrop");return r?{id:r,x:e.backdropSpot??100,y:p,scale:Eo}:null}const Ko=(e,t,r,o,n,s)=>{const l=ye[e]??ye.bush,a=n?`scale(${-o} ${o})`:`scale(${o})`;return`<g transform="translate(${t} ${r}) ${a}">${l(s)}</g>`};function gs(e,{uid:t="h",label:r="",sleeping:o=!1}={}){const n=e.palette,s=A[e.light.phase]??A.noon,l=oe(e.seed+3),a=H[e.biome]??H.meadow,i=e.scenery.filter(y=>y.y<=b),f=e.scenery.filter(y=>y.y>b),h=y=>y.map($=>Ko($.id,$.x,$.y,$.scale,$.flip,n)).join(""),u=e.light.night||e.biome==="glowvale";return`
<svg class="habitat" viewBox="0 0 ${m.w} ${m.h}" preserveAspectRatio="xMidYMax slice"
     role="img" aria-label="${r}" focusable="false">
  <defs>
    <linearGradient id="${t}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.sky[0]}" />
      <stop offset="1" stop-color="${s.sky[1]}" />
    </linearGradient>
    <linearGradient id="${t}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${n.ground[0]}" />
      <stop offset="1" stop-color="${n.ground[1]}" />
    </linearGradient>
    <radialGradient id="${t}-glow">
      <stop offset="0" stop-color="${s.glow}" stop-opacity="0.85" />
      <stop offset="1" stop-color="${s.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <g class="hab-sky">
    <rect x="0" y="0" width="${m.w}" height="${m.h}" fill="url(#${t}-sky)" />
    ${Gt(e.light.phase,e.light.hour24,e.seed,t)}
  </g>

  <g class="hab-far">${(he[a.far]??he.hills)(n)}</g>

  ${e.backdrop?`<g class="hab-backdrop" transform="translate(${e.backdrop.x} ${e.backdrop.y}) scale(${e.backdrop.scale})">${($e[e.backdrop.id]??$e.farGrove)(n)}</g>`:""}

  <g class="hab-ground">
    ${Bt(n,t)}
    ${(ue[a.detail]??ue.grass)(n,l)}
  </g>

  <g class="hab-back">
    ${h(i)}
    ${(e.furniture??[]).map(y=>`<g class="hab-furniture" transform="translate(${y.x} ${y.y})">${(ke[y.id]??ke.flowerbed)(n)}</g>`).join("")}
    <g transform="translate(${e.props.nest.x} ${e.props.nest.y})">${vo(n)}</g>
    <g transform="translate(${e.props.ball.x} ${e.props.ball.y})">${To(n)}</g>
    <g transform="translate(${e.props.larder.x} ${e.props.larder.y})">
      ${(ct[e.props.larder.kind]??ct.bush)(n)}
    </g>
  </g>

  <g class="hab-actors"></g>

  <g class="hab-front">${h(f)}</g>

  ${u?`<g class="hab-motes">${Ut(n,e.seed,o?8:14)}</g>`:""}

  <rect class="hab-veil" x="0" y="0" width="${m.w}" height="${m.h}" fill="${s.veil}" />
  <rect class="hab-dusk" x="0" y="0" width="${m.w}" height="${m.h}" fill="#1b1930" />
</svg>`}const ks=(e,t)=>(ge[e]??ge.berry)(t),$s=e=>Do(e),ut=5,Yo=330,Wo=.22,Vo=.54,Xo=.82,yt=.62,gt=26;function ms(e,t,r){if(e.resting)return{...e,bounce:0};const o=Kt(t,0,.05),n=r.floor??b,s=r.ceiling??8,l=(r.x0??Z.x0)+ut,a=(r.x1??Z.x1)-ut;let i=e.vx*(1-Wo*o),f=e.vy+Yo*o,h=e.x+i*o,u=e.y+f*o,y=0;u>=n?(u=n,f>gt?(y=f,f=-f*Vo,i*=Xo):(f=0,i*=.7)):u<=s&&(u=s,f=Math.abs(f)*.4),h<=l?(h=l,i=Math.abs(i)*yt,y=Math.max(y,Math.abs(e.vx)*.6)):h>=a&&(h=a,i=-Math.abs(i)*yt,y=Math.max(y,Math.abs(e.vx)*.6));const $=u>=n&&Math.abs(f)<=gt&&Math.abs(i)<2;return{...e,x:h,y:u,vx:$?0:i,vy:$?0:f,spin:(e.spin??0)+i*o*7,resting:$,bounce:y}}function bs(e,t=Z,r=Math.random){const o=t.x1-t.x0,n=(e-t.x0)/o,s=n<.28?1:n>.72||r()<.5?-1:1,l=(.14+r()*.34)*o;return c(Kt(e+s*l,t.x0,t.x1))}const Jo=[34,100,166],ae=4,en=e=>Yt("mochi","meadow",e);function tn(e){return Te(e).slice(0,ve).map((t,r)=>({id:t,x:Jo[r],y:b}))}function xs(e,{hour24:t=12,uid:r="yard",label:o=""}={}){const n=Ht(t),s=en(n),l=A[n]??A.noon,a=oe(ae+3),i=tn(e);return`
<svg class="yard" viewBox="0 0 ${m.w} ${m.h}" preserveAspectRatio="xMidYMax slice"
     role="img" aria-label="${o}" focusable="false">
  <defs>
    <linearGradient id="${r}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${l.sky[0]}" />
      <stop offset="1" stop-color="${l.sky[1]}" />
    </linearGradient>
    <linearGradient id="${r}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.ground[0]}" />
      <stop offset="1" stop-color="${s.ground[1]}" />
    </linearGradient>
    <radialGradient id="${r}-glow">
      <stop offset="0" stop-color="${l.glow}" stop-opacity="0.85" />
      <stop offset="1" stop-color="${l.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <g class="yard-sky">
    <rect x="0" y="0" width="${m.w}" height="${m.h}" fill="url(#${r}-sky)" />
    ${Gt(n,t,ae,r)}
  </g>

  <g class="yard-far">${he.hills(s)}</g>

  <g class="yard-ground">
    ${Bt(s,r)}
    ${ue.grass(s,a)}
  </g>

  <g class="yard-pieces">
    ${i.map(f=>`<g class="yard-piece" transform="translate(${f.x} ${f.y})">${(me[f.id]??me.signpost)(s)}</g>`).join("")}
  </g>

  ${l.night?`<g class="yard-motes">${Ut(s,ae,10)}</g>`:""}

  <rect class="yard-veil" x="0" y="0" width="${m.w}" height="${m.h}" fill="${l.veil}" />
</svg>`}export{io as $,Xn as A,ut as B,es as C,L as D,ts as E,os as F,rs as G,Dr as H,Tr as I,wn as J,$n as K,Un as L,Ln as M,In as N,Y as O,ns as P,Zn as Q,S as R,x as S,v as T,C as U,jn as V,b as W,Nn as X,bo as Y,co as Z,Pn as _,gs as a,Kr as a$,G as a0,_n as a1,qn as a2,Fn as a3,Et as a4,Zt as a5,br as a6,gn as a7,fn as a8,yn as a9,an as aA,cn as aB,sn as aC,fo as aD,Hn as aE,ne as aF,nn as aG,or as aH,Wr as aI,$t as aJ,Uo as aK,_e as aL,nr as aM,ir as aN,cr as aO,Ne as aP,mr as aQ,He as aR,kr as aS,$r as aT,we as aU,Er as aV,Ir as aW,Rr as aX,Lo as aY,Ee as aZ,Ze as a_,_t as aa,Vn as ab,kn as ac,zn as ad,Gn as ae,mn as af,Qn as ag,$o as ah,fr as ai,Bn as aj,xs as ak,On as al,Rn as am,ln as an,un as ao,z as ap,R as aq,be as ar,pe as as,mt as at,$e as au,me as av,ke as aw,on as ax,rn as ay,T as az,$s as b,lo as b$,K as b0,At as b1,dn as b2,ur as b3,le as b4,Ge as b5,Be as b6,Ue as b7,qe as b8,Qe as b9,ss as bA,P as bB,Z as bC,us as bD,ht as bE,Ie as bF,jo as bG,as as bH,Bo as bI,Ht as bJ,zt as bK,p as bL,w as bM,Yt as bN,oe as bO,ls as bP,Se as bQ,Ae as bR,J as bS,cs as bT,is as bU,ds as bV,Ce as bW,ao as bX,De as bY,Qt as bZ,ft as b_,to as ba,eo as bb,Vr as bc,Nr as bd,Hr as be,Jr as bf,jr as bg,zr as bh,Gr as bi,Mt as bj,Br as bk,ot as bl,ie as bm,ce as bn,St as bo,Yr as bp,tt as bq,et as br,so as bs,Nt as bt,de as bu,jt as bv,Co as bw,tr as bx,Fo as by,hs as bz,Kt as c,Po as c0,Te as c1,Jo as c2,tn as c3,en as c4,ko as c5,mo as c6,Mr as c7,Sr as c8,wt as c9,xt as ca,Ar as cb,Lr as cc,je as cd,gr as ce,bt as cf,xe as cg,Zr as ch,Pt as ci,V as cj,It as ck,Rt as cl,po as cm,st as cn,Ot as co,se as cp,fs as cq,ps as cr,Eo as cs,ve as ct,m as cu,ho as cv,uo as cw,yo as cx,Dn as d,En as e,Wn as f,hn as g,ys as h,Fr as i,Mn as j,xn as k,Kn as l,An as m,bs as n,Cn as o,Tn as p,Sn as q,bn as r,ms as s,ks as t,vn as u,Yn as v,I as w,pn as x,Jn as y,Mo as z};
