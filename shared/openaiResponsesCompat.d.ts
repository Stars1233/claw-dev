export function openAICompatibleMessagesToResponsesInput(
  messages: Array<Record<string, unknown>>,
): Array<Record<string, unknown>>;

export function openAICompatibleToolsToResponsesTools(
  tools: Array<Record<string, unknown>>,
): Array<Record<string, unknown>>;

export function parseResponsesSseToAnthropicContent(sseText: string): Array<Record<string, unknown>>;
