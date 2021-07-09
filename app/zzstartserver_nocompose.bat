@echo off
DEL zzserverdacanc.js
rm zzserverdacanc.js
node zznodockercompose.js > zzserverdacanc.js
node zzserverdacanc.js