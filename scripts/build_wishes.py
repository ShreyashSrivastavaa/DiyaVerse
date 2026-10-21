import os
import json
import re
import unicodedata

# Target counts per category
CATEGORY_CONFIG = {
    "happiness": {"code": "HAP", "total": 235, "en": 130, "hi": 53, "hinglish": 52},
    "family":    {"code": "FAM", "total": 235, "en": 130, "hi": 52, "hinglish": 53},
    "love":      {"code": "LOV", "total": 235, "en": 130, "hi": 53, "hinglish": 52},
    "health":    {"code": "HEA", "total": 235, "en": 130, "hi": 52, "hinglish": 53},
    "success":   {"code": "SUC", "total": 235, "en": 130, "hi": 53, "hinglish": 52},
    "friendship":{"code": "FRI", "total": 235, "en": 130, "hi": 52, "hinglish": 53},
    "hope":      {"code": "HOP", "total": 235, "en": 130, "hi": 53, "hinglish": 52},
    "universal": {"code": "UNI", "total": 235, "en": 130, "hi": 52, "hinglish": 53},
    "funny":     {"code": "FUN", "total": 120, "en": 60,  "hi": 30, "hinglish": 30},
}

def get_word_3grams(text):
    clean = re.sub(r'[^\w\s]', '', text.lower())
    words = [w for w in clean.split() if w]
    grams = set()
    for i in range(len(words) - 2):
        grams.add(f"{words[i]} {words[i+1]} {words[i+2]}")
    return grams, " ".join(words[:6])

def jaccard(set_a, set_b):
    if not set_a and not set_b:
        return 1.0
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)

def is_valid_wish(text, existing_items):
    length = len(text)
    if length < 40 or length > 140:
        return False
    
    norm = unicodedata.normalize('NFC', text.strip().lower())
    for item in existing_items:
        if unicodedata.normalize('NFC', item['text'].strip().lower()) == norm:
            return False
            
    grams, first_six = get_word_3grams(text)
    for item in existing_items:
        if len(first_six) > 20 and first_six == item['first_six']:
            return False
        if grams and item['grams']:
            sim = jaccard(grams, item['grams'])
            if sim > 0.58:
                return False
    return True
