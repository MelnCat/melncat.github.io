<script lang="ts">
	import { Spring } from "svelte/motion";

	const rot = new Spring({ x: 0, y: 0 }, { stiffness: 0.15, damping: 0.4 });

	let sticker: HTMLDivElement = $state(null!);
	let lastUpdate = 0;
	let hovering = $state(false);

	const onMouseMove = (event: MouseEvent) => {
		if (!hovering) return;
		if (lastUpdate + 1000 / 60 > Date.now()) return;
		const bounds = sticker.getBoundingClientRect();
		rot.target = {
			x: 2 * ((event.clientX - bounds.left) / bounds.width - 0.5),
			y: 2 * ((event.clientY - bounds.top) / bounds.height - 0.5),
		};
		lastUpdate = Date.now();
	};
	const onMouseLeave = () => {
		rot.target = { x: 0, y: 0 };
		hovering = false;
	};
</script>

<svelte:window />

<div
	bind:this={sticker}
	class="sticker"
	role="img"
	onmouseenter={() => {
		hovering = true;
	}}
	onmouseleave={onMouseLeave}
	onmousemove={onMouseMove}
>
	<svg
		style:transform={`perspective(800px) rotateX(${-rot.current.y * 20}deg) rotateY(${rot.current.x * 20}deg)`}
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 1090 260"
		width="100%"
		height="100%"
	>
		<defs>
			<filter id="stroke">
				<feMorphology operator="dilate" radius="30" in="SourceGraphic" result="outline" />
				<feFlood flood-color="#74c250" result="floodColor" />
				<feComposite operator="in" in="floodColor" in2="outline" result="coloredOutline" />
				<feComposite operator="over" in="SourceGraphic" in2="coloredOutline" result="text" />
			</filter>
			<filter id="light-stroke">
				<feMorphology operator="dilate" radius="2" in="SourceGraphic" result="outline" />
				<feFlood flood-color="#aa9999" result="floodColor" />
				<feComposite operator="in" in="floodColor" in2="outline" result="coloredOutline" />
				<feComposite operator="over" in="SourceGraphic" in2="coloredOutline" result="text" />
			</filter>

			<linearGradient
				id="shine"
				gradientUnits="objectBoundingBox"
				x1={0.5 + rot.current.x * 0.2 - 0.35}
				y1={0.5 + rot.current.y * 0.2 - 0.35}
				x2={0.5 + rot.current.x * 0.2 + 0.35}
				y2={0.5 + rot.current.y * 0.2 + 0.35}
			>
				<stop offset="30%" stop-color="white" stop-opacity="0" />
				<stop offset="50%" stop-color="white" stop-opacity="1" />
				<stop offset="70%" stop-color="white" stop-opacity="0" />
			</linearGradient>

			<mask id="shineMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1250" height="400">
				<text x="20" y="10" class="main" dominant-baseline="hanging">melncat</text>
			</mask>

			<linearGradient
				id="rainbow"
				gradientUnits="objectBoundingBox"
				x1={-0.5 + rot.current.x * -0.25}
				y1={0.5 + rot.current.y * -0.25}
				x2={-1 + rot.current.x * -0.25}
				y2={0.8 + rot.current.y * -0.25}
				spreadMethod="repeat"
			>
				<stop offset="0%" stop-color="#ff0000" />
				<stop offset="16%" stop-color="#ff6600" />
				<stop offset="32%" stop-color="#ffff00" />
				<stop offset="48%" stop-color="#00ff88" />
				<stop offset="64%" stop-color="#00ccff" />
				<stop offset="80%" stop-color="#6600ff" />
				<stop offset="96%" stop-color="#ff00cc" />
				<stop offset="100%" stop-color="#ff0000" />
			</linearGradient>
		</defs>
		<text x="20" y="10" class="main" dominant-baseline="hanging">melncat</text>
		<rect pointer-events="none" width="1250" height="400" fill="url(#rainbow)" mask="url(#shineMask)" opacity="0.5" class="rainbow" />
		<rect pointer-events="none" width="1250" height="400" fill="url(#shine)" mask="url(#shineMask)" opacity="0.7" class="shine" />
	</svg>
</div>

<style>
	.sticker {
		filter: url(#light-stroke);
		width: 30em;
		font-family: var(--font-strichpunkt-sans);
	}
	.shine {
		mix-blend-mode: hard-light;
	}
	.rainbow {
		mix-blend-mode: multiply;
	}
	svg {
		overflow: visible;
		will-change: transform;
	}
	.main {
		fill: #1c611b;
	}
	text {
		font-size: 16em;
		font-weight: bolder;
		filter: url(#stroke);
		font-weight: 700;
	}
</style>
