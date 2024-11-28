from pydantic import BaseModel
from mainpy.src.services.tag_service import get_all_tags, get_tags_names, get_tags_ids
from enum import Enum

tags_dict = get_all_tags()
tags_list = get_tags_names()
tags_ids = get_tags_ids()

tags = Enum('Tag', tags_list)

class Tag(BaseModel):
    id: int
    tag_name: tags

class TagName(BaseModel):
    id: int
    tag_name: str