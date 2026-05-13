import { AI_QUERY_KEYS, restService } from '@shared/api';
import { useQuery } from '@tanstack/react-query';

export type NewsSentiment = 'positive' | 'neutral' | 'negative';

export type AssetNewsAnalysis = {
  symbolKey: string;
  analysis: string;
  sentiment: NewsSentiment;
  newsCount: number;
  analyzedAt: string;
  cached: boolean;
};

const getAssetNewsAnalysis = async (symbols: string[]): Promise<AssetNewsAnalysis> => {
  const res = await restService.GET<AssetNewsAnalysis>('/ai/news-analysis', {
    params: { symbols: symbols.join(',') },
    timeout: 0,
  });
  return res.data;
};

export const useGetAssetNewsAnalysis = (symbols: string[]) => {
  return useQuery({
    queryKey: AI_QUERY_KEYS.newsAnalysis(symbols),
    queryFn: () => getAssetNewsAnalysis(symbols),
    enabled: symbols.length > 0,
    staleTime: 60 * 60 * 1000, // 1h — backend caches for 24h anyway
  });
};
