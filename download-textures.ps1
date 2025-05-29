$urls = @(
    @{
        url = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
        output = "public/earth-day.jpg"
    },
    @{
        url = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg"
        output = "public/earth-normal.jpg"
    },
    @{
        url = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg"
        output = "public/earth-roughness.jpg"
    },
    @{
        url = "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png"
        output = "public/earth-clouds.jpg"
    }
)

foreach ($item in $urls) {
    Write-Host "Downloading $($item.url) to $($item.output)"
    Invoke-WebRequest -Uri $item.url -OutFile $item.output
} 