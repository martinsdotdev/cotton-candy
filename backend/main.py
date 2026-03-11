from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from lexer import tokenize

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TokenizeRequest(BaseModel):
    input: str


@app.post("/tokenize")
def tokenize_handler(body: TokenizeRequest):
    tokens = tokenize(body.input)
    return {"tokens": tokens}
