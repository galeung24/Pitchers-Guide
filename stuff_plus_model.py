



# from __future__ import annotations

# from dataclasses import dataclass, field
# from typing import Dict, List, Tuple

# import numpy as np
# import pandas as pd
# from sklearn.compose import ColumnTransformer
# from sklearn.ensemble import HistGradientBoostingRegressor
# from sklearn.impute import SimpleImputer
# from sklearn.pipeline import Pipeline
# from sklearn.preprocessing import OneHotEncoder

# NUMERIC_FEATURES: List[str] = [
#     "release_speed",
#     "release_spin_rate",
#     "pfx_x",
#     "pfx_z",
#     "release_pos_z",
#     "release_extension",
#     "vx0",
#     "vy0",
#     "vz0",
#     "ax",
#     "ay",
#     "az",
#     "spin_axis",
#     "delta_speed_vs_fb",
#     "delta_pfx_x_vs_fb",
#     "delta_pfx_z_vs_fb",
# ]

# CATEGORICAL_FEATURES: List[str] = [
#     "pitch_type",
#     "pitch_bucket",
#     "stand",
#     "p_throws",
# ]

# TRACKMAN_TO_STATCAST: Dict[str, str] = {
#     "RelSpeed": "release_speed",
#     "SpinRate": "release_spin_rate",
#     "HorzBreak": "pfx_x",
#     "InducedVertBreak": "pfx_z",
#     "PlateLocSide": "plate_x",
#     "PlateLocHeight": "plate_z",
#     "Extension": "release_extension",
#     "RelHeight": "release_pos_z",
#     "PitcherThrows": "p_throws",
#     "BatterSide": "stand",
#     "AutoPitchType": "pitch_type",
#     "TaggedPitchType": "pitch_type",
# }

# PITCH_METRIC_COLUMNS: List[str] = [
#     "release_speed",
#     "pfx_x",
#     "pfx_z",
#     "release_pos_z",
#     "release_extension",
# ]

# METRIC_LABELS: Dict[str, str] = {
#     "release_speed": "velocity",
#     "pfx_x": "horizontal_break",
#     "pfx_z": "vertical_break",
#     "release_pos_z": "release_height",
#     "release_extension": "extension",
# }

# FEATURE_TRANSLATIONS: Dict[str, Dict[str, str]] = {
#     "release_speed": {
#         "label": "velocity",
#         "inc": "increase velocity on this pitch",
#         "dec": "reduce velocity on this pitch",
#     },
#     "release_spin_rate": {
#         "label": "spin rate",
#         "inc": "increase spin rate",
#         "dec": "decrease spin rate",
#     },
#     "pfx_x": {
#         "label": "horizontal break",
#         "inc": "increase horizontal movement",
#         "dec": "decrease horizontal movement",
#     },
#     "pfx_z": {
#         "label": "vertical break",
#         "inc": "increase vertical movement profile",
#         "dec": "decrease vertical movement profile",
#     },
#     "release_pos_z": {
#         "label": "release height",
#         "inc": "raise release height",
#         "dec": "lower release height",
#     },
#     "release_extension": {
#         "label": "extension",
#         "inc": "increase release extension",
#         "dec": "reduce release extension",
#     },
#     "vx0": {
#         "label": "horizontal release trajectory",
#         "inc": "increase horizontal release trajectory",
#         "dec": "decrease horizontal release trajectory",
#     },
#     "vy0": {
#         "label": "forward release trajectory",
#         "inc": "increase forward release trajectory",
#         "dec": "decrease forward release trajectory",
#     },
#     "vz0": {
#         "label": "vertical release trajectory",
#         "inc": "increase vertical release trajectory",
#         "dec": "decrease vertical release trajectory",
#     },
#     "ax": {
#         "label": "horizontal acceleration",
#         "inc": "increase horizontal acceleration profile",
#         "dec": "decrease horizontal acceleration profile",
#     },
#     "ay": {
#         "label": "forward acceleration",
#         "inc": "increase forward acceleration profile",
#         "dec": "decrease forward acceleration profile",
#     },
#     "az": {
#         "label": "vertical acceleration",
#         "inc": "increase vertical acceleration profile",
#         "dec": "decrease vertical acceleration profile",
#     },
#     "spin_axis": {
#         "label": "spin axis",
#         "inc": "increase spin axis value",
#         "dec": "decrease spin axis value",
#     },
#     "delta_speed_vs_fb": {
#         "label": "velo gap vs fastball",
#         "inc": "increase velocity gap relative to fastball",
#         "dec": "reduce velocity gap relative to fastball",
#     },
#     "delta_pfx_x_vs_fb": {
#         "label": "horizontal movement gap vs fastball",
#         "inc": "increase horizontal movement separation from fastball",
#         "dec": "reduce horizontal movement separation from fastball",
#     },
#     "delta_pfx_z_vs_fb": {
#         "label": "vertical movement gap vs fastball",
#         "inc": "increase vertical movement separation from fastball",
#         "dec": "reduce vertical movement separation from fastball",
#     },
# }


# @dataclass
# class StuffPlusArtifacts:
#     model: Pipeline
#     mlb_mean_pred: float
#     mlb_std_pred: float
#     feature_columns: List[str]
#     bucket_baselines: Dict[str, Dict[str, float]] = field(default_factory=dict)
#     mlb_reference: Dict[str, Dict[str, Dict[str, List[float]]]] = field(default_factory=dict)


# def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
#     d = df.copy()

#     for src, dst in TRACKMAN_TO_STATCAST.items():
#         if src in d.columns and dst not in d.columns:
#             d[dst] = d[src]

#     return d


# def _normalize_pitch_type_name(value: str) -> str:
#     raw = str(value).strip()
#     v = "".join(ch for ch in raw.lower() if ch.isalnum())
#     mapping = {
#         "fourseamfastball": "FourSeam",
#         "4seam": "FourSeam",
#         "ff": "FourSeam",
#         "sinker": "Sinker",
#         "si": "Sinker",
#         "cutter": "Cutter",
#         "ct": "Cutter",
#         "slider": "Slider",
#         "sl": "Slider",
#         "curveball": "Curveball",
#         "cb": "Curveball",
#         "changeup": "Changeup",
#         "change": "Changeup",
#         "ch": "Changeup",
#         "splitter": "Splitter",
#         "fs": "Splitter",
#         "forkball": "Splitter",
#     }
#     return mapping.get(v, raw)


# def _pitch_bucket(pitch_type: str) -> str:
#     p = _normalize_pitch_type_name(pitch_type).lower()
#     if p in {"fourseam", "sinker"}:
#         return "Fastball"
#     if p in {"cutter", "slider", "curveball"}:
#         return "Breaking"
#     if p in {"changeup", "splitter"}:
#         return "Offspeed"
#     return "Other"


