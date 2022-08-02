import { readFileSync, writeFileSync } from "node:fs";

function prepareInput(path) {
  const buffer = readFileSync(path);
  if (!buffer) throw Error("Failed to read sql file!");

  // const tempStr = buffer.toString().replace(/\s/g, "");
  const tempStr = buffer.toString();
  let strArr = [];
  if (tempStr.includes("VALUE")) {
    strArr = tempStr.split("VALUES");
  } else if (tempStr.includes("values")) {
    strArr = tempStr.split("values");
  } else {
    throw Error("No VALUES for INSERT statement!");
  }

  return {
    insert: strArr[0],
    input: strArr[1].replace(/\s/g, "").split("),"),
  };
}

// Remove the first column INSERT INTO statement
function rmFirstColInsertStm(insertStm) {
  const words = insertStm.split(" ").filter(el => !!el);
  const colNames = words.filter((col) =>
    [",", "(", ")"].some((sym) => col.includes(sym))
  );
  colNames.shift();

  const columns = "(" + colNames.join(" ");
  const insert = words.slice(0, 3).join(" ");

  return insert + " " + columns;
}

function rmFirstCol() {
  const { insert, input } = prepareInput("./input.sql");
  const insertStt = rmFirstColInsertStm(insert);
  const temp = input
    .map((item) => {
      const arr = item.split(",");
      const newItem = arr
        .reduce((acc, el, idx) => {
          if (idx !== 0) acc.push(el);
          return acc;
        }, [])
        .join(", ");

      return "(" + newItem;
    })
    .join("),\n");

  return insertStt + " VALUES \n" + temp;
}

// function removeColumnHeaderSmaller(header, value) {
//   const currResult = input.reduce((acc, item) => {
//     const arr = item.split(",");

//     if (Number(arr[header].trim()) < value) acc.push(item);

//     return acc;
//   }, []);

//   console.dir(currResult, { maxArrayLength: null });
// }

// Remove random column with insert statement
function rmNColInsertStm(insertStm, idx) {
  const words = insertStm.split(" ");
  const colNames = words.filter((col) =>
    [",", "(", ")"].some((sym) => col.includes(sym))
  );

  const columns = colNames
    .reduce((acc, item, index) => {
      if (index !== idx) acc.push(item);

      return acc;
    }, [])
    .join(" ");

  return words.slice(0, 3).join(" ") + " " + columns;
}

function rmNCol(colIdx) {
  if (colIdx === 0) return rmFirstCol();

  const { insert, input } = prepareInput("./input.sql");
  const insertStt = rmNColInsertStm(insert, colIdx);

  const temp = input
    .reduce((acc, item) => {
      const arr = item.split(",");

      const result = arr
        .reduce((curAcc, curItem, curIdx) => {
          if (curIdx !== colIdx) curAcc.push(curItem);

          return curAcc;
        }, [])
        .join(", ");

      acc.push(result);

      return acc;
    }, [])
    .join("),\n");

  return insertStt + " VALUES \n" + temp;
}

function writeSQLFile(colIdx) {
  const data = colIdx ? rmNCol(colIdx) : rmFirstCol();
  writeFileSync("./output.sql", data, { encoding: "utf8" });
}

const removeColumn = writeSQLFile;

export default removeColumn;
