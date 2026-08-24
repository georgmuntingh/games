// Language. Everything the child or a grown-up reads lives in this file, including the
// two languages' quite different ways of saying a time out loud.
//
// Norwegian counts the half hour forwards, not back: 4:30 is "halv fem" — half *to*
// five — and 4:20 is "ti på halv fem", ten to half-five. Translating the English phrases
// literally would teach a Norwegian child the wrong hour at exactly the point in the dial
// where they are already least sure, so the two languages get separate rules rather than
// a shared table with swapped words.

export const DEFAULT_LANGUAGE = 'nb';

export const LANGUAGES = [
  { id: 'nb', label: 'Norsk' },
  { id: 'en', label: 'English' },
];

export const isLanguage = (id) => LANGUAGES.some((lang) => lang.id === id);

/* ------------------------------------------------------------ time words */

const HOUR_WORDS = {
  en: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
  nb: ['', 'ett', 'to', 'tre', 'fire', 'fem', 'seks', 'sju', 'åtte', 'ni', 'ti', 'elleve', 'tolv'],
};

const EN_MINUTES = {
  0: "o'clock",
  5: 'five past',
  10: 'ten past',
  15: 'quarter past',
  20: 'twenty past',
  25: 'twenty-five past',
  30: 'half past',
  35: 'twenty-five to',
  40: 'twenty to',
  45: 'quarter to',
  50: 'ten to',
  55: 'five to',
};

// Norwegian phrases, written against the *coming* hour where the language does.
// `next` is true for the ones that name the hour after this one.
const NB_MINUTES = {
  0: { text: 'klokka {h}', next: false },
  5: { text: 'fem over {h}', next: false },
  10: { text: 'ti over {h}', next: false },
  15: { text: 'kvart over {h}', next: false },
  20: { text: 'ti på halv {h}', next: true },
  25: { text: 'fem på halv {h}', next: true },
  30: { text: 'halv {h}', next: true },
  35: { text: 'fem over halv {h}', next: true },
  40: { text: 'ti over halv {h}', next: true },
  45: { text: 'kvart på {h}', next: true },
  50: { text: 'ti på {h}', next: true },
  55: { text: 'fem på {h}', next: true },
};

const wrap = (h) => ((h - 1 + 12) % 12) + 1; // keeps hours in 1..12, never 0 or 13

/** The hour spelled out: "four" / "fire". */
export const hourWord = (lang, h) => (HOUR_WORDS[lang] ?? HOUR_WORDS[DEFAULT_LANGUAGE])[wrap(h)];

/** A time as a person would say it: "quarter past four" / "kvart over fire". */
export function spokenTime(lang, h, m) {
  if (lang === 'en') {
    const phrase = EN_MINUTES[m];
    const named = hourWord('en', m > 30 ? h + 1 : h);
    return m === 0 ? `${named} ${phrase}` : `${phrase} ${named}`;
  }
  const rule = NB_MINUTES[m];
  return rule.text.replace('{h}', hourWord('nb', rule.next ? h + 1 : h));
}

/* ---------------------------------------------------------- pet names */

// Named in the child's own language, so the association the game is really building —
// "Vaffel eats at quarter past four" — is one sentence rather than two.
export const NAMES = {
  en: [
    'Biscuit', 'Marmalade', 'Waffle', 'Pumpkin', 'Sprinkle', 'Doodle', 'Clover', 'Peanut',
    'Nugget', 'Custard', 'Pickle', 'Bumble', 'Dandelion', 'Truffle', 'Cinnamon', 'Gumdrop',
    'Blossom', 'Turnip', 'Jellybean', 'Muffin', 'Toast', 'Pancake', 'Wobble', 'Pudding',
    'Cricket', 'Sundae', 'Butterbean', 'Hopscotch', 'Marshmallow', 'Tangerine', 'Pinecone',
    'Bramble', 'Mittens', 'Popcorn', 'Whisker', 'Fern', 'Gingersnap', 'Nutmeg', 'Poppy',
    'Sesame', 'Twiglet', 'Apricot', 'Cobweb', 'Domino', 'Fizzle', 'Hazelnut', 'Pebble',
    'Snowdrop',
  ],
  nb: [
    'Vaffel', 'Kanelbolle', 'Blåbær', 'Pannekake', 'Smultring', 'Kakao', 'Marsipan',
    'Karamell', 'Lakris', 'Rosin', 'Sukkerbit', 'Krumkake', 'Tyttebær', 'Multe', 'Kløver',
    'Løvetann', 'Kongle', 'Furunål', 'Mose', 'Dugg', 'Snøfnugg', 'Måneskinn', 'Solstråle',
    'Stjerneskudd', 'Regnbue', 'Tordensky', 'Bølge', 'Rullestein', 'Perle', 'Knappen',
    'Tøffel', 'Votten', 'Lua', 'Dott', 'Lubben', 'Tuss', 'Prikken', 'Flekken', 'Bamse',
    'Nøtta', 'Fnugg', 'Kvist', 'Bringebær', 'Solsikke', 'Tjukken', 'Sprett', 'Trilla',
    'Nusse',
  ],
};

