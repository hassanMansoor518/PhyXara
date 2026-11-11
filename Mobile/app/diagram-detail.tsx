import React from 'react';
import DiagramDetailDefault, { DiagramDetailScreen } from '../src/screens/DiagramDetailScreen';

export default function DiagramDetailRoute() {
  const Component = DiagramDetailDefault || DiagramDetailScreen;
  if (!Component) {
    return null;
  }
  return <Component />;
}

