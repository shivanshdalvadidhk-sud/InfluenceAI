import math
import tempfile
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

from data.loader import load_channels
from db.postgres_client import DEFAULT_SCHEMA, ensure_schema, write_channel_assignments
from features.clustering import CLUSTER_FEATURES, UNCLUSTERED_LABEL, cluster_within_tiers
from features.model_features import prepare_features
from features.tiering import assign_tier

MODELS_DIR = Path(__file__).resolve().parent
ARTIFACT_NAMES = ("model.pkl", "encoders.pkl", "feature_columns.pkl")


def select_feature_columns(channel_df: pd.DataFrame) -> list[str]:
    missing = [name for name in CLUSTER_FEATURES if name not in channel_df.columns]
    if missing:
        raise KeyError(f"Missing required feature columns: {', '.join(missing)}.")
    categories = sorted(
        column for column in channel_df.columns if column.startswith("category_")
    )
    return list(dict.fromkeys([*CLUSTER_FEATURES, *categories]))


def _report_holdout(
    model: XGBClassifier,
    encoder: LabelEncoder,
    features: pd.DataFrame,
    labels: np.ndarray,
) -> None:
    class_counts = pd.Series(labels).value_counts()
    class_count = len(encoder.classes_)
    test_count = max(class_count, math.ceil(len(labels) * 0.2))
    can_stratify = (
        class_counts.min() >= 2
        and len(labels) - test_count >= class_count
        and test_count < len(labels)
    )
    if not can_stratify:
        print(
            "Held-out evaluation skipped: every cluster needs at least two "
            "channels for a stratified split."
        )
        return

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        labels,
        test_size=test_count,
        random_state=42,
        stratify=labels,
    )
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    print(f"Held-out cluster-membership accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(
        classification_report(
            y_test,
            predictions,
            labels=np.arange(class_count),
            target_names=encoder.classes_,
            zero_division=0,
        )
    )


def _save_artifacts(model: XGBClassifier, encoder: LabelEncoder, feature_columns: list[str]) -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    artifact_values = (model, encoder, feature_columns)
    temporary_paths: list[Path] = []
    try:
        for artifact_name, value in zip(ARTIFACT_NAMES, artifact_values):
            with tempfile.NamedTemporaryFile(
                dir=MODELS_DIR,
                prefix=f".{artifact_name}.",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                temporary_paths.append(Path(temporary_file.name))
            joblib.dump(value, temporary_paths[-1])
        for temporary_path, artifact_name in zip(temporary_paths, ARTIFACT_NAMES):
            temporary_path.replace(MODELS_DIR / artifact_name)
    finally:
        for temporary_path in temporary_paths:
            temporary_path.unlink(missing_ok=True)


def train(
    channel_df: pd.DataFrame,
    schema: str = DEFAULT_SCHEMA,
    persist_assignments: bool = True,
) -> XGBClassifier:
    if "channel_id" not in channel_df.columns:
        raise KeyError("ml_data.channels must include 'channel_id'.")

    clustered = cluster_within_tiers(assign_tier(channel_df))
    labeled = clustered.loc[
        clustered["cluster_label"].ne(UNCLUSTERED_LABEL)
    ].copy()
    if labeled.empty:
        raise ValueError(
            "No channels could be clustered. Check subscriber_count and "
            "avg_engagement_rate, and ensure at least three distinct channels "
            "exist in a subscriber tier."
        )

    feature_columns = select_feature_columns(clustered)
    features = prepare_features(labeled, feature_columns)
    encoder = LabelEncoder()
    labels = encoder.fit_transform(labeled["cluster_label"].astype(str))
    if len(encoder.classes_) < 2:
        raise ValueError(
            "At least two cluster labels are required to train the classifier."
        )

    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
        eval_metric="mlogloss",
        n_jobs=4,
    )
    _report_holdout(model, encoder, features, labels)
    model.fit(features, labels)

    if persist_assignments:
        write_channel_assignments(clustered, schema=schema)
    _save_artifacts(model, encoder, feature_columns)
    print(f"Saved model artifacts under {MODELS_DIR}.")
    return model


def main() -> None:
    ensure_schema()
    train(load_channels())


if __name__ == "__main__":
    main()
