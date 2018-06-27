const fs = require("fs");
const { promisify } = require("util");
const appendFile = promisify(fs.appendFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

async function generateExports(exportFile: string, buildFolder: string) {
  await writeFile(exportFile, "");

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
    await appendFile(exportFile, `\nexport { ${contractNames.join(", \n  ")} }`);
  });

  /*
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
    await appendFile(exportFile, `\nexport { ${contractNames.join(", \n  ")} }`);
  });
  */
}

export { generateExports };
