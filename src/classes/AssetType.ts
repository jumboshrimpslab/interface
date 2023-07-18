// @ts-nocheck
import BN from 'bn.js';

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
    return AssetType.Manta();
  }

  static Manta() {
    return new AssetType(
      1,
      'Manta',
      'MANTA',
      'manta',
      18,
      new BN('100000000000000000'),
      'manata-network'
    );
  }
}
