---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 

The SDK provides you a set of programmatic tools to interact with LLMs, embeddings models, and agentic flows.

## Installing the SDK

`lmstudio-js` is available as an npm package. You can install it using npm, yarn, or pnpm.

```lms_code_snippet
  variants:
    npm:
      language: bash
      code: |
        npm install @lmstudio/sdk --save
    yarn:
      language: bash
      code: |
        yarn add @lmstudio/sdk
    pnpm:
      language: bash
      code: |
        pnpm add @lmstudio/sdk
```

For the source code and open source contribution, visit [lmstudio-js](https://github.com/lmstudio-ai/lmstudio-js) on GitHub.

## Features

- Use LLMs to [respond in chats](./typescript/llm-prediction/chat-completion) or predict [text completions](./typescript/llm-prediction/completion)
- Define functions as tools, and turn LLMs into [autonomous agents](./typescript/agent/act) that run completely locally
- [Load](./typescript/manage-models/loading), [configure](./typescript/llm-prediction/parameters), and [unload](./typescript/manage-models/loading) models from memory
- Supports for both browser and any Node-compatible environments
- Generate embeddings for text, and more!

## Quick Example: Chat with a Llama Model

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        const model = await client.llm.model("qwen/qwen3-4b-2507");
        const result = await model.respond("What is the meaning of life?");

        console.info(result.content);
```

### Getting Local Models

The above code requires the [qwen3-4b-2507](https://lmstudio.ai/models/qwen/qwen3-4b-2507). If you don't have the model, run the following command in the terminal to download it.

```bash
lms get qwen/qwen3-4b-2507
```

Read more about `lms get` in LM Studio's CLI [here](./cli/get).


`@lmstudio/sdk` is a library published on npm that allows you to use `lmstudio-js` in your own projects. It is open source and it's developed on GitHub. You can find the source code [here](https://github.com/lmstudio-ai/lmstudio-js).

## Creating a New `node` Project

Use the following command to start an interactive project setup:

```lms_code_snippet
  variants:
    TypeScript (Recommended):
      language: bash
      code: |
        lms create node-typescript
    Javascript:
      language: bash
      code: |
        lms create node-javascript
```

## Add `lmstudio-js` to an Exiting Project

If you have already created a project and would like to use `lmstudio-js` in it, you can install it using npm, yarn, or pnpm.

```lms_code_snippet
  variants:
    npm:
      language: bash
      code: |
        npm install @lmstudio/sdk --save
    yarn:
      language: bash
      code: |
        yarn add @lmstudio/sdk
    pnpm:
      language: bash
      code: |
        pnpm add @lmstudio/sdk
```

Use `llm.respond(...)` to generate completions for a chat conversation.

## Quick Example: Generate a Chat Response

The following snippet shows how to stream the AI's response to quick chat prompt.

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        const model = await client.llm.model();

        for await (const fragment of model.respond("What is the meaning of life?")) {
          process.stdout.write(fragment.content);
        }
```

## Obtain a Model

First, you need to get a model handle. This can be done using the `model` method in the `llm` namespace. For example, here is how to use Qwen2.5 7B Instruct.

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        const model = await client.llm.model("qwen2.5-7b-instruct");
```

There are other ways to get a model handle. See [Managing Models in Memory](./../manage-models/loading) for more info.

## Manage Chat Context

The input to the model is referred to as the "context". Conceptually, the model receives a multi-turn conversation as input, and it is asked to predict the assistant's response in that conversation.

```lms_code_snippet
  variants:
    "Using an array of messages":
      language: typescript
      code: |
        import { Chat } from "@lmstudio/sdk";

        // Create a chat object from an array of messages.
        const chat = Chat.from([
          { role: "system", content: "You are a resident AI philosopher." },
          { role: "user", content: "What is the meaning of life?" },
        ]);
    "Constructing a Chat object":
      language: typescript
      code: |
        import { Chat } from "@lmstudio/sdk";

        // Create an empty chat object.
        const chat = Chat.empty();

        // Build the chat context by appending messages.
        chat.append("system", "You are a resident AI philosopher.");
        chat.append("user", "What is the meaning of life?");
```

See [Working with Chats](./working-with-chats) for more information on managing chat context.

<!-- , and [`Chat`](./../api-reference/chat) for API reference for the `Chat` class. -->

## Generate a response

You can ask the LLM to predict the next response in the chat context using the `respond()` method.

```lms_code_snippet
  variants:
    Streaming:
      language: typescript
      code: |
        // The `chat` object is created in the previous step.
        const prediction = model.respond(chat);

        for await (const { content } of prediction) {
          process.stdout.write(content);
        }

        console.info(); // Write a new line to prevent text from being overwritten by your shell.

    "Non-streaming":
      language: typescript
      code: |
        // The `chat` object is created in the previous step.
        const result = await model.respond(chat);

        console.info(result.content);
```

## Customize Inferencing Parameters

You can pass in inferencing parameters as the second parameter to `.respond()`.

```lms_code_snippet
  variants:
    Streaming:
      language: typescript
      code: |
        const prediction = model.respond(chat, {
          temperature: 0.6,
          maxTokens: 50,
        });

    "Non-streaming":
      language: typescript
      code: |
        const result = await model.respond(chat, {
          temperature: 0.6,
          maxTokens: 50,
        });
```

See [Configuring the Model](./parameters) for more information on what can be configured.

## Print prediction stats

You can also print prediction metadata, such as the model used for generation, number of generated
tokens, time to first token, and stop reason.

```lms_code_snippet
  variants:
    Streaming:
      language: typescript
      code: |
        // If you have already iterated through the prediction fragments,
        // doing this will not result in extra waiting.
        const result = await prediction.result();

        console.info("Model used:", result.modelInfo.displayName);
        console.info("Predicted tokens:", result.stats.predictedTokensCount);
        console.info("Time to first token (seconds):", result.stats.timeToFirstTokenSec);
        console.info("Stop reason:", result.stats.stopReason);
    "Non-streaming":
      language: typescript
      code: |
        // `result` is the response from the model.
        console.info("Model used:", result.modelInfo.displayName);
        console.info("Predicted tokens:", result.stats.predictedTokensCount);
        console.info("Time to first token (seconds):", result.stats.timeToFirstTokenSec);
        console.info("Stop reason:", result.stats.stopReason);
```

## Example: Multi-turn Chat

<!-- TODO: Probably needs polish here: -->

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { Chat, LMStudioClient } from "@lmstudio/sdk";
        import { createInterface } from "readline/promises";

        const rl = createInterface({ input: process.stdin, output: process.stdout });
        const client = new LMStudioClient();
        const model = await client.llm.model();
        const chat = Chat.empty();

        while (true) {
          const input = await rl.question("You: ");
          // Append the user input to the chat
          chat.append("user", input);

          const prediction = model.respond(chat, {
            // When the model finish the entire message, push it to the chat
            onMessage: (message) => chat.append(message),
          });
          process.stdout.write("Bot: ");
          for await (const { content } of prediction) {
            process.stdout.write(content);
          }
          process.stdout.write("\n");
        }
```

<!-- ### Progress callbacks

TODO: Cover onFirstToken callback (Python SDK has this now)

Long prompts will often take a long time to first token, i.e. it takes the model a long time to process your prompt.
If you want to get updates on the progress of this process, you can provide a float callback to `respond`
that receives a float from 0.0-1.0 representing prompt processing progress.

```lms_code_snippet
  variants:
    Python:
      language: python
      code: |
        import lmstudio as lm

        llm = lm.llm()

        response = llm.respond(
            "What is LM Studio?",
            on_progress: lambda progress: print(f"{progress*100}% complete")
        )

    Python (with scoped resources):
      language: python
      code: |
        import lmstudio

        with lmstudio.Client() as client:
            llm = client.llm.model()

            response = llm.respond(
                "What is LM Studio?",
                on_progress: lambda progress: print(f"{progress*100}% processed")
            )

    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const llm = await client.llm.model();

        const prediction = llm.respond(
          "What is LM Studio?",
          {onPromptProcessingProgress: (progress) => process.stdout.write(`${progress*100}% processed`)});
```

### Prediction configuration

You can also specify the same prediction configuration options as you could in the
in-app chat window sidebar. Please consult your specific SDK to see exact syntax. -->


SDK methods such as `model.respond()`, `model.applyPromptTemplate()`, or `model.act()`
takes in a chat parameter as an input. There are a few ways to represent a chat in the SDK.

## Option 1: Array of Messages

You can use an array of messages to represent a chat. Here is an example with the `.respond()` method.

```lms_code_snippet
variants:
  "Text-only":
    language: typescript
    code: |
      const prediction = model.respond([
        { role: "system", content: "You are a resident AI philosopher." },
        { role: "user", content: "What is the meaning of life?" },
      ]);
  With Images:
    language: typescript
    code: |
      const image = await client.files.prepareImage("/path/to/image.jpg");

      const prediction = model.respond([
        { role: "system", content: "You are a state-of-art object recognition system." },
        { role: "user", content: "What is this object?", images: [image] },
      ]);
```

## Option 2: Input a Single String

If your chat only has one single user message, you can use a single string to represent the chat. Here is an example with the `.respond` method.

```lms_code_snippet
variants:
  TypeScript:
    language: typescript
    code: |
      const prediction = model.respond("What is the meaning of life?");
```

## Option 3: Using the `Chat` Helper Class

For more complex tasks, it is recommended to use the `Chat` helper classes. It provides various commonly used methods to manage the chat. Here is an example with the `Chat` class.

```lms_code_snippet
variants:
  "Text-only":
    language: typescript
    code: |
      const chat = Chat.empty();
      chat.append("system", "You are a resident AI philosopher.");
      chat.append("user", "What is the meaning of life?");

      const prediction = model.respond(chat);
  With Images:
    language: typescript
    code: |
      const image = await client.files.prepareImage("/path/to/image.jpg");

      const chat = Chat.empty();
      chat.append("system", "You are a state-of-art object recognition system.");
      chat.append("user", "What is this object?", { images: [image] });

      const prediction = model.respond(chat);
```

You can also quickly construct a `Chat` object using the `Chat.from` method.

```lms_code_snippet
variants:
  "Array of messages":
    language: typescript
    code: |
      const chat = Chat.from([
        { role: "system", content: "You are a resident AI philosopher." },
        { role: "user", content: "What is the meaning of life?" },
      ]);
  "Single string":
    language: typescript
    code: |
      // This constructs a chat with a single user message
      const chat = Chat.from("What is the meaning of life?");
```


Sometimes you may want to halt a prediction before it finishes. For example, the user might change their mind or your UI may navigate away. `lmstudio-js` provides two simple ways to cancel a running prediction.

## 1. Call `.cancel()` on the prediction

Every prediction method returns an `OngoingPrediction` instance. Calling `.cancel()` stops generation and causes the final `stopReason` to be `"userStopped"`. In the example below we schedule the cancel call on a timer:

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const model = await client.llm.model("qwen2.5-7b-instruct");

        const prediction = model.respond("What is the meaning of life?", {
          maxTokens: 50,
        });
        setTimeout(() => prediction.cancel(), 1000); // cancel after 1 second

        const result = await prediction.result();
        console.info(result.stats.stopReason); // "userStopped"
```

## 2. Use an `AbortController`

If your application already uses an `AbortController` to propagate cancellation, you can pass its `signal` to the prediction method. Aborting the controller stops the prediction with the same `stopReason`:

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const model = await client.llm.model("qwen2.5-7b-instruct");

        const controller = new AbortController();
        const prediction = model.respond("What is the meaning of life?", {
          maxTokens: 50,
          signal: controller.signal,
        });
        setTimeout(() => controller.abort(), 1000); // cancel after 1 second

        const result = await prediction.result();
        console.info(result.stats.stopReason); // "userStopped"
```

Both approaches halt generation immediately, and the returned stats indicate that the prediction ended because you stopped it.


Some models, known as VLMs (Vision-Language Models), can accept images as input. You can pass images to the model using the `.respond()` method.

### Prerequisite: Get a VLM (Vision-Language Model)

If you don't yet have a VLM, you can download a model like `qwen2-vl-2b-instruct` using the following command:

```bash
lms get qwen2-vl-2b-instruct
```

## 1. Instantiate the Model

Connect to LM Studio and obtain a handle to the VLM (Vision-Language Model) you want to use.

```lms_code_snippet
  variants:
    Example:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        const model = await client.llm.model("qwen2-vl-2b-instruct");
```

## 2. Prepare the Image

Use the `client.files.prepareImage()` method to get a handle to the image that can be subsequently passed to the model.

```lms_code_snippet
  variants:
    Example:
      language: typescript
      code: |
        const imagePath = "/path/to/image.jpg"; // Replace with the path to your image
        const image = await client.files.prepareImage(imagePath);

```

If you only have the image in the form of a base64 string, you can use the `client.files.prepareImageBase64()` method instead.

```lms_code_snippet
  variants:
    Example:
      language: typescript
      code: |
        const imageBase64 = "Your base64 string here";
        const image = await client.files.prepareImageBase64(imageBase64);
```

The LM Studio server supports JPEG, PNG, and WebP image formats.

## 3. Pass the Image to the Model in `.respond()`

Generate a prediction by passing the image to the model in the `.respond()` method.

```lms_code_snippet
  variants:
    Example:
      language: typescript
      code: |
        const prediction = model.respond([
          { role: "user", content: "Describe this image please", images: [image] },
        ]);
```


You can enforce a particular response format from an LLM by providing a schema (JSON or `zod`) to the `.respond()` method. This guarantees that the model's output conforms to the schema you provide.

## Enforce Using a `zod` Schema

If you wish the model to generate JSON that satisfies a given schema, it is recommended to provide
the schema using [`zod`](https://zod.dev/). When a `zod` schema is provided, the prediction result will contain an extra field `parsed`, which contains parsed, validated, and typed result.

#### Define a `zod` Schema

```ts
import { z } from "zod";

// A zod schema for a book
const bookSchema = z.object({
  title: z.string(),
  author: z.string(),
  year: z.number().int(),
});
```

#### Generate a Structured Response

```lms_code_snippet
  variants:
    "Non-streaming":
      language: typescript
      code: |
        const result = await model.respond("Tell me about The Hobbit.",
          { structured: bookSchema },
          maxTokens: 100, // Recommended to avoid getting stuck
        );

        const book = result.parsed;
        console.info(book);
        //           ^
        // Note that `book` is now correctly typed as { title: string, author: string, year: number }

    Streaming:
      language: typescript
      code: |
        const prediction = model.respond("Tell me about The Hobbit.",
          { structured: bookSchema },
          maxTokens: 100, // Recommended to avoid getting stuck
        );

        for await (const { content } of prediction) {
          process.stdout.write(content);
        }
        process.stdout.write("\n");

        // Get the final structured result
        const result = await prediction.result();
        const book = result.parsed;

        console.info(book);
        //           ^
        // Note that `book` is now correctly typed as { title: string, author: string, year: number }
```

## Enforce Using a JSON Schema

You can also enforce a structured response using a JSON schema.

#### Define a JSON Schema

```ts
// A JSON schema for a book
const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    author: { type: "string" },
    year: { type: "integer" },
  },
  required: ["title", "author", "year"],
};
```

#### Generate a Structured Response

```lms_code_snippet
  variants:
    "Non-streaming":
      language: typescript
      code: |
        const result = await model.respond("Tell me about The Hobbit.", {
          structured: {
            type: "json",
            jsonSchema: schema,
          },
          maxTokens: 100, // Recommended to avoid getting stuck
        });

        const book = JSON.parse(result.content);
        console.info(book);
    Streaming:
      language: typescript
      code: |
        const prediction = model.respond("Tell me about The Hobbit.", {
          structured: {
            type: "json",
            jsonSchema: schema,
          },
          maxTokens: 100, // Recommended to avoid getting stuck
        });

        for await (const { content } of prediction) {
          process.stdout.write(content);
        }
        process.stdout.write("\n");

        const result = await prediction.result();
        const book = JSON.parse(result.content);

        console.info("Parsed", book);
```

```lms_warning
Structured generation works by constraining the model to only generate tokens that conform to the provided schema. This ensures valid output in normal cases, but comes with two important limitations:

1. Models (especially smaller ones) may occasionally get stuck in an unclosed structure (like an open bracket), when they "forget" they are in such structure and cannot stop due to schema requirements. Thus, it is recommended to always include a `maxTokens` parameter to prevent infinite generation.

2. Schema compliance is only guaranteed for complete, successful generations. If generation is interrupted (by cancellation, reaching the `maxTokens` limit, or other reasons), the output will likely violate the schema. With `zod` schema input, this will raise an error; with JSON schema, you'll receive an invalid string that doesn't satisfy schema.
```

<!-- ## Overview

Once you have [downloaded and loaded](/docs/basics/index) a large language model,
you can use it to respond to input through the API. This article covers getting JSON structured output, but you can also
[request text completions](/docs/api/sdk/completion),
[request chat responses](/docs/api/sdk/chat-completion), and
[use a vision-language model to chat about images](/docs/api/sdk/image-input).

### Usage

Certain models are trained to output valid JSON data that conforms to
a user-provided schema, which can be used programmatically in applications
that need structured data. This structured data format is supported by both
[`complete`](/docs/api/sdk/completion) and [`respond`](/docs/api/sdk/chat-completion)
methods, and relies on Pydantic in Python and Zod in TypeScript.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        import { z } from "zod";

        const Book = z.object({
          title: z.string(),
          author: z.string(),
          year: z.number().int()
        })

        const client = new LMStudioClient();
        const llm = await client.llm.model();

        const response = await llm.respond(
          "Tell me about The Hobbit.",
          { structured: Book },
        )

        console.log(response.content.title)
``` -->


Speculative decoding is a technique that can substantially increase the generation speed of large language models (LLMs) without reducing response quality. See [Speculative Decoding](./../../app/advanced/speculative-decoding) for more info.

To use speculative decoding in `lmstudio-js`, simply provide a `draftModel` parameter when performing the prediction. You do not need to load the draft model separately.

```lms_code_snippet
  variants:
    "Non-streaming":
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();

        const mainModelKey = "qwen2.5-7b-instruct";
        const draftModelKey = "qwen2.5-0.5b-instruct";

        const model = await client.llm.model(mainModelKey);
        const result = await model.respond("What are the prime numbers between 0 and 100?", {
          draftModel: draftModelKey,
        });

        const { content, stats } = result;
        console.info(content);
        console.info(`Accepted ${stats.acceptedDraftTokensCount}/${stats.predictedTokensCount} tokens`);


    Streaming:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();

        const mainModelKey = "qwen2.5-7b-instruct";
        const draftModelKey = "qwen2.5-0.5b-instruct";

        const model = await client.llm.model(mainModelKey);
        const prediction = model.respond("What are the prime numbers between 0 and 100?", {
          draftModel: draftModelKey,
        });

        for await (const { content } of prediction) {
          process.stdout.write(content);
        }
        process.stdout.write("\n");

        const { stats } = await prediction.result();
        console.info(`Accepted ${stats.acceptedDraftTokensCount}/${stats.predictedTokensCount} tokens`);
```


Use `llm.complete(...)` to generate text completions from a loaded language model. Text completions mean sending an non-formatted string to the model with the expectation that the model will complete the text.

This is different from multi-turn chat conversations. For more information on chat completions, see [Chat Completions](./chat-completion).

## 1. Instantiate a Model

First, you need to load a model to generate completions from. This can be done using the `model` method on the `llm` handle.

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const model = await client.llm.model("qwen2.5-7b-instruct");
```

## 2. Generate a Completion

Once you have a loaded model, you can generate completions by passing a string to the `complete` method on the `llm` handle.

```lms_code_snippet
  variants:
    Streaming:
      language: typescript
      code: |
        const completion = model.complete("My name is", {
          maxTokens: 100,
        });

        for await (const { content } of completion) {
          process.stdout.write(content);
        }

        console.info(); // Write a new line for cosmetic purposes

    "Non-streaming":
      language: typescript
      code: |
        const completion = await model.complete("My name is", {
          maxTokens: 100,
        });

        console.info(completion.content);
```

## 3. Print Prediction Stats

You can also print prediction metadata, such as the model used for generation, number of generated tokens, time to first token, and stop reason.

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        console.info("Model used:", completion.modelInfo.displayName);
        console.info("Predicted tokens:", completion.stats.predictedTokensCount);
        console.info("Time to first token (seconds):", completion.stats.timeToFirstTokenSec);
        console.info("Stop reason:", completion.stats.stopReason);
```

## Example: Get an LLM to Simulate a Terminal

Here's an example of how you might use the `complete` method to simulate a terminal.

```lms_code_snippet
  title: "terminal-sim.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        import { createInterface } from "node:readline/promises";

        const rl = createInterface({ input: process.stdin, output: process.stdout });
        const client = new LMStudioClient();
        const model = await client.llm.model();
        let history = "";

        while (true) {
          const command = await rl.question("$ ");
          history += "$ " + command + "\n";

          const prediction = model.complete(history, { stopStrings: ["$"] });
          for await (const { content } of prediction) {
            process.stdout.write(content);
          }
          process.stdout.write("\n");

          const { content } = await prediction.result();
          history += content;
        }
```

<!-- ## Advanced Usage

### Prediction metadata

Prediction responses are really returned as `PredictionResult` objects that contain additional dot-accessible metadata about the inference request.
This entails info about the model used, the configuration with which it was loaded, and the configuration for this particular prediction. It also provides
inference statistics like stop reason, time to first token, tokens per second, and number of generated tokens.

Please consult your specific SDK to see exact syntax.

### Progress callbacks

TODO: TS has onFirstToken callback which Python does not

Long prompts will often take a long time to first token, i.e. it takes the model a long time to process your prompt.
If you want to get updates on the progress of this process, you can provide a float callback to `complete`
that receives a float from 0.0-1.0 representing prompt processing progress.

```lms_code_snippet
  variants:
    Python:
      language: python
      code: |
        import lmstudio as lm

        llm = lm.llm()

        completion = llm.complete(
            "My name is",
            on_progress: lambda progress: print(f"{progress*100}% complete")
        )

    Python (with scoped resources):
      language: python
      code: |
        import lmstudio

        with lmstudio.Client() as client:
            llm = client.llm.model()

            completion = llm.complete(
                "My name is",
                on_progress: lambda progress: print(f"{progress*100}% processed")
            )

    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const llm = await client.llm.model();

        const prediction = llm.complete(
          "My name is",
          {onPromptProcessingProgress: (progress) => process.stdout.write(`${progress*100}% processed`)});
```

### Prediction configuration

You can also specify the same prediction configuration options as you could in the
in-app chat window sidebar. Please consult your specific SDK to see exact syntax. -->


You can customize both inference-time and load-time parameters for your model. Inference parameters can be set on a per-request basis, while load parameters are set when loading the model.

# Inference Parameters

Set inference-time parameters such as `temperature`, `maxTokens`, `topP` and more.

```lms_code_snippet
  variants:
    ".respond()":
      language: typescript
      code: |
        const prediction = model.respond(chat, {
          temperature: 0.6,
          maxTokens: 50,
        });
    ".complete()":
        language: typescript
        code: |
          const prediction = model.complete(prompt, {
            temperature: 0.6,
            maxTokens: 50,
            stop: ["\n\n"],
          });
```

See [`LLMPredictionConfigInput`](./../api-reference/llm-prediction-config-input) for all configurable fields.

Another useful inference-time configuration parameter is [`structured`](<(./structured-responses)>), which allows you to rigorously enforce the structure of the output using a JSON or zod schema.

# Load Parameters

Set load-time parameters such as the context length, GPU offload ratio, and more.

### Set Load Parameters with `.model()`

The `.model()` retrieves a handle to a model that has already been loaded, or loads a new one on demand (JIT loading).

**Note**: if the model is already loaded, the configuration will be **ignored**.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        const model = await client.llm.model("qwen2.5-7b-instruct", {
          config: {
            contextLength: 8192,
            gpu: {
              ratio: 0.5,
            },
          },
        });
```

See [`LLMLoadModelConfig`](./../api-reference/llm-load-model-config) for all configurable fields.

### Set Load Parameters with `.load()`

The `.load()` method creates a new model instance and loads it with the specified configuration.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        const model = await client.llm.load("qwen2.5-7b-instruct", {
          config: {
            contextLength: 8192,
            gpu: {
              ratio: 0.5,
            },
          },
        });
```

See [`LLMLoadModelConfig`](./../api-reference/llm-load-model-config) for all configurable fields.


## Automatic tool calling

We introduce the concept of execution "rounds" to describe the combined process of running a tool, providing its output to the LLM, and then waiting for the LLM to decide what to do next.

**Execution Round**

```
 • run a tool ->
 ↑   • provide the result to the LLM ->
 │       • wait for the LLM to generate a response
 │
 └────────────────────────────────────────┘ └➔ (return)
```

A model might choose to run tools multiple times before returning a final result. For example, if the LLM is writing code, it might choose to compile or run the program, fix errors, and then run it again, rinse and repeat until it gets the desired result.

With this in mind, we say that the `.act()` API is an automatic "multi-round" tool calling API.


### Quick Example

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient, tool } from "@lmstudio/sdk";
        import { z } from "zod";

        const client = new LMStudioClient();

        const multiplyTool = tool({
          name: "multiply",
          description: "Given two numbers a and b. Returns the product of them.",
          parameters: { a: z.number(), b: z.number() },
          implementation: ({ a, b }) => a * b,
        });

        const model = await client.llm.model("qwen2.5-7b-instruct");
        await model.act("What is the result of 12345 multiplied by 54321?", [multiplyTool], {
          onMessage: (message) => console.info(message.toString()),
        });
```

### What does it mean for an LLM to "use a tool"?

LLMs are largely text-in, text-out programs. So, you may ask "how can an LLM use a tool?". The answer is that some LLMs are trained to ask the human to call the tool for them, and expect the tool output to to be provided back in some format.

Imagine you're giving computer support to someone over the phone. You might say things like "run this command for me ... OK what did it output? ... OK now click there and tell me what it says ...". In this case you're the LLM! And you're "calling tools" vicariously through the person on the other side of the line.


### Important: Model Selection

The model selected for tool use will greatly impact performance.

Some general guidance when selecting a model:

- Not all models are capable of intelligent tool use
- Bigger is better (i.e., a 7B parameter model will generally perform better than a 3B parameter model)
- We've observed [Qwen2.5-7B-Instruct](https://model.lmstudio.ai/download/lmstudio-community/Qwen2.5-7B-Instruct-GGUF) to perform well in a wide variety of cases
- This guidance may change

### Example: Multiple Tools

The following code demonstrates how to provide multiple tools in a single `.act()` call.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient, tool } from "@lmstudio/sdk";
        import { z } from "zod";

        const client = new LMStudioClient();

        const additionTool = tool({
          name: "add",
          description: "Given two numbers a and b. Returns the sum of them.",
          parameters: { a: z.number(), b: z.number() },
          implementation: ({ a, b }) => a + b,
        });

        const isPrimeTool = tool({
          name: "isPrime",
          description: "Given a number n. Returns true if n is a prime number.",
          parameters: { n: z.number() },
          implementation: ({ n }) => {
            if (n < 2) return false;
            const sqrt = Math.sqrt(n);
            for (let i = 2; i <= sqrt; i++) {
              if (n % i === 0) return false;
            }
            return true;
          },
        });

        const model = await client.llm.model("qwen2.5-7b-instruct");
        await model.act(
          "Is the result of 12345 + 45668 a prime? Think step by step.",
          [additionTool, isPrimeTool],
          { onMessage: (message) => console.info(message.toString()) },
        );
```

### Example: Chat Loop with Create File Tool

The following code creates a conversation loop with an LLM agent that can create files.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { Chat, LMStudioClient, tool } from "@lmstudio/sdk";
        import { existsSync } from "fs";
        import { writeFile } from "fs/promises";
        import { createInterface } from "readline/promises";
        import { z } from "zod";

        const rl = createInterface({ input: process.stdin, output: process.stdout });
        const client = new LMStudioClient();
        const model = await client.llm.model();
        const chat = Chat.empty();

        const createFileTool = tool({
          name: "createFile",
          description: "Create a file with the given name and content.",
          parameters: { name: z.string(), content: z.string() },
          implementation: async ({ name, content }) => {
            if (existsSync(name)) {
              return "Error: File already exists.";
            }
            await writeFile(name, content, "utf-8");
            return "File created.";
          },
        });

        while (true) {
          const input = await rl.question("You: ");
          // Append the user input to the chat
          chat.append("user", input);

          process.stdout.write("Bot: ");
          await model.act(chat, [createFileTool], {
            // When the model finish the entire message, push it to the chat
            onMessage: (message) => chat.append(message),
            onPredictionFragment: ({ content }) => {
              process.stdout.write(content);
            },
          });
          process.stdout.write("\n");
        }
```


You can define tools with the `tool()` function and pass them to the model in the `act()` call.

## Anatomy of a Tool

Follow this standard format to define functions as tools:

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { tool } from "@lmstudio/sdk";
        import { z } from "zod";

        const exampleTool = tool({
          // The name of the tool
          name: "add",

          // A description of the tool
          description: "Given two numbers a and b. Returns the sum of them.",

          // zod schema of the parameters
          parameters: { a: z.number(), b: z.number() },

          // The implementation of the tool. Just a regular function.
          implementation: ({ a, b }) => a + b,
        });
```

**Important**: The tool name, description, and the parameter definitions are all passed to the model!

This means that your wording will affect the quality of the generation. Make sure to always provide a clear description of the tool so the model knows how to use it.

## Tools with External Effects (like Computer Use or API Calls)

Tools can also have external effects, such as creating files or calling programs and even APIs. By implementing tools with external effects, you
can essentially turn your LLMs into autonomous agents that can perform tasks on your local machine.

## Example: `createFileTool`

### Tool Definition

```lms_code_snippet
  title: "createFileTool.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { tool } from "@lmstudio/sdk";
        import { existsSync } from "fs";
        import { writeFile } from "fs/promises";
        import { z } from "zod";

        const createFileTool = tool({
          name: "createFile",
          description: "Create a file with the given name and content.",
          parameters: { name: z.string(), content: z.string() },
          implementation: async ({ name, content }) => {
            if (existsSync(name)) {
              return "Error: File already exists.";
            }
            await writeFile(name, content, "utf-8");
            return "File created.";
          },
        });
```

### Example code using the `createFile` tool:

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        import { createFileTool } from "./createFileTool";

        const client = new LMStudioClient();

        const model = await client.llm.model("qwen2.5-7b-instruct");
        await model.act(
          "Please create a file named output.txt with your understanding of the meaning of life.",
          [createFileTool],
        );
```


Generate embeddings for input text. Embeddings are vector representations of text that capture semantic meaning. Embeddings are a building block for RAG (Retrieval-Augmented Generation) and other similarity-based tasks.

### Prerequisite: Get an Embedding Model

If you don't yet have an embedding model, you can download a model like `nomic-ai/nomic-embed-text-v1.5` using the following command:

```bash
lms get nomic-ai/nomic-embed-text-v1.5
```

## Create Embeddings

To convert a string to a vector representation, pass it to the `embed` method on the corresponding embedding model handle.

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        const model = await client.embedding.model("nomic-embed-text-v1.5");

        const { embedding } = await model.embed("Hello, world!");
```


Models use a tokenizer to internally convert text into "tokens" they can deal with more easily. LM Studio exposes this tokenizer for utility.

## Tokenize

You can tokenize a string with a loaded LLM or embedding model using the SDK. In the below examples, `llm` can be replaced with an embedding model `emb`.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const model = await client.llm.model();

        const tokens = await model.tokenize("Hello, world!");

        console.info(tokens); // Array of token IDs.
```

## Count tokens

If you only care about the number of tokens, you can use the `.countTokens` method instead.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        const tokenCount = await model.countTokens("Hello, world!");
        console.info("Token count:", tokenCount);
```

### Example: Count Context

You can determine if a given conversation fits into a model's context by doing the following:

1. Convert the conversation to a string using the prompt template.
2. Count the number of tokens in the string.
3. Compare the token count to the model's context length.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { Chat, type LLM, LMStudioClient } from "@lmstudio/sdk";

        async function doesChatFitInContext(model: LLM, chat: Chat) {
          // Convert the conversation to a string using the prompt template.
          const formatted = await model.applyPromptTemplate(chat);
          // Count the number of tokens in the string.
          const tokenCount = await model.countTokens(formatted);
          // Get the current loaded context length of the model
          const contextLength = await model.getContextLength();
          return tokenCount < contextLength;
        }

        const client = new LMStudioClient();
        const model = await client.llm.model();

        const chat = Chat.from([
          { role: "user", content: "What is the meaning of life." },
          { role: "assistant", content: "The meaning of life is..." },
          // ... More messages
        ]);

        console.info("Fits in context:", await doesChatFitInContext(model, chat));
```

<!-- ### Context length comparisons

The below examples check whether a conversation is over a LLM's context length
(replace `llm` with `emb` to check for an embedding model).

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient, Chat } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const llm = await client.llm.model();

        // To check for a string, simply tokenize
        var tokens = await llm.tokenize("Hello, world!");

        // To check for a Chat, apply the prompt template first
        const chat = Chat.createEmpty().withAppended("user", "Hello, world!");
        const templatedChat = await llm.applyPromptTemplate(chat);
        tokens = await llm.tokenize(templatedChat);

        // If the prompt's length in tokens is less than the context length, you're good!
        const contextLength = await llm.getContextLength()
        const isOkay = (tokens.length < contextLength)
