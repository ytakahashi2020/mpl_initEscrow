import { createCoreCollection } from "./_setup";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateRandomString,
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  mintArgs,
  mplTokenMetadata,
  createFungible,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  initEscrowV1,
  MPL_HYBRID_PROGRAM_ID,
  mplHybrid,
} from "@metaplex-foundation/mpl-hybrid";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import {
  string,
  publicKey as publicKeySerializer,
} from "@metaplex-foundation/umi/serializers";

import {
  findAssociatedTokenPda,
  SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@metaplex-foundation/mpl-toolbox";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile(
  "/Users/ytakahashi/.config/solana/id.json"
);

const umi = createUmi(connection.rpcEndpoint);

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(keypairIdentity(umiUser));
umi.use(mplTokenMetadata());
umi.use(mplCore());
umi.use(mplHybrid());

const tokenMint = generateSigner(umi);

const transaction = createFungible(umi, {
  mint: tokenMint,
  name: "test",
  uri: "https://sss.com",
  sellerFeeBasisPoints: percentAmount(0),
});

await transaction.sendAndConfirm(umi);

const { collection } = await createCoreCollection(umi);

const escrow = umi.eddsa.findPda(MPL_HYBRID_PROGRAM_ID, [
  string({ size: "variable" }).serialize("escrow"),
  publicKeySerializer().serialize(collection.publicKey),
]);

const feeAta = findAssociatedTokenPda(umi, {
  mint: tokenMint.publicKey,
  owner: umi.identity.publicKey,
});

await initEscrowV1(umi, {
  escrow: escrow,
  collection: collection.publicKey,
  token: tokenMint.publicKey,
  feeLocation: umi.identity.publicKey,
  name: "ttt",
  uri: "ssss",
  max: 3,
  min: 1,
  amount: 5_000_000_000,
  feeAmount: 3_000_000_000,
  path: 0,
  solFeeAmount: 0,
  feeAta: feeAta,
  associatedTokenProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
}).sendAndConfirm(umi);

console.log(`${escrow}`);
