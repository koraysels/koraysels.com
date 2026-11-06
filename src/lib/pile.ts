/**
 * THE PILE: pictures, clips and links.
 *
 * Empty for now, so the page does not render the section at all.
 * Add items and it appears.
 *
 *   { kind: 'image', src: '/pile/x.jpg', alt: '…', caption: '…', href: '…' }
 *   { kind: 'video', src: '/pile/x.mp4', poster: '/pile/x.jpg', caption: '…' }
 *   { kind: 'link',  href: 'https://…', title: '…' }
 *
 * Files go in static/pile/ and are referenced as /pile/<file>.
 * Videos play muted, looped, no controls. Keep them short.
 */

export type PileItem =
	| { kind: 'image'; src: string; alt: string; caption: string; href?: string }
	| { kind: 'video'; src: string; poster: string; caption: string; href?: string }
	| { kind: 'link'; href: string; title: string };

export const pile: PileItem[] = [];
