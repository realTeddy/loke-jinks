export function getFontSize(length: number): string {
  if (length <= 15) return "clamp(3rem, 8vw, 6rem)";
  if (length <= 40) return "clamp(2rem, 6vw, 4.5rem)";
  if (length <= 80) return "clamp(1.5rem, 4vw, 3rem)";
  return "clamp(1.2rem, 3vw, 2rem)";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderPunchline(punchline: string): string {
  const fontSize = getFontSize(punchline.length);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loke Jinks</title>
  <meta property="og:title" content="Loke Jinks">
  <meta property="og:description" content="Check this out">
  <meta name="robots" content="noindex">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23c8ff00'/%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      background:#000;color:#fff;
      display:flex;align-items:center;justify-content:center;
      min-height:100vh;padding:2rem
    }
    .punchline{
      font-family:'Syne',system-ui,sans-serif;
      font-size:${fontSize};font-weight:800;
      text-align:center;line-height:1.15;
      max-width:900px;letter-spacing:-0.02em;
      opacity:0;animation:reveal 0.5s ease 0.1s forwards
    }
    @keyframes reveal{
      from{opacity:0;transform:translateY(6px)}
      to{opacity:1;transform:translateY(0)}
    }
  </style>
</head>
<body>
  <div class="punchline">${escapeHtml(punchline)}</div>
</body>
</html>`;
}
