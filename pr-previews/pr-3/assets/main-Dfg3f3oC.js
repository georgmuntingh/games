import"./modulepreload-polyfill-B5Qt9EMX.js";const o=[{id:"click-counter",title:"Click Counter",description:"How fast can you click? Rack up as many clicks as possible in 10 seconds.",tags:["arcade","solo"]},{id:"guess-the-number",title:"Guess the Number",description:"Find the secret number between 1 and 100 in as few guesses as you can.",tags:["puzzle","solo"]},{id:"tetris",title:"Tetris",description:"Stack falling blocks to clear lines. Classic arcade puzzler with seven tetrominoes.",tags:["arcade","puzzle","solo"]},{id:"lr-bsplines",title:"Refinement",description:"Build locally refined B-spline bases interactively.",tags:["math","visualization","interactive"]}],r={games:o},l="/games/pr-previews/pr-3/",d=document.getElementById("game-list"),u=document.getElementById("search"),p=document.getElementById("empty");function n(e){return String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function m(e,t){return t?[e.title,e.description,...e.tags||[]].join(" ").toLowerCase().includes(t):!0}function a(e=""){const t=e.trim().toLowerCase(),i=r.games.filter(s=>m(s,t));d.innerHTML=i.map(s=>`
        <li class="game-card">
          <a href="${l}games/${encodeURIComponent(s.id)}/">
            <h2>${n(s.title)}</h2>
            <p>${n(s.description)}</p>
            <div class="tags">
              ${(s.tags||[]).map(c=>`<span class="tag">${n(c)}</span>`).join("")}
            </div>
          </a>
        </li>
      `).join(""),p.hidden=i.length>0}u.addEventListener("input",e=>a(e.target.value));a();
