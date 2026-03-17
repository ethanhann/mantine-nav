'use client';

import { useState, type ReactNode } from 'react';
import { Collapse } from '@mantine/core';
import classes from './NavSection.module.css';

export interface NavSectionProps {
  label?: ReactNode;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultOpened?: boolean;
  rightSection?: ReactNode;
  divider?: boolean | 'top' | 'bottom' | 'both';
  children: ReactNode;
  hiddenInRail?: boolean;
}

export function NavSection({
  label,
  icon,
  collapsible = false,
  defaultOpened = true,
  rightSection,
  divider = 'top',
  children,
}: NavSectionProps) {
  const [opened, setOpened] = useState(defaultOpened);

  const showDividerTop = divider === true || divider === 'top' || divider === 'both';
  const showDividerBottom = divider === 'bottom' || divider === 'both';

  const headerContent = (
    <>
      {icon && <span className={classes.headerIcon}>{icon}</span>}
      {label && <span className={classes.headerLabel}>{label}</span>}
      {rightSection && <span className={classes.rightSection}>{rightSection}</span>}
      {collapsible && (
        <span
          className={classes.chevron}
          data-expanded={opened || undefined}
          aria-hidden="true"
        >
          ▸
        </span>
      )}
    </>
  );

  return (
    <div className={classes.root}>
      {showDividerTop && <div className={classes.divider} role="separator" />}

      {(label || icon) && (
        collapsible ? (
          <button
            className={`${classes.header} ${classes.headerClickable}`}
            type="button"
            onClick={() => setOpened(!opened)}
            aria-expanded={opened}
            role="heading"
            aria-level={2}
          >
            {headerContent}
          </button>
        ) : (
          <div className={classes.header} role="heading" aria-level={2}>
            {headerContent}
          </div>
        )
      )}

      {collapsible ? (
        <Collapse in={opened}>
          <div className={classes.content} role="group" aria-label={typeof label === 'string' ? label : undefined}>
            {children}
          </div>
        </Collapse>
      ) : (
        <div className={classes.content} role="group" aria-label={typeof label === 'string' ? label : undefined}>
          {children}
        </div>
      )}

      {showDividerBottom && <div className={classes.divider} role="separator" />}
    </div>
  );
}
