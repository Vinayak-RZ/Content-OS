Canonical founder Markdown duplicated from the monorepo root **`MyFiles/`** so **`content-os/`** can ship standalone.

Refresh after editing `MyFiles/`:

```powershell
# From repo root (Content-Creation-Automater)
Copy-Item -Force MyFiles\*.md content-os\seeds\founder\
```
