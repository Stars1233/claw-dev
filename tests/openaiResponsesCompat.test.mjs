import test from "node:test";
import assert from "node:assert/strict";

import {
  openAICompatibleMessagesToResponsesInput,
  openAICompatibleToolsToResponsesTools,
  parseResponsesSseToAnthropicContent,
} from "../shared/openaiResponsesCompat.js";

test("openAICompatibleMessagesToResponsesInput converts assistant tool history", () => {
  const input = openAICompatibleMessagesToResponsesInput([
    { role: "user", content: "hello" },
    {
      role: "assistant",
      content: "calling tool",
      tool_calls: [{ id: "call-1", function: { name: "weather", arguments: "{\"city\":\"Seoul\"}" } }],
    },
    { role: "tool", tool_call_id: "call-1", content: "sunny" },
  ]);

  assert.deepEqual(input, [
    { type: "message", role: "user", content: [{ type: "input_text", text: "hello" }] },
    { type: "message", role: "assistant", content: [{ type: "output_text", text: "calling tool" }] },
    { type: "function_call", call_id: "call-1", name: "weather", arguments: "{\"city\":\"Seoul\"}" },
    { type: "function_call_output", call_id: "call-1", output: [{ type: "input_text", text: "sunny" }] },
  ]);
});

test("openAICompatibleToolsToResponsesTools flattens function tools", () => {
  const tools = openAICompatibleToolsToResponsesTools([
    {
      type: "function",
      function: {
        name: "weather",
        description: "Get weather",
        parameters: { type: "object", properties: { city: { type: "string" } } },
      },
    },
  ]);

  assert.deepEqual(tools, [
    {
      type: "function",
      name: "weather",
      description: "Get weather",
      parameters: { type: "object", properties: { city: { type: "string" } } },
      strict: false,
    },
  ]);
});

test("parseResponsesSseToAnthropicContent extracts text and tool calls", () => {
  const sse = [
    "event: response.output_item.done",
    'data: {"type":"response.output_item.done","item":{"type":"message","role":"assistant","id":"msg-1","content":[{"type":"output_text","text":"Hello"}]}}',
    "",
    "event: response.output_item.done",
    'data: {"type":"response.output_item.done","item":{"type":"function_call","call_id":"call-1","name":"weather","arguments":"{\\"city\\":\\"Seoul\\"}"}}',
    "",
    "event: response.completed",
    'data: {"type":"response.completed","response":{"id":"resp-1"}}',
    "",
  ].join("\n");

  assert.deepEqual(parseResponsesSseToAnthropicContent(sse), [
    { type: "text", text: "Hello", citations: null },
    { type: "tool_use", id: "call-1", name: "weather", input: { city: "Seoul" } },
  ]);
});
