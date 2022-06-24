# Kallisto Finance UI

This repo the web application for [kallisto.finance](https://kallisto.finance)

## Setup

In order to run this locally, you will need a Storyblok Api Key.

To set up the app for local development:
```
git clone https://github.com/kallisto-finance/kallisto-ui.git
cd kallisto-ui
```

## Local Development

**Getting environment variables set**    
    
Copy the exampple environment file.     
```cp .env.example .env```    

After seeing your .env file, make sure to replace placeholders API keys and endpoints

```
# APY KEYS
STORYBLOK_ACCESS_TOKEN=YOUR_STORYBLOK_API_KEY
INFURA_PROJECT_ID=YOUR_INFURA_PROJECT_ID
MIXPANEL_API_KEY=YOUR_MIXPANEL_ACCESS_TOKEN

# SMART CONTRACTS
KALLISTO_VAULT_ADDRESS=VAULT_CONTRACT_ADDRESS

# API
QUICK_NODE_ENDPOINT=YOUR_ETHEREUM_NODE_ENDPOINT
```

## Run
```
npm install
npm run dev
```

You can see the website at [http://localhost:3000](http://localhost:3000)
