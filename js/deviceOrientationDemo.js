window.addEventListener("deviceorientation", (event) => {
    let alpha = (event.alpha * 1000) / 1000;
    let beta = (event.beta * 1000) / 1000;
    let gamma = (event.gamma * 1000) / 1000;
    document.getElementById("alpha").innerHTML = "Alpha: " + alpha;
    document.getElementById("beta").innerHTML = "Beta: " + beta;
    document.getElementById("gamma").innerHTML = "Gamma: " + gamma;
}, true);