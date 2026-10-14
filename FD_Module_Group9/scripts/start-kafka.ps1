param([Parameter(Mandatory=$true)][string]$KafkaHome)
$ErrorActionPreference='Stop'
$kafkaRoot=(Resolve-Path -LiteralPath $KafkaHome).Path
$libraries=Join-Path $kafkaRoot 'libs/*'
if (!(Get-ChildItem -LiteralPath (Join-Path $kafkaRoot 'libs') -Filter 'kafka_*.jar')) { throw 'KafkaHome must point to an extracted Apache Kafka binary distribution (tested broker family: 3.9.x).' }
$projectRoot=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$runtimeDir=Join-Path $projectRoot 'runtime'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$dataDir=Join-Path $runtimeDir 'kafka-data'
$configFile=Join-Path $runtimeDir 'kafka-local.properties'
$config=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'kafka-local.properties') -Raw
$config=$config.Replace('log.dirs=./fd-kafka-data',('log.dirs='+$dataDir.Replace('\','/')))
Set-Content -LiteralPath $configFile -Value $config -Encoding ascii
# Format a new development store once; preserve existing broker data on restart.
if (!(Test-Path -LiteralPath (Join-Path $dataDir 'meta.properties'))) {
 $clusterId=(& java -cp $libraries kafka.tools.StorageTool random-uuid | Select-Object -Last 1)
 if ($LASTEXITCODE -ne 0) { throw 'Kafka cluster ID generation failed. Check Java 25.' }
 & java -cp $libraries kafka.tools.StorageTool format -t $clusterId -c $configFile
 if ($LASTEXITCODE -ne 0) { throw 'Kafka storage format failed.' }
}
Write-Output 'Starting Kafka on localhost:9092. Keep this terminal open; Ctrl+C stops this broker.'
& java -cp $libraries kafka.Kafka $configFile
if ($LASTEXITCODE -ne 0) { throw 'Kafka exited with an error.' }
