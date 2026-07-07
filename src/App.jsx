import { useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import Skeleton from '@mui/material/Skeleton';
import GameOverModal from './GameOver.jsx'
import './App.css'
import LeaderBoard from './LeaderBoard.jsx';

const GENDER_DIFF_POKEMON_IDS = [
  3, 6, 12, 19, 20, 25, 26, 41, 42, 44, 45, 84, 85, 97, 111, 112, 118, 119, 
  123, 129, 130, 154, 165, 166, 178, 185, 186, 190, 194, 195, 198, 202, 207, 
  208, 212, 214, 215, 217, 221, 224, 229, 232, 257, 267, 269, 272, 274, 275, 
  315, 316, 317, 322, 323, 332, 350, 369, 396, 397, 398, 399, 400, 401, 402, 
  403, 404, 405, 407, 415, 417, 418, 419, 424, 443, 444, 445, 449, 450, 453, 
  454, 456, 457, 459, 460, 461, 464, 465, 473, 521, 592, 593, 668, 678, 876
];

const POKEMON_TYPES_POOL = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", 
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

const shuffleArray = (array) => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function App() {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [name, setName] = useState(""); 
  const [selectedOption, setSelectedOption] = useState(""); 
  const [leaderboardData, setLeaderboardData] = useState(() => {
  const savedLeaderboard = localStorage.getItem('pokemon_leaderboard');
  return savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
}); 
  const [questionCount, setQuestionCount] = useState(0);
  const [category, setCategory] = useState(1); 
  const [pokemon, setPokemon] = useState(null); 
  const [score, setScore] = useState(0);
  const id = React.useId();

  const handleAnswerChange = (event) => { 
    setSelectedOption(event.target.value);
  };
  
  const handleSaveScore = (playername, score) => { 
  const newEntry = { name: playername, score: score };
  
  // 1. Calculate the next updated leaderboard array
  const updatedLeaderboard = [...leaderboardData, newEntry];
  
  // 2. Save it directly to state
  setLeaderboardData(updatedLeaderboard);
  
  // 3. Save it securely to localStorage as a stringified JSON object
  localStorage.setItem('pokemon_leaderboard', JSON.stringify(updatedLeaderboard));
  
  // Keep your existing match cleanup routines
  setScore(0);
  setQuestionCount(0);
  setSelectedOption(""); 
  setName(""); 
  setHasAnswered(false);
  fetchRandomPokemon(category);
};

  const handleChange = (event) => { 
    const nextCategory = event.target.value;
    setCategory(nextCategory);
    setSelectedOption(""); 
    setHasAnswered(false); 
    fetchRandomPokemon(nextCategory); 
  };

  const increaseScore = () => {
    setScore(prevScore => prevScore + 10);
  };
  const playPokemonCry = () => {
  if (pokemon?.cryAudioUrl) {
    const audio = new Audio(pokemon.cryAudioUrl);
    audio.volume = 0.4; // Keep it comfortable so it doesn't blast ears!
    audio.play().catch(err => console.log("Audio playback blocked or failed:", err));
  }
};

  const checkAnswer = (selectedOption) => { 
    setQuestionCount(prevCount => prevCount + 1); 
    setHasAnswered(true); 
    
    let isCorrect = false;
    if (category === 1) {
      isCorrect = selectedOption === pokemon?.generation;
    } else if (category === 2) {
      isCorrect = selectedOption === pokemon?.correctGender;
    } else if (category === 3) {
      isCorrect = selectedOption === pokemon?.correctType;
    } else if (category === 4) {
      isCorrect = selectedOption === pokemon?.correctStage;
    }

    setIsCorrectAnswer(isCorrect);
    if (isCorrect) increaseScore();
  };

  const fetchRandomPokemon = async (currentCategory) => {
    setIsImageLoading(true);

    try {
      let randomId;
      if (currentCategory === 2) {
        const randomIndex = Math.floor(Math.random() * GENDER_DIFF_POKEMON_IDS.length);
        randomId = GENDER_DIFF_POKEMON_IDS[randomIndex];
      } else {
        randomId = Math.floor(Math.random() * 1025) + 1;
      }

      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await pokemonResponse.json();

      data.cryAudioUrl = data.cries?.latest || null;

      // Reset displayed sprite assignments dynamically
      data.displayedSpriteFront = data.sprites.front_default;
      data.displayedSpriteBack = null;

      if (currentCategory === 1 || currentCategory === 2) {
        const pokemonSpeciesResponse = await fetch(data.species.url);
        const speciesData = await pokemonSpeciesResponse.json();
        
        if (currentCategory === 1) {
          data.generation = speciesData.generation.name;
        } else if (currentCategory === 2) {
        const isFemale = Math.random() < 0.5;
        data.correctGender = isFemale ? "female" : "male";
        
        // 1. Set the baseline quiz sprites (Front + Back) based on chosen gender
        if (isFemale) {
          data.displayedSpriteFront = data.sprites.front_female || data.sprites.front_default;
          data.displayedSpriteBack = data.sprites.back_female || data.sprites.back_default;
        } else {
          data.displayedSpriteFront = data.sprites.front_default;
          data.displayedSpriteBack = data.sprites.back_default;
        }

        // 2. Explicitly cache all 4 views so we can reference the opposite gender later
        data.maleFront = data.sprites.front_default;
        data.maleBack = data.sprites.back_default;
        data.femaleFront = data.sprites.front_female || data.sprites.front_default;
        data.femaleBack = data.sprites.back_female || data.sprites.back_default;
      }
      } 
      else if (currentCategory === 3) {
        const correctType = data.types[0].type.name;
        data.correctType = correctType;

        const wrongTypesPool = POKEMON_TYPES_POOL.filter(type => type !== correctType);
        const wrongAnswers = [];
        while (wrongAnswers.length < 3) {
          const randomWrong = wrongTypesPool[Math.floor(Math.random() * wrongTypesPool.length)];
          if (!wrongAnswers.includes(randomWrong)) {
            wrongAnswers.push(randomWrong);
          }
        }
        data.typeOptions = shuffleArray([correctType, ...wrongAnswers]);
      }
      // --- CATEGORY 4: EVOLUTION STAGE ---
    else if (currentCategory === 4) {
      const pokemonSpeciesResponse = await fetch(data.species.url);
      const speciesData = await pokemonSpeciesResponse.json();
      
      // Fetch the evolution chain JSON
      const evoResponse = await fetch(speciesData.evolution_chain.url);
      const evoData = await evoResponse.json();

      const currentName = data.name;
      let stage = 1; // Default fallback

      const baseForm = evoData.chain;
      
      // Check if it's the base form
      if (baseForm.species.name === currentName) {
        stage = 1;
      } else if (baseForm.evolves_to.length > 0) {
        // Check second stage tier
        const isStage2 = baseForm.evolves_to.some(evo => evo.species.name === currentName);
        if (isStage2) {
          stage = 2;
        } else {
          // Check third stage tier
          const isStage3 = baseForm.evolves_to.some(evo => 
            evo.evolves_to.some(subEvo => subEvo.species.name === currentName)
          );
          if (isStage3) stage = 3;
        }
      }

      data.correctStage = String(stage); // Save as string to match radio button values easily
    }

      // Preload image checking routines (supporting single or multi-sprite setups)
      const urlsToPreload = [
        data.displayedSpriteFront, 
        data.displayedSpriteBack,
        data.maleFront,
        data.maleBack,
        data.femaleFront,
        data.femaleBack
      ].filter(Boolean);
      
      let loadedCount = 0;
      

      if (urlsToPreload.length > 0) {
        urlsToPreload.forEach((url) => {
          const img = new Image();
          img.src = url;
          img.onload = () => {
            // Automatically play the cry on load if it exists
      if (data.cryAudioUrl) {
        const audio = new Audio(data.cryAudioUrl);
        audio.volume = 0.3;
        audio.play().catch(() => {/* Browsers block autoplay until user interacts */});
      }
            loadedCount++;
            if (loadedCount === urlsToPreload.length) {
              setPokemon(data);
              setIsImageLoading(false);
            }
          };
        });
      } else {
        setPokemon(data);
        setIsImageLoading(false);
      }

    } catch (error) {
      console.error(error);
      setIsImageLoading(false);
    }
  };

  const startNewGame = () => { 
    fetchRandomPokemon(category);
    setScore(0);
    setQuestionCount(0);
    setHasAnswered(false);
    setIsCorrectAnswer(false);
    setSelectedOption(""); 
    setName(""); 
  };
 const clearLeaderboard = () => {
  if (window.confirm("Are you sure you want to clear all high scores?")) {
    localStorage.removeItem('pokemon_leaderboard'); // Delete from browser storage
    setLeaderboardData([]); // Clear from the current screen state
  }
};
  useEffect(() => {
    fetchRandomPokemon(category);
  }, []);

  // ... keep all your top imports, constants, and function logic exactly the same ...

  return (
  <>
    {/* MAIN FULL-SCREEN WRAPPER CONTAINER */}
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh', // Forces full viewport height
        maxHeight: '100vh',
        boxSizing: 'border-box',
        p: 2,
        overflow: 'hidden', // Disables body scrolling completely
        justifyContent: 'space-between'
      }}
    >
      
      {/* --- 1. COMPACT TOP HEADER HEADER BLOCK --- */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '2rem' }}>Pokémon Trivia Game</h1>
        <p style={{ color: '#555', fontWeight: 500, fontSize: '0.9rem', margin: 0 }}>
          Test your knowledge of the Pokémon universe!
        </p>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 1 }}>
          <h3 style={{ color: '#3b4cca', margin: 0, fontSize: '1.1rem' }}>
            Current Score: <span style={{ color: '#cc0000' }}>{score}</span>
          </h3>
          <h3 style={{ color: '#666', margin: 0, fontSize: '1.1rem' }}>
            Question {questionCount}/5
          </h3>
        </Box>
      </Box>

      {/* --- 2. CATEGORY DROPDOWN CONTROLLER --- */}
      <Box sx={{ minWidth: 120, mb: 1.5, maxWidth: 400, margin: '0 auto' }}>
        <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3b4cca' }, '&:hover fieldset': { borderColor: '#ffde00' } } }}>
          <InputLabel id="category-select-label" sx={{ color: '#3b4cca', fontWeight: 'bold' }}>Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={category}
            label="Category"
            onChange={handleChange}
            sx={{ color: '#3b4cca', fontWeight: 'bold' }}
          >
            <MenuItem value={1}>Generation</MenuItem>
            <MenuItem value={2}>Gender Difference</MenuItem>
            <MenuItem value={3}>Primary Type</MenuItem>
            <MenuItem value={4}>Evolution Stage</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* --- 3. THE MAIN DASHBOARD SPLIT GRID (3 COLUMNS SIDE-BY-SIDE) --- */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          justifyContent: 'center', 
          alignItems: 'stretch', 
          gap: 2, 
          width: '100%',
          maxWidth: 1350, 
          margin: '0 auto',
          flex: 1, // Dynamically consumes available viewport workspace
          minHeight: 0 // Crucial trick for inner scrolling blocks inside flex containers
        }}
      >
        
        {/* COLUMN A: MASSIVE SPRITE BOX */}
