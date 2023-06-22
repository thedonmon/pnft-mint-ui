export type AllowListConfig = {
  [guard: string]: string[]
}

//Configure allowlists here. The key is the guard group name, and the value is an array of addresses to allowlist.
//Default would be outside of guard groups so keep it if all groups are using the same allowlist.
export const allowListConfig: AllowListConfig = {
  default: [],
  late: [
    "Ht5tqGiAf5tF8nRVDnpdvj7B9vNot6ijzykEDtQypxYC",
    "3i9BRMtNwi8jFi5hEd3gAwJjhA87Ub8U1sAjbg8J4xjL",
  ],
  public: [],
  allowList2: [],
  allowList3: [],
}
