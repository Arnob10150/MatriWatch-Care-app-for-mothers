from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib


class ModelRegistry:
    def __init__(self, model_dir: str | os.PathLike[str] | None = None) -> None:
        default_dir = Path(__file__).resolve().parents[1] / "models"
        self.model_dir = Path(model_dir or os.getenv("MATRIWATCH_MODEL_DIR", default_dir))
        self._models: dict[str, Any] = {}

    def discover(self) -> list[str]:
        if not self.model_dir.exists():
            return []

        names: list[str] = []
        for path in sorted(self.model_dir.rglob("*")):
            if path.suffix in {".joblib", ".pth"}:
                names.append(path.relative_to(self.model_dir).as_posix())
        return names

    def load_joblib(self, filename: str) -> Any | None:
        if filename in self._models:
            return self._models[filename]

        path = self.model_dir / filename
        if not path.exists() or path.suffix != ".joblib":
            return None

        model = joblib.load(path)
        self._models[filename] = model
        return model

    def load_first_joblib(self, *filenames: str) -> Any | None:
        for filename in filenames:
            model = self.load_joblib(filename)
            if model is not None:
                return model
        return None


registry = ModelRegistry()
