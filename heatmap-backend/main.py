import io
import os ## new
import numpy as np
import pandas as pd
import math
import json
import matplotlib.pyplot as plt
from fastapi import FastAPI, UploadFile,File, Form,HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from scipy.ndimage import gaussian_filter
from openai import OpenAI ## new

app = FastAPI()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY")) ## new

# Allow React to talk to backend later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REQUIRED_KEYS = {"PlateLocSide", "PlateLocHeight", "ExitSpeed"}
####### HEAT MAP FUNCTION ###################
def compute_exitvelo_heatmap(payload, x_range=(-1.5, 1.5), y_range=(0, 4), grid_size=(100, 100), sigma=2):
    missing = REQUIRED_KEYS - set(payload.keys())
    if missing:
        raise ValueError(f"Missing keys: {sorted(missing)}")

    side = np.array(payload["PlateLocSide"], dtype=float)
    height = np.array(payload["PlateLocHeight"], dtype=float)
    ev = np.array(payload["ExitSpeed"], dtype=float)

    heatmap_sum, xedges, yedges = np.histogram2d(
        side, height, bins=grid_size, range=[x_range, y_range], weights=ev
    )
    counts, _, _ = np.histogram2d(
        side, height, bins=grid_size, range=[x_range, y_range]
    )

    heatmap_avg = np.zeros_like(heatmap_sum, dtype=float)
    mask = counts > 0
    heatmap_avg[mask] = heatmap_sum[mask] / counts[mask]
    heatmap_avg = gaussian_filter(heatmap_avg, sigma=sigma)

    extent = [xedges[0], xedges[-1], yedges[0], yedges[-1]]
    return heatmap_avg, extent

def draw_strike_zone(ax, left=-0.71, right=0.71, bottom=1.5, top=3.5):
    ax.plot([left, left], [bottom, top], "w-", lw=2)
    ax.plot([right, right], [bottom, top], "w-", lw=2)
    ax.plot([left, right], [bottom, bottom], "w-", lw=2)
    ax.plot([left, right], [top, top], "w-", lw=2)

    x_splits = np.linspace(left, right, 4)
    y_splits = np.linspace(bottom, top, 4)

    for i in range(1, 3):
        ax.plot([x_splits[i], x_splits[i]], [bottom, top], "w--", lw=1)
        ax.plot([left, right], [y_splits[i], y_splits[i]], "w--", lw=1)

######## SCOUTING REPORT FUNCTION ##################
def json_safe(obj):
    """Recursively convert NaN/Inf to None so FastAPI can JSON-serialize."""
    if obj is None:
        return None

    # numpy scalars -> python scalars
    if isinstance(obj, (np.floating, np.integer)):
        obj = obj.item()

    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj

    if isinstance(obj, dict):
        return {str(k): json_safe(v) for k, v in obj.items()}

    if isinstance(obj, (list, tuple)):
        return [json_safe(v) for v in obj]

    return obj

ZONE = {"x_min": -0.71, "x_max": 0.71, "z_min": 1.5, "z_max": 3.5}

def add_flags(df: pd.DataFrame) -> pd.DataFrame:
    d = df.copy()

    for c in ["PlateLocSide", "PlateLocHeight", "ExitSpeed", "Angle"]:
        if c in d.columns:
            d[c] = pd.to_numeric(d[c], errors="coerce")

    d["is_zone"] = (
        d["PlateLocSide"].between(ZONE["x_min"], ZONE["x_max"])
        & d["PlateLocHeight"].between(ZONE["z_min"], ZONE["z_max"])
    )

    pc = d["PitchCall"].astype(str).str.lower() if "PitchCall" in d.columns else pd.Series("", index=d.index)

    d["is_swing"] = pc.str.contains("swing") | pc.str.contains("foul") | pc.str.contains("inplay")
    d["is_whiff"] = pc.str.contains("swinging") & pc.str.contains("strike")
    d["is_chase"] = d["is_swing"] & (~d["is_zone"])

    d["is_bip"] = pc.str.contains("inplay") | d["ExitSpeed"].notna()
    d["is_hard_hit"] = d["ExitSpeed"].fillna(-1) >= 95

    return d

