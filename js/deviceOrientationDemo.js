window.addEventListener("deviceorientation", (event) => {
    document.getElementById("alpha").innerHTML = "Alpha: " + event.alpha;
    document.getElementById("beta").innerHTML = "Beta: " + event.beta;
    document.getElementById("gamma").innerHTML = "Gamma: " + event.gamma;
}, true);