/** What the fixed half of the screen is showing, and what the pointer is doing. */
export const stage = $state({
	/** id of the shot pinned by whatever the reader is pointing at, or null for the slow cycle */
	activeId: null as string | null,
	/** the real CSS cursor value under the pointer: the company name, live */
	cursor: 'pointer'
});
