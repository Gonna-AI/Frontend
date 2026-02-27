import React from "react";
import Scene from "../Three/Scene";

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/20 to-black/40">
      <Scene />
    </div>
  );
}
