# Kallisto Finance UI

This repo the web application for [kallisto.finance](https://kallisto.finance)

## Setup

In order to run this locally, you will need a Storyblok Api Key.

To set up the app for local development:
```
git clone https://github.com/kallisto-finance/kallisto-ui.git
cd kallisto-ui

### Local Development

# Getting environment variables set
cp .env.example .env

After seeing your .env file, make sure to replace placeholders with your Storyblok Api Key and Vault Contract Address

STORYBLOK_ACCESS_TOKEN=YOUR_STORYBLOK_API_KEY
LIQUIDITY_CONTRACT=VAULT_CONTRACT_ADDRESS
```

## Run
```
npm install
npm run dev
```

You can see the website at [http://localhost:3000](http://localhost:3000)
