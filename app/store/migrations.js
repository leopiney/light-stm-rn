// @flow
import db from "./db";

console.log("Defining Migrations module");

export const runMigrations = async () => {
  await db.executeSql(
    "create table if not exists BUS_STOP_VARIANTS (COD_UBIC_P integer primary key, VARIANTS_JSON text not null, VARIANTS_CODES_UPDATED_AT datetime null);"
  );
  console.log("Created BUS_STOP_VARIANTS table successfully");
  await db.executeSql(
    "create table if not exists FAVORITES (COD_UBIC_P integer not null, DESC_LINEA text not null, VARIANTS_CODES text null, VARIANTS_DESCRIPTIONS text null, primary key (COD_UBIC_P, DESC_LINEA));"
  );
  console.log("Created FAVORITES table successfully");
};

export const rollbackMigrations = async () => {
  await db.executeSql("drop table if exists BUS_STOP_VARIANTS");
  console.log("Dropped BUS_STOP_VARIANTS table successfully");
  await db.executeSql("drop table if exists FAVORITES");
  console.log("Dropped FAVORITES table successfully");
};
