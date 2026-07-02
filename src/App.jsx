import { useState,useEffect} from 'react'
import Button from '@mui/material/Button';
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import GameOverModal from './GameOver.jsx'
import './App.css'


function App() 
{
  const [selectedOption, setSelectedOption] = useState(""); // This variable is the state that hold user selection
  
  const handleAnswerChange = (event) => { // This function is called when the user selects an option
    setSelectedOption(event.target.value);
    console.log("Selected option:", event.target.value); // Log the selected option to the console
  };
  
  const id = React.useId();

  const [questionCount, setQuestionCount] = useState(0) // Variable used to store number of questions asked

  const [category, setCategory] = useState(1); // variable for dropdown menu;

  const handleChange = (event) => { // This function is used when the user selects a category from the dropdown
    setCategory(event.target.value);
  };

  const [pokemon, setPokemon] = useState(null); // This stores the pokemon data from API

  
  //  score state variable, initialized at 0
  const [score, setScore] = useState(0);

  // function to modify the state to add to the score
  const increaseScore = () => {
    setScore(prevScore => prevScore + 10);
  };

  const checkAnswer = (selectedOption) => { // function that checks selected option
    setQuestionCount(prevCount => prevCount + 1); // Increment question count
    if (selectedOption === pokemon.generation) {
      increaseScore();
      console.log("Correct! Score increased to:", score + 10);
    } else {
      console.log("Incorrect. Score remains at:", score);
    }
    console.log("Question count:", questionCount + 1); // Log the updated question count
  };

  const fetchRandomPokemon = async () => {
    // This function creates a random ID and then gets a pokemon from POKEAPI using it.
    const randomId = Math.floor(Math.random() * 1025) + 1;
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const data = await pokemonResponse.json();
    const pokemonSpeciesResponse = await fetch(data.species.url);
    const speciesData = await pokemonSpeciesResponse.json();
    data.generation = speciesData.generation.name; // Add generation info to the pokemon data
    setPokemon(data);
    console.log(data.generation); // Log the generation name to the console
  
      // Check if the user reached 10 questions
   
  };



  const startNewGame = () => { // Not ready will be used to reset the game 
    fetchRandomPokemon();
    setScore(0);
    setQuestionCount(0);
    setIsGameOver(false);

  }
  const endGame = () => { }// Not ready will be used to end the game
   // Fetch a random Pokémon when the component first loads
  useEffect(() => {
    fetchRandomPokemon();
  }, []);

  useEffect(() => { // This helps score actually show up on screen IDK 
  console.log(" The actual UI Score updated to:", score);
}, [score]);


  return (
    <>
      <Box
      component="img"
      src={pokemon?.sprites?.front_default} //The sprite that we get from the API
      alt={pokemon?.name} // If sprite fails just give the name instead
      sx={{
        width: '100%',
        maxWidth: 400,
        height: 'auto',
        borderRadius: 2,
        boxShadow: 3,
      }}
    />
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      
      <h2>Current Score: {score}</h2>
      
      
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
        <h2>Question {questionCount}/10</h2>
      </div>
    </div>
    <Box>
      <title>Pokemon Trivia Game</title>
      <h1>Pokemon Trivia Game</h1>
      <p>Welcome to the Pokemon Trivia Game! Test your knowledge of the Pokemon universe by answering questions about different Pokemon species. Select a category and answer the questions to see how well you know your favorite Pokemon!</p>
    </Box>
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Category</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={category}
          label="Category"
          onChange={handleChange}
        >
          <MenuItem value={1}>Generation</MenuItem>
          <MenuItem value={2}>Gender</MenuItem>
          
        </Select>
      </FormControl>
    </Box>
       <FormControl>
      <FormLabel id={`${id}-label`}>What Generation is this Pokemon from?</FormLabel>
      <RadioGroup
        aria-labelledby={`${id}-label`}
        defaultValue=""
        value={selectedOption}
        onChange={handleAnswerChange}
        name="radio-buttons-group"
      >
        <FormControlLabel value="generation-i" control={<Radio />} label="Generation 1" />
        <FormControlLabel value="generation-ii" control={<Radio />} label="Generation 2" />
        <FormControlLabel value="generation-iii" control={<Radio />} label="Generation 3" />
        <FormControlLabel value="generation-iv" control={<Radio />} label="Generation 4" />
        <FormControlLabel value="generation-v" control={<Radio />} label="Generation 5" />
        <FormControlLabel value="generation-vi" control={<Radio />} label="Generation 6" />
        <FormControlLabel value="generation-vii" control={<Radio />} label="Generation 7" />
        <FormControlLabel value="generation-viii" control={<Radio />} label="Generation 8" />
        <FormControlLabel value="generation-ix" control={<Radio />} label="Generation 9" />
        
      </RadioGroup>
    </FormControl>
    <Box>
 <Button  variant="contained" onClick={() => 
 {
  checkAnswer(selectedOption)
  fetchRandomPokemon()
  setSelectedOption(""); 
  }}>
        Submit
      </Button>
    </Box>
    <GameOverModal isOpen={questionCount >= 10} score={score} startNewGame={startNewGame} />

    </>
  )
}

export default App
