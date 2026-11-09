// The ClerkTree mark rendered as liquid metal. Imported lazily, so the shader only loads where it shows.
import { LiquidMetal } from '@paper-design/shaders-react';

type Props = {
  still?: boolean;
  className?: string;
  /** Size of the mark inside the canvas (1 = edge to edge). */
  scale?: number;
  /** Canvas background; use a transparent value to sit on top of other artwork. */
  colorBack?: string;
  /** Colour the metal's highlights are tinted towards. */
  tint?: string;
  /** Flow speed of the metal (1 = default). */
  speed?: number;
  /** How strongly the metal follows the mark's edges (0 to 1). */
  contour?: number;
  /** Edge blur of the metal bands (0 = crisp). */
  softness?: number;
  /** Render resolution multiplier; small marks need more pixels to stay sharp. */
  pixelRatio?: number;
  /** Artwork to cast in metal; defaults to the mark alone. */
  image?: string;
  /** Number of metal bands across the shape. */
  repetition?: number;
  /** Colour fringing on the red and blue channels. */
  dispersion?: number;
};

export default function LiquidMetalMark({ still = false, className, scale = 0.62, colorBack = '#0a0a0a', tint = '#ffffff', speed = 1, contour = 0.4, softness = 0.1, pixelRatio = 2, image = '/brand/clerktree-mark-black.svg', repetition = 2, dispersion = 0.3 }: Props) {
  return (
    <LiquidMetal
      className={className}
      width="100%"
      height="100%"
      image={image}
      colorBack={colorBack}
      colorTint={tint}
      repetition={repetition}
      softness={softness}
      shiftRed={dispersion}
      shiftBlue={dispersion}
      distortion={0.07}
      contour={contour}
      angle={70}
      speed={still ? 0 : speed}
      scale={scale}
      fit="contain"
      minPixelRatio={pixelRatio}
    />
  );
}
