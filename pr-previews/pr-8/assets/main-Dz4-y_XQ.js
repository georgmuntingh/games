import"./modulepreload-polyfill-B5Qt9EMX.js";const r=[{id:"click-counter",title:"Click Counter",description:"How fast can you click? Rack up as many clicks as possible in 10 seconds.",tags:["arcade","solo"]},{id:"guess-the-number",title:"Guess the Number",description:"Find the secret number between 1 and 100 in as few guesses as you can.",tags:["puzzle","solo"]},{id:"tetris",title:"Tetris",description:"Stack falling blocks to clear lines. Classic arcade puzzler with seven tetrominoes.",tags:["arcade","puzzle","solo"]},{id:"hex-minesweeper",title:"Hex Minesweeper",description:"Minesweeper on a hexagonal grid. Six neighbors per cell — flag the mines, reveal the rest.",tags:["puzzle","solo"]},{id:"lr-bsplines",title:"Refinement",description:"Build locally refined B-spline bases interactively.",tags:["math","visualization","interactive"]},{id:"cell-digitaltwin",title:"Cell Digital Twin",description:"A quantitative, literature-grounded model of a living cell: ion and metabolite concentrations and the membrane transporters that move them. Starts with the erythrocyte.",tags:["biology","simulation","visualization","interactive","education"]}],l={games:r},c="/games/pr-previews/pr-8/",d=document.getElementById("game-list"),p=document.getElementById("search"),u=document.getElementById("empty");function n(e){return String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function m(e,t){return t?[e.title,e.description,...e.tags||[]].join(" ").toLowerCase().includes(t):!0}function a(e=""){const t=e.trim().toLowerCase(),s=l.games.filter(i=>m(i,t));d.innerHTML=s.map(i=>`
        <li class="game-card">
          <a href="${c}games/${encodeURIComponent(i.id)}/">
            <h2>${n(i.title)}</h2>
            <p>${n(i.description)}</p>
            <div class="tags">
              ${(i.tags||[]).map(o=>`<span class="tag">${n(o)}</span>`).join("")}
            </div>
          </a>
        </li>
      `).join(""),u.hidden=s.length>0}p.addEventListener("input",e=>a(e.target.value));a();
