
import React from 'react';
import { Sword, Shield, FlaskConical, Target, X, Type } from 'lucide-react';

export const STATUS_ICONS = [
  { id: 'sword', icon: <Sword size={16} />, label: 'Offense' },
  { id: 'shield', icon: <Shield size={16} />, label: 'Defense' },
  { id: 'potion', icon: <FlaskConical size={16} />, label: 'Status' },
  { id: 'target', icon: <Target size={16} />, label: 'Accuracy' },
  { id: 'cross', icon: <X size={16} />, label: 'Special' },
  { id: 'y', icon: <Type size={16} />, label: 'Action' },
];

export const ICON_COLORS = [
  { id: 'blue', bg: 'bg-blue-600', border: 'border-blue-900', hover: 'hover:bg-blue-500' },
  { id: 'red', bg: 'bg-red-600', border: 'border-red-900', hover: 'hover:bg-red-500' },
  { id: 'purple', bg: 'bg-purple-600', border: 'border-purple-900', hover: 'hover:bg-purple-500' },
  { id: 'yellow', bg: 'bg-yellow-600', border: 'border-yellow-900', hover: 'hover:bg-yellow-500' },
  { id: 'green', bg: 'bg-green-600', border: 'border-green-900', hover: 'hover:bg-green-500' },
  { id: 'teal', bg: 'bg-teal-600', border: 'border-teal-900', hover: 'hover:bg-teal-500' },
];
