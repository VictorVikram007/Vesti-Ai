import {
  BrowserWallet,
  MeshTxBuilder,
  BlockfrostProvider,
  MeshWallet,
} from '@meshsdk/core';

const blockfrostProvider = new BlockfrostProvider(
  import.meta.env.VITE_BLOCKFROST_PROJECT_ID || 'your-blockfrost-project-id'
);

export async function submitWardrobeOwnershipTx(
  cid: string,
  userStakeAddress: string
): Promise<string> {
  try {
    // Connect to Lace wallet
    const wallet = await BrowserWallet.enable('lace');
    const meshWallet = new MeshWallet({
      networkId: 0, // Testnet (preprod)
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
      key: {
        type: 'root',
        bech32: await wallet.getRewardAddresses()[0],
      },
    });

    // Get wallet addresses and UTXOs
    const changeAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();

    // Build transaction with metadata
    const txBuilder = new MeshTxBuilder({
      fetcher: blockfrostProvider,
      submitter: blockfrostProvider,
    });

    const unsignedTx = await txBuilder
      .selectUtxosFrom(utxos)
      .changeAddress(changeAddress)
      .metadataValue('1337', {
        cid: cid,
        userStakeAddress: userStakeAddress,
        timestamp: Date.now(),
        action: 'wardrobe_ownership'
      })
      .complete();

    // Sign transaction with wallet
    const signedTx = await wallet.signTx(unsignedTx);

    // Submit to network
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  } catch (error) {
    throw new Error(`Wardrobe ownership transaction failed: ${error}`);
  }
}