import { useEffect, useRef } from "react";

export default function GameOverModal({ isOpen, score, startNewGame }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal(); // Opens as a true backdrop modal
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className="game-over-modal">
      <h2>Game Over!</h2>
      <p>Final Score: <strong>{score}</strong></p>
      <button onClick={startNewGame}>Play Again</button>
    </dialog>
  );
}