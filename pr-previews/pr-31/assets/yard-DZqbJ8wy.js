const ir=[1,2,3,4,5,6,7,8,9,10,11,12],re=5,cr=re*6,Z=e=>(e%360+360)%360,I=(e,t)=>(e%t+t)%t,vn=e=>Z(e*6),Cn=(e,t)=>Z(I(e,12)*30+t*.5),fr=(e,t)=>Z(Math.atan2(e,-t)*180/Math.PI);function ce(e,t,r,o){const n=o*Math.PI/180;return{x:e+r*Math.sin(n),y:t-r*Math.cos(n)}}function ze(e,t){const r=Math.abs(Z(e)-Z(t));return r>180?360-r:r}const Dn=e=>I(Math.round(Z(e)/cr)*re,60);function Tn(e,t){const r=I(Math.round((Z(e)-t*.5)/30),12);return r===0?12:r}function En({dx:e,dy:t,radius:r,hourDeg:o,minuteDeg:n}){const s=Math.hypot(e,t)/r;if(s<.18||s>1.15)return null;if(s<.55)return"hour";if(s>.72)return"minute";const l=fr(e,t);return ze(l,o)<=ze(l,n)?"hour":"minute"}const S=(e,t)=>`${e}:${String(t).padStart(2,"0")}`;function pr(e){const[t,r]=String(e).split(":").map(Number);return{h:t,m:r}}function dr(e,t){let r=(t-e)%60;return r>30&&(r-=60),r<-30&&(r+=60),r}function Zn({h:e,m:t},r){const o=dr(t,r),n=t+o;let s=e;return n>=60?s=e%12+1:n<0&&(s=e===1?12:e-1),{h:s,m:r,delta:o}}function hr(e,t){const r=Math.abs(e-t)%60;return r>30?60-r:r}function ur(e,t){const r=Math.abs(I(e,12)-I(t,12))%12;return r>6?12-r:r}function yr(e,t){const r=I(e.h,12)===I(t.h,12),o=e.m===t.m,n=hr(e.m,t.m),s=ur(e.h,t.h);let l;return r&&o?l="correct":o?l="hourOff":r?l="minuteOff":l="both",{verdict:l,correct:l==="correct",nearMiss:l!=="correct"&&n<=re&&s<=1,minuteDelta:n,hourDelta:s}}const wt=.8,_=[{id:0,minutes:[0]},{id:1,minutes:[30]},{id:2,minutes:[15,45]},{id:3,minutes:[5,10,20,25,35,40,50,55]}],oe=_.length-1,Lt=new Map;for(const e of _)for(const t of e.minutes)Lt.set(t,e.id);const Mt=e=>Lt.get(e)??null;function ne(e){const t=_[e];if(!t)return[];const r=[];for(const o of t.minutes)for(const n of ir)r.push({h:n,m:o,id:S(n,o),tier:e});return r}const Se=_.flatMap(e=>ne(e.id));new Map(Se.map(e=>[e.id,e]));function St(e,t){const r=ne(t);return r.length?r.filter(n=>{var s;return((s=e[n.id])==null?void 0:s.phase)==="graduated"}).length/r.length:0}function In(e){let t=0;for(;t<oe&&St(e,t)>=wt;)t+=1;return t}function On(e,t){const r=[];for(let o=0;o<=Math.min(t,oe);o+=1)for(const n of ne(o))e[n.id]||r.push(n);return r}const L="nb",gr=[{id:"nb",label:"Norsk"},{id:"en",label:"English"}],Rn=e=>gr.some(t=>t.id===e),Ge={en:["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"],nb:["","ett","to","tre","fire","fem","seks","sju","åtte","ni","ti","elleve","tolv"]},kr={0:"o'clock",5:"five past",10:"ten past",15:"quarter past",20:"twenty past",25:"twenty-five past",30:"half past",35:"twenty-five to",40:"twenty to",45:"quarter to",50:"ten to",55:"five to"},$r={0:{text:"klokka {h}",next:!1},5:{text:"fem over {h}",next:!1},10:{text:"ti over {h}",next:!1},15:{text:"kvart over {h}",next:!1},20:{text:"ti på halv {h}",next:!0},25:{text:"fem på halv {h}",next:!0},30:{text:"halv {h}",next:!0},35:{text:"fem over halv {h}",next:!0},40:{text:"ti over halv {h}",next:!0},45:{text:"kvart på {h}",next:!0},50:{text:"ti på {h}",next:!0},55:{text:"fem på {h}",next:!0}},mr=e=>(e-1+12)%12+1,de=(e,t)=>(Ge[e]??Ge[L])[mr(t)];function br(e,t,r){if(e==="en"){const n=kr[r],s=de("en",r>30?t+1:t);return r===0?`${s} ${n}`:`${n} ${s}`}const o=$r[r];return o.text.replace("{h}",de("nb",o.next?t+1:t))}const J={en:["Biscuit","Marmalade","Waffle","Pumpkin","Sprinkle","Doodle","Clover","Peanut","Nugget","Custard","Pickle","Bumble","Dandelion","Truffle","Cinnamon","Gumdrop","Blossom","Turnip","Jellybean","Muffin","Toast","Pancake","Wobble","Pudding","Cricket","Sundae","Butterbean","Hopscotch","Marshmallow","Tangerine","Pinecone","Bramble","Mittens","Popcorn","Whisker","Fern","Gingersnap","Nutmeg","Poppy","Sesame","Twiglet","Apricot","Cobweb","Domino","Fizzle","Hazelnut","Pebble","Snowdrop"],nb:["Vaffel","Kanelbolle","Blåbær","Pannekake","Smultring","Kakao","Marsipan","Karamell","Lakris","Rosin","Sukkerbit","Krumkake","Tyttebær","Multe","Kløver","Løvetann","Kongle","Furunål","Mose","Dugg","Snøfnugg","Måneskinn","Solstråle","Stjerneskudd","Regnbue","Tordensky","Bølge","Rullestein","Perle","Knappen","Tøffel","Votten","Lua","Dott","Lubben","Tuss","Prikken","Flekken","Bamse","Nøtta","Fnugg","Kvist","Bringebær","Solsikke","Tjukken","Sprett","Trilla","Nusse"]},H={en:{back:"← Back to games","nav.scenes":"Scenes","tab.play":"Feed","tab.zoo":"Zoo","sound.on":"Sound on","sound.off":"Sound off","settings.open":"Settings","clock.aria":"Drag the clock hands to set the time","prompt.booting":"Waking the zoo…","prompt.egg":"A chilly egg! It hatches at…","prompt.egg1":"The egg is stirring! It hatches at…","prompt.egg2":"It is cracking open! It hatches at…","prompt.forgot":"{name} forgot their snack time. It is…","prompt.hungry":"{name} is hungry! They eat at…","prompt.snack":"{name} fancies a snack at…","button.warm":"Warm the egg!","button.feed":"Feed {name}!","cheer.1":"Yes!","cheer.2":"Perfect!","cheer.3":"Spot on!","cheer.4":"Nailed it!","cheer.5":"That is it!","cheer.streak":"{cheer} {n} in a row!","crack.1":"A crack appeared!","crack.2":"Another crack — it is nearly out!","hatch.stir":"Something is moving in there…","hatch.now":"It hatched!","hatch.hello":"{name} says hello!","evolve.now":"Something is happening…","evolve.done":"{name} is now {label}!","form.2":"the Bold","form.3":"the Grand","teach.nearMiss":"So close! ","teach.hourExact":"At {hour} o’clock the short fat hand points straight at the {hour}.","teach.hourPastHalf":"The short fat hand is past halfway from the {hour} to the {next} — but it is still the {hour}.","teach.hourJustLeft":"Look at the short fat hand: at {time} it has just left the {hour}.","teach.minuteOClock":"At {hour} o’clock the long hand points straight up.","teach.minuteCountOne":"Count round in fives: {jumps} jump past the top is {minutes} minutes.","teach.minuteCountMany":"Count round in fives: {jumps} jumps past the top is {minutes} minutes.","teach.both":"Here is where both hands go for {time}.","nap.title":"Pets are sleeping!","nap.copy":"That was a good session. Everyone is having a nap — you can still visit them in the zoo.","nap.countdown":"Waking up in","nap.wake":"Wake the pets","nap.visit":"Visit the zoo","nap.sleeping":"sleeping","zoo.empty":"No pets yet! Feed the clock a few times and your first egg will hatch.","zoo.egg":"{species} egg","zoo.eggTitle":"A chilly egg","zoo.eggTitleCracks":"A cracking egg, {n} of {of} cracks","zoo.rename":"What is this pet called?","habitat.back":"Back to the zoo","habitat.rename":"Give this pet a new name","habitat.aria":"{name}'s home","habitat.eggAria":"The home waiting for a {species} egg","habitat.hint":"Throw the ball, share a snack, or stroke {name}.","habitat.eggHint":"This home is waiting. Feed the clock, and the egg will hatch.","habitat.sleeping":"{name} is fast asleep. Sshh.","unlock.title":"New pets have arrived!","unlock.copy":"{tier} — {blurb}","unlock.close":"Let’s go","howto.summary":"How to play","howto.1":"A pet tells you when it eats. Drag the clock hands to that time.","howto.2":"The <b>long thin hand</b> is the minutes — it jumps five minutes at a time. The <b>short fat hand</b> is the hour.","howto.3":"Watch the short hand creep along as you move the long one. At quarter past four it has already left the 4 — that is how a real clock works.","howto.4":"Get one right four times and its egg cracks open into a pet of your own.","howto.5":"After a few minutes the pets get sleepy and the game stops. You can still wander the zoo while they nap.","howto.6":"Grown-ups: press and hold the title for progress.","grownups.title":"Progress","grownups.answered":"Times answered","grownups.accuracy":"Correct first try","grownups.streak":"Best streak","grownups.hatched":"Pets hatched","grownups.days":"Days played","grownups.fine":"Times are scheduled with a spaced-repetition algorithm: each one comes back just as it is about to be forgotten. Everything is stored in this browser only.","grownups.close":"Close","grownups.reset":"Start over","grownups.resetConfirm":"Start over? Every pet and all progress will be lost.","settings.title":"Settings","settings.language":"Language","settings.playTime":"Play time","settings.playTimeValue":"{n} minutes","settings.playTimeHelp":"How long a session lasts before the pets need a nap. Short sessions work best — three to five minutes.","settings.digital":"Show digital time","settings.digitalHelp":"Off by default. With it off the pets say their feeding time in words only, so the clock face is the only place to read it.","settings.transfer":"Move to another device","settings.transferHelp":"Save the zoo as a file, or copy it as a code to send in a message. Opening either one on another device brings every pet across. The zoo already on that device is replaced.","settings.done":"Done","transfer.exportFile":"Save file","transfer.copyCode":"Copy code","transfer.importFile":"Open file…","transfer.pasteCode":"Paste code","transfer.pastePrompt":"Paste the code from the other device:","transfer.confirm":"Replace this device’s zoo with the one you are bringing in? The pets here now will be lost.","transfer.saved":"Saved {file}.","transfer.copied":"Code copied — paste it on the other device.","transfer.copyFailed":"Could not reach the clipboard, so the code was saved as a file instead.","transfer.imported":"Brought in {n} pets.","transfer.badFile":"That does not look like a Pet Zoo save.","transfer.badApp":"That save is from a different game.","transfer.badVersion":"That save comes from a newer Pet Zoo than this one.","coins.name":"gold coins","coins.balance":"{n} gold coins","coins.earned":"+{n}","shop.open":"Go to the shop","shop.title":"The zoo shop","shop.intro":"Something nice for one of your pets.","shop.forPet":"Shopping for {name}","shop.pickPet":"Whose home is it for?","shop.empty":"No pets yet! Hatch your first egg and the shop will open.","shop.locked":"Locked","shop.lockedHelp":"Learn more times to open this one.","shop.owned":"In {name}’s home","shop.full":"{name}’s home is full. Sell something to make room.","shop.tooDear":"Not enough coins yet.","shop.buy":"Buy it!","shop.cancel":"Not yet","shop.confirm":"{item} — put it in {name}’s home for {price} gold coins?","shop.bought":"{name} loves it!","shop.sell":"Sell it back","shop.sellConfirm":"{item} — sell it back? You get all {price} gold coins again.","shop.sold":"Sold — {price} gold coins back.","shop.close":"Done","shop.tabHome":"The pets’ homes","shop.tabZoo":"The whole zoo","shop.ownedZoo":"In the zoo","shop.fullBackdrop":"There is already something far away at {name}’s. Sell it to make room.","shop.fullZoo":"The zoo yard is full. Sell something to make room.","shop.confirmZoo":"{item} — put it in the zoo for {price} gold coins?","shop.boughtZoo":"It looks lovely out there!","yard.label":"The zoo yard","shop.flowerbed":"Flower bed","shop.lantern":"Lantern","shop.house":"Little house","shop.swing":"Swing","shop.pond":"Pond","shop.hammock":"Hammock","shop.arch":"Flower arch","shop.windmill":"Windmill","shop.stump":"Tree stump","shop.sandpit":"Sandpit","shop.beehive":"Beehive","shop.feeder":"Bird feeder","shop.farGrove":"Faraway trees","shop.farMill":"Faraway mill","shop.farArch":"Faraway gateway","shop.farTower":"Faraway tower","shop.signpost":"Signpost","shop.topiary":"Trimmed tree","shop.bunting":"Bunting","shop.pathLamps":"Path lamps","shop.fountain":"Fountain","shop.statue":"Statue","tier.0.name":"O’clock","tier.0.blurb":"The big hand points straight up.","tier.1.name":"Half past","tier.1.blurb":"The big hand points straight down.","tier.2.name":"Quarter past and quarter to","tier.2.blurb":"The big hand points sideways.","tier.3.name":"Every five minutes","tier.3.blurb":"Count around the face in fives."},nb:{back:"← Tilbake til spillene","nav.scenes":"Visninger","tab.play":"Mate","tab.zoo":"Dyrehagen","sound.on":"Lyd på","sound.off":"Lyd av","settings.open":"Innstillinger","clock.aria":"Dra viserne for å stille klokka","prompt.booting":"Vekker dyrehagen…","prompt.egg":"Et kaldt egg! Det klekkes…","prompt.egg1":"Egget rører på seg! Det klekkes…","prompt.egg2":"Det slår sprekker! Det klekkes…","prompt.forgot":"{name} har glemt måltidet sitt. Klokka er…","prompt.hungry":"{name} er sulten! Spiser…","prompt.snack":"{name} vil gjerne ha en matbit…","button.warm":"Varm egget!","button.feed":"Mat {name}!","cheer.1":"Ja!","cheer.2":"Perfekt!","cheer.3":"Helt riktig!","cheer.4":"Sånn ja!","cheer.5":"Der satt den!","cheer.streak":"{cheer} {n} på rad!","crack.1":"Det kom en sprekk!","crack.2":"Enda en sprekk — det er nesten ute!","hatch.stir":"Noe rører seg der inne …","hatch.now":"Det klekket!","hatch.hello":"{name} sier hei!","evolve.now":"Noe skjer …","evolve.done":"{name} er nå {label}!","form.2":"den modige","form.3":"den store","teach.nearMiss":"Nesten! ","teach.hourExact":"Når klokka er {hour}, peker den korte tjukke viseren rett på {hourNum}-tallet.","teach.hourPastHalf":"Den korte tjukke viseren er mer enn halvveis fra {hourNum} til {next} — men timen er fortsatt {hourNum}.","teach.hourJustLeft":"Se på den korte tjukke viseren: {time} har den akkurat forlatt {hourNum}-tallet.","teach.minuteOClock":"Når klokka er {hour}, peker den lange viseren rett opp.","teach.minuteCountOne":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.minuteCountMany":"Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.","teach.both":"Her skal begge viserne stå når klokka er {time}.","nap.title":"Dyrene sover!","nap.copy":"Det var en god økt. Alle tar seg en blund — du kan fortsatt besøke dem i dyrehagen.","nap.countdown":"Våkner om","nap.wake":"Vekk dyrene","nap.visit":"Besøk dyrehagen","nap.sleeping":"sover","zoo.empty":"Ingen dyr ennå! Still klokka riktig noen ganger, så klekkes det første egget ditt.","zoo.egg":"{species}-egg","zoo.eggTitle":"Et kaldt egg","zoo.eggTitleCracks":"Et egg som slår sprekker, {n} av {of}","zoo.rename":"Hva heter dette dyret?","habitat.back":"Tilbake til dyrehagen","habitat.rename":"Gi dyret et nytt navn","habitat.aria":"Hjemmet til {name}","habitat.eggAria":"Hjemmet som venter på et {species}-egg","habitat.hint":"Kast ballen, gi en godbit, eller klapp {name}.","habitat.eggHint":"Dette hjemmet venter. Still klokka riktig, så klekkes egget.","habitat.sleeping":"{name} sover godt. Hysj.","unlock.title":"Nye dyr har kommet!","unlock.copy":"{tier} — {blurb}","unlock.close":"Kom igjen!","howto.summary":"Slik spiller du","howto.1":"Et dyr sier når det spiser. Dra viserne til det klokkeslettet.","howto.2":"Den <b>lange tynne viseren</b> er minuttene — den hopper fem minutter om gangen. Den <b>korte tjukke viseren</b> er timen.","howto.3":"Se hvordan den korte viseren sniker seg framover når du flytter den lange. Kvart over fire har den allerede forlatt 4-tallet — sånn funker en ekte klokke.","howto.4":"Klarer du samme klokkeslett fire ganger, sprekker egget til et dyr som blir ditt.","howto.5":"Etter noen minutter blir dyrene trøtte, og spillet stopper. Du kan fortsatt gå rundt i dyrehagen mens de sover.","howto.6":"Voksne: hold inne tittelen for å se framgang.","grownups.title":"Framgang","grownups.answered":"Klokkeslett svart på","grownups.accuracy":"Riktig på første forsøk","grownups.streak":"Beste rekke","grownups.hatched":"Dyr klekket","grownups.days":"Dager spilt","grownups.fine":"Klokkeslettene planlegges med en gjentakelsesalgoritme: hvert av dem kommer tilbake akkurat når det holder på å bli glemt. Alt lagres bare i denne nettleseren.","grownups.close":"Lukk","grownups.reset":"Start på nytt","grownups.resetConfirm":"Starte på nytt? Alle dyr og all framgang forsvinner.","settings.title":"Innstillinger","settings.language":"Språk","settings.playTime":"Spilletid","settings.playTimeValue":"{n} minutter","settings.playTimeHelp":"Hvor lenge en økt varer før dyrene må sove. Korte økter funker best — tre til fem minutter.","settings.digital":"Vis digital tid","settings.digitalHelp":"Av til vanlig. Når den er av, sier dyrene måltidet sitt bare med ord, så urskiva er eneste stedet å lese det.","settings.transfer":"Flytt til en annen enhet","settings.transferHelp":"Lagre dyrehagen som en fil, eller kopier den som en kode du kan sende i en melding. Åpner du en av delene på en annen enhet, blir alle dyrene med. Dyrehagen som allerede er der, blir erstattet.","settings.done":"Ferdig","transfer.exportFile":"Lagre fil","transfer.copyCode":"Kopier kode","transfer.importFile":"Åpne fil …","transfer.pasteCode":"Lim inn kode","transfer.pastePrompt":"Lim inn koden fra den andre enheten:","transfer.confirm":"Erstatte dyrehagen på denne enheten med den du henter inn? Dyrene som er her nå, forsvinner.","transfer.saved":"Lagret {file}.","transfer.copied":"Koden er kopiert — lim den inn på den andre enheten.","transfer.copyFailed":"Fikk ikke tak i utklippstavla, så koden ble lagret som fil i stedet.","transfer.imported":"Hentet inn {n} dyr.","transfer.badFile":"Dette ser ikke ut som en lagret dyrehage.","transfer.badApp":"Den lagringa er fra et annet spill.","transfer.badVersion":"Den lagringa er fra en nyere utgave av Dyrehagen enn denne.","coins.name":"gullmynter","coins.balance":"{n} gullmynter","coins.earned":"+{n}","shop.open":"Gå til butikken","shop.title":"Dyrehagebutikken","shop.intro":"Noe fint til ett av dyra dine.","shop.forPet":"Handler til {name}","shop.pickPet":"Hvem skal det være til?","shop.empty":"Ingen dyr ennå! Klekk det første egget, så åpner butikken.","shop.locked":"Låst","shop.lockedHelp":"Lær flere klokkeslett for å åpne denne.","shop.owned":"Hjemme hos {name}","shop.full":"Det er fullt hos {name}. Selg noe for å få plass.","shop.tooDear":"Ikke nok mynter ennå.","shop.buy":"Kjøp!","shop.cancel":"Ikke nå","shop.confirm":"{item} — sette den hjemme hos {name} for {price} gullmynter?","shop.bought":"{name} elsker den!","shop.sell":"Selg tilbake","shop.sellConfirm":"{item} — selge den tilbake? Du får alle {price} gullmyntene igjen.","shop.sold":"Solgt — {price} gullmynter tilbake.","shop.close":"Ferdig","shop.tabHome":"Hjemme hos dyra","shop.tabZoo":"Hele dyrehagen","shop.ownedZoo":"I dyrehagen","shop.fullBackdrop":"Det står noe langt borte hos {name} fra før. Selg det for å få plass.","shop.fullZoo":"Plassen ute i dyrehagen er full. Selg noe for å få plass.","shop.confirmZoo":"{item} — sette den ut i dyrehagen for {price} gullmynter?","shop.boughtZoo":"Så fint det ble ute!","yard.label":"Dyrehageplassen","shop.flowerbed":"Blomsterbed","shop.lantern":"Lykt","shop.house":"Lite hus","shop.swing":"Huske","shop.pond":"Dam","shop.hammock":"Hengekøye","shop.arch":"Blomsterbue","shop.windmill":"Vindmølle","shop.stump":"Trestubbe","shop.sandpit":"Sandkasse","shop.beehive":"Bikube","shop.feeder":"Fuglemater","shop.farGrove":"Trær langt borte","shop.farMill":"Mølle langt borte","shop.farArch":"Port langt borte","shop.farTower":"Tårn langt borte","shop.signpost":"Skilt","shop.topiary":"Formklippet tre","shop.bunting":"Vimpler","shop.pathLamps":"Lykter langs stien","shop.fountain":"Fontene","shop.statue":"Statue","tier.0.name":"Hele timer","tier.0.blurb":"Den lange viseren peker rett opp.","tier.1.name":"Halve timer","tier.1.blurb":"Den lange viseren peker rett ned.","tier.2.name":"Kvart over og kvart på","tier.2.blurb":"Den lange viseren peker til siden.","tier.3.name":"Hvert femte minutt","tier.3.blurb":"Tell rundt skiva i femmere."}},_n=e=>Object.keys(H[e]??{}),xr=(e,t)=>t?String(e).replace(/\{(\w+)\}/g,(r,o)=>Object.prototype.hasOwnProperty.call(t,o)?String(t[o]):r):String(e);function Fn(e){const t=H[e]??H[L],r=H[L],o=(n,s)=>xr(t[n]??r[n]??n,s);return o.lang=H[e]?e:L,o.spoken=(n,s)=>br(o.lang,n,s),o.hourWord=n=>de(o.lang,n),o.names=J[o.lang]??J[L],o}const Ae="clock",wr="",Lr=/^([1-9]|1[0-2]):[0-5][0-9]$/,Mr=e=>typeof e=="string"&&Lr.test(e),Sr=e=>pr(e),Ar=({h:e,m:t})=>S(e,t),vr=({m:e})=>Mt(e)??0,Cr=()=>0;function Dr(e,t){const{h:r,m:o}=t??{};return!Number.isInteger(r)||r<1||r>12||!Number.isInteger(o)||o<0||o>59||o%re!==0?!1:e===S(r,o)}const Tr=1,Er=Object.freeze(Object.defineProperty({__proto__:null,ALL_ITEMS:Se,LAST_TIER:oe,TIERS:_,answerDigits:Cr,grade:yr,id:Ae,idOf:Ar,owns:Mr,paceScale:Tr,parse:Sr,prefix:wr,tierItems:ne,tierOf:vr,valid:Dr},Symbol.toStringTag,{value:"Module"})),v={[Ae]:Er},O=Object.keys(v),N=Ae,Zr=Object.fromEntries(O.map(e=>[e,v[e].LAST_TIER]));function At(e){for(const t of Object.values(v))if(t.owns(e))return t;return null}const Ir=e=>{var t;return((t=At(e))==null?void 0:t.id)??null},Nn=()=>O.reduce((e,t)=>e+v[t].ALL_ITEMS.length,0);function F(e){const t={};for(const r of O)t[r]=0;if(e!=null&&e.tiers&&typeof e.tiers=="object"){for(const r of O){const o=e.tiers[r];Number.isFinite(o)&&(t[r]=Math.max(0,Math.floor(o)))}return t}return Number.isFinite(e==null?void 0:e.tier)&&(t[N]=Math.max(0,Math.floor(e.tier))),t}function Or(e,t,r){const o=v[t];if(!o)return 0;const n=o.tierItems(r);return n.length?n.filter(l=>{var a;return((a=e==null?void 0:e[l.id])==null?void 0:a.phase)==="graduated"}).length/n.length:0}function Rr(e,t){const r=v[t];if(!r)return 0;let o=0;for(;o<r.LAST_TIER&&Or(e,t,o)>=wt;)o+=1;return o}function Be(e,t){const r=e??{},o=typeof t=="object"&&t!==null?t:{[N]:t},n=O.map(s=>{const l=v[s],a=Math.min(Number.isFinite(o[s])?o[s]:0,l.LAST_TIER),i=[];for(let f=0;f<=a;f+=1)for(const g of l.tierItems(f))r[g.id]||i.push({...g,subject:s});return i});return _r(n)}function _r(e){const t=[],r=Math.max(0,...e.map(o=>o.length));for(let o=0;o<r;o+=1)for(const n of e)o<n.length&&t.push(n[o]);return t}function Fr(e){const t=F(e),r={},o=[];for(const n of O){const s=Math.max(t[n],Rr((e==null?void 0:e.items)??{},n));r[n]=s,s>t[n]&&o.push(n)}return{tiers:r,unlocked:o}}const Ue=[1,3,8],Nr=2,jr=3,Pr=7,Hr=4,zr=2,vt=e=>Math.min(Math.max(e-1,0),zr),he=[1,3,5],ue=he.length;function X(e){let t=0;for(let r=0;r<he.length;r+=1)e>=he[r]&&(t=r+1);return t}const Gr=2.5,Ct=1.3,Dt=2.8,Br=.2,Ur=60,qe=864e5,Tt=(e,t,r)=>Math.min(Math.max(e,t),r);function jn({subject:e=N,tier:t,species:r,reviewClock:o=0,id:n,...s}){return{subject:e,...s,tier:t??Mt(s.m)??0,species:r,name:null,phase:"learning",step:0,dueStep:o+1,ease:Gr,intervalDays:0,dueAt:0,reps:0,feeds:0,lapses:0,correctStreak:0,cracks:0,hatchedAt:null,seen:0,lastMs:0}}function qr({correct:e,ms:t=0,reversals:r=0}){return e?t>2e4||r>=2?3:t>8e3||r>=1?4:5:0}const Qr=(e,t)=>Tt(e+(.1-(5-t)*(.08+(5-t)*.02)),Ct,Dt),Kr=(e,t,r)=>e<=1?1:e===2?3:Math.min(Math.round(t*r),Ur);function Pn(e,{correct:t,ms:r=0,reversals:o=0,reviewClock:n,now:s}){const l=qr({correct:t,ms:r,reversals:o}),a={...e,seen:e.seen+1,lastMs:r},i={quality:l,graduated:!1,hatched:!1,lapsed:!1,evolved:0,cracked:0};if(t){if(a.correctStreak=e.correctStreak+1,e.hatchedAt===null){const u=Math.max(e.cracks??0,vt(a.correctStreak));u>(e.cracks??0)&&(i.cracked=u),a.cracks=u}if(e.phase==="learning"){const u=e.hatchedAt===null?Hr:jr;a.correctStreak>=u?(a.phase="graduated",a.reps=1,a.feeds=e.feeds+1,a.intervalDays=1,a.dueAt=s+qe,a.dueStep=null,i.graduated=!0,a.hatchedAt===null&&(a.hatchedAt=s,i.hatched=!0)):(a.step=Math.min(e.step+1,Ue.length-1),a.dueStep=n+Ue[a.step])}else a.ease=Qr(e.ease,l),a.reps=e.reps+1,a.feeds=e.feeds+1,a.intervalDays=Kr(a.reps,e.intervalDays,a.ease),a.dueAt=s+a.intervalDays*qe}else a.correctStreak=0,a.step=0,a.dueStep=n+Nr,e.phase==="graduated"&&(a.phase="learning",a.ease=Tt(e.ease-Br,Ct,Dt),a.lapses=e.lapses+1,a.dueAt=0,a.intervalDays=0,a.reps=0,i.lapsed=!0);const f=X(e.feeds),g=X(a.feeds);return f>=1&&g>f&&(i.evolved=g),{item:a,events:i}}const ye=e=>e.phase==="learning",Yr=(e,t)=>e.phase==="graduated"&&e.dueAt<=t,Wr=e=>Object.values(e).filter(ye).length,Vr=e=>{const t=([,r])=>(r.subject??N)===e?1:0;return r=>(o,n)=>t(o)-t(n)||r(o[1])-r(n[1])};function Hn(e,{now:t,exclude:r=null,lastSubject:o=null}={}){var y;const n=e.reviewClock+1,s=F(e),l=Object.entries(e.items).filter(([h])=>h!==r),a=Vr(o),i=l.filter(([,h])=>ye(h)&&h.dueStep!==null&&h.dueStep<=n).sort(a(h=>h.dueStep));if(i.length)return i[0][0];const f=l.filter(([,h])=>Yr(h,t)).sort(a(h=>h.dueAt));if(f.length)return f[0][0];if(Wr(e.items)<Pr){const h=Be(e.items,s)[0];if(h)return h.id}const g=l.filter(([,h])=>h.phase==="graduated").sort(a(h=>h.dueAt));if(g.length)return g[0][0];const u=l.filter(([,h])=>ye(h)).sort(a(h=>h.seen));return u.length?u[0][0]:r&&e.items[r]?r:((y=Be(e.items,Zr)[0])==null?void 0:y.id)??v[N].ALL_ITEMS[0].id}function zn(e,t=N){const{tiers:r}=Fr(e),o=F(e)[t]??0,n=r[t]??0;return{tier:n,unlocked:n>o}}const ve=5,Jr=2,Xr=15,eo=.6,to=5,ro=120*1e3,oo=1800*1e3,no=(e,t,r)=>Math.min(Math.max(e,t),r);function so(e){const t=Math.round(Number(e)),r=no(Number.isFinite(t)?t:ve,Jr,Xr),o=r*60*1e3;return{minutes:r,hardMs:o,softMs:Math.round(o*eo),maxQuestions:r*to}}const Ce=so(ve);function Gn(e){return{startedAt:e,answered:0,correct:0,napUntil:0}}const B=(e,t)=>Math.max(0,t-((e==null?void 0:e.startedAt)??t));function Bn(e,{now:t,correct:r,limits:o=Ce}){return e.answered>=o.maxQuestions?"count":B(e,t)>=o.hardMs?"hard":r&&B(e,t)>=o.softMs?"soft":null}const Un=(e,t,r=Ce)=>B(e,t)>=r.hardMs,qn=e=>!!(e!=null&&e.startedAt),Qn=(e,t)=>B(e,t)>=oo,Kn=(e,t)=>({...e,napUntil:t+ro}),Yn=(e,t)=>!!(e!=null&&e.napUntil)&&t<e.napUntil,Wn=(e,t)=>Math.max(0,((e==null?void 0:e.napUntil)??0)-t),Vn=(e,t,r=Ce)=>Math.min(1,B(e,t)/r.hardMs);function Jn(e){const t=Math.ceil(e/1e3);return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}const d="#43354f",De=[37,63],Qe=52,Te=[-1,1],Ke={round:{shape:'<ellipse cx="50" cy="54" rx="34" ry="32" />',halo:{cx:50,cy:54,rx:34,ry:32}},tall:{shape:'<ellipse cx="50" cy="52" rx="28" ry="34" />',halo:{cx:50,cy:52,rx:28,ry:34}},wide:{shape:'<ellipse cx="50" cy="58" rx="38" ry="28" />',halo:{cx:50,cy:58,rx:38,ry:28}},pear:{shape:'<path d="M50 22 C66 22 72 38 74 54 C76 72 66 86 50 86 C34 86 24 72 26 54 C28 38 34 22 50 22 Z" />',halo:{cx:50,cy:55,rx:25,ry:32}},bean:{shape:'<path d="M53 20 C71 20 81 37 79 56 C77 76 63 86 47 86 C30 86 21 71 21 54 C21 34 35 20 53 20 Z" />',halo:{cx:50,cy:53,rx:29,ry:33}},chunky:{shape:'<path d="M50 20 C74 20 86 34 86 55 C86 76 71 86 50 86 C29 86 14 76 14 55 C14 34 26 20 50 20 Z" />',halo:{cx:50,cy:53,rx:36,ry:33}}},ao=`
  <ellipse cx="35" cy="85" rx="10" ry="6" />
  <ellipse cx="65" cy="85" rx="10" ry="6" />`,Y=(e,t,r=1)=>{const o=t*Math.PI/180;return{x:e.cx+Math.sin(o)*e.rx*r,y:e.cy-Math.cos(o)*e.ry*r}},Ye={smooth:()=>"",fluffy:e=>Array.from({length:18},(t,r)=>{const o=Y(e,r*20,1);return`<circle cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="7" />`}).join(""),spiky:e=>Array.from({length:5},(t,r)=>{const o=-70+r*22,n=Y(e,o-9,.97),s=Y(e,o+9,.97),l=Y(e,o,1.22);return`<path d="M${n.x.toFixed(1)} ${n.y.toFixed(1)} L${l.x.toFixed(1)} ${l.y.toFixed(1)} L${s.x.toFixed(1)} ${s.y.toFixed(1)} Z" />`}).join("")},lo=new Set(["horn","fin","antenna","tuft","leaf","antlers","rabbit"]),We={none:()=>"",roundears:()=>'<circle cx="26" cy="30" r="13" /><circle cx="74" cy="30" r="13" />',ears:()=>`
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
    <path d="M50 30 C50 20 46 14 38 12 C38 22 42 28 50 30 Z" fill="${e}" />`},$="#ffffff",Ve={round:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9.5" ry="10.5" fill="${d}" />
    <circle cx="${e-3.2}" cy="47.5" r="3.6" fill="${$}" />
    <circle cx="${e+3}" cy="56" r="1.8" fill="${$}" opacity="0.85" />`,oval:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="6.8" ry="11.5" fill="${d}" />
    <circle cx="${e-2.4}" cy="47" r="2.9" fill="${$}" />
    <circle cx="${e+2}" cy="56.5" r="1.4" fill="${$}" opacity="0.85" />`,sleepy:e=>`
    <path class="pet-eye" d="M${e-9} 50 Q${e} 45.5 ${e+9} 50 Q${e} 63.5 ${e-9} 50 Z" fill="${d}" />
    <circle cx="${e-3}" cy="53.5" r="3.2" fill="${$}" />
    <circle cx="${e+3.4}" cy="57" r="1.5" fill="${$}" opacity="0.85" />`,sparkle:e=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="9" ry="11" fill="${d}" />
    <path d="M${e-3} 43 Q${e-2} 47 ${e+1.5} 48 Q${e-2} 49 ${e-3} 53
             Q${e-4} 49 ${e-7.5} 48 Q${e-4} 47 ${e-3} 43 Z" fill="${$}" />
    <circle cx="${e+3.5}" cy="56.5" r="1.9" fill="${$}" opacity="0.85" />`,lashed:(e,t)=>`
    <ellipse class="pet-eye" cx="${e}" cy="52" rx="8" ry="10.5" fill="${d}" />
    <circle cx="${e-2.6}" cy="47.5" r="3" fill="${$}" />
    <path d="M${e+t*7} 46 l${t*5.5} -4" stroke="${d}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*8.2} 50 l${t*6} -1.6" stroke="${d}" stroke-width="2.4" stroke-linecap="round" fill="none" />
    <path d="M${e+t*7.6} 54 l${t*5.6} 1.8" stroke="${d}" stroke-width="2.4" stroke-linecap="round" fill="none" />`,beady:e=>`
    <circle class="pet-eye" cx="${e}" cy="52" r="5.6" fill="${d}" />
    <circle cx="${e-1.8}" cy="50" r="2.1" fill="${$}" />`},io=e=>`<g transform="translate(0 ${Qe}) scale(1 0.08) translate(0 ${-Qe})">${e}</g>`+Te.map((t,r)=>{const o=De[r];return`<path d="M${o-9} 52 Q${o} 58.5 ${o+9} 52" fill="none" stroke="${d}"
                  stroke-width="3.2" stroke-linecap="round" />`}).join(""),Je={none:()=>"",thick:(e,t)=>`<path d="M${e+t*8.5} 35.5 L${e-t*8} 35" stroke="${d}" stroke-width="4" stroke-linecap="round" fill="none" />`,arched:e=>`<path d="M${e-8.5} 37.5 Q${e} 30.5 ${e+8.5} 37.5" stroke="${d}" stroke-width="3.2" stroke-linecap="round" fill="none" />`,worried:(e,t)=>`<path d="M${e+t*8.5} 38.5 L${e-t*8.5} 33.5" stroke="${d}" stroke-width="3.4" stroke-linecap="round" fill="none" />`,bushy:e=>`<path d="M${e-9} 36.5 Q${e} 29.5 ${e+9} 36.5" stroke="${d}" stroke-width="5.6" stroke-linecap="round" fill="none" />`},Xe={happy:{rot:0,dy:-2.5},content:{rot:0,dy:0},hungry:{rot:-2,dy:-3.5},droopy:{rot:-9,dy:1.5},sleep:{rot:-4,dy:1}},et={happy:`<path d="M41 66 C45 75 55 75 59 66" fill="none" stroke="${d}" stroke-width="3.2" stroke-linecap="round" />`,content:`<path d="M44 67 C47 72 53 72 56 67" fill="none" stroke="${d}" stroke-width="3.2" stroke-linecap="round" />`,hungry:`<ellipse cx="50" cy="69" rx="7" ry="8" fill="${d}" />
           <ellipse cx="50" cy="73" rx="4.5" ry="3.5" fill="#ff9ec0" />`,droopy:`<path d="M43 71 C46 65 54 65 57 71" fill="none" stroke="${d}" stroke-width="3.2" stroke-linecap="round" />`,sleep:`<path d="M44 68 C47 73 53 73 56 68" fill="none" stroke="${d}" stroke-width="3.2" stroke-linecap="round" />`},k=e=>({back:"",front:e}),z=(e,t)=>({back:e,front:t}),tt=(e,t,r)=>Array.from({length:10},(o,n)=>{const s=(n*36-90)*Math.PI/180,l=n%2?r*.45:r;return`${(e+Math.cos(s)*l).toFixed(1)} ${(t+Math.sin(s)*l).toFixed(1)}`}).join(" L"),co={none:()=>k(""),roundSpecs:e=>k(`
      <g fill="${$}" fill-opacity="0.35" stroke="${d}" stroke-width="2.6">
        <circle cx="37" cy="52" r="12.5" /><circle cx="63" cy="52" r="12.5" />
      </g>
      <path d="M49.5 52 H50.5 M24.5 50 L16 47 M75.5 50 L84 47" stroke="${d}"
            stroke-width="2.6" stroke-linecap="round" fill="none" />`),squareSpecs:e=>k(`
      <g fill="${$}" fill-opacity="0.35" stroke="${d}" stroke-width="3.2">
        <rect x="24.5" y="41" width="25" height="22" rx="6" />
        <rect x="50.5" y="41" width="25" height="22" rx="6" />
      </g>
      <path d="M49.5 51 H50.5 M24 46 L16 44 M76 46 L84 44" stroke="${d}"
            stroke-width="3" stroke-linecap="round" fill="none" />`),goggles:e=>k(`
      <path d="M18 48 H82" stroke="${e.accent}" stroke-width="7" stroke-linecap="round" />
      <g fill="${$}" fill-opacity="0.4" stroke="${d}" stroke-width="3">
        <circle cx="37" cy="52" r="13.5" /><circle cx="63" cy="52" r="13.5" />
      </g>`),monocle:e=>k(`
      <circle cx="63" cy="52" r="13" fill="${$}" fill-opacity="0.35" stroke="${d}" stroke-width="2.8" />
      <path d="M63 65 C63 72 58 75 54 76" stroke="${d}" stroke-width="2" fill="none" stroke-linecap="round" />`),starShades:e=>k(`
      <path d="M${tt(37,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${d}" stroke-width="2.2" stroke-linejoin="round" />
      <path d="M${tt(63,52,14)} Z" fill="${e.accent}" fill-opacity="0.62" stroke="${d}" stroke-width="2.2" stroke-linejoin="round" />`)},fo=new Set(["cowlick","topknot","cap"]),po={none:()=>k(""),fringe:e=>k(`<path d="M23 40 C26 24 40 18 50 18 C62 18 74 25 76 40
                    C70 32 62 34 57 39 C54 31 44 30 39 36 C34 32 27 34 23 40 Z"
                 fill="${e.accent}" />`),cowlick:e=>k(`<path d="M46 22 C44 12 52 6 60 4 C54 10 55 15 60 17 C54 19 49 20 46 26 Z" fill="${e.accent}" />`),topknot:e=>k(`<circle cx="50" cy="14" r="10" fill="${e.accent}" stroke="${d}" stroke-width="2.2" />
           <path d="M42 22 Q50 26 58 22" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round" />`),cap:e=>k(`<g fill="${e.accent}" stroke="${d}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M22 32 C22 16 78 16 78 32 Z" />
             <path d="M78 30 C88 30 90 36 88 38 L74 34 Z" />
           </g>
           <circle cx="50" cy="13" r="4" fill="${d}" />`),bow:e=>k(`<g transform="translate(26 24) rotate(-18)" fill="${e.accent}" stroke="${d}"
              stroke-width="2.2" stroke-linejoin="round">
             <path d="M0 0 C-9 -8 -14 -2 -12 4 C-10 9 -3 7 0 0 Z" />
             <path d="M0 0 C9 -8 14 -2 12 4 C10 9 3 7 0 0 Z" />
             <circle cx="0" cy="0" r="3.6" fill="${d}" stroke="none" />
           </g>`),flower:e=>k(`<g transform="translate(75 28)">
             ${[0,72,144,216,288].map(t=>{const r=t*Math.PI/180;return`<ellipse cx="${(Math.cos(r)*6).toFixed(1)}" cy="${(Math.sin(r)*6).toFixed(1)}" rx="5" ry="4" transform="rotate(${t})" fill="${$}" />`}).join("")}
             <circle cx="0" cy="0" r="4" fill="#ffd166" />
           </g>`)},ho={none:()=>k(""),moustache:()=>k(`<path d="M50 64 C46 59 38 59 35 64 C38 68 46 68 50 64 Z
                    M50 64 C54 59 62 59 65 64 C62 68 54 68 50 64 Z" fill="${d}" />`),beard:()=>k(`<g fill="${d}">
             <circle cx="44" cy="78.5" r="6" /><circle cx="50" cy="81" r="7" /><circle cx="56" cy="78.5" r="6" />
           </g>`),whiskers:()=>k(`<g stroke="${d}" stroke-width="2" stroke-linecap="round" fill="none">
             <path d="M32 64 L18 61 M32 68 L17 68 M32 72 L19 76" />
             <path d="M68 64 L82 61 M68 68 L83 68 M68 72 L81 76" />
           </g>`),teeth:()=>k(`<rect x="45" y="70" width="4.6" height="7" rx="1.6" fill="${$}" stroke="${d}" stroke-width="1.4" />
           <rect x="50.4" y="70" width="4.6" height="7" rx="1.6" fill="${$}" stroke="${d}" stroke-width="1.4" />`),snout:e=>z(`<ellipse cx="50" cy="69" rx="15" ry="11.5" fill="${e.belly}" />
       <ellipse cx="50" cy="61" rx="5.5" ry="4" fill="${d}" />`,"")},Et={none:()=>k(""),freckles:e=>k(`<g fill="${d}" opacity="0.4">
             <circle cx="26" cy="57" r="1.6" /><circle cx="30" cy="60" r="1.6" /><circle cx="25" cy="63" r="1.6" />
             <circle cx="74" cy="57" r="1.6" /><circle cx="70" cy="60" r="1.6" /><circle cx="75" cy="63" r="1.6" />
           </g>`),spots:e=>z(`<g fill="${e.accent}" opacity="0.5">
         <ellipse cx="24" cy="44" rx="7" ry="5.5" /><ellipse cx="76" cy="70" rx="6" ry="5" />
         <ellipse cx="70" cy="34" rx="5" ry="4" />
       </g>`,""),stripes:e=>z(`<g stroke="${e.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55">
         <path d="M20 46 Q26 50 26 58" /><path d="M22 62 Q28 65 29 72" />
         <path d="M80 46 Q74 50 74 58" /><path d="M78 62 Q72 65 71 72" />
       </g>`,""),patch:e=>z(`<ellipse cx="37" cy="52" rx="15" ry="14" fill="${e.accent}" opacity="0.45" />`,""),heart:e=>z(`<path d="M50 76 C44 70 38 68 38 63 C38 59 43 58 46 61 C47 62 49 63 50 65
                C51 63 53 62 54 61 C57 58 62 59 62 63 C62 68 56 70 50 76 Z"
             fill="${e.accent}" opacity="0.6" />`,"")},uo={none:()=>k(""),scarf:e=>k(`<g fill="${e.accent}" stroke="${d}" stroke-width="2.2" stroke-linejoin="round">
             <path d="M28 78 C38 85 62 85 72 78 C70 85 62 89 50 89 C38 89 30 85 28 78 Z" />
             <path d="M66 82 C72 84 74 90 71 94 C67 92 65 87 66 82 Z" />
           </g>`),bandana:e=>k(`<path d="M30 79 C40 85 60 85 70 79 L50 95 Z" fill="${e.accent}" stroke="${d}"
                 stroke-width="2.2" stroke-linejoin="round" />`),bowtie:e=>k(`<g transform="translate(50 82)" fill="${e.accent}" stroke="${d}" stroke-width="2.2"
              stroke-linejoin="round">
             <path d="M0 0 L-12 -6 L-12 6 Z" />
             <path d="M0 0 L12 -6 L12 6 Z" />
             <circle cx="0" cy="0" r="3.4" fill="${d}" stroke="none" />
           </g>`),backpack:e=>k(`<g stroke="${d}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M38 44 C33 56 33 68 37 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <path d="M62 44 C67 56 67 68 63 78" fill="none" stroke="${e.accent}" stroke-width="4.5" />
             <rect x="12" y="64" width="17" height="19" rx="6" fill="${e.accent}" />
             <path d="M12 71 H29" fill="none" />
           </g>`)},rt={x:50,y:86},ot={x:50,y:55},nt={1:{scale:.78,face:1,faceY:0},2:{scale:.9,face:.87,faceY:-5},3:{scale:1.02,face:.74,faceY:-10}},Zt=e=>nt[e]??nt[1],yo=e=>{const{scale:t}=Zt(e);return`translate(${rt.x} ${rt.y}) scale(${t}) translate(-50 -86)`},go=e=>{const{face:t,faceY:r}=Zt(e);return`translate(0 ${r}) translate(${ot.x} ${ot.y}) scale(${t}) translate(-50 -55)`},st={tail:e=>`<path d="M78 76 C92 74 96 62 90 52 C88 60 84 66 74 68 Z" fill="${e.accent}" />`,wings:e=>`
    <path d="M26 46 C8 34 2 48 6 60 C10 72 22 72 30 64 Z" fill="${e.accent}" opacity="0.92" />
    <path d="M74 46 C92 34 98 48 94 60 C90 72 78 72 70 64 Z" fill="${e.accent}" opacity="0.92" />`,mane:e=>Array.from({length:11},(t,r)=>{const o=(-100+r*20)*Math.PI/180;return`<circle cx="${(50+Math.sin(o)*36).toFixed(1)}" cy="${(58-Math.cos(o)*32).toFixed(1)}" r="9" />`}).join(""),crest:e=>Array.from({length:5},(t,r)=>{const o=30+r*10,n=r===2?20:12;return`<path d="M${o} 24 L${o+5} ${24-n-10} L${o+10} 24 Z" fill="${e.accent}"
                    stroke="${d}" stroke-width="1.8" stroke-linejoin="round" />`}).join(""),finback:e=>`<path d="M46 4 C66 14 80 32 84 54 C74 44 62 38 48 38 Z" fill="${e.accent}"
           stroke="${d}" stroke-width="2" stroke-linejoin="round" />`,plume:e=>`
    <path d="M76 74 C94 68 98 50 92 36 C88 48 82 58 72 64 Z" fill="${e.accent}" opacity="0.85" />
    <path d="M74 78 C90 76 96 64 94 52 C88 62 82 70 70 72 Z" fill="${e.accent}" />`},at={bigEars:e=>`
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
    </g>`},x={mochi:{name:"Mochi",body:"round",texture:"smooth",topper:"roundears",eyes:"round",brows:"none",palette:["#ffd9e2","#fff1f4","#ff9ec0"],grows:["mane","tail"],signature:"bigEars"},bloop:{name:"Bloop",body:"bean",texture:"smooth",topper:"antenna",eyes:"sparkle",brows:"none",palette:["#a5d8ff","#e3f2ff","#5fb3f5"],grows:["tail","wings"],signature:"antennaArray"},pip:{name:"Pip",body:"tall",texture:"fluffy",topper:"tuft",eyes:"oval",brows:"arched",palette:["#b2f2d7","#e6fff5","#4fd6a0"],grows:["crest","plume"],signature:"tallTuft"},waddle:{name:"Waddle",body:"wide",texture:"smooth",topper:"none",eyes:"beady",brows:"thick",palette:["#ffe9a8","#fff8dd","#f7b955"],grows:["tail","mane"],signature:"crownSpikes"},puff:{name:"Puff",body:"round",texture:"fluffy",topper:"ears",eyes:"lashed",brows:"arched",palette:["#d9c8ff","#f2ecff","#a884f5"],grows:["mane","wings"],signature:"longEars"},nibbles:{name:"Nibbles",body:"tall",texture:"smooth",topper:"rabbit",eyes:"round",brows:"worried",palette:["#ffd0b0","#fff0e5","#f79a63"],grows:["wings","plume"],signature:"hugeRabbit"},snug:{name:"Snug",body:"wide",texture:"fluffy",topper:"roundears",eyes:"sleepy",brows:"bushy",palette:["#cfe6c0","#eefae6","#8cc472"],grows:["wings","crest"],signature:"ramCurl"},glim:{name:"Glim",body:"pear",texture:"smooth",topper:"horn",eyes:"sparkle",brows:"thick",palette:["#ffc2b8","#fff0ed","#ff8a75"],grows:["finback","wings"],signature:"twinHorns"},noodle:{name:"Noodle",body:"tall",texture:"smooth",topper:"antlers",eyes:"beady",brows:"worried",palette:["#9fe5e0","#e4fbfa","#48c4bc"],grows:["finback","tail"],signature:"bigAntlers"},fizz:{name:"Fizz",body:"chunky",texture:"spiky",topper:"tuft",eyes:"sparkle",brows:"none",palette:["#ffc7ea","#fff0fa","#f778c4"],grows:["crest","plume"],signature:"flameCrest"},cloudlet:{name:"Cloudlet",body:"wide",texture:"fluffy",topper:"fin",eyes:"oval",brows:"none",palette:["#c9dcff","#eef4ff","#7ba2f0"],grows:["finback","crest"],signature:"stormFin"},pebble:{name:"Pebble",body:"round",texture:"smooth",topper:"none",eyes:"sleepy",brows:"thick",palette:["#dcd6e8","#f4f1f9","#a99cc4"],grows:["plume","mane"],signature:"crystal"},sprout:{name:"Sprout",body:"pear",texture:"smooth",topper:"leaf",eyes:"round",brows:"arched",palette:["#c4e8a0","#eefada","#82c44e"],grows:["mane","crest"],signature:"foliageCrown"},bubs:{name:"Bubs",body:"round",texture:"smooth",topper:"floppy",eyes:"lashed",brows:"none",palette:["#f0c2d8","#fdeef5","#d97fae"],grows:["tail","mane"],signature:"longFlop"},zzz:{name:"Zzz",body:"bean",texture:"fluffy",topper:"hound",eyes:"sleepy",brows:"worried",palette:["#bcc4f0","#e8ebfd","#7d8be0"],grows:["plume","tail"],signature:"moonHorns"},tumble:{name:"Tumble",body:"chunky",texture:"spiky",topper:"ram",eyes:"oval",brows:"bushy",palette:["#ffdcb0","#fff4e4","#f0a552"],grows:["crest","finback"],signature:"doubleRam"}},ko=Object.keys(x),lt=[["mochi","bloop","pip","waddle"],["puff","nibbles","snug","glim"],["noodle","fizz","cloudlet","pebble"],["sprout","bubs","zzz","tumble"]];function se(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t}function Q(e,t){var n;const r=((n=_.find(s=>s.minutes.includes(t)))==null?void 0:n.id)??0,o=lt[r]??lt[0];return o[se(S(e,t))%o.length]}const $o=(e,t,r=L)=>{const o=J[r]??J[L],n=Q(e,t),s=se(`n${n}`)%o.length;return o[(s+Ee(e,t))%o.length]},Xn=(e,t=L)=>e.name||$o(e.h,e.m,t),W={eyewear:"none",hair:"none",facialHair:"none",markings:"none",accessory:"none"},mo=(e,t)=>{var r;return(((r=x[e])==null?void 0:r.grows)??[]).slice(0,Math.max(0,Math.min(t,ue)-1))};function ge(e,t=1){const r=e in x?e:"mochi",o=Math.max(1,Math.min(Math.round(t)||1,ue));return{species:r,...x[r],...W,form:o,anatomy:mo(r,o),signature:o>=ue?x[r].signature:null}}const bo=[["eyewear",["roundSpecs","squareSpecs","goggles","monocle","starShades"]],["hair",["fringe","cowlick","topknot","cap","bow","flower"]],["facialHair",["moustache","beard","whiskers","teeth","snout"]],["accessory",["scarf","bandana","bowtie","backpack"]]],it=Object.keys(Et),xo=71;function ct(e){const t=bo.map(([o,n])=>[o,o==="hair"&&e?n.filter(s=>!fo.has(s)):n]),r=[{...W}];for(const[o,n]of t)for(const s of n)r.push({...W,[o]:s});for(let o=0;o<t.length;o+=1)for(let n=o+1;n<t.length;n+=1)for(const s of t[o][1])for(const l of t[n][1])r.push({...W,[t[o][0]]:s,[t[n][0]]:l});return r}const wo={crowned:ct(!0),free:ct(!1)},Lo=e=>{var t;return lo.has((t=x[e])==null?void 0:t.topper)},Mo=e=>wo[Lo(e)?"crowned":"free"],V=new Map;for(const e of[...Se].sort((t,r)=>t.h-r.h||t.m-r.m)){const t=Q(e.h,e.m);V.has(t)||V.set(t,[]),V.get(t).push(e.id)}const It=e=>V.get(e)??[],Ee=(e,t)=>Math.max(0,It(Q(e,t)).indexOf(S(e,t))),es=e=>So(e.h,e.m,X(e.feeds??0)||1);function So(e,t,r=1){const o=Q(e,t),n=Ee(e,t),s=Mo(o);return{...ge(o,r),...s[n*xo%s.length],markings:it[n%it.length]}}const Ao=e=>typeof e=="string"?ge(e):e??ge("mochi");function vo(e,t){const r=Ve[e.eyes]??Ve.round,o=Te.map((n,s)=>r(De[s],n)).join("");return t==="sleep"?io(o):o}function Co(e,t){const r=Je[e.brows]??Je.none,{rot:o,dy:n}=Xe[t]??Xe.content;return Te.map((s,l)=>{const a=De[l],i=r(a,s);return i?`<g transform="translate(0 ${n}) rotate(${s===-1?o:-o} ${a} 37)">${i}</g>`:""}).join("")}function ts(e,{mood:t="content",className:r="",title:o=""}={}){const n=Ao(e),[s,l,a]=n.palette,i={body:s,belly:l,accent:a},f=Ke[n.body]??Ke.round,g=(Ye[n.texture]??Ye.smooth)(f.halo),u=Math.max(1,Math.min(n.form??1,3)),y=n.signature&&at[n.signature]?at[n.signature](i):(We[n.topper]??We.none)(a),h=(n.anatomy??[]).map(P=>st[P]?st[P](i):"").join(""),or=o||n.name||"pet",j=(P,ar,lr)=>(P[ar]??P[lr])(i),nr=j(co,n.eyewear,"none"),sr=j(po,n.hair,"none"),je=j(ho,n.facialHair,"none"),Pe=j(Et,n.markings,"none"),He=j(uo,n.accessory,"none");return`
<svg class="pet form-${u} ${r}" viewBox="0 0 100 100" role="img" aria-label="${or}" focusable="false">
  ${o?`<title>${o}</title>`:""}
  <g class="pet-grow" transform="${yo(u)}">
  <g class="pet-inner">
    <g fill="${n.texture==="spiky"?a:s}">${g}</g>
    <g fill="${a}">${h}</g>
    <g fill="${a}">${y}</g>
    ${He.back}
    <g fill="${a}">${ao}</g>
    <g class="pet-body" fill="${s}">${f.shape}</g>
    <ellipse cx="50" cy="64" rx="21" ry="17" fill="${l}" />
    ${Pe.back}${je.back}
    <g class="pet-face" transform="${go(u)}">
      ${vo(n,t)}
      ${nr.front}
      ${sr.front}
      ${Co(n,t)}
      <ellipse cx="27" cy="62" rx="7" ry="4.2" fill="${a}" opacity="0.55" />
      <ellipse cx="73" cy="62" rx="7" ry="4.2" fill="${a}" opacity="0.55" />
      ${Pe.front}
      ${et[t]??et.content}
      ${je.front}
    </g>
    ${He.front}
  </g>
  </g>
</svg>`}const Ot=["M69 27 L62.5 33.5 L68 38.5 L61 44.5 L64.5 50","M31 43 L38 49 L31.5 56 L38.5 63 L33 70","M21 59 L32 55 L43 62.5 L55 54.5 L66.5 62 L79 55.5"],Do=Ot.length;function rs(e,{cracks:t=0,className:r="",title:o="A chilly egg"}={}){const n=x[e]??x.mochi,[s,l,a]=n.palette,i=Math.max(0,Math.min(Do,Math.round(t))),f=Array.from({length:i},(g,u)=>`<path class="egg-crack egg-crack-${u+1}" pathLength="1" d="${Ot[u]}" />`).join("");return`
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
</svg>`}function os(e,t,{size:r=34}={}){const n=ce(50,50,24,e%12*30+t*.5),s=ce(50,50,36,t*6),l=Array.from({length:12},(a,i)=>{const f=ce(50,50,41,i*30);return`<circle cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="2.6" />`}).join("");return`
<svg class="collar-clock" width="${r}" height="${r}" viewBox="0 0 100 100" role="img"
     aria-label="${S(e,t)}" focusable="false">
  <circle cx="50" cy="50" r="46" class="collar-face" />
  <g class="collar-ticks">${l}</g>
  <line x1="50" y1="50" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}" class="collar-hand hour" />
  <line x1="50" y1="50" x2="${s.x.toFixed(1)}" y2="${s.y.toFixed(1)}" class="collar-hand minute" />
  <circle cx="50" cy="50" r="5" class="collar-pin" />
</svg>`}function ns(e,t,{napping:r=!1}={}){return r?"sleep":e.hatchedAt===null?"content":e.phase==="learning"?e.lapses>0?"droopy":"content":e.dueAt<=t?"hungry":"happy"}const Ze=[{id:"stump",price:35,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"flowerbed",price:45,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"lantern",price:60,tier:0,scope:"home",slot:"ground",band:"narrow"},{id:"sandpit",price:70,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"swing",price:80,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"house",price:130,tier:1,scope:"home",slot:"ground",band:"wide"},{id:"beehive",price:75,tier:2,scope:"home",slot:"ground",band:"narrow"},{id:"hammock",price:80,tier:2,scope:"home",slot:"ground",band:"wide"},{id:"pond",price:90,tier:2,scope:"home",slot:"ground",band:"narrow"},{id:"feeder",price:95,tier:3,scope:"home",slot:"ground",band:"narrow"},{id:"arch",price:140,tier:3,scope:"home",slot:"ground",band:"wide"},{id:"windmill",price:140,tier:3,scope:"home",slot:"ground",band:"narrow"},{id:"farGrove",price:50,tier:0,scope:"home",slot:"backdrop"},{id:"farMill",price:85,tier:1,scope:"home",slot:"backdrop"},{id:"farArch",price:120,tier:2,scope:"home",slot:"backdrop"},{id:"farTower",price:165,tier:3,scope:"home",slot:"backdrop"},{id:"signpost",price:55,tier:0,scope:"zoo"},{id:"topiary",price:90,tier:1,scope:"zoo"},{id:"bunting",price:110,tier:1,scope:"zoo"},{id:"pathLamps",price:150,tier:2,scope:"zoo"},{id:"fountain",price:200,tier:3,scope:"zoo"},{id:"statue",price:250,tier:3,scope:"zoo"}],Ie={ground:2,backdrop:1},To=Ie.ground,Oe=3,C=new Map(Ze.map(e=>[e.id,e])),K=e=>{var t;return((t=C.get(e))==null?void 0:t.slot)??"ground"},Rt=e=>{var t;return((t=C.get(e))==null?void 0:t.scope)??"home"},_t=e=>Rt(e)==="home",Ft=e=>Rt(e)==="zoo",ss=Ze.filter(e=>e.scope==="home"),as=Ze.filter(e=>e.scope==="zoo"),ls=(e,t)=>{var r;return(((r=C.get(e))==null?void 0:r.tier)??oe+1)<=t},ae=e=>Array.isArray(e==null?void 0:e.decor)?e.decor:[],Nt=(e,t)=>ae(e).includes(t),Eo=(e,t)=>ae(e).filter(r=>K(r)===t).length,Zo=(e,t="ground")=>Eo(e,t)>=(Ie[t]??0);function Re(e){if(!Array.isArray(e))return[];const t=[],r={};for(const o of e){if(!C.has(o)||!_t(o)||t.includes(o))continue;const n=K(o);(r[n]??0)>=(Ie[n]??0)||(r[n]=(r[n]??0)+1,t.push(o))}return t}function _e(e){if(!Array.isArray(e))return[];const t=[];for(const r of e)if(C.has(r)&&Ft(r)&&!t.includes(r)&&t.push(r),t.length>=Oe)break;return t}function is(e,t){return!C.has(t)||!_t(t)||Nt(e,t)||Zo(e,K(t))?e:{...e,decor:[...ae(e),t]}}function cs(e,t){return Nt(e,t)?{...e,decor:ae(e).filter(r=>r!==t)}:e}const E=e=>Array.isArray(e)?e:[],jt=(e,t)=>E(e).includes(t),Io=e=>E(e).length>=Oe;function fs(e,t){return!C.has(t)||!Ft(t)||jt(e,t)||Io(e)?E(e):[...E(e),t]}function ps(e,t){return jt(e,t)?E(e).filter(r=>r!==t):E(e)}const Pt=6,Ht=[0,0,10,16],Oo=30,ds=6,ft=6,Ro=12;function hs(e){if(!e)return 0;let t=0;return e.hatched&&(t+=Pt),e.evolved&&(t+=Ht[e.evolved]??0),t}function us(e,t){const r=Array.isArray(e)?e:[];if(r[r.length-1]!==t)return 0;const o=r[r.length-2];if(!o)return ft;const n=new Date(`${t}T00:00:00Z`);return n.setUTCDate(n.getUTCDate()-1),o===n.toISOString().slice(0,10)?Ro:ft}const _o=40,Fo=30,No=50,jo=7;function Po(e){const t=Array.isArray(e)?e:[];let r=0,o=null;for(let n=t.length-1;n>=0;n-=1){const s=t[n];if(typeof s!="string"||o!==null&&s!==o)break;r+=1;const l=new Date(`${s}T00:00:00Z`);if(Number.isNaN(l.getTime()))return r;l.setUTCDate(l.getUTCDate()-1),o=l.toISOString().slice(0,10)}return r}function Ho(e,t){const r=[],o=e??{};for(const s of _)St(o,s.id)>=1&&r.push(`mastery:${s.id}`);const n=Math.floor(Po(t==null?void 0:t.daysPlayed)/jo);for(let s=1;s<=n;s+=1)r.push(`week:${s}`);for(const s of ko){const l=It(s);l.length&&l.every(a=>{var i;return(i=o[a])==null?void 0:i.hatchedAt})&&r.push(`species:${s}`)}return r}function zo(e){const t=String(e??"").split(":")[0];return t==="mastery"?_o:t==="week"?Fo:t==="species"?No:0}function ys(e,t,r){const o=new Set(Array.isArray(r)?r:[]),n=Ho(e,t).filter(s=>!o.has(s));return{ids:n,coins:n.reduce((s,l)=>s+zo(l),0)}}const M=e=>Math.max(0,Math.floor(Number.isFinite(e)?e:0)),zt=M,gs=(e,t)=>M(e)+M(t),Go=(e,t)=>M(e)>=M(t),ks=(e,t)=>Go(e,t)?M(e)-M(t):M(e);function $s(e,t=0){let r=0;for(const o of Object.values(e??{})){o!=null&&o.hatchedAt&&(r+=Pt);const n=X(typeof(o==null?void 0:o.feeds)=="number"?o.feeds:0);for(let s=2;s<=n;s+=1)r+=Ht[s]??0}return r+M(t)*Oo}const Fe="pet-zoo/v1",U=2,Bo=400;function T(e){return{version:U,createdAt:e,lastPlayedAt:e,reviewClock:0,tiers:Object.fromEntries(O.map(t=>[t,0])),coins:0,zooDecor:[],milestones:[],coinsGrantedAt:0,milestonesGrantedAt:0,settings:{sound:!0,haptics:!0,language:L,playMinutes:ve,showDigital:!1},session:{startedAt:0,answered:0,correct:0,napUntil:0},stats:{totalAnswered:0,totalCorrect:0,streak:0,bestStreak:0,daysPlayed:[]},items:{}}}const Uo=e=>typeof e=="string"&&e.length>0&&e.length<=40,Gt=e=>Array.isArray(e)?e.filter(Uo):[],Bt=e=>new Date(e).toISOString().slice(0,10);function ms(e,t=le()){try{const r=t==null?void 0:t.getItem(Fe);if(!r)return T(e);const o=JSON.parse(r);if(!o||typeof o.items!="object"||!Number.isFinite(o.version)||o.version>U)return T(e);const n=qo(o);return{...T(e),...n,coins:zt(n.coins),tiers:F(n),zooDecor:_e(n.zooDecor),milestones:Gt(n.milestones),settings:{...T(e).settings,...n.settings},items:Ut(n.items)}}catch{return T(e)}}function qo(e){if(!e||e.version>=U)return e;const t={...e,version:U};return t.tiers=F(e),delete t.tier,t}function Ut(e){const t={};for(const[r,o]of Object.entries(e??{})){const n=Ir(r);if(!n)continue;const s=typeof(o==null?void 0:o.feeds)=="number"?o.feeds:(o==null?void 0:o.reps)||(o!=null&&o.hatchedAt?1:0),l=typeof(o==null?void 0:o.cracks)=="number"?o.cracks:vt((o==null?void 0:o.correctStreak)??0),a=Re(o==null?void 0:o.decor),i=(o==null?void 0:o.subject)===n&&typeof(o==null?void 0:o.feeds)=="number"&&typeof(o==null?void 0:o.cracks)=="number"&&Array.isArray(o==null?void 0:o.decor)&&a.length===o.decor.length;t[r]=i?o:{...o,subject:n,feeds:s,cracks:l,decor:a}}return t}function Qo(e,t=le()){try{return t==null||t.setItem(Fe,JSON.stringify(e)),!0}catch{return!1}}function bs(e=le()){try{e==null||e.removeItem(Fe)}catch{}}function le(){try{return typeof localStorage>"u"?null:localStorage}catch{return null}}function xs(e=le()){let t=null,r=null;const o=()=>{clearTimeout(t),t=null,r&&Qo(r,e),r=null};return{save(n){r=n,t===null&&(t=setTimeout(o,Bo))},flush:o}}function ws(e,t){const r=Bt(t),o=e.stats.daysPlayed;return o[o.length-1]===r?e:{...e,stats:{...e.stats,daysPlayed:[...o.slice(-59),r]}}}const qt="pet-zoo",Qt=1,ke="petzoo1:";class D extends Error{constructor(t){super(t),this.name="TransferError",this.key=t}}function Ls(e,t){return{app:qt,format:Qt,version:U,exportedAt:t,createdAt:e.createdAt,lastPlayedAt:e.lastPlayedAt,reviewClock:e.reviewClock,tiers:e.tiers,tier:F(e).clock,coins:e.coins,zooDecor:e.zooDecor,milestones:e.milestones,stats:e.stats,items:e.items}}const Ko=e=>JSON.stringify(e,null,2),Ms=e=>`pet-zoo-${Bt(e)}.json`,pt=32768;function Yo(e){let t="";for(let r=0;r<e.length;r+=pt)t+=String.fromCharCode(...e.subarray(r,r+pt));return btoa(t)}function Wo(e){const t=atob(e),r=new Uint8Array(t.length);for(let o=0;o<t.length;o+=1)r[o]=t.charCodeAt(o);return r}function Ss(e){const t=new TextEncoder().encode(Ko(e));return ke+Yo(t)}const ee=e=>typeof e=="object"&&e!==null&&!Array.isArray(e);function As(e){const t=String(e??"").trim();if(!t)throw new D("transfer.badFile");let r=t;if(t.startsWith(ke))try{const n=t.slice(ke.length).replace(/\s+/g,"");r=new TextDecoder().decode(Wo(n))}catch{throw new D("transfer.badFile")}let o;try{o=JSON.parse(r)}catch{throw new D("transfer.badFile")}if(!ee(o))throw new D("transfer.badFile");if(o.app!==qt)throw new D("transfer.badApp");if(!(o.format<=Qt))throw new D("transfer.badVersion");if(!ee(o.items))throw new D("transfer.badFile");return{...o,items:Vo(o.items)}}function Vo(e){const t={};for(const[r,o]of Object.entries(e)){if(!ee(o))continue;const n=At(r);!n||!n.valid(r,o)||(t[r]=o)}return Ut(t)}const vs=e=>Object.values(e).filter(t=>t.hatchedAt!==null&&t.hatchedAt!==void 0).length;function Cs(e,t,r){const o=T(r);return{...o,createdAt:t.createdAt??o.createdAt,lastPlayedAt:t.lastPlayedAt??r,reviewClock:Number.isFinite(t.reviewClock)?t.reviewClock:0,tiers:F(t),coins:zt(t.coins),zooDecor:_e(t.zooDecor),milestones:Gt(t.milestones),milestonesGrantedAt:Array.isArray(t.milestones)?r:0,coinsGrantedAt:Number.isFinite(t.coins)?r:0,stats:{...o.stats,...ee(t.stats)?t.stats:{}},items:t.items,settings:e.settings,session:o.session}}const m={w:200,h:120},p=62,b=96,G={x0:40,x1:160},R={x0:62,x1:138},Ds=46,c=e=>Number(e.toFixed(2));function ie(e){let t=Math.floor(e)%2147483647+1;return t<=0&&(t+=2147483646),()=>(t=t*48271%2147483647,(t-1)/2147483646)}const A={dawn:{sky:["#f6b98a","#ffe6cd"],orb:"sun",orbFill:"#ffd27a",glow:"#ffd9a8",veil:"rgba(255, 176, 120, 0.16)",night:!1},morning:{sky:["#a8dcff","#e8f6ff"],orb:"sun",orbFill:"#ffe293",glow:"#fff3c4",veil:"rgba(255, 246, 214, 0.10)",night:!1},noon:{sky:["#8ecfff","#e4f4ff"],orb:"sun",orbFill:"#fff2a8",glow:"#fffbdd",veil:"rgba(255, 255, 255, 0.06)",night:!1},afternoon:{sky:["#ffcf96","#fff0d6"],orb:"sun",orbFill:"#ffc860",glow:"#ffe0a5",veil:"rgba(255, 190, 120, 0.13)",night:!1},dusk:{sky:["#7f6bc4","#ffb493"],orb:"sun",orbFill:"#ff9d6e",glow:"#ffc7a0",veil:"rgba(120, 96, 190, 0.18)",night:!1},night:{sky:["#2f3f7a","#6a7cb8"],orb:"moon",orbFill:"#fdf8dc",glow:"#cfd8ff",veil:"rgba(40, 52, 110, 0.26)",night:!0}},Ts=Object.keys(A);function Kt(e){const t=(Math.round(e)%24+24)%24;return t>=5&&t<7?"dawn":t>=7&&t<11?"morning":t>=11&&t<14?"noon":t>=14&&t<17?"afternoon":t>=17&&t<20?"dusk":"night"}function Yt(e){const t=(Math.round(e)%24+24)%24,o=(t>=5&&t<19?(t-5)/14:((t<5?t+24:t)-19)/10)*Math.PI;return{x:c(100-Math.cos(o)*52),y:c(p-12-Math.sin(o)*34)}}function Wt(e,t,r,o){const n=A[e]??A.noon,s=Yt(t),l=ie(r+17),a=`
    <circle cx="${s.x}" cy="${s.y}" r="22" fill="url(#${o}-glow)" />
    ${n.orb==="moon"?`<circle cx="${s.x}" cy="${s.y}" r="7.5" fill="${n.orbFill}" />
           <circle cx="${c(s.x+2.6)}" cy="${c(s.y-2)}" r="1.5" fill="#e8e0bd" opacity="0.7" />
           <circle cx="${c(s.x-1.8)}" cy="${c(s.y+2.4)}" r="1.1" fill="#e8e0bd" opacity="0.6" />`:`<circle cx="${s.x}" cy="${s.y}" r="9" fill="${n.orbFill}" />`}`;return n.night?`${Array.from({length:34},()=>{const g=c(l()*200),u=c(l()**1.6*(p-6)),y=c(.5+l()*.9);return`<circle cx="${g}" cy="${u}" r="${y}" fill="#fdf8dc" opacity="${c(.35+l()*.5)}" />`}).join("")}${a}`:`${Array.from({length:3},(f,g)=>{const u=c(18+l()*150),y=c(8+l()*28),h=c(.7+l()*.7);return`<g transform="translate(${u} ${y}) scale(${h})" fill="#ffffff" opacity="${c(.5+g*.08)}">
      <ellipse cx="0" cy="0" rx="13" ry="6" />
      <circle cx="-5" cy="-2.5" r="6" />
      <circle cx="4.5" cy="-3.5" r="7.5" />
    </g>`}).join("")}${a}`}const $e={hills:e=>`
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
    </g>`},dt=`M0 ${p+2}
   C 34 ${p-4}, 68 ${p+6}, 100 ${p+1}
   C 136 ${p-5}, 170 ${p+5}, 200 ${p}`;function Vt(e,t){return`
    <path d="${dt} L200 120 L0 120 Z" fill="url(#${t}-ground)" />
    <path d="${dt}" fill="none" stroke="${e.groundRim}" stroke-width="1.4" opacity="0.55" />
    <path d="M0 ${b+4}
             C 46 ${b-2}, 120 ${b+7}, 200 ${b}
             L200 120 L0 120 Z"
          fill="${e.groundNear}" opacity="0.55" />`}const me={grass:(e,t)=>Array.from({length:26},()=>{const r=c(t()*200),o=c(p+6+t()*50),n=c(2.6+t()*3.4);return`<path d="M${r} ${o} q${c(.8+t())} ${-n} ${c(1.8+t())} ${c(-n*.6)}" stroke="${e.leafDark}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55" />`}).join(""),fern:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),o=c(p+8+t()*48),n=c(.6+t()*.6);return`<g transform="translate(${r} ${o}) scale(${n})" fill="${e.leafDark}" opacity="0.5">
        <ellipse cx="-3" cy="-2" rx="4" ry="1.6" transform="rotate(-25 -3 -2)" />
        <ellipse cx="3" cy="-2" rx="4" ry="1.6" transform="rotate(25 3 -2)" />
        <ellipse cx="0" cy="-4.5" rx="3.4" ry="1.5" />
      </g>`}).join(""),shells:(e,t)=>Array.from({length:18},()=>{const r=c(t()*200),o=c(p+10+t()*46),n=c(1.1+t()*1.5);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.7)}" fill="${e.bloom}" opacity="0.6" />`}).join(""),pebbles:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),o=c(p+8+t()*48),n=c(1+t()*1.8);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.65)}" fill="${e.stone}" opacity="0.5" />`}).join(""),lily:(e,t)=>Array.from({length:9},()=>{const r=c(t()*200),o=c(p+10+t()*42),n=c(3+t()*2.6);return`<g transform="translate(${r} ${o})">
        <circle r="${n}" fill="${e.leaf}" opacity="0.8" />
        <path d="M0 0 L${n} ${c(-n*.4)} A${n} ${n} 0 0 0 ${c(n*.7)} ${c(n*.7)} Z" fill="${e.groundNear}" opacity="0.5" />
      </g>`}).join(""),snow:(e,t)=>Array.from({length:16},()=>{const r=c(t()*200),o=c(p+8+t()*48),n=c(2.4+t()*3.4);return`<ellipse cx="${r}" cy="${o}" rx="${n}" ry="${c(n*.5)}" fill="#ffffff" opacity="0.75" />`}).join(""),spores:(e,t)=>Array.from({length:22},()=>{const r=c(t()*200),o=c(p-4+t()*56),n=c(.8+t()*1.4);return`<circle cx="${r}" cy="${o}" r="${n}" fill="${e.glow}" opacity="${c(.35+t()*.45)}" />`}).join(""),sparkle:(e,t)=>Array.from({length:20},()=>{const r=c(t()*200),o=c(p+2+t()*52),n=c(.8+t()*1.3);return`<circle cx="${r}" cy="${o}" r="${n}" fill="#ffffff" opacity="${c(.4+t()*.4)}" />`}).join("")},be={tree:e=>`
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
    <circle cx="4.6" cy="-7.4" r="7" fill="#fbfdff" />`},Es=Object.keys(be),Jo=e=>`
  <ellipse cx="0" cy="-1" rx="14" ry="5.6" fill="${e.nestDark}" />
  <ellipse cx="0" cy="-3" rx="11.6" ry="4.4" fill="${e.nest}" />
  <ellipse cx="0" cy="-3.6" rx="8.4" ry="2.8" fill="${e.nestLight}" />`,ht={bush:[[-5.4,-9.4],[5.2,-10.4],[-.2,-14.2]],tree:[[-6.4,-18],[6.6,-19.2],[0,-23.4]],basket:[[-4.6,-7.2],[4.6,-7.8],[0,-10.4]],coral:[[-5,-11.4],[4.2,-9],[.4,-15.2]]},ut={bush:e=>`
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
    <circle cx="-5" cy="-11" r="2.2" fill="${e.accent}" />`},xe={berry:e=>`
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
    <circle cx="0" cy="-0.2" r="1.1" fill="#fff8e0" opacity="0.8" />`},Zs=Object.keys(xe),Xo=e=>`
  <circle cx="0" cy="0" r="5" fill="${e.ballA}" />
  <path d="M-5 0 a5 5 0 0 1 10 0 Z" fill="${e.ballB}" />
  <circle cx="-1.7" cy="-1.9" r="1.4" fill="#ffffff" opacity="0.7" />`,en=e=>`
  <ellipse cx="0" cy="0" rx="7.4" ry="2.6" fill="${e.leafDark}" opacity="0.45" />`,we={stump:e=>`
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
    <circle cx="0" cy="-21" r="1.8" fill="${e.stoneLight}" />`},Is=Object.keys(we),yt=16,Le={farGrove:e=>`
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
    <rect x="-2" y="-38" width="4" height="4" fill="${e.glow}" opacity="0.6" />`},Os=Object.keys(Le),tn=.48,Rs=42,_s=24,fe=13,Me={signpost:e=>`
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
    <circle cx="0" cy="-13.6" r="2" fill="${e.accent}" />`},Fs=Object.keys(Me);function Jt(e,t,r=12){const o=ie(t+91);return Array.from({length:r},(n,s)=>{const l=c(20+o()*160),a=c(p-10+o()*52),i=c(.9+o()*1.1),f=c(o()*6),g=c(4+o()*7);return`<circle class="hab-mote" cx="${l}" cy="${a}" r="${i}" fill="${e.glow}"
      style="--mote-delay:${f}s; --mote-drift:${g}px" />`}).join("")}const rn=e=>Math.max(0,Math.min(255,Math.round(e))),gt=e=>{const t=String(e).replace("#",""),r=t.length===3?t.split("").map(o=>o+o).join(""):t;return[parseInt(r.slice(0,2),16)||0,parseInt(r.slice(2,4),16)||0,parseInt(r.slice(4,6),16)||0]},on=e=>`#${e.map(t=>rn(t).toString(16).padStart(2,"0")).join("")}`;function w(e,t,r){const o=Math.max(0,Math.min(1,r)),[n,s,l]=gt(e),[a,i,f]=gt(t);return on([n+(a-n)*o,s+(i-s)*o,l+(f-l)*o])}const kt={dawn:{color:"#ffb47e",amount:.2},morning:{color:"#fffbe8",amount:.08},noon:{color:"#ffffff",amount:.03},afternoon:{color:"#ffc474",amount:.2},dusk:{color:"#7f66c0",amount:.3},night:{color:"#33437e",amount:.44}},nn={far:"#8fc06a",farDark:"#6ea54f",ground:["#a9d581","#7fbc5e"],groundNear:"#97ca70",leaf:"#7fc65c",leafDark:"#54a03c",wood:"#a87b52",stone:"#c6c0b2",stoneLight:"#e4dfd4",bloom:"#ffd7e6",accent:"#ff9ec0",nest:"#ecdcaa",nestDark:"#c9b47f",nestLight:"#f8f0cf",glow:"#fff0b0",glowDeep:"#ffd66b",water:"#7fc4e8",waterLight:"#c4e8f8"},q={meadow:{far:"hills",detail:"grass",larder:"bush",treat:"berry",scenery:["tree","bush","flowers","rock"],colors:{}},grove:{far:"treeline",detail:"fern",larder:"tree",treat:"apple",scenery:["pine","tree","mushroom","rock"],colors:{far:"#5f9d55",farDark:"#3f7a41",ground:["#8cc474","#5f9c55"],groundNear:"#7ab266",leaf:"#63b061",leafDark:"#3d8845",wood:"#8a6242",bloom:"#ffd08a"}},pond:{far:"hills",detail:"lily",larder:"bush",treat:"apple",scenery:["reeds","bush","flowers","rock"],colors:{far:"#87c69a",farDark:"#63a97e",ground:["#9ed3a4","#6fb894"],groundNear:"#8fcc9e",leaf:"#6fc08c",leafDark:"#46976a",bloom:"#ffe4a8"}},shore:{far:"sea",detail:"shells",larder:"coral",treat:"fish",scenery:["palm","rock","bush","flowers"],colors:{far:"#f0dcb0",farDark:"#dcbe94",ground:["#f6e6bd","#e6cf9a"],groundNear:"#f2dfb0",leaf:"#78c47e",leafDark:"#519a5c",wood:"#b9885a",stone:"#e0d6c0",stoneLight:"#f4ecdc",bloom:"#ffc0a8",water:"#5fbfe4",waterLight:"#bde8f6"}},dune:{far:"dunes",detail:"pebbles",larder:"basket",treat:"melon",scenery:["cactus","rock","flowers","bush"],colors:{far:"#f2d49a",farDark:"#dcb87c",ground:["#f8e2ae","#e8c78c"],groundNear:"#f4dca4",leaf:"#8cc078",leafDark:"#5f9455",wood:"#c08c58",stone:"#dccbaa",stoneLight:"#f2e7cd",bloom:"#ffb3c8"}},snowfield:{far:"peaks",detail:"snow",larder:"basket",treat:"carrot",scenery:["snowpine","snowdrift","rock","snowpine"],colors:{far:"#bcd0ea",farDark:"#93aed2",ground:["#eef5ff","#cfe0f4"],groundNear:"#e4eeff",leaf:"#5f9c78",leafDark:"#417a5c",wood:"#8a6a52",stone:"#c8d4e6",stoneLight:"#eaf1fa",bloom:"#c8dcff",glow:"#dbeaff",glowDeep:"#9fc4f0"}},glowvale:{far:"arch",detail:"spores",larder:"bush",treat:"glowberry",scenery:["mushroom","crystal","rock","bush"],colors:{far:"#6a5a94",farDark:"#4a3f70",ground:["#8f7fbc","#6b5c96"],groundNear:"#8474ae",leaf:"#7fc4a8",leafDark:"#4f9a80",wood:"#7a5f8e",stone:"#a89cc4",stoneLight:"#cfc6e4",bloom:"#c8a0ff",glow:"#a8f0e0",glowDeep:"#5fd8c4"}},cloudtop:{far:"cloudbank",detail:"sparkle",larder:"basket",treat:"starfruit",scenery:["cloudpuff","crystal","flowers","cloudpuff"],colors:{far:"#d2e0fa",farDark:"#b0c6ec",ground:["#e2ecff","#c2d4f0"],groundNear:"#d6e4fb",leaf:"#8ec8ea",leafDark:"#6aa6d6",wood:"#b0a8cc",stone:"#c8d6ee",stoneLight:"#e6eefc",bloom:"#ffd9f0",glow:"#fff0c8",glowDeep:"#ffd98a"}}},Ns=Object.keys(q),sn={sprout:"meadow",bubs:"pond",zzz:"snowfield",tumble:"dune",mochi:"meadow",bloop:"pond",pebble:"snowfield",nibbles:"dune",pip:"grove",snug:"grove",noodle:"grove",cloudlet:"shore",waddle:"shore",glim:"glowvale",fizz:"glowvale",puff:"cloudtop"},an=e=>sn[e]??"meadow",$t=[{pieces:[[78,.56],[124,.6],[36,.86],[176,1.3]],larder:52,ball:78,nest:126},{pieces:[[86,.55],[118,.58],[166,.88],[26,1.26]],nest:74,ball:122,larder:148},{pieces:[[74,.52],[128,.62],[34,.9],[178,1.22]],larder:150,ball:124,nest:78},{pieces:[[90,.6],[112,.54],[168,.84],[24,1.28]],nest:120,ball:80,larder:54},{pieces:[[80,.58],[130,.53],[38,.94],[174,1.24]],larder:56,ball:82,nest:128},{pieces:[[88,.54],[120,.6],[164,.8],[30,1.3]],nest:72,ball:118,larder:146},{pieces:[[76,.57],[126,.52],[32,.88],[180,1.22]],larder:148,ball:120,nest:76}],js={x0:66,x1:134},te={x0:88,x1:112},ln=3;function Ne(e,t){const r=[e.nest,e.larder,e.ball];let o=100,n=-1/0;for(let s=t.x0+12;s<=t.x1-12;s+=2){const a=Math.min(...r.map(i=>Math.abs(s-i)))-Math.abs(s-100)*.4;a>n&&(n=a,o=s)}return o}const Xt=12,cn=30;function er(e,t=To){const r=[e.nest,e.larder,e.ball,Ne(e,R)],o=[];for(let s=G.x0+yt;s<=G.x1-yt;s+=2)s>=te.x0&&s<=te.x1||o.push(s);o.sort((s,l)=>Math.abs(l-100)-Math.abs(s-100));const n=[];for(const s of o){if(n.length>=t)break;r.some(l=>Math.abs(l-s)<Xt)||n.some(l=>Math.abs(l-s)<cn)||n.push(s)}return n.sort((s,l)=>s-l)}function fn(e,t=er(e)){const r=[...t,Ne(e,R)],o=[];for(let a=G.x0+fe;a<=G.x1-fe;a+=2)a>=te.x0&&a<=te.x1||o.push(a);o.sort((a,i)=>Math.abs(i-100)-Math.abs(a-100)||a-i);const n=o.find(a=>r.every(i=>Math.abs(i-a)>=Xt));if(n!==void 0)return c(n);let s=o[0]??G.x0+fe,l=-1;for(const a of o){const i=Math.min(...r.map(f=>Math.abs(f-a)));i>l&&(l=i,s=a)}return c(s)}const pn=e=>c(p+10+(e-.5)*40),tr=(e,t,r)=>Math.max(t,Math.min(r,e)),dn=6,hn=20,un=4;function yn(e,t){const r=e%12,o=se(`t${S(e,t)}`)%un,n=i=>i>=dn&&i<=hn,s=n(r)===n(r+12)?o%2===1:n(r+12)!==(o===0),l=r+(s?12:0),a=Kt(l);return{hour24:l,pm:s,phase:a,night:A[a].night,orb:Yt(l)}}function rr(e,t,r){var g;const o=x[e]??x.mochi,[n,s,l]=o.palette,a={...nn,...((g=q[t])==null?void 0:g.colors)??{}},i=kt[r]??kt.noon,f=(u,y=.1)=>w(w(u,l,y),i.color,i.amount);return{far:f(a.far),farDark:f(a.farDark),ground:[f(a.ground[0],.12),f(a.ground[1],.12)],groundNear:f(a.groundNear,.14),groundRim:w(f(a.ground[0],.12),"#2b2440",.34),leaf:f(a.leaf),leafDark:f(a.leafDark),wood:f(a.wood,.07),stone:f(a.stone,.07),stoneLight:f(a.stoneLight,.05),water:f(a.water,.07),waterLight:f(a.waterLight,.05),bloom:w(w(a.bloom,n,.42),i.color,i.amount*.5),accent:w(l,i.color,i.amount*.4),nest:w(a.nest,s,.45),nestDark:w(a.nestDark,l,.32),nestLight:w(a.nestLight,s,.5),glow:a.glow,glowDeep:a.glowDeep,ballA:l,ballB:s}}function gn(e,t){const r=Q(e,t),o=an(r),n=q[o],s=Ee(e,t),l=yn(e,t),a=$t[s*ln%$t.length],i=se(`hab${S(e,t)}`)%1e5,f=a.pieces.map(([u,y],h)=>({id:n.scenery[(s+h)%n.scenery.length],x:u,scale:y,y:pn(y),flip:(s+h)%2===1})),g=(ht[n.larder]??ht.bush).map(([u,y])=>({x:c(a.larder+u),y:c(b+y)}));return{id:S(e,t),species:r,biome:o,light:l,palette:rr(r,o,l.phase),scenery:f,props:{nest:{x:a.nest,y:b},ball:{x:a.ball,y:b},larder:{x:a.larder,y:b,kind:n.larder,treat:n.treat,spots:g}},home:{x:Ne(a,R),y:b},roam:{...R},furniture:[],backdrop:null,spots:er(a),backdropSpot:fn(a),seed:i}}function Ps(e){const t=gn(e.h,e.m),r={...t,furniture:kn(t,e==null?void 0:e.decor),backdrop:$n(t,e==null?void 0:e.decor)},o=e==null?void 0:e.habitat;return!o||typeof o!="object"?r:{...r,...o,palette:{...r.palette,...o.palette??{}},props:{...r.props,...o.props??{}},light:{...r.light,...o.light??{}}}}function kn(e,t){const r=Re(t).filter(l=>K(l)==="ground"),o=e.spots??[],n=l=>{var a;return((a=C.get(l))==null?void 0:a.band)==="wide"},s=r.length===2&&!n(r[0])&&n(r[1])?[...o].reverse():o;return r.slice(0,o.length).map((l,a)=>({id:l,x:s[a],y:b}))}function $n(e,t){const r=Re(t).find(o=>K(o)==="backdrop");return r?{id:r,x:e.backdropSpot??100,y:p,scale:tn}:null}const mn=(e,t,r,o,n,s)=>{const l=be[e]??be.bush,a=n?`scale(${-o} ${o})`:`scale(${o})`;return`<g transform="translate(${t} ${r}) ${a}">${l(s)}</g>`};function Hs(e,{uid:t="h",label:r="",sleeping:o=!1}={}){const n=e.palette,s=A[e.light.phase]??A.noon,l=ie(e.seed+3),a=q[e.biome]??q.meadow,i=e.scenery.filter(y=>y.y<=b),f=e.scenery.filter(y=>y.y>b),g=y=>y.map(h=>mn(h.id,h.x,h.y,h.scale,h.flip,n)).join(""),u=e.light.night||e.biome==="glowvale";return`
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
    ${Wt(e.light.phase,e.light.hour24,e.seed,t)}
  </g>

  <g class="hab-far">${($e[a.far]??$e.hills)(n)}</g>

  ${e.backdrop?`<g class="hab-backdrop" transform="translate(${e.backdrop.x} ${e.backdrop.y}) scale(${e.backdrop.scale})">${(Le[e.backdrop.id]??Le.farGrove)(n)}</g>`:""}

  <g class="hab-ground">
    ${Vt(n,t)}
    ${(me[a.detail]??me.grass)(n,l)}
  </g>

  <g class="hab-back">
    ${g(i)}
    ${(e.furniture??[]).map(y=>`<g class="hab-furniture" transform="translate(${y.x} ${y.y})">${(we[y.id]??we.flowerbed)(n)}</g>`).join("")}
    <g transform="translate(${e.props.nest.x} ${e.props.nest.y})">${Jo(n)}</g>
    <g transform="translate(${e.props.ball.x} ${e.props.ball.y})">${en(n)}</g>
    <g transform="translate(${e.props.larder.x} ${e.props.larder.y})">
      ${(ut[e.props.larder.kind]??ut.bush)(n)}
    </g>
  </g>

  <g class="hab-actors"></g>

  <g class="hab-front">${g(f)}</g>

  ${u?`<g class="hab-motes">${Jt(n,e.seed,o?8:14)}</g>`:""}

  <rect class="hab-veil" x="0" y="0" width="${m.w}" height="${m.h}" fill="${s.veil}" />
  <rect class="hab-dusk" x="0" y="0" width="${m.w}" height="${m.h}" fill="#1b1930" />
