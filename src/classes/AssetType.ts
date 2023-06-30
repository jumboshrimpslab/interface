// @ts-nocheck
import BN from 'bn.js';

const CalamariAssetIds = {
  KMA: 1
};

export default class AssetType {
  assetId: number;
  name: string;
  ticker: string;
  icon: string;
  numberOfDecimals: number;
  existentialDeposit: BN;
  coingeckoId: string;

  constructor(
    assetId,
    name,
    ticker,
    icon,
    numberOfDecimals,
    existentialDeposit,
    coingeckoId
  ) {
    this.assetId = assetId;
    this.name = name;
    this.ticker = ticker;
    this.icon = icon;
    this.numberOfDecimals = numberOfDecimals;
    this.existentialDeposit = existentialDeposit;
    this.coingeckoId = coingeckoId;
  }

  static Native() {
    return AssetType.Calamari();
  }

  static Calamari() {
    return new AssetType(
      CalamariAssetIds.KMA,
      'Calamari',
      'KMA',
      'calamari',
      18,
      new BN('100000000000000000'),
      'calamari-network'
    );
  }
}
