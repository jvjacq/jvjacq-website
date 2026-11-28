// ASCII runner for jvjacq.com: a figure posed from running keyframes, drawn on an offscreen
// canvas, then turned into characters cell by cell by how much of each cell it covers.
(function (global) {
  const RAMP = ' .:-=+*#%@';
  // One leg's run cycle as keyframes: [thigh angle, knee flex] in degrees
  // (thigh: forward of vertical is +; knee flex: shin folded back from the thigh line).
  const LEG = [[32, 12], [6, 28], [-22, 18], [-34, 42], [-18, 112], [16, 122], [56, 92], [46, 38]];
  const rad = (d) => d * Math.PI / 180;
  function legAt(ph) {
    const n = LEG.length, f = ((ph / (2 * Math.PI)) % 1 + 1) % 1 * n;
    const i = Math.floor(f), u = f - i;
    const P = (k) => LEG[(i + k + n) % n];
    const cr = (j) => {                                   // Catmull-Rom between keyframes
      const a = P(-1)[j], b = P(0)[j], c = P(1)[j], d = P(2)[j];
      return 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    };
    return [rad(cr(0)), rad(cr(1))];
  }
  function pose(t) {
    const flight = Math.pow(Math.max(0, Math.sin(2 * t - 2.2)), 2) * 2.4;   // lift between strides
    const hip = { x: 0, y: -flight };
    const lean = rad(13), torso = 18;
    const sh = { x: hip.x + Math.sin(lean) * torso, y: hip.y - Math.cos(lean) * torso };
    const head = { x: sh.x + Math.sin(lean) * 6.8 + 0.6, y: sh.y - Math.cos(lean) * 6.8 };
    const leg = (ph) => {
      const [thigh, flex] = legAt(ph);
      const knee = { x: hip.x + Math.sin(thigh) * 13.5, y: hip.y + Math.cos(thigh) * 13.5 };
      const shinA = thigh - flex;
      const ankle = { x: knee.x + Math.sin(shinA) * 13.5, y: knee.y + Math.cos(shinA) * 13.5 };
      const toe = { x: ankle.x + Math.cos(shinA) * 4.6, y: ankle.y - Math.sin(shinA) * 4.6 * 0.6 + 0.4 };
      return { knee, ankle, toe, thigh };
    };
    const L = leg(t), R = leg(t + Math.PI);
    const arm = (sameLegThigh) => {
      const up = -0.85 * sameLegThigh;                      // swings opposite to its leg
      const elbow = { x: sh.x + Math.sin(up) * 10, y: sh.y + Math.cos(up) * 10 };
      const fa = up + rad(95);                              // elbow bent about 90 degrees
      const hand = { x: elbow.x + Math.sin(fa) * 8.5, y: elbow.y + Math.cos(fa) * 8.5 };
      return { elbow, hand };
    };
    return { hip, sh, head, L, R, la: arm(L.thigh), ra: arm(R.thigh) };
  }

  function createRunner(pre, opts = {}) {
    const cols = opts.cols || 96, rows = opts.rows || 44;
    const cw = 5, ch = 10;                               // offscreen pixels per character cell
    const cv = document.createElement('canvas'); cv.width = cols * cw; cv.height = rows * ch;
    const g = cv.getContext('2d', { willReadFrequently: true });
    const scale = opts.scale || 6.4;                     // figure units -> offscreen px
    const ox = cv.width * 0.46, groundY = (rows - 3) * ch;
    let t = opts.phase || 0, scroll = 0, dust = [];
    const segs = (p) => [
      [p.R.knee, p.hip, 22, 1], [p.R.ankle, p.R.knee, 17, 1], [p.R.toe, p.R.ankle, 13, 1],   // far side first, lighter
      [p.ra.elbow, p.sh, 15, 1], [p.ra.hand, p.ra.elbow, 13, 1],
      [p.hip, p.sh, 28, 0],
      [p.L.knee, p.hip, 23, 0], [p.L.ankle, p.L.knee, 18, 0], [p.L.toe, p.L.ankle, 14, 0],
      [p.la.elbow, p.sh, 16, 0], [p.la.hand, p.la.elbow, 14, 0],
    ];
    function frame(advance = true) {
      const p = pose(t);
      // place the lowest foot on the ground
      const low = Math.max(p.L.toe.y, p.R.toe.y, p.L.ankle.y, p.R.ankle.y);
      const oy = groundY - low * scale - 2;
      const X = (q) => ox + q.x * scale, Y = (q) => oy + q.y * scale;
      g.clearRect(0, 0, cv.width, cv.height);
      g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#000'; g.fillStyle = '#000';
      for (const [a, b, w, far] of segs(p)) {
        g.globalAlpha = far ? 0.5 : 1;
        g.lineWidth = w; g.beginPath(); g.moveTo(X(a), Y(a)); g.lineTo(X(b), Y(b)); g.stroke();
      }
      g.globalAlpha = 1; g.beginPath(); g.arc(X(p.head), Y(p.head), 4.4 * scale, 0, Math.PI * 2); g.fill();
      const img = g.getImageData(0, 0, cv.width, cv.height).data;
      const lines = [];
      for (let r = 0; r < rows; r++) {
        let s = '';
        for (let c = 0; c < cols; c++) {
          let a = 0;
          for (let yy = r * ch; yy < (r + 1) * ch; yy += 2)
            for (let xx = c * cw; xx < (c + 1) * cw; xx += 2) a += img[(yy * cv.width + xx) * 4 + 3];
          a /= (cw / 2) * (ch / 2) * 255;
          s += RAMP[Math.min(RAMP.length - 1, Math.floor(a * RAMP.length * 1.15))];
        }
        lines.push(s);
      }
      // ground: a track that scrolls left, with speed lines behind the runner and dust
      const gr = rows - 2, track = '_.-'.repeat(cols);
      const off = Math.floor(scroll) % 3;
      lines[gr] = track.slice(off, off + cols);
      const footDown = (q) => Math.abs(q.y - low) < 1.2;
      if (advance && (footDown(p.L.toe) || footDown(p.R.toe)) && Math.random() < 0.55)
        dust.push({ x: Math.floor(ox / cw) - 3, y: gr - 1, life: 6 });
      dust = dust.filter(d => d.life > 0);
      for (const d of dust) {
        if (d.x >= 0 && d.x < cols) { const row = lines[d.y].split(''); row[d.x] = '.,\'`'[d.life % 4]; lines[d.y] = row.join(''); }
        if (advance) { d.x -= 2; d.life -= 1; if (d.life % 2 === 0) d.y = Math.max(gr - 3, d.y - 1); }
      }
      for (let k = 0; k < 3; k++) {                    // speed lines
        const y = Math.floor(rows * (0.32 + k * 0.14)), len = 4 + k * 2;
        const x0 = (Math.floor(ox / cw) - 18 - ((Math.floor(scroll * 2) + k * 7) % 14));
        const row = lines[y].split('');
        for (let i = 0; i < len; i++) if (x0 + i >= 0 && row[x0 + i] === ' ') row[x0 + i] = '-';
        lines[y] = row.join('');
      }
      pre.textContent = lines.join('\n');
      if (advance) { t += 0.36; scroll += 1; }
    }
    return { frame, setPhase: (v) => { t = v; } };
  }
  global.createRunner = createRunner;
})(window);
