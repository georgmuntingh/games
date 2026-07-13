import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{b as l,d as h,e as r,p as v,f as Q,h as f,i as u,a as c,v as d,q as k,t as p}from"../../parse-D61MdFtA.js";const w=[];function n(t,s){w.push({name:t,fn:s})}function e(t,s,o){if(t!==s)throw new Error(`${o||""}: expected ${JSON.stringify(s)}, got ${JSON.stringify(t)}`)}function a(t,s){if(!t)throw new Error(s||"assertion failed")}n("parseVideoInput: watch URL",()=>{e(l("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),"dQw4w9WgXcQ")});n("parseVideoInput: watch URL with playlist and timestamp params",()=>{e(l("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL0123456789abcdefghijkl&t=42s"),"dQw4w9WgXcQ")});n("parseVideoInput: youtu.be short link",()=>{e(l("https://youtu.be/dQw4w9WgXcQ?si=xyz"),"dQw4w9WgXcQ")});n("parseVideoInput: shorts, embed, live paths",()=>{e(l("https://www.youtube.com/shorts/dQw4w9WgXcQ"),"dQw4w9WgXcQ"),e(l("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),"dQw4w9WgXcQ"),e(l("https://www.youtube.com/live/dQw4w9WgXcQ"),"dQw4w9WgXcQ")});n("parseVideoInput: raw 11-char ID",()=>{e(l("dQw4w9WgXcQ"),"dQw4w9WgXcQ")});n("parseVideoInput: rejects non-YouTube URLs and junk",()=>{e(l("https://vimeo.com/12345"),null),e(l("https://example.com/watch?v=dQw4w9WgXcQ"),null),e(l("hello world"),null)});n("parsePlaylistInput: playlist URL and raw ID",()=>{e(h("https://www.youtube.com/playlist?list=PL0123456789abcdefghijkl"),"PL0123456789abcdefghijkl"),e(h("PL0123456789abcdefghijkl"),"PL0123456789abcdefghijkl")});n("parsePlaylistInput: watch URL with list param",()=>{e(h("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL0123456789abcdefghijkl"),"PL0123456789abcdefghijkl")});n("parsePlaylistInput: rejects junk",()=>{e(h("not-a-playlist"),null)});const i="UCuAXFkgsw1L7xaCfnd5JJOw";n("parseChannelInput: raw ID and /channel/ URL",()=>{e(r(i).kind,"id");const t=r(`https://www.youtube.com/channel/${i}/videos`);e(t.kind,"id"),e(t.value,i)});n("parseChannelInput: handle forms",()=>{e(r("@veritasium").kind,"handle"),e(r("@veritasium").value,"veritasium");const t=r("https://www.youtube.com/@veritasium/featured");e(t.kind,"handle"),e(t.value,"veritasium")});n("parseChannelInput: /user/ and /c/ forms",()=>{e(r("https://www.youtube.com/user/someuser").kind,"user"),e(r("https://www.youtube.com/c/SomeChannel").kind,"custom")});n("parseChannelInput: RSS feed URL with channel_id",()=>{const t=r(`https://www.youtube.com/feeds/videos.xml?channel_id=${i}`);e(t.kind,"id"),e(t.value,i)});n("parseChannelInput: junk is unknown",()=>{e(r("hello world").kind,"unknown")});const C=`<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns="http://www.w3.org/2005/Atom">
  <yt:channelId>${i}</yt:channelId>
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
</feed>`;n("parseRss: channel info and entries",()=>{const t=v(C);e(t.channelId,i),e(t.channelTitle,"Test Channel"),e(t.videos.length,2);const[s,o]=t.videos;e(s.videoId,"dQw4w9WgXcQ"),e(s.title,"First video"),e(s.author,"Test Channel"),e(s.thumbnail,"https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"),e(o.thumbnail,"https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg","fallback thumbnail")});n("parseRss: rejects invalid XML",()=>{let t=!1;try{v("this is not xml <<<")}catch{t=!0}a(t,"should throw on invalid XML")});const I=`<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <body>
    <outline text="YouTube">
      <outline text="Test Channel" title="Test Channel" type="rss"
        xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=${i}"/>
      <outline text="Unrelated feed" type="rss" xmlUrl="https://example.com/feed.xml"/>
    </outline>
  </body>
</opml>`;n("parseOpml: extracts YouTube channels only",()=>{const t=Q(I);e(t.length,1),e(t[0].id,i),e(t[0].title,"Test Channel")});n("parseTakeoutCsv: standard export with quoted title",()=>{const t=`Channel Id,Channel Url,Channel Title
${i},http://www.youtube.com/channel/${i},"Cool, ""Quoted"" Channel"
`,s=f(t);e(s.length,1),e(s[0].id,i),e(s[0].title,'Cool, "Quoted" Channel')});n("parseTakeoutCsv: rejects a file without Channel Id column",()=>{let t=!1;try{f(`foo,bar
1,2
`)}catch{t=!0}a(t)});n("isoDurationToSeconds",()=>{e(u("PT4M13S"),253),e(u("PT1H2M3S"),3723),e(u("PT45S"),45),e(u("P1DT2H"),93600),e(u("garbage"),null)});n("isShortVideo: by duration when known",()=>{a(c({title:"Anything",durationSec:45})),a(!c({title:"Quick clip #shorts",durationSec:600}),"duration overrides tag")});n("isShortVideo: by tag when duration unknown",()=>{a(c({title:"Quick clip #shorts"})),a(c({title:"Clip",descriptionSnippet:"watch #short now"})),a(!c({title:"Normal video about #shortwave radio"}),"no false positive on longer words")});n("validate: accepts defaults and rejects bad shapes",()=>{e(d(k()),null),a(d(null)!==null),a(d({version:2})!==null,"wrong version"),a(d({version:1,channels:"nope"})!==null,"channels must be array"),a(d({version:1,watched:[]})!==null,"watched must be object")});n("validate: rejects non-array localPlaylists",()=>{a(d({version:1,localPlaylists:{}})!==null),e(d({version:1,localPlaylists:[]}),null)});n("migrate: old backups without localPlaylists get an empty list",()=>{const t=p({version:1,channels:[]});a(Array.isArray(t.localPlaylists),"localPlaylists default"),e(t.localPlaylists.length,0)});n("migrate: fills missing fields and settings",()=>{const t=p({version:1,channels:[{id:"UCx",title:"X"}]});e(t.channels.length,1),a(Array.isArray(t.queue),"queue default"),e(t.settings.feedTTLMinutes,30,"settings default");const s=p({version:1,settings:{apiKey:"k"}});e(s.settings.apiKey,"k"),e(s.settings.showShorts,!1,"missing setting filled")});const m=document.getElementById("out");m.textContent="";let g=0;for(const{name:t,fn:s}of w){const o=document.createElement("div");try{s(),o.className="pass",o.textContent=`✓ ${t}`,g++}catch(b){o.className="fail",o.textContent=`✗ ${t} — ${b.message}`}m.append(o)}const y=document.createElement("p");y.innerHTML=`<strong>${g} / ${w.length} passed</strong>`;y.className=g===w.length?"pass":"fail";m.append(y);
