import { strToU8, zipSync } from "https://cdn.skypack.dev/fflate?min";
import { Image } from "https://cdn.skypack.dev/image-js@0.35.4?min";

/**
 * @type {import("./data.json")["default"]}
 */
const data = await (await fetch("./data.json")).json();

const vanilla1xData = await (await fetch("./vanilla/1x/Jokers.png")).arrayBuffer();
const vanilla2xData = await (await fetch("./vanilla/2x/Jokers.png")).arrayBuffer();

const vanilla1x = await Image.load(vanilla1xData);
const vanilla2x = await Image.load(vanilla2xData);

const JOKER_WIDTH = 71;
const JOKER_HEIGHT = 95;

document.getElementById("processButton").addEventListener("click", async () => {
	const formData = new FormData(/** @type {HTMLFormElement} */ (document.getElementById("form")));
	const x1 = /** @type {File} */ (formData.get("1xjoker"));
	const x2 = /** @type {File} */ (formData.get("2xjoker"));
	const icon = /** @type {File} */ (formData.get("icon"));
	const iconImage = icon.size && (await Image.load(await icon.arrayBuffer()));
	
	if (!x1 && !x2) return alert("Please add at least one joker texture.");
	let x1Image = x1.size && (await Image.load(await x1.arrayBuffer()));
	let x2Image = x2.size && (await Image.load(await x2.arrayBuffer()));
	/** @type {Set<string>} */
	const changed = new Set();
	if (x1Image) {
		/** @type {string[]} */
		outer: for (const joker of data.flatMap(x =>
			x.info.soul_pos
				? [
						{ name: x.name, pos: x.info.pos },
						{ name: x.name, pos: x.info.soul_pos },
				  ]
				: [{ name: x.name, pos: x.info.pos }]
		)) {
			for (let i = joker.pos.x * JOKER_WIDTH; i < joker.pos.x * JOKER_WIDTH + JOKER_WIDTH; i++)
				for (let j = joker.pos.y * JOKER_HEIGHT; j < joker.pos.y * JOKER_HEIGHT + JOKER_HEIGHT; j++) {
					const vanillaPixel = vanilla1x.getPixelXY(i, j);
					const imagePixel = x1Image.getPixelXY(i, j);
					const error = vanillaPixel.map((x, i) => Math.abs(imagePixel[i] - x));
					if (!(vanillaPixel[3] === 0 && imagePixel[3] === 0) && error.some(x => x > 1)) {
						changed.add(joker.name);
						continue outer;
					}
				}
		}
	}
	if (x2Image) {
		/** @type {string[]} */
		outer: for (const joker of data.flatMap(x =>
			x.info.soul_pos
				? [
						{ name: x.name, pos: x.info.pos },
						{ name: x.name, pos: x.info.soul_pos },
				  ]
				: [{ name: x.name, pos: x.info.pos }]
		)) {
			for (let i = joker.pos.x * JOKER_WIDTH * 2; i < joker.pos.x * JOKER_WIDTH * 2 + JOKER_WIDTH * 2; i++)
				for (let j = joker.pos.y * JOKER_HEIGHT * 2; j < joker.pos.y * JOKER_HEIGHT * 2 + JOKER_HEIGHT * 2; j++) {
					const vanillaPixel = vanilla2x.getPixelXY(i, j);
					const imagePixel = x2Image.getPixelXY(i, j);
					const error = vanillaPixel.map((x, i) => Math.abs(imagePixel[i] - x));
					if (!(vanillaPixel[3] === 0 && imagePixel[3] === 0) && error.some(x => x > 1)) {
						changed.add(joker.name);
						continue outer;
					}
				}
		}
	}
	if (!x1Image) x1Image = x2Image.clone().resize({ width: x2Image.width / 2, height: x2Image.height / 2, interpolation: /** @type {"nearestNeighbor"} */ ("bilinear") });
	if (!x2Image) x2Image = x1Image.clone().resize({ width: x1Image.width * 2, height: x1Image.height * 2, interpolation: "nearestNeighbor" });
	const modName = formData.get("modName").toString().replaceAll('"', '\\"');
	const modId = formData.get("modId").toString().replaceAll('"', '\\"');
	const modDesc = formData.get("modDesc").toString().replaceAll('"', '\\"');
	// Yes, I know this is kind of bad. It's good enough though, and XSS doesn't matter in this case.
	const lua = `AltTexture {
	key = "jokers",
    set = "Joker",
	path = "Jokers.png",
	original_sheet = true,
	keys = {${[...changed].map(x => `"${x}"`).join(", ")}},
    loc_txt = {
        name = "${modName} Jokers"
    }
}
TexturePack {
    key = "${modId}",
    textures = {
        "${modId}_jokers",
    },
    loc_txt = {
        name = "${modName}",
        text = {"${modDesc}"}
    }
}
${icon.size ? `
SMODS.Atlas {
    key = "modicon",
    path = "icon.png",
    px = 34,
    py = 34
}` : ""}`;
	const metadata = {
		id: formData.get("modId"),
		name: formData.get("modName"),
		author: formData.get("modAuthors").toString().split(/,\s*/),
		description: formData.get("modDesc"),
		prefix: formData.get("modId"),
		main_file: "main.lua",
		badge_colour: formData.get("modBadgeColor").toString().replace("#", ""),
		badge_text_colour: formData.get("modBadgeTextColor").toString().replace("#", ""),
		version: formData.get("modVersion"),
		dependencies: [
			"Steamodded (>=1.*)",
			"malverk", // Multiple different mods can be used to fulfill this dependency. May want to use `provides` instead
		],
	};
	const modFolder = modName.replaceAll(/\s+/g, "");
	const archive = zipSync({
		[`${modFolder}/mod.json`]: strToU8(JSON.stringify(metadata, null, "\t")),
		[`${modFolder}/main.lua`]: strToU8(lua),
		[`${modFolder}/assets/1x/Jokers.png`]: x1Image.toBuffer(),
		[`${modFolder}/assets/2x/Jokers.png`]: x2Image.toBuffer(),
		...(icon.size ? {
			[`${modFolder}/assets/1x/icon.png`]: iconImage.width === 34 ? iconImage.toBuffer() : iconImage.resize({ width: 34, height: 34 }).toBuffer(),
			[`${modFolder}/assets/2x/icon.png`]: iconImage.width === 68 ? iconImage.toBuffer() : iconImage.resize({ width: 68, height: 68, interpolation: "nearestNeighbor" }).toBuffer(),
		} : null)
	});
	const blob = new Blob([archive], { type: "application/zip" });
	const a = document.createElement("a");
	a.download = `${modName.replaceAll(/\s+/g, "")}.zip`;
	const url = URL.createObjectURL(blob);
	a.href = url;
	a.click();
	URL.revokeObjectURL(url);
});
