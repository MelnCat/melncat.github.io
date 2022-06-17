import { Font } from "./ported.js";

const chunk = (arr, n) =>
	arr.reduce((l, c, i) => (l[Math.floor(i / n)] ? l[Math.floor(i / n)].push(c) : (l[Math.floor(i / n)] = [c]), l), []);
const spaceWidth = Font.getWidth(" ");
const maxLineWidth = Font.getWidth("LLLLLLLLLLLLLLLLLLL");
const hr = "===================";

const centerBookLine = str => {
	const width = Font.getWidth(str);
	return `${" ".repeat(Math.floor((maxLineWidth - width) / 2 / spaceWidth) - 1)}${str}`;
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
		...(totalParts <= 1 ? authorLines : ["", `> Part ${part + 1} of ${totalParts}`, "", ...authorLines]),
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
	
	return books.map((x, i) => [createBookCover(title, author, i + 1, books.length).join("\n"), ...x])
}

const titleElem =  document.getElementById("title");
const authorElem = document.getElementById("author");
const textElem = document.getElementById("text");
const out = document.getElementById("out");
const clicky = document.getElementById("clicky");

if (!(titleElem instanceof HTMLInputElement && authorElem instanceof HTMLInputElement && textElem instanceof HTMLTextAreaElement))
	throw Error("????");

clicky.addEventListener("click", () => {
	const title = titleElem.value;
	const author = authorElem.value;
	const text = textElem.value;
	const books = makeBook(title, author, text);
	if (books.length === 1) {
		const book = books[0];
		const data = toStendhal(title, author, book);
		const blob = new Blob([data], { type: "text/plain" });
		out.innerHTML = `<a download="book.stendhal" href="${URL.createObjectURL(blob)}">cick here to download meow</a>`
	}
	// todo use blob download maybe fflate the into zip for 
	// DONT REMEMBER PREFIX IS "#- " wit hsace
})

const toStendhal = (title, author, pages) => `title: ${title}
author: ${author}
pages:
${pages.map(x => `#- ${x}`).join("\n")}
`