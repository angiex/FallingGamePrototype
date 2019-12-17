window.addEventListener("deviceorientation", (event) => {
    let alpha = Math.sign(event.alpha) * Math.round(Math.abs(event.alpha) * 1000) / 1000;
    let beta = Math.sign(event.beta) * Math.round(Math.abs(event.beta) * 1000) / 1000;
    let gamma = Math.sign(event.gamma) * Math.round(Math.abs(event.gamma) * 1000) / 1000;
    document.getElementById("alpha").innerHTML = "Alpha: " + alpha;
    document.getElementById("beta").innerHTML = "Beta: " + beta;
    document.getElementById("gamma").innerHTML = "Gamma: " + gamma;
}, true);