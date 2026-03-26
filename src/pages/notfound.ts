export function renderNotFound(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Not Found — Loke Jinks</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23c8ff00'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=Syne:wght@800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      background:#0c0c0e;color:#fff;
      display:flex;align-items:center;justify-content:center;
      min-height:100vh;font-family:'DM Sans',system-ui,sans-serif
    }
    .message{text-align:center;opacity:0;animation:fadeIn 0.5s ease 0.1s forwards}
    .code{
      font-family:'Syne',system-ui,sans-serif;
      font-size:8rem;font-weight:800;color:#c8ff00;
      line-height:1;letter-spacing:-0.04em
    }
    .text{font-size:1.05rem;color:#72727e;margin-top:1rem}
    .home-link{
      display:inline-block;margin-top:2rem;color:#c8ff00;
      text-decoration:none;font-size:0.85rem;font-weight:500;
      border-bottom:1px solid transparent;transition:border-color 0.2s
    }
    .home-link:hover{border-bottom-color:#c8ff00}
    @keyframes fadeIn{
      from{opacity:0;transform:translateY(8px)}
      to{opacity:1;transform:translateY(0)}
    }
  </style>
</head>
<body>
  <div class="message">
    <div class="code">404</div>
    <p class="text">This joke doesn't exist yet.</p>
    <a href="/" class="home-link">Create one</a>
  </div>
</body>
</html>`;
}
