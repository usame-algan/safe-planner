import { FC, type MouseEvent, useState } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { Menu, MenuItem } from '@mui/material';
import { SafeModule } from '../nodes/types.ts';
import style from './Navbar.module.css';

const NavBar: FC = () => {
  const { addNodes } = useReactFlow();

  const addNode = (type: 'wallet' | 'safe') => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        name: `New ${type}`,
        address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // vitalik.eth
      },
    };

    if (type === 'safe') {
      // @ts-expect-error Unresolved variable network
      newNode.data.network = 1;
    }

    addNodes(newNode);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const addModule = (type: SafeModule) => {
    setAnchorEl(null);

    const newNode = {
      id: `module-${Date.now()}`,
      type: 'module',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        type,
        name: `New ${SafeModule[type]}`,
        address: '0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134', // Spending limit singleton on mainnet
      },
    };
    addNodes(newNode);
  };

  return (
    <Panel position="top-center">
      <div className={style.navBar}>
        <button onClick={() => addNode('wallet')} className={`${style.navItem}`} title="Add Wallet">
          New Wallet
        </button>
        <button onClick={() => addNode('safe')} className={`${style.navItem}`} title="Add Safe">
          New Safe
        </button>
        <button
          onClick={handleClick}
          className={`${style.navItem} ${style.hidden}`}
          title="Add Safe"
          style={{ width: 'auto', height: 'auto', gap: '8px' }}
        >
          New Module
        </button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={() => addModule(SafeModule.SpendingLimit)} className={style.menuItem}>
            Spending Limit
          </MenuItem>
          <MenuItem onClick={() => addModule(SafeModule.Recovery)} className={style.menuItem}>
            Recovery
          </MenuItem>
        </Menu>
      </div>
    </Panel>
  );
};

export default NavBar;
