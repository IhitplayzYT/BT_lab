$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..')
try {
    mvn -B clean verify
    if ($LASTEXITCODE -ne 0) { throw 'Backend verification failed' }
    Push-Location 'interest-dashboard'
    try { pnpm install --frozen-lockfile --ignore-scripts; if ($LASTEXITCODE -ne 0) { throw 'Dependency install failed' }; pnpm run build; if ($LASTEXITCODE -ne 0) { throw 'Angular build failed' } } finally { Pop-Location }
} finally { Pop-Location }