# def _normalize_handedness(value: object) -> str:
#     raw = str(value).strip().lower()
#     mapping = {
#         "r": "R",
#         "right": "R",
#         "rh": "R",
#         "rhp": "R",
#         "l": "L",
#         "left": "L",
#         "lh": "L",
#         "lhp": "L",
#         "s": "S",
#         "switch": "S",
#         "both": "S",
#     }
#     return mapping.get(raw, str(value).strip() if str(value).strip() else "Unknown")


# def _attach_fastball_context(df: pd.DataFrame) -> pd.DataFrame:
#     d = df.copy()
#     pitcher_key = "pitcher" if "pitcher" in d.columns else "Pitcher" if "Pitcher" in d.columns else None

#     for base_col in ["release_speed", "pfx_x", "pfx_z"]:
#         d[base_col] = pd.to_numeric(d.get(base_col), errors="coerce")

#     fb = d[d["pitch_bucket"] == "Fastball"]
#     global_fb_means = {
#         metric: float(pd.to_numeric(fb[metric], errors="coerce").mean())
#         for metric in ["release_speed", "pfx_x", "pfx_z"]
#     }
#     throws_fb_means = (
#         fb.groupby("p_throws", dropna=False)[["release_speed", "pfx_x", "pfx_z"]]
#         .mean(numeric_only=True)
#         .to_dict(orient="index")
#         if not fb.empty
#         else {}
#     )

#     if pitcher_key:
#         grouped = (
#             fb.groupby(pitcher_key, dropna=False)[["release_speed", "pfx_x", "pfx_z"]]
#             .mean(numeric_only=True)
#             .rename(
#                 columns={
#                     "release_speed": "fb_release_speed",
#                     "pfx_x": "fb_pfx_x",
#                     "pfx_z": "fb_pfx_z",
#                 }
#             )
#         )
#         d = d.join(grouped, on=pitcher_key)
#     else:
#         d["fb_release_speed"] = np.nan
#         d["fb_pfx_x"] = np.nan
#         d["fb_pfx_z"] = np.nan

#     for metric, fb_col in [
#         ("release_speed", "fb_release_speed"),
#         ("pfx_x", "fb_pfx_x"),
#         ("pfx_z", "fb_pfx_z"),
#     ]:
#         by_hand = d["p_throws"].map(lambda hand: throws_fb_means.get(hand, {}).get(metric, np.nan))
#         d[fb_col] = pd.to_numeric(d[fb_col], errors="coerce").fillna(by_hand).fillna(global_fb_means.get(metric, np.nan))

#     d["delta_speed_vs_fb"] = pd.to_numeric(d["release_speed"], errors="coerce") - pd.to_numeric(
#         d["fb_release_speed"], errors="coerce"
#     )
#     d["delta_pfx_x_vs_fb"] = pd.to_numeric(d["pfx_x"], errors="coerce") - pd.to_numeric(
#         d["fb_pfx_x"], errors="coerce"
#     )
#     d["delta_pfx_z_vs_fb"] = pd.to_numeric(d["pfx_z"], errors="coerce") - pd.to_numeric(
#         d["fb_pfx_z"], errors="coerce"
#     )
#     return d


# def _build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
#     d = _normalize_columns(df)
#     d["pitch_type"] = d.get("pitch_type", "Unknown").astype(str).map(_normalize_pitch_type_name)
#     d["pitch_bucket"] = d["pitch_type"].map(_pitch_bucket)
#     d["p_throws"] = d.get("p_throws", "Unknown").map(_normalize_handedness).fillna("Unknown")
#     d["stand"] = d.get("stand", "Unknown").map(_normalize_handedness).fillna("Unknown")
#     d = _attach_fastball_context(d)

#     for c in NUMERIC_FEATURES:
#         d[c] = pd.to_numeric(d.get(c), errors="coerce")

#     for c in CATEGORICAL_FEATURES:
#         if c not in d.columns:
#             d[c] = "Unknown"
#         d[c] = d[c].astype(str).fillna("Unknown")

#     return d[NUMERIC_FEATURES + CATEGORICAL_FEATURES]


# def _build_reference_frame(df: pd.DataFrame) -> pd.DataFrame:
#     d = _normalize_columns(df)
#     d["pitch_type"] = d.get("pitch_type", "Unknown").astype(str).map(_normalize_pitch_type_name)
#     d["pitch_bucket"] = d["pitch_type"].map(_pitch_bucket)
#     d["p_throws"] = d.get("p_throws", "Unknown").map(_normalize_handedness).fillna("Unknown")

#     for c in PITCH_METRIC_COLUMNS:
#         d[c] = pd.to_numeric(d.get(c), errors="coerce")

#     return d


# def _build_mlb_reference(df: pd.DataFrame) -> Dict[str, Dict[str, Dict[str, List[float]]]]:
#     d = _build_reference_frame(df)
#     out: Dict[str, Dict[str, Dict[str, List[float]]]] = {}

#     for (bucket, throws), g in d.groupby(["pitch_bucket", "p_throws"], dropna=False):
#         key = f"{bucket}|{throws}"
#         out[key] = {}
#         for metric in PITCH_METRIC_COLUMNS:
#             arr = pd.to_numeric(g[metric], errors="coerce").dropna().to_numpy(dtype=float)
#             arr.sort()
#             out[key][metric] = arr.tolist()
#     return out


# def build_pipeline() -> Pipeline:
#     preprocessor = ColumnTransformer(
#         transformers=[
#             (
#                 "num",
#                 Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]),
#                 NUMERIC_FEATURES,
#             ),
#             (
#                 "cat",
#                 Pipeline(
#                     steps=[
#                         ("imputer", SimpleImputer(strategy="most_frequent")),
#                         ("onehot", OneHotEncoder(handle_unknown="ignore")),
#                     ]
#                 ),
#                 CATEGORICAL_FEATURES,
#             ),
#         ]
#     )

#     model = HistGradientBoostingRegressor(
#         learning_rate=0.05,
#         max_depth=6,
#         max_iter=300,
#         min_samples_leaf=40,
#         random_state=42,
#     )

#     return Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])


# def train_stuff_plus(df: pd.DataFrame, target_column: str = "delta_run_exp") -> StuffPlusArtifacts:
#     if target_column not in df.columns:
#         raise ValueError(f"Missing target column: {target_column}")

#     y = pd.to_numeric(df[target_column], errors="coerce")
#     X = _build_feature_matrix(df)

#     valid = y.notna()
#     X = X.loc[valid]
#     y = y.loc[valid]

#     if len(X) < 5000:
#         raise ValueError("Need at least 5,000 valid pitches to train a stable MLB baseline.")

#     pipeline = build_pipeline()
#     pipeline.fit(X, y)

