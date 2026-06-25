from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "datasets" / "manifest.json"


def has_kaggle_credentials() -> bool:
    if os.getenv("KAGGLE_USERNAME") and os.getenv("KAGGLE_KEY"):
        return True
    return (Path.home() / ".kaggle" / "kaggle.json").exists()


def write_source_note(dataset: dict, target_dir: Path, status: str) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)
    note = {
        "id": dataset["id"],
        "title": dataset["title"],
        "source": dataset["source"],
        "source_url": dataset.get("source_url"),
        "status": status,
    }
    (target_dir / "source.json").write_text(json.dumps(note, indent=2), encoding="utf-8")


def download_kaggle(dataset: dict) -> str:
    target_dir = ROOT / dataset["target_dir"]
    write_source_note(dataset, target_dir, "pending")

    if not shutil.which("kaggle"):
        return "skipped: kaggle CLI is not installed"

    if not has_kaggle_credentials():
        return "skipped: Kaggle credentials not found"

    command = [
        "kaggle",
        "datasets",
        "download",
        "-d",
        dataset["slug"],
        "-p",
        str(target_dir),
        "--unzip",
    ]
    subprocess.run(command, check=True)
    write_source_note(dataset, target_dir, "downloaded")
    return "downloaded"


def save_mendeley_source_page(dataset: dict) -> str:
    target_dir = ROOT / dataset["target_dir"]
    write_source_note(dataset, target_dir, "source-page-saved")

    url = dataset["source_url"]
    request = Request(url, headers={"User-Agent": "MatriWatch dataset downloader"})
    try:
        with urlopen(request, timeout=30) as response:
            html = response.read()
        (target_dir / "source.html").write_bytes(html)
        return "source page saved; download files from page if API token is required"
    except Exception as exc:
        return f"skipped: could not fetch source page: {exc}"


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    results: list[tuple[str, str]] = []

    for dataset in manifest["datasets"]:
        source = dataset["source"]
        if source == "local":
            results.append((dataset["id"], "included"))
        elif source == "kaggle":
            results.append((dataset["id"], download_kaggle(dataset)))
        elif source == "mendeley":
            results.append((dataset["id"], save_mendeley_source_page(dataset)))
        else:
            results.append((dataset["id"], f"skipped: unknown source {source}"))

    print("MatriWatch dataset download report")
    print("=" * 36)
    for dataset_id, status in results:
        print(f"{dataset_id}: {status}")


if __name__ == "__main__":
    main()
