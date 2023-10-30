export const TelemetryEvents = [
  'User Logged In',
  'User Created',
  'Project Created',
  'AuthMethod Configured',
  'Demo AuthMethod Configured',
  'Agent Created',
  'Agent Updated',
  'Agent Deleted',
  'SDK Secret Created',
  'Project Backend Connected',
  'Message Sent',
] as const;
export type TelemetryEvent = (typeof TelemetryEvents)[number];
