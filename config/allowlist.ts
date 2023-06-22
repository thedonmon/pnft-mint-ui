export type AllowListConfig = {
  [guard: string]: string[]
}

//Configure allowlists here. The key is the guard group name, and the value is an array of addresses to allowlist.
//Default would be outside of guard groups so keep it if all groups are using the same allowlist.
export const allowListConfig: AllowListConfig = {
  default: [],
  allowList1: [],
  allowList2: [],
  allowList3: [],
}