/* ------------------------------------------------------------- strings */

const STRINGS = {
  en: {
    'back': '← Back to games',
    'nav.scenes': 'Scenes',
    'tab.play': 'Feed',
    'tab.zoo': 'Zoo',
    'sound.on': 'Sound on',
    'sound.off': 'Sound off',
    'settings.open': 'Settings',
    'clock.aria': 'Drag the clock hands to set the time',

    'prompt.booting': 'Waking the zoo…',
    'prompt.egg': 'A chilly egg! It hatches at…',
    'prompt.egg1': 'The egg is stirring! It hatches at…',
    'prompt.egg2': 'It is cracking open! It hatches at…',
    'prompt.forgot': '{name} forgot their snack time. It is…',
    'prompt.hungry': '{name} is hungry! They eat at…',
    'prompt.snack': '{name} fancies a snack at…',
    'button.warm': 'Warm the egg!',
    'button.feed': 'Feed {name}!',

    'cheer.1': 'Yes!',
    'cheer.2': 'Perfect!',
    'cheer.3': 'Spot on!',
    'cheer.4': 'Nailed it!',
    'cheer.5': 'That is it!',
    'cheer.streak': '{cheer} {n} in a row!',
    'crack.1': 'A crack appeared!',
    'crack.2': 'Another crack — it is nearly out!',
    'hatch.stir': 'Something is moving in there…',
    'hatch.now': 'It hatched!',
    'hatch.hello': '{name} says hello!',
    'evolve.now': 'Something is happening…',
    'evolve.done': '{name} is now {label}!',
    'form.2': 'the Bold',
    'form.3': 'the Grand',

    'teach.nearMiss': 'So close! ',
    'teach.hourExact': 'At {hour} o’clock the short fat hand points straight at the {hour}.',
    'teach.hourPastHalf':
      'The short fat hand is past halfway from the {hour} to the {next} — but it is still the {hour}.',
    'teach.hourJustLeft': 'Look at the short fat hand: at {time} it has just left the {hour}.',
    'teach.minuteOClock': 'At {hour} o’clock the long hand points straight up.',
    'teach.minuteCountOne': 'Count round in fives: {jumps} jump past the top is {minutes} minutes.',
    'teach.minuteCountMany': 'Count round in fives: {jumps} jumps past the top is {minutes} minutes.',
    'teach.both': 'Here is where both hands go for {time}.',

    'nap.title': 'Pets are sleeping!',
    'nap.copy':
      'That was a good session. Everyone is having a nap — you can still visit them in the zoo.',
    'nap.countdown': 'Waking up in',
    'nap.wake': 'Wake the pets',
    'nap.visit': 'Visit the zoo',
    'nap.sleeping': 'sleeping',

    'zoo.empty': 'No pets yet! Feed the clock a few times and your first egg will hatch.',
    'zoo.egg': '{species} egg',
    'zoo.eggTitle': 'A chilly egg',
    'zoo.eggTitleCracks': 'A cracking egg, {n} of {of} cracks',
    'zoo.rename': 'What is this pet called?',

    'habitat.back': 'Back to the zoo',
    'habitat.rename': 'Give this pet a new name',
    'habitat.aria': "{name}'s home",
    'habitat.eggAria': 'The home waiting for a {species} egg',
    'habitat.hint': 'Throw the ball, share a snack, or stroke {name}.',
    'habitat.eggHint': 'This home is waiting. Feed the clock, and the egg will hatch.',
    'habitat.sleeping': '{name} is fast asleep. Sshh.',

    'unlock.title': 'New pets have arrived!',
    'unlock.copy': '{tier} — {blurb}',
    'unlock.close': 'Let’s go',

    'howto.summary': 'How to play',
    'howto.1': 'A pet tells you when it eats. Drag the clock hands to that time.',
    'howto.2':
      'The <b>long thin hand</b> is the minutes — it jumps five minutes at a time. The <b>short fat hand</b> is the hour.',
    'howto.3':
      'Watch the short hand creep along as you move the long one. At quarter past four it has already left the 4 — that is how a real clock works.',
    'howto.4': 'Get one right four times and its egg cracks open into a pet of your own.',
    'howto.5':
      'After a few minutes the pets get sleepy and the game stops. You can still wander the zoo while they nap.',
    'howto.6': 'Grown-ups: press and hold the title for progress.',

    'grownups.title': 'Progress',
    'grownups.answered': 'Times answered',
    'grownups.accuracy': 'Correct first try',
    'grownups.streak': 'Best streak',
    'grownups.hatched': 'Pets hatched',
    'grownups.days': 'Days played',
    'grownups.fine':
      'Times are scheduled with a spaced-repetition algorithm: each one comes back just as it is about to be forgotten. Everything is stored in this browser only.',
    'grownups.close': 'Close',
    'grownups.reset': 'Start over',
    'grownups.resetConfirm': 'Start over? Every pet and all progress will be lost.',

    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.playTime': 'Play time',
    'settings.playTimeValue': '{n} minutes',
    'settings.playTimeHelp':
      'How long a session lasts before the pets need a nap. Short sessions work best — three to five minutes.',
    'settings.digital': 'Show digital time',
    'settings.digitalHelp':
      'Off by default. With it off the pets say their feeding time in words only, so the clock face is the only place to read it.',
    'settings.transfer': 'Move to another device',
    'settings.transferHelp':
      'Save the zoo as a file, or copy it as a code to send in a message. Opening either one on another device brings every pet across. The zoo already on that device is replaced.',
    'settings.done': 'Done',

    'transfer.exportFile': 'Save file',
    'transfer.copyCode': 'Copy code',
    'transfer.importFile': 'Open file…',
    'transfer.pasteCode': 'Paste code',
    'transfer.pastePrompt': 'Paste the code from the other device:',
    'transfer.confirm':
      'Replace this device’s zoo with the one you are bringing in? The pets here now will be lost.',
    'transfer.saved': 'Saved {file}.',
    'transfer.copied': 'Code copied — paste it on the other device.',
    'transfer.copyFailed': 'Could not reach the clipboard, so the code was saved as a file instead.',
    'transfer.imported': 'Brought in {n} pets.',
    'transfer.badFile': 'That does not look like a Pet Zoo save.',
    'transfer.badApp': 'That save is from a different game.',
    'transfer.badVersion': 'That save comes from a newer Pet Zoo than this one.',

    'tier.0.name': 'O’clock',
    'tier.0.blurb': 'The big hand points straight up.',
    'tier.1.name': 'Half past',
    'tier.1.blurb': 'The big hand points straight down.',
    'tier.2.name': 'Quarter past and quarter to',
    'tier.2.blurb': 'The big hand points sideways.',
    'tier.3.name': 'Every five minutes',
    'tier.3.blurb': 'Count around the face in fives.',
  },

  nb: {
    'back': '← Tilbake til spillene',
    'nav.scenes': 'Visninger',
    'tab.play': 'Mate',
    'tab.zoo': 'Dyrehagen',
    'sound.on': 'Lyd på',
    'sound.off': 'Lyd av',
    'settings.open': 'Innstillinger',
    'clock.aria': 'Dra viserne for å stille klokka',

    'prompt.booting': 'Vekker dyrehagen…',
    'prompt.egg': 'Et kaldt egg! Det klekkes…',
    'prompt.egg1': 'Egget rører på seg! Det klekkes…',
    'prompt.egg2': 'Det slår sprekker! Det klekkes…',
    'prompt.forgot': '{name} har glemt måltidet sitt. Klokka er…',
    'prompt.hungry': '{name} er sulten! Spiser…',
    'prompt.snack': '{name} vil gjerne ha en matbit…',
    'button.warm': 'Varm egget!',
    'button.feed': 'Mat {name}!',

    'cheer.1': 'Ja!',
    'cheer.2': 'Perfekt!',
    'cheer.3': 'Helt riktig!',
    'cheer.4': 'Sånn ja!',
    'cheer.5': 'Der satt den!',
    'cheer.streak': '{cheer} {n} på rad!',
    'crack.1': 'Det kom en sprekk!',
    'crack.2': 'Enda en sprekk — det er nesten ute!',
    'hatch.stir': 'Noe rører seg der inne …',
    'hatch.now': 'Det klekket!',
    'hatch.hello': '{name} sier hei!',
    'evolve.now': 'Noe skjer …',
    'evolve.done': '{name} er nå {label}!',
    'form.2': 'den modige',
    'form.3': 'den store',

    'teach.nearMiss': 'Nesten! ',
    'teach.hourExact': 'Når klokka er {hour}, peker den korte tjukke viseren rett på {hourNum}-tallet.',
    'teach.hourPastHalf':
      'Den korte tjukke viseren er mer enn halvveis fra {hourNum} til {next} — men timen er fortsatt {hourNum}.',
    'teach.hourJustLeft':
      'Se på den korte tjukke viseren: {time} har den akkurat forlatt {hourNum}-tallet.',
    'teach.minuteOClock': 'Når klokka er {hour}, peker den lange viseren rett opp.',
    'teach.minuteCountOne': 'Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.',
    'teach.minuteCountMany': 'Tell rundt i femmere: {jumps} hopp forbi toppen er {minutes} minutter.',
    'teach.both': 'Her skal begge viserne stå når klokka er {time}.',

    'nap.title': 'Dyrene sover!',
    'nap.copy':
      'Det var en god økt. Alle tar seg en blund — du kan fortsatt besøke dem i dyrehagen.',
    'nap.countdown': 'Våkner om',
    'nap.wake': 'Vekk dyrene',
    'nap.visit': 'Besøk dyrehagen',
    'nap.sleeping': 'sover',

    'zoo.empty': 'Ingen dyr ennå! Still klokka riktig noen ganger, så klekkes det første egget ditt.',
    'zoo.egg': '{species}-egg',
    'zoo.eggTitle': 'Et kaldt egg',
    'zoo.eggTitleCracks': 'Et egg som slår sprekker, {n} av {of}',
    'zoo.rename': 'Hva heter dette dyret?',

    'habitat.back': 'Tilbake til dyrehagen',
    'habitat.rename': 'Gi dyret et nytt navn',
    'habitat.aria': 'Hjemmet til {name}',
    'habitat.eggAria': 'Hjemmet som venter på et {species}-egg',
    'habitat.hint': 'Kast ballen, gi en godbit, eller klapp {name}.',
    'habitat.eggHint': 'Dette hjemmet venter. Still klokka riktig, så klekkes egget.',
    'habitat.sleeping': '{name} sover godt. Hysj.',

    'unlock.title': 'Nye dyr har kommet!',
    'unlock.copy': '{tier} — {blurb}',
    'unlock.close': 'Kom igjen!',

    'howto.summary': 'Slik spiller du',
    'howto.1': 'Et dyr sier når det spiser. Dra viserne til det klokkeslettet.',
    'howto.2':
      'Den <b>lange tynne viseren</b> er minuttene — den hopper fem minutter om gangen. Den <b>korte tjukke viseren</b> er timen.',
    'howto.3':
      'Se hvordan den korte viseren sniker seg framover når du flytter den lange. Kvart over fire har den allerede forlatt 4-tallet — sånn funker en ekte klokke.',
    'howto.4': 'Klarer du samme klokkeslett fire ganger, sprekker egget til et dyr som blir ditt.',
    'howto.5':
      'Etter noen minutter blir dyrene trøtte, og spillet stopper. Du kan fortsatt gå rundt i dyrehagen mens de sover.',
    'howto.6': 'Voksne: hold inne tittelen for å se framgang.',

    'grownups.title': 'Framgang',
    'grownups.answered': 'Klokkeslett svart på',
    'grownups.accuracy': 'Riktig på første forsøk',
    'grownups.streak': 'Beste rekke',
    'grownups.hatched': 'Dyr klekket',
    'grownups.days': 'Dager spilt',
    'grownups.fine':
      'Klokkeslettene planlegges med en gjentakelsesalgoritme: hvert av dem kommer tilbake akkurat når det holder på å bli glemt. Alt lagres bare i denne nettleseren.',
    'grownups.close': 'Lukk',
    'grownups.reset': 'Start på nytt',
    'grownups.resetConfirm': 'Starte på nytt? Alle dyr og all framgang forsvinner.',

    'settings.title': 'Innstillinger',
    'settings.language': 'Språk',
    'settings.playTime': 'Spilletid',
    'settings.playTimeValue': '{n} minutter',
    'settings.playTimeHelp':
      'Hvor lenge en økt varer før dyrene må sove. Korte økter funker best — tre til fem minutter.',
    'settings.digital': 'Vis digital tid',
    'settings.digitalHelp':
      'Av til vanlig. Når den er av, sier dyrene måltidet sitt bare med ord, så urskiva er eneste stedet å lese det.',
    'settings.transfer': 'Flytt til en annen enhet',
    'settings.transferHelp':
      'Lagre dyrehagen som en fil, eller kopier den som en kode du kan sende i en melding. Åpner du en av delene på en annen enhet, blir alle dyrene med. Dyrehagen som allerede er der, blir erstattet.',
    'settings.done': 'Ferdig',

    'transfer.exportFile': 'Lagre fil',
    'transfer.copyCode': 'Kopier kode',
    'transfer.importFile': 'Åpne fil …',
    'transfer.pasteCode': 'Lim inn kode',
    'transfer.pastePrompt': 'Lim inn koden fra den andre enheten:',
    'transfer.confirm':
      'Erstatte dyrehagen på denne enheten med den du henter inn? Dyrene som er her nå, forsvinner.',
    'transfer.saved': 'Lagret {file}.',
    'transfer.copied': 'Koden er kopiert — lim den inn på den andre enheten.',
    'transfer.copyFailed': 'Fikk ikke tak i utklippstavla, så koden ble lagret som fil i stedet.',
    'transfer.imported': 'Hentet inn {n} dyr.',
    'transfer.badFile': 'Dette ser ikke ut som en lagret dyrehage.',
    'transfer.badApp': 'Den lagringa er fra et annet spill.',
    'transfer.badVersion': 'Den lagringa er fra en nyere utgave av Dyrehagen enn denne.',

    'tier.0.name': 'Hele timer',
    'tier.0.blurb': 'Den lange viseren peker rett opp.',
    'tier.1.name': 'Halve timer',
    'tier.1.blurb': 'Den lange viseren peker rett ned.',
    'tier.2.name': 'Kvart over og kvart på',
    'tier.2.blurb': 'Den lange viseren peker til siden.',
    'tier.3.name': 'Hvert femte minutt',
    'tier.3.blurb': 'Tell rundt skiva i femmere.',
  },
};

export const languageKeys = (lang) => Object.keys(STRINGS[lang] ?? {});

const fill = (template, params) =>
  params
    ? String(template).replace(/\{(\w+)\}/g, (whole, key) =>
        Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : whole
      )
    : String(template);

/**
 * A lookup bound to one language. A key missing from that language falls back to the
 * default language rather than rendering as a raw key — tests keep the two tables in
 * step, so this is a safety net, not the plan.
 */
export function translator(lang) {
  const table = STRINGS[lang] ?? STRINGS[DEFAULT_LANGUAGE];
  const fallback = STRINGS[DEFAULT_LANGUAGE];
  const t = (key, params) => fill(table[key] ?? fallback[key] ?? key, params);
  t.lang = STRINGS[lang] ? lang : DEFAULT_LANGUAGE;
  t.spoken = (h, m) => spokenTime(t.lang, h, m);
  t.hourWord = (h) => hourWord(t.lang, h);
  t.names = NAMES[t.lang] ?? NAMES[DEFAULT_LANGUAGE];
  return t;
}