#     mlb_pred = pipeline.predict(X)
#     mlb_mean = float(np.mean(mlb_pred))
#     mlb_std = float(np.std(mlb_pred)) or 1.0

#     refs_df = _build_reference_frame(df.loc[valid])
#     refs_df["pred_run_value"] = mlb_pred

#     bucket_baselines: Dict[str, Dict[str, float]] = {}
#     for bucket, g in refs_df.groupby("pitch_bucket", dropna=False):
#         b_mean = float(pd.to_numeric(g["pred_run_value"], errors="coerce").mean())
#         b_std = float(pd.to_numeric(g["pred_run_value"], errors="coerce").std())
#         if np.isnan(b_std) or b_std <= 0:
#             b_std = mlb_std
#         bucket_baselines[str(bucket)] = {"mean_pred": b_mean, "std_pred": b_std}

#     refs_df["stuff_plus"] = refs_df.apply(
#         lambda r: 100.0
#         + 10.0
#         * (
#             -(
#                 r["pred_run_value"]
#                 - bucket_baselines.get(r["pitch_bucket"], {"mean_pred": mlb_mean})["mean_pred"]
#             )
#             / bucket_baselines.get(r["pitch_bucket"], {"std_pred": mlb_std})["std_pred"]
#         ),
#         axis=1,
#     )

#     mlb_reference = _build_mlb_reference(df.loc[valid])
#     for (bucket, throws), g in refs_df.groupby(["pitch_bucket", "p_throws"], dropna=False):
#         key = f"{bucket}|{throws}"
#         arr = pd.to_numeric(g["stuff_plus"], errors="coerce").dropna().to_numpy(dtype=float)
#         arr.sort()
#         mlb_reference.setdefault(key, {})["stuff_plus"] = arr.tolist()

#     return StuffPlusArtifacts(
#         model=pipeline,
#         mlb_mean_pred=mlb_mean,
#         mlb_std_pred=mlb_std,
#         bucket_baselines=bucket_baselines,
#         feature_columns=list(X.columns),
#         mlb_reference=mlb_reference,
#     )


# def score_stuff_plus(df: pd.DataFrame, artifacts: StuffPlusArtifacts) -> Tuple[pd.DataFrame, pd.DataFrame]:
#     X = _build_feature_matrix(df)
#     pred = artifacts.model.predict(X)

#     out = df.copy()
#     out["pred_run_value"] = pred

#     if "pitch_type" not in out.columns:
#         if "TaggedPitchType" in out.columns:
#             out["pitch_type"] = out["TaggedPitchType"].astype(str)
#         elif "AutoPitchType" in out.columns:
#             out["pitch_type"] = out["AutoPitchType"].astype(str)
#         else:
#             out["pitch_type"] = "Unknown"

#     out["pitch_type"] = out["pitch_type"].astype(str).map(_normalize_pitch_type_name)
#     out["pitch_bucket"] = out["pitch_type"].map(_pitch_bucket)
#     if "p_throws" in out.columns:
#         out["p_throws"] = out["p_throws"].map(_normalize_handedness)
#     elif "PitcherThrows" in out.columns:
#         out["p_throws"] = out["PitcherThrows"].map(_normalize_handedness)
#     else:
#         out["p_throws"] = "Unknown"

#     def _to_stuff(row: pd.Series) -> float:
#         bucket = row["pitch_bucket"]
#         baseline = artifacts.bucket_baselines.get(bucket, {})
#         mean_pred = baseline.get("mean_pred", artifacts.mlb_mean_pred)
#         std_pred = baseline.get("std_pred", artifacts.mlb_std_pred)
#         if std_pred == 0:
#             std_pred = artifacts.mlb_std_pred or 1.0
#         return float(100 + 10 * (-(row["pred_run_value"] - mean_pred) / std_pred))

#     out["stuff_plus"] = out.apply(_to_stuff, axis=1)

#     group_cols = [c for c in ["Pitcher", "pitch_type"] if c in out.columns] or ["pitch_type"]
#     summary = (
#         out.groupby(group_cols, dropna=False)
#         .agg(
#             pitches=("stuff_plus", "size"),
#             avg_stuff_plus=("stuff_plus", "mean"),
#             avg_pred_run_value=("pred_run_value", "mean"),
#         )
#         .reset_index()
#         .sort_values("avg_stuff_plus", ascending=False)
#     )

#     return out, summary


# def _percentile_from_sorted(sorted_values: List[float], value: float) -> float | None:
#     if not sorted_values or value is None or np.isnan(value):
#         return None
#     arr = np.asarray(sorted_values, dtype=float)
#     idx = np.searchsorted(arr, value, side="right")
#     return float(round(100.0 * idx / len(arr), 1))


# def build_metric_percentile_summary(scored_df: pd.DataFrame, artifacts: StuffPlusArtifacts) -> List[Dict[str, object]]:
#     if scored_df.empty:
#         return []

#     # Normalize column names (Trackman -> Statcast-like) before metric aggregation.
#     ref_df = _build_reference_frame(scored_df.copy())

#     if "stuff_plus" in scored_df.columns:
#         ref_df["stuff_plus"] = pd.to_numeric(scored_df["stuff_plus"], errors="coerce")
#     else:
#         ref_df["stuff_plus"] = np.nan

#     if "Pitcher" in scored_df.columns:
#         ref_df["Pitcher"] = scored_df["Pitcher"].astype(str)
#     elif "pitcher" in scored_df.columns:
#         ref_df["Pitcher"] = scored_df["pitcher"].astype(str)
#     else:
#         ref_df["Pitcher"] = "Unknown"

#     group_cols = ["Pitcher", "pitch_type", "pitch_bucket", "p_throws"]

#     rows: List[Dict[str, object]] = []
#     for keys, g in ref_df.groupby(group_cols, dropna=False):
#         if not isinstance(keys, tuple):
#             keys = (keys,)
#         key_map = {group_cols[i]: keys[i] for i in range(len(group_cols))}
#         bucket = str(key_map.get("pitch_bucket", "Other"))
#         throws = str(key_map.get("p_throws", "Unknown"))
#         ref_key = f"{bucket}|{throws}"
#         ref = artifacts.mlb_reference.get(ref_key) or artifacts.mlb_reference.get(f"{bucket}|Unknown") or {}

#         metrics: Dict[str, object] = {}
#         for col in PITCH_METRIC_COLUMNS:
#             avg_val = float(pd.to_numeric(g[col], errors="coerce").mean()) if col in g.columns else np.nan
#             label = METRIC_LABELS[col]
#             pct = _percentile_from_sorted(ref.get(col, []), avg_val)
#             mlb_avg = float(np.nanmean(ref.get(col, []))) if ref.get(col, []) else None
#             metrics[f"{label}_avg"] = None if np.isnan(avg_val) else round(avg_val, 2)
#             metrics[f"{label}_percentile"] = pct
#             metrics[f"{label}_mlb_avg"] = None if mlb_avg is None or np.isnan(mlb_avg) else round(mlb_avg, 2)

