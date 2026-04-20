let audioCtx;
let sources = [];

function createBrownNoise(ctx) {
    const bufferSize = 10 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const brown = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * brown) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    source.start(0);
    sources.push(source);
    return source;

    /*
    brownNoise = audioCtx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;
    brownNoise.start(0);
    */
}

function createBrookLayer(ctx, lfoFreq, freqMul, freqAdd, rq, gain) {
    const noise = createBrownNoise(ctx);

    const onePole = ctx.createBiquadFilter();
    onePole.type = "lowpass";
    onePole.frequency.value = 140;
    noise.connect(onePole);

    const lfoNoise = createBrownNoise(ctx);

    const lfoFilter = ctx.createBiquadFilter();
    lfoFilter.type = "lowpass";
    lfoFilter.frequency.value = lfoFreq;
    lfoNoise.connect(lfoFilter);

    // Multiply the LFO signal by freqMul
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = freqMul;
    lfoFilter.connect(lfoGain);
    const rhpf = ctx.createBiquadFilter();
    rhpf.type = "bandpass";
    rhpf.Q.value = 1 / rq; // ~33

    rhpf.frequency.value = freqAdd;
    lfoGain.connect(rhpf.frequency);

    onePole.connect(rhpf);

    const outputGain = ctx.createGain();
    outputGain.gain.value = gain;
    rhpf.connect(outputGain);

    return outputGain;
}

function start() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Layer 1: slower wandering (14Hz), lower range (~100-900Hz)
    const layer1 = createBrookLayer(audioCtx, 14, 400, 500, 0.01, 80);

    // Layer 2: faster wandering (20Hz), higher range (~200-1800Hz)
    const layer2 = createBrookLayer(audioCtx, 20, 800, 1000, 0.01, 150);

    // master gain
    const master = audioCtx.createGain();
    master.gain.value = 0.3;

    layer1.connect(master);
    layer2.connect(master);
    master.connect(audioCtx.destination);

    document.getElementById("brook-start").disabled = true;
    document.getElementById("brook-stop").disabled = false;
}

function stop() {
    sources.forEach(s => s.stop());
    sources = [];
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
    document.getElementById("brook-start").disabled = false;
    document.getElementById("brook-stop").disabled = true;
}

document.getElementById("brook-start").addEventListener("click", start);
document.getElementById("brook-stop").addEventListener("click", stop);