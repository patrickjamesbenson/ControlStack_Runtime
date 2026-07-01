from __future__ import annotations

"""Host-local driver utilisation curve JSON mirror runner.

The runner mirrors donor-owned static driver utilisation curve JSON files into the
RuntimeData authority-reference curve home. It is intentionally host-local: no
web surface is registered, no active snapshot is edited, and the manifest
contains checksums and public metadata only, never raw driver utilisation curve
payloads.
"""

import argparse
import json
import re
import shutil
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Iterable

SCHEMA_ID = "controlstack.runtime.authority-reference.driver-util-curves-manifest"
SCHEMA_VERSION = 1
SOURCE_KIND = "driver_util_curve_json_static_mirror"
SOURCE_ROOT_CLASSIFICATION = "donor-static-driver-util-source"
SOURCE_CLASSIFICATION = "donor-static-driver-util-mirror"

DEFAULT_SOURCE = Path(r"C:\ControlStack\data\driver_util_curves")
DEFAULT_TARGET = Path(r"C:\ControlStack_RuntimeData\authority-reference\driver_util_curves")
DEFAULT_MANIFEST = Path(r"C:\ControlStack_RuntimeData\authority-reference\driver_util_curves_manifest.json")

UNSAFE_FILENAME_PATTERN = re.compile(r'[<>:"/\\|?*\x00]')
JSON_EXTENSION_PATTERN = re.compile(r"\.json$", re.IGNORECASE)
SHA256_PATTERN = re.compile(r"^[a-f0-9]{64}$")


class MirrorSafetyError(RuntimeError):
    """Raised when a bounded mirror safety guard fails."""


@dataclass(frozen=True)
class SourceFile:
    filename: str
    source_path: Path
    target_path: Path
    size_bytes: int
    checksum: str
    already_mirrored: bool


def normalise_path(value: str | Path) -> Path:
    return Path(value).expanduser().resolve(strict=False)


def path_key(value: str | Path) -> str:
    return str(normalise_path(value)).casefold()


def same_path(left: str | Path, right: str | Path) -> bool:
    return path_key(left) == path_key(right)


def is_relative_to(child: Path, parent: Path) -> bool:
    try:
        normalise_path(child).relative_to(normalise_path(parent))
        return True
    except ValueError:
        return False


def safe_filename(name: str) -> str:
    filename = Path(name).name.strip()
    if not filename or filename in {".", ".."}:
        raise MirrorSafetyError("unsafe filename: empty or traversal segment")
    if filename != name:
        raise MirrorSafetyError("unsafe filename: basename changed during normalisation")
    if UNSAFE_FILENAME_PATTERN.search(filename):
        raise MirrorSafetyError("unsafe filename: reserved path character present")
    if not JSON_EXTENSION_PATTERN.search(filename):
        raise MirrorSafetyError("unsafe filename: not a JSON filename")
    return filename


