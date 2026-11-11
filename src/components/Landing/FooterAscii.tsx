import { useEffect, useRef } from 'react';
import { isScrolling, onTierChange, pixelRatioFor, reportFrame, shouldRestDuringScroll } from '../../utils/perf';
import './FooterAscii.css';

// Render a small, silent video as text only while the footer is on screen.
const POSTER = '/media/footer-ascii-poster.jpg';
export default function FooterAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return undefined;
    const context = canvas.getContext('2d');
    const sample = document.createElement('canvas');
    const sampleContext = sample.getContext('2d', { willReadFrequently: true });
    if (!context || !sampleContext) return undefined;

    // iOS Safari only plays muted inline video it considers visible, and skips preload,
    // so set the attributes it checks and keep a still frame to draw when it won't play.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const poster = new Image();
    poster.src = POSTER;
    poster.onload = () => draw();

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const characters = ' .,:;irsXA253hMHGS#9B&@';
    let frame = 0;
    let lastDraw = 0;
    let lastTick = 0;
    let visible = false;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let fade: Float32Array | null = null;
    let fadeKey = '';
    let tonesBuffer = new Uint8Array(0);
    let glyphBuffer = new Uint8Array(0);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = pixelRatioFor(1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(40, Math.min(180, Math.round(width / 8)));
      rows = Math.max(1, Math.ceil(height / (width / cols * 1.65)));
      sample.width = cols;
      sample.height = rows;
      draw();
    };

    function draw() {
      if (!cols) return;
      const live = video!.readyState >= 2 && video!.videoWidth > 0;
      const source: CanvasImageSource | null = live ? video! : poster.complete && poster.naturalWidth ? poster : null;
      if (!source) return;
      const srcW = live ? video!.videoWidth : poster.naturalWidth;
      const srcH = live ? video!.videoHeight : poster.naturalHeight;
      // Fit the complete frame in CSS pixels: character cells are taller than
      // they are wide, so fitting in grid coordinates would distort the image.
      const scale = Math.min(width / srcW, height / srcH);
      const sourceWidth = srcW * scale / width * cols;
      const sourceHeight = srcH * scale / height * rows;
      sampleContext!.fillStyle = '#000';
      sampleContext!.fillRect(0, 0, cols, rows);
      // Center the full image behind the wordmark on every screen.
      const sourceTop = (rows - sourceHeight) / 2;
      const sourceLeft = (cols - sourceWidth) / 2;
      sampleContext!.drawImage(source, sourceLeft, sourceTop, sourceWidth, sourceHeight);
      const pixels = sampleContext!.getImageData(0, 0, cols, rows).data;
      const cellWidth = width / cols;
      const cellHeight = height / rows;

      // The edge fade depends only on the grid and where the image sits in it, not on the frame, so
      // it is worked out once per layout instead of once per cell per frame.
      if (!fade || fadeKey !== `${cols}x${rows}:${sourceLeft}:${sourceTop}:${sourceWidth}:${sourceHeight}`) {
        fadeKey = `${cols}x${rows}:${sourceLeft}:${sourceTop}:${sourceWidth}:${sourceHeight}`;
        fade = new Float32Array(cols * rows);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const nx = (x - sourceLeft) / sourceWidth * 2 - 1;
            const ny = (y - sourceTop) / sourceHeight * 2 - 1;
            const distance = Math.sqrt(nx * nx * 0.49 + ny * ny);
            fade[y * cols + x] = Math.max(0, Math.min(1, (1 - distance) / 0.38));
          }
        }
      }

      // One pass over the cells sorts each glyph into its tone; tones are then painted in order.
      // (Same output as testing every cell once per tone, in a fifth of the work.)
      const counts = [0, 0, 0, 0, 0, 0];
      const tones = tonesBuffer.length >= cols * rows ? tonesBuffer : (tonesBuffer = new Uint8Array(cols * rows));
      const glyphs = glyphBuffer.length >= cols * rows ? glyphBuffer : (glyphBuffer = new Uint8Array(cols * rows));
      for (let cell = 0; cell < cols * rows; cell++) {
        const weight = fade![cell];
        if (!weight) { tones[cell] = 0; continue; }
        const i = cell * 4;
        const light = (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722) / 255 * weight;
        if (light < 0.1) { tones[cell] = 0; continue; }
        const tone = Math.min(5, Math.ceil(light * 5));
        tones[cell] = tone;
        glyphs[cell] = Math.min(characters.length - 1, Math.floor(Math.sqrt(light) * (characters.length - 1)));
        counts[tone]++;
      }

      context!.clearRect(0, 0, width, height);
      context!.font = `${Math.max(5, cellHeight * 0.86)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context!.textAlign = 'center';
      context!.textBaseline = 'middle';
      for (let tone = 1; tone <= 5; tone++) {
        if (!counts[tone]) continue;
        context!.fillStyle = `rgba(244, 221, 200, ${0.13 + tone * 0.15})`;
        for (let cell = 0; cell < cols * rows; cell++) {
          if (tones[cell] !== tone) continue;
          context!.fillText(characters[glyphs[cell]], (cell % cols + 0.5) * cellWidth, (Math.floor(cell / cols) + 0.5) * cellHeight);
        }
      }
    }

    const tick = (time: number) => {
      if (!visible || motion.matches) { frame = 0; return; }
      if (lastTick) reportFrame(time - lastTick);
      lastTick = time;
      // Weaker devices keep the text still while the page is moving, so scrolling stays smooth.
      const resting = shouldRestDuringScroll() && isScrolling();
      if (!resting && time - lastDraw >= 1000 / 15) { draw(); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const syncPlayback = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !motion.matches && !document.hidden) {
        if (video.readyState === 0) video.load();
        void video.play().then(() => { if (!frame && visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(tick); }).catch(() => draw());
      } else {
        video.pause();
        if (visible) draw();
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); }, { rootMargin: '100px 0px' });
    const resizeObserver = new ResizeObserver(resize);
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    video.addEventListener('loadeddata', draw);
    document.addEventListener('visibilitychange', syncPlayback);
    motion.addEventListener('change', syncPlayback);
    const offTier = onTierChange(resize);
    resize();
    return () => {
      offTier();
      visible = false;
      observer.disconnect();
      resizeObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
      video.pause();
      video.removeEventListener('loadeddata', draw);
      document.removeEventListener('visibilitychange', syncPlayback);
      motion.removeEventListener('change', syncPlayback);
    };
  }, []);

  return (
    <div className="ct-footer-ascii" aria-hidden="true">
      <video ref={videoRef} src="/media/footer-ascii-source.mp4" poster={POSTER} muted loop playsInline preload="auto" />
      <canvas ref={canvasRef} />
    </div>
  );
}
