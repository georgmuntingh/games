import"./modulepreload-polyfill-B5Qt9EMX.js";const o=[{id:"click-counter",title:"Click Counter",description:"How fast can you click? Rack up as many clicks as possible in 10 seconds.",tags:["arcade","solo"]},{id:"guess-the-number",title:"Guess the Number",description:"Find the secret number between 1 and 100 in as few guesses as you can.",tags:["puzzle","solo"]},{id:"tetris",title:"Tetris",description:"Stack falling blocks to clear lines. Classic arcade puzzler with seven tetrominoes.",tags:["arcade","puzzle","solo"]},{id:"lr-bsplines",title:"Refinement",description:"Build locally refined B-spline bases interactively.",tags:["math","visualization","interactive"]}],l={games:o},r="/games/",d=document.getElementById("game-list"),u=document.getElementById("search"),m=document.getElementById("empty");function i(e){return String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function p(e,t){return t?[e.title,e.description,...e.tags||[]].join(" ").toLowerCase().includes(t):!0}function a(e=""){const t=e.trim().toLowerCase(),n=l.games.filter(s=>p(s,t));d.innerHTML=n.map(s=>`
        <li class="game-card">
          <a href="${r}games/${encodeURIComponent(s.id)}/">
            <h2>${i(s.title)}</h2>
            <p>${i(s.description)}</p>
            <div class="tags">
              ${(s.tags||[]).map(c=>`<span class="tag">${i(c)}</span>`).join("")}
            </div>
          </a>
        </li>
      `).join(""),m.hidden=n.length>0}u.addEventListener("input",e=>a(e.target.value));a();
