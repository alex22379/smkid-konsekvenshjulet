async function fetchConsequencePool(n = 22) {
  const res = await fetch("/data/consequences.json");
  const data = await res.json();
  return data;
}

const item = document.getElementById("item");
const wheel = document.getElementById("wheel");
const spinDuration = 2 // seconds

wheel.addEventListener("click", () => spin());

let consequencePool = null;

async function loadWheel() {
    consequencePool = await fetchConsequencePool();
    const n = consequencePool.length;
    document.documentElement.style.setProperty("--n", n);
    wheel.innerHTML = '';

    let i = 0;
    const degIncrement = 360 / n;
    consequencePool.forEach((consequence) => {
      node = document.createElement('span');
      node.style.backgroundColor = `var(--clr-wheelItem${i % 8 + 1})`;
      node.style.transform = `translateX(-50%) rotate(${degIncrement*i}deg) `;
      node.innerHTML = consequence;
      wheel.appendChild(node);
      console.log(`Loaded consequence: "${consequence}"`);
      i++;
    });
}

let degOffset = 0;
function spin() {
  if (wheel.hasAttribute("data-spinning")) return;

  const rndIndex = Math.floor(Math.random() * consequencePool.length);
  const rndConsequence = consequencePool[rndIndex];
  console.log(`Random consequence: "${rndConsequence}"`);


  //const degIncrement = 360 / n;
  //const updateItemInterval = 0;
  const spinDegrees = 360 * 5 + Math.floor(Math.random() * 360);
  degOffset += spinDegrees + 360;

  const totalSpins = getComputedStyle(document.documentElement).getPropertyValue("--total-spins").trim(); // num of different animations
  document.documentElement.style.setProperty("--spin", `var(--spin${Math.floor(Math.random() * totalSpins)})`);
  wheel.style.transform = `rotate(${degOffset}deg)`;

  setTimeout(() => {
      item.innerHTML = rndConsequence;
  }, spinDuration * 1000 );

  wheel.setAttribute("data-spinning", null);
  setTimeout(() => {
      wheel.removeAttribute("data-spinning");
      loadWheel()
  }, spinDuration * 1000 + 500);
}

// init
loadWheel()
document.documentElement.style.setProperty("--spin-duration", `${spinDuration}s`);
// /init