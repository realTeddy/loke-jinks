import { CATEGORIES } from "../types";
import { templates } from "../templates/jokes";

export function renderWizard(): string {
  const categoriesJson = JSON.stringify(CATEGORIES);
  const templatesJson = JSON.stringify(templates);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loke Jinks — Create a Joke Link</title>
  <meta name="description" content="Create joke URLs that trick your friends. The URL is the setup, the page is the punchline. No sign-up required.">
  <meta property="og:title" content="Loke Jinks — Create a Joke Link">
  <meta property="og:description" content="Create joke URLs that trick your friends. The URL is the setup, the page is the punchline.">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Loke Jinks — Create a Joke Link">
  <meta name="twitter:description" content="Create joke URLs that trick your friends. The URL is the setup, the page is the punchline.">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23c8ff00'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --bg:#0c0c0e;--surface:#16161a;--surface-hover:#1c1c22;
      --accent:#c8ff00;--accent-soft:rgba(200,255,0,0.08);
      --text:#fffffe;--text-dim:#72727e;--border:#27272f;
      --error:#ff6b6b;--radius:14px;--radius-sm:10px;
      --font-display:'Syne',system-ui,sans-serif;
      --font-body:'DM Sans',system-ui,sans-serif;
      --font-mono:'DM Mono','Courier New',monospace
    }
    body{
      background:var(--bg);color:var(--text);font-family:var(--font-body);
      min-height:100vh;display:flex;flex-direction:column;align-items:center;
      padding:3rem 1.5rem;position:relative;overflow-x:hidden
    }
    body::before{
      content:"";position:fixed;top:-200px;left:50%;transform:translateX(-50%);
      width:600px;height:600px;
      background:radial-gradient(circle,rgba(200,255,0,0.035) 0%,transparent 70%);
      pointer-events:none;z-index:0
    }
    .container{max-width:580px;width:100%;position:relative;z-index:1}

    .brand{text-align:center;margin-bottom:2.5rem;opacity:0;animation:fadeDown 0.5s ease 0.1s forwards}
    .brand h1{
      font-family:var(--font-display);font-size:2.2rem;font-weight:800;
      letter-spacing:-0.03em;color:var(--text)
    }
    .brand h1 .swap{color:var(--accent)}
    .brand .tagline{
      font-size:0.85rem;color:var(--text-dim);margin-top:0.35rem;
      font-weight:400;letter-spacing:0.02em
    }

    .stepper{
      display:flex;align-items:flex-start;justify-content:center;
      margin-bottom:2.5rem;opacity:0;animation:fadeDown 0.5s ease 0.2s forwards
    }
    .stepper-step{display:flex;flex-direction:column;align-items:center;gap:0.4rem}
    .stepper-dot{
      width:34px;height:34px;border-radius:50%;
      background:var(--surface);border:2px solid var(--border);
      display:flex;align-items:center;justify-content:center;
      font-family:var(--font-mono);font-size:0.75rem;font-weight:500;
      color:var(--text-dim);transition:all 0.3s ease
    }
    .stepper-step.active .stepper-dot,
    .stepper-step.done .stepper-dot{
      background:var(--accent);border-color:var(--accent);color:var(--bg)
    }
    .stepper-label{
      font-size:0.7rem;color:var(--text-dim);letter-spacing:0.04em;
      text-transform:uppercase;font-weight:500;transition:color 0.3s
    }
    .stepper-step.active .stepper-label{color:var(--text)}
    .stepper-line{
      width:56px;height:2px;background:var(--border);
      margin:0 0.75rem;margin-top:16px;transition:background 0.3s ease;border-radius:1px
    }
    .stepper-line.active{background:var(--accent)}

    .step{display:none}
    .step.active{display:block;animation:stepIn 0.35s ease forwards}
    .step-title{
      font-family:var(--font-display);font-size:1.25rem;font-weight:700;
      margin-bottom:1.25rem;color:var(--text);letter-spacing:-0.01em
    }

    .categories{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
    .category-card{
      background:var(--surface);border:1px solid var(--border);
      border-radius:var(--radius);padding:1.15rem;cursor:pointer;
      transition:all 0.2s ease
    }
    .category-card:hover{
      border-color:var(--accent);background:var(--surface-hover);
      transform:translateY(-2px)
    }
    .category-card h3{
      font-family:var(--font-body);font-size:0.9rem;font-weight:600;
      margin-bottom:0.3rem;color:var(--text)
    }
    .category-card p{font-size:0.78rem;color:var(--text-dim);line-height:1.4}

    .templates{display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem}
    .template-card{
      background:var(--surface);border:1px solid var(--border);
      border-radius:var(--radius-sm);padding:0.85rem 1rem;cursor:pointer;
      font-size:0.88rem;transition:all 0.2s ease;color:var(--text);line-height:1.4
    }
    .template-card:hover{border-color:rgba(200,255,0,0.3);background:var(--surface-hover)}
    .template-card.selected{border-color:var(--accent);background:var(--accent-soft)}

    textarea{
      width:100%;background:var(--surface);border:1px solid var(--border);
      border-radius:var(--radius-sm);padding:0.85rem 1rem;color:var(--text);
      font-family:var(--font-body);font-size:0.9rem;resize:vertical;min-height:88px;
      transition:border-color 0.2s
    }
    textarea:focus{outline:none;border-color:var(--accent)}
    textarea::placeholder{color:var(--text-dim)}

    .slug-row{display:flex;gap:0.5rem;margin-bottom:0.5rem}
    input[type="text"]{
      flex:1;background:var(--surface);border:1px solid var(--border);
      border-radius:var(--radius-sm);padding:0.85rem 1rem;color:var(--text);
      font-family:var(--font-mono);font-size:0.88rem;transition:border-color 0.2s
    }
    input[type="text"]:focus{outline:none;border-color:var(--accent)}
    input[type="text"]::placeholder{color:var(--text-dim);font-family:var(--font-mono)}

    .preview{
      font-family:var(--font-mono);font-size:0.8rem;color:var(--text-dim);
      margin-bottom:0.4rem;min-height:1.2em
    }
    .availability{font-size:0.82rem;margin-bottom:1rem;min-height:1.2em;font-weight:500}
    .availability.available{color:var(--accent)}
    .availability.taken{color:var(--error)}

    button{
      background:var(--surface);color:var(--text);
      border:1px solid var(--border);border-radius:var(--radius-sm);
      padding:0.65rem 1.3rem;cursor:pointer;font-family:var(--font-body);
      font-size:0.85rem;font-weight:500;transition:all 0.2s ease
    }
    button:hover{background:var(--surface-hover);border-color:#3a3a44}
    button.primary{
      background:var(--accent);color:var(--bg);border-color:var(--accent);font-weight:600
    }
    button.primary:hover{background:#b8ef00;border-color:#b8ef00}
    button.primary:disabled{opacity:0.25;cursor:not-allowed;background:var(--accent);border-color:var(--accent)}
    button.copied{background:var(--accent-soft)!important;border-color:var(--accent)!important;color:var(--accent)!important}
    .btn-row{display:flex;justify-content:space-between;margin-top:1.75rem}

    .result{text-align:center}
    .result-link-box{
      background:var(--surface);border:1px solid var(--border);
      border-radius:var(--radius);padding:1.5rem 1.75rem;margin:1.5rem 0
    }
    .result-url{
      font-family:var(--font-mono);font-size:1.05rem;font-weight:500;
      color:var(--accent);word-break:break-all;line-height:1.4
    }
    .result-actions{display:flex;gap:0.75rem;justify-content:center;margin-bottom:2rem}
    .create-another{
      color:var(--text-dim);cursor:pointer;font-size:0.85rem;
      transition:color 0.2s;display:inline-block
    }
    .create-another:hover{color:var(--text)}

    @keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes stepIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    .gh-link{
      position:fixed;bottom:1.25rem;right:1.5rem;
      display:flex;align-items:center;gap:0.35rem;
      color:var(--text-dim);text-decoration:none;font-size:0.72rem;
      font-weight:500;opacity:0.4;transition:opacity 0.2s;letter-spacing:0.01em
    }
    .gh-link:hover{opacity:1}
    .gh-link svg{width:15px;height:15px;fill:currentColor}
    @media(max-width:480px){
      .categories{grid-template-columns:1fr}
      body{padding:2rem 1rem}
      .stepper-line{width:32px;margin:0 0.4rem;margin-top:16px}
      .gh-link{position:static;justify-content:center;margin-top:3rem;opacity:0.4}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <h1><span class="swap">L</span>oke <span class="swap">J</span>inks</h1>
      <p class="tagline">Create a joke link</p>
    </div>

    <div class="stepper">
      <div class="stepper-step active" data-s="1">
        <div class="stepper-dot"><span>1</span></div>
        <div class="stepper-label">Style</div>
      </div>
      <div class="stepper-line" data-after="1"></div>
      <div class="stepper-step" data-s="2">
        <div class="stepper-dot"><span>2</span></div>
        <div class="stepper-label">Punchline</div>
      </div>
      <div class="stepper-line" data-after="2"></div>
      <div class="stepper-step" data-s="3">
        <div class="stepper-dot"><span>3</span></div>
        <div class="stepper-label">Link</div>
      </div>
    </div>

    <div class="step active" data-step="1">
      <p class="step-title">Pick your style</p>
      <div class="categories" id="categories"></div>
    </div>

    <div class="step" data-step="2">
      <p class="step-title">Write the punchline</p>
      <div class="templates" id="templates"></div>
      <textarea id="punchline" placeholder="Write your own punchline..."></textarea>
      <div class="btn-row">
        <button id="backTo1">Back</button>
        <button class="primary" id="nextTo3" disabled>Next</button>
      </div>
    </div>

    <div class="step" data-step="3">
      <p class="step-title">Craft your URL</p>
      <div class="slug-row">
        <input type="text" id="slug" placeholder="deez/nuts">
        <button id="randomBtn">Random</button>
      </div>
      <p class="preview" id="preview"></p>
      <p class="availability" id="availability"></p>
      <div class="btn-row">
        <button id="backTo2">Back</button>
        <button class="primary" id="createBtn" disabled>Create Link</button>
      </div>
    </div>

    <div class="step" data-step="result">
      <div class="result">
        <p class="step-title">Your link is ready</p>
        <div class="result-link-box">
          <p class="result-url" id="resultUrl"></p>
        </div>
        <div class="result-actions">
          <button id="copyBtn">Copy Link</button>
          <button id="openBtn">Open in New Tab</button>
        </div>
        <p class="create-another" id="resetBtn">Create another</p>
      </div>
    </div>
  </div>

  <a href="https://github.com/realTeddy/loke-jinks" class="gh-link" target="_blank" rel="noopener">
    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
    <span>GitHub</span>
  </a>

  <script>
    var CATS = ${categoriesJson};
    var TMPLS = ${templatesJson};
    var currentStep = 1;
    var selectedCategory = null;
    var createdUrl = null;
    var checkTimeout = null;
    var slugAvailable = false;

    var categoriesEl = document.getElementById("categories");
    var templatesEl = document.getElementById("templates");
    var punchlineEl = document.getElementById("punchline");
    var slugEl = document.getElementById("slug");
    var previewEl = document.getElementById("preview");
    var availabilityEl = document.getElementById("availability");
    var nextTo3Btn = document.getElementById("nextTo3");
    var createBtnEl = document.getElementById("createBtn");
    var resultUrlEl = document.getElementById("resultUrl");

    CATS.forEach(function(cat) {
      var card = document.createElement("div");
      card.className = "category-card";
      card.innerHTML = "<h3>" + cat.label + "</h3><p>" + cat.description + "</p>";
      card.onclick = function() {
        selectedCategory = cat.id;
        renderTemplates();
        goToStep(2);
      };
      categoriesEl.appendChild(card);
    });

    function renderTemplates() {
      templatesEl.innerHTML = "";
      var catTemplates = TMPLS[selectedCategory] || [];
      catTemplates.forEach(function(t) {
        var card = document.createElement("div");
        card.className = "template-card";
        card.textContent = t.text;
        card.onclick = function() {
          punchlineEl.value = t.text;
          document.querySelectorAll(".template-card").forEach(function(c) { c.classList.remove("selected"); });
          card.classList.add("selected");
          updateNextBtn();
        };
        templatesEl.appendChild(card);
      });
    }

    function updateStepper(step) {
      var stepNum = typeof step === "number" ? step : 4;
      document.querySelectorAll(".stepper-step").forEach(function(s) {
        var n = parseInt(s.getAttribute("data-s"));
        s.classList.remove("active", "done");
        if (n === stepNum) s.classList.add("active");
        else if (n < stepNum) s.classList.add("done");
      });
      document.querySelectorAll(".stepper-line").forEach(function(l) {
        var n = parseInt(l.getAttribute("data-after"));
        l.classList.toggle("active", n < stepNum);
      });
    }

    function goToStep(step) {
      document.querySelectorAll(".step").forEach(function(s) { s.classList.remove("active"); });
      var target = document.querySelector(".step[data-step='" + step + "']");
      if (target) {
        void target.offsetHeight;
        target.classList.add("active");
      }
      updateStepper(step);
      currentStep = step;
    }

    punchlineEl.addEventListener("input", updateNextBtn);
    function updateNextBtn() {
      nextTo3Btn.disabled = !punchlineEl.value.trim();
    }

    document.getElementById("backTo1").onclick = function() { goToStep(1); };
    nextTo3Btn.onclick = function() { goToStep(3); };
    document.getElementById("backTo2").onclick = function() { goToStep(2); };

    slugEl.addEventListener("input", function() {
      var slug = slugEl.value.trim();
      previewEl.textContent = slug ? location.origin + "/" + slug : "";
      slugAvailable = false;
      updateCreateBtn();
      clearTimeout(checkTimeout);
      if (!slug) {
        availabilityEl.textContent = "";
        availabilityEl.className = "availability";
        return;
      }
      checkTimeout = setTimeout(checkSlug, 300);
    });

    function checkSlug() {
      var slug = slugEl.value.trim();
      if (!slug) return;
      fetch("/api/check?slug=" + encodeURIComponent(slug))
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.available) {
            availabilityEl.textContent = "Available";
            availabilityEl.className = "availability available";
            slugAvailable = true;
          } else {
            availabilityEl.textContent = "Already taken";
            availabilityEl.className = "availability taken";
            slugAvailable = false;
          }
          updateCreateBtn();
        })
        .catch(function() {});
    }

    function updateCreateBtn() {
      createBtnEl.disabled = !slugAvailable;
    }

    document.getElementById("randomBtn").onclick = function() {
      fetch("/api/random-slug")
        .then(function(res) { return res.json(); })
        .then(function(data) {
          slugEl.value = data.slug;
          slugEl.dispatchEvent(new Event("input"));
        })
        .catch(function() {});
    };

    createBtnEl.onclick = function() {
      var slug = slugEl.value.trim();
      var punchline = punchlineEl.value.trim();
      createBtnEl.disabled = true;
      fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug, punchline: punchline, category: selectedCategory })
      })
        .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
        .then(function(result) {
          if (result.ok) {
            createdUrl = location.origin + result.data.url;
            resultUrlEl.textContent = createdUrl;
            goToStep("result");
          } else {
            alert(result.data.error || "Something went wrong");
            updateCreateBtn();
          }
        })
        .catch(function() {
          alert("Something went wrong");
          updateCreateBtn();
        });
    };

    document.getElementById("copyBtn").onclick = function() {
      var btn = document.getElementById("copyBtn");
      navigator.clipboard.writeText(createdUrl).then(function() {
        var original = btn.textContent;
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(function() {
          btn.textContent = original;
          btn.classList.remove("copied");
        }, 2000);
      });
    };

    document.getElementById("openBtn").onclick = function() {
      window.open(createdUrl, "_blank");
    };

    document.getElementById("resetBtn").onclick = function() {
      selectedCategory = null;
      createdUrl = null;
      slugAvailable = false;
      punchlineEl.value = "";
      slugEl.value = "";
      previewEl.textContent = "";
      availabilityEl.textContent = "";
      availabilityEl.className = "availability";
      nextTo3Btn.disabled = true;
      createBtnEl.disabled = true;
      goToStep(1);
    };
  </script>
</body>
</html>`;
}
