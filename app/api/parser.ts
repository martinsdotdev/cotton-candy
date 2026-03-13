const VALID_TAGS = ["identifica", "instrucao"];

const GEOMETRIC_FORMS = [
	"quadrado", "circulo", "triangulo",
	"retangulo", "pentagono", "hexagono",
	"elipse", "estrela",
];

function normalize(s: string): string {
	return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export type Identifica = {
	nome: string;
	instrucao: string[];
};

export type ParseResult = {
	users: Identifica[];
	errors: string[];
};

export function parse(text: string): ParseResult {
	const result: ParseResult = { users: [], errors: [] };
	if (text == null || text == '') {
		result.errors.push("ok");
		return result;
	}

	let pos = 0;
	let current: Identifica | null = null;

	while (pos < text.length) {
		const start = text.indexOf("#{", pos);
		if (start === -1) break;

		const gap = text.slice(pos, start);
		if (gap.includes("}#")) {
			result.errors.push(`char ${text.indexOf("}", pos)}: encontrou "}#" sem abertura "#{" correspondente`);
			break;
		}

		pos = start + 2;

		const tagEnd = text.indexOf("}", pos);
		if (tagEnd === -1) {
			result.errors.push(`char ${start}: não encontrou "}" após "#{"`);
			break;
		}
		const tagName = text.slice(pos, tagEnd);
		pos = tagEnd + 1;

		if (!VALID_TAGS.includes(tagName)) {
			result.errors.push(`char ${start}: TAG desconhecida "${tagName}", esperado: ${VALID_TAGS.join(", ")}`);
			break;
		}

		const closeToken = `{${tagName}}#`;
		const contentEnd = text.indexOf(closeToken, pos);
		if (contentEnd === -1) {
			result.errors.push(`char ${start}: não encontrou fechamento "${closeToken}"`);
			break;
		}
		const content = text.slice(pos, contentEnd).replace(/\s+/g, ' ').trim();
		pos = contentEnd + closeToken.length;

		if (content.includes("#{")) {
			result.errors.push(`char ${start}: conteúdo da TAG "${tagName}" contém "#{" — provável fechamento malformado antes de "${closeToken}"`);
			break;
		}

		if (tagName === "identifica") {
			if (content === '') {
				result.errors.push(`char ${start}: TAG "identifica" com conteúdo vazio`);
				break;
			}
			current = { nome: content, instrucao: [] };
			result.users.push(current);

		} else if (tagName === "instrucao") {
			if (!current) {
				result.errors.push(`aviso: instrucao sem identifica — fantasma criado`);
				current = { nome: "[fantasma]", instrucao: [] };
				result.users.push(current);
			}
			const lower = normalize(content);
			const form = GEOMETRIC_FORMS.find(f => lower.includes(f));
			if (!form) {
				result.errors.push(`aviso: instrucao "${content}" não contém forma geométrica conhecida`);
			}
			current.instrucao.push(form ?? content);
		}
	}

	const remaining = text.slice(pos);
	if (remaining.includes("}#")) {
		result.errors.push(`aviso: encontrou "}#" sem abertura "#{" correspondente`);
		return result;
	}

	if (result.errors.length === 0) result.errors.push("ok");

	return result;
}
