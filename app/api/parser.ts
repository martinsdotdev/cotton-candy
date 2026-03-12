const VALID_TAGS = ["identifica", "instrucao"];

const GEOMETRIC_FORMS = [
	"quadrado", "círculo", "circulo", "triângulo", "triangulo",
	"retângulo", "retangulo", "pentágono", "pentagono",
	"hexágono", "hexagono", "losango", "trapézio", "trapezio",
	"oval", "elipse", "estrela", "cubo", "esfera",
	"cilindro", "cone", "pirâmide", "piramide"
];

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
    if (text == null || text == '')
	return result;
    
    let pos = 0;
    let current: Identifica | null = null;

    while (pos < text.length) {
	const start = text.indexOf("${", pos);
	if (start === -1) break;
	pos = start + 2;

	const tagEnd = text.indexOf("}", pos);
	if (tagEnd === -1) {
	    result.errors.push(`char ${start}: não encontrou "}" após "\${"`);
	    break;
	}
	const tagName = text.slice(pos, tagEnd);
	pos = tagEnd + 1;

	if (!VALID_TAGS.includes(tagName)) {
	    result.errors.push(`char ${start}: TAG desconhecida "${tagName}", esperado: ${VALID_TAGS.join(", ")}`);
	    break;
	}

	const contentEnd = text.indexOf("${", pos);
	if (contentEnd === -1) {
	    result.errors.push(`char ${start}: não encontrou TAG de fechamento: "${tagName}"`);
	    break;
	}
	const content = text.slice(pos, contentEnd).trim();
	pos = contentEnd + 2;

	const closingEnd = text.indexOf("}", pos);
	if (closingEnd === -1) {
	    result.errors.push(`char ${start}: não encontrou "}" no fechamento de "${tagName}"`);
	    break;
	}
	const closingTag = text.slice(pos, closingEnd);
	pos = closingEnd + 1;

	if (closingTag !== tagName) {
	    result.errors.push(`char ${start}: esperava fechamento {${tagName}}, encontrou {${closingTag}}`);
	    break;
	}

	if (tagName === "identifica") {
	    current = { nome: content, instrucao: [] };
	    result.users.push(current);

	} else if (tagName === "instrucao") {
	    if (!current) {
		result.errors.push(`aviso: instrucao sem identifica — fantasma criado`);
		current = { nome: "[fantasma]", instrucao: [] };
		result.users.push(current);
	    }
	    const lower = content.toLowerCase();
	    const form = GEOMETRIC_FORMS.find(f => lower.includes(f));
	    if (!form) {
		result.errors.push(`aviso: instrucao "${content}" não contém forma geométrica conhecida`);
	    }
	    current.instrucao.push(form ?? content);
	}
    }

    if (result.errors.length === 0) result.errors.push("ok");

    return result;
}
