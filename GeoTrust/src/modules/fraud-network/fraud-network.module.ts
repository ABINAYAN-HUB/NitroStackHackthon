import { Module } from '@nitrostack/core';
import { FraudNetworkTools } from './fraud-network.tools.js';
import { CaseStoreModule } from '../case-store/case-store.module.js';

@Module({
    name: 'FraudNetwork',
    description: 'Graph analysis for known fraudsters and shell companies',
    controllers: [FraudNetworkTools],
    imports: [CaseStoreModule]
})
export class FraudNetworkModule { }
