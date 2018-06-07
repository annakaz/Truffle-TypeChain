#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const chalk_1 = require("chalk");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const glob = require("glob");
const prettier = require("prettier");
const generateSource_1 = require("./generateSource");
const parseArgs_1 = require("./parseArgs");
const copyRuntime_1 = require("./copyRuntime");
const abiParser_1 = require("./abiParser");
const { blue, red, green, yellow } = chalk_1.default;
const cwd = process.cwd();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const options = parseArgs_1.parseArgs();
        const matches = glob.sync(options.glob, { ignore: "node_modules/**", absolute: true });
        if (matches.length === 0) {
            // tslint:disable-next-line
            console.log(red(`Found ${matches.length} ABIs.`));
            process.exit(0);
        }
        // tslint:disable-next-line
        console.log(green(`Found ${matches.length} ABIs.`));
        const prettierConfig = yield prettier.resolveConfig(path_1.dirname(matches[0]));
        if (prettierConfig) {
            // tslint:disable-next-line
            console.log("Found prettier config file");
        }
        // tslint:disable-next-line
        console.log("Generating typings...");
        // copy runtime in directory of first typing (@todo it should be customizable)
        const runtimeFilename = "typechain-runtime.ts";
        const runtimePath = path_1.join(options.outDir || path_1.dirname(matches[0]), runtimeFilename);
        copyRuntime_1.copyRuntime(runtimePath);
        // tslint:disable-next-line
        console.log(blue(`${runtimeFilename} => ${runtimePath}`));
        // generate wrappers
        matches.forEach(p => processFile(p, options.force, runtimePath, Object.assign({}, (prettierConfig || {}), { parser: "typescript" }), options.outDir));
    });
}
function processFile(absPath, forceOverwrite, runtimeAbsPath, prettierConfig, fixedOutputDir) {
    const relativeInputPath = path_1.relative(cwd, absPath);
    const parsedInputPath = path_1.parse(absPath);
    const filenameWithoutAnyExtensions = getFilenameWithoutAnyExtensions(parsedInputPath.name);
    const outputDir = fixedOutputDir || parsedInputPath.dir;
    const outputPath = path_1.join(outputDir, filenameWithoutAnyExtensions + ".d.ts");
    const relativeOutputPath = path_1.relative(cwd, outputPath);
    const runtimeRelativePath = getRelativeModulePath(outputDir, runtimeAbsPath);
    // tslint:disable-next-line
    console.log(blue(`${relativeInputPath} => ${relativeOutputPath}`));
    if (fs_extra_1.pathExistsSync(outputPath) && !forceOverwrite) {
        // tslint:disable-next-line
        console.log(red("File exists, skipping"));
        return;
    }
    const abiString = fs_1.readFileSync(absPath).toString();
    const rawAbi = abiParser_1.extractAbi(abiString);
    if (rawAbi.length === 0) {
        // tslint:disable-next-line
        console.log(yellow("ABI is empty, skipping"));
        return;
    }
    const typescriptSourceFile = generateSource_1.generateSource(rawAbi, {
        fileName: filenameWithoutAnyExtensions,
        relativeRuntimePath: runtimeRelativePath,
    });
    fs_1.writeFileSync(outputPath, prettier.format(typescriptSourceFile, prettierConfig));
}
function getFilenameWithoutAnyExtensions(filePath) {
    const endPosition = filePath.indexOf(".");
    return filePath.slice(0, endPosition !== -1 ? endPosition : filePath.length);
}
function getRelativeModulePath(from, to) {
    return ("./" + path_1.relative(from, to)).replace(".ts", ""); // @note: this is probably not the best way to find relative path for modules
}
main().catch(e => {
    // tslint:disable-next-line
    console.error(red("Error occured: ", e.message));
    process.exit(1);
});