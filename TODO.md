# TODOs

1. Get ETAs from API.

   > http https://m.montevideo.gub.uy/transporteRest/variantes/2401

   variantsCodes = [
   3027,
   1422,
   1418,
   2233,
   1420,
   7614,
   7440
   ]

   > echo '{ "parada": 2401, "variante": [ 3027, 1422, 1418, 2233, 1420, 7614, 7440 ] }' | http POST https://m.montevideo.gub.uy/stmonlineRest/nextETA

2) Show already selected stops for line in lineMap.
