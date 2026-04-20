let fireCtx;
let fireSources = [];
let fireInterval = null;

function startFire() {
    fireCtx = new (window.AudioContext || window.webkitAudioContext)();

    // white noise source
    const bufferSize = 10 * fireCtx.sampleRate;
    const noiseBuf = fireCtx.createBuffer(1, bufferSize, fireCtx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }
    const noise = fireCtx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    noise.start();
    fireSources.push(noise);

    // === LAYER 1: low rumble ===
    const loBP = fireCtx.createBiquadFilter();
    loBP.type = "bandpass";
    loBP.frequency.value = 80;
    loBP.Q.value = 0.5;
    noise.connect(loBP);

    // === LAYER 2: mid crackle body ===
    const midBP = fireCtx.createBiquadFilter();
    midBP.type = "bandpass";
    midBP.frequency.value = 600;
    midBP.Q.value = 0.8;
    noise.connect(midBP);

    // === LAYER 3: high sizzle ===
    const hiBP = fireCtx.createBiquadFilter();
    hiBP.type = "bandpass";
    hiBP.frequency.value = 4000;
    hiBP.Q.value = 0.5;
    noise.connect(hiBP);

    // slow random amplitude modulation (makes it flicker)
    const modNoiseBuf = fireCtx.createBuffer(1, bufferSize, fireCtx.sampleRate);
    const modData = modNoiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        modData[i] = Math.random() * 2 - 1;
    }
    const modNoise = fireCtx.createBufferSource();
    modNoise.buffer = modNoiseBuf;
    modNoise.loop = true;
    modNoise.start();
    fireSources.push(modNoise);

    const modLop = fireCtx.createBiquadFilter();
    modLop.type = "lowpass";
    modLop.frequency.value = 3;
    modNoise.connect(modLop);

    const modGain = fireCtx.createGain();
    modGain.gain.value = 0.3;
    modLop.connect(modGain);

    // mix the layers
    const loGain = fireCtx.createGain();
    loGain.gain.value = 0.15;
    loBP.connect(loGain);

    const midGain = fireCtx.createGain();
    midGain.gain.value = 0.12;
    midBP.connect(midGain);

    const hiGain = fireCtx.createGain();
    hiGain.gain.value = 0.08;
    hiBP.connect(hiGain);

    // modulate all layers together
    const vca = fireCtx.createGain();
    vca.gain.value = 0.35;
    modGain.connect(vca.gain);

    loGain.connect(vca);
    midGain.connect(vca);
    hiGain.connect(vca);

    // crackling: random short bursts
    function scheduleCrackle() {
        const dur = (Math.random() * 15 + 2) / 1000;
        const len = Math.ceil(dur * fireCtx.sampleRate);
        const buf = fireCtx.createBuffer(1, len, fireCtx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            d[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const src = fireCtx.createBufferSource();
        src.buffer = buf;

        const bp = fireCtx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = Math.random() * 3000 + 2000;
        bp.Q.value = 2;

        src.connect(bp);
        bp.connect(vca);
        src.start();

        fireInterval = setTimeout(scheduleCrackle, Math.random() * 200 + 30);
    }
    scheduleCrackle();

    vca.connect(fireCtx.destination);

    document.getElementById("fire-start").disabled = true;
    document.getElementById("fire-stop").disabled = false;
}

function stopFire() {
    if (fireInterval) {
        clearTimeout(fireInterval);
        fireInterval = null;
    }
    fireSources.forEach(s => s.stop());
    fireSources = [];
    if (fireCtx) {
        fireCtx.close();
        fireCtx = null;
    }
    document.getElementById("fire-start").disabled = false;
    document.getElementById("fire-stop").disabled = true;
}

document.getElementById("fire-start").addEventListener("click", startFire);
document.getElementById("fire-stop").addEventListener("click", stopFire);