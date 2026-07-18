import"../../modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{b as l,e as w,f as r,p as f,h as k,j as b,y as u,i as h,z as d,A as T,B as m,m as c}from"../../api-DoEtX2W_.js";const p=[];function s(t,n){p.push({name:t,fn:n})}function e(t,n,o){if(t!==n)throw new Error(`${o||""}: expected ${JSON.stringify(n)}, got ${JSON.stringify(t)}`)}function a(t,n){if(!t)throw new Error(n||"assertion failed")}s("parseVideoInput: watch URL",()=>{e(l("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),"dQw4w9WgXcQ")});s("parseVideoInput: watch URL with playlist and timestamp params",()=>{e(l("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL0123456789abcdefghijkl&t=42s"),"dQw4w9WgXcQ")});s("parseVideoInput: youtu.be short link",()=>{e(l("https://youtu.be/dQw4w9WgXcQ?si=xyz"),"dQw4w9WgXcQ")});s("parseVideoInput: shorts, embed, live paths",()=>{e(l("https://www.youtube.com/shorts/dQw4w9WgXcQ"),"dQw4w9WgXcQ"),e(l("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),"dQw4w9WgXcQ"),e(l("https://www.youtube.com/live/dQw4w9WgXcQ"),"dQw4w9WgXcQ")});s("parseVideoInput: raw 11-char ID",()=>{e(l("dQw4w9WgXcQ"),"dQw4w9WgXcQ")});s("parseVideoInput: rejects non-YouTube URLs and junk",()=>{e(l("https://vimeo.com/12345"),null),e(l("https://example.com/watch?v=dQw4w9WgXcQ"),null),e(l("hello world"),null)});s("parsePlaylistInput: playlist URL and raw ID",()=>{e(w("https://www.youtube.com/playlist?list=PL0123456789abcdefghijkl"),"PL0123456789abcdefghijkl"),e(w("PL0123456789abcdefghijkl"),"PL0123456789abcdefghijkl")});s("parsePlaylistInput: watch URL with list param",()=>{e(w("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL0123456789abcdefghijkl"),"PL0123456789abcdefghijkl")});s("parsePlaylistInput: rejects junk",()=>{e(w("not-a-playlist"),null)});const i="UCuAXFkgsw1L7xaCfnd5JJOw";s("parseChannelInput: raw ID and /channel/ URL",()=>{e(r(i).kind,"id");const t=r(`https://www.youtube.com/channel/${i}/videos`);e(t.kind,"id"),e(t.value,i)});s("parseChannelInput: handle forms",()=>{e(r("@veritasium").kind,"handle"),e(r("@veritasium").value,"veritasium");const t=r("https://www.youtube.com/@veritasium/featured");e(t.kind,"handle"),e(t.value,"veritasium")});s("parseChannelInput: /user/ and /c/ forms",()=>{e(r("https://www.youtube.com/user/someuser").kind,"user"),e(r("https://www.youtube.com/c/SomeChannel").kind,"custom")});s("parseChannelInput: RSS feed URL with channel_id",()=>{const t=r(`https://www.youtube.com/feeds/videos.xml?channel_id=${i}`);e(t.kind,"id"),e(t.value,i)});s("parseChannelInput: junk is unknown",()=>{e(r("hello world").kind,"unknown")});const C=`<?xml version="1.0" encoding="UTF-8"?>
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
</feed>`;s("parseRss: channel info and entries",()=>{const t=f(C);e(t.channelId,i),e(t.channelTitle,"Test Channel"),e(t.videos.length,2);const[n,o]=t.videos;e(n.videoId,"dQw4w9WgXcQ"),e(n.title,"First video"),e(n.author,"Test Channel"),e(n.thumbnail,"https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"),e(o.thumbnail,"https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg","fallback thumbnail")});s("parseRss: rejects invalid XML",()=>{let t=!1;try{f("this is not xml <<<")}catch{t=!0}a(t,"should throw on invalid XML")});const I=`<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <body>
    <outline text="YouTube">
      <outline text="Test Channel" title="Test Channel" type="rss"
        xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=${i}"/>
      <outline text="Unrelated feed" type="rss" xmlUrl="https://example.com/feed.xml"/>
    </outline>
  </body>
</opml>`;s("parseOpml: extracts YouTube channels only",()=>{const t=k(I);e(t.length,1),e(t[0].id,i),e(t[0].title,"Test Channel")});s("parseTakeoutCsv: standard export with quoted title",()=>{const t=`Channel Id,Channel Url,Channel Title
${i},http://www.youtube.com/channel/${i},"Cool, ""Quoted"" Channel"
`,n=b(t);e(n.length,1),e(n[0].id,i),e(n[0].title,'Cool, "Quoted" Channel')});s("parseTakeoutCsv: rejects a file without Channel Id column",()=>{let t=!1;try{b(`foo,bar
1,2
`)}catch{t=!0}a(t)});s("isoDurationToSeconds",()=>{e(u("PT4M13S"),253),e(u("PT1H2M3S"),3723),e(u("PT45S"),45),e(u("P1DT2H"),93600),e(u("garbage"),null)});s("isShortVideo: by duration when known",()=>{a(h({title:"Anything",durationSec:45})),a(!h({title:"Quick clip #shorts",durationSec:600}),"duration overrides tag")});s("isShortVideo: by tag when duration unknown",()=>{a(h({title:"Quick clip #shorts"})),a(h({title:"Clip",descriptionSnippet:"watch #short now"})),a(!h({title:"Normal video about #shortwave radio"}),"no false positive on longer words")});s("validate: accepts defaults and rejects bad shapes",()=>{e(d(T()),null),a(d(null)!==null),a(d({version:2})!==null,"wrong version"),a(d({version:1,channels:"nope"})!==null,"channels must be array"),a(d({version:1,watched:[]})!==null,"watched must be object")});s("validate: rejects non-array localPlaylists",()=>{a(d({version:1,localPlaylists:{}})!==null),e(d({version:1,localPlaylists:[]}),null)});s("migrate: old backups without localPlaylists get an empty list",()=>{const t=m({version:1,channels:[]});a(Array.isArray(t.localPlaylists),"localPlaylists default"),e(t.localPlaylists.length,0)});s("migrate: fills missing fields and settings",()=>{const t=m({version:1,channels:[{id:"UCx",title:"X"}]});e(t.channels.length,1),a(Array.isArray(t.queue),"queue default"),e(t.settings.feedTTLMinutes,30,"settings default");const n=m({version:1,settings:{apiKey:"k"}});e(n.settings.apiKey,"k"),e(n.settings.showShorts,!1,"missing setting filled"),e(n.settings.searchOrder,"date","search order defaults to newest first"),e(n.settings.searchPeriod,"","search period defaults to any time")});s("publishedAfterForPeriod",()=>{const t=Date.UTC(2026,6,18,12,0,0);e(c("",t),null),e(c("bogus",t),null),e(c("day",t),"2026-07-17T12:00:00.000Z"),e(c("week",t),"2026-07-11T12:00:00.000Z"),e(c("year",t),"2025-07-18T12:00:00.000Z")});const g=document.getElementById("out");g.textContent="";let y=0;for(const{name:t,fn:n}of p){const o=document.createElement("div");try{n(),o.className="pass",o.textContent=`✓ ${t}`,y++}catch(Q){o.className="fail",o.textContent=`✗ ${t} — ${Q.message}`}g.append(o)}const v=document.createElement("p");v.innerHTML=`<strong>${y} / ${p.length} passed</strong>`;v.className=y===p.length?"pass":"fail";g.append(v);