``` -->


You can iterate through locally available models using the `listLocalModels` method.

## Available Model on the Local Machine

`listLocalModels` lives under the `system` namespace of the `LMStudioClient` object.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        console.info(await client.system.listDownloadedModels());
```

This will give you results equivalent to using [`lms ls`](../../cli/ls) in the CLI.

### Example output:

```json
[
  {
    "type": "llm",
    "modelKey": "qwen2.5-7b-instruct",
    "format": "gguf",
    "displayName": "Qwen2.5 7B Instruct",
    "path": "lmstudio-community/Qwen2.5-7B-Instruct-GGUF/Qwen2.5-7B-Instruct-Q4_K_M.gguf",
    "sizeBytes": 4683073952,
    "paramsString": "7B",
    "architecture": "qwen2",
    "vision": false,
    "trainedForToolUse": true,
    "maxContextLength": 32768
  },
  {
    "type": "embedding",
    "modelKey": "text-embedding-nomic-embed-text-v1.5@q4_k_m",
    "format": "gguf",
    "displayName": "Nomic Embed Text v1.5",
    "path": "nomic-ai/nomic-embed-text-v1.5-GGUF/nomic-embed-text-v1.5.Q4_K_M.gguf",
    "sizeBytes": 84106624,
    "architecture": "nomic-bert",
    "maxContextLength": 2048
  }
]
```

