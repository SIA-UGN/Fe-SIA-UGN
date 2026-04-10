param(
    [string]$BaseUrl = "https://Be-Sia.trisuladana.com/api",
    [string]$ManagerToken,
    [string]$ManagerEmail,
    [string]$ManagerPassword,
    [string]$StudentToken,
    [string]$StudentEmail,
    [string]$StudentPassword,
    [int]$StudentId,
    [int]$MaxSks = 24,
    [string]$QuotaNote = "Set via readiness script",
    [switch]$ApplyQuota,
    [switch]$OpenSessionIfMissing,
    [int[]]$WhitelistClassIds
)

$ErrorActionPreference = "Stop"

function Join-ApiUrl {
    param(
        [string]$Base,
        [string]$Path
    )

    $cleanBase = $Base.TrimEnd('/')
    $cleanPath = $Path.TrimStart('/')
    return "$cleanBase/$cleanPath"
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [string]$Token,
        [object]$Body = $null,
        [hashtable]$Query = $null
    )

    $uri = Join-ApiUrl -Base $BaseUrl -Path $Path

    if ($Query -and $Query.Count -gt 0) {
        $queryString = ($Query.GetEnumerator() | ForEach-Object {
            "$([System.Uri]::EscapeDataString($_.Key))=$([System.Uri]::EscapeDataString([string]$_.Value))"
        }) -join '&'

        if ($queryString) {
            $uri = "$uri?$queryString"
        }
    }

    $headers = @{
        "Accept" = "application/json"
        "Authorization" = "Bearer $Token"
    }

    if ($null -ne $Body) {
        $json = $Body | ConvertTo-Json -Depth 10
        return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $json -ContentType "application/json"
    }

    return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
}

function Resolve-ApiErrorMessage {
    param(
        [object]$Exception
    )

    if ($Exception -and $Exception.Response -and $Exception.Response.GetResponseStream) {
        try {
            $stream = $Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                $body = $reader.ReadToEnd()
                if ($body) {
                    return $body
                }
            }
        }
        catch {
            return $Exception.Message
        }
    }

    return $Exception.Message
}

function Login-GetToken {
    param(
        [string]$Email,
        [string]$Password
    )

    $uri = Join-ApiUrl -Base $BaseUrl -Path "auth/login"
    $payload = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri $uri -Method "POST" -ContentType "application/json" -Body $payload
    return $result.data.access_token
}

function Write-Step {
    param(
        [string]$Title,
        [string]$Status,
        [string]$Detail
    )

    $emoji = switch ($Status) {
        "ok" { "[OK]" }
        "warn" { "[WARN]" }
        "error" { "[ERROR]" }
        default { "[INFO]" }
    }

    Write-Output "$emoji $Title"
    if ($Detail) {
        Write-Output "      $Detail"
    }
}

