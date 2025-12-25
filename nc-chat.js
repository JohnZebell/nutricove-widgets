(function () {
  // Prevent double-loading
  if (window.__NC_CHAT_LOADED__) return;
  window.__NC_CHAT_LOADED__ = true;

  /* ================================
     CONFIG (SAFE TO EDIT)
  ================================= */
  window.NutriCoveChat = window.NutriCoveChat || {
    webhook: {
      url: "https://n8n.nutricove.co/webhook-test/nutricove-rag",
      route: "general",
    },
  };

  /* ================================
     CSS INJECTION
  ================================= */
  const style = document.createElement("style");
  style.innerHTML = `
:root{
--nc-violet:#854fff;--nc-violet-dark:#6b3fd4;--nc-violet-glow:rgba(133,79,255,.4);
--nc-bg-secondary:#12121a;--nc-bg-tertiary:#1a1a24;
--nc-text-primary:#fff;--nc-text-secondary:rgba(255,255,255,.7);
--nc-text-muted:rgba(255,255,255,.4);--nc-border:rgba(255,255,255,.08);
--nc-bot-bubble:#1e1e2a}
#nc-chat-button,#nc-chat-container{pointer-events:auto}
#nc-chat-button{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;
background:linear-gradient(135deg,var(--nc-violet),var(--nc-violet-dark));
border:none;cursor:pointer;z-index:2147483647;display:flex;align-items:center;justify-content:center;
box-shadow:0 4px 20px var(--nc-violet-glow);transition:.3s}
#nc-chat-button:hover{transform:scale(1.08)}
#nc-chat-button.nc-hidden{opacity:0;pointer-events:none;transform:scale(.8)}
#nc-chat-button svg{width:26px;height:26px;fill:#fff}

#nc-chat-container{position:fixed;bottom:24px;right:24px;width:380px;height:560px;
background:var(--nc-bg-secondary);border-radius:20px;border:1px solid var(--nc-border);
box-shadow:0 25px 60px rgba(0,0,0,.5);display:flex;flex-direction:column;
opacity:0;visibility:hidden;transform:translateY(20px) scale(.95);
transition:.35s;z-index:2147483647}
#nc-chat-container.nc-open{opacity:1;visibility:visible;transform:none}

#nc-chat-header{padding:16px 20px;background:var(--nc-bg-tertiary);
border-bottom:1px solid var(--nc-border);display:flex;justify-content:space-between;align-items:center}
.nc-avatar{width:36px;height:36px;border-radius:10px;background:var(--nc-violet);
display:flex;align-items:center;justify-content:center}
#nc-close-btn{background:none;border:none;cursor:pointer}
#nc-close-btn svg{width:18px;height:18px;stroke:var(--nc-text-secondary)}

#nc-chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.nc-message{max-width:85%}
.nc-user{align-self:flex-end}
.nc-bot{align-self:flex-start}
.nc-message-content{padding:12px 16px;border-radius:14px;font-size:14px;line-height:1.5}
.nc-user .nc-message-content{background:var(--nc-violet);color:#fff;border-bottom-right-radius:6px}
.nc-bot .nc-message-content{background:var(--nc-bot-bubble);color:#fff;border:1px solid var(--nc-border);
border-bottom-left-radius:6px}

#nc-chat-input-area{padding:14px;background:var(--nc-bg-tertiary);border-top:1px solid var(--nc-border)}
.nc-input-wrapper{display:flex;gap:10px;background:var(--nc-bg-secondary);
border:1px solid var(--nc-border);border-radius:12px;padding:6px 10px}
#nc-chat-input{flex:1;background:none;border:none;color:#fff;outline:none}
#nc-send-btn{background:var(--nc-violet);border:none;border-radius:8px;width:36px;height:36px;
display:flex;align-items:center;justify-content:center;cursor:pointer}
#nc-send-btn svg{width:16px;height:16px;fill:#fff}

@media(max-width:480px){
#nc-chat-container{bottom:0;right:0;left:0;width:100%;height:100%;border-radius:0}
#nc-chat-button{bottom:16px;right:16px}
}`;
  document.head.appendChild(style);

  /* ================================
     HTML INJECTION
  ================================= */
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<button id="nc-chat-button" aria-label="Open chat">
  <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4z"/></svg>
</button>

<div id="nc-chat-container">
  <div id="nc-chat-header">
    <div style="display:flex;gap:10px;align-items:center">
      <div class="nc-avatar">🚀</div>
      <strong style="color:#fff">NutriCove</strong>
    </div>
    <button id="nc-close-btn">
      <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke-width="2"/></svg>
    </button>
  </div>

  <div id="nc-chat-messages">
    <div class="nc-message nc-bot">
      <div class="nc-message-content">👋 How can we help today?</div>
    </div>
  </div>

  <div id="nc-chat-input-area">
    <div class="nc-input-wrapper">
      <input id="nc-chat-input" placeholder="Type a message…" />
      <button id="nc-send-btn">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3z"/></svg>
      </button>
    </div>
  </div>
</div>
`
  );

  /* ================================
     JS LOGIC
  ================================= */
  const B = document.getElementById("nc-chat-button");
  const C = document.getElementById("nc-chat-container");
  const X = document.getElementById("nc-close-btn");
  const M = document.getElementById("nc-chat-messages");
  const I = document.getElementById("nc-chat-input");
  const S = document.getElementById("nc-send-btn");

  const chatId =
    sessionStorage.nc_chat_id ||
    (sessionStorage.nc_chat_id = "nc_" + Date.now());

  B.onclick = () => {
    C.classList.add("nc-open");
    B.classList.add("nc-hidden");
    I.focus();
  };

  X.onclick = () => {
    C.classList.remove("nc-open");
    B.classList.remove("nc-hidden");
  };

  function addMessage(text, user) {
    const d = document.createElement("div");
    d.className = "nc-message " + (user ? "nc-user" : "nc-bot");
    d.innerHTML = `<div class="nc-message-content">${text}</div>`;
    M.appendChild(d);
    M.scrollTop = M.scrollHeight;
  }

  async function send() {
    const text = I.value.trim();
    if (!text) return;
    I.value = "";
    addMessage(text, true);

    try {
      const r = await fetch(window.NutriCoveChat.webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message: text }),
      });
      const d = await r.json();
      addMessage(d.output || "Thanks for reaching out!");
    } catch {
      addMessage("Sorry — something went wrong. Please try again.");
    }
  }

  S.onclick = send;
  I.onkeypress = (e) => e.key === "Enter" && send();
})();