<!-- Learn more about the `client.system` namespace in the [System API Reference](../api-reference/system-namespace). -->


You can iterate through models loaded into memory using the `listLoaded` method. This method lives under the `llm` and `embedding` namespaces of the `LMStudioClient` object.

## List Models Currently Loaded in Memory

This will give you results equivalent to using [`lms ps`](../../cli/ps) in the CLI.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();

        const llmOnly = await client.llm.listLoaded();
        const embeddingOnly = await client.embedding.listLoaded();
```

<!-- Learn more about `client.llm` namespace in the [API Reference](../api-reference/llm-namespace). -->


AI models are huge. It can take a while to load them into memory. LM Studio's SDK allows you to precisely control this process.

**Most commonly:**

- Use `.model()` to get any currently loaded model
- Use `.model("model-key")` to use a specific model

**Advanced (manual model management):**

- Use `.load("model-key")` to load a new instance of a model
- Use `model.unload()` to unload a model from memory

## Get the Current Model with `.model()`

If you already have a model loaded in LM Studio (either via the GUI or `lms load`), you can use it by calling `.model()` without any arguments.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        const model = await client.llm.model();
```

## Get a Specific Model with `.model("model-key")`

If you want to use a specific model, you can provide the model key as an argument to `.model()`.

#### Get if Loaded, or Load if not

