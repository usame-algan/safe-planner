import { useState, useEffect, useMemo } from 'react';
import {
  Handle,
  type NodeProps,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { predictSafeAddress, SafeFactory, SafeProvider } from '@safe-global/protocol-kit';
import type { SafeVersion } from '@safe-global/safe-core-sdk-types/dist/src/types';
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  NativeSelect,
  OutlinedInput,
  Stack,
  TextField,
} from '@mui/material';
import { useChains, useModal } from 'connectkit';
import { toHex } from 'viem';

import type { SafeNode as SafeNodeData } from './types';
import styles from './WalletNode.module.css';
import NameInput from '../components/NameInput.tsx';
import { useAccount } from 'wagmi';
import {
  DEFAULT_SAFE_VERSION,
  getDeployableSafeVersions,
  getSafeVersionSupport,
  type SupportedSafeVersion,
} from '../helpers/safeSupport.ts';

export function SafeNode({ data, id }: NodeProps<SafeNodeData>) {
  const [safeVersion, setSafeVersion] = useState<SafeVersion>(DEFAULT_SAFE_VERSION);
  const [saltNonce, setSaltNonce] = useState<string>(Date.now().toString());
  const [threshold, setThreshold] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const { updateNodeData } = useReactFlow();
  const chains = useChains();
  const { setOpen } = useModal();

  const connections = useHandleConnections({
    type: 'target',
  });

  const nodesData = useNodesData(connections.map((connection) => connection.source));
  const ownerAddresses = useMemo(() => {
    return nodesData
      .map((owner) => owner.type !== 'module' && owner.data.address)
      .filter(Boolean) as string[];
  }, [nodesData]);

  const deployableVersions = useMemo(
    () => getDeployableSafeVersions(data.network),
    [data.network]
  );

  const safeVersionSupport = useMemo(
    () => getSafeVersionSupport(safeVersion as SupportedSafeVersion, data.network),
    [safeVersion, data.network]
  );

  const deployDisabledReason = useMemo(() => {
    if (!safeVersionSupport.canDeploy) {
      return safeVersionSupport.deployMessage;
    }

    if (ownerAddresses.length === 0) {
      return 'Add at least one owner to deploy this Safe.';
    }

    if (threshold === 0) {
      return 'Threshold must be at least 1.';
    }

    return undefined;
  }, [ownerAddresses.length, safeVersionSupport, threshold]);

  const predictionStatus = useMemo(() => {
    if (safeVersionSupport.predictMessage) {
      return safeVersionSupport.predictMessage;
    }

    if (ownerAddresses.length === 0) {
      return 'Add at least one owner to calculate a predicted address.';
    }

    if (!isConnected) {
      return 'Connect wallet to calculate the predicted address.';
    }

    if (isLoading) {
      return 'Calculating predicted address...';
    }

    return 'Predicted address unavailable.';
  }, [isConnected, isLoading, ownerAddresses.length, safeVersionSupport.predictMessage]);

  useEffect(() => {
    if (deployableVersions.length === 0 || deployableVersions.includes(safeVersion as SupportedSafeVersion)) {
      return;
    }

    setSafeVersion(deployableVersions[0]);
  }, [deployableVersions, safeVersion]);

  useEffect(() => {
    const ownerNetwork = nodesData
      .map((owner) => owner.type === 'safe' && owner.data.network)
      .filter(Boolean) as number[];

    // One of the owners is a safe, so we keep the networks in sync
    if (ownerNetwork.length > 0) {
      updateNodeData(id, { network: ownerNetwork[0] });
    }
  }, [id, nodesData, updateNodeData]);

  // Update threshold if ownerAddresses.length changes
  useEffect(() => {
    setThreshold((prevThreshold) => {
      if (prevThreshold > ownerAddresses.length) {
        return ownerAddresses.length;
      } else if (prevThreshold < 1) {
        return 1;
      } else {
        return prevThreshold;
      }
    });
  }, [ownerAddresses.length]);

  useEffect(() => {
    if (!isConnected || !safeVersionSupport.canPredict) {
      if (!safeVersionSupport.canPredict) {
        updateNodeData(id, { address: undefined });
      }
      return;
    }

    const predictAddress = async () => {
      const ethereum = window.ethereum;

      if (!ethereum) {
        return;
      }

      if (ownerAddresses.length === 0 || threshold === 0 || !data.network) {
        updateNodeData(id, { address: undefined });
        return;
      }

      setIsLoading(true);

      try {
        const address = await predictSafeAddress({
          safeProvider: new SafeProvider({ provider: ethereum }),
          chainId: BigInt(data.network),
          safeAccountConfig: { owners: ownerAddresses, threshold },
          safeDeploymentConfig: {
            safeVersion,
            saltNonce,
          },
        });

        updateNodeData(id, { address });
      } catch (error) {
        console.error('Error predicting Safe address:', error);
        updateNodeData(id, { address: undefined });
      } finally {
        setIsLoading(false);
      }
    };

    predictAddress();
  }, [
    threshold,
    saltNonce,
    safeVersion,
    id,
    ownerAddresses,
    updateNodeData,
    data.network,
    isConnected,
    safeVersionSupport.canPredict,
  ]);

  const deploySafe = async () => {
    if (!data.network || !safeVersionSupport.canDeploy) return;

    const ethereum = window.ethereum;

    if (!ethereum) return;

    setIsLoading(true);

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: toHex(data.network),
          },
        ],
      });

      const safeFactory = await SafeFactory.init({
        provider: ethereum,
        safeVersion,
      });

      await safeFactory.deploySafe({
        safeAccountConfig: {
          owners: ownerAddresses,
          threshold,
        },
        saltNonce,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateNetwork = (network: number) => {
    updateNodeData(id, { network });
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${styles.safeHeader}`}>
        <NameInput name={data.name} id={id} />
      </div>
      <div className={styles.body}>
        <Handle type="target" position={Position.Left} />
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth>
            <InputLabel variant="outlined" htmlFor="threshold-select" shrink>
              Threshold
            </InputLabel>
            <NativeSelect
              input={<OutlinedInput label="Threshold" size="small" />}
              inputProps={{
                name: 'threshold',
                id: 'threshold-select',
              }}
              defaultValue={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            >
              {Array.from({ length: ownerAddresses.length }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </NativeSelect>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel variant="outlined" htmlFor="safe-version-select">
              Safe version
            </InputLabel>
            <NativeSelect
              input={<OutlinedInput label="Safe version" size="small" />}
              inputProps={{
                name: 'safe-version',
                id: 'safe-version-select',
              }}
              value={safeVersion}
              onChange={(e) => setSafeVersion(e.target.value as SafeVersion)}
            >
              {deployableVersions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
          <TextField
            variant="outlined"
            label="Salt nonce"
            size="small"
            defaultValue={saltNonce}
            onChange={(e) => setSaltNonce(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel variant="outlined" htmlFor="safe-version-select">
              Network
            </InputLabel>
            <NativeSelect
              input={<OutlinedInput label="Network" size="small" />}
              inputProps={{
                name: 'network',
                id: 'network-select',
              }}
              value={data.network}
              onChange={(e) => updateNetwork(Number(e.target.value))}
            >
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </Stack>

        <Handle type="source" position={Position.Right} />
      </div>
      <div className={styles.footer}>
        {!isConnected ? (
          <Button
            sx={{ textTransform: 'initial', height: '30px' }}
            size="small"
            variant="contained"
            onClick={() => setOpen(true)}
            disableElevation
            disabled={isLoading}
          >
            Connect wallet
          </Button>
        ) : (
          <Stack direction="column" gap={1} sx={{ width: '100%' }}>
            {data.address ? (
              <p className={styles.text}>
                <b style={{ marginBottom: '4px', display: 'block' }}>Safe Address:</b>
                <span className={styles.address}>{data.address}</span>
              </p>
            ) : (
              <p className={styles.text}>{predictionStatus}</p>
            )}
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                {deployDisabledReason && <p className={styles.text}>{deployDisabledReason}</p>}
              <Button
                sx={{ textTransform: 'initial', height: '30px', flexShrink: 0 }}
                size="small"
                variant="contained"
                onClick={deploySafe}
                disableElevation
                disabled={Boolean(deployDisabledReason) || isLoading}
              >
                {isLoading ? <CircularProgress size={16} /> : 'Deploy'}
              </Button>
            </Stack>
          </Stack>
        )}

        <Handle type="target" position={Position.Bottom} id="target-1" />
      </div>
    </div>
  );
}
