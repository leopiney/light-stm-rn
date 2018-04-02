// @flow
import db from '../store/db'

import { getStopVariants, getStopNextETAs } from './mvd'
import type { StopVariants, FavoriteBusStop, LineVariants } from '../utils/types'

export default {
  addFavorite: async (stopId: number, lineDesc: string, variants: StopVariants) => {
    const lineCode = Object.keys(variants.lines).find(code => variants.lines[code] === lineDesc)

    let variantsCodes = []
    let variantsDescriptions = {}

    if (lineCode) {
      variantsCodes = variants.variants[lineCode]
      variantsDescriptions = variants.variants[lineCode].reduce(
        (obj, code) =>
          Object.assign(obj, { [code]: variants.variantsDescriptions[code.toString()] }),
        {}
      )
    }

    const { rowsAffected } = await db.executeSql(
      'insert into FAVORITES (COD_UBIC_P, DESC_LINEA, VARIANTS_CODES, VARIANTS_DESCRIPTIONS) values (?, ?, ?, ?)',
      [stopId, lineDesc, JSON.stringify(variantsCodes), JSON.stringify(variantsDescriptions)]
    )
    console.log(`Inserted favorite ${stopId}/${lineDesc} with result ${rowsAffected}`)
  },
  getOrUpdateStopVariants: async (stopId: number) => {
    const { rows: { length, _array } } = await db.executeSql('select COD_UBIC_P, VARIANTS_JSON, VARIANTS_CODES_UPDATED_AT from BUS_STOP_VARIANTS;')
    let stopVariants = {}

    if (length === 0) {
      stopVariants = await getStopVariants(stopId)
      await db.executeSql(
        'insert into BUS_STOP_VARIANTS (COD_UBIC_P, VARIANTS_JSON, VARIANTS_CODES_UPDATED_AT) values (?, ?, ?);',
        [stopId, JSON.stringify(stopVariants), new Date()]
      )
    } else {
      // TODO: Update if VARIANTS_CODES_UPDATED_AT > 10 days
      // const { VARIANTS_JSON, VARIANTS_CODES_UPDATED_AT } = _array[0]
      const { VARIANTS_JSON } = _array[0]

      stopVariants = JSON.parse(VARIANTS_JSON)
    }

    return stopVariants
  },
  getFavorites: async () => {
    const { rows: { _array } } = await db.executeSql('select COD_UBIC_P, DESC_LINEA, VARIANTS_CODES, VARIANTS_DESCRIPTIONS, LAT, LONG from FAVORITES join BUS_STOP on ID = COD_UBIC_P;')

    const favoriteStops: Array<FavoriteBusStop> = [
      ...new Set(_array.map(({ COD_UBIC_P, LAT, LONG }) => ({
        COD_UBIC_P,
        LAT,
        LONG
      })))
    ]

    const favoriteStopsLines: { [number]: Array<LineVariants> } = _array.reduce(
      (acc, {
        COD_UBIC_P, DESC_LINEA, VARIANTS_CODES, VARIANTS_DESCRIPTIONS
      }) =>
        Object.assign(acc, {
          [COD_UBIC_P]: acc[COD_UBIC_P]
            ? [
              ...acc[COD_UBIC_P],
              {
                line: DESC_LINEA,
                variantsCodes: JSON.parse(VARIANTS_CODES),
                variantsDescriptions: JSON.parse(VARIANTS_DESCRIPTIONS)
              }
            ]
            : [
              {
                line: DESC_LINEA,
                variantsCodes: JSON.parse(VARIANTS_CODES),
                variantsDescriptions: JSON.parse(VARIANTS_DESCRIPTIONS)
              }
            ]
        }),
      {}
    )

    return [favoriteStops, favoriteStopsLines]
  },
  getFavoriteNextETAs: async (stopId: number, linesVariants: LineVariants[]) => {
    const allVariantsCodes: number[] = linesVariants.reduce(
      (acc, s) => [...acc, ...s.variantsCodes],
      []
    )
    const nextETAs = await getStopNextETAs(stopId, allVariantsCodes)
    console.log(`Got all nextETAs for stop ${stopId}: ${JSON.stringify(nextETAs)}`)
    console.log(`Current lines variants: ${JSON.stringify(linesVariants)}`)

    return nextETAs.map((v) => {
      const lineVariants =
        linesVariants.find(s => s.variantsCodes.includes(v.properties.variante)) || {}
      console.log(`Got line variants for nextETA with variant ${v.properties.variante}: ${JSON.stringify(lineVariants)}`)

      return {
        coordinates: {
          latitude: v.geometry.coordinates[1],
          longitude: v.geometry.coordinates[0]
        },
        dist: v.properties.dist,
        eta: v.properties.eta,
        line: lineVariants.line,
        variantCode: v.properties.variante,
        variantDesc: lineVariants.variantsDescriptions[v.properties.variante]
      }
    })
  }
}