Calling `.model("model-key")` will load the model if it's not already loaded, or return the existing instance if it is.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        const model = await client.llm.model("qwen/qwen3-4b-2507");
```

<!-- Learn more about the `.model()` method and the parameters it accepts in the [API Reference](../api-reference/model). -->

## Load a New Instance of a Model with `.load()`

Use `load()` to load a new instance of a model, even if one already exists. This allows you to have multiple instances of the same or different models loaded at the same time.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";
        const client = new LMStudioClient();

        const llama = await client.llm.load("qwen/qwen3-4b-2507");
        const another_llama = await client.llm.load("qwen/qwen3-4b-2507", {
          identifier: "second-llama"
        });
```

<!-- Learn more about the `.load()` method and the parameters it accepts in the [API Reference](../api-reference/load). -->

### Note about Instance Identifiers

If you provide an instance identifier that already exists, the server will throw an error.
So if you don't really care, it's safer to not provide an identifier, in which case
the server will generate one for you. You can always check in the server tab in LM Studio, too!

## Unload a Model from Memory with `.unload()`

Once you no longer need a model, you can unload it by simply calling `unload()` on its handle.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();

        const model = await client.llm.model();
        await model.unload();
```

## Set Custom Load Config Parameters

You can also specify the same load-time configuration options when loading a model, such as Context Length and GPU offload.

See [load-time configuration](../llm-prediction/parameters) for more.

## Set an Auto Unload Timer (TTL)

You can specify a _time to live_ for a model you load, which is the idle time (in seconds)
after the last request until the model unloads. See [Idle TTL](/docs/api/ttl-and-auto-evict) for more on this.

```lms_code_snippet
  variants:
    "Using .load":
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();

        const model = await client.llm.load("qwen/qwen3-4b-2507", {
          ttl: 300, // 300 seconds
        });
    "Using .model":
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();

        const model = await client.llm.model("qwen/qwen3-4b-2507", {
          // Note: specifying ttl in `.model` will only set the TTL for the model if the model is
          // loaded from this call. If the model was already loaded, the TTL will not be updated.
          ttl: 300, // 300 seconds
        });
