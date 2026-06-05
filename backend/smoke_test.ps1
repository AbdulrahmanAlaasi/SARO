$ErrorActionPreference = "Stop"
$api = "http://127.0.0.1:8000/api"
function Login($u) {
  (Invoke-RestMethod "$api/auth/login/" -Method Post -Body (@{username=$u;password="Passw0rd!23"}|ConvertTo-Json) -ContentType "application/json").access
}
function Hdr($t) { @{ Authorization = "Bearer $t" } }

$cust = Login "customer1"; $admin = Login "admin1"; $drv = Login "driver1"

$body = @{delivery_method="home";priority="normal";package_description="Test box"} | ConvertTo-Json
$o = Invoke-RestMethod "$api/orders/" -Method Post -Headers (Hdr $cust) -Body $body -ContentType "application/json"
Write-Host "created order #$($o.id) status=$($o.status)"

$rec = Invoke-RestMethod "$api/dispatch/recommend/" -Method Post -Headers (Hdr $admin) -Body (@{order=$o.id}|ConvertTo-Json) -ContentType "application/json"
Write-Host "recommended=$($rec.recommendation.driver_name) score=$($rec.recommendation.score)"

$as = Invoke-RestMethod "$api/orders/$($o.id)/assign/" -Method Post -Headers (Hdr $admin) -Body (@{driver=$rec.recommendation.recommended_driver}|ConvertTo-Json) -ContentType "application/json"
Write-Host "assigned status=$($as.status) driver=$($as.driver_name)"

# log in as the actually-assigned driver (proves dispatch + ownership rules)
$drv = Login $as.driver_name
foreach ($s in "picked_up","in_transit","delivered") {
  $r = Invoke-RestMethod "$api/orders/$($o.id)/status/" -Method Post -Headers (Hdr $drv) -Body (@{status=$s}|ConvertTo-Json) -ContentType "application/json"
}
Write-Host "driver moved order to $($r.status)"

$rate = Invoke-RestMethod "$api/orders/$($o.id)/rate/" -Method Post -Headers (Hdr $cust) -Body (@{stars=5;comment="Great"}|ConvertTo-Json) -ContentType "application/json"
Write-Host "rated stars=$($rate.stars)"

$k = Invoke-RestMethod "$api/reports/kpis/" -Headers (Hdr $admin)
Write-Host "KPIs total=$($k.total_orders) delivered=$($k.delivered) avg_rating=$($k.avg_rating)"
Write-Host "ALL OK"
