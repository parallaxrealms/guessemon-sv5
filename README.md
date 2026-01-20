# Guessemon

## Wordle Meets Pokémon  
**Created by Parallax**

### About  
Guessemon is a fan-made game where Wordle meets Pokémon! It challenges players to guess the name of a randomly selected Pokémon. The game is built using **SvelteKit / Svelte 5** and integrates data from the [PokéAPI](https://pokeapi.co/). On page load, a random Pokémon is fetched, and its name is set as the answer to the word puzzle. To assist players, the game provides hints in the form of the Pokémon's element type(s).

### Pokémon Name Filtering  
To keep the game fair, consistent, and interesting Pokémon names are filtered based on the following criteria:  
- **Name length**: Only Pokémon with names between 5 and 10 characters are included.  
- **No special characters**: Pokémon names containing dashes, spaces, or other non-alphabetical characters (e.g., `Ho-oh`, `Porygon-Z`) are excluded.  

### Leagues (Game Modes)
Guessemon offers three leagues to play based on your knowledge of the Pokemon Generations.
#### **1. Retro League**
- Pokémon are selected exclusively from **Generations 1 and 2**.
- Perfect for players who love the classic era of Pokémon.
- Fewer Pokémon to choose from, making it easier for nostalgic fans to guess.

#### **2. Common League**
- Pokémon are chosen from **Generations 1 through 6**.
- A balanced challenge for players familiar with Pokémon up to the mid-series games.
- A wider variety of names to guess, with more diversity in gameplay.

#### **3. Master League**
- Pokémon can come from **any generation**, spanning the entire Pokémon universe.
- The ultimate challenge for hardcore Pokémon fans who know their stuff.
- Test your knowledge with the largest pool of possible answers.

### Features  
- Built with **Svelte 5**
- TypeScript
- UI component libraries used:
  - **[Skeleton.dev](https://skeleton.dev/)**
  - **[shadcn-svelte](https://shadcn.dev/)**
  - **[svelte-animations](https://github.com/SikandarJODD/svelte-animations)**

### Project Migration to Svelte 5
This project is a complete migration of the **[original Guessemon game](https://github.com/parallaxrealms/guessemon)** which was written in **Svelte 4**, to **Svelte 5**. This rewrite also introduced TypeScript compatibility.

### Disclaimer  
Guessemon is a fan-made project created purely for entertainment purposes. It is not affiliated with, endorsed by, or officially associated with Nintendo, Game Freak, The Pokémon Company, or any related entities. All Pokémon names, designs, and trademarks belong to their respective owners.  

### Contributions
This project is 100% non-commercial. However, contributions in the form of feedback or code improvements are always welcome.
