<script lang="ts">
	import ShinyCard from '$lib/components/ShinyCard.svelte';

	let isDataLoaded = $state(false);
	let answer = $state<string | undefined>(undefined);
	let imageUrl = $state<string | undefined>(undefined);
	let pokemonType = $state<string | undefined>(undefined);
	let filteredOutNames = $state<{ name: string; generation: number }[]>([]);
	let modeValue = $state<number>(0);
	let userGuesses = $state<string[]>(['', '', '']);
	let attempts = $state<number>(0);
	let hintGiven = $state<boolean>(false);
	let feedback = $state<string[][]>([[], [], []]);
	let showHintCheckbox = $state<boolean>(true);
	let hasWon = $state<boolean>(false);
	let answerType = $state<string | null>(null);
	let filteredNames = $state<{ name: string; generation: number }[]>([]);

	const maxAttempts = 3;
	const allowedChars = /^[A-Za-z]$/;
	let inputRefs = $state<HTMLInputElement[]>([]);

	// Fetch all Pokémon data
	async function fetchMon(): Promise<void> {
		try {
			const response = await fetch(
				'https://pokeapi.co/api/v2/pokemon?limit=10000',
			);
			const data = await response.json();

			// Filter Pokémon names
			const filtered = data.results.filter(
				(p: any) =>
					/^[a-zA-Z]+$/.test(p.name) &&
					p.name.length >= 5 &&
					p.name.length <= 10 &&
					!p.name.includes('-'),
			);

			// Add generation information
			const pokemonWithGenerations = await Promise.all(
				filtered.map(async (pokemon: any) => {
					const speciesResponse = await fetch(
						pokemon.url.replace('/pokemon/', '/pokemon-species/'),
					);
					const speciesData = await speciesResponse.json();
					const generationNumber = parseInt(
						speciesData.generation.url.split('/').slice(-2, -1)[0],
					);
					return { name: pokemon.name, generation: generationNumber };
				}),
			);

			filteredOutNames = pokemonWithGenerations;

			await changeMode();
		} catch (error) {
			console.error('Error fetching Pokémon data:', error);
		}
	}

	// Filter mon based on mode and reset
	async function changeMode(): Promise<void> {
		if (modeValue === 0) {
			filteredNames = filteredOutNames.filter((p) => p.generation <= 2);
		} else if (modeValue === 1) {
			filteredNames = filteredOutNames.filter((p) => p.generation <= 6);
		} else {
			filteredNames = filteredOutNames;
		}

		// Pick new answer
		const newAnswer =
			filteredNames[Math.floor(Math.random() * filteredNames.length)];

		if (newAnswer) {
			answer = newAnswer.name;
			await getNewPokemonDetails(answer);
			resetGame();
		}
	}

	// Fetch mon details
	async function getNewPokemonDetails(pokemonName: string) {
		try {
			const res = await fetch(
				`https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
			);
			const data = await res.json();
			imageUrl = data.sprites.other['official-artwork'].front_default;
			pokemonType = data.types
				.map((typeInfo: any) => typeInfo.type.name)
				.join(', ');
		} catch (error) {
			console.error('Error fetching Pokémon details:', error);
		}
	}

	function checkGuess(): void {
		if (hasWon || attempts >= maxAttempts) return;

		const userGuess = userGuesses[attempts];
		feedback[attempts] = [];

		if (answer) {
			const answerArray = answer.toLowerCase().split('');
			const guessArray = userGuess.toLowerCase().split('');
			const answerUsed = new Array(answer.length).fill(false);

			// Correct letters in correct positions
			for (let i = 0; i < answerArray.length; i++) {
				if (guessArray[i] === answerArray[i]) {
					feedback[attempts][i] = 'green';
					answerUsed[i] = true;
				}
			}

			// Remaining letters
			for (let i = 0; i < answerArray.length; i++) {
				if (!feedback[attempts][i]) {
					const foundIndex = answerArray.findIndex(
						(letter, index) => letter === guessArray[i] && !answerUsed[index],
					);

					if (foundIndex !== -1) {
						feedback[attempts][i] = 'yellow';
						answerUsed[foundIndex] = true;
					} else {
						feedback[attempts][i] = 'gray';
					}
				}
			}

			if (feedback[attempts].every((f) => f === 'green')) {
				hasWon = true;
			}

			attempts++;
		}

		if (attempts >= 2 && !hintGiven && showHintCheckbox) {
			hintGiven = true;
			answerType = pokemonType || null;
		}
	}

	function resetGame() {
		userGuesses = ['', '', ''];
		attempts = 0;
		hintGiven = false;
		feedback = [[], [], []];
		hasWon = false;
	}

	// Handle single character input
	function handleCharInput(value: string, index: number) {
		const char = value.trim();
		if (!allowedChars.test(char)) {
			// If input is invalid, revert to previous char
			const prevChar = userGuesses[attempts][index] || '';
			// Reset input field to previous valid char
			if (inputRefs[index]) {
				inputRefs[index].value = prevChar;
			}
			return;
		}
		// If valid character, update the guess string
		const currentGuess = userGuesses[attempts];
		userGuesses[attempts] =
			currentGuess.slice(0, index) +
			char.toUpperCase() +
			currentGuess.slice(index + 1);

		// Move focus to next cell if possible
		if (index < (answer?.length ?? 0) - 1) {
			inputRefs[index + 1]?.focus();
		}
	}

	function handleKeyDown(e: KeyboardEvent, index: number) {
		if (e.key === 'Backspace') {
			if (!userGuesses[attempts][index]) {
				// current cell is empty move focus to previous cell
				if (index > 0) {
					inputRefs[index - 1]?.focus();
				}
			} else {
				// if not empty remove current char
				const currentGuess = userGuesses[attempts];
				userGuesses[attempts] =
					currentGuess.slice(0, index) + '' + currentGuess.slice(index + 1);
			}
		}
	}

	function storeRef(node: HTMLElement, index: number) {
		const input = node as HTMLInputElement;
		inputRefs[index] = input;

		return {};
	}

	$effect(() => {
		if (isDataLoaded) {
			(async () => {
				await changeMode();
			})();
		}
		let _ = modeValue;

		fetchMon();
	});
</script>

<div class="w-screen m-auto text-center">
	{#if answer}
		<div class="flex flex-col items-center justify-center md:min-h-screen">
			<h1
				class="bg-gradient-to-br from-red-400 to-yellow-200 bg-clip-text text-transparent box-decoration-clone text-2xl font-bold mb-2"
			>
				Guessémon
			</h1>
			<!-- Shiny Card -->
			<ShinyCard
				class="flex flex-col bg-gradient-radial from-yellow-300 to-pink-600 items-center justify-center"
			>
				{#if hasWon || attempts >= maxAttempts}
					<img
						src={imageUrl}
						alt={answer}
						class="absolute inset-0 w-full h-full object-fit rounded-lg"
					/>
				{:else}
					<h1 class="h1 font-bold text-white text-9xl">?</h1>
				{/if}
			</ShinyCard>
			<div class="mt-6">
				{#each userGuesses.slice(0, attempts) as guess, attemptIndex}
					<div
						class="letter-boxes grid"
						style="grid-template-columns: repeat({answer.length}, 2.5rem);"
					>
						{#each answer.split('') as _, index}
							<div
								class="w-10 h-10 border-2 border-surface-900 dark:border-surface-100 flex items-center justify-center rounded-md text-lg font-semibold
										{feedback[attemptIndex][index] === 'green'
									? 'bg-green-400'
									: feedback[attemptIndex][index] === 'yellow'
										? 'bg-yellow-400'
										: feedback[attemptIndex][index] === 'gray'
											? 'bg-gray-400'
											: ''}"
							>
								{guess[index] || ''}
							</div>
						{/each}
					</div>
				{/each}
			</div>
			{#if attempts < maxAttempts && !hasWon}
				{#key answer}
					<div class="mt-6">
						<div class="flex justify-center">
							{#each Array(answer.length) as _, i}
								<input
									type="text"
									inputmode="text"
									pattern="[A-Za-z]*"
									autocorrect="off"
									autocapitalize="none"
									spellcheck="false"
									class="w-10 h-10 md:w-12 md:h-12 bg-surface-100 dark:bg-surface-600 border border-surface-200 rounded-md text-center text-xl"
									maxlength="1"
									oninput={(e) =>
										handleCharInput((e.target as HTMLInputElement).value, i)}
									onkeydown={(e) => handleKeyDown(e, i)}
									use:storeRef={i}
									value={userGuesses[attempts][i] ?? ''}
								/>
							{/each}
						</div>
					</div>
				{/key}
			{/if}
			<div class="mt-0">
				<button
					class="btn-lg btn preset-outlined-primary-500 hover:preset-filled-primary-400-600 mt-4 px-4 py-1 text-surace-700 dark:text-surface-200 font-bold"
					onclick={checkGuess}
					disabled={hasWon ||
						attempts >= maxAttempts ||
						userGuesses[attempts].length !== answer.length}
				>
					Submit Guess
				</button>
				{#if hasWon}
					<button
						class="btn preset-outlined-warning-500 hover:preset-filled-warning-400-600 font-semibold mt-4 px-4 py-1 inline"
						onclick={changeMode}
					>
						Try Again
					</button>
				{:else if attempts >= maxAttempts}
					<button
						class="btn preset-outlined-warning-500 hover:preset-filled-warning-400-600 font-semibold mt-4 px-4 py-1 inline"
						onclick={changeMode}
					>
						Try Again
					</button>
				{/if}
			</div>

			<div class="p-1 w-3/4 flex justify-between items-center">
				<div class="flex items-center">
					<input
						id="showHint"
						type="checkbox"
						bind:checked={showHintCheckbox}
						class="checkbox mr-2 p-2"
					/>
					<label for="showHint">Show Hint after 2 Fails</label>
				</div>
				<div class="text-right">
					{#if hintGiven}
						<strong>Hint:</strong> The Pokémon type is {answerType}.
					{:else}
						<div style="width: 150px;"></div>
					{/if}
				</div>
			</div>

			{#if hasWon}
				<div class="p-4 bg-green-200 text-black rounded z-50">
					<strong>You Win!</strong> The Pokémon was {answer}. You guessed it in {attempts}
					tries.
				</div>
			{:else if attempts >= maxAttempts}
				<div class="p-4 bg-red-300 text-black rounded z-50">
					<strong>Game Over!</strong> The Pokémon was {answer}.
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex justify-center items-center h-screen">
			<h1 class="h1">
				<span
					class="bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone"
					>Loading...</span
				>
			</h1>
		</div>
	{/if}
</div>

<div
	class="league-card md:absolute md:left-0 md:top-40 border-2 border-purple-500 mx-auto w-4/5 md:w-64 h-72 mt-8 md:ml-6 rounded-sm"
>
	<div class="text-center mx-1">
		<p class="text-xl font-semibold">Choose your League:</p>
		<div class="my-4 mx-2">
			<label
				for="retro"
				class="block my-1 p-2 rounded-md cursor-pointer text-center font-bold border-2
        {modeValue === 0
					? 'bg-sky-500 text-white border-sky-500'
					: 'bg-transparent border-sky-300'}
        hover:bg-sky-500 hover:border-sky-500 hover:text-white transition"
			>
				<input
					type="radio"
					bind:group={modeValue}
					value={0}
					id="retro"
					class="hidden"
				/>
				Retro
			</label>

			<label
				for="common"
				class="block my-1 p-2 rounded-md cursor-pointer text-center font-bold border-2
			{modeValue === 1
					? 'bg-orange-500 text-white border-orange-500'
					: 'bg-transparent border-orange-300'}
			hover:bg-orange-500 hover:border-orange-500 hover:text-white transition"
			>
				<input
					type="radio"
					bind:group={modeValue}
					value={1}
					id="common"
					class="hidden"
				/>
				Common
			</label>

			<label
				for="master"
				class="block my-1 p-2 rounded-md cursor-pointer text-center font-bold border-2
		{modeValue === 2
					? 'bg-red-500 text-white border-red-500'
					: 'bg-transparent  border-red-300'}
		hover:bg-red-500 hover:border-red-500 hover:text-white transition"
			>
				<input
					type="radio"
					bind:group={modeValue}
					value={2}
					id="master"
					class="hidden"
				/>
				Master
			</label>
		</div>
		<div>
			<p>Pokemon chosen from:</p>
			{#if modeValue == 0}
				<p class="text-sky-500">Generations 1 + 2</p>
			{:else if modeValue == 1}
				<p class="text-orange-500">Generations 1 - 6</p>
			{:else if modeValue == 2}
				<p class="text-red-500">Any generation</p>
			{/if}
		</div>
	</div>
</div>

<div
	class="rules-card md:absolute md:right-0 md:top-40 border-2 border-purple-500 mx-auto w-4/5 md:w-64 h-64 mt-8 mb-2 md:mr-6 rounded-sm"
>
	<div class="text-center">
		<p class="text-xl font-semibold text-purple-500">Current Rules:</p>
		<div>
			<p>3 Guesses</p>
			<p class:line-through={!showHintCheckbox}>Hint After 2 Fails</p>
		</div>

		<p class="mt-4 font-semibold text-purple-500">Pokemon Filtered Out:</p>
		<div>
			<p>Non-Alphabetical</p>
			<p>Less than 5 letters</p>
			<p>More than 10 letters</p>
			{#if modeValue == 0}
				<p>Introduced after Generation 2</p>
			{:else if modeValue == 1}
				<p>Introduced after Generation 6</p>
			{/if}
		</div>
	</div>
</div>
