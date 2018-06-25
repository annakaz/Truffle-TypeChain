const fs = require("fs");
const { promisify } = require("util");
const appendFile = promisify(fs.appendFile);

export async function generateExports(exportFile: string, buildFolder: string) {
  fs.writeFile(exportFile, "");
  fs.readdir(buildFolder, async (err: Error, files: string[]) => {
    await Promise.all(
      files.map(async file => {
        const contractName = file.replace(".d.ts", "");

        await appendFile(
          exportFile,
          `export { ${contractName} } from './typechain/${contractName}`,
        );
      }),
    );
    await appendFile(exportFile, `export { ${files.join(", ")} }`);
  });
}
