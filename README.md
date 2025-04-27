# Radix Tokens Transformer

This repo allows you to transform tokens exported from Figma into code usable on
supported platforms.

## Folder structure

1. `tokens-figma`: contains tokens exported from Figma.
2. `tokens-w3c`: contains transformed tokens in w3c format.
3. `src`: contains generated code that can be used on supported platforms

## Getting Started

Export tokens from Figma and place them in the `tokens-figma` folder.

```shell
pnpm i
pnpm build

# Run token transformation pipeline
# Output is stored in the `src` folder
pnpm codegen
```
