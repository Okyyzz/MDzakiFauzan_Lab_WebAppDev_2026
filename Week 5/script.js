const theme = [
    {bg: "#ffffff", text: "#222222", btn: "#333333"},
    {bg: "#222222", text: "#f5f5f5f5", btn: "#444444"}
];

let currentTheme = 0;
const btn = document.getElementById("theme-btn");

btn.addEventListener("click", () => {
    currentTheme = (currentTheme + 1) % theme.length;
    const newTheme = theme[currentTheme];

    document.body.style.backgroundColor = newTheme.bg;
    document.body.style.color = newTheme.text;
    btn.style.backgroundColor = newTheme.btn;
});
