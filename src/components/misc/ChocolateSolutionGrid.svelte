<script lang="ts">
	const solve = () => {
		const choc = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2];

		const states = [
			{
				board: [
					[-1, -1, -1, -1],
					[-1, -1, -1, -1],
					[-1, -1, -1, -1],
					[-1, -1, -1, -1],
				],
				left: [...choc],
			},
		];

		const touching = (i: number, j: number) =>
			i % 2 === 0
				? [
						[i, j - 1],
						[i, j + 1],
						[i - 1, j],
						[i - 1, j + 1],
						[i + 1, j],
						[i + 1, j + 1],
					]
				: [
						[i, j - 1],
						[i, j + 1],
						[i - 1, j],
						[i - 1, j - 1],
						[i + 1, j],
						[i + 1, j - 1],
					];
		const sol: number[][][] = [];
		const seen = new Set();
		while (states.length) {
			const last = states.pop()!;
			if (seen.has(last.board.join(""))) continue;
			seen.add(last.board.join(""));
			if (last.left.length === 0) {
				sol.push(last.board);
				continue;
			}
			for (let i = 0; i < 4; i++) {
				outer: for (let j = 0; j < 4; j++) {
					if (last.board[i][j] !== -1) continue;
					for (const touch of touching(i, j)) {
						if (touch[0] < 0 || touch[0] > 3) continue;
						if (touch[1] < 0 || touch[1] > 3) continue;
						if (last.board[touch[0]][touch[1]] === last.left[0]) continue outer;
					}

					const newB = structuredClone(last.board);
					newB[i][j] = last.left[0];
					states.push({ board: newB, left: last.left.slice(1) });
				}
			}
		}
		return sol;
	};

	const solutions = solve();
</script>

<div class="solution-grid">
	{#each solutions as solution}
		<div class="solution">
			{#each solution as solutionRow}
				<div class="solution-row">
					{#each solutionRow as val}
						<div class="solution-cell" data-type={val}></div>
					{/each}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.solution {
		display: flex;
		flex-direction: column;
		border: 1px solid #8d8d8d;
		gap: 0.02em;
		padding: 0.5em;
	}
	.solution-row {
		display: flex;
		gap: 0.14em;
		&:nth-child(odd) {
			margin-left: 0.5em;
		}
	}
	.solution-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		justify-content: center;
		@media (width < 940px) {
			font-size: 0.7em;
		}
	}
	.solution-cell {
		width: 1em;
		height: 1em;
		border-radius: 50%;
		&[data-type="-1"] {
			border: #8d8d8d 1.9px dashed;
		}
		&[data-type="0"] {
			background-color: #ffffff;
		}
		&[data-type="1"] {
			background-color: #703f34;
		}
		&[data-type="2"] {
			background-color: #e5d993;
		}
	}
</style>
