/**
 * Full-viewport paper grain. Sits above everything for a uniform "tooth",
 * but is pointer-events-none so it never eats clicks.
 */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="bg-grain pointer-events-none fixed inset-0 z-[90] opacity-[0.06]"
    />
  );
}
