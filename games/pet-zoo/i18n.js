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

// Counting words, which are not the clock's words: Norwegian says "klokka ett" for the hour
// but "én pluss to" when counting, so HOUR_WORDS could not simply be extended.
const NUMBER_WORDS = {
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
    'nineteen', 'twenty'],
  nb: ['null', 'én', 'to', 'tre', 'fire', 'fem', 'seks', 'sju', 'åtte', 'ni', 'ti',
    'elleve', 'tolv', 'tretten', 'fjorten', 'femten', 'seksten', 'sytten', 'atten',
    'nitten', 'tjue'],
};

// Past twenty the two languages build numbers rather than list them, and they build them
// differently. English hyphenates and keeps its "and": forty-seven, four hundred and five.
// Norwegian runs the whole thing together as one word — førtisju — and the unit word changes
// when it is inside one: it is "én" standing alone but "en" in "tjueen". That is the same kind
// of trap as "klokka ett" against "én pluss to" above, and it is why the compounding path
// keeps its own list of units rather than reusing NUMBER_WORDS.
const TENS_WORDS = {
  en: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
  nb: ['', '', 'tjue', 'tretti', 'førti', 'femti', 'seksti', 'sytti', 'åtti', 'nitti'],
};

const COMPOUND_UNITS = {
  en: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
  nb: ['', 'en', 'to', 'tre', 'fire', 'fem', 'seks', 'sju', 'åtte', 'ni'],
};

/**
 * A number spelled out: "fifteen" / "femten", and on up to four digits, because a column sum
 * reaches into the hundreds and the aria-label is all a screen-reader user gets to hear.
 */
export function numberWord(lang, n) {
  const code = NUMBER_WORDS[lang] ? lang : DEFAULT_LANGUAGE;
  const value = Math.floor(Math.abs(Number(n)));
  if (!Number.isFinite(value)) return String(n);
  const listed = NUMBER_WORDS[code][value];
  if (listed) return listed;
  if (value > 9999) return String(value);
  if (value >= 1000) return thousands(code, value);
  if (value >= 100) return hundreds(code, value);
  return tensAndUnits(code, value);
}

function tensAndUnits(lang, n) {
  const ten = Math.floor(n / 10);
  const unit = n % 10;
  const tenWord = TENS_WORDS[lang][ten];
  if (!unit) return tenWord;
  return lang === 'en'
    ? `${tenWord}-${COMPOUND_UNITS.en[unit]}`
    : `${tenWord}${COMPOUND_UNITS.nb[unit]}`;
}

function hundreds(lang, n) {
  const count = Math.floor(n / 100);
  const rest = n % 100;
  const head =
    lang === 'en'
      ? `${COMPOUND_UNITS.en[count]} hundred`
      : `${count === 1 ? 'ett' : COMPOUND_UNITS.nb[count]} hundre`;
  if (!rest) return head;
  const tail = NUMBER_WORDS[lang][rest] ?? tensAndUnits(lang, rest);
  return `${head} og ${tail}`.replace(' og ', lang === 'en' ? ' and ' : ' og ');
}

function thousands(lang, n) {
  const count = Math.floor(n / 1000);
  const rest = n % 1000;
  const head =
    lang === 'en'
      ? `${COMPOUND_UNITS.en[count]} thousand`
      : `${count === 1 ? 'ett' : COMPOUND_UNITS.nb[count]} tusen`;
  if (!rest) return head;
  const tail = rest >= 100 ? hundreds(lang, rest) : NUMBER_WORDS[lang][rest] ?? tensAndUnits(lang, rest);
  return `${head} ${tail}`;
}

/** A sum as a person would say it: "seven plus eight" / "sju pluss åtte". */
export const spokenSum = (lang, a, b) => spokenFact(lang, { op: '+', a, b });

