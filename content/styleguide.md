---
title: "Styleguide"
date: 2026-08-04
draft: true
author: "Stephan Michard"
toc:
  enable: false
---

Palette and typography preview. Draft-only — visible with `hugo server -D`, skipped by production builds. Toggle light/dark with the header button and check every block below in both modes.

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

Body copy with an [inline link](/posts/), some **bold text**, some *italic text*, and a piece of `inline code` to check the inset background. Muted text appears in post meta, captions and archive dates.

> A blockquote, which uses the accent color for its left border and muted text for the body.

- Unordered list item
- Another item with a [link](/about/)
- A third item

1. Ordered list item
2. Second item
3. Third item

| Column | Description | Value |
| --- | --- | --- |
| `--accent` | Primary accent | teal |
| `--bg-inset` | Inset surface | gray |
| `--border` | Hairlines | gray |

---

## Code blocks

```bash
#!/usr/bin/env bash
# Deploy the site to the cluster
set -euo pipefail

NAMESPACE="web"
REPLICAS=3

deploy() {
  local image="$1"
  kubectl set image deployment/site "site=${image}" -n "${NAMESPACE}"
  kubectl rollout status deployment/site -n "${NAMESPACE}" --timeout=120s
}

deploy "quay.io/smichard/site:1.4.2" || echo "rollout failed" >&2
```

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: site
  labels:
    app.kubernetes.io/name: site
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: site
          image: quay.io/smichard/site:1.4.2
          ports:
            - containerPort: 8080
          resources:
            limits:
              memory: "256Mi"
```

```python
"""Rebuild the search index."""
import json
from pathlib import Path


class Indexer:
    BATCH_SIZE = 128

    def __init__(self, root: Path, *, strict: bool = False) -> None:
        self.root = root
        self.strict = strict

    def run(self) -> dict:
        # Walk every markdown file under the content root
        docs = [p for p in self.root.rglob("*.md") if p.stat().st_size > 0]
        return {"count": len(docs), "ratio": 0.875}


if __name__ == "__main__":
    print(json.dumps(Indexer(Path("content")).run(), indent=2))
```

```go
package main

import (
	"fmt"
	"time"
)

// Feed represents a single syndicated source.
type Feed struct {
	URL     string
	Timeout time.Duration
}

func fetch(feeds []Feed) error {
	for i, f := range feeds {
		if f.URL == "" {
			return fmt.Errorf("feed %d: empty URL", i)
		}
		fmt.Printf("fetching %s (timeout %v)\n", f.URL, f.Timeout)
	}
	return nil
}
```

```json
{
  "name": "site",
  "version": "1.4.2",
  "private": true,
  "enabled": true,
  "retries": 3,
  "tags": ["hugo", "css", "blog"]
}
```

```diff
--- a/assets/css/_tokens.scss
+++ b/assets/css/_tokens.scss
-  --accent: #b5502e;
+  --accent: #0f766e;
```
