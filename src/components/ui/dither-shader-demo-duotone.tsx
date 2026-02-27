"use client";
import { DitherShader } from "@/components/ui/dither-shader";

export default function DitherShaderDemoDuotone() {
  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] relative overflow-hidden rounded-2xl border border-neutral-200 shadow-2xl dark:border-neutral-800">
      <DitherShader
        src="https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=2070&auto=format&fit=crop"
        gridSize={1}
        ditherMode="bayer"
        colorMode="duotone"
        primaryColor="#1e3a5f"
        secondaryColor="#f0e68c"
        threshold={0.45}
        className="h-full w-full"
      />
    </div>
  );
}
