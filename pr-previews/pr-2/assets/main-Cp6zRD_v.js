import"./modulepreload-polyfill-B5Qt9EMX.js";const o=[{id:"click-counter",title:"Click Counter",description:"How fast can you click? Rack up as many clicks as possible in 10 seconds.",tags:["arcade","solo"]},{id:"guess-the-number",title:"Guess the Number",description:"Find the secret number between 1 and 100 in as few guesses as you can.",tags:["puzzle","solo"]},{id:"tetris",title:"Tetris",description:"Stack falling blocks to clear lines. Classic arcade puzzler with seven tetrominoes.",tags:["arcade","puzzle","solo"]}],r={games:o},l="/games/pr-previews/pr-2/",d=document.getElementById("game-list"),u=document.getElementById("search"),p=document.getElementById("empty");function a(e){return String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function m(e,t){return t?[e.title,e.description,...e.tags||[]].join(" ").toLowerCase().includes(t):!0}function i(e=""){const t=e.trim().toLowerCase(),n=r.games.filter(s=>m(s,t));d.innerHTML=n.map(s=>`
        <li class="game-card">
          <a href="${l}games/${encodeURIComponent(s.id)}/">
            <h2>${a(s.title)}</h2>
            <p>${a(s.description)}</p>
            <div class="tags">
              ${(s.tags||[]).map(c=>`<span class="tag">${a(c)}</span>`).join("")}
            </div>
          </a>
        </li>
      `).join(""),p.hidden=n.length>0}u.addEventListener("input",e=>i(e.target.value));i();
