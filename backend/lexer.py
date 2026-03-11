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
