function hashText(value = "") {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function pickPalette(value) {
  const palettes = [
    ["#0f4c81", "#7ec8e3"],
    ["#7a2e3a", "#f3b0c3"],
    ["#355c3a", "#a6d8b5"],
    ["#5a3d8c", "#d0bdf4"],
    ["#7a4f01", "#f5d07d"],
  ];

  return palettes[hashText(value) % palettes.length];
}

export function getStudentInitials(student = {}) {
  const source = student.name || student.username || student.rollNumber || "ST";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "ST";
}

export function getStudentImageSrc(student = {}) {
  const seed = student.rollNumber || student.username || student.userId || student.name || "student";
  const [primary, secondary] = pickPalette(seed);
  const initials = getStudentInitials(student);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="260" viewBox="0 0 220 260">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="220" height="260" rx="14" fill="url(#g)" />
      <circle cx="110" cy="92" r="46" fill="rgba(255,255,255,0.22)" />
      <path d="M52 210c14-38 38-56 58-56s44 18 58 56" fill="rgba(255,255,255,0.22)" />
      <text x="110" y="108" text-anchor="middle" font-size="34" font-family="Arial" fill="#fff" font-weight="bold">${initials}</text>
      <text x="110" y="238" text-anchor="middle" font-size="16" font-family="Arial" fill="#fff">${student.rollNumber || student.username || "Student"}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
