import{s as Br}from"./recognize-DolGw8_D.js";const Gr=[1,2,3,4,5,6,7,8,9,10,11,12],ue=5,Ur=ue*6,O=e=>(e%360+360)%360,I=(e,t)=>(e%t+t)%t,Ms=e=>O(e*6),Ls=(e,t)=>O(I(e,12)*30+t*.5),qr=(e,t)=>O(Math.atan2(e,-t)*180/Math.PI);function Se(e,t,r,o){const n=o*Math.PI/180;return{x:e+r*Math.sin(n),y:t-r*Math.cos(n)}}function ft(e,t){const r=Math.abs(O(e)-O(t));return r>180?360-r:r}const Ss=e=>I(Math.round(O(e)/Ur)*ue,60);function vs(e,t){const r=I(Math.round((O(e)-t*.5)/30),12);return r===0?12:r}function As({dx:e,dy:t,radius:r,hourDeg:o,minuteDeg:n}){const s=Math.hypot(e,t)/r;if(s<.18||s>1.15)return null;if(s<.55)return"hour";if(s>.72)return"minute";const a=qr(e,t);return ft(a,o)<=ft(a,n)?"hour":"minute"}const C=(e,t)=>`${e}:${String(t).padStart(2,"0")}`;function Kr(e){const[t,r]=String(e).split(":").map(Number);return{h:t,m:r}}function Qr(e,t){let r=(t-e)%60;return r>30&&(r-=60),r<-30&&(r+=60),r}function Cs({h:e,m:t},r){const o=Qr(t,r),n=t+o;let s=e;return n>=60?s=e%12+1:n<0&&(s=e===1?12:e-1),{h:s,m:r,delta:o}}function Wr(e,t){const r=Math.abs(e-t)%60;return r>30?60-r:r}function Yr(e,t){const r=Math.abs(I(e,12)-I(t,12))%12;return r>6?12-r:r}function Vr(e,t){const r=I(e.h,12)===I(t.h,12),o=e.m===t.m,n=Wr(e.m,t.m),s=Yr(e.h,t.h);let a;return r&&o?a="correct":o?a="hourOff":r?a="minuteOff":a="both",{verdict:a,correct:a==="correct",nearMiss:a!=="correct"&&n<=ue&&s<=1,minuteDelta:n,hourDelta:s}}const Gt=.8,F=[{id:0,minutes:[0]},{id:1,minutes:[30]},{id:2,minutes:[15,45]},{id:3,minutes:[5,10,20,25,35,40,50,55]}],ge=F.length-1,Ut=new Map;for(const e of F)for(const t of e.minutes)Ut.set(t,e.id);const qt=e=>Ut.get(e)??null;function ye(e){const t=F[e];if(!t)return[];const r=[];for(const o of t.minutes)for(const n of Gr)r.push({h:n,m:o,id:C(n,o),tier:e});return r}const Be=F.flatMap(e=>ye(e.id));new Map(Be.map(e=>[e.id,e]));function Xr(e,t){const r=ye(t);return r.length?r.filter(n=>{var s;return((s=e[n.id])==null?void 0:s.phase)==="graduated"}).length/r.length:0}function Ts(e){let t=0;for(;t<ge&&Xr(e,t)>=Gt;)t+=1;return t}function Ds(e,t){const r=[];for(let o=0;o<=Math.min(t,ge);o+=1)for(const n of ye(o))e[n.id]||r.push(n);return r}const x="nb",Jr=[{id:"nb",label:"Norsk"},{id:"en",label:"English"}],Es=e=>Jr.some(t=>t.id===e),dt={en:["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"],nb:["","ett","to","tre","fire","fem","seks","sju","åtte","ni","ti","elleve","tolv"]},eo={0:"o'clock",5:"five past",10:"ten past",15:"quarter past",20:"twenty past",25:"twenty-five past",30:"half past",35:"twenty-five to",40:"twenty to",45:"quarter to",50:"ten to",55:"five to"},to={0:{text:"klokka {h}",next:!1},5:{text:"fem over {h}",next:!1},10:{text:"ti over {h}",next:!1},15:{text:"kvart over {h}",next:!1},20:{text:"ti på halv {h}",next:!0},25:{text:"fem på halv {h}",next:!0},30:{text:"halv {h}",next:!0},35:{text:"fem over halv {h}",next:!0},40:{text:"ti over halv {h}",next:!0},45:{text:"kvart på {h}",next:!0},50:{text:"ti på {h}",next:!0},55:{text:"fem på {h}",next:!0}},pt={en:["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"],nb:["null","én","to","tre","fire","fem","seks","sju","åtte","ni","ti","elleve","tolv","tretten","fjorten","femten","seksten","sytten","atten","nitten","tjue"]};function q(e,t){return(pt[e]??pt[x])[t]??String(t)}const ro=(e,t,r)=>e==="en"?`${q("en",t)} plus ${q("en",r)}`:`${q("nb",t)} pluss ${q("nb",r)}`,oo=e=>(e-1+12)%12+1,Te=(e,t)=>(dt[e]??dt[x])[oo(t)];function no(e,t,r){if(e==="en"){const n=eo[r],s=Te("en",r>30?t+1:t);return r===0?`${s} ${n}`:`${n} ${s}`}const o=to[r];return o.text.replace("{h}",Te("nb",o.next?t+1:t))}const le={en:["Biscuit","Marmalade","Waffle","Pumpkin","Sprinkle","Doodle","Clover","Peanut","Nugget","Custard","Pickle","Bumble","Dandelion","Truffle","Cinnamon","Gumdrop","Blossom","Turnip","Jellybean","Muffin","Toast","Pancake","Wobble","Pudding","Cricket","Sundae","Butterbean","Hopscotch","Marshmallow","Tangerine","Pinecone","Bramble","Mittens","Popcorn","Whisker","Fern","Gingersnap","Nutmeg","Poppy","Sesame","Twiglet","Apricot","Cobweb","Domino","Fizzle","Hazelnut","Pebble","Snowdrop"],nb:["Vaffel","Kanelbolle","Blåbær","Pannekake","Smultring","Kakao","Marsipan","Karamell","Lakris","Rosin","Sukkerbit","Krumkake","Tyttebær","Multe","Kløver","Løvetann","Kongle","Furunål","Mose","Dugg","Snøfnugg","Måneskinn","Solstråle","Stjerneskudd","Regnbue","Tordensky","Bølge","Rullestein","Perle","Knappen","Tøffel","Votten","Lua","Dott","Lubben","Tuss","Prikken","Flekken","Bamse","Nøtta","Fnugg","Kvist","Bringebær","Solsikke","Tjukken","Sprett","Trilla","Nusse"]},K={en:{back:"← Back to games","nav.scenes":"Scenes","tab.play":"Feed","tab.zoo":"Zoo","sound.on":"Sound on","sound.off":"Sound off","settings.open":"Settings","clock.aria":"Drag the clock hands to set the time","prompt.booting":"Waking the zoo…","prompt.egg":"A chilly egg! It hatches at…","prompt.egg1":"The egg is stirring! It hatches at…","prompt.egg2":"It is cracking open! It hatches at…","prompt.forgot":"{name} forgot their snack time. It is…","prompt.hungry":"{name} is hungry! They eat at…","prompt.snack":"{name} fancies a snack at…","button.warm":"Warm the egg!","button.feed":"Feed {name}!","cheer.1":"Yes!","cheer.2":"Perfect!","cheer.3":"Spot on!","cheer.4":"Nailed it!","cheer.5":"That is it!","cheer.streak":"{cheer} {n} in a row!","crack.1":"A crack appeared!","crack.2":"Another crack — it is nearly out!","hatch.stir":"Something is moving in there…","hatch.now":"It hatched!","hatch.hello":"{name} says hello!","evolve.now":"Something is happening…","evolve.done":"{name} is now {label}!","form.2":"the Bold","form.3":"the Grand","teach.nearMiss":"So close! ","teach.hourExact":"At {hour} o’clock the short fat hand points straight at the {hour}.","teach.hourPastHalf":"The short fat hand is past halfway from the {hour} to the {next} — but it is still the {hour}.","teach.hourJustLeft":"Look at the short fat hand: at {time} it has just left the {hour}.","teach.minuteOClock":"At {hour} o’clock the long hand points straight up.","teach.minuteCountOne":"Count round in fives: {jumps} jump past the top is {minutes} minutes.","teach.minuteCountMany":"Count round in fives: {jumps} jumps past the top is {minutes} minutes.","teach.both":"Here is where both hands go for {time}.","nap.title":"Pets are sleeping!","nap.copy":"That was a good session. Everyone is having a nap — you can still visit them in the zoo.","nap.countdown":"Waking up in","nap.wake":"Wake the pets","nap.visit":"Visit the zoo","nap.sleeping":"sleeping","zoo.empty":"No pets yet! Feed the clock a few times and your first egg will hatch.","zoo.egg":"{species} egg","zoo.eggTitle":"A chilly egg","zoo.eggTitleCracks":"A cracking egg, {n} of {of} cracks","zoo.rename":"What is this pet called?","habitat.back":"Back to the zoo","habitat.rename":"Give this pet a new name","habitat.aria":"{name}'s home","habitat.eggAria":"The home waiting for a {species} egg","habitat.hint":"Throw the ball, share a snack, or stroke {name}.","habitat.eggHint":"This home is waiting. Feed the clock, and the egg will hatch.","habitat.sleeping":"{name} is fast asleep. Sshh.","unlock.title":"New pets have arrived!","unlock.copy":"{tier} — {blurb}","unlock.close":"Let’s go","howto.summary":"How to play","howto.1":"A pet tells you when it eats. Drag the clock hands to that time.","howto.2":"The <b>long thin hand</b> is the minutes — it jumps five minutes at a time. The <b>short fat hand</b> is the hour.","howto.3":"Watch the short hand creep along as you move the long one. At quarter past four it has already left the 4 — that is how a real clock works.","howto.4":"Get one right four times and its egg cracks open into a pet of your own.","howto.5":"After a few minutes the pets get sleepy and the game stops. You can still wander the zoo while they nap.","howto.6":"Grown-ups: press and hold the title for progress.","grownups.title":"Progress","grownups.answered":"Times answered","grownups.accuracy":"Correct first try","grownups.streak":"Best streak","grownups.hatched":"Pets hatched","grownups.days":"Days played","grownups.fine":"Times are scheduled with a spaced-repetition algorithm: each one comes back just as it is about to be forgotten. Everything is stored in this browser only.","grownups.close":"Close","grownups.reset":"Start over","grownups.resetConfirm":"Start over? Every pet and all progress will be lost.","settings.title":"Settings","settings.language":"Language","settings.playTime":"Play time","settings.playTimeValue":"{n} minutes","settings.playTimeHelp":"How long a session lasts before the pets need a nap. Short sessions work best — three to five minutes.","settings.digital":"Show digital time","settings.digitalHelp":"Off by default. With it off the pets say their feeding time in words only, so the clock face is the only place to read it.","settings.transfer":"Move to another device","settings.transferHelp":"Save the zoo as a file, or copy it as a code to send in a message. Opening either one on another device brings every pet across. The zoo already on that device is replaced.","settings.done":"Done","transfer.exportFile":"Save file","transfer.copyCode":"Copy code","transfer.importFile":"Open file…","transfer.pasteCode":"Paste code","transfer.pastePrompt":"Paste the code from the other device:","transfer.confirm":"Replace this device’s zoo with the one you are bringing in? The pets here now will be lost.","transfer.saved":"Saved {file}.","transfer.copied":"Code copied — paste it on the other device.","transfer.copyFailed":"Could not reach the clipboard, so the code was saved as a file instead.","transfer.imported":"Brought in {n} pets.","transfer.badFile":"That does not look like a Pet Zoo save.","transfer.badApp":"That save is from a different game.","transfer.badVersion":"That save comes from a newer Pet Zoo than this one.","coins.name":"gold coins","coins.balance":"{n} gold coins","coins.earned":"+{n}","shop.open":"Go to the shop","shop.title":"The zoo shop","shop.intro":"Something nice for one of your pets.","shop.forPet":"Shopping for {name}","shop.pickPet":"Whose home is it for?","shop.empty":"No pets yet! Hatch your first egg and the shop will open.","shop.locked":"Locked","shop.lockedHelp":"Learn more times to open this one.","shop.owned":"In {name}’s home","shop.full":"{name}’s home is full. Sell something to make room.","shop.tooDear":"Not enough coins yet.","shop.buy":"Buy it!","shop.cancel":"Not yet","shop.confirm":"{item} — put it in {name}’s home for {price} gold coins?","shop.bought":"{name} loves it!","shop.sell":"Sell it back","shop.sellConfirm":"{item} — sell it back? You get all {price} gold coins again.","shop.sold":"Sold — {price} gold coins back.","shop.close":"Done","shop.tabHome":"The pets’ homes","shop.tabZoo":"The whole zoo","shop.ownedZoo":"In the zoo","shop.fullBackdrop":"There is already something far away at {name}’s. Sell it to make room.","shop.fullZoo":"The zoo yard is full. Sell something to make room.","shop.confirmZoo":"{item} — put it in the zoo for {price} gold coins?","shop.boughtZoo":"It looks lovely out there!","yard.label":"The zoo yard","shop.flowerbed":"Flower bed","shop.lantern":"Lantern","shop.house":"Little house","shop.swing":"Swing","shop.pond":"Pond","shop.hammock":"Hammock","shop.arch":"Flower arch","shop.windmill":"Windmill","shop.stump":"Tree stump","shop.sandpit":"Sandpit","shop.beehive":"Beehive","shop.feeder":"Bird feeder","shop.farGrove":"Faraway trees","shop.farMill":"Faraway mill","shop.farArch":"Faraway gateway","shop.farTower":"Faraway tower","shop.signpost":"Signpost","shop.topiary":"Trimmed tree","shop.bunting":"Bunting","shop.pathLamps":"Path lamps","shop.fountain":"Fountain","shop.statue":"Statue","prompt.sumEgg":"A chilly egg! Warm it up:","prompt.sumEgg1":"The egg is stirring! Keep going:","prompt.sumEgg2":"It is cracking open! One more:","prompt.sumForgot":"{name} forgot their snack. It is:","prompt.sumHungry":"{name} is hungry! Their snack is:","prompt.sumSnack":"{name} fancies a snack:","teach.sumOffByOne":"Just one out — count once more.","teach.sumTransposed":"The right digits, the other way round.","teach.sumGaveAddend":"That is one of the numbers on its own.","teach.sumGaveDifference":"That is taking them apart, not putting them together.","teach.sumPlain":"{a} and {b} makes {sum}.","teach.sumMakeTen":"{a} and {bridge} makes ten, then {rest} more — {sum}.","tier.add.0.name":"Counting on","tier.add.0.blurb":"Adding nothing, and adding one.","tier.add.1.name":"Sums to ten","tier.add.1.blurb":"Everything that fits in one ten-frame.","tier.add.2.name":"Doubles","tier.add.2.blurb":"Two of the same, past ten.","tier.add.3.name":"Adding ten","tier.add.3.blurb":"The answer is already in the question.","tier.add.4.name":"Over the ten","tier.add.4.blurb":"Make ten first, then add the rest.","answer.aria":"Your answer","answer.empty":"nothing yet","answer.keypad":"Number buttons","answer.digit":"Put down {n}","answer.clear":"Clear","settings.answerMode":"Answering","settings.answerAuto":"Automatic","settings.answerType":"Typing","settings.answerTap":"Buttons","answer.writeHere":"Write here","answer.reads":"reads {n}","answer.orThis":"or {n}?","answer.fixTitle":"Which number was it?","answer.fixHint":"Tap what it reads to put it right.","answer.mirrored":"You wrote it the other way round. It usually goes like this:","answer.undo":"Undo","settings.answerWrite":"Writing","settings.mirrorNudge":"Practise which way numbers face","settings.mirrorNudgeHelp":"Off to begin with. A backwards number always counts — writing 3 and 5 the other way round is ordinary at this age. With this on, the game also shows which way they usually go.","tier.0.name":"O’clock","tier.0.blurb":"The big hand points straight up.","tier.1.name":"Half past","tier.1.blurb":"The big hand points straight down.","tier.2.name":"Quarter past and quarter to","tier.2.blurb":"The big hand points sideways.","tier.3.name":"Every five minutes","tier.3.blurb":"Count around the face in fives."},nb:{back:"← Tilbake til spillene","nav.scenes":"Visninger","tab.play":"Mate","tab.zoo":"Dyrehagen","sound.on":"Lyd på","sound.off":"Lyd av","settings.open":"Innstillinger","clock.aria":"Dra viserne for å stille klokka","prompt.booting":"Vekker dyrehagen…","prompt.egg":"Et kaldt egg! Det klekkes…","prompt.egg1":"Egget rører på seg! Det klekkes…","prompt.egg2":"Det slår sprekker! Det klekkes…","prompt.forgot":"{name} har glemt måltidet sitt. Klokka er…","prompt.hungry":"{name} er sulten! Spiser…","prompt.snack":"{name} vil gjerne ha en matbit…","button.warm":"Varm egget!","button.feed":"Mat {name}!","cheer.1":"Ja!","cheer.2":"Perfekt!","cheer.3":"Helt riktig!","cheer.4":"Sånn ja!","cheer.5":"Der satt den!","cheer.streak":"{cheer} {n} på rad!","crack.1":"Det kom en sprekk!","crack.2":"Enda en sprekk — det er nesten ute!","hatch.stir":"Noe rører seg der inne …","hatch.now":"Det klekket!","hatch.hello":"{name} sier hei!","evolve.now":"Noe skjer …","evolve.done":"{name} er nå {label}!","form.2":"den modige","form.3":"den store","teach.nearMiss":"Nesten! ","teach.hourExact":"Når klokka er {hour}, peker den korte tjukke viseren rett på {hourNum}-tallet.","teach.hourPastHalf":"Den korte tjukke viseren er mer enn halvveis fra {hourNum} til {next} — men timen er fortsatt {hourNum}.","teach.hourJustLeft":"Se på den korte tjukke viseren: {time} har den akkurat forlatt {hourNum}-tallet.","teach.minuteOClock":"Når klokka er {hour}, peker den lange viseren rett opp.","teach.minuteCountOne":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.minuteCountMany":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.both":"Her skal begge viserne stå når klokka er {time}.","nap.title":"Dyrene sover!","nap.copy":"Det var en god økt. Alle tar seg en blund — du kan fortsatt besøke dem i dyrehagen.","nap.countdown":"Våkner om","nap.wake":"Vekk dyrene","nap.visit":"Besøk dyrehagen","nap.sleeping":"sover","zoo.empty":"Ingen dyr ennå! Still klokka riktig noen ganger, så klekkes det første egget ditt.","zoo.egg":"{species}-egg","zoo.eggTitle":"Et kaldt egg","zoo.eggTitleCracks":"Et egg som slår sprekker, {n} av {of}","zoo.rename":"Hva heter dette dyret?","habitat.back":"Tilbake til dyrehagen","habitat.rename":"Gi dyret et nytt navn","habitat.aria":"Hjemmet til {name}","habitat.eggAria":"Hjemmet som venter på et {species}-egg","habitat.hint":"Kast ballen, gi en godbit, eller klapp {name}.","habitat.eggHint":"Dette hjemmet venter. Still klokka riktig, så klekkes egget.","habitat.sleeping":"{name} sover godt. Hysj.","unlock.title":"Nye dyr har kommet!","unlock.copy":"{tier} — {blurb}","unlock.close":"Kom igjen!","howto.summary":"Slik spiller du","howto.1":"Et dyr sier når det spiser. Dra viserne til det klokkeslettet.","howto.2":"Den <b>lange tynne viseren</b> er minuttene — den hopper fem minutter om gangen. Den <b>korte tjukke viseren</b> er timen.","howto.3":"Se hvordan den korte viseren sniker seg framover når du flytter den lange. Kvart over fire har den allerede forlatt 4-tallet — sånn funker en ekte klokke.","howto.4":"Klarer du samme klokkeslett fire ganger, sprekker egget til et dyr som blir ditt.","howto.5":"Etter noen minutter blir dyrene trøtte, og spillet stopper. Du kan fortsatt gå rundt i dyrehagen mens de sover.","howto.6":"Voksne: hold inne tittelen for å se framgang.","grownups.title":"Framgang","grownups.answered":"Klokkeslett svart på","grownups.accuracy":"Riktig på første forsøk","grownups.streak":"Beste rekke","grownups.hatched":"Dyr klekket","grownups.days":"Dager spilt","grownups.fine":"Klokkeslettene planlegges med en gjentakelsesalgoritme: hvert av dem kommer tilbake akkurat når det holder på å bli glemt. Alt lagres bare i denne nettleseren.","grownups.close":"Lukk","grownups.reset":"Start på nytt","grownups.resetConfirm":"Starte på nytt? Alle dyr og all framgang forsvinner.","settings.title":"Innstillinger","settings.language":"Språk","settings.playTime":"Spilletid","settings.playTimeValue":"{n} minutter","settings.playTimeHelp":"Hvor lenge en økt varer før dyrene må sove. Korte økter funker best — tre til fem minutter.","settings.digital":"Vis digital tid","settings.digitalHelp":"Av til vanlig. Når den er av, sier dyrene måltidet sitt bare med ord, så urskiva er eneste stedet å lese det.","settings.transfer":"Flytt til en annen enhet","settings.transferHelp":"Lagre dyrehagen som en fil, eller kopier den som en kode du kan sende i en melding. Åpner du en av delene på en annen enhet, blir alle dyrene med. Dyrehagen som allerede er der, blir erstattet.","settings.done":"Ferdig","transfer.exportFile":"Lagre fil","transfer.copyCode":"Kopier kode","transfer.importFile":"Åpne fil …","transfer.pasteCode":"Lim inn kode","transfer.pastePrompt":"Lim inn koden fra den andre enheten:","transfer.confirm":"Erstatte dyrehagen på denne enheten med den du henter inn? Dyrene som er her nå, forsvinner.","transfer.saved":"Lagret {file}.","transfer.copied":"Koden er kopiert — lim den inn på den andre enheten.","transfer.copyFailed":"Fikk ikke tak i utklippstavla, så koden ble lagret som fil i stedet.","transfer.imported":"Hentet inn {n} dyr.","transfer.badFile":"Dette ser ikke ut som en lagret dyrehage.","transfer.badApp":"Den lagringa er fra et annet spill.","transfer.badVersion":"Den lagringa er fra en nyere utgave av Dyrehagen enn denne.","coins.name":"gullmynter","coins.balance":"{n} gullmynter","coins.earned":"+{n}","shop.open":"Gå til butikken","shop.title":"Dyrehagebutikken","shop.intro":"Noe fint til ett av dyra dine.","shop.forPet":"Handler til {name}","shop.pickPet":"Hvem skal det være til?","shop.empty":"Ingen dyr ennå! Klekk det første egget, så åpner butikken.","shop.locked":"Låst","shop.lockedHelp":"Lær flere klokkeslett for å åpne denne.","shop.owned":"Hjemme hos {name}","shop.full":"Det er fullt hos {name}. Selg noe for å få plass.","shop.tooDear":"Ikke nok mynter ennå.","shop.buy":"Kjøp!","shop.cancel":"Ikke nå","shop.confirm":"{item} — sette den hjemme hos {name} for {price} gullmynter?","shop.bought":"{name} elsker den!","shop.sell":"Selg tilbake","shop.sellConfirm":"{item} — selge den tilbake? Du får alle {price} gullmyntene igjen.","shop.sold":"Solgt — {price} gullmynter tilbake.","shop.close":"Ferdig","shop.tabHome":"Hjemme hos dyra","shop.tabZoo":"Hele dyrehagen","shop.ownedZoo":"I dyrehagen","shop.fullBackdrop":"Det står noe langt borte hos {name} fra før. Selg det for å få plass.","shop.fullZoo":"Plassen ute i dyrehagen er full. Selg noe for å få plass.","shop.confirmZoo":"{item} — sette den ut i dyrehagen for {price} gullmynter?","shop.boughtZoo":"Så fint det ble ute!","yard.label":"Dyrehageplassen","shop.flowerbed":"Blomsterbed","shop.lantern":"Lykt","shop.house":"Lite hus","shop.swing":"Huske","shop.pond":"Dam","shop.hammock":"Hengekøye","shop.arch":"Blomsterbue","shop.windmill":"Vindmølle","shop.stump":"Trestubbe","shop.sandpit":"Sandkasse","shop.beehive":"Bikube","shop.feeder":"Fuglemater","shop.farGrove":"Trær langt borte","shop.farMill":"Mølle langt borte","shop.farArch":"Port langt borte","shop.farTower":"Tårn langt borte","shop.signpost":"Skilt","shop.topiary":"Formklippet tre","shop.bunting":"Vimpler","shop.pathLamps":"Lykter langs stien","shop.fountain":"Fontene","shop.statue":"Statue","prompt.sumEgg":"Et kaldt egg! Varm det opp:","prompt.sumEgg1":"Egget rører på seg! Fortsett:","prompt.sumEgg2":"Det slår sprekker! Én til:","prompt.sumForgot":"{name} har glemt matbiten sin. Den er:","prompt.sumHungry":"{name} er sulten! Matbiten er:","prompt.sumSnack":"{name} vil gjerne ha en matbit:","teach.sumOffByOne":"Bare én bom — tell en gang til.","teach.sumTransposed":"Riktige sifre, men i feil rekkefølge.","teach.sumGaveAddend":"Det er bare det ene tallet.","teach.sumGaveDifference":"Det er å ta dem fra hverandre, ikke å legge dem sammen.","teach.sumPlain":"{a} og {b} blir {sum}.","teach.sumMakeTen":"{a} og {bridge} blir ti, så {rest} til — {sum}.","tier.add.0.name":"Telle videre","tier.add.0.blurb":"Å legge til ingenting, og å legge til én.","tier.add.1.name":"Summer opp til ti","tier.add.1.blurb":"Alt som får plass i én tierramme.","tier.add.2.name":"Dobler","tier.add.2.blurb":"To like, over ti.","tier.add.3.name":"Legge til ti","tier.add.3.blurb":"Svaret står allerede i oppgaven.","tier.add.4.name":"Over tieren","tier.add.4.blurb":"Lag ti først, så legger du til resten.","answer.aria":"Svaret ditt","answer.empty":"ingenting ennå","answer.keypad":"Talltaster","answer.digit":"Sett inn {n}","answer.clear":"Tøm","settings.answerMode":"Svarer med","settings.answerAuto":"Automatisk","settings.answerType":"Tastatur","settings.answerTap":"Knapper","answer.writeHere":"Skriv her","answer.reads":"leser {n}","answer.orThis":"eller {n}?","answer.fixTitle":"Hvilket tall var det?","answer.fixHint":"Trykk på det den leser for å rette det.","answer.mirrored":"Du skrev det motsatt vei. Sånn pleier det å se ut:","answer.undo":"Angre","settings.answerWrite":"Skriving","settings.mirrorNudge":"Øv på hvilken vei tallene vender","settings.mirrorNudgeHelp":"Av til å begynne med. Et speilvendt tall teller alltid — å skrive 3 og 5 motsatt vei er helt vanlig i denne alderen. Er denne på, viser spillet også hvilken vei de vanligvis vender.","tier.0.name":"Hele timer","tier.0.blurb":"Den lange viseren peker rett opp.","tier.1.name":"Halve timer","tier.1.blurb":"Den lange viseren peker rett ned.","tier.2.name":"Kvart over og kvart på","tier.2.blurb":"Den lange viseren peker til siden.","tier.3.name":"Hvert femte minutt","tier.3.blurb":"Tell rundt skiva i femmere."}},Zs=e=>Object.keys(K[e]??{}),so=(e,t)=>t?String(e).replace(/\{(\w+)\}/g,(r,o)=>Object.prototype.hasOwnProperty.call(t,o)?String(t[o]):r):String(e);function Os(e){const t=K[e]??K[x],r=K[x],o=(n,s)=>so(t[n]??r[n]??n,s);return o.lang=K[e]?e:x,o.spoken=(n,s)=>no(o.lang,n,s),o.spokenSum=(n,s)=>ro(o.lang,n,s),o.number=n=>q(o.lang,n),o.hourWord=n=>Te(o.lang,n),o.names=le[o.lang]??le[x],o}const me="add",ao="add:",Y=10,lo=/^add:(\d{1,2})\+(\d{1,2})$/,ie=e=>Number.isInteger(e)&&e>=0&&e<=Y,ke=({a:e,b:t})=>`add:${Math.min(e,t)}+${Math.max(e,t)}`;function Ge(e){const t=lo.exec(String(e??""));return t?{a:Number(t[1]),b:Number(t[2])}:null}function Kt(e){const t=Ge(e);return!t||!ie(t.a)||!ie(t.b)?!1:t.a<=t.b&&e===ke(t)}function Ue({a:e,b:t}){const r=Math.min(e,t),o=Math.max(e,t);return r+o<=10?r<=1?0:1:r===o?2:o===Y?3:4}const $e=[{id:0},{id:1},{id:2},{id:3},{id:4}],io=$e.length-1,qe=[];for(let e=0;e<=Y;e+=1)for(let t=e;t<=Y;t+=1)qe.push({a:e,b:t,id:ke({a:e,b:t}),tier:Ue({a:e,b:t})});qe.sort((e,t)=>e.a+e.b-(t.a+t.b)||e.a-t.a);const Qt=e=>qe.filter(t=>t.tier===e),Wt=$e.flatMap(e=>Qt(e.id));function co(e,t){const r=Ge(e);if(!r||!Kt(e))return!1;const{a:o,b:n}=t??{};return!ie(o)||!ie(n)?!1:o===r.a&&n===r.b}const fo=({a:e,b:t})=>e+t>=10?2:1,Yt=2,po=()=>Yt,ho=1.6,uo=e=>String(e).split("").reverse().join("");function go({a:e,b:t},r){const o=e+t,s=r==null||r===""?NaN:Number(r);if(!Number.isInteger(s)||s<0)return{verdict:"blank",correct:!1,nearMiss:!1,delta:0};let a;return s===o?a="correct":Math.abs(s-o)===1?a="offByOne":o>=10&&String(s)===uo(o)?a="transposed":s===e||s===t?a="gaveAddend":s===Math.abs(e-t)?a="gaveDifference":a="wrong",{verdict:a,correct:a==="correct",nearMiss:a==="offByOne"||a==="transposed",delta:s-o}}const yo=Object.freeze(Object.defineProperty({__proto__:null,ALL_ITEMS:Wt,LAST_TIER:io,MAX_ADDEND:Y,MAX_ANSWER_DIGITS:Yt,TIERS:$e,answerDigits:fo,answerWidth:po,grade:go,id:me,idOf:ke,owns:Kt,paceScale:ho,parse:Ge,prefix:ao,tierItems:Qt,tierOf:Ue,valid:co},Symbol.toStringTag,{value:"Module"})),Ke="clock",mo="",ko=/^([1-9]|1[0-2]):[0-5][0-9]$/,$o=e=>typeof e=="string"&&ko.test(e),bo=e=>Kr(e),xo=({h:e,m:t})=>C(e,t),wo=({m:e})=>qt(e)??0,Mo=()=>0;function Lo(e,t){const{h:r,m:o}=t??{};return!Number.isInteger(r)||r<1||r>12||!Number.isInteger(o)||o<0||o>59||o%ue!==0?!1:e===C(r,o)}const So=1,vo=Object.freeze(Object.defineProperty({__proto__:null,ALL_ITEMS:Be,LAST_TIER:ge,TIERS:F,answerDigits:Mo,grade:Vr,id:Ke,idOf:xo,owns:$o,paceScale:So,parse:bo,prefix:mo,tierItems:ye,tierOf:wo,valid:Lo},Symbol.toStringTag,{value:"Module"})),M={[Ke]:vo,[me]:yo},_=Object.keys(M),H=Ke,Ao=Object.fromEntries(_.map(e=>[e,M[e].LAST_TIER]));function Vt(e){for(const t of Object.values(M))if(t.owns(e))return t;return null}const Co=e=>{var t;return((t=Vt(e))==null?void 0:t.id)??null},Is=()=>_.reduce((e,t)=>e+M[t].ALL_ITEMS.length,0);function N(e){const t={};for(const r of _)t[r]=0;if(e!=null&&e.tiers&&typeof e.tiers=="object"){for(const r of _){const o=e.tiers[r];Number.isFinite(o)&&(t[r]=Math.max(0,Math.floor(o)))}return t}return Number.isFinite(e==null?void 0:e.tier)&&(t[H]=Math.max(0,Math.floor(e.tier))),t}function De(e,t,r){const o=M[t];if(!o)return 0;const n=o.tierItems(r);return n.length?n.filter(a=>{var l;return((l=e==null?void 0:e[a.id])==null?void 0:l.phase)==="graduated"}).length/n.length:0}function To(e,t){const r=M[t];if(!r)return 0;let o=0;for(;o<r.LAST_TIER&&De(e,t,o)>=Gt;)o+=1;return o}function ht(e,t){const r=e??{},o=typeof t=="object"&&t!==null?t:{[H]:t},n=_.map(s=>{const a=M[s],l=Math.min(Number.isFinite(o[s])?o[s]:0,a.LAST_TIER),i=[];for(let f=0;f<=l;f+=1)for(const g of a.tierItems(f))r[g.id]||i.push({...g,subject:s});return i});return Do(n)}function Do(e){const t=[],r=Math.max(0,...e.map(o=>o.length));for(let o=0;o<r;o+=1)for(const n of e)o<n.length&&t.push(n[o]);return t}function Eo(e){const t=N(e),r={},o=[];for(const n of _){const s=Math.max(t[n],To((e==null?void 0:e.items)??{},n));r[n]=s,s>t[n]&&o.push(n)}return{tiers:r,unlocked:o}}const ut=[1,3,8],Zo=2,Oo=3,Io=7,_o=4,Ro=2,Xt=e=>Math.min(Math.max(e-1,0),Ro),Ee=[1,3,5],Ze=Ee.length;function ce(e){let t=0;for(let r=0;r<Ee.length;r+=1)e>=Ee[r]&&(t=r+1);return t}const Fo=2.5,Jt=1.3,er=2.8,No=.2,jo=60,gt=864e5,tr=(e,t,r)=>Math.min(Math.max(e,t),r);function _s({subject:e=H,tier:t,species:r,reviewClock:o=0,id:n,...s}){return{subject:e,...s,tier:t??qt(s.m)??0,species:r,name:null,phase:"learning",step:0,dueStep:o+1,ease:Fo,intervalDays:0,dueAt:0,reps:0,feeds:0,lapses:0,correctStreak:0,cracks:0,hatchedAt:null,seen:0,lastMs:0}}function Po({correct:e,ms:t=0,reversals:r=0,pace:o=1}){if(!e)return 0;const n=Math.max(1,o);return t>2e4*n||r>=2?3:t>8e3*n||r>=1?4:5}const Ho=(e,t)=>tr(e+(.1-(5-t)*(.08+(5-t)*.02)),Jt,er),zo=(e,t,r)=>e<=1?1:e===2?3:Math.min(Math.round(t*r),jo);function Rs(e,{correct:t,ms:r=0,reversals:o=0,pace:n=1,reviewClock:s,now:a}){const l=Po({correct:t,ms:r,reversals:o,pace:n}),i={...e,seen:e.seen+1,lastMs:r},f={quality:l,graduated:!1,hatched:!1,lapsed:!1,evolved:0,cracked:0};if(t){if(i.correctStreak=e.correctStreak+1,e.hatchedAt===null){const u=Math.max(e.cracks??0,Xt(i.correctStreak));u>(e.cracks??0)&&(f.cracked=u),i.cracks=u}if(e.phase==="learning"){const u=e.hatchedAt===null?_o:Oo;i.correctStreak>=u?(i.phase="graduated",i.reps=1,i.feeds=e.feeds+1,i.intervalDays=1,i.dueAt=a+gt,i.dueStep=null,f.graduated=!0,i.hatchedAt===null&&(i.hatchedAt=a,f.hatched=!0)):(i.step=Math.min(e.step+1,ut.length-1),i.dueStep=s+ut[i.step])}else i.ease=Ho(e.ease,l),i.reps=e.reps+1,i.feeds=e.feeds+1,i.intervalDays=zo(i.reps,e.intervalDays,i.ease),i.dueAt=a+i.intervalDays*gt}else i.correctStreak=0,i.step=0,i.dueStep=s+Zo,e.phase==="graduated"&&(i.phase="learning",i.ease=tr(e.ease-No,Jt,er),i.lapses=e.lapses+1,i.dueAt=0,i.intervalDays=0,i.reps=0,f.lapsed=!0);const g=ce(e.feeds),y=ce(i.feeds);return g>=1&&y>g&&(f.evolved=y),{item:i,events:f}}const Oe=e=>e.phase==="learning",Bo=(e,t)=>e.phase==="graduated"&&e.dueAt<=t,Go=e=>Object.values(e).filter(Oe).length,Uo=e=>{const t=([,r])=>(r.subject??H)===e?1:0;return r=>(o,n)=>t(o)-t(n)||r(o[1])-r(n[1])};function Fs(e,{now:t,exclude:r=null,lastSubject:o=null}={}){var u;const n=e.reviewClock+1,s=N(e),a=Object.entries(e.items).filter(([h])=>h!==r),l=Uo(o),i=a.filter(([,h])=>Oe(h)&&h.dueStep!==null&&h.dueStep<=n).sort(l(h=>h.dueStep));if(i.length)return i[0][0];const f=a.filter(([,h])=>Bo(h,t)).sort(l(h=>h.dueAt));if(f.length)return f[0][0];if(Go(e.items)<Io){const h=ht(e.items,s)[0];if(h)return h.id}const g=a.filter(([,h])=>h.phase==="graduated").sort(l(h=>h.dueAt));if(g.length)return g[0][0];const y=a.filter(([,h])=>Oe(h)).sort(l(h=>h.seen));return y.length?y[0][0]:r&&e.items[r]?r:((u=ht(e.items,Ao)[0])==null?void 0:u.id)??M[H].ALL_ITEMS[0].id}function Ns(e,t=H){const{tiers:r}=Eo(e),o=N(e)[t]??0,n=r[t]??0;return{tier:n,unlocked:n>o}}const j=5,fe=2,U=j*fe,S=20,be=3,xe=5,re=j*S+(j-1)*be+xe*2,rr=fe*S+(fe-1)*be+xe*2,ve=14;function or(e,t){const r=Math.max(0,Math.floor(e)),o=Math.max(0,Math.floor(t)),n=r+o,s=Math.min(o,Math.max(0,U-r)),a=[];for(let l=0;l<n;l+=1){const i=l%U;a.push({index:l,frame:Math.floor(l/U),row:Math.floor(i/j),col:i%j,from:l<r?"a":"b",bridges:l>=r&&l<r+s&&r+s===U})}return{a:r,b:o,total:n,bridge:s,rest:o-s,frames:Math.max(1,Math.ceil(n/U)),cells:a}}const nr=e=>xe+e*(S+be),sr=e=>xe+e*(S+be);function qo(e){const t=[];for(let r=0;r<fe;r+=1)for(let o=0;o<j;o+=1)t.push(`<rect class="tf-cell" x="${nr(o)}" y="${sr(r)}" width="${S}" height="${S}" rx="4" />`);return`<g transform="translate(${e} 0)">
      <rect class="tf-frame" x="0.5" y="0.5" width="${re-1}" height="${rr-1}" rx="7" />
      ${t.join("")}
    </g>`}function js(e,t,{step:r=.07,title:o=""}={}){const n=or(e,t),s=n.frames*re+(n.frames-1)*ve,a=[];for(let i=0;i<n.frames;i+=1)a.push(qo(i*(re+ve)));const l=n.cells.map(i=>{const f=i.frame*(re+ve)+nr(i.col)+S/2,g=sr(i.row)+S/2;return`<circle class="${["tf-dot",`tf-from-${i.from}`,i.bridges?"tf-bridge":""].filter(Boolean).join(" ")}" cx="${f}" cy="${g}" r="${S/2-2.5}" style="--tf-delay:${(i.index*r).toFixed(2)}s" />`});return`<svg class="tenframe" viewBox="0 0 ${s} ${rr}" role="img" aria-label="${o}" xmlns="http://www.w3.org/2000/svg">
      ${a.join("")}
      ${l.join("")}
    </svg>`}const Ps=(e,t,r=.07)=>(or(e,t).total*r+.35)*1e3,Qe=5,Ko=2,Qo=15,Wo=.6,Yo=5,Vo=120*1e3,Xo=1800*1e3,Jo=(e,t,r)=>Math.min(Math.max(e,t),r);function en(e){const t=Math.round(Number(e)),r=Jo(Number.isFinite(t)?t:Qe,Ko,Qo),o=r*60*1e3;return{minutes:r,hardMs:o,softMs:Math.round(o*Wo),maxQuestions:r*Yo}}const We=en(Qe);function Hs(e){return{startedAt:e,answered:0,correct:0,napUntil:0}}const V=(e,t)=>Math.max(0,t-((e==null?void 0:e.startedAt)??t));function zs(e,{now:t,correct:r,limits:o=We}){return e.answered>=o.maxQuestions?"count":V(e,t)>=o.hardMs?"hard":r&&V(e,t)>=o.softMs?"soft":null}const Bs=(e,t,r=We)=>V(e,t)>=r.hardMs,Gs=e=>!!(e!=null&&e.startedAt),Us=(e,t)=>V(e,t)>=Xo,qs=(e,t)=>({...e,napUntil:t+Vo}),Ks=(e,t)=>!!(e!=null&&e.napUntil)&&t<e.napUntil,Qs=(e,t)=>Math.max(0,((e==null?void 0:e.napUntil)??0)-t),Ws=(e,t,r=We)=>Math.min(1,V(e,t)/r.hardMs);function Ys(e){const t=Math.ceil(e/1e3);return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}const p="#43354f",Ye=[37,63],yt=52,Ve=[-1,1],mt={round:{shape:'<ellipse cx="50" cy="54" rx="34" ry="32" />',halo:{cx:50,cy:54,rx:34,ry:32}},tall:{shape:'<ellipse cx="50" cy="52" rx="28" ry="34" />',halo:{cx:50,cy:52,rx:28,ry:34}},wide:{shape:'<ellipse cx="50" cy="58" rx="38" ry="28" />',halo:{cx:50,cy:58,rx:38,ry:28}},pear:{shape:'<path d="M50 22 C66 22 72 38 74 54 C76 72 66 86 50 86 C34 86 24 72 26 54 C28 38 34 22 50 22 Z" />',halo:{cx:50,cy:55,rx:25,ry:32}},bean:{shape:'<path d="M53 20 C71 20 81 37 79 56 C77 76 63 86 47 86 C30 86 21 71 21 54 C21 34 35 20 53 20 Z" />',halo:{cx:50,cy:53,rx:29,ry:33}},chunky:{shape:'<path d="M50 20 C74 20 86 34 86 55 C86 76 71 86 50 86 C29 86 14 76 14 55 C14 34 26 20 50 20 Z" />',halo:{cx:50,cy:53,rx:36,ry:33}}},tn=`
  <ellipse cx="35" cy="85" rx="10" ry="6" />
  <ellipse cx="65" cy="85" rx="10" ry="6" />`,te=(e,t,r=1)=>{const o=t*Math.PI/180;return{x:e.cx+Math.sin(o)*e.rx*r,y:e.cy-Math.cos(o)*e.ry*r}},kt={smooth:()=>"",fluffy:e=>Array.from({length:18},(t,r)=>{const o=te(e,r*20,1);return`<circle cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="7" />`}).join(""),spiky:e=>Array.from({length:5},(t,r)=>{const o=-70+r*22,n=te(e,o-9,.97),s=te(e,o+9,.97),a=te(e,o,1.22);return`<path d="M${n.x.toFixed(1)} ${n.y.toFixed(1)} L${a.x.toFixed(1)} ${a.y.toFixed(1)} L${s.x.toFixed(1)} ${s.y.toFixed(1)} Z" />`}).join("")},rn=new Set(["horn","fin","antenna","tuft","leaf","antlers","rabbit"]),$t={none:()=>"",roundears:()=>'<circle cx="26" cy="30" r="13" /><circle cx="74" cy="30" r="13" />',ears:()=>`
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
    <path d="M50 30 C50 20 46 14 38 12 C38 22 42 28 50 30 Z" fill="${e}" />`},k="#ffffff",bt={round:e=>`
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
    <circle cx="${e-1.8}" cy="50" r="2.1" fill="${k}" />`},on=e=>`<g transform="translate(0 ${yt}) scale(1 0.08) translate(0 ${-yt})">${e}</g>`+Ve.map((t,r)=>{const o=Ye[r];return`<path d="M${o-9} 52 Q${o} 58.5 ${o+9} 52" fill="none" stroke="${p}"
                  stroke-width="3.2" stroke-linecap="round" />`}).join(""),xt={none:()=>"",thick:(e,t)=>`<path d="M${e+t*8.5} 35.5 L${e-t*8} 35" stroke="${p}" stroke-width="4" stroke-linecap="round" fill="none" />`,arched:e=>`<path d="M${e-8.5} 37.5 Q${e} 30.5 ${e+8.5} 37.5" stroke="${p}" stroke-width="3.2" stroke-linecap="round" fill="none" />`,worried:(e,t)=>`<path d="M${e+t*8.5} 38.5 L${e-t*8.5} 33.5" stroke="${p}" stroke-width="3.4" stroke-linecap="round" fill="none" />`,bushy:e=>`<path d="M${e-9} 36.5 Q${e} 29.5 ${e+9} 36.5" stroke="${p}" stroke-width="5.6" stroke-linecap="round" fill="none" />`},wt={happy:{rot:0,dy:-2.5},content:{rot:0,dy:0},hungry:{rot:-2,dy:-3.5},droopy:{rot:-9,dy:1.5},sleep:{rot:-4,dy:1}},Mt={happy:`<path d="M41 66 C45 75 55 75 59 66" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,content:`<path d="M44 67 C47 72 53 72 56 67" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,hungry:`<ellipse cx="50" cy="69" rx="7" ry="8" fill="${p}" />
           <ellipse cx="50" cy="73" rx="4.5" ry="3.5" fill="#ff9ec0" />`,droopy:`<path d="M43 71 C46 65 54 65 57 71" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`,sleep:`<path d="M44 68 C47 73 53 73 56 68" fill="none" stroke="${p}" stroke-width="3.2" stroke-linecap="round" />`},m=e=>({back:"",front:e}),Q=(e,t)=>({back:e,front:t}),Lt=(e,t,r)=>Array.from({length:10},(o,n)=>{const s=(n*36-90)*Math.PI/180,a=n%2?r*.45:r;return`${(e+Math.cos(s)*a).toFixed(1)} ${(t+Math.sin(s)*a).toFixed(1)}`}).join(" L"),nn={none:()=>m(""),roundSpecs:e=>m(`
      <g fill="${k}" fill-opacity="0.35" stroke="${p}" stroke-width="2.6">
        <circle cx="37" cy="52" r="12.5" /><circle cx="63" cy="52" r="12.5" />
      </g>
      <path d="M49.5 52 H50.5 M24.5 50 L16 47 M75.5 50 L84 47" stroke="${p}"
            stroke-width="2.6" stroke-linecap="round" fill="none" />`),squareSpecs:e=>m(`
      <g fill="${k}" fill-opacity="0.35" stroke="${p}" stroke-width="3.2">
        <rect x="24.5" y="41" width="25" height="22" rx="6" />
        <rect x="50.5" y="41" width="25" height="22" rx="6" />
      </g>
      <path d="M49.5 51 H50.5 M24 46 L16 44 M76 46 L84 44" stroke="${p}"
            stroke-width="3" stroke-linecap="round" fill="none" />`),goggles:e=>m(`
      <path d="M18 48 H82" stroke="${e.accent}" stroke-width="7" stroke-linecap="round" />
      <g fill="${k}" fill-opacity="0.4" stroke="${p}" stroke-width="3">
        <circle cx="37" cy="52" r="13.5" /><circle cx="63" cy="52" r="13.5" />
      </g>`),monocle:e=>m(`
      <circle cx="63" cy="52" r="13" fill="${k}" fill-opacity="0.35" stroke="${p}" stroke-width="2.8" />
      <path d="M63 65 C63 72 58 75 54 76" stroke="${p}" stroke-width="2" fill="none" stroke-linecap="round" />`),starShades:e=>m(`
      <path d="M${Lt(37,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${p}" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M${Lt(63,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${p}" stroke-width="2.2" stroke-linejoin="round" />`)},sn=new Set(["cowlick","topknot","cap"]),an={none:()=>m(""),fringe:e=>m(`<path d="M23 40 C26 24 40 18 50 18 C62 18 74 25 76 40
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
             ${[0,72,144,216,288].map(t=>{const r=t*Math.PI/180;return`<ellipse cx="${(Math.cos(r)*6).toFixed(1)}" cy="${(Math.sin(r)*6).toFixed(1)}" rx="5" ry="4" transform="rotate(${t})" fill="${k}" />`}).join("")}
             <circle cx="0" cy="0" r="4" fill="#ffd166" />
           </g>`)},ln={none:()=>m(""),moustache:()=>m(`<path d="M50 64 C46 59 38 59 35 64 C38 68 46 68 50 64 Z
                    M50 64 C54 59 62 59 65 64 C62 68 54 68 50 64 Z" fill="${p}" />`),beard:()=>m(`<g fill="${p}">
             <circle cx="44" cy="78.5" r="6" /><circle cx="50" cy="81" r="7" /><circle cx="56" cy="78.5" r="6" />
           </g>`),whiskers:()=>m(`<g stroke="${p}" stroke-width="2" stroke-linecap="round" fill="none">
             <path d="M32 64 L18 61 M32 68 L17 68 M32 72 L19 76" />
             <path d="M68 64 L82 61 M68 68 L83 68 M68 72 L81 76" />
           </g>`),teeth:()=>m(`<rect x="45" y="70" width="4.6" height="7" rx="1.6" fill="${k}" stroke="${p}" stroke-width="1.4" />
           <rect x="50.4" y="70" width="4.6" height="7" rx="1.6" fill="${k}" stroke="${p}" stroke-width="1.4" />`),snout:e=>Q(`<ellipse cx="50" cy="69" rx="15" ry="11.5" fill="${e.belly}" />
       <ellipse cx="50" cy="61" rx="5.5" ry="4" fill="${p}" />`,"")},ar={none:()=>m(""),freckles:e=>m(`<g fill="${p}" opacity="0.4">
             <circle cx="26" cy="57" r="1.6" /><circle cx="30" cy="60" r="1.6" /><circle cx="25" cy="63" r="1.6" />
             <circle cx="74" cy="57" r="1.6" /><circle cx="70" cy="60" r="1.6" /><circle cx="75" cy="63" r="1.6" />
           </g>`),spots:e=>Q(`<g fill="${e.accent}" opacity="0.5">
         <ellipse cx="24" cy="44" rx="7" ry="5.5" /><ellipse cx="76" cy="70" rx="6" ry="5" />
         <ellipse cx="70" cy="34" rx="5" ry="4" />
       </g>`,""),stripes:e=>Q(`<g stroke="${e.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55">
         <path d="M20 46 Q26 50 26 58" /><path d="M22 62 Q28 65 29 72" />
         <path d="M80 46 Q74 50 74 58" /><path d="M78 62 Q72 65 71 72" />
       </g>`,""),patch:e=>Q(`<ellipse cx="37" cy="52" rx="15" ry="14" fill="${e.accent}" opacity="0.45" />`,""),heart:e=>Q(`<path d="M50 76 C44 70 38 68 38 63 C38 59 43 58 46 61 C47 62 49 63 50 65
                C51 63 53 62 54 61 C57 58 62 59 62 63 C62 68 56 70 50 76 Z"
             fill="${e.accent}" opacity="0.6" />`,"")},cn={none:()=>m(""),scarf:e=>m(`<g fill="${e.accent}" stroke="${p}" stroke-width="2.2" stroke-linejoin="round">
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
           </g>`)},St={x:50,y:86},vt={x:50,y:55},At={1:{scale:.78,face:1,faceY:0},2:{scale:.9,face:.87,faceY:-5},3:{scale:1.02,face:.74,faceY:-10}},lr=e=>At[e]??At[1],fn=e=>{const{scale:t}=lr(e);return`translate(${St.x} ${St.y}) scale(${t}) translate(-50 -86)`},dn=e=>{const{face:t,faceY:r}=lr(e);return`translate(0 ${r}) translate(${vt.x} ${vt.y}) scale(${t}) translate(-50 -55)`},Ct={tail:e=>`<path d="M78 76 C92 74 96 62 90 52 C88 60 84 66 74 68 Z" fill="${e.accent}" />`,wings:e=>`
    <path d="M26 46 C8 34 2 48 6 60 C10 72 22 72 30 64 Z" fill="${e.accent}" opacity="0.92" />
    <path d="M74 46 C92 34 98 48 94 60 C90 72 78 72 70 64 Z" fill="${e.accent}" opacity="0.92" />`,mane:e=>Array.from({length:11},(t,r)=>{const o=(-100+r*20)*Math.PI/180;return`<circle cx="${(50+Math.sin(o)*36).toFixed(1)}" cy="${(58-Math.cos(o)*32).toFixed(1)}" r="9" />`}).join(""),crest:e=>Array.from({length:5},(t,r)=>{const o=30+r*10,n=r===2?20:12;return`<path d="M${o} 24 L${o+5} ${24-n-10} L${o+10} 24 Z" fill="${e.accent}"
                    stroke="${p}" stroke-width="1.8" stroke-linejoin="round" />`}).join(""),finback:e=>`<path d="M46 4 C66 14 80 32 84 54 C74 44 62 38 48 38 Z" fill="${e.accent}"
           stroke="${p}" stroke-width="2" stroke-linejoin="round" />`,plume:e=>`
    <path d="M76 74 C94 68 98 50 92 36 C88 48 82 58 72 64 Z" fill="${e.accent}" opacity="0.85" />
    <path d="M74 78 C90 76 96 64 94 52 C88 62 82 70 70 72 Z" fill="${e.accent}" />`},Tt={bigEars:e=>`
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
    </g>`},w={mochi:{name:"Mochi",body:"round",texture:"smooth",topper:"roundears",eyes:"round",brows:"none",palette:["#ffd9e2","#fff1f4","#ff9ec0"],grows:["mane","tail"],signature:"bigEars"},bloop:{name:"Bloop",body:"bean",texture:"smooth",topper:"antenna",eyes:"sparkle",brows:"none",palette:["#a5d8ff","#e3f2ff","#5fb3f5"],grows:["tail","wings"],signature:"antennaArray"},pip:{name:"Pip",body:"tall",texture:"fluffy",topper:"tuft",eyes:"oval",brows:"arched",palette:["#b2f2d7","#e6fff5","#4fd6a0"],grows:["crest","plume"],signature:"tallTuft"},waddle:{name:"Waddle",body:"wide",texture:"smooth",topper:"none",eyes:"beady",brows:"thick",palette:["#ffe9a8","#fff8dd","#f7b955"],grows:["tail","mane"],signature:"crownSpikes"},puff:{name:"Puff",body:"round",texture:"fluffy",topper:"ears",eyes:"lashed",brows:"arched",palette:["#d9c8ff","#f2ecff","#a884f5"],grows:["mane","wings"],signature:"longEars"},nibbles:{name:"Nibbles",body:"tall",texture:"smooth",topper:"rabbit",eyes:"round",brows:"worried",palette:["#ffd0b0","#fff0e5","#f79a63"],grows:["wings","plume"],signature:"hugeRabbit"},snug:{name:"Snug",body:"wide",texture:"fluffy",topper:"roundears",eyes:"sleepy",brows:"bushy",palette:["#cfe6c0","#eefae6","#8cc472"],grows:["wings","crest"],signature:"ramCurl"},glim:{name:"Glim",body:"pear",texture:"smooth",topper:"horn",eyes:"sparkle",brows:"thick",palette:["#ffc2b8","#fff0ed","#ff8a75"],grows:["finback","wings"],signature:"twinHorns"},noodle:{name:"Noodle",body:"tall",texture:"smooth",topper:"antlers",eyes:"beady",brows:"worried",palette:["#9fe5e0","#e4fbfa","#48c4bc"],grows:["finback","tail"],signature:"bigAntlers"},fizz:{name:"Fizz",body:"chunky",texture:"spiky",topper:"tuft",eyes:"sparkle",brows:"none",palette:["#ffc7ea","#fff0fa","#f778c4"],grows:["crest","plume"],signature:"flameCrest"},cloudlet:{name:"Cloudlet",body:"wide",texture:"fluffy",topper:"fin",eyes:"oval",brows:"none",palette:["#c9dcff","#eef4ff","#7ba2f0"],grows:["finback","crest"],signature:"stormFin"},pebble:{name:"Pebble",body:"round",texture:"smooth",topper:"none",eyes:"sleepy",brows:"thick",palette:["#dcd6e8","#f4f1f9","#a99cc4"],grows:["plume","mane"],signature:"crystal"},sprout:{name:"Sprout",body:"pear",texture:"smooth",topper:"leaf",eyes:"round",brows:"arched",palette:["#c4e8a0","#eefada","#82c44e"],grows:["mane","crest"],signature:"foliageCrown"},bubs:{name:"Bubs",body:"round",texture:"smooth",topper:"floppy",eyes:"lashed",brows:"none",palette:["#f0c2d8","#fdeef5","#d97fae"],grows:["tail","mane"],signature:"longFlop"},zzz:{name:"Zzz",body:"bean",texture:"fluffy",topper:"hound",eyes:"sleepy",brows:"worried",palette:["#bcc4f0","#e8ebfd","#7d8be0"],grows:["plume","tail"],signature:"moonHorns"},tumble:{name:"Tumble",body:"chunky",texture:"spiky",topper:"ram",eyes:"oval",brows:"bushy",palette:["#ffdcb0","#fff4e4","#f0a552"],grows:["crest","finback"],signature:"doubleRam"}},pn=Object.keys(w),de=[["mochi","bloop","pip","waddle"],["puff","nibbles","snug","glim"],["noodle","fizz","cloudlet","pebble"],["sprout","bubs","zzz","tumble"]];function P(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t}function z(e,t){var n;const r=((n=F.find(s=>s.minutes.includes(t)))==null?void 0:n.id)??0,o=de[r]??de[0];return o[P(C(e,t))%o.length]}function ir(e,t){const r=de[Ue({a:e,b:t})%de.length];return r[P(ke({a:e,b:t}))%r.length]}const hn=e=>(M[(e==null?void 0:e.subject)??"clock"]??M.clock).idOf(e),un=e=>(e==null?void 0:e.subject)===me?ir(e.a,e.b):z(e.h,e.m),cr=({species:e,index:t},r=x)=>{const o=le[r]??le[x],n=P(`n${e}`)%o.length;return o[(n+t)%o.length]},Vs=(e,t,r=x)=>cr({species:z(e,t),index:Je(e,t)},r),Xs=(e,t=x)=>e.name||cr(Xe(e),t),oe={eyewear:"none",hair:"none",facialHair:"none",markings:"none",accessory:"none"},gn=(e,t)=>{var r;return(((r=w[e])==null?void 0:r.grows)??[]).slice(0,Math.max(0,Math.min(t,Ze)-1))};function Ie(e,t=1){const r=e in w?e:"mochi",o=Math.max(1,Math.min(Math.round(t)||1,Ze));return{species:r,...w[r],...oe,form:o,anatomy:gn(r,o),signature:o>=Ze?w[r].signature:null}}const yn=[["eyewear",["roundSpecs","squareSpecs","goggles","monocle","starShades"]],["hair",["fringe","cowlick","topknot","cap","bow","flower"]],["facialHair",["moustache","beard","whiskers","teeth","snout"]],["accessory",["scarf","bandana","bowtie","backpack"]]],Dt=Object.keys(ar),mn=71;function Et(e){const t=yn.map(([o,n])=>[o,o==="hair"&&e?n.filter(s=>!sn.has(s)):n]),r=[{...oe}];for(const[o,n]of t)for(const s of n)r.push({...oe,[o]:s});for(let o=0;o<t.length;o+=1)for(let n=o+1;n<t.length;n+=1)for(const s of t[o][1])for(const a of t[n][1])r.push({...oe,[t[o][0]]:s,[t[n][0]]:a});return r}const kn={crowned:Et(!0),free:Et(!1)},$n=e=>{var t;return rn.has((t=w[e])==null?void 0:t.topper)},bn=e=>kn[$n(e)?"crowned":"free"],ne=new Map,fr=(e,t)=>{ne.has(e)||ne.set(e,[]),ne.get(e).push(t)},se=new Map;for(const e of[...Be].sort((t,r)=>t.h-r.h||t.m-r.m)){const t=z(e.h,e.m);se.has(t)||se.set(t,[]),se.get(t).push(e.id),fr(t,e.id)}const ae=new Map;for(const e of Wt){const t=ir(e.a,e.b);ae.has(t)||ae.set(t,[]),ae.get(t).push(e.id),fr(t,e.id)}const xn=e=>se.get(e)??[],wn=e=>ae.get(e)??[],Mn=e=>ne.get(e)??[],dr=(e,t)=>Math.max(0,Mn(e).indexOf(t));function Xe(e){const t=hn(e),r=un(e);return{key:t,species:r,index:dr(r,t)}}const Je=(e,t)=>dr(z(e,t),C(e,t)),Js=e=>pr(Xe(e),ce(e.feeds??0)||1);function pr({species:e,index:t},r=1){const o=bn(e);return{...Ie(e,r),...o[t*mn%o.length],markings:Dt[t%Dt.length]}}const ea=(e,t,r=1)=>pr({species:z(e,t),index:Je(e,t)},r),Ln=e=>typeof e=="string"?Ie(e):e??Ie("mochi");function Sn(e,t){const r=bt[e.eyes]??bt.round,o=Ve.map((n,s)=>r(Ye[s],n)).join("");return t==="sleep"?on(o):o}function vn(e,t){const r=xt[e.brows]??xt.none,{rot:o,dy:n}=wt[t]??wt.content;return Ve.map((s,a)=>{const l=Ye[a],i=r(l,s);return i?`<g transform="translate(0 ${n}) rotate(${s===-1?o:-o} ${l} 37)">${i}</g>`:""}).join("")}function ta(e,{mood:t="content",className:r="",title:o=""}={}){const n=Ln(e),[s,a,l]=n.palette,i={body:s,belly:a,accent:l},f=mt[n.body]??mt.round,g=(kt[n.texture]??kt.smooth)(f.halo),y=Math.max(1,Math.min(n.form??1,3)),u=n.signature&&Tt[n.signature]?Tt[n.signature](i):($t[n.topper]??$t.none)(l),h=(n.anatomy??[]).map(G=>Ct[G]?Ct[G](i):"").join(""),Nr=o||n.name||"pet",B=(G,Hr,zr)=>(G[Hr]??G[zr])(i),jr=B(nn,n.eyewear,"none"),Pr=B(an,n.hair,"none"),lt=B(ln,n.facialHair,"none"),it=B(ar,n.markings,"none"),ct=B(cn,n.accessory,"none");return`
<svg class="pet form-${y} ${r}" viewBox="0 0 100 100" role="img" aria-label="${Nr}" focusable="false">
  ${o?`<title>${o}</title>`:""}
  <g class="pet-grow" transform="${fn(y)}">
  <g class="pet-inner">
    <g fill="${n.texture==="spiky"?l:s}">${g}</g>
    <g fill="${l}">${h}</g>
    <g fill="${l}">${u}</g>
    ${ct.back}
    <g fill="${l}">${tn}</g>
    <g class="pet-body" fill="${s}">${f.shape}</g>
    <ellipse cx="50" cy="64" rx="21" ry="17" fill="${a}" />
    ${it.back}${lt.back}
    <g class="pet-face" transform="${dn(y)}">
      ${Sn(n,t)}
      ${jr.front}
      ${Pr.front}
      ${vn(n,t)}
      <ellipse cx="27" cy="62" rx="7" ry="4.2" fill="${l}" opacity="0.55" />
      <ellipse cx="73" cy="62" rx="7" ry="4.2" fill="${l}" opacity="0.55" />
      ${it.front}
      ${Mt[t]??Mt.content}
      ${lt.front}
    </g>
    ${ct.front}
  </g>
  </g>
</svg>`}const hr=["M69 27 L62.5 33.5 L68 38.5 L61 44.5 L64.5 50","M31 43 L38 49 L31.5 56 L38.5 63 L33 70","M21 59 L32 55 L43 62.5 L55 54.5 L66.5 62 L79 55.5"],An=hr.length;function ra(e,{cracks:t=0,className:r="",title:o="A chilly egg"}={}){const n=w[e]??w.mochi,[s,a,l]=n.palette,i=Math.max(0,Math.min(An,Math.round(t))),f=Array.from({length:i},(g,y)=>`<path class="egg-crack egg-crack-${y+1}" pathLength="1" d="${hr[y]}" />`).join("");return`
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
</svg>`}function oa(e,t,{size:r=34}={}){const n=Se(50,50,24,e%12*30+t*.5),s=Se(50,50,36,t*6),a=Array.from({length:12},(l,i)=>{const f=Se(50,50,41,i*30);return`<circle cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="2.6" />`}).join("");return`
<svg class="collar-clock" width="${r}" height="${r}" viewBox="0 0 100 100" role="img"
     aria-label="${C(e,t)}" focusable="false">
  <circle cx="50" cy="50" r="46" class="collar-face" />
  <g class="collar-ticks">${a}</g>
  <line x1="50" y1="50" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}" class="collar-hand hour" />
  <line x1="50" y1="50" x2="${s.x.toFixed(1)}" y2="${s.y.toFixed(1)}" class="collar-hand minute" />
  <circle cx="50" cy="50" r="5" class="collar-pin" />
</svg>`}function na(e,t,{napping:r=!1}={}){return r?"sleep":e.hatchedAt===null?"content":e.phase==="learning"?e.lapses>0?"droopy":"content":e.dueAt<=t?"hungry":"happy"}const et=[{id:"stump",price:35,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"flowerbed",price:45,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"lantern",price:60,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"sandpit",price:70,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"swing",price:80,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"house",price:130,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"beehive",price:75,tier:2,scope:"home",slot:"ground",band:"narrow"},{id:"hammock",price:80,tier:2,scope:"home",slot:"ground",band:"wide"},{id:"pond",price:90,tier:2,scope:"home",slot:"ground",band:"narrow"},{id:"feeder",price:95,tier:3,scope:"home",slot:"ground",band:"narrow"},{id:"arch",price:140,tier:3,scope:"home",slot:"ground",band:"wide"},{id:"windmill",price:140,tier:3,scope:"home",slot:"ground",band:"narrow"},{id:"farGrove",price:50,tier:0,scope:"home",slot:"backdrop"},{id:"farMill",price:85,tier:1,scope:"home",slot:"backdrop"},{id:"farArch",price:120,tier:2,scope:"home",slot:"backdrop"},{id:"farTower",price:165,tier:3,scope:"home",slot:"backdrop"},{id:"signpost",price:55,tier:0,scope:"zoo"},{id:"topiary",price:90,tier:1,scope:"zoo"},{id:"bunting",price:110,tier:1,scope:"zoo"},{id:"pathLamps",price:150,tier:2,scope:"zoo"},{id:"fountain",price:200,tier:3,scope:"zoo"},{id:"statue",price:250,tier:3,scope:"zoo"}],tt={ground:2,backdrop:1},Cn=tt.ground,rt=3,T=new Map(et.map(e=>[e.id,e])),ee=e=>{var t;return((t=T.get(e))==null?void 0:t.slot)??"ground"},ur=e=>{var t;return((t=T.get(e))==null?void 0:t.scope)??"home"},gr=e=>ur(e)==="home",yr=e=>ur(e)==="zoo",sa=et.filter(e=>e.scope==="home"),aa=et.filter(e=>e.scope==="zoo"),la=(e,t)=>{var r;return(((r=T.get(e))==null?void 0:r.tier)??ge+1)<=t},we=e=>Array.isArray(e==null?void 0:e.decor)?e.decor:[],mr=(e,t)=>we(e).includes(t),Tn=(e,t)=>we(e).filter(r=>ee(r)===t).length,Dn=(e,t="ground")=>Tn(e,t)>=(tt[t]??0);function ot(e){if(!Array.isArray(e))return[];const t=[],r={};for(const o of e){if(!T.has(o)||!gr(o)||t.includes(o))continue;const n=ee(o);(r[n]??0)>=(tt[n]??0)||(r[n]=(r[n]??0)+1,t.push(o))}return t}function nt(e){if(!Array.isArray(e))return[];const t=[];for(const r of e)if(T.has(r)&&yr(r)&&!t.includes(r)&&t.push(r),t.length>=rt)break;return t}function ia(e,t){return!T.has(t)||!gr(t)||mr(e,t)||Dn(e,ee(t))?e:{...e,decor:[...we(e),t]}}function ca(e,t){return mr(e,t)?{...e,decor:we(e).filter(r=>r!==t)}:e}const Z=e=>Array.isArray(e)?e:[],kr=(e,t)=>Z(e).includes(t),En=e=>Z(e).length>=rt;function fa(e,t){return!T.has(t)||!yr(t)||kr(e,t)||En(e)?Z(e):[...Z(e),t]}function da(e,t){return kr(e,t)?Z(e).filter(r=>r!==t):Z(e)}const $r=6,br=[0,0,10,16],Zn=30,pa=6,Zt=6,On=12;function ha(e){if(!e)return 0;let t=0;return e.hatched&&(t+=$r),e.evolved&&(t+=br[e.evolved]??0),t}function ua(e,t){const r=Array.isArray(e)?e:[];if(r[r.length-1]!==t)return 0;const o=r[r.length-2];if(!o)return Zt;const n=new Date(`${t}T00:00:00Z`);return n.setUTCDate(n.getUTCDate()-1),o===n.toISOString().slice(0,10)?On:Zt}const In=40,_n=30,Rn=50,Fn=7;function Nn(e){const t=Array.isArray(e)?e:[];let r=0,o=null;for(let n=t.length-1;n>=0;n-=1){const s=t[n];if(typeof s!="string"||o!==null&&s!==o)break;r+=1;const a=new Date(`${s}T00:00:00Z`);if(Number.isNaN(a.getTime()))return r;a.setUTCDate(a.getUTCDate()-1),o=a.toISOString().slice(0,10)}return r}function jn(e,t){const r=[],o=e??{};for(const a of F)De(o,"clock",a.id)>=1&&r.push(`mastery:${a.id}`);for(const a of $e)De(o,me,a.id)>=1&&r.push(`mastery:add:${a.id}`);const n=Math.floor(Nn(t==null?void 0:t.daysPlayed)/Fn);for(let a=1;a<=n;a+=1)r.push(`week:${a}`);const s=a=>a.length>0&&a.every(l=>{var i;return(i=o[l])==null?void 0:i.hatchedAt});for(const a of pn)s(xn(a))&&r.push(`species:${a}`),s(wn(a))&&r.push(`species:add:${a}`);return r}function Pn(e){const t=String(e??"").split(":")[0];return t==="mastery"?In:t==="week"?_n:t==="species"?Rn:0}function ga(e,t,r){const o=new Set(Array.isArray(r)?r:[]),n=jn(e,t).filter(s=>!o.has(s));return{ids:n,coins:n.reduce((s,a)=>s+Pn(a),0)}}const v=e=>Math.max(0,Math.floor(Number.isFinite(e)?e:0)),xr=v,ya=(e,t)=>v(e)+v(t),Hn=(e,t)=>v(e)>=v(t),ma=(e,t)=>Hn(e,t)?v(e)-v(t):v(e);function ka(e,t=0){let r=0;for(const o of Object.values(e??{})){o!=null&&o.hatchedAt&&(r+=$r);const n=ce(typeof(o==null?void 0:o.feeds)=="number"?o.feeds:0);for(let s=2;s<=n;s+=1)r+=br[s]??0}return r+v(t)*Zn}const st="pet-zoo/v1",X=2,zn=400;function E(e){return{version:X,createdAt:e,lastPlayedAt:e,reviewClock:0,tiers:Object.fromEntries(_.map(t=>[t,0])),coins:0,zooDecor:[],milestones:[],coinsGrantedAt:0,milestonesGrantedAt:0,settings:{sound:!0,haptics:!0,language:x,playMinutes:Qe,showDigital:!1,answerMode:"auto",mirrorNudge:!1},session:{startedAt:0,answered:0,correct:0,napUntil:0},ink:[],stats:{totalAnswered:0,totalCorrect:0,streak:0,bestStreak:0,daysPlayed:[]},items:{}}}const Bn=e=>typeof e=="string"&&e.length>0&&e.length<=40,wr=e=>Array.isArray(e)?e.filter(Bn):[],Mr=e=>new Date(e).toISOString().slice(0,10);function $a(e,t=Me()){try{const r=t==null?void 0:t.getItem(st);if(!r)return E(e);const o=JSON.parse(r);if(!o||typeof o.items!="object"||!Number.isFinite(o.version)||o.version>X)return E(e);const n=Gn(o);return{...E(e),...n,coins:xr(n.coins),tiers:N(n),zooDecor:nt(n.zooDecor),milestones:wr(n.milestones),settings:{...E(e).settings,...n.settings},items:Lr(n.items),ink:Br(n.ink)}}catch{return E(e)}}function Gn(e){if(!e||e.version>=X)return e;const t={...e,version:X};return t.tiers=N(e),delete t.tier,t}function Lr(e){const t={};for(const[r,o]of Object.entries(e??{})){const n=Co(r);if(!n)continue;const s=typeof(o==null?void 0:o.feeds)=="number"?o.feeds:(o==null?void 0:o.reps)||(o!=null&&o.hatchedAt?1:0),a=typeof(o==null?void 0:o.cracks)=="number"?o.cracks:Xt((o==null?void 0:o.correctStreak)??0),l=ot(o==null?void 0:o.decor),i=(o==null?void 0:o.subject)===n&&typeof(o==null?void 0:o.feeds)=="number"&&typeof(o==null?void 0:o.cracks)=="number"&&Array.isArray(o==null?void 0:o.decor)&&l.length===o.decor.length;t[r]=i?o:{...o,subject:n,feeds:s,cracks:a,decor:l}}return t}function Un(e,t=Me()){try{return t==null||t.setItem(st,JSON.stringify(e)),!0}catch{return!1}}function ba(e=Me()){try{e==null||e.removeItem(st)}catch{}}function Me(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function xa(e=Me()){let t=null,r=null;const o=()=>{clearTimeout(t),t=null,r&&Un(r,e),r=null};return{save(n){r=n,t===null&&(t=setTimeout(o,zn))},flush:o}}function wa(e,t){const r=Mr(t),o=e.stats.daysPlayed;return o[o.length-1]===r?e:{...e,stats:{...e.stats,daysPlayed:[...o.slice(-59),r]}}}const Sr="pet-zoo",vr=1,_e="petzoo1:";class D extends Error{constructor(t){super(t),this.name="TransferError",this.key=t}}function Ma(e,t){return{app:Sr,format:vr,version:X,exportedAt:t,createdAt:e.createdAt,lastPlayedAt:e.lastPlayedAt,reviewClock:e.reviewClock,tiers:e.tiers,tier:N(e).clock,coins:e.coins,zooDecor:e.zooDecor,milestones:e.milestones,stats:e.stats,items:e.items}}const qn=e=>JSON.stringify(e,null,2),La=e=>`pet-zoo-${Mr(e)}.json`,Ot=32768;function Kn(e){let t="";for(let r=0;r<e.length;r+=Ot)t+=String.fromCharCode(...e.subarray(r,r+Ot));return btoa(t)}function Qn(e){const t=atob(e),r=new Uint8Array(t.length);for(let o=0;o<t.length;o+=1)r[o]=t.charCodeAt(o);return r}function Sa(e){const t=new TextEncoder().encode(qn(e));return _e+Kn(t)}const pe=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);function va(e){const t=String(e??"").trim();if(!t)throw new D("transfer.badFile");let r=t;if(t.startsWith(_e))try{const n=t.slice(_e.length).replace(/\s+/g,"");r=new TextDecoder().decode(Qn(n))}catch{throw new D("transfer.badFile")}let o;try{o=JSON.parse(r)}catch{throw new D("transfer.badFile")}if(!pe(o))throw new D("transfer.badFile");if(o.app!==Sr)throw new D("transfer.badApp");if(!(o.format<=vr))throw new D("transfer.badVersion");if(!pe(o.items))throw new D("transfer.badFile");return{...o,items:Wn(o.items)}}function Wn(e){const t={};for(const[r,o]of Object.entries(e)){if(!pe(o))continue;const n=Vt(r);!n||!n.valid(r,o)||(t[r]=o)}return Lr(t)}const Aa=e=>Object.values(e).filter(t=>t.hatchedAt!==null&&t.hatchedAt!==void 0).length;function Ca(e,t,r){const o=E(r);return{...o,createdAt:t.createdAt??o.createdAt,lastPlayedAt:t.lastPlayedAt??r,reviewClock:Number.isFinite(t.reviewClock)?t.reviewClock:0,tiers:N(t),coins:xr(t.coins),zooDecor:nt(t.zooDecor),milestones:wr(t.milestones),milestonesGrantedAt:Array.isArray(t.milestones)?r:0,coinsGrantedAt:Number.isFinite(t.coins)?r:0,stats:{...o.stats,...pe(t.stats)?t.stats:{}},items:t.items,settings:e.settings,session:o.session}}const $={w:200,h:120},d=62,b=96,W={x0:40,x1:160},R={x0:62,x1:138},Ta=46,c=e=>Number(e.toFixed(2));function Le(e){let t=Math.floor(e)%2147483647+1;return t<=0&&(t+=2147483646),()=>(t=t*48271%2147483647,(t-1)/2147483646)}const A={dawn:{sky:["#f6b98a","#ffe6cd"],orb:"sun",orbFill:"#ffd27a",glow:"#ffd9a8",veil:"rgba(255, 176, 120, 0.16)",night:!1},morning:{sky:["#a8dcff","#e8f6ff"],orb:"sun",orbFill:"#ffe293",glow:"#fff3c4",veil:"rgba(255, 246, 214, 0.10)",night:!1},noon:{sky:["#8ecfff","#e4f4ff"],orb:"sun",orbFill:"#fff2a8",glow:"#fffbdd",veil:"rgba(255, 255, 255, 0.06)",night:!1},afternoon:{sky:["#ffcf96","#fff0d6"],orb:"sun",orbFill:"#ffc860",glow:"#ffe0a5",veil:"rgba(255, 190, 120, 0.13)",night:!1},dusk:{sky:["#7f6bc4","#ffb493"],orb:"sun",orbFill:"#ff9d6e",glow:"#ffc7a0",veil:"rgba(120, 96, 190, 0.18)",night:!1},night:{sky:["#2f3f7a","#6a7cb8"],orb:"moon",orbFill:"#fdf8dc",glow:"#cfd8ff",veil:"rgba(40, 52, 110, 0.26)",night:!0}},Da=Object.keys(A);function Ar(e){const t=(Math.round(e)%24+24)%24;return t>=5&&t<7?"dawn":t>=7&&t<11?"morning":t>=11&&t<14?"noon":t>=14&&t<17?"afternoon":t>=17&&t<20?"dusk":"night"}function Cr(e){const t=(Math.round(e)%24+24)%24,o=(t>=5&&t<19?(t-5)/14:((t<5?t+24:t)-19)/10)*Math.PI;return{x:c(100-Math.cos(o)*52),y:c(d-12-Math.sin(o)*34)}}function Tr(e,t,r,o){const n=A[e]??A.noon,s=Cr(t),a=Le(r+17),l=`
    <circle cx="${s.x}" cy="${s.y}" r="22" fill="url(#${o}-glow)" />
    ${n.orb==="moon"?`<circle cx="${s.x}" cy="${s.y}" r="7.5" fill="${n.orbFill}" />
           <circle cx="${c(s.x+2.6)}" cy="${c(s.y-2)}" r="1.5" fill="#e8e0bd" opacity="0.7" />
           <circle cx="${c(s.x-1.8)}" cy="${c(s.y+2.4)}" r="1.1" fill="#e8e0bd" opacity="0.6" />`:`<circle cx="${s.x}" cy="${s.y}" r="9" fill="${n.orbFill}" />`}`;return n.night?`${Array.from({length:34},()=>{const g=c(a()*200),y=c(a()**1.6*(d-6)),u=c(.5+a()*.9);return`<circle cx="${g}" cy="${y}" r="${u}" fill="#fdf8dc" opacity="${c(.35+a()*.5)}" />`}).join("")}${l}`:`${Array.from({length:3},(f,g)=>{const y=c(18+a()*150),u=c(8+a()*28),h=c(.7+a()*.7);return`<g transform="translate(${y} ${u}) scale(${h})" fill="#ffffff" opacity="${c(.5+g*.08)}">
      <ellipse cx="0" cy="0" rx="13" ry="6" />
      <circle cx="-5" cy="-2.5" r="6" />
      <circle cx="4.5" cy="-3.5" r="7.5" />
    </g>`}).join("")}${l}`}const Re={hills:e=>`
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
    </g>`},It=`M0 ${d+2}
   C 34 ${d-4}, 68 ${d+6}, 100 ${d+1}
   C 136 ${d-5}, 170 ${d+5}, 200 ${d}`;function Dr(e,t){return`
    <path d="${It} L200 120 L0 120 Z" fill="url(#${t}-ground)" />
    <path d="${It}" fill="none" stroke="${e.groundRim}" stroke-width="1.4" opacity="0.55" />
    <path d="M0 ${b+4}
             C 46 ${b-2}, 120 ${b+7}, 200 ${b}
             L200 120 L0 120 Z"
          fill="${e.groundNear}" opacity="0.55" />`}const Fe={grass:(e,t)=>Array.from({length:26},()=>{const r=c(t()*200),o=c(d+6+t()*50),n=c(2.6+t()*3.4);return`<path d="M${r} ${o} q${c(.8+t())} ${-n} ${c(1.8+t())} ${c(-n*.6)}" stroke="${e.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55" />`}).join(""),fern:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),o=c(d+8+t()*48),n=c(.6+t()*.6);return`<g transform="translate(${r} ${o}) scale(${n})" fill="${e.leafDark}" opacity="0.5">
        <ellipse cx="-3" cy="-2" rx="4" ry="1.6" transform="rotate(-25 -3 -2)" />
        <ellipse cx="3" cy="-2" rx="4" ry="1.6" transform="rotate(25 3 -2)" />
        <ellipse cx="0" cy="-4.5" rx="3.4" ry="1.5" />
      </g>`}).join(""),shells:(e,t)=>Array.from({length:18},()=>{const r=c(t()*200),o=c(d+10+t()*46),n=c(1.1+t()*1.5);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.7)}" fill="${e.bloom}" opacity="0.6" />`}).join(""),pebbles:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),o=c(d+8+t()*48),n=c(1+t()*1.8);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.65)}" fill="${e.stone}" opacity="0.5" />`}).join(""),lily:(e,t)=>Array.from({length:9},()=>{const r=c(t()*200),o=c(d+10+t()*42),n=c(3+t()*2.6);return`<g transform="translate(${r} ${o})">
        <circle r="${n}" fill="${e.leaf}" opacity="0.8" />
        <path d="M0 0 L${n} ${c(-n*.4)} A${n} ${n} 0 0 0 ${c(n*.7)} ${c(n*.7)} Z" fill="${e.groundNear}" opacity="0.5" />
      </g>`}).join(""),snow:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),o=c(d+8+t()*48),n=c(2.4+t()*3.4);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.5)}" fill="#ffffff" opacity="0.75" />`}).join(""),spores:(e,t)=>Array.from({length:22},()=>{const r=c(t()*200),o=c(d-4+t()*56),n=c(.8+t()*1.4);return`<circle cx="${r}" cy="${o}" r="${n}" fill="${e.glow}" opacity="${c(.35+t()*.45)}" />`}).join(""),sparkle:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),o=c(d+2+t()*52),n=c(.8+t()*1.3);return`<circle cx="${r}" cy="${o}" r="${n}" fill="#ffffff" opacity="${c(.4+t()*.4)}" />`}).join("")},Ne={tree:e=>`
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
    <circle cx="4.6" cy="-7.4" r="7" fill="#fbfdff" />`},Ea=Object.keys(Ne),Yn=e=>`
  <ellipse cx="0" cy="-1" rx="14" ry="5.6" fill="${e.nestDark}" />
  <ellipse cx="0" cy="-3" rx="11.6" ry="4.4" fill="${e.nest}" />
  <ellipse cx="0" cy="-3.6" rx="8.4" ry="2.8" fill="${e.nestLight}" />`,_t={bush:[[-5.4,-9.4],[5.2,-10.4],[-.2,-14.2]],tree:[[-6.4,-18],[6.6,-19.2],[0,-23.4]],basket:[[-4.6,-7.2],[4.6,-7.8],[0,-10.4]],coral:[[-5,-11.4],[4.2,-9],[.4,-15.2]]},Rt={bush:e=>`
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
    <circle cx="-5" cy="-11" r="2.2" fill="${e.accent}" />`},je={berry:e=>`
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
    <circle cx="0" cy="-0.2" r="1.1" fill="#fff8e0" opacity="0.8" />`},Za=Object.keys(je),Vn=e=>`
  <circle cx="0" cy="0" r="5" fill="${e.ballA}" />
  <path d="M-5 0 a5 5 0 0 1 10 0 Z" fill="${e.ballB}" />
  <circle cx="-1.7" cy="-1.9" r="1.4" fill="#ffffff" opacity="0.7" />`,Xn=e=>`
  <ellipse cx="0" cy="0" rx="7.4" ry="2.6" fill="${e.leafDark}" opacity="0.45" />`,Pe={stump:e=>`
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
    <circle cx="0" cy="-21" r="1.8" fill="${e.stoneLight}" />`},Oa=Object.keys(Pe),Ft=16,He={farGrove:e=>`
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
    <rect x="-2" y="-38" width="4" height="4" fill="${e.glow}" opacity="0.6" />`},Ia=Object.keys(He),Jn=.48,_a=42,Ra=24,Ae=13,ze={signpost:e=>`
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
    <circle cx="0" cy="-13.6" r="2" fill="${e.accent}" />`},Fa=Object.keys(ze);function Er(e,t,r=12){const o=Le(t+91);return Array.from({length:r},(n,s)=>{const a=c(20+o()*160),l=c(d-10+o()*52),i=c(.9+o()*1.1),f=c(o()*6),g=c(4+o()*7);return`<circle class="hab-mote" cx="${a}" cy="${l}" r="${i}" fill="${e.glow}"
      style="--mote-delay:${f}s; --mote-drift:${g}px" />`}).join("")}const es=e=>Math.max(0,Math.min(255,Math.round(e))),Nt=e=>{const t=String(e).replace("#",""),r=t.length===3?t.split("").map(o=>o+o).join(""):t;return[parseInt(r.slice(0,2),16)||0,parseInt(r.slice(2,4),16)||0,parseInt(r.slice(4,6),16)||0]},ts=e=>`#${e.map(t=>es(t).toString(16).padStart(2,"0")).join("")}`;function L(e,t,r){const o=Math.max(0,Math.min(1,r)),[n,s,a]=Nt(e),[l,i,f]=Nt(t);return ts([n+(l-n)*o,s+(i-s)*o,a+(f-a)*o])}const jt={dawn:{color:"#ffb47e",amount:.2},morning:{color:"#fffbe8",amount:.08},noon:{color:"#ffffff",amount:.03},afternoon:{color:"#ffc474",amount:.2},dusk:{color:"#7f66c0",amount:.3},night:{color:"#33437e",amount:.44}},rs={far:"#8fc06a",farDark:"#6ea54f",ground:["#a9d581","#7fbc5e"],groundNear:"#97ca70",leaf:"#7fc65c",leafDark:"#54a03c",wood:"#a87b52",stone:"#c6c0b2",stoneLight:"#e4dfd4",bloom:"#ffd7e6",accent:"#ff9ec0",nest:"#ecdcaa",nestDark:"#c9b47f",nestLight:"#f8f0cf",glow:"#fff0b0",glowDeep:"#ffd66b",water:"#7fc4e8",waterLight:"#c4e8f8"},J={meadow:{far:"hills",detail:"grass",larder:"bush",treat:"berry",scenery:["tree","bush","flowers","rock"],colors:{}},grove:{far:"treeline",detail:"fern",larder:"tree",treat:"apple",scenery:["pine","tree","mushroom","rock"],colors:{far:"#5f9d55",farDark:"#3f7a41",ground:["#8cc474","#5f9c55"],groundNear:"#7ab266",leaf:"#63b061",leafDark:"#3d8845",wood:"#8a6242",bloom:"#ffd08a"}},pond:{far:"hills",detail:"lily",larder:"bush",treat:"apple",scenery:["reeds","bush","flowers","rock"],colors:{far:"#87c69a",farDark:"#63a97e",ground:["#9ed3a4","#6fb894"],groundNear:"#8fcc9e",leaf:"#6fc08c",leafDark:"#46976a",bloom:"#ffe4a8"}},shore:{far:"sea",detail:"shells",larder:"coral",treat:"fish",scenery:["palm","rock","bush","flowers"],colors:{far:"#f0dcb0",farDark:"#dcbe94",ground:["#f6e6bd","#e6cf9a"],groundNear:"#f2dfb0",leaf:"#78c47e",leafDark:"#519a5c",wood:"#b9885a",stone:"#e0d6c0",stoneLight:"#f4ecdc",bloom:"#ffc0a8",water:"#5fbfe4",waterLight:"#bde8f6"}},dune:{far:"dunes",detail:"pebbles",larder:"basket",treat:"melon",scenery:["cactus","rock","flowers","bush"],colors:{far:"#f2d49a",farDark:"#dcb87c",ground:["#f8e2ae","#e8c78c"],groundNear:"#f4dca4",leaf:"#8cc078",leafDark:"#5f9455",wood:"#c08c58",stone:"#dccbaa",stoneLight:"#f2e7cd",bloom:"#ffb3c8"}},snowfield:{far:"peaks",detail:"snow",larder:"basket",treat:"carrot",scenery:["snowpine","snowdrift","rock","snowpine"],colors:{far:"#bcd0ea",farDark:"#93aed2",ground:["#eef5ff","#cfe0f4"],groundNear:"#e4eeff",leaf:"#5f9c78",leafDark:"#417a5c",wood:"#8a6a52",stone:"#c8d4e6",stoneLight:"#eaf1fa",bloom:"#c8dcff",glow:"#dbeaff",glowDeep:"#9fc4f0"}},glowvale:{far:"arch",detail:"spores",larder:"bush",treat:"glowberry",scenery:["mushroom","crystal","rock","bush"],colors:{far:"#6a5a94",farDark:"#4a3f70",ground:["#8f7fbc","#6b5c96"],groundNear:"#8474ae",leaf:"#7fc4a8",leafDark:"#4f9a80",wood:"#7a5f8e",stone:"#a89cc4",stoneLight:"#cfc6e4",bloom:"#c8a0ff",glow:"#a8f0e0",glowDeep:"#5fd8c4"}},cloudtop:{far:"cloudbank",detail:"sparkle",larder:"basket",treat:"starfruit",scenery:["cloudpuff","crystal","flowers","cloudpuff"],colors:{far:"#d2e0fa",farDark:"#b0c6ec",ground:["#e2ecff","#c2d4f0"],groundNear:"#d6e4fb",leaf:"#8ec8ea",leafDark:"#6aa6d6",wood:"#b0a8cc",stone:"#c8d6ee",stoneLight:"#e6eefc",bloom:"#ffd9f0",glow:"#fff0c8",glowDeep:"#ffd98a"}}},Na=Object.keys(J),os={sprout:"meadow",bubs:"pond",zzz:"snowfield",tumble:"dune",mochi:"meadow",bloop:"pond",pebble:"snowfield",nibbles:"dune",pip:"grove",snug:"grove",noodle:"grove",cloudlet:"shore",waddle:"shore",glim:"glowvale",fizz:"glowvale",puff:"cloudtop"},ns=e=>os[e]??"meadow",Pt=[{pieces:[[78,.56],[124,.6],[36,.86],[176,1.3]],larder:52,ball:78,nest:126},{pieces:[[86,.55],[118,.58],[166,.88],[26,1.26]],nest:74,ball:122,larder:148},{pieces:[[74,.52],[128,.62],[34,.9],[178,1.22]],larder:150,ball:124,nest:78},{pieces:[[90,.6],[112,.54],[168,.84],[24,1.28]],nest:120,ball:80,larder:54},{pieces:[[80,.58],[130,.53],[38,.94],[174,1.24]],larder:56,ball:82,nest:128},{pieces:[[88,.54],[120,.6],[164,.8],[30,1.3]],nest:72,ball:118,larder:146},{pieces:[[76,.57],[126,.52],[32,.88],[180,1.22]],larder:148,ball:120,nest:76}],ja={x0:66,x1:134},he={x0:88,x1:112},ss=3;function at(e,t){const r=[e.nest,e.larder,e.ball];let o=100,n=-1/0;for(let s=t.x0+12;s<=t.x1-12;s+=2){const l=Math.min(...r.map(i=>Math.abs(s-i)))-Math.abs(s-100)*.4;l>n&&(n=l,o=s)}return o}const Zr=12,as=30;function Or(e,t=Cn){const r=[e.nest,e.larder,e.ball,at(e,R)],o=[];for(let s=W.x0+Ft;s<=W.x1-Ft;s+=2)s>=he.x0&&s<=he.x1||o.push(s);o.sort((s,a)=>Math.abs(a-100)-Math.abs(s-100));const n=[];for(const s of o){if(n.length>=t)break;r.some(a=>Math.abs(a-s)<Zr)||n.some(a=>Math.abs(a-s)<as)||n.push(s)}return n.sort((s,a)=>s-a)}function ls(e,t=Or(e)){const r=[...t,at(e,R)],o=[];for(let l=W.x0+Ae;l<=W.x1-Ae;l+=2)l>=he.x0&&l<=he.x1||o.push(l);o.sort((l,i)=>Math.abs(i-100)-Math.abs(l-100)||l-i);const n=o.find(l=>r.every(i=>Math.abs(i-l)>=Zr));if(n!==void 0)return c(n);let s=o[0]??W.x0+Ae,a=-1;for(const l of o){const i=Math.min(...r.map(f=>Math.abs(f-l)));i>a&&(a=i,s=l)}return c(s)}const is=e=>c(d+10+(e-.5)*40),Ir=(e,t,r)=>Math.max(t,Math.min(r,e)),cs=6,fs=20,ds=4;function _r(e,t){const r=(Number.isFinite(t)?t:1+P(`hr${e}`)%12)%12,o=P(`t${e}`)%ds,n=i=>i>=cs&&i<=fs,s=n(r)===n(r+12)?o%2===1:n(r+12)!==(o===0),a=r+(s?12:0),l=Ar(a);return{hour24:a,pm:s,phase:l,night:A[l].night,orb:Cr(a)}}const Pa=(e,t)=>_r(C(e,t),e);function Rr(e,t,r){var g;const o=w[e]??w.mochi,[n,s,a]=o.palette,l={...rs,...((g=J[t])==null?void 0:g.colors)??{}},i=jt[r]??jt.noon,f=(y,u=.1)=>L(L(y,a,u),i.color,i.amount);return{far:f(l.far),farDark:f(l.farDark),ground:[f(l.ground[0],.12),f(l.ground[1],.12)],groundNear:f(l.groundNear,.14),groundRim:L(f(l.ground[0],.12),"#2b2440",.34),leaf:f(l.leaf),leafDark:f(l.leafDark),wood:f(l.wood,.07),stone:f(l.stone,.07),stoneLight:f(l.stoneLight,.05),water:f(l.water,.07),waterLight:f(l.waterLight,.05),bloom:L(L(l.bloom,n,.42),i.color,i.amount*.5),accent:L(a,i.color,i.amount*.4),nest:L(l.nest,s,.45),nestDark:L(l.nestDark,a,.32),nestLight:L(l.nestLight,s,.5),glow:l.glow,glowDeep:l.glowDeep,ballA:a,ballB:s}}function Fr({key:e,species:t,index:r,hour:o}){const n=ns(t),s=J[n],a=_r(e,o),l=Pt[r*ss%Pt.length],i=P(`hab${e}`)%1e5,f=l.pieces.map(([y,u],h)=>({id:s.scenery[(r+h)%s.scenery.length],x:y,scale:u,y:is(u),flip:(r+h)%2===1})),g=(_t[s.larder]??_t.bush).map(([y,u])=>({x:c(l.larder+y),y:c(b+u)}));return{id:e,species:t,biome:n,light:a,palette:Rr(t,n,a.phase),scenery:f,props:{nest:{x:l.nest,y:b},ball:{x:l.ball,y:b},larder:{x:l.larder,y:b,kind:s.larder,treat:s.treat,spots:g}},home:{x:at(l,R),y:b},roam:{...R},furniture:[],backdrop:null,spots:Or(l),backdropSpot:ls(l),seed:i}}const Ha=(e,t)=>Fr({key:C(e,t),species:z(e,t),index:Je(e,t),hour:e});function za(e){const t=Fr({...Xe(e),hour:e.h}),r={...t,furniture:ps(t,e==null?void 0:e.decor),backdrop:hs(t,e==null?void 0:e.decor)},o=e==null?void 0:e.habitat;return!o||typeof o!="object"?r:{...r,...o,palette:{...r.palette,...o.palette??{}},props:{...r.props,...o.props??{}},light:{...r.light,...o.light??{}}}}function ps(e,t){const r=ot(t).filter(a=>ee(a)==="ground"),o=e.spots??[],n=a=>{var l;return((l=T.get(a))==null?void 0:l.band)==="wide"},s=r.length===2&&!n(r[0])&&n(r[1])?[...o].reverse():o;return r.slice(0,o.length).map((a,l)=>({id:a,x:s[l],y:b}))}function hs(e,t){const r=ot(t).find(o=>ee(o)==="backdrop");return r?{id:r,x:e.backdropSpot??100,y:d,scale:Jn}:null}const us=(e,t,r,o,n,s)=>{const a=Ne[e]??Ne.bush,l=n?`scale(${-o} ${o})`:`scale(${o})`;return`<g transform="translate(${t} ${r}) ${l}">${a(s)}</g>`};function Ba(e,{uid:t="h",label:r="",sleeping:o=!1}={}){const n=e.palette,s=A[e.light.phase]??A.noon,a=Le(e.seed+3),l=J[e.biome]??J.meadow,i=e.scenery.filter(u=>u.y<=b),f=e.scenery.filter(u=>u.y>b),g=u=>u.map(h=>us(h.id,h.x,h.y,h.scale,h.flip,n)).join(""),y=e.light.night||e.biome==="glowvale";return`
<svg class="habitat" viewBox="0 0 ${$.w} ${$.h}" preserveAspectRatio="xMidYMax slice"
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
    <rect x="0" y="0" width="${$.w}" height="${$.h}" fill="url(#${t}-sky)" />
    ${Tr(e.light.phase,e.light.hour24,e.seed,t)}
  </g>

  <g class="hab-far">${(Re[l.far]??Re.hills)(n)}</g>

  ${e.backdrop?`<g class="hab-backdrop" transform="translate(${e.backdrop.x} ${e.backdrop.y}) scale(${e.backdrop.scale})">${(He[e.backdrop.id]??He.farGrove)(n)}</g>`:""}

  <g class="hab-ground">
    ${Dr(n,t)}
    ${(Fe[l.detail]??Fe.grass)(n,a)}
  </g>

  <g class="hab-back">
    ${g(i)}
    ${(e.furniture??[]).map(u=>`<g class="hab-furniture" transform="translate(${u.x} ${u.y})">${(Pe[u.id]??Pe.flowerbed)(n)}</g>`).join("")}
    <g transform="translate(${e.props.nest.x} ${e.props.nest.y})">${Yn(n)}</g>
    <g transform="translate(${e.props.ball.x} ${e.props.ball.y})">${Xn(n)}</g>
    <g transform="translate(${e.props.larder.x} ${e.props.larder.y})">
      ${(Rt[e.props.larder.kind]??Rt.bush)(n)}
    </g>
  </g>

  <g class="hab-actors"></g>

  <g class="hab-front">${g(f)}</g>

  ${y?`<g class="hab-motes">${Er(n,e.seed,o?8:14)}</g>`:""}

  <rect class="hab-veil" x="0" y="0" width="${$.w}" height="${$.h}" fill="${s.veil}" />
  <rect class="hab-dusk" x="0" y="0" width="${$.w}" height="${$.h}" fill="#1b1930" />
</svg>`}const Ga=(e,t)=>(je[e]??je.berry)(t),Ua=e=>Vn(e),Ht=5,gs=330,ys=.22,ms=.54,ks=.82,zt=.62,Bt=26;function qa(e,t,r){if(e.resting)return{...e,bounce:0};const o=Ir(t,0,.05),n=r.floor??b,s=r.ceiling??8,a=(r.x0??R.x0)+Ht,l=(r.x1??R.x1)-Ht;let i=e.vx*(1-ys*o),f=e.vy+gs*o,g=e.x+i*o,y=e.y+f*o,u=0;y>=n?(y=n,f>Bt?(u=f,f=-f*ms,i*=ks):(f=0,i*=.7)):y<=s&&(y=s,f=Math.abs(f)*.4),g<=a?(g=a,i=Math.abs(i)*zt,u=Math.max(u,Math.abs(e.vx)*.6)):g>=l&&(g=l,i=-Math.abs(i)*zt,u=Math.max(u,Math.abs(e.vx)*.6));const h=y>=n&&Math.abs(f)<=Bt&&Math.abs(i)<2;return{...e,x:g,y,vx:h?0:i,vy:h?0:f,spin:(e.spin??0)+i*o*7,resting:h,bounce:u}}function Ka(e,t=R,r=Math.random){const o=t.x1-t.x0,n=(e-t.x0)/o,s=n<.28?1:n>.72||r()<.5?-1:1,a=(.14+r()*.34)*o;return c(Ir(e+s*a,t.x0,t.x1))}const $s=[34,100,166],Ce=4,bs=e=>Rr("mochi","meadow",e);function xs(e){return nt(e).slice(0,rt).map((t,r)=>({id:t,x:$s[r],y:b}))}function Qa(e,{hour24:t=12,uid:r="yard",label:o=""}={}){const n=Ar(t),s=bs(n),a=A[n]??A.noon,l=Le(Ce+3),i=xs(e);return`
<svg class="yard" viewBox="0 0 ${$.w} ${$.h}" preserveAspectRatio="xMidYMax slice"
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
    <rect x="0" y="0" width="${$.w}" height="${$.h}" fill="url(#${r}-sky)" />
    ${Tr(n,t,Ce,r)}
  </g>

  <g class="yard-far">${Re.hills(s)}</g>

  <g class="yard-ground">
    ${Dr(s,r)}
    ${Fe.grass(s,l)}
  </g>

  <g class="yard-pieces">
    ${i.map(f=>`<g class="yard-piece" transform="translate(${f.x} ${f.y})">${(ze[f.id]??ze.signpost)(s)}</g>`).join("")}
  </g>

  ${a.night?`<g class="yard-motes">${Er(s,Ce,10)}</g>`:""}

  <rect class="yard-veil" x="0" y="0" width="${$.w}" height="${$.h}" fill="${a.veil}" />
</svg>`}export{Dn as $,Ma as A,Ht as B,Sa as C,x as D,va as E,Ca as F,Aa as G,Ko as H,Qo as I,Us as J,Hs as K,ya as L,qs as M,na as N,ce as O,Ta as P,oa as Q,C as R,w as S,D as T,T as U,da as V,b as W,ca as X,Hn as Y,En as Z,fa as _,Ba as a,Ts as a$,ee as a0,ia as a1,ma as a2,la as a3,mr as a4,kr as a5,Ro as a6,Fs as a7,Co as a8,H as a9,He as aA,ze as aB,Pe as aC,js as aD,Ps as aE,Ls as aF,Ms as aG,De as aH,or as aI,O as aJ,As as aK,Cs as aL,vs as aM,pa as aN,F as aO,$e as aP,Se as aQ,Ss as aR,qr as aS,yn as aT,Be as aU,Ha as aV,ft as aW,Qr as aX,Vr as aY,Kr as aZ,qt as a_,po as aa,M as ab,Rs as ac,Mr as ad,wa as ae,Eo as af,ha as ag,Zn as ah,ua as ai,zs as aj,ka as ak,jn as al,Jr as am,ga as an,Qa as ao,aa as ap,sa as aq,Vt as ar,_s as as,z as at,me as au,Qt as av,ir as aw,ye as ax,Ie as ay,Is as az,Ua as b,L as b$,Xr as b0,Ds as b1,_o as b2,gt as b3,Oo as b4,Io as b5,Ns as b6,We as b7,Wo as b8,Vo as b9,Dt as bA,Ee as bB,Ze as bC,lr as bD,gn as bE,Tt as bF,Ct as bG,An as bH,Lr as bI,_e as bJ,vr as bK,Wn as bL,Gr as bM,ns as bN,Na as bO,Da as bP,W as bQ,R as bR,ja as bS,Pt as bT,at as bU,is as bV,Ea as bW,Pa as bX,Ar as bY,Cr as bZ,d as b_,Xo as ba,Un as bb,st as bc,X as bd,Vs as be,le as bf,xn as bg,Zs as bh,no as bi,Te as bj,mt as bk,kt as bl,$t as bm,bt as bn,xt as bo,ea as bp,bn as bq,mn as br,rn as bs,sn as bt,$n as bu,nn as bv,an as bw,ln as bx,ar as by,cn as bz,Ir as c,Rn as c$,Rr as c0,Le as c1,Za as c2,Je as c3,et as c4,ge as c5,Ia as c6,Oa as c7,Fa as c8,tt as c9,wn as cA,Po as cB,Ho as cC,er as cD,Jt as cE,zo as cF,jo as cG,ut as cH,Zo as cI,Xt as cJ,Qe as cK,Yo as cL,Sr as cM,he as cN,$r as cO,br as cP,On as cQ,Zt as cR,xr as cS,Ae as cT,_a as cU,Ra as cV,Jn as cW,rt as cX,$ as cY,In as cZ,_n as c_,Cn as ca,ot as cb,Or as cc,Ft as cd,Tn as ce,ls as cf,nt as cg,$s as ch,xs as ci,bs as cj,Nn as ck,Pn as cl,N as cm,Do as cn,ht as co,_ as cp,Gn as cq,Wt as cr,Kt as cs,Ge as ct,go as cu,fo as cv,Ue as cw,Xe as cx,pn as cy,Mn as cz,Js as d,$o as d0,ke as d1,U as d2,ho as d3,ra as e,xa as f,Os as g,za as h,en as i,Ks as j,Gs as k,$a as l,Ws as m,Ka as n,Ys as o,ta as p,Qs as q,Bs as r,qa as s,Ga as t,Xs as u,ba as v,E as w,Es as x,La as y,qn as z};
