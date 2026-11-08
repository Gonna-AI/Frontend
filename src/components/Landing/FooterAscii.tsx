import { useEffect, useRef } from 'react';
import './FooterAscii.css';

// Render a small, silent video as text only while the footer is on screen.
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

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const characters = ' .,:;irsXA253hMHGS#9B&@';
    let frame = 0;
    let lastDraw = 0;
    let visible = false;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
      if (video.readyState < 2 || !video.videoWidth || !cols) return;
      // Fit in CSS pixels first: the character cells are taller than they are
      // wide, so fitting directly in grid coordinates distorts the picture.
      const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
      const sourceWidth = video.videoWidth * scale / width * cols;
      const sourceHeight = video.videoHeight * scale / height * rows;
      sampleContext!.fillStyle = '#000';
      sampleContext!.fillRect(0, 0, cols, rows);
      // The mobile footer is tall: anchor the landscape frame to the bottom
      // so it sits behind the wordmark instead of floating between link groups.
      const sourceTop = width <= 640 ? rows - sourceHeight : (rows - sourceHeight) / 2;
      const sourceLeft = (cols - sourceWidth) / 2;
      sampleContext!.drawImage(video, sourceLeft, sourceTop, sourceWidth, sourceHeight);
      const pixels = sampleContext!.getImageData(0, 0, cols, rows).data;
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      context!.fillStyle = '#090b0c';
      context!.fillRect(0, 0, width, height);
      context!.font = `${Math.max(5, cellHeight * 0.86)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context!.textAlign = 'center';
      context!.textBaseline = 'middle';
      // Mirror narrow strips from the footage itself into the unused space.
      // This continues its real texture and motion without distorting the
      // central image or introducing a different procedural pattern.
      const edgeCoordinate = (value: number, start: number, size: number, limit: number) => {
        const first = Math.max(0, Math.ceil(start));
        const last = Math.min(limit - 1, Math.floor(start + size - 1));
        const strip = Math.max(1, Math.min(14, Math.floor((last - first + 1) / 3)));
        const mirror = (distance: number) => {
          const cycle = distance % (strip * 2);
          return cycle < strip ? cycle : strip * 2 - cycle - 1;
        };
        if (value < first) return Math.min(last, first + mirror(first - value - 1));
        if (value > last) return Math.max(first, last - mirror(value - last - 1));
        return value;
      };
      const xSamples = Array.from({ length: cols }, (_, x) => edgeCoordinate(x, sourceLeft, sourceWidth, cols));
      const ySamples = Array.from({ length: rows }, (_, y) => edgeCoordinate(y, sourceTop, sourceHeight, rows));
      // Quantized tones keep the animation legible without thousands of style changes.
      for (let tone = 1; tone <= 5; tone++) {
        context!.fillStyle = `rgba(244, 221, 200, ${0.13 + tone * 0.15})`;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = (ySamples[y] * cols + xSamples[x]) * 4;
            const light = (pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722) / 255;
            if (Math.min(5, Math.ceil(light * 5)) !== tone || light < 0.035) continue;
            const glyph = characters[Math.min(characters.length - 1, Math.floor(Math.sqrt(light) * (characters.length - 1)))];
            context!.fillText(glyph, (x + 0.5) * cellWidth, (y + 0.5) * cellHeight);
          }
        }
      }
    }

    const tick = (time: number) => {
      if (!visible || motion.matches) { frame = 0; return; }
      if (time - lastDraw >= 1000 / 15) { draw(); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const syncPlayback = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (visible && !motion.matches && !document.hidden) {
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
    resize();
    return () => {
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
    <div className="agero-footer-ascii" aria-hidden="true">
      <video ref={videoRef} src="/media/footer-ascii-source.mp4" muted loop playsInline preload="auto" />
      <canvas ref={canvasRef} />
    </div>
  );
}
