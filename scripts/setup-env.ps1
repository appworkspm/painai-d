# setup-env.ps1
# This script copies the .env file from /config to the root directory

 = Join-Path -Path  -ChildPath "config\.env"
 = Join-Path -Path  -ChildPath ".env"

if (Test-Path ) {
    Copy-Item -Path  -Destination  -Force
    Write-Host "Copied .env file to root directory"
} else {
    Write-Host "Error: .env file not found in config directory"
}
