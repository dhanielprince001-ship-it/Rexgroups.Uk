// Offline helper + a small, dismissible "install the app" tip.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

const KEY = 'rex-install-dismissed';
const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let deferred = null;

function dismissedRecently() {
  try {
    const t = Number(localStorage.getItem(KEY));
    return Boolean(t) && Date.now() - t < 14 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

function remember() {
  try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
}

function hide() {
  const el = document.getElementById('rex-install');
  if (el) el.remove();
}

function show(message, actionLabel, onAction) {
  if (document.getElementById('rex-install')) return;
  const box = document.createElement('div');
  box.id = 'rex-install';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Install Rex Groups');
  box.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));width:min(460px,calc(100% - 24px));box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:14px 16px;background:#071b30;color:#fff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.35);font:14px/1.5 "DM Sans",system-ui,sans-serif;z-index:90';

  const text = document.createElement('span');
  text.textContent = message;
  text.style.flex = '1';
  box.appendChild(text);

  if (actionLabel && onAction) {
    const go = document.createElement('button');
    go.type = 'button';
    go.textContent = actionLabel;
    go.style.cssText = 'background:#f4b941;color:#071b30;border:0;border-radius:8px;padding:9px 14px;font:700 14px "DM Sans",system-ui,sans-serif;cursor:pointer';
    go.addEventListener('click', onAction);
    box.appendChild(go);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Close');
  close.style.cssText = 'background:none;border:0;color:#b7c6d8;font-size:24px;line-height:1;cursor:pointer;padding:0 4px';
  close.addEventListener('click', () => { remember(); hide(); });
  box.appendChild(close);

  document.body.appendChild(box);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferred = event;
  if (standalone || dismissedRecently()) return;
  setTimeout(() => {
    show('Install Rex Groups on your phone for quick access.', 'Install', async () => {
      if (!deferred) return;
      deferred.prompt();
      await deferred.userChoice.catch(() => {});
      deferred = null;
      remember();
      hide();
    });
  }, 6000);
});

window.addEventListener('appinstalled', hide);

if (isIOS && !standalone && !dismissedRecently()) {
  setTimeout(() => show('Install Rex Groups: tap the Share button, then “Add to Home Screen”.'), 8000);
}
