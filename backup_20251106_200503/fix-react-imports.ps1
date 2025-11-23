# Script to remove unused React imports from JSX files

$files = Get-ChildItem -Path "src" -Recurse -Filter "*.jsx"

$count = 0
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if file has "import React from 'react';" at the start
    if ($content -match "^import React from 'react';") {
        # Remove the line
        $newContent = $content -replace "^import React from 'react';\r?\n", ""
        
        # Only update if content actually changed
        if ($newContent -ne $content) {
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            Write-Host "✅ Fixed: $($file.FullName)" -ForegroundColor Green
            $count++
        }
    }
}

Write-Host "`n📊 Total files fixed: $count" -ForegroundColor Cyan
