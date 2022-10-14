// eth/invite/plugin/InviteRuntimeField.ts

class InviteRuntimeField {

  // FIXME
  private _invite : any; //ethers.Contract;

  private constructor() {}

  // Async static construction, because we want to call ethers methods
  // that return a Promise.
  public static createAsync = async (hre, contractName) => {
    const me = new InviteRuntimeField();
    me._invite = await hre.ethers.getContractAt(contractName, contract);
    return me;
  };

  public sayHello() {
    return "hello";
  }
}
