const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);

const buildFolder = "../types/typechain";
const exportFile = "../types/contracts.ts";

fs.writeFile(exportFile, "");

fs.readdir(buildFolder, async (err: Error, files: string[]) => {
  await Promise.all(
    files.map(async file => {
      const contractName = file.replace(".d.ts", "");

      await appendFile(exportFile, `export { ${contractName} } from './typechain/${contractName}`);
    }),
  );
  await appendFile(exportFile, `export { ${files.join(", ")} }`);
});
