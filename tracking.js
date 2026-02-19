// tracking.js handles simple login and rendering of stored interactions
(function(){
  const LOGIN_USER = 'godddd';
  const LOGIN_PASS = 'loveeee';

  function formatTimestamp(ts){
    try{ return new Date(ts).toLocaleString(); }catch(e){return ts}
  }

  function getInteractions(){
    const raw = localStorage.getItem('userInteractions');
    try{ return raw? JSON.parse(raw) : []; }catch(e){ return []; }
  }

  // Basic device detection from userAgent
  function detectDevice(ua){
    ua = ua || (navigator && navigator.userAgent) || '';
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const type = isMobile ? 'Mobile' : 'Desktop';
    let os = 'Unknown';
    if(/Windows NT/i.test(ua)) os = 'Windows';
    else if(/Android/i.test(ua)) os = 'Android';
    else if(/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if(/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
    else if(/Linux/i.test(ua)) os = 'Linux';
    return { type, os, ua };
  }

  // If we're on login page
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      if(u === LOGIN_USER && p === LOGIN_PASS){
        sessionStorage.setItem('isAdmin', '1');
        // record admin login event
        const interactions = getInteractions();
        interactions.push({ timestamp: new Date().toISOString(), action: 'ADMIN_LOGIN', details: { user: u, userAgent: navigator.userAgent } });
        localStorage.setItem('userInteractions', JSON.stringify(interactions));
        window.location.href = 'tracking.html';
      } else {
        alert('Invalid credentials');
      }
    });
    return;
  }

  // If we're on tracking page
  const logsEl = document.getElementById('logs');
  const logoutBtn = document.getElementById('logoutBtn');
  if(logsEl){
    if(sessionStorage.getItem('isAdmin') !== '1'){
      // not authorized
      window.location.href = 'login.html';
      return;
    }

    function render(){
      const interactions = getInteractions().slice().reverse();
      logsEl.innerHTML = '';
      if(interactions.length === 0){
        logsEl.innerHTML = '<div class="log-item">No events recorded yet.</div>';
        return;
      }
      interactions.forEach(item =>{
        const div = document.createElement('div');
        div.className = 'log-item';
        let msg = item.action || '';
        // Human-friendly messages for yes/no clicks
        if(item.action === 'YES_BUTTON_CLICKED') msg = 'User clicked YES button';
        if(item.action === 'NO_BUTTON_CLICKED') msg = 'User clicked NO button';
        if(item.action === 'LOVE_BUTTON_CLICKED') msg = 'User clicked LOVE (entered app)';
        if(item.action === 'FLOWER_CREATED') msg = `Flower created at (${item.details?.x || '-'}, ${item.details?.y || '-'})`;
        if(item.action === 'SCREEN_TAP_COUNTED') msg = `Tap counted during No phase — currentCount: ${item.details?.currentCount ?? ''}`;
        if(item.action === 'NO_COUNT_COLLECTED') msg = `No count collected: ${item.details?.totalCount ?? ''}`;
        const time = formatTimestamp(item.timestamp || new Date().toISOString());
        const ua = item.details?.userAgent || item.userAgent || navigator.userAgent;
        const dev = detectDevice(ua);
        const deviceText = `${dev.type} / ${dev.os}`;
        div.textContent = `${time} — ${deviceText} — ${msg}`;
        logsEl.appendChild(div);
      });
    }

    logoutBtn.addEventListener('click', ()=>{
      sessionStorage.removeItem('isAdmin');
      window.location.href = 'login.html';
    });

    render();
  }
})();