<Box sx={{ 
  flex: 1.4, // Gives this column even more structural width on the screen
  bgcolor: '#ffffff', 
  p: 2, 
  borderRadius: 4, 
  border: '5px solid #cc0000', 
  boxShadow: '0px 4px 0px #990000', 
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%', // Fills the vertical height of the row
  boxSizing: 'border-box'
}}>
  {isImageLoading ? (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
      <Skeleton variant="rectangular" animation="wave" sx={{ width: 280, height: 180, borderRadius: 2 }} />
      {category === 2 && (
        <Skeleton variant="rectangular" animation="wave" sx={{ width: 280, height: 180, borderRadius: 2 }} />
      )}
    </Box>
  ) : (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: category === 2 ? 'column' : 'row', // Stacks them vertically if there are two sprites
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 1, 
        width: '100%',
        flex: 1,
        minHeight: 0 // Allows contents to scale down safely if viewport shrinks
      }}
    >
      <Box
        component="img"
        src={pokemon?.displayedSpriteFront} 
        alt={`${pokemon?.name} front`} 
        sx={{ 
          width: '100%', 
          maxWidth: category === 2 ? 180 : 300, // 300px if single, 180px each if stacked to fit screen safely
          height: 'auto', 
          bgcolor: '#f5f5f5', 
          borderRadius: 2, 
          border: '2px solid #ccc',
          imageRendering: 'pixelated' 
        }} 
      />
      {pokemon?.displayedSpriteBack && (
        <Box
          component="img"
          src={pokemon?.displayedSpriteBack} 
          alt={`${pokemon?.name} back`} 
          sx={{ 
            width: '100%', 
            maxWidth: 180, // Matches the front sprite when stacked
            height: 'auto', 
            bgcolor: '#f5f5f5', 
            borderRadius: 2, 
            border: '2px solid #ccc',
            imageRendering: 'pixelated' 
          }} 
        />
      )}
    </Box>
  )}

  {!isImageLoading && pokemon?.cryAudioUrl && (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
      <Button 
        variant="contained" 
        size="small"
        onClick={playPokemonCry}
        sx={{ bgcolor: '#3b4cca', '&:hover': { bgcolor: '#2a3a9e' }, borderRadius: '20px', fontWeight: 'bold', px: 3 }}
      >
        🔊 Play Cry
      </Button>
    </Box>
  )}
