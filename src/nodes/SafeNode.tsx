import { useState, useEffect, useMemo } from 'react';
import {
  Handle,
  NodeProps,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from '@xyflow/react';
import { predictSafeAddress, SafeFactory, SafeProvider } from '@safe-global/protocol-kit';
import { SafeVersion } from '@safe-global/safe-core-sdk-types/dist/src/types';
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
import { useChains } from 'connectkit';
import { toHex } from 'viem';

import { type SafeNode } from './types';
import styles from './WalletNode.module.css';
import NameInput from '../components/NameInput.tsx';

const SAFE_VERSIONS = ['1.4.1', '1.3.0', '1.1.1', '1.1.0', '1.0.0'];

export function SafeNode({ data, id }: NodeProps<SafeNode>) {
  const [safeVersion, setSafeVersion] = useState<SafeVersion>('1.4.1');
  const [saltNonce, setSaltNonce] = useState<string>(Date.now().toString());
  const [threshold, setThreshold] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { updateNodeData } = useReactFlow();
  const chains = useChains();

  const connections = useHandleConnections({
    type: 'target',
  });

  const nodesData = useNodesData(connections.map((connection) => connection.source));
  const ownerAddresses = useMemo(() => {
    return nodesData
      .map((owner) => owner.type !== 'module' && owner.data.address)
      .filter(Boolean) as string[];
  }, [nodesData]);

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
    const predictAddress = async () => {
      if (ownerAddresses.length === 0 || threshold === 0 || !data.network) {
        updateNodeData(id, { address: null });
        return;
      }

      setIsLoading(true);

      try {
        const address = await predictSafeAddress({
          safeProvider: new SafeProvider({ provider: window.ethereum! }),
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
      } finally {
        setIsLoading(false);
      }
    };

    predictAddress();
  }, [threshold, saltNonce, safeVersion, id, ownerAddresses, updateNodeData, data.network]);

  const deploySafe = async () => {
    if (!data.network) return;

    setIsLoading(true);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: toHex(data.network),
          },
        ],
      });

      const safeFactory = await SafeFactory.init({
        provider: window.ethereum,
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
              defaultValue={safeVersion}
              onChange={(e) => setSafeVersion(e.target.value as SafeVersion)}
            >
              {SAFE_VERSIONS.map((version) => (
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
        {data.address && (
          <Stack direction="row" alignItems="center" gap={1}>
            <p className={styles.text}>
              <b style={{ marginBottom: '4px', display: 'block' }}>Safe Address:</b>
              <span className={styles.address}>{data.address}</span>
            </p>
            <Button
              sx={{ textTransform: 'initial', height: '30px' }}
              size="small"
              variant="contained"
              onClick={deploySafe}
              disableElevation
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={16} /> : 'Deploy'}
            </Button>
          </Stack>
        )}

        <Handle type="target" position={Position.Bottom} id="target-1" />
      </div>
    </div>
  );
}
