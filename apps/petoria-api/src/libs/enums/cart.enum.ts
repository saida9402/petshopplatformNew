import { registerEnumType } from '@nestjs/graphql';

export enum CartStatus {
	ACTIVE = 'ACTIVE', // Cart is open and editable
	CHECKED_OUT = 'CHECKED_OUT', // Order has been placed from this cart
	ABANDONED = 'ABANDONED', // Member left without checking out
}

registerEnumType(CartStatus, {
	name: 'CartStatus',
	description: 'Shopping cart status',
	valuesMap: {
		ACTIVE: { description: 'Open and editable' },
		CHECKED_OUT: { description: 'Order placed' },
		ABANDONED: { description: 'Abandoned by member' },
	},
});