```


### Parameters

```lms_params
- name: gpu
  description: |
    How to distribute the work to your GPUs. See {@link GPUSetting} for more information.
  public: true
  type: GPUSetting
  optional: true

- name: contextLength
  description: |
    The size of the context length in number of tokens. This will include both the prompts and the
    responses. Once the context length is exceeded, the value set in
    {@link LLMPredictionConfigBase#contextOverflowPolicy} is used to determine the behavior.

    See {@link LLMContextOverflowPolicy} for more information.
  type: number
  optional: true

- name: ropeFrequencyBase
  description: |
    Custom base frequency for rotary positional embeddings (RoPE).

    This advanced parameter adjusts how positional information is embedded in the model's
    representations. Increasing this value may enable better performance at high context lengths by
    modifying how the model processes position-dependent information.
  type: number
  optional: true

- name: ropeFrequencyScale
  description: |
    Scaling factor for RoPE (Rotary Positional Encoding) frequency.

    This factor scales the effective context window by modifying how positional information is
    encoded. Higher values allow the model to handle longer contexts by making positional encoding
    more granular, which can be particularly useful for extending a model beyond its original
    training context length.
  type: number
  optional: true

- name: evalBatchSize
  description: |
    Number of input tokens to process together in a single batch during evaluation.

    Increasing this value typically improves processing speed and throughput by leveraging
    parallelization, but requires more memory. Finding the optimal batch size often involves
    balancing between performance gains and available hardware resources.
  type: number
  optional: true

- name: flashAttention
  description: |
    Enables Flash Attention for optimized attention computation.

    Flash Attention is an efficient implementation that reduces memory usage and speeds up
    generation by optimizing how attention mechanisms are computed. This can significantly
    improve performance on compatible hardware, especially for longer sequences.
  type: boolean
  optional: true

- name: keepModelInMemory
  description: |
    When enabled, prevents the model from being swapped out of system memory.

    This option reserves system memory for the model even when portions are offloaded to GPU,
    ensuring faster access times when the model needs to be used. Improves performance
    particularly for interactive applications, but increases overall RAM requirements.
  type: boolean
  optional: true

- name: seed
  description: |
    Random seed value for model initialization to ensure reproducible outputs.

    Setting a specific seed ensures that random operations within the model (like sampling)
    produce the same results across different runs, which is important for reproducibility
    in testing and development scenarios.
  type: number
  optional: true

- name: useFp16ForKVCache
  description: |
    When enabled, stores the key-value cache in half-precision (FP16) format.

    This option significantly reduces memory usage during inference by using 16-bit floating
    point numbers instead of 32-bit for the attention cache. While this may slightly reduce
    numerical precision, the impact on output quality is generally minimal for most applications.
  type: boolean
  optional: true

- name: tryMmap
  description: |
    Attempts to use memory-mapped (mmap) file access when loading the model.

    Memory mapping can improve initial load times by mapping model files directly from disk to
    memory, allowing the operating system to handle paging. This is particularly beneficial for
    quick startup, but may reduce performance if the model is larger than available system RAM,
    causing frequent disk access.
  type: boolean
  optional: true

- name: numExperts
  description: |
    Specifies the number of experts to use for models with Mixture of Experts (MoE) architecture.

    MoE models contain multiple "expert" networks that specialize in different aspects of the task.
    This parameter controls how many of these experts are active during inference, affecting both
    performance and quality of outputs. Only applicable for models designed with the MoE architecture.
  type: number
  optional: true

- name: llamaKCacheQuantizationType
  description: |
    Quantization type for the Llama model's key cache.

    This option determines the precision level used to store the key component of the attention
    mechanism's cache. Lower precision values (e.g., 4-bit or 8-bit quantization) significantly
    reduce memory usage during inference but may slightly impact output quality. The effect varies
    between different models, with some being more robust to quantization than others.

    Set to false to disable quantization and use full precision.
  type: LLMLlamaCacheQuantizationType | false
  optional: true

- name: llamaVCacheQuantizationType
  description: |
    Quantization type for the Llama model's value cache.

    Similar to the key cache quantization, this option controls the precision used for the value
    component of the attention mechanism's cache. Reducing precision saves memory but may affect
    generation quality. This option requires Flash Attention to be enabled to function properly.

    Different models respond differently to value cache quantization, so experimentation may be
    needed to find the optimal setting for a specific use case. Set to false to disable quantization.
  type: LLMLlamaCacheQuantizationType | false
  optional: true
```


### Fields

```lms_params
- name: "maxTokens"
  type: "number | false"
  optional: true
  description: "Number of tokens to predict at most. If set to false, the model will predict as many tokens as it wants.\n\nWhen the prediction is stopped because of this limit, the `stopReason` in the prediction stats will be set to `maxPredictedTokensReached`."

- name: "temperature"
  type: "number"
  optional: true
  description: "The temperature parameter for the prediction model. A higher value makes the predictions more random, while a lower value makes the predictions more deterministic. The value should be between 0 and 1."

- name: "stopStrings"
  type: "Array<string>"
  optional: true
  description: "An array of strings. If the model generates one of these strings, the prediction will stop.\n\nWhen the prediction is stopped because of this limit, the `stopReason` in the prediction stats will be set to `stopStringFound`."

- name: "toolCallStopStrings"
  type: "Array<string>"
  optional: true
  description: "An array of strings. If the model generates one of these strings, the prediction will stop with the `stopReason` `toolCalls`."

- name: "contextOverflowPolicy"
  type: "LLMContextOverflowPolicy"
  optional: true
  description: "The behavior for when the generated tokens length exceeds the context window size. The allowed values are:\n\n- `stopAtLimit`: Stop the prediction when the generated tokens length exceeds the context window size. If the generation is stopped because of this limit, the `stopReason` in the prediction stats will be set to `contextLengthReached`\n- `truncateMiddle`: Keep the system prompt and the first user message, truncate middle.\n- `rollingWindow`: Maintain a rolling window and truncate past messages."

- name: "structured"
  type: "ZodType<TStructuredOutputType> | LLMStructuredPredictionSetting"
  optional: true
  description: "Configures the model to output structured JSON data that follows a specific schema defined using Zod.\n\nWhen you provide a Zod schema, the model will be instructed to generate JSON that conforms to that schema rather than free-form text.\n\nThis is particularly useful for extracting specific data points from model responses or when you need the output in a format that can be directly used by your application."

- name: "topKSampling"
  type: "number"
  optional: true
  description: "Controls token sampling diversity by limiting consideration to the K most likely next tokens.\n\nFor example, if set to 40, only the 40 tokens with the highest probabilities will be considered for the next token selection. A lower value (e.g., 20) will make the output more focused and conservative, while a higher value (e.g., 100) allows for more creative and diverse outputs.\n\nTypical values range from 20 to 100."

- name: "repeatPenalty"
  type: "number | false"
  optional: true
  description: "Applies a penalty to repeated tokens to prevent the model from getting stuck in repetitive patterns.\n\nA value of 1.0 means no penalty. Values greater than 1.0 increase the penalty. For example, 1.2 would reduce the probability of previously used tokens by 20%. This is particularly useful for preventing the model from repeating phrases or getting stuck in loops.\n\nSet to false to disable the penalty completely."

- name: "minPSampling"
  type: "number | false"
  optional: true
  description: "Sets a minimum probability threshold that a token must meet to be considered for generation.\n\nFor example, if set to 0.05, any token with less than 5% probability will be excluded from consideration. This helps filter out unlikely or irrelevant tokens, potentially improving output quality.\n\nValue should be between 0 and 1. Set to false to disable this filter."

- name: "topPSampling"
  type: "number | false"
  optional: true
  description: "Implements nucleus sampling by only considering tokens whose cumulative probabilities reach a specified threshold.\n\nFor example, if set to 0.9, the model will consider only the most likely tokens that together add up to 90% of the probability mass. This helps balance between diversity and quality by dynamically adjusting the number of tokens considered based on their probability distribution.\n\nValue should be between 0 and 1. Set to false to disable nucleus sampling."

- name: "xtcProbability"
  type: "number | false"
  optional: true
  description: "Controls how often the XTC (Exclude Top Choices) sampling technique is applied during generation.\n\nXTC sampling can boost creativity and reduce clichés by occasionally filtering out common tokens. For example, if set to 0.3, there's a 30% chance that XTC sampling will be applied when generating each token.\n\nValue should be between 0 and 1. Set to false to disable XTC completely."

- name: "xtcThreshold"
  type: "number | false"
  optional: true
  description: "Defines the lower probability threshold for the XTC (Exclude Top Choices) sampling technique.\n\nWhen XTC sampling is activated (based on xtcProbability), the algorithm identifies tokens with probabilities between this threshold and 0.5, then removes all such tokens except the least probable one. This helps introduce more diverse and unexpected tokens into the generation.\n\nOnly takes effect when xtcProbability is enabled."

- name: "cpuThreads"
  type: "number"
  optional: true
  description: "Specifies the number of CPU threads to allocate for model inference.\n\nHigher values can improve performance on multi-core systems but may compete with other processes. For example, on an 8-core system, a value of 4-6 might provide good performance while leaving resources for other tasks.\n\nIf not specified, the system will use a default value based on available hardware."

- name: "draftModel"
  type: "string"
  optional: true
  description: "The draft model to use for speculative decoding. Speculative decoding is a technique that can drastically increase the generation speed (up to 3x for larger models) by paring a main model with a smaller draft model.\n\nSee here for more information: https://lmstudio.ai/docs/advanced/speculative-decoding\n\nYou do not need to load the draft model yourself. Simply specifying its model key here is enough."
```


LLMs and embedding models, due to their fundamental architecture, have a property called `context length`, and more specifically a **maximum** context length. Loosely speaking, this is how many tokens the models can "keep in memory" when generating text or embeddings. Exceeding this limit will result in the model behaving erratically.

## Use the `getContextLength()` Function on the Model Object

It's useful to be able to check the context length of a model, especially as an extra check before providing potentially long input to the model.

```lms_code_snippet
  title: "index.ts"
  variants:
    TypeScript:
      language: typescript
      code: |
        const contextLength = await model.getContextLength();
```

The `model` in the above code snippet is an instance of a loaded model you get from the `llm.model` method. See [Manage Models in Memory](../manage-models/loading) for more information.

### Example: Check if the input will fit in the model's context window

You can determine if a given conversation fits into a model's context by doing the following:

1. Convert the conversation to a string using the prompt template.
2. Count the number of tokens in the string.
3. Compare the token count to the model's context length.

```lms_code_snippet
  variants:
    TypeScript:
      language: typescript
      code: |
        import { Chat, type LLM, LMStudioClient } from "@lmstudio/sdk";

        async function doesChatFitInContext(model: LLM, chat: Chat) {
          // Convert the conversation to a string using the prompt template.
          const formatted = await model.applyPromptTemplate(chat);
          // Count the number of tokens in the string.
          const tokenCount = await model.countTokens(formatted);
          // Get the current loaded context length of the model
          const contextLength = await model.getContextLength();
          return tokenCount < contextLength;
        }

        const client = new LMStudioClient();
        const model = await client.llm.model();

        const chat = Chat.from([
          { role: "user", content: "What is the meaning of life." },
          { role: "assistant", content: "The meaning of life is..." },
          // ... More messages
        ]);

        console.info("Fits in context:", await doesChatFitInContext(model, chat));
```


You can access information about a loaded model using the `getInfo` method.

```lms_code_snippet
  variants:
    LLM:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const model = await client.llm.model();

        const modelInfo = await model.getInfo();

        console.info("Model Key", modelInfo.modelKey);
        console.info("Current Context Length", model.contextLength);
        console.info("Model Trained for Tool Use", modelInfo.trainedForToolUse);
        // etc.
    Embedding Model:
      language: typescript
      code: |
        import { LMStudioClient } from "@lmstudio/sdk";

        const client = new LMStudioClient();
        const model = await client.embedding.model();

        const modelInfo = await model.getInfo();

        console.info("Model Key", modelInfo.modelKey);
        console.info("Current Context Length", modelInfo.contextLength);
        // etc.
```


