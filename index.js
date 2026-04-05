import express from "express";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();

app.get("/repo-size/:owner/:repo", async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });
    const data = await ghRes.json();

    const sizeKB = data.size;
    const size = formatSize(sizeKB);

    const svg = generateBadge("REPO SIZE", size);

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(svg);
  } catch (err) {
    res.status(500).send("Error generating badge");
  }
});

function formatSize(kb) {
  if (kb > 1024 * 1024) return (kb / (1024 * 1024)).toFixed(2) + " GB";
  if (kb > 1024) return (kb / 1024).toFixed(2) + " MB";
  return kb + " KB";
}

function generateBadge(label, value) {
  const padding_x = 35;
  const padding_y = 30;
  const font_size = 40;

  // rough width estimate (works well for most fonts)
  const charWidth = font_size * 0.65;
  const textWidth = label.length * charWidth;

  const width = textWidth + padding_x * 2;
  const height = font_size + padding_y * 2;

  // Right section
  const charWidth_r = font_size;
  const text_width_r = value.length * charWidth_r;
  const width_l = text_width_r + padding_x * 2;

  return `
<svg width="${width + text_width_r}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'MyFont';
        src: url(data:font/woff2;base64,AAEAAA...) format('woff2');
      }

      text {
font-family: "Space Grotesk", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
      }
    </style>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}"  fill="#0D1117"/>
  <text x="${padding_x}" y="${padding_y + font_size * 0.8}"
        font-size="${font_size}"
        fill="white"
        font-family="Space Grotesk"
        letter-spacing="5">
    ${label}
  </text>

  <rect x="${width}" y="0" width="${width_l}" height="${height}"  fill="#E4CCFF"/>
  <text x="${width + padding_x}" y="${padding_y + font_size * 0.8}"
        font-size="${font_size}"
        fill="#0D1117"
        font-family="Space Grotesk"
        letter-spacing="10">
    ${value}
  </text>
</svg>
  `;
}

app.listen(3000, () => console.log("Server running on port 3000"));
