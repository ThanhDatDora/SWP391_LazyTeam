# PowerShell script to fix console.log issues in JavaScript/JSX files

$files = Get-ChildItem -Path "src" -Include "*.js", "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "console\.log") {
        Write-Host "Fixing console.log in: $($file.FullName)"
        
        # Replace console.log with console.warn
        $content = $content -replace "console\.log\(", "console.warn("
        
        # Write the updated content back to the file
        [System.IO.File]::WriteAllText($file.FullName, $content)
    }
}

Write-Host "Console.log fixes completed!"