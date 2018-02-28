import { Asset, FileSystem, SQLite } from 'expo'

const dbAsset = Asset.fromModule(require('../../assets/stm.db'))

const dbPath = `${FileSystem.documentDirectory}SQLite/stm.db`

const conn = {}

const Console = console

const makeSQLiteDirAsync = async () => {
  const dbTest = SQLite.openDatabase('dummy.db')

  try {
    await dbTest.transaction(tx => tx.executeSql(''))
  } catch (e) {
    Console.error('error while executing SQL in dummy DB')
    Console.error(e.message)
  }
}

export const setUpDatabase = async () => {
  Console.log('Setting up database connection')
  await makeSQLiteDirAsync()

  const { exists } = await FileSystem.getInfoAsync(dbPath)
  Console.log(`Database exists in ${dbPath}: ${exists}`)
  if (!exists) {
    await FileSystem.downloadAsync(dbAsset.uri, dbPath)
  }
  conn.db = SQLite.openDatabase('stm.db')
}

const executeSql = (query, args) =>
  new Promise(async (resolve, reject) => {
    if (!conn.db) {
      await setUpDatabase()
    }

    Console.log(`Running query on database ${query} : ${args}`)
    return conn.db.transaction(tx =>
      tx.executeSql(query, args, (_, res) => resolve(res), (_, error) => reject(error)))
  })

export const createTables = async () => {
  try {
    await executeSql('drop table FAVORITES;')
    Console.log('Dropped FAVORITES table successfully')
  } catch (error) {
    Console.error(error)
  }

  try {
    await executeSql('create table if not exists FAVORITES (COD_UBIC_P integer not null, DESC_LINEA text not null, primary key (COD_UBIC_P, DESC_LINEA));')
    Console.log('Created FAVORITES table successfully')
  } catch (error) {
    Console.error(error)
  }
}

export default {
  executeSql
}
