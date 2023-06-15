import { AptosClient, TxnBuilderTypes, HexString } from "aptos";

// Replace these with your actual contract address and module name
const CONTRACT_ADDRESS = "0xab3aa7287c869844f32b36bc53761456b27621e0a3d3e57341ea3f6f8daddd6a";
const MODULE_NAME = "habit_list";

export const addHabit = async (wallet, client, habitName) => {
  console.log(wallet)
  if (!wallet || !client) {
    throw new Error("Wallet or client not initialized");
  }

  const payload = {
    function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::list_habit`,
    type_arguments: [],
    arguments: [habitName]
  };

  try {
    const senderAddress = await wallet.account();
    const txnRequest = await client.generateTransaction(senderAddress, payload);
    const signedTxn = await wallet.signTransaction(txnRequest);
    const txnResult = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(txnResult.hash);
    return txnResult.hash;
  } catch (error) {
    console.error("Error adding habit:", error);
    throw error;
  }
};

export const markHabitComplete = async (wallet, client, habitIndex) => {
  if (!wallet || !client) {
    throw new Error("Wallet or client not initialized");
  }

  const payload = {
    function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::update_habit`,
    type_arguments: [],
    arguments: [habitIndex]
  };

  try {
    const senderAddress = await wallet.account();
    const txnRequest = await client.generateTransaction(senderAddress, payload);
    const signedTxn = await wallet.signTransaction(txnRequest);
    const txnResult = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(txnResult.hash);
    return txnResult.hash;
  } catch (error) {
    console.error("Error marking habit complete:", error);
    throw error;
  }
};

export const getHabits = async (client, userAddress) => {
  if (!client) {
    throw new Error("Client not initialized");
  }

  try {
    const habits = await client.view({
      function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_all_habits`,
      type_arguments: [],
      arguments: [userAddress]
    });
    return habits;
  } catch (error) {
    console.error("Error getting habits:", error);
    throw error;
  }
};

// New function to initialize the HabitCollection for testing
export const initializeForTest = async (wallet, client) => {
  if (!wallet || !client) {
    throw new Error("Wallet or client not initialized");
  }

  const payload = {
    function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::initialize_for_test`,
    type_arguments: [],
    arguments: []
  };

  try {
    const senderAddress = await wallet.account();
    const txnRequest = await client.generateTransaction(senderAddress, payload);
    const signedTxn = await wallet.signTransaction(txnRequest);
    const txnResult = await client.submitTransaction(signedTxn);
    await client.waitForTransaction(txnResult.hash);
    return txnResult.hash;
  } catch (error) {
    console.error("Error initializing for test:", error);
    throw error;
  }
};