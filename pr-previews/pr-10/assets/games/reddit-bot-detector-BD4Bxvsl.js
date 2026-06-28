import"../modulepreload-polyfill-B5Qt9EMX.js";/* empty css            */import{P as D,r as j,e as Y,D as _,f as d,m as J,B as K}from"../scoring-oiJvq1Ux.js";const b=8,E="reddit-bot-detector-",m=`${E}history`,U=10,$=document.getElementById("start"),M=document.getElementById("round"),H=document.getElementById("scorecard"),B=document.getElementById("difficulty-list"),x=document.getElementById("history"),G=document.getElementById("progress"),W=document.getElementById("running-score"),X=document.getElementById("profile"),k=document.getElementById("verdict"),h=document.getElementById("vote-human"),v=document.getElementById("vote-bot"),N=document.getElementById("reveal"),S=document.getElementById("reveal-banner"),Z=document.getElementById("reveal-outcome"),q=document.getElementById("reveal-tells"),p=document.getElementById("next"),z=document.getElementById("metrics"),L=document.getElementById("best-note"),Q=document.getElementById("play-again"),V=document.getElementById("change-difficulty");function r(e,t){try{const n=localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}function y(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}const g=e=>`${E}best-${e}`,C=e=>`${E}seen-${e}`;let s=null;function I(e){for(const t of[$,M,H])t.hidden=t!==e}function O(){B.innerHTML="";for(const e of _){const t=r(g(e.id),null),n=document.createElement("button");n.type="button",n.className="difficulty-card",n.innerHTML=`
      <span class="diff-label">${e.label}</span>
      <span class="diff-blurb">${e.blurb}</span>
      <span class="diff-best">${t?`Best: ${d(t.accuracy)} acc · F1 ${d(t.f1)}`:"Not played yet"}</span>`,n.addEventListener("click",()=>R(e.id)),B.appendChild(n)}ee(),I($)}function ee(){const e=r(m,[]);if(!e.length){x.innerHTML="";return}const t=e.map(n=>`<li><span class="hist-diff">${n.difficulty}</span>
         <span>${d(n.accuracy)} acc · F1 ${d(n.f1)}</span>
         <span class="hist-date">${n.date}</span></li>`).join("");x.innerHTML=`<h3>Recent rounds</h3><ul class="history-list">${t}</ul>`}function te(e){const t=K[e]??[];let n=new Set(r(C(e),[])),l=t.filter(a=>!n.has(a.id));l.length<Math.min(b,t.length)&&(n=new Set,l=[...t]);const c=T(l).slice(0,Math.min(b,t.length));for(const a of c)n.add(a.id);return y(C(e),[...n]),T(c)}function T(e){const t=[...e];for(let n=t.length-1;n>0;n-=1){const l=Math.floor(Math.random()*(n+1));[t[n],t[l]]=[t[l],t[n]]}return t}function R(e){s={difficulty:e,profiles:te(e),index:0,tally:Y()},I(M),w()}function o(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function w(){const e=s.profiles[s.index];G.textContent=`Account ${s.index+1} of ${s.profiles.length}`;const{tp:t,fp:n,fn:l,tn:c}=s.tally,a=t+n+l+c;W.textContent=a?`${t+c}/${a} correct`:"";const f=ne(e.accountAgeDays),u=e.samplePosts.map(i=>`
      <li class="sample-post">
        <div class="sample-meta">
          <span class="sample-sub">${o(i.subreddit)}</span>
          <span class="sample-age">${o(i.age)} ago</span>
          <span class="sample-score">▲ ${o(String(i.score))}</span>
        </div>
        <p class="sample-text">${o(i.text)}</p>
      </li>`).join("");X.innerHTML=`
    <header class="profile-head">
      <span class="username">${o(e.username)}</span>
      ${e.bio?`<span class="bio">${o(e.bio)}</span>`:""}
    </header>
    <dl class="stats-grid">
      <div><dt>Account age</dt><dd>${f}</dd></div>
      <div><dt>Cake day</dt><dd>${o(e.cakeDay)}</dd></div>
      <div><dt>Post karma</dt><dd>${e.karma.post.toLocaleString()}</dd></div>
      <div><dt>Comment karma</dt><dd>${e.karma.comment.toLocaleString()}</dd></div>
    </dl>
    <div class="field">
      <span class="field-label">Active in</span>
      <span class="field-value">${e.subreddits.map(i=>`<code>${o(i)}</code>`).join(" ")}</span>
    </div>
    <div class="field">
      <span class="field-label">Posting pattern</span>
      <span class="field-value">${o(e.cadence)}</span>
    </div>
    <div class="field">
      <span class="field-label">Recent activity</span>
      <ul class="sample-list">${u}</ul>
    </div>`,N.hidden=!0,k.hidden=!1,h.disabled=!1,v.disabled=!1}function ne(e){return e<60?`${e} days`:e<730?`${Math.round(e/30)} months`:`${(e/365).toFixed(1)} years`}function F(e){const t=s.profiles[s.index],n=t.label==="bot";j(s.tally,e,n);const l=e===n;h.disabled=!0,v.disabled=!0,k.hidden=!0,S.textContent=l?`✓ Correct — this was a ${t.label}.`:`✗ Wrong — this was a ${t.label}, you said ${e?"bot":"human"}.`,S.className=`reveal-banner ${l?"correct":"incorrect"}`,Z.textContent=`Outcome: ${t.outcome}.`,q.innerHTML=t.tells.map(c=>`<li>${o(c)}</li>`).join(""),p.textContent=s.index+1<s.profiles.length?"Next →":"See results →",N.hidden=!1,p.focus()}function se(){s.index+=1,s.index<s.profiles.length?w():ce()}function ce(){const{tp:e,fp:t,fn:n,tn:l}=s.tally;document.getElementById("cell-tp").textContent=e,document.getElementById("cell-fp").textContent=t,document.getElementById("cell-fn").textContent=n,document.getElementById("cell-tn").textContent=l;const c=J(s.tally);z.innerHTML=[["Accuracy",c.accuracy],["Precision",c.precision],["Recall",c.recall],["F1 score",c.f1]].map(([P,A])=>`<li><span class="metric-name">${P}</span><span class="metric-val">${d(A)}</span></li>`).join("");const a=r(g(s.difficulty),null),f=!a||(c.accuracy??0)>(a.accuracy??0)||(c.accuracy??0)===(a.accuracy??0)&&(c.f1??0)>(a.f1??0),u=new Date().toISOString().slice(0,10);f?(y(g(s.difficulty),{accuracy:c.accuracy,f1:c.f1,date:u}),L.textContent="🏆 New best for this difficulty!"):L.textContent=a?`Best so far: ${d(a.accuracy)} acc · F1 ${d(a.f1)}`:"";const i=r(m,[]);i.unshift({difficulty:s.difficulty,accuracy:c.accuracy,f1:c.f1,date:u}),y(m,i.slice(0,U)),I(H)}h.addEventListener("click",()=>F(!1));v.addEventListener("click",()=>F(!0));p.addEventListener("click",se);Q.addEventListener("click",()=>R(s.difficulty));V.addEventListener("click",O);D.length?O():$.innerHTML="<p>No profiles available.</p>";
