#!/usr/bin/env pwsh

# Script to add DevFooter to all dashboard pages

$pages = @(
    @{file="apps/frontend/app/dashboard/page.tsx"; path="apps/frontend/app/dashboard/page.tsx"},
    @{file="apps/frontend/app/dashboard/users/page.tsx"; path="apps/frontend/app/dashboard/users/page.tsx"},
    @{file="apps/frontend/app/dashboard/geography/page.tsx"; path="apps/frontend/app/dashboard/geography/page.tsx"},
    @{file="apps/frontend/app/dashboard/audit/page.tsx"; path="apps/frontend/app/dashboard/audit/page.tsx"}
)

foreach ($page in $pages) {
    $filePath = "d:\desarrollos\countries3\$($page.file)"
    
    Write-Host "Processing: $filePath"
    
    # Read file content
    $content = Get-Content $filePath -Raw
    
    # Check if DevFooter is already added
    if ($content -match "DevFooter") {
        Write-Host "  ✓ DevFooter already exists, skipping"
        continue
    }
    
    # Add import if not exists
    if ($content -notmatch "import DevFooter") {
        $content = $content -replace "(import.*from.*lucide-react.*;)", "`$1`nimport DevFooter from '@/components/common/DevFooter';"
    }
    
    # Add DevFooter component before last closing tags
    $content = $content -replace "(\s*</div>\s*\);\s*}\s*)$", "`n            <DevFooter filePath=`"$($page.path)`" />`n        </div>`n    );`n}"
    
    # Write back
    Set-Content $filePath -Value $content -NoNewline
    
    Write-Host "  ✓ DevFooter added successfully"
}

Write-Host "`nDone! DevFooter added to all dashboard pages."
