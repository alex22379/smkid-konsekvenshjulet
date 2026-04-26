// config
const CONSEQUENCE_FETCH_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnRju8U_aMxqzrApHgjo2W3kuLy6rmcSJ7X8Xp9OzkYDf8JR0CRtfGNz04CPYVyoVNYZBInzfiNfS8q-rJs4OKl5pTPMbMsZEvSIURnGxMxEXYEt6J3UBv8Tx9DBU32zyks5erpbc6o0GI53QHHT0lFT8eprFxQWX1Oh5AVkqohjjey6OAkWbvGScvkkxqDla9--CpHSIeafMesy7qTkrACW-nD2Nr8zEjNxipueRRp8tMA6Zqg_fb2QXC13U194970bPbky1YcAp3A82cCoDWgmULnJ7A&lib=MCl_OsvwWocWRExf-x-0ynpoiE_6Oxspk"; // Should provide JSON list of strings
const SPIN_DURATION = 2; // in seconds
let N = 13; // if list of consequences has too few, N will be capped lower
// /config

const TickSound = {
  ctx: null,
  buffer: null,
  ready: false,

  async init(url) {
    if (this.ready) return;

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();

    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);

    this.ready = true;
  },

  async play() {
    if (!this.ready) return;

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.ctx.destination);
    source.start(0);
  },
};

document.addEventListener("click", async () => {
  await TickSound.init("assets/tick.wav");
});

const item = document.getElementById("item");
const wheel = document.getElementById("wheel");

function updateCurrentConsequence() {
  const elm = wheel;
  const rect = elm.getBoundingClientRect();
  const styles = getComputedStyle(elm);

  const x = rect.left + rect.width / 2 + window.scrollX;
  const y = rect.top + rect.height / 4 + window.scrollY;

  const firstSpan = Array.from(document.elementFromPoint(x, y).childNodes).find(
    (node) => node.nodeType === Node.ELEMENT_NODE && node.tagName === "SPAN",
  );
  const consequence = firstSpan ? firstSpan.innerHTML : undefined;
  if (consequence && consequence != item.innerHTML) {
    item.innerHTML = consequence;
    TickSound.play();
  }
}

let degOffset = 0;
function spin() {
  if (wheel.hasAttribute("data-spinning")) return;

  //  andom spin force
  const totalSpins = getComputedStyle(document.documentElement)
    .getPropertyValue("--total-spins")
    .trim(); // num of different animations
  const rndSpin = `var(--spin${Math.floor(Math.random() * totalSpins + 1)})`;
  document.documentElement.style.setProperty("--spin", rndSpin);

  // random spin speed
  const spinDegrees =
    360 * Math.floor(Math.random() * (5 - 3) + 3) +
    Math.floor(Math.random() * 360);
  degOffset += spinDegrees + 360;

  // init spin
  wheel.setAttribute("data-spinning", null);
  wheel.style.transform = `rotate(${degOffset}deg)`;

  const interval = setInterval(
    updateCurrentConsequence,
    1000 / 120 /* 75 HZ / FPS */,
  );

  setTimeout(() => {
    clearInterval(interval);
    wheel.removeAttribute("data-spinning");
  }, SPIN_DURATION * 1000);
}

wheel.addEventListener("click", () => spin());

// init
async function loadWheel(consequences) {
  wheel.innerHTML = "";

  let i = 0;
  const degIncrement = 360 / N;
  consequences.forEach((consequence) => {
    node = document.createElement("div");
    node.style.backgroundColor = `var(--clr-wheelItem${(i % 8) + 1})`;
    node.style.transform = `translateX(-50%) rotate(${degIncrement * i}deg) `;

    text = document.createElement("span");
    text.innerHTML = consequence;

    node.appendChild(text);
    wheel.appendChild(node);

    i++;
  });
}

async function init() {
  // init CSS --spin-duration property
  document.documentElement.style.setProperty(
    "--spin-duration",
    `${SPIN_DURATION}s`,
  );

  // fetch list of consequences
  let res;
  try {
    res = await fetch(CONSEQUENCE_FETCH_URL);
    if (!res.ok) throw new Error("Remote Consequence-list failed to fetch");
  } catch (e) {
    res = await fetch("data/consequences.json");
    if (!res.ok) throw new Error("Fallback also failed");
  }
  const consequences = await res.json();

  // init CSS --n property (possibly cap N)
  N = Math.min(N, consequences.length);
  document.documentElement.style.setProperty("--n", N);

  // Fisher–Yates shuffle
  for (let i = consequences.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [consequences[i], consequences[j]] = [consequences[j], consequences[i]];
  }

  loadWheel(consequences.slice(0, N));
}

init();
// /init