def summarize_trackman(df: pd.DataFrame):
    if "Pitcher" not in df.columns:
        raise ValueError("CSV must contain a Pitcher column")

    pitch_col = "TaggedPitchType" if "TaggedPitchType" in df.columns else "AutoPitchType"
    if pitch_col not in df.columns:
        raise ValueError("No pitch type column found (TaggedPitchType/AutoPitchType).")

    df = add_flags(df)
    df = df.dropna(subset=["Pitcher", pitch_col])

    out = {"zone_definition": ZONE, "pitchers": {}}

    for pitcher, p_df in df.groupby("Pitcher"):
        p_df = p_df.copy()
        pitcher_block = {
            "sample_size": int(len(p_df)),
            "pitch_types": {}
        }

        if "PitcherThrows" in p_df.columns and p_df["PitcherThrows"].notna().any():
            pitcher_block["pitcher_throws"] = str(p_df["PitcherThrows"].dropna().iloc[0])

        for pt, g in p_df.groupby(pitch_col):
            g = g.copy()
            n = int(len(g))
            if n < 10:
                continue

            zone_rate = float(g["is_zone"].mean())
            high_rate = float((g["PlateLocHeight"] >= 2.6).mean())
            glove_rate = float((g["PlateLocSide"] < 0).mean())

            whiff_per_swing = float(g.loc[g["is_swing"], "is_whiff"].mean()) if g["is_swing"].any() else None
            chase_rate = float(g.loc[~g["is_zone"], "is_swing"].mean()) if (~g["is_zone"]).any() else None

            avg_ev_bip = float(g.loc[g["is_bip"], "ExitSpeed"].mean()) if g["is_bip"].any() else None
            hard_hit_rate = float(g.loc[g["is_bip"], "is_hard_hit"].mean()) if g["is_bip"].any() else None

            hh = g[g["is_hard_hit"] & g["PlateLocSide"].notna() & g["PlateLocHeight"].notna()]
            damage_cluster = None
            if len(hh) >= 5:
                damage_cluster = {
                    "plate_loc_side_mean": float(hh["PlateLocSide"].mean()),
                    "plate_loc_height_mean": float(hh["PlateLocHeight"].mean()),
                    "avg_exitvelo": float(hh["ExitSpeed"].mean()) if "ExitSpeed" in hh.columns else None,
                }

            pitcher_block["pitch_types"][str(pt)] = {
                "n": n,
                "usage": round(n / len(p_df), 3),

                "avg_velo": float(pd.to_numeric(g["RelSpeed"], errors="coerce").mean()) if "RelSpeed" in g.columns else None,
                "avg_spin": float(pd.to_numeric(g["SpinRate"], errors="coerce").mean()) if "SpinRate" in g.columns else None,
                "avg_ivb": float(pd.to_numeric(g["InducedVertBreak"], errors="coerce").mean()) if "InducedVertBreak" in g.columns else None,
                "avg_hb": float(pd.to_numeric(g["HorzBreak"], errors="coerce").mean()) if "HorzBreak" in g.columns else None,

                "zone_rate": round(zone_rate, 3),
                "high_rate": round(high_rate, 3),
                "glove_side_rate": round(glove_rate, 3),

                "whiff_per_swing": None if whiff_per_swing is None else round(whiff_per_swing, 3),
                "chase_rate": None if chase_rate is None else round(chase_rate, 3),

                "avg_exitvelo_on_bip": None if avg_ev_bip is None else round(avg_ev_bip, 1),
                "hard_hit_rate_on_bip": None if hard_hit_rate is None else round(hard_hit_rate, 3),
                "damage_cluster": damage_cluster,
            }

        out["pitchers"][str(pitcher)] = pitcher_block

    return out
        

############### ENDPOINTS ################
@app.get("/health")
def health():
    return {"ok": True}