#         stuff_avg = float(pd.to_numeric(g["stuff_plus"], errors="coerce").mean())
#         stuff_pct = _percentile_from_sorted(ref.get("stuff_plus", []), stuff_avg)
#         metrics["stuff_plus_avg"] = None if np.isnan(stuff_avg) else round(stuff_avg, 2)
#         metrics["stuff_plus_percentile"] = stuff_pct
#         metrics["pitches"] = int(len(g))
#         rows.append({**key_map, **metrics})

#     def _sort_text(v: object) -> str:
#         if v is None:
#             return ""
#         if isinstance(v, float) and np.isnan(v):
#             return ""
#         return str(v)

#     rows.sort(key=lambda x: (_sort_text(x.get("Pitcher", "")), _sort_text(x.get("pitch_type", ""))))
#     return rows


# def diagnose_stuff_plus(
#     df: pd.DataFrame,
#     artifacts: StuffPlusArtifacts,
#     min_pitches: int = 20,
#     top_k: int = 3,
# ) -> pd.DataFrame:
#     def _coaching_translation(feature: str, direction: str) -> Dict[str, str]:
#         t = FEATURE_TRANSLATIONS.get(
#             feature,
#             {"label": feature, "inc": f"increase {feature}", "dec": f"decrease {feature}"},
#         )
#         action = t["inc"] if direction == "increase" else t["dec"]
#         return {"coach_focus": t["label"], "coach_action": action}

#     scored, _ = score_stuff_plus(df, artifacts)
#     X = _build_feature_matrix(df)
#     baseline_pred = scored["pred_run_value"].to_numpy()

#     effect_cols: Dict[str, np.ndarray] = {}
#     direction_cols: Dict[str, np.ndarray] = {}

#     for f in NUMERIC_FEATURES:
#         col = pd.to_numeric(X[f], errors="coerce")
#         std = float(np.nanstd(col.to_numpy()))
#         if np.isnan(std) or std <= 1e-9:
#             std = 0.1
#         delta = 0.25 * std

#         x_plus = X.copy()
#         x_minus = X.copy()
#         x_plus[f] = col + delta
#         x_minus[f] = col - delta

#         pred_plus = artifacts.model.predict(x_plus)
#         pred_minus = artifacts.model.predict(x_minus)

#         better_is_plus = pred_plus < pred_minus
#         best_pred = np.where(better_is_plus, pred_plus, pred_minus)
#         run_value_gain = baseline_pred - best_pred
#         stuff_gain = 10.0 * (run_value_gain / (artifacts.mlb_std_pred or 1.0))

#         effect_cols[f] = stuff_gain
#         direction_cols[f] = np.where(better_is_plus, "increase", "decrease")

#     out = scored.copy()
#     for f in NUMERIC_FEATURES:
#         out[f"{f}__gain"] = effect_cols[f]
#         out[f"{f}__direction"] = direction_cols[f]

#     group_cols = [c for c in ["Pitcher", "pitch_type"] if c in out.columns] or ["pitch_type"]

#     diagnostics_rows: List[Dict[str, object]] = []
#     grouped = out.groupby(group_cols, dropna=False)

#     for keys, g in grouped:
#         n = int(len(g))
#         if n < min_pitches:
#             continue

#         if not isinstance(keys, tuple):
#             keys = (keys,)
#         key_map = {group_cols[i]: keys[i] for i in range(len(group_cols))}

#         feature_rank = []
#         for f in NUMERIC_FEATURES:
#             if f.startswith("delta_") and str(key_map.get("pitch_type", "")).lower() in {"fourseam", "sinker"}:
#                 continue
#             gain = float(np.nanmean(pd.to_numeric(g[f"{f}__gain"], errors="coerce")))
#             if np.isnan(gain):
#                 continue
#             mode = g[f"{f}__direction"].mode(dropna=True)
#             direction = str(mode.iloc[0]) if not mode.empty else "increase"
#             feature_rank.append(
#                 {
#                     "feature": f,
#                     "suggested_direction": direction,
#                     "estimated_stuff_plus_gain": round(gain, 2),
#                     **_coaching_translation(f, direction),
#                 }
#             )

#         feature_rank = sorted(feature_rank, key=lambda x: x["estimated_stuff_plus_gain"], reverse=True)[:top_k]

#         diagnostics_rows.append(
#             {
#                 **key_map,
#                 "pitches": n,
#                 "avg_stuff_plus": float(np.nanmean(pd.to_numeric(g["stuff_plus"], errors="coerce"))),
#                 "top_adjustments": feature_rank,
#             }
#         )

#     return pd.DataFrame(diagnostics_rows)

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

NUMERIC_FEATURES: List[str] = [
    "release_speed",
    "release_spin_rate",
    "pfx_x",
    "pfx_z",
    "release_pos_z",
    "release_extension",
    "vx0",
    "vy0",
    "vz0",
    "ax",
    "ay",
    "az",
    "spin_axis",
    "delta_speed_vs_fb",
    "delta_pfx_x_vs_fb",
    "delta_pfx_z_vs_fb",
]

CATEGORICAL_FEATURES: List[str] = [
    "pitch_type",
    "pitch_bucket",
    "stand",
    "p_throws",
]

TRACKMAN_TO_STATCAST: Dict[str, str] = {
    "RelSpeed": "release_speed",
    "SpinRate": "release_spin_rate",
    "HorzBreak": "pfx_x",
    "InducedVertBreak": "pfx_z",
    "PlateLocSide": "plate_x",
    "PlateLocHeight": "plate_z",
    "Extension": "release_extension",
    "RelHeight": "release_pos_z",
    "PitcherThrows": "p_throws",
    "BatterSide": "stand",
    "AutoPitchType": "pitch_type",
    "TaggedPitchType": "pitch_type",
}

PITCH_METRIC_COLUMNS: List[str] = [
    "release_speed",
    "pfx_x",
    "pfx_z",
    "release_pos_z",
    "release_extension",
]

METRIC_LABELS: Dict[str, str] = {
    "release_speed": "velocity",
    "pfx_x": "horizontal_break",
    "pfx_z": "vertical_break",
    "release_pos_z": "release_height",
    "release_extension": "extension",
}

