interface Joker {
	name: string;
	info: {
		order: number;
		unlocked: boolean;
		discovered: boolean;
		blueprint_compat: boolean;
		perishable_compat: boolean;
		eternal_compat: boolean;
		rarity: number;
		cost: number;
		name: string;
		pos: { x: number; y: number };
		soul_pos?: { x: number; y: number };
		set: "Joker";
		effect: string;
		config: {};
		unlock_condition: { type: string; extra: string; hidden: boolean };
	};
}
declare const out: Joker[];
export default out;