@app.post("/metadata")
async def metadata(file: UploadFile = File(...)):
    df = pd.read_csv(file.file, low_memory=False)

    def uniq(col):
        if col not in df.columns:
            return []
        return sorted(df[col].dropna().astype(str).unique().tolist())

    min_date = None
    max_date = None
    if "Date" in df.columns:
        d = pd.to_datetime(df["Date"], errors="coerce")
        if d.notna().any():
            min_date = str(d.min().date())
            max_date = str(d.max().date())

    return {
        "pitchers": uniq("Pitcher"),
        "batters": uniq("Batter"),
        "tagged_pitch_types": uniq("TaggedPitchType"),
        "auto_pitch_types": uniq("AutoPitchType"),
        "min_date": min_date,
        "max_date": max_date,
    }

########## HEAT MAPS END POINTS ################
@app.post("/heatmap/exitvelo")
def heatmap_exitvelo(payload: dict):
    heatmap, extent = compute_exitvelo_heatmap(payload)

    fig, ax = plt.subplots(figsize=(8, 10))
    ax.imshow(
        heatmap.T,
        extent=extent,
        origin="lower",
        cmap="jet",
        alpha=0.8,
        aspect="auto",
    )

    draw_strike_zone(ax)

    ax.set_xlim(-2.0, 2.0)
    ax.set_ylim(-0.5, 4.5)
    ax.set_title("Heatmap: (Exit Speed)")

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", dpi=200)
    plt.close(fig)
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png")

@app.post("/heatmap/upload")
async def heatmap_upload(
    file: UploadFile = File(...),
    pitcher: str = Form(None),
    batter: str = Form(None),
    pitch_type: str = Form(None),   # uses TaggedPitchType by default
    balls: int = Form(None),
    strikes: int = Form(None),
    date_from: str = Form(None),    # "YYYY-MM-DD"
    date_to: str = Form(None),      # "YYYY-MM-DD"
):
    # Read CSV
    df = pd.read_csv(file.file, low_memory=False)

    # --- Filters (only apply if provided) ---
    if pitcher:
        df = df[df["Pitcher"].astype(str).str.contains(pitcher, case=False, na=False)]

    if batter:
        df = df[df["Batter"].astype(str).str.contains(batter, case=False, na=False)]

    if pitch_type:
        # pick one: TaggedPitchType or AutoPitchType (Tagged is usually what you want)
        df = df[df["TaggedPitchType"].astype(str).str.contains(pitch_type, case=False, na=False)]

    if balls is not None:
        df = df[df["Balls"] == balls]

    if strikes is not None:
        df = df[df["Strikes"] == strikes]

    if date_from or date_to:
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
        if date_from:
            df = df[df["Date"] >= pd.to_datetime(date_from)]
        if date_to:
            df = df[df["Date"] <= pd.to_datetime(date_to)]

    if len(df) == 0:
        return {"error": "No rows match your filters."}

    # --- Keep needed columns, convert to numeric, drop bad rows ---
    needed = ["PlateLocSide", "PlateLocHeight", "ExitSpeed"]
    df = df[needed].copy()

    for col in needed:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=needed)

    if len(df) == 0:
        return {"error": "After cleaning, no valid rows for PlateLocSide/PlateLocHeight/ExitSpeed."}

    payload = {
        "PlateLocSide": df["PlateLocSide"].tolist(),
        "PlateLocHeight": df["PlateLocHeight"].tolist(),
        "ExitSpeed": df["ExitSpeed"].tolist(),
    }

    heatmap, extent = compute_exitvelo_heatmap(payload)

    fig, ax = plt.subplots(figsize=(8, 10))
    ax.imshow(
        heatmap.T,
        extent=extent,
        origin="lower",
        cmap="jet",
        alpha=0.8,
        aspect="auto",
    )
    draw_strike_zone(ax)
    ax.set_xlim(-2.0, 2.0)
    ax.set_ylim(-0.5, 4.5)
    ax.set_title("Heatmap: (Exit Speed)")

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", dpi=200)
    plt.close(fig)
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png")

############# SCOUTING REPORT ENDPOINT ##############

