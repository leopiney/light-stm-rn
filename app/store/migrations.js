// @flow
import db from './db'

console.log('Defining Migrations module')

export const runMigrations = async () => {
  await db.executeSql('create table if not exists FAVORITES (COD_UBIC_P integer not null, DESC_LINEA text not null, primary key (COD_UBIC_P, DESC_LINEA));')
  console.log('Created FAVORITES table successfully')
}

export const rollbackMigrations = async () => {
  await db.executeSql('drop table if exists FAVORITES')
  console.log('Dropped FAVORITES table successfully')
}
