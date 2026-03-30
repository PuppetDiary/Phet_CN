param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Project,

    [string]$Owner,
    [string]$Token,
    [string]$DefaultBranch,
    [switch]$Private,
    [switch]$IncludeReadme
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info {
    param([string]$Message)
    Write-Host "[gitee] $Message"
}

function Get-HttpErrorBody {
    param($ErrorRecord)

    $response = $ErrorRecord.Exception.Response
    if (-not $response) {
        return $ErrorRecord.Exception.Message
    }

    try {
        $stream = $response.GetResponseStream()
        if ($stream) {
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $true)
            return $reader.ReadToEnd()
        }
    }
    catch {
    }

    try {
        return "HTTP $([int]$response.StatusCode.value__)"
    }
    catch {
        return $ErrorRecord.Exception.Message
    }
}

function ConvertTo-FormBody {
    param([Parameter(Mandatory = $true)][hashtable]$Body)

    $pairs = foreach ($key in $Body.Keys) {
        $value = [string]$Body[$key]
        [System.Uri]::EscapeDataString([string]$key) + '=' + [System.Uri]::EscapeDataString($value)
    }

    return ($pairs -join '&')
}

function Invoke-GiteeRest {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('GET', 'POST', 'PATCH')]
        [string]$Method,

        [Parameter(Mandatory = $true)]
        [string]$Uri,

        [hashtable]$Body,

        [switch]$AllowNotFound
    )

    try {
        if ($Method -eq 'GET') {
            return Invoke-RestMethod -Method Get -Uri $Uri -UseBasicParsing
        }

        if ($Method -eq 'PATCH') {
            $jsonBody = if ($Body) { $Body | ConvertTo-Json -Compress -Depth 10 } else { '{}' }
            $utf8Body = [System.Text.Encoding]::UTF8.GetBytes($jsonBody)
            return Invoke-RestMethod -Method Patch -Uri $Uri -Body $utf8Body -ContentType 'application/json; charset=utf-8' -UseBasicParsing
        }

        $formBody = if ($Body) { ConvertTo-FormBody -Body $Body } else { '' }
        $utf8FormBody = [System.Text.Encoding]::UTF8.GetBytes($formBody)
        return Invoke-RestMethod -Method Post -Uri $Uri -Body $utf8FormBody -ContentType 'application/x-www-form-urlencoded; charset=utf-8' -UseBasicParsing
    }
    catch {
        $statusCode = $null
        try {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
        }
        catch {
        }

        if ($AllowNotFound -and $statusCode -eq 404) {
            return $null
        }

        $bodyText = Get-HttpErrorBody $_
        throw "Gitee API 调用失败 $Method $Uri`n$bodyText"
    }
}

function Invoke-Git {
    param(
        [string]$WorkingDirectory,
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,
        [switch]$AllowFailure
    )

    $stdoutPath = [System.IO.Path]::GetTempFileName()
    $stderrPath = [System.IO.Path]::GetTempFileName()

    try {
        $argumentText = ($Arguments | ForEach-Object {
            if ($_ -match '[\s"]') {
                '"' + ($_ -replace '"', '\"') + '"'
            }
            else {
                $_
            }
        }) -join ' '

        $startInfo = @{
            FilePath = 'git'
            ArgumentList = $argumentText
            NoNewWindow = $true
            Wait = $true
            PassThru = $true
            RedirectStandardOutput = $stdoutPath
            RedirectStandardError = $stderrPath
        }

        if ($WorkingDirectory) {
            $startInfo.WorkingDirectory = $WorkingDirectory
        }

        $process = Start-Process @startInfo
        $exitCode = $process.ExitCode

        $stdout = if (Test-Path $stdoutPath) { Get-Content $stdoutPath } else { @() }
        $stderr = if (Test-Path $stderrPath) { Get-Content $stderrPath } else { @() }
        $output = @($stdout + $stderr | Where-Object { $_ -ne $null })
    }
    finally {
        if (Test-Path $stdoutPath) {
            Remove-Item $stdoutPath -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path $stderrPath) {
            Remove-Item $stderrPath -Force -ErrorAction SilentlyContinue
        }
    }

    if (-not $AllowFailure -and $exitCode -ne 0) {
        $commandText = 'git ' + ($Arguments -join ' ')
        $message = if ($output) { ($output -join [Environment]::NewLine) } else { '未知错误' }
        throw "$commandText 执行失败`n$message"
    }

    return $output
}