try {
    Write-Output "=== KRS Readiness Check ==="
    Write-Output "Base URL: $BaseUrl"

    if (-not $ManagerToken) {
        if ($ManagerEmail -and $ManagerPassword) {
            try {
                $ManagerToken = Login-GetToken -Email $ManagerEmail -Password $ManagerPassword
                Write-Step -Title "Autentikasi manager" -Status "ok" -Detail "Login manager berhasil."
            }
            catch {
                Write-Step -Title "Autentikasi manager" -Status "error" -Detail (Resolve-ApiErrorMessage -Exception $_.Exception)
                throw "Gagal login manager."
            }
        }
        else {
            throw "ManagerToken atau kombinasi ManagerEmail+ManagerPassword wajib diisi."
        }
    }

    if (-not $StudentToken -and $StudentEmail -and $StudentPassword) {
        try {
            $StudentToken = Login-GetToken -Email $StudentEmail -Password $StudentPassword
            Write-Step -Title "Autentikasi mahasiswa" -Status "ok" -Detail "Login mahasiswa berhasil."
        }
        catch {
            Write-Step -Title "Autentikasi mahasiswa" -Status "warn" -Detail (Resolve-ApiErrorMessage -Exception $_.Exception)
        }
    }

    # 1) Cek periode akademik aktif
    $periodsResponse = Invoke-Api -Method "GET" -Path "academic-periods" -Token $ManagerToken
    $periods = @($periodsResponse.data)
    $activePeriod = $periods | Where-Object { $_.is_active -eq $true } | Select-Object -First 1

    if (-not $activePeriod) {
        Write-Step -Title "Periode akademik aktif" -Status "error" -Detail "Tidak ditemukan periode akademik aktif."
        throw "Periode akademik aktif belum ada."
    }

    Write-Step -Title "Periode akademik aktif" -Status "ok" -Detail "ID=$($activePeriod.id_academic_period), Nama=$($activePeriod.name)"

    # 2) Cek sesi KRS open untuk periode aktif
    $sessionsResponse = Invoke-Api -Method "GET" -Path "manager/krs-sessions" -Token $ManagerToken -Query @{
        status = "open"
        id_academic_period = $activePeriod.id_academic_period
        per_page = 50
    }

    $openSessions = @($sessionsResponse.data.data)
    $activeSession = $openSessions | Select-Object -First 1

    if (-not $activeSession) {
        Write-Step -Title "Sesi KRS open" -Status "warn" -Detail "Belum ada sesi open di periode aktif."

        if ($OpenSessionIfMissing) {
            $openPayload = @{
                id_academic_period = [int]$activePeriod.id_academic_period
                notes = "Sesi dibuka otomatis via readiness script"
            }

            if ($WhitelistClassIds -and $WhitelistClassIds.Count -gt 0) {
                $openPayload.classes = @($WhitelistClassIds | ForEach-Object { @{ id_class = [int]$_ } })
            }

            $newSession = Invoke-Api -Method "POST" -Path "manager/krs-sessions" -Token $ManagerToken -Body $openPayload
            $activeSession = $newSession.data

            Write-Step -Title "Buka sesi KRS" -Status "ok" -Detail "Session ID=$($activeSession.id_krs_session)"
        }
    }
    else {
        Write-Step -Title "Sesi KRS open" -Status "ok" -Detail "Session ID=$($activeSession.id_krs_session)"
    }

    # 3) Cek whitelist kelas pada sesi aktif
    if ($activeSession) {
        $sessionClassesResponse = Invoke-Api -Method "GET" -Path "manager/krs-sessions/$($activeSession.id_krs_session)/classes" -Token $ManagerToken -Query @{
            per_page = 100
        }

        $sessionClassItems = @($sessionClassesResponse.data.classes.data)

        if ($sessionClassItems.Count -gt 0) {
            Write-Step -Title "Whitelist kelas sesi" -Status "ok" -Detail "Total kelas terdaftar: $($sessionClassItems.Count)"
        }
        else {
            Write-Step -Title "Whitelist kelas sesi" -Status "warn" -Detail "Belum ada kelas pada sesi KRS ini."
        }

        if ($WhitelistClassIds -and $WhitelistClassIds.Count -gt 0) {
            $existingClassIds = @($sessionClassItems | ForEach-Object { [int]$_.id_class })
            $missingClassIds = @($WhitelistClassIds | Where-Object { $existingClassIds -notcontains [int]$_ })

            if ($missingClassIds.Count -gt 0) {
                $addPayload = @{
                    classes = @($missingClassIds | ForEach-Object { @{ id_class = [int]$_ } })
                }

                $addClassesResponse = Invoke-Api -Method "POST" -Path "manager/krs-sessions/$($activeSession.id_krs_session)/classes" -Token $ManagerToken -Body $addPayload
                Write-Step -Title "Tambah whitelist kelas" -Status "ok" -Detail ($addClassesResponse.message)
            }
            else {
                Write-Step -Title "Tambah whitelist kelas" -Status "ok" -Detail "Semua class ID target sudah ada di whitelist."
            }
        }
    }

    # 4) Cek/Set kuota mahasiswa
    if ($StudentId -gt 0) {
        $quotasResponse = Invoke-Api -Method "GET" -Path "manager/krs-quotas" -Token $ManagerToken -Query @{
            id_academic_period = $activePeriod.id_academic_period
            per_page = 200
        }

        $quotaRows = @($quotasResponse.data.data)
        $studentQuota = $quotaRows | Where-Object { [int]$_.id_user_si -eq [int]$StudentId } | Select-Object -First 1

        if ($studentQuota) {
            Write-Step -Title "Kuota mahasiswa aktif" -Status "ok" -Detail "Quota ID=$($studentQuota.id_krs_quota), Max SKS=$($studentQuota.max_sks)"
        }
        else {
            Write-Step -Title "Kuota mahasiswa aktif" -Status "warn" -Detail "Kuota untuk Student ID=$StudentId belum ada."

            if ($ApplyQuota) {
                $quotaPayload = @{
                    id_user_si = [int]$StudentId
                    id_academic_period = [int]$activePeriod.id_academic_period
                    max_sks = [int]$MaxSks
                    notes = $QuotaNote
                }

                $quotaCreate = Invoke-Api -Method "POST" -Path "manager/krs-quotas" -Token $ManagerToken -Body $quotaPayload
                Write-Step -Title "Set kuota mahasiswa" -Status "ok" -Detail ($quotaCreate.message)
            }
        }
    }
    else {
        Write-Step -Title "Cek kuota mahasiswa" -Status "warn" -Detail "Lewati karena StudentId tidak diberikan."
    }

    # 5) Verifikasi endpoint sisi mahasiswa (opsional jika student token ada)
    if ($StudentToken) {
        try {
            $quotaStudentResponse = Invoke-Api -Method "GET" -Path "student/krs/quota" -Token $StudentToken
            Write-Step -Title "Endpoint mahasiswa: /student/krs/quota" -Status "ok" -Detail ($quotaStudentResponse.message)
        }
        catch {
            Write-Step -Title "Endpoint mahasiswa: /student/krs/quota" -Status "error" -Detail (Resolve-ApiErrorMessage -Exception $_.Exception)
        }

        try {
            $classesStudentResponse = Invoke-Api -Method "GET" -Path "student/krs/available-classes" -Token $StudentToken
            $subjects = @($classesStudentResponse.data.subjects)
            Write-Step -Title "Endpoint mahasiswa: /student/krs/available-classes" -Status "ok" -Detail ("Total subject tersedia: " + $subjects.Count)
        }
        catch {
            Write-Step -Title "Endpoint mahasiswa: /student/krs/available-classes" -Status "error" -Detail (Resolve-ApiErrorMessage -Exception $_.Exception)
        }
    }
    else {
        Write-Step -Title "Verifikasi endpoint mahasiswa" -Status "warn" -Detail "Lewati karena StudentToken tidak diberikan."
    }

    Write-Output "=== Selesai ==="
}
catch {
    Write-Output "=== Gagal ==="
    Write-Output (Resolve-ApiErrorMessage -Exception $_.Exception)
    exit 1
}
