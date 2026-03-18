import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  NavProvider, NavLayout, Sidebar, NavBar, NavGroup,
  WorkspaceSwitcher, UserMenu, PlanBadge, NotificationBell,
  NavFeatureFlagProvider, FeatureGate, OnboardingProgress,
} from '../../src';
import { sampleUser, sampleWorkspaces, Icons } from '../_data';
import type { NavItemType, Workspace } from '../../src';

const meta: Meta = {
  title: 'Recipes/SaaS Platform',
  tags: ['autodocs'],
};

export default meta;

const saasItems: NavItemType[] = [
  { id: 'home', type: 'link', label: 'Home', href: '/', icon: <Icons.Home /> },
  {
    id: 'projects',
    type: 'group',
    label: 'Projects',
    icon: <Icons.Products />,
    defaultOpened: true,
    children: [
      { id: 'active', type: 'link', label: 'Active', href: '/projects/active' },
      { id: 'archived', type: 'link', label: 'Archived', href: '/projects/archived' },
    ],
  },
  { id: 'team', type: 'link', label: 'Team', href: '/team', icon: <Icons.Customers /> },
  { id: 'analytics', type: 'link', label: 'Analytics', href: '/analytics', icon: <Icons.Analytics /> },
  { id: 'div-1', type: 'divider' },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings', icon: <Icons.Settings /> },
];

const onboardingSteps = [
  { id: 's1', label: 'Create account', completed: true },
  { id: 's2', label: 'Set up workspace', completed: true },
  { id: 's3', label: 'Invite team members', completed: false },
  { id: 's4', label: 'Create first project', completed: false },
];

export const Default: StoryObj = {
  render: function SaaSDemo() {
    const [activeWs, setActiveWs] = useState<Workspace>(sampleWorkspaces[0]!);

    return (
      <NavFeatureFlagProvider
        flags={{ analytics: true, advancedReports: false }}
        entitlements={['projects', 'team']}
      >
        <NavProvider>
          <div style={{ height: 600 }}>
            <NavLayout
              navbar={
                <NavBar
                  logo={<span style={{ fontWeight: 700, fontSize: 18 }}>SaaSApp</span>}
                  sticky
                  rightSection={
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <NotificationBell count={2} />
                    </div>
                  }
                />
              }
              sidebar={
                <Sidebar
                  header={
                    <WorkspaceSwitcher
                      workspaces={sampleWorkspaces}
                      activeWorkspace={activeWs}
                      onSwitch={setActiveWs}
                      searchable
                    />
                  }
                  footer={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8 }}>
                      <PlanBadge plan="Pro" showUpgrade onUpgrade={() => {}} />
                      <UserMenu
                        user={sampleUser}
                        menuItems={[
                          { label: 'Profile', href: '/profile' },
                          { label: 'Sign out', onClick: () => {} },
                        ]}
                      />
                    </div>
                  }
                >
                  <NavGroup items={saasItems} currentPath="/" />
                  <div style={{ padding: 12 }}>
                    <OnboardingProgress steps={onboardingSteps} variant="checklist" dismissible />
                  </div>
                </Sidebar>
              }
            >
              <div style={{ padding: 24 }}>
                <h2>{activeWs.name}</h2>
                <p>Welcome to your workspace.</p>
                <FeatureGate flag="advancedReports" whenHidden="lock" lockMessage="Upgrade to Pro">
                  <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
                    Advanced Reports (locked for this demo)
                  </div>
                </FeatureGate>
              </div>
            </NavLayout>
          </div>
        </NavProvider>
      </NavFeatureFlagProvider>
    );
  },
};
