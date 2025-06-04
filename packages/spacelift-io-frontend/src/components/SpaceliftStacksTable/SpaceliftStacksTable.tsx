import { MarkdownContent, Table, TableColumn } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Chip,
  DialogTitle,
  Drawer,
  IconButton,
  Link,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import RepeatIcon from '@material-ui/icons/RepeatRounded';

import { useState } from 'react';
import {
  ALLOW_RETRY_STATES,
  DESCRIPTION_DRAWER_WIDTH,
  DESCRIPTION_TRUNCATE_LENGTH,
} from '../../constants';
import { Stack, StackState } from '../../types';

const useStyles = makeStyles(theme => ({
  neutral: {
    backgroundColor: theme.palette.grey[500],
  },
  info: {
    backgroundColor: theme.palette.info.main,
  },
  success: {
    backgroundColor: theme.palette.success.main,
  },
  danger: {
    backgroundColor: theme.palette.error.main,
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
  },
}));

// Helper function to render stack state with appropriate styling
const renderState = (classes: ReturnType<typeof useStyles>, state: StackState) => {
  const stateToClass: Record<StackState, string> = {
    APPLYING: classes.info,
    CONFIRMED: classes.warning,
    DESTROYING: classes.info,
    DISCARDED: classes.danger,
    FAILED: classes.danger,
    FINISHED: classes.success,
    INITIALIZING: classes.info,
    NONE: classes.neutral,
    PLANNING: classes.info,
    PREPARING_APPLY: classes.info,
    PREPARING_REPLAN: classes.info,
    PREPARING: classes.info,
    REPLAN_REQUESTED: classes.neutral,
    STOPPED: classes.danger,
    UNCONFIRMED: classes.warning,
  };

  const className = stateToClass[state] || classes.neutral;
  return <Chip size="small" label={state} className={className} />;
};

const renderDescription = (
  description: string | null | undefined,
  onExpand: (description: string | null) => void
) => {
  if (!description) return <span>-</span>;
  return description.length > DESCRIPTION_TRUNCATE_LENGTH ? (
    <Typography variant="inherit" onClick={() => onExpand(description)}>
      {description.slice(0, DESCRIPTION_TRUNCATE_LENGTH)} ...
    </Typography>
  ) : (
    description
  );
};

type SpaceliftStacksTableProps = {
  stacks: Stack[];
  loading: boolean;
  triggerRun: (stackId: string) => void;
};

export const SpaceliftStacksTable = ({
  stacks,
  loading,
  triggerRun,
}: SpaceliftStacksTableProps) => {
  const [description, setDescription] = useState<string | null>(null);
  const classes = useStyles();
  const config = useApi(configApiRef);
  const hostUrl = config.getString('spacelift.hostUrl');

  const columns: TableColumn<Stack>[] = [
    {
      title: 'Name',
      field: 'name',
      highlight: true,
      render: (row: Stack) => (
        <Link href={`https://${hostUrl}/stack/${row.id}`} target="_blank">
          {row.name}
        </Link>
      ),
    },
    {
      title: 'Description',
      field: 'description',
      render: (row: Stack) => renderDescription(row.description, setDescription),
    },
    {
      title: 'Labels',
      field: 'labels',
      render: (row: Stack) => {
        if (!row.labels.length) return <span>-</span>;
        return (
          <Box display="flex" flexWrap="wrap">
            {row.labels.map(label => (
              <Chip key={label} label={label} style={{ margin: '0.25rem' }} size="small" />
            ))}
          </Box>
        );
      },
    },
    {
      title: 'Current State',
      render: (row: Stack) => renderState(classes, row.state),
    },
    {
      title: 'Branch',
      field: 'branch',
    },
    {
      title: 'Space',
      render: (row: Stack) => (
        <Link href={`https://${hostUrl}/spaces/${row.spaceDetails.name}`} target="_blank">
          {row.spaceDetails.name}
        </Link>
      ),
    },
    {
      width: '30px',
      render: (row: Stack) => {
        const showAction = ALLOW_RETRY_STATES.includes(row.state);
        if (!showAction) return null;
        return (
          <Tooltip title="Trigger run">
            <IconButton onClick={() => triggerRun(row.id)}>
              <RepeatIcon />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <Table
        title="Spacelift Stacks"
        options={{
          search: true,
          paging: true,
          pageSize: 20,
          padding: 'dense',
        }}
        columns={columns}
        data={stacks}
        isLoading={loading}
        emptyContent="No stacks found"
      />
      <Drawer anchor="right" open={!!description} onClose={() => setDescription(null)}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <DialogTitle
            id="dialog-title"
            style={{
              padding: '0 1rem',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            Stack description
          </DialogTitle>
          <IconButton aria-label="close" onClick={() => setDescription(null)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box width={DESCRIPTION_DRAWER_WIDTH} padding={2} style={{ paddingTop: 0 }}>
          <MarkdownContent content={description ?? ''} />
        </Box>
      </Drawer>
    </>
  );
};
