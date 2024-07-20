// // The SDK does not have tools for creating test accounts, so you'll have to
// // make your own HTTP request.

// // if you're trying this on Node, install the `node-fetch` library and
// // uncomment the next line:
// // const fetch = require('node-fetch');

// const {
//     Keypair,
//     Horizon,
//     TransactionBuilder,
//     Networks,
//     Operation,
//     Asset,
//     BASE_FEE,
//   } = require("diamante-sdk-js");



//   const keypair = Keypair.fromSecret(
//     "SCKY763IROKEGHYFEWNCO6MCVWJN7L6OOGKMNEFHRB7VTLVC36LWI7ML"
//   );
  
//   const server = new Horizon.Server("https://diamtestnet.diamcircle.io/");
//   const questAccount = await server.loadAccount(keypair.publicKey());

  
//   const usdcAsset = new Asset(
//     "USDC",
//     "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
//   );

//   const transaction = new TransactionBuilder(questAccount, {
//     fee: BASE_FEE,
//     networkPassphrase: "Diamante Testnet",
//   }).addOperation(
//     Operation.changeTrust({
//       asset: usdcAsset,
//     })
//   );
    
//   const transaction = new TransactionBuilder(...)
//   .addOperation(Operation.manageBuyOffer({
//     selling: Asset.native(),
//     buying: usdcAsset,
//     buyAmount: '100',
//     price: '10',
//     offerId: '0',
//     source: keypair.publicKey()
//   }))

//   const transaction = new TransactionBuilder(...)
//   .addOperation(Operation.manageSellOffer({
//     selling: Asset.native(),
//     buying: usdcAsset,
//     amount: '1000',
//     price: '0.1',
//     offerId: '0',
//     source: keypair.publicKey()
//   }))
//   const transaction = new TransactionBuilder(...)
//   .addOperation(Operation.createPassiveSellOffer({
//     selling: Asset.native(),
//     buying: usdcAsset,
//     amount: '1000',
//     price: '0.1',
//     source: keypair.publicKey()
//   }))


//   const transaction = new TransactionBuilder(...)
//   .setTimeout(30)
//   .build()

// transaction.sign(keypair)

// try {
//   let res = await server.submitTransaction(transaction)
//   console.log(`Transaction Successful! Hash: ${res.hash}`)
// } catch (error) {
//   console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
// }

// (async function createAccount() {
//     try {
//       const response = await fetch(
//         `https://friendbot.diamcircle.io?addr=${encodeURIComponent(
//           pair.publicKey()
//         )}`
//       );
//       const responseJSON = await response.json();
//       console.log("SUCCESS! You have a new account :)\n", responseJSON);
//     } catch (e) {
//       console.error("ERROR!", e);
//     }
//     // After you've got your test lumens from friendbot, we can also use that account to create a new account on the ledger.
//     try {
//       const server = new DiamSdk.Horizon.Server(
//         "https://diamtestnet.diamcircle.io/"
//       );
//       var parentAccount = await server.loadAccount(pair.publicKey()); //make sure the parent account exists on ledger
//       var childAccount = DiamSdk.Keypair.random(); //generate a random account to create
//       //create a transacion object.
//       var createAccountTx = new DiamSdk.TransactionBuilder(parentAccount, {
//         fee: DiamSdk.BASE_FEE,
//         networkPassphrase: DiamSdk.Networks.TESTNET,
//       });
//       //add the create account operation to the createAccountTx transaction.
//       createAccountTx = await createAccountTx
//         .addOperation(
//           DiamSdk.Operation.createAccount({
//             destination: childAccount.publicKey(),
//             startingBalance: "5",
//           })
//         )
//         .setTimeout(180)
//         .build();
//       //sign the transaction with the account that was created from friendbot.
//       await createAccountTx.sign(pair);
//       //submit the transaction
//       let txResponse = await server
//         .submitTransaction(createAccountTx)
//         // some simple error handling
//         .catch(function (error) {
//           console.log("there was an error");
//           console.log(error.response);
//           console.log(error.status);
//           console.log(error.extras);
//           return error;
//         });
//       console.log(txResponse);
//       console.log("Created the new account", childAccount.publicKey());
//     } catch (e) {
//       console.error("ERROR!", e);
//     }
//   })();
  

// const server = new DiamSdk.Horizon.Server("https://diamtestnet.diamcircle.io/");

// // the JS SDK uses promises for most actions, such as retrieving an account
// const account = await server.loadAccount(pair.publicKey());
// console.log("Balances for account: " + pair.publicKey());
// account.balances.forEach(function (balance) {
//   console.log("Type:", balance.asset_type, ", Balance:", balance.balance);
// });

