# Heatmap Backend

## Train MLB Stuff+ baseline

You can train an MLB-calibrated Stuff+ model from Statcast and then score your own Trackman data against that baseline.

### 1) Install dependencies

```bash
pip install -r requirements.txt
```

### 2) Train model (2025 MLB regular season baseline by default)

From existing Statcast CSV:

```bash
python train_stuff_plus_mlb.py --from-csv /path/to/statcast.csv --out models/stuff_plus_mlb.joblib
```

Or download from pybaseball directly (defaults to 2025 regular season):

```bash
python train_stuff_plus_mlb.py --out models/stuff_plus_mlb.joblib
```

Override date window manually if needed:

```bash
python train_stuff_plus_mlb.py --start-date 2025-03-18 --end-date 2025-09-28 --out models/stuff_plus_mlb.joblib
```

### 3) Run API with model

```bash
export STUFF_PLUS_MODEL_PATH=models/stuff_plus_mlb.joblib
uvicorn main:app --reload --port 8000
```

### 4) Score your own data

POST your Trackman CSV to:

- `POST /stuffplus/score`

Form fields:
- `file` (required)
- `pitcher` (optional)
- `pitch_type` (optional)
- `pitch_type_source` (`tagged` or `auto`)

Response includes:
- MLB calibration metadata
- grouped summary by pitcher + pitch type
- sample pitch-level rows

## Notes

- `100` = MLB average predicted pitch quality.
- `>100` = better than MLB average run prevention profile.
- `delta_run_exp` is used as the default training target.