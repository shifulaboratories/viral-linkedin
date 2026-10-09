// Shared, mutable state between the DOM and the WebGL scene. Written by
// plain event listeners and read inside useFrame, so scrolling never
// re-renders React — the scene just samples the latest values each frame.
export const sceneState = {
  // 0 at the top of the page, 1 at the bottom.
  progress: 0,
  // Pointer position in [-1, 1], used for a light camera parallax.
  pointerX: 0,
  pointerY: 0,
};