</Box>
        {/* COLUMN B: MULTIPLE CHOICE RADIO FORMS */}
        <Box sx={{ 
          flex: 1.2,
          
          bgcolor: '#ffffff', 
          p: 2, 
          borderRadius: 3, 
          border: '3px solid #ffde00', 
          boxShadow: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto' // Fallback inside panel if options are tall
        }}>
          <FormControl component="fieldset" sx={{ display: 'block', width: '100%' }}>
            {category === 1 && (
              <>
                <FormLabel id={`${id}-gen-label`} sx={{ color: '#3b4cca', fontWeight: 'bold', mb: 0.5, display: 'block', fontSize: '0.95rem' }}>What Generation is this Pokemon from?</FormLabel>
                <RadioGroup aria-labelledby={`${id}-gen-label`} value={selectedOption} onChange={handleAnswerChange} name="generation-group" sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                    <FormControlLabel value="generation-i" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 1 (Red/Blue)" />
                    <FormControlLabel value="generation-ii" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 2 (Gold/Silver)" />
                    <FormControlLabel value="generation-iii" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 3 (Ruby/Sapphire)" />
                    <FormControlLabel value="generation-iv" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 4 (Diamond/Pearl)" />
                    <FormControlLabel value="generation-v" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 5 (Black/White)" />
                    <FormControlLabel value="generation-vi" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 6 (X/Y)" />
                    <FormControlLabel value="generation-vii" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 7 (Sun/Moon)" />
                    <FormControlLabel value="generation-viii" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 8 (Sword/Shield)" />
                    <FormControlLabel value="generation-ix" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Gen 9 (Scarlet/Violet)" />
                  </Box>
                </RadioGroup>
              </>
            )}

            {category === 2 && (
              <>
                <FormLabel id={`${id}-gender-label`} sx={{ color: '#3b4cca', fontWeight: 'bold', mb: 1, display: 'block', fontSize: '0.95rem' }}>
                  Based on the perspectives, is this variant Male or Female?
                </FormLabel>
                <RadioGroup aria-labelledby={`${id}-gender-label`} value={selectedOption} onChange={handleAnswerChange} name="gender-group">
                  <FormControlLabel value="male" control={<Radio sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="♂️ Male" />
                  <FormControlLabel value="female" control={<Radio sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="♀️ Female" />
                </RadioGroup>
              </>
            )}

            {category === 3 && (
              <>
                <FormLabel id={`${id}-type-label`} sx={{ color: '#3b4cca', fontWeight: 'bold', mb: 1, display: 'block', fontSize: '0.95rem' }}>What is the primary Type of this Pokémon?</FormLabel>
                <RadioGroup aria-labelledby={`${id}-type-label`} value={selectedOption} onChange={handleAnswerChange} name="type-group">
                  {pokemon?.typeOptions?.map((typeOption) => (
                    <FormControlLabel 
                      key={typeOption} 
                      value={typeOption} 
                      control={<Radio sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} 
                      label={typeOption.charAt(0).toUpperCase() + typeOption.slice(1)} 
                    />
                  ))}
                </RadioGroup>
              </>
            )}

            {category === 4 && (
              <>
                <FormLabel id={`${id}-stage-label`} sx={{ color: '#3b4cca', fontWeight: 'bold', mb: 1, display: 'block', fontSize: '0.95rem' }}>What evolution stage is this Pokémon in?</FormLabel>
                <RadioGroup aria-labelledby={`${id}-stage-label`} value={selectedOption} onChange={handleAnswerChange} name="stage-group">
                  <FormControlLabel value="1" control={<Radio sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Stage 1 (Base / Baby Form)" />
                  <FormControlLabel value="2" control={<Radio sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Stage 2 (First Evolution)" />
                  <FormControlLabel value="3" control={<Radio sx={{ '&.Mui-checked': { color: '#cc0000' } }} />} label="Stage 3 (Second Evolution)" />
                </RadioGroup>
              </>
            )}
          </FormControl>

          {/* COMPACT POST-ANSWER REVEAL FEEDBACK */}
          {hasAnswered && (
            <Box sx={{ mt: 1, p: 1, bgcolor: isCorrectAnswer ? '#e8f5e9' : '#ffebee', borderRadius: 2, textAlign: 'center', border: isCorrectAnswer ? '1px solid green' : '1px solid red' }}>
              {isCorrectAnswer ? (
                <p style={{ color: 'green', margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>🎉 Correct! Great job!</p>
              ) : (
                <>
                  <p style={{ color: 'red', margin: '0 0 2px 0', fontWeight: 'bold', fontSize: '0.9rem' }}>❌ Incorrect!</p>
                  {category === 1 && <p style={{ margin: 0, fontSize: '0.8rem' }}>{pokemon?.name} is from <strong>{pokemon?.generation.replace('generation-', 'Gen ').toUpperCase()}</strong>.</p>}
                 {category === 2 && hasAnswered && !isCorrectAnswer && (
  <>
    {/* --- FULL SCREEN BLUR BACKDROP --- */}
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999, 
      }}
    />

    {/* --- VIEWPORT FIXED CENTER POP-UP WINDOW --- */}
    <Box 
      sx={{ 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000, 
        width: '95%',
        maxWidth: '540px',
        bgcolor: '#ffffff',
        boxShadow: '0px 12px 40px rgba(0,0,0,0.3)',
        p: 3,
        borderRadius: 4,
        border: isCorrectAnswer ? '5px solid #4caf50' : '5px solid #f44336',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      <h3 style={{ color: isCorrectAnswer ? 'green' : 'red', margin: '0 0 6px 0', fontSize: '1.4rem' }}>
        {isCorrectAnswer ? '🎉 Correct! Brilliant!' : '❌ Incorrect!'}
      </h3>
      
      <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#333', lineHeight: 1.4 }}>
        This was a <strong>{pokemon?.correctGender.toUpperCase()}</strong> {pokemon?.name}. 
        Look closely at the differences below:
      </p>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        
        {/* --- MALE ACCORDION CARD --- */}
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: '#f9f9f9',
          border: pokemon?.correctGender === 'male' ? '3px solid #4caf50' : '3px solid #f44336',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', fontWeight: 'bold', color: pokemon?.correctGender === 'male' ? '#4caf50' : '#f44336' }}>
            ♂️ Male {pokemon?.correctGender === 'male' ? '(Correct)' : '(Guess)'}
          </p>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <img src={pokemon?.maleFront} alt="Male front" style={{ width: '110px', height: '110px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ddd', imageRendering: 'pixelated' }} />
            <img src={pokemon?.maleBack} alt="Male back" style={{ width: '110px', height: '110px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ddd', imageRendering: 'pixelated' }} />
          </Box>
        </Box>
        
        {/* --- FEMALE ACCORDION CARD --- */}
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: '#f9f9f9',
          border: pokemon?.correctGender === 'female' ? '3px solid #4caf50' : '3px solid #f44336',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', fontWeight: 'bold', color: pokemon?.correctGender === 'female' ? '#4caf50' : '#f44336' }}>
            ♀️ Female {pokemon?.correctGender === 'female' ? '(Correct)' : '(Guess)'}
          </p>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <img src={pokemon?.femaleFront} alt="Female front" style={{ width: '110px', height: '110px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ddd', imageRendering: 'pixelated' }} />
            <img src={pokemon?.femaleBack} alt="Female back" style={{ width: '110px', height: '110px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #ddd', imageRendering: 'pixelated' }} />
          </Box>
        </Box>
      </Box>

      {/* --- NEW ACTION BUTTON INSIDE POP-UP TO CLEAR STATE --- */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => {
            fetchRandomPokemon(category);
            setSelectedOption(""); 
            setHasAnswered(false); // Closes the pop-up instantly
          }}
          sx={{ 
            bgcolor: '#cc0000', 
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '1rem',
            px: 5,
            py: 1,
            '&:hover': { bgcolor: '#aa0000' }
          }}
        >
          Next Question
        </Button>
      </Box>
    </Box>
  </>
)}

                  {category === 3 && <p style={{ margin: 0, fontSize: '0.8rem' }}>{pokemon?.name} is a <strong>{pokemon?.correctType.toUpperCase()}</strong> type.</p>}
                  {category === 4 && <p style={{ margin: 0, fontSize: '0.8rem' }}>{pokemon?.name} is a <strong>Stage {pokemon?.correctStage}</strong> Pokémon.</p>}
                </>
              )}
            </Box>
          )}

          {/* CONTROLS CONFIRMATION BUTTON */}
 <Box sx={{ mt: 1.5 }}>
  <Button 
    variant="contained" 
    disabled={!selectedOption && !hasAnswered} 
    onClick={() => {
      if (!hasAnswered) {
        checkAnswer(selectedOption);
      } else {
        fetchRandomPokemon(category);
        setSelectedOption(""); 
        setHasAnswered(false);
      }
    }}
    sx={{ 
      bgcolor: '#cc0000', 
      color: '#ffffff',
      fontWeight: 'bold',
      width: '100%',
      py: 1,
      // ONLY hide this button if they are in Category 2, answered, AND got it incorrect (so the modal can handle it)
      display: (category === 2 && hasAnswered && !isCorrectAnswer) ? 'none' : 'inline-flex', 
      '&:hover': { bgcolor: '#aa0000' },
      '&.Mui-disabled': { bgcolor: '#ccaaaa' }
    }}
  >
    {hasAnswered ? "Next Question" : "Submit Answer"}
  </Button>
</Box>
        </Box>

        {/* COLUMN C: INTEGRATED SIDE HIGH SCORE LEADERBOARD */}
       
        <Box sx={{ 
          flex: 1.4, 
          bgcolor: '#ffffff', 
          borderRadius: 3, 
          boxShadow: 1, 
          border: '2px solid #ccc',
          p: 1, // Tightened padding to maximize table space
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto', 
          boxSizing: 'border-box', // Prevents padding from forcing clipping
          minWidth: 0 // Allows internal components to stretch/shrink safely
        }}>
          {leaderboardData.length > 0 && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={clearLeaderboard}
              size="small"
              sx={{ fontWeight: 'bold', fontSize: '0.75rem', py: 0.2, mb: 1 }}
            >
              Clear Scores
            </Button>
          )}
          <LeaderBoard data={leaderboardData} />
        </Box>
        
      </Box>

      {/* MODAL CONTROL GATE */}
      <GameOverModal isOpen={questionCount >= 5} score={score} startNewGame={startNewGame} onSaveScore={handleSaveScore} />
    </Box>
  </>
)
}

export default App;