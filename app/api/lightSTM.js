import * as SecureStore from "expo-secure-store";

import type {
  BusETA,
  FavoriteBusStop,
  LineVariants,
  StopVariants
} from "../utils/types";
import { getStopNextETAs, getStopVariants } from "./mvd";

// @flow
import db from "../store/db";

export const addFavorite = async (
  stopId: number,
  lineDesc: string,
  variants: StopVariants
) => {
  // Find the code for this line using the description
  const lineCode = Object.keys(variants.lines).find(
    code => variants.lines[code] === lineDesc
  );

  let variantsCodes = [];
  let variantsDescriptions = {};

  if (lineCode) {
    // Get the variants codes for this line
    variantsCodes = variants.variants[lineCode];

    // For each variant code, get the varian description
    variantsDescriptions = variants.variants[lineCode].reduce(
      (obj, code) =>
        Object.assign(obj, {
          [code]: variants.variantsDescriptions[code.toString()]
        }),
      {}
    );
  }

  const { rowsAffected } = await db.executeSql(
    "insert into FAVORITES (COD_UBIC_P, DESC_LINEA, VARIANTS_CODES, VARIANTS_DESCRIPTIONS) values (?, ?, ?, ?)",
    [
      stopId,
      lineDesc,
      JSON.stringify(variantsCodes),
      JSON.stringify(variantsDescriptions)
    ]
  );

  SecureStore.setItemAsync("app.onboardingFinished", "true");
  console.log(
    `Inserted favorite ${stopId}/${lineDesc} with result ${rowsAffected}`
  );
};

export const removeFavorite = async (stopId: number) => {
  const { rowsAffected } = await db.executeSql(
    "delete from FAVORITES where COD_UBIC_P = ?;",
    [stopId]
  );
  console.log(`Deleted favorite ${stopId} with result ${rowsAffected}`);
};

export const getOrUpdateStopVariants = async (stopId: number) => {
  const {
    rows: { length, _array }
  } = await db.executeSql(
    "select COD_UBIC_P, VARIANTS_JSON, VARIANTS_CODES_UPDATED_AT from BUS_STOP_VARIANTS where COD_UBIC_P = ?;",
    [stopId]
  );
  let stopVariants = {};

  if (length === 0) {
    stopVariants = await getStopVariants(stopId);
    await db.executeSql(
      "insert into BUS_STOP_VARIANTS (COD_UBIC_P, VARIANTS_JSON, VARIANTS_CODES_UPDATED_AT) values (?, ?, ?);",
      [stopId, JSON.stringify(stopVariants), new Date().toISOString()]
    );
  } else {
    // TODO: Update if VARIANTS_CODES_UPDATED_AT > 10 days
    // const { VARIANTS_JSON, VARIANTS_CODES_UPDATED_AT } = _array[0]
    const { VARIANTS_JSON } = _array[0];

    stopVariants = JSON.parse(VARIANTS_JSON);
  }

  return stopVariants;
};

export const getFavorites = async () => {
  const {
    rows: { _array }
  } = await db.executeSql(
    "select COD_UBIC_P, DESC_LINEA, VARIANTS_CODES, VARIANTS_DESCRIPTIONS, LAT, LONG from FAVORITES join BUS_STOP on ID = COD_UBIC_P;"
  );

  const favoriteStops: FavoriteBusStop[] = [];
  const uniqueStopsIds = new Set();

  for (const { COD_UBIC_P, LAT, LONG } of _array) {
    if (!uniqueStopsIds.has(COD_UBIC_P)) {
      uniqueStopsIds.add(COD_UBIC_P);
      favoriteStops.push({
        COD_UBIC_P,
        LAT,
        LONG
      });
    }
  }

  const favoriteStopsLines: { [number]: LineVariants[] } = _array.reduce(
    (acc, { COD_UBIC_P, DESC_LINEA, VARIANTS_CODES, VARIANTS_DESCRIPTIONS }) =>
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
  );

  return [favoriteStops, favoriteStopsLines];
};

export const getFavoriteNextETAs = async (
  stopId: number,
  linesVariants: LineVariants[]
): Promise<BusETA[]> => {
  const allVariantsCodes: number[] = linesVariants.reduce(
    (acc, s) => [...acc, ...s.variantsCodes],
    []
  );
  const nextETAs = await getStopNextETAs(stopId, allVariantsCodes);
  console.log(
    `Got all nextETAs for stop ${stopId}: ${JSON.stringify(nextETAs)}`
  );
  console.log(`Current lines variants: ${JSON.stringify(linesVariants)}`);

  return nextETAs.map(v => {
    const lineVariants =
      linesVariants.find(s =>
        s.variantsCodes.includes(v.properties.variante)
      ) || {};
    console.log(
      `Got line variants for nextETA with variant ${
        v.properties.variante
      }: ${JSON.stringify(lineVariants)}`
    );

    return {
      code: v.properties.codigoBus,
      coordinates: {
        latitude: v.geometry.coordinates[1],
        longitude: v.geometry.coordinates[0]
      },
      dist: v.properties.dist,
      eta: v.properties.eta,
      line: lineVariants.line,
      variantCode: v.properties.variante,
      variantDesc: lineVariants.variantsDescriptions[v.properties.variante]
    };
  });
};
