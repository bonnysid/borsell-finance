import { AssetMetadata, AssetSearchResultDtoShape, AssetType, ID } from '@packages/types';

type AssetSearchResultDtoParams = {
  id?: ID;
  type: AssetType;
  name: string;
  symbol: string;
  metadata?: AssetMetadata;
  moexEngineName?: string | null;
  moexMarketName?: string | null;
  moexBoardId?: string | null;
  moexSecurityId?: string | null;
  source: 'LOCAL' | 'MOEX';
};

export class AssetSearchResultDto implements AssetSearchResultDtoShape {
  id?: ID;
  type: AssetType;
  name: string;
  symbol: string;
  metadata: AssetMetadata;
  moexEngineName?: string | null;
  moexMarketName?: string | null;
  moexBoardId?: string | null;
  moexSecurityId?: string | null;
  source: 'LOCAL' | 'MOEX';

  constructor(asset: AssetSearchResultDtoParams) {
    this.id = asset.id;
    this.type = asset.type;
    this.name = asset.name;
    this.symbol = asset.symbol;
    this.metadata = asset.metadata ?? ({} as AssetMetadata);
    this.moexEngineName = asset.moexEngineName;
    this.moexMarketName = asset.moexMarketName;
    this.moexBoardId = asset.moexBoardId;
    this.moexSecurityId = asset.moexSecurityId;
    this.source = asset.source;
  }
}
