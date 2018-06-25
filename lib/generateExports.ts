const fs = require("fs");
const { promisify } = require("util");
const appendFile = promisify(fs.appendFile);

async function generateExports(exportFile: string, buildFolder: string) {
  fs.writeFile(exportFile, "");
  fs.readdir(buildFolder, async (err: Error, files: string[]) => {
    const contractFiles = files.filter(file => {
      return file.substr(file.length - 5) === ".d.ts";
    });

    const contractNames = contractFiles.map(function(file) {
      return file.replace(".d.ts", "");
    });

    await Promise.all(
      contractNames.map(async name => {
        await appendFile(exportFile, `import { ${name} } from './typechain/${name}' \n`);
      }),
    );
    await appendFile(exportFile, `\n export { ${contractNames.join(", ")} }`);
  });
}

generateExports("./contracts.ts", "./typechain/");
