import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  NavProvider, NavLayout, Sidebar, NavBar, NavGroup,
  DashboardSwitcher, FilterIndicator, LiveDataStatus, FilterPanel,
} from '../../src';
import { Icons } from '../_data';
import type { NavItemType, Dashboard } from '../../src';

const meta: Meta = {
  title: 'Recipes/Analytics Dashboard',
  tags: ['autodocs'],
};

export default meta;

const analyticsItems: NavItemType[] = [
  { id: 'overview', type: 'link', label: 'Overview', href: '/overview', icon: <Icons.Home /> },
  {
    id: 'reports',
    type: 'group',
    label: 'Reports',
    icon: <Icons.Analytics />,
    defaultOpened: true,
    children: [
      { id: 'traffic', type: 'link', label: 'Traffic', href: '/reports/traffic' },
      { id: 'conversions', type: 'link', label: 'Conversions', href: '/reports/conversions' },
      { id: 'revenue', type: 'link', label: 'Revenue', href: '/reports/revenue' },
    ],
  },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings', icon: <Icons.Settings /> },
];

const dashboards: Dashboard[] = [
  { id: 'd1', name: 'Overview' },
  { id: 'd2', name: 'Traffic' },
  { id: 'd3', name: 'Revenue' },
];

export const Default: StoryObj = {
  render: function AnalyticsDemo() {
    const [activeDash, setActiveDash] = useState<Dashboard>(dashboards[0]!);

    return (
      <NavProvider>
        <div style={{ height: 600 }}>
          <NavLayout
            navbar={
              <NavBar
                logo={<span style={{ fontWeight: 700, fontSize: 18 }}>Analytics</span>}
                sticky
                rightSection={
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <LiveDataStatus status="connected" variant="badge" />
                    <FilterIndicator
                      datePreset="Last 7 days"
                      filters={[{ key: 'region', label: 'Region', value: 'US' }]}
                    />
                  </div>
                }
              />
            }
            sidebar={
              <Sidebar
                header={
                  <DashboardSwitcher
                    dashboards={dashboards}
                    activeDashboard={activeDash}
                    onSwitch={setActiveDash}
                  />
                }
              >
                <NavGroup items={analyticsItems} currentPath="/overview" />
              </Sidebar>
            }
          >
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ flex: 1, padding: 24 }}>
                <h2>{activeDash.name} Dashboard</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
                  {['Visitors', 'Page Views', 'Bounce Rate', 'Avg. Duration'].map((metric) => (
                    <div key={metric} style={{ padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>{metric}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                        {Math.floor(Math.random() * 10000)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <FilterPanel width={240} defaultOpened={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label>
                    Region
                    <select style={{ display: 'block', width: '100%', marginTop: 4 }}>
                      <option>All</option>
                      <option>US</option>
                      <option>EU</option>
                      <option>APAC</option>
                    </select>
                  </label>
                  <label>
                    Device
                    <select style={{ display: 'block', width: '100%', marginTop: 4 }}>
                      <option>All</option>
                      <option>Desktop</option>
                      <option>Mobile</option>
                    </select>
                  </label>
                </div>
              </FilterPanel>
            </div>
          </NavLayout>
        </div>
      </NavProvider>
    );
  },
};
