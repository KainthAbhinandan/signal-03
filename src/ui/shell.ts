const symbolSvg = (shape: string) => `<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shape}</svg>`;
const icons = {
  pulse: symbolSvg('<path d="M12 53h18V26h18v46h18V43h18"/>'),
  orbit: symbolSvg('<ellipse cx="48" cy="48" rx="35" ry="20"/><circle cx="48" cy="48" r="12"/><circle cx="75" cy="35" r="6" fill="currentColor" stroke="none"/>'),
  spark: symbolSvg('<path d="m48 10 10 27 27 11-27 11-10 27-10-27-27-11 27-11Z"/>'),
  wave: symbolSvg('<path d="M10 37c13-27 23-27 38 0s25 27 38 0M10 59c13-27 23-27 38 0s25 27 38 0"/>'),
};

export function renderShell(root: HTMLElement): void {
  root.innerHTML = `
    <div class="page">
      <header class="masthead"><a class="wordmark" href="./" aria-label="Signal 03 home"><span class="brand-mark" aria-hidden="true">s/</span> SIGNAL LAB</a><span class="edition">INTERACTIVE OBJECTS &nbsp; / &nbsp; № 003</span></header>
      <section class="introduction" aria-labelledby="title">
        <div><p class="eyebrow"><span class="tiny-line"></span> AN EXPERIMENT IN CHANCE</p><h1 id="title">SIGNAL <span>/ 03</span></h1><p class="tagline">A little chance. A clean signal.</p></div>
        <div class="intro-note"><span class="dot-grid" aria-hidden="true"></span><p>THREE REELS.<br>FOUR FREQUENCIES.<br>ONE MOMENT OF ALIGNMENT.</p></div>
      </section>
      <section class="machine" aria-label="Signal slot instrument">
        <div class="machine-top"><span><i class="led" aria-hidden="true"></i> SIGNAL GENERATOR</span><span class="model">SG—03 &nbsp; / &nbsp; STEREO CHANCE</span></div>
        <div class="reel-labels" aria-hidden="true"><span>01 <b>INPUT A</b></span><span>02 <b>INPUT B</b></span><span>03 <b>INPUT C</b></span></div>
        <div class="screen-wrap"><div id="game-canvas" class="screen"></div><div id="loading" class="loading">INITIALIZING SIGNAL<span>Setting the frequencies…</span></div></div>
        <div class="screen-caption"><span>CENTER LINE ONLY <span class="caption-dash">—</span></span><span id="symbols">PULSE / ORBIT / WAVE</span></div>
        <div class="result-strip"><div class="result-copy"><span id="status-led" class="status-led" aria-hidden="true"></span><div><p id="result-title">Ready to find your frequency.</p><p id="result-detail">Press spin. See what connects.</p></div></div><span id="award" class="award">—</span></div>
        <div class="dashboard"><div class="credit-panel"><div class="label">DEMO CREDITS <span id="credit-change" aria-hidden="true"></span></div><div class="credit-row"><span id="credits" aria-hidden="true">0100</span><span id="credits-accessible" class="sr-only">100 demo credits</span><span class="credit-unit">CR</span></div></div><div class="spin-area"><button id="spin" class="spin" type="button" disabled><span id="spin-label">SPIN</span><span class="spin-icon" aria-hidden="true">↗</span></button><p>1 CREDIT / SPIN <span>SPACE TO PLAY</span></p></div></div>
        <div class="machine-bottom"><span><i class="small-dot" aria-hidden="true"></i><span id="machine-state">ESTABLISHING CONNECTION</span></span><button id="reset" class="text-button" type="button" disabled>↺ &nbsp; Reset credits</button></div>
        <div id="recovery" class="recovery" hidden><p id="error-message"></p><button id="retry" type="button">Reload instrument ↗</button></div>
      </section>
      <section class="under-machine" aria-label="Symbols and payout rules"><div class="symbol-key"><p class="label">THE FREQUENCIES</p><div class="symbol-list">${Object.entries(icons).map(([name, svg]) => `<div>${svg}<span>${name}</span></div>`).join('')}</div></div><div class="rules"><p class="label">FIND AN ALIGNMENT</p><p>Match 2: <strong>1 credit.</strong><br>Match 3: <strong>5 credits.</strong></p><span>A pair returns your stake. A triple locks the signal.</span></div></section>
      <footer class="footer"><div class="audio-controls"><button id="mute" class="mute" type="button" aria-pressed="false" aria-label="Mute sound"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8c2 2 2 6 0 8M20 5c4 4 4 10 0 14"/></svg><span id="audio-label">SOUND ON</span></button><label for="volume" class="sr-only">Sound volume</label><input id="volume" type="range" min="0" max="100" value="35" aria-label="Sound volume" /></div><span class="demo-note">MADE FOR PLAY. DEMO CREDITS ONLY.</span><details class="about"><summary>Field notes <span aria-hidden="true">+</span></summary><div><p>Each reel independently chooses one of four symbols with equal probability. Only the center symbols count. A spin costs 1 credit; awards are then added to your balance.</p><p>Press Space anywhere outside a control, or use the SPIN button. Reset restores 100 demo credits when idle. Your sound preferences are saved; your credits are not.</p><p>An original little instrument. Built with PixiJS, TypeScript & native Web Audio.</p></div></details></footer>
      <div id="live-result" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
      <div id="dev-controls"></div>
      <div class="page-end"><span aria-hidden="true">DESIGNED TO CONNECT.</span><span class="game-version" role="note" aria-label="Game version ${__GAME_VERSION__}">v${__GAME_VERSION__}</span></div>
    </div>`;
}
