# Builds a standalone release APK (JavaScript is bundled inside, so no Metro server and no USB cable are needed).
#
# Why a second copy: the project path is long, and Windows' 260 character path limit breaks the native (CMake/ninja)
# build inside node_modules. The script mirrors the source into a short folder (default E:\px) and builds there.
#
# Usage (PowerShell, any folder):
#   & "E:\hassan\hassan uni work\semester 8\PhyXara\Mobile\scripts\build-release-apk.ps1"
#
# Before running: export from Unity (PhyXara > Export Android (release)) if the Unity side changed.
param(
    [string]$Work = "E:\px",
    [string]$Source = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Stop"
$env:GRADLE_USER_HOME = "E:\gradle-home"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NODE_ENV = "production"

$export = Join-Path $Source "AR_MODE\Builds\android\unityLibrary\build.gradle"
if (-not (Test-Path $export)) { throw "No Unity export found at $export. Run PhyXara > Export Android (release) in Unity first." }

Write-Host "1/4  Syncing project source to $Work ..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force "$Work\Mobile" | Out-Null
$skip = @("$Source\Mobile\node_modules", "$Source\Mobile\android", "$Source\Mobile\.expo", "$Source\Mobile\unity")
robocopy "$Source\Mobile" "$Work\Mobile" /E /XD $skip /XF *.log /NFL /NDL /NJH /NJS /NP | Out-Null
if (-not (Test-Path "$Work\Mobile\node_modules\expo\package.json")) {
    Write-Host "     node_modules missing in $Work, copying (a few minutes) ..."
    robocopy "$Source\Mobile\node_modules" "$Work\Mobile\node_modules" /E /XD .cxx /NFL /NDL /NJH /NJS /NP /MT:8 | Out-Null
}

Write-Host "2/4  Copying the new Unity export into the app ..." -ForegroundColor Cyan
Push-Location "$Work\Mobile"
node scripts\sync-unity.js "$Source\AR_MODE\Builds\android"
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "sync-unity failed" }

if (-not (Test-Path "android\gradlew.bat")) {
    Write-Host "     android/ missing, running prebuild ..."
    npx expo prebuild --platform android --clean --no-install
}
Set-Content "android\local.properties" "sdk.dir=$($env:ANDROID_HOME -replace '\\','/')"

Write-Host "3/4  Building the release APK (the Unity C++ step alone takes 15-30 minutes) ..." -ForegroundColor Cyan
Push-Location android
.\gradlew.bat --stop | Out-Null
.\gradlew.bat app:assembleRelease -PreactNativeArchitectures=arm64-v8a
$code = $LASTEXITCODE
Pop-Location; Pop-Location
if ($code -ne 0) { throw "Gradle failed with exit code $code (see the error above)" }

Write-Host "4/4  Copying the APK ..." -ForegroundColor Cyan
$apk = Get-ChildItem "$Work\Mobile\android\app\build\outputs\apk\release\*.apk" | Select-Object -First 1
$out = Join-Path $Work "PhyXara-release.apk"
Copy-Item $apk.FullName $out -Force
Write-Host ("DONE: {0}  ({1} MB)" -f $out, [int]($apk.Length / 1MB)) -ForegroundColor Green
