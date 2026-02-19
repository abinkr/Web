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

  // Basic device detection from userAgent and screen size
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
    const screenWidth = (window && window.screen && window.screen.width) ? window.screen.width : null;
    const screenHeight = (window && window.screen && window.screen.height) ? window.screen.height : null;
    return { type, os, ua, screenWidth, screenHeight };
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
        const screenSize = (window && window.screen) ? `${window.screen.width}x${window.screen.height}` : null;
        interactions.push({ timestamp: new Date().toISOString(), action: 'ADMIN_LOGIN', details: { user: u, userAgent: navigator.userAgent, screenSize } });
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
      const interactions = getInteractions();
      const reversed = interactions.slice().reverse();
      logsEl.innerHTML = '';
      if(reversed.length === 0){
        logsEl.innerHTML = '<div class="log-item">No events recorded yet.</div>';
        return;
      }
      reversed.forEach((item, i) =>{
        const div = document.createElement('div');
        div.className = 'log-item';

        let msg = item.action || '';
        if(item.action === 'YES_BUTTON_CLICKED') msg = 'User clicked YES button';
        if(item.action === 'NO_BUTTON_CLICKED') msg = 'User clicked NO button';
        if(item.action === 'LOVE_BUTTON_CLICKED') msg = 'User clicked LOVE (entered app)';
        if(item.action === 'FLOWER_CREATED') msg = `Flower created at (${item.details?.x || '-'}, ${item.details?.y || '-'})`;
        if(item.action === 'SCREEN_TAP_COUNTED') msg = `Tap counted during No phase — currentCount: ${item.details?.currentCount ?? ''}`;
        if(item.action === 'NO_COUNT_COLLECTED') msg = `No count collected: ${item.details?.totalCount ?? ''}`;

        const time = formatTimestamp(item.timestamp || new Date().toISOString());
        const ua = item.details?.userAgent || item.userAgent || navigator.userAgent;
        const dev = detectDevice(ua);
        const screenText = item.details?.screenSize || (dev.screenWidth && dev.screenHeight ? `${dev.screenWidth}x${dev.screenHeight}` : 'unknown');
        const deviceText = `${dev.type} / ${dev.os} / ${screenText}`;

        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.flexDirection = 'column';
        left.style.gap = '4px';

        const line = document.createElement('div');
        line.textContent = `${time} — ${msg}`;
        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = deviceText;

        left.appendChild(line);
        left.appendChild(meta);

        const controls = document.createElement('div');
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = 'Delete';
        // compute original index in stored array
        const originalIndex = interactions.length - 1 - i;
        delBtn.addEventListener('click', ()=>{
          if(!confirm('Delete this log entry?')) return;
          deleteEntry(originalIndex);
        });
        controls.appendChild(delBtn);

        div.appendChild(left);
        div.appendChild(controls);
        logsEl.appendChild(div);
      });
    }

    function deleteEntry(index){
      const arr = getInteractions();
      if(index < 0 || index >= arr.length) return;
      arr.splice(index, 1);
      localStorage.setItem('userInteractions', JSON.stringify(arr));
      render();
    }

    logoutBtn.addEventListener('click', ()=>{
      sessionStorage.removeItem('isAdmin');
      window.location.href = 'login.html';
    });

    render();
  }
})();
