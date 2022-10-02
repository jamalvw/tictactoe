const randomArrayItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const arrayEquals = (arr1, arr2) => arr1.every((v, i) => v == arr2[i]);

const gameFactory = () =>
{
	let state = '';
	let winPositions = null;
	let currentPlayerIndex = 0;

	const start = () =>
	{
		state = 'playing';
		// Set the current player to the first player
		currentPlayerIndex = 0;

		gameboard.init();
		updateDisplay();
	};

	const nextTurn = () =>
	{
		currentPlayerIndex++;
		// If we're out of players, loop back to the beginning
		if (currentPlayerIndex >= players.length)
			currentPlayerIndex = 0;


		// TEMPORARY AI player controller

		let tries = 0;
		while (currentPlayer().aiControlled && tries < 10 && state === 'playing')
		{
			tries++;
			const position = randomArrayItem(gameboard.availablePositions());
			mark(position[0], position[1]);
		}

		if (tries > 10) console.log('The AI seems to have crashed...');
	};

	const currentPlayer = () => players[currentPlayerIndex];

	const mark = (x, y) => 
	{
		gameboard.set(x, y, currentPlayer().symbol);

		winPositions = matchDiagForward() || matchDiagBackward() || matchRight() || matchDown();

		if (winPositions)
			state = 'win';
		else if (gameboard.isFull())
			state = 'tie';
		else
			nextTurn();

		updateDisplay();
	};

	const matchDiagForward = () =>
	{
		const symbol = currentPlayer().symbol;
		let positions = [];

		for (let step = 0; step < gameboard.size; step++)
		{
			if (symbol !== gameboard.get(step, step))
			{
				positions = null;
				break;
			}

			positions.push([step, step]);
		}

		return positions;
	};

	const matchDiagBackward = () =>
	{
		const symbol = currentPlayer().symbol;
		let positions = [];

		for (let step = 0; step < gameboard.size; step++)
		{
			if (symbol !== gameboard.get(gameboard.size - step - 1, step))
			{
				positions = null;
				break;
			}

			positions.push([gameboard.size - step - 1, step]);
		}

		return positions;
	};

	const matchRight = () =>
	{
		const symbol = currentPlayer().symbol;
		let positions = null;

		for (let y = 0; y < gameboard.size; y++)
		{
			let innerPositions = [];

			for (let x = 0; x < gameboard.size; x++)
			{
				if (symbol !== gameboard.get(x, y))
				{
					innerPositions = null;
					break;
				}

				innerPositions.push([x, y]);
			}

			if (innerPositions)
			{
				positions = innerPositions;
				break;
			}
		}
		
		return positions;
	};

	const matchDown = () =>
	{
		const symbol = currentPlayer().symbol;
		let positions = null;

		for (let x = 0; x < gameboard.size; x++)
		{
			let innerPositions = [];

			for (let y = 0; y < gameboard.size; y++)
			{
				if (symbol !== gameboard.get(x, y))
				{
					innerPositions = null;
					break;
				}

				innerPositions.push([x, y]);
			}

			if (innerPositions)
			{
				positions = innerPositions;
				break;
			}
		}
		
		return positions;
	};

	const getStateHtml = () => document.querySelector('.state');

	const getPlayersHtml = () => document.querySelector('.players');

	const updateDisplay = () =>
	{
		const player = currentPlayer();

		switch (state)
		{
			case 'playing':
				getStateHtml().textContent = `${player.name}'s Turn`;
				break;
			case 'win':
				getStateHtml().textContent = `${player.name} wins!`;
				break;
			case 'tie':
				getStateHtml().textContent = `It's a draw!`;
				break;
		}

		getPlayersHtml().textContent = players.map((p) => p.name).join(' vs. ');

		// Loop through each HTML item in the gameboard
		for (const htmlItem of gameboard.getAllItemHtmls())
		{
			const x = htmlItem.dataset.x;
			const y = htmlItem.dataset.y;
			const value = gameboard.get(x, y);

			// Clear classes and events and add base class
			htmlItem.onclick = '';
			htmlItem.className = '';
			htmlItem.classList.add('board__item');

			// Add color classes for certain marks
			switch (value)
			{
				case 'X':
					htmlItem.classList.add('mark-x');
					break;
				case 'O':
					htmlItem.classList.add('mark-o');
					break;
			}

			// Add win class if the game is won and this is a winning position
			if (state === 'win' && winPositions.some(v => arrayEquals(v, [x, y])))
				htmlItem.classList.add('board__item--winner');

			// If the game is playing, it's a user-controlled player's turn, and the spot isn't marked, make it available
			if (state === 'playing' && value === '' && !player.aiControlled)
			{
				htmlItem.classList.add('board__item--avail');
				htmlItem.onclick = () => mark(x, y);
			}

			htmlItem.textContent = value;
		}
	};

	return { start };
};

const playerFactory = (name, symbol, aiControlled) =>
{
	return { name, symbol, aiControlled };
};

let game = gameFactory();
let players = [];

const gameboard = (() =>
{
	const size = 3;
	const board = [];

	const init = () =>
	{
		// Fill gameboard with empty strings 
		for (let y = 0; y < size; y++)
		{
			board[y] = [];
			for (let x = 0; x < size; x++)
				board[y].push('');
		}
	};

	const get = (x, y) => board[x][y];
	const set = (x, y, value) => board[x][y] = value;

	const availablePositions = () =>
	{
		const positions = [];
		for (let x = 0; x < gameboard.size; x++)
			for (let y = 0; y < gameboard.size; y++)
				if (board[x][y] === '') positions.push([x, y]);
		return positions;
	}

	const isFull = () =>
	{
		return availablePositions().length === 0;
	}
	
	const getAllItemHtmls = () => document.querySelectorAll('.board__item');

	return { size, init, get, set, availablePositions, isFull, getAllItemHtmls, };
})();

document.querySelector('.new-vs-ai').onclick = () =>
{
	players = [playerFactory('Player', 'X', false), playerFactory('Computer', 'O', true)];
	game = gameFactory();
	game.start();
}

document.querySelector('.new-vs-friend').onclick = () =>
{
	players = [playerFactory('Player 1', 'X', false), playerFactory('Player 2', 'O', false)];
	game = gameFactory();
	game.start();
}