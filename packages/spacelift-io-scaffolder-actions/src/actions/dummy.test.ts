import { createDummyAction } from './dummy';
import { getVoidLogger } from '@backstage/backend-common';
import { PassThrough } from 'stream';
import { JsonObject } from '@backstage/types';

describe('createDummyAction', () => {
  const mockLogger = getVoidLogger();
  const loggerSpy = jest.spyOn(mockLogger, 'info');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a dummy action with correct id and description', () => {
    const action = createDummyAction();
    
    expect(action.id).toBe('spacelift:dummy');
    expect(action.description).toBe('A simple dummy action for Spacelift.io integration');
  });

  it('should execute with default message when no input provided', async () => {
    const action = createDummyAction();
    
    await action.handler({
      input: {},
      logger: mockLogger,
      logStream: new PassThrough(),
      output: jest.fn(),
      createTemporaryDirectory: jest.fn(),
      workspacePath: '/tmp/test',
      checkpoint: jest.fn(),
      getInitiatorCredentials: jest.fn(),
    });

    // expect(loggerSpy).toHaveBeenCalledWith('Spacelift.io dummy action executed');
    expect(loggerSpy).toHaveBeenCalledWith('Hello from Spacelift.io scaffolder action!');
    // expect(loggerSpy).toHaveBeenCalledWith('Dummy action completed successfully');
  });

  it('should execute with custom message and name', async () => {
    const action = createDummyAction();
    
    await action.handler({
      input: {
        message: 'Welcome to Spacelift!',
        name: 'Developer'
      },
      logger: mockLogger,
      logStream: new PassThrough(),
      output: jest.fn(),
      createTemporaryDirectory: jest.fn(),
      workspacePath: '/tmp/test',
      checkpoint: jest.fn(),
      getInitiatorCredentials: jest.fn(),
    });

    expect(loggerSpy).toHaveBeenCalledWith('Welcome to Spacelift! Hello, Developer!');
  });

  it('should execute with custom message but no name', async () => {
    const action = createDummyAction();
    
    await action.handler({
      input: {
        message: 'Custom message without name'
      },
      logger: mockLogger,
      logStream: new PassThrough(),
      output: jest.fn(),
      createTemporaryDirectory: jest.fn(),
      workspacePath: '/tmp/test',
      checkpoint: jest.fn(),
      getInitiatorCredentials: jest.fn(),
    });

    expect(loggerSpy).toHaveBeenCalledWith('Custom message without name');
  });
});
