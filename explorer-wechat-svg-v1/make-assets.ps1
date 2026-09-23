param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path $PSScriptRoot '..\explorer-long-scroll-demo\assets'
$targetDir = Join-Path $PSScriptRoot 'assets'
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -EQ 'image/jpeg' | Select-Object -First 1

function Export-Jpeg {
  param([string]$Name, [int]$Width, [int]$Height, [int]$CropX = -1, [int]$Quality = 80)
  $source = Join-Path $sourceDir "$Name.png"
  $target = Join-Path $targetDir "$Name.jpg"
  $image = [System.Drawing.Image]::FromFile($source)
  try {
    $sourceRatio = $Width / $Height
    $cropHeight = $image.Height
    $cropWidth = [int][Math]::Round($cropHeight * $sourceRatio)
    if ($cropWidth -gt $image.Width) {
      $cropWidth = $image.Width
      $cropHeight = [int][Math]::Round($cropWidth / $sourceRatio)
    }
    if ($CropX -lt 0) { $CropX = [int](($image.Width - $cropWidth) / 2) }
    $CropX = [Math]::Max(0, [Math]::Min($CropX, $image.Width - $cropWidth))
    $cropY = [int](($image.Height - $cropHeight) / 2)
    $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($image, [System.Drawing.Rectangle]::new(0, 0, $Width, $Height), [System.Drawing.Rectangle]::new($CropX, $cropY, $cropWidth, $cropHeight), [System.Drawing.GraphicsUnit]::Pixel)
        $fadeHeight = [Math]::Min(260, [int]($Height / 4))
        $navy = [System.Drawing.Color]::FromArgb(255, 6, 19, 35)
        $clearNavy = [System.Drawing.Color]::FromArgb(0, 6, 19, 35)
        if ($Name -ne 'entry') {
          $topFade = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(0, 0), [System.Drawing.Point]::new(0, $fadeHeight), $navy, $clearNavy)
          try { $graphics.FillRectangle($topFade, 0, 0, $Width, $fadeHeight) } finally { $topFade.Dispose() }
        }
        $bottomFade = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(0, $Height - $fadeHeight), [System.Drawing.Point]::new(0, $Height), $clearNavy, $navy)
        try { $graphics.FillRectangle($bottomFade, 0, $Height - $fadeHeight, $Width, $fadeHeight) } finally { $bottomFade.Dispose() }
      } finally { $graphics.Dispose() }
      $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
      try {
        $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
        $bitmap.Save($target, $encoder, $parameters)
      } finally { $parameters.Dispose() }
    } finally { $bitmap.Dispose() }
    $size = [Math]::Round((Get-Item -LiteralPath $target).Length / 1KB)
    Write-Output "$Name.jpg  ${Width}x${Height}  ${size}KB"
  } finally { $image.Dispose() }
}

Export-Jpeg entry 900 1600 -1 80
Export-Jpeg cover 900 1100 760 80
Export-Jpeg stars 900 1100 790 80
Export-Jpeg climb 900 1100 800 80
Export-Jpeg run 900 1100 790 80
Export-Jpeg story-outdoor 720 1080 -1 80
Export-Jpeg story-design 720 1080 -1 80
Export-Jpeg story-coffee 720 1080 -1 80
Export-Jpeg ending-light-trails 900 600 -1 80