FEATURE_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "release_speed": {
        "label": "velocity",
        "inc": "increase velocity on this pitch",
        "dec": "reduce velocity on this pitch",
    },
    "release_spin_rate": {
        "label": "spin rate",
        "inc": "increase spin rate",
        "dec": "decrease spin rate",
    },
    "pfx_x": {
        "label": "horizontal break",
        "inc": "increase horizontal movement",
        "dec": "decrease horizontal movement",
    },
    "pfx_z": {
        "label": "vertical break",
        "inc": "increase vertical movement profile",
        "dec": "decrease vertical movement profile",
    },
    "release_pos_z": {
        "label": "release height",
        "inc": "raise release height",
        "dec": "lower release height",
    },
    "release_extension": {
        "label": "extension",
        "inc": "increase release extension",
        "dec": "reduce release extension",
    },
    "vx0": {
        "label": "horizontal release trajectory",
        "inc": "increase horizontal release trajectory",
        "dec": "decrease horizontal release trajectory",
    },
    "vy0": {
        "label": "forward release trajectory",
        "inc": "increase forward release trajectory",
        "dec": "decrease forward release trajectory",
    },
    "vz0": {
        "label": "vertical release trajectory",
        "inc": "increase vertical release trajectory",
        "dec": "decrease vertical release trajectory",
    },
    "ax": {
        "label": "horizontal acceleration",
        "inc": "increase horizontal acceleration profile",
        "dec": "decrease horizontal acceleration profile",
    },
    "ay": {
        "label": "forward acceleration",
        "inc": "increase forward acceleration profile",
        "dec": "decrease forward acceleration profile",
    },
    "az": {
        "label": "vertical acceleration",
        "inc": "increase vertical acceleration profile",
        "dec": "decrease vertical acceleration profile",
    },
    "spin_axis": {
        "label": "spin axis",
        "inc": "increase spin axis value",
        "dec": "decrease spin axis value",
    },
    "delta_speed_vs_fb": {
        "label": "velo gap vs fastball",
        "inc": "increase velocity gap relative to fastball",
        "dec": "reduce velocity gap relative to fastball",
    },
    "delta_pfx_x_vs_fb": {
        "label": "horizontal movement gap vs fastball",
        "inc": "increase horizontal movement separation from fastball",
        "dec": "reduce horizontal movement separation from fastball",
    },
    "delta_pfx_z_vs_fb": {
        "label": "vertical movement gap vs fastball",
        "inc": "increase vertical movement separation from fastball",
        "dec": "reduce vertical movement separation from fastball",
    },
}


@dataclass
class StuffPlusArtifacts:
    model: Pipeline
    mlb_mean_pred: float
    mlb_std_pred: float
    feature_columns: List[str]
    # Backward-compatible broad baselines: Fastball / Breaking / Offspeed / Other.
    bucket_baselines: Dict[str, Dict[str, float]] = field(default_factory=dict)
    # Preferred baselines: exact pitch type, e.g. FourSeam, Slider, Changeup.
    pitch_type_baselines: Dict[str, Dict[str, float]] = field(default_factory=dict)
    # Reference distributions used for percentile summaries. Keys include both
    # pitch type and broad bucket keys, e.g. "type:FourSeam|R" and "bucket:Fastball|R".
    mlb_reference: Dict[str, Dict[str, Dict[str, List[float]]]] = field(default_factory=dict)


def _looks_like_inches(series: pd.Series, threshold: float = 4.0) -> bool:
    """Return True when a movement column appears to be stored in inches.

    Statcast pfx_x/pfx_z are normally in feet and usually live roughly between
    -2 and 2. TrackMan HorzBreak/InducedVertBreak are commonly exported in
    inches and often have magnitudes like 8, 14, 20. This guard prevents D2
    TrackMan movement from being treated as MLB Statcast feet.
    """
    vals = pd.to_numeric(series, errors="coerce").dropna().abs()
    if vals.empty:
        return False
    return float(vals.median()) > threshold


def _maybe_inches_to_feet(series: pd.Series) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce")
    return values / 12.0 if _looks_like_inches(values) else values


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    d = df.copy()

    for src, dst in TRACKMAN_TO_STATCAST.items():
        if src in d.columns and dst not in d.columns:
            if src in {"HorzBreak", "InducedVertBreak"}:
                d[dst] = _maybe_inches_to_feet(d[src])
            else:
                d[dst] = d[src]

    # Safety net: if a file already has pfx_x/pfx_z but they look like
    # TrackMan inches, convert them. This can happen after earlier preprocessing.
    for movement_col in ["pfx_x", "pfx_z"]:
        if movement_col in d.columns:
            d[movement_col] = _maybe_inches_to_feet(d[movement_col])

    return d


def _normalize_pitch_type_name(value: str) -> str:
    raw = str(value).strip()
    v = "".join(ch for ch in raw.lower() if ch.isalnum())
    mapping = {
        "fourseamfastball": "FourSeam",
        "4seam": "FourSeam",
        "ff": "FourSeam",
        "sinker": "Sinker",
        "si": "Sinker",
        "cutter": "Cutter",
        "ct": "Cutter",
        "slider": "Slider",
        "sl": "Slider",
        "curveball": "Curveball",
        "cb": "Curveball",
        "changeup": "Changeup",
        "change": "Changeup",
        "ch": "Changeup",
        "splitter": "Splitter",
        "fs": "Splitter",
        "forkball": "Splitter",
    }
    return mapping.get(v, raw)


def _pitch_bucket(pitch_type: str) -> str:
    p = _normalize_pitch_type_name(pitch_type).lower()
    if p in {"fourseam", "sinker"}:
        return "Fastball"
    if p in {"cutter", "slider", "curveball"}:
        return "Breaking"
    if p in {"changeup", "splitter"}:
        return "Offspeed"
    return "Other"


def _normalize_handedness(value: object) -> str:
    raw = str(value).strip().lower()
    mapping = {
        "r": "R",
        "right": "R",
        "rh": "R",
        "rhp": "R",
        "l": "L",
        "left": "L",
        "lh": "L",
        "lhp": "L",
        "s": "S",
        "switch": "S",
        "both": "S",
    }
    return mapping.get(raw, str(value).strip() if str(value).strip() else "Unknown")


