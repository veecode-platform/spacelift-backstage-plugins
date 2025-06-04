import { Content, Header, HeaderLabel, Page } from '@backstage/core-components';
import { Box, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useFetchStacks } from '../../hooks/useFetchStacks';
import { useTriggerRun } from '../../hooks/useTriggerRun';
import { SpaceliftStacksTable } from '../SpaceliftStacksTable';

export const StacksPage = () => {
  const { stacks, loading: stacksLoading, error: stacksError, retry: getStacks } = useFetchStacks();
  const {
    triggerRun,
    loading: loadingTriggerRun,
    error: errorTriggerRun,
    clear: clearTriggerRunError,
  } = useTriggerRun();

  const handleTriggerRun = async (stackId: string) => {
    const res = await triggerRun(stackId);
    if (res?.id) {
      getStacks();
    }
  };

  const isLoading = stacksLoading || loadingTriggerRun;

  return (
    <Page themeId="tool">
      <Header title="Spacelift" subtitle="Manage your stacks">
        <HeaderLabel label="Stacks" value="List of stacks" />
      </Header>
      <Content>
        <Box display="flex" flexDirection="column" style={{ gap: '16px' }}>
          {stacksError && (
            <Alert
              variant="outlined"
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={getStacks}>
                  RETRY
                </Button>
              }
            >
              Failed to load Spacelift stacks: {stacksError.message}
            </Alert>
          )}
          {!stacksError && errorTriggerRun && (
            <Alert variant="outlined" severity="warning" onClose={clearTriggerRunError}>
              Spacelift action failed: {errorTriggerRun.message}
            </Alert>
          )}
          <SpaceliftStacksTable stacks={stacks} loading={isLoading} triggerRun={handleTriggerRun} />
        </Box>
      </Content>
    </Page>
  );
};