</svg>`}const zs=(e,t)=>(xe[e]??xe.berry)(t),Gs=e=>Xo(e),mt=5,bn=330,xn=.22,wn=.54,Ln=.82,bt=.62,xt=26;function Bs(e,t,r){if(e.resting)return{...e,bounce:0};const o=tr(t,0,.05),n=r.floor??b,s=r.ceiling??8,l=(r.x0??R.x0)+mt,a=(r.x1??R.x1)-mt;let i=e.vx*(1-xn*o),f=e.vy+bn*o,g=e.x+i*o,u=e.y+f*o,y=0;u>=n?(u=n,f>xt?(y=f,f=-f*wn,i*=Ln):(f=0,i*=.7)):u<=s&&(u=s,f=Math.abs(f)*.4),g<=l?(g=l,i=Math.abs(i)*bt,y=Math.max(y,Math.abs(e.vx)*.6)):g>=a&&(g=a,i=-Math.abs(i)*bt,y=Math.max(y,Math.abs(e.vx)*.6));const h=u>=n&&Math.abs(f)<=xt&&Math.abs(i)<2;return{...e,x:g,y:u,vx:h?0:i,vy:h?0:f,spin:(e.spin??0)+i*o*7,resting:h,bounce:y}}function Us(e,t=R,r=Math.random){const o=t.x1-t.x0,n=(e-t.x0)/o,s=n<.28?1:n>.72||r()<.5?-1:1,l=(.14+r()*.34)*o;return c(tr(e+s*l,t.x0,t.x1))}const Mn=[34,100,166],pe=4,Sn=e=>rr("mochi","meadow",e);function An(e){return _e(e).slice(0,Oe).map((t,r)=>({id:t,x:Mn[r],y:b}))}function qs(e,{hour24:t=12,uid:r="yard",label:o=""}={}){const n=Kt(t),s=Sn(n),l=A[n]??A.noon,a=ie(pe+3),i=An(e);return`
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
    ${Wt(n,t,pe,r)}
  </g>

  <g class="yard-far">${$e.hills(s)}</g>

  <g class="yard-ground">
    ${Vt(s,r)}
    ${me.grass(s,a)}
  </g>

  <g class="yard-pieces">
    ${i.map(f=>`<g class="yard-piece" transform="translate(${f.x} ${f.y})">${(Me[f.id]??Me.signpost)(s)}</g>`).join("")}
  </g>

  ${l.night?`<g class="yard-motes">${Jt(s,pe,10)}</g>`:""}

  <rect class="yard-veil" x="0" y="0" width="${m.w}" height="${m.h}" fill="${l.veil}" />
