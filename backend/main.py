from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from lexer import generate_script_dsl, generate_texto_dsl

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TokenizeRequest(BaseModel):
    text: str


@app.post("/tokenize")
def tokenize_handler(body: TokenizeRequest):
    return {"script": generate_script_dsl(body.text),
            "text": generate_texto_dsl(body.text)}
