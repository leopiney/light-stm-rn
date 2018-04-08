// @flow
import { Asset, FileSystem, SQLite } from "expo";

const dbAsset = Asset.fromModule(require("../../assets/stm.db"));

const dbPath = `${FileSystem.documentDirectory}SQLite/stm.db`;

type connection = {
  db?: {
    transaction: (
      callback: Function,
      error?: Function,
      success?: Function
    ) => void
  }
};
const conn: connection = {};

const makeSQLiteDirAsync = async () => {
  const dbTest = SQLite.openDatabase("dummy.db");

  try {
    await dbTest.transaction(tx => tx.executeSql(""));
  } catch (e) {
    console.error("Error while executing SQL in dummy DB");
    console.error(e.message);
  }
};

export const setUpDatabase = async () => {
  console.log("Setting up database connection");
  await makeSQLiteDirAsync();

  //
  // Ref: https://github.com/expo/test-suite/blob/master/tests/SQLite.js
  //
  const { exists } = await FileSystem.getInfoAsync(dbPath);
  console.log(`Database exists in ${dbPath}: ${exists}`);
  if (!exists) {
    await FileSystem.downloadAsync(dbAsset.uri, dbPath);
  }

  conn.db = SQLite.openDatabase("stm.db");
  console.log("Database connection stablished");
};

type sqlResponse = {
  insertId: number,
  rowsAffected: number,
  rows: {
    length: number,
    item: number => Object,
    _array: Array<Object>
  }
};

export default {
  executeSql(
    query: string,
    args: Array<number | string> = []
  ): Promise<sqlResponse> {
    return new Promise(async (resolve, reject) => {
      if (!conn.db) {
        await setUpDatabase();
      }

      console.log(
        `Running query on database ${query} : ${JSON.stringify(args)}`
      );
      if (conn.db) {
        conn.db.transaction(tx =>
          tx.executeSql(
            query,
            args || [],
            (_, res) => resolve(res),
            (_, error) => reject(error)
          )
        );
      }
    });
  }
};