def sha256_file(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def manifest_file_entry(source_file: SourceFile) -> dict[str, object]:
    return {
        "filename": source_file.filename,
        "relative_path": f"driver_util_curves/{source_file.filename}",
        "size_bytes": source_file.size_bytes,
        "sha256": source_file.checksum,
        "source_classification": SOURCE_CLASSIFICATION,
        "raw_payload_in_manifest": False,
    }


def build_manifest(
    *,
    files: Iterable[SourceFile],
    dry_run: bool,
    executed: bool,
    copied_count: int,
    already_mirrored_count: int,
    conflict_count: int,
    generated_at: datetime | None = None,
) -> dict[str, object]:
    manifest_files = sorted((manifest_file_entry(file) for file in files), key=lambda item: str(item["filename"]).casefold())
    return {
        "schema_id": SCHEMA_ID,
        "schema_version": SCHEMA_VERSION,
        "source_kind": SOURCE_KIND,
        "source_root_classification": SOURCE_ROOT_CLASSIFICATION,
        "generated_at": (generated_at or datetime.now(timezone.utc)).isoformat(),
        "dry_run": dry_run,
        "executed": executed,
        "file_count": len(manifest_files),
        "copied_count": copied_count,
        "already_mirrored_count": already_mirrored_count,
        "conflict_count": conflict_count,
        "files": manifest_files,
        "raw_driver_util_payloads_included": False,
        "active_snapshot_mutated": False,
        "board_data_maker_imported": False,
        "donor_files_mutated": False,
    }


def validate_manifest_shape(manifest: dict[str, object]) -> None:
    if manifest.get("schema_id") != SCHEMA_ID:
        raise MirrorSafetyError("manifest schema_id guard failed")
    if manifest.get("schema_version") != SCHEMA_VERSION:
        raise MirrorSafetyError("manifest schema_version guard failed")
    if manifest.get("source_kind") != SOURCE_KIND:
        raise MirrorSafetyError("manifest source_kind guard failed")
    if manifest.get("source_root_classification") != SOURCE_ROOT_CLASSIFICATION:
        raise MirrorSafetyError("manifest source root classification guard failed")
    if manifest.get("raw_driver_util_payloads_included") is not False:
        raise MirrorSafetyError("manifest raw driver-util payload guard failed")
    if manifest.get("active_snapshot_mutated") is not False:
        raise MirrorSafetyError("manifest active snapshot guard failed")
    if manifest.get("board_data_maker_imported") is not False:
        raise MirrorSafetyError("manifest board data import guard failed")
    if manifest.get("donor_files_mutated") is not False:
        raise MirrorSafetyError("manifest donor mutation guard failed")
    files = manifest.get("files")
    if not isinstance(files, list):
        raise MirrorSafetyError("manifest files guard failed")
    if manifest.get("file_count") != len(files):
        raise MirrorSafetyError("manifest file_count guard failed")
    for entry in files:
        if not isinstance(entry, dict):
            raise MirrorSafetyError("manifest file entry guard failed")
        filename = entry.get("filename")
        if not isinstance(filename, str):
            raise MirrorSafetyError("manifest filename guard failed")
        safe_filename(filename)
        if entry.get("relative_path") != f"driver_util_curves/{filename}":
            raise MirrorSafetyError("manifest relative_path guard failed")
        if not isinstance(entry.get("size_bytes"), int):
            raise MirrorSafetyError("manifest size guard failed")
        if not SHA256_PATTERN.match(str(entry.get("sha256") or "")):
            raise MirrorSafetyError("manifest checksum guard failed")
        if entry.get("source_classification") != SOURCE_CLASSIFICATION:
            raise MirrorSafetyError("manifest source classification guard failed")
        if entry.get("raw_payload_in_manifest") is not False:
            raise MirrorSafetyError("manifest raw payload guard failed")


def validate_roots(source: Path, target: Path, manifest_path: Path, allow_test_path_overrides: bool) -> None:
    if not allow_test_path_overrides:
        if not same_path(source, DEFAULT_SOURCE):
            raise MirrorSafetyError("source root must be the donor driver_util_curves home")
        if not same_path(target, DEFAULT_TARGET):
            raise MirrorSafetyError("target root must be the RuntimeData authority-reference driver_util_curves home")
        if not same_path(manifest_path, DEFAULT_MANIFEST):
            raise MirrorSafetyError("manifest path must be the RuntimeData authority-reference driver_util_curves manifest")

    if source == target or same_path(source, target):
        raise MirrorSafetyError("source and target roots must differ")
    if is_relative_to(target, source) or is_relative_to(source, target):
        raise MirrorSafetyError("source and target roots must not contain each other")
    if is_relative_to(manifest_path, source):
        raise MirrorSafetyError("manifest path must not be inside the source root")
    if manifest_path.name != "driver_util_curves_manifest.json":
        raise MirrorSafetyError("manifest filename must be driver_util_curves_manifest.json")


def discover_json_files(source: Path, target: Path) -> tuple[list[SourceFile], list[str], list[dict[str, str]]]:
    if not source.exists() or not source.is_dir():
        raise MirrorSafetyError("source root is not an available directory")

    source_files: list[SourceFile] = []
    ignored: list[str] = []
    conflicts: list[dict[str, str]] = []

    for entry in sorted(source.iterdir(), key=lambda item: item.name.casefold()):
        if not entry.is_file():
            ignored.append(entry.name)
            continue
        if not JSON_EXTENSION_PATTERN.search(entry.name):
            ignored.append(entry.name)
            continue
        filename = safe_filename(entry.name)
        source_path = entry.resolve(strict=False)
        if not is_relative_to(source_path, source):
            raise MirrorSafetyError("source file escaped source root")
        target_path = (target / filename).resolve(strict=False)
        if not is_relative_to(target_path, target):
            raise MirrorSafetyError("target file escaped target root")

        source_checksum = sha256_file(source_path)
        source_size = entry.stat().st_size
        already_mirrored = False
        if target_path.exists():
            if not target_path.is_file():
                conflicts.append({"filename": filename, "reason": "target exists but is not a file"})
            else:
                target_checksum = sha256_file(target_path)
                if target_checksum == source_checksum:
                    already_mirrored = True
                else:
                    conflicts.append({"filename": filename, "reason": "target checksum differs"})

        source_files.append(
            SourceFile(
                filename=filename,
                source_path=source_path,
                target_path=target_path,
                size_bytes=source_size,
                checksum=source_checksum,
                already_mirrored=already_mirrored,
            )
        )

    return source_files, ignored, conflicts


def write_manifest(manifest_path: Path, manifest: dict[str, object]) -> None:
    if manifest_path.exists() and not manifest_path.is_file():
        raise MirrorSafetyError("manifest path exists but is not a file")
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_text = json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    manifest_path.write_text(manifest_text, encoding="utf-8")


def copy_missing_files(source_files: list[SourceFile], target: Path) -> int:
    target.mkdir(parents=True, exist_ok=True)
    copied_count = 0
    for source_file in source_files:
        if source_file.already_mirrored:
            continue
        if source_file.target_path.exists():
            raise MirrorSafetyError("refusing to overwrite an existing target file")
        shutil.copyfile(source_file.source_path, source_file.target_path)
        if sha256_file(source_file.target_path) != source_file.checksum:
            raise MirrorSafetyError("copied file checksum did not match source")
        copied_count += 1
    return copied_count


def run_mirror(args: argparse.Namespace) -> tuple[int, dict[str, object]]:
    dry_run = not args.execute
    executed = bool(args.execute)
    source = normalise_path(args.source)
    target = normalise_path(args.target)
    manifest_path = normalise_path(args.manifest)

    validate_roots(source, target, manifest_path, args.allow_test_path_overrides)
    source_files, ignored, conflicts = discover_json_files(source, target)

    already_mirrored_count = sum(1 for file in source_files if file.already_mirrored)
    planned_copy_count = len(source_files) - already_mirrored_count
    conflict_count = len(conflicts)

    if conflict_count:
        manifest = build_manifest(
            files=source_files,
            dry_run=dry_run,
            executed=False,
            copied_count=0,
            already_mirrored_count=already_mirrored_count,
            conflict_count=conflict_count,
        )
        validate_manifest_shape(manifest)
        return 2, {
            "ok": False,
            "blocker": "target-checksum-conflict",
            "dry_run": dry_run,
            "executed": False,
            "file_count": len(source_files),
            "copied_count": 0,
            "planned_copy_count": planned_copy_count,
            "already_mirrored_count": already_mirrored_count,
            "conflict_count": conflict_count,
            "ignored_count": len(ignored),
            "conflicts": conflicts,
            "manifest_written": False,
            "raw_driver_util_payloads_included": False,
            "active_snapshot_mutated": False,
            "board_data_maker_imported": False,
            "donor_files_mutated": False,
        }

    copied_count = 0
    manifest_written = False
    if executed:
        copied_count = copy_missing_files(source_files, target)

    manifest = build_manifest(
        files=source_files,
        dry_run=dry_run,
        executed=executed,
        copied_count=copied_count,
        already_mirrored_count=already_mirrored_count,
        conflict_count=0,
    )
    validate_manifest_shape(manifest)

    if executed:
        write_manifest(manifest_path, manifest)
        manifest_written = True

    return 0, {
        "ok": True,
        "source_kind": SOURCE_KIND,
        "source_root_classification": SOURCE_ROOT_CLASSIFICATION,
        "dry_run": dry_run,
        "executed": executed,
        "file_count": len(source_files),
        "copied_count": copied_count,
        "planned_copy_count": planned_copy_count if dry_run else 0,
        "already_mirrored_count": already_mirrored_count,
        "conflict_count": 0,
        "ignored_count": len(ignored),
        "manifest_written": manifest_written,
        "manifest": manifest,
        "raw_driver_util_payloads_included": False,
        "active_snapshot_mutated": False,
        "board_data_maker_imported": False,
        "donor_files_mutated": False,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Mirror donor driver utilisation curve JSON files into RuntimeData authority-reference storage.")
    parser.add_argument("--source", default=str(DEFAULT_SOURCE), help="Donor driver_util_curves source directory.")
    parser.add_argument("--target", default=str(DEFAULT_TARGET), help="RuntimeData authority-reference driver_util_curves target directory.")
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST), help="RuntimeData driver_util_curves manifest path.")
    parser.add_argument("--execute", action="store_true", help="Copy files and write the checksum manifest. Omit for dry-run.")
    parser.add_argument(
        "--allow-test-path-overrides",
        action="store_true",
        help="Permit non-default source/target/manifest paths for temp-directory tests only.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        code, result = run_mirror(args)
    except MirrorSafetyError as error:
        result = {
            "ok": False,
            "blocker": "mirror-safety-guard",
            "reason": str(error),
            "dry_run": not args.execute,
            "executed": False,
            "file_count": 0,
            "copied_count": 0,
            "already_mirrored_count": 0,
            "conflict_count": 0,
            "manifest_written": False,
            "raw_driver_util_payloads_included": False,
            "active_snapshot_mutated": False,
            "board_data_maker_imported": False,
            "donor_files_mutated": False,
        }
        code = 2

    print(json.dumps(result, indent=2, sort_keys=True))
    return code


if __name__ == "__main__":
    sys.exit(main())
