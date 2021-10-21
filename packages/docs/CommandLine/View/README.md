Use the `view` command to render and a Dapp in your browser:

```shell
solui view --spec /path/to/json --artifacts /path/to/contract/artifacts
```

What the arguments mean:

* `/path/to/jon` - path to your Dapp spec `.json` file
* `/path/to/contract/artifacts` - Path to the folder containing the Truffle/Hardhat contract JSON artifacts

## Example usage

Clone the demo repository and set it up:

```shell
git clone https://github.com/solui/demo.git
cd demo
npm install
```

Compile and deploy the demo contracts (ensure you have a [private chain running in a separate terminal](../../GettingStarted)):

```shell
npm run truffle compile
npm run truffle migrate
```

Now view the interface:

```shell
solui view --spec contracts/erc20/ui.json --artifacts build/contracts
```

Open up the browser to http://localhost:3001. You should now be able to view
and use the ERC20 token Dapp:

![Demo Dapp](../images/DemoUi.png)

## Spec validation

When you view a Dapp, solUI will first validate the spec and immediately
display an error if there are any problems.

![Spec error](../images/SpecError.png)

## Auto reload

The CLI will watch both the spec file and contract artifacts for changes. If
any file changes are detected then the in-browser Dapp will seamlessly
automatically reload.

This makes for a very smooth _edit -> save -> preview_ development cycle.

The CLI will output information to the terminal whenever a change is detected
and the Dapp is to be reloaded:

![Auto reload](../images/AutoReload.png)

## Additional options

To change the default HTTP listening port for the Dapp renderer:

```shell
solui view --port 12345 ...
```

For more verbose logging in the terminal:

```shell
solui view --verbose ...
```
