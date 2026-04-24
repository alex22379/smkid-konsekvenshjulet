async function fetchConsequencePool(n = 22) {
  const res = await fetch("/data/consequences.json");
  const data = await res.json();
  console.log(data)
  return data;
}

const item = document.getElementById("item");
const wheel = document.getElementById("wheel");

// TODO: load wheel with pool of consequences

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

function spin() {
  if (wheel.hasAttribute("data-spinning")) return;

  const rndConsequence = consequencePool[Math.floor(Math.random() * consequencePool.length)];
  console.log(`Random consequence: "${rndConsequence}"`);

  wheel.setAttribute("data-spinning", null);

  item.innerHTML = rndConsequence;

  loadWheel()
}

// init
loadWheel()
// /init