def _attach_fastball_context(df: pd.DataFrame) -> pd.DataFrame:
    d = df.copy()
    pitcher_key = "pitcher" if "pitcher" in d.columns else "Pitcher" if "Pitcher" in d.columns else None

    for base_col in ["release_speed", "pfx_x", "pfx_z"]:
        d[base_col] = pd.to_numeric(d.get(base_col), errors="coerce")

    fb = d[d["pitch_bucket"] == "Fastball"]
    global_fb_means = {
        metric: float(pd.to_numeric(fb[metric], errors="coerce").mean())
        for metric in ["release_speed", "pfx_x", "pfx_z"]
    }
    throws_fb_means = (
        fb.groupby("p_throws", dropna=False)[["release_speed", "pfx_x", "pfx_z"]]
        .mean(numeric_only=True)
        .to_dict(orient="index")
        if not fb.empty
        else {}
    )

    if pitcher_key:
        grouped = (
            fb.groupby(pitcher_key, dropna=False)[["release_speed", "pfx_x", "pfx_z"]]
            .mean(numeric_only=True)
            .rename(
                columns={
                    "release_speed": "fb_release_speed",
                    "pfx_x": "fb_pfx_x",
                    "pfx_z": "fb_pfx_z",
                }
            )
        )
        d = d.join(grouped, on=pitcher_key)
    else:
        d["fb_release_speed"] = np.nan
        d["fb_pfx_x"] = np.nan
        d["fb_pfx_z"] = np.nan

    for metric, fb_col in [
        ("release_speed", "fb_release_speed"),
        ("pfx_x", "fb_pfx_x"),
        ("pfx_z", "fb_pfx_z"),
    ]:
        by_hand = d["p_throws"].map(lambda hand: throws_fb_means.get(hand, {}).get(metric, np.nan))
        d[fb_col] = pd.to_numeric(d[fb_col], errors="coerce").fillna(by_hand).fillna(global_fb_means.get(metric, np.nan))

    d["delta_speed_vs_fb"] = pd.to_numeric(d["release_speed"], errors="coerce") - pd.to_numeric(
        d["fb_release_speed"], errors="coerce"
    )
    d["delta_pfx_x_vs_fb"] = pd.to_numeric(d["pfx_x"], errors="coerce") - pd.to_numeric(
        d["fb_pfx_x"], errors="coerce"
    )
    d["delta_pfx_z_vs_fb"] = pd.to_numeric(d["pfx_z"], errors="coerce") - pd.to_numeric(
        d["fb_pfx_z"], errors="coerce"
    )
    return d


def _build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    d = _normalize_columns(df)
    d["pitch_type"] = d.get("pitch_type", "Unknown").astype(str).map(_normalize_pitch_type_name)
    d["pitch_bucket"] = d["pitch_type"].map(_pitch_bucket)
    d["p_throws"] = d.get("p_throws", "Unknown").map(_normalize_handedness).fillna("Unknown")
    d["stand"] = d.get("stand", "Unknown").map(_normalize_handedness).fillna("Unknown")
    d = _attach_fastball_context(d)

    for c in NUMERIC_FEATURES:
        d[c] = pd.to_numeric(d.get(c), errors="coerce")

    for c in CATEGORICAL_FEATURES:
        if c not in d.columns:
            d[c] = "Unknown"
        d[c] = d[c].astype(str).fillna("Unknown")

    return d[NUMERIC_FEATURES + CATEGORICAL_FEATURES]


def _build_reference_frame(df: pd.DataFrame) -> pd.DataFrame:
    d = _normalize_columns(df)
    d["pitch_type"] = d.get("pitch_type", "Unknown").astype(str).map(_normalize_pitch_type_name)
    d["pitch_bucket"] = d["pitch_type"].map(_pitch_bucket)
    d["p_throws"] = d.get("p_throws", "Unknown").map(_normalize_handedness).fillna("Unknown")

    for c in PITCH_METRIC_COLUMNS:
        d[c] = pd.to_numeric(d.get(c), errors="coerce")

    return d


def _build_mlb_reference(df: pd.DataFrame) -> Dict[str, Dict[str, Dict[str, List[float]]]]:
    d = _build_reference_frame(df)
    out: Dict[str, Dict[str, Dict[str, List[float]]]] = {}

    def _add_reference(prefix: str, group_cols: List[str]) -> None:
        for keys, g in d.groupby(group_cols, dropna=False):
            if not isinstance(keys, tuple):
                keys = (keys,)
            pitch_group, throws = keys[0], keys[1]
            key = f"{prefix}:{pitch_group}|{throws}"
            out[key] = {}
            for metric in PITCH_METRIC_COLUMNS:
                arr = pd.to_numeric(g[metric], errors="coerce").dropna().to_numpy(dtype=float)
                arr.sort()
                out[key][metric] = arr.tolist()

    _add_reference("type", ["pitch_type", "p_throws"])
    _add_reference("bucket", ["pitch_bucket", "p_throws"])
    return out


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]),
                NUMERIC_FEATURES,
            ),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("onehot", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                CATEGORICAL_FEATURES,
            ),
        ]
    )

    model = HistGradientBoostingRegressor(
        learning_rate=0.05,
        max_depth=6,
        max_iter=300,
        min_samples_leaf=40,
        random_state=42,
    )

    return Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])


def _make_baselines(refs_df: pd.DataFrame, group_col: str, fallback_std: float) -> Dict[str, Dict[str, float]]:
    baselines: Dict[str, Dict[str, float]] = {}
    for key, g in refs_df.groupby(group_col, dropna=False):
        mean_pred = float(pd.to_numeric(g["pred_run_value"], errors="coerce").mean())
        std_pred = float(pd.to_numeric(g["pred_run_value"], errors="coerce").std())
        if np.isnan(std_pred) or std_pred <= 0:
            std_pred = fallback_std
        baselines[str(key)] = {"mean_pred": mean_pred, "std_pred": std_pred}
    return baselines


def _stuff_plus_from_prediction(pred_run_value: float, baseline: Dict[str, float], fallback_mean: float, fallback_std: float) -> float:
    """Convert predicted run value to Stuff+. Lower run value is better for pitcher."""
    mean_pred = baseline.get("mean_pred", fallback_mean)
    std_pred = baseline.get("std_pred", fallback_std)
    if std_pred == 0 or np.isnan(std_pred):
        std_pred = fallback_std or 1.0
    return float(100.0 + 10.0 * (-(pred_run_value - mean_pred) / std_pred))


def validate_stuff_plus_inputs(df: pd.DataFrame) -> pd.DataFrame:
    """Return a small sanity-check table for the columns that most often break Stuff+.

    Look for pfx_x/pfx_z medians bigger than about 4 after normalization. If that
    happens, movement is probably still in inches, not feet.
    """
    d = _normalize_columns(df)
    cols = [
        "release_speed",
        "release_spin_rate",
        "pfx_x",
        "pfx_z",
        "release_pos_z",
        "release_extension",
    ]
    rows = []
    for col in cols:
        if col not in d.columns:
            rows.append({"column": col, "missing": True, "count": 0, "mean": None, "median": None, "min": None, "max": None, "warning": "missing"})
            continue
        s = pd.to_numeric(d[col], errors="coerce").dropna()
        warning: Optional[str] = None
        if col in {"pfx_x", "pfx_z"} and not s.empty and float(s.abs().median()) > 4:
            warning = "movement still looks like inches; expected feet"
        if col == "release_speed" and not s.empty and (float(s.median()) < 50 or float(s.median()) > 105):
            warning = "velocity range looks unusual"
        rows.append(
            {
                "column": col,
                "missing": False,
                "count": int(s.size),
                "mean": None if s.empty else round(float(s.mean()), 3),
                "median": None if s.empty else round(float(s.median()), 3),
                "min": None if s.empty else round(float(s.min()), 3),
                "max": None if s.empty else round(float(s.max()), 3),
                "warning": warning,
            }
        )
    return pd.DataFrame(rows)