function Get-RelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,
        [Parameter(Mandatory = $true)]
        [string]$TargetPath
    )

    $base = (Resolve-Path $BasePath).Path.TrimEnd('\') + '\'
    $target = (Resolve-Path $TargetPath).Path
    $baseUri = New-Object System.Uri($base)
    $targetUri = New-Object System.Uri($target)
    return [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString()) -replace '/', '\'
}

function Load-LocalConfig {
    param([string]$ConfigPath)

    if (-not (Test-Path $ConfigPath)) {
        return $null
    }

    return Get-Content $ConfigPath -Raw | ConvertFrom-Json
}

function Get-GiteeCurrentUser {
    param([Parameter(Mandatory = $true)][string]$AccessToken)

    $uri = 'https://gitee.com/api/v5/user?access_token=' + [System.Uri]::EscapeDataString($AccessToken)
    return Invoke-GiteeRest -Method GET -Uri $uri
}

function Get-GiteeRepoInfo {
    param(
        [Parameter(Mandatory = $true)][string]$RepoOwner,
        [Parameter(Mandatory = $true)][string]$RepoName,
        [Parameter(Mandatory = $true)][string]$AccessToken
    )

    $uri = 'https://gitee.com/api/v5/repos/' +
        [System.Uri]::EscapeDataString($RepoOwner) + '/' +
        [System.Uri]::EscapeDataString($RepoName) +
        '?access_token=' + [System.Uri]::EscapeDataString($AccessToken)

    return Invoke-GiteeRest -Method GET -Uri $uri -AllowNotFound
}

function Get-RepoDescription {
    param(
        [Parameter(Mandatory = $true)][string]$RepoName,
        [string]$SourceBaseUrl = 'https://github.com/phetsims'
    )

    $baseUrl = $SourceBaseUrl.TrimEnd('/')
    return "中文化后的PhET开源游戏$RepoName，原项目开源地址：$baseUrl/$RepoName"
}

function New-GiteeRepo {
    param(
        [Parameter(Mandatory = $true)][string]$RepoName,
        [Parameter(Mandatory = $true)][string]$AccessToken,
        [Parameter(Mandatory = $true)][string]$Description,
        [switch]$MakePrivate
    )

    $uri = 'https://gitee.com/api/v5/user/repos'
    $body = @{
        access_token = $AccessToken
        name = $RepoName
        description = $Description
        auto_init = 'false'
        public = if ($MakePrivate) { '0' } else { '1' }
        private = if ($MakePrivate) { 'true' } else { 'false' }
    }

    return Invoke-GiteeRest -Method POST -Uri $uri -Body $body
}

function Update-GiteeRepo {
    param(
        [Parameter(Mandatory = $true)][string]$RepoOwner,
        [Parameter(Mandatory = $true)][string]$RepoName,
        [Parameter(Mandatory = $true)][string]$AccessToken,
        [Parameter(Mandatory = $true)][string]$Description,
        [switch]$MakePrivate
    )

    $uri = 'https://gitee.com/api/v5/repos/' +
        [System.Uri]::EscapeDataString($RepoOwner) + '/' +
        [System.Uri]::EscapeDataString($RepoName)

    $body = @{
        access_token = $AccessToken
        name = $RepoName
        description = $Description
        private = if ($MakePrivate) { 'true' } else { 'false' }
    }

    return Invoke-GiteeRest -Method PATCH -Uri $uri -Body $body
}

function Ensure-GiteeRepoSettings {
    param(
        [Parameter(Mandatory = $true)][string]$RepoOwner,
        [Parameter(Mandatory = $true)][string]$RepoName,
        [Parameter(Mandatory = $true)][string]$AccessToken,
        [Parameter(Mandatory = $true)][string]$Description,
        [switch]$MakePrivate
    )

    for ($attempt = 1; $attempt -le 10; $attempt++) {
        try {
            return Update-GiteeRepo -RepoOwner $RepoOwner -RepoName $RepoName -AccessToken $AccessToken -Description $Description -MakePrivate:$MakePrivate
        }
        catch {
            if ($attempt -eq 10) {
                throw
            }

            Write-Info '等待 Gitee 完成仓库初始化后再更新设置'
            Start-Sleep -Seconds 2
        }
    }
}

