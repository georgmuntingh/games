import {
  parseVideoInput,
  parsePlaylistInput,
  parseChannelInput,
  parseRss,
  parseOpml,
  parseTakeoutCsv,
  isoDurationToSeconds,
  isShortVideo,
} from '../parse.js';
import { defaults, validate, migrate } from '../storage.js';

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assertEq(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg || ''}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertTrue(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

// --- video URL parsing ----------------------------------------------------

test('parseVideoInput: watch URL', () => {
  assertEq(parseVideoInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
});

test('parseVideoInput: watch URL with playlist and timestamp params', () => {
  assertEq(parseVideoInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL0123456789abcdefghijkl&t=42s'), 'dQw4w9WgXcQ');
});

test('parseVideoInput: youtu.be short link', () => {
  assertEq(parseVideoInput('https://youtu.be/dQw4w9WgXcQ?si=xyz'), 'dQw4w9WgXcQ');
});

test('parseVideoInput: shorts, embed, live paths', () => {
  assertEq(parseVideoInput('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assertEq(parseVideoInput('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assertEq(parseVideoInput('https://www.youtube.com/live/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
});

test('parseVideoInput: raw 11-char ID', () => {
  assertEq(parseVideoInput('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
});

test('parseVideoInput: rejects non-YouTube URLs and junk', () => {
  assertEq(parseVideoInput('https://vimeo.com/12345'), null);
  assertEq(parseVideoInput('https://example.com/watch?v=dQw4w9WgXcQ'), null);
  assertEq(parseVideoInput('hello world'), null);
});

// --- playlist parsing -------------------------------------------------------

test('parsePlaylistInput: playlist URL and raw ID', () => {
  assertEq(parsePlaylistInput('https://www.youtube.com/playlist?list=PL0123456789abcdefghijkl'), 'PL0123456789abcdefghijkl');
  assertEq(parsePlaylistInput('PL0123456789abcdefghijkl'), 'PL0123456789abcdefghijkl');
});

test('parsePlaylistInput: watch URL with list param', () => {
  assertEq(parsePlaylistInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL0123456789abcdefghijkl'), 'PL0123456789abcdefghijkl');
});

test('parsePlaylistInput: rejects junk', () => {
  assertEq(parsePlaylistInput('not-a-playlist'), null);
});

// --- channel parsing ----------------------------------------------------------

const UC = 'UCuAXFkgsw1L7xaCfnd5JJOw';

test('parseChannelInput: raw ID and /channel/ URL', () => {
  assertEq(parseChannelInput(UC).kind, 'id');
  const r = parseChannelInput(`https://www.youtube.com/channel/${UC}/videos`);
  assertEq(r.kind, 'id');
  assertEq(r.value, UC);
});

test('parseChannelInput: handle forms', () => {
  assertEq(parseChannelInput('@veritasium').kind, 'handle');
  assertEq(parseChannelInput('@veritasium').value, 'veritasium');
  const r = parseChannelInput('https://www.youtube.com/@veritasium/featured');
  assertEq(r.kind, 'handle');
  assertEq(r.value, 'veritasium');
});

test('parseChannelInput: /user/ and /c/ forms', () => {
  assertEq(parseChannelInput('https://www.youtube.com/user/someuser').kind, 'user');
  assertEq(parseChannelInput('https://www.youtube.com/c/SomeChannel').kind, 'custom');
});

test('parseChannelInput: RSS feed URL with channel_id', () => {
  const r = parseChannelInput(`https://www.youtube.com/feeds/videos.xml?channel_id=${UC}`);
  assertEq(r.kind, 'id');
  assertEq(r.value, UC);
});

test('parseChannelInput: junk is unknown', () => {
  assertEq(parseChannelInput('hello world').kind, 'unknown');
});

// --- RSS parsing ---------------------------------------------------------------

const RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns="http://www.w3.org/2005/Atom">
  <yt:channelId>${UC}</yt:channelId>
  <title>Test Channel</title>
  <entry>
    <yt:videoId>dQw4w9WgXcQ</yt:videoId>
    <title>First video</title>
    <published>2026-07-01T10:00:00+00:00</published>
    <author><name>Test Channel</name></author>
    <media:group>
      <media:thumbnail url="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" width="480" height="360"/>
      <media:description>A normal video description.</media:description>
    </media:group>
  </entry>
  <entry>
    <yt:videoId>abcdefghijk</yt:videoId>
    <title>Quick clip #shorts</title>
    <published>2026-07-02T10:00:00+00:00</published>
    <author><name>Test Channel</name></author>
    <media:group>
      <media:description>vertical video</media:description>
    </media:group>
  </entry>
</feed>`;

test('parseRss: channel info and entries', () => {
  const feed = parseRss(RSS_FIXTURE);
  assertEq(feed.channelId, UC);
  assertEq(feed.channelTitle, 'Test Channel');
  assertEq(feed.videos.length, 2);
  const [v1, v2] = feed.videos;
  assertEq(v1.videoId, 'dQw4w9WgXcQ');
  assertEq(v1.title, 'First video');
  assertEq(v1.author, 'Test Channel');
  assertEq(v1.thumbnail, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  assertEq(v2.thumbnail, 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg', 'fallback thumbnail');
});

test('parseRss: rejects invalid XML', () => {
  let threw = false;
  try {
    parseRss('this is not xml <<<');
  } catch {
    threw = true;
  }
  assertTrue(threw, 'should throw on invalid XML');
});

// --- OPML parsing ------------------------------------------------------------------

const OPML_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <body>
    <outline text="YouTube">
      <outline text="Test Channel" title="Test Channel" type="rss"
        xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=${UC}"/>
      <outline text="Unrelated feed" type="rss" xmlUrl="https://example.com/feed.xml"/>
    </outline>
  </body>
</opml>`;

test('parseOpml: extracts YouTube channels only', () => {
  const channels = parseOpml(OPML_FIXTURE);
  assertEq(channels.length, 1);
  assertEq(channels[0].id, UC);
  assertEq(channels[0].title, 'Test Channel');
});

// --- Takeout CSV parsing --------------------------------------------------------------

test('parseTakeoutCsv: standard export with quoted title', () => {
  const csv = `Channel Id,Channel Url,Channel Title\n${UC},http://www.youtube.com/channel/${UC},"Cool, ""Quoted"" Channel"\n`;
  const channels = parseTakeoutCsv(csv);
  assertEq(channels.length, 1);
  assertEq(channels[0].id, UC);
  assertEq(channels[0].title, 'Cool, "Quoted" Channel');
});

test('parseTakeoutCsv: rejects a file without Channel Id column', () => {
  let threw = false;
  try {
    parseTakeoutCsv('foo,bar\n1,2\n');
  } catch {
    threw = true;
  }
  assertTrue(threw);
});

// --- durations and shorts ----------------------------------------------------------------

test('isoDurationToSeconds', () => {
  assertEq(isoDurationToSeconds('PT4M13S'), 253);
  assertEq(isoDurationToSeconds('PT1H2M3S'), 3723);
  assertEq(isoDurationToSeconds('PT45S'), 45);
  assertEq(isoDurationToSeconds('P1DT2H'), 93600);
  assertEq(isoDurationToSeconds('garbage'), null);
});

test('isShortVideo: by duration when known', () => {
  assertTrue(isShortVideo({ title: 'Anything', durationSec: 45 }));
  assertTrue(!isShortVideo({ title: 'Quick clip #shorts', durationSec: 600 }), 'duration overrides tag');
});

test('isShortVideo: by tag when duration unknown', () => {
  assertTrue(isShortVideo({ title: 'Quick clip #shorts' }));
  assertTrue(isShortVideo({ title: 'Clip', descriptionSnippet: 'watch #short now' }));
  assertTrue(!isShortVideo({ title: 'Normal video about #shortwave radio' }), 'no false positive on longer words');
});

// --- storage validate / migrate --------------------------------------------------------------

test('validate: accepts defaults and rejects bad shapes', () => {
  assertEq(validate(defaults()), null);
  assertTrue(validate(null) !== null);
  assertTrue(validate({ version: 2 }) !== null, 'wrong version');
  assertTrue(validate({ version: 1, channels: 'nope' }) !== null, 'channels must be array');
  assertTrue(validate({ version: 1, watched: [] }) !== null, 'watched must be object');
});

test('migrate: fills missing fields and settings', () => {
  const migrated = migrate({ version: 1, channels: [{ id: 'UCx', title: 'X' }] });
  assertEq(migrated.channels.length, 1);
  assertTrue(Array.isArray(migrated.queue), 'queue default');
  assertEq(migrated.settings.feedTTLMinutes, 30, 'settings default');
  const partial = migrate({ version: 1, settings: { apiKey: 'k' } });
  assertEq(partial.settings.apiKey, 'k');
  assertEq(partial.settings.showShorts, false, 'missing setting filled');
});

// --- runner (same pattern as lr-bsplines) ------------------------------------

const out = document.getElementById('out');
out.textContent = '';
let passed = 0;
for (const { name, fn } of tests) {
  const div = document.createElement('div');
  try {
    fn();
    div.className = 'pass';
    div.textContent = `✓ ${name}`;
    passed++;
  } catch (err) {
    div.className = 'fail';
    div.textContent = `✗ ${name} — ${err.message}`;
  }
  out.append(div);
}
const summary = document.createElement('p');
summary.innerHTML = `<strong>${passed} / ${tests.length} passed</strong>`;
summary.className = passed === tests.length ? 'pass' : 'fail';
out.append(summary);
