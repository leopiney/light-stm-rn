import { Asset, FileSystem, SQLite } from 'expo'

const dbAsset = Asset.fromModule(require('../../assets/stm.db'))

const dbPath = `${FileSystem.documentDirectory}SQLite/stm_local.db`

const conn = {}

const Console = console

export const setUpDatabase = async () => {
  Console.log('Setting up database connection')
  const { exists } = FileSystem.getInfoAsync(dbPath)
  if (!exists) {
    await FileSystem.downloadAsync(dbAsset.uri, dbPath)
  }
  conn.db = SQLite.openDatabase('stm_local.db')
}

export default {
  executeSql: (query, args) =>
    new Promise(async (resolve, reject) => {
      if (!conn.db) {
        await setUpDatabase()
      }

      Console.log(`Running query on database ${query} : ${args}`)
      return conn.db.transaction(tx =>
        tx.executeSql(query, args, (_, res) => resolve(res), (_, error) => reject(error)))
    })
}