function Get-ProjectFilesFromGit {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectPath,
        [switch]$SkipReadme
    )

    $projectFullPath = (Resolve-Path $ProjectPath).Path
    $gitRootOutput = & git -C $projectFullPath rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $gitRootOutput) {
        return $null
    }

    $repoRoot = ([string]($gitRootOutput | Select-Object -First 1)).Trim()
    $projectSpec = Get-RelativePath -BasePath $repoRoot -TargetPath $projectFullPath
    $projectSpec = $projectSpec.Replace('\', '/')

    $gitFiles = & git -C $repoRoot ls-files --cached --modified --others --exclude-standard --full-name -- $projectSpec
    if ($LASTEXITCODE -ne 0) {
        throw '读取项目文件失败'
    }

    $items = @()
    foreach ($gitFile in $gitFiles) {
        if ([string]::IsNullOrWhiteSpace($gitFile)) {
            continue
        }

        $relativePath = $gitFile.Substring($projectSpec.Length).TrimStart('/').Replace('/', '\')
        if ([string]::IsNullOrWhiteSpace($relativePath)) {
            continue
        }

        if ($SkipReadme -and ($relativePath -match '(?i)^README(\..*)?$')) {
            continue
        }

        $items += [PSCustomObject]@{
            SourcePath = Join-Path $repoRoot ($gitFile -replace '/', '\')
            RelativePath = $relativePath
        }
    }

    return $items
}

function Get-ProjectFilesFromFileSystem {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectPath,
        [switch]$SkipReadme
    )

    $projectFullPath = (Resolve-Path $ProjectPath).Path
    $files = Get-ChildItem -Path $projectFullPath -Recurse -Force -File | Where-Object {
        $_.FullName -notmatch '[\\/]\.git([\\/]|$)'
    }

    $items = @()
    foreach ($file in $files) {
        $relativePath = Get-RelativePath -BasePath $projectFullPath -TargetPath $file.FullName

        if ($SkipReadme -and ($relativePath -match '(?i)^README(\..*)?$')) {
            continue
        }

        $items += [PSCustomObject]@{
            SourcePath = $file.FullName
            RelativePath = $relativePath
        }
    }

    return $items
}

function Get-ProjectFiles {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectPath,
        [switch]$SkipReadme
    )

    $gitItems = Get-ProjectFilesFromGit -ProjectPath $ProjectPath -SkipReadme:$SkipReadme
    if ($gitItems) {
        return $gitItems
    }

    return Get-ProjectFilesFromFileSystem -ProjectPath $ProjectPath -SkipReadme:$SkipReadme
}

function Clear-StageDirectory {
    param([Parameter(Mandatory = $true)][string]$StagePath)

    Get-ChildItem -Path $StagePath -Force | Where-Object {
        $_.Name -ne '.git'
    } | Remove-Item -Recurse -Force
}

function Copy-ProjectFiles {
    param(
        [Parameter(Mandatory = $true)]$Files,
        [Parameter(Mandatory = $true)][string]$DestinationRoot
    )

    foreach ($file in $Files) {
        $targetPath = Join-Path $DestinationRoot $file.RelativePath
        $targetDir = Split-Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        }
        Copy-Item -Path $file.SourcePath -Destination $targetPath -Force
    }
}

$configPath = Join-Path $PSScriptRoot '.gitee-publish.local.json'
$config = Load-LocalConfig -ConfigPath $configPath

if (-not $Token -and $env:GITEE_TOKEN) {
    $Token = $env:GITEE_TOKEN
}
if (-not $Token -and $config -and $config.token) {
    $Token = [string]$config.token
}
if (-not $Owner -and $config -and $config.owner) {
    $Owner = [string]$config.owner
}
if (-not $DefaultBranch -and $config -and $config.defaultBranch) {
    $DefaultBranch = [string]$config.defaultBranch
}
if (-not $DefaultBranch) {
    $DefaultBranch = 'master'
}

$sourceRepoBaseUrl = if ($config -and $config.sourceRepoBaseUrl) {
    [string]$config.sourceRepoBaseUrl
}
else {
    'https://github.com/phetsims'
}

if (-not $Token) {
    throw '没找到 Gitee Token。把 token 写进 .gitee-publish.local.json，或者设置环境变量 GITEE_TOKEN。'
}

$currentUser = Get-GiteeCurrentUser -AccessToken $Token
if (-not $Owner) {
    $Owner = [string]$currentUser.login
}

if ($Owner -ne [string]$currentUser.login) {
    throw "当前 token 属于 $($currentUser.login)，脚本现在只支持推送到这个个人空间。"
}

