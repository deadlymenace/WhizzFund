# Jupiter Plugin Integration

Jupiter is a Solana-specific embeddable coin swapper for your application.

## Basic Usage

```tsx
import "@jup-ag/terminal/css";
import { useEffect } from 'react';

function JupiterSwap() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@jup-ag/terminal").then((mod) => {
        const init = mod.init;
        init({
          displayMode: "integrated",
          integratedTargetId: "jupiter-terminal",
          endpoint: "https://api.mainnet-beta.solana.com",
        });
      });
    }
  }, []);

  return <div id="jupiter-terminal" className="w-full h-[600px]" />;
}
```

## Configuration Options

```tsx
init({
  displayMode: "integrated",
  integratedTargetId: "jupiter-terminal",
  endpoint: "https://api.mainnet-beta.solana.com",
  formProps: {
    fixedInputMint: true,
    fixedOutputMint: true,
    fixedAmount: true,
    initialAmount: "1",
  },
});
```