def train_stuff_plus(df: pd.DataFrame, target_column: str = "delta_run_exp") -> StuffPlusArtifacts:
    if target_column not in df.columns:
        raise ValueError(f"Missing target column: {target_column}")

    y = pd.to_numeric(df[target_column], errors="coerce")
    X = _build_feature_matrix(df)

    valid = y.notna()
    X = X.loc[valid]
    y = y.loc[valid]

    if len(X) < 5000:
        raise ValueError("Need at least 5,000 valid MLB pitches to train a stable baseline.")

    pipeline = build_pipeline()
    pipeline.fit(X, y)

    mlb_pred = pipeline.predict(X)
    mlb_mean = float(np.mean(mlb_pred))
    mlb_std = float(np.std(mlb_pred)) or 1.0

    refs_df = _build_reference_frame(df.loc[valid])
    refs_df["pred_run_value"] = mlb_pred

    bucket_baselines = _make_baselines(refs_df, "pitch_bucket", mlb_std)
    pitch_type_baselines = _make_baselines(refs_df, "pitch_type", mlb_std)

    refs_df["stuff_plus"] = refs_df.apply(
        lambda r: _stuff_plus_from_prediction(
            float(r["pred_run_value"]),
            pitch_type_baselines.get(str(r["pitch_type"]), bucket_baselines.get(str(r["pitch_bucket"]), {})),
            mlb_mean,
            mlb_std,
        ),
        axis=1,
    )

    mlb_reference = _build_mlb_reference(df.loc[valid])
    for (pitch_type, throws), g in refs_df.groupby(["pitch_type", "p_throws"], dropna=False):
        key = f"type:{pitch_type}|{throws}"
        arr = pd.to_numeric(g["stuff_plus"], errors="coerce").dropna().to_numpy(dtype=float)
        arr.sort()
        mlb_reference.setdefault(key, {})["stuff_plus"] = arr.tolist()

    for (bucket, throws), g in refs_df.groupby(["pitch_bucket", "p_throws"], dropna=False):
        key = f"bucket:{bucket}|{throws}"
        arr = pd.to_numeric(g["stuff_plus"], errors="coerce").dropna().to_numpy(dtype=float)
        arr.sort()
        mlb_reference.setdefault(key, {})["stuff_plus"] = arr.tolist()

    return StuffPlusArtifacts(
        model=pipeline,
        mlb_mean_pred=mlb_mean,
        mlb_std_pred=mlb_std,
        bucket_baselines=bucket_baselines,
        pitch_type_baselines=pitch_type_baselines,
        feature_columns=list(X.columns),
        mlb_reference=mlb_reference,
    )

def score_stuff_plus(df: pd.DataFrame, artifacts: StuffPlusArtifacts) -> Tuple[pd.DataFrame, pd.DataFrame]:
    X = _build_feature_matrix(df)
    pred = artifacts.model.predict(X)

    out = df.copy()
    out["pred_run_value"] = pred

    if "pitch_type" not in out.columns:
        if "TaggedPitchType" in out.columns:
            out["pitch_type"] = out["TaggedPitchType"].astype(str)
        elif "AutoPitchType" in out.columns:
            out["pitch_type"] = out["AutoPitchType"].astype(str)
        else:
            out["pitch_type"] = "Unknown"

    out["pitch_type"] = out["pitch_type"].astype(str).map(_normalize_pitch_type_name)
    out["pitch_bucket"] = out["pitch_type"].map(_pitch_bucket)
    if "p_throws" in out.columns:
        out["p_throws"] = out["p_throws"].map(_normalize_handedness)
    elif "PitcherThrows" in out.columns:
        out["p_throws"] = out["PitcherThrows"].map(_normalize_handedness)
    else:
        out["p_throws"] = "Unknown"

    def _to_stuff(row: pd.Series) -> float:
        pitch_type = str(row["pitch_type"])
        bucket = str(row["pitch_bucket"])
        baseline = artifacts.pitch_type_baselines.get(
            pitch_type, artifacts.bucket_baselines.get(bucket, {})
        )
        return _stuff_plus_from_prediction(
            float(row["pred_run_value"]),
            baseline,
            artifacts.mlb_mean_pred,
            artifacts.mlb_std_pred,
        )

    out["stuff_plus"] = out.apply(_to_stuff, axis=1)

    group_cols = [c for c in ["Pitcher", "pitch_type"] if c in out.columns] or ["pitch_type"]
    summary = (
        out.groupby(group_cols, dropna=False)
        .agg(
            pitches=("stuff_plus", "size"),
            avg_stuff_plus=("stuff_plus", "mean"),
            avg_pred_run_value=("pred_run_value", "mean"),
        )
        .reset_index()
        .sort_values("avg_stuff_plus", ascending=False)
    )

    return out, summary


def _percentile_from_sorted(sorted_values: List[float], value: float) -> float | None:
    if not sorted_values or value is None or np.isnan(value):
        return None
    arr = np.asarray(sorted_values, dtype=float)
    idx = np.searchsorted(arr, value, side="right")
    return float(round(100.0 * idx / len(arr), 1))


