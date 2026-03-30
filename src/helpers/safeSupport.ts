import { getProxyFactoryDeployments, getSafeSingletonDeployments } from '@safe-global/safe-deployments';
import { APP_CHAIN_IDS } from './networks.ts';

export const DEFAULT_SAFE_VERSION = '1.4.1' as const;

export const SAFE_VERSIONS = ['1.4.1', '1.3.0', '1.1.1', '1.0.0'] as const;

export type SupportedSafeVersion = (typeof SAFE_VERSIONS)[number];

const PREDICTABLE_SAFE_VERSIONS: SupportedSafeVersion[] = ['1.4.1', '1.3.0'];

const DEPLOYABLE_NETWORKS_BY_SAFE_VERSION = Object.fromEntries(
  SAFE_VERSIONS.map((version) => {
    const proxyFactoryNetworks = getProxyFactoryDeployments({ version })?.networkAddresses ?? {};
    const safeSingletonNetworks = getSafeSingletonDeployments({ version })?.networkAddresses ?? {};
    const supportedNetworks = APP_CHAIN_IDS.filter(
      (chainId) => Boolean(proxyFactoryNetworks[chainId]) && Boolean(safeSingletonNetworks[chainId])
    );

    return [version, new Set(supportedNetworks)];
  })
) as Record<SupportedSafeVersion, Set<number>>;

export function getDeployableSafeVersions(network?: number): SupportedSafeVersion[] {
  if (!network) {
    return [...SAFE_VERSIONS];
  }

  return SAFE_VERSIONS.filter((version) => DEPLOYABLE_NETWORKS_BY_SAFE_VERSION[version].has(network));
}

export function getSafeVersionSupport(safeVersion: SupportedSafeVersion, network?: number) {
  if (!network) {
    return {
      canDeploy: false,
      canPredict: false,
      deployMessage: 'Select a network to deploy this Safe.',
      predictMessage: 'Select a network to calculate a predicted address.',
    };
  }

  const deployableVersions = getDeployableSafeVersions(network);
  const canDeploy = deployableVersions.includes(safeVersion);

  if (!canDeploy) {
    return {
      canDeploy: false,
      canPredict: false,
      deployMessage: 'This Safe version is not deployed on the selected network.',
      predictMessage: 'Prediction is unavailable because this Safe version is not deployable here.',
    };
  }

  const canPredict = PREDICTABLE_SAFE_VERSIONS.includes(safeVersion);

  return {
    canDeploy,
    canPredict,
    deployMessage: undefined,
    predictMessage: canPredict ? undefined : 'Address prediction is only available for Safe 1.3.0+.',
  };
}