$projectPath = if (Test-Path $Project) {
    (Resolve-Path $Project).Path
}
else {
    $combinedPath = Join-Path $PSScriptRoot $Project
    if (Test-Path $combinedPath) {
        (Resolve-Path $combinedPath).Path
    }
    else {
        throw "找不到项目目录 $Project"
    }
}

if (-not (Test-Path $projectPath -PathType Container)) {
    throw "项目路径不是目录 $projectPath"
}

$repoName = Split-Path $projectPath -Leaf
$repoDescription = Get-RepoDescription -RepoName $repoName -SourceBaseUrl $sourceRepoBaseUrl
$skipReadme = -not $IncludeReadme
$files = Get-ProjectFiles -ProjectPath $projectPath -SkipReadme:$skipReadme
if (-not $files -or $files.Count -eq 0) {
    throw "项目 $repoName 没有可推送的文件"
}

$repoInfo = Get-GiteeRepoInfo -RepoOwner $Owner -RepoName $repoName -AccessToken $Token
if (-not $repoInfo) {
    Write-Info "远程仓库 $Owner/$repoName 不存在，开始创建"
    $repoInfo = New-GiteeRepo -RepoName $repoName -AccessToken $Token -Description $repoDescription -MakePrivate:$Private
}
else {
    Write-Info "远程仓库 $Owner/$repoName 已存在，直接同步"
}

$branch = if ($repoInfo.default_branch) { [string]$repoInfo.default_branch } else { $DefaultBranch }
$publicRepoUrl = 'https://gitee.com/' + $Owner + '/' + $repoName + '.git'
$authRepoUrl = 'https://' + $Owner + ':' + $Token + '@gitee.com/' + $Owner + '/' + $repoName + '.git'
$stagePath = Join-Path ([System.IO.Path]::GetTempPath()) ('gitee-publish-' + $repoName + '-' + [guid]::NewGuid().ToString('N'))

try {
    Write-Info '克隆远程仓库到临时目录'
    Invoke-Git -Arguments @('clone', '--quiet', $authRepoUrl, $stagePath) | Out-Null
    Invoke-Git -WorkingDirectory $stagePath -Arguments @('remote', 'set-url', 'origin', $publicRepoUrl) | Out-Null
    Invoke-Git -WorkingDirectory $stagePath -Arguments @('remote', 'set-url', '--push', 'origin', $authRepoUrl) | Out-Null
    Invoke-Git -WorkingDirectory $stagePath -Arguments @('config', 'user.name', $Owner) | Out-Null
    Invoke-Git -WorkingDirectory $stagePath -Arguments @('config', 'user.email', ($Owner + '@users.noreply.gitee.com')) | Out-Null

    $hasHead = $true
    try {
        Invoke-Git -WorkingDirectory $stagePath -Arguments @('rev-parse', '--verify', 'HEAD') | Out-Null
    }
    catch {
        $hasHead = $false
    }

    if (-not $hasHead) {
        Invoke-Git -WorkingDirectory $stagePath -Arguments @('checkout', '--orphan', $branch) | Out-Null
    }

    Write-Info '同步本地文件'
    Clear-StageDirectory -StagePath $stagePath
    Copy-ProjectFiles -Files $files -DestinationRoot $stagePath

    Invoke-Git -WorkingDirectory $stagePath -Arguments @('add', '-A') | Out-Null
    $status = Invoke-Git -WorkingDirectory $stagePath -Arguments @('status', '--porcelain')
    if (-not $status) {
        Write-Info '没有变更，远程仓库无需更新'
        $repoInfo = Ensure-GiteeRepoSettings -RepoOwner $Owner -RepoName $repoName -AccessToken $Token -Description $repoDescription -MakePrivate:$Private
        Write-Host $publicRepoUrl
        return
    }

    $commitMessage = 'sync ' + $repoName + ' ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    Invoke-Git -WorkingDirectory $stagePath -Arguments @('commit', '-m', $commitMessage) | Out-Null

    Write-Info "推送到 $Owner/$repoName 的 $branch 分支"
    Invoke-Git -WorkingDirectory $stagePath -Arguments @('push', '-u', 'origin', $branch) | Out-Null

    $repoInfo = Ensure-GiteeRepoSettings -RepoOwner $Owner -RepoName $repoName -AccessToken $Token -Description $repoDescription -MakePrivate:$Private
    Write-Host $publicRepoUrl
}
finally {
    if ($stagePath -and (Test-Path $stagePath)) {
        Remove-Item -Path $stagePath -Recurse -Force
    }
}

