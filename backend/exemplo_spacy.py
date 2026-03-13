import spacy

nlp = spacy.load("pt_core_news_lg")

doc = nlp("Eu sou o Pedro e gostaria de desenhar quadrado. Já a Letícia Maria gostaria de pintar um circulo")


GEOMETRIAS = ['círculo', 'quadrado', 'triângulo', 'retângulo', 'losango',
              'pentágono', 'hexágono', 'cubo', 'esfera', 'cilindro', 'cone']


geometria_docs = [nlp(geo) for geo in GEOMETRIAS]
    


result = ''


for sent in doc.sents:
    ents = []
    for ent in sent.ents:
        # print('sent.start', sent.start)
        ents.append((ent.start, ent.end, ent.text))
    i = 0
    while i < len(sent):
        token = sent[i]
        # print(f'{token.text}: {token.ent_type} {token.ent_type_}')
        # print(f'{token.text}: {token.morph}')
        
        person = ''
        for ent in ents:
            # print(ent)
            # print(i)
            if i + sent.start == ent[0]:
                person = ent[2]
                
                i = ent[1] - sent.start
        if person != '':
            result += '${identifica}' + person + '${identifica} '
            continue
        geometria = ''
        if token.pos_ == 'NOUN':
            for j in range(len(GEOMETRIAS)):
                if (geometria_docs[j].similarity(token) > 0.8):
                    geometria = GEOMETRIAS[j]
                    break
        if geometria != '':
            result += '${instrucao}' + geometria + '${instrucao} '
        else:
            result += token.text + ' '
        # print(token.pos_)
        i += 1
print(result.strip())


# ./.venv/bin/python3 ./main.py 
# Eu sou o ${identifica}Pedro${identifica} e gostaria de desenhar ${instrucao}quadrado${instrucao} . Já a ${identifica}Letícia Maria${identifica} gostaria de pintar um ${instrucao}círculo${instrucao}
