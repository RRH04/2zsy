/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LayoutState = 'CROSS' | 'GATHER' | 'FAN' | 'SPIRAL';

export interface PhotoItem {
  id: number;
  url: string;
  title: string;
  desc: string;
  date?: string;
  location?: string;
}

export interface CardLayoutProps {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
  opacity: number;
}
