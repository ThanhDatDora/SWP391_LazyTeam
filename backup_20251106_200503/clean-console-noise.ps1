# PowerShell script to clean up excessive console logging

Write-Host "Cleaning up console statements..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "src" -Include "*.js", "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace specific debug patterns with console.debug
    $content = $content -replace "console\.warn\('API Request:", "console.debug('API Request:"
    $content = $content -replace "console\.warn\('Request config:", "console.debug('Request config:"
    $content = $content -replace "console\.warn\('Cache hit", "console.debug('Cache hit"
    $content = $content -replace "console\.warn\('Starting fetch", "console.debug('Starting fetch"
    $content = $content -replace "console\.warn\('fetchData called", "console.debug('fetchData called"
    $content = $content -replace "console\.warn\('Saving cart", "console.debug('Saving cart"
    $content = $content -replace "console\.warn\('LearnerNavbar:", "console.debug('LearnerNavbar:"
    $content = $content -replace "console\.warn\('Auth state changed:", "console.debug('Auth state changed:"
    
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Cleaned: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "Console cleanup completed!" -ForegroundColor Cyan