#!/usr/bin/env python3
"""Split the league monolith into per-section JSON files for the static site.

Reads:  data/league-data.json  (DO NOT EDIT - source of truth)
Writes: data/*.json + data/lineups/*.json

Repeatable & idempotent: re-running regenerates every split file from the
monolith. The site must read ONLY these split files, never league-data.json.
"""
import json
import os
import re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
SRC = os.path.join(DATA, "league-data.json")
PHOTOS = os.path.join(ROOT, "assets", "photos")
LINEUPS_DIR = os.path.join(DATA, "lineups")

TRADE_DEADLINE = "December 2, 2026 \u00b7 10:00 AM MT"


def load():
    with open(SRC, encoding="utf-8") as f:
        return json.load(f)


def write(name, obj):
    path = os.path.join(DATA, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {name} ({os.path.getsize(path)//1024} KB)")


def norm_name(s):
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()


def fnum(v):
    try:
        return round(float(v), 2)
    except (TypeError, ValueError):
        return 0.0


def main():
    d = load()
    os.makedirs(LINEUPS_DIR, exist_ok=True)

    managers = d["managers"]
    # strip any embedded base64 logos (photos live in assets/photos)
    for m in managers:
        m.pop("logo", None)
    name_to_id = {m["name"]: m["id"] for m in managers}

    # ---- photo map ----
    photo_map = {}
    if os.path.isdir(PHOTOS):
        for fn in sorted(os.listdir(PHOTOS)):
            stem, ext = os.path.splitext(fn)
            if ext.lower() in (".jpg", ".jpeg", ".png", ".webp") and stem != "draft-location":
                photo_map[stem] = f"assets/photos/{fn}"
    if os.path.exists(os.path.join(PHOTOS, "draft-location.jpg")):
        draft_location_photo = "assets/photos/draft-location.jpg"
    else:
        draft_location_photo = None

    # ---- meta ----
    league_meta = dict(d.get("leagueMeta", {}))
    league_meta.pop("logo", None)
    league_meta.pop("logoBadge", None)
    write("meta.json", {
        "league": league_meta,
        "tradeDeadline": TRADE_DEADLINE,
        "currentWeek2026": d.get("currentWeek2026"),
        "seasons": [2023, 2024, 2025, 2026],
        "photoMap": photo_map,
        "draftLocationPhoto": draft_location_photo,
        "nameToId": name_to_id,
    })

    # ---- managers ----
    write("managers.json", {"managers": managers})

    # ---- divisions ----
    write("divisions.json", {
        "divisions": d["divisions"],
        "divisionsData": d.get("divisionsData", {}),
        "intraDivisionRecord": d.get("intraDivisionRecord", {}),
        "divisionPowerData": d.get("divisionPowerData", {}),
        "rivalMap": d.get("rivalMap", {}),
    })

    # ---- standings ----
    write("standings.json", {
        "seasonTotals": d.get("seasonTotals", []),
        "careerTotals": d.get("careerTotals", {}),
        "standingsTrend": d.get("standingsTrend", {}),
        "powerRankings": d.get("powerRankings", []),
        "powerRankings2026": d.get("powerRankings2026", {}),
        "careerRecords": d.get("careerRecords", []),
    })

    # ---- drafts ----
    write("drafts.json", {"drafts": d.get("drafts", {})})

    # ---- brackets / results ----
    write("brackets.json", {
        "brackets": d.get("brackets", {}),
        "championshipSummary": d.get("championshipSummary", {}),
        "awards": d.get("awards", {}),
        "playoffRecord": d.get("playoffRecord", []),
    })

    # ---- records / HOF ----
    write("records.json", {
        "hofRecords": d.get("hofRecords", []),
        "hofTopTeamScores": d.get("hofTopTeamScores", []),
        "hofTopPlayerPerformances": d.get("hofTopPlayerPerformances", []),
        "hofByPosition": d.get("hofByPosition", []),
        "leagueGames": d.get("leagueGames", {}),
        "benchPoints": d.get("benchPoints", {}),
        "seasonalPFRecords": d.get("seasonalPFRecords", {}),
        "managerBlowouts": d.get("managerBlowouts", []),
        "managerClosest": d.get("managerClosest", []),
    })

    # ---- franchises ----
    write("franchises.json", {
        "yearByYear": d.get("yearByYear", {}),
        "franchiseBlurbs": d.get("franchiseBlurbs", {}),
        "headToHead": d.get("headToHead", {}),
        "franchiseRecords": d.get("franchiseRecords", {}),
    })

    # ---- rivalries ----
    rival_pairs = []
    seen = set()
    for a, b in d.get("rivalMap", {}).items():
        key = tuple(sorted([a, b]))
        if key not in seen:
            seen.add(key)
            rival_pairs.append({"a": key[0], "b": key[1]})
    write("rivalries.json", {"pairs": rival_pairs})

    # ---- bets ----
    write("bets.json", {"gambles": d.get("gambles", [])})

    # ---- newsletters ----
    write("newsletters.json", {"newsletters": d.get("newsletters", [])})

    # ---- schedule ----
    write("schedule.json", {
        "schedule2026": d.get("schedule2026", {}),
        "currentWeek2026": d.get("currentWeek2026"),
        "matchupOfWeekOverride2026": d.get("matchupOfWeekOverride2026"),
    })

    # ---- weekly scores ----
    write("weekly.json", {"weeklyScores": d.get("weeklyScores", [])})

    # ---- rules ----
    write("rules.json", {"rules": d.get("rules", {})})

    # ---- selfies / fame ----
    write("fame.json", {
        "famousSelfies": d.get("famousSelfies", []),
        "medals": d.get("hofByPosition", []),
    })

    # ---- lineups (one file per manager) ----
    lineups = d.get("weeklyLineups", {})
    for mid, seasons in lineups.items():
        path = os.path.join(LINEUPS_DIR, f"{mid}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"managerId": mid, "seasons": seasons},
                      f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote lineups/*.json ({len(lineups)} managers)")

    # ---- player index for search ----
    players = {}
    for mid, seasons in lineups.items():
        for season, weeks in seasons.items():
            for week, wk in weeks.items():
                for p in wk.get("players", []):
                    key = norm_name(p.get("player"))
                    if not key:
                        continue
                    e = players.setdefault(key, {
                        "name": p.get("player"),
                        "positions": defaultdict(int),
                        "entries": [],
                    })
                    e["positions"][p.get("position") or ""] += 1
                    e["entries"].append([
                        mid, int(season), int(week),
                        p.get("position"), fnum(p.get("points")),
                        1 if str(p.get("starter")).upper() == "Y" else 0,
                    ])
    index = []
    for key, e in players.items():
        pos = max(e["positions"].items(), key=lambda kv: kv[1])[0]
        index.append({"key": key, "name": e["name"], "pos": pos,
                      "n": len(e["entries"]), "entries": e["entries"]})
    index.sort(key=lambda x: x["name"].lower())
    write("players.json", {"players": index, "count": len(index)})

    print("done.")


if __name__ == "__main__":
    main()
