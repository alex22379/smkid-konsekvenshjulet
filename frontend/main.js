const item = document.getElementById("item");
const wheel = document.getElementById("wheel");

// TODO: load wheel with pool of consequences
// TODO: load consequence history

wheel.addEventListener("click", () => spin());

function spin() {
    if (wheel.hasAttribute("data-spinning")) return;

    // TODO: request consequence from pool (or just pick at random?)

    item.innerHTML = "test";
    wheel.setAttribute("data-spinning", null)

    // TODO: notify server of consequence
}

// TODO: Listen to new consequences and update history

