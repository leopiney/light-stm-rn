// @flow

export type FavoriteBusStop = {
  COD_UBIC_P: number,
  LAT: number,
  LONG: number
};

export type BusStop = {
  COD_UBIC_P: number,
  DESC_LINEA: string,
  LAT: number,
  LONG: number
};

export type LineVariants = {
  line: string,
  variantsCodes: number[],
  variantsDescriptions: string[]
};

export type StopVariants = {
  description: string,
  variantsDescriptions: { [string]: string },
  lines: { [string]: string },
  variants: { [string]: number[] }
};

export type NextETA = {
  type: "Feature",
  properties: {
    codigoBus: number,
    codigoEmpresa: number,
    variante: number,
    eta: number,
    dist: number,
    pos: number
  },
  geometry: {
    type: "Point",
    coordinates: [number, number]
  }
};

export type NextETAs = {
  type: "FeatureCollection",
  features: NextETA[]
};

export type BusETA = {
  code: number,
  coordinates: {
    latitude: number,
    longitude: number
  },
  dist: number,
  eta: number,
  line: string,
  variantCode: number,
  variantDesc: string
};
