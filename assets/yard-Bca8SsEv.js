import{s as Wr}from"./recognize-DolGw8_D.js";const Yr=[1,2,3,4,5,6,7,8,9,10,11,12],be=5,Vr=be*6,F=e=>(e%360+360)%360,N=(e,t)=>(e%t+t)%t,As=e=>F(e*6),Ts=(e,t)=>F(N(e,12)*30+t*.5),Xr=(e,t)=>F(Math.atan2(e,-t)*180/Math.PI);function Ze(e,t,r,o){const n=o*Math.PI/180;return{x:e+r*Math.sin(n),y:t-r*Math.cos(n)}}function kt(e,t){const r=Math.abs(F(e)-F(t));return r>180?360-r:r}const Cs=e=>N(Math.round(F(e)/Vr)*be,60);function Ds(e,t){const r=N(Math.round((F(e)-t*.5)/30),12);return r===0?12:r}function Es({dx:e,dy:t,radius:r,hourDeg:o,minuteDeg:n}){const s=Math.hypot(e,t)/r;if(s<.18||s>1.15)return null;if(s<.55)return"hour";if(s>.72)return"minute";const a=Xr(e,t);return kt(a,o)<=kt(a,n)?"hour":"minute"}const E=(e,t)=>`${e}:${String(t).padStart(2,"0")}`;function Jr(e){const[t,r]=String(e).split(":").map(Number);return{h:t,m:r}}function eo(e,t){let r=(t-e)%60;return r>30&&(r-=60),r<-30&&(r+=60),r}function Is({h:e,m:t},r){const o=eo(t,r),n=t+o;let s=e;return n>=60?s=e%12+1:n<0&&(s=e===1?12:e-1),{h:s,m:r,delta:o}}function to(e,t){const r=Math.abs(e-t)%60;return r>30?60-r:r}function ro(e,t){const r=Math.abs(N(e,12)-N(t,12))%12;return r>6?12-r:r}function oo(e,t){const r=N(e.h,12)===N(t.h,12),o=e.m===t.m,n=to(e.m,t.m),s=ro(e.h,t.h);let a;return r&&o?a="correct":o?a="hourOff":r?a="minuteOff":a="both",{verdict:a,correct:a==="correct",nearMiss:a!=="correct"&&n<=be&&s<=1,minuteDelta:n,hourDelta:s}}const Xt=.8,P=[{id:0,minutes:[0]},{id:1,minutes:[30]},{id:2,minutes:[15,45]},{id:3,minutes:[5,10,20,25,35,40,50,55]}],xe=P.length-1,Jt=new Map;for(const e of P)for(const t of e.minutes)Jt.set(t,e.id);const er=e=>Jt.get(e)??null;function we(e){const t=P[e];if(!t)return[];const r=[];for(const o of t.minutes)for(const n of Yr)r.push({h:n,m:o,id:E(n,o),tier:e});return r}const Xe=P.flatMap(e=>we(e.id));new Map(Xe.map(e=>[e.id,e]));function no(e,t){const r=we(t);return r.length?r.filter(n=>{var s;return((s=e[n.id])==null?void 0:s.phase)==="graduated"}).length/r.length:0}function Os(e){let t=0;for(;t<xe&&no(e,t)>=Xt;)t+=1;return t}function Zs(e,t){const r=[];for(let o=0;o<=Math.min(t,xe);o+=1)for(const n of we(o))e[n.id]||r.push(n);return r}const L="nb",so=[{id:"nb",label:"Norsk"},{id:"en",label:"English"}],_s=e=>so.some(t=>t.id===e),$t={en:["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"],nb:["","ett","to","tre","fire","fem","seks","sju","åtte","ni","ti","elleve","tolv"]},ao={0:"o'clock",5:"five past",10:"ten past",15:"quarter past",20:"twenty past",25:"twenty-five past",30:"half past",35:"twenty-five to",40:"twenty to",45:"quarter to",50:"ten to",55:"five to"},lo={0:{text:"klokka {h}",next:!1},5:{text:"fem over {h}",next:!1},10:{text:"ti over {h}",next:!1},15:{text:"kvart over {h}",next:!1},20:{text:"ti på halv {h}",next:!0},25:{text:"fem på halv {h}",next:!0},30:{text:"halv {h}",next:!0},35:{text:"fem over halv {h}",next:!0},40:{text:"ti over halv {h}",next:!0},45:{text:"kvart på {h}",next:!0},50:{text:"ti på {h}",next:!0},55:{text:"fem på {h}",next:!0}},bt={en:["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"],nb:["null","én","to","tre","fire","fem","seks","sju","åtte","ni","ti","elleve","tolv","tretten","fjorten","femten","seksten","sytten","atten","nitten","tjue"]};function Q(e,t){return(bt[e]??bt[L])[t]??String(t)}const io=(e,t,r)=>e==="en"?`${Q("en",t)} plus ${Q("en",r)}`:`${Q("nb",t)} pluss ${Q("nb",r)}`,co=e=>(e-1+12)%12+1,je=(e,t)=>($t[e]??$t[L])[co(t)];function fo(e,t,r){if(e==="en"){const n=ao[r],s=je("en",r>30?t+1:t);return r===0?`${s} ${n}`:`${n} ${s}`}const o=lo[r];return o.text.replace("{h}",je("nb",o.next?t+1:t))}const de={en:["Biscuit","Marmalade","Waffle","Pumpkin","Sprinkle","Doodle","Clover","Peanut","Nugget","Custard","Pickle","Bumble","Dandelion","Truffle","Cinnamon","Gumdrop","Blossom","Turnip","Jellybean","Muffin","Toast","Pancake","Wobble","Pudding","Cricket","Sundae","Butterbean","Hopscotch","Marshmallow","Tangerine","Pinecone","Bramble","Mittens","Popcorn","Whisker","Fern","Gingersnap","Nutmeg","Poppy","Sesame","Twiglet","Apricot","Cobweb","Domino","Fizzle","Hazelnut","Pebble","Snowdrop"],nb:["Vaffel","Kanelbolle","Blåbær","Pannekake","Smultring","Kakao","Marsipan","Karamell","Lakris","Rosin","Sukkerbit","Krumkake","Tyttebær","Multe","Kløver","Løvetann","Kongle","Furunål","Mose","Dugg","Snøfnugg","Måneskinn","Solstråle","Stjerneskudd","Regnbue","Tordensky","Bølge","Rullestein","Perle","Knappen","Tøffel","Votten","Lua","Dott","Lubben","Tuss","Prikken","Flekken","Bamse","Nøtta","Fnugg","Kvist","Bringebær","Solsikke","Tjukken","Sprett","Trilla","Nusse"]},W={en:{back:"← Back to games","nav.scenes":"Scenes","tab.play":"Feed","tab.zoo":"Zoo","sound.on":"Sound on","sound.off":"Sound off","settings.open":"Settings","clock.aria":"Drag the clock hands to set the time","prompt.booting":"Waking the zoo…","prompt.egg":"A chilly egg! It hatches at…","prompt.egg1":"The egg is stirring! It hatches at…","prompt.egg2":"It is cracking open! It hatches at…","prompt.forgot":"{name} forgot their snack time. It is…","prompt.hungry":"{name} is hungry! They eat at…","prompt.snack":"{name} fancies a snack at…","button.warm":"Warm the egg!","button.feed":"Feed {name}!","cheer.1":"Yes!","cheer.2":"Perfect!","cheer.3":"Spot on!","cheer.4":"Nailed it!","cheer.5":"That is it!","cheer.streak":"{cheer} {n} in a row!","crack.1":"A crack appeared!","crack.2":"Another crack — it is nearly out!","hatch.stir":"Something is moving in there…","hatch.now":"It hatched!","hatch.hello":"{name} says hello!","evolve.now":"Something is happening…","evolve.done":"{name} is now {label}!","form.2":"the Bold","form.3":"the Grand","teach.nearMiss":"So close! ","teach.hourExact":"At {hour} o’clock the short fat hand points straight at the {hour}.","teach.hourPastHalf":"The short fat hand is past halfway from the {hour} to the {next} — but it is still the {hour}.","teach.hourJustLeft":"Look at the short fat hand: at {time} it has just left the {hour}.","teach.minuteOClock":"At {hour} o’clock the long hand points straight up.","teach.minuteCountOne":"Count round in fives: {jumps} jump past the top is {minutes} minutes.","teach.minuteCountMany":"Count round in fives: {jumps} jumps past the top is {minutes} minutes.","teach.both":"Here is where both hands go for {time}.","nap.title":"Pets are sleeping!","nap.copy":"That was a good session. Everyone is having a nap — you can still visit them in the zoo.","nap.countdown":"Waking up in","nap.wake":"Wake the pets","nap.visit":"Visit the zoo","nap.sleeping":"sleeping","zoo.empty":"No pets yet! Feed the clock a few times and your first egg will hatch.","zoo.egg":"{species} egg","zoo.eggTitle":"A chilly egg","zoo.eggTitleCracks":"A cracking egg, {n} of {of} cracks","zoo.rename":"What is this pet called?","habitat.back":"Back to the zoo","habitat.rename":"Give this pet a new name","habitat.aria":"{name}'s home","habitat.eggAria":"The home waiting for a {species} egg","habitat.hint":"Throw the ball, share a snack, or stroke {name}.","habitat.eggHint":"This home is waiting. Feed the clock, and the egg will hatch.","habitat.sleeping":"{name} is fast asleep. Sshh.","unlock.title":"New pets have arrived!","unlock.copy":"{tier} — {blurb}","unlock.close":"Let’s go","howto.summary":"How to play","howto.1":"A pet tells you when it eats. Drag the clock hands to that time.","howto.2":"The <b>long thin hand</b> is the minutes — it jumps five minutes at a time. The <b>short fat hand</b> is the hour.","howto.3":"Watch the short hand creep along as you move the long one. At quarter past four it has already left the 4 — that is how a real clock works.","howto.4":"Get one right four times and its egg cracks open into a pet of your own.","howto.5":"After a few minutes the pets get sleepy and the game stops. You can still wander the zoo while they nap.","howto.6":"Grown-ups: press and hold the title for progress.","grownups.practise":"What to practise","grownups.practiseHelp":"Switch off anything they do not need just now, or skip the rungs they have already got. Pets from anything switched off go and rest — they keep everything they have earned, they stop getting hungry, and they carry on exactly where they left off if you switch it back on.","grownups.skip":"Skip this","grownups.practiseThis":"Practise this","grownups.skipped":"skipped","grownups.lastSubject":"There has to be something left to practise.","subject.clock":"The clock","subject.add":"Adding up","zoo.resting":"{name} is resting","grownups.title":"Progress","grownups.answered":"Times answered","grownups.accuracy":"Correct first try","grownups.streak":"Best streak","grownups.hatched":"Pets hatched","grownups.days":"Days played","grownups.fine":"Times are scheduled with a spaced-repetition algorithm: each one comes back just as it is about to be forgotten. Everything is stored in this browser only.","grownups.close":"Close","grownups.reset":"Start over","grownups.resetConfirm":"Start over? Every pet and all progress will be lost.","settings.title":"Settings","settings.language":"Language","settings.playTime":"Play time","settings.playTimeValue":"{n} minutes","settings.playTimeHelp":"How long a session lasts before the pets need a nap. Short sessions work best — three to five minutes.","settings.digital":"Show digital time","settings.digitalHelp":"Off by default. With it off the pets say their feeding time in words only, so the clock face is the only place to read it.","settings.transfer":"Move to another device","settings.transferHelp":"Save the zoo as a file, or copy it as a code to send in a message. Opening either one on another device brings every pet across. The zoo already on that device is replaced.","settings.done":"Done","transfer.exportFile":"Save file","transfer.copyCode":"Copy code","transfer.importFile":"Open file…","transfer.pasteCode":"Paste code","transfer.pastePrompt":"Paste the code from the other device:","transfer.confirm":"Replace this device’s zoo with the one you are bringing in? The pets here now will be lost.","transfer.saved":"Saved {file}.","transfer.copied":"Code copied — paste it on the other device.","transfer.copyFailed":"Could not reach the clipboard, so the code was saved as a file instead.","transfer.imported":"Brought in {n} pets.","transfer.badFile":"That does not look like a Pet Zoo save.","transfer.badApp":"That save is from a different game.","transfer.badVersion":"That save comes from a newer Pet Zoo than this one.","coins.name":"gold coins","coins.balance":"{n} gold coins","coins.earned":"+{n}","shop.open":"Go to the shop","shop.title":"The zoo shop","shop.intro":"Something nice for one of your pets.","shop.forPet":"Shopping for {name}","shop.pickPet":"Whose home is it for?","shop.empty":"No pets yet! Hatch your first egg and the shop will open.","shop.locked":"Locked","shop.lockedHelp":"Learn more times to open this one.","shop.owned":"In {name}’s home","shop.full":"{name}’s home is full. Sell something to make room.","shop.tooDear":"Not enough coins yet.","shop.buy":"Buy it!","shop.cancel":"Not yet","shop.confirm":"{item} — put it in {name}’s home for {price} gold coins?","shop.bought":"{name} loves it!","shop.sell":"Sell it back","shop.sellConfirm":"{item} — sell it back? You get all {price} gold coins again.","shop.sold":"Sold — {price} gold coins back.","shop.close":"Done","shop.tabHome":"The pets’ homes","shop.tabZoo":"The whole zoo","shop.ownedZoo":"In the zoo","shop.fullBackdrop":"There is already something far away at {name}’s. Sell it to make room.","shop.fullZoo":"The zoo yard is full. Sell something to make room.","shop.confirmZoo":"{item} — put it in the zoo for {price} gold coins?","shop.boughtZoo":"It looks lovely out there!","yard.label":"The zoo yard","shop.flowerbed":"Flower bed","shop.lantern":"Lantern","shop.house":"Little house","shop.swing":"Swing","shop.pond":"Pond","shop.hammock":"Hammock","shop.arch":"Flower arch","shop.windmill":"Windmill","shop.stump":"Tree stump","shop.sandpit":"Sandpit","shop.beehive":"Beehive","shop.feeder":"Bird feeder","shop.farGrove":"Faraway trees","shop.farMill":"Faraway mill","shop.farArch":"Faraway gateway","shop.farTower":"Faraway tower","shop.signpost":"Signpost","shop.topiary":"Trimmed tree","shop.bunting":"Bunting","shop.pathLamps":"Path lamps","shop.fountain":"Fountain","shop.statue":"Statue","prompt.sumEgg":"A chilly egg! Warm it up:","prompt.sumEgg1":"The egg is stirring! Keep going:","prompt.sumEgg2":"It is cracking open! One more:","prompt.sumForgot":"{name} forgot their snack. It is:","prompt.sumHungry":"{name} is hungry! Their snack is:","prompt.sumSnack":"{name} fancies a snack:","teach.sumOffByOne":"Just one out — count once more.","teach.sumTransposed":"The right digits, the other way round.","teach.sumGaveAddend":"That is one of the numbers on its own.","teach.sumGaveDifference":"That is taking them apart, not putting them together.","teach.sumPlain":"{a} and {b} makes {sum}.","teach.sumMakeTen":"{a} and {bridge} makes ten, then {rest} more — {sum}.","tier.add.0.name":"Counting on","tier.add.0.blurb":"Adding nothing, and adding one.","tier.add.1.name":"Sums to ten","tier.add.1.blurb":"Everything that fits in one ten-frame.","tier.add.2.name":"Doubles","tier.add.2.blurb":"Two of the same, past ten.","tier.add.3.name":"Adding ten","tier.add.3.blurb":"The answer is already in the question.","tier.add.4.name":"Over the ten","tier.add.4.blurb":"Make ten first, then add the rest.","answer.aria":"Your answer","answer.empty":"nothing yet","answer.keypad":"Number buttons","answer.digit":"Put down {n}","answer.clear":"Clear","settings.answerMode":"Answering","settings.answerAuto":"Automatic","settings.answerType":"Typing","settings.answerTap":"Buttons","answer.writeHere":"Write here","answer.reads":"reads {n}","answer.orThis":"or {n}?","answer.fixTitle":"Which number was it?","answer.fixHint":"Tap what it reads to put it right.","answer.mirrored":"You wrote it the other way round. It usually goes like this:","answer.undo":"Undo","settings.answerWrite":"Writing","settings.mirrorNudge":"Practise which way numbers face","settings.mirrorNudgeHelp":"Off to begin with. A backwards number always counts — writing 3 and 5 the other way round is ordinary at this age. With this on, the game also shows which way they usually go.","tier.0.name":"O’clock","tier.0.blurb":"The big hand points straight up.","tier.1.name":"Half past","tier.1.blurb":"The big hand points straight down.","tier.2.name":"Quarter past and quarter to","tier.2.blurb":"The big hand points sideways.","tier.3.name":"Every five minutes","tier.3.blurb":"Count around the face in fives."},nb:{back:"← Tilbake til spillene","nav.scenes":"Visninger","tab.play":"Mate","tab.zoo":"Dyrehagen","sound.on":"Lyd på","sound.off":"Lyd av","settings.open":"Innstillinger","clock.aria":"Dra viserne for å stille klokka","prompt.booting":"Vekker dyrehagen…","prompt.egg":"Et kaldt egg! Det klekkes…","prompt.egg1":"Egget rører på seg! Det klekkes…","prompt.egg2":"Det slår sprekker! Det klekkes…","prompt.forgot":"{name} har glemt måltidet sitt. Klokka er…","prompt.hungry":"{name} er sulten! Spiser…","prompt.snack":"{name} vil gjerne ha en matbit…","button.warm":"Varm egget!","button.feed":"Mat {name}!","cheer.1":"Ja!","cheer.2":"Perfekt!","cheer.3":"Helt riktig!","cheer.4":"Sånn ja!","cheer.5":"Der satt den!","cheer.streak":"{cheer} {n} på rad!","crack.1":"Det kom en sprekk!","crack.2":"Enda en sprekk — det er nesten ute!","hatch.stir":"Noe rører seg der inne …","hatch.now":"Det klekket!","hatch.hello":"{name} sier hei!","evolve.now":"Noe skjer …","evolve.done":"{name} er nå {label}!","form.2":"den modige","form.3":"den store","teach.nearMiss":"Nesten! ","teach.hourExact":"Når klokka er {hour}, peker den korte tjukke viseren rett på {hourNum}-tallet.","teach.hourPastHalf":"Den korte tjukke viseren er mer enn halvveis fra {hourNum} til {next} — men timen er fortsatt {hourNum}.","teach.hourJustLeft":"Se på den korte tjukke viseren: {time} har den akkurat forlatt {hourNum}-tallet.","teach.minuteOClock":"Når klokka er {hour}, peker den lange viseren rett opp.","teach.minuteCountOne":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.minuteCountMany":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.both":"Her skal begge viserne stå når klokka er {time}.","nap.title":"Dyrene sover!","nap.copy":"Det var en god økt. Alle tar seg en blund — du kan fortsatt besøke dem i dyrehagen.","nap.countdown":"Våkner om","nap.wake":"Vekk dyrene","nap.visit":"Besøk dyrehagen","nap.sleeping":"sover","zoo.empty":"Ingen dyr ennå! Still klokka riktig noen ganger, så klekkes det første egget ditt.","zoo.egg":"{species}-egg","zoo.eggTitle":"Et kaldt egg","zoo.eggTitleCracks":"Et egg som slår sprekker, {n} av {of}","zoo.rename":"Hva heter dette dyret?","habitat.back":"Tilbake til dyrehagen","habitat.rename":"Gi dyret et nytt navn","habitat.aria":"Hjemmet til {name}","habitat.eggAria":"Hjemmet som venter på et {species}-egg","habitat.hint":"Kast ballen, gi en godbit, eller klapp {name}.","habitat.eggHint":"Dette hjemmet venter. Still klokka riktig, så klekkes egget.","habitat.sleeping":"{name} sover godt. Hysj.","unlock.title":"Nye dyr har kommet!","unlock.copy":"{tier} — {blurb}","unlock.close":"Kom igjen!","howto.summary":"Slik spiller du","howto.1":"Et dyr sier når det spiser. Dra viserne til det klokkeslettet.","howto.2":"Den <b>lange tynne viseren</b> er minuttene — den hopper fem minutter om gangen. Den <b>korte tjukke viseren</b> er timen.","howto.3":"Se hvordan den korte viseren sniker seg framover når du flytter den lange. Kvart over fire har den allerede forlatt 4-tallet — sånn funker en ekte klokke.","howto.4":"Klarer du samme klokkeslett fire ganger, sprekker egget til et dyr som blir ditt.","howto.5":"Etter noen minutter blir dyrene trøtte, og spillet stopper. Du kan fortsatt gå rundt i dyrehagen mens de sover.","howto.6":"Voksne: hold inne tittelen for å se framgang.","grownups.practise":"Hva som øves på","grownups.practiseHelp":"Skru av det de ikke trenger akkurat nå, eller hopp over trinnene de allerede kan. Dyr fra noe som er skrudd av går og hviler — de beholder alt de har tjent opp, de blir ikke sultne, og de fortsetter nøyaktig der de slapp hvis du skrur det på igjen.","grownups.skip":"Hopp over","grownups.practiseThis":"Øv på denne","grownups.skipped":"hoppet over","grownups.lastSubject":"Det må være noe igjen å øve på.","subject.clock":"Klokka","subject.add":"Pluss","zoo.resting":"{name} hviler","grownups.title":"Framgang","grownups.answered":"Klokkeslett svart på","grownups.accuracy":"Riktig på første forsøk","grownups.streak":"Beste rekke","grownups.hatched":"Dyr klekket","grownups.days":"Dager spilt","grownups.fine":"Klokkeslettene planlegges med en gjentakelsesalgoritme: hvert av dem kommer tilbake akkurat når det holder på å bli glemt. Alt lagres bare i denne nettleseren.","grownups.close":"Lukk","grownups.reset":"Start på nytt","grownups.resetConfirm":"Starte på nytt? Alle dyr og all framgang forsvinner.","settings.title":"Innstillinger","settings.language":"Språk","settings.playTime":"Spilletid","settings.playTimeValue":"{n} minutter","settings.playTimeHelp":"Hvor lenge en økt varer før dyrene må sove. Korte økter funker best — tre til fem minutter.","settings.digital":"Vis digital tid","settings.digitalHelp":"Av til vanlig. Når den er av, sier dyrene måltidet sitt bare med ord, så urskiva er eneste stedet å lese det.","settings.transfer":"Flytt til en annen enhet","settings.transferHelp":"Lagre dyrehagen som en fil, eller kopier den som en kode du kan sende i en melding. Åpner du en av delene på en annen enhet, blir alle dyrene med. Dyrehagen som allerede er der, blir erstattet.","settings.done":"Ferdig","transfer.exportFile":"Lagre fil","transfer.copyCode":"Kopier kode","transfer.importFile":"Åpne fil …","transfer.pasteCode":"Lim inn kode","transfer.pastePrompt":"Lim inn koden fra den andre enheten:","transfer.confirm":"Erstatte dyrehagen på denne enheten med den du henter inn? Dyrene som er her nå, forsvinner.","transfer.saved":"Lagret {file}.","transfer.copied":"Koden er kopiert — lim den inn på den andre enheten.","transfer.copyFailed":"Fikk ikke tak i utklippstavla, så koden ble lagret som fil i stedet.","transfer.imported":"Hentet inn {n} dyr.","transfer.badFile":"Dette ser ikke ut som en lagret dyrehage.","transfer.badApp":"Den lagringa er fra et annet spill.","transfer.badVersion":"Den lagringa er fra en nyere utgave av Dyrehagen enn denne.","coins.name":"gullmynter","coins.balance":"{n} gullmynter","coins.earned":"+{n}","shop.open":"Gå til butikken","shop.title":"Dyrehagebutikken","shop.intro":"Noe fint til ett av dyra dine.","shop.forPet":"Handler til {name}","shop.pickPet":"Hvem skal det være til?","shop.empty":"Ingen dyr ennå! Klekk det første egget, så åpner butikken.","shop.locked":"Låst","shop.lockedHelp":"Lær flere klokkeslett for å åpne denne.","shop.owned":"Hjemme hos {name}","shop.full":"Det er fullt hos {name}. Selg noe for å få plass.","shop.tooDear":"Ikke nok mynter ennå.","shop.buy":"Kjøp!","shop.cancel":"Ikke nå","shop.confirm":"{item} — sette den hjemme hos {name} for {price} gullmynter?","shop.bought":"{name} elsker den!","shop.sell":"Selg tilbake","shop.sellConfirm":"{item} — selge den tilbake? Du får alle {price} gullmyntene igjen.","shop.sold":"Solgt — {price} gullmynter tilbake.","shop.close":"Ferdig","shop.tabHome":"Hjemme hos dyra","shop.tabZoo":"Hele dyrehagen","shop.ownedZoo":"I dyrehagen","shop.fullBackdrop":"Det står noe langt borte hos {name} fra før. Selg det for å få plass.","shop.fullZoo":"Plassen ute i dyrehagen er full. Selg noe for å få plass.","shop.confirmZoo":"{item} — sette den ut i dyrehagen for {price} gullmynter?","shop.boughtZoo":"Så fint det ble ute!","yard.label":"Dyrehageplassen","shop.flowerbed":"Blomsterbed","shop.lantern":"Lykt","shop.house":"Lite hus","shop.swing":"Huske","shop.pond":"Dam","shop.hammock":"Hengekøye","shop.arch":"Blomsterbue","shop.windmill":"Vindmølle","shop.stump":"Trestubbe","shop.sandpit":"Sandkasse","shop.beehive":"Bikube","shop.feeder":"Fuglemater","shop.farGrove":"Trær langt borte","shop.farMill":"Mølle langt borte","shop.farArch":"Port langt borte","shop.farTower":"Tårn langt borte","shop.signpost":"Skilt","shop.topiary":"Formklippet tre","shop.bunting":"Vimpler","shop.pathLamps":"Lykter langs stien","shop.fountain":"Fontene","shop.statue":"Statue","prompt.sumEgg":"Et kaldt egg! Varm det opp:","prompt.sumEgg1":"Egget rører på seg! Fortsett:","prompt.sumEgg2":"Det slår sprekker! Én til:","prompt.sumForgot":"{name} har glemt matbiten sin. Den er:","prompt.sumHungry":"{name} er sulten! Matbiten er:","prompt.sumSnack":"{name} vil gjerne ha en matbit:","teach.sumOffByOne":"Bare én bom — tell en gang til.","teach.sumTransposed":"Riktige sifre, men i feil rekkefølge.","teach.sumGaveAddend":"Det er bare det ene tallet.","teach.sumGaveDifference":"Det er å ta dem fra hverandre, ikke å legge dem sammen.","teach.sumPlain":"{a} og {b} blir {sum}.","teach.sumMakeTen":"{a} og {bridge} blir ti, så {rest} til — {sum}.","tier.add.0.name":"Telle videre","tier.add.0.blurb":"Å legge til ingenting, og å legge til én.","tier.add.1.name":"Summer opp til ti","tier.add.1.blurb":"Alt som får plass i én tierramme.","tier.add.2.name":"Dobler","tier.add.2.blurb":"To like, over ti.","tier.add.3.name":"Legge til ti","tier.add.3.blurb":"Svaret står allerede i oppgaven.","tier.add.4.name":"Over tieren","tier.add.4.blurb":"Lag ti først, så legger du til resten.","answer.aria":"Svaret ditt","answer.empty":"ingenting ennå","answer.keypad":"Talltaster","answer.digit":"Sett inn {n}","answer.clear":"Tøm","settings.answerMode":"Svarer med","settings.answerAuto":"Automatisk","settings.answerType":"Tastatur","settings.answerTap":"Knapper","answer.writeHere":"Skriv her","answer.reads":"leser {n}","answer.orThis":"eller {n}?","answer.fixTitle":"Hvilket tall var det?","answer.fixHint":"Trykk på det den leser for å rette det.","answer.mirrored":"Du skrev det motsatt vei. Sånn pleier det å se ut:","answer.undo":"Angre","settings.answerWrite":"Skriving","settings.mirrorNudge":"Øv på hvilken vei tallene vender","settings.mirrorNudgeHelp":"Av til å begynne med. Et speilvendt tall teller alltid — å skrive 3 og 5 motsatt vei er helt vanlig i denne alderen. Er denne på, viser spillet også hvilken vei de vanligvis vender.","tier.0.name":"Hele timer","tier.0.blurb":"Den lange viseren peker rett opp.","tier.1.name":"Halve timer","tier.1.blurb":"Den lange viseren peker rett ned.","tier.2.name":"Kvart over og kvart på","tier.2.blurb":"Den lange viseren peker til siden.","tier.3.name":"Hvert femte minutt","tier.3.blurb":"Tell rundt skiva i femmere."}},Rs=e=>Object.keys(W[e]??{}),po=(e,t)=>t?String(e).replace(/\{(\w+)\}/g,(r,o)=>Object.prototype.hasOwnProperty.call(t,o)?String(t[o]):r):String(e);function Fs(e){const t=W[e]??W[L],r=W[L],o=(n,s)=>po(t[n]??r[n]??n,s);return o.lang=W[e]?e:L,o.spoken=(n,s)=>fo(o.lang,n,s),o.spokenSum=(n,s)=>io(o.lang,n,s),o.number=n=>Q(o.lang,n),o.hourWord=n=>je(o.lang,n),o.names=de[o.lang]??de[L],o}const Me="add",ho="add:",X=10,uo=/^add:(\d{1,2})\+(\d{1,2})$/,pe=e=>Number.isInteger(e)&&e>=0&&e<=X,Le=({a:e,b:t})=>`add:${Math.min(e,t)}+${Math.max(e,t)}`;function Je(e){const t=uo.exec(String(e??""));return t?{a:Number(t[1]),b:Number(t[2])}:null}function tr(e){const t=Je(e);return!t||!pe(t.a)||!pe(t.b)?!1:t.a<=t.b&&e===Le(t)}function et({a:e,b:t}){const r=Math.min(e,t),o=Math.max(e,t);return r+o<=10?r<=1?0:1:r===o?2:o===X?3:4}const Se=[{id:0},{id:1},{id:2},{id:3},{id:4}],go=Se.length-1,tt=[];for(let e=0;e<=X;e+=1)for(let t=e;t<=X;t+=1)tt.push({a:e,b:t,id:Le({a:e,b:t}),tier:et({a:e,b:t})});tt.sort((e,t)=>e.a+e.b-(t.a+t.b)||e.a-t.a);const rr=e=>tt.filter(t=>t.tier===e),or=Se.flatMap(e=>rr(e.id));function yo(e,t){const r=Je(e);if(!r||!tr(e))return!1;const{a:o,b:n}=t??{};return!pe(o)||!pe(n)?!1:o===r.a&&n===r.b}const mo=({a:e,b:t})=>e+t>=10?2:1,nr=2,ko=()=>nr,$o=1.6,bo=e=>String(e).split("").reverse().join("");function xo({a:e,b:t},r){const o=e+t,s=r==null||r===""?NaN:Number(r);if(!Number.isInteger(s)||s<0)return{verdict:"blank",correct:!1,nearMiss:!1,delta:0};let a;return s===o?a="correct":Math.abs(s-o)===1?a="offByOne":o>=10&&String(s)===bo(o)?a="transposed":s===e||s===t?a="gaveAddend":s===Math.abs(e-t)?a="gaveDifference":a="wrong",{verdict:a,correct:a==="correct",nearMiss:a==="offByOne"||a==="transposed",delta:s-o}}const wo=Object.freeze(Object.defineProperty({__proto__:null,ALL_ITEMS:or,LAST_TIER:go,MAX_ADDEND:X,MAX_ANSWER_DIGITS:nr,TIERS:Se,answerDigits:mo,answerWidth:ko,grade:xo,id:Me,idOf:Le,owns:tr,paceScale:$o,parse:Je,prefix:ho,tierItems:rr,tierOf:et,valid:yo},Symbol.toStringTag,{value:"Module"})),rt="clock",Mo="",Lo=/^([1-9]|1[0-2]):[0-5][0-9]$/,So=e=>typeof e=="string"&&Lo.test(e),vo=e=>Jr(e),Ao=({h:e,m:t})=>E(e,t),To=({m:e})=>er(e)??0,Co=()=>0;function Do(e,t){const{h:r,m:o}=t??{};return!Number.isInteger(r)||r<1||r>12||!Number.isInteger(o)||o<0||o>59||o%be!==0?!1:e===E(r,o)}const Eo=1,Io=Object.freeze(Object.defineProperty({__proto__:null,ALL_ITEMS:Xe,LAST_TIER:xe,TIERS:P,answerDigits:Co,grade:oo,id:rt,idOf:Ao,owns:So,paceScale:Eo,parse:vo,prefix:Mo,tierItems:we,tierOf:To,valid:Do},Symbol.toStringTag,{value:"Module"})),w={[rt]:Io,[Me]:wo},M=Object.keys(w),I=rt,Oo=Object.fromEntries(M.map(e=>[e,w[e].LAST_TIER]));function sr(e){for(const t of Object.values(w))if(t.owns(e))return t;return null}const Zo=e=>{var t;return((t=sr(e))==null?void 0:t.id)??null},Ns=()=>M.reduce((e,t)=>e+w[t].ALL_ITEMS.length,0),he=Object.fromEntries(M.map(e=>[e,{on:!0,floor:0}]));function ot(e){const t=e!=null&&e.practice&&typeof e.practice=="object"?e.practice:null,r={};for(const o of M){const n=t==null?void 0:t[o],s=Number.isFinite(n==null?void 0:n.floor)?Math.floor(n.floor):0;r[o]={on:(n==null?void 0:n.on)===void 0?!0:!!n.on,floor:Math.max(0,Math.min(s,w[o].LAST_TIER))}}return M.some(o=>r[o].on)||(r[I].on=!0),r}const ve=(e,t)=>{var r;return!!((r=e==null?void 0:e[t])!=null&&r.on)},Ae=(e,t)=>{var r;return((r=e==null?void 0:e[t])==null?void 0:r.floor)??0},js=e=>M.filter(t=>ve(e,t));function ue(e,t){const r=t==null?void 0:t[(e==null?void 0:e.subject)??I];return r?r.on?((e==null?void 0:e.tier)??0)<r.floor:!0:!1}const Ps=e=>M.reduce((t,r)=>{if(!ve(e,r))return t;const o=Ae(e,r);return t+w[r].ALL_ITEMS.filter(n=>n.tier>=o).length},0);function H(e){const t={};for(const r of M)t[r]=0;if(e!=null&&e.tiers&&typeof e.tiers=="object"){for(const r of M){const o=e.tiers[r];Number.isFinite(o)&&(t[r]=Math.max(0,Math.floor(o)))}return t}return Number.isFinite(e==null?void 0:e.tier)&&(t[I]=Math.max(0,Math.floor(e.tier))),t}function Pe(e,t,r){const o=w[t];if(!o)return 0;const n=o.tierItems(r);return n.length?n.filter(a=>{var l;return((l=e==null?void 0:e[a.id])==null?void 0:l.phase)==="graduated"}).length/n.length:0}function _o(e,t,r=0){const o=w[t];if(!o)return 0;let n=Math.max(0,Math.min(r,o.LAST_TIER));for(;n<o.LAST_TIER&&Pe(e,t,n)>=Xt;)n+=1;return n}function xt(e,t,r=he){const o=e??{},n=typeof t=="object"&&t!==null?t:{[I]:t},s=r??he,a=M.map(l=>{const i=w[l];if(!ve(s,l))return[];const f=Math.min(Number.isFinite(n[l])?n[l]:0,i.LAST_TIER),g=[];for(let h=Ae(s,l);h<=f;h+=1)for(const u of i.tierItems(h))o[u.id]||g.push({...u,subject:l});return g});return Ro(a)}function Ro(e){const t=[],r=Math.max(0,...e.map(o=>o.length));for(let o=0;o<r;o+=1)for(const n of e)o<n.length&&t.push(n[o]);return t}function Fo(e){const t=H(e),r=ot(e),o={},n=[];for(const s of M){const a=Math.max(t[s],_o((e==null?void 0:e.items)??{},s,Ae(r,s)));o[s]=a,a>t[s]&&n.push(s)}return{tiers:o,unlocked:n}}const wt=[1,3,8],No=2,jo=3,Po=7,Ho=4,zo=2,ar=e=>Math.min(Math.max(e-1,0),zo),He=[1,3,5],ze=He.length;function ge(e){let t=0;for(let r=0;r<He.length;r+=1)e>=He[r]&&(t=r+1);return t}const Bo=2.5,lr=1.3,ir=2.8,Go=.2,Uo=60,Mt=864e5,cr=(e,t,r)=>Math.min(Math.max(e,t),r);function Hs({subject:e=I,tier:t,species:r,reviewClock:o=0,id:n,...s}){return{subject:e,...s,tier:t??er(s.m)??0,species:r,name:null,phase:"learning",step:0,dueStep:o+1,ease:Bo,intervalDays:0,dueAt:0,reps:0,feeds:0,lapses:0,correctStreak:0,cracks:0,hatchedAt:null,seen:0,lastMs:0}}function Ko({correct:e,ms:t=0,reversals:r=0,pace:o=1}){if(!e)return 0;const n=Math.max(1,o);return t>2e4*n||r>=2?3:t>8e3*n||r>=1?4:5}const qo=(e,t)=>cr(e+(.1-(5-t)*(.08+(5-t)*.02)),lr,ir),Qo=(e,t,r)=>e<=1?1:e===2?3:Math.min(Math.round(t*r),Uo);function zs(e,{correct:t,ms:r=0,reversals:o=0,pace:n=1,reviewClock:s,now:a}){const l=Ko({correct:t,ms:r,reversals:o,pace:n}),i={...e,seen:e.seen+1,lastMs:r},f={quality:l,graduated:!1,hatched:!1,lapsed:!1,evolved:0,cracked:0};if(t){if(i.correctStreak=e.correctStreak+1,e.hatchedAt===null){const u=Math.max(e.cracks??0,ar(i.correctStreak));u>(e.cracks??0)&&(f.cracked=u),i.cracks=u}if(e.phase==="learning"){const u=e.hatchedAt===null?Ho:jo;i.correctStreak>=u?(i.phase="graduated",i.reps=1,i.feeds=e.feeds+1,i.intervalDays=1,i.dueAt=a+Mt,i.dueStep=null,f.graduated=!0,i.hatchedAt===null&&(i.hatchedAt=a,f.hatched=!0)):(i.step=Math.min(e.step+1,wt.length-1),i.dueStep=s+wt[i.step])}else i.ease=qo(e.ease,l),i.reps=e.reps+1,i.feeds=e.feeds+1,i.intervalDays=Qo(i.reps,e.intervalDays,i.ease),i.dueAt=a+i.intervalDays*Mt}else i.correctStreak=0,i.step=0,i.dueStep=s+No,e.phase==="graduated"&&(i.phase="learning",i.ease=cr(e.ease-Go,lr,ir),i.lapses=e.lapses+1,i.dueAt=0,i.intervalDays=0,i.reps=0,f.lapsed=!0);const g=ge(e.feeds),h=ge(i.feeds);return g>=1&&h>g&&(f.evolved=h),{item:i,events:f}}const _e=e=>e.phase==="learning",fr=(e,t)=>e.phase==="graduated"&&e.dueAt<=t,Bs=(e,t,r=he)=>Object.values(e).filter(o=>fr(o,t)&&!ue(o,r)).length;function Gs(e,t,r){const o={};let n=!1;for(const[s,a]of Object.entries(e.items??{})){const l=ue(a,t),i=Number.isFinite(a.restedAt);if(l&&!i)o[s]={...a,restedAt:r,restedStep:e.reviewClock??0},n=!0;else if(!l&&i){const f=Math.max(0,r-a.restedAt),g=Math.max(0,(e.reviewClock??0)-(a.restedStep??0)),h={...a};delete h.restedAt,delete h.restedStep,h.dueAt>0&&(h.dueAt+=f),Number.isFinite(h.dueStep)&&(h.dueStep+=g),o[s]=h,n=!0}else o[s]=a}return n?{...e,practice:t,items:o}:{...e,practice:t}}const Wo=e=>{const t=([,r])=>(r.subject??I)===e?1:0;return r=>(o,n)=>t(o)-t(n)||r(o[1])-r(n[1])};function Us(e,{now:t,exclude:r=null,lastSubject:o=null}={}){const n=e.reviewClock+1,s=H(e),a=ot(e),l=Object.entries(e.items).filter(([y,ne])=>y!==r&&!ue(ne,a)),i=Wo(o),f=l.filter(([,y])=>_e(y)&&y.dueStep!==null&&y.dueStep<=n).sort(i(y=>y.dueStep));if(f.length)return f[0][0];const g=l.filter(([,y])=>fr(y,t)).sort(i(y=>y.dueAt));if(g.length)return g[0][0];if(l.filter(([,y])=>_e(y)).length<Po){const y=xt(e.items,s,a)[0];if(y)return y.id}const u=l.filter(([,y])=>y.phase==="graduated").sort(i(y=>y.dueAt));if(u.length)return u[0][0];const k=l.filter(([,y])=>_e(y)).sort(i(y=>y.seen));if(k.length)return k[0][0];const oe=r?e.items[r]:null;if(oe&&!ue(oe,a))return r;const C=xt(e.items,Oo,a)[0];if(C)return C.id;const U=M.find(y=>ve(a,y))??I,Oe=Ae(a,U);return(w[U].tierItems(Oe)[0]??w[U].ALL_ITEMS[0]).id}function Ks(e,t=I){const{tiers:r}=Fo(e),o=H(e)[t]??0,n=r[t]??0;return{tier:n,unlocked:n>o}}const z=5,ye=2,q=z*ye,A=20,Te=3,Ce=5,ae=z*A+(z-1)*Te+Ce*2,dr=ye*A+(ye-1)*Te+Ce*2,Re=14;function pr(e,t){const r=Math.max(0,Math.floor(e)),o=Math.max(0,Math.floor(t)),n=r+o,s=Math.min(o,Math.max(0,q-r)),a=[];for(let l=0;l<n;l+=1){const i=l%q;a.push({index:l,frame:Math.floor(l/q),row:Math.floor(i/z),col:i%z,from:l<r?"a":"b",bridges:l>=r&&l<r+s&&r+s===q})}return{a:r,b:o,total:n,bridge:s,rest:o-s,frames:Math.max(1,Math.ceil(n/q)),cells:a}}const hr=e=>Ce+e*(A+Te),ur=e=>Ce+e*(A+Te);function Yo(e){const t=[];for(let r=0;r<ye;r+=1)for(let o=0;o<z;o+=1)t.push(`<rect class="tf-cell" x="${hr(o)}" y="${ur(r)}" width="${A}" height="${A}" rx="4" />`);return`<g transform="translate(${e} 0)">
      <rect class="tf-frame" x="0.5" y="0.5" width="${ae-1}" height="${dr-1}" rx="7" />
      ${t.join("")}
    </g>`}function qs(e,t,{step:r=.07,title:o=""}={}){const n=pr(e,t),s=n.frames*ae+(n.frames-1)*Re,a=[];for(let i=0;i<n.frames;i+=1)a.push(Yo(i*(ae+Re)));const l=n.cells.map(i=>{const f=i.frame*(ae+Re)+hr(i.col)+A/2,g=ur(i.row)+A/2;return`<circle class="${["tf-dot",`tf-from-${i.from}`,i.bridges?"tf-bridge":""].filter(Boolean).join(" ")}" cx="${f}" cy="${g}" r="${A/2-2.5}" style="--tf-delay:${(i.index*r).toFixed(2)}s" />`});return`<svg class="tenframe" viewBox="0 0 ${s} ${dr}" role="img" aria-label="${o}" xmlns="http://www.w3.org/2000/svg">
      ${a.join("")}
      ${l.join("")}
    </svg>`}const Qs=(e,t,r=.07)=>(pr(e,t).total*r+.35)*1e3,nt=5,Vo=2,Xo=15,Jo=.6,en=5,tn=120*1e3,rn=1800*1e3,on=(e,t,r)=>Math.min(Math.max(e,t),r);function nn(e){const t=Math.round(Number(e)),r=on(Number.isFinite(t)?t:nt,Vo,Xo),o=r*60*1e3;return{minutes:r,hardMs:o,softMs:Math.round(o*Jo),maxQuestions:r*en}}const st=nn(nt);function Ws(e){return{startedAt:e,answered:0,correct:0,napUntil:0}}const J=(e,t)=>Math.max(0,t-((e==null?void 0:e.startedAt)??t));function Ys(e,{now:t,correct:r,limits:o=st}){return e.answered>=o.maxQuestions?"count":J(e,t)>=o.hardMs?"hard":r&&J(e,t)>=o.softMs?"soft":null}const Vs=(e,t,r=st)=>J(e,t)>=r.hardMs,Xs=e=>!!(e!=null&&e.startedAt),Js=(e,t)=>J(e,t)>=rn,ea=(e,t)=>({...e,napUntil:t+tn}),ta=(e,t)=>!!(e!=null&&e.napUntil)&&t<e.napUntil,ra=(e,t)=>Math.max(0,((e==null?void 0:e.napUntil)??0)-t),oa=(e,t,r=st)=>Math.min(1,J(e,t)/r.hardMs);function na(e){const t=Math.ceil(e/1e3);return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}const p="#43354f",at=[37,63],Lt=52,lt=[-1,1],St={round:{shape:'<ellipse cx="50" cy="54" rx="34" ry="32" />',halo:{cx:50,cy:54,rx:34,ry:32}},tall:{shape:'<ellipse cx="50" cy="52" rx="28" ry="34" />',halo:{cx:50,cy:52,rx:28,ry:34}},wide:{shape:'<ellipse cx="50" cy="58" rx="38" ry="28" />',halo:{cx:50,cy:58,rx:38,ry:28}},pear:{shape:'<path d="M50 22 C66 22 72 38 74 54 C76 72 66 86 50 86 C34 86 24 72 26 54 C28 38 34 22 50 22 Z" />',halo:{cx:50,cy:55,rx:25,ry:32}},bean:{shape:'<path d="M53 20 C71 20 81 37 79 56 C77 76 63 86 47 86 C30 86 21 71 21 54 C21 34 35 20 53 20 Z" />',halo:{cx:50,cy:53,rx:29,ry:33}},chunky:{shape:'<path d="M50 20 C74 20 86 34 86 55 C86 76 71 86 50 86 C29 86 14 76 14 55 C14 34 26 20 50 20 Z" />',halo:{cx:50,cy:53,rx:36,ry:33}}},sn=`
  <ellipse cx="35" cy="85" rx="10" ry="6" />
  <ellipse cx="65" cy="85" rx="10" ry="6" />`,se=(e,t,r=1)=>{const o=t*Math.PI/180;return{x:e.cx+Math.sin(o)*e.rx*r,y:e.cy-Math.cos(o)*e.ry*r}},vt={smooth:()=>"",fluffy:e=>Array.from({length:18},(t,r)=>{const o=se(e,r*20,1);return`<circle cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="7" />`}).join(""),spiky:e=>Array.from({length:5},(t,r)=>{const o=-70+r*22,n=se(e,o-9,.97),s=se(e,o+9,.97),a=se(e,o,1.22);return`<path d="M${n.x.toFixed(1)} ${n.y.toFixed(1)} L${a.x.toFixed(1)} ${a.y.toFixed(1)} L${s.x.toFixed(1)} ${s.y.toFixed(1)} Z" />`}).join("")},an=new Set(["horn","fin","antenna","tuft","leaf","antlers","rabbit"]),At={none:()=>"",roundears:()=>'<circle cx="26" cy="30" r="13" /><circle cx="74" cy="30" r="13" />',ears:()=>`
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
    <path d="M50 30 C50 20 46 14 38 12 C38 22 42 28 50 30 Z" fill="${e}" />`},$="#ffffff",Tt={round:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9.5" ry="10.5" fill="${p}" />
    <circle cx="${e-3.2}" cy="47.5" r="3.6" fill="${$}" />
    <circle cx="${e+3}" cy="56" r="1.8" fill="${$}" opacity="0.85" />`,oval:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="6.8" ry="11.5" fill="${p}" />
    <circle cx="${e-2.4}" cy="47" r="2.9" fill="${$}" />
    <circle cx="${e+2}" cy="56.5" r="1.4" fill="${$}" opacity="0.85" />`,sleepy:e=>`
    <path class="pet-eye" d="M${e-9} 50 Q${e} 45.5 ${e+9} 50 Q${e} 63.5 ${e-9} 50 Z" fill="${p}" />
    <circle cx="${e-3}" cy="53.5" r="3.2" fill="${$}" />
    <circle cx="${e+3.4}" cy="57" r="1.5" fill="${$}" opacity="0.85" />`,sparkle:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9" ry="11" fill="${p}" />
    <path d="M${e-3} 43 Q${e-2} 47 ${e+1.5} 48 Q${e-2} 49 ${e-3} 53
             Q${e-4} 49 ${e-7.5} 48 Q${e-4} 47 ${e-3} 43 Z" fill="${$}" />
    <circle cx="${e+3.5}" cy="56.5" r="1.9" fill="${$}" opacity="0.85" />`,lashed:(e,t)=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="8" ry="10.5" fill="${p}" />
    <circle cx="${e-2.6}" cy="47.5" r="3" fill="${$}" />
    <path d="M${e+t*7} 46 l${t*5.5} -4" stroke="${p}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*8.2} 50 l${t*6} -1.6" stroke="${p}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*7.6} 54 l${t*5.6} 1.8" stroke="${p}" stroke-width="2.4" stroke-linecap="round" fill="none" />`,beady:e=>`
    <circle class="pet-eye" cx="${e}" cy="52" r="5.6" fill="${p}" />
    <circle cx="${e-1.8}" cy="50" r="2.1" fill="${$}" />`},ln=e=>`<g transform="translate(0 ${Lt}) scale(1 0.08) translate(0 ${-Lt})">${e}</g>`+lt.map((t,r)=>{const o=at[r];return`<path d="M${o-9} 52 Q${o} 58.5 ${o+9} 52" fill="none" stroke="${p}"
                  stroke-width="3.2" stroke-linecap="round" />`}).join(""),Ct={none:()=>"",thick:(e,t)=>`<path d="M${e+t*8.5} 35.5 L${e-t*8} 35" stroke="${p}" stroke-width="4" stroke-linecap="round" fill="none" />`,arched:e=>`<path d="M${e-8.5} 37.5 Q${e} 30.5 ${e+8.5} 37.5" stroke="${p}" stroke-width="3.2" stroke-linecap="round" fill="none" />`,worried:(e,t)=>`<path d="M${e+t*8.5} 38.5 L${e-t*8.5} 33.5" stroke="${p}" stroke-width="3.4" stroke-linecap="round" fill="none" />`,bushy:e=>`<path d="M${e-9} 36.5 Q${e} 29.5 ${e+9} 36.5" stroke="${p}" stroke-width="5.6" stroke-linecap="round" fill="none" />`},Dt={happy:{rot:0,dy:-2.5},content:{rot:0,dy:0},hungry:{rot:-2,dy:-3.5},droopy:{rot:-9,dy:1.5},sleep:{rot:-4,dy:1}},Et={happy:`<path d="M41 66 C45 75 55 75 59 66" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,content:`<path d="M44 67 C47 72 53 72 56 67" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,hungry:`<ellipse cx="50" cy="69" rx="7" ry="8" fill="${p}" />
           <ellipse cx="50" cy="73" rx="4.5" ry="3.5" fill="#ff9ec0" />`,droopy:`<path d="M43 71 C46 65 54 65 57 71" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,sleep:`<path d="M44 68 C47 73 53 73 56 68" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`},m=e=>({back:"",front:e}),Y=(e,t)=>({back:e,front:t}),It=(e,t,r)=>Array.from({length:10},(o,n)=>{const s=(n*36-90)*Math.PI/180,a=n%2?r*.45:r;return`${(e+Math.cos(s)*a).toFixed(1)} ${(t+Math.sin(s)*a).toFixed(1)}`}).join(" L"),cn={none:()=>m(""),roundSpecs:e=>m(`
      <g fill="${$}" fill-opacity="0.35" stroke="${p}" stroke-width="2.6">
        <circle cx="37" cy="52" r="12.5" /><circle cx="63" cy="52" r="12.5" />
      </g>
      <path d="M49.5 52 H50.5 M24.5 50 L16 47 M75.5 50 L84 47" stroke="${p}"
            stroke-width="2.6" stroke-linecap="round" fill="none" />`),squareSpecs:e=>m(`
      <g fill="${$}" fill-opacity="0.35" stroke="${p}" stroke-width="3.2">
        <rect x="24.5" y="41" width="25" height="22" rx="6" />
        <rect x="50.5" y="41" width="25" height="22" rx="6" />
      </g>
      <path d="M49.5 51 H50.5 M24 46 L16 44 M76 46 L84 44" stroke="${p}"
            stroke-width="3" stroke-linecap="round" fill="none" />`),goggles:e=>m(`
      <path d="M18 48 H82" stroke="${e.accent}" stroke-width="7" stroke-linecap="round" />
      <g fill="${$}" fill-opacity="0.4" stroke="${p}" stroke-width="3">
        <circle cx="37" cy="52" r="13.5" /><circle cx="63" cy="52" r="13.5" />
      </g>`),monocle:e=>m(`
      <circle cx="63" cy="52" r="13" fill="${$}" fill-opacity="0.35" stroke="${p}" stroke-width="2.8" />
      <path d="M63 65 C63 72 58 75 54 76" stroke="${p}" stroke-width="2" fill="none" stroke-linecap="round" />`),starShades:e=>m(`
      <path d="M${It(37,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${p}" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M${It(63,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${p}" stroke-width="2.2" stroke-linejoin="round" />`)},fn=new Set(["cowlick","topknot","cap"]),dn={none:()=>m(""),fringe:e=>m(`<path d="M23 40 C26 24 40 18 50 18 C62 18 74 25 76 40
                    C70 32 62 34 57 39 C54 31 44 30 39 36 C34 32 27 34 23 40 Z"
                 fill="${e.accent}" />`),cowlick:e=>m(`<path d="M46 22 C44 12 52 6 60 4 C54 10 55 15 60 17 C54 19 49 20 46 26 Z" fill="${e.accent}" />`),topknot:e=>m(`<circle cx="50" cy="14" r="10" fill="${e.accent}" stroke="${p}" stroke-width="2.2" />
           <path d="M42 22 Q50 26 58 22" stroke="${p}" stroke-width="3" fill="none" stroke-linecap="round" />`),cap:e=>m(`<g fill="${e.accent}" stroke="${p}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M22 32 C22 16 78 16 78 32 Z" />
             <path d="M78 30 C88 30 90 36 88 38 L74 34 Z" />
           </g>
           <circle cx="50" cy="13" r="4" fill="${p}" />`),bow:e=>m(`<g transform="translate(26 24) rotate(-18)" fill="${e.accent}" stroke="${p}"
              stroke-width="2.2" stroke-linejoin="round">
             <path d="M0 0 C-9 -8 -14 -2 -12 4 C-10 9 -3 7 0 0 Z" />
             <path d="M0 0 C9 -8 14 -2 12 4 C10 9 3 7 0 0 Z" />
             <circle cx="0" cy="0" r="3.6" fill="${p}" stroke="none" />
           </g>`),flower:e=>m(`<g transform="translate(75 28)">
             ${[0,72,144,216,288].map(t=>{const r=t*Math.PI/180;return`<ellipse cx="${(Math.cos(r)*6).toFixed(1)}" cy="${(Math.sin(r)*6).toFixed(1)}" rx="5" ry="4" transform="rotate(${t})" fill="${$}" />`}).join("")}
             <circle cx="0" cy="0" r="4" fill="#ffd166" />
           </g>`)},pn={none:()=>m(""),moustache:()=>m(`<path d="M50 64 C46 59 38 59 35 64 C38 68 46 68 50 64 Z
                    M50 64 C54 59 62 59 65 64 C62 68 54 68 50 64 Z" fill="${p}" />`),beard:()=>m(`<g fill="${p}">
             <circle cx="44" cy="78.5" r="6" /><circle cx="50" cy="81" r="7" /><circle cx="56" cy="78.5" r="6" />
           </g>`),whiskers:()=>m(`<g stroke="${p}" stroke-width="2" stroke-linecap="round" fill="none">
             <path d="M32 64 L18 61 M32 68 L17 68 M32 72 L19 76" />
             <path d="M68 64 L82 61 M68 68 L83 68 M68 72 L81 76" />
           </g>`),teeth:()=>m(`<rect x="45" y="70" width="4.6" height="7" rx="1.6" fill="${$}" stroke="${p}" stroke-width="1.4" />
           <rect x="50.4" y="70" width="4.6" height="7" rx="1.6" fill="${$}" stroke="${p}" stroke-width="1.4" />`),snout:e=>Y(`<ellipse cx="50" cy="69" rx="15" ry="11.5" fill="${e.belly}" />
       <ellipse cx="50" cy="61" rx="5.5" ry="4" fill="${p}" />`,"")},gr={none:()=>m(""),freckles:e=>m(`<g fill="${p}" opacity="0.4">
             <circle cx="26" cy="57" r="1.6" /><circle cx="30" cy="60" r="1.6" /><circle cx="25" cy="63" r="1.6" />
             <circle cx="74" cy="57" r="1.6" /><circle cx="70" cy="60" r="1.6" /><circle cx="75" cy="63" r="1.6" />
           </g>`),spots:e=>Y(`<g fill="${e.accent}" opacity="0.5">
         <ellipse cx="24" cy="44" rx="7" ry="5.5" /><ellipse cx="76" cy="70" rx="6" ry="5" />
         <ellipse cx="70" cy="34" rx="5" ry="4" />
       </g>`,""),stripes:e=>Y(`<g stroke="${e.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55">
         <path d="M20 46 Q26 50 26 58" /><path d="M22 62 Q28 65 29 72" />
         <path d="M80 46 Q74 50 74 58" /><path d="M78 62 Q72 65 71 72" />
       </g>`,""),patch:e=>Y(`<ellipse cx="37" cy="52" rx="15" ry="14" fill="${e.accent}" opacity="0.45" />`,""),heart:e=>Y(`<path d="M50 76 C44 70 38 68 38 63 C38 59 43 58 46 61 C47 62 49 63 50 65
                C51 63 53 62 54 61 C57 58 62 59 62 63 C62 68 56 70 50 76 Z"
             fill="${e.accent}" opacity="0.6" />`,"")},hn={none:()=>m(""),scarf:e=>m(`<g fill="${e.accent}" stroke="${p}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M28 78 C38 85 62 85 72 78 C70 85 62 89 50 89 C38 89 30 85 28 78 Z" />
             <path d="M66 82 C72 84 74 90 71 94 C67 92 65 87 66 82 Z" />
           </g>`),bandana:e=>m(`<path d="M30 79 C40 85 60 85 70 79 L50 95 Z" fill="${e.accent}" stroke="${p}"
                 stroke-width="2.2" stroke-linejoin="round" />`),bowtie:e=>m(`<g transform="translate(50 82)" fill="${e.accent}" stroke="${p}" stroke-width="2.2"
              stroke-linejoin="round">
             <path d="M0 0 L-12 -6 L-12 6 Z" />
             <path d="M0 0 L12 -6 L12 6 Z" />
             <circle cx="0" cy="0" r="3.4" fill="${p}" stroke="none" />
           </g>`),backpack:e=>m(`<g stroke="${p}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M38 44 C33 56 33 68 37 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <path d="M62 44 C67 56 67 68 63 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <rect x="12" y="64" width="17" height="19" rx="6" fill="${e.accent}" />
             <path d="M12 71 H29" fill="none" />
           </g>`)},Ot={x:50,y:86},Zt={x:50,y:55},_t={1:{scale:.78,face:1,faceY:0},2:{scale:.9,face:.87,faceY:-5},3:{scale:1.02,face:.74,faceY:-10}},yr=e=>_t[e]??_t[1],un=e=>{const{scale:t}=yr(e);return`translate(${Ot.x} ${Ot.y}) scale(${t}) translate(-50 -86)`},gn=e=>{const{face:t,faceY:r}=yr(e);return`translate(0 ${r}) translate(${Zt.x} ${Zt.y}) scale(${t}) translate(-50 -55)`},Rt={tail:e=>`<path d="M78 76 C92 74 96 62 90 52 C88 60 84 66 74 68 Z" fill="${e.accent}" />`,wings:e=>`
    <path d="M26 46 C8 34 2 48 6 60 C10 72 22 72 30 64 Z" fill="${e.accent}" opacity="0.92" />
    <path d="M74 46 C92 34 98 48 94 60 C90 72 78 72 70 64 Z" fill="${e.accent}" opacity="0.92" />`,mane:e=>Array.from({length:11},(t,r)=>{const o=(-100+r*20)*Math.PI/180;return`<circle cx="${(50+Math.sin(o)*36).toFixed(1)}" cy="${(58-Math.cos(o)*32).toFixed(1)}" r="9" />`}).join(""),crest:e=>Array.from({length:5},(t,r)=>{const o=30+r*10,n=r===2?20:12;return`<path d="M${o} 24 L${o+5} ${24-n-10} L${o+10} 24 Z" fill="${e.accent}"
                    stroke="${p}" stroke-width="1.8" stroke-linejoin="round" />`}).join(""),finback:e=>`<path d="M46 4 C66 14 80 32 84 54 C74 44 62 38 48 38 Z" fill="${e.accent}"
           stroke="${p}" stroke-width="2" stroke-linejoin="round" />`,plume:e=>`
    <path d="M76 74 C94 68 98 50 92 36 C88 48 82 58 72 64 Z" fill="${e.accent}" opacity="0.85" />
    <path d="M74 78 C90 76 96 64 94 52 C88 62 82 70 70 72 Z" fill="${e.accent}" />`},Ft={bigEars:e=>`
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
    </g>`},S={mochi:{name:"Mochi",body:"round",texture:"smooth",topper:"roundears",eyes:"round",brows:"none",palette:["#ffd9e2","#fff1f4","#ff9ec0"],grows:["mane","tail"],signature:"bigEars"},bloop:{name:"Bloop",body:"bean",texture:"smooth",topper:"antenna",eyes:"sparkle",brows:"none",palette:["#a5d8ff","#e3f2ff","#5fb3f5"],grows:["tail","wings"],signature:"antennaArray"},pip:{name:"Pip",body:"tall",texture:"fluffy",topper:"tuft",eyes:"oval",brows:"arched",palette:["#b2f2d7","#e6fff5","#4fd6a0"],grows:["crest","plume"],signature:"tallTuft"},waddle:{name:"Waddle",body:"wide",texture:"smooth",topper:"none",eyes:"beady",brows:"thick",palette:["#ffe9a8","#fff8dd","#f7b955"],grows:["tail","mane"],signature:"crownSpikes"},puff:{name:"Puff",body:"round",texture:"fluffy",topper:"ears",eyes:"lashed",brows:"arched",palette:["#d9c8ff","#f2ecff","#a884f5"],grows:["mane","wings"],signature:"longEars"},nibbles:{name:"Nibbles",body:"tall",texture:"smooth",topper:"rabbit",eyes:"round",brows:"worried",palette:["#ffd0b0","#fff0e5","#f79a63"],grows:["wings","plume"],signature:"hugeRabbit"},snug:{name:"Snug",body:"wide",texture:"fluffy",topper:"roundears",eyes:"sleepy",brows:"bushy",palette:["#cfe6c0","#eefae6","#8cc472"],grows:["wings","crest"],signature:"ramCurl"},glim:{name:"Glim",body:"pear",texture:"smooth",topper:"horn",eyes:"sparkle",brows:"thick",palette:["#ffc2b8","#fff0ed","#ff8a75"],grows:["finback","wings"],signature:"twinHorns"},noodle:{name:"Noodle",body:"tall",texture:"smooth",topper:"antlers",eyes:"beady",brows:"worried",palette:["#9fe5e0","#e4fbfa","#48c4bc"],grows:["finback","tail"],signature:"bigAntlers"},fizz:{name:"Fizz",body:"chunky",texture:"spiky",topper:"tuft",eyes:"sparkle",brows:"none",palette:["#ffc7ea","#fff0fa","#f778c4"],grows:["crest","plume"],signature:"flameCrest"},cloudlet:{name:"Cloudlet",body:"wide",texture:"fluffy",topper:"fin",eyes:"oval",brows:"none",palette:["#c9dcff","#eef4ff","#7ba2f0"],grows:["finback","crest"],signature:"stormFin"},pebble:{name:"Pebble",body:"round",texture:"smooth",topper:"none",eyes:"sleepy",brows:"thick",palette:["#dcd6e8","#f4f1f9","#a99cc4"],grows:["plume","mane"],signature:"crystal"},sprout:{name:"Sprout",body:"pear",texture:"smooth",topper:"leaf",eyes:"round",brows:"arched",palette:["#c4e8a0","#eefada","#82c44e"],grows:["mane","crest"],signature:"foliageCrown"},bubs:{name:"Bubs",body:"round",texture:"smooth",topper:"floppy",eyes:"lashed",brows:"none",palette:["#f0c2d8","#fdeef5","#d97fae"],grows:["tail","mane"],signature:"longFlop"},zzz:{name:"Zzz",body:"bean",texture:"fluffy",topper:"hound",eyes:"sleepy",brows:"worried",palette:["#bcc4f0","#e8ebfd","#7d8be0"],grows:["plume","tail"],signature:"moonHorns"},tumble:{name:"Tumble",body:"chunky",texture:"spiky",topper:"ram",eyes:"oval",brows:"bushy",palette:["#ffdcb0","#fff4e4","#f0a552"],grows:["crest","finback"],signature:"doubleRam"}},yn=Object.keys(S),me=[["mochi","bloop","pip","waddle"],["puff","nibbles","snug","glim"],["noodle","fizz","cloudlet","pebble"],["sprout","bubs","zzz","tumble"]];function B(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t}function G(e,t){var n;const r=((n=P.find(s=>s.minutes.includes(t)))==null?void 0:n.id)??0,o=me[r]??me[0];return o[B(E(e,t))%o.length]}function mr(e,t){const r=me[et({a:e,b:t})%me.length];return r[B(Le({a:e,b:t}))%r.length]}const mn=e=>(w[(e==null?void 0:e.subject)??"clock"]??w.clock).idOf(e),kn=e=>(e==null?void 0:e.subject)===Me?mr(e.a,e.b):G(e.h,e.m),kr=({species:e,index:t},r=L)=>{const o=de[r]??de[L],n=B(`n${e}`)%o.length;return o[(n+t)%o.length]},sa=(e,t,r=L)=>kr({species:G(e,t),index:ct(e,t)},r),aa=(e,t=L)=>e.name||kr(it(e),t),le={eyewear:"none",hair:"none",facialHair:"none",markings:"none",accessory:"none"},$n=(e,t)=>{var r;return(((r=S[e])==null?void 0:r.grows)??[]).slice(0,Math.max(0,Math.min(t,ze)-1))};function Be(e,t=1){const r=e in S?e:"mochi",o=Math.max(1,Math.min(Math.round(t)||1,ze));return{species:r,...S[r],...le,form:o,anatomy:$n(r,o),signature:o>=ze?S[r].signature:null}}const bn=[["eyewear",["roundSpecs","squareSpecs","goggles","monocle","starShades"]],["hair",["fringe","cowlick","topknot","cap","bow","flower"]],["facialHair",["moustache","beard","whiskers","teeth","snout"]],["accessory",["scarf","bandana","bowtie","backpack"]]],Nt=Object.keys(gr),xn=71;function jt(e){const t=bn.map(([o,n])=>[o,o==="hair"&&e?n.filter(s=>!fn.has(s)):n]),r=[{...le}];for(const[o,n]of t)for(const s of n)r.push({...le,[o]:s});for(let o=0;o<t.length;o+=1)for(let n=o+1;n<t.length;n+=1)for(const s of t[o][1])for(const a of t[n][1])r.push({...le,[t[o][0]]:s,[t[n][0]]:a});return r}const wn={crowned:jt(!0),free:jt(!1)},Mn=e=>{var t;return an.has((t=S[e])==null?void 0:t.topper)},Ln=e=>wn[Mn(e)?"crowned":"free"],ie=new Map,$r=(e,t)=>{ie.has(e)||ie.set(e,[]),ie.get(e).push(t)},ce=new Map;for(const e of[...Xe].sort((t,r)=>t.h-r.h||t.m-r.m)){const t=G(e.h,e.m);ce.has(t)||ce.set(t,[]),ce.get(t).push(e.id),$r(t,e.id)}const fe=new Map;for(const e of or){const t=mr(e.a,e.b);fe.has(t)||fe.set(t,[]),fe.get(t).push(e.id),$r(t,e.id)}const Sn=e=>ce.get(e)??[],vn=e=>fe.get(e)??[],An=e=>ie.get(e)??[],br=(e,t)=>Math.max(0,An(e).indexOf(t));function it(e){const t=mn(e),r=kn(e);return{key:t,species:r,index:br(r,t)}}const ct=(e,t)=>br(G(e,t),E(e,t)),la=e=>xr(it(e),ge(e.feeds??0)||1);function xr({species:e,index:t},r=1){const o=Ln(e);return{...Be(e,r),...o[t*xn%o.length],markings:Nt[t%Nt.length]}}const ia=(e,t,r=1)=>xr({species:G(e,t),index:ct(e,t)},r),Tn=e=>typeof e=="string"?Be(e):e??Be("mochi");function Cn(e,t){const r=Tt[e.eyes]??Tt.round,o=lt.map((n,s)=>r(at[s],n)).join("");return t==="sleep"?ln(o):o}function Dn(e,t){const r=Ct[e.brows]??Ct.none,{rot:o,dy:n}=Dt[t]??Dt.content;return lt.map((s,a)=>{const l=at[a],i=r(l,s);return i?`<g transform="translate(0 ${n}) rotate(${s===-1?o:-o} ${l} 37)">${i}</g>`:""}).join("")}function ca(e,{mood:t="content",className:r="",title:o=""}={}){const n=Tn(e),[s,a,l]=n.palette,i={body:s,belly:a,accent:l},f=St[n.body]??St.round,g=(vt[n.texture]??vt.smooth)(f.halo),h=Math.max(1,Math.min(n.form??1,3)),u=n.signature&&Ft[n.signature]?Ft[n.signature](i):(At[n.topper]??At.none)(l),k=(n.anatomy??[]).map(K=>Rt[K]?Rt[K](i):"").join(""),oe=o||n.name||"pet",C=(K,qr,Qr)=>(K[qr]??K[Qr])(i),U=C(cn,n.eyewear,"none"),Oe=C(dn,n.hair,"none"),y=C(pn,n.facialHair,"none"),ne=C(gr,n.markings,"none"),mt=C(hn,n.accessory,"none");return`
<svg class="pet form-${h} ${r}" viewBox="0 0 100 100" role="img" aria-label="${oe}" focusable="false">
  ${o?`<title>${o}</title>`:""}
  <g class="pet-grow" transform="${un(h)}">
  <g class="pet-inner">
    <g fill="${n.texture==="spiky"?l:s}">${g}</g>
    <g fill="${l}">${k}</g>
    <g fill="${l}">${u}</g>
    ${mt.back}
    <g fill="${l}">${sn}</g>
    <g class="pet-body" fill="${s}">${f.shape}</g>
    <ellipse cx="50" cy="64" rx="21" ry="17" fill="${a}" />
    ${ne.back}${y.back}
    <g class="pet-face" transform="${gn(h)}">
      ${Cn(n,t)}
      ${U.front}
      ${Oe.front}
      ${Dn(n,t)}
      <ellipse cx="27" cy="62" rx="7" ry="4.2" fill="${l}" opacity="0.55" />
      <ellipse cx="73" cy="62" rx="7" ry="4.2" fill="${l}" opacity="0.55" />
      ${ne.front}
      ${Et[t]??Et.content}
      ${y.front}
    </g>
    ${mt.front}
  </g>
  </g>
</svg>`}const wr=["M69 27 L62.5 33.5 L68 38.5 L61 44.5 L64.5 50","M31 43 L38 49 L31.5 56 L38.5 63 L33 70","M21 59 L32 55 L43 62.5 L55 54.5 L66.5 62 L79 55.5"],En=wr.length;function fa(e,{cracks:t=0,className:r="",title:o="A chilly egg"}={}){const n=S[e]??S.mochi,[s,a,l]=n.palette,i=Math.max(0,Math.min(En,Math.round(t))),f=Array.from({length:i},(g,h)=>`<path class="egg-crack egg-crack-${h+1}" pathLength="1" d="${wr[h]}" />`).join("");return`
<svg class="pet egg egg-cracks-${i} ${r}" viewBox="0 0 100 100" role="img" aria-label="${o}" focusable="false">
  <title>${o}</title>
  <g class="pet-inner">
    <path class="egg-shell" fill="${s}"
      d="M50 12 C68 12 80 40 80 58 C80 78 66 90 50 90 C34 90 20 78 20 58 C20 40 32 12 50 12 Z" />
    <ellipse cx="41" cy="62" rx="15" ry="18" fill="${a}" opacity="0.75" />
    <circle cx="61" cy="40" r="6" fill="${l}" opacity="0.65" />
    <circle cx="36" cy="34" r="4.5" fill="${l}" opacity="0.65" />
    <circle cx="66" cy="68" r="5" fill="${l}" opacity="0.5" />
    <circle cx="44" cy="78" r="3.5" fill="${l}" opacity="0.5" />
    ${f}
  </g>
</svg>`}function da(e,t,{size:r=34}={}){const n=Ze(50,50,24,e%12*30+t*.5),s=Ze(50,50,36,t*6),a=Array.from({length:12},(l,i)=>{const f=Ze(50,50,41,i*30);return`<circle cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="2.6" />`}).join("");return`
<svg class="collar-clock" width="${r}" height="${r}" viewBox="0 0 100 100" role="img"
     aria-label="${E(e,t)}" focusable="false">
  <circle cx="50" cy="50" r="46" class="collar-face" />
  <g class="collar-ticks">${a}</g>
  <line x1="50" y1="50" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}" class="collar-hand hour" />
  <line x1="50" y1="50" x2="${s.x.toFixed(1)}" y2="${s.y.toFixed(1)}" class="collar-hand minute" />
  <circle cx="50" cy="50" r="5" class="collar-pin" />
</svg>`}function pa(e,t,{napping:r=!1}={}){return r?"sleep":e.hatchedAt===null?"content":e.phase==="learning"?e.lapses>0?"droopy":"content":e.dueAt<=t?"hungry":"happy"}const ft=[{id:"stump",price:35,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"flowerbed",price:45,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"lantern",price:60,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"sandpit",price:70,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"swing",price:80,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"house",price:130,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"beehive",price:75,tier:2,scope:"home",slot:"ground",band:"narrow"},{id:"hammock",price:80,tier:2,scope:"home",slot:"ground",band:"wide"},{id:"pond",price:90,tier:2,scope:"home",slot:"ground",band:"narrow"},{id:"feeder",price:95,tier:3,scope:"home",slot:"ground",band:"narrow"},{id:"arch",price:140,tier:3,scope:"home",slot:"ground",band:"wide"},{id:"windmill",price:140,tier:3,scope:"home",slot:"ground",band:"narrow"},{id:"farGrove",price:50,tier:0,scope:"home",slot:"backdrop"},{id:"farMill",price:85,tier:1,scope:"home",slot:"backdrop"},{id:"farArch",price:120,tier:2,scope:"home",slot:"backdrop"},{id:"farTower",price:165,tier:3,scope:"home",slot:"backdrop"},{id:"signpost",price:55,tier:0,scope:"zoo"},{id:"topiary",price:90,tier:1,scope:"zoo"},{id:"bunting",price:110,tier:1,scope:"zoo"},{id:"pathLamps",price:150,tier:2,scope:"zoo"},{id:"fountain",price:200,tier:3,scope:"zoo"},{id:"statue",price:250,tier:3,scope:"zoo"}],dt={ground:2,backdrop:1},In=dt.ground,pt=3,O=new Map(ft.map(e=>[e.id,e])),re=e=>{var t;return((t=O.get(e))==null?void 0:t.slot)??"ground"},Mr=e=>{var t;return((t=O.get(e))==null?void 0:t.scope)??"home"},Lr=e=>Mr(e)==="home",Sr=e=>Mr(e)==="zoo",ha=ft.filter(e=>e.scope==="home"),ua=ft.filter(e=>e.scope==="zoo"),ga=(e,t)=>{var r;return(((r=O.get(e))==null?void 0:r.tier)??xe+1)<=t},De=e=>Array.isArray(e==null?void 0:e.decor)?e.decor:[],vr=(e,t)=>De(e).includes(t),On=(e,t)=>De(e).filter(r=>re(r)===t).length,Zn=(e,t="ground")=>On(e,t)>=(dt[t]??0);function ht(e){if(!Array.isArray(e))return[];const t=[],r={};for(const o of e){if(!O.has(o)||!Lr(o)||t.includes(o))continue;const n=re(o);(r[n]??0)>=(dt[n]??0)||(r[n]=(r[n]??0)+1,t.push(o))}return t}function ut(e){if(!Array.isArray(e))return[];const t=[];for(const r of e)if(O.has(r)&&Sr(r)&&!t.includes(r)&&t.push(r),t.length>=pt)break;return t}function ya(e,t){return!O.has(t)||!Lr(t)||vr(e,t)||Zn(e,re(t))?e:{...e,decor:[...De(e),t]}}function ma(e,t){return vr(e,t)?{...e,decor:De(e).filter(r=>r!==t)}:e}const R=e=>Array.isArray(e)?e:[],Ar=(e,t)=>R(e).includes(t),_n=e=>R(e).length>=pt;function ka(e,t){return!O.has(t)||!Sr(t)||Ar(e,t)||_n(e)?R(e):[...R(e),t]}function $a(e,t){return Ar(e,t)?R(e).filter(r=>r!==t):R(e)}const Tr=6,Cr=[0,0,10,16],Rn=30,ba=6,Pt=6,Fn=12;function xa(e){if(!e)return 0;let t=0;return e.hatched&&(t+=Tr),e.evolved&&(t+=Cr[e.evolved]??0),t}function wa(e,t){const r=Array.isArray(e)?e:[];if(r[r.length-1]!==t)return 0;const o=r[r.length-2];if(!o)return Pt;const n=new Date(`${t}T00:00:00Z`);return n.setUTCDate(n.getUTCDate()-1),o===n.toISOString().slice(0,10)?Fn:Pt}const Nn=40,jn=30,Pn=50,Hn=7;function zn(e){const t=Array.isArray(e)?e:[];let r=0,o=null;for(let n=t.length-1;n>=0;n-=1){const s=t[n];if(typeof s!="string"||o!==null&&s!==o)break;r+=1;const a=new Date(`${s}T00:00:00Z`);if(Number.isNaN(a.getTime()))return r;a.setUTCDate(a.getUTCDate()-1),o=a.toISOString().slice(0,10)}return r}function Bn(e,t){const r=[],o=e??{};for(const a of P)Pe(o,"clock",a.id)>=1&&r.push(`mastery:${a.id}`);for(const a of Se)Pe(o,Me,a.id)>=1&&r.push(`mastery:add:${a.id}`);const n=Math.floor(zn(t==null?void 0:t.daysPlayed)/Hn);for(let a=1;a<=n;a+=1)r.push(`week:${a}`);const s=a=>a.length>0&&a.every(l=>{var i;return(i=o[l])==null?void 0:i.hatchedAt});for(const a of yn)s(Sn(a))&&r.push(`species:${a}`),s(vn(a))&&r.push(`species:add:${a}`);return r}function Gn(e){const t=String(e??"").split(":")[0];return t==="mastery"?Nn:t==="week"?jn:t==="species"?Pn:0}function Ma(e,t,r){const o=new Set(Array.isArray(r)?r:[]),n=Bn(e,t).filter(s=>!o.has(s));return{ids:n,coins:n.reduce((s,a)=>s+Gn(a),0)}}const T=e=>Math.max(0,Math.floor(Number.isFinite(e)?e:0)),Dr=T,La=(e,t)=>T(e)+T(t),Un=(e,t)=>T(e)>=T(t),Sa=(e,t)=>Un(e,t)?T(e)-T(t):T(e);function va(e,t=0){let r=0;for(const o of Object.values(e??{})){o!=null&&o.hatchedAt&&(r+=Tr);const n=ge(typeof(o==null?void 0:o.feeds)=="number"?o.feeds:0);for(let s=2;s<=n;s+=1)r+=Cr[s]??0}return r+T(t)*Rn}const gt="pet-zoo/v1",ee=2,Kn=400;function _(e){return{version:ee,createdAt:e,lastPlayedAt:e,reviewClock:0,tiers:Object.fromEntries(M.map(t=>[t,0])),practice:structuredClone(he),coins:0,zooDecor:[],milestones:[],coinsGrantedAt:0,milestonesGrantedAt:0,settings:{sound:!0,haptics:!0,language:L,playMinutes:nt,showDigital:!1,answerMode:"auto",mirrorNudge:!1},session:{startedAt:0,answered:0,correct:0,napUntil:0},ink:[],stats:{totalAnswered:0,totalCorrect:0,streak:0,bestStreak:0,daysPlayed:[]},items:{}}}const qn=e=>typeof e=="string"&&e.length>0&&e.length<=40,Er=e=>Array.isArray(e)?e.filter(qn):[],Ir=e=>new Date(e).toISOString().slice(0,10);function Aa(e,t=Ee()){try{const r=t==null?void 0:t.getItem(gt);if(!r)return _(e);const o=JSON.parse(r);if(!o||typeof o.items!="object"||!Number.isFinite(o.version)||o.version>ee)return _(e);const n=Qn(o);return{..._(e),...n,coins:Dr(n.coins),tiers:H(n),practice:ot(n),zooDecor:ut(n.zooDecor),milestones:Er(n.milestones),settings:{..._(e).settings,...n.settings},items:Or(n.items),ink:Wr(n.ink)}}catch{return _(e)}}function Qn(e){if(!e||e.version>=ee)return e;const t={...e,version:ee};return t.tiers=H(e),delete t.tier,t}function Or(e){const t={};for(const[r,o]of Object.entries(e??{})){const n=Zo(r);if(!n)continue;const s=typeof(o==null?void 0:o.feeds)=="number"?o.feeds:(o==null?void 0:o.reps)||(o!=null&&o.hatchedAt?1:0),a=typeof(o==null?void 0:o.cracks)=="number"?o.cracks:ar((o==null?void 0:o.correctStreak)??0),l=ht(o==null?void 0:o.decor),i=(o==null?void 0:o.subject)===n&&typeof(o==null?void 0:o.feeds)=="number"&&typeof(o==null?void 0:o.cracks)=="number"&&Array.isArray(o==null?void 0:o.decor)&&l.length===o.decor.length;t[r]=i?o:{...o,subject:n,feeds:s,cracks:a,decor:l}}return t}function Wn(e,t=Ee()){try{return t==null||t.setItem(gt,JSON.stringify(e)),!0}catch{return!1}}function Ta(e=Ee()){try{e==null||e.removeItem(gt)}catch{}}function Ee(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function Ca(e=Ee()){let t=null,r=null;const o=()=>{clearTimeout(t),t=null,r&&Wn(r,e),r=null};return{save(n){r=n,t===null&&(t=setTimeout(o,Kn))},flush:o}}function Da(e,t){const r=Ir(t),o=e.stats.daysPlayed;return o[o.length-1]===r?e:{...e,stats:{...e.stats,daysPlayed:[...o.slice(-59),r]}}}const Zr="pet-zoo",_r=1,Ge="petzoo1:";class Z extends Error{constructor(t){super(t),this.name="TransferError",this.key=t}}function Ea(e,t){return{app:Zr,format:_r,version:ee,exportedAt:t,createdAt:e.createdAt,lastPlayedAt:e.lastPlayedAt,reviewClock:e.reviewClock,tiers:e.tiers,tier:H(e).clock,coins:e.coins,zooDecor:e.zooDecor,milestones:e.milestones,stats:e.stats,items:e.items}}const Yn=e=>JSON.stringify(e,null,2),Ia=e=>`pet-zoo-${Ir(e)}.json`,Ht=32768;function Vn(e){let t="";for(let r=0;r<e.length;r+=Ht)t+=String.fromCharCode(...e.subarray(r,r+Ht));return btoa(t)}function Xn(e){const t=atob(e),r=new Uint8Array(t.length);for(let o=0;o<t.length;o+=1)r[o]=t.charCodeAt(o);return r}function Oa(e){const t=new TextEncoder().encode(Yn(e));return Ge+Vn(t)}const ke=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);function Za(e){const t=String(e??"").trim();if(!t)throw new Z("transfer.badFile");let r=t;if(t.startsWith(Ge))try{const n=t.slice(Ge.length).replace(/\s+/g,"");r=new TextDecoder().decode(Xn(n))}catch{throw new Z("transfer.badFile")}let o;try{o=JSON.parse(r)}catch{throw new Z("transfer.badFile")}if(!ke(o))throw new Z("transfer.badFile");if(o.app!==Zr)throw new Z("transfer.badApp");if(!(o.format<=_r))throw new Z("transfer.badVersion");if(!ke(o.items))throw new Z("transfer.badFile");return{...o,items:Jn(o.items)}}function Jn(e){const t={};for(const[r,o]of Object.entries(e)){if(!ke(o))continue;const n=sr(r);!n||!n.valid(r,o)||(t[r]=o)}return Or(t)}const _a=e=>Object.values(e).filter(t=>t.hatchedAt!==null&&t.hatchedAt!==void 0).length;function Ra(e,t,r){const o=_(r);return{...o,createdAt:t.createdAt??o.createdAt,lastPlayedAt:t.lastPlayedAt??r,reviewClock:Number.isFinite(t.reviewClock)?t.reviewClock:0,tiers:H(t),coins:Dr(t.coins),zooDecor:ut(t.zooDecor),milestones:Er(t.milestones),milestonesGrantedAt:Array.isArray(t.milestones)?r:0,coinsGrantedAt:Number.isFinite(t.coins)?r:0,stats:{...o.stats,...ke(t.stats)?t.stats:{}},items:t.items,settings:e.settings,session:o.session}}const b={w:200,h:120},d=62,x=96,V={x0:40,x1:160},j={x0:62,x1:138},Fa=46,c=e=>Number(e.toFixed(2));function Ie(e){let t=Math.floor(e)%2147483647+1;return t<=0&&(t+=2147483646),()=>(t=t*48271%2147483647,(t-1)/2147483646)}const D={dawn:{sky:["#f6b98a","#ffe6cd"],orb:"sun",orbFill:"#ffd27a",glow:"#ffd9a8",veil:"rgba(255, 176, 120, 0.16)",night:!1},morning:{sky:["#a8dcff","#e8f6ff"],orb:"sun",orbFill:"#ffe293",glow:"#fff3c4",veil:"rgba(255, 246, 214, 0.10)",night:!1},noon:{sky:["#8ecfff","#e4f4ff"],orb:"sun",orbFill:"#fff2a8",glow:"#fffbdd",veil:"rgba(255, 255, 255, 0.06)",night:!1},afternoon:{sky:["#ffcf96","#fff0d6"],orb:"sun",orbFill:"#ffc860",glow:"#ffe0a5",veil:"rgba(255, 190, 120, 0.13)",night:!1},dusk:{sky:["#7f6bc4","#ffb493"],orb:"sun",orbFill:"#ff9d6e",glow:"#ffc7a0",veil:"rgba(120, 96, 190, 0.18)",night:!1},night:{sky:["#2f3f7a","#6a7cb8"],orb:"moon",orbFill:"#fdf8dc",glow:"#cfd8ff",veil:"rgba(40, 52, 110, 0.26)",night:!0}},Na=Object.keys(D);function Rr(e){const t=(Math.round(e)%24+24)%24;return t>=5&&t<7?"dawn":t>=7&&t<11?"morning":t>=11&&t<14?"noon":t>=14&&t<17?"afternoon":t>=17&&t<20?"dusk":"night"}function Fr(e){const t=(Math.round(e)%24+24)%24,o=(t>=5&&t<19?(t-5)/14:((t<5?t+24:t)-19)/10)*Math.PI;return{x:c(100-Math.cos(o)*52),y:c(d-12-Math.sin(o)*34)}}function Nr(e,t,r,o){const n=D[e]??D.noon,s=Fr(t),a=Ie(r+17),l=`
    <circle cx="${s.x}" cy="${s.y}" r="22" fill="url(#${o}-glow)" />
    ${n.orb==="moon"?`<circle cx="${s.x}" cy="${s.y}" r="7.5" fill="${n.orbFill}" />
           <circle cx="${c(s.x+2.6)}" cy="${c(s.y-2)}" r="1.5" fill="#e8e0bd" opacity="0.7" />
           <circle cx="${c(s.x-1.8)}" cy="${c(s.y+2.4)}" r="1.1" fill="#e8e0bd" opacity="0.6" />`:`<circle cx="${s.x}" cy="${s.y}" r="9" fill="${n.orbFill}" />`}`;return n.night?`${Array.from({length:34},()=>{const g=c(a()*200),h=c(a()**1.6*(d-6)),u=c(.5+a()*.9);return`<circle cx="${g}" cy="${h}" r="${u}" fill="#fdf8dc" opacity="${c(.35+a()*.5)}" />`}).join("")}${l}`:`${Array.from({length:3},(f,g)=>{const h=c(18+a()*150),u=c(8+a()*28),k=c(.7+a()*.7);return`<g transform="translate(${h} ${u}) scale(${k})" fill="#ffffff" opacity="${c(.5+g*.08)}">
      <ellipse cx="0" cy="0" rx="13" ry="6" />
      <circle cx="-5" cy="-2.5" r="6" />
      <circle cx="4.5" cy="-3.5" r="7.5" />
    </g>`}).join("")}${l}`}const Ue={hills:e=>`
    <ellipse cx="34" cy="${d+4}" rx="60" ry="22" fill="${e.farDark}" />
    <ellipse cx="132" cy="${d+2}" rx="74" ry="26" fill="${e.far}" />
    <ellipse cx="86" cy="${d+8}" rx="52" ry="18" fill="${e.farDark}" opacity="0.7" />`,treeline:e=>{const t=Array.from({length:13},(r,o)=>{const n=c(2+o*16.2),s=c(13+o*7%5*2.6);return`<path d="M${n} ${d+3} L${c(n+5.2)} ${c(d+3-s)} L${c(n+10.4)} ${d+3} Z" />`}).join("");return`<g fill="${e.farDark}">${t}</g>
      <rect x="0" y="${d}" width="200" height="8" fill="${e.far}" opacity="0.55" />`},sea:e=>`
    <rect x="0" y="${d-16}" width="200" height="26" fill="${e.water}" />
    <rect x="0" y="${d-16}" width="200" height="3" fill="${e.waterLight}" opacity="0.7" />
    <ellipse cx="100" cy="${d+6}" rx="120" ry="10" fill="${e.waterLight}" opacity="0.45" />`,dunes:e=>`
    <ellipse cx="40" cy="${d+6}" rx="66" ry="20" fill="${e.far}" />
    <ellipse cx="150" cy="${d+3}" rx="70" ry="17" fill="${e.farDark}" />`,peaks:e=>`
    <path d="M-6 ${d+4} L38 ${d-30} L82 ${d+4} Z" fill="${e.farDark}" />
    <path d="M52 ${d+4} L104 ${d-38} L156 ${d+4} Z" fill="${e.far}" />
    <path d="M132 ${d+4} L172 ${d-24} L212 ${d+4} Z" fill="${e.farDark}" />
    <path d="M104 ${d-38} L92 ${d-24} L104 ${d-27} L116 ${d-22} Z" fill="#ffffff" opacity="0.85" />`,arch:e=>`
    <ellipse cx="62" cy="${d+3}" rx="52" ry="17" fill="${e.farDark}" />
    <ellipse cx="146" cy="${d+4}" rx="58" ry="19" fill="${e.far}" />
    <ellipse cx="104" cy="${d+1}" rx="21" ry="15" fill="${e.glowDeep}" />
    <ellipse cx="104" cy="${d+2}" rx="13" ry="9" fill="${e.glow}" opacity="0.7" />`,cloudbank:e=>`
    <g fill="${e.far}">
      <ellipse cx="42" cy="${d+6}" rx="54" ry="17" />
      <ellipse cx="146" cy="${d+3}" rx="60" ry="15" />
      <circle cx="70" cy="${d-4}" r="13" />
      <circle cx="128" cy="${d-6}" r="15" />
    </g>`},zt=`M0 ${d+2}
   C 34 ${d-4}, 68 ${d+6}, 100 ${d+1}
   C 136 ${d-5}, 170 ${d+5}, 200 ${d}`;function jr(e,t){return`
    <path d="${zt} L200 120 L0 120 Z" fill="url(#${t}-ground)" />
    <path d="${zt}" fill="none" stroke="${e.groundRim}" stroke-width="1.4" opacity="0.55" />
    <path d="M0 ${x+4}
             C 46 ${x-2}, 120 ${x+7}, 200 ${x}
             L200 120 L0 120 Z"
          fill="${e.groundNear}" opacity="0.55" />`}const Ke={grass:(e,t)=>Array.from({length:26},()=>{const r=c(t()*200),o=c(d+6+t()*50),n=c(2.6+t()*3.4);return`<path d="M${r} ${o} q${c(.8+t())} ${-n} ${c(1.8+t())} ${c(-n*.6)}" stroke="${e.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55" />`}).join(""),fern:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),o=c(d+8+t()*48),n=c(.6+t()*.6);return`<g transform="translate(${r} ${o}) scale(${n})" fill="${e.leafDark}" opacity="0.5">
        <ellipse cx="-3" cy="-2" rx="4" ry="1.6" transform="rotate(-25 -3 -2)" />
        <ellipse cx="3" cy="-2" rx="4" ry="1.6" transform="rotate(25 3 -2)" />
        <ellipse cx="0" cy="-4.5" rx="3.4" ry="1.5" />
      </g>`}).join(""),shells:(e,t)=>Array.from({length:18},()=>{const r=c(t()*200),o=c(d+10+t()*46),n=c(1.1+t()*1.5);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.7)}" fill="${e.bloom}" opacity="0.6" />`}).join(""),pebbles:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),o=c(d+8+t()*48),n=c(1+t()*1.8);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.65)}" fill="${e.stone}" opacity="0.5" />`}).join(""),lily:(e,t)=>Array.from({length:9},()=>{const r=c(t()*200),o=c(d+10+t()*42),n=c(3+t()*2.6);return`<g transform="translate(${r} ${o})">
        <circle r="${n}" fill="${e.leaf}" opacity="0.8" />
        <path d="M0 0 L${n} ${c(-n*.4)} A${n} ${n} 0 0 0 ${c(n*.7)} ${c(n*.7)} Z" fill="${e.groundNear}" opacity="0.5" />
      </g>`}).join(""),snow:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),o=c(d+8+t()*48),n=c(2.4+t()*3.4);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.5)}" fill="#ffffff" opacity="0.75" />`}).join(""),spores:(e,t)=>Array.from({length:22},()=>{const r=c(t()*200),o=c(d-4+t()*56),n=c(.8+t()*1.4);return`<circle cx="${r}" cy="${o}" r="${n}" fill="${e.glow}" opacity="${c(.35+t()*.45)}" />`}).join(""),sparkle:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),o=c(d+2+t()*52),n=c(.8+t()*1.3);return`<circle cx="${r}" cy="${o}" r="${n}" fill="#ffffff" opacity="${c(.4+t()*.4)}" />`}).join("")},qe={tree:e=>`
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
    <circle cx="4.6" cy="-7.4" r="7" fill="#fbfdff" />`},ja=Object.keys(qe),es=e=>`
  <ellipse cx="0" cy="-1" rx="14" ry="5.6" fill="${e.nestDark}" />
  <ellipse cx="0" cy="-3" rx="11.6" ry="4.4" fill="${e.nest}" />
  <ellipse cx="0" cy="-3.6" rx="8.4" ry="2.8" fill="${e.nestLight}" />`,Bt={bush:[[-5.4,-9.4],[5.2,-10.4],[-.2,-14.2]],tree:[[-6.4,-18],[6.6,-19.2],[0,-23.4]],basket:[[-4.6,-7.2],[4.6,-7.8],[0,-10.4]],coral:[[-5,-11.4],[4.2,-9],[.4,-15.2]]},Gt={bush:e=>`
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
    <circle cx="-5" cy="-11" r="2.2" fill="${e.accent}" />`},Qe={berry:e=>`
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
    <circle cx="0" cy="-0.2" r="1.1" fill="#fff8e0" opacity="0.8" />`},Pa=Object.keys(Qe),ts=e=>`
  <circle cx="0" cy="0" r="5" fill="${e.ballA}" />
  <path d="M-5 0 a5 5 0 0 1 10 0 Z" fill="${e.ballB}" />
  <circle cx="-1.7" cy="-1.9" r="1.4" fill="#ffffff" opacity="0.7" />`,rs=e=>`
  <ellipse cx="0" cy="0" rx="7.4" ry="2.6" fill="${e.leafDark}" opacity="0.45" />`,We={stump:e=>`
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
    <circle cx="0" cy="-21" r="1.8" fill="${e.stoneLight}" />`},Ha=Object.keys(We),Ut=16,Ye={farGrove:e=>`
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
    <rect x="-2" y="-38" width="4" height="4" fill="${e.glow}" opacity="0.6" />`},za=Object.keys(Ye),os=.48,Ba=42,Ga=24,Fe=13,Ve={signpost:e=>`
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
    <circle cx="0" cy="-13.6" r="2" fill="${e.accent}" />`},Ua=Object.keys(Ve);function Pr(e,t,r=12){const o=Ie(t+91);return Array.from({length:r},(n,s)=>{const a=c(20+o()*160),l=c(d-10+o()*52),i=c(.9+o()*1.1),f=c(o()*6),g=c(4+o()*7);return`<circle class="hab-mote" cx="${a}" cy="${l}" r="${i}" fill="${e.glow}"
      style="--mote-delay:${f}s; --mote-drift:${g}px" />`}).join("")}const ns=e=>Math.max(0,Math.min(255,Math.round(e))),Kt=e=>{const t=String(e).replace("#",""),r=t.length===3?t.split("").map(o=>o+o).join(""):t;return[parseInt(r.slice(0,2),16)||0,parseInt(r.slice(2,4),16)||0,parseInt(r.slice(4,6),16)||0]},ss=e=>`#${e.map(t=>ns(t).toString(16).padStart(2,"0")).join("")}`;function v(e,t,r){const o=Math.max(0,Math.min(1,r)),[n,s,a]=Kt(e),[l,i,f]=Kt(t);return ss([n+(l-n)*o,s+(i-s)*o,a+(f-a)*o])}const qt={dawn:{color:"#ffb47e",amount:.2},morning:{color:"#fffbe8",amount:.08},noon:{color:"#ffffff",amount:.03},afternoon:{color:"#ffc474",amount:.2},dusk:{color:"#7f66c0",amount:.3},night:{color:"#33437e",amount:.44}},as={far:"#8fc06a",farDark:"#6ea54f",ground:["#a9d581","#7fbc5e"],groundNear:"#97ca70",leaf:"#7fc65c",leafDark:"#54a03c",wood:"#a87b52",stone:"#c6c0b2",stoneLight:"#e4dfd4",bloom:"#ffd7e6",accent:"#ff9ec0",nest:"#ecdcaa",nestDark:"#c9b47f",nestLight:"#f8f0cf",glow:"#fff0b0",glowDeep:"#ffd66b",water:"#7fc4e8",waterLight:"#c4e8f8"},te={meadow:{far:"hills",detail:"grass",larder:"bush",treat:"berry",scenery:["tree","bush","flowers","rock"],colors:{}},grove:{far:"treeline",detail:"fern",larder:"tree",treat:"apple",scenery:["pine","tree","mushroom","rock"],colors:{far:"#5f9d55",farDark:"#3f7a41",ground:["#8cc474","#5f9c55"],groundNear:"#7ab266",leaf:"#63b061",leafDark:"#3d8845",wood:"#8a6242",bloom:"#ffd08a"}},pond:{far:"hills",detail:"lily",larder:"bush",treat:"apple",scenery:["reeds","bush","flowers","rock"],colors:{far:"#87c69a",farDark:"#63a97e",ground:["#9ed3a4","#6fb894"],groundNear:"#8fcc9e",leaf:"#6fc08c",leafDark:"#46976a",bloom:"#ffe4a8"}},shore:{far:"sea",detail:"shells",larder:"coral",treat:"fish",scenery:["palm","rock","bush","flowers"],colors:{far:"#f0dcb0",farDark:"#dcbe94",ground:["#f6e6bd","#e6cf9a"],groundNear:"#f2dfb0",leaf:"#78c47e",leafDark:"#519a5c",wood:"#b9885a",stone:"#e0d6c0",stoneLight:"#f4ecdc",bloom:"#ffc0a8",water:"#5fbfe4",waterLight:"#bde8f6"}},dune:{far:"dunes",detail:"pebbles",larder:"basket",treat:"melon",scenery:["cactus","rock","flowers","bush"],colors:{far:"#f2d49a",farDark:"#dcb87c",ground:["#f8e2ae","#e8c78c"],groundNear:"#f4dca4",leaf:"#8cc078",leafDark:"#5f9455",wood:"#c08c58",stone:"#dccbaa",stoneLight:"#f2e7cd",bloom:"#ffb3c8"}},snowfield:{far:"peaks",detail:"snow",larder:"basket",treat:"carrot",scenery:["snowpine","snowdrift","rock","snowpine"],colors:{far:"#bcd0ea",farDark:"#93aed2",ground:["#eef5ff","#cfe0f4"],groundNear:"#e4eeff",leaf:"#5f9c78",leafDark:"#417a5c",wood:"#8a6a52",stone:"#c8d4e6",stoneLight:"#eaf1fa",bloom:"#c8dcff",glow:"#dbeaff",glowDeep:"#9fc4f0"}},glowvale:{far:"arch",detail:"spores",larder:"bush",treat:"glowberry",scenery:["mushroom","crystal","rock","bush"],colors:{far:"#6a5a94",farDark:"#4a3f70",ground:["#8f7fbc","#6b5c96"],groundNear:"#8474ae",leaf:"#7fc4a8",leafDark:"#4f9a80",wood:"#7a5f8e",stone:"#a89cc4",stoneLight:"#cfc6e4",bloom:"#c8a0ff",glow:"#a8f0e0",glowDeep:"#5fd8c4"}},cloudtop:{far:"cloudbank",detail:"sparkle",larder:"basket",treat:"starfruit",scenery:["cloudpuff","crystal","flowers","cloudpuff"],colors:{far:"#d2e0fa",farDark:"#b0c6ec",ground:["#e2ecff","#c2d4f0"],groundNear:"#d6e4fb",leaf:"#8ec8ea",leafDark:"#6aa6d6",wood:"#b0a8cc",stone:"#c8d6ee",stoneLight:"#e6eefc",bloom:"#ffd9f0",glow:"#fff0c8",glowDeep:"#ffd98a"}}},Ka=Object.keys(te),ls={sprout:"meadow",bubs:"pond",zzz:"snowfield",tumble:"dune",mochi:"meadow",bloop:"pond",pebble:"snowfield",nibbles:"dune",pip:"grove",snug:"grove",noodle:"grove",cloudlet:"shore",waddle:"shore",glim:"glowvale",fizz:"glowvale",puff:"cloudtop"},is=e=>ls[e]??"meadow",Qt=[{pieces:[[78,.56],[124,.6],[36,.86],[176,1.3]],larder:52,ball:78,nest:126},{pieces:[[86,.55],[118,.58],[166,.88],[26,1.26]],nest:74,ball:122,larder:148},{pieces:[[74,.52],[128,.62],[34,.9],[178,1.22]],larder:150,ball:124,nest:78},{pieces:[[90,.6],[112,.54],[168,.84],[24,1.28]],nest:120,ball:80,larder:54},{pieces:[[80,.58],[130,.53],[38,.94],[174,1.24]],larder:56,ball:82,nest:128},{pieces:[[88,.54],[120,.6],[164,.8],[30,1.3]],nest:72,ball:118,larder:146},{pieces:[[76,.57],[126,.52],[32,.88],[180,1.22]],larder:148,ball:120,nest:76}],qa={x0:66,x1:134},$e={x0:88,x1:112},cs=3;function yt(e,t){const r=[e.nest,e.larder,e.ball];let o=100,n=-1/0;for(let s=t.x0+12;s<=t.x1-12;s+=2){const l=Math.min(...r.map(i=>Math.abs(s-i)))-Math.abs(s-100)*.4;l>n&&(n=l,o=s)}return o}const Hr=12,fs=30;function zr(e,t=In){const r=[e.nest,e.larder,e.ball,yt(e,j)],o=[];for(let s=V.x0+Ut;s<=V.x1-Ut;s+=2)s>=$e.x0&&s<=$e.x1||o.push(s);o.sort((s,a)=>Math.abs(a-100)-Math.abs(s-100));const n=[];for(const s of o){if(n.length>=t)break;r.some(a=>Math.abs(a-s)<Hr)||n.some(a=>Math.abs(a-s)<fs)||n.push(s)}return n.sort((s,a)=>s-a)}function ds(e,t=zr(e)){const r=[...t,yt(e,j)],o=[];for(let l=V.x0+Fe;l<=V.x1-Fe;l+=2)l>=$e.x0&&l<=$e.x1||o.push(l);o.sort((l,i)=>Math.abs(i-100)-Math.abs(l-100)||l-i);const n=o.find(l=>r.every(i=>Math.abs(i-l)>=Hr));if(n!==void 0)return c(n);let s=o[0]??V.x0+Fe,a=-1;for(const l of o){const i=Math.min(...r.map(f=>Math.abs(f-l)));i>a&&(a=i,s=l)}return c(s)}const ps=e=>c(d+10+(e-.5)*40),Br=(e,t,r)=>Math.max(t,Math.min(r,e)),hs=6,us=20,gs=4;function Gr(e,t){const r=(Number.isFinite(t)?t:1+B(`hr${e}`)%12)%12,o=B(`t${e}`)%gs,n=i=>i>=hs&&i<=us,s=n(r)===n(r+12)?o%2===1:n(r+12)!==(o===0),a=r+(s?12:0),l=Rr(a);return{hour24:a,pm:s,phase:l,night:D[l].night,orb:Fr(a)}}const Qa=(e,t)=>Gr(E(e,t),e);function Ur(e,t,r){var g;const o=S[e]??S.mochi,[n,s,a]=o.palette,l={...as,...((g=te[t])==null?void 0:g.colors)??{}},i=qt[r]??qt.noon,f=(h,u=.1)=>v(v(h,a,u),i.color,i.amount);return{far:f(l.far),farDark:f(l.farDark),ground:[f(l.ground[0],.12),f(l.ground[1],.12)],groundNear:f(l.groundNear,.14),groundRim:v(f(l.ground[0],.12),"#2b2440",.34),leaf:f(l.leaf),leafDark:f(l.leafDark),wood:f(l.wood,.07),stone:f(l.stone,.07),stoneLight:f(l.stoneLight,.05),water:f(l.water,.07),waterLight:f(l.waterLight,.05),bloom:v(v(l.bloom,n,.42),i.color,i.amount*.5),accent:v(a,i.color,i.amount*.4),nest:v(l.nest,s,.45),nestDark:v(l.nestDark,a,.32),nestLight:v(l.nestLight,s,.5),glow:l.glow,glowDeep:l.glowDeep,ballA:a,ballB:s}}function Kr({key:e,species:t,index:r,hour:o}){const n=is(t),s=te[n],a=Gr(e,o),l=Qt[r*cs%Qt.length],i=B(`hab${e}`)%1e5,f=l.pieces.map(([h,u],k)=>({id:s.scenery[(r+k)%s.scenery.length],x:h,scale:u,y:ps(u),flip:(r+k)%2===1})),g=(Bt[s.larder]??Bt.bush).map(([h,u])=>({x:c(l.larder+h),y:c(x+u)}));return{id:e,species:t,biome:n,light:a,palette:Ur(t,n,a.phase),scenery:f,props:{nest:{x:l.nest,y:x},ball:{x:l.ball,y:x},larder:{x:l.larder,y:x,kind:s.larder,treat:s.treat,spots:g}},home:{x:yt(l,j),y:x},roam:{...j},furniture:[],backdrop:null,spots:zr(l),backdropSpot:ds(l),seed:i}}const Wa=(e,t)=>Kr({key:E(e,t),species:G(e,t),index:ct(e,t),hour:e});function Ya(e){const t=Kr({...it(e),hour:e.h}),r={...t,furniture:ys(t,e==null?void 0:e.decor),backdrop:ms(t,e==null?void 0:e.decor)},o=e==null?void 0:e.habitat;return!o||typeof o!="object"?r:{...r,...o,palette:{...r.palette,...o.palette??{}},props:{...r.props,...o.props??{}},light:{...r.light,...o.light??{}}}}function ys(e,t){const r=ht(t).filter(a=>re(a)==="ground"),o=e.spots??[],n=a=>{var l;return((l=O.get(a))==null?void 0:l.band)==="wide"},s=r.length===2&&!n(r[0])&&n(r[1])?[...o].reverse():o;return r.slice(0,o.length).map((a,l)=>({id:a,x:s[l],y:x}))}function ms(e,t){const r=ht(t).find(o=>re(o)==="backdrop");return r?{id:r,x:e.backdropSpot??100,y:d,scale:os}:null}const ks=(e,t,r,o,n,s)=>{const a=qe[e]??qe.bush,l=n?`scale(${-o} ${o})`:`scale(${o})`;return`<g transform="translate(${t} ${r}) ${l}">${a(s)}</g>`};function Va(e,{uid:t="h",label:r="",sleeping:o=!1}={}){const n=e.palette,s=D[e.light.phase]??D.noon,a=Ie(e.seed+3),l=te[e.biome]??te.meadow,i=e.scenery.filter(u=>u.y<=x),f=e.scenery.filter(u=>u.y>x),g=u=>u.map(k=>ks(k.id,k.x,k.y,k.scale,k.flip,n)).join(""),h=e.light.night||e.biome==="glowvale";return`
<svg class="habitat" viewBox="0 0 ${b.w} ${b.h}" preserveAspectRatio="xMidYMax slice"
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
    <rect x="0" y="0" width="${b.w}" height="${b.h}" fill="url(#${t}-sky)" />
    ${Nr(e.light.phase,e.light.hour24,e.seed,t)}
  </g>

  <g class="hab-far">${(Ue[l.far]??Ue.hills)(n)}</g>

  ${e.backdrop?`<g class="hab-backdrop" transform="translate(${e.backdrop.x} ${e.backdrop.y}) scale(${e.backdrop.scale})">${(Ye[e.backdrop.id]??Ye.farGrove)(n)}</g>`:""}

  <g class="hab-ground">
    ${jr(n,t)}
    ${(Ke[l.detail]??Ke.grass)(n,a)}
  </g>

  <g class="hab-back">
    ${g(i)}
    ${(e.furniture??[]).map(u=>`<g class="hab-furniture" transform="translate(${u.x} ${u.y})">${(We[u.id]??We.flowerbed)(n)}</g>`).join("")}
    <g transform="translate(${e.props.nest.x} ${e.props.nest.y})">${es(n)}</g>
    <g transform="translate(${e.props.ball.x} ${e.props.ball.y})">${rs(n)}</g>
    <g transform="translate(${e.props.larder.x} ${e.props.larder.y})">
      ${(Gt[e.props.larder.kind]??Gt.bush)(n)}
    </g>
  </g>

  <g class="hab-actors"></g>

  <g class="hab-front">${g(f)}</g>

  ${h?`<g class="hab-motes">${Pr(n,e.seed,o?8:14)}</g>`:""}

  <rect class="hab-veil" x="0" y="0" width="${b.w}" height="${b.h}" fill="${s.veil}" />
  <rect class="hab-dusk" x="0" y="0" width="${b.w}" height="${b.h}" fill="#1b1930" />
</svg>`}const Xa=(e,t)=>(Qe[e]??Qe.berry)(t),Ja=e=>ts(e),Wt=5,$s=330,bs=.22,xs=.54,ws=.82,Yt=.62,Vt=26;function el(e,t,r){if(e.resting)return{...e,bounce:0};const o=Br(t,0,.05),n=r.floor??x,s=r.ceiling??8,a=(r.x0??j.x0)+Wt,l=(r.x1??j.x1)-Wt;let i=e.vx*(1-bs*o),f=e.vy+$s*o,g=e.x+i*o,h=e.y+f*o,u=0;h>=n?(h=n,f>Vt?(u=f,f=-f*xs,i*=ws):(f=0,i*=.7)):h<=s&&(h=s,f=Math.abs(f)*.4),g<=a?(g=a,i=Math.abs(i)*Yt,u=Math.max(u,Math.abs(e.vx)*.6)):g>=l&&(g=l,i=-Math.abs(i)*Yt,u=Math.max(u,Math.abs(e.vx)*.6));const k=h>=n&&Math.abs(f)<=Vt&&Math.abs(i)<2;return{...e,x:g,y:h,vx:k?0:i,vy:k?0:f,spin:(e.spin??0)+i*o*7,resting:k,bounce:u}}function tl(e,t=j,r=Math.random){const o=t.x1-t.x0,n=(e-t.x0)/o,s=n<.28?1:n>.72||r()<.5?-1:1,a=(.14+r()*.34)*o;return c(Br(e+s*a,t.x0,t.x1))}const Ms=[34,100,166],Ne=4,Ls=e=>Ur("mochi","meadow",e);function Ss(e){return ut(e).slice(0,pt).map((t,r)=>({id:t,x:Ms[r],y:x}))}function rl(e,{hour24:t=12,uid:r="yard",label:o=""}={}){const n=Rr(t),s=Ls(n),a=D[n]??D.noon,l=Ie(Ne+3),i=Ss(e);return`
<svg class="yard" viewBox="0 0 ${b.w} ${b.h}" preserveAspectRatio="xMidYMax slice"
     role="img" aria-label="${o}" focusable="false">
  <defs>
    <linearGradient id="${r}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a.sky[0]}" />
      <stop offset="1" stop-color="${a.sky[1]}" />
    </linearGradient>
    <linearGradient id="${r}-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${s.ground[0]}" />
      <stop offset="1" stop-color="${s.ground[1]}" />
    </linearGradient>
    <radialGradient id="${r}-glow">
      <stop offset="0" stop-color="${a.glow}" stop-opacity="0.85" />
      <stop offset="1" stop-color="${a.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <g class="yard-sky">
    <rect x="0" y="0" width="${b.w}" height="${b.h}" fill="url(#${r}-sky)" />
    ${Nr(n,t,Ne,r)}
  </g>

  <g class="yard-far">${Ue.hills(s)}</g>

  <g class="yard-ground">
    ${jr(s,r)}
    ${Ke.grass(s,l)}
  </g>

  <g class="yard-pieces">
    ${i.map(f=>`<g class="yard-piece" transform="translate(${f.x} ${f.y})">${(Ve[f.id]??Ve.signpost)(s)}</g>`).join("")}
  </g>

  ${a.night?`<g class="yard-motes">${Pr(s,Ne,10)}</g>`:""}

  <rect class="yard-veil" x="0" y="0" width="${b.w}" height="${b.h}" fill="${a.veil}" />
</svg>`}export{_n as $,or as A,Wt as B,Ia as C,L as D,Yn as E,Ea as F,Oa as G,Za as H,Ra as I,_a as J,Vo as K,Xo as L,Js as M,Ws as N,La as O,Fa as P,ea as Q,pa as R,S,Z as T,ue as U,ge as V,x as W,O as X,$a as Y,ma as Z,Un as _,Va as a,bn as a$,ka as a0,Zn as a1,re as a2,ya as a3,Sa as a4,ga as a5,vr as a6,Ar as a7,da as a8,E as a9,Me as aA,rr as aB,mr as aC,we as aD,Be as aE,Ps as aF,Ye as aG,Ve as aH,We as aI,qs as aJ,Qs as aK,Ts as aL,As as aM,ve as aN,Ae as aO,Pe as aP,pr as aQ,F as aR,Es as aS,Is as aT,Ds as aU,ba as aV,P as aW,Se as aX,Ze as aY,Cs as aZ,Xr as a_,zo as aa,Us as ab,Zo as ac,I as ad,ko as ae,w as af,zs as ag,Ir as ah,Da as ai,Fo as aj,xa as ak,Rn as al,wa as am,Ys as an,Gs as ao,va as ap,Bn as aq,so as ar,Ma as as,rl as at,Le as au,ua as av,ha as aw,sr as ax,Hs as ay,G as az,Ja as b,Qt as b$,Xe as b0,Wa as b1,kt as b2,eo as b3,oo as b4,Jr as b5,er as b6,Os as b7,no as b8,Zs as b9,an as bA,fn as bB,Mn as bC,cn as bD,dn as bE,pn as bF,gr as bG,hn as bH,Nt as bI,He as bJ,ze as bK,yr as bL,$n as bM,Ft as bN,Rt as bO,En as bP,Or as bQ,Ge as bR,_r as bS,Jn as bT,Yr as bU,is as bV,Ka as bW,Na as bX,V as bY,j as bZ,qa as b_,Ho as ba,Mt as bb,jo as bc,Po as bd,Ks as be,st as bf,Jo as bg,tn as bh,rn as bi,Wn as bj,gt as bk,ee as bl,sa as bm,de as bn,Sn as bo,Rs as bp,fo as bq,je as br,St as bs,vt as bt,At as bu,Tt as bv,Ct as bw,ia as bx,Ln as by,xn as bz,Br as c,Fn as c$,yt as c0,ps as c1,ja as c2,Qa as c3,Rr as c4,Fr as c5,d as c6,v as c7,Ur as c8,Ie as c9,tr as cA,Je as cB,xo as cC,mo as cD,et as cE,it as cF,yn as cG,An as cH,vn as cI,he as cJ,_o as cK,Bs as cL,Ko as cM,qo as cN,ir as cO,lr as cP,Qo as cQ,Uo as cR,wt as cS,No as cT,ar as cU,nt as cV,en as cW,Zr as cX,$e as cY,Tr as cZ,Cr as c_,Pa as ca,ct as cb,ft as cc,xe as cd,za as ce,Ha as cf,Ua as cg,dt as ch,In as ci,ht as cj,zr as ck,Ut as cl,On as cm,ds as cn,ut as co,Ms as cp,Ss as cq,Ls as cr,zn as cs,Gn as ct,H as cu,Ro as cv,xt as cw,Ns as cx,M as cy,Qn as cz,la as d,Pt as d0,Dr as d1,Fe as d2,Ba as d3,Ga as d4,os as d5,pt as d6,b as d7,Nn as d8,jn as d9,Pn as da,So as db,q as dc,$o as dd,fa as e,Ca as f,Fs as g,Ya as h,nn as i,ta as j,Xs as k,Aa as l,oa as m,tl as n,na as o,ca as p,ra as q,Vs as r,el as s,Xa as t,aa as u,ot as v,js as w,Ta as x,_ as y,_s as z};