</svg>`}export{Zo as $,Ls as A,mt as B,Ss as C,L as D,As as E,Cs as F,vs as G,Jr as H,Xr as I,Qn as J,Gn as K,gs as L,Kn as M,ns as N,X as O,Ds as P,os as Q,S as R,x as S,D as T,C as U,ps as V,b as W,cs as X,Go as Y,Io as Z,fs as _,Hs as a,eo as a$,K as a0,is as a1,ks as a2,ls as a3,Nt as a4,jt as a5,zr as a6,Hn as a7,Ir as a8,N as a9,Me as aA,we as aB,Cn as aC,vn as aD,Z as aE,En as aF,Zn as aG,Tn as aH,ds as aI,ce as aJ,Dn as aK,fr as aL,bo as aM,Se as aN,gn as aO,ze as aP,dr as aQ,pr as aR,Mt as aS,In as aT,On as aU,Hr as aV,qe as aW,jr as aX,Pr as aY,zn as aZ,Ce as a_,yr as aa,Pn as ab,Bt as ac,ws as ad,Fr as ae,hs as af,Oo as ag,us as ah,Bn as ai,$s as aj,Ho as ak,gr as al,ys as am,qs as an,as as ao,ss as ap,At as aq,v as ar,jn as as,Q as at,_ as au,ne as av,ge as aw,Nn as ax,St as ay,Le as az,Gs as b,Fs as b$,ro as b0,oo as b1,Qo as b2,Fe as b3,U as b4,$o as b5,J as b6,It as b7,_n as b8,br as b9,ke as bA,Qt as bB,Vo as bC,ir as bD,an as bE,Ns as bF,Ts as bG,G as bH,R as bI,js as bJ,$t as bK,Ne as bL,pn as bM,Es as bN,yn as bO,Kt as bP,Yt as bQ,p as bR,w as bS,rr as bT,ie as bU,Zs as bV,Ee as bW,Ze as bX,oe as bY,Os as bZ,Is as b_,de as ba,Ke as bb,Ye as bc,We as bd,Ve as be,Je as bf,So as bg,Mo as bh,xo as bi,lo as bj,fo as bk,Lo as bl,co as bm,po as bn,ho as bo,Et as bp,uo as bq,it as br,he as bs,ue as bt,Zt as bu,mo as bv,at as bw,st as bx,Do as by,Ut as bz,tr as c,Ie as c0,To as c1,Re as c2,er as c3,yt as c4,Eo as c5,fn as c6,_e as c7,Mn as c8,An as c9,fe as cA,Rs as cB,_s as cC,tn as cD,Oe as cE,m as cF,_o as cG,Fo as cH,No as cI,Mr as cJ,Sn as ca,Po as cb,zo as cc,F as cd,_r as ce,Be as cf,O as cg,qo as ch,qr as ci,Qr as cj,Dt as ck,Ct as cl,Kr as cm,Ur as cn,Ue as co,Nr as cp,vt as cq,ve as cr,to as cs,qt as ct,te as cu,Pt as cv,Ht as cw,Ro as cx,ft as cy,zt as cz,es as d,rs as e,xs as f,Fn as g,Ps as h,so as i,Yn as j,qn as k,ms as l,Vn as m,Us as n,Jn as o,ts as p,Wn as q,Un as r,Bs as s,zs as t,Xn as u,bs as v,T as w,Rn as x,Ms as y,Ko as z};
