# [HectorDAO](https://hectordao.com) Bond Claim & Stake Bot

## Prerequisites

* Node >= 14.x

## Installation

```bash
npm install -g yarn
git clone https://github.com/brandonlehmann/hector-dao-bot
cd hector-dao-bot
yarn
```

## Setup

At the very least, you need to export the following environment variable, or put the value in a .env file.

```bash
export HECTOR_DAO_WALLET_ADDRESS=yourwalletaddress
export BOT_WALLET_PASSWORD=arandomlycreatedpassword
```

### Example

```bash
export HECTOR_DAO_WALLET_ADDRESS=0x3F1066f18EdB21aC6dB63630C8241400B7FB0f06
export BOT_WALLET_PASSWORD=qnft14dtqE4DtQJNWVDVp11V9iFfpb
```

# Using

Start the bot with the following command:

```bash
yarn start
```

The script will print the bot wallet address a few times for you.

For this bot to automatically claim and stake rebases on your behalf, you must
fund it with some FTM so that it can send transactions that will claim and stake
your bonds. 

You do not have to give it much, but given that it will send three
transactions a day, it may be wise to make sure that the bot wallet has
1 FTM available and top it up ever day or so.

### Donations

If you find this bot useful, please consider funding my coffee addiction
I gladly accept FTM, HEC, sHEC, wsHEC, etc to: `0x3F1066f18EdB21aC6dB63630C8241400B7FB0f06`
