/**
 * shared/components/spinner/index.tsx
 */

// Component
// -----------------------------------------------------------------------------

export default function Spinner() {
  return (
    <div
      className="animate-spin"
      style={{
        width: "32px",
        height: "32px",
        clear: "both",
        margin: "20px auto",
        border: "4px rgba(0, 0, 0, 0.25) solid",
        borderTop: "4px black solid",
        borderRadius: "50%",
      }}
    ></div>
  );
}
