"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EvmType {
    generateCodeForInput() {
        return this.generateCodeForOutput();
    }
    generateCodeForInputConversion(paramName) {
        return `${paramName}.toString()`;
    }
}
exports.EvmType = EvmType;
class BooleanType extends EvmType {
    generateCodeForOutput() {
        return "boolean";
    }
}
exports.BooleanType = BooleanType;
class IntegerType extends EvmType {
    constructor(bits) {
        super();
        this.bits = bits;
    }
    generateCodeForInput() {
        return "BigNumber | number";
    }
    generateCodeForOutput() {
        return "BigNumber";
    }
}
exports.IntegerType = IntegerType;
class UnsignedIntegerType extends EvmType {
    constructor(bits) {
        super();
        this.bits = bits;
    }
    generateCodeForInput() {
        return "BigNumber | number";
    }
    generateCodeForOutput() {
        return "BigNumber";
    }
}
exports.UnsignedIntegerType = UnsignedIntegerType;
class VoidType extends EvmType {
    generateCodeForOutput() {
        return "void";
    }
}
exports.VoidType = VoidType;
class StringType extends EvmType {
    generateCodeForOutput() {
        return "string";
    }
    generateCodeForInputConversion(paramName) {
        return paramName;
    }
}
exports.StringType = StringType;
class BytesType extends EvmType {
    constructor(size) {
        super();
        this.size = size;
    }
    generateCodeForOutput() {
        return "BigNumber";
    }
}
exports.BytesType = BytesType;
class AddressType extends EvmType {
    generateCodeForOutput() {
        return "string";
    }
    generateCodeForInput() {
        return "BigNumber | string";
    }
}
exports.AddressType = AddressType;
class ArrayType extends EvmType {
    constructor(itemType, size) {
        super();
        this.itemType = itemType;
        this.size = size;
    }
    generateCodeForOutput() {
        return this.itemType.generateCodeForOutput() + "[]";
    }
    generateCodeForInput() {
        return this.itemType instanceof BytesType ? "string" : this.generateCodeForOutput();
    }
    generateCodeForInputConversion(paramName) {
        if (this.itemType instanceof BytesType) {
            return paramName;
        }
        else {
            return `${paramName}.map(val => ${this.itemType.generateCodeForInputConversion("val")})`;
        }
    }
}
exports.ArrayType = ArrayType;
const isUIntTypeRegex = /^uint([0-9]*)$/;
const isIntTypeRegex = /^int([0-9]*)$/;
const isBytesTypeRegex = /^bytes([0-9]+)$/;
function parseEvmType(rawType) {
    const lastChar = rawType[rawType.length - 1];
    if (lastChar === "]") {
        // we parse array type
        let finishArrayTypeIndex = rawType.length - 2;
        while (rawType[finishArrayTypeIndex] !== "[") {
            finishArrayTypeIndex--;
        }
        const arraySizeRaw = rawType.slice(finishArrayTypeIndex + 1, rawType.length - 1);
        const arraySize = arraySizeRaw !== "" ? parseInt(arraySizeRaw) : undefined;
        const restOfTheType = rawType.slice(0, finishArrayTypeIndex);
        return new ArrayType(parseEvmType(restOfTheType), arraySize);
    }
    // this has to be primitive type
    //first deal with simple types
    switch (rawType) {
        case "bool":
            return new BooleanType();
        case "address":
            return new AddressType();
        case "string":
            return new StringType();
        case "byte":
            return new BytesType(1);
        case "bytes":
            return new ArrayType(new BytesType(1));
    }
    if (isUIntTypeRegex.test(rawType)) {
        const match = isUIntTypeRegex.exec(rawType);
        return new UnsignedIntegerType(parseInt(match[1] || "256"));
    }
    if (isIntTypeRegex.test(rawType)) {
        const match = isIntTypeRegex.exec(rawType);
        return new IntegerType(parseInt(match[1] || "256"));
    }
    if (isBytesTypeRegex.test(rawType)) {
        const match = isBytesTypeRegex.exec(rawType);
        return new BytesType(parseInt(match[1] || "1"));
    }
    throw new Error("Unknown type: " + rawType);
}
exports.parseEvmType = parseEvmType;