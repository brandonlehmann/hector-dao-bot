// Copyright (c) 2021, Brandon Lehmann <brandonlehmann@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { BigNumber, DAO, FantomScanProvider } from '@brandonlehmann/ethers-providers';
import * as Numeral from 'numeral';
import { resolve } from 'path';
import Logger from '@turtlepay/logger';

export type Bonds = Map<string, {name: string, bond: DAO.Bond}>;

const sleep = async (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout * 1000));

export default {
    sleep: sleep,
    secondsToHuman: (seconds: number): string => {
        return new Date(seconds * 1000).toISOString()
            .substr(11, 8);
    },
    formatPercent: (value: number | BigNumber): string => {
        if (typeof value === 'undefined') {
            return Numeral(0)
                .format('0,0.0000')
                .padStart(14, ' ');
        }

        if (value instanceof BigNumber) {
            value = value.toNumber();
        }

        value *= 100;

        return Numeral(value)
            .format('0,0.0000')
            .padStart(14, ' ');
    },
    path: (value: string): string => {
        return resolve(process.cwd() + '/' + value);
    },
    getBonds: async (
        scanner: FantomScanProvider,
        redeemHelper: DAO.RedeemHelper,
        helper: DAO.BondInformationHelper,
        maxBonds = 20): Promise<Bonds> => {
        const result = new Map<string, {name: string, bond: DAO.Bond}>();

        const bond_addresses = await redeemHelper.getBonds(maxBonds);

        for (const contract_address of bond_addresses) {
            const attempt = async (): Promise<void> => {
                try {
                    const bond = await scanner.load_contract(DAO.Bond, contract_address, 'HEC');

                    const symbols = await helper.symbol(contract_address);

                    const terms = await bond.terms();

                    const tag = (terms.vestingTerm.toNumber() === 345600) ? '(4,4)' : '(1,1)';

                    const symbol = (symbols.symbol1.length !== 0) ? symbols.symbol0 + '-' + symbols.symbol1 + ' LP' : symbols.symbol0;

                    const name = symbol + ' ' + tag;

                    result.set(contract_address, { name: name, bond: bond });

                    Logger.info('Loaded bond for %s: %s', name.padStart(20, ' '), contract_address);
                } catch {
                    Logger.warn('Error loading bond ABI, pausing 2 seconds to try again...');

                    await sleep(2);

                    return attempt();
                }
            };

            await attempt();
        }

        return result;
    },
    checkBonds: async (bonds: Bonds, myStakingWallet: string): Promise<BigNumber> => {
        let result = BigNumber.from(0);

        for (const [, elem] of bonds) {
            const payout = await elem.bond.pendingPayoutFor(myStakingWallet);

            result = result.add(payout);
        }

        return result;
    },
    compoundRate: (rate: number, days = 1): number => {
        return Math.pow(1 + rate, 3 * days) - 1;
    }
};
