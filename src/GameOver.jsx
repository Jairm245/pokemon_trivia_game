import { useEffect, useRef, useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function GameOverModal({ isOpen, score, startNewGame, onSaveScore }) {
  const dialogRef = useRef(null);
  const [name, setName] = useState(""); 
  
  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal(); 
    } else {
      dialog.close();
      setName(""); 
    }
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className="game-over-modal">
      <h2>Game Over!</h2>
      <p>Final Score: <strong>{score}</strong></p>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <TextField 
          fullWidth
          slotProps={{ htmlInput: { style: { backgroundColor: 'white', borderRadius: '4px' } } }}
          id="outlined-basic" 
          value={name} 
          onChange={handleNameChange} 
          label="Enter your name" 
          variant="outlined" 
        />
        
        <Button 
          variant="contained" 
          disabled={!name.trim()}
          onClick={() => {
            onSaveScore(name, score);
            startNewGame();
          }}
          sx={{ 
            bgcolor: '#3b4cca', 
            color: '#fff', 
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#2a3a9e' } 
          }}
        >
          Save Score & Play Again
        </Button>
      </Box>
    </dialog>
  );
}