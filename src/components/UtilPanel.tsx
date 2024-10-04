import { Panel, useReactFlow } from '@xyflow/react';
import { exportData, importData } from '../helpers/utils.ts';
import { MouseEvent, useRef, useState } from 'react';
import { ConnectKitButton } from 'connectkit';
import { IconButton, Menu, MenuItem } from '@mui/material';

const UtilPanel = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { setEdges, setNodes, addNodes, addEdges, getNodes, getEdges } = useReactFlow();

  const handleClear = () => {
    setAnchorEl(null);
    setNodes([]);
    setEdges([]);
  };

  const handleExport = () => {
    setAnchorEl(null);
    exportData(getNodes(), getEdges());
  };

  const handleImport = () => {
    setAnchorEl(null);

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;

    if (!input.files || !input.files[0]) {
      console.error('No file selected.');
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        importData(e.target.result, addNodes, addEdges);
      }
    };

    reader.readAsText(file);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Panel position="top-right">
      <div style={{ display: 'flex', gap: '5px', flexDirection: 'row' }}>
        <ConnectKitButton />
        <IconButton onClick={handleClick} sx={{ width: '40px', height: '40px' }}>
          <svg
            width="16px"
            height="16px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20M4 12H20M4 18H20"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleExport}>Export</MenuItem>
          <MenuItem onClick={handleImport}>Import</MenuItem>
          <MenuItem onClick={handleClear}>Clear</MenuItem>
        </Menu>
        <input
          ref={fileInputRef}
          type="file"
          id="csvFileInput"
          accept=".csv"
          onChange={handleFileChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
      </div>
    </Panel>
  );
};

export default UtilPanel;
