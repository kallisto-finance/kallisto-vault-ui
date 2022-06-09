export const ZERO = "0x0000000000000000000000000000000000000000";
export const VETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const ZAP_DEPOSIT = "0xA79828DF1850E8a3A3064576f380D90aECDD3359"
export const MAX_AMOUNT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
/**
 * estimation = estimation + estimation / GAS_MULTIPLIER
 */
export const GAS_MULTIPLIER = 5;

export const SLIPPAGE = 0.995;

export const WITHDRAW_LOCK_TIME = 3600 * 1000 * 1000 * 1000; // NANO SECONDS

export const TOKENS = [
  {
    name: "ETH",
    symbol: "ETH",
    address: VETH,
    img: "/assets/tokens/ETH.png",
    decimals: 18
  },
  {
    name: "CRV",
    symbol: "CRV",
    address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    img: "/assets/tokens/CRV.png",
    decimals: 18
  },
  {
    name: "WETH",
    symbol: "WETH",
    address: WETH,
    img: "/assets/tokens/WETH.png",
    decimals: 18
  },
  {
    name: "stETH",
    symbol: "stETH",
    address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    img: "/assets/tokens/stETH.png",
    decimals: 18
  },
  {
    name: "USDT",
    symbol: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    img: "/assets/tokens/USDT.png",
    decimals: 6
  },
  {
    name: "wBTC",
    symbol: "wBTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    img: "/assets/tokens/wBTC.png",
    decimals: 8
  },
  {
    name: "DAI",
    symbol: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    img: "/assets/tokens/DAI.png",
    decimals: 18
  },
  {
    name: "USDC",
    symbol: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    img: "/assets/tokens/USDC.png",
    decimals: 6
  },
  {
    name: "renBTC",
    symbol: "renBTC",
    address: "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",
    img: "/assets/tokens/renBTC.png",
    decimals: 8
  },
  {
    name: "FRAX",
    symbol: "FRAX",
    address: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
    img: "/assets/tokens/FRAX.png",
    decimals: 18
  },
  {
    name: "MIM",
    symbol: "MIM",
    address: "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3",
    img: "/assets/tokens/MIM.png",
    decimals: 18
  },
  {
    name: "alETH",
    symbol: "alETH",
    address: "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6",
    img: "/assets/tokens/alETH.png",
    decimals: 18
  },
  // {
  //   name: "cDAI",
  //   symbol: "cDAI",
  //   address: "",
  //   img: "/assets/tokens/cDAI.png",
  // },

  // {
  //   name: "cUSDC",
  //   symbol: "cUSDC",
  //   address: "",
  //   img: "/assets/tokens/cUSDC.png",
  // },
];



