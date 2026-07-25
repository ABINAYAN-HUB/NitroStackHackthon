import { Module } from '@nitrostack/core';
import { CaseStoreService } from './case-store.service.js';

@Module({
    name: 'case-store',
    description: 'Shared in-memory case state store',
    providers: [CaseStoreService],
    exports: [CaseStoreService],
})
export class CaseStoreModule { }
