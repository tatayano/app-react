import React from 'react';
import { createRoot } from 'react-dom/client';
import GitHub from './components/GitHub';

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<GitHub />);