export const addresses = {
  curve_pool_icon_base_link: "https://curve.fi/static/icons/svg/crypto-icons-stack-2-ethereum.svg",
  contracts: {
    apy_vault: process.env.KALLISTO_VAULT_ADDRESS,
    curve_pools: [
      {
        key: "TRIPOOL_INFO",
        name: "3pool",
        address: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
        icon: ""
      },
      {
        key: "COMPOUND_INFO",
        name: "compound",
        address: "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56",
        param1: "0xeB21209ae4C2c9FF2a86ACA31E123764A3B6Bc06",
        param2: "0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2",
        icon: ""
      },
      {
        key: "AAVE_INFO",
        name: "aave",
        address: "0xDeBF20617708857ebe4F679508E7b7863a8A8EeE",
        param1: "0x0000000000000000000000000000000000000001",
        param2: "0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900",
        icon: ""
      },
      {
        key: "TRICRYPTO2_INFO",
        name: "tricrypto2",
        address: "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46",
        param1: "0x3993d34e7e99Abf6B6f367309975d1360222D446",
        param2: "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff",
        icon: ""
      },
      {
        key: "YPOOL_INFO",
        name: "y",
        address: "0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51",
        param1: "0xbBC81d23Ea2c3ec7e56D39296F0cbB648873a5d3",
        param2: "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8",
        icon: ""
      },
      {
        key: "BUSD_INFO",
        name: "busd",
        address: "0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27",
        param1: "0xb6c057591E073249F2D9D88Ba59a46CFC9B59EdB",
        param2: "0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B",
        icon: ""
      },
      {
        key: "SUSD_INFO",
        name: "susd",
        address: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD",
        param1: "0xFCBa3E75865d2d561BE8D220616520c171F12851",
        param2: "0xC25a3A3b969415c80451098fa907EC722572917F",
        icon: ""
      },
      {
        key: "PAX_INFO",
        name: "pax",
        address: "0x06364f10B501e868329afBc005b3492902d6C763",
        param1: "0xA50cCc70b6a011CffDdf45057E39679379187287",
        param2: "0xD905e2eaeBe188fc92179b6350807D8bd91Db0D8",
        icon: ""
      },
      {
        key: "REN_INFO",
        name: "renbtc",
        address: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x49849C98ae39Fff122806C06791Fa73784FB3675",
        icon: ""
      },
      {
        key: "SBTC_INFO",
        name: "sbtc",
        address: "0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3",
        icon: ""
      },
      {
        key: "HBTC_INFO",
        name: "hbtc",
        address: "0x4CA9b3063Ec5866A4B82E437059D2C43d1be596F",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0xb19059ebb43466C323583928285a49f558E572Fd",
        icon: ""
      },
      {
        key: "GUSD_INFO",
        name: "gusd",
        address: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956",
        param1: "0x64448B78561690B70E17CBE8029a3e5c1bB7136e",
        param2: "0xD2967f45c4f384DEEa880F807Be904762a3DeA07",
        icon: ""
      },
      {
        key: "HUSD_INFO",
        name: "husd",
        address: "0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604",
        param1: "0x09672362833d8f703D5395ef3252D4Bfa51c15ca",
        param2: "0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858",
        icon: ""
      },
      {
        key: "USDN_INFO",
        name: "usdn",
        address: "0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1",
        param1: "0x094d12e5b541784701FD8d65F11fc0598FBC6332",
        param2: "0x4f3E8F405CF5aFC05D68142F3783bDfE13811522",
        icon: ""
      },
      {
        key: "MUSD_INFO",
        name: "musd",
        address: "0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6",
        param1: "0x803A2B40c5a9BB2B86DD630B274Fa2A9202874C2",
        param2: "0x1AEf73d49Dedc4b1778d0706583995958Dc862e6",
        icon: ""
      },
      {
        key: "TBTC_INFO",
        name: "tbtc",
        address: "0xC25099792E9349C7DD09759744ea681C7de2cb66",
        param1: "0xaa82ca713D94bBA7A89CEAB55314F9EfFEdDc78c",
        param2: "0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd",
        icon: ""
      },
      {
        key: "DUSD_INFO",
        name: "dusd",
        address: "0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c",
        param1: "0x61E10659fe3aa93d036d099405224E4Ac24996d0",
        param2: "0x3a664Ab939FD8482048609f652f9a0B0677337B9",
        icon: ""
      },
      {
        key: "PBTC_INFO",
        name: "pbtc",
        address: "0x7F55DDe206dbAD629C080068923b36fe9D6bDBeF",
        param1: "0x11F419AdAbbFF8d595E7d5b223eee3863Bb3902C",
        param2: "0xDE5331AC4B3630f94853Ff322B66407e0D6331E8",
        icon: ""
      },
      {
        key: "BBTC_INFO",
        name: "bbtc",
        address: "0x071c661B4DeefB59E2a3DdB20Db036821eeE8F4b",
        param1: "0xC45b2EEe6e09cA176Ca3bB5f7eEe7C47bF93c756",
        param2: "0x410e3E86ef427e30B9235497143881f717d93c2A",
        icon: ""
      },
      {
        key: "OBTC_INFO",
        name: "obtc",
        address: "0xd81dA8D904b52208541Bade1bD6595D8a251F8dd",
        param1: "0xd5BCf53e2C81e1991570f33Fa881c49EEa570C8D",
        param2: "0x2fE94ea3d5d4a175184081439753DE15AeF9d614",
        icon: ""
      },
      {
        key: "EURS_INFO",
        name: "eurs",
        address: "0x0Ce6a5fF5217e38315f87032CF90686C96627CAA",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x194eBd173F6cDacE046C53eACcE9B953F28411d1",
        icon: ""
      },
      {
        key: "SETH_INFO",
        name: "seth",
        address: "0xc5424B857f758E906013F3555Dad202e4bdB4567",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c",
        icon: ""
      },
      {
        key: "STETH_INFO",
        name: "steth",
        address: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x06325440D014e39736583c165C2963BA99fAf14E",
        icon: ""
      },
      {
        key: "SAAVE_INFO",
        name: "saave",
        address: "0xEB16Ae0052ed37f479f7fe63849198Df1765a733",
        param1: "0x0000000000000000000000000000000000000001",
        param2: "0x02d341CcB60fAaf662bC0554d13778015d1b285C",
        icon: ""
      },
      {
        key: "ANKRETH_INFO",
        name: "ankreth",
        address: "0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf",
        icon: ""
      },
      {
        key: "USDP_INFO",
        name: "usdp",
        address: "0x42d7025938bEc20B69cBae5A77421082407f053A",
        param1: "0x3c8cAee4E09296800f8D29A68Fa3837e2dae4940",
        param2: "0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6",
        icon: ""
      },
      {
        key: "IRONBANK_INFO",
        name: "ironbank",
        address: "0x2dded6Da1BF5DBdF597C45fcFaa3194e53EcfeAF",
        param1: "0x0000000000000000000000000000000000000001",
        param2: "0x5282a4eF67D9C33135340fB3289cc1711c13638C",
        icon: ""
      },
      {
        key: "LINK_INFO",
        name: "link",
        address: "0xF178C0b5Bb7e7aBF4e12A4838C7b7c5bA2C623c0",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0xcee60cFa923170e4f8204AE08B4fA6A3F5656F3a",
        icon: ""
      },
      {
        key: "TUSD_INFO",
        name: "tusd",
        address: "0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1",
        param1: ZAP_DEPOSIT,
        param2: "0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1",
        icon: ""
      },
      {
        key: "FRAX_INFO",
        name: "frax",
        address: "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
        param1: ZAP_DEPOSIT,
        param2: "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
        icon: ""
      },
      {
        key: "LUSD_INFO",
        name: "lusd",
        address: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
        param1: ZAP_DEPOSIT,
        param2: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
        icon: ""
      },
      {
        key: "BUSD2_INFO",
        name: "busdv2",
        address: "0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a",
        param1: ZAP_DEPOSIT,
        param2: "0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a",
        icon: ""
      },
      {
        key: "RETH_INFO",
        name: "reth",
        address: "0xF9440930043eb3997fc70e1339dBb11F341de7A8",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x53a901d48795C58f485cBB38df08FA96a24669D5",
        icon: ""
      },
      {
        key: "ALUSD_INFO",
        name: "alusd",
        address: "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c",
        param1: ZAP_DEPOSIT,
        param2: "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c",
        icon: ""
      },
      {
        key: "MIM_INFO",
        name: "mim",
        address: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
        param1: ZAP_DEPOSIT,
        param2: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
        icon: ""
      },
      {
        key: "RAI_INFO",
        name: "rai",
        address: "0x618788357D0EBd8A37e763ADab3bc575D54c2C7d",
        param1: "0xcB636B81743Bb8a7F1E355DEBb7D33b07009cCCC",
        param2: "0x6BA5b4e438FA0aAf7C1bD179285aF65d13bD3D90",
        icon: ""
      },
      {
        key: "EURT_INFO",
        name: "eurtusd",
        address: "0x9838eCcC42659FA8AA7daF2aD134b53984c9427b",
        param1: "0x5D0F47B32fDd343BfA74cE221808e2abE4A53827",
        param2: "0x3b6831c0077a1e44ED0a21841C3bC4dC11bCE833",
        icon: ""
      },
      {
        key: "EURSUSD_INFO",
        name: "eursusd",
        address: "0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x3D229E1B4faab62F621eF2F6A610961f7BD7b23B",
        icon: ""
      },
      {
        key: "CRVETH_INFO",
        name: "crveth",
        address: "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d",
        icon: ""
      },
      {
        key: "CVXETH_INFO",
        name: "cvxeth",
        address: "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x3A283D9c08E8b55966afb64C515f5143cf907611",
        icon: ""
      },
      {
        key: "XAUTUSD_INFO",
        name: "xautusd",
        address: "0xAdCFcf9894335dC340f6Cd182aFA45999F45Fc44",
        param1: "0xc5FA220347375ac4f91f9E4A4AAb362F22801504",
        param2: "0x8484673cA7BfF40F82B041916881aeA15ee84834",
        icon: ""
      },
      {
        key: "SPELLETH_INFO",
        name: "spelleth",
        address: "0x98638FAcf9a3865cd033F36548713183f6996122",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0x8282BD15dcA2EA2bDf24163E8f2781B30C43A2ef",
        icon: ""
      },
      {
        key: "TETH_INFO",
        name: "teth",
        address: "0x752eBeb79963cf0732E9c0fec72a49FD1DEfAEAC",
        param1: "0x0000000000000000000000000000000000000000",
        param2: "0xCb08717451aaE9EF950a2524E33B6DCaBA60147B",
        icon: ""
      }
    ]

  },
};
