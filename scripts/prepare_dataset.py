"""Normalize the Kaggle CSV into the JSON consumed by the React prototype."""

import csv
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "dataset" / "dataset-wisata-jogja-sekitar.csv"
OUTPUT = ROOT / "frontend" / "src" / "data" / "destinations.generated.json"

CATEGORY_MAP = {
    "Agrowisata": "nature",
    "Alam": "nature",
    "Pantai": "nature",
    "Wisata Air": "nature",
    "Budaya_Dan_Sejarah": "culture",
    "Desa Wisata": "culture",
    "Museum": "culture",
    "Pendidikan": "culture",
    "Religi": "culture",
    "Seni": "culture",
    "Kuliner": "culinary",
    "Buatan": "activity",
    "Minat Khusus": "activity",
}


def main():
    with SOURCE.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    # Dataset has coordinates but no regency field. Keep DIY bounds and remove
    # the known Borobudur record, which is outside the product's province scope.
    prepared = []
    seen = set()
    for row in rows:
        name = (row.get("nama") or "").strip()
        try:
            lat, lng = float(row["latitude"]), float(row["longitude"])
            votes = int(float(row["vote_count"] or 0))
            rating = float(row["vote_average"] or 0)
        except (KeyError, TypeError, ValueError):
            continue
        if not name or not (-8.22 <= lat <= -7.54 and 110.0 <= lng <= 110.86):
            continue
        if "borobudur" in name.casefold():
            continue
        key = (name.casefold(), round(lat, 7), round(lng, 7))
        if key in seen:
            continue
        seen.add(key)
        prepared.append((row, name, lat, lng, rating, votes))

    max_votes = max((item[5] for item in prepared), default=1) or 1
    popularity_cutoff = sorted(item[5] for item in prepared)[int(len(prepared) * 0.75)] if prepared else 0
    output = []
    for row, name, lat, lng, rating, votes in prepared:
        source_category = (row.get("type") or "").strip()
        category = CATEGORY_MAP.get(source_category)
        score = (max(0, min(rating, 5)) / 5) * math.log1p(max(votes, 0)) / math.log1p(max_votes)
        output.append({
            "id": str(row.get("no") or f"{lat:.7f}-{lng:.7f}"),
            "name": name,
            "regency": "DIY",
            "lat": lat,
            "lng": lng,
            "categories": [category] if category else [],
            "family": None,
            "accessible": None,
            "popularity": "popular" if votes >= popularity_cutoff else "hidden",
            "recommendationScore": round(score, 6),
            "rating": rating,
            "voteCount": votes,
            "sourceCategory": source_category,
            "hours": None,
            "desc": {"id": (row.get("description") or "").strip(), "en": ""},
            "image": (row.get("image") or "").strip(),
            "source": "Kaggle: farisrizqiawan/dataset-wisata-jogja-sekitar",
        })

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {len(output)} destinations from {len(rows)} CSV rows: {OUTPUT}")


if __name__ == "__main__":
    main()