def build_metric_percentile_summary(scored_df: pd.DataFrame, artifacts: StuffPlusArtifacts) -> List[Dict[str, object]]:
    if scored_df.empty:
        return []

    # Normalize column names (Trackman -> Statcast-like) before metric aggregation.
    ref_df = _build_reference_frame(scored_df.copy())

    if "stuff_plus" in scored_df.columns:
        ref_df["stuff_plus"] = pd.to_numeric(scored_df["stuff_plus"], errors="coerce")
    else:
        ref_df["stuff_plus"] = np.nan

    if "Pitcher" in scored_df.columns:
        ref_df["Pitcher"] = scored_df["Pitcher"].astype(str)
    elif "pitcher" in scored_df.columns:
        ref_df["Pitcher"] = scored_df["pitcher"].astype(str)
    else:
        ref_df["Pitcher"] = "Unknown"

    group_cols = ["Pitcher", "pitch_type", "pitch_bucket", "p_throws"]

    rows: List[Dict[str, object]] = []
    for keys, g in ref_df.groupby(group_cols, dropna=False):
        if not isinstance(keys, tuple):
            keys = (keys,)
        key_map = {group_cols[i]: keys[i] for i in range(len(group_cols))}
        pitch_type = str(key_map.get("pitch_type", "Unknown"))
        bucket = str(key_map.get("pitch_bucket", "Other"))
        throws = str(key_map.get("p_throws", "Unknown"))
        ref = (
            artifacts.mlb_reference.get(f"type:{pitch_type}|{throws}")
            or artifacts.mlb_reference.get(f"type:{pitch_type}|Unknown")
            or artifacts.mlb_reference.get(f"bucket:{bucket}|{throws}")
            or artifacts.mlb_reference.get(f"bucket:{bucket}|Unknown")
            or {}
        )

        metrics: Dict[str, object] = {}
        for col in PITCH_METRIC_COLUMNS:
            avg_val = float(pd.to_numeric(g[col], errors="coerce").mean()) if col in g.columns else np.nan
            label = METRIC_LABELS[col]
            pct = _percentile_from_sorted(ref.get(col, []), avg_val)
            mlb_avg = float(np.nanmean(ref.get(col, []))) if ref.get(col, []) else None
            metrics[f"{label}_avg"] = None if np.isnan(avg_val) else round(avg_val, 2)
            metrics[f"{label}_percentile"] = pct
            metrics[f"{label}_mlb_avg"] = None if mlb_avg is None or np.isnan(mlb_avg) else round(mlb_avg, 2)

        stuff_avg = float(pd.to_numeric(g["stuff_plus"], errors="coerce").mean())
        stuff_pct = _percentile_from_sorted(ref.get("stuff_plus", []), stuff_avg)
        metrics["stuff_plus_avg"] = None if np.isnan(stuff_avg) else round(stuff_avg, 2)
        metrics["stuff_plus_percentile"] = stuff_pct
        metrics["pitches"] = int(len(g))
        rows.append({**key_map, **metrics})

    def _sort_text(v: object) -> str:
        if v is None:
            return ""
        if isinstance(v, float) and np.isnan(v):
            return ""
        return str(v)

    rows.sort(key=lambda x: (_sort_text(x.get("Pitcher", "")), _sort_text(x.get("pitch_type", ""))))
    return rows


def summarize_stuff_plus_distribution(scored_df: pd.DataFrame, min_pitches: int = 10) -> pd.DataFrame:
    """Quick check for inflated scores after scoring a college TrackMan file."""
    if "stuff_plus" not in scored_df.columns:
        raise ValueError("scored_df must contain a stuff_plus column. Run score_stuff_plus first.")
    group_cols = [c for c in ["Pitcher", "pitch_type"] if c in scored_df.columns] or ["pitch_type"]
    summary = (
        scored_df.groupby(group_cols, dropna=False)
        .agg(
            pitches=("stuff_plus", "size"),
            avg_stuff_plus=("stuff_plus", "mean"),
            p90_stuff_plus=("stuff_plus", lambda s: float(np.nanpercentile(pd.to_numeric(s, errors="coerce"), 90))),
            max_stuff_plus=("stuff_plus", "max"),
            avg_pred_run_value=("pred_run_value", "mean"),
        )
        .reset_index()
    )
    return summary[summary["pitches"] >= min_pitches].sort_values("avg_stuff_plus", ascending=False)


def diagnose_stuff_plus(
    df: pd.DataFrame,
    artifacts: StuffPlusArtifacts,
    min_pitches: int = 20,
    top_k: int = 3,
) -> pd.DataFrame:
    def _coaching_translation(feature: str, direction: str) -> Dict[str, str]:
        t = FEATURE_TRANSLATIONS.get(
            feature,
            {"label": feature, "inc": f"increase {feature}", "dec": f"decrease {feature}"},
        )
        action = t["inc"] if direction == "increase" else t["dec"]
        return {"coach_focus": t["label"], "coach_action": action}

    scored, _ = score_stuff_plus(df, artifacts)
    X = _build_feature_matrix(df)
    baseline_pred = scored["pred_run_value"].to_numpy()

    effect_cols: Dict[str, np.ndarray] = {}
    direction_cols: Dict[str, np.ndarray] = {}

    for f in NUMERIC_FEATURES:
        col = pd.to_numeric(X[f], errors="coerce")
        std = float(np.nanstd(col.to_numpy()))
        if np.isnan(std) or std <= 1e-9:
            std = 0.1
        delta = 0.25 * std

        x_plus = X.copy()
        x_minus = X.copy()
        x_plus[f] = col + delta
        x_minus[f] = col - delta

        pred_plus = artifacts.model.predict(x_plus)
        pred_minus = artifacts.model.predict(x_minus)

        better_is_plus = pred_plus < pred_minus
        best_pred = np.where(better_is_plus, pred_plus, pred_minus)
        run_value_gain = baseline_pred - best_pred
        stuff_gain = 10.0 * (run_value_gain / (artifacts.mlb_std_pred or 1.0))

        effect_cols[f] = stuff_gain
        direction_cols[f] = np.where(better_is_plus, "increase", "decrease")

    out = scored.copy()
    for f in NUMERIC_FEATURES:
        out[f"{f}__gain"] = effect_cols[f]
        out[f"{f}__direction"] = direction_cols[f]

    group_cols = [c for c in ["Pitcher", "pitch_type"] if c in out.columns] or ["pitch_type"]

    diagnostics_rows: List[Dict[str, object]] = []
    grouped = out.groupby(group_cols, dropna=False)

    for keys, g in grouped:
        n = int(len(g))
        if n < min_pitches:
            continue

        if not isinstance(keys, tuple):
            keys = (keys,)
        key_map = {group_cols[i]: keys[i] for i in range(len(group_cols))}

        feature_rank = []
        for f in NUMERIC_FEATURES:
            if f.startswith("delta_") and str(key_map.get("pitch_type", "")).lower() in {"fourseam", "sinker"}:
                continue
            gain = float(np.nanmean(pd.to_numeric(g[f"{f}__gain"], errors="coerce")))
            if np.isnan(gain):
                continue
            mode = g[f"{f}__direction"].mode(dropna=True)
            direction = str(mode.iloc[0]) if not mode.empty else "increase"
            feature_rank.append(
                {
                    "feature": f,
                    "suggested_direction": direction,
                    "estimated_stuff_plus_gain": round(gain, 2),
                    **_coaching_translation(f, direction),
                }
            )

        feature_rank = sorted(feature_rank, key=lambda x: x["estimated_stuff_plus_gain"], reverse=True)[:top_k]

        diagnostics_rows.append(
            {
                **key_map,
                "pitches": n,
                "avg_stuff_plus": float(np.nanmean(pd.to_numeric(g["stuff_plus"], errors="coerce"))),
                "top_adjustments": feature_rank,
            }
        )

    return pd.DataFrame(diagnostics_rows)