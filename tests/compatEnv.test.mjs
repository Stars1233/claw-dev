import test from "node:test";
import assert from "node:assert/strict";

import { applyCompatModelEnv } from "../shared/compatEnv.js";

test("applyCompatModelEnv mirrors the selected OpenAI model into ANTHROPIC_MODEL", () => {
  const env = {
    OPENAI_MODEL: "gpt-5.4",
    ANTHROPIC_MODEL: "claude-sonnet-4-20250514",
  };

  applyCompatModelEnv("openai", env);

  assert.equal(env.ANTHROPIC_MODEL, "gpt-5.4");
});

test("applyCompatModelEnv leaves anthropic env unchanged when provider model is missing", () => {
  const env = {
    ANTHROPIC_MODEL: "claude-sonnet-4-20250514",
  };

  applyCompatModelEnv("openai", env);

  assert.equal(env.ANTHROPIC_MODEL, "claude-sonnet-4-20250514");
});
