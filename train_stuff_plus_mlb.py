

"""
Train an MLB-calibrated Stuff+ model and save artifacts.

Usage examples:
  python train_stuff_plus_mlb.py --from-csv /path/to/statcast.csv --out models/stuff_plus_mlb.joblib
  python train_stuff_plus_mlb.py --start-date 2025-03-18 --end-date 2025-09-28 --out models/stuff_plus_mlb.joblib
"""

from __future__ import annotations

import argparse
import os

import joblib
import pandas as pd

from stuff_plus_model import StuffPlusArtifacts, train_stuff_plus


def load_statcast_from_pybaseball(start_date: str, end_date: str) -> pd.DataFrame:
    from pybaseball import statcast

    print(f"Downloading Statcast pitches from {start_date} to {end_date}...")
    df = statcast(start_dt=start_date, end_dt=end_date)
    if df.empty:
        raise ValueError("No rows returned from Statcast for the given date range.")
    return df


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train MLB Stuff+ model")
    parser.add_argument("--from-csv", type=str, default=None, help="Existing MLB Statcast CSV file")
    parser.add_argument(
        "--start-date",
        type=str,
        default="2025-03-18",
        help="Statcast download start (YYYY-MM-DD). Default is 2025 regular season start.",
    )
    parser.add_argument(
        "--end-date",
        type=str,
        default="2025-09-28",
        help="Statcast download end (YYYY-MM-DD). Default is 2025 regular season end.",
    )
    parser.add_argument("--target", type=str, default="delta_run_exp", help="Target column to train on")
    parser.add_argument("--out", type=str, default="models/stuff_plus_mlb.joblib", help="Output artifact path")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.from_csv:
        df = pd.read_csv(args.from_csv, low_memory=False)
    else:
        df = load_statcast_from_pybaseball(args.start_date, args.end_date)

    artifacts: StuffPlusArtifacts = train_stuff_plus(df, target_column=args.target)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    joblib.dump(artifacts, args.out)
    print(f"Saved model artifacts -> {args.out}")
    print(f"MLB calibration mean={artifacts.mlb_mean_pred:.6f} std={artifacts.mlb_std_pred:.6f}")


if __name__ == "__main__":
    main()