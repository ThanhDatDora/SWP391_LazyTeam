# Fix font encoding issues in React app

Write-Host "Fixing font and encoding issues..." -ForegroundColor Cyan

# Check if main CSS has proper font imports
$cssFile = "src/index.css"
if (Test-Path $cssFile) {
    $content = Get-Content $cssFile -Raw -Encoding UTF8
    
    # Add font imports if not present
    if ($content -notmatch "@import.*Inter") {
        $fontImports = @"
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

"@
        $newContent = $fontImports + $content
        [System.IO.File]::WriteAllText($cssFile, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Added Inter font import to index.css" -ForegroundColor Green
    }
    
    # Ensure proper font family is set
    if ($content -notmatch "font-family.*Inter") {
        $content += @"

/* Ensure proper font rendering */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
"@
        [System.IO.File]::WriteAllText($cssFile, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Added font-family to body in index.css" -ForegroundColor Green
    }
}

# Fix any encoding issues in main HTML
$htmlFile = "index.html"
if (Test-Path $htmlFile) {
    $content = Get-Content $htmlFile -Raw -Encoding UTF8
    
    # Ensure proper meta charset
    if ($content -notmatch 'charset="utf-8"') {
        $content = $content -replace '<head>', '<head>
    <meta charset="utf-8">'
        [System.IO.File]::WriteAllText($htmlFile, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Added UTF-8 charset to index.html" -ForegroundColor Green
    }
}

Write-Host "Font fixes completed!" -ForegroundColor Cyan