/** And any of the four ways this game writes a question down. */
export const spokenFact = (lang, { op = '+', a, b } = {}) => {
  const code = NUMBER_WORDS[lang] ? lang : DEFAULT_LANGUAGE;
  const joiner = code === 'en' ? (op === '-' ? 'minus' : 'plus') : op === '-' ? 'minus' : 'pluss';
  return `${numberWord(code, a)} ${joiner} ${numberWord(code, b)}`;
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

    'grownups.practise': 'What to practise',
    'grownups.practiseHelp':
      'Switch off anything they do not need just now, or skip the rungs they have already got. Pets from anything switched off go and rest — they keep everything they have earned, they stop getting hungry, and they carry on exactly where they left off if you switch it back on.',
    'grownups.skip': 'Skip this',
    'grownups.practiseThis': 'Practise this',
    'grownups.skipped': 'skipped',
    'grownups.lastSubject': 'There has to be something left to practise.',
    'subject.clock': 'The clock',
    'subject.math': 'Maths',
    'zoo.resting': '{name} is resting',
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

    'coins.name': 'gold coins',
    'coins.balance': '{n} gold coins',
    'coins.earned': '+{n}',

    'shop.open': 'Go to the shop',
    'shop.title': 'The zoo shop',
    'shop.intro': 'Something nice for one of your pets.',
    'shop.forPet': 'Shopping for {name}',
    'shop.pickPet': 'Whose home is it for?',
    'shop.empty': 'No pets yet! Hatch your first egg and the shop will open.',
    'shop.locked': 'Locked',
    'shop.lockedHelp': 'Learn more times to open this one.',
    'shop.owned': 'In {name}’s home',
    'shop.full': '{name}’s home is full. Sell something to make room.',
    'shop.tooDear': 'Not enough coins yet.',
    'shop.buy': 'Buy it!',
    'shop.cancel': 'Not yet',
    'shop.confirm': '{item} — put it in {name}’s home for {price} gold coins?',
    'shop.bought': '{name} loves it!',
    'shop.sell': 'Sell it back',
    'shop.sellConfirm': '{item} — sell it back? You get all {price} gold coins again.',
    'shop.sold': 'Sold — {price} gold coins back.',
    'shop.close': 'Done',
    'shop.tabHome': 'The pets’ homes',
    'shop.tabZoo': 'The whole zoo',
    'shop.ownedZoo': 'In the zoo',
    'shop.fullBackdrop': 'There is already something far away at {name}’s. Sell it to make room.',
    'shop.fullZoo': 'The zoo yard is full. Sell something to make room.',
    'shop.confirmZoo': '{item} — put it in the zoo for {price} gold coins?',
    'shop.boughtZoo': 'It looks lovely out there!',
    'yard.label': 'The zoo yard',


    'shop.flowerbed': 'Flower bed',
    'shop.lantern': 'Lantern',
    'shop.house': 'Little house',
    'shop.swing': 'Swing',
    'shop.pond': 'Pond',
    'shop.hammock': 'Hammock',
    'shop.arch': 'Flower arch',
    'shop.windmill': 'Windmill',
    'shop.stump': 'Tree stump',
    'shop.sandpit': 'Sandpit',
    'shop.beehive': 'Beehive',
    'shop.feeder': 'Bird feeder',
    'shop.farGrove': 'Faraway trees',
    'shop.farMill': 'Faraway mill',
    'shop.farArch': 'Faraway gateway',
    'shop.farTower': 'Faraway tower',
    'shop.signpost': 'Signpost',
    'shop.topiary': 'Trimmed tree',
    'shop.bunting': 'Bunting',
    'shop.pathLamps': 'Path lamps',
    'shop.fountain': 'Fountain',
    'shop.statue': 'Statue',

    'prompt.sumEgg': 'A chilly egg! Warm it up:',
    'prompt.sumEgg1': 'The egg is stirring! Keep going:',
    'prompt.sumEgg2': 'It is cracking open! One more:',
    'prompt.sumForgot': '{name} forgot their snack. It is:',
    'prompt.sumHungry': '{name} is hungry! Their snack is:',
    'prompt.sumSnack': '{name} fancies a snack:',
    'teach.sumOffByOne': 'Just one out — count once more.',
    'teach.sumTransposed': 'The right digits, the other way round.',
    'teach.sumGaveAddend': 'That is one of the numbers on its own.',
    'teach.sumGaveDifference': 'That is taking them apart, not putting them together.',
    'teach.sumPlain': '{a} and {b} makes {sum}.',
    'teach.sumMakeTen': '{a} and {bridge} makes ten, then {rest} more — {sum}.',
    'tier.math.0.name': 'Counting on',
    'tier.math.0.blurb': 'Adding nothing, and adding one.',
    'tier.math.1.name': 'Sums to ten',
    'tier.math.1.blurb': 'Everything that fits in one ten-frame.',
    'tier.math.2.name': 'Doubles',
    'tier.math.2.blurb': 'Two of the same, past ten.',
    'tier.math.3.name': 'Adding ten',
    'tier.math.3.blurb': 'The answer is already in the question.',
    'tier.math.4.name': 'Over the ten',
    'tier.math.4.blurb': 'Make ten first, then add the rest.',
    'tier.math.5.name': 'Taking one away',
    'tier.math.5.blurb': 'Taking away nothing, and taking away one.',
    'tier.math.6.name': 'Under ten',
    'tier.math.6.blurb': 'Differences that stay inside one ten-frame.',
    'tier.math.7.name': 'Back down to ten',
    'tier.math.7.blurb': 'Take away just enough to land on the ten.',
    'tier.math.8.name': 'Halving the doubles',
    'tier.math.8.blurb': 'Sixteen take eight — the doubles undone.',
    'tier.math.9.name': 'Taking ten away',
    'tier.math.9.blurb': 'One digit moves and the other stays put.',
    'tier.math.10.name': 'Back under the ten',
    'tier.math.10.blurb': 'Down to ten first, then take the rest.',
    'tier.math.11.name': 'Whole tens',
    'tier.math.11.blurb': 'Thirty and forty, if you know three and four.',
    'tier.math.12.name': 'Tens and ones',
    'tier.math.12.blurb': 'One digit changes and the other keeps still.',
    'tier.math.13.name': 'Columns, no carrying',
    'tier.math.13.blurb': 'Line them up and add each column on its own.',
    'tier.math.14.name': 'Columns with carrying',
    'tier.math.14.blurb': 'A ten in one column moves next door.',
    'tier.math.15.name': 'Three-digit columns',
    'tier.math.15.blurb': 'Carrying twice, all the way along.',
    'tier.math.16.name': 'Columns, no borrowing',
    'tier.math.16.blurb': 'Take each column away on its own.',
    'tier.math.17.name': 'Columns with borrowing',
    'tier.math.17.blurb': 'Borrow a ten, and pay next door back.',
    'tier.math.18.name': 'Borrowing past a zero',
    'tier.math.18.blurb': 'When the next column has nothing to lend.',
    'group.plus': 'Adding',
    'group.minus': 'Taking away',
    'group.tens': 'Tens and ones',
    'group.column': 'Columns',
    'prompt.colEgg': 'A chilly egg! Set it out and work it out:',
    'prompt.colEgg1': 'The egg is stirring! Column by column:',
    'prompt.colEgg2': 'It is cracking open! One more sum:',
    'prompt.colForgot': '{name} forgot their snack. Work it out:',
    'prompt.colHungry': '{name} is hungry! Their snack is this sum:',
    'prompt.colSnack': '{name} fancies a snack. Column by column:',
    'teach.subGaveSum': 'That is them put together, not taken apart.',
    'teach.subReversed': 'The other way round — the big number goes first.',
    'teach.subGaveOperand': 'That is one of the numbers on its own.',
    'teach.subPlain': '{a} take away {b} leaves {rest}.',
    'teach.subFamily': 'You know {small} + {large} = {a}, so {a} − {b} = {rest}.',
    'teach.colFullSum': 'A column only keeps one digit — the rest carries.',
    'teach.colForgotCarry': 'The ten from that column has to go next door.',
    'teach.colCarryWrongColumn': 'The carry goes one column left, not two.',
    'teach.colCarriedIntoOwnColumn': 'The carry goes next door, not back where it came from.',
    'teach.colSmallerFromLarger': 'The top number is the one being taken from, every time.',
    'teach.colForgotBorrow': 'Borrowing a ten costs the next column one.',
    'teach.colBorrowAcrossZero': 'A zero has nothing to lend, so it borrows first.',
    'teach.colAddedInstead': 'That is a plus, and this one is a minus.',
    'teach.colSubtractedInstead': 'That is a minus, and this one is a plus.',
    'teach.colPlaceValueOff': 'The right digits, but one is in the wrong column.',
    'teach.colAddPlain': '{a} and {b} makes {total}.',
    'teach.colSubPlain': '{a} take away {b} leaves {total}.',
    'answer.carryOn': 'Carry written down — tap to rub it out',
    'answer.carryOff': 'Somewhere to write the carry',
    'skill.tens+': 'Whole tens +',
    'skill.tens-': 'Whole tens −',
    'skill.pv+': 'Tens and ones +',
    'skill.pv-': 'Tens and ones −',
    'skill.pv10': 'Add and take ten',
    'skill.col+2': 'Column +',
    'skill.col+21': 'Column + ones',
    'skill.col+2c': 'Column + carry',
    'skill.col+21c': 'Ones with carry',
    'skill.col+3': 'Three-digit +',
    'skill.col+32': 'Three plus two digits',
    'skill.col-2': 'Column −',
    'skill.col-21': 'Column − ones',
    'skill.col-2b': 'Column − borrow',
    'skill.col-21b': 'Ones with borrow',
    'skill.col-3': 'Three-digit −',
    'skill.col-32': 'Three minus two digits',
    'answer.aria': 'Your answer',
    'answer.empty': 'nothing yet',
    'answer.keypad': 'Number buttons',
    'answer.digit': 'Put down {n}',
    'answer.clear': 'Clear',
    'settings.answerMode': 'Answering',
    'settings.answerAuto': 'Automatic',
    'settings.answerType': 'Typing',
    'settings.answerTap': 'Buttons',
    'answer.writeHere': 'Write here',
    'answer.reads': 'reads {n}',
    'answer.orThis': 'or {n}?',
    'answer.fixTitle': 'Which number was it?',
    'answer.fixHint': 'Tap what it reads to put it right.',
    'answer.mirrored': 'You wrote it the other way round. It usually goes like this:',
    'answer.undo': 'Undo',
    'settings.answerWrite': 'Writing',
    'settings.mirrorNudge': 'Practise which way numbers face',
    'settings.mirrorNudgeHelp':
      'Off to begin with. A backwards number always counts — writing 3 and 5 the other way round is ordinary at this age. With this on, the game also shows which way they usually go.',
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

    'grownups.practise': 'Hva som øves på',
    'grownups.practiseHelp':
      'Skru av det de ikke trenger akkurat nå, eller hopp over trinnene de allerede kan. Dyr fra noe som er skrudd av går og hviler — de beholder alt de har tjent opp, de blir ikke sultne, og de fortsetter nøyaktig der de slapp hvis du skrur det på igjen.',
    'grownups.skip': 'Hopp over',
    'grownups.practiseThis': 'Øv på denne',
    'grownups.skipped': 'hoppet over',
    'grownups.lastSubject': 'Det må være noe igjen å øve på.',
    'subject.clock': 'Klokka',
    'subject.math': 'Matte',
    'zoo.resting': '{name} hviler',
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

    'coins.name': 'gullmynter',
    'coins.balance': '{n} gullmynter',
    'coins.earned': '+{n}',

    'shop.open': 'Gå til butikken',
    'shop.title': 'Dyrehagebutikken',
    'shop.intro': 'Noe fint til ett av dyra dine.',
    'shop.forPet': 'Handler til {name}',
    'shop.pickPet': 'Hvem skal det være til?',
    'shop.empty': 'Ingen dyr ennå! Klekk det første egget, så åpner butikken.',
    'shop.locked': 'Låst',
    'shop.lockedHelp': 'Lær flere klokkeslett for å åpne denne.',
    'shop.owned': 'Hjemme hos {name}',
    'shop.full': 'Det er fullt hos {name}. Selg noe for å få plass.',
    'shop.tooDear': 'Ikke nok mynter ennå.',
    'shop.buy': 'Kjøp!',
    'shop.cancel': 'Ikke nå',
    'shop.confirm': '{item} — sette den hjemme hos {name} for {price} gullmynter?',
    'shop.bought': '{name} elsker den!',
    'shop.sell': 'Selg tilbake',
    'shop.sellConfirm': '{item} — selge den tilbake? Du får alle {price} gullmyntene igjen.',
    'shop.sold': 'Solgt — {price} gullmynter tilbake.',
    'shop.close': 'Ferdig',
    'shop.tabHome': 'Hjemme hos dyra',
    'shop.tabZoo': 'Hele dyrehagen',
    'shop.ownedZoo': 'I dyrehagen',
    'shop.fullBackdrop': 'Det står noe langt borte hos {name} fra før. Selg det for å få plass.',
    'shop.fullZoo': 'Plassen ute i dyrehagen er full. Selg noe for å få plass.',
    'shop.confirmZoo': '{item} — sette den ut i dyrehagen for {price} gullmynter?',
    'shop.boughtZoo': 'Så fint det ble ute!',
    'yard.label': 'Dyrehageplassen',


    'shop.flowerbed': 'Blomsterbed',
    'shop.lantern': 'Lykt',
    'shop.house': 'Lite hus',
    'shop.swing': 'Huske',
    'shop.pond': 'Dam',
    'shop.hammock': 'Hengekøye',
    'shop.arch': 'Blomsterbue',
    'shop.windmill': 'Vindmølle',
    'shop.stump': 'Trestubbe',
    'shop.sandpit': 'Sandkasse',
    'shop.beehive': 'Bikube',
    'shop.feeder': 'Fuglemater',
    'shop.farGrove': 'Trær langt borte',
    'shop.farMill': 'Mølle langt borte',
    'shop.farArch': 'Port langt borte',
    'shop.farTower': 'Tårn langt borte',
    'shop.signpost': 'Skilt',
    'shop.topiary': 'Formklippet tre',
    'shop.bunting': 'Vimpler',
    'shop.pathLamps': 'Lykter langs stien',
    'shop.fountain': 'Fontene',
    'shop.statue': 'Statue',

    'prompt.sumEgg': 'Et kaldt egg! Varm det opp:',
    'prompt.sumEgg1': 'Egget rører på seg! Fortsett:',
    'prompt.sumEgg2': 'Det slår sprekker! Én til:',
    'prompt.sumForgot': '{name} har glemt matbiten sin. Den er:',
    'prompt.sumHungry': '{name} er sulten! Matbiten er:',
    'prompt.sumSnack': '{name} vil gjerne ha en matbit:',
    'teach.sumOffByOne': 'Bare én bom — tell en gang til.',
    'teach.sumTransposed': 'Riktige sifre, men i feil rekkefølge.',
    'teach.sumGaveAddend': 'Det er bare det ene tallet.',
    'teach.sumGaveDifference': 'Det er å ta dem fra hverandre, ikke å legge dem sammen.',
    'teach.sumPlain': '{a} og {b} blir {sum}.',
    'teach.sumMakeTen': '{a} og {bridge} blir ti, så {rest} til — {sum}.',
    'tier.math.0.name': 'Telle videre',
    'tier.math.0.blurb': 'Å legge til ingenting, og å legge til én.',
    'tier.math.1.name': 'Summer opp til ti',
    'tier.math.1.blurb': 'Alt som får plass i én tierramme.',
    'tier.math.2.name': 'Dobler',
    'tier.math.2.blurb': 'To like, over ti.',
    'tier.math.3.name': 'Legge til ti',
    'tier.math.3.blurb': 'Svaret står allerede i oppgaven.',
    'tier.math.4.name': 'Over tieren',
    'tier.math.4.blurb': 'Lag ti først, så legger du til resten.',
    'tier.math.5.name': 'Trekke fra én',
    'tier.math.5.blurb': 'Å trekke fra ingenting, og å trekke fra én.',
    'tier.math.6.name': 'Minus under ti',
    'tier.math.6.blurb': 'Differanser som holder seg i én tierramme.',
    'tier.math.7.name': 'Ned til ti',
    'tier.math.7.blurb': 'Trekk fra akkurat nok til å lande på tieren.',
    'tier.math.8.name': 'Halve doblene',
    'tier.math.8.blurb': 'Seksten minus åtte — doblene baklengs.',
    'tier.math.9.name': 'Trekke fra ti',
    'tier.math.9.blurb': 'Ett siffer flytter seg, det andre står stille.',
    'tier.math.10.name': 'Tilbake under tieren',
    'tier.math.10.blurb': 'Ned til ti først, så trekker du fra resten.',
    'tier.math.11.name': 'Hele tiere',
    'tier.math.11.blurb': 'Tretti og førti, når du kan tre og fire.',
    'tier.math.12.name': 'Tiere og enere',
    'tier.math.12.blurb': 'Ett siffer endrer seg, det andre står i ro.',
    'tier.math.13.name': 'Oppstilling uten mente',
    'tier.math.13.blurb': 'Sett dem under hverandre og legg sammen hver kolonne.',
    'tier.math.14.name': 'Oppstilling med mente',
    'tier.math.14.blurb': 'En tier i én kolonne flytter til naboen.',
    'tier.math.15.name': 'Tresifret oppstilling',
    'tier.math.15.blurb': 'Mente to ganger, hele veien bortover.',
    'tier.math.16.name': 'Oppstilling uten veksling',
    'tier.math.16.blurb': 'Trekk fra hver kolonne for seg.',
    'tier.math.17.name': 'Oppstilling med veksling',
    'tier.math.17.blurb': 'Lån en tier, og betal naboen tilbake.',
    'tier.math.18.name': 'Veksling forbi null',
    'tier.math.18.blurb': 'Når nabokolonnen ikke har noe å låne bort.',
    'group.plus': 'Pluss',
    'group.minus': 'Minus',
    'group.tens': 'Tiere og enere',
    'group.column': 'Oppstilling',
    'prompt.colEgg': 'Et kaldt egg! Still opp og regn ut:',
    'prompt.colEgg1': 'Egget rører på seg! Kolonne for kolonne:',
    'prompt.colEgg2': 'Det slår sprekker! Ett stykke til:',
    'prompt.colForgot': '{name} har glemt matpakka. Regn ut:',
    'prompt.colHungry': '{name} er sulten! Maten er dette stykket:',
    'prompt.colSnack': '{name} har lyst på litt mat. Kolonne for kolonne:',
    'teach.subGaveSum': 'Det er dem lagt sammen, ikke trukket fra.',
    'teach.subReversed': 'Motsatt vei — det største tallet står først.',
    'teach.subGaveOperand': 'Det er det ene tallet helt for seg selv.',
    'teach.subPlain': '{a} minus {b} blir {rest}.',
    'teach.subFamily': 'Du kan {small} + {large} = {a}, så {a} − {b} = {rest}.',
    'teach.colFullSum': 'En kolonne beholder bare ett siffer — resten blir mente.',
    'teach.colForgotCarry': 'Tieren fra den kolonnen må flyttes til naboen.',
    'teach.colCarryWrongColumn': 'Menten flyttes én kolonne til venstre, ikke to.',
    'teach.colCarriedIntoOwnColumn': 'Menten går til naboen, ikke tilbake dit den kom fra.',
    'teach.colSmallerFromLarger': 'Det er alltid det øverste tallet det trekkes fra.',
    'teach.colForgotBorrow': 'Å låne en tier koster nabokolonnen én.',
    'teach.colBorrowAcrossZero': 'En null har ingenting å låne bort, så den må låne selv.',
    'teach.colAddedInstead': 'Det er et pluss, og dette er et minus.',
    'teach.colSubtractedInstead': 'Det er et minus, og dette er et pluss.',
    'teach.colPlaceValueOff': 'Riktige siffer, men ett av dem står i feil kolonne.',
    'teach.colAddPlain': '{a} og {b} blir {total}.',
    'teach.colSubPlain': '{a} minus {b} blir {total}.',
    'answer.carryOn': 'Mente skrevet opp — trykk for å viske ut',
    'answer.carryOff': 'Plass til å skrive menten',
    'skill.tens+': 'Hele tiere +',
    'skill.tens-': 'Hele tiere −',
    'skill.pv+': 'Tier og ener +',
    'skill.pv-': 'Tier og ener −',
    'skill.pv10': 'Pluss og minus ti',
    'skill.col+2': 'Oppstilling +',
    'skill.col+21': 'Oppstilling + ener',
    'skill.col+2c': 'Oppstilling + mente',
    'skill.col+21c': 'Ener med mente',
    'skill.col+3': 'Tresifret +',
    'skill.col+32': 'Tresifret pluss tosifret',
    'skill.col-2': 'Oppstilling −',
    'skill.col-21': 'Oppstilling − ener',
    'skill.col-2b': 'Oppstilling − veksling',
    'skill.col-21b': 'Ener med veksling',
    'skill.col-3': 'Tresifret −',
    'skill.col-32': 'Tresifret minus tosifret',
    'answer.aria': 'Svaret ditt',
    'answer.empty': 'ingenting ennå',
    'answer.keypad': 'Talltaster',
    'answer.digit': 'Sett inn {n}',
    'answer.clear': 'Tøm',
    'settings.answerMode': 'Svarer med',
    'settings.answerAuto': 'Automatisk',
    'settings.answerType': 'Tastatur',
    'settings.answerTap': 'Knapper',
    'answer.writeHere': 'Skriv her',
    'answer.reads': 'leser {n}',
    'answer.orThis': 'eller {n}?',
    'answer.fixTitle': 'Hvilket tall var det?',
    'answer.fixHint': 'Trykk på det den leser for å rette det.',
    'answer.mirrored': 'Du skrev det motsatt vei. Sånn pleier det å se ut:',
    'answer.undo': 'Angre',
    'settings.answerWrite': 'Skriving',
    'settings.mirrorNudge': 'Øv på hvilken vei tallene vender',
    'settings.mirrorNudgeHelp':
      'Av til å begynne med. Et speilvendt tall teller alltid — å skrive 3 og 5 motsatt vei er helt vanlig i denne alderen. Er denne på, viser spillet også hvilken vei de vanligvis vender.',
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
  t.spokenSum = (a, b) => spokenSum(t.lang, a, b);
  // Whatever is on screen, said out loud — the only thing a screen-reader user has to go on,
  // and the caption the ten-frame and the column walkthrough are labelled with.
  t.spokenQuestion = (question) => spokenFact(t.lang, question ?? {});
  t.number = (n) => numberWord(t.lang, n);
  t.hourWord = (h) => hourWord(t.lang, h);
  t.names = NAMES[t.lang] ?? NAMES[DEFAULT_LANGUAGE];
  return t;
}
