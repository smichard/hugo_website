#!/usr/bin/env python3
"""Validate generated pages without external dependencies."""

from __future__ import annotations

import json
import posixpath
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse


SITE_HOSTS = {"stephan.michard.io", "www.stephan.michard.io"}
SKIPPED_SCHEMES = {"data", "javascript", "mailto", "tel"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.canonical = False
        self.description = False
        self.h1_count = 0
        self.ids: list[str] = []
        self.images_without_alt = 0
        self.is_alias = False
        self.json_ld: list[str] = []
        self.main_count = 0
        self.references: list[str] = []
        self.title_parts: list[str] = []
        self._in_json_ld = False
        self._in_title = False

    def handle_starttag(
        self, tag: str, attributes: list[tuple[str, str | None]]
    ) -> None:
        attrs = dict(attributes)

        if tag == "main":
            self.main_count += 1
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "title":
            self._in_title = True
        elif tag == "img" and "alt" not in attrs:
            self.images_without_alt += 1
        elif tag == "meta":
            name = (attrs.get("name") or "").lower()
            if name == "description" and (attrs.get("content") or "").strip():
                self.description = True
            if (attrs.get("http-equiv") or "").lower() == "refresh":
                self.is_alias = True
        elif tag == "link":
            rel = (attrs.get("rel") or "").lower().split()
            if "canonical" in rel and attrs.get("href"):
                self.canonical = True
        elif tag == "script" and (attrs.get("type") or "").lower() == "application/ld+json":
            self._in_json_ld = True
            self.json_ld.append("")

        if attrs.get("id"):
            self.ids.append(attrs["id"])

        for attribute in ("href", "src"):
            if attrs.get(attribute):
                self.references.append(attrs[attribute])
        if attrs.get("srcset"):
            self.references.extend(
                candidate.strip().split()[0]
                for candidate in attrs["srcset"].split(",")
                if candidate.strip()
            )

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        elif tag == "script" and self._in_json_ld:
            self._in_json_ld = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title_parts.append(data)
        if self._in_json_ld:
            self.json_ld[-1] += data


def output_target(root: Path, page_url: str, reference: str) -> Path | None:
    reference = reference.strip()
    if not reference or reference.startswith("#") or reference.startswith("//"):
        return None

    parsed = urlparse(reference)
    if parsed.scheme in SKIPPED_SCHEMES:
        return None
    if parsed.scheme in {"http", "https"} and parsed.hostname not in SITE_HOSTS:
        return None

    resolved = urlparse(urljoin(page_url, reference))
    path = unquote(resolved.path)
    if not path:
        return None

    target = root / path.lstrip("/")
    if path.endswith("/"):
        return target / "index.html"
    if target.is_file():
        return target
    return target / "index.html"


def validate_page(root: Path, html_file: Path) -> list[str]:
    parser = PageParser()
    parser.feed(html_file.read_text(encoding="utf-8"))
    relative = html_file.relative_to(root).as_posix()
    route = "/" if relative == "index.html" else "/" + relative.removesuffix("index.html")
    route = posixpath.normpath(route) + ("/" if relative.endswith("index.html") else "")
    errors: list[str] = []

    if not parser.is_alias:
        if parser.main_count != 1:
            errors.append(f"expected one <main>, found {parser.main_count}")
        if parser.h1_count != 1:
            errors.append(f"expected one <h1>, found {parser.h1_count}")
        if not "".join(parser.title_parts).strip():
            errors.append("missing page title")
        if not parser.description:
            errors.append("missing meta description")
        if not parser.canonical:
            errors.append("missing canonical link")

    if parser.images_without_alt:
        errors.append(f"{parser.images_without_alt} image(s) missing alt attributes")

    duplicate_ids = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
    if duplicate_ids:
        errors.append("duplicate id(s): " + ", ".join(duplicate_ids))

    for index, value in enumerate(parser.json_ld, start=1):
        try:
            json.loads(value)
        except json.JSONDecodeError as exception:
            errors.append(f"invalid JSON-LD block {index}: {exception.msg}")

    for reference in parser.references:
        target = output_target(root, route, reference)
        if target is not None and not target.exists():
            errors.append(f"missing local target {reference!r}")

    return [f"{relative}: {error}" for error in errors]


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {Path(sys.argv[0]).name} GENERATED_SITE", file=sys.stderr)
        return 2

    root = Path(sys.argv[1]).resolve()
    if not root.is_dir():
        print(f"generated site directory does not exist: {root}", file=sys.stderr)
        return 2

    html_files = sorted(root.rglob("*.html"))
    errors = [
        error
        for html_file in html_files
        for error in validate_page(root, html_file)
    ]
    if errors:
        print("\n".join(errors), file=sys.stderr)
        print(f"Validation failed with {len(errors)} error(s).", file=sys.stderr)
        return 1

    print(f"Validated {len(html_files)} HTML files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
