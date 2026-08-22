<script lang="ts">
	let sticker: HTMLDivElement = $state(null!);
	let x = $state(0);
	let y = $state(0);
	let hovering = $state(false);

	const onMouseMove = (event: MouseEvent) => {
		const bounds = sticker.getBoundingClientRect();
		x = 2 * ((event.clientX - bounds.left) / bounds.width - 0.5);
		y = 2 * ((event.clientY - bounds.top) / bounds.height - 0.5);
		console.log(x, y);
	};
</script>

<svelte:window onmousemove={onMouseMove} />

<div bind:this={sticker} class="sticker" role="img" onmouseenter={() => (hovering = true)} onmouseleave={() => (hovering = false)}>
	<svg
		style:transform={hovering
			? `perspective(800px) rotateX(${-y * 40}deg) rotateY(${x * 40}deg)`
			: `perspective(800px) rotateX(0deg) rotateY(0deg)`}
		xmlns="http://w3.org"
		viewBox="0 0 1200 300"
		width="100%"
		height="100%"
	>
		<text class="text" fill="currentColor" dominant-baseline="hanging">melncat</text>
	</svg>
</div>

<style>
	.sticker {
	}
	svg {
		overflow: visible;
		transition: transform 0.2s;
	}
	.text {
		font-size: 16em;
		font-weight: bolder;
		stroke: #fff6;
		stroke-width: 0.3em;
		paint-order: stroke fill;
	}
</style>
