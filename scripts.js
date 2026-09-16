const toggleBtn = document.getElementById("theme-toggle");
const icon = toggleBtn.querySelector(".icon");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  icon.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}

const savedTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

applyTheme(savedTheme);

toggleBtn.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// Reading progress bar
const progressBar = document.getElementById("progress-bar");

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = percent + "%";
}

window.addEventListener("scroll", updateProgress);
window.addEventListener("resize", updateProgress);
updateProgress();