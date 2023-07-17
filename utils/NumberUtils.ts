import {isBigNumber} from "web3-utils";

export class NumberUtils {

    static fromNumber(value:BigInt) {
        return String(value);
    }

}