import { useEffect, useRef,useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function GameOverModal({ isOpen, score, startNewGame,onSaveScore }) {
  const dialogRef = useRef(null);
  const [name, setName] = useState(""); 
  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal(); // Opens as a true backdrop modal
    } else {
      dialog.close();
      setName(""); // Reset input when modal closes
    }
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className="game-over-modal">
      <h2>Game Over!</h2>
      <p>Final Score: <strong>{score}</strong></p>
      <button onClick={() => {
        startNewGame();
        onSaveScore(name, score); // Save the score when starting a new game
      }}>Save Score and Play Again</button>
     <TextField style={{ backgroundColor: 'white' }} id="outlined-basic" value={name} onChange={handleNameChange} label="Enter your name" variant="outlined" />
    </dialog>
  );
}