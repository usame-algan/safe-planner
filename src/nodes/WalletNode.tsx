import { useCallback, type ChangeEvent } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from '@xyflow/react';
import { type WalletNode } from './types';
import styles from './WalletNode.module.css';
import NameInput from '../components/NameInput.tsx';
import { TextField } from '@mui/material';

export function WalletNode({ data, id }: NodeProps<WalletNode>) {
  const { updateNodeData } = useReactFlow();

  const handleAddressChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { address: event.target.value });
    },
    [id, updateNodeData]
  );

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${styles.walletHeader}`}>
        <NameInput name={data.name} id={id} />
      </div>
      <div className={styles.body}>
        <TextField
          size="small"
          label="Address"
          value={data.address}
          onChange={handleAddressChange}
        />
        <Handle type="source" position={Position.Right} />
      </div>
    </div>
  );
}
