def parse_command(input_str, input_len, start, tokens):
	if start >= input_len:
		return input_len
	end_pos = input_str.find('}', start)
	if end_pos == -1:
		text = input_str[start :]
		tokens.append({'text': text, 'type': 'open_command'})
	else:
		text = input_str[start : end_pos]
		tokens.append({'text': text, 'type': 'command'})
	if end_pos == -1:
		return input_len
	return end_pos

def tokenize(input_str: str):
	"""
	parses input_str into tokens.
	there are 3 types of tokens 'text|command|open_command'
	the tokenize looks for first occurence of '${' while it does not
	happen it accumulates a text type of token.
	if it finds '${' it will look for '}', if it finds it tokenize it as
	type 'command' if it does not find it tokenize as type 'open_command'
	"""
	pos = 0;
	input_len = len(input_str)
	current_token = ''
	tokens = []
	while (pos < input_len - 1 or pos < 0):
		current = input_str[pos];
		if current != '$':
			current_token += current
		elif input_str[pos + 1] == '{':
			if current_token != '':
				tokens.append({'text': current_token, 'type': 'text'})
				current_token = ''
			pos = parse_command(input_str, input_len, pos + 2, tokens)
		pos = pos + 1
	if pos < input_len:
		current_token += input_str[-1]
	if current_token != '':
		tokens.append({'text': current_token, 'type': 'text'})
	return tokens

def extract_cmd(tokens):
	cmds = {}
	i = 0
	while i < len(tokens):
		token = tokens[i]
		if token['type'] == 'command' and '[' in token['text']:
			tag_name = token['text'].split('[')[0]
			if i + 1 < len(tokens) and tokens[i + 1]['type'] == 'text':
				if i + 2 < len(tokens) and tokens[i + 2]['type'] == 'command':
					if tag_name not in cmds:
						cmds[tag_name] = []
					cmds[tag_name].append(token['text'])
					i += 3
					continue
		i += 1
	return cmds

def cmd_map(tokens, cmd):
	cmd_map = {}
	for tag_name, refs in cmd.items():
		for ref in refs:
			idx = next(i for i, t in enumerate(tokens) if t.get('text') == ref)
			if idx + 1 < len(tokens):
				cmd_map[ref] = tokens[idx + 1]['text']
	return cmd_map

def detect_geometric(text):
	forms = ['quadrado', 'círculo', 'triângulo', 'retângulo']

	for form in forms:
		if form in text:
			return form
	return None

if __name__ == "__main__":
	script_text = """	Eu sou o ${identifica[0]}Pedro${identifica}, gostaria de
	${instrucao[0]}desenhar um quadrado${instrucao} e
	${instrucao[1]}depois um círculo${instrucao}.
	"""

	tokens = tokenize(script_text)
	cmd = extract_cmd(tokens)
	map = cmd_map(tokens, cmd)

	geometric = {}
	for ref in cmd.get('instrucao', []):
		text = map[ref]
		shape = detect_geometric(text)
		if shape:
			geometric[ref] = shape

	print("\n script DSL:")
	print(f"draw({cmd['instrucao'][0]},{cmd['identifica'][0]},'{geometric[cmd['instrucao'][0]]}')")
	print(f"draw({cmd['instrucao'][1]},{cmd['identifica'][0]},'{geometric[cmd['instrucao'][1]]}')")

	print("\n texto DSL:")
	print(f"draw('{map[cmd['instrucao'][0]]}','{map[cmd['identifica'][0]]}','{geometric[cmd['instrucao'][0]]}')")
	print(f"draw('{map[cmd['instrucao'][1]]}','{map[cmd['identifica'][0]]}','{geometric[cmd['instrucao'][1]]}')")
