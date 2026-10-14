$ErrorActionPreference='Stop'
Push-Location (Join-Path $PSScriptRoot '../interest-dashboard')
try {
    # AOT template compilation and direct esbuild avoid restricted child-process launching.
    node node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js -p tsconfig.json --outDir .compiled-ui
    if ($LASTEXITCODE -ne 0) { throw 'Angular template compilation failed' }
    $esbuild=Get-ChildItem -Path 'node_modules/.pnpm/@esbuild+win32-x64@*/node_modules/@esbuild/win32-x64/esbuild.exe' | Select-Object -First 1 -ExpandProperty FullName
    if (!$esbuild) { throw 'Install dependencies using pnpm install first' }
    New-Item -ItemType Directory -Path 'dist/dashboard/browser' -Force | Out-Null
    Set-Content -LiteralPath '.compiled-ui/fallback-entry.js' -Value 'import "@angular/compiler"; import "./main.js";' -Encoding utf8
    & $esbuild '.compiled-ui/fallback-entry.js' --bundle --minify --format=esm --target=es2022 --outfile=dist/dashboard/browser/main.js '--define:ngDevMode=false'
    if ($LASTEXITCODE -ne 0) { throw 'Angular bundle failed' }
    & $esbuild 'node_modules/zone.js/fesm2015/zone.js' --bundle --minify --outfile=dist/dashboard/browser/polyfills.js
    if ($LASTEXITCODE -ne 0) { throw 'Polyfill bundle failed' }
    Copy-Item -LiteralPath 'src/styles.css' -Destination 'dist/dashboard/browser/styles.css'
    $page=Get-Content -LiteralPath 'src/index.html' -Raw
    $page=$page.Replace('</head>','<link rel="stylesheet" href="styles.css"></head>').Replace('</body>','<script src="polyfills.js"></script><script type="module" src="main.js"></script></body>')
    Set-Content -LiteralPath 'dist/dashboard/browser/index.html' -Value $page -Encoding utf8
} finally { Pop-Location }
