param(
    [string]$OutDir = (Join-Path $PSScriptRoot '..\public\icons')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function New-Icon {
    param(
        [int]$Size,
        [string]$Path,
        [switch]$FullBleed
    )

    $bmp = [System.Drawing.Bitmap]::new($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $green = [System.Drawing.Color]::FromArgb(255, 34, 197, 94)
    $greenDark = [System.Drawing.Color]::FromArgb(255, 21, 128, 61)
    $white = [System.Drawing.Color]::White
    $amber = [System.Drawing.Color]::FromArgb(255, 245, 158, 11)

    $s = [float]$Size
    $radius = 0.22 * $s

    if ($FullBleed) {
        $bgBrush = [System.Drawing.SolidBrush]::new($green)
        $g.FillRectangle($bgBrush, 0, 0, $s, $s)
        $bgBrush.Dispose()
    } else {
        $rounded = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $null = $rounded.AddArc(0, 0, 2 * $radius, 2 * $radius, 180, 90)
        $null = $rounded.AddArc($s - 2 * $radius, 0, 2 * $radius, 2 * $radius, 270, 90)
        $null = $rounded.AddArc($s - 2 * $radius, $s - 2 * $radius, 2 * $radius, 2 * $radius, 0, 90)
        $null = $rounded.AddArc(0, $s - 2 * $radius, 2 * $radius, 2 * $radius, 90, 90)
        $null = $rounded.CloseFigure()
        $bgBrush = [System.Drawing.SolidBrush]::new($green)
        $g.FillPath($bgBrush, $rounded)
        $bgBrush.Dispose()
        $rounded.Dispose()
    }

    $scale = $s / 512.0
    $cx = 256 * $scale
    $cy = 276 * $scale
    $halfW = 150 * $scale
    $pageH = 96 * $scale
    $tilt = 26 * $scale

    $leftPage = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(($cx - $halfW), ($cy - $pageH + $tilt)),
        [System.Drawing.PointF]::new(($cx - 8 * $scale), ($cy - $pageH - $tilt)),
        [System.Drawing.PointF]::new(($cx - 8 * $scale), ($cy + $pageH - $tilt)),
        [System.Drawing.PointF]::new(($cx - $halfW), ($cy + $pageH + $tilt))
    )
    $rightPage = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(($cx + $halfW), ($cy - $pageH + $tilt)),
        [System.Drawing.PointF]::new(($cx + 8 * $scale), ($cy - $pageH - $tilt)),
        [System.Drawing.PointF]::new(($cx + 8 * $scale), ($cy + $pageH - $tilt)),
        [System.Drawing.PointF]::new(($cx + $halfW), ($cy + $pageH + $tilt))
    )

    $shadowBrush = [System.Drawing.SolidBrush]::new($greenDark)
    $g.TranslateTransform(0, 10 * $scale)
    $g.FillPolygon($shadowBrush, $leftPage)
    $g.FillPolygon($shadowBrush, $rightPage)
    $g.ResetTransform()

    $pageBrush = [System.Drawing.SolidBrush]::new($white)
    $g.FillPolygon($pageBrush, $leftPage)
    $g.FillPolygon($pageBrush, $rightPage)
    $pageBrush.Dispose()

    $lineColor = [System.Drawing.Color]::FromArgb(255, 148, 163, 184)
    $linePen = [System.Drawing.Pen]::new($lineColor, [Math]::Max(2.0, 6 * $scale))
    foreach ($i in 0..3) {
        $lineY = ($cy - $pageH + $tilt) + (22 + $i * 18) * $scale
        $g.DrawLine($linePen, ($cx - $halfW + 18 * $scale), $lineY, ($cx - 24 * $scale), $lineY)
        $g.DrawLine($linePen, ($cx + 24 * $scale), $lineY, ($cx + $halfW - 18 * $scale), $lineY)
    }
    $linePen.Dispose()

    $spinePen = [System.Drawing.Pen]::new($greenDark, [Math]::Max(3.0, 12 * $scale))
    $g.DrawLine($spinePen, $cx, ($cy - $pageH - $tilt), $cx, ($cy + $pageH - $tilt))
    $spinePen.Dispose()

    $sunRadius = 34 * $scale
    $sunX = $cx + $halfW + 10 * $scale
    $sunY = $cy - $pageH - $tilt - $sunRadius - 12 * $scale
    $sunBrush = [System.Drawing.SolidBrush]::new($amber)
    $g.FillEllipse($sunBrush, ($sunX - $sunRadius), ($sunY - $sunRadius), (2 * $sunRadius), (2 * $sunRadius))
    $sunBrush.Dispose()

    $g.Dispose()
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

New-Icon -Size 192 -Path (Join-Path $OutDir 'icon-192.png')
New-Icon -Size 512 -Path (Join-Path $OutDir 'icon-512.png')
New-Icon -Size 512 -Path (Join-Path $OutDir 'maskable-512.png') -FullBleed
New-Icon -Size 180 -Path (Join-Path $OutDir 'apple-touch-icon.png') -FullBleed

Write-Output "Iconen gegenereerd in $OutDir"
