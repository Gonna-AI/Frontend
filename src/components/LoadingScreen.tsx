/**
 * Minimal loading screen – pure CSS, no heavy assets.
 * Shown as the Suspense fallback while route chunks are loading.
 * Matches the site's dark theme without pulling in gradients, SVGs or the logo.
 */
export default function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      {/* Simple pulsing spinner using inline styles – zero extra CSS / JS */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "rgba(255,255,255,0.7)",
          animation: "ct-spin 0.7s linear infinite",
        }}
      />
      {/* Inject the keyframe once */}
      <style>{`@keyframes ct-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
