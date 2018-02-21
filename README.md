# Light STM

This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

Below you'll find information about performing common tasks. The most recent version of this guide is available [here](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md).

## STM MVD "lent" data

1. Download [STM MVD APK](https://apkpure.com/stm-mvd/com.matungos.stm.mvd)
2. Rename downloaded file and add `.zip` extention.
3. Open the console and `sudo unzip STM*.apk.zip`
4. Unzip `unzip assets/stm.zip`
5. Now you have the database `stm.sqlite3` :party-parrot:

## CUCTSA API

Service reference: http://mobileapps.movistar.com.uy/ibus/IBus.svc?wsdl

* All bust stops: http://mobileapps.movistar.com.uy/ibus/ibus.svc/getBusStops2/1970-01-01
* http://mobileapps.movistar.com.uy/ibus/ibus.svc/getBusLocation/1008 <bus-unit-id>
* http://mobileapps.movistar.com.uy/ibus/ibus.svc/getBusPath/628 <route-variant-id>
* http://mobileapps.movistar.com.uy/ibus/ibus.svc/getStopPrediction/3363/116 <bus-stop>/<line-number>

## Montevideo STM API

* Reference: http://www.montevideo.gub.uy/institucional/montevideo-abierto/datos-abiertos
* Github: https://github.com/dti-montevideo/servicios-abiertos
* Host: https://m.montevideo.gub.uy
* User-Agent: okhttp/3.8.0

### Bus stop lines

_Request_

GET `/transporteRest/variantes/{parada-id}`

_Response_

```
{
  descripcion: string,
  destinos: Array<{
    destino-codigo: destino-nombre
  }>,
  variantes: Array<{
    linea-codigo: Array<destino-codigo>
  }>,
  lineas: Array<{
    linea-codigo: linea-nombre
  }>
}
```

### Realtime - nextETA on a specific set of target locations

_Request_

POST `/stmonlineRest/nextETA`

```
{
  parada: parada-id,
  variante: Array<destino-codigo>
}
```

_Response_

```
{
  type: "FeatureCollection",
  features: Array<{
    type: "Feature",
    properties: {
      codigoBus: number,
      codigoEmpresa: number,
      variante: destino-codigo,
      eta: number,
      dist: number,
      pos: number,
    },
    geometry: {
      type: "Point",
      coordinates: Array<number>(2)
    }
  }>
}
```