@app.post("/scouting-report")
async def scouting_report(
    file: UploadFile = File(...),
    pitcher: str = Form(None),
    pitch_type: str = Form(None),
    pitch_type_source: str = Form("tagged"),
):
    df = pd.read_csv(file.file, low_memory=False)

    # filter pitcher (substring match)
    if pitcher:
        df = df[df["Pitcher"].astype(str).str.contains(pitcher, case=False, na=False)]

    # filter pitch type (tagged vs auto)
    pitch_col = "TaggedPitchType" if pitch_type_source != "auto" else "AutoPitchType"
    if pitch_type and pitch_col in df.columns:
        df = df[df[pitch_col].astype(str).str.contains(pitch_type, case=False, na=False)]

    # build summary (this groups by Pitcher internally)
    summary = summarize_trackman(df)
    summary = json_safe(summary)

    # Step 2: if a pitcher was requested, return just that pitcher’s block
    if pitcher:
        pitchers = summary.get("pitchers", {})

        # exact key match first
        if pitcher in pitchers:
            return {
                "zone_definition": summary["zone_definition"],
                "pitcher": pitcher,
                **pitchers[pitcher],
            }

        # fallback: first partial match (handles "Humphreys, Ryan" vs "Ryan Humphreys")
        for name, block in pitchers.items():
            if pitcher.lower() in name.lower():
                return {
                    "zone_definition": summary["zone_definition"],
                    "pitcher": name,
                    **block,
                }

        return {"error": f"No pitcher match for '{pitcher}'"}

    # otherwise return the full set
    return summary

@app.post("/scouting-report/ai-json")
async def scouting_report_ai_json(file: UploadFile = File(...)):
    if client is None:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not set")

    if not file.filename.lower().endswith(".json"):
        raise HTTPException(status_code=400, detail="Please upload a .json file")

    try:
        raw = await file.read()
        llm_input = json.loads(raw.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON file")

    prompt = f"""
You are a baseball scouting analyst.

Write a concise scouting report using ONLY the JSON below.
Do not invent pitches, stats, tendencies, or conclusions not supported by the data.

Use this format:
1. Overview
2. Arsenal
3. Location Tendencies
4. Bat-Miss / Chase Profile
5. Contact Quality / Damage
6. Game Plan

Keep it practical and coach-friendly.

JSON:
{json.dumps(llm_input, indent=2)}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a baseball scouting analyst."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
    )

    report_text = response.choices[0].message.content
    return {"facts": llm_input, "report": report_text}
@app.post("/scouting-report/ai")
async def scouting_report_ai(
    file: UploadFile = File(...),
    pitcher: str = Form(None),
    pitch_type: str = Form(None),
    pitch_type_source: str = Form("tagged"),
):
    if client is None:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not set")

    df = pd.read_csv(file.file, low_memory=False)

    if pitcher:
        df = df[df["Pitcher"].astype(str).str.contains(pitcher, case=False, na=False)]

    pitch_col = "TaggedPitchType" if pitch_type_source != "auto" else "AutoPitchType"
    if pitch_type and pitch_col in df.columns:
        df = df[df[pitch_col].astype(str).str.contains(pitch_type, case=False, na=False)]

    summary = summarize_trackman(df)
    summary = json_safe(summary)

    llm_input = summary
    if pitcher:
        pitchers = summary.get("pitchers", {})
        if pitcher in pitchers:
            llm_input = {
                "zone_definition": summary["zone_definition"],
                "pitcher": pitcher,
                **pitchers[pitcher],
            }
        else:
            for name, block in pitchers.items():
                if pitcher.lower() in name.lower():
                    llm_input = {
                        "zone_definition": summary["zone_definition"],
                        "pitcher": name,
                        **block,
                    }
                    break

    prompt = f"""
You are a baseball scouting analyst.

Write a concise scouting report using ONLY the JSON below.
Do not invent pitches, stats, tendencies, or conclusions not supported by the data.

Use this format:
1. Overview
2. Arsenal
3. Location Tendencies
4. Bat-Miss / Chase Profile
5. Contact Quality / Damage
6. Game Plan

Keep it practical and coach-friendly.

JSON:
{json.dumps(llm_input, indent=2)}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a baseball scouting analyst."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
    )

    report_text = response.choices[0].message.content
    return {"facts": llm_input, "report": report_text}