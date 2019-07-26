// @flow
import * as FileSystem from "expo-file-system";

import { Asset } from "expo-asset";
import { SQLite } from "expo-sqlite";

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
    const dbAsset = Asset.fromModule(require("../../assets/stm.db"));
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
    _array: Object[]
  }
};

export default {
  executeSql(
    query: string,
    args: (number | string)[] = []
  ): Promise<sqlResponse> {
    return new Promise(async (resolve, reject) => {
      if (!conn.db) {
        await setUpDatabase();
      }

      console.log(
        `Running query on database ${query} : ${JSON.stringify(args)}`
      );
      if (conn.db) {
        console.log("Running query on DB");
        conn.db.transaction(
          tx => {
            console.log("Running inside transaction");
            return tx.executeSql(
              query,
              args || [],
              (_, res) => resolve(res),
              (_, error) => reject(error)
            );
          },
          error => console.error(`Transaction finished with error: ${error}`),
          msg => console.log(`Transaction finished: ${msg}`)
        );
      }
    });
  }
};
