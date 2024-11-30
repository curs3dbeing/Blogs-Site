from typing import Annotated
from fastapi import Depends
from PIL import Image
from pydantic import BaseModel
from enum import Enum

#async def load_image(filepath:str):
  #  with Image.open(filepath) as image:
    #    return image

class ReactionTypes(str, Enum):
    Like : str = 'Like'
    #Dislike : str = 'Dislike'
    #FunnyEmote : str = 'FunnyEmote'
    #SadEmote : str = 'SadEmote'
    #AngerEmote : str = 'AngerEmote'
    #Heart : str = 'Heart'
    #ShockEmote : str = 'ShockEmote'


class Reaction(BaseModel):
    id : int
    reaction_type: ReactionTypes


class AllReactions(BaseModel):
    reaction : Reaction
    count : int