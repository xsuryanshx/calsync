export function parseSelectedAccountIds(
  raw: string | undefined,
  allAccountIds: string[],
): string[] {
  if (!raw) return allAccountIds;

  const requested = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const selected = allAccountIds.filter((accountId) => requested.includes(accountId));
  return selected.length > 0 ? selected : allAccountIds;
}

export function nextSelectedAccountIds(
  clickedAccountId: string,
  selectedAccountIds: string[],
  allAccountIds: string[],
): string[] {
  const selectedSet = new Set(selectedAccountIds);
  const allSelected = selectedAccountIds.length === allAccountIds.length;
  const isSelected = selectedSet.has(clickedAccountId);

  if (allSelected) {
    return [clickedAccountId];
  }

  if (!isSelected) {
    return allAccountIds.filter(
      (accountId) => selectedSet.has(accountId) || accountId === clickedAccountId,
    );
  }

  if (selectedAccountIds.length === 1) {
    return allAccountIds;
  }

  return selectedAccountIds.filter((accountId) => accountId !== clickedAccountId);
}
