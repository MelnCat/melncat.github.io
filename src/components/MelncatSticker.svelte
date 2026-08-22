<script lang="ts">
	import { Spring } from "svelte/motion";

	const rot = new Spring({ x: 0, y: 0 }, { stiffness: 0.15, damping: 0.6 });

	let sticker: HTMLDivElement = $state(null!);
	let hovering = $state(false);

	const onMouseMove = (event: MouseEvent) => {
		if (!hovering) return;
		const bounds = sticker.getBoundingClientRect();
		rot.target = {
			x: 2 * ((event.clientX - bounds.left) / bounds.width - 0.5),
			y: 2 * ((event.clientY - bounds.top) / bounds.height - 0.5),
		};
	};
	const onMouseLeave = () => {
		rot.target = { x: 0, y: 0 };
		hovering = false;
	};
</script>

<svelte:window onmousemove={onMouseMove} />

<div
	bind:this={sticker}
	class="sticker"
	role="img"
	onmouseenter={() => {
		hovering = true;
	}}
	onmouseleave={onMouseLeave}
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

			<linearGradient
				id="shine"
				gradientUnits="objectBoundingBox"
				x1={0.5 + rot.current.x * 0.2 - 0.35}
				y1={0.5 + rot.current.y * 0.2 - 0.35}
				x2={0.5 + rot.current.x * 0.2 + 0.35}
				y2={0.5 + rot.current.y * 0.2 + 0.35}
			>
				<stop offset="30%" stop-color="white" stop-opacity="0" />
				<stop offset="50%" stop-color="white" stop-opacity={0.65} />
				<stop offset="70%" stop-color="white" stop-opacity="0" />
			</linearGradient>

			<mask id="shineMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1250" height="400">
				<text x="20" y="10" class="main" dominant-baseline="hanging">melncat</text>
			</mask>
		</defs>
		<text x="20" y="10" class="main" dominant-baseline="hanging">melncat</text>
		<rect x="20" y="10" width="1250" height="400" fill="url(#shine)" mask="url(#shineMask)" />
	</svg>
</div>

<style>
	.sticker {
		font-family: var(--font-strichpunkt-sans);
	}
	svg {
		overflow: visible;
	}
	.main {
		fill: #257523;
	}
	text {
		font-size: 16em;
		font-weight: bolder;
		filter: url(#stroke);
		font-weight: 700;
	}
</style>
