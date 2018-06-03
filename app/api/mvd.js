// @flow
import type { StopVariants, NextETA, NextETAs } from "../utils/types";

const BASE_URL = "https://m.montevideo.gub.uy";
const USER_AGENT = "okhttp/3.8.0";

const fetchAPI = async (url: string, options: Object = {}) => {
  const opts = options;

  if (!opts.headers) {
    opts.headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT
    };
  } else {
    opts.Accept = "application/json";
    opts.headers["Content-Type"] = "application/json";
    opts.headers["User-Agent"] = USER_AGENT;
  }

  console.log(
    `Fetching url: ${`${BASE_URL}/${url}`} with options ${JSON.stringify(opts)}`
  );
  const data = await fetch(`${BASE_URL}/${url}`, opts);
  return data.json();
};

type StopVariantsAPI = {
  descripcion: string,
  destinos: { [string]: string },
  lineas: { [string]: string },
  variantes: { [string]: number[] }
};

export const getStopVariants = async (
  stopId: number
): Promise<StopVariants> => {
  console.log(`Getting variants for stop ${stopId}`);
  const data: StopVariantsAPI = await fetchAPI(
    `transporteRest/variantes/${stopId}`
  );

  return {
    description: data.descripcion,
    variantsDescriptions: data.destinos,
    lines: data.lineas,
    variants: data.variantes
  };
};

export const getStopNextETAs = async (
  stopId: number,
  variantsCodes: number[]
): Promise<NextETA[]> => {
  console.log(
    `Asking next ETAs for stop ${stopId} with variants ${JSON.stringify(
      variantsCodes
    )}`
  );
  const data: NextETAs = await fetchAPI("stmonlineRest/nextETA", {
    method: "POST",
    body: JSON.stringify({
      parada: stopId,
      variante: variantsCodes
    })
  });

  return data.features;
};
