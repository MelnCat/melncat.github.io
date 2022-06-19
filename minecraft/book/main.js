import { Font } from "./ported.js";
import { zip } from "https://cdn.skypack.dev/fflate?min";

const encoder = new TextEncoder();

const chunk = (arr, n) =>
	arr.reduce((l, c, i) => (l[Math.floor(i / n)] ? l[Math.floor(i / n)].push(c) : (l[Math.floor(i / n)] = [c]), l), []);
const spaceWidth = Font.getWidth(" ");
const maxLineWidth = Font.getWidth("LLLLLLLLLLLLLLLLLLL");
const hr = "===================";

const centerBookLine = str => {
	const width = Font.getWidth(str);
	return `${" ".repeat(Math.max(Math.floor((maxLineWidth - width) / 2 / spaceWidth) - 1, 0))}${str}`;
};

/**
 *
 * @param {string} rawText
 * @returns
 */
const getLines = rawText => {
	let i = 0;
	const ret = [];
	const currL = [];
	const str = rawText
		.split(/\n+/)
		.map(x => x.split(/\s+/))
		.map(l =>
			l.flatMap(x => {
				if (Font.getWidth(x) <= maxLineWidth) return [x];
				return [...x].reduce(
					(l, c) =>
						Font.getWidth(l.at(-1) + c) > maxLineWidth
							? l.concat(c.toString())
							: l.slice(0, -1).concat(l.at(-1) + c),
					[""]
				);
			})
		);
	while (str.length !== 0) {
		i++;
		while (str[0].length !== 0) {
			i++;
			if (i > 10000000) {
				throw Error("a");
			}
			const width = Font.getWidth(currL.concat(str[0][0]).join(" "));
			if (width > maxLineWidth) break;
			currL.push(str[0].shift());
		}
		ret.push(currL.join(" "));
		currL.length = 0;
		if (str[0].length === 0) str.shift();
	}
	return ret;
};
const createBookCover = (name, author, part, totalParts) => {
	const nameLines = getLines(name).map(x => centerBookLine(x));
	const namePadding = (7 - nameLines.length) / 2;
	const authorLines = getLines(`> By ${author}`);
	return [
		hr,
		...Array(Math.floor(namePadding)).fill(""),
		...nameLines,
		...Array(Math.ceil(namePadding)).fill(""),
		hr,
		...(totalParts <= 1 ? authorLines : ["", `> Part ${part} of ${totalParts}`, "", ...authorLines]),
	];
};

/**
 *
 * @param {string} title
 * @param {string} author
 * @param {string} str
 * @returns {string[][]}
 */
const makeBook = (title, author, str) => {
	const l = getLines(str);
	const pages = [...chunk(l, 14)].map(x => `${x.join("\n")}`);
	const books = chunk(pages, 99);

	return books.map((x, i) => [createBookCover(title, author, i + 1, books.length).join("\n"), ...x]);
};

const titleElem = document.getElementById("title");
const authorElem = document.getElementById("author");
const textElem = document.getElementById("text");
const out = document.getElementById("out");
const generate = document.getElementById("generate");

if (
	!(
		titleElem instanceof HTMLInputElement &&
		authorElem instanceof HTMLInputElement &&
		textElem instanceof HTMLTextAreaElement
	)
)
	throw Error("????");

textElem.style.height = `${textElem.scrollHeight}px`;

const blobLink = (filename, content, blob, buttonClass = "download") => {
	const link = document.createElement("a");
	link.download = filename;
	link.href = URL.createObjectURL(blob);
	link.innerText = content;
	link.classList.add("button", buttonClass)
	return link.outerHTML;
}

generate.addEventListener("click", () => {
	const title = titleElem.value;
	const author = authorElem.value;
	const text = textElem.value;
	if (!(title && author && text)) return;
	out.innerText = "Loading...";
	const books = makeBook(title, author, text);
	if (books.length === 1) {
		const book = books[0];
		const data = toStendhal(title, author, book);
		const blob = new Blob([data]);
		out.innerHTML = blobLink("book.stendhal", "Download Book", blob);
	} else {
		const files = books.map((x, i) => [`book_pt${i + 1}.stendhal`, toStendhal(title, author, x)]);
		const blobs = files.map(x => new Blob([x[1]]));
		const zipped = zip(
			Object.fromEntries(files.map(([a, b]) => [a, encoder.encode(b)])),
			{ comment: "Generated with MelnCat's book generator" },
			(err, data) => {
				if (err) throw err;
				const all = new Blob([data]);
				out.innerHTML = `${blobLink("books.zip", "Download All (zip)", all)}${blobs
					.map((x, i) => blobLink(`book_pt${i + 1}.stendhal`, `Download Part ${i + 1}`, x, "download-part"))
					.join("")}`;
			}
		);
	}
	// todo use blob download maybe fflate the into zip for
	// DONT REMEMBER PREFIX IS "#- " wit hsace
});

const toStendhal = (title, author, pages) => `title: ${title}
author: ${author}
pages:
${pages.map(x => `#- ${x}`).join("\n")}
`;
