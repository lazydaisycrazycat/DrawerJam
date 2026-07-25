import "./style.css";

const colors = ["#1e1e1e", "#ff5c5c", "#ffb627", "#14b8a6", "#4f7cff", "#9b5de5"];

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main class="app-shell">
    <header class="topbar">
      <div class="brand"><span class="brand-mark">✦</span><div><h1>Drawer Jam</h1><p>Рисуй. Угадывай. Зажигай.</p></div></div>
      <button class="score" aria-label="Ваши очки"><span>★</span> 1 240</button>
    </header>
    <section class="round-card">
      <div><span class="eyebrow">Раунд 2 из 5</span><h2>Космический кот</h2></div>
      <div class="timer" id="timer" aria-label="Таймер">
        <svg viewBox="0 0 44 44"><circle class="timer-track" cx="22" cy="22" r="18"/><circle class="timer-progress" id="timer-progress" cx="22" cy="22" r="18"/></svg>
        <strong id="timer-value">60</strong>
      </div>
    </section>
    <section class="canvas-card">
      <canvas id="drawing-canvas" aria-label="Холст для рисования"></canvas>
      <div class="canvas-placeholder" id="placeholder"><span>✎</span><p>Нарисуй подсказку</p></div>
    </section>
    <section class="tools" aria-label="Инструменты рисования">
      <div class="colors" id="colors"></div>
      <div class="tool-actions">
        <label class="size-control" aria-label="Толщина кисти"><span class="brush-dot"></span><input id="brush-size" type="range" min="2" max="24" value="7"/></label>
        <button class="icon-button" id="undo" aria-label="Отменить">↶</button>
        <button class="icon-button" id="clear" aria-label="Очистить">⌫</button>
      </div>
    </section>
    <button class="primary-button" id="done">Готово! <span>→</span></button>
    <p class="footer-note"><span class="live-dot"></span> 3 игрока уже угадывают</p>
  </main>`;

const canvas = document.querySelector<HTMLCanvasElement>("#drawing-canvas")!;
const context = canvas.getContext("2d")!;
const placeholder = document.querySelector<HTMLDivElement>("#placeholder")!;
const sizeInput = document.querySelector<HTMLInputElement>("#brush-size")!;
let activeColor = colors[0];
let drawing = false;
let hasDrawing = false;
let history: ImageData[] = [];

colors.forEach((color, index) => {
  const button = document.createElement("button");
  button.className = `color-button${index === 0 ? " active" : ""}`;
  button.style.setProperty("--swatch", color);
  button.setAttribute("aria-label", `Цвет ${color}`);
  button.addEventListener("click", () => {
    activeColor = color;
    document.querySelectorAll(".color-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    window.Telegram?.WebApp.HapticFeedback?.impactOccurred("light");
  });
  document.querySelector("#colors")!.append(button);
});

function resizeCanvas(): void {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const snapshot = canvas.width ? canvas.toDataURL() : "";
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.lineCap = "round";
  context.lineJoin = "round";
  if (snapshot) {
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
    image.src = snapshot;
  }
}

function point(event: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener("pointerdown", (event) => {
  drawing = true;
  hasDrawing = true;
  placeholder.classList.add("hidden");
  history.push(context.getImageData(0, 0, canvas.width, canvas.height));
  if (history.length > 20) history.shift();
  const { x, y } = point(event);
  context.beginPath();
  context.moveTo(x, y);
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;
  const { x, y } = point(event);
  context.strokeStyle = activeColor;
  context.lineWidth = Number(sizeInput.value);
  context.lineTo(x, y);
  context.stroke();
});
canvas.addEventListener("pointerup", () => { drawing = false; context.closePath(); });
canvas.addEventListener("pointercancel", () => { drawing = false; context.closePath(); });

document.querySelector("#undo")!.addEventListener("click", () => {
  const previous = history.pop();
  if (previous) context.putImageData(previous, 0, 0);
  window.Telegram?.WebApp.HapticFeedback?.impactOccurred("light");
});
document.querySelector("#clear")!.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  history = [];
  hasDrawing = false;
  placeholder.classList.remove("hidden");
});
document.querySelector("#done")!.addEventListener("click", () => {
  if (!hasDrawing) {
    window.Telegram?.WebApp.HapticFeedback?.notificationOccurred("warning");
    placeholder.animate([{ transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }], { duration: 220 });
    return;
  }
  window.Telegram?.WebApp.HapticFeedback?.notificationOccurred("success");
  const button = document.querySelector<HTMLButtonElement>("#done")!;
  button.innerHTML = "Рисунок отправлен <span>✓</span>";
  button.classList.add("success");
  button.disabled = true;
});

let seconds = 60;
const timerValue = document.querySelector("#timer-value")!;
const timerProgress = document.querySelector<SVGCircleElement>("#timer-progress")!;
const circumference = 2 * Math.PI * 18;
timerProgress.style.strokeDasharray = `${circumference}`;
window.setInterval(() => {
  if (seconds <= 0) return;
  timerValue.textContent = String(--seconds);
  timerProgress.style.strokeDashoffset = `${circumference * (1 - seconds / 60)}`;
  if (seconds <= 10) document.querySelector("#timer")?.classList.add("urgent");
}, 1000);

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
window.Telegram?.WebApp.ready();
window.Telegram?.WebApp.expand();
window.Telegram?.WebApp.enableClosingConfirmation();
